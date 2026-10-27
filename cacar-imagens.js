#!/usr/bin/env node
/* ============================================================
   cacar-imagens.js — o caçador de imagens de mostra.

   POR QUE EXISTE (26/10/2026)
   47% das mostras em cartaz estavam sem imagem que passasse na régua (33 de
   70). A imagem existe: o agregador que o radar já lê traz capa e link de
   TODA mostra, e o radar jogava isso fora. Faltava (1) guardar o link da
   página de cada mostra, (2) comparar candidatos de várias fontes em vez de
   aceitar o primeiro, e (3) tirar o olho humano da triagem sem tirar o
   julgamento. Este script é a parte mecânica; o julgamento é visual e fica
   para quem olha a folha de contato (Claude, no Actions ou na conversa).

   FLUXO
     1. node cacar-imagens.js                 acha, baixa, mede, monta a folha
          -> PENDENTE/cacador/<slug>/NN.ext   candidatos
          -> PENDENTE/cacador/<slug>/folha.jpg  folha numerada (1 olhada decide)
          -> PENDENTE/cacador/fila.json       o que falta julgar
          -> acervo-imagens.json              links + candidatos (VERSIONADO)
     2. quem julga escreve PENDENTE/cacador/decisoes.json:
          { "Título|Casa": { "escolha": 2, "cred": "Cortesia X", "foco": 40,
                             "vista": false, "motivo": "..." },
            "Outro|Casa":  { "escolha": null, "motivo": "só cartaz" } }
     3. node cacar-imagens.js --aplicar       copia p/ img/, edita o dados.js,
                                              roda o check.js; reprovou, desfaz.

   FONTES (em ordem; mais entram aqui)
     aqa  Arte Que Acontece: JSON-LD (capa + link) e a página do evento
          (galeria, legenda com crédito, link oficial).

   REGRAS (as do projeto; nada é inventado)
   - Imagem que já existe e passa na régua não é tocada (use --todas p/ rever).
   - Foto repetida (md5 já no feed) é descartada antes do julgamento.
   - Crédito: nunca inventado. Sem autoria explícita, "Cortesia <casa>".
   - Espelha sempre para img/ (mesma origem, sem CORS, não expira).
   - Casa que pedir remoção: apaga o arquivo de img/ e a entrada volta ao
     campo img vazio. Sem exceção.

   Uso: node cacar-imagens.js [--seco] [--todas] [--so=fragmento] [--limite=N]
        node cacar-imagens.js --aplicar [--seco]
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const RAIZ = __dirname;
const UA = 'Mozilla/5.0 (compatible; vernissages-sp/1.0; +https://vernissagessp.com.br)';
const DADOS = path.join(RAIZ, 'dados.js');
const ACERVO = path.join(RAIZ, 'acervo-imagens.json');
const TRIAGEM = path.join(RAIZ, 'PENDENTE', 'cacador');

const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const SECO = argv.includes('--seco');
const TODAS = argv.includes('--todas');
const FALTANTES = argv.includes('--faltantes');   // só repete o que ainda não tem candidata que sirva
const SO = flag('so', '');
const LIMITE = parseInt(flag('limite', '0'), 10);

const lerJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&#?\w+;/g, ' ')
  .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const decod = s => String(s || '').replace(/&#8220;|&#8221;|&quot;/g, '"').replace(/&#8217;|&#8216;/g, "'")
  .replace(/&#038;|&amp;/g, '&').replace(/&#8211;|&#8212;/g, '-').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const chave = e => `${e.t}|${e.v}`;
const baseNome = e => slug(e.t.replace(/ — .*/, '') + '-' + e.v);

function sharp() {
  for (const t of [path.join(process.env.RENDER_DIR || path.join(RAIZ, '.render'), 'node_modules', 'sharp'), 'sharp']) {
    try { return require(t); } catch { /* próximo */ }
  }
  throw new Error('sharp não encontrado (RENDER_DIR ou .render/node_modules)');
}

