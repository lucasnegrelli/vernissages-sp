#!/usr/bin/env node
/* ============================================================
   reel-arte.js — Reel de movimento na linguagem do site (09/11/2026)

   Substitui o reel-auto.js (foto + degradê escuro + texto por cima, igual toda
   vez). Aqui o Reel é desenhado como o site: papel e tinta, data gigante, a cor
   da obra pintando a capa e os números, título em caixa-alta pesada contra
   artista em itálico serifado, filete no lugar de caixa. Cada frame é uma
   página HTML renderizada no Chrome em tempo t (animação determinística), e o
   ffmpeg costura. Sem IA, sem custo: tudo é regra.

   TRÊS FORMATOS (o mesmo motor, outro "número" na cena)
     abre   O QUE ABRE ESTA SEMANA   número = dia do mês da abertura
     fecha  ÚLTIMOS DIAS             número = dias que faltam para fechar
     rota   A PÉ POR UM BAIRRO       número = parada do percurso, mapa com a linha
   Estrutura: capa em cor chapada da obra (já legível como miniatura no grid)
   -> uma cena por mostra, 2,6 s -> cena final escura com o mapa dos endereços.

   REGRAS DA CASA (as mesmas do resto)
   - Só fato da base. Nada inventado. Obra passa por exigirObra (crédito, tamanho).
   - Nenhum texto em cima da obra: a imagem aparece inteira, limpa; o texto fica
     em volta, no papel.
   - Sem travessão, sem exclamação, sem gíria.
   - Uma casa por Reel. Mostra não repete em 14 dias, bairro em 21.

   Uso:
     node reel-arte.js [--date=AAAA-MM-DD] [--modo=abre|fecha|rota|auto] [--n=5] [--seco]
                       [--fila --quando=HH:MM] [--mudo] [--sem-memoria]
   Precisa de ffmpeg e de .render (sharp + puppeteer-core) ou RENDER_DIR.
   ============================================================ */
'use strict';

process.env.VSP_FOTOS_LIVRE = '1';   /* foto de feed pode repetir no Reel: outro formato, outra audiência */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execFileSync } = require('child_process');
const base = require('./rima.js');
const { carregarDados, exigirObra, medir, RAIZ, porExtenso, arroba, tituloCurto, autoria } = base;
const D = require('./direcao.js');

const W = 1080, H = 1920, FPS = D.FPS;
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
const N = parseInt(flag('n', '5'), 10);
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const USADOS = path.join(RAIZ, 'SOCIAL', 'REELS-USADOS.json');
const T_CAPA = 2.4, T_MOSTRA = 2.6, T_FIM = 3.6, T_VAO = 0.3;   /* T_VAO: o véu da cena seguinte cobre a anterior em 0,3 s */

const lerJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
const somaDias = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const dow = new Date(hoje + 'T12:00:00Z').getUTCDay();
const DIA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const DIA_EXT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const dowDe = d => new Date(d + 'T12:00:00Z').getUTCDay();
const curto = d => `${d.slice(8)}.${d.slice(5, 7)}`;

