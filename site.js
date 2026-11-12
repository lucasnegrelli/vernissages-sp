/* ============================================================
   VERNISSAGES SP — CASCA DAS PÁGINAS GERADAS (gerar.js)
   CSS, cabeçalho, rodapé e scripts compartilhados pelas páginas internas
   (acervo, artistas, editais, fim de semana, monta seu sábado, m/ e a/).
   Mesma linguagem da home: papel e tinta, Switzer, marca em caixa-alta,
   filetes no lugar de cartões, um acento só.

   COR DO DIA: a home guarda no navegador (localStorage 'vspAcento') a cor de
   destaque tirada da obra do dia; estas páginas leem a mesma chave e trocam
   o --terra. Sem a chave, ficam na terracota.

   Os nomes de classe antigos (.box, .btn, ul.lista, .tag, .grid2, .busca) e
   as variáveis do tema escuro (--accent, --panel, --glass...) continuam
   existindo, apontando para o tema novo: o fim de semana e o monta seu
   sábado têm CSS próprio escrito para elas e herdam o visual sem reescrita.
   ============================================================ */
'use strict';

module.exports = function (SITE, esc, fontesRodape) {

const CSS = `
@font-face{font-family:Switzer;src:url(${SITE}/fontes/Switzer-Variable.woff2) format("woff2");font-weight:100 900;font-display:swap}
:root{--paper:#F2EFE9;--ink:#0E0E0E;--terra:#C96F4A;--mute:#6f6a60;--mute2:#b7b1a4;--gut:clamp(16px,3vw,48px);--serif:"Instrument Serif",Georgia,serif;
 /* nomes do tema escuro antigo, apontando para o novo */
 --bg:var(--paper);--text:var(--ink);--text2:#3d3a35;--muted:var(--mute);--accent:var(--terra);--accent2:var(--terra);
 --panel:transparent;--panel2:transparent;--glass:transparent;--glass2:transparent;--border:rgba(14,14,14,.24);--line:rgba(14,14,14,.24);--line2:var(--ink);--hair:rgba(14,14,14,.14);
 --radius:0px;--radius-sm:0px;--onaccent:var(--ink);--blue:var(--ink);--green:var(--terra);--red:var(--terra);--violet:var(--terra);--blur:none;--font:Switzer,Helvetica,Arial,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html{overflow-x:clip}
body{background:var(--paper);color:var(--ink);font-family:Switzer,Helvetica,Arial,sans-serif;font-size:17px;line-height:1.45;-webkit-font-smoothing:antialiased;overflow-x:clip}
::selection{background:var(--terra);color:var(--ink)}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
img{max-width:100%}
:focus-visible{outline:2px solid var(--terra);outline-offset:2px}

/* ---------- cabeçalho ---------- */
.topo{position:sticky;top:0;z-index:60;background:var(--paper);border-bottom:2px solid var(--ink);display:flex;justify-content:space-between;align-items:center;gap:20px;padding:0 var(--gut);min-height:58px}
.logo{font-weight:800;font-size:clamp(20px,2.4vw,30px);letter-spacing:-.045em;text-transform:uppercase;color:var(--terra);line-height:1;padding:14px 0;white-space:nowrap}
.topo nav{display:flex;gap:clamp(14px,2vw,28px);align-items:center;overflow-x:auto;scrollbar-width:none}
.topo nav::-webkit-scrollbar{display:none}
.topo nav a{position:relative;white-space:nowrap;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:21px 0}
.topo nav a::after{content:"";position:absolute;left:0;right:100%;bottom:14px;height:2px;background:var(--terra);transition:right .25s ease}
.topo nav a:hover::after,.topo nav a[aria-current]::after{right:0}
.topo nav a.cta{background:var(--ink);color:var(--paper);padding:10px 14px;margin:0}
.topo nav a.cta::after{display:none}
.topo nav a.cta:hover{background:var(--terra);color:var(--ink)}

/* ---------- corpo ---------- */
.wrap{max-width:1000px;margin:0 auto;padding:clamp(28px,5vw,72px) var(--gut) 40px}
.wide{max-width:1500px}
.kick{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--terra);margin-bottom:10px}
.kick span{color:var(--ink)}
h1{font-weight:800;text-transform:uppercase;font-size:clamp(34px,6vw,96px);line-height:.9;letter-spacing:-.045em;margin:0 0 clamp(14px,2vw,26px);text-wrap:balance;overflow-wrap:break-word}
h1.g{font-size:clamp(46px,10vw,168px);line-height:.84}
h1 .tag{font-size:12px;letter-spacing:.12em;vertical-align:middle;margin-left:14px;line-height:1}
h2{font-weight:800;font-size:clamp(22px,2.6vw,38px);letter-spacing:-.035em;text-transform:uppercase;line-height:.95;margin:clamp(36px,5vw,72px) 0 clamp(12px,1.6vw,20px);padding-bottom:12px;border-bottom:2px solid var(--ink);display:flex;justify-content:space-between;align-items:baseline;gap:14px;text-wrap:balance}
h2 small{font-size:12px;letter-spacing:.14em;color:var(--mute);font-weight:600}
.lede{font-size:clamp(18px,1.6vw,24px);line-height:1.4;max-width:62ch;margin:0 0 18px;text-wrap:pretty}
p.txt{margin:14px 0;font-size:clamp(17px,1.35vw,20px);line-height:1.5;max-width:68ch;text-wrap:pretty}
.sub{font-family:var(--serif);font-style:italic;font-size:clamp(22px,2.4vw,38px);line-height:1.1;margin:0 0 12px;text-wrap:pretty}
.sub a:hover{color:var(--terra)}
.meta{color:var(--mute);font-size:14px;letter-spacing:.04em;margin-bottom:20px}
.nota{font-size:13px;color:var(--mute);max-width:78ch;line-height:1.5}

/* ---------- peças ---------- */
.tag{display:inline-block;border:1.5px solid currentColor;padding:2px 8px;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
.tag.on{color:var(--ink)}.tag.soon{color:var(--terra)}.tag.off{color:var(--mute)}
.tag.cheio{background:var(--terra);border-color:var(--terra);color:var(--ink)}
.btns{display:flex;gap:10px;flex-wrap:wrap;margin:clamp(18px,2vw,28px) 0}
.btn{display:inline-block;border:1.5px solid var(--ink);padding:11px 18px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:800;transition:background .15s,color .15s}
.btn:hover{background:var(--ink);color:var(--paper)}
.btn.cheio{background:var(--ink);color:var(--paper)}
.btn.cheio:hover{background:var(--terra);border-color:var(--terra);color:var(--ink)}
.box{border-top:2px solid var(--ink);padding:16px 0;margin:18px 0}
.box dl{display:grid;grid-template-columns:150px 1fr;gap:10px 18px;font-size:15px}
.box dt{color:var(--mute);font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;padding-top:2px}
.box dd a{border-bottom:1.5px solid var(--terra)}
.box dd a:hover{color:var(--terra)}

/* busca, filtros */
.busca{width:100%;background:transparent;border:0;border-bottom:2px solid var(--ink);color:var(--ink);font:800 clamp(22px,3.2vw,46px)/1 Switzer,sans-serif;letter-spacing:-.04em;text-transform:uppercase;padding:6px 0 10px;outline:0;border-radius:0;margin:6px 0 18px}
.busca::placeholder{color:#a9a399}
.busca:focus{border-color:var(--terra)}
.chips{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px}
.chips .rot{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--mute);margin-right:4px}
.chip{border:1.5px solid var(--ink);padding:7px 12px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:800;transition:background .12s,color .12s}
.chip:hover{background:rgba(14,14,14,.08)}
.chip.on{background:var(--ink);color:var(--paper)}
select.sel{background:transparent;border:0;border-bottom:1.5px solid var(--ink);font:800 12px Switzer,sans-serif;letter-spacing:.1em;text-transform:uppercase;padding:8px 22px 8px 0;border-radius:0;appearance:none;-webkit-appearance:none;cursor:pointer;max-width:260px;background-image:linear-gradient(45deg,transparent 50%,var(--ink) 50%),linear-gradient(135deg,var(--ink) 50%,transparent 50%);background-position:calc(100% - 9px) 55%,calc(100% - 4px) 55%;background-size:5px 5px;background-repeat:no-repeat;color:var(--ink)}
.cont{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);margin:8px 0 4px}
.cont b{color:var(--terra)}

/* listas editoriais (acervo, artista, editais, fim de semana) */
ul.lista{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr));gap:0 var(--gut)}
ul.lista li{border-top:2px solid var(--ink);padding:16px 0 20px;position:relative}
ul.lista li .t{font-weight:800;font-size:clamp(19px,1.7vw,26px);line-height:1;letter-spacing:-.03em;text-transform:uppercase;display:block;text-wrap:balance}
ul.lista li a.t:hover{color:var(--terra)}
ul.lista li .t + .tag,ul.lista li .tag{margin-left:0}
ul.lista li .l2{font-family:var(--serif);font-style:italic;font-size:19px;margin-top:6px;line-height:1.15;color:var(--ink)}
ul.lista li .l3{color:var(--mute);font-size:13px;margin-top:5px;letter-spacing:.02em;line-height:1.4}
ul.lista li .qdt{font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;margin-bottom:7px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
ul.lista li .qdt .terra{color:var(--terra)}
.grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:0 var(--gut)}
.grid2 a{display:flex;justify-content:space-between;align-items:baseline;gap:10px;border-top:1.5px solid rgba(14,14,14,.3);padding:11px 0;font-weight:700;letter-spacing:-.01em;font-size:17px}
.grid2 a small{color:var(--mute);font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;white-space:nowrap}
.grid2 a:hover{color:var(--terra)}

/* imagem recortada na borda real (ver RC_JS): sem moldura branca */
.rc{position:relative;overflow:hidden;aspect-ratio:var(--ar,.8);opacity:0;background:transparent}
.rc.ok{opacity:1;transition:opacity .35s}
.rc img{position:absolute;display:block;max-width:none;width:100%;left:0;top:0;height:auto}
.th{height:112px;flex:none}

/* ---------- rodapé ---------- */
footer{margin-top:clamp(50px,7vw,100px);border-top:2px solid var(--ink);padding-top:22px;color:var(--mute);font-size:13px;line-height:1.7}
footer a{border-bottom:1.5px solid var(--terra);color:var(--ink)}
footer a:hover{color:var(--terra)}
footer nav{display:flex;gap:10px 24px;flex-wrap:wrap;margin-bottom:12px;font-weight:700;font-size:14px}
footer nav a{border:0}
.fontes{margin:0 0 14px;font-size:12px;line-height:1.8;max-width:110ch}
.fontes b{color:var(--ink);letter-spacing:.04em}

/* ---------- página de mostra ---------- */
.expo{display:block}
.expo h1{font-size:clamp(30px,4.6vw,76px);line-height:.92}
.expo.com{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.85fr);gap:clamp(24px,4vw,72px);align-items:start}
.quando{border-top:2px solid var(--ink);padding-top:14px;margin:6px 0 18px;display:flex;flex-direction:column;gap:8px}
.dt{font-weight:800;font-size:clamp(30px,3.8vw,64px);line-height:.92;letter-spacing:-.045em;text-transform:uppercase}
.dt i{font-style:normal;color:var(--terra);margin:0 .08em}
.sit{font-size:13px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--terra)}
.ex-fig{margin:0;position:sticky;top:78px}
.ex-fig .rc{width:min(100%,calc(78vh*var(--ar,.8)))}
.ex-fig figcaption{font-size:11px;color:var(--mute);margin-top:8px}
@media(max-width:860px){.expo.com{grid-template-columns:1fr}.ex-fig{position:static;order:-1}}

/* ---------- listas com miniatura, índices e editais ---------- */
ul.lista li .thl{flex:none;display:block}
ul.lista li .thl .rc{height:112px}
section.let h2{margin-top:clamp(26px,4vw,48px)}
.bloco{margin-top:clamp(10px,2vw,24px)}
ul.ed{grid-template-columns:1fr}
@media(min-width:1100px){ul.ed.radar{grid-template-columns:repeat(2,minmax(0,1fr))}}
ul.ed li{display:flex;gap:clamp(16px,3vw,48px);align-items:flex-start;justify-content:space-between}
.prz{flex:none;width:clamp(96px,11vw,150px);text-align:right}
.prz b{display:block;font-weight:800;font-size:clamp(26px,3.2vw,52px);line-height:.9;letter-spacing:-.05em;text-transform:uppercase}
.prz span{display:block;margin-top:6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--mute);font-weight:700}
.prz.soon b{color:var(--terra)}.prz.off b{color:var(--mute)}
ul.ed li.off{opacity:.55}
@media(max-width:700px){ul.ed li{flex-direction:column-reverse;gap:8px}.prz{text-align:left;width:auto;display:flex;gap:10px;align-items:baseline}.prz b{font-size:34px}}

/* ---------- compatibilidade: fim de semana e monta seu sábado ---------- */
#mapa{border:2px solid var(--ink)!important;border-radius:0!important;background:var(--paper)!important}
ul.lista li{display:flex;gap:16px;align-items:flex-start}
ul.lista li > .tx,ul.lista li > div:not(.th):not(.rc){flex:1;min-width:0}
ul.lista .th{width:auto;height:112px;border-radius:0;background:transparent}
ul.lista .th img{height:100%;width:auto;object-fit:contain}
.qd{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--terra);font-weight:800;margin-bottom:5px}
li.fecha .qd{color:var(--ink)}
ul.mini{list-style:none}
ul.mini li{display:block;padding:9px 0;border-top:1.5px solid rgba(14,14,14,.2)}
ul.mini a{font-weight:700}ul.mini a:hover{color:var(--terra)}
ul.mini span{color:var(--mute);font-size:13px}
h3.zona{font-size:12px;color:var(--terra);letter-spacing:.14em;text-transform:uppercase;margin:26px 0 4px;font-weight:800}
.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:var(--paper)!important;color:var(--ink)!important;border-radius:0!important}
.leaflet-popup-content a{color:var(--terra)!important}

@media(max-width:700px){
  .topo{padding:0 14px;gap:10px;min-height:52px}
  .topo nav a{padding:18px 0}
  .box dl{grid-template-columns:1fr;gap:2px 0}.box dt{margin-top:10px}
  ul.lista{grid-template-columns:1fr}
}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* Recorte automático de margem: acha a cor que se repete nos cantos, avança de cada lado até
   encontrar conteúdo e mostra só a janela da obra. Mesma lógica da home. ES5, sem dependências. */
const RC_JS_RECORTE = require('fs').readFileSync(require('path').join(__dirname, 'recorte.js'), 'utf8').replace(/if \(typeof module !== 'undefined'\)[^\n]*\n?/, '');
const RC_JS = `
(function(){
${RC_JS_RECORTE}
var A={};
function analisa(u){
  if(A[u])return A[u];
  A[u]=new Promise(function(res){
    var im=new Image();
    im.onload=function(){
      var W=im.naturalWidth,H=im.naturalHeight;if(!W||!H){res(null);return}
      var box=null;
      try{
        var k=Math.min(1,220/Math.max(W,H)),w=Math.max(8,Math.round(W*k)),h=Math.max(8,Math.round(H*k));
        var c=document.createElement('canvas');c.width=w;c.height=h;
        var x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,w,h);
        var r=caixaFinal(x.getImageData(0,0,w,h).data,w,h);
        if(r){var kx=W/w,ky=H/h;box={x:Math.round(r.x*kx),y:Math.round(r.y*ky),w:Math.round(r.w*kx),h:Math.round(r.h*ky)}}
      }catch(e){}
      res({W:W,H:H,box:box});
    };
    im.onerror=function(){res(null)};
    im.src=u;
  });
  return A[u];
}
function aplica(rc){
  analisa(rc.getAttribute('data-u')).then(function(info){
    var im=rc.querySelector('img');
    if(info&&im){
      var b=info.box||{x:0,y:0,w:info.W,h:info.H};
      rc.style.setProperty('--ar',(b.w/b.h).toFixed(4));
      im.style.width=(info.W/b.w*100)+'%';im.style.left=(-b.x/b.w*100)+'%';im.style.top=(-b.y/b.h*100)+'%';
    }
    rc.classList.add('ok');
  });
}
window.VSPrc=function(root){[].forEach.call((root||document).querySelectorAll('.rc[data-u]:not([data-ok])'),function(rc){rc.setAttribute('data-ok','1');aplica(rc)})};
VSPrc();
})();
`;

/* html de uma miniatura recortada */
const rc = (url, extra) => `<div class="rc${extra ? ' ' + extra : ''}" data-u="${esc(url)}"><img src="${esc(url)}" alt="" loading="lazy" onerror="this.closest('.rc').remove()"></div>`;

const NAV = [
  ['/', 'Agenda'], ['/arquivo.html', 'Acervo'], ['/artistas.html', 'Artistas'], ['/editais.html', 'Editais']
];

function pagina({ titulo, desc, canonical, corpo, jsonld, wide, scripts, ogTipo }) {
  const rel = String(canonical || '').replace(SITE, '') || '/';
  const ativo = href => rel === href || (href === '/arquivo.html' && rel.startsWith('/m/')) || (href === '/artistas.html' && rel.startsWith('/a/'));
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="${ogTipo || 'article'}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F2EFE9">
<link rel="icon" type="image/png" sizes="32x32" href="${SITE}/favicon-32.png"><link rel="icon" type="image/png" sizes="192x192" href="${SITE}/icon-192.png"><link rel="apple-touch-icon" href="${SITE}/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="preload" href="${SITE}/fontes/Switzer-Variable.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
<script>try{var a=localStorage.getItem('vspAcento');if(a&&/^#[0-9a-f]{6}$/i.test(a))document.documentElement.style.setProperty('--terra',a)}catch(e){}</script>
<script data-goatcounter="https://vernissages.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</scr` + `ipt>` : ''}
</head>
<body>
<header class="topo">
<a class="logo" href="${SITE}/">Vernissages SP</a>
<nav aria-label="Principal">
${NAV.map(([h, t]) => `<a href="${SITE}${h}"${ativo(h) ? ' aria-current="page"' : ''}>${t}</a>`).join('\n')}
<a class="cta" href="${SITE}/#divulgue">Divulgue</a>
</nav>
</header>
<main class="wrap${wide ? ' wide' : ''}">
${corpo}
<footer>
<nav aria-label="Rodapé"><a href="${SITE}/">Agenda</a><a href="${SITE}/arquivo.html">Acervo</a><a href="${SITE}/artistas.html">Artistas</a><a href="${SITE}/editais.html">Editais</a><a href="https://instagram.com/vernissagessp" target="_blank" rel="noopener">Instagram</a></nav>
${fontesRodape || ''}
Vernissages SP, mapa vivo das galerias e aberturas de São Paulo, atualizado diariamente. Datas conforme divulgação dos espaços; confirme antes de visitar.
</footer>
</main>
<script>${RC_JS}</script>
${scripts || ''}
</body>
</html>`;
}

return { CSS, RC_JS, pagina, rc };
};
