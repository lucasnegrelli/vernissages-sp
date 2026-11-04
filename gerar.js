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
      img: e.img || (idx.get(id) && idx.get(id).img) || '', cred: e.cred || (idx.get(id) && idx.get(id).cred) || '',
      bairro: v.b, zona: v.z, addr: v.addr, tipo: v.tipo,
      site: v.site || '', ig: v.ig || '',
      visto: HOJE
    };
    const antigo = idx.get(id);
    if (!antigo) { acervo.expos.push(reg); idx.set(id, reg); novas++; }
    else {
      const mudou = ['t','a','ini','fim','d','img','bairro','zona','addr','site','ig']
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
/* A casca das páginas (CSS, cabeçalho, rodapé, recorte de margem das imagens) mora no site.js. */
/* Fontes dos editais, fixas no rodapé: saem das mesmas listas que o radar varre, então não divergem. */
const FONTES_RODAPE = (() => {
  const lj = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(RAIZ, f), 'utf8')); } catch (_) { return d; } };
  const sites = (lj('radar/fontes-sites.json', { fontes: [] }).fontes || []).map(f => [f.nome, f.url]);
  const noticias = [['Dasartes', 'https://dasartes.com.br'], ['Prêmio PIPA', 'https://www.premiopipa.com'], ['seLecT', 'https://www.select.art.br'], ['ArteBrasileiros', 'https://artebrasileiros.com.br'], ['Arte Que Acontece', 'https://artequeacontece.com.br'], ['Sesc SP', 'https://www.sescsp.org.br']];
  const ig = (lj('radar/perfis-ig.json', { perfis: [] }).perfis || []).map(p => ['@' + p.ig, 'https://instagram.com/' + p.ig]);
  const a = l => l.map(([n, u]) => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(n) + '</a>').join(' · ');
  return '<div class="fontes"><b>Editais e chamadas, fontes monitoradas:</b> ' + a(sites) + ' · ' + a(noticias) + (ig.length ? '<br>Instagram: ' + a(ig) : '') + '</div>';
})();
const { pagina, rc } = require('./site.js')(SITE, esc, FONTES_RODAPE);

/* ---------- datas e estado ---------- */
const MESC = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dCurta = d => d ? `${+d.slice(8, 10)} ${MESC[+d.slice(5, 7) - 1]}${d.slice(0, 4) !== HOJE.slice(0, 4) ? ' ' + d.slice(0, 4) : ''}` : '';
const difDias = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5);

function estado(e) {
  if (e.ini > HOJE) return { k: 'soon', txt: 'ABRE EM BREVE' };
  if (e.fim && e.fim < HOJE) return { k: 'off', txt: 'ENCERRADA' };
  return { k: 'on', txt: 'EM CARTAZ' };
}
/* "fecha em 12 dias", "abre amanhã", "encerrada" */
function situacao(e) {
  if (e.ini > HOJE) { const n = difDias(HOJE, e.ini); return n === 1 ? 'abre amanhã' : `abre em ${n} dias`; }
  if (e.fim && e.fim < HOJE) return 'encerrada';
  if (!e.fim) return 'em cartaz · encerramento não divulgado';
  const n = difDias(HOJE, e.fim);
  return n <= 0 ? 'último dia' : n === 1 ? 'fecha amanhã' : n <= 7 ? `últimos dias · fecha em ${n} dias` : `em cartaz · fecha em ${n} dias`;
}
const imgUrl = e => e && e.img ? `${SITE}/${String(e.img).replace(/^\//, '')}` : '';

/* uma linha de mostra (acervo, páginas de artista e de espaço) */
function itemMostra(m, extra) {
  const st = estado(m);
  const arts = artistasDe(m);
  const periodo = m.fim ? `${dCurta(m.ini)} → ${dCurta(m.fim)}` : `desde ${dCurta(m.ini)}`;
  return `<li class="${st.k}" data-s="${st.k}" data-y="${(m.ini || '').slice(0, 4)}" data-v="${esc(slug(m.v))}" data-b="${esc((m.t + ' ' + (m.a || '') + ' ' + m.v + ' ' + (m.bairro || '')).toLowerCase())}">
${m.img ? `<a class="thl" href="${SITE}/m/${m.id}.html">${rc(imgUrl(m), 'th')}</a>` : ''}
<div class="tx">
<div class="qdt"><span>${periodo}</span><span class="tag ${st.k}">${st.txt}</span></div>
<a class="t" href="${SITE}/m/${m.id}.html">${esc(m.t)}</a>
${arts.length ? `<div class="l2">${esc(arts.join(', '))}</div>` : ''}
<div class="l3">${esc(m.v)}${m.bairro ? ' · ' + esc(m.bairro) : ''}${extra || ''}</div>
</div>
</li>`;
}

