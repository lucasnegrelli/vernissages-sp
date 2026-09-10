#!/usr/bin/env node
/**
 * radar-editais.js — a varredura mecânica dos editais, sem o julgamento.
 *
 * POR QUE ISTO EXISTE
 * A página `editais.html` é gerada do `const EDITAIS` no `dados.js` — uma lista
 * escrita à mão que ficou parada em 2 itens. Nada a alimenta: o `radar-fontes.js`
 * só varre agregador de exposição, e o `OPERACAO.md` não menciona editais. Em
 * 13/09/2026 o Lucas notou que "tem muito mais edital rolando por aí" — está
 * certo, é época de pico (set/out).
 *
 * Isto é o irmão do `radar-fontes.js` para o outro lado da casa: lê os feeds de
 * quem cobre chamada, prêmio, residência e edital de fomento, cruza com o que já
 * está no `dados.js` e cospe um relatório. **Não escreve no `dados.js`.**
 *
 * O QUE ELE NÃO FAZ
 * Não decide e não inventa prazo. Feed é pista: o título diz "inscrições
 * abertas" e o edital fechou semana passada, ou foi prorrogado e o feed não
 * sabe. Toda linha do relatório é "confirme o prazo na fonte", não "publique".
 *
 * FONTES (feeds RSS de WordPress — para acrescentar, é uma linha em FONTES)
 *   - Dasartes: revista de artes visuais, tags `edital`, `chamada`, `residencia`,
 *     `premio`. Feed rico, cobre Brasil inteiro.
 *   - Prêmio PIPA: feed próprio, cobre o circuito de arte contemporânea.
 *
 * USO
 *   node radar-editais.js                      (feeds padrão)
 *   node radar-editais.js --dias 120           (quão recente conta como "novo")
 *   node radar-editais.js --saida PENDENTE/EDITAIS.md
 */

'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const DADOS = path.join(RAIZ, 'dados.js');
const UA = 'vernissages-sp/1.0 (+https://vernissagessp.com.br)';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };

const HOJE = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);   // fuso de SP
const JANELA = parseInt(flag('dias', '120'), 10);   // item mais velho que isso não conta como "novo"

/* ---------- fontes ---------- */
const FONTES = [
  { nome: 'Dasartes',       url: 'https://dasartes.com.br/feed/' },
  { nome: 'Dasartes',       url: 'https://dasartes.com.br/tag/edital/feed/' },
  { nome: 'Dasartes',       url: 'https://dasartes.com.br/tag/chamada/feed/' },
  { nome: 'Dasartes',       url: 'https://dasartes.com.br/tag/residencia/feed/' },
  { nome: 'Prêmio PIPA',    url: 'https://www.premiopipa.com/feed/' },
  { nome: 'seLecT',         url: 'https://www.select.art.br/feed/' },
  { nome: 'ArteBrasileiros', url: 'https://artebrasileiros.com.br/feed/' }
];

/* ---------- dados.js ---------- */
function carregarDados() {
  const win = {};
  new Function('window', fs.readFileSync(DADOS, 'utf8') + '\n;window.DATA=window.DATA||DATA;')(win);
  if (!win.DATA) throw new Error('dados.js nao expos window.DATA');
  return win.DATA;
}

/* ---------- texto ---------- */
const norm = s => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const decodeHTML = s => String(s || '')
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#8220;|&#8221;|&#8243;|&#822[01];|&quot;/g, '"').replace(/&#8216;|&#8217;|&#0?39;|&apos;/g, "'")
  .replace(/&#8211;|&#8212;/g, '–').replace(/&#8230;/g, '…').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

const STOP = new Set(['de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em', 'no', 'na', 'um',
  'uma', 'que', 'com', 'para', 'the', 'of', 'and', 'edital', 'chamada', 'abre', 'lanca', 'inscricoes',
  'abertas', 'aberto', 'aberta', 'premio', 'residencia', 'convoca', 'seleciona', 'projetos', 'artistas',
  'cultura', 'cultural', 'culturais', 'arte', 'artes', 'visuais', 'ano', '2026', '2027']);
const toks = s => norm(s).split(' ').filter(t => t.length > 2 && !STOP.has(t));

/* ---------- prazo no texto ---------- */
const MESES = { janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6, julho: 7,
  agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };
const pad = n => String(n).padStart(2, '0');

/* Acha a data de encerramento mais provável no título + descrição. Devolve ISO
   ou null. Prefere trechos com "até / prazo / inscrições / encerra" por perto. */
function acharPrazo(txt) {
  const t = norm(txt);
  const achados = [];
  const push = (iso, ctx) => { if (iso) achados.push({ iso, forte: /(ate|prazo|inscri|encerr|termin|deadline)/.test(ctx) }); };

  // DD/MM/AAAA ou DD/MM
  for (const m of t.matchAll(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/g)) {
    const d = +m[1], mo = +m[2]; let y = m[3] ? +m[3] : +HOJE.slice(0, 4);
    if (y < 100) y += 2000;
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) push(`${y}-${pad(mo)}-${pad(d)}`, t.slice(Math.max(0, m.index - 30), m.index));
  }
  // "DD de mês [de AAAA]"
  for (const m of t.matchAll(/(\d{1,2})\s+de\s+([a-z]+)(?:\s+de\s+(\d{4}))?/g)) {
    const mo = MESES[m[2]]; if (!mo) continue;
    const y = m[3] ? +m[3] : +HOJE.slice(0, 4);
    push(`${y}-${pad(mo)}-${pad(+m[1])}`, t.slice(Math.max(0, m.index - 30), m.index));
  }
  if (!achados.length) return null;
  // futura e "forte" primeiro; senão a futura mais próxima; senão a mais tardia
  const fut = achados.filter(a => a.iso >= HOJE);
  const pool = fut.length ? fut : achados;
  pool.sort((a, b) => (b.forte - a.forte) || a.iso.localeCompare(b.iso));
  return pool[0].iso;
}

