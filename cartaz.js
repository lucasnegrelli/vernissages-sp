/* ============================================================
   CARTAZ — formato de social do Vernissages SP
   ============================================================

   O que é.

   O único formato do sistema que não depende de foto. Todos os outros
   (obra, salão, deriva, rima, aproximação) são liderados por imagem — e por
   isso as mostras sem reprodução boa nunca aparecem em lugar nenhum, por
   mais interessantes que sejam. O Cartaz usa só o que toda mostra tem por
   definição: título, artista, casa, datas. Tipografia em cascata (a mesma
   lógica do cartaz de rua — Paula Scher, os cartazes de Bienal citados no
   DESIGN.md) e uma barra que não é decoração: o comprimento dela é a fração
   real do tempo de mostra já passado. Forma carregando dado, não enfeite.

   Por que existe.

   28/09/2026: 21 mostras em cartaz sem imagem nenhuma, mas com data de
   início e fim completas — matéria-prima de sobra, sem imagem de sobra.
   Este formato não escolhe pela imagem; escolhe por ter as duas datas (sem
   elas não há barra) e um título que caiba na cascata.

   As travas:

   1. PRECISA DAS DUAS DATAS. Sem `ini` e `fim`, a barra de progresso não
      existe — e a barra é o dado real da peça, não um adereço que dá pra
      pular. Mostra sem `fim` fica de fora.
   2. NUNCA REPETE. Mesma trava de evitar/evitarCasa da família obra.

   Uso:
     node cartaz.js --config=SOCIAL/09/29/cartaz.json --out=SOCIAL/09/29 --date=2026-09-29
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, RAIZ, esc, porExtenso, arroba, tituloCurto, PALETAS, cssPaleta,
        passaFiltro, descreverFiltro, MARCA_HTML } = base;

const W = 1080, H = 1350;

const _dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00') - Date.parse(a + 'T12:00:00')) / 864e5);

/* ---------- escolha ---------- */

function escolher(DATA, hoje, cfg) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const fora = new Set([].concat(cfg.fora || [], cfg.evitar || []));
  const filtro = cfg.filtro || {};
  if (cfg.filtro) console.log('  recorte: ' + descreverFiltro(filtro));

  const casaCheia = new Set();
  for (const k of (cfg.evitarCasa || [])) {
    if ((cfg.evitarCasa || []).filter(c => c === k).length >= 2) casaCheia.add(k);
  }

  const cand = [];
  for (const e of (DATA.expos || [])) {
    const v = V[e.v];
    if (!v || e.cartaz || fora.has(e.t + '|' + e.v) || casaCheia.has(e.v)) continue;
    if (!e.ini || e.ini > hoje || !e.fim || e.fim < hoje) continue; // precisa das duas datas
    if (!passaFiltro(e, v, hoje, filtro)) continue;

    const duracao = _dias(e.ini, e.fim);
    /* fora dessa faixa a barra não diz nada: mostra de fim de semana é
       curta demais pra render legível, e mostra de longuíssima duração
       (acervo quase permanente) sempre parece "no começo", não importa o
       dia — "faltam 397 dias" não é urgência, é ruído. */
    if (duracao < 3 || duracao > 180) continue;

    const decorrido = _dias(e.ini, hoje);
    const fracao = Math.max(0, Math.min(1, decorrido / duracao));
    /* tituloCurto() já corta o " — autoria/subtítulo" (mesma convenção do
       resto do sistema); pontuação sozinha não vira palavra da cascata. */
    const palavras = tituloCurto(e).split(/\s+/).filter(p => /[a-zà-ú0-9]/i.test(p));
    if (!palavras.length || palavras.length > 9) continue; // título tem que caber na cascata

    let nota = 0;
    nota += Math.min(4, palavras.length); // título com mais de uma palavra rende mais cascata
    nota += e.d && e.d.length > 40 ? 2 : 0;
    nota -= 4 * (cfg.evitarCasa || []).filter(c => c === v.name).length;

    cand.push({ e, v, palavras, fracao, dias: { decorrido, duracao }, nota });
  }
  cand.sort((a, b) => b.nota - a.nota);
  return cand;
}

/* ---------- montagem ---------- */

/* Cascata tipográfica: a primeira palavra é a maior, cada uma seguinte
   um pouco menor — a mesma lógica de peso decrescente de um cartaz de rua.
   Nunca mais de 9 palavras (trava na escolha), nunca menor que 34px. */
function cascata(palavras) {
  const MAX = 118, MIN = 40, PASSO = (MAX - MIN) / Math.max(1, palavras.length - 1);
  return palavras.map((p, i) => {
    const tam = Math.round(MAX - PASSO * i);
    return `<div class="linha" style="font-size:${tam}px">${esc(p)}</div>`;
  }).join('');
}

