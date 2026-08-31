#!/usr/bin/env node
/**
 * radar-fontes.js — a varredura mecânica dos agregadores, sem o julgamento.
 *
 * POR QUE ISTO EXISTE
 * A S1 da Parte 2 do OPERACAO.md manda o agente de domingo abrir os agregadores
 * e os sites de venue, achar o que é novo e o que encerrou, e cruzar com o
 * `dados.js`. Metade disso é trabalho de robô — ler HTML, casar nome de casa,
 * comparar data — e o agente vinha fazendo à mão, gastando token e esbarrando
 * na parede de aprovação de domínio do navegador embutido (metade das
 * navegações recusadas numa execução agendada, ver LEIA de 31/08).
 *
 * Isto faz a parte mecânica e para. Roda no GitHub Actions, que tem Chrome de
 * verdade e nenhuma parede de domínio. Cospe um relatório em markdown — mesmo
 * padrão do `descobrir-imagens.js` — e **não escreve no dados.js**. A decisão
 * de aceitar uma linha continua sendo de quem confere a data na fonte primária
 * e abre a imagem pra ver se é obra ou cartaz.
 *
 * O QUE ELE NÃO FAZ
 * Não decide, não inventa e não abre Instagram. Agregador é fonte de pista,
 * nunca de verdade: em 20/08 o Arte Que Acontece anunciava um domínio da HOA
 * que tinha caído e servia cassino. Toda linha do relatório é "confira isto",
 * não "faça isto".
 *
 * FONTES
 *   - Arte Que Acontece: WordPress + The Events Calendar. A página de categoria
 *     de SP traz um bloco JSON-LD com ~60 Events completos (nome, datas,
 *     endereço). É a fonte rica e não precisa de navegador.
 *   - Guia das Artes: lista montada por JavaScript. Só entra com --render.
 *   - Ocula: bloqueia bot (403). Fora por enquanto.
 *
 * USO
 *   node radar-fontes.js                       (mês atual + o seguinte)
 *   node radar-fontes.js --mes 2026-09
 *   node radar-fontes.js --render              (tenta o Guia das Artes também)
 *   node radar-fontes.js --saida PENDENTE/RADAR-FONTES.md
 */

'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const DADOS = path.join(RAIZ, 'dados.js');
const UA = 'vernissages-sp/1.0 (+https://vernissagessp.com.br)';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const tem = n => argv.includes('--' + n);

const HOJE = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); // fuso de SP

/* ---------- meses a varrer ---------- */
function mesesAlvo() {
  const m = flag('mes', null);
  if (m) return [m];
  const [a, mm] = HOJE.split('-').map(Number);
  const prox = mm === 12 ? [a + 1, 1] : [a, mm + 1];
  return [`${a}-${String(mm).padStart(2, '0')}`, `${prox[0]}-${String(prox[1]).padStart(2, '0')}`];
}

/* ---------- dados.js ---------- */
function carregarDados() {
  const win = {};
  new Function('window', fs.readFileSync(DADOS, 'utf8') + '\n;window.DATA=window.DATA||DATA;')(win);
  if (!win.DATA || !Array.isArray(win.DATA.expos)) throw new Error('dados.js nao expos window.DATA.expos');
  return win.DATA;
}

