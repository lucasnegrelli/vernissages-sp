#!/usr/bin/env node
/* ============================================================
   panoramica.js — uma imagem que continua no slide seguinte (09/11/2026)

   Carrossel contínuo: a obra (ou a vista da exposição) é uma faixa larga cortada
   em 2 a 4 pedaços de 1080x1350. Ao deslizar, o pedaço seguinte completa a
   imagem. O olho entende que há mais, e a pessoa desliza. Nenhum texto sobre a
   imagem; o último slide é a legenda de parede.

   O trabalho é feito numa tela única (N x 1080 de largura): tira a margem lisa
   da imagem, escolhe N pela proporção, centraliza na tela e preenche o resto com
   a cor da própria borda da imagem (parede branca, papel, fundo escuro), então a
   emenda entre os slides some.

   Uso: node panoramica.js "Título" [--casa=...] [--img=0] [--n=3] [--trim=30]
                           [--out=pasta] [--pub=AAAA-MM-DD] [--seco]
   Sai: panoramica-01..N.png (pedaços), o último é a ficha, e panoramica-LEGENDA.md
   ============================================================ */
'use strict';
const { semTravessao } = require('./copy.js');
const fs = require('fs');
const os = require('os');
const path = require('path');
const base = require('./rima.js');
const D = require('./direcao.js');
const { carregarDados, RAIZ, esc, porExtenso, arroba, tituloCurto, autoria, marcarFoto } = base;

const argv = process.argv.slice(2);
const alvo = argv.find(a => !a.startsWith('--'));
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
if (!alvo) { console.error('uso: node panoramica.js "Título" [--img=0] [--n=3]'); process.exit(1); }
const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const W = 1080, H = 1350;
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

(async () => {
  const sharp = require(path.join(REND, 'node_modules', 'sharp'));
  const DATA = carregarDados();
  const casa = flag('casa', null);
  const e = DATA.expos.find(x => norm(x.t).includes(norm(alvo)) && (!casa || norm(x.v).includes(norm(casa))));
  if (!e) throw new Error('mostra não encontrada: ' + alvo);
  const v = DATA.venues.find(x => x.name === e.v) || {};
  const campo = ['img', 'img2', 'img3'][parseInt(flag('img', '0'), 10)] || 'img';
  const rel = e[campo];
  if (!rel) throw new Error('a mostra não tem ' + campo);
  const arq = path.join(RAIZ, rel);

  /* 1. tira a margem lisa (parede, papel) */
  let buf = await sharp(arq).rotate().toBuffer();
  const m0 = await sharp(buf).metadata();
  const th = parseInt(flag('trim', '30'), 10);
  if (th > 0) {
    try { const t = await sharp(buf).trim({ threshold: th }).toBuffer({ resolveWithObject: true }); if (t.info.width * t.info.height >= m0.width * m0.height * 0.2) buf = t.data; } catch (x) { /* sem trim */ }
  }
  const m = await sharp(buf).metadata(), ar = m.width / m.height;
  /* 2. N pela proporção: a faixa precisa ocupar bem a largura de N slides */
  const n = parseInt(flag('n', ''), 10) || Math.max(2, Math.min(4, Math.round(ar * H / W)));
  const TW = n * W;
  /* 3. escala: cabe na tela N x 1 sem cortar, e cresce até tocar um dos lados */
  const esc1 = Math.min(TW / m.width, H / m.height);
  const iw = Math.round(m.width * esc1), ih = Math.round(m.height * esc1);
  /* cor da borda da própria imagem para preencher a tela (emenda invisível) */
  /* a emenda só some se a tela tem a cor EXATA do fundo da imagem: média de quatro cantos de 6x6 px, no tamanho original */
  let r = 0, g = 0, b = 0, c = 0;
  for (const [x, y] of [[0, 0], [m.width - 6, 0], [0, m.height - 6], [m.width - 6, m.height - 6]]) {
    const q = await sharp(buf).extract({ left: Math.max(0, x), top: Math.max(0, y), width: 6, height: 6 }).raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < q.data.length; i += q.info.channels) { r += q.data[i]; g += q.data[i + 1]; b += q.data[i + 2]; c++; }
  }
  const fundo = flag('bg', null) ? D.hex2rgb(flag('bg')) : [r / c, g / c, b / c].map(Math.round);
  console.log(`${e.t} · ${e.v} · imagem ${m.width}x${m.height} (ar ${ar.toFixed(2)}) -> ${n} slides, tela ${TW}x${H}, fundo rgb(${fundo})${esc1 > 1.25 ? ' · AVISO: ampliada ' + esc1.toFixed(2) + 'x' : ''}`);
  if (argv.includes('--seco')) return;
  const tela = await sharp({ create: { width: TW, height: H, channels: 3, background: { r: fundo[0], g: fundo[1], b: fundo[2] } } })
    .composite([{ input: await sharp(buf).resize(iw, ih).toBuffer(), left: Math.round((TW - iw) / 2), top: Math.round((H - ih) / 2) }]).png().toBuffer();
  const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
  fs.mkdirSync(out, { recursive: true });
  for (let i = 0; i < n; i++) await sharp(tela).extract({ left: i * W, top: 0, width: W, height: H }).png().toFile(path.join(out, `panoramica-${String(i + 1).padStart(2, '0')}.png`));

  /* 4. ficha (legenda de parede) */
  const quem = autoria(e), nt = tituloCurto(e).length, tam = nt <= 14 ? 120 : nt <= 24 ? 96 : nt <= 36 ? 78 : nt <= 52 ? 64 : 54;
  const credTxt = e.cred && /cortesia/i.test(e.cred) ? e.cred : 'cortesia ' + e.v + (e.cred ? '. ' + e.cred : '');
  const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}.slide{position:relative;width:${W}px;height:${H}px;background:${D.PAPEL};color:${D.TINTA};font-family:'Switzer',sans-serif;overflow:hidden}
