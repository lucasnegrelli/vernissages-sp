/* ============================================================
   VERNISSAGES SP — GERADOR DE ACERVO E PÁGINAS ESTÁTICAS
   Roda no GitHub Actions a cada push em dados.js (e uma vez por dia).
   Lê dados.js + acervo.json e escreve:
     acervo.json      banco acumulado (nunca perde mostra nem artista)
     m/<slug>.html    uma página por exposição
     a/<slug>.html    uma página por artista
     arquivo.html     índice de todas as mostras (em cartaz + encerradas)
     artistas.html    índice de artistas
     fim-de-semana.html  o que abre, fecha e segue em cartaz no sábado/domingo
     sitemap.xml, robots.txt
   Não depende de nada além do Node.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const RAIZ = process.cwd();
const SITE = 'https://vernissagessp.com.br';
const HOJE = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); // fuso de SP

/* ---------- carrega dados.js ---------- */
function carregarDados() {
  const src = fs.readFileSync(path.join(RAIZ, 'dados.js'), 'utf8');
  const win = {};
  new Function('window', src)(win);
  return win.DATA;
}

/* ---------- utilidades ---------- */
const slug = s => (s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/&/g, ' e ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const dataBR = d => d ? d.split('-').reverse().join('/') : '';
const MES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const dataLonga = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return `${+dd} de ${MES[+m - 1]} de ${y}`; };
const artistasDe = e => (e.a || '').split(',').map(s => s.trim()).filter(Boolean);
/* corta sem partir palavra */
const corta = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const c = s.slice(0, n); return c.slice(0, c.lastIndexOf(' ')).replace(/[,;:.\-—]$/, '') + '…'; };

/* ---------- acervo acumulado ---------- */
function carregarAcervo() {
  const p = path.join(RAIZ, 'acervo.json');
  if (!fs.existsSync(p)) return { expos: [], artistas: {}, venues: {} };
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.error('acervo.json ilegivel, recomecando:', e.message); return { expos: [], artistas: {}, venues: {} }; }
}

function mesclarAcervo(acervo, DATA) {
  const idx = new Map(acervo.expos.map(e => [e.id, e]));
  let novas = 0, atualizadas = 0;

  DATA.expos.forEach(e => {
    const v = DATA.venues.find(x => x.name === e.v);
    if (!v) return;
    const id = slug(e.t) + '--' + slug(e.v);
    const reg = {
      id, t: e.t, a: e.a || '', v: e.v, ini: e.ini, fim: e.fim || null, d: e.d || '',
      bairro: v.b, zona: v.z, addr: v.addr, tipo: v.tipo,
      site: v.site || '', ig: v.ig || '',
      visto: HOJE
    };
    const antigo = idx.get(id);
    if (!antigo) { acervo.expos.push(reg); idx.set(id, reg); novas++; }
    else {
      const mudou = ['t','a','ini','fim','d','bairro','zona','addr','site','ig']
        .some(k => antigo[k] !== reg[k] && reg[k]);
      if (mudou) atualizadas++;
      Object.assign(antigo, reg, { primeiroRegistro: antigo.primeiroRegistro || antigo.visto });
    }
  });

  acervo.artistas = acervo.artistas || {};
  acervo.expos.forEach(e => {
    artistasDe(e).forEach(nome => {
      const k = slug(nome);
      const at = acervo.artistas[k] || { nome, mostras: [] };
      at.nome = nome;
      if (!at.mostras.includes(e.id)) at.mostras.push(e.id);
      acervo.artistas[k] = at;
    });
  });

  acervo.venues = acervo.venues || {};
  DATA.venues.forEach(v => { acervo.venues[slug(v.name)] = { name: v.name, addr: v.addr, b: v.b, z: v.z, tipo: v.tipo, site: v.site || '', ig: v.ig || '', info: v.info || '' }; });

  acervo.atualizado = HOJE;
  return { novas, atualizadas };
}

