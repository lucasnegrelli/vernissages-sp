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
                 O slide 2 lidera com "última semana · fecha DD.MM" e, quando
                 falta pouco, a contagem em dias por baixo.
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
   4. PROPORÇÃO LONGE DEMAIS DO ALVO NÃO ENTRA. O slide cheio usa
      object-fit:cover centrado — numa imagem muito mais larga (ou mais alta)
      que o quadro 4:5, isso corta mais da metade do lado maior, sempre pelo
      meio, sem saber onde está o motivo. 09/10/2026: "O homem nu" (Efrain
      Almeida, 2360×1328) cortou a ave bem na cabeça. Acima de 1.6× de
      desvio da proporção do quadro, fora.

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
        descreverFiltro, MARCA_HTML } = base;

const W = 1080, H = 1350;
const MIN_LARGURA = 1400;
/* Foto de Instagram vem com 1080 px de largura. Num quadro de 1080x1350 isso e
   resolucao nativa quando a foto ja cobre o quadro (>= 1080 x 1350, o 4:5 da
   rede): nada e ampliado, entao o argumento do piso de 1400 nao se aplica. */
const COBRE_QUADRO = d => d.w >= 1080 && d.h >= 1350;
const ALVO_PROP = W / H;
/* Acima disso, o object-fit:cover do slide cheio corta mais da metade do
   lado maior pra encaixar no quadro 4:5 — e o corte e sempre centrado, entao
   qualquer motivo fora do meio (uma ave no canto esquerdo de uma foto bem
   larga, por exemplo) sai cortado ao meio ou desaparece. 09/10/2026: "O
   homem nu" (Efrain Almeida, 2360x1328) cortou a ave exatamente na cabeca —
   a proporcao da imagem (1.78) contra o alvo (0.8) so deixava 45% da largura
   visivel. Mesma logica do MIN_LARGURA: melhor nao usar a imagem do que usar
   ela mutilada. */
const LIMITE_PROP = 1.6;
/* 13/10/2026: imagem em paisagem passa da régua SE o dados.js trouxer `foco` (0 a 100,
   posição horizontal do recorte 4:5: 0 = borda esquerda, 50 = centro, 100 = direita),
   escolhido por quem olhou a obra. Sem `foco`, a trava de 09/10 continua valendo.
   Teto de 2.6× pra não virar tira. */