function montarHTML(o, cfg) {
  const pal = cfg.paleta;
  const quem = (o.e.a || '').split(',').map(s => s.trim()).filter(Boolean).join(', ');
  const pctTexto = Math.round(o.fracao * 100);
  const restam = o.dias.duracao - o.dias.decorrido;
  const statusTxt = restam <= 0 ? 'último dia' : restam === 1 ? 'fecha amanhã' : 'faltam ' + restam + ' dias';

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${base.CSS}
    .slide{display:flex;flex-direction:column;justify-content:center}
    .cascata{position:absolute;left:88px;right:88px;top:180px}
    .cascata .linha{font-weight:800;letter-spacing:-.02em;line-height:.96;text-transform:uppercase}
    .quem{position:absolute;left:88px;top:100px;font-size:24px;font-weight:400;letter-spacing:.02em}
    .ficha{position:absolute;left:88px;right:88px;bottom:170px}
    .ficha .casa{font-size:26px;font-weight:600}
    .ficha .end{font-size:19px;margin-top:6px}
    .barra-wrap{position:absolute;left:88px;right:88px;bottom:118px}
    .barra-bg{width:100%;height:10px}
    .barra-label{display:flex;justify-content:space-between;font-size:16px;margin-top:10px;letter-spacing:.04em;text-transform:uppercase}
    ${cssPaleta(pal, cfg.textura)}
    .barra-bg{background:${pal.apagado}}
    .barra-fill{background:${pal.texto}}
    .quem,.ficha .end{color:${pal.meio}}
    .barra-label{color:${pal.fraco}}
    </style></head><body>
    <div class="slide">
      ${quem ? `<div class="quem">${esc(quem)}</div>` : ''}
      <div class="cascata">${cascata(o.palavras)}</div>
      <div class="ficha">
        <div class="casa">${esc(o.v.name)} ${esc(arroba(o.v.ig))}</div>
        <div class="end">${esc(o.v.addr)}, ${esc(o.v.b)}</div>
      </div>
      <div class="barra-wrap">
        <div class="barra-bg"><div class="barra-fill" style="width:${pctTexto}%;height:10px"></div></div>
        <div class="barra-label"><span>abriu ${esc(porExtenso(o.e.ini))}</span><span>${statusTxt}</span></div>
      </div>
      <div class="marca">${MARCA_HTML}</div>
    </div>
    </body></html>`;
}

/* ---------- execução ---------- */

async function principal() {
  const argv = process.argv.slice(2);
  const seco = argv.includes('--seco');
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));

  let cfg;
  if (seco && !argv.some(x => x.startsWith('--config='))) {
    cfg = { paleta: 'escuro', textura: 0.05, nome: 'cartaz' };
  } else {
    cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  }
  const paletaNome = cfg.paleta;
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.temporada || PALETAS.escuro;

  const DATA = carregarDados();
  const cand = escolher(DATA, hoje, cfg);

  console.log(cand.length + ' mostra(s) elegível(is) para cartaz em ' + hoje +
    (cfg.filtro ? ' no recorte' : ''));
  if (!cand.length) throw new Error('Nenhuma mostra passa a régua (data de início e fim completas, ' +
    'título com até 9 palavras, mostra com pelo menos 3 dias de duração, não vetada). Amplie o filtro.');

  const o = cand[0];
  console.log('PICK ' + o.e.t + '|' + o.e.v);
  console.log('\n  escolhida: ' + o.e.t + (o.e.a ? ' — ' + o.e.a : '') + '  ·  ' + o.v.name +
    '\n  dia ' + o.dias.decorrido + ' de ' + o.dias.duracao + ' (' + Math.round(o.fracao * 100) + '%) · nota ' + o.nota.toFixed(1));
  console.log('  paleta ' + paletaNome);

  if (seco) { console.log('\n--seco: nada foi renderizado.'); return; }

  const saida = path.resolve(RAIZ, flag('out', '.'));
  const tmp = path.join(RAIZ, '.cartaz-tmp.html');
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
  await new Promise(r => setTimeout(r, 700));

  fs.mkdirSync(saida, { recursive: true });
  const els = await page.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    const p = path.join(saida, (cfg.nome || 'cartaz') + '-' + String(i + 1).padStart(2, '0') + '.png');
    await els[i].screenshot({ path: p });
    console.log('OK ' + p);
  }
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('\n' + els.length + ' slide · sem foto, só tipografia e a barra do tempo real de mostra');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