/* ---------- normalização e casamento ---------- */
const norm = s => String(s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const RUIDO_CASA = new Set(['galeria', 'gallery', 'sao', 'paulo', 'sp', 'arte', 'contemporanea',
  'museu', 'de', 'da', 'do', 'dos', 'das', 'e', 'centro', 'cultural', 'espaco', 'casa',
  'instituto', 'fundacao', 'projetos', 'the', 'of', 'art']);

const tokensCasa = s => norm(s).split(' ').filter(t => t.length > 2 && !RUIDO_CASA.has(t));

const STOP_T = new Set(['de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em', 'no', 'na',
  'um', 'uma', 'que', 'com', 'para', 'the', 'of', 'and', 'individual', 'exposicao', 'mostra', 'no', 'sobre']);
const tokensTitulo = s => norm(s).split(' ').filter(t => t.length > 2 && !STOP_T.has(t));

/* Casa candidata (do agregador) contra a lista de venues do dados.js.
   Devolve o venue casado ou null. Exige 2 tokens significativos em comum, ou
   que um nome contenha o outro inteiro. */
function casarVenue(nomeAgg, venues) {
  const nn = norm(nomeAgg);
  const ta = new Set(tokensCasa(nomeAgg));
  if (!ta.size) return null;
  let melhor = null, melhorP = 0;
  for (const v of venues) {
    const nv = norm(v.name);
    let p = 0;
    if (nn.includes(nv) || nv.includes(nn)) p = 99;
    else {
      const tv = new Set(tokensCasa(v.name));
      for (const t of ta) if (tv.has(t)) p++;
    }
    if (p > melhorP) { melhorP = p; melhor = v; }
  }
  return melhorP >= 2 ? melhor : null;
}

/* Título candidato contra as expos daquele venue. */
function jaTemExpo(tituloAgg, exposDoVenue) {
  const ta = new Set(tokensTitulo(tituloAgg));
  if (!ta.size) return null;
  for (const e of exposDoVenue) {
    const te = new Set(tokensTitulo(e.t));
    let comum = 0;
    for (const t of ta) if (te.has(t)) comum++;
    if (comum >= 2 || (comum >= 1 && ta.size <= 2)) return e;
  }
  return null;
}

const decodeHTML = s => String(s || '')
  .replace(/&#8220;|&#8221;|&#8243;|&#822[01];/g, '"').replace(/&#8216;|&#8217;/g, "'")
  .replace(/&#8211;|&#8212;/g, '–').replace(/&#8230;/g, '…').replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const semAspas = s => String(s || '').replace(/^[\s"'“”‘’«»]+|[\s"'“”‘’«»]+$/g, '').trim();

/* ---------- extração do "name" do agregador ----------
   Formato do Arte Que Acontece:  "Título" de Fulano no Venue
                                  "Título", de Fulano e Beltrano na Galeria X
                                  "Título" no Venue
   O venue vem estruturado no location.name — usa ele pra cortar a cauda, em vez
   de adivinhar onde o nome da casa começa. Só extrai título e artista. */
function desmembrar(nameRaw, venueLD) {
  let s = decodeHTML(nameRaw).replace(/\s+/g, ' ').trim();

  // corta " no/na/em <venue>" do fim — testando o venue estruturado e um genérico
  const vTok = venueLD ? norm(venueLD).split(' ').filter(t => t.length > 3)[0] : null;
  const mSep = s.match(/^(.*?)\s+(?:n[oa]|em|at)\s+(.+)$/i);
  if (mSep && (!vTok || norm(mSep[2]).includes(vTok) || mSep[2].length < 45)) s = mSep[1].trim();

  // título: primeiro trecho entre aspas; senão, tudo antes de ", de "/" de "
  const mT = s.match(/["'“”‘’«»]([^"'“”‘’«»]{2,})["'“”‘’«»]/);
  let titulo = mT ? mT[1].trim() : s.replace(/[,·—-]?\s*\b(?:de|do|da)\s+.+$/i, '').trim();
  titulo = semAspas(titulo);

  // artista: o que vem logo depois do título, se começar com "de/do/da "
  let artista = '';
  const resto = mT ? s.slice(s.indexOf(mT[0]) + mT[0].length) : s.slice(titulo.length);
  const mA = resto.match(/^[\s,·—-]*\b(?:de|do|da)\s+(.+)$/i);
  if (mA) {
    artista = mA[1].replace(/\s+\b(?:n[oa]|em)\s+.+$/i, '').trim();       // tira cauda de venue que sobrou
    if (/colectivo|coletivo|grupo|curadoria/i.test(artista) || artista.split(' ').length > 8) artista = '';
  }
  return { titulo: titulo || semAspas(s), artista };
}

const soDia = iso => (String(iso || '').match(/^\d{4}-\d{2}-\d{2}/) || [''])[0];

/* ---------- HTTP ---------- */
async function pegar(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': UA } });
    if (!r.ok) return { erro: 'HTTP ' + r.status };
    return { html: await r.text(), url: r.url };
  } catch (e) {
    return { erro: (e.name === 'AbortError' ? 'timeout' : String(e.message || e)).slice(0, 70) };
  } finally { clearTimeout(t); }
}

let _browser = null;
async function pegarRender(url) {
  try {
    if (!_browser) {
      let pptr;
      for (const p of [path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'), 'puppeteer-core', 'puppeteer']) {
        try { pptr = require(p); break; } catch {}
      }
      if (!pptr) return { erro: 'puppeteer indisponivel' };
      let exe = process.env.CHROME;
      if (!exe) for (const c of ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe']) {
        if (fs.existsSync(c)) { exe = c; break; }
      }
      _browser = await pptr.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });
    }
    const page = await _browser.newPage();
    await page.setUserAgent(UA);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      return { html: await page.content(), url: page.url() };
    } finally { await page.close().catch(() => {}); }
  } catch (e) { return { erro: 'render: ' + String(e.message || e).slice(0, 60) }; }
}

