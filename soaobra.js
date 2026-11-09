#!/usr/bin/env node
/* ============================================================
   soaobra.js — carrossel "Só a obra" (09/11/2026)

   Cinco obras de cinco exposições em cartaz, cada uma preenchendo o slide
   inteiro, sem uma palavra por cima. O sexto slide é a legenda de parede de
   todas: número, título, artista, casa, bairro, data. Nenhum texto sobre
   obra (regra da casa). Sem IA: a escolha é regra.

   Regras de escolha: foto que ainda não saiu no feed (exigirObra, com a foto
   extra quando a principal já saiu), >= 1400 px, formato que aguenta o corte
   4:5, uma casa por obra, as que fecham primeiro entram antes.

   Uso: node soaobra.js [--date=AAAA-MM-DD] [--out=pasta] [--n=5] [--seco]
   Sai: soaobra-01..N.png e soaobra-LEGENDA.md
   ============================================================ */
'use strict';
process.env.VSP_FOTOS_LIVRE = '';
const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const D = require('./direcao.js');
const { carregarDados, exigirObra, marcarFoto, medir, RAIZ, esc, porExtenso, arroba, tituloCurto, autoria } = base;

const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
const N = parseInt(flag('n', '5'), 10);
const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const W = 1080, H = 1350;
const dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);

(async () => {
  const DATA = carregarDados();
  const V = Object.fromEntries(DATA.venues.map(v => [v.name, v]));
  const cands = [];
  for (const e of DATA.expos) {
    if (!e.img || !V[e.v] || e.cartaz) continue;
    if (!(e.ini <= hoje && (!e.fim || e.fim >= hoje))) continue;
    let rel, dim;
    try { rel = exigirObra(e, { recusarVista: true }); dim = await medir(rel); } catch (x) { continue; }
    const ar = dim.w / dim.h;
    if (dim.w < 1400 || ar < 0.55 || ar > 1.6) continue;
    cands.push({ e, v: V[e.v], rel, dim, falta: e.fim ? dias(hoje, e.fim) : 999, cred: e.cred });
  }
  cands.sort((a, b) => a.falta - b.falta);
  const casas = new Set(), pick = [];
  for (const c of cands) { if (casas.has(c.v.name)) continue; casas.add(c.v.name); pick.push(c); if (pick.length === N) break; }
  console.log(`SÓ A OBRA ${hoje} · ${pick.length} obra(s) de ${cands.length} candidata(s)`);
  pick.forEach((c, i) => { console.log(`  ${i + 1}. ${tituloCurto(c.e)} · ${c.v.name} · ${c.dim.w}x${c.dim.h}`); console.log(`PICK ${c.e.t}|${c.e.v}`); });
  if (pick.length < N) { console.log('Poucas obras frescas: sem carrossel hoje.'); process.exit(2); }
  if (argv.includes('--seco')) return;

  const slides = pick.map(c => `<div class="slide obra"><img src="${esc(c.rel)}" style="object-position:${typeof c.e.foco === 'number' ? c.e.foco : 50}% 50%"></div>`).join('');
  const lista = pick.map((c, i) => {
    const q = autoria(c.e);
    return `<div class="li"><b>${i + 1}</b><div><div class="t">${esc(tituloCurto(c.e))}</div>${q ? `<div class="q">${esc(q.length > 60 ? q.slice(0, 57).replace(/\s+\S*$/, '') + '…' : q)}</div>` : ''}<div class="o">${esc(c.v.name)} · ${esc(c.v.b)}${c.e.fim ? ' · até ' + String(+c.e.fim.slice(8)).padStart(2, '0') + '.' + c.e.fim.slice(5, 7) : ''}</div></div></div>`;
  }).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${D.PAPEL};color:${D.TINTA};font-family:'Switzer',sans-serif}
.slide.obra{background:#000}.slide.obra img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.cab{position:absolute;left:70px;right:70px;top:56px;height:46px;border-bottom:3px solid ${D.TINTA};display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.17em;text-transform:uppercase}.cab span{color:${D.TERRA}}
.l{position:absolute;left:70px;right:70px;top:130px}
.li{display:grid;grid-template-columns:96px 1fr;border-top:2px solid ${D.TINTA};padding:24px 0 22px}
.li b{font-weight:800;font-size:76px;line-height:.9;letter-spacing:-.06em;color:${D.TERRA}}
.li .t{font-weight:800;text-transform:uppercase;letter-spacing:-.025em;font-size:40px;line-height:1}
.li .q{font-family:'IS',serif;font-style:italic;font-size:38px;line-height:1.05;margin-top:5px}
.li .o{font-weight:700;font-size:18px;letter-spacing:.11em;text-transform:uppercase;color:#6f6a60;margin-top:8px}
.fim{position:absolute;left:70px;right:70px;bottom:48px;font-weight:800;font-size:19px;letter-spacing:.13em;text-transform:uppercase;display:flex;justify-content:space-between}
.fim span:last-child{color:#9a948a;font-weight:500;letter-spacing:.06em;text-transform:none;font-size:16px;text-align:right;max-width:560px}
</style><body>${slides}<div class="slide"><div class="cab"><b>Vernissages SP</b><span>Só a obra</span></div><div class="l">${lista}</div><div class="fim"><span>Salva para ir</span><span>Imagens: cortesia das casas e dos artistas</span></div></div></body>`;

  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const tmp = path.join(RAIZ, '.soaobra.html'); fs.writeFileSync(tmp, html);
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await browser.newPage(); await p.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 500));
  fs.mkdirSync(out, { recursive: true });
  const els = await p.$$('.slide');
  for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(out, `soaobra-${String(i + 1).padStart(2, '0')}.png`) });
  await browser.close(); fs.rmSync(tmp, { force: true });

  const leg = `Só a obra. Cinco exposições em cartaz em São Paulo, uma imagem por slide, sem texto por cima. No último slide, a legenda de parede.\n\n` +
    pick.map((c, i) => `${i + 1}. ${tituloCurto(c.e)}${autoria(c.e) ? ', ' + autoria(c.e) : ''}\n   ${(c.v.name + ' ' + arroba(c.v.ig)).trim()}, ${c.v.b}${c.e.fim ? ' · até ' + porExtenso(c.e.fim) : ''}`).join('\n\n') +
    `\n\nImagens: ${pick.map(c => c.cred).filter(Boolean).join('; ')}.\n\nSalva para ir e manda para quem vai com você. Agenda completa de exposições em vernissagessp.com.br\n\n#exposicaosp #arteemsp #saopaulo #artecontemporanea #galeriadearte #artesvisuais`;
  fs.writeFileSync(path.join(out, 'soaobra-LEGENDA.md'), leg.replace(/ — /g, ': ') + '\n');
  const dataPub = flag('date', hoje); pick.forEach(c => marcarFoto(c.rel, dataPub));
  console.log(`OK ${els.length} slides em ${path.relative(RAIZ, out)} · legenda ${leg.length} caracteres`);
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
