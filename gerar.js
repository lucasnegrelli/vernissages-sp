/* ============================================================
   VERNISSAGES SP — GERADOR DE ACERVO E PÁGINAS ESTÁTICAS
   Roda no GitHub Actions a cada push em dados.js (e uma vez por dia).
   Lê dados.js + acervo.json e escreve:
     acervo.json      banco acumulado (nunca perde mostra nem artista)
     m/<slug>.html    uma página por exposição
     a/<slug>.html    uma página por artista
     arquivo.html     índice de todas as mostras (em cartaz + encerradas)
     artistas.html    índice de artistas
     sitemap.xml, robots.txt
   Não depende de nada além do Node.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const RAIZ = process.cwd();
const SITE = 'https://lucasnegrelli.github.io/vernissages-sp';
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
:root{--bg:#0e0e11;--panel:#17171c;--panel2:#1e1e25;--border:#2a2a33;--text:#ececf0;--muted:#9a9aa6;--accent:#e8c15a;--accent2:#c96f4a;--green:#7fb98a;--blue:#7da7d9}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:ui-sans-serif,system-ui,'Segoe UI',Inter,sans-serif;line-height:1.65;font-size:16px;-webkit-font-smoothing:antialiased}
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
/* ===== TEMAS ===== */
:root{--font:ui-sans-serif,system-ui,'Segoe UI',Inter,sans-serif;--radius:12px;--radius-sm:10px;--bw:1px;--ls:0px;--onaccent:#111111}
html[data-tema="cubo"]{--bg:#ffffff;--panel:#fafafa;--panel2:#f1f1f1;--border:#e3e3e3;--text:#111111;--muted:#6b6b6b;--accent:#111111;--accent2:#6d4c1f;--green:#2f7d46;--blue:#2557a7;--onaccent:#ffffff;--font:'Iowan Old Style','Palatino Linotype',Palatino,Georgia,'Times New Roman',serif;--radius:0px;--radius-sm:0px;--bw:1px}
html[data-tema="impresso"]{--bg:#f4f1ea;--panel:#ebe6da;--panel2:#e2dccd;--border:#d6cfc0;--text:#1a1712;--muted:#6f6659;--accent:#8b2f1d;--accent2:#7a5c2e;--green:#3f6b46;--blue:#2f5d7a;--onaccent:#f4f1ea;--font:'Iowan Old Style','Palatino Linotype',Palatino,Georgia,'Times New Roman',serif;--radius:0px;--radius-sm:0px;--bw:1px}
html[data-tema="neon"]{--bg:#07060d;--panel:#12101f;--panel2:#191531;--border:#3a2a6b;--text:#f0edff;--muted:#9d92c9;--accent:#ff2e88;--accent2:#00e5ff;--green:#4dffb8;--blue:#6ea8ff;--onaccent:#07060d;--font:'Archivo Narrow','Roboto Condensed','Arial Narrow',ui-sans-serif,system-ui,sans-serif;--radius:4px;--radius-sm:3px;--bw:1px;--ls:.4px}
html[data-tema="terminal"]{--bg:#0a0a0a;--panel:#0d0d0d;--panel2:#111111;--border:#00ff41;--text:#d7ffd9;--muted:#4f9f5e;--accent:#00ff41;--accent2:#ffffff;--green:#00ff41;--blue:#66ccff;--onaccent:#0a0a0a;--font:ui-monospace,SFMono-Regular,Menlo,Consolas,'Courier New',monospace;--radius:0px;--radius-sm:0px;--bw:2px}
html[data-tema="vapor"]{--bg:#0b1b3d;--panel:#122a5e;--panel2:#1a3a7a;--border:#2f5aa8;--text:#e8f9ff;--muted:#8fb8dd;--accent:#6ff2e6;--accent2:#ff8fd0;--green:#7dffd4;--blue:#9fd0ff;--onaccent:#06122b;--font:'Archivo Narrow','Roboto Condensed','Arial Narrow',ui-sans-serif,system-ui,sans-serif;--radius:18px;--radius-sm:14px;--bw:1px;--ls:.3px}
body,button,input,select,textarea,.btn{font-family:var(--font);letter-spacing:var(--ls)}
.box,ul.lista li,.grid2 a{border-radius:var(--radius)}
.box,.grid2 a{border-width:var(--bw)}
.btn,.busca{border-radius:calc(var(--radius) + 6px);border-width:var(--bw)}
.tag{border-radius:var(--radius-sm)}
.temabox{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:1200;display:flex;align-items:center}
.temabtn{background:var(--panel);border:1px solid var(--border);border-right:0;border-radius:10px 0 0 10px;padding:11px 8px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .2s}
.temabox:hover .temabtn,.temabox:focus-within .temabtn,.temabox.aberto .temabtn{opacity:1}
.temadot{width:11px;height:11px;border-radius:50%;background:var(--accent);display:block}
.temamenu{position:absolute;right:100%;top:50%;margin-right:7px;transform:translateY(-50%) translateX(10px);background:var(--panel);border:1px solid var(--border);border-radius:11px;padding:6px;display:flex;flex-direction:column;gap:1px;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .18s ease,transform .18s ease;box-shadow:0 10px 34px rgba(0,0,0,.4)}
.temabox:hover .temamenu,.temabox:focus-within .temamenu,.temabox.aberto .temamenu{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(-50%) translateX(0)}
.temamenu button{display:flex;align-items:center;gap:9px;background:none;border:0;color:var(--muted);padding:6px 14px 6px 8px;border-radius:8px;cursor:pointer;font-size:.79rem;white-space:nowrap;text-align:left;width:100%}
.temamenu button:hover{background:var(--panel2);color:var(--text)}
.temamenu button[aria-pressed="true"]{color:var(--text);background:var(--panel2)}
.temamenu i{width:15px;height:15px;border-radius:50%;flex:0 0 auto;border:1px solid var(--border);background:linear-gradient(135deg,var(--sw-b) 0 50%,var(--sw-a) 50% 100%)}
.temamenu button[aria-pressed="true"] i{border-color:var(--accent)}
@media(max-width:600px){.temabox{top:auto;bottom:18px;transform:none}.temamenu{top:auto;bottom:0;transform:translateX(10px)}.temabox:hover .temamenu,.temabox:focus-within .temamenu,.temabox.aberto .temamenu{transform:translateX(0)}}
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
<scr`+`ipt>(function(){try{var t=localStorage.getItem('vspTema');if(t&&t!=='noite')document.documentElement.dataset.tema=t}catch(e){}})();</scr`+`ipt>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</scr`+`ipt>` : ''}
</head>
<body>
<div class="temabox" id="temaBox"><button class="temabtn" type="button" id="temaBtn" aria-label="Trocar tema do site" aria-expanded="false"><span class="temadot"></span></button><div class="temamenu" id="temaMenu"><button type="button" data-t="noite" style="--sw-b:#0e0e11;--sw-a:#e8c15a"><i></i>Noite</button><button type="button" data-t="cubo" style="--sw-b:#ffffff;--sw-a:#111111"><i></i>Cubo branco</button><button type="button" data-t="impresso" style="--sw-b:#f4f1ea;--sw-a:#8b2f1d"><i></i>Impresso</button><button type="button" data-t="neon" style="--sw-b:#07060d;--sw-a:#ff2e88"><i></i>Neon</button><button type="button" data-t="terminal" style="--sw-b:#0a0a0a;--sw-a:#00ff41"><i></i>Terminal</button><button type="button" data-t="vapor" style="--sw-b:#0b1b3d;--sw-a:#6ff2e6"><i></i>Aquafuture</button></div></div>
<div class="top">
<a href="${SITE}/">VERNISSAGES <span>SP</span></a>
<div class="nav">
<a href="${SITE}/">Agenda</a><a href="${SITE}/arquivo.html">Acervo</a><a href="${SITE}/artistas.html">Artistas</a><a href="${SITE}/editais.html">Editais</a>
</div>
</div>
<div class="wrap${wide ? ' wide' : ''}">
${corpo}
<footer>
Vernissages SP — mapa vivo das galerias e aberturas de São Paulo, atualizado diariamente.<br>
Datas conforme divulgação dos espaços; confirme antes de visitar. <a href="${SITE}/">Voltar à agenda</a>
</footer>
</div>
<scr`+`ipt>
(function(){var box=document.getElementById('temaBox');if(!box)return;var btn=document.getElementById('temaBtn'),menu=document.getElementById('temaMenu');function m(t){[].forEach.call(menu.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-t')===t?'true':'false')})}function fecha(){box.classList.remove('aberto');btn.setAttribute('aria-expanded','false')}function a(t){if(t==='noite'){document.documentElement.removeAttribute('data-tema')}else{document.documentElement.setAttribute('data-tema',t)}m(t);try{localStorage.setItem('vspTema',t)}catch(e){}}btn.addEventListener('click',function(e){e.stopPropagation();var ab=box.classList.toggle('aberto');btn.setAttribute('aria-expanded',ab?'true':'false')});menu.addEventListener('click',function(e){var b=e.target.closest('button');if(b){a(b.getAttribute('data-t'));fecha()}});document.addEventListener('click',function(e){if(!box.contains(e.target))fecha()});document.addEventListener('keydown',function(e){if(e.key==='Escape')fecha()});var atual='noite';try{atual=localStorage.getItem('vspTema')||'noite'}catch(e){}m(atual);})();
</scr`+`ipt>
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
  fs.writeFileSync(path.join(RAIZ, 'acervo.json'), JSON.stringify(acervo, null, 1));

  const urls = [`${SITE}/`, `${SITE}/arquivo.html`, `${SITE}/artistas.html`, `${SITE}/editais.html`]
    .concat(acervo.expos.map(e => `${SITE}/m/${e.id}.html`))
    .concat(Object.keys(acervo.artistas).map(k => `${SITE}/a/${k}.html`));
  fs.writeFileSync(path.join(RAIZ, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `<url><loc>${u}</loc><lastmod>${HOJE}</lastmod></url>`).join('\n') + `\n</urlset>\n`);
  fs.writeFileSync(path.join(RAIZ, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

  console.log(`acervo: ${acervo.expos.length} mostras (${res.novas} novas, ${res.atualizadas} atualizadas) · ${Object.keys(acervo.artistas).length} artistas · ${urls.length} URLs no sitemap`);
}

main();
