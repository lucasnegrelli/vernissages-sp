/* ============================================================
   AGENDA — "o fim de semana": o que abre e o que fecha, num carrossel
   ============================================================

   O que é.

   O post fixo de utilidade da semana. Capa com a conta ("4 aberturas, 11
   últimas chances"), um slide por mostra (obra em cima, dia e serviço grandes
   embaixo) e um slide final de lista que funciona como print: tudo num lugar
   só, pra salvar e mandar no grupo.

   Por que existe.

   Em 25/09/2026 o feed tinha só formatos de leitura lenta (obra, rima,
   número) e alcance perto de zero. No Instagram de 2026, o que leva o post
   para quem não segue é o envio por DM, que vale de 3 a 5 vezes uma curtida
   (Mosseri). E o post que se manda para o amigo é o plano: "bora nesse
   sábado?". A referência é o @thirstygallerina (NY, 136 mil seguidores), que
   cresceu com uma lista semanal de aberturas toda quarta. O "rolê", que fazia
   esse papel aqui, tinha saído em 01/09.

   Por que abre E fecha.

   A base de 25/09 tinha 4 aberturas nas duas semanas seguintes e 15 mostras
   fechando. Uma agenda só de aberturas sairia magra quase toda semana; a
   última chance é o que cria urgência de verdade.

   A regra da obra continua: nada escrito por cima da imagem. O texto mora na
   faixa de baixo.

   Uso:
     node agenda.js --config=SOCIAL/10/01/agenda.json --out=SOCIAL/10/01 --date=2026-10-01
     node agenda.js --seco --date=2026-10-01
   Config (tudo opcional): { nome, paleta, max, fechaAte (dias depois do domingo) }
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, exigirObra, medir, RAIZ, esc, tituloCurto, autoria, PALETAS } = base;

const W = 1080, H = 1350;
const ACENTO = '#C96F4A';           // o terracota da foto de perfil
const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const dt = iso => new Date(iso + 'T12:00:00');
const somaDias = (iso, n) => { const d = dt(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const curto = iso => iso.slice(8, 10) + '.' + iso.slice(5, 7);
const diaSemana = iso => DIAS[dt(iso).getDay()];

/* A janela é o fim de semana que vem depois da data de publicação (ou o que
   está correndo, se a data já é sexta ou sábado). */
function janela(hoje) {
  const d = dt(hoje).getDay();
  const ateDomingo = (7 - d) % 7;
  return { de: hoje, domingo: somaDias(hoje, ateDomingo) };
}

/* Horário da abertura, quando o campo d diz ("Abertura em 25 de setembro, das
   16h às 22h"). Não há campo estruturado na base; se não achar, não inventa. */
function horaAbertura(e) {
  const m = String(e.d || '').match(/abertura[^.;]*?(\d{1,2}h(?:\d{2})?(?:\s*(?:às|a|–|-)\s*\d{1,2}h(?:\d{2})?)?)/i);
  return m ? m[1].replace(/\s*(às|a|–|-)\s*/, '–') : '';
}

async function escolher(DATA, hoje, cfg) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const { de, domingo } = janela(hoje);
  const fechaAte = somaDias(domingo, cfg.fechaAte == null ? 2 : cfg.fechaAte);
  const itens = [];
  for (const e of DATA.expos || []) {
    const v = V[e.v];
    if (!v || !e.ini) continue;
    let tipo = null;
    if (e.ini >= de && e.ini <= domingo) tipo = 'abre';
    else if (e.fim && e.fim >= de && e.fim <= fechaAte && e.ini < de) tipo = 'fecha';
    if (!tipo) continue;
    let rel = null, dim = null;
    try { rel = exigirObra(e, { recusarVista: false }); dim = await medir(rel); } catch { rel = null; }
    if (dim && (!dim.w || dim.w < 700)) rel = null;
    itens.push({ e, v, tipo, rel, dim, dia: tipo === 'abre' ? e.ini : e.fim, hora: tipo === 'abre' ? horaAbertura(e) : '' });
  }
  /* Abertura primeiro (é notícia), depois o que fecha mais cedo. Dentro de
     cada grupo, quem tem imagem vem antes: o slide de obra é o que para o dedo. */
  itens.sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'abre' ? -1 : 1) ||
                       a.dia.localeCompare(b.dia) || (b.rel ? 1 : 0) - (a.rel ? 1 : 0));
  return { itens, de, domingo, fechaAte };
}

