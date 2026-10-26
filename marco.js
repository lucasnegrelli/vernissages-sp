#!/usr/bin/env node
/* ============================================================
   marco.js — story de agradecimento por marco de seguidores. 1080x1920.

   POR QUE EXISTE (26/10/2026)
   O perfil bateu 100 seguidores depois de ~3 meses. Marco redondo é o tipo de
   story que o próprio seguidor compartilha, e é o único conteúdo do perfil que
   fala DELE, não da obra. Vale pros próximos (200, 500, 1000): é só mudar o
   número. Mesma identidade dos outros geradores (Switzer, paletas do rima.js).

   Regras do projeto: nada é inventado, então o número vem do argumento; sem
   travessão no texto; nada de emoji.

   Uso:
     node marco.js --numero=100 [--paleta=escuro] [--date=2026-10-26]
   Grava em SOCIAL/MM/DD/marco-<numero>-01.png
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { RAIZ, CSS, esc, PALETAS, cssPaleta, MARCA_HTML } = base;

const W = 1080, H = 1920;

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=').slice(1).join('=') : p; };
  const numero = flag('numero');
  if (!/^\d+$/.test(numero || '')) throw new Error('uso: node marco.js --numero=100');
  const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
  const pal = PALETAS[flag('paleta', 'escuro')] || PALETAS.escuro;
  const n = Number(numero).toLocaleString('pt-BR');

  const css = `${CSS}
    .slide.story{width:${W}px;height:${H}px;position:relative;overflow:hidden}
    .slide.story::after{display:none}
    .marco .num{position:absolute;left:88px;right:88px;top:560px;font-size:430px;font-weight:300;
      letter-spacing:-.05em;line-height:.9}
    .marco .selo{position:absolute;left:92px;top:520px;font-size:22px;font-weight:500;letter-spacing:.30em;text-transform:uppercase}
    .marco .txt{position:absolute;left:92px;right:140px;top:1090px;font-size:64px;font-weight:300;line-height:1.16;letter-spacing:-.014em}
    .marco .sub{position:absolute;left:92px;right:140px;top:1420px;font-size:30px;font-weight:300;line-height:1.5}
    .marco .marca{left:auto;right:88px;bottom:84px}
    ${cssPaleta(pal, 0.05)}
    .marco .num,.marco .txt{color:${pal.texto}} .marco .selo{color:${pal.fraco}} .marco .sub{color:${pal.meio}}`;

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css}</style></head><body>
    <div class="slide story marco">
      <div class="selo">obrigado</div>
      <div class="num">${esc(n)}</div>
      <div class="txt">pessoas olhando a arte de São Paulo com a gente.</div>
      <div class="sub">Toda quinta, a agenda da semana. Salva e manda pra quem vai com você.</div>
      <div class="marca">${MARCA_HTML}</div>
    </div></body></html>`;

  const saida = path.join(RAIZ, 'SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10));
  fs.mkdirSync(saida, { recursive: true });
  const tmp = path.join(RAIZ, '.marco-tmp.html');
  fs.writeFileSync(tmp, html, 'utf8');

  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
  });
  const page = await browser.newPage();
  page.on('pageerror', x => console.log('PAGEERROR: ' + x.message));
  await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 400));
  const out = path.join(saida, `marco-${numero}-01.png`);
  await (await page.$('.slide')).screenshot({ path: out });
  await browser.close();
  try { fs.unlinkSync(tmp); } catch {}
  console.log('OK ' + out);
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO: ' + e.message + '\n'); process.exit(1); });
}