/* ---------- Arte Que Acontece ---------- */
async function arteQueAcontece(meses) {
  const out = [];
  for (const mes of meses) {
    const url = `https://artequeacontece.com.br/eventos/categoria/sao-paulo/${mes}/`;
    const r = await pegar(url);
    if (r.erro) { out.push({ _fonte_erro: `Arte Que Acontece ${mes}: ${r.erro}` }); continue; }
    const m = r.html.match(/<script type="application\/ld\+json">\s*(\[[\s\S]*?\])\s*<\/script>/);
    if (!m) { out.push({ _fonte_erro: `Arte Que Acontece ${mes}: sem bloco JSON-LD` }); continue; }
    let arr;
    try { arr = JSON.parse(m[1]); } catch { out.push({ _fonte_erro: `Arte Que Acontece ${mes}: JSON-LD ilegivel` }); continue; }
    for (const ev of arr) {
      if (ev['@type'] !== 'Event') continue;
      const addr = (ev.location && ev.location.address) || {};
      const cidade = norm(addr.addressLocality + ' ' + (addr.streetAddress || ''));
      const ehSP = cidade.includes('sao paulo') || /(\bsp\b|sao paulo)/.test(norm(JSON.stringify(addr)));
      const venueLD = (ev.location && ev.location.name) || '';
      const partes = desmembrar(ev.name, venueLD);
      out.push({
        fonte: 'Arte Que Acontece',
        titulo: partes.titulo || decodeHTML(ev.name),
        artista: partes.artista,
        venueAgg: venueLD,
        venueLD,
        ini: soDia(ev.startDate),
        fim: soDia(ev.endDate),
        endereco: [addr.streetAddress, addr.addressLocality].filter(Boolean).join(', '),
        img: ev.image || '',
        url: ev.url || url,
        ehSP
      });
    }
  }
  return out;
}

/* ---------- Guia das Artes (opcional, --render) ---------- */
async function guiaDasArtes() {
  const url = 'https://www.guiadasartes.com.br/sao-paulo/sao-paulo/exposicoes';
  const r = await pegarRender(url);
  if (r.erro) return [{ _fonte_erro: `Guia das Artes: ${r.erro}` }];
  const out = [];
  const re = /href="\/sao-paulo\/sao-paulo\/exposicoes\/([^"]+?)-(\d{4}-\d{2}-\d{2})"/g;
  let m;
  const vistos = new Set();
  while ((m = re.exec(r.html)) !== null) {
    if (vistos.has(m[1])) continue;
    vistos.add(m[1]);
    out.push({
      fonte: 'Guia das Artes',
      titulo: decodeHTML(m[1].replace(/-/g, ' ')).replace(/\b\w/g, c => c.toUpperCase()),
      artista: '', venueAgg: '', venueLD: '',
      ini: m[2], fim: '',
      endereco: '', img: '', url: `https://www.guiadasartes.com.br/sao-paulo/sao-paulo/exposicoes/${m[1]}-${m[2]}`,
      ehSP: true
    });
  }
  return out.length ? out : [{ _fonte_erro: 'Guia das Artes: nenhuma exposicao no HTML renderizado' }];
}