/* ---------- template base ---------- */
const CSS = `
:root{--bg:#0a0a0d;--ink:#f3f3f7;--text:#f3f3f7;--muted:#8b8b9a;--text2:#c2c2d0;--accent:#e8c15a;--accent2:#c96f4a;--violet:#a78bfa;--green:#7fd8a0;--red:#f08a7a;--blue:#8fb6f9;--glass:rgba(255,255,255,.045);--glass2:rgba(255,255,255,.075);--line:rgba(255,255,255,.10);--line2:rgba(255,255,255,.20);--hair:rgba(255,255,255,.055);--panel:rgba(255,255,255,.045);--panel2:rgba(255,255,255,.075);--border:rgba(255,255,255,.10);--blur:blur(16px) saturate(150%)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:ui-sans-serif,system-ui,'Segoe UI',Inter,sans-serif;line-height:1.65;font-size:16px;-webkit-font-smoothing:antialiased;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(58vw 46vh at 10% -8%,rgba(232,193,90,.13),transparent 62%),radial-gradient(48vw 42vh at 94% 4%,rgba(167,139,250,.12),transparent 62%),radial-gradient(72vw 55vh at 48% 104%,rgba(201,111,74,.09),transparent 60%)}
body::after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px);background-size:72px 72px;-webkit-mask-image:radial-gradient(ellipse 85% 55% at 50% 0%,#000 20%,transparent 78%);mask-image:radial-gradient(ellipse 85% 55% at 50% 0%,#000 20%,transparent 78%)}
::selection{background:var(--accent);color:#0a0a0d}
a{color:var(--blue)}
.top{border-bottom:1px solid var(--border);padding:20px 24px}
.top a{color:var(--text);text-decoration:none;font-weight:600;letter-spacing:2.5px;font-size:1rem}
.top a span{color:var(--accent)}
.nav{margin-top:6px;font-size:.8rem;color:var(--muted)}
.nav a{color:var(--muted);text-decoration:none;margin-right:14px}
.nav a:hover{color:var(--accent)}
.wrap{max-width:780px;margin:0 auto;padding:36px 24px 70px}
.wide{max-width:1080px}
h1{font-size:1.9rem;line-height:1.25;font-weight:600;letter-spacing:-.4px;margin-bottom:10px}
h2{font-size:.78rem;text-transform:uppercase;letter-spacing:1.8px;color:var(--muted);margin:40px 0 14px;padding-bottom:9px;border-bottom:1px solid var(--border)}
.sub{color:var(--accent2);font-size:1rem;margin-bottom:4px}
.meta{color:var(--muted);font-size:.88rem;margin-bottom:20px}
.tag{display:inline-block;padding:2px 10px;border-radius:11px;font-size:.68rem;font-weight:700;letter-spacing:.5px;margin-left:8px;vertical-align:2px}
.tag.on{background:rgba(127,185,138,.15);color:var(--green)}
.tag.off{background:rgba(154,154,166,.15);color:var(--muted)}
.tag.soon{background:rgba(232,193,90,.16);color:var(--accent)}
p.txt{margin:14px 0;font-size:1.02rem}
.box{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin:18px 0}
.box dl{display:grid;grid-template-columns:130px 1fr;gap:8px 14px;font-size:.92rem}
.box dt{color:var(--muted)}
.btns{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}
.btn{background:var(--panel2);border:1px solid var(--border);color:var(--blue);border-radius:14px;padding:6px 14px;font-size:.83rem;text-decoration:none}
.btn:hover{border-color:var(--blue)}
ul.lista{list-style:none;display:flex;flex-direction:column;gap:12px}
ul.lista li{background:var(--panel);border:1px solid var(--border);border-left:3px solid var(--border);border-radius:11px;padding:14px 16px}
ul.lista li.on{border-left-color:var(--green)}
ul.lista li.soon{border-left-color:var(--accent)}
ul.lista li a.t{color:var(--text);font-weight:600;font-size:1.02rem;text-decoration:none}
ul.lista li a.t:hover{color:var(--accent)}
ul.lista li .l2{color:var(--accent2);font-size:.86rem;margin-top:3px}
ul.lista li .l3{color:var(--muted);font-size:.8rem;margin-top:3px}
.grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.grid2 a{display:block;background:var(--panel);border:1px solid var(--border);border-radius:11px;padding:13px 15px;text-decoration:none;color:var(--text)}
.grid2 a:hover{border-color:var(--accent)}
.grid2 a small{display:block;color:var(--muted);font-size:.76rem;margin-top:3px}
.busca{width:100%;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:22px;padding:10px 18px;font-size:.95rem;margin-bottom:18px}
.busca:focus{outline:none;border-color:var(--accent)}
footer{border-top:1px solid var(--border);margin-top:50px;padding-top:20px;color:var(--muted);font-size:.78rem;line-height:1.7}
footer a{color:var(--accent2)}
@media(max-width:600px){.wrap{padding:26px 18px 60px}h1{font-size:1.5rem}.box dl{grid-template-columns:1fr;gap:2px 0}.box dt{margin-top:8px}}
/* ===== TOKENS ===== */
:root{--font:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Inter,sans-serif;--radius:16px;--radius-sm:10px;--bw:1px;--ls:0px;--onaccent:#0a0a0d}
body,button,input,select,textarea,.btn{font-family:var(--font);letter-spacing:var(--ls)}
.box,ul.lista li,.grid2 a{border-radius:var(--radius)}
.box,.grid2 a{border-width:var(--bw)}
.btn,.busca{border-radius:calc(var(--radius) + 6px);border-width:var(--bw)}
.tag{border-radius:var(--radius-sm)}
/* ===== VIDRO ===== */
.box,ul.lista li,.grid2 a{background:var(--glass);border:1px solid var(--line);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);box-shadow:0 1px 0 rgba(255,255,255,.06) inset,0 12px 32px -18px rgba(0,0,0,.9)}
ul.lista li:hover,.grid2 a:hover{background:var(--glass2);border-color:var(--line2);transform:translateY(-2px)}
ul.lista li,.grid2 a{transition:.2s}
.top{background:rgba(10,10,13,.62);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border-bottom:1px solid var(--hair);position:sticky;top:0;z-index:60}
.btn,.busca{background:var(--glass2);border:1px solid var(--line);color:var(--text2);transition:.18s}
.btn:hover{border-color:var(--accent);color:var(--accent);background:rgba(232,193,90,.09)}
.busca:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 4px rgba(232,193,90,.10)}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}

`;

function pagina({ titulo, desc, canonical, corpo, jsonld, wide }) {
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
<meta property="og:type" content="article">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="${SITE}/icon-192.png">
<style>${CSS}</style>
<link rel="stylesheet" href="${SITE}/temporada.css">
<script data-goatcounter="https://vernissages.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</scr`+`ipt>` : ''}
</head>
<body>
<div class="top">
<a href="${SITE}/">VERNISSAGES <span>SP</span></a>
<div class="nav">
<a href="${SITE}/">Agenda</a><a href="${SITE}/fim-de-semana.html">Fim de semana</a><a href="${SITE}/monta-meu-sabado.html">Monta seu sábado</a><a href="${SITE}/arquivo.html">Acervo</a><a href="${SITE}/artistas.html">Artistas</a><a href="${SITE}/editais.html">Editais</a>
</div>
</div>
<div class="wrap${wide ? ' wide' : ''}">
${corpo}
<footer>
Vernissages SP — mapa vivo das galerias e aberturas de São Paulo, atualizado diariamente.<br>
Datas conforme divulgação dos espaços; confirme antes de visitar. <a href="${SITE}/">Voltar à agenda</a> · <a href="https://instagram.com/vernissagessp" target="_blank" rel="noopener">Instagram</a>
</footer>
</div>
</body>
</html>`;
}

/* ---------- estado da mostra ---------- */
function estado(e) {
  if (e.ini > HOJE) return { k: 'soon', txt: 'ABRE EM BREVE' };
  if (e.fim && e.fim < HOJE) return { k: 'off', txt: 'ENCERRADA' };
  return { k: 'on', txt: 'EM CARTAZ' };
}

/* ---------- páginas de exposição ---------- */
function paginaExpo(e, acervo) {
  const st = estado(e);
  const arts = artistasDe(e);
  const periodo = e.fim
    ? `${dataLonga(e.ini)} a ${dataLonga(e.fim)}`
    : `a partir de ${dataLonga(e.ini)}`;
  const desc = corta(`${e.t}${arts.length ? ' — ' + arts.join(', ') : ''} na ${e.v} (${e.bairro}, São Paulo). ${periodo}.${e.d ? ' ' + e.d : ''}`, 165);

  const corpo = `
<h1>${esc(e.t)}<span class="tag ${st.k}">${st.txt}</span></h1>
${arts.length ? `<div class="sub">${arts.map(n => `<a href="${SITE}/a/${slug(n)}.html">${esc(n)}</a>`).join(' · ')}</div>` : ''}
<div class="meta">${esc(e.v)} · ${esc(e.bairro)} · Zona ${esc(e.zona)}</div>
${e.d ? `<p class="txt">${esc(e.d)}</p>` : ''}
<div class="box">
<dl>
<dt>Período</dt><dd>${periodo}</dd>
<dt>Espaço</dt><dd>${esc(e.v)}${e.tipo ? ` <span style="color:var(--muted)">(${esc(e.tipo)})</span>` : ''}</dd>
<dt>Endereço</dt><dd>${esc(e.addr)} — ${esc(e.bairro)}, São Paulo</dd>
${arts.length ? `<dt>Artista${arts.length > 1 ? 's' : ''}</dt><dd>${arts.map(n => `<a href="${SITE}/a/${slug(n)}.html">${esc(n)}</a>`).join(', ')}</dd>` : ''}
</dl>
</div>
<div class="btns">
${e.site ? `<a class="btn" href="${esc(e.site)}" target="_blank" rel="noopener">Site do espaço</a>` : ''}
${e.ig ? `<a class="btn" href="https://instagram.com/${esc(e.ig)}" target="_blank" rel="noopener">Instagram</a>` : ''}
<a class="btn" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(e.v + ', ' + String(e.addr).replace(' ~', '') + ', São Paulo')}" target="_blank" rel="noopener">Como chegar</a>
<a class="btn" href="${SITE}/">Ver agenda atual</a>
</div>`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'ExhibitionEvent',
    name: e.t,
    startDate: e.ini,
    ...(e.fim ? { endDate: e.fim } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: e.d || desc,
    url: `${SITE}/m/${e.id}.html`,
    location: {
      '@type': 'Place', name: e.v,
      address: { '@type': 'PostalAddress', streetAddress: String(e.addr).replace(' ~', ''), addressLocality: 'São Paulo', addressRegion: 'SP', addressCountry: 'BR' }
    },
    ...(arts.length ? { performer: arts.map(n => ({ '@type': 'Person', name: n })) } : {})
  };

  return pagina({
    titulo: `${corta(e.t, 58)} — ${e.v} | Vernissages SP`,
    desc, canonical: `${SITE}/m/${e.id}.html`, corpo, jsonld
  });
}

/* ---------- páginas de artista ---------- */
function paginaArtista(k, at, porId) {
  const ms = at.mostras.map(id => porId[id]).filter(Boolean)
    .sort((a, b) => (b.ini || '').localeCompare(a.ini || ''));
  const espacos = [...new Set(ms.map(m => m.v))];
  const desc = corta(`${at.nome} em São Paulo: ${ms.length} exposição(ões) registrada(s)${espacos.length ? ' em ' + espacos.slice(0, 3).join(', ') : ''}. Histórico de mostras, datas e galerias.`, 165);

  const corpo = `
