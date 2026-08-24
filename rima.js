/* ============================================================
   RIMA — formato de social do Vernissages SP
   ============================================================

   O que e.

   Duas mostras em cartaz ao mesmo tempo, em casas diferentes, postas lado a
   lado por uma afinidade que ninguem apontou. Nao e agenda, nao e anuncio de
   abertura: e uma leitura do circuito. O trabalho que um curador faz quando
   olha a cidade inteira de uma vez — e que so da para fazer com as 91 casas e
   as mostras simultaneas mapeadas no dados.js.

   Por que existe.

   Ate 24/08/2026 todo formato do projeto fazia a mesma proposicao: esta mostra
   existe, abre tal dia, fica ate tal dia. Mudava a galeria, nao mudava a frase.
   A rima muda a frase: ela afirma alguma coisa sobre duas mostras juntas que
   nenhuma das duas afirma sozinha.

   As tres travas que este arquivo implementa no codigo, nao na boa vontade:

   1. NAO GERA INCOMPLETO. Se qualquer uma das duas obras nao tiver imagem
      valida em disco, o script aborta antes de abrir o navegador. Nao existe
      fallback tipografico, nao existe "sai assim mesmo". Peca sem obra nao e
      peca — e um aviso de que faltou apuracao.

   2. NENHUMA IMAGEM APARECE DUAS VEZES. Cada obra ocupa um slide seu, e a
      capa e a unica composicao onde as duas convivem — em escalas diferentes,
      nunca repetidas depois no mesmo recorte.

   3. O DADO VEM DO dados.js. Titulo, artista, casa, endereco, prazo e o campo
      `d` sao lidos do arquivo. O que o operador escreve e so a tese: a frase
      que explica por que estas duas, e o paragrafo do argumento. Curadoria e
      humana; dado e do banco.

   Uso:
     node rima.js --config=rima-hoje.json --out=SOCIAL/08/24

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = __dirname;

/* ---------- leitura do banco ---------- */

function carregarDados() {
  const codigo = fs.readFileSync(path.join(RAIZ, 'dados.js'), 'utf8');
  const sandbox = { window: {}, console: console };
  vm.runInNewContext(codigo, sandbox, { filename: 'dados.js', timeout: 5000 });
  return sandbox.window.DATA;
}

const chave = e => e.t + '|' + e.v;

function acharExpo(DATA, k) {
  const e = DATA.expos.filter(x => chave(x) === k)[0];
  if (!e) throw new Error('Mostra nao encontrada em dados.js: ' + k);
  return e;
}

/* ---------- trava 1: a obra tem que existir ---------- */

/* Mesma regra do check.js, aplicada antes de montar em vez de depois.
   Assinatura de arquivo, nao extensao: PNG renomeado para .jpg passa; HTML de
   erro salvo como .jpg nao passa. */
