/* ============================================================
   DERIVA — formato de social do Vernissages SP
   ============================================================

   O que e.

   Um percurso a pe entre casas com mostra em cartaz, com as distancias
   calculadas das coordenadas reais e um mapa desenhado do zero: so os pontos e
   o fio que os liga, sem rua, sem satelite, sem logotipo de servico de mapa.

   O nome vem da deriva situacionista — a pratica, descrita por Debord em 1956,
   de atravessar a cidade conduzido pelo terreno em vez dos motivos habituais
   de deslocamento. E o que a peca propoe: uma tarde guiada pelo que esta em
   cartaz, nao pelo caminho de sempre.

   Por que so nos podemos fazer.

   Rima compara, aproximacao aprofunda — as duas trabalham o olho. Esta
   trabalha as pernas, e depende de um ativo que nenhum agregador tem:
   latitude e longitude das 91 casas. Sem coordenada nao ha distancia, sem
   distancia nao ha percurso, e sem percurso isto vira lista de galeria.

   As travas:

   1. TODA PARADA TEM OBRA. Casa cuja mostra nao tem imagem em disco nao entra
      no percurso — nao existe parada em chapado tipografico. O percurso e
      montado entre as elegiveis, nunca remendado depois.

   2. NENHUMA IMAGEM SE REPETE. Uma obra por parada, e o mapa nao usa nenhuma.

   3. DISTANCIA E MEDIDA, NAO ESTIMADA. Haversine sobre as coordenadas do
      dados.js. Como e distancia em linha reta e nao rota de calcada, a peca
      declara isso no ultimo slide em vez de fingir precisao que nao tem.

   Uso:
     node deriva.js --listar
     node deriva.js --config=SOCIAL/08/26/deriva.json --out=SOCIAL/08/26

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, acharExpo, exigirObra, medir, chave, RAIZ,
        CSS, esc, porExtenso, carimbo, arroba, tituloCurto, autoria,
        PALETAS, cssPaleta } = base;

const W = 1080, H = 1350;
const RAIO_CLUSTER = 750;   // metros: o que se atravessa sem pensar
const MAX_PARADAS = 6;

/* ---------- geografia ---------- */

const rad = g => g * Math.PI / 180;

function metros(a, b) {
  const R = 6371000;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* Caminho aberto mais curto que visita todos os pontos. Com ate 6 paradas sao
   720 permutacoes — forca bruta e exata e instantanea, e evita a heuristica do
   vizinho mais proximo, que num aglomerado desses erra feio no ultimo trecho. */
function melhorRota(pontos) {
  const n = pontos.length, idx = [...Array(n).keys()];
  let melhor = null, menor = Infinity;
  const permutar = (atual, resto) => {
    if (!resto.length) {
      let d = 0;
      for (let i = 1; i < atual.length; i++) d += metros(pontos[atual[i - 1]], pontos[atual[i]]);
      if (d < menor) { menor = d; melhor = atual.slice(); }
      return;
    }
    for (let i = 0; i < resto.length; i++) {
      permutar(atual.concat(resto[i]), resto.slice(0, i).concat(resto.slice(i + 1)));
    }
  };
  permutar([], idx);
  return { ordem: melhor, total: menor };
}

/* ---------- selecao ---------- */

function elegiveis(DATA, hoje, filtro) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  if (filtro) console.log('  recorte: ' + base.descreverFiltro(filtro));
  const porCasa = new Map();
  for (const e of DATA.expos) {
    if (!e.ini || e.ini > hoje) continue;
    if (e.fim && e.fim < hoje) continue;
    const v = V[e.v];
    if (!v || typeof v.lat !== 'number') continue;
    if (!base.passaFiltro(e, v, hoje, filtro)) continue;
    let rel = null;
    try { rel = exigirObra(e); } catch { continue; }   // trava 1, aplicada na origem
    const ant = porCasa.get(e.v);
    /* Uma casa entra uma vez so. Entre duas mostras com obra, fica a de
       descricao mais longa: e a que tem fato para virar texto de parada. */
    if (!ant || (e.d || '').length > (ant.e.d || '').length) {
      porCasa.set(e.v, { e, v, rel });
    }
  }
  return [...porCasa.values()];
}

