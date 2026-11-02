/* ============================================================
   TEMPORADA — a estética do mês, lida pelo site e pelo social
   ============================================================

   Ideia aprovada em 26/09/2026 (ver DESIGN.md, "Temporadas"): a cada mês o
   Vernissages SP troca de cara, como galeria que troca de exposição. O que
   muda mora num arquivo só, temporadas/AAAA-MM.json (cores, fontes, forma).
   O esqueleto — onde fica data, título e casa, a voz, nada sobre a obra —
   não muda nunca.

   Quem lê:
     • site: `node temporada.js --css` escreve temporada.css, que o index.html
       e as páginas do gerar.js carregam por último (sobrepõe os tokens).
       Roda todo dia no build.yml, então a virada de mês é sozinha.
     • social: require('./temporada.js').atual() devolve os tokens; o rima.js
       expõe isso como PALETAS.temporada e o agenda.js usa por padrão.

   Mês sem arquivo = sem temporada: o CSS sai vazio e o social usa a paleta
   de sempre. Nada quebra.

   Uso:
     node temporada.js                 mostra a temporada de hoje
     node temporada.js --mes=2026-10   mostra a de outubro
     node temporada.js --css [--mes=2026-10] [--out=temporada.css]
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'temporadas');
/* O social é gerado no domingo para a semana seguinte: a peça de 01/10 sai em
   27/09. Por isso, se o processo recebeu --date=AAAA-MM-DD (convenção de todos
   os geradores), vale o mês da peça, não o de hoje. */
const mesDeHoje = () => {
  const d = process.argv.find(x => /^--date=\d{4}-\d{2}/.test(x));
  return d ? d.slice(7, 14) : new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 7); // fuso de SP
};