<h1>${esc(at.nome)}</h1>
<div class="meta">${ms.length} mostra${ms.length > 1 ? 's' : ''} no acervo${espacos.length ? ` · ${espacos.length} espaço${espacos.length > 1 ? 's' : ''}` : ''}</div>
<h2>Exposições registradas</h2>
<ul class="lista">
${ms.map(m => { const st = estado(m); return `<li class="${st.k}">
<a class="t" href="${SITE}/m/${m.id}.html">${esc(m.t)}</a>
<div class="l2">${esc(m.v)} · ${esc(m.bairro)}</div>
<div class="l3">${dataBR(m.ini)}${m.fim ? ' — ' + dataBR(m.fim) : ''} · ${st.txt.toLowerCase()}</div>
</li>`; }).join('\n')}
</ul>
<div class="btns">
<a class="btn" href="https://www.google.com/search?q=${encodeURIComponent(at.nome + ' artista')}" target="_blank" rel="noopener">Buscar no Google</a>
<a class="btn" href="${SITE}/artistas.html">Todos os artistas</a>
</div>`;

  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Person', name: at.nome,
    url: `${SITE}/a/${k}.html`, jobTitle: 'Artista visual',
    ...(ms.length ? { performerIn: ms.slice(0, 20).map(m => ({ '@type': 'ExhibitionEvent', name: m.t, startDate: m.ini, url: `${SITE}/m/${m.id}.html` })) } : {})
  };

  return pagina({ titulo: `${at.nome} — exposições em São Paulo | Vernissages SP`, desc, canonical: `${SITE}/a/${k}.html`, corpo, jsonld });
}

/* ---------- índices ---------- */
function paginaArquivo(expos) {
  const ord = [...expos].sort((a, b) => (b.ini || '').localeCompare(a.ini || ''));
  const porAno = {};
  ord.forEach(e => { const y = (e.ini || '').slice(0, 4) || 's/data'; (porAno[y] = porAno[y] || []).push(e); });
  const anos = Object.keys(porAno).sort().reverse();

  const corpo = `
<h1>Acervo de exposições</h1>
<p class="txt">Todas as mostras que passaram pela agenda do Vernissages SP — em cartaz e encerradas. ${expos.length} registros.</p>
<input class="busca" id="q" type="text" placeholder="Filtrar por título, artista, galeria ou bairro…">
${anos.map(y => `<h2 id="ano-${y}">${y} · ${porAno[y].length} mostras</h2>
<ul class="lista">
${porAno[y].map(e => { const st = estado(e); return `<li class="${st.k}" data-b="${esc((e.t + ' ' + e.a + ' ' + e.v + ' ' + e.bairro).toLowerCase())}">
<a class="t" href="${SITE}/m/${e.id}.html">${esc(e.t)}</a>
<div class="l2">${esc(e.v)} · ${esc(e.bairro)}</div>
<div class="l3">${dataBR(e.ini)}${e.fim ? ' — ' + dataBR(e.fim) : ''} · ${st.txt.toLowerCase()}</div>
</li>`; }).join('\n')}
</ul>`).join('\n')}
<scr`+`ipt>
document.getElementById('q').addEventListener('input',function(){
var q=this.value.toLowerCase().trim();
document.querySelectorAll('ul.lista li').forEach(function(li){
li.style.display=!q||li.dataset.b.indexOf(q)>-1?'':'none';});
document.querySelectorAll('h2[id^=ano-]').forEach(function(h){
var ul=h.nextElementSibling,vis=[].slice.call(ul.children).some(function(li){return li.style.display!=='none'});
h.style.display=vis?'':'none';ul.style.display=vis?'':'none';});
});
</scr`+`ipt>`;
  return pagina({
    titulo: 'Acervo de exposições em São Paulo | Vernissages SP',
    desc: `Arquivo histórico com ${expos.length} exposições de galerias e museus de São Paulo: título, artistas, espaço, bairro e período.`,
    canonical: `${SITE}/arquivo.html`, corpo, wide: true
  });
}

function paginaArtistas(artistas) {
  const ks = Object.keys(artistas).sort((a, b) => artistas[a].nome.localeCompare(artistas[b].nome, 'pt'));
  const corpo = `
