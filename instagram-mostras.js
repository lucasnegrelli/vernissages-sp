#!/usr/bin/env node
/* ============================================================
   instagram-mostras.js — lê as legendas do Instagram das casas e escreve as
   mostras no dados.js, POR REGRA, sem IA (09/11/2026)

   Por quê: o passo que decidia "este post anuncia exposição?" era o Claude
   Code dentro do instagram.yml (gasta crédito toda semana) e errava por
   omissão: a abertura de TRICKSTER (Sergio Free, A7MA, 07/11) foi raspada em
   04/11 e não virou mostra, e o post foi marcado como visto. Galeria que só
   divulga no Instagram ficava de fora do site.

   O que faz, para cada post novo (PENDENTE/instagram-novos.json):
     1. acha título, artista, abertura, encerramento e texto na legenda;
     2. só aceita se há sinal forte (palavra de exposição E data de abertura ou
        de encerramento) e a mostra está em cartaz ou abre em até 45 dias;
     3. mostra que já existe na mesma casa só é completada (fim, artista, foto);
     4. mostra nova vira linha no fim do EXPOS, com foto do carrossel
        (a PRIMEIRA imagem de cartaz é pulada; carrossel de uma imagem só
        entra sem foto) e crédito "Cortesia <casa>";
     5. o que parece mostra mas falta dado vai para a lista de dúvidas do
        resumo. Dúvida nunca vira entrada.

   A imagem fica como URL do Instagram; o espelhar.js (mesmo job) baixa para
   img/ antes de o CDN expirar.

   Uso: node instagram-mostras.js [--entrada=arquivo.json] [--seco] [--hoje=AAAA-MM-DD]
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const SECO = argv.includes('--seco');
const HOJE = flag('hoje', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
const ENTRADA = path.resolve(RAIZ, flag('entrada', path.join('PENDENTE', 'instagram-novos.json')));
const DADOS = path.join(RAIZ, 'dados.js');

const MESES = { janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12, jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12 };
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const limpa = s => String(s || '').normalize('NFKC').replace(/\r/g, '');
const dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const aspas = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/* ---------- datas ---------- */
function mesDe(txt) { const k = norm(txt).replace(/[^a-z]/g, ''); return MESES[k] || MESES[k.slice(0, 3)] || null; }
/* dia + mês (por extenso, abreviado ou numérico) a partir de um pedaço de texto */
function diaMes(trecho) {
  let m = trecho.match(/(\d{1,2})\s*(?:de\s+)?([A-Za-zçÇ]{3,9})\.?/);
  if (m && mesDe(m[2])) return { d: +m[1], m: mesDe(m[2]) };
  m = trecho.match(/(\d{1,2})\s*[\/.](\d{1,2})(?:[\/.](\d{2,4}))?/);
  if (m && +m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1 && +m[1] <= 31) return { d: +m[1], m: +m[2], a: m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : null };
  return null;
}
/* ano ausente: o do post, e se a data cair mais de 60 dias antes do post, o seguinte */
function resolveAno(dm, dataPost) {
  if (!dm) return null;
  const ap = +dataPost.slice(0, 4);
  let a = dm.a || ap;
  let r = iso(a, dm.m, dm.d);
  if (!dm.a && dias(r, dataPost) > 60) r = iso(a + 1, dm.m, dm.d);
  return r;
}

