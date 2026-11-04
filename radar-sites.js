#!/usr/bin/env node
/**
 * radar-sites.js — o radar de editais lendo os sites oficiais de quem abre a chamada.
 *
 * POR QUE ISTO EXISTE
 * Notícia e Instagram anunciam edital de segunda mão; o prazo certo está na página de quem abriu.
 * Aqui o radar vai direto aos sites dos organizadores (lista em radar/fontes-sites.json: Pivô,
 * Capacete, Tomie Ohtake, FAAP/MAB, MAC USP, Prefeitura de SP, Funarte...), acha os links que
 * parecem chamada, ABRE a página de cada um e lê dali o título e o prazo.
 *
 * O QUE FAZ
 *   1. busca a página-índice de cada fonte;
 *   2. pega os links cujo texto ou endereço tem edital, chamada, residência, convocatória...;
 *   3. descarta o que a própria fonte filtra como ruído (concurso interno, retificação, licitação);
 *   4. abre cada página de chamada (até 6 por fonte), lê o título, o prazo e se já encerrou;
 *   5. grava radar/editais-sites.json, que o gerar.js mostra na seção Radar de editais.html.
 *
 * O QUE NÃO FAZ
 * Não decide nada: página oficial é melhor que notícia, mas regulamento muda. O site mostra "lido na
 * página oficial, confirme antes de se inscrever". Fonte que não responde é apontada no resumo e
 * não derruba a rodada.
 *
 * USO
 *   node radar-sites.js [--saida radar/editais-sites.json] [--max 6]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { acharPrazo, prazoRelativo, categoriaDe, escopoDe, norm, decodeHTML, HOJE } = require('./radar-editais.js');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const SAIDA = path.join(RAIZ, flag('saida', 'radar/editais-sites.json'));
const MAX = Number(flag('max', '6')) || 6;
const UA = 'Mozilla/5.0 (compatible; vernissages-sp/1.0; +https://vernissagessp.com.br)';
const lerJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } };

const GATILHO = /(edital|chamada|convocat|residencia|open call|premio|bolsa|inscri[cç])/;
const GENERICO = /^(saiba mais|ver mais|leia mais|ver catalogo|clique aqui|mais informacoes|residencias?|editais?|chamadas?|residentes|inscricoes?)$/;
const ENCERRADO = /(inscricoes? (encerrad|finalizad)|prazo (encerrad|finalizad)|encerrad[oa]s? (em|as)|chamada encerrada|edital encerrado|applications? (are )?closed|closed)/;

async function pegar(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 18000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': UA, 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.5' } });
    if (!r.ok) return { erro: 'HTTP ' + r.status };
    return { html: await r.text(), url: r.url };
  } catch (e) { return { erro: (e.name === 'AbortError' ? 'timeout' : String(e.message || e)).slice(0, 60) }; }
  finally { clearTimeout(t); }
}
const texto = h => decodeHTML(String(h || '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/gi, ' '));

/* links candidatos de uma página-índice */
function candidatos(html, base, fonte) {
  const out = [];
  const re = /<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]{2,260}?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    let href;
    try { href = new URL(m[1].replace(/&amp;/g, '&'), base).href; } catch (_) { continue; }
    if (!/^https?:/.test(href)) continue;
    const tx = decodeHTML(m[2]);
    const n = norm(tx + ' ' + href);
    if (!GATILHO.test(n)) continue;
    if (fonte.hrefOk && !new RegExp(fonte.hrefOk, 'i').test(href)) continue;
    if (fonte.hrefNao && new RegExp(fonte.hrefNao, 'i').test(href)) continue;
    if (fonte.textoNao && new RegExp(fonte.textoNao, 'i').test(norm(tx))) continue;
    out.push({ href, tx });
  }
  /* o mesmo link aparece em menu, card e rodapé: fica o de texto mais longo */
  const por = new Map();
  out.forEach(c => { const k = c.href.replace(/\/$/, ''); if (!por.has(k) || c.tx.length > por.get(k).tx.length) por.set(k, c); });
  return [...por.values()];
}

