/* ============================================================
   DE GRAÇA, VALE MILHÕES — formato de social do Vernissages SP
   ============================================================

   O que é.

   Uma obra em cartaz numa casa de entrada franca, ao lado do recorde de
   leilão do artista. A tensão é o gancho: você entra sem pagar para ver
   alguém cujo trabalho já valeu milhões num pregão. Primeiro item do banco
   de "dinheiro e mercado" do IDEIAS.md (26/09/2026).

   Por que é curado, não automático.

   `obra`, `encerra`, `estreia`, `salão` montam sozinhos porque só arranjam o
   que já está no dados.js. Este formato afirma um número de mercado — quanto
   uma obra específica valeu num leilão específico — e isso não sai da base
   de exposições. Publicar sem fonte verificável é o tipo de erro que uma
   correção não desfaz. Por isso a régua da rima e da aproximação: sem
   config, sem peça, e o config exige a fonte por escrito.

   As travas:

   1. SEM RECORDE, SEM FONTE, NÃO SAI. `recorde.valor` e `recorde.fonte` são
      obrigatórios — a peça não publica número de mercado que ninguém possa
      checar.
   2. A CASA TEM DE SER DE ENTRADA FRANCA. Mesma regra do rodapé do site
      (`ingressoDe` no index.html): `v.ing.g`, ou galeria comercial sem `ing`
      declarado. Museu ou instituto com bilheteria não entra — o gancho é
      exatamente a entrada livre.
   3. MESMA OBRA, MESMAS TRAVAS DA RIMA. Imagem em disco, crédito, não vista
      de sala — importadas de rima.js.

   Uso:
     node valemilhoes.js --config=SOCIAL/10/12/valemilhoes.json --out=SOCIAL/10/12
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, acharExpo, exigirObra, medir, RAIZ,
        CSS, esc, porExtenso, carimbo, arroba, tituloCurto, autoria,
        PALETAS, cssPaleta } = base;

const W = 1080, H = 1350;

/* Mesma régua do rodapé do site (index.html, ingressoDe/ingTag): `ing`
   explícito manda; sem ele, galeria comercial é sempre entrada franca. */
function entradaFranca(v) {
  if (v.ing) return !!v.ing.g;
  return v.tipo === 'galeria';
}

function slideCheia(o) {
  return `<div class="slide slide--cheia">
    <img class="sangra" src="${esc(o.rel)}">
  </div>`;
}

function slideRecorde(o, cfg) {
  const r = cfg.recorde;
  return `<div class="slide">
    <div class="kick">entrada franca</div>
    <div class="risco" style="top:150px"></div>
    <div class="tese" style="top:210px">${esc(r.valor)}</div>
    <div class="arg" style="top:${r.valor.length > 14 ? 470 : 420}px">foi o que <b>${esc(r.obraLeiloada)}</b>${
      r.ano ? ', de ' + esc(autoria(o.e) || '') : ''} alcançou${
      r.leiloeira ? ' na ' + esc(r.leiloeira) : ' em leilão'}${r.ano ? ', em ' + esc(String(r.ano)) : ''}.
      <span class="virada">Pra ver o trabalho dele agora, a entrada é de graça.</span></div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">2/3</div>
  </div>`;
}

function slideFicha(o, cfg) {
  const quem = autoria(o.e);
  return `<div class="slide">
    <div class="kick">onde ver, de graça</div>
    <div class="risco" style="top:150px"></div>
    <div class="ficha" style="top:210px;bottom:210px;display:flex;flex-direction:column;justify-content:center">
      <div>
        <div class="tit">${esc(tituloCurto(o.e))}</div>
        ${quem ? '<div class="quem">' + esc(quem) + '</div>' : ''}
        <div class="serv">${esc(o.v.name)} ${esc(arroba(o.v.ig))} · entrada franca<br>
          ${esc(o.v.addr)}, ${esc(o.v.b)}<br>
          ${o.e.fim ? 'até ' + esc(porExtenso(o.e.fim)) : 'encerramento não divulgado'}</div>
      </div>
      <div class="serv" style="margin-top:70px;font-size:18px">Recorde de leilão: ${esc(cfg.recorde.fonte)}.${
        cfg.carimbo ? ' Endereço e prazo conferidos na base do Vernissages SP em ' + esc(cfg.carimbo) + '.' : ''}</div>
    </div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">3/3</div>
  </div>`;
}

function montarHTML(o, cfg) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    .slide--cheia{background:#000}
    .slide--cheia::after{display:none}
    .slide .sangra{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    ${cssPaleta(cfg.paleta, cfg.textura)}</style></head><body>` +
    slideCheia(o) + slideRecorde(o, cfg) + slideFicha(o, cfg) +
    `</body></html>`;
}

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  const saida = path.resolve(RAIZ, flag('out', '.'));
  cfg.carimbo = carimbo(cfg, flag('date', new Date().toISOString().slice(0, 10)));
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.temporada || PALETAS.escuro;

  if (!cfg.recorde || !cfg.recorde.valor || !cfg.recorde.fonte) {
    throw new Error('SEM FONTE: a peça não publica número de mercado sem fonte verificável.\n' +
      '  Preencha recorde.valor (ex.: "R$ 2,3 milhões"), recorde.obraLeiloada, recorde.leiloeira,\n' +
      '  recorde.ano e recorde.fonte (onde o Lucas confirmou o valor).');
  }

  const DATA = carregarDados();
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const e = acharExpo(DATA, cfg.obra);
  const v = V[e.v];

  if (!entradaFranca(v)) {
    throw new Error('CASA NÃO É DE ENTRADA FRANCA: ' + v.name + ' tem bilheteria (ou não está marcada ' +
      'como galeria comercial). O gancho da peça é a entrada livre — escolha outra mostra, ou confirme ' +
      'v.ing.g:true no dados.js se a casa for gratuita de verdade.');
  }

  const o = { e, v, rel: exigirObra(e, { recusarVista: true }) };
  o.dim = await medir(o.rel);

  console.log('obra ' + o.dim.w + 'x' + o.dim.h + ' — ' + o.rel);
  console.log('recorde: ' + cfg.recorde.valor + ' — ' + cfg.recorde.obraLeiloada +
    (cfg.recorde.ano ? ' (' + cfg.recorde.ano + ')' : '') + ' · fonte: ' + cfg.recorde.fonte);
  console.log('PICK ' + o.e.t + '|' + o.e.v);

  const tmp = path.join(RAIZ, '.valemilhoes-tmp.html');
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
  console.log('\n' + els.length + ' slides · entrada franca conferida · fonte do recorde citada');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