/* ---------- escolha ---------- */
function km(a, b) {
  const R = 6371, rad = x => x * Math.PI / 180, dLa = rad(b.lat - a.lat), dLo = rad(b.lng - a.lng);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function candidatas(DATA) {
  const V = Object.fromEntries(DATA.venues.map(v => [v.name, v]));
  const usados = lerJson(USADOS, {});
  const out = [];
  for (const e of DATA.expos) {
    if (!e.ini || !V[e.v]) continue;
    const aberta = e.ini <= hoje && (!e.fim || e.fim >= hoje);
    const prox = e.ini > hoje && e.ini <= somaDias(hoje, 7);
    if (!aberta && !prox) continue;
    const k = e.t + '|' + e.v;
    if (usados[k] && dias(usados[k], hoje) < 14) continue;
    let rel = null, dim = null;
    try { rel = exigirObra(e, { recusarVista: true }); dim = await medir(rel); } catch (x) { rel = null; }
    if (!rel || !dim || !dim.w || dim.w < 1080) continue;
    out.push({ e, v: V[e.v], rel, dim, aberta, abre: e.ini >= hoje ? dias(hoje, e.ini) : null, falta: e.fim ? dias(hoje, e.fim) : null });
  }
  return { V, out, usados };
}

const umaPorCasa = (lista, n) => { const s = new Set(), r = []; for (const c of lista) { if (s.has(c.v.name)) continue; s.add(c.v.name); r.push(c); if (r.length === n) break; } return r; };

function escolherModo(cands, usados, V, modo) {
  const abre = umaPorCasa(cands.filter(c => c.abre !== null && c.abre <= 7).sort((a, b) => a.e.ini.localeCompare(b.e.ini)), N);
  const fecha = umaPorCasa(cands.filter(c => c.aberta && c.falta !== null && c.falta <= 7).sort((a, b) => a.falta - b.falta), N);
  /* rota: o bairro com mais casas distintas em cartaz com obra; o percurso é "vizinho mais próximo" a partir da casa mais a oeste */
  const porB = {};
  cands.filter(c => c.aberta && c.v.lat && c.v.lng).forEach(c => { (porB[c.v.b] = porB[c.v.b] || []).push(c); });
  let rota = [], bairro = null;
  for (const [b, lista] of Object.entries(porB).sort((a, b) => umaPorCasa(b[1], 99).length - umaPorCasa(a[1], 99).length)) {
    if (usados['_bairro:' + b] && dias(usados['_bairro:' + b], hoje) < 21) continue;
    const casas = umaPorCasa(lista.sort((a, b) => (a.falta === null ? 999 : a.falta) - (b.falta === null ? 999 : b.falta)), N);
    if (casas.length >= 3) {
      const resto = casas.slice().sort((a, b) => a.v.lng - b.v.lng), ord = [resto.shift()];
      while (resto.length) { const ult = ord[ord.length - 1]; resto.sort((a, b) => km(ult.v, a.v) - km(ult.v, b.v)); ord.push(resto.shift()); }
      rota = ord; bairro = b; break;
    }
  }
  /* De graça: entrada gratuita (campo ing.g da casa). Ainda dá tempo: fecha entre 8 e 45 dias, o oposto dos últimos dias. */
  const gratis = umaPorCasa(cands.filter(c => c.aberta && c.v.ing && c.v.ing.g).sort((a, b) => (a.falta === null ? 999 : a.falta) - (b.falta === null ? 999 : b.falta)), N);
  const tempo = umaPorCasa(cands.filter(c => c.aberta && c.falta !== null && c.falta >= 8 && c.falta <= 45).sort((a, b) => a.falta - b.falta), N);
  const mapa = { abre, fecha, rota, gratis, tempo };
  const gosto = { 2: ['fecha', 'tempo', 'abre', 'rota', 'gratis'], 5: ['abre', 'gratis', 'rota', 'fecha', 'tempo'], 0: ['rota', 'gratis', 'tempo', 'fecha', 'abre'] }[dow] || ['abre', 'fecha', 'rota', 'gratis', 'tempo'];
  /* não repete o formato dos dois últimos Reels */
  const ult = (usados._modos || []).slice(-2).map(x => x.modo);
  const ordem = modo && modo !== 'auto' ? [modo] : [...gosto.filter(m => !ult.includes(m)), ...gosto.filter(m => ult.includes(m))];
  for (const m of ordem) if (mapa[m] && mapa[m].length >= 3) return { modo: m, pick: mapa[m], bairro };
  return { modo: null, pick: [], bairro };
}

/* ---------- texto ---------- */
function quemCurto(q) {
  const n = String(q || '').split(/,\s*| e /).filter(Boolean);
  return n.length > 4 ? n.slice(0, 3).join(', ') + ' e outros' : String(q || '');
}
const tit = e => tituloCurto(e).replace(/\s+/g, ' ').trim();

function capa(modo, pick, bairro) {
  const n = pick.length, s = D.semente(hoje + modo);
  if (modo === 'abre') {
    const de = pick[0].e.ini, ate = pick[n - 1].e.ini;
    return { cnt: [n, 'aberturas'], palavras: ['ABRE', 'ESTA', 'SEMANA'], sub: D.pick([`${n} exposições abrem em São Paulo, de ${curto(de)} a ${curto(ate)}.`, `${n} aberturas, em ordem de data. Quem for primeiro vê primeiro.`, `A semana das aberturas: ${n} exposições novas na cidade.`], s) };
  }
  if (modo === 'fecha') {
    const ate = pick[n - 1].e.fim;
    return { cnt: [n, 'exposições'], palavras: ['ÚLTIMOS', 'DIAS'], sub: D.pick([`${n} exposições fecham até ${curto(ate)}. Depois disso, só no catálogo.`, `${n} mostras em São Paulo para ver antes que acabem.`, `Fecham até ${curto(ate)}: ${n} exposições, da que sai primeiro à última.`], s) };
  }
  if (modo === 'gratis') return { cnt: [n, 'exposições'], palavras: ['ENTRADA', 'GRÁTIS'], sub: D.pick([`${n} exposições em São Paulo que não cobram ingresso.`, `Arte de graça nesta semana: ${n} exposições, todas com entrada franca.`], s) };
  if (modo === 'tempo') return { cnt: [n, 'exposições'], palavras: ['AINDA', 'DÁ TEMPO'], sub: D.pick([`${n} exposições que ficam em cartaz por mais uns dias. Dá para planejar.`, `Sem pressa, mas sem deixar para o fim: ${n} mostras para as próximas semanas.`], s) };
  const palavras = bairro.toUpperCase().split(/\s+/).reduce((acc, p) => { if (acc.length && (acc[acc.length - 1] + ' ' + p).length <= 9) acc[acc.length - 1] += ' ' + p; else acc.push(p); return acc; }, []);
  return { cnt: [n, 'paradas'], palavras, sub: D.pick([`${n} exposições a pé, num bairro só.`, `Um bairro, ${n} casas abertas. O percurso na ordem em que dá para andar.`], s) };
}

function selo(c, modo) {
  if (modo === 'fecha' || (modo === 'rota' && c.falta !== null && c.falta <= 7)) {
    if (c.falta === 0) return 'ÚLTIMO DIA';
    if (c.falta === 1) return 'FECHA AMANHÃ';
    if (c.falta !== null && c.falta <= 7) return `FECHA ${DIA_EXT[dowDe(c.e.fim)].toUpperCase()}`;
  }
  return '';
}

function legenda(modo, pick, bairro) {
  const n = pick.length, s = D.semente(hoje + modo + 'l');
  const abertura = {
    abre: D.pick([`${n} exposições abrem em São Paulo nesta semana. Na ordem, para você se programar.`, `A agenda de aberturas da semana, do primeiro dia ao último.`], s),
    fecha: D.pick([`${n} exposições que fecham nos próximos dias em São Paulo. Quem deixou para depois, é agora.`, `Últimos dias: ${n} mostras para ver antes que acabem.`], s),
    rota: D.pick([`${n} exposições em ${bairro}, para fazer a pé numa tarde.`, `Um bairro só, ${n} casas abertas: ${bairro}.`], s),
    gratis: D.pick([`${n} exposições com entrada gratuita em São Paulo. Arte não precisa de ingresso.`, `De graça: ${n} exposições para ver sem pagar nada.`], s),
    tempo: D.pick([`${n} exposições que ainda ficam em cartaz por semanas. Planeje.`, `Ainda dá tempo: ${n} mostras para colocar na agenda.`], s),
  }[modo];
  const linhas = pick.map((c, i) => {
    const q = autoria(c.e) ? ', ' + quemCurto(autoria(c.e)) : '';
    const quando = modo === 'abre' ? `abre ${DIA_EXT[dowDe(c.e.ini)]}, ${porExtenso(c.e.ini)}` : c.e.fim ? `até ${porExtenso(c.e.fim)}` : 'em cartaz';
    return `${i + 1}. ${tit(c.e)}${q}\n   ${(c.v.name + ' ' + arroba(c.v.ig)).trim()}, ${c.v.b} · ${quando}`;
  });
  return `${abertura}\n\n${linhas.join('\n\n')}\n\nSalva para não perder o dia e manda para quem vai com você.\n\n` +
    `Fotos: cortesia das casas e dos artistas. Agenda completa em vernissagessp.com.br\n\n` +
    `#arteemsp #exposicaosp #saopaulo #galeriadearte #arte #museusp #agendacultural`;
}

/* ---------- mapa (projeção plana corrigida pelo cosseno da latitude) ---------- */
function projeta(DATA, pick, modo, MW, MH) {
  const todos = DATA.venues.filter(v => v.lat && v.lng);
  const foco = pick.map(c => c.v);
  let alvo = modo === 'rota' ? foco : todos;
  const q = (arr, p) => arr.slice().sort((a, b) => a - b)[Math.min(arr.length - 1, Math.max(0, Math.floor(p * (arr.length - 1))))];
  const la = alvo.map(v => v.lat), lo = alvo.map(v => v.lng);
  let [a0, a1, o0, o1] = modo === 'rota' ? [Math.min(...la), Math.max(...la), Math.min(...lo), Math.max(...lo)] : [q(la, .12), q(la, .9), q(lo, .1), q(lo, .9)];
  const cx = (o0 + o1) / 2, cy = (a0 + a1) / 2, k = Math.cos(cy * Math.PI / 180);
  let ex = Math.max((o1 - o0) * k, .012), ey = Math.max(a1 - a0, .012);
  ex *= 1.18; ey *= 1.18;
  const esc = Math.min(MW / ex, MH / ey);
  const P = v => [MW / 2 + (v.lng - cx) * k * esc, MH / 2 - (v.lat - cy) * esc];
  const fundo = modo === 'rota'
    ? todos.filter(v => { const [x, y] = P(v); return x > 0 && x < MW && y > 0 && y < MH; }).map(P)
    : todos.map(P).filter(([x, y]) => x > -20 && x < MW + 20 && y > -20 && y < MH + 20);
  /* casas coladas (ex.: duas galerias na mesma rua) se sobreporiam: afasta o marcador, o mapa é esquemático */
  const focos = pick.map((c, i) => ({ n: i + 1, p: P(c.v), nome: c.v.name }));
  focos.forEach((f, i) => {
    for (let j = 0; j < i; j++) {
      const dx = f.p[0] - focos[j].p[0], dy = f.p[1] - focos[j].p[1], d = Math.hypot(dx, dy);
      if (d < 70) { const a = d < 1 ? Math.PI / 3 * (i + 1) : Math.atan2(dy, dx); f.p = [focos[j].p[0] + Math.cos(a) * 74, focos[j].p[1] + Math.sin(a) * 74]; }
    }
    f.p = [Math.max(40, Math.min(MW - 40, f.p[0])), Math.max(40, Math.min(MH - 40, f.p[1]))];
  });
  return { fundo, foco: focos };
}

/* ---------- a página (animação determinística em função de t) ---------- */
function pagina(ROT) {
  return `<!doctype html><meta charset="utf-8"><title>reel</title><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Regular.ttf');font-style:normal}
@font-face{font-family:'IS';src:url('fontes/InstrumentSerif-Italic.ttf');font-style:italic}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${D.PAPEL}}
body{font-family:'Switzer',system-ui,sans-serif;color:${D.TINTA};-webkit-font-smoothing:antialiased}
.cena{position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;background:${D.PAPEL};display:none}
.cab{position:absolute;left:70px;right:70px;top:62px;height:50px;border-bottom:3px solid ${D.TINTA};display:flex;justify-content:space-between;align-items:flex-start;font-weight:800;font-size:25px;letter-spacing:.17em;text-transform:uppercase}
.cab span{color:var(--ac)}
.data{position:absolute;left:62px;top:150px;display:flex;align-items:flex-end;gap:30px;color:var(--ac)}
.nm{overflow:hidden;height:430px;padding-top:8px}
.num{font-weight:800;font-size:520px;line-height:.82;letter-spacing:-.085em;margin-left:-.03em}
.lado{padding-bottom:34px;display:flex;flex-direction:column;gap:6px}
.lado .r{font-weight:800;font-size:40px;letter-spacing:.2em;text-transform:uppercase;line-height:1}
.lado .m{font-weight:800;font-size:96px;letter-spacing:-.04em;line-height:.9}
.lado .s{font-family:'IS',serif;font-style:italic;font-size:42px;color:${D.TINTA};line-height:1.05;margin-top:4px}
.foto{position:absolute;overflow:hidden}
.foto img{display:block;width:100%;height:100%;object-fit:cover;transform-origin:50% 50%}
.tx{position:absolute;left:70px;right:70px;top:1388px}
.tit{font-weight:800;text-transform:uppercase;letter-spacing:-.035em;line-height:.93}
.w{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .12em .1em 0;margin:0 -.12em -.1em 0}
.w>span{display:inline-block;will-change:transform}
.art{font-family:'IS',serif;font-style:italic;font-size:50px;line-height:1.04;margin-top:20px}
.onde{font-weight:800;font-size:27px;letter-spacing:.15em;text-transform:uppercase;margin-top:22px}
.ate{font-weight:500;font-size:27px;letter-spacing:.12em;text-transform:uppercase;margin-top:7px;color:#6f6a60}
.selo{display:inline-block;background:var(--ac);color:${D.PAPEL};font-weight:800;font-size:25px;letter-spacing:.16em;padding:8px 14px 7px;margin-bottom:18px}
.rod{position:absolute;left:70px;right:70px;bottom:58px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:24px;letter-spacing:.16em;text-transform:uppercase}
.pq{display:flex;gap:9px}.pq i{display:block;width:20px;height:20px;border:3px solid ${D.TINTA};background:transparent}.pq i.on{background:var(--ac);border-color:var(--ac)}
.capa{background:var(--campo);color:var(--sobre)}
.capa .pal{position:absolute;left:62px;top:170px;font-weight:800;text-transform:uppercase;line-height:.82;letter-spacing:-.075em}
.capa .cnt{position:absolute;left:50px;bottom:620px;display:flex;align-items:flex-end;gap:34px;line-height:.74}.capa .cnt b{font-weight:800;font-size:760px;letter-spacing:-.09em;line-height:.74}.capa .cnt span{font-weight:800;font-size:46px;letter-spacing:.2em;text-transform:uppercase;line-height:1.15;padding-bottom:14px}
.capa .sub{position:absolute;left:70px;right:90px;top:1330px;font-family:'IS',serif;font-size:66px;line-height:1.04;border-top:3px solid var(--sobre);padding-top:30px}
.capa .marca{position:absolute;left:70px;top:62px;font-weight:800;font-size:25px;letter-spacing:.17em;text-transform:uppercase}
.capa .mk2{position:absolute;right:70px;top:62px;font-weight:800;font-size:25px;letter-spacing:.17em}
.fim{background:${D.TINTA};color:${D.PAPEL}}
.fim .cab{border-color:${D.PAPEL}}.fim .cab span{color:${D.TERRA}}
.mapa{position:absolute;left:70px;top:150px;width:940px;height:740px}
.lista{position:absolute;left:70px;right:70px;top:930px;font-weight:800;font-size:29px;letter-spacing:.06em;text-transform:uppercase;line-height:1.28}
.lista div{display:flex;gap:18px;border-top:1px solid rgba(242,239,233,.28);padding:9px 0 8px}.lista b{color:${D.TERRA};min-width:36px}.lista small{font-weight:500;color:#b7b1a4;margin-left:auto;font-size:24px;letter-spacing:.1em}
.chamada{position:absolute;left:70px;right:70px;bottom:150px}
.chamada .g{font-family:'IS',serif;font-style:italic;font-size:86px;line-height:.98;max-width:880px;text-wrap:balance}
.chamada .u{margin-top:26px;font-weight:800;font-size:30px;letter-spacing:.16em;text-transform:uppercase;color:${D.TERRA}}
</style><body></body><script>
const R=${JSON.stringify(ROT)};
const W=${W},H=${H};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const seg=(u,a,b)=>clamp((u-a)/(b-a));
const oE=t=>t>=1?1:1-Math.pow(2,-10*t), oQ=t=>1-Math.pow(1-t,4), io=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const C=[];
const E=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const palavras=(txt,cls)=>txt.split(' ').map(p=>'<span class="w"><span>'+E(p)+'</span></span>').join(' ');

function cenaCapa(c){
  const el=document.createElement('section');el.className='cena capa';el.style.setProperty('--campo',c.campo);el.style.setProperty('--sobre',c.sobre);
  el.innerHTML='<div class="marca">Vernissages SP</div><div class="mk2">'+E(c.kicker)+'</div><div class="pal">'+c.palavras.map(p=>'<div class="l" style="white-space:nowrap">'+E(p)+'</div>').join('')+'</div><div class="cnt"><b>'+E(c.cnt[0])+'</b><span>'+E(c.cnt[1])+'</span></div><div class="sub">'+E(c.sub)+'</div>';
  document.body.appendChild(el);el.style.display='block';
  /* a maior palavra ocupa a largura inteira útil */
  const pal=el.querySelector('.pal');pal.style.fontSize='100px';
  let mx=0;[].forEach.call(pal.children,l=>{l.style.display='inline-block';mx=Math.max(mx,l.getBoundingClientRect().width);l.style.display='block'});
  const fs=Math.min(430,Math.floor(100*(W-150)/mx));pal.style.fontSize=fs+'px';
  const alt=pal.getBoundingClientRect().height;
  if(170+alt>1290){pal.style.fontSize=Math.floor(fs*(1290-170)/alt)+'px'}
  const palH=pal.getBoundingClientRect().height,disp=1290-(170+palH)-20,cn=el.querySelector('.cnt'),cb=cn.querySelector('b');
  if(disp<380){cn.style.display='none'}else{const f2=Math.min(760,Math.floor(disp/.74));cb.style.fontSize=f2+'px';cn.style.bottom=(H-1290)+'px';cn.querySelector('span').style.fontSize=Math.max(30,Math.round(f2*.06))+'px'}
  el.style.display='none';
  return {el,t0:c.t0,dur:c.dur,anim(u){
    const k=oQ(seg(u,0,1.2));pal.style.letterSpacing=(-0.06-0.015*k)+'em';
    el.querySelector('.sub').style.opacity=1;
  }};
}

function cenaMostra(c){
  const el=document.createElement('section');el.className='cena mostra';el.style.setProperty('--ac',c.cor);
  const W0=940,Hz=770,top=585;
  const r=Math.min(W0/c.iw,Hz/c.ih),dw=Math.round(c.iw*r),dh=Math.round(c.ih*r);
  const fl=dw<720?70+W0-dw:70,ft=top+Hz-dh;
  const fs=(function(t){const n=t.length;return n<=14?112:n<=24?92:n<=36?76:n<=52?62:52})(c.titulo);
  el.innerHTML='<div class="cab"><b>Vernissages SP</b><span>'+E(c.kicker)+'</span></div>'+
   '<div class="data"><div class="nm"><div class="num">'+E(c.num)+'</div></div><div class="lado"><div class="r">'+E(c.rot)+'</div><div class="m">'+E(c.mes)+'</div>'+(c.nota?'<div class="s">'+E(c.nota)+'</div>':'')+'</div></div>'+
   '<div class="foto" style="left:'+fl+'px;top:'+ft+'px;width:'+dw+'px;height:'+dh+'px"><img src="'+c.img+'"></div>'+
   '<div class="tx">'+(c.selo?'<div class="selo">'+E(c.selo)+'</div>':'')+'<div class="tit" style="font-size:'+fs+'px">'+palavras(c.titulo)+'</div>'+(c.quem?'<div class="art">'+E(c.quem)+'</div>':'')+'<div class="onde">'+E(c.casa)+' · '+E(c.bairro)+'</div><div class="ate">'+E(c.ate)+'</div></div>'+
   '<div class="rod"><span>@vernissagessp</span><span class="pq">'+Array.from({length:c.total},(_,i)=>'<i class="'+(i<=c.i?'on':'')+'"></i>').join('')+'</span></div>';
  document.body.appendChild(el);
  /* título: cabe em 3 linhas */
  const t=el.querySelector('.tit');let f=fs;t.style.fontSize=f+'px';el.style.display='block';
  while(t.getBoundingClientRect().height>f*.93*3+6&&f>40){f-=4;t.style.fontSize=f+'px'}
  el.style.display='none';
  const nm=el.querySelector('.num'),lado=el.querySelector('.lado'),ft_=el.querySelector('.foto'),im=el.querySelector('img'),ws=[].slice.call(el.querySelectorAll('.tit .w>span')),art=el.querySelector('.art'),onde=el.querySelector('.onde'),ate=el.querySelector('.ate'),cab=el.querySelector('.cab'),selo=el.querySelector('.selo');
  return {el,t0:c.t0,dur:c.dur,anim(u){
    cab.style.opacity=seg(u,0,.2);
    nm.style.transform='translateY('+(110*(1-oE(seg(u,.02,.5))))+'%)';
    const kl=oQ(seg(u,.18,.6));lado.style.opacity=kl;lado.style.transform='translateX('+(-40*(1-kl))+'px)';
    ft_.style.clipPath='inset('+(100*(1-io(seg(u,.14,.8))))+'% 0 0 0)';
    im.style.transform='scale('+(1.12-.12*oQ(seg(u,.14,c.dur)))+')';
    if(selo){const ks=oQ(seg(u,.5,.8));selo.style.opacity=ks;selo.style.transform='translateY('+(18*(1-ks))+'px)'}
    ws.forEach((w,i)=>{w.style.transform='translateY('+(108*(1-oE(seg(u,.6+i*.07,1.0+i*.07))))+'%)'});
    const fa=(e,a)=>{if(!e)return;const k=oQ(seg(u,a,a+.4));e.style.opacity=k;e.style.transform='translateY('+(22*(1-k))+'px)'};
    fa(art,1.0);fa(onde,1.15);fa(ate,1.3);
  }};
}

function cenaFim(c){
  const el=document.createElement('section');el.className='cena fim';
  const M=c.mapa;
  const fundo=M.fundo.map(p=>'<circle class="f" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4.2" fill="#F2EFE9" fill-opacity=".38"/>').join('');
  const rota=c.rota&&M.foco.length>1?'<path id="rota" d="M'+M.foco.map(f=>f.p[0].toFixed(1)+' '+f.p[1].toFixed(1)).join(' L')+'" fill="none" stroke="${D.TERRA}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>':'';
  const foco=M.foco.map(f=>'<g class="o" transform="translate('+f.p[0].toFixed(1)+' '+f.p[1].toFixed(1)+')"><circle class="an" r="30" fill="none" stroke="${D.TERRA}" stroke-width="3"/><circle r="26" fill="${D.TERRA}"/><text y="10" text-anchor="middle" font-family="Switzer" font-weight="800" font-size="30" fill="#0E0E0E">'+f.n+'</text></g>').join('');
  el.innerHTML='<div class="cab"><b>Vernissages SP</b><span>'+E(c.kicker)+'</span></div><svg class="mapa" viewBox="0 0 940 740" width="940" height="740">'+fundo+rota+foco+'</svg>'+
    '<div class="lista">'+c.lista.map((l,i)=>'<div class="li"><b>'+(i+1)+'</b><span>'+E(l.nome)+'</span><small>'+E(l.bairro)+'</small></div>').join('')+'</div>'+
    '<div class="chamada"><div class="g">Salva para não perder o dia.</div><div class="u">vernissagessp.com.br</div></div>';
  document.body.appendChild(el);
  const fs=[].slice.call(el.querySelectorAll('.f')),os=[].slice.call(el.querySelectorAll('.o')),an=[].slice.call(el.querySelectorAll('.an')),li=[].slice.call(el.querySelectorAll('.li')),rt=el.querySelector('#rota'),g=el.querySelector('.chamada'),cab=el.querySelector('.cab');
  const len=rt?rt.getTotalLength():0;if(rt){rt.style.strokeDasharray=len;}
  return {el,t0:c.t0,dur:c.dur,anim(u){
    cab.style.opacity=seg(u,0,.2);
    fs.forEach((f,i)=>{f.style.opacity=oQ(seg(u,.05+(i%40)*.012,.4+(i%40)*.012))});
    if(rt)rt.style.strokeDashoffset=len*(1-io(seg(u,.35,1.9)));
    os.forEach((o,i)=>{const k=oE(seg(u,.3+i*.28,.6+i*.28));o.style.opacity=k;o.setAttribute('transform',o.getAttribute('transform').replace(/ scale\\([^)]*\\)/,'')+' scale('+(0.4+0.6*k).toFixed(3)+')')});
    an.forEach((a,i)=>{const p=((u-.6-i*.28)*1.1)%1;const q=u<.6+i*.28?0:p;a.setAttribute('r',(30+34*q).toFixed(1));a.setAttribute('stroke-opacity',(1-q).toFixed(2))});
    li.forEach((l,i)=>{const k=oQ(seg(u,.4+i*.28,.8+i*.28));l.style.opacity=k;l.style.transform='translateX('+(30*(1-k))+'px)'});
    const kg=oQ(seg(u,1.0+R.n*.2,1.5+R.n*.2));g.style.opacity=kg;g.style.transform='translateY('+(40*(1-kg))+'px)';
  }};
}

R.cenas.forEach(c=>C.push(c.tipo==='capa'?cenaCapa(c):c.tipo==='mostra'?cenaMostra(c):cenaFim(c)));
window.setT=function(t){
  C.forEach((c,i)=>{
    const u=t-c.t0,fim=c.dur+${T_VAO};
    if(u<0||u>=fim){c.el.style.display='none';return}
    c.el.style.display='block';c.el.style.zIndex=i+1;
    const v=i===0?1:io(seg(u,0,${T_VAO}));
    c.el.style.clipPath=v>=1?'none':'inset('+(100*(1-v))+'% 0 0 0)';
    c.anim(Math.max(0,u-(i===0?0:${T_VAO}*0.7)));
  });
};
document.fonts.ready.then(()=>{window.pronto=true});
</script>`;
}

/* ---------- renderização ---------- */
async function principal() {
  const DATA = carregarDados();
  const { out, usados, V } = await candidatas(DATA);
  const { modo, pick, bairro } = escolherModo(out, usados, V, flag('modo', 'auto'));
  if (!modo) { console.log(`Sem Reel hoje: nenhum formato com 3 mostras que passem nas réguas (${out.length} candidata(s)).`); process.exit(2); }
  console.log(`REEL ${hoje} · formato ${modo}${bairro && modo === 'rota' ? ' · ' + bairro : ''} · ${pick.length} mostra(s)`);
  pick.forEach((c, i) => console.log(`  ${i + 1}. ${tit(c.e)} · ${c.v.name} · ${c.v.b} · ${c.dim.w}px`));
  if (argv.includes('--seco')) { console.log('\n' + legenda(modo, pick, bairro)); return; }

  const sharp = require(path.join(REND, 'node_modules', 'sharp'));
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reelarte-'));

  /* imagens leves + cor da obra */
  const itens = [];
  for (let i = 0; i < pick.length; i++) {
    const c = pick[i], alvo = path.join(tmp, `o${i}.jpg`);
    const m = await sharp(path.resolve(RAIZ, c.rel)).rotate().resize({ width: 1500, height: 1500, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toFile(alvo);
    const rgb = await D.corDaObra(sharp, alvo);
    itens.push({ c, alvo, iw: m.width, ih: m.height, pal: D.paletaDaCor(rgb) });
  }
  const kicker = { abre: 'Abre esta semana', fecha: 'Últimos dias', rota: bairro, gratis: 'De graça', tempo: 'Ainda dá tempo' };
  const pc = capa(modo, pick, bairro);
  const paletaCapa = itens[0].pal;
  const cenas = [{ tipo: 'capa', t0: 0, dur: T_CAPA, palavras: pc.palavras, sub: pc.sub, cnt: pc.cnt, campo: paletaCapa.campo, sobre: paletaCapa.sobre, kicker: pick.length + (modo === 'rota' ? ' a pé' : ' exposições') }];
  let t = T_CAPA;
  itens.forEach((it, i) => {
    const e = it.c.e;
    let num, rot, mes, nota = '';
    if (modo === 'abre') { num = String(+e.ini.slice(8)); rot = DIA[dowDe(e.ini)]; mes = MES[+e.ini.slice(5, 7) - 1]; nota = it.c.abre === 0 ? 'abre hoje' : it.c.abre === 1 ? 'abre amanhã' : ''; }
    else if (modo === 'gratis') { num = '0'; rot = 'R$'; mes = 'DE ENTRADA'; nota = e.fim ? 'até ' + curto(e.fim) : 'em cartaz'; }
    else if (modo === 'tempo') { const f = it.c.falta; num = String(f); rot = 'FALTAM'; mes = 'DIAS'; nota = 'fecha ' + DIA_EXT[dowDe(e.fim)] + ', ' + curto(e.fim); }
    else if (modo === 'fecha') { const f = it.c.falta; num = f === 0 ? 'HOJE' : String(f); rot = f === 0 ? 'ÚLTIMO' : 'FALTAM'; mes = f === 0 ? 'DIA' : f === 1 ? 'DIA' : 'DIAS'; nota = e.fim ? 'fecha ' + DIA_EXT[dowDe(e.fim)] + ', ' + curto(e.fim) : ''; }
    else { num = String(i + 1); rot = 'PARADA'; mes = 'DE ' + pick.length; const ant = pick[i - 1]; nota = 'ponto de partida'; if (ant) { const mt = Math.round(km(ant.v, it.c.v) * 1000 / 10) * 10; nota = (mt >= 1000 ? (mt / 1000).toFixed(1).replace('.', ',') + ' km' : mt + ' m') + ' da parada anterior'; } }
    const ate = modo === 'abre' ? (e.fim ? 'em cartaz até ' + porExtenso(e.fim) : 'abre em ' + porExtenso(e.ini)) : e.fim ? 'até ' + porExtenso(e.fim) : 'em cartaz';
    cenas.push({ tipo: 'mostra', t0: t - T_VAO, dur: T_MOSTRA + T_VAO, i, total: pick.length, kicker: kicker[modo], num, rot, mes, nota, cor: it.pal.texto, img: 'file:///' + it.alvo.replace(/\\/g, '/'),
      iw: it.iw, ih: it.ih, titulo: tit(e), quem: quemCurto(autoria(e)), casa: it.c.v.name, bairro: it.c.v.b, ate, selo: modo === 'rota' || modo === 'fecha' ? selo(it.c, modo) : '' });
    t += T_MOSTRA;
  });
  const mapa = projeta(DATA, pick, modo, 940, 740);
  cenas.push({ tipo: 'fim', t0: t - T_VAO, dur: T_FIM + T_VAO, kicker: kicker[modo], mapa, rota: modo === 'rota', lista: pick.map(c => ({ nome: c.v.name, bairro: c.v.b })) });
  const total = t + T_FIM;
  /* a cena N+1 cobre a N por T_VAO: corrige as durações para não sumir antes do véu fechar */
  for (let i = 0; i < cenas.length - 1; i++) cenas[i].dur = cenas[i + 1].t0 - cenas[i].t0;
  cenas[cenas.length - 1].dur = total - cenas[cenas.length - 1].t0;
  const ROT = { cenas, n: pick.length, total };

  const html = path.join(RAIZ, '.reel-arte.html');
  fs.writeFileSync(html, pagina(ROT));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1', '--hide-scrollbars'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await browser.newPage();
  p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.goto('file:///' + html.replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.waitForFunction('window.pronto===true', { timeout: 30000 });
  await new Promise(r => setTimeout(r, 400));

  const saidaDir = argv.includes('--fila') ? path.join(RAIZ, 'fila', 'vernissagessp', `${hoje}_reel`) : path.join(RAIZ, 'SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10));
  fs.mkdirSync(saidaDir, { recursive: true });
  const mp4 = path.join(saidaDir, 'reel.mp4');

  /* som: uma batida grave curta em cada corte. Sem trilha (a API não escolhe áudio do Instagram). */
  const cortes = cenas.slice(1).map(c => Math.round(c.t0 * 1000 + T_VAO * 500));
  const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
  if (argv.includes('--mudo') || !cortes.length) args.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest');
  else {
    const bat = 'aevalsrc=0.8*sin(2*PI*(58+46*exp(-26*t))*t)*exp(-8*t)+0.16*sin(2*PI*2600*t)*exp(-150*t):d=0.5:s=44100';
    cortes.forEach(() => args.push('-f', 'lavfi', '-i', bat));
    const fl = cortes.map((ms, i) => `[${i + 1}]adelay=${ms}|${ms}[a${i}]`).join(';') + ';' + cortes.map((_, i) => `[a${i}]`).join('') +
      `amix=inputs=${cortes.length}:normalize=0,apad=whole_dur=${total.toFixed(2)},atrim=0:${total.toFixed(2)},volume=0.7[aud]`;
    args.push('-filter_complex', fl, '-map', '0:v', '-map', '[aud]');
  }
  args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '128k', '-t', total.toFixed(2), mp4);
  const ff = spawn(FFMPEG, args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const fim = new Promise((res, rej) => { ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg saiu com ' + c))); ff.on('error', rej); });
  const quadros = Math.round(total * FPS);
  for (let f = 0; f < quadros; f++) {
    await p.evaluate(tt => window.setT(tt), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93, optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f === Math.round(T_CAPA * FPS) - 2 && argv.includes('--quadros')) fs.writeFileSync(path.join(tmp, 'capa.jpg'), buf);
    if (argv.includes('--quadros') && f % 15 === 0) fs.writeFileSync(path.join(saidaDir, `q${String(f).padStart(4, '0')}.jpg`), buf);
  }
  ff.stdin.end(); await fim; await browser.close(); fs.rmSync(html, { force: true });
  console.log(`OK ${path.relative(RAIZ, mp4)} · ${total.toFixed(1)} s · ${(fs.statSync(mp4).size / 1048576).toFixed(1)} MB`);

  const leg = legenda(modo, pick, bairro);
  if (argv.includes('--fila')) {
    const q = flag('quando', '18:00');
    const post = { conta: 'vernissagessp', id: `${hoje}_reel`, status: 'aprovado', tipo: 'reel', quando: `${hoje}T${q}:00-03:00`, imagens: ['reel.mp4'], legenda: leg, collab: [], collabExtra: [] };
    fs.writeFileSync(path.join(saidaDir, 'post.json'), JSON.stringify(post, null, 2) + '\n');
    console.log(`na fila: ${post.id} às ${q}`);
  } else fs.writeFileSync(path.join(saidaDir, 'reel-LEGENDA.md'), leg + '\n');

  if (!argv.includes('--sem-memoria')) {
    const u = lerJson(USADOS, {});
    for (const c of pick) u[c.e.t + '|' + c.e.v] = hoje;
    if (modo === 'rota' && bairro) u['_bairro:' + bairro] = hoje;
    u._modos = [...(u._modos || []), { data: hoje, modo }].slice(-8);
    fs.mkdirSync(path.dirname(USADOS), { recursive: true });
    fs.writeFileSync(USADOS, JSON.stringify(u, null, 2) + '\n');
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

principal().catch(e => { console.error(e.stack || e.message); process.exit(1); });
