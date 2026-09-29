/* ============================================================
   ROTEIRO — formato de social do Vernissages SP
   ============================================================

   O que é.

   Um bairro, todas as mostras abertas nele agora, uma lista só — endereço
   junto de cada uma. Não é sobre uma obra: é sobre um circuito que cabe
   numa tarde. Tipografia, como o cartaz; sem foto, porque a foto forçaria
   escolher só quem tem imagem boa, e aqui o ponto é reunir toda mostra do
   recorte, com ou sem reprodução.

   De onde vem.

   29/09/2026: benchmark real (WebSearch/WebFetch, não memória) em contas
   fortes do setor. @thirstygallerina publica toda quarta uma lista das
   aberturas de quinta em Nova York, categorizada por bairro, endereço
   incluído — e opera como plataforma de submissão (as próprias casas
   mandam a mostra). @sp.afora, guia de cultura de SP com 166 mil
   seguidores, tem o mesmo hábito de agregação regional, só que fora do
   nicho de arte. Nenhum formato do Vernissages SP fazia isso: todos os
   outros (obra, salão, deriva, rima, aproximação, cartaz) são peça a peça,
   uma mostra ou uma obra por vez. É a única lacuna estrutural que a
   pesquisa achou — o resto (Jerry Gogosian, Saatchi Art) ou não deu base
   confiável, ou já é o que o sistema faz (ver cartaz.js e encerra).

   Por que existe.

   São Paulo tem cluster geográfico real de galeria — Jardins, Vila
   Madalena/Pinheiros, Centro, Itaim — e uma casa ao lado da outra não vira
   notícia em nenhum formato daqui. O roteiro é o que fecha essa lacuna:
   mostra o que dá pra ver a pé, numa tarde, num bairro só.

   As travas:

   1. MÍNIMO DE CASAS. Menos de `cfg.minimo` (padrão 4) não é roteiro, é
      lista — e uma lista curta não justifica o formato. Aborta.
   2. NENHUM ITEM SE REPETE. Mesma trava evitar/evitarCasa da família obra;
      aqui `evitar` risca a mostra da lista, item a item.
   3. NUNCA VISTA-DE-SALA COMO PROTAGONISTA VISUAL: este formato não usa
      foto nenhuma, então essa trava nem se aplica — mas por isso ele
      também nunca escolhe pela imagem, e é o único jeito de cobrir mostra
      sem reprodução boa que também não caiba no cartaz (sem `fim`, por
      exemplo — aqui `fim` nem é exigido).

   Uso:
     node roteiro.js --config=SOCIAL/09/29/roteiro.json --out=SOCIAL/09/29 --date=2026-09-29
     node roteiro.js --seco --bairro="Jardins"    (mostra a escolha, não renderiza)
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, RAIZ, esc, porExtenso, arroba, tituloCurto, autoria,
        PALETAS, cssPaleta, passaFiltro, descreverFiltro, MARCA_HTML } = base;

const W = 1080, H = 1350;
const MIN_CASAS = 4;
const POR_PAGINA = 6;

const _dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00') - Date.parse(a + 'T12:00:00')) / 864e5);

/* ---------- escolha ---------- */

