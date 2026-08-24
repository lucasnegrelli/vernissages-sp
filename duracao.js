/* ============================================================
   A DURAÇÃO — formato de social do Vernissages SP
   ============================================================

   O que e.

   Todas as mostras em cartaz desenhadas como linhas de tempo, uma embaixo da
   outra, ordenadas por data de encerramento. Nao ha fotografia nem titulo no
   desenho: e um diagrama, e o assunto dele e uma coisa que ninguem mede.

   O que ele revela.

   Levantamento de 30/08/2026, sobre as 56 mostras em cartaz com data de fim
   conhecida:

     galeria        mediana de  42 dias · restam 20 na mediana
     institucional  mediana de 141 dias · restam 56 na mediana

   Mostra de galeria dura um terço do que dura mostra de museu, e metade das
   que estao em cartaz agora acaba em menos de tres semanas. A arte comercial e
   efemera e a institucional e quase permanente — e ninguem conta isso a quem
   esta decidindo o que ver. O calendario da cidade tem duas velocidades
   sobrepostas, e o desenho mostra as duas de uma vez.

   Por que no domingo.

   Domingo e o dia de olhar o mes inteiro, nao a tarde. E o unico dia em que
   faz sentido publicar uma peca que nao manda ninguem a lugar nenhum agora.

   Esteticamente.

   E a primeira peca da semana que nao e nem fotografia nem tipografia. Linhas
   finas sobre escuro, sem grade, sem rotulo, sem legenda dentro do desenho —
   mais perto de um sismografo ou de uma partitura do que de um grafico. A
   leitura vem no slide seguinte; o primeiro e para olhar.

   As travas:

   1. SO ENTRA MOSTRA COM `ini` E `fim`. Sem as duas datas nao ha linha para
      desenhar, e inventar comprimento seria inventar dado. As sem `fim` sao
      contadas a parte e declaradas.
   2. TODO NUMERO E CALCULADO. Medianas, contagens e restos saem da base na
      hora; o config so traz texto.
   3. A JANELA E DECLARADA. O desenho corta em 75 dias atras e 120 a frente, e
      barra que atravessa a borda aparece esmaecida em vez de terminar reto —
      senao o desenho mentiria dizendo que a mostra acaba ali.

   Uso:
     node duracao.js --config=SOCIAL/08/30/duracao.json --out=SOCIAL/08/30 --date=2026-08-30

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, RAIZ, CSS, esc, porExtenso, carimbo,
        arroba, tituloCurto, autoria, PALETAS, cssPaleta } = base;

const W = 1080, H = 1350;
const ATRAS = 75, FRENTE = 120;      // janela do desenho, em dias
const X0 = 60, X1 = W - 60;          // o desenho sangra mais que o texto
const Y0 = 210, Y1 = 1215;

const MES_CURTO = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

const dia = iso => Date.parse(iso + 'T12:00:00');
const dias = (a, b) => Math.round((dia(b) - dia(a)) / 864e5);
const soma = (iso, n) => new Date(dia(iso) + n * 864e5).toISOString().slice(0, 10);
const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

/* ---------- leitura ---------- */

function levantar(DATA, hoje) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const cartaz = DATA.expos.filter(e => e.ini && e.ini <= hoje && (!e.fim || e.fim >= hoje) && V[e.v]);
  const comFim = cartaz.filter(e => e.fim);
  const semFim = cartaz.filter(e => !e.fim);

  const linhas = comFim.map(e => ({
    e, v: V[e.v], tipo: V[e.v].tipo,
    dur: dias(e.ini, e.fim), resta: dias(hoje, e.fim)
  })).sort((a, b) => a.e.fim.localeCompare(b.e.fim) || a.dur - b.dur);

  const por = t => linhas.filter(l => l.tipo === t);
  const stats = t => {
    const g = por(t);
    return g.length ? { n: g.length, dur: mediana(g.map(x => x.dur)), resta: mediana(g.map(x => x.resta)) } : null;
  };

  return { linhas, semFim, cartaz,
           galeria: stats('galeria'), institucional: stats('institucional'),
           casas: new Set(cartaz.map(e => e.v)).size };
}

/* ---------- o desenho ----------

   Uma barra por mostra, ordenadas por data de encerramento: as que morrem
   primeiro em cima. O resultado e uma escada descendente, e a inclinacao dela
   e a informacao — degrau curto significa muita mostra acabando junto. */
