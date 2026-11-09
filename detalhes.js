#!/usr/bin/env node
/* ============================================================
   detalhes.js — carrossel "Por dentro da obra" (09/11/2026)

   Usa a imagem como imagem: slide 1 a obra inteira, tela cheia, sem nada por
   cima; slides 2 a 4 são aproximações REAIS (recortes da resolução original,
   não zoom de mentira) nas três regiões de maior riqueza de detalhe; slide 5
   a etiqueta. Quem rola o carrossel entra na superfície da obra.

   Escolha dos recortes por regra, sem IA: gradiente (borda e textura) por
   região, janela 4:5 em duas escalas, afastadas entre si, com fundo liso
   descartado. A imagem precisa ter largura mínima para o recorte aguentar
   (>= 1800 px).

   Uso: node detalhes.js "Título da mostra" [--casa="Galeria"] [--out=SOCIAL/MM/DD] [--seco]
   Sai: detalhes-01..05.png e detalhes-LEGENDA.md (legenda por regra; edite se quiser).
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const D = require('./direcao.js');
const { carregarDados, exigirObra, marcarFoto, medir, RAIZ, esc, porExtenso, arroba, tituloCurto, autoria } = base;

const argv = process.argv.slice(2);
const alvoTit = argv.find(a => !a.startsWith('--'));
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
if (!alvoTit) { console.error('uso: node detalhes.js "Título da mostra" [--casa=...]'); process.exit(1); }
const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const W = 1080, H = 1350;
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

async function recortes(sharp, arquivo, n) {
  const meta = await sharp(arquivo).rotate().metadata();
  const IW = meta.width, IH = meta.height;
  /* mapa de detalhe em baixa resolução */
  const L = 320, sc = L / IW, LH = Math.round(IH * sc);
  const { data } = await sharp(arquivo).rotate().greyscale().resize(L, LH, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const g = (x, y) => data[Math.min(LH - 1, Math.max(0, y)) * L + Math.min(L - 1, Math.max(0, x))];
  const mag = new Float32Array(L * LH);
  for (let y = 1; y < LH - 1; y++) for (let x = 1; x < L - 1; x++) {
    const gx = g(x + 1, y) - g(x - 1, y), gy = g(x, y + 1) - g(x, y - 1);
    mag[y * L + x] = Math.hypot(gx, gy);
  }
  const cands = [];
  for (const f of [0.36, 0.5]) {
    let cw = IW * f, ch = cw * 1.25;
    if (ch > IH * 0.92) { ch = IH * 0.92; cw = ch / 1.25; }
    const w = Math.round(cw * sc), h = Math.round(ch * sc), passo = Math.max(4, Math.round(w / 6));
    for (let y0 = 0; y0 + h <= LH; y0 += passo) for (let x0 = 0; x0 + w <= L; x0 += passo) {
      let soma = 0, quentes = 0, c = 0;
      for (let y = y0; y < y0 + h; y += 2) for (let x = x0; x < x0 + w; x += 2) { const m = mag[y * L + x]; soma += m; c++; if (m > 18) quentes++; }
      const media = soma / c, cobertura = quentes / c;
      if (cobertura < 0.12) continue;   /* fundo liso: não é detalhe */
      cands.push({ x: x0 / sc, y: y0 / sc, w: w / sc, h: h / sc, nota: media * (0.6 + cobertura) * (f === 0.36 ? 1.08 : 1) });
    }
  }
  cands.sort((a, b) => b.nota - a.nota);
  const out = [];
  for (const c of cands) {
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    if (out.every(o => Math.hypot(cx - (o.x + o.w / 2), cy - (o.y + o.h / 2)) > Math.max(c.w, o.w) * 0.8)) out.push(c);
    if (out.length === n) break;
  }
  /* ordem de leitura: da esquerda para a direita, de cima para baixo */
  return { lista: out.sort((a, b) => (a.y + a.h / 2) * 1.5 + (a.x + a.w / 2) - ((b.y + b.h / 2) * 1.5 + (b.x + b.w / 2))), IW, IH };
}

