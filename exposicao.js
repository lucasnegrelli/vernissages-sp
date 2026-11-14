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
const { semTravessao } = require('./copy.js');
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

const dist = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };
async function aHash(sharp, arq) {
  const { data } = await sharp(arq).rotate().greyscale().resize(16, 16, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const med = data.reduce((x, y) => x + y, 0) / data.length;
  return Array.from(data, v => v > med ? 1 : 0).join('');
}

let paginaHtml = null;
const ACENTOS = {};
for (const [base, nomes] of Object.entries({ a: 'àáâãä', e: 'èéêë', i: 'ìíîï', o: 'òóôõö', u: 'ùúûü', A: 'ÀÁÂÃÄ', E: 'ÈÉÊË', I: 'ÌÍÎÏ', O: 'ÒÓÔÕÖ', U: 'ÙÚÛÜ' })) {
  const suf = ['grave', 'acute', 'circ', 'tilde', 'uml']; [...nomes].forEach((ch, k) => { ACENTOS[base + suf[k]] = ch; });
}
Object.assign(ACENTOS, { ccedil: 'ç', Ccedil: 'Ç', ntilde: 'ñ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', ordm: 'º', ordf: 'ª', deg: '°' });
const decodeHTML = t => String(t || '').replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&([A-Za-z]+);/g, (m, n) => ACENTOS[n] !== undefined ? ACENTOS[n] : m);

/* ---------- texto da exposição (texto curatorial / crítico) ----------
   Pega o bloco de descrição da página da galeria, separa em parágrafos e procura
   a assinatura ("Texto de X", "Curadoria: X"). Sem assinatura, o crédito vai para
   a casa. Só trecho (o resto fica no site da casa, com link na legenda). */