/* ---------- páginas de exposição ---------- */
function paginaExpo(e, acervo) {
  const st = estado(e);
  const arts = artistasDe(e);
  const periodo = e.fim
    ? `${dataLonga(e.ini)} a ${dataLonga(e.fim)}`
    : `a partir de ${dataLonga(e.ini)}`;
  const desc = corta(`${e.t}${arts.length ? ', ' + arts.join(', ') : ''} na ${e.v} (${e.bairro}, São Paulo). ${periodo}.${e.d ? ' ' + e.d : ''}`, 165);
  const img = imgUrl(e);
  const outras = acervo.expos.filter(x => x.v === e.v && x.id !== e.id)
    .sort((a, b) => (b.ini || '').localeCompare(a.ini || '')).slice(0, 6);
  const duasLinhas = String(e.t);

  const corpo = `
<article class="expo${img ? ' com' : ''}">
<div class="ex-tx">
<p class="kick">${st.txt} <span>· ${esc(e.v)} · ${esc(e.bairro)}</span></p>
<h1>${esc(duasLinhas)}</h1>
${arts.length ? `<div class="sub">${arts.map(n => `<a href="${SITE}/a/${slug(n)}.html">${esc(n)}</a>`).join(', ')}</div>` : ''}
<div class="quando"><div class="dt">${e.fim ? `${esc(dCurta(e.ini))}<i>→</i>${esc(dCurta(e.fim))}` : `desde ${esc(dCurta(e.ini))}`}</div><div class="sit">${esc(situacao(e))}</div></div>
${e.d ? `<p class="txt">${esc(e.d)}</p>` : ''}
<div class="box">
<dl>
<dt>Período</dt><dd>${periodo}</dd>
<dt>Espaço</dt><dd>${esc(e.v)}${e.tipo ? ` <span style="color:var(--mute)">(${esc(e.tipo)})</span>` : ''}</dd>
<dt>Endereço</dt><dd>${esc(e.addr)}, ${esc(e.bairro)}, São Paulo</dd>
</dl>
</div>
<div class="btns">
<a class="btn cheio" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(e.v + ', ' + String(e.addr).replace(' ~', '') + ', São Paulo')}" target="_blank" rel="noopener">Como chegar</a>
${e.site ? `<a class="btn" href="${esc(e.site)}" target="_blank" rel="noopener">Site do espaço</a>` : ''}
${e.ig ? `<a class="btn" href="https://instagram.com/${esc(e.ig)}" target="_blank" rel="noopener">Instagram</a>` : ''}
<a class="btn" href="${SITE}/">Ver agenda atual</a>
</div>
</div>
${img ? `<figure class="ex-fig">${rc(imgUrl(e))}${e.cred ? `<figcaption>${esc(e.cred)}</figcaption>` : ''}</figure>` : ''}
</article>
${outras.length ? `<h2>Mais em ${esc(e.v)}<small>${outras.length}</small></h2>
<ul class="lista">
${outras.map(m => itemMostra(m)).join('\n')}
</ul>` : ''}`;

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
    ...(img ? { image: img } : {}),
    location: {
      '@type': 'Place', name: e.v,
      address: { '@type': 'PostalAddress', streetAddress: String(e.addr).replace(' ~', ''), addressLocality: 'São Paulo', addressRegion: 'SP', addressCountry: 'BR' }
    },
    ...(arts.length ? { performer: arts.map(n => ({ '@type': 'Person', name: n })) } : {})
  };

  return pagina({
    titulo: `${corta(e.t, 58)} — ${e.v} | Vernissages SP`,
    desc, canonical: `${SITE}/m/${e.id}.html`, corpo, jsonld, wide: !!img
  });
}

