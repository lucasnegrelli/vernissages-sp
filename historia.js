/* ============================================================
   A HISTÓRIA POR TRÁS — formato de social do Vernissages SP
   ============================================================

   O que é.

   Um carrossel narrativo de 6 a 8 slides: um fato de história da arte
   contado em partes curtas, uma por slide. Pode nascer de uma obra em
   cartaz esta semana (então fecha com "onde ver") ou ser autônomo — a
   primeira Bienal, um quadro censurado, um artista recusado que virou
   referência. Segundo item do banco do IDEIAS.md (26/09/2026), ao lado do
   "De graça, vale milhões".

   Por que é curado, não automático.

   O dados.js sabe o que está em cartaz; não sabe história da arte. Cada
   parte do texto é escrita pelo Lucas com uma fonte que ele pode apontar —
   mesma régua da rima e da aproximação: sem config, sem peça, e aqui sem
   fonte, sem peça também. O script escolhe fonte (imagem, tipografia,
   paleta), nunca o fato.

   As travas:

   1. SEM FONTE, NÃO SAI. `fonte` é obrigatório — a peça não publica um fato
      histórico sem dizer de onde veio.
   2. PARTES SUFICIENTES PARA SER CARROSSEL. Entre 3 e 6 parágrafos em
      `partes` (com capa e fecho, dá 5 a 8 slides). Menos que isso é post,
      não "história por trás".
   3. SE HÁ OBRA, VALEM AS TRAVAS DA RIMA. Imagem em disco, crédito, não
      vista de sala. Sem `obra` no config a capa é só tipográfica — a peça
      não trava se a história não tiver uma mostra específica em cartaz.

   Uso:
     node historia.js --config=SOCIAL/10/12/historia.json --out=SOCIAL/10/12
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, acharExpo, exigirObra, medir, RAIZ,
        CSS, esc, porExtenso, carimbo, arroba, tituloCurto, autoria,
        PALETAS, cssPaleta, MARCA_HTML } = base;

const W = 1080, H = 1350;
const MIN_PARTES = 3, MAX_PARTES = 6;

function slideCapaObra(o) {
  return `<div class="slide slide--cheia">
    <img class="sangra" src="${esc(o.rel)}">
  </div>`;
}

function slideCapaTexto(cfg, total) {
  return `<div class="slide">
    <div class="kick">a história por trás</div>
    <div class="risco" style="top:150px"></div>
    <div style="position:absolute;left:88px;right:88px;top:214px;bottom:170px;
                display:flex;flex-direction:column;justify-content:center">
      <div class="tese" style="position:static;width:auto">${esc(cfg.titulo)}</div>
    </div>
    <div class="marca">${MARCA_HTML}</div>
    <div class="pag">1/${total}</div>
  </div>`;
}

/* Cada parte centralizada verticalmente no quadro, não colada no topo — uma
   frase sozinha lá em cima com o resto do quadro vazio embaixo lia como
   peça quebrada, não como pausa editorial (29/09/2026, mesmo ajuste já
   feito no cartaz.js e no roteiro.js). */
