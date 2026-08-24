/* ============================================================
   INSTRUÇÕES — formato de social do Vernissages SP
   ============================================================

   O que e.

   Uma partitura de acoes para o fim de semana. Cada slide traz uma instrucao
   executavel, e cada instrucao aponta para uma mostra que esta de fato em
   cartaz, com endereco. Nao ha imagem nenhuma: o texto e o objeto.

   De onde vem.

   Por volta de 1960, artistas ligados ao Fluxus — La Monte Young, George
   Brecht, e depois Yoko Ono em "Grapefruit" — passaram a escrever obras que
   nao eram objetos e sim instrucoes, para quem quisesse executar. O event
   score e uma forma historica, nao uma brincadeira de rede social, e e
   provavelmente o unico genero de arte que cabe inteiro num carrossel sem
   perder nada.

   Por que na sexta.

   Os outros formatos da semana descrevem o circuito para alguem que le. Este
   pede alguma coisa de quem le, e pede para o fim de semana, que e quando a
   pessoa pode atender. E o unico da semana que so se completa fora do
   telefone.

   As travas:

   1. INSTRUCAO SEM MOSTRA EM CARTAZ NAO SAI. Toda instrucao ancorada numa
      mostra e conferida contra a agenda na data de publicacao: se a mostra
      encerrou, o script aborta. Mandar alguem a uma exposicao que acabou e
      pior que nao publicar.

   2. CASA, ENDERECO E PRAZO VEM DA BASE. O operador escreve a instrucao; o
      script preenche onde ela se cumpre. Instrucao nenhuma carrega endereco
      digitado a mao.

   3. UMA CASA POR INSTRUCAO. Duas instrucoes na mesma casa viram roteiro, nao
      partitura — e o script recusa.

   Uso:
     node instrucoes.js --config=SOCIAL/08/28/instrucoes.json --out=SOCIAL/08/28 --date=2026-08-28

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, acharExpo, RAIZ, CSS, esc, porExtenso, carimbo,
        arroba, tituloCurto, autoria, PALETAS, cssPaleta } = base;

const W = 1080, H = 1350;

/* ---------- slides ---------- */

