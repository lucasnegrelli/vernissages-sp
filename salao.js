/* ============================================================
   SALÃO — formato de social do Vernissages SP
   ============================================================

   O que e.

   Todas as obras em cartaz em Sao Paulo hoje, penduradas juntas na mesma
   parede e numeradas, com o catalogo em seguida — e depois, uma por uma, um
   slide de destaque para cada obra que couber no limite do carrossel:
   reproducao maior, titulo, artista, casa e o que a base souber dela. O
   catalogo dá o credito, em uma linha; o destaque dá o mergulho, em tela
   cheia.

   De onde vem.

   Ate o fim do seculo XIX se pendurava assim: o Salon de Paris cobria a parede
   do rodape ao teto, quadro colado em quadro, e um catalogo numerado dizia o
   que era cada um. O cubo branco — parede vazia, obra isolada, muito ar — e
   invencao do modernismo, e hoje parece a unica forma possivel de mostrar
   arte. Nao e. E uma escolha, e ela tem cem anos.

   O salao faz o que o cubo branco impede: obriga as obras a conviverem. Lado a
   lado, elas revelam o que a cidade esta pintando neste mes — quanta cor,
   quanto preto e branco, quanta figura, quanta parede vazia fotografada.

   Por que na sexta.

   Os outros formatos da semana sao lentos: uma obra, duas mostras, um
   percurso, uma tese. Todos com muito vazio, feitos para ler devagar. Este e o
   contrario — denso, rapido, tudo de uma vez. E sexta-feira.

   As travas:

   1. TODA OBRA NA PAREDE TEM CREDITO NO CATALOGO. Numero, titulo, artista,
      casa e credito. Salao sem catalogo e mural decorativo.
   2. NENHUMA OBRA ENTRA DUAS VEZES.
   3. MENOS DE DOZE OBRAS NAO E SALAO, e o script aborta — a peca depende da
      densidade para dizer o que quer dizer.
   4. VISTA DE SALA FICA FORA DA PAREDE POR PADRAO. Sem essa trava a parede
      mistura reproducao de obra com foto de outra parede pendurada nela — e
      o resultado e parede dentro de parede, que confunde em vez de compor.
      Fica de fora a nao ser que o filtro do config peca vista de proposito
      (a ideia salao-vista-de-sala, por exemplo: ali o assunto E o espaco).
   5. O CARROSSEL TEM TETO. O Instagram aceita ate 20 itens por publicacao.
      A parede, a tese e o catalogo vem sempre; os slides de destaque, um por
      obra, enchem o que sobrar — nem toda obra ganha o dela numa semana
      cheia, e o log diz quantas couberam.

   Uso:
     node salao.js --config=SOCIAL/08/28/salao.json --out=SOCIAL/08/28 --date=2026-08-28

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, exigirObra, medir, RAIZ, CSS, esc, carimbo,
        arroba, tituloCurto, autoria, porExtenso, PALETAS, cssPaleta } = base;

const W = 1080, H = 1350;
const COLUNAS = 4;
const GAP = 10;
const MIN_OBRAS = 12;
const SLIDE_MAX_IG = 20;

/* ---------- reuniao do acervo do dia ---------- */

async function reunir(DATA, hoje, fora, filtroCfg) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const excluir = new Set(fora || []);
  /* Vista de sala fica fora por padrao — mesma regra do obra.js. Sem isso, a
     parede junta reproducao de obra com foto de outra parede pendurada nela,
     e o resultado confunde: parede dentro de parede. So entra vista quando o
     filtro pede de proposito (ex.: a ideia salao-vista-de-sala, vista:true —
     ali o assunto E o espaco, entao Object.assign nao pisa no que foi pedido). */
  const filtro = Object.assign({ vista: false }, filtroCfg);
  if (filtroCfg) console.log('  recorte: ' + base.descreverFiltro(filtro));
  const out = [];
  const vistos = new Set();
  const barradas = [];
  for (const e of DATA.expos) {
    if (!e.ini || e.ini > hoje) continue;
    if (e.fim && e.fim < hoje) continue;
    const v = V[e.v];
    if (!v) continue;
    if (!base.passaFiltro(e, v, hoje, filtro)) continue;   // recorte do config
    let rel;
    try { rel = exigirObra(e); } catch { continue; }   // sem obra nao entra na parede
    if (vistos.has(rel)) continue;                     // trava 2
    /* Exclusao curatorial. Nenhuma trava automatica distingue obra de cartaz:
       o flyer do Coletivo Poiesis tem peso, dimensao e credito, e passaria
       direto — mas numa parede de obras um cartaz de divulgacao com letreiro
       destoa e denuncia que o dado esta errado. Quem separa e quem olha. */
    if (excluir.has(e.t + '|' + e.v)) { barradas.push(e.t); continue; }
    vistos.add(rel);
    out.push({ e, v, rel, dim: await medir(rel) });
  }
  if (barradas.length) console.log('  fora da parede por escolha: ' + barradas.join(' · '));
  return out;
}

