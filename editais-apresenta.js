#!/usr/bin/env node
/* ============================================================
   editais-apresenta.js — carrossel que APRESENTA a aba de Editais (09/11/2026)

   O perfil nunca contou que o site tem uma página de editais. Antes de postar
   prazo que fecha, é preciso dizer que ela existe, o que tem, de onde vem e
   como ler. 5 slides 4:5, mesma língua do site. Só fato (número lido de
   radar/resumo.json), sem IA.

   Uso: node editais-apresenta.js [--out=pasta]   ->  editais-01..05.png + editais-LEGENDA.md
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('./direcao.js');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const W = 1080, H = 1350;
let abertos = 40;
try { abertos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'radar', 'resumo.json'), 'utf8')).abertos || abertos; } catch (e) { /* mantém */ }

const slides = [
  { k: 'Novo no site', h: `<div class="gg">EDITAIS</div><div class="sub">Uma aba nova no Vernissages SP: tudo o que está aberto para artista, num lugar só.</div><div class="seta">arrasta para ver</div>` },
  { k: 'O que tem lá', h: `<div class="num">${abertos}</div><div class="rot">oportunidades abertas hoje</div>
    <ul class="lst"><li>Editais de fomento</li><li>Chamadas de galerias e museus</li><li>Prêmios</li><li>Bolsas</li><li>Residências</li></ul>` },
  { k: 'Como funciona', h: `<div class="gg">TODO<br>DIA</div><div class="sub">O site lê as páginas de quem abre a chamada e os sites de arte, e põe o prazo na ordem: o que fecha primeiro vem primeiro.</div>
    <div class="fon">Pivô · Tomie Ohtake · FAAP · Funarte · Prêmio PIPA · Dasartes · seLecT · ArteBrasileiros · Sesc SP · Res Artis · apoio.art</div>` },
  { k: 'O que separamos', h: `<div class="gg">QUEM<br>PAGA</div><div class="sub">Residência em que o artista é quem paga a estadia e o ateliê ganha seção própria, com o valor lido da página. Não é edital, e você merece saber antes de se inscrever.</div>` },
  { k: 'Onde achar', h: `<div class="url">vernissagessp<br>.com.br<br>/editais</div><div class="sub">Link na bio. O prazo vem da fonte: confira sempre o regulamento oficial, porque prorrogação é comum.</div><div class="seta">salva e manda para quem está de olho em edital</div>` },
];

const css = `
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Regular.ttf');font-style:normal}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}
.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${D.PAPEL};color:${D.TINTA};font-family:'Switzer',sans-serif}
.cab{position:absolute;left:70px;right:70px;top:56px;height:46px;border-bottom:3px solid ${D.TINTA};display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.17em;text-transform:uppercase}
.cab span{color:${D.TERRA}}
.c{position:absolute;left:62px;right:70px;top:150px;bottom:130px;display:flex;flex-direction:column;justify-content:center}
.gg{font-weight:800;text-transform:uppercase;letter-spacing:-.075em;line-height:.82;font-size:270px;color:${D.TERRA};margin-left:-6px}
.num{font-weight:800;font-size:520px;line-height:.8;letter-spacing:-.09em;color:${D.TERRA};margin-left:-10px}
.rot{font-weight:800;font-size:34px;letter-spacing:.16em;text-transform:uppercase;margin:26px 0 40px 8px}
.sub{font-family:'IS',serif;font-size:62px;line-height:1.05;margin:46px 8px 0 8px;max-width:900px}
.lst{list-style:none;margin-left:8px}.lst li{font-family:'IS',serif;font-size:56px;line-height:1.1;border-top:2px solid ${D.TINTA};padding:12px 0 8px}
.fon{margin:40px 8px 0;font-weight:700;font-size:23px;letter-spacing:.1em;text-transform:uppercase;line-height:1.6;color:#6f6a60}
.url{font-weight:800;font-size:128px;line-height:.9;letter-spacing:-.06em;color:${D.TERRA};margin-left:-4px}
.seta{position:absolute;left:70px;right:70px;bottom:50px;font-weight:800;font-size:22px;letter-spacing:.14em;text-transform:uppercase}
.pag{position:absolute;right:70px;bottom:50px;font-weight:800;font-size:22px;letter-spacing:.14em;color:#9a948a}
`;
const html = `<!doctype html><meta charset="utf-8"><style>${css}</style><body>` + slides.map((s, i) =>
  `<div class="slide"><div class="cab"><b>Vernissages SP</b><span>${s.k}</span></div><div class="c">${s.h}</div><div class="pag">${i + 1}/${slides.length}</div></div>`).join('') + '</body>';

const legenda = `O Vernissages SP agora tem uma aba de editais.

Todo dia o site lê as páginas de quem abre chamada (Pivô, Tomie Ohtake, FAAP, Funarte, Prêmio PIPA e outras) e reúne num lugar só o que está aberto para artista: editais de fomento, chamadas de galerias e museus, prêmios, bolsas e residências. São ${abertos} oportunidades abertas hoje, com o prazo que fecha primeiro no começo.

Uma coisa a gente faz diferente: residência em que o artista paga a estadia e o ateliê fica numa seção separada, com o valor lido da própria página. Não é edital, e vale saber antes de se inscrever.

O prazo vem da fonte. Confira sempre o regulamento oficial, porque prorrogação é comum.

Está no link da bio: vernissagessp.com.br/editais

Salva e manda para quem está de olho em edital.

#editaisdearte #chamadaaberta #artistasvisuais #arteemsp #editalcultural #residenciaartistica #artecontemporanea`;

(async () => {
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const tmp = path.join(RAIZ, '.editais-apresenta.html');
  fs.writeFileSync(tmp, html);
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await browser.newPage();
  await p.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 400));
  fs.mkdirSync(out, { recursive: true });
  const els = await p.$$('.slide');
  for (let i = 0; i < els.length; i++) { const f = path.join(out, `editais-${String(i + 1).padStart(2, '0')}.png`); await els[i].screenshot({ path: f }); console.log('OK ' + f); }
  await browser.close(); fs.rmSync(tmp, { force: true });
  fs.writeFileSync(path.join(out, 'editais-LEGENDA.md'), legenda + '\n');
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
