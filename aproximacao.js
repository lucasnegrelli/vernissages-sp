/* ============================================================
   APROXIMAÇÃO — formato de social do Vernissages SP
   ============================================================

   O que e.

   Uma obra so, lida de perto. A peca comeca num recorte tao fechado que o
   leitor nao sabe o que esta vendo — so superficie, materia, cor — e vai
   abrindo ate revelar o trabalho inteiro. Depois vem a leitura: o que aquilo
   e feito, o que aquilo faz, de onde vem o titulo.

   E o contrario exato da RIMA. La a operacao e comparar duas mostras e
   afirmar algo que nenhuma diz sozinha; aqui e ficar parado diante de uma so.
   Amplitude e profundidade, publicadas em dias diferentes, com o mesmo
   sistema visual.

   Por que o zoom e o assunto.

   Um recorte fechado nao e efeito: e a unica forma de mostrar no feed o que
   so se ve com o corpo a vinte centimetros da obra. Filigrana de ouro, poro
   de concreto, trama de linha, craquele de tinta — nada disso sobrevive numa
   foto de mostra inteira. O formato existe para devolver essa escala.

   As travas, no codigo:

   1. AS MESMAS DA RIMA. Obra em disco, peso minimo, credito presente.
      Importadas de rima.js, para nao divergirem com o tempo.

   2. DENSIDADE. Esta e nova e e a razao de o formato existir. Um recorte so
      pode ser publicado se houver pixel de verdade por tras dele. O script
      calcula, para cada nivel de zoom, quantos pixels da imagem original
      alimentam cada pixel do slide — e aborta se ficar abaixo de DENSIDADE_MIN.
      Levantamento de 24/08/2026: de 33 obras em cartaz com imagem espelhada,
      26 estavam salvas em 1200x630, que e a medida de card de rede social.
      Aquilo e preview de link, nao reproducao de obra, e nao aguenta zoom
      nenhum. O formato recusa em vez de publicar borrao.

   3. NENHUM RECORTE SE REPETE. Os niveis tem de ser estritamente decrescentes
      e o ultimo slide mostra a obra inteira, contida — nunca o mesmo
      enquadramento duas vezes.

   Uso:
     node aproximacao.js --config=SOCIAL/08/25/aproximacao.json --out=SOCIAL/08/25

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, acharExpo, exigirObra, medir, chave, RAIZ,
        CSS, esc, porExtenso, carimbo, arroba, tituloCurto, autoria,
        PALETAS, cssPaleta } = base;

const W = 1080, H = 1350;

/* Pixels de origem por pixel renderizado. 1.0 e nitidez plena. Abaixo de 0.72
   o olho comeca a ver o upscale mesmo depois da compressao do Instagram —
   medido comparando recortes da mesma obra em 2500px e em 1200px. */
const DENSIDADE_MIN = 0.72;

/* Escala em que a imagem cobre o quadro inteiro. Toda conta de zoom parte
   daqui: zoom 1 ja e um recorte, porque obra apaisada em quadro 4:5 perde as
   laterais de qualquer jeito. */
const escalaCover = dim => Math.max(W / dim.w, H / dim.h);

function conferirDensidade(dim, zoom) {
  const s = escalaCover(dim) * zoom;
  const larguraOrigem = W / s;          // quantos px da original entram no quadro
  return { densidade: larguraOrigem / W, larguraOrigem: Math.round(larguraOrigem), s };
}

/* Recorte: a imagem e posicionada dentro de um quadro com overflow hidden, de
   modo que o ponto focal (foco.x, foco.y em coordenadas relativas da obra)
   caia no centro do slide. */
function slideRecorte(o, zoom, foco, n, total) {
  const { s } = conferirDensidade(o.dim, zoom);
  const iw = Math.round(o.dim.w * s), ih = Math.round(o.dim.h * s);
  let left = Math.round(W / 2 - foco.x * iw);
  let top = Math.round(H / 2 - foco.y * ih);
  /* Nao deixa entrar tarja: se o foco pedido joga a borda da obra para dentro
     do quadro, o recorte e empurrado de volta. Preto sobrando num recorte e
     erro de enquadramento, nao estetica. */
  left = Math.min(0, Math.max(W - iw, left));
  top = Math.min(0, Math.max(H - ih, top));
  return `<div class="slide">
    <img class="obra" src="${esc(o.rel)}" style="left:${left}px;top:${top}px;width:${iw}px;height:${ih}px">
    <div class="pag" style="color:rgba(255,255,255,.55);mix-blend-mode:difference">${n}/${total}</div>
  </div>`;
}

/* A obra inteira, contida e flutuando no escuro, com a ficha completa.
   E o slide da revelacao: so aqui o leitor ve o que estava olhando. */