/* ---------- a pendura ----------

   Empilhamento por coluna mais curta, com a altura de cada obra saindo da
   proporcao real do arquivo. E o que faz a parede parecer parede: o salao do
   seculo XIX nao alinhava nada, encaixava. Redimensionar tudo para o mesmo
   quadrado daria grade de aplicativo, nao pendura. */
function pendurar(obras, largura, altura) {
  const colW = Math.floor((largura - GAP * (COLUNAS - 1)) / COLUNAS);
  const col = new Array(COLUNAS).fill(0);
  const postas = [];

  for (const o of obras) {
    let i = 0;
    for (let k = 1; k < COLUNAS; k++) if (col[k] < col[i]) i = k;
    const h = Math.round(colW * o.dim.h / o.dim.w);
    postas.push({ ...o, x: i * (colW + GAP), y: col[i], w: colW, h });
    col[i] += h + GAP;
  }

  /* Sobe a parede inteira para que a coluna mais alta encoste no rodape:
     quadro cortado pela borda e como o salao terminava de verdade. */
  const alto = Math.max(...col);
  const desloca = alto > altura ? 0 : Math.round((altura - alto) / 2);
  return { postas: postas.map(p => ({ ...p, y: p.y + desloca })), alto };
}

/* ---------- slides ---------- */

function slideParede(postas, cfg, n, total, comNumero) {
  const quadros = postas.map((p, i) => `
    <div style="position:absolute;left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px;overflow:hidden">
      <img src="${esc(p.rel)}" style="width:100%;height:100%;object-fit:cover;display:block">
      ${comNumero ? '<div style="position:absolute;left:0;bottom:0;padding:5px 9px;font-family:\'Switzer\';' +
        'font-size:15px;font-weight:500;letter-spacing:.08em;color:' + cfg.paleta.fundo +
        ';background:' + cfg.paleta.texto + '">' + String(i + 1).padStart(2, '0') + '</div>' : ''}
    </div>`).join('');

  return `<div class="slide" style="overflow:hidden">
    <div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px">${quadros}</div>
    <div class="pag" style="padding:6px 10px;background:${cfg.paleta.fundo};color:${cfg.paleta.fraco};right:0;bottom:0">${n}/${total}</div>
  </div>`;
}

