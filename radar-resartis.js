#!/usr/bin/env node
/**
 * radar-resartis.js — Res Artis (rede mundial de residências artísticas) no radar de editais.
 *
 * A página pública https://resartis.org/open-calls/ lista as chamadas de residência abertas, cada
 * cartão com título, link, PRAZO ("Deadline: 04 Nov 2026") e país. O robots.txt do site permite a
 * leitura e não pede login. Uma requisição por rodada.
 *
 * Para não afogar o resto do radar (são ~150 cartões, a maioria sem relação com artes visuais ou
 * com prazo para daqui a meses), entram só residências com prazo entre MINIMO e JANELA dias, sem
 * título de música, dança, literatura, ópera ou teatro, e no máximo MAXIMO por rodada.
 *
 * USO   node radar-resartis.js [--saida radar/editais-resartis.json]
 *       node radar-resartis.js --arquivo pagina.html     (sem rede, para testar)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { norm, decodeHTML, HOJE } = require('./radar-editais.js');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const SAIDA = path.join(RAIZ, flag('saida', 'radar/editais-resartis.json'));
const MINIMO = 5, JANELA = 60, MAXIMO = 25;   // prazos de 5 a 60 dias: o de amanhã não dá tempo de inscrever
const lerJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } };
const MES = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
const FORA = /(opera|music|musician|composer|composition|dance|choreograph|theatre|theater|writer|writing|literature|poet|poetry|novel|translator|film|screenwrit|filmmaker|playwright|singer|orchestra|jazz|choir)/;
const dif = (a, b) => Math.round((Date.parse(b + 'T12:00') - Date.parse(a + 'T12:00')) / 864e5);

/* ---- quem paga: a maioria das chamadas do Res Artis cobra taxa do artista (hospedagem, ateliê). Lê a página de
   cada chamada e separa: COM TAXA (valor achado, nada de apoio), APOIO (bolsa, financiada, sem taxa) ou
   INDEFINIDO. Regra por palavra e valor, sem IA. Regra de segurança: dúvida vira "indefinido", nunca "grátis". ---- */
const FINANCIA = /(fully|partially|partly)[- ]?(funded|sponsored|subsidi[sz]ed)|stipend|free of charge|no (program |participation |residency |accommodation )?fee(?! (to|for) (apply|submit|application))|without (a )?(program |participation )?fee|fee[- ]free|all costs covered/i;
const BOLSA = /scholarship|bursary|fellowship|grant/i;
const MOEDA = '(?:USD|US\\$|EUR|€|£|GBP|CAD|AUD|CHF|\\$)';
const NUM = '(\\d{1,3}(?:[.,]\\d{3})+|\\d{3,6})';
const REVALOR = new RegExp('(?:(' + MOEDA + ')\\s?' + NUM + ')|(?:' + NUM + '\\s?(' + MOEDA + '))', 'g');
function lerCusto(html) {
  const txt = decodeHTML(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/gi, ' ').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
  const corpo = txt.split(/Calls? for Speakers|Related (posts|calls)|Share this/i)[0];
  const achados = [];
  let m; REVALOR.lastIndex = 0;
  while ((m = REVALOR.exec(corpo))) {
    const v = parseInt((m[2] || m[3]).replace(/[.,](?=\d{3}\b)/g, ''), 10);
    const ctx = corpo.slice(Math.max(0, m.index - 140), m.index + 90).toLowerCase();
    if (v >= 200 && /fee|cost|price|pay|rate|tuition|per (week|month|night)|week|month|stay|room|accommodation|program/.test(ctx))
      achados.push({ v, moeda: (m[1] || m[4]).replace('US$', 'USD').replace('$', 'USD').replace('€', 'EUR').replace('£', 'GBP') });
  }
  const apoio = FINANCIA.test(corpo);
  if (achados.length && !apoio) { const min = achados.sort((a, b) => a.v - b.v)[0]; return { custo: 'taxa', taxaTxt: 'a partir de ' + min.v.toLocaleString('pt-BR') + ' ' + min.moeda + (BOLSA.test(corpo) ? ', menciona bolsa' : '') }; }
  if (achados.length && apoio) return { custo: 'parcial', taxaTxt: 'financiada em parte, confira o valor' };
  if (apoio) return { custo: 'apoio', taxaTxt: '' };
  return { custo: 'indefinido', taxaTxt: '' };
}
async function paginaChamada(link) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 30000);
  try { const r = await fetch(link, { signal: ctrl.signal, redirect: 'follow', headers: { 'accept-language': 'en' } }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.text(); }
  finally { clearTimeout(t); }
}

