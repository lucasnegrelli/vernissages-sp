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
const { carregarDados, acharExpo, exigirObra, medir, RAIZ, CSS, esc, porExtenso,
        carimbo, arroba, tituloCurto, autoria, PALETAS, cssPaleta } = base;

const W = 1080, H = 1350;

/* ---------- a partitura visual ----------

   A primeira versao punha o texto sempre no mesmo lugar, e o carrossel ficava
   inerte: sete slides identicos com frases diferentes. Limpo e morto.

   Aqui o numeral muda de tamanho e de canto a cada instrucao, e o bloco de
   texto se ancora nele. Ao arrastar, o olho ve o numero descer, atravessar,
   sangrar pela borda e sumir — o carrossel inteiro vira um movimento, que e
   o que "partitura" quer dizer. A referencia e a notacao grafica dos anos
   1960, em que a posicao no papel ja era parte da instrucao.

   A variacao e de posicao e escala, nunca de tipo ou de cor: um unico
   elemento grande por quadro, o texto sempre no mesmo corpo. Sem essa regra
   isto viraria bagunca em vez de ritmo.

   O servico fica sempre no mesmo rodape — ancora estavel no meio do
   movimento, e a garantia de que a peca continua servindo para achar o
   endereco. */

/* O que se move e a obra.
 *
 * A versao anterior movia um numeral gigante de canto a canto e nao mostrava
 * obra nenhuma — eu tinha decidido que "event score e texto por definicao" e
 * usei isso para justificar duas pecas seguidas sem imagem, contrariando a
 * regra do projeto. Era purismo: um formato que manda ir olhar obra precisa
 * mostrar a obra.
 *
 * Agora a obra e o elemento que muda de tamanho e de canto a cada instrucao, e
 * o numeral volta a ser etiqueta pequena. O carrossel continua sendo um
 * movimento, mas o que se move tem conteudo.
 *
 * A ultima composicao nao tem obra, e e a unica: a instrucao 07 manda ir
 * sozinho e nao fotografar nada. Ali a ausencia de imagem e o argumento, nao
 * uma regra de sistema. */

/* As medidas sao apertadas de proposito: o bloco de texto carrega instrucao,
   numero e ficha tecnica, e tem de terminar acima do rodape em qualquer uma
   das sete. Cada composicao declara o proprio corpo de texto — na primeira
   versao isso era inferido por regex da largura, e a ficha da instrucao 01
   atropelou a assinatura. */
const COMPOSICOES = [
  // 01 — obra sangra o topo, texto embaixo em largura cheia
  { obra: 'left:0;top:0;width:1080px;height:560px',
    txt: 'left:88px;right:88px;top:636px', al: 'left', corpo: 42 },
  // 02 — obra em coluna na direita, altura inteira; texto na esquerda
  { obra: 'right:0;top:0;width:440px;height:1350px',
    txt: 'left:88px;width:470px;top:264px', al: 'left', corpo: 33,
    pCss: 'left:400px;right:auto;bottom:84px' },
  // 03 — obra pequena e centrada no alto, texto centrado embaixo
  { obra: 'left:340px;top:130px;width:400px;height:400px',
    txt: 'left:120px;right:120px;top:606px', al: 'center', corpo: 40 },
  // 04 — inverte a 01: texto no alto, obra sangrando o rodape.
  //      Assinatura sobe para o topo, senao some dentro da imagem.
  { obra: 'left:0;bottom:0;width:1080px;height:560px',
    txt: 'left:88px;right:88px;top:168px', al: 'left', corpo: 42,
    mCss: 'left:88px;top:84px;bottom:auto', pCss: 'right:88px;top:84px;bottom:auto' },
  // 05 — obra em coluna na esquerda, texto na direita
  { obra: 'left:0;top:0;width:440px;height:1350px',
    txt: 'left:570px;right:88px;top:264px', al: 'left', corpo: 33,
    mCss: 'left:570px;bottom:84px' },
  // 06 — obra alta fora do eixo, no alto a direita; texto embaixo
  { obra: 'right:88px;top:150px;width:420px;height:540px',
    txt: 'left:88px;right:88px;top:766px', al: 'left', corpo: 42 },
  // 07 — sem obra. A instrucao manda nao fotografar.
  { txt: 'left:130px;right:130px;top:470px', al: 'center', corpo: 46 }
];