function slideTese(L, cfg, n, total) {
  return `<div class="slide">
    <div class="kick">o salão</div>
    <div class="risco" style="top:150px"></div>
    <div style="position:absolute;left:88px;right:88px;top:214px;bottom:214px;
                display:flex;flex-direction:column;justify-content:center">
      <div style="font-size:52px;font-weight:300;line-height:1.16;letter-spacing:-.02em;
                  color:${cfg.paleta.texto}">${esc(
        L.obras.length + ' obras em cartaz em São Paulo agora, na mesma parede.')}</div>
      <div class="arg" style="position:static;width:auto;font-size:30px;margin-top:46px">
        ${cfg.texto.map(p => '<p style="margin-bottom:26px">' + esc(p) + '</p>').join('')}
        <span class="virada" style="margin-top:34px;font-size:42px">${esc(cfg.virada)}</span>
      </div>
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

/* O catalogo. O salao do seculo XIX vendia um livreto numerado na porta —
   sem ele a parede era so parede. Aqui ele garante credito a cada obra. */
function slideCatalogo(fatia, cfg, n, total, de, ate) {
  const linhas = fatia.map((p, i) => `
    <div style="display:flex;gap:16px;margin-bottom:15px">
      <span style="min-width:38px;color:${cfg.paleta.apagado};font-weight:400">${String(de + i).padStart(2, '0')}</span>
      <span style="flex:1">${esc(tituloCurto(p.e))}${autoria(p.e) ? ', <span style="color:' + cfg.paleta.meio + '">' + esc(autoria(p.e)) + '</span>' : ''}
        <span style="display:block;color:${cfg.paleta.fraco};font-size:18px;margin-top:3px">${esc(p.v.name)}${p.v.ig ? ' ' + esc(arroba(p.v.ig)) : ''} · ${esc(p.e.cred)}</span></span>
    </div>`).join('');

  return `<div class="slide">
    <div class="kick">catálogo · ${String(de).padStart(2, '0')}–${String(ate).padStart(2, '0')}</div>
    <div class="risco" style="top:150px"></div>
    <div style="position:absolute;left:88px;right:88px;top:212px;font-size:21px;
                font-weight:300;line-height:1.36;color:${cfg.paleta.texto}">${linhas}</div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

/* O destaque: a mesma obra da parede, agora sozinha. A obra flutua contida
   (nunca sangra — regra da rima e da aproximacao, mesmo motivo aqui), com a
   ficha inteira que a base souber: titulo, artista, casa, endereco, prazo e
   credito. E o mergulho que o numero da parede promete e o catalogo, em
   texto corrido, nao entrega. */
function slideDestaque(o, i, totalObras, cfg, n, total) {
  const cx = W - 88 * 2, cy = 700;
  const k = Math.min(cx / o.dim.w, cy / o.dim.h);
  const w = Math.round(o.dim.w * k), h = Math.round(o.dim.h * k);
  const quem = autoria(o.e);
  const ig = o.v.ig ? ' ' + arroba(o.v.ig) : '';
  const endereco = [o.v.addr, o.v.b].filter(Boolean).join(', ');
  const prazo = o.e.fim ? 'até ' + esc(porExtenso(o.e.fim)) : 'encerramento não divulgado';
  return `<div class="slide">
    <div class="kick">obra ${String(i + 1).padStart(2, '0')} de ${String(totalObras).padStart(2, '0')}</div>
    <img class="obra" src="${esc(o.rel)}" style="left:${Math.round((W - w) / 2)}px;top:${Math.round(170 + (cy - h) / 2)}px;width:${w}px;height:${h}px">
    <div class="ficha" style="top:900px">
      <div class="tit">${esc(tituloCurto(o.e))}</div>
      ${quem ? '<div class="quem">' + esc(quem) + '</div>' : ''}
      ${o.e.d ? '<div class="serv" style="margin-top:16px">' + esc(o.e.d) + '</div>' : ''}
      <div class="serv" style="margin-top:16px">${esc(o.v.name)}${esc(ig)}<br>
        ${esc(endereco)}<br>${prazo}</div>
    </div>
    <div class="cred">${esc(o.e.cred)}</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function montarHTML(L, cfg) {
  const POR_PAGINA = 13;
  const paginas = Math.ceil(L.obras.length / POR_PAGINA);
  const fixos = 2 + paginas;

  /* Teto do carrossel: o que sobrar do limite do Instagram depois da parede,
     da tese e do catalogo vai para os destaques, um por obra, na mesma ordem
     da parede. Nem sempre cabe todo mundo — o log de quem gerou diz quantos
     entraram. */
  const orcamentoDestaque = Math.max(0, SLIDE_MAX_IG - fixos);
  const nDestaques = Math.min(L.obras.length, orcamentoDestaque);
  const total = fixos + nDestaques;

  let s = slideParede(L.postas, cfg, 1, total, true);
  s += slideTese(L, cfg, 2, total);
  for (let i = 0; i < paginas; i++) {
    const de = i * POR_PAGINA;
    s += slideCatalogo(L.obras.slice(de, de + POR_PAGINA), cfg, 3 + i, total, de + 1,
      Math.min(de + POR_PAGINA, L.obras.length));
  }
  for (let i = 0; i < nDestaques; i++) {
    s += slideDestaque(L.obras[i], i, L.obras.length, cfg, fixos + i + 1, total);
  }
  return { html: `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta, cfg.textura)}</style></head><body>${s}</body></html>`,
    nDestaques };
}

/* ---------- execucao ---------- */

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date().toISOString().slice(0, 10));
  const cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  const saida = path.resolve(RAIZ, flag('out', '.'));
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.escuro;
  cfg.carimbo = carimbo(cfg, hoje);

  const DATA = carregarDados();
  const obras = await reunir(DATA, hoje, cfg.fora, cfg.filtro);

  console.log(obras.length + ' obras em cartaz com imagem em disco, em ' + hoje);
  if (obras.length < MIN_OBRAS) {
    throw new Error('So ' + obras.length + ' obras: menos de ' + MIN_OBRAS +
      ' nao e salao, e a peca depende da densidade para dizer o que quer dizer.');
  }
  /* Trava 1: catalogo exige credito, e o exigirObra ja garante que existe. */
  const casas = new Set(obras.map(o => o.v.name));
  console.log('  ' + casas.size + ' casas · ' + Math.ceil(obras.length / 13) + ' página(s) de catálogo');

  const { postas, alto } = pendurar(obras, W, H);
  console.log('  parede: ' + COLUNAS + ' colunas, altura ' + alto + 'px em quadro de ' + H);

  const L = { obras, postas, casas };
  const { html, nDestaques } = montarHTML(L, cfg);
  console.log('  destaque: ' + nDestaques + ' de ' + obras.length + ' obras' +
    (nDestaques < obras.length ? ' (teto de ' + SLIDE_MAX_IG + ' slides do Instagram)' : ''));
  const tmp = path.join(RAIZ, '.salao-tmp.html');
  fs.writeFileSync(tmp, html, 'utf8');

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
  await new Promise(r => setTimeout(r, 1200));

  fs.mkdirSync(saida, { recursive: true });
  const els = await page.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    const p = path.join(saida, cfg.nome + '-' + String(i + 1).padStart(2, '0') + '.png');
    await els[i].screenshot({ path: p });
    console.log('OK ' + p);
  }
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('\n' + els.length + ' slides · ' + obras.length + ' obras, todas com crédito no catálogo');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
