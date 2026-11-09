#!/usr/bin/env node
/* ============================================================
   carrossel.js — carrossel profundo "A fundo" (09/11/2026)

   Uma mostra, 8 a 10 slides, com tese e argumento. O TEXTO é escrito por
   gente (aqui, por mim na conversa, a partir do campo `d` da base e de fato
   conferido); este script só diagrama, na língua do site. Nada de IA em
   automação: o spec é um JSON em carrosseis/.

   Tipos de slide:
     hook   { texto, kicker? }              frase gigante em caixa-alta
     obra   { img }                          obra em tela cheia, NADA por cima
     numero { n, rotulo, texto }             número gigante + frase em serifa
     tese   { texto, kicker? }               frase em serifa, grande
     lista  { titulo, itens:[...] }          linhas com filete
     serv   { linhas:[[rotulo, valor]...], credito, cta }

   Uso: node carrossel.js carrosseis/fernando-lemos.json [--out=SOCIAL/11/11] [--seco]
   Sai: A-FUNDO-01..N.png e carrossel-LEGENDA.md (formato que o publicar.js lê).
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('./direcao.js');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const specArq = argv.find(a => !a.startsWith('--'));
if (!specArq) { console.error('uso: node carrossel.js carrosseis/arquivo.json [--out=pasta]'); process.exit(1); }
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const spec = JSON.parse(fs.readFileSync(path.resolve(RAIZ, specArq), 'utf8'));
const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', spec.data.slice(5, 7), spec.data.slice(8, 10))));
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const W = 1080, H = 1350;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ac = spec.acento || D.TERRA;

/* proibições da casa, conferidas no texto antes de renderizar */
const textos = JSON.stringify(spec.slides) + spec.legenda;
if (/[—–]/.test(textos.replace(/\d+[–-]\d+/g, ''))) throw new Error('travessão no texto: a casa não usa (ESTILO.md)');
if (/!/.test(textos)) throw new Error('exclamação no texto: a casa não usa');
if (spec.legenda.length > 2000) throw new Error('legenda passa de 2000 caracteres: ' + spec.legenda.length);

const hookTam = t => { const n = t.length; return n <= 24 ? 190 : n <= 40 ? 150 : n <= 64 ? 122 : 100; };
const N = spec.slides.length;
function slide(s, i) {
  const pag = `<div class="pag">${i + 1}/${N}</div>`;
  const cab = k => `<div class="cab"><b>Vernissages SP</b><span>${esc(k || spec.serie)}</span></div>`;
  if (s.tipo === 'obra') return `<div class="slide obra"><img src="${esc(s.img)}" style="object-position:${s.foco || 50}% 50%"></div>`;
  if (s.tipo === 'hook') return `<div class="slide">${cab(s.kicker)}<div class="c"><div class="hk" style="font-size:${hookTam(s.texto)}px">${esc(s.texto)}</div></div><div class="seta">arrasta para ler</div>${pag}</div>`;
  if (s.tipo === 'numero') return `<div class="slide">${cab(s.kicker)}<div class="c"><div class="num">${esc(s.n)}</div><div class="rot">${esc(s.rotulo)}</div><div class="sub">${esc(s.texto)}</div></div>${pag}</div>`;
  if (s.tipo === 'tese') return `<div class="slide">${cab(s.kicker)}<div class="c"><div class="tz">${esc(s.texto)}</div></div>${pag}</div>`;
  if (s.tipo === 'lista') return `<div class="slide">${cab(s.kicker)}<div class="c"><div class="rot" style="margin-top:0">${esc(s.titulo)}</div><ul class="lst">${s.itens.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>${pag}</div>`;
  if (s.tipo === 'serv') return `<div class="slide">${cab(s.kicker || 'Para ir')}<div class="c"><div class="sv">${s.linhas.map(([r, v]) => `<div class="l"><i>${esc(r)}</i><span>${esc(v)}</span></div>`).join('')}</div><div class="sub" style="font-size:54px;margin-top:40px">${esc(s.cta || '')}</div></div>${s.credito ? `<div class="cred">${esc(s.credito)}</div>` : ''}${pag}</div>`;
  throw new Error('tipo desconhecido: ' + s.tipo);
}

const css = `
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Regular.ttf');font-style:normal}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}
.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${D.PAPEL};color:${D.TINTA};font-family:'Switzer',sans-serif}
.slide.obra{background:#000}.slide.obra img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.cab{position:absolute;left:70px;right:70px;top:56px;height:46px;border-bottom:3px solid ${D.TINTA};display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.17em;text-transform:uppercase}
.cab span{color:${ac}}
.c{position:absolute;left:62px;right:70px;top:150px;bottom:130px;display:flex;flex-direction:column;justify-content:center}
.hk{font-weight:800;text-transform:uppercase;letter-spacing:-.06em;line-height:.88;margin-left:-4px}
.num{font-weight:800;font-size:420px;line-height:.8;letter-spacing:-.09em;color:${ac};margin-left:-8px}
.rot{font-weight:800;font-size:32px;letter-spacing:.16em;text-transform:uppercase;margin:28px 0 0 8px}
.sub{font-family:'IS',serif;font-size:62px;line-height:1.05;margin:40px 8px 0 8px;max-width:920px}
.tz{font-family:'IS',serif;font-size:88px;line-height:1.02;letter-spacing:-.01em;margin:0 8px;border-top:3px solid ${D.TINTA};padding-top:34px}
.lst{list-style:none;margin:34px 8px 0}.lst li{font-family:'IS',serif;font-size:56px;line-height:1.1;border-top:2px solid ${D.TINTA};padding:12px 0 8px}
.sv{margin:0 8px}.sv .l{display:flex;gap:26px;border-top:2px solid ${D.TINTA};padding:20px 0 16px;align-items:baseline}
.sv i{font-style:normal;font-weight:800;font-size:22px;letter-spacing:.16em;text-transform:uppercase;color:${ac};min-width:200px}
.sv span{font-family:'IS',serif;font-size:50px;line-height:1.05}
.seta{position:absolute;left:70px;bottom:50px;font-weight:800;font-size:22px;letter-spacing:.14em;text-transform:uppercase}
.pag{position:absolute;right:70px;bottom:50px;font-weight:800;font-size:22px;letter-spacing:.14em;color:#9a948a}
.cred{position:absolute;left:70px;right:200px;bottom:48px;font-size:17px;font-weight:500;color:#9a948a;line-height:1.35}
`;
const html = `<!doctype html><meta charset="utf-8"><style>${css}</style><body>${spec.slides.map(slide).join('')}</body>`;

(async () => {
  console.log(`CARROSSEL ${spec.serie} · ${N} slides · legenda ${spec.legenda.length} caracteres`);
  if (argv.includes('--seco')) return;
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const tmp = path.join(RAIZ, '.carrossel.html');
  fs.writeFileSync(tmp, html);
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await browser.newPage();
  await p.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 500));
  fs.mkdirSync(out, { recursive: true });
  const els = await p.$$('.slide');
  for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(out, `afundo-${String(i + 1).padStart(2, '0')}.png`) });
  await browser.close(); fs.rmSync(tmp, { force: true });
  fs.writeFileSync(path.join(out, 'afundo-LEGENDA.md'), spec.legenda + '\n');
  console.log(`OK ${els.length} slides em ${path.relative(RAIZ, out)}`);
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
