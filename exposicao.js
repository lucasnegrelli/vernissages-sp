#!/usr/bin/env node
/* ============================================================
   exposicao.js — uma exposição inteira no feed (09/11/2026)

   Um carrossel sobre UMA mostra, com várias fotos dela: obras e vistas de
   sala, cada uma preenchendo o slide inteiro, sem texto por cima. O último
   slide é a legenda de parede com o serviço. Serve de porta de entrada para a
   casa (a exposição aparece como a galeria quer que apareça) em vez de
   misturar mostras de casas diferentes.

   As fotos vêm das candidatas que o caçador já achou no site da casa
   (acervo-imagens.json) mais a imagem principal. Curadoria por --ordem.
   Foto de vista de sala AQUI vale: o carrossel é sobre a exposição, não
   sobre uma obra.

   Uso:
     node exposicao.js "Ver o mundo" --folha=pasta        (monta a folha de contato numerada, para curar)
     node exposicao.js "Ver o mundo" --ordem=0,3,1,5 --out=SOCIAL/11/13 [--max=8] [--pub=AAAA-MM-DD]
   Sai: exposicao-01..N.png e exposicao-LEGENDA.md
   ============================================================ */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const base = require('./rima.js');
const D = require('./direcao.js');
const { carregarDados, RAIZ, esc, porExtenso, arroba, tituloCurto, autoria, marcarFoto } = base;

const argv = process.argv.slice(2);
const alvo = argv.find(a => !a.startsWith('--'));
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
if (!alvo) { console.error('uso: node exposicao.js "Título" [--casa=...] --folha=pasta | --ordem=0,1,2 --out=pasta'); process.exit(1); }
const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const W = 1080, H = 1350;
const UA = 'Mozilla/5.0 (compatible; vernissages-sp/1.0; +https://vernissagessp.com.br)';
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const SUSPEITA = /logo|banner|cartaz|flyer|poster|convite|thumb|avatar|qr-?code/i;