function clusters(cands) {
  const out = [];
  for (const c of cands) {
    const perto = cands.filter(o => o !== c && metros(c.v, o.v) <= RAIO_CLUSTER);
    if (perto.length >= 2) out.push({ centro: c, membros: [c, ...perto] });
  }
  out.sort((a, b) => b.membros.length - a.membros.length);
  return out;
}

/* Aperta o aglomerado ate o teto de paradas, tirando sempre a casa mais
   distante do centro de massa. Percurso longo demais deixa de ser deriva. */
function apertar(membros, teto) {
  const m = membros.slice();
  while (m.length > teto) {
    const cx = m.reduce((s, x) => s + x.v.lat, 0) / m.length;
    const cy = m.reduce((s, x) => s + x.v.lng, 0) / m.length;
    let pior = 0, dPior = -1;
    m.forEach((x, i) => {
      const d = metros(x.v, { lat: cx, lng: cy });
      if (d > dPior) { dPior = d; pior = i; }
    });
    m.splice(pior, 1);
  }
  return m;
}

/* ---------- o mapa ----------

   Desenhado do zero: pontos, fio e barra de escala. Nenhuma rua, nenhum
   satelite, nenhuma marca de servico de mapa. Em 700 metros a curvatura da
   Terra e irrelevante, entao basta uma equiretangular com a longitude
   corrigida pelo cosseno da latitude — o quarteirao sai com a proporcao certa. */
function svgMapa(paradas, largura, altura, margem, fundo) {
  const lat0 = paradas.reduce((s, p) => s + p.v.lat, 0) / paradas.length;
  const k = Math.cos(rad(lat0));
  const px = paradas.map(p => ({ x: p.v.lng * k, y: -p.v.lat }));

  const xs = px.map(p => p.x), ys = px.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = (maxX - minX) || 1e-6, spanY = (maxY - minY) || 1e-6;
  const esc0 = Math.min((largura - margem * 2) / spanX, (altura - margem * 2) / spanY);

  const proj = p => ({
    x: margem + (p.x - minX) * esc0 + ((largura - margem * 2) - spanX * esc0) / 2,
    y: margem + (p.y - minY) * esc0 + ((altura - margem * 2) - spanY * esc0) / 2
  });
  const pt = px.map(proj);

  /* Quantos pixels vale um metro, para a barra de escala nao mentir. */
  const grausPorMetro = 1 / 111320;
  const pxPorMetro = grausPorMetro * esc0;
  const alvo = [100, 200, 300, 500].find(m => m * pxPorMetro < largura * 0.34) || 100;
  const barra = alvo * pxPorMetro;

  const fio = pt.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');

  const pal = fundo;
  let s = '<svg width="' + largura + '" height="' + altura + '" viewBox="0 0 ' + largura + ' ' + altura + '">';
  s += '<path d="' + fio + '" fill="none" stroke="' + pal.traco + '" stroke-width="1.5" ' +
       'stroke-dasharray="7 7" stroke-linecap="round" stroke-linejoin="round"/>';
  pt.forEach((p, i) => {
    s += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="9" ' +
         'fill="' + pal.fundo + '" stroke="' + pal.texto + '" stroke-width="1.5"/>';
    s += '<text x="' + (p.x + 20).toFixed(1) + '" y="' + (p.y + 7).toFixed(1) + '" ' +
         'fill="' + pal.texto + '" font-family="Switzer" font-size="26" font-weight="500">' + (i + 1) + '</text>';
  });
  /* Escala no canto inferior esquerdo, como manda a convencao cartografica.
     Tentei ancora-la ao traçado e ela colidiu com a ultima parada — o percurso
     muda a cada peca e o canto e o unico ponto que nenhum deles ocupa. */
  const by = altura - 10, bx = 0;
  s += '<line x1="' + bx + '" y1="' + by + '" x2="' + (bx + barra).toFixed(1) + '" y2="' + by +
       '" stroke="' + pal.traco + '" stroke-width="1.5"/>';
  s += '<line x1="' + bx + '" y1="' + (by - 5) + '" x2="' + bx + '" y2="' + (by + 5) + '" stroke="' + pal.traco + '" stroke-width="1.5"/>';
  s += '<line x1="' + (bx + barra).toFixed(1) + '" y1="' + (by - 5) + '" x2="' + (bx + barra).toFixed(1) +
       '" y2="' + (by + 5) + '" stroke="' + pal.traco + '" stroke-width="1.5"/>';
  s += '<text x="' + (bx + barra + 14).toFixed(1) + '" y="' + (by + 6) +
       '" fill="' + pal.traco + '" font-family="Switzer" font-size="20" font-weight="400">' + alvo + ' m</text>';
  s += '</svg>';
  return s;
}