function exigirObra(e) {
  const rel = String(e.img || '').split('?')[0].split('#')[0].replace(/^\.?\//, '');
  const onde = 'mostra "' + e.t + '" (' + e.v + ')';

  if (!rel) throw new Error('SEM OBRA: ' + onde + ' nao tem campo img. A rima nao sai sem as duas obras.');
  if (/^https?:/i.test(rel)) throw new Error('SEM OBRA: ' + onde + ' aponta para URL externa. Espelhe em img/ antes.');

  const alvo = path.resolve(RAIZ, rel);
  if (!fs.existsSync(alvo)) throw new Error('SEM OBRA: arquivo nao existe — ' + rel);

  const buf = fs.readFileSync(alvo);
  const hex = buf.slice(0, 12).toString('hex');
  const ehImagem =
    hex.startsWith('ffd8ff') || hex.startsWith('89504e47') || hex.startsWith('47494638') ||
    (hex.startsWith('52494646') && buf.slice(8, 12).toString('latin1') === 'WEBP');
  if (!ehImagem) throw new Error('SEM OBRA: ' + rel + ' nao e imagem reconhecivel.');
  if (buf.length < 40000) {
    throw new Error('SEM OBRA: ' + rel + ' tem so ' + Math.round(buf.length / 1024) +
      ' KB. Abaixo disso e quase sempre logo, flyer ou placeholder — nao obra.');
  }
  if (!e.cred) throw new Error('SEM CREDITO: ' + onde + '. Credito ausente trava a peca.');
  return rel;
}

/* ---------- dimensoes reais, para o layout obedecer a obra ---------- */

function medir(rel) {
  const sharp = require(path.join(RAIZ, '.render', 'node_modules', 'sharp'));
  return sharp(path.resolve(RAIZ, rel)).metadata().then(m => ({ w: m.width, h: m.height }));
}

/* ---------- paletas ----------

   Uma tentativa descartada, registrada para nao ser repetida: derivar o fundo
   da cor dominante da propria obra. A ideia era um preto diferente por peca,
   tingido pelo trabalho que ela mostra. Falhou tres vezes, por um motivo que
   so aparece depois de medir — a imagem de divulgacao de galeria e quase
   sempre vista de sala, e ali a cor de maior area e parede branca e piso de
   madeira, nao a obra. Media de matiz dava o mesmo laranja em nove obras
   diferentes; moda de histograma devolvia o ouro da filigrana da Bauci em vez
   do azul-cobalto, porque o cobalto profundo cai abaixo do piso de
   luminosidade e e filtrado junto com a sombra.

   O que ficou no lugar e mais simples e diz mais: cada formato tem a sua
   superficie, escolhida pelo que o formato faz.

   - `escuro`  — rima e aproximacao. A obra isolada no escuro, sala de museu.
   - `papel`   — deriva. Mapa se imprime, se dobra e se leva no bolso; ele nao
                 pertence a sala escura, pertence a rua. E, no feed, uma peca
                 clara depois de duas escuras abre respiro em vez de somar
                 ruido. */

/* Seis superficies, tres escuras e tres claras.
 *
 * Ate 30/08 existiam so tres e a semana inteira saiu praticamente preta —
 * cinco dos sete formatos usavam `escuro`. Variedade de superficie nao e
 * enfeite: no feed, sete pecas do mesmo tom viram uma mancha so, e a pessoa
 * para de distinguir os dias.
 *
 * O que nao muda: nenhuma tem cor de acento, todas trabalham por temperatura
 * e luminosidade. A cor continua vindo das obras. */
const PALETAS = {
  /* --- escuras --- */
  escuro: { fundo: '#0B0B0C', texto: '#EDEAE4', meio: '#8C8A84', fraco: '#6E6C67',
            apagado: '#46443F', traco: '#5C5A55' },
  /* Azul-noite. Esfria a peca sem virar azul: bom para diagrama e para obra
     de cor quente, que salta contra ele. */
  tinta:  { fundo: '#0A0D12', texto: '#E6EAF0', meio: '#818991', fraco: '#6B737E',
            apagado: '#414852', traco: '#525A65' },
  /* Terra escura. Aquece, e assenta bem sob pintura e barro. */
  barro:  { fundo: '#14100D', texto: '#EFE8DE', meio: '#928878', fraco: '#776E60',
            apagado: '#4B443A', traco: '#5E5648' },

  /* --- claras --- */
  papel:  { fundo: '#E9E5DC', texto: '#17161A', meio: '#4A4844', fraco: '#6B6862',
            apagado: '#94908A', traco: '#9C978E' },
  /* Mais claro e mais duro que `papel`: nao e papel de guia, e cartao. */
  cal:    { fundo: '#F5F3EE', texto: '#101013', meio: '#3B3A38', fraco: '#6A6864',
            apagado: '#A7A39C', traco: '#B0ACA4' },
  /* Bege medio quente, o mais "impresso" dos tres: parece papel de catalogo
     antigo, e e o unico claro que aguenta obra colorida sem lavar. */
  linho:  { fundo: '#DCD3C2', texto: '#1B1712', meio: '#4B4437', fraco: '#6E6555',
            apagado: '#958973', traco: '#9E9280' }
};

/* Grao.
 *
 * Textura, nao ruido: um SVG de turbulencia em opacidade muito baixa, por cima
 * do fundo e por baixo de tudo. Serve para tirar o aspecto de tela chapada, que
 * e o que mais denuncia peca feita em navegador. Em tela pequena quase nao se
 * ve; e justamente o ponto. */
function grao(intensidade) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">' +
    '<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>' +
    '<feColorMatrix type="saturate" values="0"/></filter>' +
    '<rect width="180" height="180" filter="url(#g)" opacity="1"/></svg>';
  /* Camada por cima de tudo, inclusive das obras — grao de papel nao respeita
     moldura. A primeira versao punha o grao atras e empurrava os filhos com
     `.slide > *{position:relative}`; aquilo anulou o position:absolute de todo
     mundo e a assinatura foi parar no meio do texto. Aqui nada do layout e
     tocado: e um ::after inerte. */
  return `.slide::after{content:'';position:absolute;inset:0;z-index:9;pointer-events:none;
    background-image:url("data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}");
    background-size:180px 180px;opacity:${intensidade};mix-blend-mode:overlay}`;
}