/* ---------- régua (espelho do obra.js; ver lá o porquê de cada número) ---------- */
function avalia(d) {
  const res = d.w >= 1400 || (d.w >= 1080 && d.h >= 1350);
  const prop = d.w / d.h;
  return { serveObra: res && prop <= 1.28, serveComFoco: res && prop <= 2.08, serveSite: d.w >= 700 };
}

/* ---------- rede ---------- */
async function pegar(url, bin) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    if (!r.ok) return { erro: `HTTP ${r.status}` };
    return bin ? { buf: Buffer.from(await r.arrayBuffer()), tipo: (r.headers.get('content-type') || '').split(';')[0] }
      : { html: await r.text() };
  } catch (e) { return { erro: String(e.message || e).slice(0, 60) }; }
}

/* ---------- fonte: Arte Que Acontece ---------- */
async function aqaEventos() {
  const hoje = new Date(Date.now() - 3 * 3600e3);
  const meses = [];
  for (let i = -1; i <= 3; i++) { const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() + i, 1)); meses.push(d.toISOString().slice(0, 7)); }
  const urls = ['https://artequeacontece.com.br/eventos/categoria/sao-paulo/', ...meses.map(m => `https://artequeacontece.com.br/eventos/categoria/sao-paulo/${m}/`)];
  const vistos = new Map();
  for (const u of urls) {
    const r = await pegar(u);
    if (r.erro) continue;
    for (const m of r.html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      let j; try { j = JSON.parse(m[1]); } catch { continue; }
      for (const x of (Array.isArray(j) ? j : (j['@graph'] || [j]))) {
        if (x['@type'] !== 'Event' || !x.url || vistos.has(x.url)) continue;
        vistos.set(x.url, { nome: decod(x.name), url: x.url, capa: x.image || '', local: decod(x.location && x.location.name) });
      }
    }
  }
  return [...vistos.values()];
}

function casar(e, eventos) {
  const titulo = norm(e.t.split(/ — | – |: /)[0]);
  const artista = norm((e.a || '').split(',')[0]);
  const casa = norm(e.v).split(' ')[0];
  if (titulo.length < 4) return null;
  const doLocal = x => norm(x.local).includes(casa) || norm(x.nome).includes(casa);
  return eventos.find(x => norm(x.nome).includes(titulo) && doLocal(x))
    || (artista.length > 5 ? eventos.find(x => norm(x.nome).includes(artista) && doLocal(x)) : null) || null;
}

/* original de um upload do WordPress: tira o sufixo -WxH que o tema acrescenta */
const original = u => u.replace(/-\d+x\d+(\.\w+)$/, '$1');
const ehLixo = u => /logo|avatar|icon|favicon|cropped-|tribe|placeholder|\.gif|\.svg|banner-site|whatsapp/i.test(u);

