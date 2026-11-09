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
  const plataformas = [['apoio.art', 'https://apoio.art/'], ['Res Artis', 'https://www.resartis.org/open-calls/']];
  const a = l => l.map(([n, u]) => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(n) + '</a>').join(' · ');
  return '<div class="fontes"><b>Editais e chamadas, fontes monitoradas:</b> ' + a(sites) + ' · ' + a(noticias) + ' · ' + a(plataformas) + (ig.length ? '<br>Instagram: ' + a(ig) : '') + '</div>';
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
const PLURAL_EDITAL = { fomento: 'Editais', residencia: 'Residências', premio: 'Prêmios', chamada: 'Chamadas', bolsa: 'Bolsas' };
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
  for (const [arq, via] of [['radar/editais.json', 'sites'], ['radar/editais-ig.json', 'instagram'], ['radar/editais-perfis.json', 'instagram'], ['radar/editais-sites.json', 'site'], ['radar/editais-apoio.json', 'plataforma'], ['radar/editais-resartis.json', 'plataforma']]) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(RAIZ, arq), 'utf8'));
      (j.itens || []).forEach(x => {
        if (!x || !x.t || !x.link) return;
        /* ruído: chamada já fechada, conversa, palestra e resultado não são oportunidade aberta */
        if (/inscri[çc][õo]es\s+(fechadas|encerradas)|\bencerrad[ao]s?\b|\bresultado\b|bate-papo|\bconversa\b|palestra|jardin|\bgarden|webinar|\bart fair\b|for galleries|\bexhibitors?\b|light festival|\bbooth\b|lan[çc]amento de livro/i.test(x.t)) return;
        const vivo = x.prazo ? x.prazo >= HOJE : (x.pub ? difDias(x.pub, HOJE) <= 45 : (x.visto && difDias(x.visto, HOJE) <= 10));
        if (vivo) out.push({ ...x, via: x.via || via });
      });
    } catch (_) { /* arquivo ainda não existe */ }
  }
  /* a mesma chamada aparece em notícia, Instagram e página oficial: fica uma vez (por link e por título) */
  const chave = x => String(x.t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 48);
  /* e a mesma residência listada duas vezes pelo Res Artis (só muda o período): mesmos 3 últimos termos do endereço */
  const fim3 = x => { try { return new URL(x.link).pathname.split('/').filter(Boolean).pop().split('-').slice(-3).join('-'); } catch (_) { return ''; } };
  const vistos = new Set(), titulos = new Set(), enderecos = new Set();
  return out.filter(x => {
    const k = chave(x), e3 = /resartis\.org/.test(x.link) ? 'ra|' + fim3(x) : '';
    if (vistos.has(x.link) || titulos.has(k) || (e3 && enderecos.has(e3))) return false;
    vistos.add(x.link); titulos.add(k); if (e3) enderecos.add(e3); return true; })
    .sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999') || (b.pub || '').localeCompare(a.pub || ''));
}