function cssPaleta(p, textura) {
  const g = textura === false ? '' : grao(textura == null ? 0.05 : textura);
  return `${g}
    .slide{background:${p.fundo};color:${p.texto}}
    .slide .kick,.slide .pag{color:${p.fraco}}
    .slide .marca{color:${p.apagado}}
    .slide .quem{color:${p.meio}}
    .slide .serv{color:${p.fraco}}
    .slide .cred{color:${p.apagado}}
    .slide .arg{color:${p.meio}}
    .slide .arg .virada,.slide .tese,.slide .arg b{color:${p.texto}}
    .slide .risco{background:${p.apagado}}`;
}

/* ---------- sistema visual ----------

   Uma familia so, dois registros: Switzer em 300 para o que se le devagar e em
   500 caixa-alta com tracking largo para o que so se etiqueta. O rodizio de
   seis fontes do post.html dava variedade de superficie e nenhuma de sentido.

   Fundo quase preto e nenhuma cor de acento: a unica cor da peca vem das
   obras. E a regra das galerias grandes, e e o que faz a imagem parecer obra
   em vez de banner. */

const CSS = `
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900;font-display:block}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000}
.slide{position:relative;width:1080px;height:1350px;background:#0B0B0C;color:#EDEAE4;
  font-family:'Switzer',sans-serif;overflow:hidden}
.marca,.kick{font-size:17px;font-weight:500;letter-spacing:.30em;text-transform:uppercase;color:#6E6C67}
.marca{position:absolute;left:88px;bottom:84px;color:#46443F}
.kick{position:absolute;left:88px;top:88px}
.pag{position:absolute;right:88px;bottom:84px;font-size:17px;font-weight:500;letter-spacing:.2em;color:#46443F}
.tese{position:absolute;left:88px;width:800px;font-size:56px;font-weight:300;line-height:1.16;
  letter-spacing:-.018em;color:#EDEAE4}
.obra{position:absolute;display:block;object-fit:cover}
.ficha{position:absolute;left:88px;right:88px}
.ficha .tit{font-size:34px;font-weight:400;line-height:1.2;letter-spacing:-.01em}
.ficha .quem{font-size:26px;font-weight:300;color:#8C8A84;margin-top:8px}
.ficha .serv{font-size:22px;font-weight:300;color:#6E6C67;margin-top:20px;line-height:1.55}
.cred{position:absolute;left:88px;bottom:84px;width:640px;font-size:16px;font-weight:300;
  color:#46443F;line-height:1.4}
.arg{position:absolute;left:88px;width:880px;font-size:35px;font-weight:300;line-height:1.46;
  letter-spacing:-.005em;color:#B9B6AF}
.arg b{font-weight:400;color:#EDEAE4}
.arg .virada{display:block;margin-top:44px;font-size:46px;line-height:1.24;color:#EDEAE4;font-weight:300;letter-spacing:-.015em}
.risco{position:absolute;left:88px;width:64px;height:1px;background:#46443F}
`;

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const porExtenso = iso => { const p = iso.split('-'); return Number(p[2]) + ' de ' + MES[Number(p[1]) - 1]; };
const porExtensoAno = iso => { const p = iso.split('-'); return Number(p[2]) + ' de ' + MES[Number(p[1]) - 1] + ' de ' + p[0]; };
const arroba = ig => ig ? '@' + ig : '';