function slideParte(texto, n, total, ultima) {
  /* O numeral gigante em fundo (a parte é a N-esima de total-2, sem contar
     capa e fecho) da peso visual real ao quadro e reforca a estrutura em
     partes da propria historia — nao e enfeite solto, e o mesmo dado que
     ja existia pequeno no rodape (n/total), so que grande o bastante pra
     preencher o quadro (29/09/2026, resposta ao "muito espaco vazio"). */
  const beat = n - 1, beatTotal = total - 2;
  return `<div class="slide">
    <div class="kick">a história por trás</div>
    <div class="risco" style="top:150px"></div>
    <div class="numeral">${String(beat).padStart(2, '0')}</div>
    <div style="position:absolute;left:88px;right:88px;top:214px;bottom:170px;
                display:flex;flex-direction:column;justify-content:center">
      <div class="arg" style="position:static;width:auto">${ultima ? '<span class="virada">' + esc(texto) + '</span>' : esc(texto)}</div>
    </div>
    <div class="marca">${MARCA_HTML}</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function slideFecho(o, cfg, total) {
  if (!o) {
    return `<div class="slide">
      <div class="kick">a fonte</div>
      <div class="risco" style="top:150px"></div>
      <div style="position:absolute;left:88px;right:88px;top:214px;bottom:170px;
                  display:flex;flex-direction:column;justify-content:center">
        <div class="arg" style="position:static;width:auto;font-size:26px;color:${cfg.paleta.fraco}">${esc(cfg.fonte)}</div>
      </div>
      <div class="marca">vernissagessp.com.br</div>
      <div class="pag">${total}/${total}</div>
    </div>`;
  }
  const quem = autoria(o.e);
  return `<div class="slide">
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
      <div class="serv" style="margin-top:60px;font-size:18px">Fonte: ${esc(cfg.fonte)}.${
        cfg.carimbo ? ' Endereço e prazo conferidos na base do Vernissages SP em ' + esc(cfg.carimbo) + '.' : ''}</div>
    </div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">${total}/${total}</div>
  </div>`;
}

function montarHTML(o, cfg) {
  const total = cfg.partes.length + 2;
  const capa = o ? slideCapaObra(o) : slideCapaTexto(cfg, total);
  const partes = cfg.partes.map((p, i) => slideParte(p, i + 2, total, i === cfg.partes.length - 1)).join('');
  const fecho = slideFecho(o, cfg, total);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    .slide--cheia{background:#000}
    .slide--cheia::after{display:none}
    .slide .sangra{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    .tese{font-size:76px;line-height:1.08}
    .arg{font-size:44px;line-height:1.34}
    .arg .virada{font-size:54px;line-height:1.26}
    .numeral{position:absolute;right:88px;top:70px;font-size:150px;font-weight:700;
      letter-spacing:-.03em;color:${cfg.paleta.apagado};line-height:1}
    ${cssPaleta(cfg.paleta, cfg.textura)}</style></head><body>` +
    capa + partes + fecho + `</body></html>`;
}

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  const saida = path.resolve(RAIZ, flag('out', '.'));
  cfg.carimbo = carimbo(cfg, flag('date', new Date().toISOString().slice(0, 10)));
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.temporada || PALETAS.escuro;

  if (!cfg.fonte) {
    throw new Error('SEM FONTE: a peça não publica um fato histórico sem dizer de onde veio.\n' +
      '  Preencha `fonte` no config (livro, matéria, site do museu, catálogo — o que o Lucas conferiu).');
  }
  if (!cfg.titulo) throw new Error('Falta `titulo` — a capa da história.');
  if (!Array.isArray(cfg.partes) || cfg.partes.length < MIN_PARTES || cfg.partes.length > MAX_PARTES) {
    throw new Error('`partes` precisa de ' + MIN_PARTES + ' a ' + MAX_PARTES + ' parágrafos (tem ' +
      ((cfg.partes && cfg.partes.length) || 0) + '). Menos que isso é post, não carrossel; mais, ninguém lê até o fim.');
  }

  const DATA = carregarDados();
  let o = null;
  if (cfg.obra) {
    const V = {}; DATA.venues.forEach(v => V[v.name] = v);
    const e = acharExpo(DATA, cfg.obra);
    o = { e, v: V[e.v], rel: exigirObra(e, { recusarVista: true }) };
    o.dim = await medir(o.rel);
    console.log('obra ' + o.dim.w + 'x' + o.dim.h + ' — ' + o.rel);
    console.log('PICK ' + o.e.t + '|' + o.e.v);
  } else {
    console.log('sem obra vinculada — capa e fecho tipográficos');
  }
  console.log(cfg.partes.length + ' parte(s) · fonte: ' + cfg.fonte);

  const tmp = path.join(RAIZ, '.historia-tmp.html');
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
  console.log('\n' + els.length + ' slides · fonte citada no fecho');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