<h1>Artistas no acervo</h1>
<p class="txt">${ks.length} artistas com exposições registradas em São Paulo.</p>
<input class="busca" id="q" type="text" placeholder="Buscar artista…">
<div class="grid2" id="g">
${ks.map(k => `<a href="${SITE}/a/${k}.html" data-b="${esc(artistas[k].nome.toLowerCase())}">${esc(artistas[k].nome)}<small>${artistas[k].mostras.length} mostra${artistas[k].mostras.length > 1 ? 's' : ''}</small></a>`).join('\n')}
</div>
<scr`+`ipt>
document.getElementById('q').addEventListener('input',function(){
var q=this.value.toLowerCase().trim();
document.querySelectorAll('#g a').forEach(function(a){a.style.display=!q||a.dataset.b.indexOf(q)>-1?'':'none';});
});
</scr`+`ipt>`;
  return pagina({
    titulo: 'Artistas com exposições em São Paulo | Vernissages SP',
    desc: `Índice de ${ks.length} artistas com mostras em galerias e museus de São Paulo, com histórico de exposições.`,
    canonical: `${SITE}/artistas.html`, corpo, wide: true
  });
}

/* ---------- editais e chamadas ---------- */
const CAT_EDITAL = { fomento: 'Fomento público', residencia: 'Residência', premio: 'Prêmio', chamada: 'Chamada aberta' };

function estadoEdital(ed) {
  if (!ed.prazo) return { k: 'soon', txt: 'FLUXO CONTÍNUO' };
  if (ed.prazo < HOJE) return { k: 'off', txt: 'ENCERRADO' };
  const dias = Math.round((new Date(ed.prazo) - new Date(HOJE)) / 864e5);
  if (dias === 0) return { k: 'soon', txt: 'ÚLTIMO DIA' };
  if (dias <= 7) return { k: 'soon', txt: 'FALTAM ' + dias + ' DIA' + (dias > 1 ? 'S' : '') };
  return { k: 'on', txt: 'ABERTO' };
}

function paginaEditais(editais) {
  const peso = e => (!e.prazo ? 1 : (e.prazo >= HOJE ? 0 : 2));
  const ord = [...editais].sort((a, b) => peso(a) - peso(b) || (a.prazo || '9999').localeCompare(b.prazo || '9999'));
  const abertos = ord.filter(e => peso(e) < 2);

  const item = ed => {
    const st = estadoEdital(ed);
    const busca = [ed.t, ed.org, CAT_EDITAL[ed.cat] || ed.cat, ed.quem, ed.onde, ed.d].join(' ').toLowerCase();
    return `<li class="${st.k}" data-b="${esc(busca)}">
<a class="t" href="${esc(ed.link || '#')}" target="_blank" rel="noopener">${esc(ed.t)}</a><span class="tag ${st.k}">${st.txt}</span>
<div class="l2">${esc(ed.org || '')}${ed.cat ? ' · ' + esc(CAT_EDITAL[ed.cat] || ed.cat) : ''}</div>
<div class="l3">${ed.prazo ? 'Inscrições até ' + dataLonga(ed.prazo) : 'Fluxo contínuo — sem data de encerramento divulgada'}${ed.valor ? ' · ' + esc(ed.valor) : ''}${ed.taxa ? ' · inscrição ' + esc(ed.taxa) : ''}</div>
${ed.d ? `<div class="l3">${esc(ed.d)}</div>` : ''}
<div class="l3" style="opacity:.7">${ed.quem ? 'Quem pode se inscrever: ' + esc(ed.quem) + ' · ' : ''}${ed.onde ? 'Abrangência: ' + esc(ed.onde) + ' · ' : ''}${ed.fonte ? 'Fonte: ' + esc(ed.fonte) : ''}</div>
</li>`;
  };

  const corpo = `
<h1>Editais e chamadas abertas</h1>
<p class="txt">Oportunidades para artistas visuais, curadores e coletivos com atuação em São Paulo: chamadas de galerias e museus, residências, prêmios e editais públicos de fomento. ${abertos.length} com inscrição aberta hoje.</p>
<p class="txt" style="color:var(--muted);font-size:.92rem">Só entra aqui edital com prazo confirmado na fonte oficial. Ainda assim, leia o regulamento no site do organizador antes de se inscrever — prorrogações e mudanças de prazo são comuns.</p>
<input class="busca" id="q" type="text" placeholder="Filtrar por título, organizador, tipo ou público…">
${ord.length ? `<ul class="lista">
${ord.map(item).join('\n')}
</ul>` : '<p class="txt">Nenhum edital cadastrado no momento.</p>'}
<div class="btns">
<a class="btn" href="${SITE}/">Ver agenda de aberturas</a>
<a class="btn" href="${SITE}/arquivo.html">Acervo de exposições</a>
</div>
<scr`+`ipt>
document.getElementById('q').addEventListener('input',function(){
var q=this.value.toLowerCase().trim();
document.querySelectorAll('ul.lista li').forEach(function(li){
li.style.display=!q||li.dataset.b.indexOf(q)>-1?'':'none';});
});
</scr`+`ipt>`;

  return pagina({
    titulo: 'Editais e chamadas abertas para artistas em São Paulo | Vernissages SP',
    desc: `${abertos.length} editais, residências, prêmios e chamadas com inscrição aberta para artistas visuais, curadores e coletivos em São Paulo. Prazos, quem pode se inscrever e link oficial.`,
    canonical: `${SITE}/editais.html`, corpo, wide: true
  });
}

/* ---------- o fim de semana ----------
   A agenda do carrossel de quinta (agenda.js), só que viva e com mapa: o que
   abre, o que está nos últimos dias e o resto em cartaz, para o sábado e o
   domingo que vêm. É o link da bio e mira a busca "exposições em SP este fim
   de semana". Regenera todo dia com o build (14:00 UTC), então a janela anda
   sozinha. */
const DSEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const somaDias = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const dow = iso => new Date(iso + 'T12:00:00Z').getUTCDay();
const diaCurto = iso => `${DSEM[dow(iso)]} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

function janelaFds(hoje) {
  const domingo = somaDias(hoje, (7 - dow(hoje)) % 7);
  return { de: hoje, sabado: somaDias(domingo, -1), domingo };
}

/* Horário de sábado e domingo, quando a base diz ("sábado, 10h–17h",
   "Quarta a domingo, 11h–18h"). Procura na mostra e depois na casa; se não
   achar, não inventa. */