/* ---------- HTTP ---------- */
async function pegar(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': UA } });
    if (!r.ok) return { erro: 'HTTP ' + r.status };
    return { xml: await r.text() };
  } catch (e) {
    return { erro: (e.name === 'AbortError' ? 'timeout' : String(e.message || e)).slice(0, 70) };
  } finally { clearTimeout(t); }
}

/* ---------- parse de feed RSS ---------- */
function itensDoFeed(xml, nomeFonte) {
  const out = [];
  for (const bloco of xml.split(/<item[\s>]/).slice(1)) {
    const corpo = bloco.split('</item>')[0];
    const pega = re => { const m = corpo.match(re); return m ? decodeHTML(m[1]) : ''; };
    const titulo = pega(/<title>([\s\S]*?)<\/title>/);
    const link = (corpo.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
    const pub = (corpo.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
    const desc = pega(/<description>([\s\S]*?)<\/description>/) + ' ' + pega(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
    if (!titulo) continue;
    const pubISO = pub ? new Date(pub).toISOString().slice(0, 10) : '';
    out.push({
      fonte: nomeFonte, titulo,
      link: (link || '').replace(/[?&]utm_[^"'\s]+/g, '').trim(),
      pub: pubISO,
      resumo: desc.slice(0, 400),
      prazo: acharPrazo(titulo + ' . ' + desc)
    });
  }
  return out;
}

/* Filtra o que claramente não é chamada aberta: notícia de resultado, cobertura
   de prêmio já entregue, resenha, entrevista, obituário. */
const RUIDO = /(resultad|selecionad|vencedor|contemplad|prorrog|retifica|inaugura|ganha (o |um )?premio|ganhou|recebe (o )?premio|recebeu|finalist|conheca os |vence(u|dora)|leva o premio|morre|falece|resenha|entrevista|lanca livro|livro de |critica de|é o vencedor)/i;
function pareceOportunidade(it) {
  const cabeca = norm(it.titulo);
  if (RUIDO.test(it.titulo)) return false;
  /* o gatilho tem de estar no TÍTULO — no resumo, quase todo texto de arte cita
     "edital" ou "residência" de passagem. */
  return /(edital|chamada|inscri|residencia|bolsa|convoca|selecao|open call|convocatoria|premio (de |para |nacional|internacional)|salao (de |nacional)|concurso)/.test(cabeca);
}

/* ---------- classificação ---------- */
function classificar(itens, DATA) {
  const naBase = (DATA.editais || []).map(e => new Set(toks(e.t + ' ' + (e.org || ''))));
  const casa = it => {
    const ti = new Set(toks(it.titulo));
    return naBase.some(tb => { let c = 0; for (const t of ti) if (tb.has(t)) c++; return c >= 2; });
  };

  const novos = [], conhecidos = [], velhos = [];
  const vistos = new Set();
  for (const it of itens) {
    if (!pareceOportunidade(it)) continue;
    const k = norm(it.titulo);
    if (vistos.has(k)) continue;
    vistos.add(k);
    if (casa(it)) { conhecidos.push(it); continue; }
    /* Prazo futuro manda: mesmo publicado há meses, se a data de inscrição
       ainda não passou, é oportunidade viva. Só cai em "velhos" quem tem prazo
       lido no passado, ou quem não tem prazo nenhum E é antigo. */
    const venceu = it.prazo && it.prazo < HOJE;
    const semSinal = !it.prazo && it.pub && (Date.parse(HOJE) - Date.parse(it.pub)) / 864e5 > JANELA;
    if (venceu || semSinal) velhos.push(it);
    else novos.push(it);
  }
  novos.sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999') || (b.pub || '').localeCompare(a.pub || ''));
  velhos.sort((a, b) => (b.prazo || b.pub || '').localeCompare(a.prazo || a.pub || ''));
  return { novos, conhecidos, velhos };
}

/* ---------- relatório ---------- */
function relatorio(r, DATA, erros) {
  const L = [];
  L.push(`# Radar de editais — ${HOJE}`, '');
  L.push('Varredura mecânica de `radar-editais.js`. **Nada foi escrito no `dados.js`.**', '');
  L.push('> Feed é pista, não fato. O prazo no título pode estar vencido, prorrogado ou errado.');
  L.push('> Antes de aceitar qualquer linha: **abra o link e confirme o prazo, quem pode se');
  L.push('> inscrever e a taxa na fonte oficial.** Só entra edital com prazo confirmado.', '');
  L.push(`Base agora: ${(DATA.editais || []).length} edital(is) no \`dados.js\`.`, '');

  L.push(`## Possíveis novos (${r.novos.length})`, '');
  if (!r.novos.length) L.push('_nada que já não esteja na base._', '');
  for (const it of r.novos) {
    L.push(`### ${it.titulo}`);
    L.push(`- **fonte:** ${it.fonte}${it.pub ? ` · publicado ${it.pub}` : ''}`);
    L.push(`- **prazo (do texto — CONFERIR):** ${it.prazo || 'não identificado'}`);
    L.push(`- **link:** ${it.link}`);
    if (it.resumo) L.push(`- ${it.resumo.replace(/\s+/g, ' ').slice(0, 260)}…`);
    L.push('', '```js');
    L.push(`{t:"${it.titulo.replace(/"/g, "'")}", org:"CONFERIR", cat:"${/residencia/i.test(it.titulo) ? 'residencia' : /premio/i.test(it.titulo) ? 'premio' : 'chamada'}", prazo:"${it.prazo || ''}", quem:"CONFERIR", onde:"CONFERIR — Brasil ou São Paulo", taxa:"CONFERIR", d:"CONFERIR — uma frase da fonte oficial", link:"${it.link}", fonte:"${it.fonte}, ${HOJE}"},`);
    L.push('```', '');
  }

  L.push(`## Já na base (${r.conhecidos.length})`, '');
  if (!r.conhecidos.length) L.push('_nenhum._');
  for (const it of r.conhecidos) L.push(`- **${it.titulo}** — ${it.fonte} · ${it.link}`);
  L.push('');

  L.push(`## Provavelmente fora de prazo ou antigos demais (${r.velhos.length})`, '');
  L.push(`_Prazo no texto já passou, ou o feed publicou há mais de ${JANELA} dias. Confira mesmo assim — prorrogação é comum._`, '');
  for (const it of r.velhos) L.push(`- **${it.titulo}**${it.prazo ? ` (prazo lido: ${it.prazo})` : ''} — ${it.fonte} · ${it.link}`);
  L.push('');

  if (erros.length) {
    L.push('## Fontes que falharam', '');
    erros.forEach(e => L.push(`- ${e}`));
    L.push('');
  }

  L.push('---');
  L.push(`_${r.novos.length} possível(is) novo(s) · ${r.conhecidos.length} já na base · ${r.velhos.length} fora de prazo/antigos._`);
  return L.join('\n');
}

/* ---------- main ---------- */
(async () => {
  const DATA = carregarDados();
  console.log(`radar-editais · ${HOJE} · ${FONTES.length} feed(s) · janela ${JANELA} dias`);

  const itens = [], erros = [];
  for (const f of FONTES) {
    const r = await pegar(f.url);
    if (r.erro) { erros.push(`${f.nome} (${f.url}): ${r.erro}`); continue; }
    const its = itensDoFeed(r.xml, f.nome);
    console.log(`  ${f.nome}: ${its.length} item(ns)`);
    itens.push(...its);
  }

  const r = classificar(itens, DATA);
  console.log(`  novos ${r.novos.length} · já na base ${r.conhecidos.length} · fora de prazo/antigos ${r.velhos.length}`);
  if (erros.length) erros.forEach(e => console.log('  ! ' + e));

  const md = relatorio(r, DATA, erros);
  const saida = flag('saida', null);
  if (saida) {
    fs.mkdirSync(path.dirname(path.resolve(RAIZ, saida)), { recursive: true });
    fs.writeFileSync(path.resolve(RAIZ, saida), md, 'utf8');
    console.log('  relatório em ' + saida);
  } else {
    console.log('\n' + md);
  }
})().catch(e => { console.error(e); process.exit(1); });
