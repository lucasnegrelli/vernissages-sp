#!/usr/bin/env node
/* ============================================================
   editais-post.js — card de editais para o Instagram (09/11/2026)

   O público do perfil é a própria comunidade de arte: artista, curador,
   estudante. Para ela, a informação que mais salva e compartilha não é a
   mostra, é a chamada que fecha. O radar do site já lê tudo todo dia; aqui
   o que fecha primeiro vira uma peça 4:5 na mesma língua do site (papel e
   tinta, o dia do prazo gigante, título em serifa).

   Lê radar/proximos.json (escrito pelo gerar.js: sem residência com taxa,
   só com prazo, ainda aberto). Sem IA. Só fato do radar, rotulado como
   "prazo lido da fonte", e a legenda manda conferir o regulamento.

   Uso: node editais-post.js [--date=AAAA-MM-DD] [--out=pasta] [--n=4]
   Sai: editais-01.png e editais-LEGENDA.md (no formato que o publicar.js lê).
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('./direcao.js');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
const N = parseInt(flag('n', '4'), 10);
const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const W = 1080, H = 1350;

const MES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const MES_EXT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const porExtenso = iso => `${+iso.slice(8)} de ${MES_EXT[+iso.slice(5, 7) - 1]}`;

const arq = path.join(RAIZ, 'radar', 'proximos.json');
let itens = [];
try { itens = JSON.parse(fs.readFileSync(arq, 'utf8')).itens || []; } catch (e) { /* sem arquivo */ }
/* recalcula os dias contra a data pedida e tira o que já passou */
itens = itens.map(x => ({ ...x, dias: dias(hoje, x.prazo) })).filter(x => x.dias >= 0);
/* o que cabe na primeira quinzena; chamada em português e prazo conferido à mão vêm antes no empate */
const quinzena = itens.filter(x => x.dias <= 14);
/* para quem é de São Paulo, chamada daqui ou do Brasil vem antes da estrangeira; dentro disso, o prazo mais curto */
const peso = x => (x.onde === 'Exterior' ? 1 : 0);
const pick = quinzena.slice().sort((a, b) => peso(a) - peso(b) || a.prazo.localeCompare(b.prazo)).slice(0, N).sort((a, b) => a.prazo.localeCompare(b.prazo));
if (pick.length < 3) { console.log(`Sem card de editais: só ${pick.length} chamada(s) fechando em 14 dias.`); process.exit(2); }

const semana = pick.filter(x => x.dias <= 7).length >= 3;
const titulo = semana ? ['FECHAM', 'ESTA', 'SEMANA'] : ['PRÓXIMOS', 'PRAZOS'];
const kicker = semana ? 'Editais · últimos dias' : 'Editais';