/* ---------- diff ---------- */
function classificar(cands, DATA) {
  const venues = DATA.venues;
  const exposPorVenue = {};
  for (const e of DATA.expos) (exposPorVenue[e.v] = exposPorVenue[e.v] || []).push(e);

  const novas = [], divergencias = [], casaNova = [], erros = [];
  const venuesVistosNoFeed = new Set();
  let jaEncerradas = 0;
  const vistos = new Set();

  for (const c of cands) {
    if (c._fonte_erro) { erros.push(c._fonte_erro); continue; }
    if (!c.ehSP) continue;
    const chave = norm(c.titulo) + '|' + norm(c.venueLD || c.venueAgg);
    if (vistos.has(chave)) continue;            // mesmo evento em dois meses de categoria
    vistos.add(chave);
    if (c.fim && c.fim < HOJE) { jaEncerradas++; continue; }   // já saiu de cartaz — não é novidade
    const v = casarVenue(c.venueAgg, venues) || casarVenue(c.venueLD, venues);
    if (!v) {
      // Guia das Artes só entrega título+data pelo slug — sem casa, não dá pra
      // vetar nada. Fica de fora do relatório até o parser buscar o venue na
      // página de cada mostra.
      if (c.fonte !== 'Guia das Artes') casaNova.push(c);
      continue;
    }
    venuesVistosNoFeed.add(v.name);
    const ja = jaTemExpo(c.titulo, exposPorVenue[v.name] || []);
    if (ja) {
      const dif = [];
      if (c.ini && ja.ini && c.ini !== ja.ini) dif.push(`abertura: base ${ja.ini} · agregador ${c.ini}`);
      if (c.fim && ja.fim && c.fim !== ja.fim) dif.push(`encerra: base ${ja.fim} · agregador ${c.fim}`);
      if (dif.length) divergencias.push({ c, ja, v, dif });
      continue;
    }
    // título já existe na base, mas em outro venue — quase sempre o mesmo
    // espaço com nome ligeiramente diferente (Mendes Wood DM × Casa Iramaia)
    const noutro = jaTemExpo(c.titulo, DATA.expos.filter(e => e.v !== v.name));
    if (noutro) {
      divergencias.push({ c, ja: noutro, v, dif: [`casa: base "${noutro.v}" · agregador casou com "${v.name}" — conferir se é o mesmo espaço`] });
      continue;
    }
    novas.push({ c, v });
  }

  /* reverso: expo da base cujo venue aparece no feed mas a mostra não —
     candidata a ter encerrado. Só sinaliza perto do fim pra não gritar à toa. */
  const talvezEncerradas = [];
  for (const e of DATA.expos) {
    if (!venuesVistosNoFeed.has(e.v)) continue;
    const noFeed = cands.some(c => !c._fonte_erro && jaTemExpo(c.titulo, [e]));
    if (noFeed) continue;
    const fim = e.fim;
    if (fim && fim < HOJE) talvezEncerradas.push({ e, motivo: `fim ${fim} já passou e não aparece mais no agregador` });
    else if (!fim) talvezEncerradas.push({ e, motivo: 'sem data de fim e não aparece no agregador' });
  }

  return { novas, divergencias, casaNova, talvezEncerradas, erros, jaEncerradas };
}

