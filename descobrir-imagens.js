#!/usr/bin/env node
/**
 * descobrir-imagens.js — acha a imagem de capa das mostras que estão sem `img`.
 *
 * POR QUE ISTO EXISTE
 * O espelhar.js resolve o último passo (URL externa → img/ local, sem CORS),
 * mas só depois que alguém descobriu a URL. Esse "alguém" era o Lucas, na mão,
 * abrindo o site de cada galeria (ver PENDENTE/IMAGENS-FALTANDO.md, 18/08).
 * Com 30% de cobertura de imagem no dados.js, essa etapa manual é o gargalo de
 * tudo: peça de social apelona, lote semanal e popup da agenda no site.
 *
 * O QUE ELE NÃO FAZ
 * Não escreve no dados.js. Cospe uma proposta em markdown pra revisão humana,
 * no mesmo formato do IMAGENS-FALTANDO.md. Imagem errada num post é pior que
 * post sem imagem, e só quem conhece a mostra sabe se a capa é a obra certa.
 *
 * ÉTICA — mesmo contrato do espelhar.js e do POSTS.md §5.1
 * Só busca no site oficial da própria casa (campo `site` do venue). Não raspa
 * Instagram, não pega imagem de banco e não inventa crédito: quando não acha
 * autoria explícita, marca `Cortesia <venue>` e deixa CONFERIR no relatório.
 *
 * Uso:  node descobrir-imagens.js [--limite 10] [--venue "Auroras"] [--saida arq.md]
 */

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const DADOS = path.join(RAIZ, 'dados.js');
const UA = 'vernissages-sp/1.0 (+https://vernissagessp.com.br)';

/* ---------- headless, sob demanda ----------
 * Metade dos fracassos medidos em 19/08 era site renderizado por JavaScript:
 * o HTML estatico nao traz nenhum <a> pra mostra, entao o casamento de titulo
 * nunca acontecia. O puppeteer ja estava instalado em .render/ pro gerador de
 * peca; aqui ele entra so como plano B, porque abrir Chrome custa ~2s por
 * pagina contra ~200ms do fetch. O navegador sobe na primeira vez que alguem
 * precisa e fica de pe ate o fim da execucao. */
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let _browser = null, _browserMorto = false;

async function browser(){
  if (_browser) return _browser;
  if (_browserMorto) return null;
  try {
    const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
    _browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--blink-settings=imagesEnabled=false'],
      defaultViewport: { width: 1280, height: 900 }
    });
    return _browser;
  } catch (e) {
    _browserMorto = true;
    console.log('  (headless indisponivel: ' + String(e.message || e).slice(0, 70) + ')');
    return null;
  }
}

async function fecharBrowser(){
  if (_browser) { try { await _browser.close(); } catch {} _browser = null; }
}

const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const LIMITE = Number(arg('--limite', '0')) || 0;
const SO_VENUE = arg('--venue', '');
const SAIDA = arg('--saida', path.join(RAIZ, 'PENDENTE', 'IMAGENS-PROPOSTAS.md'));

/* ---------- helpers ---------- */

const norm = s => String(s || '')
  .normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const STOP = new Set(['de','da','do','das','dos','a','o','as','os','e','em','no','na',
  'um','uma','que','com','para','the','of','and','individual','exposicao','mostra']);

const toks = s => norm(s).split(' ').filter(t => t.length > 2 && !STOP.has(t));

function carregar(){
  const txt = fs.readFileSync(DADOS, 'utf8');
  const win = {};
  new Function('window', txt + '\n;window.DATA=window.DATA||DATA;')(win);
  if (!win.DATA || !Array.isArray(win.DATA.expos)) throw new Error('dados.js nao expos window.DATA.expos');
  return win.DATA;
}

async function pegar(url){
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': UA } });
    if (!r.ok) return { erro: 'HTTP ' + r.status };
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('html')) return { erro: 'nao e html' };
    return { html: await r.text(), url: r.url };
  } catch (e) {
    return { erro: (e.name === 'AbortError' ? 'timeout' : String(e.message || e)).slice(0, 60) };
  } finally { clearTimeout(t); }
}

/* Mesma assinatura do pegar(), mas com o DOM ja montado pelo JavaScript da
   pagina. Imagens vem desligadas: so interessa o HTML resultante, e desligar
   corta a maior parte do trafego. */
async function pegarRender(url){
  const b = await browser();
  if (!b) return { erro: 'headless indisponivel' };
  let page;
  try {
    page = await b.newPage();
    await page.setUserAgent(UA);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    return { html: await page.content(), url: page.url() };
  } catch (e) {
    return { erro: 'render: ' + String(e.message || e).slice(0, 50) };
  } finally {
    if (page) { try { await page.close(); } catch {} }
  }
}