function slideCapa(cfg, n, total) {
  return `<div class="slide">
    <div class="kick">instruções</div>
    <div style="position:absolute;left:88px;right:88px;top:210px;bottom:210px;
                display:flex;flex-direction:column;justify-content:center">
      <div style="font-size:54px;font-weight:300;line-height:1.16;letter-spacing:-.02em;
                  color:${cfg.paleta.texto}">${esc(cfg.titulo)}</div>
      <div style="font-size:28px;font-weight:300;line-height:1.5;margin-top:52px;
                  color:${cfg.paleta.meio}">${cfg.nota.map(p => '<p style="margin-bottom:24px">' + esc(p) + '</p>').join('')}</div>
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

/* Numero em corpo grande e a instrucao no centro, com o servico rebaixado ao
   rodape: a acao vem antes do endereco, senao a peca vira agenda de novo. */
function slideInstrucao(it, cfg, n, total) {
  const linha = it.e
    ? esc(tituloCurto(it.e)) + (autoria(it.e) ? ', de ' + esc(autoria(it.e)) : '') +
      '<br>' + esc(it.v.name) + (it.v.ig ? ' ' + esc(arroba(it.v.ig)) : '') +
      '<br>' + esc(it.v.addr) + ', ' + esc(it.v.b) +
      (it.e.fim ? ' · até ' + esc(porExtenso(it.e.fim)) : '')
    : '';

  return `<div class="slide">
    <div style="position:absolute;left:88px;top:80px;font-family:'Switzer';font-size:96px;
                font-weight:200;letter-spacing:-.04em;line-height:1;
                color:${cfg.paleta.apagado}">${String(it.n).padStart(2, '0')}</div>
    <div style="position:absolute;left:88px;right:88px;top:260px;bottom:${linha ? 300 : 210}px;
                display:flex;align-items:center">
      <div style="font-size:${it.texto.length > 190 ? 42 : 48}px;font-weight:300;line-height:1.28;
                  letter-spacing:-.015em;color:${cfg.paleta.texto}">${esc(it.texto)}</div>
    </div>
    ${linha ? '<div style="position:absolute;left:88px;right:88px;bottom:172px;font-size:22px;' +
      'font-weight:300;line-height:1.5;color:' + cfg.paleta.fraco + '">' + linha + '</div>' : ''}
    <div class="marca">Vernissages SP</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function slideFecho(cfg, n, total) {
  return `<div class="slide">
    <div class="kick">de onde vem</div>
    <div class="risco" style="top:150px"></div>
    <div style="position:absolute;left:88px;right:88px;top:214px;bottom:214px;
                display:flex;flex-direction:column;justify-content:center">
      <div style="font-size:26px;font-weight:300;line-height:1.5;color:${cfg.paleta.meio}">
        ${cfg.rodape.map(p => '<p style="margin-bottom:26px">' + esc(p) + '</p>').join('')}
      </div>
      <div style="font-size:20px;font-weight:300;line-height:1.55;margin-top:30px;
                  color:${cfg.paleta.apagado}">
        Endereços e prazos conferidos na agenda do Vernissages SP${cfg.carimbo ? ', em ' + esc(cfg.carimbo) : ''}.<br>
        As instruções são nossas. Nenhuma foi sugerida pelas casas citadas.
      </div>
    </div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function montarHTML(itens, cfg) {
  const total = itens.length + 2;
  let s = slideCapa(cfg, 1, total);
  itens.forEach((it, i) => { s += slideInstrucao(it, cfg, i + 2, total); });
  s += slideFecho(cfg, total, total);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta)}</style></head><body>${s}</body></html>`;
}

/* ---------- execucao ---------- */

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date().toISOString().slice(0, 10));
  const cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  const saida = path.resolve(RAIZ, flag('out', '.'));
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.cal;
  cfg.carimbo = carimbo(cfg, hoje);

  const DATA = carregarDados();
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);

  const casasUsadas = new Set();
  const itens = cfg.instrucoes.map((raw, i) => {
    const it = { n: i + 1, texto: raw.texto };
    if (!raw.mostra) return it;                    // instrucao livre, sem endereco

    const e = acharExpo(DATA, raw.mostra);
    /* Trava 1: a mostra precisa estar de pe no dia da publicacao. */
    const emCartaz = e.ini && e.ini <= hoje && (!e.fim || e.fim >= hoje);
    if (!emCartaz) {
      throw new Error('Instrução ' + (i + 1) + ' manda ir a uma mostra que não está em cartaz em ' +
        hoje + ': "' + e.t + '" (' + e.v + ', ' + e.ini + ' a ' + (e.fim || 'sem data') + ').' +
        '\n  Mandar alguem a uma exposicao que acabou e pior que nao publicar.');
    }
    /* Trava 3: uma casa por instrucao. */
    if (casasUsadas.has(e.v)) throw new Error('Duas instruções na mesma casa (' + e.v + '). Isso é roteiro, não partitura.');
    casasUsadas.add(e.v);

    it.e = e;
    it.v = V[e.v];
    if (!it.v) throw new Error('Venue fora da base: ' + e.v);
    return it;
  });

  console.log(itens.length + ' instruções · ' + casasUsadas.size + ' casas');
  itens.forEach(it => console.log('  ' + String(it.n).padStart(2, '0') + ' ' +
    (it.v ? it.v.name : '(sem endereço)') + ' — ' + it.texto.slice(0, 58) + '…'));

  const tmp = path.join(RAIZ, '.instr-tmp.html');
  fs.writeFileSync(tmp, montarHTML(itens, cfg), 'utf8');

  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
  });
  const page = await browser.newPage();
  page.on('pageerror', x => console.log('PAGEERROR: ' + x.message));
  await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 700));

  fs.mkdirSync(saida, { recursive: true });
  const els = await page.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    const p = path.join(saida, cfg.nome + '-' + String(i + 1).padStart(2, '0') + '.png');
    await els[i].screenshot({ path: p });
    console.log('OK ' + p);
  }
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('\n' + els.length + ' slides · todas as mostras conferidas em cartaz em ' + hoje);
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