/* ---------- relatório ---------- */
function relatorio(r, DATA, meses) {
  const L = [];
  L.push(`# Radar de fontes — ${HOJE}`);
  L.push('');
  L.push(`Varredura mecânica de \`radar-fontes.js\`. Meses: ${meses.join(', ')}. **Nada foi escrito no \`dados.js\`.**`);
  L.push('');
  L.push('> Agregador é pista, não fato. Antes de aceitar qualquer linha: confirme data e cidade na');
  L.push('> página da própria casa, e abra a imagem pra ver se é obra ou cartaz. Crédito só entra');
  L.push('> confirmado na fonte.');
  L.push('');
  L.push(`Base agora: ${DATA.venues.length} casas · ${DATA.expos.length} mostras · \`atualizado\` ${DATA.atualizado}.`);
  L.push('');

  L.push(`## Novas — casa já mapeada (${r.novas.length})`);
  L.push('');
  if (!r.novas.length) L.push('_nada._');
  for (const { c, v } of r.novas) {
    L.push(`### ${c.titulo}${c.artista ? ' — ' + c.artista : ''}`);
    L.push(`- **casa:** ${v.name} (${v.b}, ${v.z} · ${v.tipo})`);
    L.push(`- **datas (agregador):** ${c.ini || '?'} → ${c.fim || '?'}`);
    if (c.endereco) L.push(`- **endereço no agregador:** ${c.endereco}`);
    L.push(`- **fonte:** ${c.fonte} — ${c.url}`);
    if (c.img) L.push(`- **imagem candidata:** ${c.img}  _(medir e olhar antes)_`);
    L.push('');
    L.push('```js');
    L.push(`{t:"${c.titulo}", a:"${c.artista || 'CONFERIR'}", v:"${v.name}", ini:"${c.ini || ''}", fim:"${c.fim || ''}", d:"CONFERIR — um fato concreto da fonte primária"},`);
    L.push('```');
    L.push('');
  }

  L.push(`## Divergência de data — mostra que já está na base (${r.divergencias.length})`);
  L.push('');
  if (!r.divergencias.length) L.push('_nada._');
  for (const { c, ja, v, dif } of r.divergencias) {
    L.push(`- **${ja.t}** · ${v.name}`);
    dif.forEach(d => L.push(`  - ${d}`));
    L.push(`  - fonte: ${c.fonte} — ${c.url}`);
  }
  L.push('');

  L.push(`## Pode ter encerrado (${r.talvezEncerradas.length})`);
  L.push('');
  if (!r.talvezEncerradas.length) L.push('_nada._');
  for (const { e, motivo } of r.talvezEncerradas) L.push(`- **${e.t}** · ${e.v} — ${motivo}`);
  L.push('');

  L.push(`## Casa não mapeada — vetar o espaço antes da mostra (${r.casaNova.length})`);
  L.push('');
  L.push('_O agregador cita uma casa que não casou com nenhum venue do `dados.js`. Pode ser casa nova, pode ser variação de nome, pode ser fora de SP. Não vira linha de agenda sem antes entrar no diretório._');
  L.push('');
  const porCasa = {};
  for (const c of r.casaNova) (porCasa[c.venueAgg || c.venueLD || '(sem nome)'] = porCasa[c.venueAgg || c.venueLD || '(sem nome)'] || []).push(c);
  for (const [casa, lista] of Object.entries(porCasa).sort((a, b) => b[1].length - a[1].length)) {
    L.push(`- **${casa}** (${lista.length}): ${lista.map(x => x.titulo).join(' · ')}`);
    if (lista[0].endereco) L.push(`  - endereço: ${lista[0].endereco}`);
  }
  L.push('');

  if (r.erros.length) {
    L.push('## Fontes que falharam');
    L.push('');
    r.erros.forEach(e => L.push(`- ${e}`));
    L.push('');
  }

  L.push('---');
  L.push(`_${r.novas.length} nova(s) · ${r.divergencias.length} divergência(s) · ${r.talvezEncerradas.length} pra confirmar encerramento · ${r.casaNova.length} de casa não mapeada · ${r.jaEncerradas} candidata(s) já encerrada(s), ignoradas._`);
  return L.join('\n');
}

/* ---------- main ---------- */
(async () => {
  const meses = mesesAlvo();
  const DATA = carregarDados();
  console.log(`radar-fontes · ${HOJE} · meses ${meses.join(', ')}`);

  const cands = [];
  cands.push(...await arteQueAcontece(meses));
  if (tem('render')) cands.push(...await guiaDasArtes());
  if (_browser) await _browser.close().catch(() => {});

  const reais = cands.filter(c => !c._fonte_erro);
  console.log(`  ${reais.length} candidatas coletadas · ${reais.filter(c => c.ehSP).length} em São Paulo`);

  const r = classificar(cands, DATA);
  console.log(`  novas ${r.novas.length} · divergências ${r.divergencias.length} · talvez encerradas ${r.talvezEncerradas.length} · casa não mapeada ${r.casaNova.length}`);
  if (r.erros.length) r.erros.forEach(e => console.log('  ! ' + e));

  const md = relatorio(r, DATA, meses);
  const saida = flag('saida', null);
  if (saida) {
    fs.mkdirSync(path.dirname(path.resolve(RAIZ, saida)), { recursive: true });
    fs.writeFileSync(path.resolve(RAIZ, saida), md, 'utf8');
    console.log('  relatório em ' + saida);
  } else {
    console.log('\n' + md);
  }
})().catch(e => { console.error(e); process.exit(1); });