/* A capa mostra a primeira obra do percurso, em faixa alta: o carrossel
   comeca dizendo que ha o que ver, nao so o que ler. */
function slideCapa(itens, cfg, total) {
  const p = itens[0];
  return `<div class="slide">
    ${p.rel ? '<img class="obra" src="' + esc(p.rel) + '" style="left:0;top:0;width:1080px;height:560px">' : ''}
    <div class="kick" style="top:${p.rel ? 620 : 88}px">instruções</div>
    <div style="position:absolute;left:88px;right:88px;top:${p.rel ? 700 : 300}px">
      <div style="font-size:50px;font-weight:300;line-height:1.16;letter-spacing:-.02em;
                  color:${cfg.paleta.texto}">${esc(cfg.titulo)}</div>
      <div style="font-size:25px;font-weight:300;line-height:1.5;margin-top:38px;
                  color:${cfg.paleta.meio}">${cfg.nota.map(x => '<p style="margin-bottom:20px">' + esc(x) + '</p>').join('')}</div>
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">1/${total}</div>
  </div>`;
}

function slideInstrucao(it, cfg, n, total, ultimo) {
  const c = COMPOSICOES[(it.n - 1) % COMPOSICOES.length];
  /* Texto muito longo encolhe mais um degrau, para nao encostar no rodape. */
  const corpo = it.texto.length > 215 ? c.corpo - 4 : c.corpo;

  const ficha = it.e
    ? '<div style="font-size:20px;font-weight:300;line-height:1.5;margin-top:34px;color:' + cfg.paleta.fraco + '">' +
      esc(tituloCurto(it.e)) + (autoria(it.e) ? ', de ' + esc(autoria(it.e)) : '') + '<br>' +
      esc(it.v.name) + (it.v.ig ? ' ' + esc(arroba(it.v.ig)) : '') + '<br>' +
      esc(it.v.addr) + ', ' + esc(it.v.b) +
      (it.e.fim ? ' · até ' + esc(porExtenso(it.e.fim)) : '') +
      '<span style="display:block;margin-top:12px;color:' + cfg.paleta.apagado + ';font-size:17px">' +
      esc(it.e.cred) + '</span></div>'
    : '';

  return `<div class="slide">
    ${c.obra && it.rel ? '<img class="obra" src="' + esc(it.rel) + '" style="' + c.obra + '">' : ''}
    <div style="position:absolute;${c.txt};text-align:${c.al}">
      <div style="font-family:'Switzer';font-size:26px;font-weight:400;letter-spacing:.22em;
                  color:${cfg.paleta.apagado};margin-bottom:26px">${String(it.n).padStart(2, '0')}</div>
      <div style="font-size:${corpo}px;font-weight:300;line-height:1.3;letter-spacing:-.015em;
                  color:${cfg.paleta.texto}">${esc(it.texto)}</div>
      ${ficha}
    </div>
    <div class="marca"${c.mCss ? ' style="' + c.mCss + '"' : ''}>${ultimo ? 'vernissagessp.com.br' : 'Vernissages SP'}</div>
    <div class="pag"${c.pCss ? ' style="' + c.pCss + '"' : ''}>${n}/${total}</div>
  </div>`;
}

/* Sem slide de encerramento.
   Havia um, com as fontes e o aviso de autoria, e ele matava a peca: partitura
   que termina em rodape administrativo perde o gesto no ultimo passo. O aviso
   de que as instrucoes sao nossas foi para a legenda do post, onde e igualmente
   publico e nao ocupa o silencio do fim. A peca acaba na instrucao 07, que ja
   era o fecho. */
function montarHTML(itens, cfg) {
  const total = itens.length + 1;
  let s = slideCapa(itens, cfg, total);
  itens.forEach((it, i) => { s += slideInstrucao(it, cfg, i + 2, total, i === itens.length - 1); });
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta)}
    .slide .obra{position:absolute;object-fit:cover}</style></head><body>${s}</body></html>`;
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
    /* Instrucao que manda ir olhar obra tem de mostrar a obra. Mesma trava dos
       outros formatos, e a razao de a peca ter sido refeita: a primeira versao
       nao tinha imagem nenhuma. */
    it.rel = exigirObra(e);
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
