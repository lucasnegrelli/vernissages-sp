#!/usr/bin/env node
/* ============================================================
   exposicao-auto.js — escolhe uma exposição, monta o carrossel profundo e
   enfileira, tudo por regra, sem IA (09/11/2026)

   Roda no GitHub Actions (exposicao-auto.yml). Para o carrossel de UMA exposição
   (exposicao.js --buscar --auto --texto=2): fotos da página da própria galeria,
   uma vista de sala em faixa contínua, 2 trechos do texto da exposição com a
   assinatura de quem escreveu, e a ficha.

   Regra de escolha (conservadora: dúvida = não posta):
   - mostra em cartaz há pelo menos 1 dia e que dura mais 7 dias;
   - a casa tem página da mostra no acervo-imagens.json, no formato Artlogic
     (CDN static-assets.artlogic.net com imagens de obra e de exposição, de origem
     clara) e a página traz texto de pelo menos 300 caracteres;
   - pelo menos 6 fotos grandes distintas;
   - a mostra ainda não saiu como carrossel e a casa não saiu nos últimos 14 dias;
   - no máximo 2 carrosséis de exposição na fila por vez.
   Os mais novos primeiro. O dia é o próximo de terça, quinta ou sábado sem feed
   na fila, às 12:00.

   Uso: node exposicao-auto.js [--seco] [--hoje=AAAA-MM-DD]
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const base = require('./rima.js');
const { carregarDados, RAIZ } = base;

const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const SECO = argv.includes('--seco');
const HOJE = flag('hoje', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
const USADAS = path.join(RAIZ, 'SOCIAL', 'EXPOSICOES-USADAS.json');
const UA = 'Mozilla/5.0 (compatible; vernissages-sp/1.0; +https://vernissagessp.com.br)';
const lerJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
const somaDias = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);

function filaDoDia(data) {
  const d = path.join(RAIZ, 'fila', 'vernissagessp');
  return fs.existsSync(d) ? fs.readdirSync(d).filter(n => n.startsWith(data + '_')) : [];
}
const temFeed = data => filaDoDia(data).some(n => !/story|reel/.test(n));

async function paginaServe(url) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA } }); if (!r.ok) return false;
    const h = await r.text();
    const artlogic = new Set((h.match(/static-assets\.artlogic\.net\/[^"'\s)<>]+\.(?:jpe?g|png)/gi) || []).map(u => u.replace(/\/w_[^/]+\//, '/'))).size;
    const desc = (h.match(/<div class="description"[^>]*>([\s\S]*?)<\/div>/i) || [])[1] || '';
    const texto = desc.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    return artlogic >= 6 && texto.length >= 300;
  } catch (e) { return false; }
}

(async () => {
  const DATA = carregarDados();
  const usadas = lerJson(USADAS, {});
  const acervo = lerJson(path.join(RAIZ, 'acervo-imagens.json'), {});
  const noFila = fs.existsSync(path.join(RAIZ, 'fila', 'vernissagessp')) ? fs.readdirSync(path.join(RAIZ, 'fila', 'vernissagessp')).filter(n => /_exposicao$/.test(n) && n.slice(0, 10) >= HOJE) : [];
  if (noFila.length >= 2) { console.log(`exposicao-auto: já há ${noFila.length} carrossel(is) de exposição na fila. Nada a fazer.`); return; }

  const cands = DATA.expos
    .filter(e => e.ini && e.ini < HOJE && (!e.fim || dias(HOJE, e.fim) >= 7) && !usadas[e.t + '|' + e.v] && ((acervo[e.t + '|' + e.v] || {}).links || {}).site)
    .filter(e => !Object.entries(usadas).some(([k, d]) => k.split('|')[1] === e.v && dias(d, HOJE) < 14))
    .sort((a, b) => b.ini.localeCompare(a.ini));
  console.log(`exposicao-auto ${HOJE}: ${cands.length} candidata(s) com página da mostra`);

  let alvo = null;
  for (const e of cands.slice(0, 12)) {
    const ok = await paginaServe(acervo[e.t + '|' + e.v].links.site);
    console.log(`  ${ok ? 'serve ' : 'não   '} ${e.t} · ${e.v}`);
    if (ok) { alvo = e; break; }
  }
  if (!alvo) { console.log('Nenhuma mostra passou nas réguas (Artlogic, texto, 6 fotos). Nada postado.'); return; }

  let data = null;
  for (let n = 1; n <= 10; n++) {
    const d = somaDias(HOJE, n), w = new Date(d + 'T12:00:00Z').getUTCDay();
    if ([2, 4, 6].includes(w) && !temFeed(d)) { data = d; break; }
  }
  if (!data) { console.log('Sem dia livre nos próximos 10 dias.'); return; }
  console.log(`=> ${alvo.t} · ${alvo.v} em ${data} 12:00`);
  if (SECO) return;

  const out = path.join('SOCIAL', data.slice(5, 7), data.slice(8, 10));
  const run = (script, a) => execFileSync(process.execPath, [path.join(RAIZ, script), ...a], { cwd: RAIZ, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'] });
  console.log(run('exposicao.js', [alvo.t, `--casa=${alvo.v}`, '--buscar', '--auto', '--texto=2', `--out=${out}`, `--pub=${data}`]));
  console.log(run('publicar.js', ['enfileirar', data, '--conta=vernissagessp', '--so=feed', '--quando=12:00']));
  usadas[alvo.t + '|' + alvo.v] = data;
  fs.mkdirSync(path.dirname(USADAS), { recursive: true });
  fs.writeFileSync(USADAS, JSON.stringify(usadas, null, 2) + '\n');
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