/* ---------- slides ---------- */

function slideMapa(paradas, cfg, total) {
  return `<div class="slide">
    <div class="kick">deriva</div>
    <div style="position:absolute;left:88px;top:186px">${svgMapa(paradas, 904, 800, 30, cfg.paleta)}</div>
    <div class="tese" style="top:1042px;width:880px;font-size:46px">${esc(cfg.tese)}</div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">1/${total}</div>
  </div>`;
}

function slideParada(p, n, total, distAnterior) {
  const cx = W - 88 * 2, cy = 620;
  const k = Math.min(cx / p.dim.w, cy / p.dim.h);
  const w = Math.round(p.dim.w * k), h = Math.round(p.dim.h * k);
  const quem = autoria(p.e);
  return `<div class="slide">
    <div style="position:absolute;left:88px;top:74px;font-family:'Switzer';font-size:104px;
                font-weight:300;letter-spacing:-.04em;line-height:1">${String(n).padStart(2, '0')}</div>
    ${distAnterior != null ? '<div class="kick" style="left:auto;right:88px;top:112px">≈ ' +
      distAnterior + ' m a pé</div>' : '<div class="kick" style="left:auto;right:88px;top:112px">ponto de partida</div>'}
    <img class="obra" src="${esc(p.rel)}" style="left:${Math.round((W - w) / 2)}px;top:${Math.round(250 + (cy - h) / 2)}px;width:${w}px;height:${h}px">
    <div class="ficha" style="top:952px">
      <div class="tit">${esc(p.v.name)}</div>
      <div class="quem" style="margin-top:14px">${esc(tituloCurto(p.e))}${quem ? ', de ' + esc(quem) : ''}</div>
      <div class="serv">${esc(p.v.addr)}, ${esc(p.v.b)}${p.v.ig ? '<br>' + esc(arroba(p.v.ig)) : ''}</div>
    </div>
    <div class="cred" style="width:520px">${esc(p.e.cred)}</div>
    <div class="pag">${n + 1}/${total}</div>
  </div>`;
}

function slideFecho(paradas, totalMetros, cfg, total) {
  const pal = cfg.paleta;
  const minutos = Math.round(totalMetros / 1.25 / 60);   // 1,25 m/s, passo de quem para para olhar
  const linhas = paradas.map((p, i) =>
    '<div style="margin-bottom:22px"><span style="color:' + pal.fraco + '">' + String(i + 1).padStart(2, '0') +
    '</span>&nbsp;&nbsp;' + esc(p.v.name) + '<br>' +
    '<span style="font-size:21px;color:' + pal.fraco + '">' + esc(p.v.addr) + ', ' + esc(p.v.b) +
    ' · até ' + (p.e.fim ? esc(porExtenso(p.e.fim)) : 'sem data') + '</span></div>').join('');

  return `<div class="slide">
    <div class="kick">o percurso</div>
    <div class="risco" style="top:150px"></div>
    <div class="ficha" style="top:214px">
      <div style="font-size:26px;font-weight:300;line-height:1.45;color:${pal.texto}">${linhas}</div>
      <div class="arg" style="position:static;width:auto;font-size:33px;margin-top:0">
        <span class="virada" style="margin-top:52px;font-size:44px">${esc(cfg.virada)}</span>
      </div>
      <div class="serv" style="margin-top:44px;color:${pal.apagado};font-size:19px">
        ${paradas.length} casas · ≈ ${(totalMetros / 1000).toFixed(1).replace('.', ',')} km · cerca de ${minutos} minutos de caminhada.<br>
        Distâncias em linha reta entre as coordenadas das casas: a calçada é um pouco mais longa.${
          cfg.carimbo ? '<br>Endereços e prazos conferidos na base do Vernissages SP em ' + esc(cfg.carimbo) + '.' : ''}
      </div>
    </div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">${total}/${total}</div>
  </div>`;
}