function paginaEditais(editais) {
  const radar = carregarRadar();
  const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const ondeDe = txt => /são paulo|sp\b/i.test(txt || '') ? 'sp' : /exterior|internacional|londres|lisboa|paris|berlim/i.test(txt || '') ? 'exterior' : 'brasil';

  /* uma lista só: os editais conferidos à mão e os achados do radar, ordenados pelo prazo */
  const todos = [
    ...editais.map(e => {
      const cat = e.cat in CAT_EDITAL ? e.cat : 'chamada';
      return { conf: true, t: e.t, org: e.org || '', cat, onde: ondeDe(e.onde), prazo: e.prazo || '', link: e.link || '#', d: e.d || '', taxa: e.taxa || '',
        meta: [e.quem ? 'Quem pode: ' + e.quem : '', e.onde ? 'Abrangência: ' + e.onde : '', e.valor || '', e.taxa ? 'Inscrição ' + e.taxa : '', e.fonte ? 'Fonte: ' + e.fonte : ''].filter(Boolean).join(' · ') };
    }),
    ...radar.map(r => {
      const cat = r.cat in CAT_EDITAL ? r.cat : 'chamada';
      return { conf: false, t: r.t, org: r.fonte || '', cat, onde: r.onde in ONDE_EDITAL ? r.onde : 'brasil', prazo: r.prazo || '', link: r.link, d: r.resumo || '', pub: r.pub, custo: r.custo || '', taxaTxt: r.taxaTxt || '', cita: r.cita || [],
        meta: r.via === 'site' ? 'Lido na página oficial de quem abriu a chamada' : r.via === 'plataforma' ? 'Listado por ' + String(r.fonte || '').split(' · ')[0] + '; o link leva à página do programa' : 'Achado automaticamente' + (r.via === 'instagram' ? ' no Instagram' : '') };
    })
  ].map(x => ({ ...x, st: estadoEdital({ prazo: x.prazo }) }));

  /* residência em que o artista paga (lido da página da chamada): não é edital, vai para uma seção própria, no fim */
  const pago = x => x.custo === 'taxa';
  const grupo = x => !x.prazo ? 4 : x.st.n < 0 ? 5 : x.st.n <= 7 ? 1 : x.st.n <= 30 ? 2 : 3;
  const TITULO = { 1: ['Fecham esta semana', 'corra'], 2: ['Fecham neste mês', 'até 30 dias'], 3: ['Mais adiante', 'com folga'], 4: ['Sem data de fim', 'fluxo contínuo ou prazo que não consegui ler'], 5: ['Encerrados', 'só para consulta'], 6: ['Residências em que o artista paga', 'hospedagem e ateliê cobrados de quem vai'] };
  todos.sort((a, b) => grupo(a) - grupo(b) || ((a.custo === 'taxa') - (b.custo === 'taxa')) || (a.prazo || '9999').localeCompare(b.prazo || '9999') || (b.conf - a.conf));

  const abertos = todos.filter(x => x.st.n >= 0 && !pago(x));
  const comTaxa = todos.filter(x => x.st.n >= 0 && pago(x));
  const fecham7 = abertos.filter(x => x.prazo && x.st.n <= 7).length;
  try { fs.writeFileSync(path.join(RAIZ, 'radar', 'resumo.json'), JSON.stringify({ abertos: abertos.length, fecham7, atualizado: HOJE })); } catch (_) {}
  /* o que fecha primeiro, para o card de editais do Instagram (editais-post.js): sem taxa, com prazo, ainda aberto */
  try {
    const prox = abertos.filter(x => x.prazo).sort((a, b) => a.prazo.localeCompare(b.prazo) || (b.conf - a.conf)).slice(0, 12)
      .map(x => ({ t: x.t, org: x.org || '', cat: CAT_EDITAL[x.cat], onde: ONDE_EDITAL[x.onde], prazo: x.prazo, dias: x.st.n, conf: !!x.conf, link: x.link }));
    fs.writeFileSync(path.join(RAIZ, 'radar', 'proximos.json'), JSON.stringify({ gerado: HOJE, itens: prox }, null, 1));
  } catch (_) {}

  const slug = x => 'e-' + String(x.t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  /* lembrete no calendário: evento de dia inteiro na data do prazo, com alarme 3 dias antes (.ics gerado no próprio link) */
  const ics = x => 'data:text/calendar;charset=utf-8,' + encodeURIComponent(['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vernissages SP//Editais//PT', 'BEGIN:VEVENT', 'UID:' + slug(x) + '@vernissagessp.com.br', 'DTSTAMP:' + HOJE.replace(/-/g, '') + 'T120000Z', 'DTSTART;VALUE=DATE:' + x.prazo.replace(/-/g, ''), 'SUMMARY:Prazo: ' + String(x.t).replace(/[,;\n]/g, ' ').slice(0, 90), 'DESCRIPTION:' + x.link, 'BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY', 'DESCRIPTION:Faltam 3 dias', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'));
  const data = x => x.prazo
    ? `<div class="e2d ${x.st.k}"><b>${+x.prazo.slice(8)}</b><i>${MES[+x.prazo.slice(5, 7) - 1]}${x.prazo.slice(0, 4) !== HOJE.slice(0, 4) ? ' ' + x.prazo.slice(2, 4) : ''}</i><span>${x.st.n === 0 ? 'último dia' : x.st.n > 0 ? 'faltam ' + x.st.n + (x.st.n > 1 ? ' dias' : ' dia') : 'encerrado'}</span></div>`
    : `<div class="e2d off"><b>?</b><span>ver no site</span></div>`;

  /* custo para o artista: 'taxa' (valor lido da página), 'livre' (edital, prêmio, bolsa, prazo conferido ou "com apoio") ou 'nd' (não informado) */
  const custoK = x => x.custo === 'taxa' ? 'taxa' : (x.conf || x.custo === 'apoio' || ['fomento', 'bolsa', 'premio'].includes(x.cat)) ? 'livre' : 'nd';
  /* título arrumado para ler: título TODO EM MAIÚSCULAS vira frase, sobra de separador no fim sai, espaço duplo some */
  const limpaT = t => {
    let s = String(t).replace(/\s+/g, ' ').replace(/[\s\-–—|·:]+$/, '').replace(/^[\s\-–—|·:]+/, '').trim();
    const letras = s.replace(/[^A-Za-zÀ-ÿ]/g, '');
    if (letras.length > 8 && letras.replace(/[^A-ZÀ-Ý]/g, '').length / letras.length > 0.6) {
      /* tudo em maiúsculas vira Title Case (preserva nome próprio: Brazil, Milan), com as palavrinhas em minúscula */
      const mini = /^(of|the|in|and|at|for|on|a|an|to|de|da|do|das|dos|e|em|na|no|para|com)$/;
      s = s.toLowerCase().replace(/[a-zà-ÿ0-9][a-zà-ÿ0-9'’]*/g, (w, i) => (i > 0 && mini.test(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1));
    }
    return s;
  };
  /* Duas peças, duas hierarquias. O leitor é de São Paulo: o que é do Brasil ganha card grande, com resumo (é onde ele
     age primeiro); o exterior vira um índice compacto, por prazo, que se varre em segundos. Encerrado não entra. */
  const etiqueta = x => x.custo === 'taxa' ? `<div class="cd-et taxa"><i></i><b>Com taxa</b> ${esc(x.taxaTxt)}</div>`
    : x.custo === 'parcial' ? `<div class="cd-et"><i></i><b>Financiada em parte</b> confira o valor</div>`
    : x.custo === 'apoio' ? `<div class="cd-et ok"><i></i><b>Com apoio</b> bolsa ou sem taxa</div>`
    : x.custo === 'indefinido' ? `<div class="cd-et nd"><i></i><b>Custo não informado</b></div>`
    : x.conf && x.taxa ? `<div class="cd-et ok"><i></i><b>Inscrição</b> ${esc(x.taxa)}</div>` : '';
  /* resumo só quando é texto de gente: raspagem de menu de site, aviso de javascript e o resumo genérico do Res Artis ficam de fora */
  const descOk = x => !!x.d && x.d.length > 50 && !/Pular para|Menu |javascript|navegador|Digite aqui|cookies|\| EN|Seu navegador|leva ao programa/i.test(x.d) && !x.d.trim().toLowerCase().startsWith(String(x.t).trim().toLowerCase().slice(0, 25));
  const citaHtml = x => x.cita && x.cita.length ? `<div class="cd-in">A página cita: ${esc(x.cita.join(', '))}</div>` : '';
  const quandoCurto = x => x.prazo ? `${+x.prazo.slice(8)} ${MES[+x.prazo.slice(5, 7) - 1]}${x.prazo.slice(0, 4) !== HOJE.slice(0, 4) ? ' ' + x.prazo.slice(2, 4) : ''}` : 'Sem data';
  const faltam = x => !x.prazo ? 'ver no site' : x.st.n === 0 ? 'último dia' : x.st.n === 1 ? 'falta 1 dia' : 'faltam ' + x.st.n + ' dias';
  const dados = (x, g, extra, cls) => `class="${cls}${x.prazo && x.st.n <= 7 ? ' urg' : ''}${extra ? ' mais' : ''}" id="${slug(x)}" data-c="${x.cat}" data-o="${x.onde}" data-g="${g}" data-p="${x.prazo ? 1 : 0}" data-v="${x.conf ? 1 : 0}" data-n="${x.prazo ? x.st.n : ''}" data-k="${custoK(x)}" data-b="${esc([x.t, x.org, CAT_EDITAL[x.cat], ONDE_EDITAL[x.onde], x.d].join(' ').toLowerCase())}"`;
  const emIngles = x => { const t = String(x.t); return !/[ãçõáéíóúâêô]/i.test(t) && (t.match(/\b(the|of|and|for|in|with|residency|open call|program|artist|artists|call)\b/gi) || []).length >= 2; };
  const orgDe = x => x.org ? String(x.org).split(' · ').pop().replace(/\s*\(.*$/, '') : '';
  const botoes = x => `<a class="cd-ab" href="${esc(x.link)}" target="_blank" rel="noopener">Abrir</a>${x.prazo ? `<a class="e2ics" href="${ics(x)}" download="prazo-${slug(x)}.ics">Lembrete</a>` : ''}`;
  const cartao = (x, extra) => `<li ${dados(x, 'br', extra, 'bc')}>
<div class="bc-q"><b>${quandoCurto(x)}</b><span>${faltam(x)}</span></div>
<a class="bc-t" href="${esc(x.link)}" target="_blank" rel="noopener">${esc(limpaT(x.t))}</a>
${descOk(x) ? `<p class="bc-d">${esc(x.d)}</p>` : ''}
<div class="cd-k">${CAT_EDITAL[x.cat]} · ${ONDE_EDITAL[x.onde]}${orgDe(x) ? ' · ' + esc(orgDe(x)) : ''}${x.conf ? ' · prazo conferido' : ''}${emIngles(x) ? ' · em inglês' : ''}</div>
${etiqueta(x)}
${citaHtml(x)}
<div class="cd-foot">${botoes(x)}</div>
</li>`;
  const linha = (x, extra) => `<li ${dados(x, 'ex', extra, 'rw')}>
<div class="rw-q"><b>${quandoCurto(x)}</b><span>${faltam(x)}</span></div>
<a class="rw-t" href="${esc(x.link)}" target="_blank" rel="noopener">${esc(limpaT(x.t))}</a>
<div class="rw-k">${CAT_EDITAL[x.cat]}${emIngles(x) ? ' · em inglês' : ''}<br>${esc(orgDe(x) || ONDE_EDITAL[x.onde])}</div>
<div class="rw-c">${etiqueta(x) || '<span class="rw-nd">sem informação de custo</span>'}${citaHtml(x)}</div>
<div class="rw-a">${botoes(x)}</div>
</li>`;

  const ordena = (a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999') || ((a.custo === 'taxa') - (b.custo === 'taxa')) || (b.conf - a.conf);
  const vivos = todos.filter(x => x.st.n >= 0 || !x.prazo);
  const noBrasil = vivos.filter(x => x.onde !== 'exterior').sort(ordena);
  const noExterior = vivos.filter(x => x.onde === 'exterior').sort(ordena);
  const secao = (g, titulo, sub, lista, fn, lim) => !lista.length ? '' :
    `<section class="bloco e2g" data-g="${g}"><h2>${titulo}<small>${sub}</small></h2><ul class="e2 e2-${g}">\n${lista.map((x, i) => fn(x, i >= lim)).join('\n')}\n</ul>${lista.length > lim ? `<button type="button" class="vmais" data-t="${lista.length}">Ver todos (${lista.length})</button>` : ''}</section>\n`;
  const corpoLista = secao('br', 'No Brasil', `${noBrasil.length} abertas, do prazo mais curto ao mais longo`, noBrasil, cartao, 9) +
    secao('ex', 'No exterior', `${noExterior.length} abertas, em índice`, noExterior, linha, 14);


  /* linha do tempo dos próximos 60 dias: cada chamada com prazo (e sem taxa) é uma marca; clicar leva à entrada */
  /* "Semana a semana": as próximas 6 semanas (segunda a domingo), cada coluna com as chamadas que fecham nela.
     Substitui o histograma de quadrados: aqui dá para LER o que fecha, e clicar. Residência com taxa fica de fora. */
  const SEM = 6;
  const seg0 = (() => { const d = new Date(HOJE + 'T12:00:00Z'); const w = (d.getUTCDay() + 6) % 7; return new Date(d.getTime() - w * 864e5); })();
  const iso = d => d.toISOString().slice(0, 10);
  const marcas = todos.filter(x => x.prazo && x.st.n >= 0 && !pago(x));
  const semanas = Array.from({ length: SEM }, (_, i) => {
    const ini = new Date(seg0.getTime() + i * 7 * 864e5), fim = new Date(ini.getTime() + 6 * 864e5);
    const itens = marcas.filter(x => x.prazo >= iso(ini) && x.prazo <= iso(fim)).sort((p, q) => p.prazo.localeCompare(q.prazo));
    const rot = i === 0 ? 'Esta semana' : i === 1 ? 'Semana que vem' : +iso(ini).slice(8) + ' a ' + +iso(fim).slice(8) + ' ' + MES[+iso(fim).slice(5, 7) - 1];
    return { rot, ini: iso(ini), fim: iso(fim), itens };
  });
  const tl = semanas.map(s => {
    const mostra = s.itens.slice(0, 6), resto = s.itens.length - mostra.length;
    return '<div class="sm"><h3>' + esc(s.rot) + '<b>' + s.itens.length + '</b></h3>' +
      (mostra.length ? '<ul>' + mostra.map(x => '<li><a href="#' + slug(x) + '"><i class="' + (x.st.n <= 3 ? 'urg' : '') + '">' + (+x.prazo.slice(8)) + '</i><span>' + esc(limpaT(x.t)) + '</span></a></li>').join('') + '</ul>' : '<p class="vz">nada fecha</p>') +
      (resto > 0 ? '<p class="mais">+ ' + resto + ' nesta semana, na lista abaixo</p>' : '') + '</div>';
  }).join('');
  const eixo = '';
  const maisPerto = abertos.find(x => x.prazo);

  const css = `<style>
.e2h{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;align-items:stretch;border-top:2px solid var(--ink);margin:0 0 clamp(22px,2.6vw,40px)}
.e2h .voz{font-family:var(--serif);font-style:italic;font-size:clamp(26px,3.1vw,48px);line-height:1.06;margin:0;padding:clamp(16px,2vw,28px) clamp(18px,3vw,48px) clamp(16px,2vw,28px) 0}
.e2prox{border-left:1px solid var(--ink);padding:clamp(16px,2vw,28px) 0 clamp(16px,2vw,28px) clamp(18px,3vw,48px);display:flex;flex-direction:column;justify-content:space-between;gap:14px}
.e2prox small{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--mute)}
.e2prox b{display:block;font-weight:800;font-size:clamp(64px,8vw,128px);line-height:.8;letter-spacing:-.07em;color:var(--terra)}
.e2prox b em{font-style:normal;font-size:.28em;letter-spacing:.12em;text-transform:uppercase;margin-left:.5em;color:var(--ink)}
.e2prox-a{font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.e2prox-a:hover{color:var(--terra)}
.e2prox span{display:block;font-family:var(--serif);font-size:clamp(20px,1.9vw,28px);line-height:1.1}
.e2l{border-top:2px solid var(--ink);margin:0 0 clamp(18px,2.4vw,30px);padding:14px 0 0}
.e2l>.nota{margin:0 0 12px;font-size:12px;color:var(--mute);letter-spacing:.04em}
.e2w{display:grid;grid-template-columns:repeat(${SEM},minmax(0,1fr));gap:0;border-top:1px solid var(--ink)}
.sm{padding:12px 14px 16px 0;border-right:1px solid rgba(14,14,14,.18);min-width:0}.sm+.sm{padding-left:14px}.sm:last-child{border-right:0}
.sm h3{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;display:flex;justify-content:space-between;margin-bottom:10px}.sm h3 b{color:var(--terra)}
.sm ul{list-style:none}.sm li{border-top:1px solid rgba(14,14,14,.14)}
.sm a{display:grid;grid-template-columns:26px minmax(0,1fr);gap:8px;padding:7px 0;font-size:13px;line-height:1.18}.sm a span{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.sm a i{font-style:normal;font-weight:800;font-size:15px;letter-spacing:-.03em}.sm a i.urg{color:var(--terra)}
.sm a:hover span{color:var(--terra)}
.sm .vz,.sm .mais{font-size:12px;color:var(--mute);margin-top:6px}
@media(max-width:1000px){.e2w{grid-template-columns:repeat(3,minmax(0,1fr))}.sm{border-bottom:1px solid rgba(14,14,14,.18)}}
@media(max-width:620px){.e2w{grid-template-columns:1fr}.sm,.sm+.sm{padding-left:0;border-right:0}}
.e2ics{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:1.5px solid var(--ink);margin-left:14px;white-space:nowrap}.e2ics:hover{color:var(--terra);border-color:var(--terra)}
.e2f{position:sticky;top:0;z-index:5;background:var(--paper);padding:10px 0 4px;margin-bottom:6px;border-bottom:1.5px solid rgba(14,14,14,.18)}
.e2f .busca{font-size:clamp(15px,1.5vw,20px);margin:0 0 10px;padding-bottom:6px}.e2f .chip{padding:5px 10px;font-size:11px}.e2f .chips{gap:6px;margin-bottom:6px}
.e2f .chips{margin-bottom:8px}
ul.e2{list-style:none}
ul.e2-br{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:clamp(24px,3vw,52px);row-gap:clamp(36px,4vw,64px)}
li.bc{position:relative;display:flex;flex-direction:column;border:1.5px solid var(--ink);background:#F8F6F1;padding:22px 22px 18px;scroll-margin-top:90px;overflow:hidden;isolation:isolate;transform-style:preserve-3d;transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s,border-color .25s,background .25s;--mx:50%;--my:0%;--rx:0deg;--ry:0deg;--lift:0px}
li.bc::before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(420px circle at var(--mx) var(--my),rgba(201,111,74,.20),transparent 62%);opacity:0;transition:opacity .3s}
li.bc::after{content:'';position:absolute;left:0;top:0;height:4px;width:0;background:var(--terra);transition:width .45s cubic-bezier(.2,.7,.2,1)}
li.bc.urg{border-color:var(--terra)}
li.bc:hover,li.bc:focus-within{transform:perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)) translateY(-5px);box-shadow:7px 9px 0 var(--ink);background:#FBF9F5}
li.bc.urg:hover,li.bc.urg:focus-within{box-shadow:7px 9px 0 var(--terra)}
li.bc:hover::before,li.bc:focus-within::before{opacity:1}
li.bc:hover::after,li.bc:focus-within::after{width:100%}
li.bc:target{border-color:var(--terra);box-shadow:7px 9px 0 var(--terra)}
li.bc .bc-t{background:linear-gradient(var(--ink),var(--ink)) 0 100%/0 2px no-repeat;transition:background-size .4s}
li.bc:hover .bc-t{background-size:100% 2px}
li.rw{transition:background .25s,padding .25s;position:relative}
li.rw::before{content:'';position:absolute;left:-14px;top:0;bottom:0;width:4px;background:var(--terra);transform:scaleY(0);transform-origin:top;transition:transform .3s}
li.rw:hover{background:rgba(255,255,255,.55)}li.rw:hover::before{transform:scaleY(1)}li.rw:hover .rw-t{color:var(--terra)}
html.js .rv{opacity:0;transform:translateY(18px)}html.js .rv.in{opacity:1;transform:none;transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.2,1)}
html.js li.bc.rv.in{transition:opacity .6s ease,transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s,border-color .25s,background .25s}
@media(prefers-reduced-motion:reduce){html.js .rv{opacity:1;transform:none}li.bc,li.bc:hover{transition:none;transform:none}li.bc::after,li.bc .bc-t{transition:none}}
.bc-q,.rw-q{display:flex;align-items:baseline;gap:12px;font-variant-numeric:tabular-nums}
.bc-q b{font-weight:800;font-size:19px;letter-spacing:.04em;text-transform:uppercase}
.bc-q span,.rw-q span{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
.urg .bc-q b,.urg .bc-q span,.urg .rw-q b,.urg .rw-q span{color:var(--terra)}
.bc-t{font-family:var(--serif);font-size:clamp(30px,2.7vw,40px);line-height:1.02;letter-spacing:-.015em;margin-top:20px;height:3.06em;text-wrap:pretty;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.bc-t:hover,.rw-t:hover{color:var(--terra)}
.bc-d{margin-top:16px;font-size:15px;line-height:1.38;max-width:46ch;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.cd-k{margin-top:16px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--mute);line-height:1.45}
.cd-et{margin-top:12px;font-size:12.5px;line-height:1.3;display:flex;gap:7px;align-items:baseline;flex-wrap:wrap}
.cd-et i{display:inline-block;width:8px;height:8px;background:var(--mute);flex:none;transform:translateY(-1px)}
.cd-et b{font-weight:800;letter-spacing:.05em;text-transform:uppercase;font-size:11px}
.cd-et.taxa b{color:var(--terra)}.cd-et.taxa i{background:var(--terra)}.cd-et.ok i{background:var(--ink)}.cd-et.nd{color:var(--mute)}
.cd-foot{margin-top:auto;padding-top:22px;display:flex;gap:18px;align-items:baseline}
.cd-ab{font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.cd-ab::after{content:" →"}.cd-ab:hover,.e2ics:hover{color:var(--terra)}
.e2ics{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mute);border:0}
.cd-in{margin-top:6px;font-size:11.5px;color:var(--mute);line-height:1.3}
ul.e2-ex{border-top:3px solid var(--ink)}
li.rw{display:grid;grid-template-columns:112px minmax(0,1.7fr) minmax(0,1fr) minmax(0,1fr) 170px;gap:clamp(14px,2vw,32px);align-items:baseline;border-bottom:1px solid rgba(14,14,14,.22);padding:14px 0 13px;scroll-margin-top:90px}
.rw-q{flex-direction:column;gap:3px}.rw-q b{font-weight:800;font-size:14px;letter-spacing:.05em;text-transform:uppercase}
.rw-t{font-family:var(--serif);font-size:25px;line-height:1.06;letter-spacing:-.01em;min-height:2.12em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rw-k{font-size:11px;letter-spacing:.09em;text-transform:uppercase;font-weight:700;color:var(--mute);line-height:1.45}
.rw-c .cd-et{margin:0}.rw-nd{font-size:11.5px;color:var(--mute)}
.rw-a{display:flex;gap:14px;justify-content:flex-end;align-items:baseline;white-space:nowrap}
li.mais{display:none}.e2g.aberto li.mais,body.filtrando li.mais{display:grid}.e2g.aberto li.bc.mais,body.filtrando li.bc.mais{display:flex}
.vmais{display:block;margin:34px auto 0;border:1.5px solid var(--ink);padding:9px 18px;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;background:transparent;cursor:pointer}.vmais:hover{background:var(--ink);color:var(--paper)}
body.filtrando .vmais{display:none}
.e2g{margin-bottom:clamp(40px,5vw,84px)}
.e2g>h2{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:clamp(18px,2vw,30px)}
@media(max-width:1180px){ul.e2-br{grid-template-columns:repeat(2,minmax(0,1fr))}li.rw{grid-template-columns:96px minmax(0,1.6fr) minmax(0,1fr) 130px}.rw-c{display:none}}
@media(max-width:760px){ul.e2-br{grid-template-columns:1fr}li.rw{grid-template-columns:1fr;gap:6px}.rw-q{flex-direction:row;gap:12px}.rw-a{justify-content:flex-start}.e2h{grid-template-columns:1fr}.e2prox{text-align:left}.e2prox span{margin-left:0}.e2f{position:static}}
.e2g h2 small{margin-left:12px}
.e2g[data-g="1"] h2{color:var(--terra)}
.e2n{margin:34px 0 8px;border-top:2px solid var(--ink);padding-top:14px}
@media(max-width:1180px){ul.e2{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:820px){ul.e2{grid-template-columns:repeat(2,minmax(0,1fr))}.e2h{grid-template-columns:1fr}.e2prox{text-align:left}.e2prox span{margin-left:0}.e2f{position:static}}
@media(max-width:520px){ul.e2{grid-template-columns:1fr}ul.e2 li.cd{min-height:0}}
</style>`;

  const corpo = `${css}
<p class="kick">Para artistas, curadores e coletivos</p>
<h1 class="g">Editais</h1>
<div class="e2h">
<p class="voz">O que está aberto para artista agora, com o prazo que vence primeiro no começo. Residência que cobra do artista leva a etiqueta COM TAXA.</p>
${maisPerto ? `<div class="e2prox"><small>Fecha primeiro</small><b${maisPerto.st.n === 0 ? ' style="font-size:clamp(48px,6vw,96px)"' : ''}>${maisPerto.st.n === 0 ? 'HOJE' : maisPerto.st.n + '<em>' + (maisPerto.st.n === 1 ? 'dia' : 'dias') + '</em>'}</b><span>${esc(limpaT(maisPerto.t))}</span><a class="e2prox-a" href="#${slug(maisPerto)}">Ir para a chamada →</a></div>` : ''}
</div>
${marcas.length ? `<div class="e2l" aria-label="Prazos semana a semana"><p class="nota">Semana a semana: o que fecha em cada uma. Clique para ir até a chamada.</p><div class="e2w">${tl}</div></div>` : ''}
<div class="e2f">
<input class="busca" id="q" type="search" placeholder="Buscar edital, organizador ou tipo" autocomplete="off">
<div class="chips" id="fc"><span class="rot">Tipo</span>
<button type="button" class="chip on" data-c="all">Todos</button>${Object.keys(CAT_EDITAL).map(c => `<button type="button" class="chip" data-c="${c}">${PLURAL_EDITAL[c]}</button>`).join('')}</div>
<div class="chips" id="fa"><span class="rot">Atalhos</span><button type="button" class="chip" data-t="sete">Fecha em 7 dias</button><button type="button" class="chip" data-t="br">Só no Brasil</button><button type="button" class="chip" data-t="livre">Sem custo para o artista</button><button type="button" class="chip" data-t="taxa">Com taxa</button><button type="button" class="chip" data-t="conf">Prazo conferido</button></div>
</div>
<div class="cont" id="cont" aria-live="polite"></div>
${todos.length ? corpoLista : '<p class="txt">Nenhuma oportunidade aberta no momento.</p>'}

<section class="e2n" id="outras"><h2 style="margin-top:0">De onde vem</h2>
<p class="nota">Todo dia o radar lê as páginas de quem abre a chamada (Pivô, Tomie Ohtake, FAAP, Funarte), sites de arte (Dasartes, Prêmio PIPA, seLecT, ArteBrasileiros, Arte Que Acontece, Sesc SP), perfis do Instagram que divulgam oportunidades e duas listas abertas: apoio.art e Res Artis. O prazo vem do texto de cada fonte e a categoria é um palpite por palavra-chave. Leia sempre o regulamento oficial, porque prorrogação é comum. Passou o prazo, o item sai sozinho.</p>
<div class="chips">
<a class="chip" href="https://apoio.art/" target="_blank" rel="noopener">apoio.art · fomento alemão e francês</a>
<a class="chip" href="https://www.resartis.org/open-calls/" target="_blank" rel="noopener">Res Artis · rede mundial de residências</a>
</div>
</section>
<div class="btns">
<a class="btn cheio" href="${SITE}/">Ver agenda de aberturas</a>
<a class="btn" href="${SITE}/arquivo.html">Acervo de exposições</a>
</div>`;

  const scripts = `<script>
(function(){
var st={c:'all',q:'',sete:false,br:false,k:'all',conf:false},lis=[].slice.call(document.querySelectorAll('ul.e2 li'));
function ap(){
  var n=0,filtrando=st.c!=='all'||st.q||st.sete||st.br||st.k!=='all'||st.conf;
  document.body.classList.toggle('filtrando',!!filtrando);
  lis.forEach(function(li){
    var d=li.dataset,ok=(st.c==='all'||d.c===st.c)&&(!st.q||d.b.indexOf(st.q)>-1)&&(!st.sete||(d.n!==''&&+d.n<=7))&&(!st.br||d.o!=='exterior')&&(st.k==='all'||d.k===st.k)&&(!st.conf||d.v==='1');
    li.style.display=ok?'':'none';if(ok)n++;
  });
  [].forEach.call(document.querySelectorAll('section.e2g'),function(s){var v=[].some.call(s.querySelectorAll('li'),function(li){return li.style.display!=='none'});s.style.display=v?'':'none';});
  document.getElementById('cont').innerHTML='<b>'+n+'</b> oportunidade'+(n===1?'':'s');
}
document.getElementById('fc').addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;[].forEach.call(this.querySelectorAll('.chip'),function(c){c.classList.toggle('on',c===b)});st.c=b.dataset.c;ap();});
document.getElementById('fa').addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;var k=b.dataset.t,on=!b.classList.contains('on');
  if(k==='livre'||k==='taxa'){[].forEach.call(this.querySelectorAll('[data-t=livre],[data-t=taxa]'),function(c){c.classList.remove('on')});st.k=on?k:'all';}
  else st[k]=on;
  b.classList.toggle('on',on);ap();});
document.getElementById('q').addEventListener('input',function(){st.q=this.value.toLowerCase().trim();ap();});
[].forEach.call(document.querySelectorAll('.vmais'),function(b){b.addEventListener('click',function(){var s=b.closest('section');var a=s.classList.toggle('aberto');b.textContent=a?'Ver menos':'Ver todos ('+b.dataset.t+')';});});
function abreAlvo(){var t=location.hash&&document.getElementById(location.hash.slice(1));if(t&&t.classList.contains('mais')){t.closest('section').classList.add('aberto');t.scrollIntoView();}}
window.addEventListener('hashchange',abreAlvo);abreAlvo();
document.documentElement.classList.add('js');
var fino=window.matchMedia('(hover:hover) and (pointer:fine)').matches,calmo=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
if(fino&&!calmo){[].forEach.call(document.querySelectorAll('li.bc'),function(c){
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    c.style.setProperty('--mx',(x*100)+'%');c.style.setProperty('--my',(y*100)+'%');
    c.style.setProperty('--ry',((x-.5)*5)+'deg');c.style.setProperty('--rx',((.5-y)*4)+'deg');});
  c.addEventListener('pointerleave',function(){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg');});});}
var rvs=[].slice.call(document.querySelectorAll('li.bc,li.rw'));rvs.forEach(function(el){el.classList.add('rv');});
if('IntersectionObserver' in window&&!calmo){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var el=en.target,i=rvs.indexOf(el);el.style.transitionDelay=((i%3)*70)+'ms';el.classList.add('in');io.unobserve(el);}});},{rootMargin:'0px 0px -6% 0px'});rvs.forEach(function(el){io.observe(el);});}else{rvs.forEach(function(el){el.classList.add('in');});}
ap();
})();
</script>`;

  return pagina({
    titulo: 'Editais, residências e chamadas para artistas em São Paulo | Vernissages SP',
    desc: `${abertos.length} editais, residências, prêmios e chamadas abertos para artistas visuais, curadores e coletivos, do prazo mais curto ao mais longo. Quem pode se inscrever e link oficial.`,
    canonical: `${SITE}/editais.html`, corpo, wide: true, scripts, ogTipo: 'website'
  });
}

/* ---------- páginas aposentadas ----------
   "Este fim de semana" e "Monta seu sábado" saíram do site. Os endereços continuam existindo (link da
   bio, WhatsApp, buscadores) e levam para a home, sem entrar no sitemap. */
function paginaRedireciona() {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vernissages SP</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE}/"><meta http-equiv="refresh" content="0;url=/"><script>location.replace('/')</script></head><body><p><a href="/">Ir para a agenda do Vernissages SP</a></p></body></html>\n`;
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
  fs.writeFileSync(path.join(RAIZ, 'fim-de-semana.html'), paginaRedireciona());
  fs.writeFileSync(path.join(RAIZ, 'monta-meu-sabado.html'), paginaRedireciona());
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