/* A data que a peca carimba e a data em que ela SAI, nunca a do dia em que foi
   montada. Uma peca gerada na segunda e publicada na quarta dizia "conferido
   em 24 de agosto" na quarta-feira dia 26 — o leitor le atraso onde nao ha, e
   a marca perde exatamente a credibilidade que a linha pretende construir.
   Passar isso a mao no config era garantir que uma hora alguem esqueceria. */
function carimbo(cfg, dataRef) {
  if (cfg.conferidoEm === false) return '';
  if (typeof cfg.conferidoEm === 'string') return cfg.conferidoEm;
  return porExtensoAno(dataRef);
}

/* Titulo sem o sufixo do artista, que na base vem depois do travessao.
   "Masao Yamamoto — individual" vira "Masao Yamamoto" — e ai a linha de
   autoria repetiria o mesmo nome logo abaixo. Quando isso acontece, a
   autoria nao sai: o nome ja e o titulo. */
const tituloCurto = e => e.t.replace(/ — .*$/, '').trim();
function autoria(e) {
  const a = (e.a || '').trim();
  if (!a) return '';
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return norm(a) === norm(tituloCurto(e)) ? '' : a;
}

/* Slide da obra: ela flutua no escuro, com a proporcao real preservada.
   Nada de sangria forcada — recorte de vista de sala mata justamente o vazio,
   que em algumas mostras e o assunto. */