/* ---------- páginas de artista ---------- */
function paginaArtista(k, at, porId) {
  const ms = at.mostras.map(id => porId[id]).filter(Boolean)
    .sort((a, b) => (b.ini || '').localeCompare(a.ini || ''));
  const espacos = [...new Set(ms.map(m => m.v))];
  const desc = corta(`${at.nome} em São Paulo: ${ms.length} exposição(ões) registrada(s)${espacos.length ? ' em ' + espacos.slice(0, 3).join(', ') : ''}. Histórico de mostras, datas e galerias.`, 165);
  const agora = ms.filter(m => estado(m).k !== 'off');

  const corpo = `
<p class="kick">Artista${agora.length ? ` <span>· ${agora.length} em cartaz ou por abrir</span>` : ''}</p>
<h1>${esc(at.nome)}</h1>
<div class="meta">${ms.length} mostra${ms.length > 1 ? 's' : ''} no acervo${espacos.length ? ` · ${espacos.length} espaço${espacos.length > 1 ? 's' : ''}` : ''}</div>
<h2>Exposições<small>${ms.length}</small></h2>
<ul class="lista">
${ms.map(m => itemMostra(m)).join('\n')}
</ul>
${espacos.length > 1 ? `<h2>Espaços<small>${espacos.length}</small></h2>
<div class="chips">${espacos.map(v => `<span class="chip">${esc(v)}</span>`).join('')}</div>` : ''}
<div class="btns">
<a class="btn cheio" href="${SITE}/artistas.html">Todos os artistas</a>
<a class="btn" href="https://www.google.com/search?q=${encodeURIComponent(at.nome + ' artista')}" target="_blank" rel="noopener">Buscar no Google</a>
</div>`;

  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Person', name: at.nome,
    url: `${SITE}/a/${k}.html`, jobTitle: 'Artista visual',
    ...(ms.length ? { performerIn: ms.slice(0, 20).map(m => ({ '@type': 'ExhibitionEvent', name: m.t, startDate: m.ini, url: `${SITE}/m/${m.id}.html` })) } : {})
  };

  return pagina({ titulo: `${at.nome} — exposições em São Paulo | Vernissages SP`, desc, canonical: `${SITE}/a/${k}.html`, corpo, jsonld });
}

/* ---------- acervo: filtros por situação, ano e espaço ---------- */
function paginaArquivo(expos) {
  const ord = [...expos].sort((a, b) => (b.ini || '').localeCompare(a.ini || ''));
  const porAno = {};
  ord.forEach(e => { const y = (e.ini || '').slice(0, 4) || 's/data'; (porAno[y] = porAno[y] || []).push(e); });
  const anos = Object.keys(porAno).sort().reverse();
  const espacos = [...new Set(ord.map(e => e.v))].sort((a, b) => a.localeCompare(b, 'pt'));
  const nAgora = ord.filter(e => estado(e).k !== 'off').length;

  const corpo = `
<p class="kick">Acervo <span>· desde ${anos.length ? anos[anos.length - 1] : ''}</span></p>
<h1 class="g">Acervo</h1>
<p class="lede">Todas as mostras que passaram pela agenda do Vernissages SP, em cartaz e encerradas. <b>${expos.length}</b> registros, ${nAgora} em cartaz ou por abrir.</p>
<input class="busca" id="q" type="search" placeholder="Buscar título, artista, espaço ou bairro" autocomplete="off">
<div class="chips" id="fs"><span class="rot">Situação</span>
<button type="button" class="chip on" data-s="all">Todas</button><button type="button" class="chip" data-s="on">Em cartaz</button><button type="button" class="chip" data-s="soon">Por abrir</button><button type="button" class="chip" data-s="off">Encerradas</button></div>
<div class="chips" id="fy"><span class="rot">Ano</span>
<button type="button" class="chip on" data-y="all">Todos</button>${anos.map(y => `<button type="button" class="chip" data-y="${y}">${y}</button>`).join('')}</div>
<div class="chips"><span class="rot">Espaço</span><select class="sel" id="fv" aria-label="Espaço"><option value="all">Todos os espaços</option>${espacos.map(v => `<option value="${esc(slug(v))}">${esc(v)}</option>`).join('')}</select></div>
<div class="cont" id="cont" aria-live="polite"></div>
${anos.map(y => `<section class="ano" data-y="${y}"><h2>${y}<small>${porAno[y].length} mostras</small></h2>
<ul class="lista">
${porAno[y].map(e => itemMostra(e)).join('\n')}
</ul></section>`).join('\n')}`;

  const scripts = `<script>
(function(){
var st={s:'all',y:'all',v:'all',q:''},lis=[].slice.call(document.querySelectorAll('ul.lista li')),secs=[].slice.call(document.querySelectorAll('section.ano'));
function ap(){
  var n=0;
  lis.forEach(function(li){
    var ok=(st.s==='all'||li.dataset.s===st.s)&&(st.y==='all'||li.dataset.y===st.y)&&(st.v==='all'||li.dataset.v===st.v)&&(!st.q||li.dataset.b.indexOf(st.q)>-1);
    li.style.display=ok?'':'none';if(ok)n++;
  });
  secs.forEach(function(s){var v=[].some.call(s.querySelectorAll('li'),function(li){return li.style.display!=='none'});s.style.display=v?'':'none';});
  document.getElementById('cont').innerHTML='<b>'+n+'</b> mostra'+(n===1?'':'s');
}
function chips(id,chave){document.getElementById(id).addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;[].forEach.call(this.querySelectorAll('.chip'),function(c){c.classList.toggle('on',c===b)});st[chave]=b.dataset[chave];ap();});}
chips('fs','s');chips('fy','y');
document.getElementById('fv').addEventListener('change',function(){st.v=this.value;ap();});
document.getElementById('q').addEventListener('input',function(){st.q=this.value.toLowerCase().trim();ap();});
ap();
})();
</script>`;

  return pagina({
    titulo: 'Acervo de exposições em São Paulo | Vernissages SP',
    desc: `Arquivo histórico com ${expos.length} exposições de galerias e museus de São Paulo: título, artistas, espaço, bairro e período.`,
    canonical: `${SITE}/arquivo.html`, corpo, wide: true, scripts, ogTipo: 'website'
  });
}