function escolher(DATA, hoje, cfg) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const fora = new Set([].concat(cfg.fora || [], cfg.evitar || []));
  const filtro = cfg.filtro || {};

  const porBairro = {};
  for (const e of (DATA.expos || [])) {
    const v = V[e.v];
    if (!v || !v.b || e.cartaz || fora.has(e.t + '|' + e.v)) continue;
    if (!e.ini || e.ini > hoje) continue;             // ainda nao abriu
    if (e.fim && e.fim < hoje) continue;               // ja fechou
    if (!passaFiltro(e, v, hoje, filtro)) continue;
    (porBairro[v.b] = porBairro[v.b] || []).push({ e, v });
  }

  const minimo = cfg.minimo || MIN_CASAS;
  let clusters = Object.entries(porBairro)
    .map(([bairro, itens]) => ({ bairro, itens }))
    .filter(c => c.itens.length >= minimo);

  if (cfg.bairro) clusters = clusters.filter(c => c.bairro === cfg.bairro);

  clusters.forEach(c => {
    /* mais mostra e melhor; bairro repetido em semana recente perde pontos,
       mesma logica de evitarCasa dos outros formatos, so que no nivel do
       recorte inteiro em vez de uma casa so. */
    c.nota = c.itens.length - 3 * (cfg.evitarBairro || []).filter(b => b === c.bairro).length;
    /* dentro do bairro: mostra que fecha antes primeiro — quem tem menos
       tempo de sobra e a que mais precisa aparecer agora. */
    c.itens.sort((a, b) => {
      const fa = a.e.fim || '9999-99-99', fb = b.e.fim || '9999-99-99';
      return fa.localeCompare(fb) || a.v.name.localeCompare(b.v.name);
    });
  });

  clusters.sort((a, b) => b.nota - a.nota);
  return clusters;
}

/* ---------- montagem ---------- */

function fichaItem(e, v, hoje) {
  const quem = autoria(e);
  const prazo = e.fim
    ? (e.fim < hoje ? '' : (_dias(hoje, e.fim) <= 7 ? 'fecha ' + porExtenso(e.fim) : 'até ' + porExtenso(e.fim)))
    : 'sem data de encerramento divulgada';
  return `<div class="item">
    <div class="it-tit">${esc(tituloCurto(e))}</div>
    ${quem ? `<div class="it-quem">${esc(quem)}</div>` : ''}
    <div class="it-casa">${esc(v.name)}${v.ig ? ' ' + esc(arroba(v.ig)) : ''} · ${esc(v.addr)}</div>
    ${prazo ? `<div class="it-prazo">${esc(prazo)}</div>` : ''}
  </div>`;
}

/* O indice: nome de cada casa, na ordem em que aparece na lista dos slides
   seguintes. Preenche o que sobra de quadro depois da tese sem enfeite —
   e o mesmo dado que a lista vai detalhar, so que em resumo, como o
   sumario de um catalogo. Nunca mais que 8 linhas cabem sem apertar. */
function indice(itens) {
  const nomes = [...new Set(itens.map(i => i.v.name))];
  return `<div class="indice">${nomes.map((nome, i) =>
    `<div class="ix-linha"><span class="ix-num">${String(i + 1).padStart(2, '0')}</span>${esc(nome)}</div>`
  ).join('')}</div>`;
}

