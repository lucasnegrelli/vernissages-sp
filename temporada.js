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
*{box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;text-shadow:none!important}
header,.top{background:var(--bg)!important;border-bottom:${fil} solid var(--ink)!important}
h1,header h1,.top a{font-family:var(--display);font-weight:${f.pesoTitulo};letter-spacing:${f.trackingTitulo}}
h2{font-family:var(--display);font-weight:${f.pesoTitulo};border-bottom:${fil} solid var(--ink)}
header h1 span,.top a span{color:var(--accent)}
.kpi b{font-family:var(--display);font-weight:${f.pesoTitulo};color:var(--ink)}
/* os véus amarelos que estavam escritos direto no CSS viram filete da cor do mês */
.navedital,.tag.opening,.wk .nw.hj,.bchip.on,.bchip.on .bchip-bar,.pano-go,.btn.intel,.cta,.card,.wk,.pano,.box,ul.lista li,.grid2 a{background:transparent!important;background-image:none!important}
.navedital,.tag.opening,.wk .nw.hj,.bchip.on,.pano-go,.btn.intel,.cta{border-color:var(--accent)!important}
.navedital-n,.ctabtn{background:var(--accent)!important;color:var(--onaccent)!important}
.btn:hover,.wk:hover,.pano-go:hover,.navedital:hover{background:var(--accent)!important;color:var(--onaccent)!important;border-color:var(--accent)!important;transform:none!important}
ul.lista li:hover,.grid2 a:hover,.card:hover{transform:none!important;border-color:var(--ink)!important}
::selection{background:var(--accent);color:var(--onaccent)}
footer::before{content:'${T.selo.replace(/'/g, "\\'")}';display:block;font-family:var(--display);font-weight:${f.pesoTitulo};color:var(--accent);letter-spacing:.02em;margin-bottom:10px;text-transform:uppercase;font-size:.78rem}
`;
}

module.exports = { carregar, atual, paleta, css, mesDeHoje };

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