/* ---------- desenho ---------- */

function css(p) {
  return `
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900;font-display:block}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000}
.s{position:relative;width:${W}px;height:${H}px;background:${p.fundo};color:${p.texto};font-family:'Switzer',sans-serif;overflow:hidden}
.et{font-size:18px;font-weight:600;letter-spacing:.28em;text-transform:uppercase}
.marca{position:absolute;left:72px;bottom:60px;font-size:17px;font-weight:600;letter-spacing:.30em;text-transform:uppercase;color:${p.apagado}}
.pag{position:absolute;right:72px;bottom:60px;font-size:17px;font-weight:600;letter-spacing:.2em;color:${p.apagado}}
.chip{display:inline-block;background:${ACENTO};color:#fff;padding:10px 18px 9px;font-size:19px;font-weight:700;letter-spacing:.22em;text-transform:uppercase}
.chip.fecha{background:${p.texto};color:${p.fundo}}

/* capa */
.capa .topo{position:absolute;left:72px;top:72px;right:72px;display:flex;justify-content:space-between;color:${p.fraco}}
.capa .grande{position:absolute;left:66px;right:60px;top:140px;font-size:150px;font-weight:800;line-height:.86;letter-spacing:-.045em;text-transform:uppercase}
.capa .datas{position:absolute;left:72px;top:562px;font-size:64px;font-weight:300;letter-spacing:-.02em;color:${ACENTO}}
.capa .mosaico{position:absolute;left:72px;right:72px;top:668px;height:400px;display:flex;gap:12px}
.capa .mosaico div{flex:1;background-size:cover;background-position:center}
.capa .conta{position:absolute;left:72px;right:72px;bottom:118px;display:flex;gap:56px}
.capa .conta b{display:block;font-size:92px;font-weight:800;line-height:1;letter-spacing:-.04em}
.capa .conta span{display:block;font-size:22px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${p.meio};margin-top:8px}

/* mostra */
.m .quadro{position:absolute;left:0;right:0;top:0;height:760px;background:${p.fundo};padding:56px 56px 0;display:flex;align-items:center;justify-content:center;overflow:hidden}
.m .quadro img{max-width:100%;max-height:100%;display:block}
.m .quadro.cheio{padding:0}
.m .quadro.cheio img{width:100%;height:100%;object-fit:cover}
.m .semimg{position:absolute;left:0;right:0;top:0;height:760px;background:${p.fundo};border-bottom:1px solid ${p.apagado}}
.m .semimg div{position:absolute;left:72px;right:72px;bottom:60px;font-size:96px;font-weight:800;line-height:.92;letter-spacing:-.04em;color:${p.texto}}
.m .faixa{position:absolute;left:72px;right:72px;top:800px}
.m .dia{display:flex;align-items:baseline;gap:24px;margin-top:26px}
.m .dia b{font-size:104px;font-weight:800;line-height:.9;letter-spacing:-.045em}
.m .dia span{font-size:34px;font-weight:300;color:${p.meio}}
.m .tit{font-size:50px;font-weight:600;line-height:1.08;letter-spacing:-.02em;margin-top:26px}
.m .quem{font-size:28px;font-weight:300;color:${p.meio};margin-top:8px}
.m .onde{font-size:24px;font-weight:400;color:${p.fraco};margin-top:18px;letter-spacing:.01em}
.m .cred{position:absolute;right:72px;top:772px;font-size:14px;font-weight:300;color:${p.apagado};text-align:right;max-width:600px}

/* lista final */
.l .cab{position:absolute;left:72px;right:72px;top:72px}
.l .cab h2{font-size:84px;font-weight:800;line-height:.9;letter-spacing:-.04em;text-transform:uppercase;margin-top:18px}
.l .lista{position:absolute;left:72px;right:72px;top:300px}
.l.compacta .cab h2{font-size:70px}
.l.compacta .lista{top:260px}
.l.compacta .li{padding:7px 0;font-size:22px}
.l.compacta .li small{font-size:18px}
.l.compacta .sec{margin:18px 0 6px}
.l .pe.flui{position:static;margin-top:34px;font-size:26px}
.l .sec{font-size:18px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:${ACENTO};margin:26px 0 10px}
.l .sec.fecha{color:${p.meio}}
.l .li{display:flex;gap:20px;padding:11px 0;border-top:1px solid ${p.apagado};font-size:25px;line-height:1.2}
.l .li .d{width:118px;flex:none;font-weight:700;letter-spacing:-.01em}
.l .li .t{flex:1;font-weight:500}
.l .li .t small{display:block;font-size:20px;font-weight:300;color:${p.fraco};margin-top:3px}
.l .pe{position:absolute;left:72px;right:72px;bottom:120px;font-size:30px;font-weight:300;line-height:1.3;color:${p.meio}}
.l .pe b{color:${p.texto};font-weight:600}
`;
}