async function baixar() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const r = await fetch('https://resartis.org/open-calls/', { signal: ctrl.signal, redirect: 'follow', headers: { 'accept-language': 'en' } });   /* sem user-agent próprio: o servidor derruba a conexão (HTTP/2) quando ele leva URL */
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}

function ler(html) {
  const itens = [];
  for (const p of html.split('<div class="grid__item postcard">').slice(1)) {
    const link = (p.match(/<h2 class="card__title"><a href="([^"]+)"/) || [])[1];
    const titulo = decodeHTML((p.match(/<h2 class="card__title"><a [^>]*>([\s\S]*?)<\/a>/) || [])[1]).replace(/\s+/g, ' ').trim();
    const d = p.match(/Deadline:\s*(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/);
    const pais = decodeHTML((p.match(/Country:\s*([^<\n]+)/) || [])[1]).trim();
    if (!link || !titulo || !d || !MES[d[2].toLowerCase()]) continue;
    const prazo = `${d[3]}-${MES[d[2].toLowerCase()]}-${d[1].padStart(2, '0')}`;
    if (dif(HOJE, prazo) < MINIMO || dif(HOJE, prazo) > JANELA) continue;
    if (FORA.test(norm(titulo))) continue;
    itens.push({
      t: titulo.length > 120 ? titulo.slice(0, 117).replace(/\s+\S*$/, '') + '…' : titulo,
      fonte: 'Res Artis' + (pais ? ' · ' + pais : ''),
      link, pub: '', prazo, cat: 'residencia', onde: /^brazil$/i.test(pais) ? 'brasil' : 'exterior',
      resumo: 'Residência artística' + (pais ? ' em ' + pais : '') + '. A página no Res Artis leva ao programa e às regras de inscrição (em inglês).',
      visto: HOJE, via: 'plataforma'
    });
  }
  /* "Art Residency Available – MAY 2027 – Colombia" e irmãs (só muda o mês): fica a primeira */
  const MESES = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/g;
  const vistos = new Set();
  return itens.sort((a, b) => a.prazo.localeCompare(b.prazo)).filter(x => {
    const k = norm(x.t).replace(MESES, '').replace(/\d+/g, '').replace(/[^a-z]+/g, ' ').trim() + '|' + x.fonte;
    if (vistos.has(k)) return false; vistos.add(k); return true;
  }).slice(0, MAXIMO);
}

(async () => {
  const arq = flag('arquivo', null);
  console.log('radar-resartis · ' + HOJE + (arq ? ' · arquivo ' + arq : ' · resartis.org/open-calls'));
  const html = arq ? fs.readFileSync(path.resolve(arq), 'utf8') : await baixar();
  const cartoes = html.split('<div class="grid__item postcard">').length - 1;
  const itens = ler(html);
  console.log(`  ${cartoes} cartão(ões) lidos · ${itens.length} na janela de ${MINIMO} a ${JANELA} dias`);
  if (!cartoes) throw new Error('nenhum cartão lido: a página mudou?');

  const vivo = x => x.prazo && x.prazo >= HOJE;
  const porLink = new Map();
  [...((lerJSON(SAIDA, {}).itens) || []), ...itens].forEach(x => { if (x.link && vivo(x)) porLink.set(x.link, Object.assign({}, porLink.get(x.link) || {}, x)); });
  const finais = [...porLink.values()].sort((a, b) => a.prazo.localeCompare(b.prazo));
  /* custo: uma leitura por chamada (guardada no arquivo; só relê se ainda não sabe) */
  if (!argv.includes('--sem-custo')) for (const x of finais) {
    if (x.custo) continue;
    try { Object.assign(x, lerCusto(await paginaChamada(x.link))); } catch (e) { x.custo = 'indefinido'; x.taxaTxt = ''; }
  }
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify({ gerado: HOJE, aviso: 'Listado pelo Res Artis; a página da chamada leva ao programa. Confirme prazo e requisitos nela.', itens: finais }, null, 1) + '\n');
  console.log(`  ${finais.length} viva(s) no arquivo · ${path.relative(RAIZ, SAIDA)}`);
  finais.slice(0, 45).forEach(x => console.log('   ', x.prazo, '·', (x.custo || '?').padEnd(10), '·', (x.taxaTxt || '').padEnd(26), '·', x.t.slice(0, 60)));
})().catch(e => { console.error(e.message || e); process.exit(1); });
