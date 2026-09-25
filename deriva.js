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

function elegiveis(DATA, hoje, filtro, evitar) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  if (filtro) console.log('  recorte: ' + base.descreverFiltro(filtro));
  const bloq = new Set(evitar || []);
  let pulou = 0;
  const porCasa = new Map();
  for (const e of DATA.expos) {
    if (!e.ini || e.ini > hoje) continue;
    if (e.fim && e.fim < hoje) continue;
    const v = V[e.v];
    if (!v || typeof v.lat !== 'number') continue;
    if (bloq.has(chave(e))) { pulou++; continue; }   // saiu no feed há pouco
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
  if (pulou) console.log('  ' + pulou + ' mostra(s) fora por já terem saído no feed');
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

/* ---------- mapa ----------

   v2 (25/09/2026). A primeira deriva tinha só os pontos e um fio tracejado
   num vazio, e mesmo assim foi a peça que mais rendeu: o roteiro a pé é o
   que a pessoa manda para quem vai junto. A v2 desenha as ruas de verdade,
   vindas do OpenStreetMap (Overpass), no nosso traço — sem tile, sem estilo
   de serviço de mapa, só as linhas das ruas por baixo da rota. Sem rede, cai
   no desenho só com os pontos. Cache em .render/osm/.

   Projeção: em 2 km a curvatura da Terra é irrelevante; equiretangular com a
   longitude corrigida pelo cosseno da latitude mantém o quarteirão na
   proporção certa. */

const ACENTO = '#C96F4A';

function projetor(paradas, largura, altura, margem) {
  const lat0 = paradas.reduce((s, p) => s + p.v.lat, 0) / paradas.length;
  const k = Math.cos(rad(lat0));
  const xs = paradas.map(p => p.v.lng * k), ys = paradas.map(p => -p.v.lat);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = (maxX - minX) || 1e-6, spanY = (maxY - minY) || 1e-6;
  const e = Math.min((largura - margem * 2) / spanX, (altura - margem * 2) / spanY);
  const ox = margem + ((largura - margem * 2) - spanX * e) / 2, oy = margem + ((altura - margem * 2) - spanY * e) / 2;
  const f = (lat, lng) => ({ x: ox + (lng * k - minX) * e, y: oy + (-lat - minY) * e });
  f.pxPorMetro = e / 111320;
  /* caixa geográfica que o quadro cobre, para pedir as ruas */
  f.caixa = { s: -((altura - oy) / e + minY), n: -((0 - oy) / e + minY),
              w: ((0 - ox) / e + minX) / k, l: ((largura - ox) / e + minX) / k };
  return f;
}

const PESO_RUA = { trunk: 7, primary: 6, secondary: 4.5, tertiary: 3.2, unclassified: 2.2,
                   residential: 2.2, living_street: 2, pedestrian: 2.4 };

async function buscarRuas(paradas) {
  const f = projetor(paradas, 1080, 1080, 150);
  const c = f.caixa, folga = 0.004;
  const bb = [c.s - folga, c.w - folga, c.n + folga, c.l + folga].map(n => n.toFixed(5)).join(',');
  const dir = path.join(RAIZ, '.render', 'osm');
  const arq = path.join(dir, bb.replace(/[^0-9,.-]/g, '').replace(/,/g, '_') + '.json');
  if (fs.existsSync(arq)) return JSON.parse(fs.readFileSync(arq, 'utf8'));
  const q = '[out:json][timeout:60];way["highway"~"^(' + Object.keys(PESO_RUA).join('|') + ')$"](' + bb + ');out geom;';
  /* O servidor principal devolve 504 em hora cheia (visto em 25/09); os
     espelhos públicos servem a mesma base. */
  const ESPELHOS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter',
                    'https://overpass.private.coffee/api/interpreter'];
  let ultimoErro = null;
  for (const url of ESPELHOS) try {
    const r = await fetch(url, {
      method: 'POST', body: new URLSearchParams({ data: q }),
      /* Testado em 25/09: sem Accept o servidor dá 406; com corpo em string e
         gzip negociado, 504. Assim responde 200. */
      headers: { 'Accept': 'application/json', 'Accept-Encoding': 'identity',
                 'User-Agent': 'vernissagessp.com.br deriva' },
      signal: AbortSignal.timeout(60000)
    });
    if (!r.ok) throw new Error('Overpass ' + r.status);
    const j = await r.json();
    const ruas = j.elements.filter(w => w.geometry).map(w => ({ t: w.tags.highway, g: w.geometry.map(p => [p.lat, p.lon]) }));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(arq, JSON.stringify(ruas));
    return ruas;
  } catch (e) { ultimoErro = e; console.log("  overpass " + url.split("/")[2] + ": " + e.message); }
  console.log('  (sem ruas do OSM: ' + (ultimoErro && ultimoErro.message) + ' — mapa sai só com os pontos)');
  return [];
}

