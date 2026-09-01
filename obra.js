/* ============================================================
   A OBRA / ENCERRA / ESTREIA — formatos de imagem do Vernissages SP
   ============================================================

   O que é.

   Uma obra em cartaz, sozinha, grande. Slide 1: a imagem sangrando nas quatro
   bordas, SEM uma palavra — nem assinatura, nem numeração. Marca d'água sobre
   o trabalho de um artista não vira. Slide 2: a mesma obra na proporção real,
   flutuando na paleta, com a etiqueta de parede.

   Três modos, mesmo desenho (`cfg.modo`):
   - `obra`    — a imagem mais forte em cartaz. Ordena por qualidade de imagem.
   - `encerra` — última semana. Filtra por `fechaEm` e ordena pela mais urgente.
                 O slide 2 lidera com "última semana · fecha DD.MM".
   - `estreia` — o que abre nos próximos dias. Ordena pela abertura mais próxima.
                 O slide 2 lidera com "estreia · abre DD.MM".

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
  const fora = new Set([].concat(cfg.fora || [], cfg.evitar || []));
  const modo = cfg.modo || 'obra';

  let filtro = Object.assign({ vista: false }, cfg.filtro);
  if (modo === 'encerra' && filtro.fechaEm == null) filtro.fechaEm = 14;
  if (cfg.filtro || modo !== 'obra') console.log('  modo ' + modo +
    (Object.keys(filtro).length > 1 ? ' · recorte ' + descreverFiltro(filtro) : ''));

  const vivas = (DATA.expos || []).filter(e => {
    if (!V[e.v] || e.cartaz || fora.has(e.t + '|' + e.v)) return false;
    if (modo === 'estreia') {
      if (!e.ini || e.ini <= hoje) return false;
      if (_dias(hoje, e.ini) > (cfg.abreEm || 10)) return false;
      return passaFiltro(e, V[e.v], hoje, filtro);
    }
    if (!e.ini || e.ini > hoje || (e.fim && e.fim < hoje)) return false;
    return passaFiltro(e, V[e.v], hoje, filtro);
  });

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
    nota += Math.min(6, dim.w / 500);
    nota += Math.min(4, kb / 250);
    if (v.tipo === 'galeria') nota += 3;
    if ((e.a || '').split(',').length === 1 && e.a) nota += 3;
    if (e.d && e.d.length > 30) nota += 2;
    if (e.ini && _dias(e.ini, hoje) <= 30) nota += 2;
    /* casa que já saiu esta semana perde pontos, e mais a cada repetição —
       não some, mas cede a vez enquanto houver outra opção decente. */
    nota -= 6 * (cfg.evitarCasa || []).filter(c => c === v.name).length;

    cand.push({ e, v, rel, dim, nota, kb, modo });
  }

  if (modo === 'encerra')       cand.sort((a, b) => a.e.fim.localeCompare(b.e.fim) || b.nota - a.nota);
  else if (modo === 'estreia')  cand.sort((a, b) => a.e.ini.localeCompare(b.e.ini) || b.nota - a.nota);
  else                          cand.sort((a, b) => b.nota - a.nota);
  return cand;
}

/* ---------- montagem ---------- */

/* Slide da obra, tela cheia. NADA por cima da imagem — nem a assinatura,
   nem a numeração. Marca d'água sobre o trabalho de um artista não vira; a
   identificação mora no slide 2 e na legenda. É a regra do Contemporary Art
   Daily, e é o que faz a imagem parecer obra em vez de anúncio. */
function slideCheia(o) {
  return `<div class="slide slide--cheia">
    <img class="sangra" src="${esc(o.rel)}">
  </div>`;
}

const _curto = iso => iso.slice(8, 10) + '.' + iso.slice(5, 7);

function slideEtiqueta(o, cfg) {
  const modo = cfg.modo || 'obra';
  /* A imagem ocupa a metade de cima; a etiqueta de parede, a de baixo. Quando
     há selo (encerra/estreia) a imagem cede um pouco de altura para ele. */
  const temSelo = modo === 'encerra' || modo === 'estreia';
  const cx = W - 96 * 2, cy = temSelo ? 620 : 700;
  const k = Math.min(cx / o.dim.w, cy / o.dim.h);
  const w = Math.round(o.dim.w * k), h = Math.round(o.dim.h * k);
  const topo = Math.round(110 + (cy - h) / 2);
  const quem = autoria(o.e);
  /* nota só quando o config pede: a etiqueta de parede é título, autor, casa e
     prazo. Descrição longa empurra o crédito e a marca para fora do quadro. */
  const nota = cfg.nota || '';

  let selo = '';
  if (modo === 'encerra') selo = `<div class="selo">última semana</div>
    <div class="prazo">fecha ${_curto(o.e.fim)}</div>`;
  else if (modo === 'estreia') selo = `<div class="selo">estreia</div>
    <div class="prazo">abre ${_curto(o.e.ini)}</div>`;

  return `<div class="slide slide--${modo}">
    <img class="obra" src="${esc(o.rel)}" style="left:${Math.round((W - w) / 2)}px;top:${topo}px;width:${w}px;height:${h}px">
    <div class="etq" style="top:900px">
      ${selo}
      <div class="tit">${esc(tituloCurto(o.e))}</div>
      ${quem ? `<div class="quem">${esc(quem)}</div>` : ''}
      <div class="serv">${esc(o.v.name)} ${esc(arroba(o.v.ig))} · ${esc(o.v.b)}<br>
        ${o.e.fim ? 'até ' + esc(porExtenso(o.e.fim)) : 'encerramento não divulgado'}</div>
      ${nota ? `<div class="nota">${esc(nota)}</div>` : ''}
    </div>
    <div class="cred">${esc(o.e.cred)}</div>
    <div class="marca">Vernissages SP</div>
  </div>`;
}

function montarHTML(o, cfg) {
  const total = 2;
  const s = slideCheia(o) + slideEtiqueta(o, cfg);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    .slide--cheia{background:#000}
    .slide--cheia::after{display:none}
    .slide .sangra{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    .slide .etq{position:absolute;left:88px;right:88px}
    .slide .marca{left:auto;right:88px;bottom:84px}
    .slide .etq .tit{font-size:44px;font-weight:400;line-height:1.14;letter-spacing:-.014em}
    .slide .etq .quem{font-size:27px;font-weight:300;margin-top:10px}
    .slide .etq .serv{font-size:22px;font-weight:300;margin-top:22px;line-height:1.55}
    .slide .etq .nota{font-size:23px;font-weight:300;line-height:1.5;margin-top:22px;max-width:840px}
    .slide .etq .selo{font-size:17px;font-weight:500;letter-spacing:.30em;text-transform:uppercase;margin-bottom:14px}
    .slide .etq .prazo{font-size:52px;font-weight:300;letter-spacing:-.02em;margin-bottom:22px;line-height:1}
    ${cssPaleta(cfg.paleta, cfg.textura)}
    .slide .etq .nota{color:${cfg.paleta.meio}}
    .slide .etq .selo{color:${cfg.paleta.fraco}}
    .slide .etq .prazo{color:${cfg.paleta.texto}}
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
  console.log('PICK ' + o.e.t + '|' + o.e.v);
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