function svgDiagrama(L, hoje, cfg) {
  const ini = soma(hoje, -ATRAS), fim = soma(hoje, FRENTE);
  const total = dias(ini, fim);
  const px = d => X0 + (d / total) * (X1 - X0);
  const alturaLinha = (Y1 - Y0) / L.linhas.length;
  const esp = Math.min(5, Math.max(2.5, alturaLinha * 0.34));

  const cor = t => t === 'galeria' ? cfg.paleta.texto
    : t === 'institucional' ? cfg.paleta.fraco : cfg.paleta.meio;

  let s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';

  /* Marcas de mes: so a linha vertical fininha e a sigla. Sem grade. */
  let m = new Date(dia(ini)); m.setUTCDate(1); m.setUTCMonth(m.getUTCMonth() + 1);
  while (m.getTime() < dia(fim)) {
    const iso = m.toISOString().slice(0, 10);
    const x = px(dias(ini, iso));
    s += '<line x1="' + x.toFixed(1) + '" y1="' + (Y0 - 26) + '" x2="' + x.toFixed(1) + '" y2="' + Y1 +
         '" stroke="' + cfg.paleta.apagado + '" stroke-width="0.6" stroke-opacity=".45"/>';
    s += '<text x="' + (x + 8).toFixed(1) + '" y="' + (Y0 - 32) + '" fill="' + cfg.paleta.apagado +
         '" font-family="Switzer" font-size="19" font-weight="400">' + MES_CURTO[m.getUTCMonth()] + '</text>';
    m.setUTCMonth(m.getUTCMonth() + 1);
  }

  /* Hoje. A unica linha grossa do desenho, com o rotulo no topo — embaixo ele
     colidia com a legenda das cores. */
  const xh = px(ATRAS);
  s += '<line x1="' + xh.toFixed(1) + '" y1="' + (Y0 - 26) + '" x2="' + xh.toFixed(1) + '" y2="' + (Y1 + 10) +
       '" stroke="' + cfg.paleta.texto + '" stroke-width="1.4"/>';
  s += '<text x="' + (xh - 10).toFixed(1) + '" y="' + (Y0 - 32) + '" text-anchor="end" fill="' + cfg.paleta.texto +
       '" font-family="Switzer" font-size="20" font-weight="500" letter-spacing="2">HOJE</text>';

  L.linhas.forEach((l, i) => {
    const y = Y0 + i * alturaLinha + alturaLinha / 2;
    const cortaE = l.e.ini < ini, cortaD = l.e.fim > fim;
    const a = px(Math.max(0, dias(ini, l.e.ini)));
    const b = px(Math.min(total, dias(ini, l.e.fim)));
    const c = cor(l.tipo);

    s += '<rect x="' + a.toFixed(1) + '" y="' + (y - esp / 2).toFixed(1) + '" width="' + Math.max(1.5, b - a).toFixed(1) +
         '" height="' + esp.toFixed(1) + '" fill="' + c + '" rx="' + (esp / 2).toFixed(1) + '"/>';
    /* Quem atravessa a borda ganha um ponto do lado de fora: a mostra continua
       alem do quadro. A primeira versao tentava esmaecer a ponta com dois
       retangulos sobrepostos e o que saiu foi um bloco opaco no comeco de toda
       linha longa — sujeira, nao gradiente. Um ponto diz a mesma coisa e nao
       suja nada. */
    if (cortaE) s += '<circle cx="' + (X0 - 9) + '" cy="' + y.toFixed(1) + '" r="2" fill="' + c + '" fill-opacity=".7"/>';
    if (cortaD) s += '<circle cx="' + (X1 + 9) + '" cy="' + y.toFixed(1) + '" r="2" fill="' + c + '" fill-opacity=".7"/>';
  });

  s += '</svg>';
  return s;
}

/* ---------- slides ---------- */

function slideDiagrama(L, hoje, cfg, total) {
  return `<div class="slide">
    <div class="kick">a duração</div>
    ${svgDiagrama(L, hoje, cfg)}
    <div style="position:absolute;left:60px;right:60px;bottom:78px;display:flex;gap:34px;
                font-size:19px;font-weight:300;color:${cfg.paleta.fraco}">
      <span><span style="display:inline-block;width:26px;height:4px;border-radius:2px;background:${cfg.paleta.texto};vertical-align:middle;margin-right:9px"></span>galeria</span>
      <span><span style="display:inline-block;width:26px;height:4px;border-radius:2px;background:${cfg.paleta.fraco};vertical-align:middle;margin-right:9px"></span>instituição</span>
      <span><span style="display:inline-block;width:26px;height:4px;border-radius:2px;background:${cfg.paleta.meio};vertical-align:middle;margin-right:9px"></span>híbrido e feira</span>
    </div>
    <div class="pag">1/${total}</div>
  </div>`;
}

