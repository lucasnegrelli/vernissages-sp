/* ============================================================
   A OBRA — formato de social do Vernissages SP
   ============================================================

   O que é.

   Uma obra em cartaz, sozinha, grande. Slide 1: a imagem sangrando nas quatro
   bordas, sem uma palavra. Slide 2: a mesma obra na proporção real, flutuando
   no escuro, com a etiqueta de parede — título, artista, casa, até quando.

   Por que existe.

   Os formatos de lista (salão, rolê, deriva) fazem a obra de miniatura e o
   texto de protagonista, e o feed vira cinza sobre preto. O Contemporary Art
   Daily provou o contrário há quinze anos: uma reprodução, tela cheia, três
   linhas. Selecionar já é opinar. Este formato é isso, e monta sozinho.

   As travas:

   1. NÃO SAI SEM A OBRA. Sem imagem em disco, sem crédito, ou marcada
      `vista: true` (parede, não trabalho) — aborta. Mesma régua da rima.
   2. IMAGEM CURTA NÃO ENTRA. Abaixo de 1400 px de largura a tela cheia
      revela o pixel. O piso da régua do OPERACAO.md é 1600; aqui 1400 é o
      mínimo absoluto, e o score prefere as grandes.
   3. FLYER NÃO É OBRA. `cartaz: true` no dados.js exclui na hora.

   Uso:
     node obra.js --config=SOCIAL/09/03/obra.json --out=SOCIAL/09/03 --date=2026-09-03
     node obra.js --seco                (mostra a escolha, não renderiza)
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, exigirObra, medir, RAIZ, CSS, esc, porExtenso,
        arroba, tituloCurto, autoria, PALETAS, cssPaleta, passaFiltro,
        descreverFiltro } = base;

const W = 1080, H = 1350;
const MIN_LARGURA = 1400;

const _dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00') - Date.parse(a + 'T12:00:00')) / 864e5);

/* ---------- escolha ---------- */

async function escolher(DATA, hoje, cfg) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const fora = new Set(cfg.fora || []);
  if (cfg.filtro) console.log('  recorte: ' + descreverFiltro(cfg.filtro));

  const vivas = (DATA.expos || []).filter(e =>
    e.ini && e.ini <= hoje && (!e.fim || e.fim >= hoje) &&
    V[e.v] && !e.cartaz && !fora.has(e.t + '|' + e.v) &&
    passaFiltro(e, V[e.v], hoje, Object.assign({ vista: false }, cfg.filtro)));

  const cand = [];
  for (const e of vivas) {
    let rel;
    try { rel = exigirObra(e, { recusarVista: true }); }
    catch { continue; }
    let dim;
    try { dim = await medir(rel); } catch { continue; }
    if (!dim.w || dim.w < MIN_LARGURA) continue;

    const v = V[e.v];
    const kb = fs.statSync(path.resolve(RAIZ, rel)).size / 1024;
    let nota = 0;
    nota += Math.min(6, dim.w / 500);                       // largura: quanto maior, melhor
    nota += Math.min(4, kb / 250);                          // peso do arquivo
    if (v.tipo === 'galeria') nota += 3;                    // galeria tem a reprodução de verdade
    if ((e.a || '').split(',').length === 1 && e.a) nota += 3; // individual rende
    if (e.d && e.d.length > 30) nota += 2;                  // tem um fato pra etiqueta
    if (e.ini && _dias(e.ini, hoje) <= 30) nota += 2;       // recém-aberta

    cand.push({ e, v, rel, dim, nota, kb });
  }

  cand.sort((a, b) => b.nota - a.nota);
  return cand;
}

/* ---------- montagem ---------- */

function slideCheia(o, total) {
  return `<div class="slide">
    <img class="sangra" src="${esc(o.rel)}">
    <div class="veu"></div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">1/${total}</div>
  </div>`;
}