function horaFds(e, v) {
  const H = '(\\d{1,2}h(?:\\d{2})?\\s*[–-]\\s*\\d{1,2}h(?:\\d{2})?)';
  const out = [];
  [['sáb', 's[áa]bados?'], ['dom', 'domingos?']].forEach(([lab, pal]) => {
    const rx = new RegExp(pal + ',?\\s*(?:das\\s*)?' + H, 'i');
    const m = String(e.d || '').match(rx) || String(v.info || '').match(rx);
    if (m) out.push(lab + ' ' + m[1].replace(/\s/g, ''));
  });
  return out.join(' · ');
}

function paginaFimDeSemana(DATA) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const J = janelaFds(HOJE);
  const semanaAtras = somaDias(HOJE, -6), fechaAte = somaDias(J.domingo, 2);
  const abre = [], fecha = [], cartaz = [];
  (DATA.expos || []).forEach(e => {
    const v = V[e.v];
    if (!v || !e.ini || e.ini > J.domingo) return;
    if (e.fim && e.fim < HOJE) return;
    /* Mesma régua do rodapé do site (ingressoDe/ingTag no index.html): `ing`
       explícito manda; sem ele, galeria comercial é sempre entrada franca. */
    const gratis = v.ing ? !!v.ing.g : v.tipo === 'galeria';
    const x = { e, v, id: slug(e.t) + '--' + slug(e.v), gratis, hora: horaFds(e, v) };
    if (e.ini >= semanaAtras) abre.push(x);
    else if (e.fim && e.fim <= fechaAte) fecha.push(x);
    else if (!e.fim || e.fim >= J.sabado) cartaz.push(x);
  });
  abre.sort((a, b) => a.e.ini.localeCompare(b.e.ini));
  fecha.sort((a, b) => a.e.fim.localeCompare(b.e.fim));
  const ZONAS = ['Centro', 'Oeste', 'Sul', 'Norte', 'Leste'];
  cartaz.sort((a, b) => (ZONAS.indexOf(a.v.z) - ZONAS.indexOf(b.v.z)) || a.v.b.localeCompare(b.v.b, 'pt') || a.v.name.localeCompare(b.v.name, 'pt'));

  const quando = x => x.e.ini >= HOJE ? `abre ${diaCurto(x.e.ini)}`
    : x.e.ini >= semanaAtras ? `abriu ${diaCurto(x.e.ini)}`
    : x.e.fim ? `até ${diaCurto(x.e.fim)}` : 'sem data de fim';
  const card = (x, k) => `<li class="${k}" data-lat="${x.v.lat || ''}">
${x.e.img ? `<a class="th" href="${SITE}/m/${x.id}.html"><img src="${SITE}/${esc(x.e.img)}" alt="${esc(x.e.t)}" loading="lazy"></a>` : ''}
<div class="tx">
<div class="qd">${k === 'fecha' ? `último dia ${diaCurto(x.e.fim)}` : quando(x)}${x.gratis ? '<span class="tag on">GRÁTIS</span>' : ''}</div>
<a class="t" href="${SITE}/m/${x.id}.html">${esc(x.e.t)}</a>
<div class="l2">${esc(x.v.name)} · ${esc(x.v.b)}</div>
${x.hora ? `<div class="l3">${esc(x.hora)}</div>` : ''}
</div>
</li>`;
  const linha = x => `<li><a href="${SITE}/m/${x.id}.html">${esc(x.e.t)}</a> <span>${esc(x.v.name)} · ${esc(x.v.b)}${x.gratis ? ' · grátis' : ''}${x.e.fim ? ' · até ' + dataBR(x.e.fim).slice(0, 5) : ''}</span></li>`;
  const porZona = {}; cartaz.forEach(x => (porZona[x.v.z] = porZona[x.v.z] || []).push(x));

  const pinos = [...abre.map(x => [x, 'abre']), ...fecha.map(x => [x, 'fecha']), ...cartaz.map(x => [x, 'cartaz'])]
    .filter(([x]) => x.v.lat && x.v.lng)
    .map(([x, k]) => ({ la: x.v.lat, ln: x.v.lng, k, t: x.e.t, v: x.v.name, u: `${SITE}/m/${x.id}.html` }));
  const nGratis = [...abre, ...fecha, ...cartaz].filter(x => x.gratis).length;
  const fds = `${J.sabado.slice(8, 10)} e ${J.domingo.slice(8, 10)}/${J.domingo.slice(5, 7)}`;

  const corpo = `
<style>
.fds-conta{display:flex;gap:34px;flex-wrap:wrap;margin:22px 0 6px}
.fds-conta b{display:block;font-size:2.3rem;font-weight:800;line-height:1;letter-spacing:-1px}
.fds-conta span{font-size:.72rem;text-transform:uppercase;letter-spacing:1.6px;color:var(--muted)}
.fds-conta .ab b{color:var(--accent2)}
#mapa{height:360px;border-radius:var(--radius);border:1px solid var(--line);margin:22px 0 4px;background:#101015}
.leg{font-size:.76rem;color:var(--muted);display:flex;gap:16px;flex-wrap:wrap}
.leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:-1px}
ul.lista li{display:flex;gap:14px;align-items:flex-start}
ul.lista li.abre{border-left-color:var(--accent2)}
ul.lista li.fecha{border-left-color:var(--ink)}
ul.lista .th{flex:none;width:92px;height:92px;border-radius:var(--radius-sm);overflow:hidden;background:#111}
ul.lista .th img{width:100%;height:100%;object-fit:cover;display:block}
ul.lista .tx{flex:1;min-width:0}
.qd{font-size:.72rem;text-transform:uppercase;letter-spacing:1.4px;color:var(--accent2);font-weight:700;margin-bottom:3px}
li.fecha .qd{color:var(--ink)}
.qd .tag{margin-left:8px}
ul.mini{list-style:none;font-size:.9rem}
ul.mini li{padding:8px 0;border-bottom:1px solid var(--hair)}
ul.mini a{color:var(--text);text-decoration:none;font-weight:500}
ul.mini a:hover{color:var(--accent)}
ul.mini span{color:var(--muted);font-size:.8rem}
h3.zona{font-size:.8rem;color:var(--accent2);letter-spacing:1.4px;text-transform:uppercase;margin:22px 0 4px}
.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:rgba(20,20,26,.95);color:var(--ink)}
.leaflet-popup-content{font-size:.82rem;line-height:1.5}
.leaflet-popup-content a{color:var(--accent);text-decoration:none}
</style>
<h1>Exposições em São Paulo neste fim de semana</h1>
<div class="sub">sábado e domingo, ${fds}</div>
<p class="txt">O que abre, o que está nos últimos dias e o que segue em cartaz nas galerias e museus de São Paulo — num lugar só, para montar o sábado e mandar para quem vai com você.</p>
<div class="fds-conta">
<div class="ab"><b>${abre.length}</b><span>${abre.length === 1 ? 'abertura na semana' : 'aberturas na semana'}</span></div>
<div><b>${fecha.length}</b><span>${fecha.length === 1 ? 'última chance' : 'últimas chances'}</span></div>
<div><b>${abre.length + fecha.length + cartaz.length}</b><span>em cartaz</span></div>
${nGratis ? `<div><b>${nGratis}</b><span>de graça</span></div>` : ''}
</div>
<div id="mapa"></div>
<div class="leg"><span><i style="background:#c96f4a"></i>abre</span><span><i style="background:#f3f3f7"></i>últimos dias</span><span><i style="background:#6b6b78"></i>em cartaz</span></div>
${abre.length ? `<h2>Abre · aberturas da semana</h2>
<ul class="lista">
${abre.map(x => card(x, 'abre')).join('\n')}
</ul>` : ''}
${fecha.length ? `<h2>Últimos dias · fecha até ${diaCurto(fechaAte)}</h2>
<ul class="lista">
${fecha.map(x => card(x, 'fecha')).join('\n')}
</ul>` : ''}
${cartaz.length ? `<h2>Também em cartaz · ${cartaz.length} mostras</h2>
${ZONAS.filter(z => porZona[z]).map(z => `<h3 class="zona">Zona ${esc(z)}</h3>
<ul class="mini">
${porZona[z].map(linha).join('\n')}
</ul>`).join('\n')}` : ''}
<p class="txt" style="color:var(--muted);font-size:.86rem">Horários conforme divulgação de cada espaço — muita galeria fecha no domingo; confirme antes de sair. Atualizado em ${dataBR(HOJE)}.</p>
<div class="btns">
<a class="btn" href="${SITE}/">Agenda completa e mapa</a>
<a class="btn" href="https://instagram.com/vernissagessp" target="_blank" rel="noopener">@vernissagessp</a>
</div>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
<scr`+`ipt src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></scr`+`ipt>
<scr`+`ipt>
(function(){
var P=${JSON.stringify(pinos).replace(/</g, '\\u003c')};
var el=document.getElementById('mapa');
if(typeof L==='undefined'||!P.length){el.style.display='none';el.nextElementSibling.style.display='none';return;}
var m=L.map(el,{scrollWheelZoom:false});
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{attribution:'Esri, HERE, Garmin, © OpenStreetMap contributors',maxZoom:16}).addTo(m);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',{maxZoom:16}).addTo(m);
var C={abre:['#c96f4a',8],fecha:['#f3f3f7',7],cartaz:['#6b6b78',5]},b=[];
function e(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
['cartaz','fecha','abre'].forEach(function(k){P.filter(function(p){return p.k===k}).forEach(function(p){
L.circleMarker([p.la,p.ln],{radius:C[k][1],color:'#0a0a0d',weight:1.5,fillColor:C[k][0],fillOpacity:.95})
.bindPopup('<b>'+e(p.t)+'</b><br>'+e(p.v)+'<br><a href="'+e(p.u)+'">ver a mostra →</a>').addTo(m);
if(k!=='cartaz')b.push([p.la,p.ln]);});});
if(b.length<2)b=P.map(function(p){return[p.la,p.ln]});
m.fitBounds(b,{padding:[30,30],maxZoom:14});
})();
</scr`+`ipt>`;

  const lista = [...abre, ...fecha];
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: `Exposições em São Paulo no fim de semana de ${fds}`,
    itemListElement: lista.map((x, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: {
        '@type': 'ExhibitionEvent', name: x.e.t, startDate: x.e.ini, ...(x.e.fim ? { endDate: x.e.fim } : {}),
        url: `${SITE}/m/${x.id}.html`,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: x.v.name, address: { '@type': 'PostalAddress', streetAddress: String(x.v.addr).replace(' ~', ''), addressLocality: 'São Paulo', addressRegion: 'SP', addressCountry: 'BR' } }
      }
    }))
  };

  return pagina({
    titulo: `Exposições em SP neste fim de semana (${fds}) | Vernissages SP`,
    desc: `Arte em São Paulo no fim de semana de ${fds}: ${abre.length} aberturas, ${fecha.length} mostras nos últimos dias e ${abre.length + fecha.length + cartaz.length} em cartaz${nGratis ? `, ${nGratis} de graça` : ''}. Com mapa, horários e endereços.`,
    canonical: `${SITE}/fim-de-semana.html`, corpo, jsonld
  });
}

