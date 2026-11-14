#!/usr/bin/env node
/* ============================================================
   apresentacao.js: carrossel fixo que apresenta o Vernissages SP (14/11/2026)

   Serve para converter quem chega por Reel ou por collab: o perfil precisa
   dizer em 6 slides o que é, para que serve e por que seguir. Fica fixado.
   Linguagem do site: logo com a textura de uma obra dentro das letras, papel e
   tinta alternando, tipografia pesada. Cada slide usa a textura de uma obra
   diferente; nenhuma obra aparece como imagem, só como cor e textura da marca.

   Uso: node apresentacao.js [--out=pasta]
   Sai: apresentacao-01..06.png e apresentacao-LEGENDA.md
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const D = require('./direcao.js');
const { RAIZ } = base;
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const REND = path.join(RAIZ, '.render');
const W = 1080, H = 1350;
const U = x => x.split(path.sep).join('/');

/* texto de cada slide (escrito à mão: é a voz do perfil) */
const SLIDES = [
  { fundo: 'papel', tex: 'img/o-avesso-mazzucchelli-cardoso.jpg', grande: ['O guia', 'de arte', 'de São Paulo.'], corpo: 'Aberturas, mapa e editais num lugar só.', rotulo: 'Arraste' },
  { fundo: 'tinta', tex: 'img/aquilo-que-nao-cabe-zipper-galeria.jpg', grande: ['Toda semana,', 'o que abre.'], corpo: 'Galerias e museus da cidade, lidos todo dia. Você vê o que abriu, o que fecha e o que vale a viagem.', rotulo: '01 Agenda' },
  { fundo: 'papel', tex: 'img/o-vaso-de-ojuara-zipper-galeria.jpg', grande: ['A cidade', 'no mapa.'], corpo: 'Cada exposição em cartaz num ponto. Filtre por bairro, por exposição grátis ou pelo que está perto de você.', rotulo: '02 Mapa' },
  { fundo: 'tinta', tex: 'img/e-tempo-ainda-janaina-torres-galeria.webp', grande: ['Editais', 'para artistas.'], corpo: 'Chamadas abertas, com prazo e com taxa quando existe. Lidas das páginas oficiais, todo dia.', rotulo: '03 Editais' },
  { fundo: 'papel', tex: 'img/beatriz-milhazes-gravuras-do-acervo-da-pinacoteca-estacao-pi.webp', grande: ['A obra', 'inteira.'], corpo: 'Aqui a imagem é a obra, sem moldura e sem texto por cima. O resto a gente escreve ao lado.', rotulo: '04 Imagem' },
  { fundo: 'tinta', tex: 'img/o-avesso-mazzucchelli-cardoso.jpg', grande: ['Salva.', 'Manda.', 'Vai.'], corpo: 'Salve este post e mande para quem vai com você. Tudo em vernissagessp.com.br', rotulo: '@vernissagessp' },
];

(async () => {
  const sharp = require(path.join(REND, 'node_modules', 'sharp'));
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', 'apresentacao')));
  fs.mkdirSync(out, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'apres-'));
  const itens = [];
  for (let i = 0; i < SLIDES.length; i++) {
    const s = SLIDES[i], src = path.resolve(RAIZ, s.tex), dst = path.join(tmp, `t${i}.jpg`);
    /* letra clara sobre papel some: escurece a textura no fundo claro e acende no escuro */
    await sharp(src).rotate().resize({ width: 1600, withoutEnlargement: true }).modulate({ brightness: s.fundo === 'papel' ? 0.6 : 1.1, saturation: 1.3 }).jpeg({ quality: 85 }).toFile(dst);
    const pal = D.paletaDaCor(await D.corDaObra(sharp, src));
    itens.push({ ...s, texU: U(dst), acento: pal.texto });
  }
  const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}
.s{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:Switzer,sans-serif}
.s.papel{background:${D.PAPEL};color:${D.TINTA}}.s.tinta{background:#0E0E0E;color:${D.PAPEL}}
.logo{position:absolute;left:40px;top:34px;font-weight:800;letter-spacing:-.06em;line-height:.8;white-space:nowrap;background-position:center 45%;background-size:cover;-webkit-background-clip:text;color:transparent}
.fio{position:absolute;left:40px;right:40px;top:186px;border-top:4px solid currentColor}
.g{position:absolute;left:36px;right:36px;top:290px;font-weight:800;text-transform:uppercase;letter-spacing:-.055em;line-height:.86}
.c{position:absolute;left:40px;right:90px;bottom:150px;font-size:44px;line-height:1.22;font-weight:500;letter-spacing:-.01em}
.r{position:absolute;left:40px;right:40px;bottom:48px;display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.16em;text-transform:uppercase}
.r span:last-child{opacity:.55}
</style><body>${itens.map((s, i) => `<div class="s ${s.fundo}" id="s${i}">
<div class="logo" style="background-image:url('file:///${s.texU}')">VERNISSAGES SP</div><div class="fio"></div>
<div class="g">${s.grande.map(l => `<div class="l" style="white-space:nowrap">${l}</div>`).join('')}</div>
<div class="c">${s.corpo}</div>
<div class="r"><span>${s.rotulo}</span><span>${i + 1} / ${itens.length}</span></div></div>`).join('')}</body>
<script>
function fit(el,larg,max){el.style.fontSize='100px';let mx=0;[].forEach.call(el.children,l=>{l.style.display='inline-block';mx=Math.max(mx,l.getBoundingClientRect().width);l.style.display='block'});el.style.fontSize=Math.min(max,Math.floor(100*larg/mx))+'px'}
document.fonts.ready.then(()=>{document.querySelectorAll('.logo').forEach(l=>{l.style.fontSize='100px';const w=l.getBoundingClientRect().width;l.style.fontSize=Math.floor(100*${W - 80}/w)+'px'});
document.querySelectorAll('.g').forEach(g=>fit(g,${W - 72},250));window.pronto=true});
</script>`;
  const f = path.join(RAIZ, '.apresentacao.html');
  fs.writeFileSync(f, html);
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await browser.newPage();
  await p.goto('file:///' + U(f), { waitUntil: 'networkidle0' });
  await p.waitForFunction('window.pronto===true', { timeout: 30000 });
  await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < itens.length; i++) await (await p.$('#s' + i)).screenshot({ path: path.join(out, `apresentacao-${String(i + 1).padStart(2, '0')}.png`) });
  await browser.close(); fs.rmSync(f, { force: true }); fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`OK ${itens.length} slides em ${path.relative(RAIZ, out)}`);
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