function carregar(mes) {
  const p = path.join(DIR, (mes || mesDeHoje()) + '.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const atual = () => carregar(mesDeHoje());

/* Mesma forma das PALETAS do rima.js, para os geradores usarem sem saber
   que é temporada. */
function paleta(T) {
  if (!T) return null;
  const c = T.cores;
  return { fundo: c.fundo, texto: c.texto, meio: c.meio, fraco: c.fraco, apagado: c.apagado, traco: c.traco || c.apagado };
}

/* rgba() a partir de #RRGGBB, para os filetes e véus do site. */
function rgba(hex, a) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

/* Fundo claro? O site base é escuro: muitos fundos estão fixos em #0c0c10/#131318
   (com !important, para toque) e o card de destaque tem gradiente escuro. Em
   temporada clara, tudo isso vira papel e tinta, senão o texto some. */
const luz = hex => { const h = hex.replace('#', ''); const v = [0, 2, 4].map(i => { const x = parseInt(h.slice(i, i + 2), 16) / 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
const clara = T => luz(T.cores.fundo) > .4;
function camadaClara(T) {
  const c = T.cores, bg = c.fundo, ink = c.texto;
  return `/* temporada clara: sobrescreve os fundos escuros do site base */
:root{--violet:${c.acento};--blue:${c.tinta || ink};--green:${c.verde || ink};--red:${c.vermelho || c.acento}}
.focoimg::after{background:linear-gradient(90deg,var(--bg) 0%,${rgba(bg, .55)} 22%,transparent 55%)!important}
.focoimg .cred,.cardshot .cred{background:${rgba(bg, .88)}!important;color:var(--ink)!important;border:1px solid var(--line)!important}
.focoimg.gerada{background:var(--bg)!important}
.wkfade{background:linear-gradient(90deg,transparent,${bg})!important}
.leaflet-container{background:${c.papel||bg}!important}
.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:${rgba(c.papel||bg,.98)}!important;color:var(--ink)!important;border:1px solid var(--line2)}
.leaflet-control-zoom a{background:${c.papel||bg}!important;color:var(--ink)!important;border-color:var(--line2)!important}
.leaflet-control-attribution{background:${rgba(bg,.8)}!important}
.leaflet-popup-content hr{border-color:var(--line2)!important}
.btn,.btn.add,.btn.intel{color:var(--ink)!important;border-color:var(--line2)!important;background:transparent!important}
.btn.add,.btn.intel{color:var(--accent)!important;border-color:var(--accent)!important}
@media (max-width:1024px),(hover:none),(pointer:coarse){
  header{background:var(--bg)!important}
  .card,.panel,.foco,.wkwrap,.dirwrap,#modal,#routePanel,.navmenu,.infopop,.wk,th{background:var(--bg)!important}
  #modalBg{background:${rgba(bg, .94)}!important}
  #search,select,.chip,.navbtn,.viewtoggle,.btn{background:transparent!important}
  .card,.panel,.foco,.wkwrap,.dirwrap{border:var(--bw) solid var(--line2)!important}
}
`;
}

/* Bandeirinha em rabo de andorinha (Volpi, Fachada com bandeiras, 1959). */
const BANDEIRA = 'polygon(0 0,100% 0,100% 100%,50% 62%,0 100%)';

/* Festão: fileira de bandeirinhas, em SVG, para o topo do site e do social.
   cores: lista que se repete; w = largura de cada bandeira em px. */
function festaoSvg(cores, w, h) {
  const passo = w + Math.round(w * .35);
  const n = cores.length;
  const corpo = cores.map((c, i) => `<path d='M${i * passo} 0H${i * passo + w}V${h}L${i * passo + w / 2} ${Math.round(h * .62)}L${i * passo} ${h}Z' fill='${c}'/>`).join('');
  return { svg: `<svg xmlns='http://www.w3.org/2000/svg' width='${n * passo}' height='${h}'>${corpo}</svg>`, largura: n * passo };
}
const festaoUrl = (cores, w, h) => 'data:image/svg+xml;utf8,' + encodeURIComponent(festaoSvg(cores, w, h).svg).replace(/'/g, '%27');

/* Festão em HTML pronto para o social (screenshot de Puppeteer). Sem marca
   "bandeira" no JSON, devolve vazio. */
function festaoSocial(T, w, h, cores) {
  if (!T || T.marca !== 'bandeira') return '';
  const c = cores || T.cores.festaoCapa || T.cores.extras || [T.cores.acento];
  return `<div style="position:absolute;left:0;right:0;top:0;height:${h}px;background:url('${festaoUrl(c, w, h)}') repeat-x 12px 0"></div>`;
}

/* A mesma marca do header do site (ver marca() abaixo, gerada como CSS ali)
   — aqui em HTML pronto, porque o social é screenshot de Puppeteer, não CSS
   vivo. "Vernissages SP" + a peça geométrica do mês logo depois, na cor de
   acento. Sem temporada ou sem `marca` no JSON, devolve só o texto puro —
   nunca quebra uma peça por falta de configuração. */
function marcaSocial(T, acentoCor, tamanhoPx) {
  const rotulo = 'Vernissages SP';
  if (!T || !T.marca) return rotulo;
  const px = tamanhoPx || 14;
  const cor = acentoCor || (T.cores && T.cores.acento) || '#FF3B1D';
  const base = `display:inline-block;margin-left:${Math.round(px * .5)}px;background:${cor};vertical-align:middle`;
  const forma = T.marca === 'circulo' ? `width:${px}px;height:${px}px;border-radius:50%`
    : T.marca === 'quadrado' ? `width:${Math.round(px * .9)}px;height:${Math.round(px * .9)}px`
    : T.marca === 'risco' ? `width:${Math.round(px * 2.2)}px;height:${Math.round(px * .32)}px`
    : T.marca === 'bandeira' ? `width:${Math.round(px * 1.1)}px;height:${Math.round(px * 1.3)}px;clip-path:${BANDEIRA}`
    : '';
  if (!forma) return rotulo;
  return `${rotulo}<span style="${base};${forma}"></span>`;
}

/* A marca não é um logo fixo — é um sistema que muda e continua
   reconhecível (Experimental Jetset/Whitney "Responsive W", Wolff
   Olins/Tate, os dois citados no DESIGN.md). Uma peça geométrica ao lado do
   "SP" do header, amarrada à mesma regra visual da temporada (círculo
   cheio/vazio no Concreto, risco no Lambe) — não é enfeite solto, é o
   mesmo vocabulário das peças de social aplicado ao próprio nome do site. */
function marca(nome) {
  if (!nome) return '';
  const base = `header h1 span::after,.top a span::after{content:'';display:inline-block;
    margin-left:.22em;vertical-align:.05em;background:var(--accent)}`;
  if (nome === 'circulo') return base + `
header h1 span::after,.top a span::after{width:.32em;height:.32em;border-radius:50%}`;
  if (nome === 'quadrado') return base + `
header h1 span::after,.top a span::after{width:.3em;height:.3em}`;
  if (nome === 'bandeira') return base + `
header h1 span::after,.top a span::after{width:.34em;height:.4em;clip-path:${BANDEIRA};vertical-align:.02em}`;
  if (nome === 'risco') return base + `
header h1 span::after,.top a span::after{width:.7em;height:.12em;vertical-align:.18em}`;
  return '';
}

/* A camada do site. Sobrepõe os tokens do index.html e do template do
   gerar.js, e desliga o que o DESIGN.md chama de "cara de painel": vidro,
   sombra, degradê de fundo e canto arredondado. */
function css(T) {
  const topo = `/* temporada.css — gerado por temporada.js; não editar à mão */\n`;
  if (!T) return topo + `/* ${mesDeHoje()}: sem temporada, o site fica com a cara de sempre */\n`;
  const c = T.cores, f = T.fontes, fo = T.forma || {};
  const raio = (fo.raio || 0) + 'px', fil = (fo.filete || 1) + 'px';
  return topo + `/* ${T.selo} — ${T.referencia.replace(/\*\//g, '')} */
@import url('${f.css}');
:root{
  --bg:${c.fundo};--ink:${c.texto};--text:${c.texto};--muted:${c.fraco};--text2:${c.meio};
  --accent:${c.acento};--accent2:${c.acento};--onaccent:${c.fundo};
  --glass:transparent;--glass2:${rgba(c.texto, .04)};--panel:transparent;--panel2:${rgba(c.texto, .04)};
  --line:${rgba(c.texto, .22)};--line2:${c.texto};--hair:${rgba(c.texto, .12)};--border:${rgba(c.texto, .22)};
  --radius:${raio};--radius-sm:${raio};--bw:${fil};--blur:none;--shadow:none;
  --font:${f.texto};--display:${f.titulo};
}
body{background:var(--bg)}
body::before,body::after{display:none!important}
/* faixa de cor no topo — a assinatura do cartaz de Bienal, não um detalhe
   de painel: uma barra só, sem gradiente, sem sombra. */
html{border-top:6px solid var(--accent)}
*{box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;text-shadow:none!important}
header,.top{background:var(--bg)!important;border-bottom:${fil} solid var(--ink)!important}
h1,header h1,.top a{font-family:var(--display);font-weight:${f.pesoTitulo};letter-spacing:${f.trackingTitulo}}
h2{font-family:var(--display);font-weight:${f.pesoTitulo};border-bottom:${fil} solid var(--ink)}
header h1 span,.top a span{color:var(--accent)}
${marca(T.marca)}
.kpi b{font-family:var(--display);font-weight:${f.pesoTitulo};color:var(--ink)}
/* os véus amarelos que estavam escritos direto no CSS viram filete da cor do mês */
.navedital,.tag.opening,.wk .nw.hj,.bchip.on,.bchip.on .bchip-bar,.pano-go,.btn.intel,.cta,.card,.wk,.pano,.box,ul.lista li,.grid2 a{background:transparent!important;background-image:none!important}
.navedital,.tag.opening,.wk .nw.hj,.bchip.on,.pano-go,.btn.intel,.cta{border-color:var(--accent)!important}
.navedital-n,.ctabtn{background:var(--accent)!important;color:var(--onaccent)!important}
.btn:hover,.wk:hover,.pano-go:hover,.navedital:hover{background:var(--accent)!important;color:var(--onaccent)!important;border-color:var(--accent)!important;transform:none!important}
ul.lista li:hover,.grid2 a:hover,.card:hover{transform:none!important;border-color:var(--ink)!important}
::selection{background:var(--accent);color:var(--onaccent)}
/* As pílulas de status (verde/azul/vermelho fixos) são exatamente a "cara de
   painel" que o DESIGN.md manda tirar — na temporada, status vira só
   acento e neutro, nunca semáforo. */
.tag{background:transparent!important;background-image:none!important;border-width:${fil}!important}
.tag.current,.tag.paid,.tag.tbc{color:var(--muted)!important;border-color:var(--border)!important}
.tag.closing,.tag.fair{color:var(--accent)!important;border-color:var(--accent)!important}
.tag.free{color:var(--ink)!important;border-color:var(--ink)!important}
${T.marca === 'bandeira' ? `header,.top{position:relative;margin-bottom:22px}
header::after,.top::after{content:'';position:absolute;left:0;right:0;top:100%;height:26px;pointer-events:none;z-index:5;
  background:url("${festaoUrl(c.festao || c.extras || [c.acento], 22, 26)}") repeat-x 12px 0}` : ''}
${clara(T) ? camadaClara(T) : ''}
footer::before{content:'${T.selo.replace(/'/g, "\\'")}';display:block;font-family:var(--display);font-weight:${f.pesoTitulo};color:var(--accent);letter-spacing:.02em;margin-bottom:10px;text-transform:uppercase;font-size:.78rem}
/* mesma assinatura no cabeçalho — a temporada não é só cor trocada */
.hbrand::after{content:'${T.selo.replace(/'/g, "\\'")}';display:block;font-family:var(--display);
  font-weight:700;color:var(--accent);letter-spacing:.18em;text-transform:uppercase;
  font-size:.68rem;margin-top:8px}
`;
}

module.exports = { carregar, atual, paleta, css, mesDeHoje, marcaSocial, festaoSocial };

if (require.main === module) {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=').slice(1).join('=') : p; };
  const mes = flag('mes', mesDeHoje());
  const T = carregar(mes);
  if (argv.includes('--css')) {
    const out = path.resolve(flag('out', path.join(__dirname, 'temporada.css')));
    fs.writeFileSync(out, css(T), 'utf8');
    console.log(`${out}: ${T ? T.selo : 'sem temporada em ' + mes}`);
  } else {
    console.log(T ? `${mes}: ${T.selo}\n${T.referencia}\n- ${T.regras.join('\n- ')}` : `${mes}: sem temporada (crie temporadas/${mes}.json)`);
  }
}