/* ---------- artistas: busca, índice A-Z e ordem por número de mostras ---------- */
function paginaArtistas(artistas) {
  const ks = Object.keys(artistas).sort((a, b) => artistas[a].nome.localeCompare(artistas[b].nome, 'pt'));
  const letra = k => { const c = artistas[k].nome.normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };
  const grupos = {};
  ks.forEach(k => (grupos[letra(k)] = grupos[letra(k)] || []).push(k));
  const letras = Object.keys(grupos).sort((a, b) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b));
  const link = k => `<a href="${SITE}/a/${k}.html" data-b="${esc(artistas[k].nome.toLowerCase())}">${esc(artistas[k].nome)}<small>${artistas[k].mostras.length}</small></a>`;
  const porQtd = [...ks].sort((a, b) => artistas[b].mostras.length - artistas[a].mostras.length || artistas[a].nome.localeCompare(artistas[b].nome, 'pt'));

  const corpo = `
<p class="kick">Índice</p>
<h1 class="g">Artistas</h1>
<p class="lede"><b>${ks.length}</b> artistas com exposições registradas em São Paulo. O número ao lado do nome é a quantidade de mostras no acervo.</p>
<input class="busca" id="q" type="search" placeholder="Buscar artista" autocomplete="off">
<div class="chips" id="ord"><span class="rot">Ordem</span><button type="button" class="chip on" data-o="az">A–Z</button><button type="button" class="chip" data-o="qtd">Mais mostras</button></div>
<div class="chips" id="az"><span class="rot">Ir para</span>${letras.map(l => `<a class="chip" href="#l-${l === '#' ? 'num' : l}">${l}</a>`).join('')}</div>
<div class="cont" id="cont" aria-live="polite"></div>
<div id="porletra">
${letras.map(l => `<section class="let" id="l-${l === '#' ? 'num' : l}"><h2>${l}<small>${grupos[l].length}</small></h2><div class="grid2">
${grupos[l].map(link).join('\n')}
</div></section>`).join('\n')}
</div>
<div id="porqtd" style="display:none"><div class="grid2">
${porQtd.map(link).join('\n')}
</div></div>`;

  const scripts = `<script>
(function(){
var q='',modo='az';
function ap(){
  var alvo=document.getElementById(modo==='az'?'porletra':'porqtd'),n=0;
  [].forEach.call(alvo.querySelectorAll('.grid2 a'),function(a){var ok=!q||a.dataset.b.indexOf(q)>-1;a.style.display=ok?'':'none';if(ok)n++;});
  [].forEach.call(alvo.querySelectorAll('section.let'),function(s){var v=[].some.call(s.querySelectorAll('a'),function(a){return a.style.display!=='none'});s.style.display=v?'':'none';});
  document.getElementById('cont').innerHTML='<b>'+n+'</b> artista'+(n===1?'':'s');
}
document.getElementById('q').addEventListener('input',function(){q=this.value.toLowerCase().trim();ap();});
document.getElementById('ord').addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;[].forEach.call(this.querySelectorAll('.chip'),function(c){c.classList.toggle('on',c===b)});modo=b.dataset.o;
  document.getElementById('porletra').style.display=modo==='az'?'':'none';document.getElementById('porqtd').style.display=modo==='qtd'?'':'none';document.getElementById('az').style.display=modo==='az'?'':'none';ap();});
ap();
})();
</script>`;

  return pagina({
    titulo: 'Artistas com exposições em São Paulo | Vernissages SP',
    desc: `Índice de ${ks.length} artistas com mostras em galerias e museus de São Paulo, com histórico de exposições.`,
    canonical: `${SITE}/artistas.html`, corpo, wide: true, scripts, ogTipo: 'website'
  });
}