function slideEtiqueta(o, cfg, total) {
  const cx = W - 96 * 2, cy = 812;
  const k = Math.min(cx / o.dim.w, cy / o.dim.h);
  const w = Math.round(o.dim.w * k), h = Math.round(o.dim.h * k);
  const topo = Math.round(120 + (cy - h) / 2);
  const quem = autoria(o.e);
  const nota = cfg.nota || (o.e.d && o.e.d.length > 24 ? o.e.d : '');
  return `<div class="slide">
    <img class="obra" src="${esc(o.rel)}" style="left:${Math.round((W - w) / 2)}px;top:${topo}px;width:${w}px;height:${h}px">
    <div class="etq" style="top:1010px">
      <div class="tit">${esc(tituloCurto(o.e))}</div>
      ${quem ? `<div class="quem">${esc(quem)}</div>` : ''}
      <div class="serv">${esc(o.v.name)} ${esc(arroba(o.v.ig))} · ${esc(o.v.b)}<br>
        ${o.e.fim ? 'até ' + esc(porExtenso(o.e.fim)) : 'encerramento não divulgado'}</div>
      ${nota ? `<div class="nota">${esc(nota)}</div>` : ''}
    </div>
    <div class="cred">${esc(o.e.cred)}</div>
    <div class="pag">${total}/${total}</div>
  </div>`;
}

function montarHTML(o, cfg) {
  const total = 2;
  const s = slideCheia(o, total) + slideEtiqueta(o, cfg, total);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    .slide .sangra{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    .slide .veu{position:absolute;left:0;right:0;bottom:0;height:200px;z-index:2;pointer-events:none;
      background:linear-gradient(transparent,rgba(0,0,0,.55))}
    .slide .sangra ~ .marca,.slide .sangra ~ .pag{color:rgba(237,234,228,.85);z-index:3}
    .slide .etq{position:absolute;left:88px;right:88px}
    .slide .etq .tit{font-size:44px;font-weight:400;line-height:1.14;letter-spacing:-.014em}
    .slide .etq .quem{font-size:27px;font-weight:300;margin-top:10px}
    .slide .etq .serv{font-size:22px;font-weight:300;margin-top:22px;line-height:1.55}
    .slide .etq .nota{font-size:23px;font-weight:300;line-height:1.5;margin-top:22px;max-width:840px}
    ${cssPaleta(cfg.paleta, cfg.textura)}
    .slide .etq .nota{color:${cfg.paleta.meio}}
    </style></head><body>${s}</body></html>`;
}

/* ---------- execução ---------- */

async function principal() {
  const argv = process.argv.slice(2);
  const seco = argv.includes('--seco');
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));

  let cfg;
  if (seco && !argv.some(x => x.startsWith('--config='))) {
    cfg = { paleta: 'escuro', textura: 0.05, nome: 'obra' };
  } else {
    cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  }
  const paletaNome = cfg.paleta;
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.escuro;

  const DATA = carregarDados();
  const cand = await escolher(DATA, hoje, cfg);

  console.log(cand.length + ' obra(s) elegível(is) em cartaz em ' + hoje +
    (cfg.filtro ? ' no recorte' : ''));
  if (!cand.length) throw new Error('Nenhuma obra passa a régua (imagem em disco, ≥' +
    MIN_LARGURA + ' px, crédito, não vista de sala, não cartaz). Amplie o filtro ou espelhe imagem.');

  const o = cand[0];
  console.log('\n  escolhida: ' + tituloCurto(o.e) + (autoria(o.e) ? ' — ' + autoria(o.e) : '') +
    '  ·  ' + o.v.name + '\n  ' + Math.round(o.dim.w) + '×' + Math.round(o.dim.h) + ' px · ' +
    Math.round(o.kb) + ' KB · nota ' + o.nota.toFixed(1));
  if (cand[1]) console.log('  vice: ' + tituloCurto(cand[1].e) + ' — ' + cand[1].v.name +
    ' (nota ' + cand[1].nota.toFixed(1) + ')');
  console.log('  paleta ' + paletaNome + ' · nota de etiqueta: ' +
    (cfg.nota ? 'do config' : (o.e.d ? 'campo d' : 'nenhuma')));

  if (seco) { console.log('\n--seco: nada foi renderizado.'); return; }

  const saida = path.resolve(RAIZ, flag('out', '.'));
  const tmp = path.join(RAIZ, '.obra-tmp.html');
  fs.writeFileSync(tmp, montarHTML(o, cfg), 'utf8');

  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
  });
  const page = await browser.newPage();
  page.on('pageerror', x => console.log('PAGEERROR: ' + x.message));
  await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  fs.mkdirSync(saida, { recursive: true });
  const els = await page.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    const p = path.join(saida, (cfg.nome || 'obra') + '-' + String(i + 1).padStart(2, '0') + '.png');
    await els[i].screenshot({ path: p });
    console.log('OK ' + p);
  }
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('\n' + els.length + ' slides · ' + tituloCurto(o.e) + ', ' + o.v.name);
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