function extrairTexto(html) {
  if (!html) return null;
  const m = html.match(/<div class="description"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="(?:read-more|share|artists)|<\/section|<div class="(?:images|artworks))/i) || html.match(/<div class="description"[^>]*>([\s\S]*?)<\/div>/i);
  if (!m) return null;
  const par0 = [...m[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(x => decodeHTML(x[1].replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()).filter(x => x.length > 40);
  const par = par0.filter((x, k) => !(k === 0 && /tem o prazer de|convida|abertura|vernissage|inaugura/i.test(x.slice(0, 120))));
  if (!par.length) return null;
  const tudo = par.join('\n');
  const assin = tudo.match(/(?:texto(?:\s+curatorial|\s+cr[ií]tico)?|text|curadoria|curated by|curatorial text)\s*(?:de|by|por|:)\s*([A-ZÀ-Ý][A-Za-zÀ-ÿ'’. \-]{4,70})/);
  return { paragrafos: par, assinatura: assin ? assin[1].trim().replace(/[.,;]+$/, '') : null };
}
/* trechos de até `max` caracteres, cortados em fim de frase; maximo `n` trechos */
function trechos(par, max, n) {
  const frases = par.join(' ').replace(/ [–—] /g, ', ').match(/[^.!?]+[.!?]+(?:["”’)]*)|[^.!?]+$/g) || [];
  const out = []; let atual = '';
  for (const f of frases.map(x => x.trim())) {
    if ((atual + ' ' + f).trim().length > max && atual) { out.push(atual.trim()); atual = f; if (out.length === n) return out; } else atual = (atual + ' ' + f).trim();
  }
  if (atual && out.length < n) out.push(atual);
  return out.slice(0, n);
}

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
    const ph = await aHash(sharp, arq);
    if (lista.some(o => o.ph && dist(o.ph, ph) <= 10)) return;
    const m = await sharp(buf).metadata();
    if (m.width < 1200 || m.height < 1000 && m.width < 1600) return;
    lista.push({ arq, origem, w: m.width, h: m.height, ph });
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
  /* BUSCAR NA FONTE: abre a página da mostra no site da casa (e no Arte Que Acontece) e pega todas as imagens grandes.
     Mesma foto em tamanhos diferentes é uma só (hash perceptual). */
  if (argv.includes('--buscar')) {
    const fontes = [(acervo.links || {}).site, (acervo.links || {}).aqa].filter(Boolean);
    const urls = new Map();
    for (const pag of fontes) {
      try {
        const r = await fetch(pag, { headers: { 'user-agent': UA } }); if (!r.ok) continue;
        const html = await r.text();
        if (!paginaHtml && /class="description"/.test(html)) paginaHtml = html;
        for (const m of html.matchAll(/(?:https?:)?\/\/[^"'\s)<>]+\.(?:jpe?g|png|webp)(?:\?[^"'\s)<>]*)?|["'(]\/[^"'\s)<>]+\.(?:jpe?g|png|webp)(?:\?[^"'\s)<>]*)?/gi)) {
          let u = m[0].replace(/^["'(]/, '');
          if (u.startsWith('//')) u = 'https:' + u; else if (u.startsWith('/')) u = new URL(u, pag).href;
          if (SUSPEITA.test(u) || /sprite|icon|favicon|placeholder/i.test(u)) continue;
          if (/static-assets\.artlogic\.net\/w_/.test(u)) u = u.replace(/\/w_[^/]+\/ws-/, '/w_2600,c_limit,f_auto,fl_lossy,q_auto/ws-');
          const chave = u.split('?')[0].replace(/\/w_[^/]+\/ws-/, '/ws-').replace(/[-_]\d{2,4}x\d{2,4}(?=\.)/, '').replace(/\/(thumb|small|medium|large|resized?)\//i, '/');
          if (!urls.has(chave)) urls.set(chave, []);
          urls.get(chave).push(u);
        }
      } catch (x) { console.log('fonte falhou: ' + pag); }
    }
    console.log('  na fonte: ' + urls.size + ' imagem(ns) distinta(s) por endereço');
    const hashes = [];
    for (const it of lista) hashes.push(await aHash(sharp, it.arq));
    let baixadas = 0;
    for (const [chave, variantes] of urls) {
      if (baixadas >= 40) break;
      /* a maior variante é a que tem número maior no nome; sem número, a primeira */
      const u = variantes.slice().sort((a, b) => ((b.match(/(\d{3,4})/g) || [0]).map(Number).reduce((x, y) => Math.max(x, y), 0)) - ((a.match(/(\d{3,4})/g) || [0]).map(Number).reduce((x, y) => Math.max(x, y), 0)))[0];
      try {
        const r = await fetch(u, { headers: { 'user-agent': UA } }); if (!r.ok) continue;
        const f = path.join(tmp, 'b' + baixadas + '.jpg');
        await sharp(Buffer.from(await r.arrayBuffer())).rotate().jpeg({ quality: 92 }).toFile(f);
        const h = await aHash(sharp, f);
        if (hashes.some(o => dist(o, h) <= 10)) continue;
        const n0 = lista.length; await add('fonte', f);
        if (lista.length > n0) { lista[lista.length - 1].artlogic = /static-assets\.artlogic\.net/.test(u); hashes.push(h); baixadas++; }
      } catch (x) { /* próxima */ }
    }
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

  if (argv.includes('--auto')) {
    /* origem confiável: a principal e extras curadas, e imagens do CDN de obra/exposição da Artlogic; o resto fica fora */
    const ok = lista.map((x, i) => i).filter(i => lista[i].origem !== 'site' && lista[i].origem !== 'fonte' ? true : !!lista[i].artlogic);
    const obra = ok.filter(i => lista[i].w / lista[i].h < 1.3), sala = ok.filter(i => lista[i].w / lista[i].h >= 1.3 && lista[i].w >= 2000);
    const ordemAuto = []; let panoAuto = -1;
    if (obra.length) ordemAuto.push(obra.shift());
    if (sala.length) { panoAuto = sala[0]; ordemAuto.push(sala.shift()); }
    const teto = 10 - 1 - (parseInt(flag('texto', '0'), 10) || 0) - (panoAuto >= 0 ? 1 : 0);  /* o Instagram aceita 10 slides: fichas, texto e a faixa contínua contam */
    sala.length = 0;   /* só a vista que virou faixa contínua; vista larga solta cabe pequena no slide */
    while (obra.length && ordemAuto.length < teto) ordemAuto.push(obra.shift());
    argv.push('--ordem=' + ordemAuto.join(','));
    if (panoAuto >= 0 && !argv.some(a => a.startsWith('--pano='))) argv.push('--pano=' + panoAuto + ':2');
    console.log('  --auto: ordem ' + ordemAuto.join(',') + (panoAuto >= 0 ? ' · pano ' + panoAuto : ''));
  }
  const ordem = (flag('ordem', '') || lista.map((_, i) => i).join(',')).split(',').map(Number).filter(i => lista[i]).slice(0, parseInt(flag('max', '8'), 10));
  /* NUNCA a mesma imagem duas vezes no carrossel (regra do Lucas, 14/11/2026): a capa já é a informação, não se repete mais adiante.
     O hash pega a mesma foto em outro tamanho; a foto nua + a vista emoldurada dela (caso Ver o mundo) o hash não pega:
     ao escolher --ordem pela folha de contato, olhar e nunca pôr as duas. */
  {
    const hs = [], limpa = [];
    for (const i of ordem) {
      const h = await aHash(sharp, lista[i].arq);
      if (hs.some(o => dist(o, h) <= 12)) { console.log(`  repetida, fora do carrossel: foto ${i}`); continue; }
      hs.push(h); limpa.push(i);
    }
    ordem.length = 0; ordem.push(...limpa);
  }
  if (ordem.length < 3) throw new Error('precisa de pelo menos 3 fotos (--ordem)');
  const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
  fs.mkdirSync(out, { recursive: true });
  /* Cada foto: tira a margem lisa (parede e passe-partout de foto emoldurada) e depois
     - retrato ou quadrado: preenche o slide inteiro (corte inteligente);
     - paisagem larga: cabe inteira na largura, sobre o papel, para não decepar a foto. */
  const fundo = { r: 242, g: 239, b: 233 };
  const pano = (flag('pano', '') || '').split(':'); const panoI = pano[0] === '' ? -1 : parseInt(pano[0], 10), panoN = parseInt(pano[1], 10) || 0;
  let nSlide = 0;
  for (const [k, i] of ordem.entries()) {
    if (i === panoI) {
      /* faixa contínua: tela única N x 1080, fundo da cor exata do canto da imagem, fatias em N slides */
      let pb = await sharp(lista[i].arq).rotate().toBuffer();
      try { const t = await sharp(pb).trim({ threshold: 30 }).toBuffer({ resolveWithObject: true }); const m00 = await sharp(pb).metadata(); if (t.info.width * t.info.height >= m00.width * m00.height * 0.2) pb = t.data; } catch (x) { /* sem trim */ }
      const pm = await sharp(pb).metadata();
      const nn = panoN || Math.max(2, Math.min(4, Math.round(pm.width / pm.height * H / W)));
      let rr = 0, gg = 0, bb = 0, cc = 0;
      for (const [x, y] of [[0, 0], [pm.width - 6, 0], [0, pm.height - 6], [pm.width - 6, pm.height - 6]]) {
        const q = await sharp(pb).extract({ left: Math.max(0, x), top: Math.max(0, y), width: 6, height: 6 }).raw().toBuffer({ resolveWithObject: true });
        for (let z = 0; z < q.data.length; z += q.info.channels) { rr += q.data[z]; gg += q.data[z + 1]; bb += q.data[z + 2]; cc++; }
      }
      const e1 = Math.min(nn * W / pm.width, H / pm.height), iw = Math.round(pm.width * e1), ih = Math.round(pm.height * e1);
      const tela = await sharp({ create: { width: nn * W, height: H, channels: 3, background: { r: Math.round(rr / cc), g: Math.round(gg / cc), b: Math.round(bb / cc) } } })
        .composite([{ input: await sharp(pb).resize(iw, ih).toBuffer(), left: Math.round((nn * W - iw) / 2), top: Math.round((H - ih) / 2) }]).png().toBuffer();
      for (let z = 0; z < nn; z++) await sharp(tela).extract({ left: z * W, top: 0, width: W, height: H }).png().toFile(path.join(out, `exposicao-${String(++nSlide).padStart(2, '0')}.png`));
      continue;
    }
    let buf = await sharp(lista[i].arq).rotate().toBuffer();
    if (!argv.includes('--sem-trim')) {
      try {
        const t = await sharp(buf).trim({ threshold: 34 }).toBuffer({ resolveWithObject: true });
        const m0 = await sharp(buf).metadata();
        if (t.info.width * t.info.height >= m0.width * m0.height * 0.25) buf = t.data;
      } catch (x) { /* sem trim */ }
    }
    const m = await sharp(buf).metadata(), ar = m.width / m.height;
    const dest = path.join(out, `exposicao-${String(++nSlide).padStart(2, '0')}.png`);
    if (ar < 1.2 || k === 0) await sharp(buf).resize(W, H, { fit: 'cover', position: 'attention' }).png().toFile(dest);
    else await sharp(buf).resize(W, H, { fit: 'contain', background: fundo }).png().toFile(dest);
  }
  /* slides de texto (--texto=N): trecho do texto da exposição, com a assinatura de quem escreveu */
  const nTexto = parseInt(flag('texto', '0'), 10) || 0;
  const tx = nTexto ? extrairTexto(paginaHtml) : null;
  const credTexto = tx ? (tx.assinatura || e.v) : null;
  const partes = tx ? trechos(tx.paragrafos, 520, nTexto) : [];
  const urlTexto = (acervo.links || {}).site || '';
  const arqTexto = [];
  if (partes.length) {
    const puppeteerT = require(path.join(REND, 'node_modules', 'puppeteer-core'));
    const brT = await puppeteerT.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
    for (const [k, parte] of partes.entries()) {
      const htmlT = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Regular.ttf');font-style:normal}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}.slide{position:relative;width:${W}px;height:${H}px;background:${D.PAPEL};color:${D.TINTA};font-family:'Switzer',sans-serif;overflow:hidden}
.cab{position:absolute;left:70px;right:70px;top:56px;height:46px;border-bottom:3px solid ${D.TINTA};display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.17em;text-transform:uppercase}.cab span{color:${D.TERRA}}
.c{position:absolute;left:70px;right:90px;top:150px;bottom:190px;display:flex;flex-direction:column;justify-content:center}
.asp{font-family:'IS',serif;font-size:140px;line-height:.5;color:${D.TERRA};height:70px}
.tx{font-family:'IS',serif;font-size:${parte.length > 430 ? 50 : parte.length > 300 ? 56 : 64}px;line-height:1.1;letter-spacing:-.005em}
.cr{position:absolute;left:70px;right:70px;bottom:52px;border-top:2px solid ${D.TINTA};padding-top:14px;display:flex;justify-content:space-between;gap:30px;font-size:18px;line-height:1.35}
.cr b{font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:16px}.cr span{color:#6f6a60;text-align:right}
</style><body><div class="slide"><div class="cab"><b>Vernissages SP</b><span>Texto da exposição</span></div><div class="c"><div class="asp">“</div><div class="tx">${esc(parte)}</div></div>
<div class="cr"><div><b>Texto</b><br>${esc(credTexto)}</div><span>Trecho ${k + 1} de ${partes.length}. Texto completo no site da ${esc(e.v)}.</span></div></div></body>`;
      const arqT = path.join(RAIZ, '.exposicao-texto.html'); fs.writeFileSync(arqT, htmlT);
      const pgT = await brT.newPage(); await pgT.goto('file:///' + arqT.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
      await pgT.evaluate(() => document.fonts.ready); await new Promise(r2 => setTimeout(r2, 300));
      const bufT = await (await pgT.$('.slide')).screenshot();
      arqTexto.push(bufT); await pgT.close(); fs.rmSync(arqT, { force: true });
    }
    await brT.close();
    for (const bufT of arqTexto) fs.writeFileSync(path.join(out, `exposicao-${String(++nSlide).padStart(2, '0')}.png`), bufT);
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
  await (await p.$('.slide')).screenshot({ path: path.join(out, `exposicao-${String(++nSlide).padStart(2, '0')}.png`) });
  await br.close(); fs.rmSync(arqHtml, { force: true });

  const leg = `${tituloCurto(e)}${quem ? ', ' + quem : ''}, em ${nSlide - 1} slides.\n\nDeslize para passear pela exposição na ${e.v} ${arroba(v.ig)}.\n\n${e.d ? e.d + '\n\n' : ''}Serviço: ${e.v}, ${v.addr ? v.addr + ', ' : ''}${v.b || ''}. ${e.fim ? 'Até ' + porExtenso(e.fim) + '.' : 'Aberta desde ' + porExtenso(e.ini) + '.'}${v.ing && v.ing.g ? ' Entrada gratuita.' : ''}\n\nImagens: ${credTxt}.\n\n${partes.length ? 'Os slides de texto são trecho do texto da exposição' + (tx && tx.assinatura ? ', de ' + tx.assinatura : ', da ' + e.v) + '. Texto completo em ' + urlTexto + '\n\n' : ''}Salva para ir e manda para quem vai com você. Agenda completa de exposições em vernissagessp.com.br\n\n#exposicaosp #arteemsp #saopaulo #artecontemporanea #galeriadearte`;
  fs.writeFileSync(path.join(out, 'exposicao-LEGENDA.md'), semTravessao(leg) + '\n');
  if (e.img) marcarFoto(e.img, flag('pub', hoje));
  console.log(`OK ${nSlide} slides em ${path.relative(RAIZ, out)} · legenda ${leg.length} caracteres`);
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