(async () => {
  const DATA = carregarDados();
  const casa = flag('casa', null);
  const e = DATA.expos.find(x => norm(x.t).includes(norm(alvoTit)) && (!casa || norm(x.v).includes(norm(casa))));
  if (!e) throw new Error('mostra não encontrada: ' + alvoTit);
  const v = DATA.venues.find(x => x.name === e.v) || {};
  const rel = exigirObra(e, { recusarVista: true });
  const dim = await medir(rel);
  console.log(`PICK ${e.t}|${e.v} · ${dim.w}x${dim.h}`);
  if (dim.w < 1800) throw new Error(`imagem com ${dim.w}px: precisa de pelo menos 1800 para recortar sem estourar`);
  const sharp = require(path.join(REND, 'node_modules', 'sharp'));
  const arquivo = path.resolve(RAIZ, rel);
  const { lista, IW, IH } = await recortes(sharp, arquivo, 3);
  if (lista.length < 3) throw new Error('a imagem não tem 3 regiões ricas o bastante');
  console.log('recortes:', lista.map(r => `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.w)}x${Math.round(r.h)}`).join(' | '));
  if (argv.includes('--seco')) return;

  const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
  fs.mkdirSync(out, { recursive: true });
  /* 1: obra inteira, cobrindo o quadro 4:5 com o foco da base */
  const foco = typeof e.foco === 'number' ? e.foco : 50;
  const cover = Math.max(W / IW, H / IH), cw = Math.round(IW * cover), ch = Math.round(IH * cover);
  await sharp(arquivo).rotate().resize(cw, ch).extract({ left: Math.max(0, Math.min(cw - W, Math.round((cw - W) * foco / 100))), top: Math.max(0, Math.round((ch - H) / 2)), width: W, height: H }).png().toFile(path.join(out, 'detalhes-01.png'));
  /* 2..4: aproximações reais */
  for (let i = 0; i < 3; i++) {
    const r = lista[i];
    const left = Math.max(0, Math.min(IW - 1, Math.round(r.x))), top = Math.max(0, Math.min(IH - 1, Math.round(r.y)));
    await sharp(arquivo).rotate().extract({ left, top, width: Math.min(Math.round(r.w), IW - left), height: Math.min(Math.round(r.h), IH - top) }).resize(W, H, { fit: 'cover' }).png().toFile(path.join(out, `detalhes-0${i + 2}.png`));
  }
  /* 5: etiqueta */
  const pal = D.paletaDaCor(await D.corDaObra(sharp, arquivo));
  const quem = autoria(e), n = tituloCurto(e).length, tam = n <= 14 ? 120 : n <= 24 ? 96 : n <= 36 ? 78 : n <= 52 ? 64 : 54;
  const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}.slide{position:relative;width:${W}px;height:${H}px;background:${D.PAPEL};color:${D.TINTA};font-family:'Switzer',sans-serif;overflow:hidden}
.cab{position:absolute;left:70px;right:70px;top:56px;height:46px;border-bottom:3px solid ${D.TINTA};display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.17em;text-transform:uppercase}.cab span{color:${pal.texto}}
.c{position:absolute;left:70px;right:70px;top:150px;bottom:120px;display:flex;flex-direction:column;justify-content:center}
.tit{font-weight:800;text-transform:uppercase;letter-spacing:-.04em;line-height:.9;font-size:${tam}px;color:${pal.texto}}
.q{font-family:'IS',serif;font-style:italic;font-size:58px;line-height:1.04;margin-top:24px}
.o{font-weight:800;font-size:26px;letter-spacing:.15em;text-transform:uppercase;margin-top:34px}
.s{font-weight:500;font-size:24px;letter-spacing:.1em;text-transform:uppercase;margin-top:8px;color:#6f6a60}
.cred{position:absolute;left:70px;right:70px;bottom:48px;font-size:17px;font-weight:500;color:#9a948a}
</style><body><div class="slide"><div class="cab"><b>Vernissages SP</b><span>Por dentro da obra</span></div><div class="c">
<div class="tit">${esc(tituloCurto(e))}</div>${quem ? `<div class="q">${esc(quem)}</div>` : ''}
<div class="o">${esc(e.v)} · ${esc(v.b || '')}</div><div class="s">${e.fim ? 'até ' + esc(porExtenso(e.fim)) : 'em cartaz'}${v.ig ? ' · ' + esc(arroba(v.ig)) : ''}</div></div>
<div class="cred">${esc(e.cred || '')}</div></div></body>`;
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const tmp = path.join(RAIZ, '.detalhes.html'); fs.writeFileSync(tmp, html);
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await browser.newPage(); await p.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 300));
  await (await p.$('.slide')).screenshot({ path: path.join(out, 'detalhes-05.png') });
  await browser.close(); fs.rmSync(tmp, { force: true });

  const leg = `${tituloCurto(e)}${quem ? ', ' + quem : ''}, por dentro.\n\nDeslize: a obra inteira e três aproximações da própria imagem, nas regiões de mais detalhe.\n\n${e.d ? e.d + '\n\n' : ''}Serviço: ${e.v} ${arroba(v.ig)}, ${v.addr ? v.addr + ', ' : ''}${v.b || ''}. ${e.fim ? 'Até ' + porExtenso(e.fim) + '.' : ''}\n\nImagem: ${e.cred}.\n\nSalva para ir e manda para quem vai com você. Agenda completa de exposições em vernissagessp.com.br\n\n#exposicaosp #arteemsp #saopaulo #artecontemporanea #galeriadearte`;
  fs.writeFileSync(path.join(out, 'detalhes-LEGENDA.md'), leg.replace(/ — /g, ': ') + '\n');
  marcarFoto(rel, flag('pub', hoje));
  console.log(`OK 5 slides em ${path.relative(RAIZ, out)}`);
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
