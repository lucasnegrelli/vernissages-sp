#!/usr/bin/env node
/* ============================================================
   destaques.js — capas dos destaques do perfil, uma por série (09/11/2026)

   Cartão de cor chapada com a palavra da série. Sem obra por baixo (regra da
   casa). Cada série tem a sua cor; o molde é o mesmo, como o "Vem pro Vão" do
   MASP. O Instagram corta a capa em círculo no centro: a palavra fica dentro
   dos 640 px centrais. Sai em destaques/NN-nome.png (1080x1920).

   Uso: node destaques.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('./direcao.js');
const RAIZ = __dirname;
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');

const SERIES = [
  { id: 'editais', palavra: 'EDITAIS', sub: 'para quem faz', cor: '#C96F4A' },
  { id: 'a-fundo', palavra: 'A FUNDO', sub: 'carrossel', cor: '#2F7F8C' },
  { id: 'abre', palavra: 'ABRE', sub: 'esta semana', cor: '#D9A53A' },
  { id: 'a-pe', palavra: 'A PÉ', sub: 'por um bairro', cor: '#8E2A3A' },
  { id: 'mapa', palavra: 'MAPA', sub: 'perto de você', cor: '#0E0E0E' },
];

const sobre = cor => (D.contraste(D.hex2rgb(cor), D.hex2rgb(D.TINTA)) >= 6 ? D.TINTA : D.PAPEL);
const html = s => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
*{margin:0;padding:0}.c{width:1080px;height:1920px;background:${s.cor};color:${sobre(s.cor)};display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Switzer',sans-serif}
.p{font-weight:800;font-size:${s.palavra.length > 6 ? 150 : 190}px;letter-spacing:-.075em;word-spacing:.22em;line-height:.85;white-space:nowrap}
.s{font-family:'IS',serif;font-style:italic;font-size:54px;margin-top:34px}
</style><body><div class="c"><div class="p">${s.palavra}</div><div class="s">${s.sub}</div></div></body>`;

(async () => {
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const out = path.join(RAIZ, 'destaques');
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 } });
  const tmp = path.join(RAIZ, '.destaque.html');
  for (const [i, s] of SERIES.entries()) {
    fs.writeFileSync(tmp, html(s));
    const p = await browser.newPage();
    await p.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await p.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 250));
    await p.screenshot({ path: path.join(out, `${String(i + 1).padStart(2, '0')}-${s.id}.png`) });
    await p.close();
    console.log('OK destaques/' + `${String(i + 1).padStart(2, '0')}-${s.id}.png`);
  }
  await browser.close(); fs.rmSync(tmp, { force: true });
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