function capa(sel, hoje) {
  const abre = sel.itens.filter(x => x.tipo === 'abre').length;
  const fecha = sel.itens.filter(x => x.tipo === 'fecha').length;
  const gratis = sel.itens.filter(x => x.v.ing && x.v.ing.g).length;
  const fotos = sel.itens.filter(x => x.rel).slice(0, 3);
  return `<div class="s capa">
    <div class="topo"><span class="et">Vernissages SP</span><span class="et">o fim de semana</span></div>
    <div class="grande">Arte em SP<br>este fim<br>de semana</div>
    <div class="datas">${curto(sel.de)} — ${curto(sel.domingo)}</div>
    <div class="mosaico">${fotos.map(x => `<div style="background-image:url('${esc(x.rel)}')"></div>`).join('')}</div>
    <div class="conta">
      ${abre ? `<div><b>${abre}</b><span>${abre > 1 ? 'aberturas' : 'abertura'}</span></div>` : ''}
      ${fecha ? `<div><b>${fecha}</b><span>${fecha > 1 ? 'últimas chances' : 'última chance'}</span></div>` : ''}
      ${gratis * 2 >= sel.itens.length ? `<div><b>${gratis}</b><span>de graça</span></div>` : ''}
    </div>
    <div class="pag">arrasta →</div>
  </div>`;
}