.cab{position:absolute;left:70px;right:70px;top:56px;height:46px;border-bottom:3px solid ${D.TINTA};display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.17em;text-transform:uppercase}.cab span{color:${D.TERRA}}
.c{position:absolute;left:70px;right:70px;top:150px;bottom:130px;display:flex;flex-direction:column;justify-content:center}
.tit{font-weight:800;text-transform:uppercase;letter-spacing:-.04em;line-height:.9;font-size:${tam}px;color:${D.TERRA}}
.q{font-family:'IS',serif;font-style:italic;font-size:60px;line-height:1.04;margin-top:22px}
.sv{margin-top:44px}.sv .l{display:flex;gap:26px;border-top:2px solid ${D.TINTA};padding:16px 0 12px;align-items:baseline}
.sv i{font-style:normal;font-weight:800;font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:${D.TERRA};min-width:170px}.sv span{font-family:'IS',serif;font-size:42px;line-height:1.05}
.cred{position:absolute;left:70px;right:70px;bottom:46px;font-size:17px;font-weight:500;color:#9a948a}
</style><body><div class="slide"><div class="cab"><b>Vernissages SP</b><span>Em continuação</span></div><div class="c">
<div class="tit">${esc(tituloCurto(e))}</div>${quem ? `<div class="q">${esc(quem)}</div>` : ''}
<div class="sv"><div class="l"><i>Onde</i><span>${esc(e.v)}${v.addr ? ', ' + esc(v.addr) : ''}</span></div><div class="l"><i>Bairro</i><span>${esc(v.b || '')}</span></div><div class="l"><i>Quando</i><span>${e.fim ? 'até ' + esc(porExtenso(e.fim)) : 'desde ' + esc(porExtenso(e.ini))}</span></div>${v.ing && v.ing.g ? '<div class="l"><i>Entrada</i><span>Gratuita</span></div>' : ''}</div></div>
<div class="cred">Imagem: ${esc(credTxt)}</div></div></body>`;
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const arqHtml = path.join(RAIZ, '.panoramica.html'); fs.writeFileSync(arqHtml, html);
  const br = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await br.newPage(); await p.goto('file:///' + arqHtml.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready); await new Promise(r2 => setTimeout(r2, 400));
  await (await p.$('.slide')).screenshot({ path: path.join(out, `panoramica-${String(n + 1).padStart(2, '0')}.png`) });
  await br.close(); fs.rmSync(arqHtml, { force: true });

  const leg = `${tituloCurto(e)}${quem ? ', ' + quem : ''}, em ${n} partes. Deslize: a imagem continua no slide seguinte.\n\n${e.d ? e.d + '\n\n' : ''}Serviço: ${e.v} ${arroba(v.ig)}, ${v.addr ? v.addr + ', ' : ''}${v.b || ''}. ${e.fim ? 'Até ' + porExtenso(e.fim) + '.' : 'Aberta desde ' + porExtenso(e.ini) + '.'}${v.ing && v.ing.g ? ' Entrada gratuita.' : ''}\n\nImagem: ${credTxt}.\n\nSalva para ir e manda para quem vai com você. Agenda completa de exposições em vernissagessp.com.br\n\n#exposicaosp #arteemsp #saopaulo #artecontemporanea #galeriadearte`;
  fs.writeFileSync(path.join(out, 'panoramica-LEGENDA.md'), semTravessao(leg) + '\n');
  marcarFoto(rel, flag('pub', hoje));
  console.log(`OK ${n + 1} slides em ${path.relative(RAIZ, out)}`);
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
