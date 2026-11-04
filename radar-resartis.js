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
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify({ gerado: HOJE, aviso: 'Listado pelo Res Artis; a página da chamada leva ao programa. Confirme prazo e requisitos nela.', itens: finais }, null, 1) + '\n');
  console.log(`  ${finais.length} viva(s) no arquivo · ${path.relative(RAIZ, SAIDA)}`);
  finais.slice(0, 30).forEach(x => console.log('   ', x.prazo, '·', x.fonte.slice(10), '·', x.t.slice(0, 70)));
})().catch(e => { console.error(e.message || e); process.exit(1); });