const LIMITE_COM_FOCO = 2.6;

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

  /* Uma casa não sai mais de duas vezes na mesma semana, mesmo que tenha as
     melhores imagens — senão o feed vira a agenda de uma galeria só. */
  const casaCheia = new Set();
  for (const k of (cfg.evitarCasa || [])) {
    if ((cfg.evitarCasa || []).filter(c => c === k).length >= 2) casaCheia.add(k);
  }

  const vivas = (DATA.expos || []).filter(e => {
    if (!V[e.v] || e.cartaz || fora.has(e.t + '|' + e.v) || casaCheia.has(e.v)) return false;
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
    if (!dim.w || (dim.w < MIN_LARGURA && !COBRE_QUADRO(dim))) continue;
    const prop = dim.w / dim.h;
    const desvio = Math.max(prop / ALVO_PROP, ALVO_PROP / prop);
    const temFoco = typeof e.foco === 'number' && e.foco >= 0 && e.foco <= 100;
    if (desvio > (temFoco ? LIMITE_COM_FOCO : LIMITE_PROP)) continue;

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
    <img class="sangra" src="${esc(o.rel)}"${typeof o.e.foco === 'number' ? ' style="object-position:' + o.e.foco + '% 50%"' : ''}>
  </div>`;
}

const _curto = iso => iso.slice(8, 10) + '.' + iso.slice(5, 7);

function contagem(hoje, fim) {
  const n = _dias(hoje, fim);
  if (n <= 0) return 'último dia é hoje';
  if (n === 1) return 'fecha amanhã';
  if (n <= 13) return 'daqui a ' + n + ' dias';
  return '';
}

/* ---------- etiqueta v2 (09/11/2026): a mesma língua do site e do Reel ----------
   Papel e tinta, a data como protagonista (número gigante na cor da obra), título em caixa-alta pesada,
   artista em itálico serifado, a obra inteira embaixo do número. O slide 1 (obra tela cheia, sem texto)
   não muda. A cor do número vem da obra (direcao.js); obra sem cor usa a terracota da casa. */
const DIAS_SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MES_CURTO = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const dowIso = iso => new Date(iso + 'T12:00:00Z').getUTCDay();
const DIA_LONGO = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function slideEtiqueta(o, cfg, hoje) {
  const modo = cfg.modo || 'obra';
  const cor = (o.pal && o.pal.texto) || '#C96F4A';
  /* v3 (11/11/2026): sem número gigante (o Lucas não gosta). O prazo vira uma frase em palavras, a obra cresce. */
  let quando = '', kicker = 'Em cartaz';
  if (modo === 'encerra' && o.e.fim) {
    const n = _dias(hoje, o.e.fim);
    kicker = 'Últimos dias';
    quando = n <= 0 ? 'Último dia é hoje.' : n === 1 ? 'Fecha amanhã, ' + porExtenso(o.e.fim) + '.' : 'Fecha ' + DIA_LONGO[dowIso(o.e.fim)] + ', ' + porExtenso(o.e.fim) + '.';
  } else if (modo === 'estreia' && o.e.ini) {
    kicker = 'Estreia';
    const n = _dias(hoje, o.e.ini);
    quando = n <= 0 ? 'Abre hoje.' : n === 1 ? 'Abre amanhã, ' + porExtenso(o.e.ini) + '.' : 'Abre ' + DIA_LONGO[dowIso(o.e.ini)] + ', ' + porExtenso(o.e.ini) + '.';
  } else if (o.e.fim) {
    quando = 'Em cartaz até ' + DIA_LONGO[dowIso(o.e.fim)] + ', ' + porExtenso(o.e.fim) + '.';
  }
  const quem = autoria(o.e);
  const nota2 = modo === 'obra' ? (cfg.nota || '') : '';
  const zonaTop = 130, zonaAlt = nota2 ? 620 : 700;
  const k = Math.min((W - 140) / o.dim.w, zonaAlt / o.dim.h);
  const w = Math.round(o.dim.w * k), h = Math.round(o.dim.h * k);
  const left = w < 640 ? W - 70 - w : 70;
  const topo = zonaTop + zonaAlt - h;
  const tamTit = (t => { const n = t.length; return n <= 14 ? 96 : n <= 24 ? 78 : n <= 36 ? 64 : n <= 52 ? 54 : 46; })(tituloCurto(o.e));
  return `<div class="slide v2 slide--${modo}" style="--ac:${cor}">
    <div class="cab"><b>Vernissages SP</b><span>${esc(kicker)}</span></div>
    <img class="obra" src="${esc(o.rel)}" style="left:${left}px;top:${topo}px;width:${w}px;height:${h}px">
    <div class="etq2" style="top:${topo + h + 36}px">
      ${quando ? `<div class="quando">${esc(quando)}</div>` : ''}
      <div class="tit" style="font-size:${tamTit}px">${esc(tituloCurto(o.e))}</div>
      ${quem ? `<div class="quem">${esc(quem)}</div>` : ''}
      <div class="onde">${esc(o.v.name)} · ${esc(o.v.b)}</div>
      <div class="serv">${o.e.fim ? 'até ' + esc(porExtenso(o.e.fim)) : 'encerramento não divulgado'} ${o.v.ig ? '· ' + esc(arroba(o.v.ig)) : ''}</div>
      ${nota2 ? `<div class="nota">${esc(nota2)}</div>` : ''}
    </div>
    <div class="cred">${esc(o.e.cred)}</div>
  </div>`;
}

function montarHTML(o, cfg, hoje) {
  const total = 2;
  const s = slideCheia(o) + slideEtiqueta(o, cfg, hoje);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    @font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
    @font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Regular.ttf');font-style:normal}
    .slide--cheia{background:#000}
    .slide--cheia::after{display:none}
    .slide .sangra{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    ${cssPaleta(cfg.paleta, cfg.textura)}
    .slide.v2{background:#F2EFE9;color:#0E0E0E}
    .slide.v2 .cab{position:absolute;left:70px;right:70px;top:56px;height:46px;border-bottom:3px solid #0E0E0E;display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.17em;text-transform:uppercase}
    .slide.v2 .cab span{color:var(--ac)}
    .slide.v2 .quando{font-family:'IS',serif;font-style:italic;font-size:46px;line-height:1.05;color:var(--ac);margin-bottom:22px}
    .slide.v2 .obra{object-fit:contain}
    .slide.v2 .etq2{position:absolute;left:70px;right:70px}
    .slide.v2 .tit{font-weight:800;text-transform:uppercase;letter-spacing:-.035em;line-height:.93}
    .slide.v2 .quem{font-family:'IS',serif;font-style:italic;font-weight:400;font-size:40px;line-height:1.04;margin-top:14px;color:#0E0E0E}
    .slide.v2 .onde{font-weight:800;font-size:23px;letter-spacing:.15em;text-transform:uppercase;margin-top:18px;color:#0E0E0E}
    .slide.v2 .serv{font-weight:500;font-size:22px;letter-spacing:.1em;text-transform:uppercase;margin-top:6px;color:#6f6a60}
    .slide.v2 .nota{font-size:23px;font-weight:300;line-height:1.5;margin-top:16px;max-width:900px;color:#0E0E0E}
    .slide.v2 .cred{left:70px;bottom:44px;width:900px;font-size:17px;font-weight:500;color:#9a948a}
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
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.temporada || PALETAS.escuro;

  const DATA = carregarDados();
  const cand = await escolher(DATA, hoje, cfg);

  console.log(cand.length + ' obra(s) elegível(is) em cartaz em ' + hoje +
    (cfg.filtro ? ' no recorte' : ''));
  if (!cand.length) throw new Error('Nenhuma obra passa a régua (imagem em disco, ≥' +
    MIN_LARGURA + ' px, proporção até ' + LIMITE_PROP + '× do quadro 4:5, crédito, não vista de sala, ' +
    'não cartaz). Amplie o filtro ou espelhe imagem.');

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

  try {
    const D = require('./direcao.js'), sharpC = require(path.join(process.env.RENDER_DIR || path.join(RAIZ, '.render'), 'node_modules', 'sharp'));
    o.pal = D.paletaDaCor(await D.corDaObra(sharpC, path.resolve(RAIZ, o.rel)));
  } catch (x) { console.log('cor da obra: ' + x.message); }
  const saida = path.resolve(RAIZ, flag('out', '.'));
  const tmp = path.join(RAIZ, '.obra-tmp.html');
  fs.writeFileSync(tmp, montarHTML(o, cfg, hoje), 'utf8');

  const puppeteer = require(path.join(process.env.RENDER_DIR || path.join(RAIZ, '.render'), 'node_modules', 'puppeteer-core'));
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
