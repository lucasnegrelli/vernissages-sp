#!/usr/bin/env node
/**
 * radar-ig.js — o radar de editais lendo o Instagram, via Apify.
 *
 * POR QUE ISTO EXISTE
 * Os sites de arte (radar-editais.js) dão pouco edital vivo por vez, e a maior parte do que
 * circula entre artistas — chamadas de residência, vagas de ateliê, prêmios, "editais da
 * semana" — nasce e morre no Instagram. O instagram.js já raspa os perfis das galerias, mas
 * procura mostra. Aqui o alvo são as contas que postam OPORTUNIDADE: agregadores de edital,
 * prêmios, institutos, residências (lista em radar/perfis-ig.json).
 *
 * O QUE FAZ
 * Busca os posts recentes dos perfis (um actor do Apify, mesmo do instagram.js), fica com as
 * legendas que parecem chamada, lê o prazo no texto (mesma leitura do radar-editais.js, inclusive
 * "encerra nesta segunda"), palpita categoria e escopo e grava radar/editais-perfis.json. O
 * gerar.js mostra isso na seção Radar de editais.html, com o aviso de que o prazo vem da legenda.
 *
 * O QUE NÃO FAZ
 * Não confirma nada. Uma legenda de agregador costuma listar vários editais num post só: o radar
 * trata o post como uma pista e leva o leitor ao post, onde ele confere cada item. Não escreve
 * no dados.js.
 *
 * CUSTO (apify/instagram-post-scraper, US$ 2,70 por mil posts): com 13 perfis e 10 posts por
 * perfil são ~130 posts por rodada, ~US$ 0,35. Duas rodadas por semana ficam em ~US$ 3 por mês.
 * O resumo da rodada mostra quantos posts e quantas pistas cada perfil rendeu: perfil que não
 * rende sai da lista.
 *
 * USO
 *   APIFY_TOKEN=... node radar-ig.js [--dias 6] [--por-perfil 10]
 *   node radar-ig.js --arquivo saida-apify.json     (sem rede, para testar a leitura)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { acharPrazo, prazoRelativo, categoriaDe, escopoDe, norm, HOJE } = require('./radar-editais.js');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const DIAS = Number(flag('dias', '6')) || 6;
const POR_PERFIL = Number(flag('por-perfil', '10')) || 10;
const PERFIS = path.join(RAIZ, 'radar/perfis-ig.json');
const SAIDA = path.join(RAIZ, flag('saida', 'radar/editais-perfis.json'));
const lerJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } };

/* NFKC desfaz o "negrito" de Unicode das legendas e deixa a data legível */
const limpa = s => String(s || '').normalize('NFKC');

/* o que conta como chamada. Perfil "agregador" tem gatilho amplo (é o assunto dele); perfil "org" só
   com gatilho forte, porque a instituição posta de tudo (mostra, curso, ingresso). */
const FORTE = /(edital|chamada|convocat|residencia|residency|open call|call for|inscri[cç]|bolsa|premio|prize|award|grant|fellowship|vagas?|selecao|selection|submissions?)/;
const RUIDO = /(resultado|vencedor|vencedora|ganhador|contemplad|selecionad[oa]s|conheca os|inscricoes encerradas|encerrad[oa]s?\b|parabens|winner|winners|announced|apply now closed)/;
const CONSUMO = /(ingresso|curso de|aula|oficina paga|show|espetaculo|sorteio|cupom|desconto|loja)/;

