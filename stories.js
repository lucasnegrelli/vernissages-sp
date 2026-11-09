#!/usr/bin/env node
/* ============================================================
   stories.js — stories do dia, montados sozinhos da base. 1080x1920.

   POR QUE EXISTE (13/10/2026)
   O feed vive com 1 peça por dia e a grade de 5 por semana: é o que o
   perfil aguenta e o que o Lucas consegue revisar. Frequência cabe no
   story, que custa pouco e não dilui o feed. Este gerador faz o que o
   `dados.js` já sabe de graça, uma peça por fato do dia:

     ABRE HOJE · ABRE AMANHÃ · ÚLTIMO DIA · FECHA AMANHÃ

   REGRAS (as mesmas do resto do projeto)
   1. Nada é inventado: título, casa, bairro, datas e crédito vêm da base.
   2. Nada escrito por cima da obra: a imagem ocupa o alto, o texto mora
      na faixa de baixo (mesma regra do POSTS.md §5.1).
   3. Mostra sem imagem que passe na régua sai como cartão tipográfico:
      continua sendo informação verdadeira, só que sem foto.
   4. Nada é postado. Todos param no arquivo.

   Uso:
     node stories.js                       (hoje, grava em SOCIAL/MM/DD/)
     node stories.js --date=2026-10-17     (outro dia)
     node stories.js --seco                (lista, não renderiza)
     node stories.js --max=8               (teto de peças; padrão 8)
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, exigirObra, medir, RAIZ, CSS, esc, porExtenso,
        arroba, tituloCurto, autoria, PALETAS, cssPaleta, MARCA_HTML } = base;

const W = 1080, H = 1920;
const ALTURA_IMAGEM = 1180;     // alto reservado à obra; abaixo, a faixa de texto
const MIN_LARGURA = 900;        // story é menor que o feed: 900 px já aguenta

const dia = iso => Date.parse(iso + 'T12:00:00');
const somaDias = (iso, n) => new Date(dia(iso) + n * 864e5).toISOString().slice(0, 10);
const curto = iso => iso.slice(8, 10) + '.' + iso.slice(5, 7);

/* O que o story diz, em ordem de peso. O selo é o gancho; a data, o fato. */
function classificar(e, hoje, soComImagem) {
  const amanha = somaDias(hoje, 1);
  if (e.fim === hoje)   return { chave: 'ultimo',  selo: 'último dia',    linha: 'hoje',            peso: 1, paleta: 'escuro' };
  if (e.ini === hoje)   return { chave: 'abre',    selo: 'abre hoje',     linha: 'hoje',            peso: 2, paleta: 'linho'  };
  if (e.fim === amanha) return { chave: 'fecha',   selo: 'fecha amanhã',  linha: curto(e.fim),      peso: 3, paleta: 'tinta'  };
  if (e.ini === amanha) return { chave: 'abreAm',  selo: 'abre amanhã',   linha: curto(e.ini),      peso: 4, paleta: 'barro'  };
  /* sem fato do dia com obra, o story de reserva é 'fecha em N dias' (só com imagem) */
  if (soComImagem && e.fim && e.fim > amanha && e.fim <= somaDias(hoje, 7)) {
    const n = Math.round((dia(e.fim) - dia(hoje)) / 864e5);
    return { chave: 'semana', selo: 'fecha em ' + n + ' dias', linha: curto(e.fim), peso: 5, paleta: 'escuro' };
  }
  return null;
}

async function escolher(DATA, hoje, max, soComImagem) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const fila = [];
  for (const e of DATA.expos || []) {
    if (!V[e.v] || e.cartaz) continue;
    const c = classificar(e, hoje, soComImagem);
    if (!c) continue;
    c.hojeRef = hoje;
    let rel = null, dim = null;
    try {
      rel = exigirObra(e, { recusarVista: true });
      dim = await medir(rel);
      if (!dim.w || dim.w < MIN_LARGURA) { rel = null; dim = null; }
    } catch { rel = null; dim = null; }
    if (soComImagem && !rel) continue;   // decisão de 28/10: story sem imagem não sai
    fila.push({ e, v: V[e.v], c, rel, dim });
  }
  /* com imagem antes de sem; dentro disso, o selo de maior peso primeiro */
  fila.sort((a, b) => (a.c.peso - b.c.peso) || ((b.rel ? 1 : 0) - (a.rel ? 1 : 0)));
  return fila.slice(0, max);
}

/* ---------- story v2 (09/11/2026): papel e tinta, o fato do dia gigante, a obra inteira ----------
   Zona segura do Instagram: nada importante nos 250 px de cima nem nos de baixo. O selo ("ABRE HOJE",
   "ÚLTIMO DIA") vira o protagonista tipográfico na cor da obra; a imagem aparece inteira, sem texto por cima. */
