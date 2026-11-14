#!/usr/bin/env node
/* ============================================================
   raio-x.js: série "RAIO X", o retrato da cidade em dados (14/11/2026)

   Dado que só o Vernissages tem: a base lê as casas todo dia, então sabe onde as
   exposições estão, quantas fecham, quanto da cidade fica em poucos bairros.
   Sem IA e sem texto inventado: todo número sai da base (dados.js) e a frase
   da capa é montada por regra. Quinzenal. Feito para ser mandado a um amigo
   ("olha onde está a arte da cidade").

   Slides (1080x1350, linguagem do site: logo com textura de obra, papel e tinta):
     1 capa: "N em cada 10 exposições de SP estão em K bairros."
     2 os bairros, em barras
     3 as zonas (com a ressalva de cobertura)
     4 quem fecha em 7 dias
     5 chamada para salvar e para o mapa

   Uso: node raio-x.js [--date=AAAA-MM-DD] [--out=pasta]
   Sai: raio-x-01..05.png e raio-x-LEGENDA.md
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const base = require('./rima.js');
const D = require('./direcao.js');
const { semTravessao, lint } = require('./copy.js');
const { RAIZ, carregarDados, porExtenso, tituloCurto } = base;
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
const REND = path.join(RAIZ, '.render');
const W = 1080, H = 1350;
const U = x => x.split(path.sep).join('/');
const E = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const soma = d => new Date(Date.parse(d + 'T12:00:00Z') + 7 * 864e5).toISOString().slice(0, 10);

function dados() {
  const DATA = carregarDados();
  const V = Object.fromEntries(DATA.venues.map(v => [v.name, v]));
  const em = DATA.expos.filter(e => e.ini <= hoje && (!e.fim || e.fim >= hoje));
  const conta = f => { const m = {}; em.forEach(e => { const k = f(V[e.v] || {}) || 'sem bairro'; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const bairros = conta(v => v.b), zonas = conta(v => v.z);
  const topN = 6, top = bairros.slice(0, topN), nTop = top.reduce((s, x) => s + x[1], 0);
  const emDez = Math.round(10 * nTop / em.length);
  const fecha = em.filter(e => e.fim && e.fim <= soma(hoje)).sort((a, b) => a.fim.localeCompare(b.fim));
  const casas = new Set(em.map(e => e.v)).size;
  return { em, casas, bairros, top, nTop, emDez, zonas, fecha, V, DATA };
}

(async () => {
  const d = dados();
  const sharp = require(path.join(REND, 'node_modules', 'sharp'));
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
  fs.mkdirSync(out, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'raiox-'));
  /* textura do logo: a obra em destaque no site, escurecida no papel */
  const foco = d.DATA.foco && d.DATA.foco.t ? d.DATA.expos.find(e => e.t === d.DATA.foco.t && e.img) : null;
  const srcTex = path.resolve(RAIZ, (foco || d.em.find(e => e.img)).img);
  const rgb = await D.corDaObra(sharp, srcTex), pal = D.paletaDaCor(rgb);
  const tex = (b) => sharp(srcTex).rotate().resize({ width: 1600, withoutEnlargement: true }).modulate({ brightness: b, saturation: 1.3 }).jpeg({ quality: 85 });
  await tex(0.6).toFile(path.join(tmp, 'papel.jpg')); await tex(1.1).toFile(path.join(tmp, 'tinta.jpg'));
  const logo = f => `<div class="logo" style="background-image:url('file:///${U(path.join(tmp, f + '.jpg'))}')">VERNISSAGES SP</div><div class="fio"></div>`;
  const rod = (n, rot) => `<div class="r"><span>${rot}</span><span>${n} / 5</span></div>`;
  const maxB = d.top[0][1];
  const barras = d.top.map(([b, n]) => `<div class="b"><span class="n">${E(b)}</span><span class="t"><i style="width:${Math.round(100 * n / maxB)}%"></i></span><b>${n}</b></div>`).join('');
  const maxZ = d.zonas[0][1];
  const zonas = ['Oeste', 'Centro', 'Sul', 'Leste', 'Norte'].map(z => { const n = (d.zonas.find(x => x[0] === z) || [z, 0])[1]; return `<div class="b"><span class="n">${z}</span><span class="t"><i style="width:${Math.round(100 * n / maxZ)}%"></i></span><b>${n}</b></div>`; }).join('');
  const lista = d.fecha.slice(0, 8).map(e => { const dt = e.fim.split('-'); return `<div class="f"><b>${dt[2]}/${dt[1]}</b><span>${E(tituloCurto(e))}</span><small>${E(e.v)}</small></div>`; }).join('');
  const slides = [
    `<div class="s papel" id="s0">${logo('papel')}<div class="g" data-max="230"><div>${d.emDez} em cada 10</div><div>exposições de</div><div>São Paulo estão</div><div>em ${d.top.length} bairros.</div></div><div class="c">Raio X: ${d.em.length} exposições em cartaz hoje, em ${d.casas} casas.</div>${rod(1, 'Raio X')}</div>`,
    `<div class="s tinta" id="s1">${logo('tinta')}<div class="h">Os ${d.top.length} bairros</div><div class="bar">${barras}</div><div class="c">Exposições em cartaz hoje, por bairro, entre as ${d.em.length} que a base acompanha.</div>${rod(2, 'Raio X')}</div>`,
    `<div class="s papel" id="s2">${logo('papel')}<div class="h">E as zonas</div><div class="bar">${zonas}</div><div class="c">Só conta o que foi mapeado. Faltam espaços de fora do circuito das galerias. Se falta um perto de você, manda o nome.</div>${rod(3, 'Raio X')}</div>`,
    `<div class="s tinta" id="s3">${logo('tinta')}<div class="h">Fecha em 7 dias</div><div class="lista">${lista}</div>${rod(4, 'Raio X')}</div>`,
    `<div class="s papel" id="s4">${logo('papel')}<div class="g" data-max="250"><div>Salva.</div><div>Manda.</div><div>Vai.</div></div><div class="c">O mapa completo, com filtro por bairro e por exposição grátis, está em vernissagessp.com.br</div>${rod(5, '@vernissagessp')}</div>`,
  ];
  const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}