/* ---------- monta meu sábado ----------
   A pessoa escolhe um bairro (agrupado como no rodapé — "Jardins" é o
   circuito, não o bairro do IBGE) e quanto tempo tem, e a página monta um
   roteiro a pé: o motor da deriva.js (haversine + a melhor ordem por força
   bruta, até 6 paradas) virando ferramenta em vez de peça de Instagram. Tudo
   roda no navegador da pessoa a partir do dados.js já carregado — sem
   depender de mais nenhum arquivo gerado, então nunca fica velho. */
function paginaMontaMeuSabado() {
  const corpo = `
<style>
.mms-form{display:grid;gap:16px;margin:22px 0 8px;max-width:420px}
.mms-campo label{display:block;font-size:.78rem;text-transform:uppercase;letter-spacing:1.4px;color:var(--muted);margin-bottom:6px}
.mms-campo select{width:100%;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:12px;padding:10px 14px;font-size:.95rem}
.mms-campo select:focus{outline:none;border-color:var(--accent)}
.mms-campo select option{background:#15151a;color:#f3f3f7}
#mms-ir{background:var(--accent);color:var(--onaccent);border:none;border-radius:22px;padding:11px 22px;font-size:.92rem;font-weight:700;cursor:pointer;justify-self:start}
#mms-ir:hover{opacity:.9}
#mms-aviso{display:none;color:var(--accent2);font-size:.9rem;margin:14px 0}
#mms-resultado{display:none;margin-top:32px}
#mms-mapa{height:340px;border-radius:var(--radius);border:1px solid var(--line);margin:16px 0;background:#101015}
.mms-conta{display:flex;gap:30px;flex-wrap:wrap;margin:18px 0 4px}
.mms-conta b{display:block;font-size:1.9rem;font-weight:800;letter-spacing:-1px;color:var(--accent2)}
.mms-conta span{font-size:.7rem;text-transform:uppercase;letter-spacing:1.4px;color:var(--muted)}
ul.mms-lista{list-style:none;display:flex;flex-direction:column;gap:10px;margin-top:14px}
ul.mms-lista li{display:flex;gap:14px;align-items:flex-start;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:13px 15px}
ul.mms-lista .k{flex:none;width:28px;height:28px;border-radius:50%;background:var(--accent);color:var(--onaccent);font-weight:800;font-size:.85rem;display:flex;align-items:center;justify-content:center}
ul.mms-lista .tx a{color:var(--text);font-weight:600;text-decoration:none}
ul.mms-lista .tx a:hover{color:var(--accent)}
ul.mms-lista .l2{color:var(--accent2);font-size:.84rem;margin-top:2px}
ul.mms-lista .l3{color:var(--muted);font-size:.78rem;margin-top:2px}
#mms-zap{margin-top:18px}
</style>
<h1>Monta seu sábado</h1>
<p class="txt">Escolhe um bairro e quanto tempo você tem — a página monta um roteiro a pé entre as mostras em cartaz, na ordem mais curta possível, com mapa e distância.</p>
<form class="mms-form" id="mms-form">
<div class="mms-campo"><label for="mms-bairro">Bairro</label><select id="mms-bairro" required><option value="">Escolha…</option></select></div>
<div class="mms-campo"><label for="mms-tempo">Tempo disponível</label>
<select id="mms-tempo">
<option value="2">Só de passagem (2 paradas)</option>
<option value="4" selected>Uma tarde (4 paradas)</option>
<option value="6">O sábado inteiro (6 paradas)</option>
</select></div>
<button id="mms-ir" type="submit">Montar roteiro</button>
</form>
<p id="mms-aviso"></p>
<div id="mms-resultado">
<div class="mms-conta">
<div><b id="mms-n"></b><span>paradas</span></div>
<div><b id="mms-km"></b><span>km a pé</span></div>
<div><b id="mms-min"></b><span>min andando</span></div>
</div>
<div id="mms-mapa"></div>
<ul class="mms-lista" id="mms-listaparadas"></ul>
<a class="btn" id="mms-zap" href="#" target="_blank" rel="noopener">Mandar no WhatsApp</a>
<p class="txt" style="color:var(--muted);font-size:.86rem;margin-top:18px">Distância em linha reta entre as casas — a calçada é um pouco mais longa. Confira o horário de cada espaço antes de sair.</p>
</div>
<noscript><p class="txt">Esta ferramenta precisa de JavaScript pra montar o roteiro.</p></noscript>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
<scr`+`ipt src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></scr`+`ipt>
<scr`+`ipt src="dados.js"></scr`+`ipt>
<scr`+`ipt>
(function(){
if(!window.DATA||!window.DATA.venues){return;}
var TODAY=new Date();
var HOJESTR=new Date(TODAY.getTime()-TODAY.getTimezoneOffset()*6e4).toISOString().slice(0,10);
var VENUES=window.DATA.venues, EXPOS=window.DATA.expos;
var GRUPO_BAIRRO=window.DATA.grupoBairro||{};
function bairroLabel(v){return GRUPO_BAIRRO[v.b]||v.b;}
var vByName={}; VENUES.forEach(function(v){vByName[v.name]=v;});
function slug(s){return String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')
  .toLowerCase().replace(/&/g,' e ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+\$/g,'').slice(0,80);}

var porVenue={};
EXPOS.forEach(function(e){
  var v=vByName[e.v];
  if(!v||typeof v.lat!=='number')return;
  if(!e.ini||e.ini>HOJESTR)return;
  if(e.fim&&e.fim<HOJESTR)return;
  var atual=porVenue[e.v];
  if(!atual||(e.d||'').length>(atual.e.d||'').length) porVenue[e.v]={e:e,v:v};
});
var candidatos=Object.keys(porVenue).map(function(k){return porVenue[k];});

var porGrupo={};
candidatos.forEach(function(c){var g=bairroLabel(c.v);(porGrupo[g]=porGrupo[g]||[]).push(c);});
var grupos=Object.keys(porGrupo).filter(function(g){return porGrupo[g].length>=2;})
  .sort(function(a,b){return porGrupo[b].length-porGrupo[a].length||a.localeCompare(b,'pt');});

var selBairro=document.getElementById('mms-bairro');
var aviso=document.getElementById('mms-aviso');
if(!grupos.length){
  aviso.textContent='Nenhum bairro com mostras suficientes em cartaz agora pra montar um roteiro.';
  aviso.style.display='block';
  document.getElementById('mms-form').style.display='none';
} else {
  grupos.forEach(function(g){
    var op=document.createElement('option'); op.value=g; op.textContent=g+' ('+porGrupo[g].length+')';
    selBairro.appendChild(op);
  });
}

/* geografia e rota — mesmo motor do deriva.js (SOCIAL) */
function rad(g){return g*Math.PI/180;}
function metros(a,b){
  var R=6371000, dLat=rad(b.lat-a.lat), dLng=rad(b.lng-a.lng);
  var h=Math.pow(Math.sin(dLat/2),2)+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.pow(Math.sin(dLng/2),2);
  return 2*R*Math.asin(Math.sqrt(h));
}
function melhorRota(pontos){
  var n=pontos.length, idx=[]; for(var i=0;i<n;i++)idx.push(i);
  var melhor=null, menor=Infinity;
  (function permutar(atual,resto){
    if(!resto.length){
      var d=0; for(var i=1;i<atual.length;i++) d+=metros(pontos[atual[i-1]],pontos[atual[i]]);
      if(d<menor){menor=d;melhor=atual.slice();}
      return;
    }
    for(var i=0;i<resto.length;i++) permutar(atual.concat(resto[i]), resto.slice(0,i).concat(resto.slice(i+1)));
  })([],idx);
  return {ordem:melhor,total:menor};
}
function apertar(membros,teto){
  var m=membros.slice();
  while(m.length>teto){
    var cx=0,cy=0; m.forEach(function(x){cx+=x.v.lat;cy+=x.v.lng;}); cx/=m.length; cy/=m.length;
    var pior=0,dPior=-1;
    m.forEach(function(x,i){var d=metros(x.v,{lat:cx,lng:cy}); if(d>dPior){dPior=d;pior=i;}});
    m.splice(pior,1);
  }
  return m;
}

var mapaObj=null;
document.getElementById('mms-form').addEventListener('submit',function(ev){
  ev.preventDefault();
  var grupo=selBairro.value, teto=+document.getElementById('mms-tempo').value;
  aviso.style.display='none';
  if(!grupo)return;
  var sel=(porGrupo[grupo]||[]).slice();
  if(sel.length<2){
    aviso.textContent='Poucas mostras por aqui agora — tenta outro bairro.';
    aviso.style.display='block';
    document.getElementById('mms-resultado').style.display='none';
    return;
  }
  if(sel.length>teto) sel=apertar(sel,teto);
  var r=melhorRota(sel.map(function(c){return c.v;}));
  var paradas=r.ordem.map(function(i){return sel[i];});
  desenhar(paradas,r.total);
});

function desenhar(paradas,totalMetros){
  var km=(totalMetros/1000).toFixed(1).replace('.',',');
  var min=Math.round(totalMetros/1.25/60);
  document.getElementById('mms-n').textContent=paradas.length;
  document.getElementById('mms-km').textContent=km;
  document.getElementById('mms-min').textContent=min;

  var ul=document.getElementById('mms-listaparadas'); ul.innerHTML='';
  var zapLinhas=['Meu roteiro em São Paulo:'];
  paradas.forEach(function(p,i){
    var id=slug(p.e.t)+'--'+slug(p.v.name);
    var li=document.createElement('li');
    li.innerHTML='<div class="k">'+(i+1)+'</div><div class="tx">'+
      '<a href="${SITE}/m/'+id+'.html">'+p.e.t.replace(/</g,'&lt;')+'</a>'+
      '<div class="l2">'+p.v.name.replace(/</g,'&lt;')+' · '+p.v.b.replace(/</g,'&lt;')+'</div>'+
      '<div class="l3">'+p.v.addr.replace(/</g,'&lt;').replace(' ~','')+'</div></div>';
    ul.appendChild(li);
    zapLinhas.push((i+1)+'. '+p.v.name+' — '+p.e.t);
  });
  zapLinhas.push('Montado em ${SITE}/monta-meu-sabado.html');
  document.getElementById('mms-zap').href='https://wa.me/?text='+encodeURIComponent(zapLinhas.join('\\n'));

  /* O mapa entra visível ANTES do L.map() inicializar — se o container
     nasce dentro de um ancestral com display:none, o Leaflet mede 0x0 no
     instante da criação e nunca mais acerta o tamanho sozinho (achado
     28/09/2026: mapa em branco na primeira vez que a pessoa monta um
     roteiro, funcionando só a partir da segunda). */
  document.getElementById('mms-resultado').style.display='block';

  var el=document.getElementById('mms-mapa');
  el.style.display='';
  if(typeof L==='undefined'){el.style.display='none';}
  else{
    if(mapaObj){mapaObj.remove();}
    mapaObj=L.map(el,{scrollWheelZoom:false});
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{attribution:'Esri, HERE, Garmin, © OpenStreetMap contributors',maxZoom:16}).addTo(mapaObj);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',{maxZoom:16}).addTo(mapaObj);
    var latlngs=paradas.map(function(p){return [p.v.lat,p.v.lng];});
    L.polyline(latlngs,{color:'#c96f4a',weight:4}).addTo(mapaObj);
    paradas.forEach(function(p,i){
      L.circleMarker([p.v.lat,p.v.lng],{radius:9,color:'#0a0a0d',weight:1.5,fillColor:'#c96f4a',fillOpacity:.95})
        .bindPopup('<b>'+(i+1)+'. '+p.v.name.replace(/</g,'&lt;')+'</b><br>'+p.e.t.replace(/</g,'&lt;'))
        .addTo(mapaObj);
    });
    setTimeout(function(){ mapaObj.invalidateSize(); mapaObj.fitBounds(latlngs,{padding:[36,36],maxZoom:16}); }, 0);
  }
}
})();
</scr`+`ipt>`;

  return pagina({
    titulo: 'Monta seu sábado — roteiro de galerias em São Paulo | Vernissages SP',
    desc: 'Escolha um bairro e o tempo que você tem: a ferramenta monta um roteiro a pé entre as galerias e museus em cartaz em São Paulo, na ordem mais curta, com mapa e distância.',
    canonical: `${SITE}/monta-meu-sabado.html`, corpo
  });
}