const linhas = pick.map(x => {
  const d = +x.prazo.slice(8), m = MES[+x.prazo.slice(5, 7) - 1];
  const faltam = x.dias === 0 ? 'último dia' : x.dias === 1 ? 'falta 1 dia' : `faltam ${x.dias} dias`;
  const tit = x.t.length > 78 ? x.t.slice(0, 75).replace(/\s+\S*$/, '') + '…' : x.t;
  return `<div class="li"><div class="dt"><b>${d}</b><i>${m}</i></div><div class="tx"><div class="t">${esc(tit)}</div>
    <div class="o">${esc(x.cat)} · ${esc(x.onde)}${x.org ? ' · ' + esc(String(x.org).split(' · ').pop().replace(/\s*\(.*$/, '').slice(0, 34)) : ''}</div></div><div class="f ${x.dias <= 3 ? 'urg' : ''}">${faltam}</div></div>`;
}).join('');

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Regular.ttf');font-style:normal}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}
.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${D.PAPEL};color:${D.TINTA};font-family:'Switzer',sans-serif}
.cab{position:absolute;left:70px;right:70px;top:56px;height:46px;border-bottom:3px solid ${D.TINTA};display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.17em;text-transform:uppercase}
.cab span{color:${D.TERRA}}
.h{position:absolute;left:62px;top:128px;font-weight:800;text-transform:uppercase;letter-spacing:-.075em;line-height:.82;font-size:${titulo.length === 3 ? 150 : 150}px;color:${D.TERRA}}
.lista{position:absolute;left:70px;right:70px;top:${titulo.length === 3 ? 600 : 460}px}
.li{display:grid;grid-template-columns:150px 1fr 150px;gap:24px;align-items:center;border-top:2px solid ${D.TINTA};padding:20px 0 20px}
.dt b{display:block;font-weight:800;font-size:96px;line-height:.8;letter-spacing:-.07em;color:${D.TERRA}}
.dt i{display:block;font-style:normal;font-weight:800;font-size:22px;letter-spacing:.16em;margin-top:8px}
.t{font-family:'IS',serif;font-size:42px;line-height:1.02;letter-spacing:-.01em}
.o{font-weight:700;font-size:17px;letter-spacing:.12em;text-transform:uppercase;margin-top:9px;color:#6f6a60}
.f{text-align:right;font-weight:800;font-size:19px;letter-spacing:.1em;text-transform:uppercase;color:#6f6a60}.f.urg{color:${D.TERRA}}
.rod{position:absolute;left:70px;right:70px;bottom:50px;display:flex;justify-content:space-between;align-items:flex-end;font-weight:800;font-size:20px;letter-spacing:.14em;text-transform:uppercase}
.rod small{display:block;font-weight:500;font-size:17px;letter-spacing:.08em;color:#6f6a60;margin-top:6px;text-transform:none}
</style><body><div class="slide">
<div class="cab"><b>Vernissages SP</b><span>${esc(kicker)}</span></div>
<div class="h">${titulo.map(l => '<div>' + l + '</div>').join('')}</div>
<div class="lista">${linhas}</div>
<div class="rod"><div>Todos em vernissagessp.com.br/editais<small>Prazo lido da fonte. Confira sempre o regulamento oficial.</small></div></div>
</div></body>`;

function legenda() {
  const abre = semana
    ? `${pick.length} editais, chamadas e prêmios para artistas fecham nesta semana. Salva para não perder o prazo.`
    : `Os próximos prazos de editais, chamadas e prêmios para artistas visuais.`;
  const l = pick.map((x, i) => `${i + 1}. ${x.t}\n   ${x.cat} · ${x.onde}${x.org ? ' · ' + String(x.org).split(' · ').pop() : ''}. Até ${porExtenso(x.prazo)}${x.dias <= 1 ? (x.dias === 0 ? ' (hoje)' : ' (amanhã)') : ''}.`).join('\n\n');
  return `${abre}\n\n${l}\n\nOs prazos vêm das páginas de cada chamada. Confira o regulamento oficial antes de se inscrever, porque prorrogação é comum. A lista completa, com residências, bolsas e prêmios, está em vernissagessp.com.br/editais.\n\nManda para quem está de olho em edital.\n\n#editaisdearte #chamadaaberta #artistasvisuais #arteemsp #editalcultural #residenciaartistica #artecontemporanea`;
}

(async () => {
  console.log(`EDITAIS ${hoje} · ${pick.length} chamada(s)`);
  pick.forEach(x => console.log(`  ${x.prazo} (${x.dias} d) ${x.t.slice(0, 70)}`));
  if (argv.includes('--seco')) { console.log('\n' + legenda()); return; }
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const tmp = path.join(RAIZ, '.editais-post.html');
  fs.writeFileSync(tmp, html);
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await browser.newPage();
  await p.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 400));
  fs.mkdirSync(out, { recursive: true });
  const el = await p.$('.slide');
  await el.screenshot({ path: path.join(out, 'editais-01.png') });
  await browser.close(); fs.rmSync(tmp, { force: true });
  fs.writeFileSync(path.join(out, 'editais-LEGENDA.md'), legenda() + '\n');
  console.log(`OK ${path.join(out, 'editais-01.png')}`);
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