function slide(o, indice) {
  const quem = autoria(o.e);
  const cor = (o.pal && o.pal.texto) || '#C96F4A';
  const palavras = o.c.selo.toUpperCase().split(' ');
  const linhas = palavras.length > 2 ? [palavras.slice(0, -1).join(' '), palavras[palavras.length - 1]] : palavras;
  const zonaTop = 650, zonaAlt = o.rel ? 700 : 0;
  let img = '';
  if (o.rel) {
    const k = Math.min(940 / o.dim.w, zonaAlt / o.dim.h);
    const w = Math.round(o.dim.w * k), h = Math.round(o.dim.h * k);
    const left = w < 700 ? W - 70 - w : 70;
    img = `<img class="obra" src="${esc(o.rel)}" style="left:${left}px;top:${zonaTop + zonaAlt - h}px;width:${w}px;height:${h}px">`;
  }
  const tTop = o.rel ? zonaTop + zonaAlt + 40 : 700;
  const n = tituloCurto(o.e).length;
  const tam = n <= 14 ? 100 : n <= 24 ? 80 : n <= 36 ? 66 : n <= 52 ? 56 : 48;
  return `<div class="slide story v2 story--${o.c.chave}${o.rel ? '' : ' story--tipo'}" data-i="${indice}" style="--ac:${cor}">
    <div class="selo2">${linhas.map(l => '<div>' + esc(l) + '</div>').join('')}</div>
    <div class="linha2">${esc(o.c.linha === 'hoje' ? 'hoje, ' + curto(o.c.hojeRef) : o.c.linha)}</div>
    ${img}
    <div class="tx2" style="top:${tTop}px">
      <div class="tit" style="font-size:${tam}px">${esc(tituloCurto(o.e))}</div>
      ${quem ? `<div class="quem">${esc(quem)}</div>` : ''}
      <div class="onde">${esc(o.v.name)} · ${esc(o.v.b)}</div>
      <div class="serv">${o.e.fim ? 'até ' + esc(porExtenso(o.e.fim)) : 'em cartaz'} ${o.v.ig ? '· ' + esc(arroba(o.v.ig)) : ''}</div>
      ${o.rel && o.e.cred ? `<div class="cred">${esc(o.e.cred)}</div>` : ''}
    </div>
  </div>`;
}

function css(pal) {
  return `${CSS}
    @font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
    .slide.story{width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#F2EFE9;color:#0E0E0E}
    .slide.story::after{display:none}
    .story .selo2{position:absolute;left:62px;top:240px;color:var(--ac);font-weight:800;text-transform:uppercase;line-height:.84;letter-spacing:-.075em;font-size:210px;white-space:nowrap}
    .story .linha2{position:absolute;left:70px;top:590px;font-family:'IS',serif;font-style:italic;font-size:44px;color:#0E0E0E;line-height:1}
    .story .obra{position:absolute;object-fit:contain;display:block}
    .story .tx2{position:absolute;left:70px;right:70px}
    .story .tit{font-weight:800;text-transform:uppercase;letter-spacing:-.035em;line-height:.93}
    .story .quem{font-family:'IS',serif;font-style:italic;font-size:44px;line-height:1.04;margin-top:16px}
    .story .onde{font-weight:800;font-size:26px;letter-spacing:.15em;text-transform:uppercase;margin-top:20px}
    .story .serv{font-weight:500;font-size:24px;letter-spacing:.1em;text-transform:uppercase;margin-top:6px;color:#6f6a60}
    .story .cred{position:static;width:auto;font-size:17px;font-weight:500;color:#9a948a;margin-top:14px}
    .story--tipo .tx2{top:760px}`;
}

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=').slice(1).join('=') : p; };
  const seco = argv.includes('--seco');
  const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
  const max = parseInt(flag('max', '8'), 10);

  const DATA = carregarDados();
  const lista = await escolher(DATA, hoje, max, argv.includes("--com-imagem"));

  console.log('STORIES · ' + hoje + ' · ' + lista.length + ' peça(s)');
  lista.forEach((o, i) => console.log('  ' + String(i + 1).padStart(2, '0') + ' ' + o.c.selo.padEnd(14) +
    (o.rel ? 'com obra      ' : 'tipográfico   ') + tituloCurto(o.e) + ' · ' + o.v.name));
  if (!lista.length) { console.log('Nada abre nem fecha hoje ou amanhã. Sem stories deste gerador.'); return; }
  if (seco) { console.log('\n--seco: nada foi renderizado.'); return; }

  const saida = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
  fs.mkdirSync(saida, { recursive: true });

  const puppeteer = require(path.join(process.env.RENDER_DIR || path.join(RAIZ, '.render'), 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
  });

  const D = require('./direcao.js');
  let sharpC = null; try { sharpC = require(path.join(process.env.RENDER_DIR || path.join(RAIZ, '.render'), 'node_modules', 'sharp')); } catch (x) { /* sem sharp: cor da casa */ }
  for (const o of lista) { try { o.pal = D.paletaDaCor(o.rel && sharpC ? await D.corDaObra(sharpC, path.resolve(RAIZ, o.rel)) : null); } catch (x) { o.pal = D.paletaDaCor(null); } }
  const tmp = path.join(RAIZ, '.stories-tmp.html');
  const feitos = [];
  for (let i = 0; i < lista.length; i++) {
    const o = lista[i];
    const pal = PALETAS[o.c.paleta] || PALETAS.escuro;
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css(pal)}</style></head><body>${slide(o, i)}</body></html>`;
    fs.writeFileSync(tmp, html, 'utf8');
    const page = await browser.newPage();
    page.on('pageerror', x => console.log('PAGEERROR: ' + x.message));
    await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 400));
    const el = await page.$('.slide');
    const nome = 'story-' + String(i + 1).padStart(2, '0') + '-' + o.c.chave + '.png';
    await el.screenshot({ path: path.join(saida, nome) });
    await page.close();
    console.log('OK ' + path.join(saida, nome));
    feitos.push({ arquivo: nome, selo: o.c.selo, titulo: tituloCurto(o.e), casa: o.v.name, ig: o.v.ig || null,
      comObra: !!o.rel });
  }
  await browser.close();
  try { fs.unlinkSync(tmp); } catch {}

  fs.writeFileSync(path.join(saida, 'stories.json'), JSON.stringify({ data: hoje, stories: feitos }, null, 2));
  console.log('\n' + feitos.length + ' story(ies) em ' + saida + '. A publicação continua manual.');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