function slideCapa(c, cfg, n, total) {
  return `<div class="slide">
    <div class="kick">roteiro do bairro</div>
    <div class="risco" style="top:150px"></div>
    <div style="position:absolute;left:88px;right:88px;top:214px;bottom:170px;
                display:flex;flex-direction:column;justify-content:center">
      <div style="font-size:64px;font-weight:300;line-height:1.05;letter-spacing:-.02em;
                  color:${cfg.paleta.texto}">${esc(c.bairro)}</div>
      <div class="arg" style="position:static;width:auto;font-size:28px;margin-top:36px">
        <p style="margin-bottom:22px">${esc(c.itens.length + (c.itens.length === 1 ? ' mostra aberta agora' : ' mostras abertas agora'))}, tudo a pé de um lado a outro.</p>
        <span class="virada" style="margin-top:10px;font-size:38px">Um circuito, não uma indicação só.</span>
      </div>
      <div style="margin-top:80px">${indice(c.itens)}</div>
    </div>
    <div class="marca">${MARCA_HTML}</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function slideLista(fatia, cfg, hoje, n, total, de, ate, totalItens) {
  const linhas = fatia.map(({ e, v }) => fichaItem(e, v, hoje)).join('');
  return `<div class="slide">
    <div class="kick">${String(de).padStart(2, '0')}–${String(ate).padStart(2, '0')} de ${String(totalItens).padStart(2, '0')}</div>
    <div class="risco" style="top:150px"></div>
    <div class="lista" style="position:absolute;left:88px;right:88px;top:200px;bottom:110px;overflow:hidden">${linhas}</div>
    <div class="marca">${MARCA_HTML}</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function montarHTML(c, cfg, hoje) {
  const paginas = Math.ceil(c.itens.length / POR_PAGINA);
  const total = 1 + paginas;
  let s = slideCapa(c, cfg, 1, total);
  for (let i = 0; i < paginas; i++) {
    const de = i * POR_PAGINA;
    const fatia = c.itens.slice(de, de + POR_PAGINA);
    s += slideLista(fatia, cfg, hoje, 2 + i, total, de + 1, Math.min(de + POR_PAGINA, c.itens.length), c.itens.length);
  }
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${base.CSS}
    .item{margin-bottom:34px;padding-bottom:28px;border-bottom:1px solid ${cfg.paleta.apagado}}
    .item:last-child{border-bottom:none}
    .it-tit{font-size:30px;font-weight:500;letter-spacing:-.01em;line-height:1.18;color:${cfg.paleta.texto}}
    .it-quem{font-size:21px;font-weight:300;margin-top:4px;color:${cfg.paleta.meio}}
    .it-casa{font-size:19px;font-weight:300;margin-top:10px;color:${cfg.paleta.fraco}}
    .it-prazo{font-size:16px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;margin-top:6px;color:${cfg.paleta.meio}}
    .indice{border-top:1px solid ${cfg.paleta.apagado};padding-top:24px}
    .ix-linha{font-size:19px;font-weight:300;line-height:2;color:${cfg.paleta.meio}}
    .ix-num{display:inline-block;width:34px;color:${cfg.paleta.apagado}}
    ${cssPaleta(cfg.paleta, cfg.textura)}
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
    cfg = { paleta: 'escuro', textura: 0.05, nome: 'roteiro' };
    if (flag('bairro')) cfg.bairro = flag('bairro');
  } else {
    cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  }
  const paletaNome = cfg.paleta;
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.temporada || PALETAS.escuro;

  const DATA = carregarDados();
  const clusters = escolher(DATA, hoje, cfg);

  console.log(clusters.length + ' bairro(s) com pelo menos ' + (cfg.minimo || MIN_CASAS) +
    ' mostra(s) aberta(s) em ' + hoje + (cfg.filtro ? ' no recorte' : ''));
  if (!clusters.length) throw new Error('Nenhum bairro chega a ' + (cfg.minimo || MIN_CASAS) +
    ' mostras abertas simultâneas (com endereço, não vetadas). Baixe `minimo` ou amplie o recorte.');

  const c = clusters[0];
  c.itens.forEach(i => console.log('PICK ' + i.e.t + '|' + i.e.v));
  console.log('\n  escolhido: ' + c.bairro + ' — ' + c.itens.length + ' mostra(s) · nota ' + c.nota.toFixed(1));
  c.itens.forEach(i => console.log('    · ' + tituloCurto(i.e) + ' — ' + i.v.name));
  console.log('  paleta ' + paletaNome);

  if (seco) { console.log('\n--seco: nada foi renderizado.'); return; }

  const saida = path.resolve(RAIZ, flag('out', '.'));
  const tmp = path.join(RAIZ, '.roteiro-tmp.html');
  fs.writeFileSync(tmp, montarHTML(c, cfg, hoje), 'utf8');

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
    const p = path.join(saida, (cfg.nome || 'roteiro') + '-' + String(i + 1).padStart(2, '0') + '.png');
    await els[i].screenshot({ path: p });
    console.log('OK ' + p);
  }
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('\n' + els.length + ' slides · ' + c.bairro + ', ' + c.itens.length + ' mostras');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