/* ---------- execução ---------- */
function main() {
  const DATA = carregarDados();
  const acervo = carregarAcervo();
  const res = mesclarAcervo(acervo, DATA);

  fs.mkdirSync(path.join(RAIZ, 'm'), { recursive: true });
  fs.mkdirSync(path.join(RAIZ, 'a'), { recursive: true });

  const porId = {};
  acervo.expos.forEach(e => porId[e.id] = e);

  acervo.expos.forEach(e => fs.writeFileSync(path.join(RAIZ, 'm', e.id + '.html'), paginaExpo(e, acervo)));
  Object.keys(acervo.artistas).forEach(k => fs.writeFileSync(path.join(RAIZ, 'a', k + '.html'), paginaArtista(k, acervo.artistas[k], porId)));

  fs.writeFileSync(path.join(RAIZ, 'arquivo.html'), paginaArquivo(acervo.expos));
  fs.writeFileSync(path.join(RAIZ, 'artistas.html'), paginaArtistas(acervo.artistas));
  fs.writeFileSync(path.join(RAIZ, 'editais.html'), paginaEditais(DATA.editais || []));
  fs.writeFileSync(path.join(RAIZ, 'fim-de-semana.html'), paginaFimDeSemana(DATA));
  fs.writeFileSync(path.join(RAIZ, 'monta-meu-sabado.html'), paginaMontaMeuSabado());
  fs.writeFileSync(path.join(RAIZ, 'acervo.json'), JSON.stringify(acervo, null, 1));

  const urls = [`${SITE}/`, `${SITE}/fim-de-semana.html`, `${SITE}/monta-meu-sabado.html`, `${SITE}/arquivo.html`, `${SITE}/artistas.html`, `${SITE}/editais.html`]
    .concat(acervo.expos.map(e => `${SITE}/m/${e.id}.html`))
    .concat(Object.keys(acervo.artistas).map(k => `${SITE}/a/${k}.html`));
  fs.writeFileSync(path.join(RAIZ, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `<url><loc>${u}</loc><lastmod>${HOJE}</lastmod></url>`).join('\n') + `\n</urlset>\n`);
  fs.writeFileSync(path.join(RAIZ, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

  console.log(`acervo: ${acervo.expos.length} mostras (${res.novas} novas, ${res.atualizadas} atualizadas) · ${Object.keys(acervo.artistas).length} artistas · ${urls.length} URLs no sitemap`);
}

main();