/* ---------- título e artista ---------- */
const GENERICO = /^(programa[cç][aã]o|agenda|novembro|outubro|dezembro|loja|curso|oficina|workshop|festa|sorteio|bazar|lan[cç]amento|visita|feriado|hor[aá]rio|aviso|fechad[ao])\b/i;
function tituloCase(s) {
  const letras = s.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letras.length < 3 || letras.replace(/[^A-ZÀ-Ý]/g, '').length / letras.length < 0.7) return s;
  const mini = /^(of|the|in|and|a|an|de|da|do|das|dos|e|em|na|no|para|com|por)$/;
  return s.toLowerCase().replace(/[a-zà-ÿ0-9][a-zà-ÿ0-9'’]*/g, (w, i) => (i > 0 && mini.test(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1));
}
const semEmoji = s => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/^[\s\-–—•·|:*#]+|[\s\-–—•·|:*]+$/g, '').replace(/\s+/g, ' ').trim();

function tituloEArtista(leg) {
  const linhas = leg.split('\n').map(semEmoji).filter(Boolean);
  let titulo = null, artista = null;
  /* "TÍTULO, por Artista" */
  for (const l of linhas) {
    const m = l.match(/^["“”']?(.{2,80}?)["“”']?\s*,?\s+por\s+([A-ZÀ-Ý][^@\n#]{2,70})$/);
    if (m && !/^\d/.test(m[1])) { titulo = m[1].replace(/^["“]|["”]$/g, ''); artista = m[2].trim(); break; }
  }
  /* "TÍTULO | ARTISTA" nas primeiras linhas */
  if (!titulo) {
    for (const l of linhas.slice(0, 4)) {
      if (!l.includes('|')) continue;
      let partes = l.split('|').map(x => x.trim()).filter(Boolean).filter(x => !/^(exposi[cç][aã]o|mostra|individual|coletiva)$/i.test(x));
      if (partes.length >= 1 && partes[0].length <= 80) { titulo = partes[0]; if (partes[1] && partes[1].length <= 60) artista = partes[1]; break; }
    }
  }
  /* "Exposição Título" ou "Exposição individual de Fulano" */
  if (!titulo) {
    const m = leg.match(/exposi[cç][aã]o\s+(?:individual\s+|coletiva\s+)?(?:de\s+|com\s+)?["“]([^"”\n]{2,80})["”]/i) || leg.match(/["“]([^"”\n]{3,80})["”]/);
    if (m) titulo = m[1];
  }
  if (!artista) {
    const m = leg.match(/(?:exposi[cç][aã]o|mostra)\s+(?:individual\s+)?(?:de|com)\s+([A-ZÀ-Ý][A-Za-zÀ-ÿ'’.\-]+(?:\s+(?:d[aeo]s?\s+)?[A-ZÀ-Ý][A-Za-zÀ-ÿ'’.\-]+){0,3})/);
    if (m) artista = m[1];
  }
  if (titulo) titulo = tituloCase(semEmoji(titulo));
  if (artista) artista = tituloCase(semEmoji(artista)).replace(/\s*@.*$/, '');
  return { titulo, artista };
}

/* ---------- um post -> candidata a mostra ---------- */
function lerPost(p) {
  const leg = limpa(p.legenda);
  const t = norm(leg);
  const sinal = /exposi[cç][aã]o|individual|coletiva|mostra\b|vernissage|abertura|em cartaz/i.test(leg);
  if (!sinal) return null;
  const mIni = leg.match(/(?:abertura|vernissage|inaugura[cç][aã]o)[^\n\d]{0,30}(?:dia\s+)?(\d{1,2}\s*(?:de\s+)?[A-Za-zçÇ]{3,9}\.?|\d{1,2}\s*[\/.]\s*\d{1,2}(?:[\/.]\d{2,4})?)/i);
  const mFim = leg.match(/(?:at[eé]|em cartaz at[eé]|visita[cç][aã]o at[eé]|through|until)\s*(?:o\s+dia\s+|dia\s+)?(\d{1,2}\s*(?:de\s+)?[A-Za-zçÇ]{3,9}\.?|\d{1,2}\s*[\/.]\s*\d{1,2}(?:[\/.]\d{2,4})?)/i);
  const mPeriodo = leg.match(/(\d{1,2}\s*(?:de\s+)?[A-Za-zçÇ]{3,9}\.?|\d{1,2}\s*[\/.]\s*\d{1,2})\s*(?:a|à|-|–)\s*(\d{1,2}\s*(?:de\s+)?[A-Za-zçÇ]{3,9}\.?|\d{1,2}\s*[\/.]\s*\d{1,2})/i);
  let ini = mIni ? resolveAno(diaMes(mIni[1]), p.data) : null;
  let fim = mFim ? resolveAno(diaMes(mFim[1]), p.data) : null;
  if (!ini && mPeriodo) { ini = resolveAno(diaMes(mPeriodo[1]), p.data); fim = fim || resolveAno(diaMes(mPeriodo[2]), p.data); }
  if (!ini && !fim) return { duvida: 'sem data de abertura nem de encerramento' };
  const { titulo, artista } = tituloEArtista(leg);
  if (!titulo || GENERICO.test(titulo)) return { duvida: 'sem título reconhecível' };
  const curador = (leg.match(/curadoria\s*(?:de|:)?\s*([^\n.]{3,70})/i) || [])[1] || null;
  const texto = (leg.match(/^\s*texto(?:\s+curatorial|\s+cr[ií]tico)?\s*:?\s*([^\n]{3,120})/im) || [])[1] || null;
  /* descrição: parágrafos de gente (sem serviço, endereço, hashtag) */
  const paragrafos = leg.split(/\n\s*\n/).map(x => x.replace(/\s+/g, ' ').trim()).filter(x => x.length > 70 && !/\?$/.test(x) &&!/abertura|rua |avenida|^@|#|hor[aá]rio|visita[cç][aã]o|ingresso|entrada|texto:/i.test(x.slice(0, 80)));
  let d = paragrafos.slice(0, 2).join(' ');
  if (d.length > 420) d = d.slice(0, 420).replace(/[^.!?]*$/, '').trim() || d.slice(0, 417).replace(/\s+\S*$/, '') + '…';
  if (curador && !/curadoria/i.test(d)) d += (d ? ' ' : '') + 'Curadoria de ' + curador.trim().replace(/[,.;]+$/, '') + '.';
  return { titulo, artista, ini, fim, d, curador, texto };
}

/* ---------- dados.js ---------- */
function carregar() {
  const txt = fs.readFileSync(DADOS, 'utf8');
  const win = {};
  new Function('window', txt + '\n;window.DATA=window.DATA||DATA;')(win);
  return { txt, D: win.DATA };
}
const mesmoTitulo = (a, b) => {
  const A = norm(a).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2), B = new Set(norm(b).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2));
  if (!A.length || !B.size) return false;
  return A.filter(w => B.has(w)).length / Math.min(A.length, B.size) >= 0.6;
};

function main() {
  let posts = [];
  try { posts = JSON.parse(fs.readFileSync(ENTRADA, 'utf8')); } catch (e) { console.log('sem ' + path.relative(RAIZ, ENTRADA)); return; }
  const { txt, D } = carregar();
  const linhas = txt.split('\n');
  const ini0 = linhas.findIndex(l => /^const EXPOS = \[/.test(l));
  let fim0 = ini0; while (fim0 < linhas.length && !/^\];/.test(linhas[fim0])) fim0++;
  const novas = [], completadas = [], duvidas = [], ignorados = [];
  const jaNesteLote = [];

  for (const p of posts) {
    const r = lerPost(p);
    if (!r) { ignorados.push(p.shortCode); continue; }
    if (r.duvida) { if (/exposi[cç][aã]o|individual|coletiva|vernissage/i.test(p.legenda || '')) duvidas.push(`${p.venue} ${p.url}: ${r.duvida}`); continue; }
    const nome = r.artista ? `${r.titulo} — ${r.artista}` : r.titulo;
    /* em cartaz ou abre em até 45 dias; já encerrada não entra */
    if (r.fim && r.fim < HOJE) { duvidas.push(`${p.venue} ${p.url}: "${nome}" já encerrada (${r.fim})`); continue; }
    if (r.ini && !r.fim && dias(HOJE, r.ini) > 45) { duvidas.push(`${p.venue} ${p.url}: "${nome}" abre só em ${r.ini}`); continue; }
    const imgs = p.imagens || [];
    const img = imgs.length >= 2 ? imgs[1] : '';

    const existente = (D.expos || []).find(e => e.v === p.venue && (mesmoTitulo(e.t, nome) || (r.ini && e.ini === r.ini)));
    if (existente) {
      const i = linhas.findIndex((l, k) => k > ini0 && k < fim0 && l.includes(`t:"${aspas(existente.t)}"`) && l.includes(`v:"${aspas(existente.v)}"`));
      const add = [];
      if (i >= 0) {
        if (!existente.fim && r.fim) add.push(['fim', r.fim]);
        if (!existente.a && r.artista) add.push(['a', r.artista]);
        if ((!existente.img || existente.vista) && img && !existente.img) add.push(['img', img], ['cred', 'Cortesia ' + p.venue]);
        if (add.length) {
          for (const [campo, valor] of add) {
            const re = new RegExp(`([,{])${campo}:"[^"]*"`);
            if (campo === 'fim' && /fim:null/.test(linhas[i])) linhas[i] = linhas[i].replace('fim:null', `fim:"${valor}"`);
            else if (re.test(linhas[i])) linhas[i] = linhas[i].replace(re, `$1${campo}:"${aspas(valor)}"`);
            else linhas[i] = linhas[i].replace(/\}(,?)\s*$/, `,${campo}:"${aspas(valor)}"}$1`);
          }
          completadas.push(`${p.venue}: "${existente.t}" completada com ${add.map(x => x[0]).join(', ')}`);
        }
      }
      continue;
    }
    if (jaNesteLote.some(x => x.v === p.venue && mesmoTitulo(x.t, nome))) continue;   // vários posts da mesma mostra: só um
    const d = (r.d && r.d.length >= 60 ? r.d : `Exposição${r.artista ? ' de ' + r.artista : ''} na ${p.venue}. Abertura em ${r.ini ? r.ini.split('-').reverse().join('/') : 'data não divulgada'}${r.fim ? ', em cartaz até ' + r.fim.split('-').reverse().join('/') : '; encerramento não divulgado'}.`).replace(/ — /g, ', ');
    const e = { t: nome, a: r.artista || '', v: p.venue, ini: r.ini || HOJE, fim: r.fim || null, d, img, cred: img ? 'Cortesia ' + p.venue : '' };
    jaNesteLote.push(e);
    novas.push({ e, post: p, curador: r.curador, texto: r.texto });
  }

  console.log(`instagram-mostras: ${posts.length} post(s) lido(s) · ${novas.length} mostra(s) nova(s) · ${completadas.length} completada(s) · ${duvidas.length} dúvida(s)`);
  for (const n of novas) console.log(`  NOVA  ${n.e.v}: ${n.e.t} · ${n.e.ini} a ${n.e.fim || '?'}${n.e.img ? ' · com foto' : ' · sem foto'}${n.texto ? ' · texto: ' + n.texto : ''}`);
  completadas.forEach(c => console.log('  COMPLETA  ' + c));
  duvidas.forEach(c => console.log('  DÚVIDA  ' + c));
  if (SECO) { novas.forEach(n => console.log('\n' + JSON.stringify(n.e, null, 1))); return; }

  if (novas.length) {
    const linhaDe = e => `{t:"${aspas(e.t)}",a:"${aspas(e.a)}",v:"${aspas(e.v)}",ini:"${e.ini}",fim:${e.fim ? `"${e.fim}"` : 'null'},d:"${aspas(e.d)}",img:"${aspas(e.img)}",cred:"${aspas(e.cred)}"},`;
    linhas.splice(fim0, 0, ...novas.map(n => linhaDe(n.e)));
  }
  if (novas.length || completadas.length) fs.writeFileSync(DADOS, linhas.join('\n'));
}

main();