function slideInteira(o, n, total) {
  const cx = W - 88 * 2, cy = 760;
  const k = Math.min(cx / o.dim.w, cy / o.dim.h);
  const w = Math.round(o.dim.w * k), h = Math.round(o.dim.h * k);
  const quem = autoria(o.e);
  return `<div class="slide">
    <div class="kick">a obra inteira</div>
    <img class="obra" src="${esc(o.rel)}" style="left:${Math.round((W - w) / 2)}px;top:${Math.round(210 + (cy - h) / 2)}px;width:${w}px;height:${h}px">
    <div class="ficha" style="top:1040px">
      <div class="tit">${esc(tituloCurto(o.e))}</div>
      ${quem ? '<div class="quem">' + esc(quem) + '</div>' : ''}
    </div>
    <div class="cred">${esc(o.e.cred)}</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function montarHTML(o, cfg) {
  const total = cfg.zooms.length + 3;
  const recortes = cfg.zooms.map((z, i) =>
    slideRecorte(o, z.zoom, z.foco, i + 1, total)).join('');

  const leitura = `<div class="slide">
    <div class="kick">a leitura</div>
    <div class="risco" style="top:150px"></div>
    <div class="arg" style="top:236px">${cfg.leitura.map(p => '<p style="margin-bottom:28px">' + esc(p) + '</p>').join('')}
      <span class="virada">${esc(cfg.virada)}</span></div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">${total - 1}/${total}</div>
  </div>`;

  const quem = autoria(o.e);
  const onde = `<div class="slide">
    <div class="kick">onde ver</div>
    <div class="risco" style="top:150px"></div>
    <div class="ficha" style="top:210px;bottom:210px;display:flex;flex-direction:column;justify-content:center">
      <div>
        <div class="tit">${esc(tituloCurto(o.e))}</div>
        ${quem ? '<div class="quem">' + esc(quem) + '</div>' : ''}
        <div class="serv">${esc(o.v.name)} ${esc(arroba(o.v.ig))}<br>
          ${esc(o.v.addr)}, ${esc(o.v.b)}<br>
          ${o.e.fim ? 'até ' + esc(porExtenso(o.e.fim)) : 'encerramento não divulgado'}</div>
      </div>
      ${cfg.carimbo ? '<div class="serv" style="margin-top:70px;color:#46443F;font-size:19px">Endereço e prazo conferidos na base do Vernissages SP em ' + esc(cfg.carimbo) + '.</div>' : ''}
    </div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">${total}/${total}</div>
  </div>`;

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta, cfg.textura)}
    .slide .obra{position:absolute}</style></head><body>` +
    recortes + slideInteira(o, total - 2, total) + leitura + onde +
    `</body></html>`;
}

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  const saida = path.resolve(RAIZ, flag('out', '.'));
  cfg.carimbo = carimbo(cfg, flag('date', new Date().toISOString().slice(0, 10)));
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.escuro;

  const DATA = carregarDados();
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const e = acharExpo(DATA, cfg.obra);
  const o = { e, v: V[e.v], rel: exigirObra(e, { recusarVista: true }) };
  o.dim = await medir(o.rel);

  /* Trava 3: recortes estritamente decrescentes. */
  for (let i = 1; i < cfg.zooms.length; i++) {
    if (cfg.zooms[i].zoom >= cfg.zooms[i - 1].zoom) {
      throw new Error('Os recortes tem de abrir, nunca fechar ou repetir: nivel ' +
        (i + 1) + ' (' + cfg.zooms[i].zoom + 'x) nao e menor que o anterior.');
    }
  }

  /* Trava 2: densidade. */
  console.log('obra ' + o.dim.w + 'x' + o.dim.h + ' — ' + o.rel);
  cfg.zooms.forEach((z, i) => {
    const d = conferirDensidade(o.dim, z.zoom);
    const marca = d.densidade >= 1 ? 'nitido' : d.densidade >= DENSIDADE_MIN ? 'aceitavel' : 'REPROVADO';
    console.log('  recorte ' + (i + 1) + ': ' + z.zoom + 'x · ' + d.larguraOrigem +
      ' px de origem para ' + W + ' · densidade ' + d.densidade.toFixed(2) + ' · ' + marca);
    if (d.densidade < DENSIDADE_MIN) {
      throw new Error('Recorte ' + (i + 1) + ' nao tem pixel para sustentar ' + z.zoom +
        'x: densidade ' + d.densidade.toFixed(2) + ', minimo ' + DENSIDADE_MIN +
        '.\n  A imagem espelhada tem ' + o.dim.w + ' px de largura. Para este zoom seriam necessarios ' +
        Math.ceil(o.dim.w * DENSIDADE_MIN / d.densidade) + ' px.' +
        '\n  Consiga a reproducao em alta com a galeria, ou afrouxe o zoom. Nao publique borrao.');
    }
  });

  const tmp = path.join(RAIZ, '.aprox-tmp.html');
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
  await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 900));

  fs.mkdirSync(saida, { recursive: true });
  const els = await page.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    const p = path.join(saida, cfg.nome + '-' + String(i + 1).padStart(2, '0') + '.png');
    await els[i].screenshot({ path: p });
    console.log('OK ' + p);
  }
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('\n' + els.length + ' slides · recortes decrescentes · densidade conferida em todos');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