function tituloDaPagina(html, fallback) {
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  const ti = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  let t = decodeHTML(h1 || ti || fallback || '').replace(/\s+[|–—-]\s+[^|–—-]{3,40}$/, '').trim();
  if (norm(t).length < 8) t = decodeHTML(fallback || '');
  return t.length > 130 ? t.slice(0, 127).replace(/\s+\S*$/, '') + '…' : t;
}

(async () => {
  const cfg = lerJSON(path.join(RAIZ, 'radar/fontes-sites.json'), { fontes: [] });
  const fontes = (cfg.fontes || []).filter(f => f && f.url);
  console.log(`radar-sites · ${HOJE} · ${fontes.length} fonte(s) oficial(is)`);
  const itens = [], resumo = [];

  for (const f of fontes) {
    const r = await pegar(f.url);
    if (r.erro) { resumo.push(`  ✗ ${f.nome.padEnd(28)} ${r.erro}`); continue; }
    const cands = candidatos(r.html, r.url, f).filter(c => !GENERICO.test(norm(c.tx)) || f.aceitaGenerico).slice(0, 40);
    let lidos = 0, vivos = 0;
    for (const c of cands) {
      if (lidos >= MAX) break;
      /* já é a própria página-índice (menu "Residências" apontando para si)? pula */
      if (c.href.replace(/\/$/, '') === r.url.replace(/\/$/, '')) continue;
      const p = await pegar(c.href);
      lidos++;
      if (p.erro) continue;
      const corpo = texto(p.html);
      const n = norm(corpo.slice(0, 9000));
      if (ENCERRADO.test(n) && !/(abertas|abre|prorrog)/.test(n.slice(0, 1500))) continue;
      /* fonte que mistura linguagens (Funarte, Prefeitura) só vale se a página falar de artes visuais */
      if (f.exigeTexto && !new RegExp(f.exigeTexto).test(n)) continue;
      const titulo = tituloDaPagina(p.html, c.tx);
      if (!GATILHO.test(norm(titulo + ' ' + c.href))) continue;
      const prazo = acharPrazo(corpo.slice(0, 6000)) || prazoRelativo(corpo.slice(0, 3000), HOJE);
      if (prazo && prazo < HOJE) continue;                       /* prazo lido já passou */
      /* sem prazo: só vale se a página fala de inscrição ou candidatura (descarta página institucional de programa) */
      if (!prazo && !/(inscri|candidat|aberta|abertas|open call|apply|submiss|selecao|formulario)/.test(n)) continue;
      const resu = corpo.replace(/\s+/g, ' ').trim().slice(0, 240);
      const it = { titulo, resumo: resu };
      itens.push({
        t: titulo, fonte: f.nome + ' (site oficial)', link: p.url || c.href, pub: '', prazo: prazo || null,
        cat: categoriaDe(it), onde: f.escopo || escopoDe(it), resumo: resu, visto: HOJE, via: 'site'
      });
      vivos++;
    }
    resumo.push(`  ✓ ${f.nome.padEnd(28)} ${String(cands.length).padStart(2)} links · ${lidos} páginas lidas · ${vivos} chamada(s) viva(s)`);
  }

  /* o que já estava no arquivo continua enquanto a fonte ainda o mostra (visto há ≤ 10 dias) ou o prazo não passou */
  const dif = (a, b) => Math.round((Date.parse(b + 'T12:00') - Date.parse(a + 'T12:00')) / 864e5);
  const vivo = x => x.prazo ? x.prazo >= HOJE : (x.visto && dif(x.visto, HOJE) <= 10);
  const antigos = (lerJSON(SAIDA, {}).itens) || [];
  const porLink = new Map();
  [...antigos, ...itens].forEach(x => { if (x.link && vivo(x)) porLink.set(x.link, Object.assign({}, porLink.get(x.link) || {}, x)); });
  const finais = [...porLink.values()].sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'));

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify({
    gerado: HOJE,
    aviso: 'Lido nas páginas oficiais de quem abriu a chamada. Regulamento e prazo podem mudar: confirme antes de se inscrever.',
    itens: finais
  }, null, 1) + '\n');

  console.log(resumo.join('\n'));
  console.log(`  ${itens.length} nesta rodada · ${finais.length} viva(s) no arquivo · ${path.relative(RAIZ, SAIDA)}`);
})().catch(e => { console.error(e); process.exit(1); });