async function paginaEvento(url) {
  const r = await pegar(url);
  if (r.erro) return { erro: r.erro, imgs: [], cred: '', oficial: '' };
  const h = r.html;
  const imgs = new Set();
  for (const m of h.matchAll(/(?:src|data-src|data-lazy-src|href)=["'](https?:\/\/[^"']+\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"']+\.(?:jpe?g|png|webp))["']/gi)) imgs.add(original(m[1]));
  for (const m of h.matchAll(/srcset=["']([^"']+)["']/gi)) for (const p of m[1].split(',')) { const u = p.trim().split(/\s+/)[0]; if (/wp-content\/uploads/.test(u)) imgs.add(original(u)); }
  // legenda: <figcaption> / wp-caption-text, ou o [caption] que vem dentro do link de agenda
  const legs = [...h.matchAll(/<(?:figcaption|p)[^>]*wp-caption-text[^>]*>([^<]{3,200})</gi)].map(m => decod(m[1]).trim());
  const cal = h.match(/details=([^"&]+)/);
  if (cal) { try { const d = decodeURIComponent(cal[1].replace(/\+/g, ' ')); for (const m of d.matchAll(/\[caption[^\]]*\](?:<img[^>]*>)?\s*([^\[]{3,200})\[\/caption\]/g)) legs.push(decod(m[1]).trim()); } catch { /* ignora */ } }
  const oficial = (h.match(/href=["'](https?:\/\/(?!(?:www\.)?artequeacontece|www\.google|outlook|calendar|facebook|instagram|twitter|wa\.me)[^"']+)["'][^>]*>\s*(?:site|saiba|mais|ingress|oficial)/i) || [])[1] || '';
  return { imgs: [...imgs].filter(u => !ehLixo(u)), cred: legs[0] || '', oficial };
}


/* ---------- fonte: site da própria casa (motor do descobrir-imagens.js) ---------- */
let _desc = null;
async function siteDaCasa(e, v) {
  if (!v || !v.site) return null;
  _desc = _desc || require('./descobrir-imagens.js');
  const r = await _desc.descobrir(e, v);
  if (!r.pagina) return { erro: r.erro };
  // além da melhor, todas as candidatas da página (galeria, imprensa)
  let pag = await _desc.pegar(r.pagina);
  if (pag.erro || !/<img|srcset/i.test(pag.html || '')) { const pr = await _desc.pegarRender(r.pagina); if (!pr.erro) pag = pr; }
  const extras = pag.erro ? [] : _desc.candidatas(pag.html, pag.url).map(c => c.url);
  return { pagina: r.pagina, confianca: r.confianca, imgs: [...new Set([r.img, ...extras].filter(Boolean))].slice(0, 10), cred: r.cred || '' };
}


/* Miniatura -> original. Listagem de galeria serve 600 px; o arquivo grande
   está um parâmetro adiante. Tenta as variantes da maior para a menor e fica
   com a primeira que responde. Artlogic/Cloudinary (w_600,c_limit) nunca
   amplia além do arquivo real, então pedir w_2600 é seguro. */
function variantes(u) {
  const v = [];
  if (/[/,]w_\d+/.test(u)) v.push(u.replace(/w_\d+/, 'w_2600').replace(/h_\d+/, 'h_2600'));
  if (/-\d+x\d+\.\w+(\?|$)/.test(u)) v.push(u.replace(/-\d+x\d+(\.\w+)/, '$1'));
  if (/[?&](w|width)=\d+/.test(u)) v.push(u.replace(/([?&](?:w|width)=)\d+/, '$12600'));
  if (/[?&]format=\d+w/.test(u)) v.push(u.replace(/format=\d+w/, 'format=2500w'));
  if (/_\d+x(\d+)?\./.test(u)) v.push(u.replace(/_\d+x(\d+)?\./, '.'));
  v.push(u);
  return [...new Set(v)];
}

/* ---------- candidatos ---------- */
async function baixarCandidatos(e, urls, pasta, existentes = [], fonte = 'aqa') {
  const S = sharp();
  fs.mkdirSync(pasta, { recursive: true });
  const jaVistos = new Set(existentes.map(c => c.md5)), saida = [];
  const fotosVetadas = (() => { try { return require('./rima.js').fotosVetadas ? require('./rima.js').fotosVetadas() : new Map(); } catch { return new Map(); } })();
  let n = existentes.length;
  for (let url of urls) {
    let r = null;
    for (const tentativa of variantes(url)) {
      const t = await pegar(tentativa, true);
      if (!t.erro && /^image\//.test(t.tipo) && t.buf.length >= 15000) { r = t; url = tentativa; break; }
    }
    if (!r) continue;
    const md5 = crypto.createHash('md5').update(r.buf).digest('hex');
    if (jaVistos.has(md5)) continue; jaVistos.add(md5);
    let d; try { const m = await S(r.buf).metadata(); d = { w: m.width, h: m.height }; } catch { continue; }
    n++;
    const ext = ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' })[r.tipo] || '.jpg';
    const arq = `${String(n).padStart(2, '0')}${ext}`;
    fs.writeFileSync(path.join(pasta, arq), r.buf);
    saida.push({ n, arquivo: arq, url, md5, fonte, ...d, kb: Math.round(r.buf.length / 1024), ...avalia(d),
      jaNoFeed: fotosVetadas.get ? (fotosVetadas.get(md5) || null) : null });
  }
  return saida;
}

async function folhaDeContato(pasta, cands) {
  if (!cands.length) return null;
  const S = sharp();
  const H = 440, PAD = 14, POR_LINHA = 4;
  const itens = [];
  for (const c of cands) {
    const buf = await S(path.join(pasta, c.arquivo)).resize({ height: H, width: 520, fit: 'inside' }).jpeg({ quality: 82 }).toBuffer();
    const m = await S(buf).metadata();
    itens.push({ c, buf, w: m.width, h: m.height });
  }
  const linhas = [];
  for (let i = 0; i < itens.length; i += POR_LINHA) linhas.push(itens.slice(i, i + POR_LINHA));
  const larg = Math.max(...linhas.map(l => l.reduce((a, x) => a + x.w + PAD, PAD)));
  const alt = linhas.length * (H + 34 + PAD) + PAD;
  const comp = [];
  linhas.forEach((l, li) => {
    let x = PAD; const y = PAD + li * (H + 34 + PAD);
    for (const it of l) {
      comp.push({ input: it.buf, left: x, top: y });
      const rotulo = `${it.c.n}   ${it.c.w}x${it.c.h}${it.c.serveObra ? '  obra ok' : it.c.serveComFoco ? '  precisa foco' : ''}${it.c.jaNoFeed ? '  JA NO FEED' : ''}`;
      comp.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(it.w, 260)}" height="30"><rect width="100%" height="30" fill="#111"/><text x="8" y="21" font-size="17" font-family="Arial,Helvetica,sans-serif" fill="#fff">${rotulo}</text></svg>`), left: x, top: y + H + 2 });
      x += it.w + PAD;
    }
  });
  const out = path.join(pasta, 'folha.jpg');
  await S({ create: { width: larg, height: alt, channels: 3, background: '#222' } }).composite(comp).jpeg({ quality: 85 }).toFile(out);
  return out;
}

/* ---------- dados.js ---------- */
function carregarDados() {
  const txt = fs.readFileSync(DADOS, 'utf8');
  const win = {};
  new Function('window', txt + '\n;window.DATA=window.DATA||DATA;')(win);
  return { txt, D: win.DATA };
}

async function medirAtual(e) {
  if (!e.img || /^https?:/i.test(e.img)) return null;
  const f = path.join(RAIZ, e.img);
  if (!fs.existsSync(f)) return null;
  try { const m = await sharp()(f).metadata(); return { w: m.width, h: m.height }; } catch { return null; }
}

/* ---------- principal ---------- */
async function cacar() {
  const { D } = carregarDados();
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  const vivas = (D.expos || []).filter(e => (!e.fim || e.fim >= hoje) && !e.cartaz);
  const alvos = [];
  for (const e of vivas) {
    if (SO && !norm(e.t + ' ' + e.v).includes(norm(SO))) continue;
    const d = await medirAtual(e);
    const bom = d && avalia(d).serveObra || (d && e.foco != null && avalia(d).serveComFoco);
    if (TODAS || !e.img || !bom) alvos.push(e);
  }
  const lista = LIMITE ? alvos.slice(0, LIMITE) : alvos;
  console.log(`mostras vivas: ${vivas.length} · precisam de imagem: ${alvos.length}${LIMITE ? ` (processando ${lista.length})` : ''}`);

  const eventos = await aqaEventos();
  console.log(`agregador: ${eventos.length} eventos`);
  const acervo = lerJSON(ACERVO, {});
  let fila = FALTANTES ? lerJSON(path.join(TRIAGEM, 'fila.json'), []) : [];
  let achadas = 0, puladasRecentes = 0;

  const V = {}; (D.venues || []).forEach(v => V[v.name] = v);
  for (const e of lista) {
    const k = chave(e);
    const reg = acervo[k] = acervo[k] || { links: {}, candidatos: [] };
    if (FALTANTES && (reg.candidatos || []).some(c => c.serveObra || c.serveComFoco)) continue;
    // recusada há pouco (só logo/banner/genérica): não re-julga toda semana; --todas ou --so forçam
    if (!TODAS && !SO && reg.sem && reg.semEm && (Date.parse(hoje) - Date.parse(reg.semEm)) / 864e5 < 14) { puladasRecentes++; continue; }
    const pasta = path.join(TRIAGEM, baseNome(e));
    const ev = casar(e, eventos);
    let cands = [], credLegenda = null;

    if (ev) {
      reg.links.aqa = ev.url;
      const pg = await paginaEvento(ev.url);
      if (pg.oficial) reg.links.oficial = pg.oficial;
      credLegenda = pg.cred || null;
      const urls = [...new Set([...(ev.capa ? [original(ev.capa)] : []), ...pg.imgs])];
      if (SECO) console.log(`  [seco] aqa  ${e.t.slice(0, 44)} · ${urls.length} cand`);
      else { fs.rmSync(pasta, { recursive: true, force: true }); cands = await baixarCandidatos(e, urls, pasta, [], 'aqa'); }
    } else if (!SECO) fs.rmSync(pasta, { recursive: true, force: true });

    // fonte 2: só se o agregador não entregou nada que sirva (poupa Chrome e tempo)
    if (!SECO && !cands.some(c => c.serveObra || c.serveComFoco)) {
      const st = await siteDaCasa(e, V[e.v]);
      if (st && st.pagina) {
        reg.links.site = st.pagina; reg.links.siteConfianca = st.confianca;
        const mais = await baixarCandidatos(e, st.imgs, pasta, cands, 'site');
        cands = cands.concat(mais);
        credLegenda = credLegenda || st.cred || null;
      } else if (st && st.erro) reg.links.siteErro = st.erro;
    }
    if (SECO) continue;
    if (!cands.length) { console.log(`  nenhuma imagem · ${e.t.slice(0, 48)} · ${e.v}`); continue; }
    const folha = await folhaDeContato(pasta, cands);
    reg.candidatos = cands.map(({ n, url, md5, fonte, w, h, kb, serveObra, serveComFoco }) => ({ n, url, md5, fonte, w, h, kb, serveObra, serveComFoco }));
    reg.credLegenda = credLegenda;
    reg.atualizado = hoje;
    achadas++;
    console.log(`  ${cands.length} cand · ${cands.filter(c => c.serveObra).length} servem · ${e.t.slice(0, 40)} · ${e.v}`);
    fila = fila.filter(x => x.key !== k);
    fila.push({ key: k, t: e.t, a: e.a || '', v: e.v, d: (e.d || '').slice(0, 220), pasta: path.relative(RAIZ, pasta), folha: path.relative(RAIZ, folha),
      credLegenda, links: reg.links, candidatos: reg.candidatos });
    fs.mkdirSync(TRIAGEM, { recursive: true });
    fs.writeFileSync(path.join(TRIAGEM, 'fila.json'), JSON.stringify(fila, null, 2) + '\n');
    fs.writeFileSync(ACERVO, JSON.stringify(acervo, null, 2) + '\n');
  }
  try { if (_desc) await _desc.fecharBrowser(); } catch { /* ok */ }
  if (!SECO) {
    fs.mkdirSync(TRIAGEM, { recursive: true });
    fs.writeFileSync(path.join(TRIAGEM, 'fila.json'), JSON.stringify(fila, null, 2) + '\n');
    fs.writeFileSync(ACERVO, JSON.stringify(acervo, null, 2) + '\n');
    console.log(`\n${achadas} mostra(s) com candidatos. Fila: PENDENTE/cacador/fila.json. Julgue as folhas e escreva decisoes.json.`);
  }
}

/* ---------- aplicar decisões ---------- */
const escapar = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

function editarLinha(linha, campos) {
  let l = linha;
  for (const [campo, valor] of Object.entries(campos)) {
    const valorRe = '(?:"(?:[^"\\\\]|\\\\.)*"|[^,}]+)';   // string com escapes, ou número/booleano
    const re = new RegExp(`([,{])${campo}:${valorRe}`);
    if (valor === null) { l = l.replace(new RegExp(`,${campo}:${valorRe}`), ''); continue; }   // remove o campo
    const literal = typeof valor === 'string' ? `"${escapar(valor)}"` : String(valor);
    if (re.test(l)) l = l.replace(re, `$1${campo}:${literal}`);
    else l = l.replace(/\}(,?)\s*$/, `,${campo}:${literal}}$1`);
  }
  return l;
}

async function aplicar() {
  const dec = lerJSON(path.join(TRIAGEM, 'decisoes.json'), null);
  const fila = lerJSON(path.join(TRIAGEM, 'fila.json'), []);
  if (!dec) throw new Error('falta PENDENTE/cacador/decisoes.json');
  const { txt, D } = carregarDados();
  const linhas = txt.split('\n');
  const ini = linhas.findIndex(l => /^const EXPOS = \[/.test(l));
  let fim = ini; while (fim < linhas.length && !/^\];/.test(linhas[fim])) fim++;
  const acervo = lerJSON(ACERVO, {});
  const copiados = [], feitos = [], pulados = [], salvos = new Map();

  for (const [k, d] of Object.entries(dec)) {
    const f = fila.find(x => x.key === k);
    const e = (D.expos || []).find(x => chave(x) === k);
    if (!f || !e) { pulados.push(`${k}: fora da fila`); continue; }
    if (!d.escolha) { pulados.push(`${k}: ${d.motivo || 'sem escolha'}`); const ac = (acervo[k] ||= {}); ac.sem = d.motivo || 'sem escolha'; ac.semEm = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); continue; }
    const c = f.candidatos.find(x => x.n === d.escolha);
    if (!c) { pulados.push(`${k}: candidata ${d.escolha} não existe`); continue; }
    const prefixo = String(c.n).padStart(2, '0') + '.';
    const src = path.join(RAIZ, f.pasta, fs.readdirSync(path.join(RAIZ, f.pasta)).find(n => n.startsWith(prefixo)));
    // original de 10 MB não entra no repo: acima de 2800 px (ou 3,5 MB) reduz e salva em JPEG
    const S = sharp(), meta = await S(src).metadata();
    const gigante = Math.max(meta.width, meta.height) > 2800 || fs.statSync(src).size > 3.5e6;
    const idx = linhas.findIndex((l, i) => i > ini && i < fim && l.includes(`t:"${escapar(e.t)}"`) && l.includes(`v:"${escapar(e.v)}"`));
    if (idx < 0) { pulados.push(`${k}: linha não achada no dados.js`); continue; }

    /* REGRA ANTI-DOWNGRADE (26/10/2026). Na primeira aplicação o caçador trocou um
       2560x1707 por um 494x403 e dois 2000+ px por versões menores: a mostra já tinha
       imagem e a candidata era pior. Imagem existente só sai se a nova for melhor:
         - mesma imagem (md5): mantém o arquivo, só acrescenta foco/vista;
         - a atual serve e a nova não: mantém a atual;
         - mesma classe e a nova não tem 20% mais pixels: mantém a atual. */
    let manter = false, mesma = false;
    const atualRel = e.img && !/^https?:/i.test(e.img) ? e.img : null;
    if (atualRel && fs.existsSync(path.join(RAIZ, atualRel))) {
      const bufA = fs.readFileSync(path.join(RAIZ, atualRel));
      const mA = await S(bufA).metadata();
      const av = avalia({ w: mA.width, h: mA.height }), nv = avalia({ w: c.w, h: c.h });
      const focoOk = d.foco != null || e.foco != null;
      const serveA = !e.vista && (av.serveObra || (focoOk && av.serveComFoco));   // vista de sala não serve ao `obra`
      const serveN = nv.serveObra || (d.foco != null && nv.serveComFoco);
      mesma = crypto.createHash('md5').update(bufA).digest('hex') === c.md5;
      if (mesma) manter = true;
      else if (serveA && !serveN) manter = true;
      else if (serveA === serveN && c.w * c.h <= mA.width * mA.height * 1.2) manter = true;
      if (manter && !mesma) {
        if (d.foco_da_atual != null && !SECO) linhas[idx] = editarLinha(linhas[idx], { foco: d.foco_da_atual });
        pulados.push(`${k}: mantida a atual (${mA.width}x${mA.height}) por ser melhor ou equivalente à nova (${c.w}x${c.h})${d.foco_da_atual != null ? `; foco ${d.foco_da_atual} aplicado a ela` : ''}`);
        continue;
      }
    }
    const rel = manter ? atualRel : `img/${baseNome(e)}${gigante ? '.jpg' : path.extname(src)}`;
    const campos = manter ? {} : { img: rel, cred: d.cred || `Cortesia ${e.v}` };
    if (manter) {                       // mesma imagem: só acrescenta
      if (d.foco != null) campos.foco = d.foco;
      if (d.vista) campos.vista = true;
      if (d.conferida) campos.conferida = true;
    } else {                            // imagem nova: foco, vista e conferida da antiga não valem mais
      campos.foco = d.foco != null ? d.foco : null;
      campos.vista = d.vista ? true : null;
      campos.conferida = d.conferida ? true : null;
    }
    if (!SECO) {
      if (!manter) {
        const dest = path.join(RAIZ, rel);
        if (fs.existsSync(dest)) salvos.set(dest, fs.readFileSync(dest));   // desfaz se o check.js reprovar
        else copiados.push(dest);
        if (gigante) await S(src).resize({ width: 2800, height: 2800, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90, mozjpeg: true }).toFile(dest);
        else fs.copyFileSync(src, dest);
      }
      linhas[idx] = editarLinha(linhas[idx], campos);
    }
    const a = (acervo[k] ||= {}); a.escolhida = c.n; a.img = rel; a.cred = campos.cred || e.cred || null; a.motivo = d.motivo || null;
    feitos.push(manter ? `${k} -> ${rel} (mesma imagem; só ${Object.keys(campos).join(', ') || 'nada'})` : `${k} -> ${rel} (${c.w}x${c.h})`);
  }
  console.log(feitos.map(x => '  ok  ' + x).join('\n') || '  nada aplicado');
  if (pulados.length) console.log(pulados.map(x => '  --  ' + x).join('\n'));
  if (SECO || !feitos.length) return;

  fs.writeFileSync(DADOS, linhas.join('\n'));
  try {
    execFileSync('node', ['check.js'], { cwd: RAIZ, stdio: 'pipe' });
    console.log('\ncheck.js aprovou.');
  } catch (err) {
    fs.writeFileSync(DADOS, txt);
    copiados.forEach(f => fs.rmSync(f, { force: true }));
    salvos.forEach((buf, f) => fs.writeFileSync(f, buf));
    console.error('\ncheck.js REPROVOU. dados.js e img/ voltaram ao que eram.\n' + String(err.stdout || err.message).slice(-1500));
    process.exit(1);
  }
  fs.writeFileSync(ACERVO, JSON.stringify(acervo, null, 2) + '\n');
}

(async () => {
  if (argv.includes('--aplicar')) await aplicar(); else await cacar();
})().catch(e => { console.error('ABORTADO: ' + e.message); process.exit(1); });