function slideObra(o, cfg, n, total) {
  const cx = 1080 - 88 * 2, cy = 780;
  const k = Math.min(cx / o.dim.w, cy / o.dim.h);
  const w = Math.round(o.dim.w * k), h = Math.round(o.dim.h * k);
  const topo = Math.round(196 + (cy - h) / 2);
  return `<div class="slide">
    <div class="kick">${esc(o.rotulo)}</div>
    <img class="obra" src="${esc(o.rel)}" style="left:${Math.round((1080 - w) / 2)}px;top:${topo}px;width:${w}px;height:${h}px">
    <div class="ficha" style="top:1046px">
      <div class="tit">${esc(tituloCurto(o.e))}</div>
      <div class="quem">${esc(autoria(o.e) || o.v.name)}</div>
    </div>
    <div class="cred">${esc(o.e.cred)}</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function slideFicha(o) {
  const quem = autoria(o.e);
  return `<div style="margin-bottom:76px">
    <div class="tit">${esc(tituloCurto(o.e))}</div>
    ${quem ? '<div class="quem">' + esc(quem) + '</div>' : ''}
    <div class="serv">${esc(o.v.name)} ${esc(arroba(o.v.ig))}<br>
      ${esc(o.v.addr)}, ${esc(o.v.b)}<br>
      ${o.e.fim ? 'até ' + esc(porExtenso(o.e.fim)) : 'encerramento não divulgado'}</div>
  </div>`;
}

function montarHTML(A, B, cfg) {
  /* CAPA — o layout diz a mesma coisa que o texto.
     A obra que na vida real e pequena aparece pequena; a que e uma sala
     inteira ocupa a largura e sangra na borda. A escala e o argumento. */
  /* A grande sangra na borda esquerda e a pequena recua para a margem direita:
     a diagonal desce no sentido da leitura e o olho cai no texto. Simetria
     aqui seria mentira — as duas obras nao tem o mesmo tamanho na vida real. */
  const gW = 700, gH = Math.round(gW * B.dim.h / B.dim.w);
  const pW = 210, pH = Math.round(pW * A.dim.h / A.dim.w);
  const gTop = 150, pTop = gTop + gH + 62;

  const capa = `<div class="slide">
    <div class="kick">${esc(cfg.kicker || 'rima')}</div>
    <img class="obra" src="${esc(B.rel)}" style="left:0;top:${gTop}px;width:${gW}px;height:${gH}px">
    <img class="obra" src="${esc(A.rel)}" style="right:88px;top:${pTop}px;width:${pW}px;height:${pH}px">
    <div class="tese" style="top:980px;width:830px;font-size:50px">${esc(cfg.tese)}</div>
    <div class="marca">Vernissages SP</div>
  </div>`;

  const arg = `<div class="slide">
    <div class="kick">o argumento</div>
    <div class="risco" style="top:150px"></div>
    <div class="arg" style="top:236px">${cfg.argumento.map(p => '<p style="margin-bottom:28px">' + esc(p) + '</p>').join('')}
      <span class="virada">${esc(cfg.virada)}</span></div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">4/5</div>
  </div>`;

  /* O bloco de servico e centrado no quadro em vez de ancorado no topo: com
     duas fichas so, ancorar em cima deixava meio slide vazio sem que o vazio
     dissesse nada — diferente da capa, onde ele e o argumento. */
  const onde = `<div class="slide">
    <div class="kick">onde ver</div>
    <div class="risco" style="top:150px"></div>
    <div class="ficha" style="top:210px;bottom:210px;display:flex;flex-direction:column;justify-content:center">
      ${slideFicha(A)}${slideFicha(B)}
      <div class="serv" style="margin-top:0;color:#46443F;font-size:19px">Endereços e prazos conferidos na base do Vernissages SP em ${esc(cfg.conferidoEm)}.</div>
    </div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">5/5</div>
  </div>`;

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}</style></head><body>` +
    capa + slideObra(A, cfg, 2, 5) + slideObra(B, cfg, 3, 5) + arg + onde +
    `</body></html>`;
}

/* ---------- execucao ---------- */

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=' ))[0]; return a ? a.split('=').slice(1).join('=') : p; };
  const cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  const saida = path.resolve(RAIZ, flag('out', '.'));

  const DATA = carregarDados();
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);

  const preparar = (k, rotulo) => {
    const e = acharExpo(DATA, k);
    return { e, v: V[e.v], rel: exigirObra(e), rotulo };
  };

  /* As duas travas rodam ANTES de qualquer render. Falta obra, o processo
     morre aqui e nao deixa arquivo pela metade em SOCIAL/. */
  const A = preparar(cfg.a, cfg.rotuloA || 'primeira');
  const B = preparar(cfg.b, cfg.rotuloB || 'segunda');
  if (A.rel === B.rel) throw new Error('As duas mostras apontam para a mesma imagem. Isso nao e rima, e eco.');

  A.dim = await medir(A.rel);
  B.dim = await medir(B.rel);

  const tmp = path.join(RAIZ, '.rima-tmp.html');
  fs.writeFileSync(tmp, montarHTML(A, B, cfg), 'utf8');

  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: 1080, height: 1350, deviceScaleFactor: 1 }
  });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
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
  console.log('\n' + els.length + ' slides · nenhuma imagem repetida · as duas obras conferidas em disco');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}

module.exports = { carregarDados, acharExpo, exigirObra, medir, chave, RAIZ,
                   CSS, esc, porExtenso, porExtensoAno, carimbo, arroba,
                   tituloCurto, autoria, PALETAS, cssPaleta, grao };