/* ---------- editais, chamadas, residências e prêmios ---------- */
const CAT_EDITAL = { fomento: 'Edital', residencia: 'Residência', premio: 'Prêmio', chamada: 'Chamada', bolsa: 'Bolsa' };
const ONDE_EDITAL = { sp: 'São Paulo', brasil: 'Brasil', exterior: 'Exterior' };

function estadoEdital(ed) {
  if (!ed.prazo) return { k: 'soon', txt: 'FLUXO CONTÍNUO', curto: 'contínuo', n: 9999 };
  if (ed.prazo < HOJE) return { k: 'off', txt: 'ENCERRADO', curto: dCurta(ed.prazo), n: -1 };
  const dias = difDias(HOJE, ed.prazo);
  if (dias === 0) return { k: 'soon', txt: 'ÚLTIMO DIA', curto: 'hoje', n: 0 };
  if (dias <= 7) return { k: 'soon', txt: `FALTAM ${dias} DIA${dias > 1 ? 'S' : ''}`, curto: dCurta(ed.prazo), n: dias };
  return { k: 'on', txt: 'ABERTO', curto: dCurta(ed.prazo), n: dias };
}

/* radar: o que a busca automática achou (sites de arte e Instagram). Fora do prazo some sozinho. */
function carregarRadar() {
  const out = [];
  for (const [arq, via] of [['radar/editais.json', 'sites'], ['radar/editais-ig.json', 'instagram'], ['radar/editais-perfis.json', 'instagram'], ['radar/editais-sites.json', 'site']]) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(RAIZ, arq), 'utf8'));
      (j.itens || []).forEach(x => {
        if (!x || !x.t || !x.link) return;
        const vivo = x.prazo ? x.prazo >= HOJE : (x.pub ? difDias(x.pub, HOJE) <= 45 : (x.visto && difDias(x.visto, HOJE) <= 10));
        if (vivo) out.push({ ...x, via: x.via || via });
      });
    } catch (_) { /* arquivo ainda não existe */ }
  }
  const vistos = new Set();
  return out.filter(x => !vistos.has(x.link) && vistos.add(x.link))
    .sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999') || (b.pub || '').localeCompare(a.pub || ''));
}