(async () => {
  const sharp = require(path.join(REND, 'node_modules', 'sharp'));
  const DATA = carregarDados();
  const casa = flag('casa', null);
  const e = DATA.expos.find(x => norm(x.t).includes(norm(alvo)) && (!casa || norm(x.v).includes(norm(casa))));
  if (!e) throw new Error('mostra não encontrada: ' + alvo);
  const v = DATA.venues.find(x => x.name === e.v) || {};
  const acervo = JSON.parse(fs.readFileSync(path.join(RAIZ, 'acervo-imagens.json'), 'utf8'))[e.t + '|' + e.v] || {};
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'expo-'));

  /* lista: 0 = imagem principal (e as extras img2/img3), depois as candidatas do site da casa */
  const lista = [], md5s = new Set();
  const add = async (origem, arq) => {
    const buf = fs.readFileSync(arq), h = crypto.createHash('md5').update(buf).digest('hex');
    if (md5s.has(h)) return; md5s.add(h);
    const m = await sharp(buf).metadata();
    if (m.width < 1200 || m.height < 1000 && m.width < 1600) return;
    lista.push({ arq, origem, w: m.width, h: m.height });
  };
  for (const campo of ['img', 'img2', 'img3']) if (e[campo]) await add(campo, path.join(RAIZ, e[campo]));
  for (const [i, c] of (acervo.candidatos || []).entries()) {
    if (SUSPEITA.test(c.url || '') || (c.w || 0) < 1400 || md5s.has(c.md5)) continue;
    try {
      const f = path.join(tmp, `c${i}.jpg`);
      const r = await fetch(c.url, { headers: { 'user-agent': UA } }); if (!r.ok) continue;
      await sharp(Buffer.from(await r.arrayBuffer())).rotate().jpeg({ quality: 92 }).toFile(f);
      await add('site', f);
    } catch (x) { /* próxima */ }
  }
  console.log(`${e.t} · ${e.v}: ${lista.length} foto(s) usáveis`);

  const pasta = flag('folha', null);
  if (pasta) {
    fs.mkdirSync(pasta, { recursive: true });
    const th = await Promise.all(lista.map(async (x, i) => ({ i, b: await sharp(x.arq).rotate().resize({ width: 300, height: 300, fit: 'contain', background: '#222' }).toBuffer(), x })));
    const cols = 5, linhas = Math.ceil(th.length / cols);
    const comp = [];
    th.forEach((t, k) => { const l = Math.floor(k / cols), c = k % cols; comp.push({ input: t.b, left: c * 306, top: l * 306 }); comp.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="40"><rect width="56" height="40" fill="#C96F4A"/><text x="28" y="29" text-anchor="middle" font-size="28" font-family="Arial" fill="#000" font-weight="bold">${t.i}</text></svg>`), left: c * 306, top: l * 306 }); });
    await sharp({ create: { width: cols * 306, height: linhas * 306, channels: 3, background: '#111' } }).composite(comp).jpeg({ quality: 85 }).toFile(path.join(pasta, 'folha.jpg'));
    console.log('folha:', path.join(pasta, 'folha.jpg'), '\n' + lista.map((x, i) => `  ${i} ${x.origem} ${x.w}x${x.h}`).join('\n'));
    return;
  }

  const ordem = (flag('ordem', '') || lista.map((_, i) => i).join(',')).split(',').map(Number).filter(i => lista[i]).slice(0, parseInt(flag('max', '8'), 10));
  if (ordem.length < 3) throw new Error('precisa de pelo menos 3 fotos (--ordem)');
  const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
  fs.mkdirSync(out, { recursive: true });
  /* Cada foto: tira a margem lisa (parede e passe-partout de foto emoldurada) e depois
     - retrato ou quadrado: preenche o slide inteiro (corte inteligente);
     - paisagem larga: cabe inteira na largura, sobre o papel, para não decepar a foto. */
  const fundo = { r: 242, g: 239, b: 233 };
  for (const [k, i] of ordem.entries()) {
    let buf = await sharp(lista[i].arq).rotate().toBuffer();
    if (!argv.includes('--sem-trim')) {
      try {
        const t = await sharp(buf).trim({ threshold: 34 }).toBuffer({ resolveWithObject: true });
        const m0 = await sharp(buf).metadata();
        if (t.info.width * t.info.height >= m0.width * m0.height * 0.25) buf = t.data;
      } catch (x) { /* sem trim */ }
    }
    const m = await sharp(buf).metadata(), ar = m.width / m.height;
    const dest = path.join(out, `exposicao-${String(k + 1).padStart(2, '0')}.png`);
    if (ar < 1.2 || k === 0) await sharp(buf).resize(W, H, { fit: 'cover', position: 'attention' }).png().toFile(dest);
    else await sharp(buf).resize(W, H, { fit: 'contain', background: fundo }).png().toFile(dest);
  }
  /* último slide: legenda de parede */
  const credTxt = e.cred && /cortesia/i.test(e.cred) ? e.cred : 'cortesia ' + e.v + (e.cred ? '. ' + e.cred : '');
  const quem = autoria(e), n = tituloCurto(e).length, tam = n <= 14 ? 120 : n <= 24 ? 96 : n <= 36 ? 78 : n <= 52 ? 64 : 54;
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
</style><body><div class="slide"><div class="cab"><b>Vernissages SP</b><span>Uma exposição</span></div><div class="c">
<div class="tit">${esc(tituloCurto(e))}</div>${quem ? `<div class="q">${esc(quem)}</div>` : ''}
<div class="sv"><div class="l"><i>Onde</i><span>${esc(e.v)}${v.addr ? ', ' + esc(v.addr) : ''}</span></div><div class="l"><i>Bairro</i><span>${esc(v.b || '')}</span></div><div class="l"><i>Quando</i><span>${e.fim ? 'até ' + esc(porExtenso(e.fim)) : 'desde ' + esc(porExtenso(e.ini))}</span></div>${v.ing && v.ing.g ? '<div class="l"><i>Entrada</i><span>Gratuita</span></div>' : ''}</div></div>
<div class="cred">Imagens: ${esc(credTxt)}</div></div></body>`;
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const arqHtml = path.join(RAIZ, '.exposicao.html'); fs.writeFileSync(arqHtml, html);
  const br = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await br.newPage(); await p.goto('file:///' + arqHtml.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 400));
  await (await p.$('.slide')).screenshot({ path: path.join(out, `exposicao-${String(ordem.length + 1).padStart(2, '0')}.png`) });
  await br.close(); fs.rmSync(arqHtml, { force: true });

  const leg = `${tituloCurto(e)}${quem ? ', ' + quem : ''}, em ${ordem.length} imagens.\n\nDeslize para passear pela exposição na ${e.v} ${arroba(v.ig)}.\n\n${e.d ? e.d + '\n\n' : ''}Serviço: ${e.v}, ${v.addr ? v.addr + ', ' : ''}${v.b || ''}. ${e.fim ? 'Até ' + porExtenso(e.fim) + '.' : 'Aberta desde ' + porExtenso(e.ini) + '.'}${v.ing && v.ing.g ? ' Entrada gratuita.' : ''}\n\nImagens: ${credTxt}.\n\nSalva para ir e manda para quem vai com você. Agenda completa de exposições em vernissagessp.com.br\n\n#exposicaosp #arteemsp #saopaulo #artecontemporanea #galeriadearte`;
  fs.writeFileSync(path.join(out, 'exposicao-LEGENDA.md'), leg.replace(/ — /g, ': ') + '\n');
  if (e.img) marcarFoto(e.img, flag('pub', hoje));
  console.log(`OK ${ordem.length + 1} slides em ${path.relative(RAIZ, out)} · legenda ${leg.length} caracteres`);
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