function slideMostra(x, n, total) {
  const quem = autoria(x.e);
  const vertical = x.dim && x.dim.h > x.dim.w;
  const img = x.rel
    ? `<div class="quadro${vertical || x.e.vista ? ' cheio' : ''}"><img src="${esc(x.rel)}"></div>`
    : `<div class="semimg"><div>${esc(tituloCurto(x.e))}</div></div>`;
  const chip = x.tipo === 'abre' ? '<span class="chip">abre</span>' : '<span class="chip fecha">últimos dias</span>';
  const sub = x.tipo === 'abre' ? (x.hora || '') : 'último dia';
  return `<div class="s m">
    ${img}
    ${x.rel ? `<div class="cred">${esc(x.e.cred)}</div>` : ''}
    <div class="faixa">
      ${chip}
      <div class="dia"><b>${diaSemana(x.dia)} ${x.dia.slice(8, 10)}</b><span>${esc(sub)}</span></div>
      ${x.rel ? `<div class="tit">${esc(tituloCurto(x.e))}</div>` : ''}
      ${quem ? `<div class="quem">${esc(quem)}</div>` : ''}
      <div class="onde">${esc(x.v.name)} · ${esc(x.v.b)}${x.v.ing && x.v.ing.g ? ' · grátis' : ''}</div>
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function lista(sel, n, total) {
  const li = x => `<div class="li"><div class="d">${diaSemana(x.dia)} ${x.dia.slice(8, 10)}</div>
    <div class="t">${esc(tituloCurto(x.e))}<small>${esc(x.v.name)} · ${esc(x.v.b)}</small></div></div>`;
  const abre = sel.itens.filter(x => x.tipo === 'abre');
  const fecha = sel.itens.filter(x => x.tipo === 'fecha');
  const compacta = sel.itens.length > 6;
  return `<div class="s l${compacta ? ' compacta' : ''}">
    <div class="cab"><span class="et" style="color:${ACENTO}">salva esse</span><h2>O fim de semana<br>numa tela</h2></div>
    <div class="lista">
      ${abre.length ? '<div class="sec">abre</div>' + abre.map(li).join('') : ''}
      ${fecha.length ? '<div class="sec fecha">últimos dias</div>' + fecha.map(li).join('') : ''}
      <div class="pe flui"><b>Manda pra quem vai com você.</b><br>Mapa e agenda completa: link na bio.</div>
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function montarHTML(sel, cfg, hoje) {
  const p = PALETAS[cfg.paleta] || PALETAS.escuro;
  /* Slide de mostra só para quem tem obra: slide tipográfico em série cansa.
     Quem não tem imagem aparece na lista final, que é onde o plano se faz. */
  const comObra = sel.itens.filter(x => x.rel).slice(0, cfg.max || 8);
  const total = comObra.length + 2;
  const s = capa(sel, hoje) + comObra.map((x, i) => slideMostra(x, i + 2, total)).join('') + lista(sel, total, total);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css(p)}</style></head><body>${s}</body></html>`;
}

function legenda(sel) {
  const l = x => '• ' + diaSemana(x.dia) + ' ' + curto(x.dia) + ' — ' + tituloCurto(x.e) + (autoria(x.e) ? ', ' + autoria(x.e) : '') +
                 ' @ ' + x.v.name + (x.v.ig ? ' (@' + x.v.ig + ')' : '') + ', ' + x.v.b;
  const abre = sel.itens.filter(x => x.tipo === 'abre'), fecha = sel.itens.filter(x => x.tipo === 'fecha');
  let s = 'Arte em SP de ' + curto(sel.de) + ' a ' + curto(sel.domingo) + '.\n\n';
  if (abre.length) s += 'ABRE\n' + abre.map(l).join('\n') + '\n\n';
  if (fecha.length) s += 'ÚLTIMOS DIAS\n' + fecha.map(l).join('\n') + '\n\n';
  s += 'Salva e manda pra quem vai com você. Mapa, horários e o resto da agenda no link da bio.\n';
  const collab = [...new Set(sel.itens.filter(x => x.v.ig).map(x => '@' + x.v.ig))];
  return { texto: s, collab };
}

/* ---------- render (compartilhado com reel.js) ---------- */

async function renderizar(html, saida, nome, vw, vh) {
  const tmp = path.join(RAIZ, '.' + nome + '-tmp.html');
  fs.writeFileSync(tmp, html, 'utf8');
  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: vw || W, height: vh || H, deviceScaleFactor: 1 }
  });
  const arquivos = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', x => console.log('PAGEERROR: ' + x.message));
    await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 800));
    fs.mkdirSync(saida, { recursive: true });
    const els = await page.$$('.s');
    for (let i = 0; i < els.length; i++) {
      const p = path.join(saida, nome + '-' + String(i + 1).padStart(2, '0') + '.png');
      await els[i].screenshot({ path: p });
      arquivos.push(p);
    }
  } finally {
    await browser.close();
    fs.unlinkSync(tmp);
  }
  return arquivos;
}

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
  const cfg = argv.some(x => x.startsWith('--config=')) && fs.existsSync(path.resolve(flag('config')))
    ? JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8')) : {};
  cfg.nome = cfg.nome || 'agenda';

  const sel = await escolher(carregarDados(), hoje, cfg);
  const abre = sel.itens.filter(x => x.tipo === 'abre'), fecha = sel.itens.filter(x => x.tipo === 'fecha');
  console.log('janela ' + sel.de + ' → ' + sel.domingo + ' (fecha até ' + sel.fechaAte + '): ' +
              abre.length + ' abrem, ' + fecha.length + ' fecham, ' + sel.itens.filter(x => x.rel).length + ' com obra');
  sel.itens.forEach(x => console.log('  ' + x.tipo.padEnd(5) + ' ' + x.dia + '  ' + tituloCurto(x.e) + ' — ' + x.v.name + (x.rel ? '' : '  (sem imagem)')));
  if (!sel.itens.length) throw new Error('Nada abre nem fecha nessa janela.');
  if (argv.includes('--seco')) return;

  const saida = path.resolve(RAIZ, flag('out', '.'));
  const arqs = await renderizar(montarHTML(sel, cfg, hoje), saida, cfg.nome);
  arqs.forEach(a => console.log('OK ' + a));
  const leg = legenda(sel);
  fs.writeFileSync(path.join(saida, cfg.nome + '-LEGENDA.md'),
    leg.texto + '\n---\nConvidar como Collab (o post aparece no perfil delas também):\n' + leg.collab.join(' ') + '\n');
  console.log('\n' + arqs.length + ' slides · legenda e lista de Collab em ' + cfg.nome + '-LEGENDA.md');
}

module.exports = { escolher, janela, horaAbertura, renderizar, ACENTO, diaSemana, curto };

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