.s{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:Switzer,sans-serif}
.s.papel{background:${D.PAPEL};color:${D.TINTA}}.s.tinta{background:#0E0E0E;color:${D.PAPEL}}
.logo{position:absolute;left:40px;top:34px;font-weight:800;letter-spacing:-.06em;line-height:.8;white-space:nowrap;background-position:center 45%;background-size:cover;-webkit-background-clip:text;color:transparent}
.fio{position:absolute;left:40px;right:40px;top:186px;border-top:4px solid currentColor}
.g{position:absolute;left:36px;right:36px;top:330px;font-weight:800;text-transform:uppercase;letter-spacing:-.055em;line-height:.88}
.g>div{white-space:nowrap}
.h{position:absolute;left:40px;right:40px;top:250px;font-weight:800;text-transform:uppercase;letter-spacing:-.05em;line-height:.9;font-size:120px}
.c{position:absolute;left:40px;right:90px;bottom:150px;font-size:38px;line-height:1.24;font-weight:500;letter-spacing:-.01em}
.r{position:absolute;left:40px;right:40px;bottom:48px;display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.16em;text-transform:uppercase}.r span:last-child{opacity:.55}
.bar{position:absolute;left:40px;right:40px;top:440px}
.b{display:grid;grid-template-columns:300px 1fr 70px;align-items:center;gap:20px;height:104px;border-top:2px solid currentColor}
.b .n{font-weight:800;font-size:34px;letter-spacing:-.01em;text-transform:uppercase}.b .t{height:44px;display:block}.b .t i{display:block;height:100%;background:${pal.texto}}.b b{font-weight:800;font-size:56px;letter-spacing:-.04em;text-align:right}
.lista{position:absolute;left:40px;right:40px;top:410px}
.f{display:grid;grid-template-columns:130px 1fr;grid-template-rows:auto auto;column-gap:20px;padding:15px 0;border-top:2px solid rgba(242,239,233,.35)}
.f b{grid-row:1/3;font-weight:800;font-size:46px;letter-spacing:-.03em;color:${pal.texto === '#0E0E0E' ? '#C96F4A' : pal.texto};align-self:center}
.f span{font-weight:800;font-size:33px;letter-spacing:-.015em;text-transform:uppercase;line-height:1.05}.f small{font-weight:500;font-size:24px;letter-spacing:.1em;text-transform:uppercase;opacity:.65}
</style><body>${slides.join('')}</body>
<script>
document.fonts.ready.then(()=>{document.querySelectorAll('.logo').forEach(l=>{l.style.fontSize='100px';const w=l.getBoundingClientRect().width;l.style.fontSize=Math.floor(100*${W - 80}/w)+'px'});
document.querySelectorAll('.g').forEach(g=>{g.style.fontSize='100px';let mx=0;[].forEach.call(g.children,l=>{l.style.display='inline-block';mx=Math.max(mx,l.getBoundingClientRect().width);l.style.display='block'});g.style.fontSize=Math.min(+g.dataset.max,Math.floor(100*${W - 72}/mx))+'px'});window.pronto=true});
</script>`;
  const f = path.join(RAIZ, '.raiox.html');
  fs.writeFileSync(f, html);
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await browser.newPage();
  await p.goto('file:///' + U(f), { waitUntil: 'networkidle0' });
  await p.waitForFunction('window.pronto===true', { timeout: 30000 });
  await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < slides.length; i++) await (await p.$('#s' + i)).screenshot({ path: path.join(out, `raio-x-${String(i + 1).padStart(2, '0')}.png`) });
  await browser.close(); fs.rmSync(f, { force: true }); fs.rmSync(tmp, { recursive: true, force: true });

  const nomesTop = d.top.map(x => x[0]);
  const leg = `Raio X de São Paulo: ${d.emDez} em cada 10 exposições em cartaz estão em ${d.top.length} bairros.\n\n` +
    `Hoje a base do Vernissages SP acompanha ${d.em.length} exposições em ${d.casas} casas. ${nomesTop.slice(0, -1).join(', ')} e ${nomesTop[nomesTop.length - 1]} concentram ${d.nTop} delas. ` +
    `Zona Oeste ${(d.zonas.find(x => x[0] === 'Oeste') || [0, 0])[1]}, Centro ${(d.zonas.find(x => x[0] === 'Centro') || [0, 0])[1]}, Sul ${(d.zonas.find(x => x[0] === 'Sul') || [0, 0])[1]}.\n\n` +
    `Só conta o que foi mapeado, e o circuito de galerias pesa na conta. Falta um espaço perto de você? Comenta o nome e ele entra no mapa.\n\n` +
    `${d.fecha.length} exposições fecham nos próximos 7 dias, a lista está no slide 4.\n\n` +
    `Salva e manda para quem acha que SP não tem exposição perto. Mapa completo em vernissagessp.com.br\n\n#exposicaosp #arteemsp #saopaulo #artecontemporanea #galeriadearte`;
  const lt = semTravessao(leg), v = lint(lt, { tipo: 'legenda' });
  fs.writeFileSync(path.join(out, 'raio-x-LEGENDA.md'), lt + '\n');
  console.log(`OK 5 slides em ${path.relative(RAIZ, out)} · ${d.em.length} em cartaz, ${d.emDez}/10 em ${d.top.length} bairros, ${d.fecha.length} fecham em 7 dias${v.length ? ' · lint: ' + v.map(x => x.regra).join(',') : ''}`);
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