function titulo(cap) {
  const linhas = limpa(cap).split(/\n+/).map(l => l.replace(/#\S+/g, '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim()).filter(l => l.length > 6);
  let t = linhas[0] || limpa(cap).slice(0, 100);
  if (t.length > 110) t = t.slice(0, 107).replace(/\s+\S*$/, '') + '…';
  return t;
}

function lerPosts(posts, perfis) {
  const porIg = {};
  perfis.forEach(p => { porIg[p.ig.toLowerCase()] = p; });
  const rend = {};
  perfis.forEach(p => { rend[p.ig.toLowerCase()] = { posts: 0, pistas: 0 }; });
  const itens = [];
  for (const p of posts) {
    const dono = String(p.ownerUsername || '').toLowerCase();
    const perfil = porIg[dono];
    if (!perfil) continue;
    rend[dono].posts++;
    const cap = limpa(p.caption);
    if (!cap || cap.length < 40) continue;
    const t = norm(cap);
    if (RUIDO.test(t) && !/(abertas|abre|aberto|prorroga)/.test(t)) continue;
    if (CONSUMO.test(t) && !/(edital|chamada|residencia|open call)/.test(t)) continue;
    const gatilho = FORTE.test(t);
    if (!gatilho) continue;
    /* instituição: o gatilho tem de ser inequívoco (edital, chamada, residência, convocatória, prêmio com inscrição) */
    if (perfil.tipo === 'org' && !/(edital|chamada|convocat|residencia|residency|open call|inscri[cç].{0,40}(aberta|ate)|premio.{0,60}inscri)/.test(t)) continue;
    const pub = String(p.timestamp || p.takenAtTimestamp || '').slice(0, 10) || HOJE;
    const prazo = acharPrazo(cap) || prazoRelativo(cap, pub);
    if (prazo && prazo < HOJE) continue;                                  /* já venceu */
    if (!prazo && (Date.parse(HOJE) - Date.parse(pub)) / 864e5 > 21) continue;   /* sem data e velho */
    const it = { titulo: titulo(cap), resumo: cap.replace(/\s+/g, ' ').trim().slice(0, 260) };
    itens.push({
      t: it.titulo,
      fonte: 'Instagram @' + (p.ownerUsername || perfil.ig),
      link: p.url || (p.shortCode ? 'https://www.instagram.com/p/' + p.shortCode + '/' : ''),
      pub, prazo: prazo || null,
      cat: categoriaDe(it),
      onde: perfil.escopo || escopoDe(it),
      resumo: it.resumo, visto: HOJE, via: 'instagram'
    });
    rend[dono].pistas++;
  }
  return { itens, rend };
}

async function buscarApify(handles) {
  const token = process.env.APIFY_TOKEN;
  if (!token) { console.error('Falta APIFY_TOKEN (gh secret set APIFY_TOKEN).'); process.exit(2); }
  const r = await fetch('https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items?timeout=280', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ username: handles, resultsLimit: POR_PERFIL, onlyPostsNewerThan: DIAS + ' days', skipPinnedPosts: true })
  });
  const txt = await r.text();
  if (!r.ok) { console.error('Apify respondeu ' + r.status + ': ' + txt.slice(0, 400)); process.exit(3); }
  return JSON.parse(txt);
}

(async () => {
  const cfg = lerJSON(PERFIS, { perfis: [] });
  const perfis = (cfg.perfis || []).filter(p => p && p.ig);
  if (!perfis.length) { console.error('radar/perfis-ig.json sem perfis.'); process.exit(1); }
  console.log(`radar-ig · ${HOJE} · ${perfis.length} perfil(is) · ${DIAS} dias · até ${POR_PERFIL} posts por perfil`);

  const arquivo = flag('arquivo', null);
  const posts = arquivo ? lerJSON(path.resolve(arquivo), []) : await buscarApify(perfis.map(p => p.ig));
  console.log(`  posts recebidos: ${posts.length}`);

  const { itens, rend } = lerPosts(posts, perfis);

  /* o que já estava no arquivo e ainda está vivo continua (a janela é curta) */
  const antigos = (lerJSON(SAIDA, {}).itens) || [];
  const vivo = x => x.prazo ? x.prazo >= HOJE : (x.pub && (Date.parse(HOJE) - Date.parse(x.pub)) / 864e5 <= 21);
  const porLink = new Map();
  [...antigos, ...itens].forEach(x => { if (x.link && vivo(x)) porLink.set(x.link, Object.assign({}, porLink.get(x.link) || {}, x)); });
  const finais = [...porLink.values()].sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999') || (b.pub || '').localeCompare(a.pub || ''));

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify({
    gerado: HOJE,
    aviso: 'Detectado nas legendas de perfis do Instagram. O prazo vem do texto do post: confirme na fonte oficial.',
    itens: finais
  }, null, 1) + '\n');

  /* resumo: rendimento por perfil (e quem não respondeu) */
  const linhas = perfis.map(p => { const r = rend[p.ig.toLowerCase()]; return `  ${r.posts ? '✓' : '·'} @${p.ig.padEnd(34)} ${String(r.posts).padStart(3)} posts · ${String(r.pistas).padStart(2)} pistas`; });
  console.log(linhas.join('\n'));
  const mudos = perfis.filter(p => !rend[p.ig.toLowerCase()].posts).map(p => '@' + p.ig);
  if (mudos.length) console.log(`  sem posts na janela ou perfil que não abriu (confira o handle): ${mudos.join(', ')}`);
  console.log(`  ${itens.length} pista(s) nesta rodada · ${finais.length} viva(s) no arquivo · ${path.relative(RAIZ, SAIDA)}`);
})().catch(e => { console.error(e); process.exit(1); });