/* Links da home/índice que cheiram a página de exposição. Guarda o texto da
   âncora junto: é ele que casa com o título da mostra. */
function links(html, base){
  const out = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null){
    let href = m[1];
    if (/^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    try { href = new URL(href, base).href; } catch { continue; }
    const texto = m[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    out.push({ href, texto });
  }
  return out;
}

const EXPO_RE = /(exhibition|exposi|mostra|expo|show|viewing|programa)/i;

/* Caminhos de índice mais comuns em site de galeria/instituição no Brasil. */
const INDICES = ['/exposicoes', '/exposicoes/', '/exhibitions', '/exhibitions/',
  '/mostras', '/programacao', '/programa', '/en/exhibitions', '/agenda',
  '/exposicoes-atuais', '/current', '/viewing-room'];

/* Pontua um link contra a mostra: casamento de token no texto da âncora vale
   mais que na URL, porque URL costuma ter slug truncado. */
function pontuar(link, alvo){
  const tl = new Set(toks(link.texto));
  const tu = new Set(toks(decodeURIComponent(link.href)));
  let p = 0;
  for (const t of alvo){
    if (tl.has(t)) p += 3;
    else if (tu.has(t)) p += 2;
  }
  if (EXPO_RE.test(link.href)) p += 1;
  return p;
}

function meta(html, props){
  for (const p of props){
    const re = new RegExp('<meta[^>]+(?:property|name)=["\']' + p + '["\'][^>]*content=["\']([^"\']+)["\']', 'i');
    const m = html.match(re);
    if (m) return m[1];
    const re2 = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]*(?:property|name)=["\']' + p + '["\']', 'i');
    const m2 = html.match(re2);
    if (m2) return m2[1];
  }
  return null;
}

/* Crédito: DELIBERADAMENTE não tenta adivinhar o fotógrafo.
 *
 * A primeira versão varria a página com regex atrás de "Foto Fulano" e colava
 * no cred. Num teste real isso pegou "Foto Rosângela Rennó" de uma página do
 * Verbo 2025 e grudou numa imagem que nem era da mostra — ou seja, atribuiria
 * a obra de uma fotógrafa a um trabalho que não é dela. Crédito errado é pior
 * que crédito ausente (POSTS.md §5.1), e uma página inteira de HTML tem "Foto"
 * demais pra esse chute ser honesto.
 *
 * Fica sempre Cortesia <venue> + CONFERIR. Quem preenche autoria é humano,
 * olhando a legenda da imagem na fonte. */
function credito(_html, venue){
  return null;
}