function paginaEditais(editais) {
  const peso = e => (!e.prazo ? 1 : (e.prazo >= HOJE ? 0 : 2));
  const ord = [...editais].sort((a, b) => peso(a) - peso(b) || (a.prazo || '9999').localeCompare(b.prazo || '9999'));
  const abertos = ord.filter(e => peso(e) < 2);
  const radar = carregarRadar();

  const prz = st => `<div class="prz ${st.k}"><b>${esc(st.curto)}</b><span>${st.n === 9999 ? 'sem data de fim' : st.n === 0 ? 'último dia' : st.n > 0 ? 'falta' + (st.n > 1 ? 'm ' : ' ') + st.n + ' dia' + (st.n > 1 ? 's' : '') : 'encerrado'}</span></div>`;

  const item = ed => {
    const st = estadoEdital(ed);
    const cat = ed.cat in CAT_EDITAL ? ed.cat : 'chamada';
    const onde = /são paulo|sp/i.test(ed.onde || '') ? 'sp' : /exterior|internacional|londres|lisboa|paris|berlim/i.test(ed.onde || '') ? 'exterior' : 'brasil';
    const busca = [ed.t, ed.org, CAT_EDITAL[cat], ed.quem, ed.onde, ed.d].join(' ').toLowerCase();
    return `<li class="${st.k}" data-c="${cat}" data-o="${onde}" data-e="${st.k === 'off' ? 'off' : 'on'}" data-b="${esc(busca)}">
<div class="tx">
<div class="qdt"><span class="tag">${CAT_EDITAL[cat]}</span><span class="tag ${st.k}">${st.txt}</span></div>
<a class="t" href="${esc(ed.link || '#')}" target="_blank" rel="noopener">${esc(ed.t)}</a>
<div class="l2">${esc(ed.org || '')}</div>
${ed.d ? `<div class="l3">${esc(ed.d)}</div>` : ''}
<div class="l3">${[ed.quem ? 'Quem pode: ' + esc(ed.quem) : '', ed.onde ? 'Abrangência: ' + esc(ed.onde) : '', ed.valor ? esc(ed.valor) : '', ed.taxa ? 'Inscrição ' + esc(ed.taxa) : '', ed.fonte ? 'Fonte: ' + esc(ed.fonte) : ''].filter(Boolean).join(' · ')}</div>
<div class="btns"><a class="btn cheio" href="${esc(ed.link || '#')}" target="_blank" rel="noopener">Abrir edital</a></div>
</div>
${prz(st)}
</li>`;
  };

  const itemRadar = r => {
    const st = estadoEdital({ prazo: r.prazo });
    const cat = r.cat in CAT_EDITAL ? r.cat : 'chamada';
    const onde = r.onde in ONDE_EDITAL ? r.onde : 'brasil';
    const busca = [r.t, r.fonte, CAT_EDITAL[cat], ONDE_EDITAL[onde], r.resumo].join(' ').toLowerCase();
    return `<li class="${st.k}" data-c="${cat}" data-o="${onde}" data-e="on" data-b="${esc(busca)}">
<div class="tx">
<div class="qdt"><span class="tag">${CAT_EDITAL[cat]}</span><span class="tag">${ONDE_EDITAL[onde]}</span>${r.prazo ? `<span class="tag ${st.k}">${st.txt}</span>` : '<span class="tag off">PRAZO NÃO LIDO</span>'}</div>
<a class="t" href="${esc(r.link)}" target="_blank" rel="noopener">${esc(r.t)}</a>
<div class="l2">${esc(r.fonte)}${r.pub ? ' · ' + esc(dCurta(r.pub)) : ''}</div>
${r.resumo ? `<div class="l3">${esc(r.resumo)}</div>` : ''}
<div class="l3">${r.via === 'site' ? 'Lido na página oficial de quem abriu a chamada' : 'Detectado automaticamente' + (r.via === 'instagram' ? ' no Instagram' : '')}. ${r.prazo ? 'Prazo lido no texto' : 'Sem data de encerramento lida'}: confirme antes de se inscrever.</div>
<div class="btns"><a class="btn" href="${esc(r.link)}" target="_blank" rel="noopener">Abrir fonte</a></div>
</div>
${r.prazo ? prz(st) : '<div class="prz off"><b>?</b><span>conferir</span></div>'}
</li>`;
  };

  const corpo = `
<p class="kick">Oportunidades <span>· para artistas, curadores e coletivos</span></p>
<h1 class="g">Editais</h1>
<p class="lede">Chamadas de galerias e museus, residências, prêmios, bolsas e editais de fomento. <b>${abertos.length}</b> confirmados com inscrição aberta${radar.length ? ` e <b>${radar.length}</b> detectados no radar` : ''}.</p>
<input class="busca" id="q" type="search" placeholder="Buscar edital, organizador ou tipo" autocomplete="off">
<div class="chips" id="fc"><span class="rot">Tipo</span>
<button type="button" class="chip on" data-c="all">Todos</button>${Object.keys(CAT_EDITAL).map(c => `<button type="button" class="chip" data-c="${c}">${CAT_EDITAL[c]}${c === 'residencia' || c === 'chamada' ? 's' : c === 'fomento' ? 's' : 's'}</button>`).join('')}</div>
<div class="chips" id="fo"><span class="rot">Onde</span>
<button type="button" class="chip on" data-o="all">Qualquer lugar</button><button type="button" class="chip" data-o="sp">São Paulo</button><button type="button" class="chip" data-o="brasil">Brasil</button><button type="button" class="chip" data-o="exterior">Exterior</button></div>
<div class="chips"><button type="button" class="chip" id="fe">Mostrar encerrados</button></div>
<div class="cont" id="cont" aria-live="polite"></div>

<section class="bloco" id="conf"><h2>Confirmados<small>${ord.length}</small></h2>
<p class="nota">Prazo conferido na fonte oficial. Ainda assim, leia o regulamento no site do organizador: prorrogação e mudança de data são comuns.</p>
${ord.length ? `<ul class="lista ed">
${ord.map(item).join('\n')}
</ul>` : '<p class="txt">Nenhum edital confirmado no momento.</p>'}
</section>

<section class="bloco" id="radar"><h2>Radar<small>${radar.length} detectados</small></h2>
<p class="nota">Achados sozinhos, todo dia, nas páginas oficiais de quem abre a chamada (Pivô, Tomie Ohtake, FAAP, Funarte...), em sites de arte (Dasartes, Prêmio PIPA, seLecT, ArteBrasileiros, Arte Que Acontece, Sesc SP) e em perfis do Instagram que divulgam oportunidades. As fontes estão listadas no rodapé. O prazo é o que está no texto da matéria, e a categoria é um palpite por palavra-chave: <b>confirme tudo na fonte oficial</b>. Quando o prazo passa, o item some sozinho.</p>
${radar.length ? `<ul class="lista ed radar">
${radar.map(itemRadar).join('\n')}
</ul>` : '<p class="txt">Nada novo no radar hoje.</p>'}
</section>
<div class="btns">
<a class="btn cheio" href="${SITE}/">Ver agenda de aberturas</a>
<a class="btn" href="${SITE}/arquivo.html">Acervo de exposições</a>
</div>`;

  const scripts = `<script>
(function(){
var st={c:'all',o:'all',q:'',enc:false},lis=[].slice.call(document.querySelectorAll('ul.ed li'));
function ap(){
  var n=0;
  lis.forEach(function(li){
    var ok=(st.c==='all'||li.dataset.c===st.c)&&(st.o==='all'||li.dataset.o===st.o)&&(!st.q||li.dataset.b.indexOf(st.q)>-1)&&(st.enc||li.dataset.e!=='off');
    li.style.display=ok?'':'none';if(ok)n++;
  });
  [].forEach.call(document.querySelectorAll('section.bloco'),function(s){var v=[].some.call(s.querySelectorAll('li'),function(li){return li.style.display!=='none'});s.style.display=v?'':'none';});
  document.getElementById('cont').innerHTML='<b>'+n+'</b> oportunidade'+(n===1?'':'s');
}
function chips(id,chave){document.getElementById(id).addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;[].forEach.call(this.querySelectorAll('.chip'),function(c){c.classList.toggle('on',c===b)});st[chave]=b.dataset[chave];ap();});}
chips('fc','c');chips('fo','o');
document.getElementById('fe').addEventListener('click',function(){st.enc=!st.enc;this.classList.toggle('on',st.enc);ap();});
document.getElementById('q').addEventListener('input',function(){st.q=this.value.toLowerCase().trim();ap();});
ap();
})();
</script>`;

  return pagina({
    titulo: 'Editais, residências e chamadas para artistas em São Paulo | Vernissages SP',
    desc: `${abertos.length} editais confirmados e ${radar.length} oportunidades no radar: residências, prêmios, bolsas e chamadas para artistas visuais, curadores e coletivos. Prazos, quem pode se inscrever e link oficial.`,
    canonical: `${SITE}/editais.html`, corpo, wide: true, scripts, ogTipo: 'website'
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
