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

function slide(o, indice) {
  const pal = PALETAS[o.c.paleta] || PALETAS.escuro;
  const quem = autoria(o.e);
  const temFoco = typeof o.e.foco === 'number';
  const imagem = o.rel
    ? `<img class="sangra" src="${esc(o.rel)}"${temFoco ? ` style="object-position:${o.e.foco}% 50%"` : ''}>`
    : '';
  return `<div class="slide story story--${o.c.chave}${o.rel ? '' : ' story--tipo'}" data-i="${indice}">
    ${imagem}
    <div class="faixa">
      <div class="selo">${esc(o.c.selo)}</div>
      <div class="tit">${esc(tituloCurto(o.e))}</div>
      ${quem ? `<div class="quem">${esc(quem)}</div>` : ''}
      <div class="serv">${esc(o.v.name)} ${esc(arroba(o.v.ig))}<br>${esc(o.v.b)}${o.e.fim ? ' · até ' + esc(porExtenso(o.e.fim)) : ''}</div>
    </div>
    ${o.rel && o.e.cred ? `<div class="cred">${esc(o.e.cred)}</div>` : ''}
    <div class="marca">${MARCA_HTML}</div>
  </div>`;
}

function css(pal) {
  return `${CSS}
    .slide.story{width:${W}px;height:${H}px;position:relative;overflow:hidden}
    .slide.story::after{display:none}
    .story .sangra{position:absolute;left:0;top:0;width:100%;height:${ALTURA_IMAGEM}px;object-fit:cover;display:block}
    .story .faixa{position:absolute;left:88px;right:88px;top:${ALTURA_IMAGEM + 70}px}
    .story--tipo .faixa{top:520px}
    .story .selo{font-size:22px;font-weight:500;letter-spacing:.30em;text-transform:uppercase;margin-bottom:26px}
    .story .tit{font-size:68px;font-weight:400;line-height:1.1;letter-spacing:-.016em}
    .story--tipo .tit{font-size:92px}
    .story .quem{font-size:34px;font-weight:300;margin-top:16px}
    .story .serv{font-size:28px;font-weight:300;margin-top:34px;line-height:1.55}
    .story .cred{position:absolute;left:88px;right:300px;bottom:84px;font-size:18px;font-weight:300}
    .story .marca{left:auto;right:88px;bottom:84px}
    ${cssPaleta(pal, 0.05)}`;
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

  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
  });

  const tmp = path.join(RAIZ, '.stories-tmp.html');
  const feitos = [];
  for (let i = 0; i < lista.length; i++) {
    const o = lista[i];
    const pal = PALETAS[o.c.paleta] || PALETAS.escuro;
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css(pal)}
      .story .selo{color:${pal.fraco}} .story .quem{color:${pal.meio}} .story .serv{color:${pal.meio}}
      .story .tit{color:${pal.texto}}</style></head><body>${slide(o, i)}</body></html>`;
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