async function descobrir(e, v){
  const r = { t: e.t, venue: v.name, site: v.site };
  if (!v.site){ r.erro = 'venue sem site cadastrado'; return r; }

  const alvo = [...new Set([...toks(e.t.replace(/ — .*/, '')), ...toks(e.a)])];

  /* Muita galeria não linka a mostra em cartaz direto da home — o link só
     existe no índice de exposições. Varre a home mais os caminhos usuais e
     junta tudo antes de pontuar. */
  const paginas = [v.site];
  for (const p of INDICES){
    try { paginas.push(new URL(p, v.site).href); } catch {}
  }

  const colher = async modo => {
    let acc = [], vivas = 0;
    /* No estatico varre a lista toda, que é barata. No render, so a home e os
       tres indices mais comuns: catorze paginas de Chrome por mostra fariam a
       execucao inteira passar de meia hora. */
    const alvoPag = modo === 'render' ? paginas.slice(0, 4) : paginas;
    for (const u of alvoPag){
      const res = modo === 'render' ? await pegarRender(u) : await pegar(u);
      if (res.erro) continue;
      vivas++;
      acc = acc.concat(links(res.html, res.url));
    }
    return { acc, vivas };
  };

  const pesar = ls => ls
    .filter(l => l.href.startsWith('http'))
    .map(l => ({ ...l, p: pontuar(l, alvo) }))
    .filter(l => l.p >= 3)
    .sort((a, b) => b.p - a.p);

  let { acc: todos, vivas } = await colher('estatico');
  let cands = pesar(todos);

  /* Plano B. Nao se paga o custo do headless quando o caminho barato ja
     achou o link — so quando ele nao achou nada. */
  if (!cands.length){
    const rr = await colher('render');
    if (rr.vivas){ vivas += rr.vivas; r.render = true; cands = pesar(todos.concat(rr.acc)); }
  }

  if (!vivas){ r.erro = 'site fora do ar ou sem html'; return r; }
  if (!cands.length){ r.erro = 'nenhum link casou com o titulo (home + indices, ate com render)'; return r; }

  r.pagina = cands[0].href;
  r.confianca = cands[0].p;

  const OGS = ['og:image', 'twitter:image', 'twitter:image:src'];
  let pag = await pegar(r.pagina);
  /* Muito site monta as meta tags no cliente: o fetch traz o esqueleto sem
     og:image. Se faltou, vale reabrir a mesma pagina renderizada. */
  if (pag.erro || !meta(pag.html, OGS)){
    const pr = await pegarRender(r.pagina);
    if (!pr.erro){ pag = pr; r.render = true; }
  }
  if (pag.erro){ r.erro = 'pagina: ' + pag.erro; return r; }

  /* Trava contra falso positivo: o link pode ter pontuado alto e mesmo assim
     levar pra outra coisa (num teste, "Ocupação JAMAC" caiu na página do Verbo
     2025). Confere se o título da PÁGINA fala da mesma mostra antes de aceitar
     a imagem. Sem essa checagem o relatório entrega erro com cara de acerto. */
  const tituloPag = meta(pag.html, ['og:title']) ||
    (pag.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const tp = new Set(toks(tituloPag));
  r.confereTitulo = alvo.filter(t => tp.has(t)).length;
  if (!r.confereTitulo){
    r.erro = 'pagina achada nao confere com o titulo da mostra (' +
      tituloPag.replace(/\s+/g, ' ').trim().slice(0, 60) + ')';
    return r;
  }

  const og = meta(pag.html, OGS);
  if (!og){ r.erro = 'pagina sem og:image'; return r; }

  try { r.img = new URL(og, pag.url).href; } catch { r.erro = 'og:image invalida'; return r; }
  r.cred = credito(pag.html, v.name);
  return r;
}

/* ---------- relatório ---------- */

function relatorio(achados, faltas){
  const hoje = new Date().toISOString().slice(0, 10);
  let s = '# Imagens propostas — gerado em ' + hoje + '\n\n';
  s += 'Saída automática do `descobrir-imagens.js`. **Nada foi escrito no dados.js.**\n';
  s += 'Confira se a capa é a obra certa, cole o campo `img` no `dados.js` e deixe o\n';
  s += '`espelhar.js` (Action no push) baixar pra `img/`.\n\n';

  if (achados.length){
    s += '## Propostas (' + achados.length + ')\n\n';
    s += '| Mostra | Venue | `img` | `cred` | Confiança | Página |\n|---|---|---|---|---|---|\n';
    for (const a of achados){
      const cred = a.cred || '`Cortesia ' + a.venue + '` — **CONFERIR**';
      s += '| ' + a.t + ' | ' + a.venue + ' | `' + a.img + '` | ' + cred +
           ' | ' + a.confianca + ' | ' + a.pagina + ' |\n';
    }
    s += '\nConfiança é soma de tokens do título casados no link (3 = 1 palavra forte).\n';
    s += 'Abaixo de 6, olhe a página antes de aceitar.\n\n';
  }

  if (faltas.length){
    s += '## Não achou (' + faltas.length + ')\n\n';
    for (const f of faltas) s += '- **' + f.t + '** (' + f.venue + ') — ' + f.erro + '\n';
    s += '\nEssas seguem no chapado tipográfico até alguém achar a imagem na mão.\n';
  }
  return s;
}

(async () => {
  const D = carregar();
  const V = {};
  D.venues.forEach(v => V[v.name] = v);

  let alvo = D.expos.filter(e => !e.img);
  if (SO_VENUE) alvo = alvo.filter(e => norm(e.v).includes(norm(SO_VENUE)));
  if (LIMITE) alvo = alvo.slice(0, LIMITE);

  console.log(alvo.length + ' mostra(s) sem imagem na fila.\n');

  const achados = [], faltas = [];
  for (const e of alvo){
    const v = V[e.v] || { name: e.v, site: null };
    process.stdout.write('· ' + e.t.slice(0, 45) + ' … ');
    const r = await descobrir(e, v);
    if (r.img){ console.log('ok (conf ' + r.confianca + (r.render ? ', render' : '') + ')'); achados.push(r); }
    else { console.log('— ' + r.erro); faltas.push({ t: e.t, venue: v.name, erro: r.erro }); }
  }

  await fecharBrowser();

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, relatorio(achados, faltas));
  console.log('\n' + achados.length + ' proposta(s), ' + faltas.length + ' sem imagem.');
  console.log('Relatorio: ' + SAIDA);
})();