function svgMapa(paradas, largura, altura, margem, pal, ruas, destaque) {
  const f = projetor(paradas, largura, altura, margem);
  const pt = paradas.map(p => f(p.v.lat, p.v.lng));
  const mini = largura < 500;
  let s = `<svg width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" style="display:block">`;
  const escalaRua = mini ? 0.45 : 1;
  for (const r of ruas || []) {
    const d = r.g.map((c, i) => { const p = f(c[0], c[1]); return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join('');
    s += `<path d="${d}" fill="none" stroke="${pal.traco}" stroke-opacity=".38" stroke-width="${((PESO_RUA[r.t] || 2) * escalaRua).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const fio = pt.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  s += `<path d="${fio}" fill="none" stroke="${ACENTO}" stroke-width="${mini ? 4 : 9}" stroke-linecap="round" stroke-linejoin="round"/>`;
  pt.forEach((p, i) => {
    const ativo = destaque == null || destaque === i;
    const r = mini ? (destaque === i ? 15 : 8) : 30;
    s += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${ativo ? pal.texto : pal.fundo}" stroke="${pal.texto}" stroke-width="${mini ? 2.5 : 3}"/>`;
    if (!mini) s += `<text x="${p.x.toFixed(1)}" y="${(p.y + 11).toFixed(1)}" text-anchor="middle" fill="${pal.fundo}" font-size="30" font-weight="800">${i + 1}</text>`;
  });
  if (!mini) {
    const alvo = [100, 200, 300, 500].find(m => m * f.pxPorMetro < largura * 0.3) || 100;
    const barra = alvo * f.pxPorMetro, by = altura - 34, bx = 72;
    s += `<rect x="${bx}" y="${by - 3}" width="${barra.toFixed(1)}" height="6" fill="${pal.texto}"/>`;
    s += `<text x="${(bx + barra + 16).toFixed(1)}" y="${by + 8}" fill="${pal.texto}" font-size="22" font-weight="600">${alvo} m</text>`;
  }
  return s + '</svg>';
}

/* ---------- slides ---------- */

const CSS_DERIVA = pal => `
.slide{background:${pal.fundo};color:${pal.texto}}
.dv-et{position:absolute;top:64px;font-size:18px;font-weight:600;letter-spacing:.28em;text-transform:uppercase}
.dv-h{position:absolute;left:66px;right:60px;top:112px;font-size:118px;font-weight:800;line-height:.88;letter-spacing:-.045em;text-transform:uppercase}
.dv-map{position:absolute;left:0;top:360px}
.dv-conta{position:absolute;left:72px;right:72px;bottom:64px;display:flex;gap:64px;align-items:flex-end}
.dv-conta b{display:block;font-size:84px;font-weight:800;line-height:1;letter-spacing:-.04em}
.dv-conta span{display:block;font-size:20px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${pal.meio};margin-top:6px}
.dv-osm{position:absolute;right:72px;bottom:70px;font-size:14px;color:${pal.fraco}}
.dv-n{position:absolute;left:66px;top:58px;font-size:170px;font-weight:800;line-height:.85;letter-spacing:-.05em;color:${ACENTO}}
.dv-dist{position:absolute;left:72px;top:218px;font-size:30px;font-weight:500}
.dv-mini{position:absolute;right:72px;top:64px;width:250px;height:250px;border:2px solid ${pal.texto}}
.dv-obra{position:absolute;left:72px;right:72px;top:340px;height:620px;display:flex;align-items:center;justify-content:center}
.dv-obra img{max-width:100%;max-height:100%;display:block}
.dv-ficha{position:absolute;left:72px;right:72px;top:1000px}
.dv-ficha .c{font-size:54px;font-weight:700;line-height:1.02;letter-spacing:-.025em}
.dv-ficha .m{font-size:28px;font-weight:400;margin-top:14px;line-height:1.25}
.dv-ficha .a{font-size:22px;font-weight:400;color:${pal.fraco};margin-top:12px}
.dv-cred{position:absolute;left:72px;bottom:56px;font-size:14px;color:${pal.fraco};max-width:640px}
.dv-pag{position:absolute;right:72px;bottom:56px;font-size:17px;font-weight:600;letter-spacing:.2em;color:${pal.fraco}}
.dv-li{display:flex;gap:26px;align-items:baseline;padding:16px 0;border-top:2px solid ${pal.texto}}
.dv-li .k{font-size:54px;font-weight:800;color:${ACENTO};width:74px;letter-spacing:-.04em;line-height:.9}
.dv-li .c{font-size:32px;font-weight:700;letter-spacing:-.015em}
.dv-li .c small{display:block;font-size:21px;font-weight:400;color:${pal.fraco};margin-top:4px;letter-spacing:0}
`;

const bairroDe = paradas => {
  const n = {}; paradas.forEach(p => n[p.v.b] = (n[p.v.b] || 0) + 1);
  return Object.entries(n).sort((a, b) => b[1] - a[1])[0][0];
};

function slideMapa(paradas, totalMetros, cfg, total) {
  const pal = cfg.paleta;
  const km = (totalMetros / 1000).toFixed(1).replace('.', ',');
  const min = Math.round(totalMetros / 1.25 / 60);
  return `<div class="slide">
    <div class="dv-et" style="left:72px;color:${ACENTO}">roteiro a pé</div>
    <div class="dv-et" style="right:72px;color:${pal.fraco}">Vernissages SP</div>
    <div class="dv-h">${esc(bairroDe(paradas))}<br>a pé</div>
    <div class="dv-map">${svgMapa(paradas, 1080, 760, 130, pal, cfg.ruas)}</div>
    <div class="dv-conta">
      <div><b>${paradas.length}</b><span>galerias</span></div>
      <div><b>${km}</b><span>km</span></div>
      <div><b>${min}</b><span>min andando</span></div>
    </div>
    ${cfg.ruas && cfg.ruas.length ? '<div class="dv-osm">ruas © OpenStreetMap</div>' : ''}
  </div>`;
}

function slideParada(p, n, total, distAnterior, paradas, cfg) {
  const quem = autoria(p.e);
  return `<div class="slide">
    <div class="dv-n">${String(n).padStart(2, '0')}</div>
    <div class="dv-dist">${distAnterior != null ? '+ ' + distAnterior + ' m a pé' : 'comece aqui'}</div>
    <div class="dv-mini">${svgMapa(paradas, 246, 246, 30, cfg.paleta, cfg.ruas, n - 1)}</div>
    <div class="dv-obra"><img src="${esc(p.rel)}"></div>
    <div class="dv-ficha">
      <div class="c">${esc(p.v.name)}</div>
      <div class="m">${esc(tituloCurto(p.e))}${quem ? ', de ' + esc(quem) : ''}</div>
      <div class="a">${esc(p.v.addr)} · ${esc(p.v.b)}${p.e.fim ? ' · até ' + esc(porExtenso(p.e.fim)) : ''}</div>
    </div>
    <div class="dv-cred">${esc(p.e.cred)}</div>
    <div class="dv-pag">${n + 1}/${total}</div>
  </div>`;
}

function slideFecho(paradas, totalMetros, cfg, total) {
  const pal = cfg.paleta;
  const linhas = paradas.map((p, i) => `<div class="dv-li"><div class="k">${i + 1}</div>
    <div class="c">${esc(p.v.name)}<small>${esc(p.v.addr)} · até ${p.e.fim ? esc(porExtenso(p.e.fim)) : 'sem data'}</small></div></div>`).join('');
  return `<div class="slide">
    <div class="dv-et" style="left:72px;color:${ACENTO}">salva pro sábado</div>
    <div class="dv-h" style="font-size:96px">O percurso</div>
    <div style="position:absolute;left:72px;right:72px;top:260px">${linhas}
      <div style="border-top:2px solid ${pal.texto};padding-top:26px;font-size:30px;line-height:1.3;font-weight:400">${esc(cfg.virada || '')}</div>
      <div style="margin-top:20px;font-size:19px;color:${pal.fraco};line-height:1.5">≈ ${(totalMetros / 1000).toFixed(1).replace('.', ',')} km em linha reta entre as casas; a calçada é um pouco mais longa.${
        cfg.carimbo ? ' Conferido na base do Vernissages SP em ' + esc(cfg.carimbo) + '.' : ''}</div>
    </div>
    <div class="dv-et" style="left:72px;top:auto;bottom:56px;color:${pal.fraco}">vernissagessp.com.br · manda pra quem vai junto</div>
    <div class="dv-pag">${total}/${total}</div>
  </div>`;
}

function montarHTML(paradas, totalMetros, cfg) {
  const total = paradas.length + 2;
  let s = slideMapa(paradas, totalMetros, cfg, total);
  paradas.forEach((p, i) => { s += slideParada(p, i + 1, total, i ? p.distAnterior : null, paradas, cfg); });
  s += slideFecho(paradas, totalMetros, cfg, total);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta, cfg.textura)}
    ${CSS_DERIVA(cfg.paleta)}
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
  const cfgPre = caminhoCfg
    ? JSON.parse(fs.readFileSync(path.resolve(caminhoCfg), 'utf8'))
    : {};
  const cands = elegiveis(DATA, hoje, cfgPre.filtro || null, cfgPre.evitar);

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
  cfg.ruas = await buscarRuas(paradas);
  if (cfg.ruas.length) console.log("  mapa: " + cfg.ruas.length + " ruas do OSM");

  console.log('percurso de ' + paradas.length + ' paradas · ' + Math.round(total) + ' m');
  paradas.forEach((p, i) => console.log('  ' + (i + 1) + '. ' + p.v.name +
    (p.distAnterior != null ? '  (≈' + p.distAnterior + ' m)' : '') +
    '  [' + p.dim.w + 'x' + p.dim.h + ']'));
  /* Achado em 23/09/2026: deriva escolhe obra (esta no CONSOME_OBRA do
     semana.js) mas nunca imprimia PICK — as paradas nunca entravam no
     POSTADAS.json, e a mesma obra podia voltar cedo demais num outro
     formato (ou na propria deriva, semana seguinte). obra.js sempre fez
     isto; aqui faltava. */
  paradas.forEach(p => console.log('PICK ' + p.e.t + '|' + p.v.name));

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