function montarHTML(paradas, totalMetros, cfg) {
  const total = paradas.length + 2;
  let s = slideMapa(paradas, cfg, total);
  paradas.forEach((p, i) => { s += slideParada(p, i + 1, total, i ? p.distAnterior : null); });
  s += slideFecho(paradas, totalMetros, cfg, total);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta, cfg.textura)}
    .slide .obra{position:absolute}
    svg text{font-family:'Switzer',sans-serif}</style></head><body>${s}</body></html>`;
}

/* ---------- execucao ---------- */

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date().toISOString().slice(0, 10));

  const DATA = carregarDados();

  /* O --listar roda sem config: e o modo de inspecao, e nele nao ha recorte.
     Fora dele o filtro vem do config, que so e lido mais abaixo — por isso a
     leitura antecipada aqui em vez de mover o `const cfg`, que quebraria o
     --listar. */
  const caminhoCfg = flag('config');
  const filtroCfg = caminhoCfg
    ? (JSON.parse(fs.readFileSync(path.resolve(caminhoCfg), 'utf8')).filtro || null)
    : null;
  const cands = elegiveis(DATA, hoje, filtroCfg);

  if (argv.includes('--listar')) {
    console.log(cands.length + ' casas com mostra em cartaz E obra em disco.\n');
    const cs = clusters(cands);
    console.log(cs.length + ' aglomerado(s) com 3 ou mais casas em ' + RAIO_CLUSTER + ' m:\n');
    const vistos = new Set();
    for (const c of cs) {
      const nomes = c.membros.map(m => m.v.name).sort().join('|');
      if (vistos.has(nomes)) continue;
      vistos.add(nomes);
      const sel = apertar(c.membros, MAX_PARADAS);
      const { ordem, total } = melhorRota(sel.map(m => m.v));
      console.log('· ' + sel.length + ' casas · ' + Math.round(total) + ' m · ' + c.centro.v.b);
      ordem.forEach((i, k) => console.log('    ' + (k + 1) + '. ' + sel[i].v.name +
        ' — ' + sel[i].e.t.slice(0, 42)));
      console.log('');
    }
    return;
  }

  const cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  const saida = path.resolve(RAIZ, flag('out', '.'));
  cfg.carimbo = carimbo(cfg, hoje);   // data da peca, nao do dia em que rodou

  /* A curadoria escolhe as casas; a matematica escolhe a ordem. */
  let sel;
  if (cfg.casas && cfg.casas.length) {
    sel = cfg.casas.map(nome => {
      const achou = cands.find(c => c.v.name === nome);
      if (!achou) throw new Error('Casa fora do percurso — sem mostra em cartaz com obra em disco: ' + nome);
      return achou;
    });
  } else {
    const cs = clusters(cands);
    if (!cs.length) throw new Error('Nenhum aglomerado de 3 casas com obra em ' + RAIO_CLUSTER + ' m.');
    sel = apertar(cs[0].membros, MAX_PARADAS);
  }
  if (sel.length < 3) throw new Error('Deriva com menos de tres paradas nao e percurso.');

  const { ordem, total } = melhorRota(sel.map(m => m.v));
  const paradas = ordem.map(i => sel[i]);

  /* Trava 2: uma obra por parada, nenhuma repetida. */
  const arquivos = new Set();
  for (const p of paradas) {
    if (arquivos.has(p.rel)) throw new Error('Duas paradas usam a mesma imagem: ' + p.rel);
    arquivos.add(p.rel);
    p.dim = await medir(p.rel);
  }
  paradas.forEach((p, i) => {
    p.distAnterior = i ? Math.round(metros(paradas[i - 1].v, p.v) / 10) * 10 : null;
  });

  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.papel;

  console.log('percurso de ' + paradas.length + ' paradas · ' + Math.round(total) + ' m');
  paradas.forEach((p, i) => console.log('  ' + (i + 1) + '. ' + p.v.name +
    (p.distAnterior != null ? '  (≈' + p.distAnterior + ' m)' : '') +
    '  [' + p.dim.w + 'x' + p.dim.h + ']'));

  const tmp = path.join(RAIZ, '.deriva-tmp.html');
  fs.writeFileSync(tmp, montarHTML(paradas, total, cfg), 'utf8');

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
  console.log('\n' + els.length + ' slides · ' + paradas.length + ' paradas, todas com obra · nenhuma imagem repetida');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