function slideLeitura(L, cfg, total) {
  return `<div class="slide">
    <div class="kick">o que o desenho mostra</div>
    <div class="risco" style="top:150px"></div>
    <div style="position:absolute;left:88px;right:88px;top:214px;bottom:214px;
                display:flex;flex-direction:column;justify-content:center">
      <div style="display:flex;gap:70px;margin-bottom:56px">
        <div>
          <div style="font-size:96px;font-weight:200;letter-spacing:-.04em;line-height:1;color:${cfg.paleta.texto}">${L.galeria.dur}</div>
          <div style="font-size:22px;font-weight:300;margin-top:12px;color:${cfg.paleta.fraco}">dias é o que dura<br>uma mostra de galeria</div>
        </div>
        <div>
          <div style="font-size:96px;font-weight:200;letter-spacing:-.04em;line-height:1;color:${cfg.paleta.texto}">${L.institucional.dur}</div>
          <div style="font-size:22px;font-weight:300;margin-top:12px;color:${cfg.paleta.fraco}">dias é o que dura<br>uma mostra de museu</div>
        </div>
      </div>
      <div class="arg" style="position:static;width:auto;font-size:31px">
        ${cfg.texto.map(p => '<p style="margin-bottom:26px">' + esc(p) + '</p>').join('')}
        <span class="virada" style="margin-top:32px;font-size:42px">${esc(cfg.virada)}</span>
      </div>
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">2/${total}</div>
  </div>`;
}

function slideUrgente(L, cfg, total, limite) {
  const fila = L.linhas.filter(l => l.resta <= limite);
  const linhas = fila.map(l => `
    <div style="display:flex;gap:18px;margin-bottom:17px">
      <span style="min-width:96px;color:${cfg.paleta.texto};font-weight:400">${l.resta === 0 ? 'hoje' : l.resta === 1 ? 'amanhã' : l.resta + ' dias'}</span>
      <span style="flex:1">${esc(tituloCurto(l.e))}${autoria(l.e) ? ', de ' + esc(autoria(l.e)) : ''}
        <span style="display:block;font-size:18px;color:${cfg.paleta.fraco};margin-top:2px">${esc(l.v.name)}${l.v.ig ? ' ' + esc(arroba(l.v.ig)) : ''}</span></span>
    </div>`).join('');

  return `<div class="slide">
    <div class="kick">acabam em ${limite} dias</div>
    <div class="risco" style="top:150px"></div>
    <div style="position:absolute;left:88px;right:88px;top:212px;font-size:22px;
                font-weight:300;line-height:1.36;color:${cfg.paleta.texto}">${linhas}</div>
    <div style="position:absolute;left:88px;right:88px;bottom:150px;font-size:20px;
                font-weight:300;line-height:1.55;color:${cfg.paleta.apagado}">
      ${fila.length} de ${L.linhas.length} mostras em cartaz. As outras ${L.linhas.length - fila.length} têm mais tempo${L.semFim.length ? ', e ' + L.semFim.length + ' não divulgaram data de encerramento' : ''}.
    </div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">${total}/${total}</div>
  </div>`;
}

function montarHTML(L, hoje, cfg) {
  const total = 3;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta)}
    svg text{font-family:'Switzer',sans-serif}</style></head><body>` +
    slideDiagrama(L, hoje, cfg, total) + slideLeitura(L, cfg, total) +
    slideUrgente(L, cfg, total, cfg.limiteUrgente || 14) +
    `</body></html>`;
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
  const L = levantar(DATA, hoje);

  console.log(L.cartaz.length + ' mostras em cartaz em ' + hoje + ' · ' + L.casas + ' casas');
  console.log('  com data de fim: ' + L.linhas.length + ' · sem: ' + L.semFim.length);
  console.log('  galeria:       mediana ' + L.galeria.dur + ' dias de duração, restam ' + L.galeria.resta);
  console.log('  institucional: mediana ' + L.institucional.dur + ' dias de duração, restam ' + L.institucional.resta);
  const urg = L.linhas.filter(l => l.resta <= (cfg.limiteUrgente || 14)).length;
  console.log('  acabam em ' + (cfg.limiteUrgente || 14) + ' dias: ' + urg);

  if (L.linhas.length < 20) throw new Error('So ' + L.linhas.length + ' mostras com data de fim — o desenho nao tem massa para dizer nada.');
  if (!L.galeria || !L.institucional) throw new Error('Falta um dos dois tipos: a peca compara galeria com instituicao.');

  const tmp = path.join(RAIZ, '.dur-tmp.html');
  fs.writeFileSync(tmp, montarHTML(L, hoje, cfg), 'utf8');

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
  await new Promise(r => setTimeout(r, 800));

  fs.mkdirSync(saida, { recursive: true });
  const els = await page.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    const p = path.join(saida, cfg.nome + '-' + String(i + 1).padStart(2, '0') + '.png');
    await els[i].screenshot({ path: p });
    console.log('OK ' + p);
  }
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('\n' + els.length + ' slides · ' + L.linhas.length + ' linhas desenhadas, todas com ini e fim reais');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
