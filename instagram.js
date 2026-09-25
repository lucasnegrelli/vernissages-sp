#!/usr/bin/env node
/**
 * instagram.js — raspa, uma vez por semana, o perfil das casas que só divulgam lá.
 *
 * POR QUE ISTO EXISTE
 * Parte do mapa não tem site, ou tem site parado. A A7MA é o caso-modelo: a
 * agenda do site mostra um evento de 2023, e em 25/09/2026 ela abria "Passeio
 * Noturno" (André Crespo) anunciada só no Instagram. Nenhuma varredura
 * pegava, e a mostra só entrou porque o Lucas perguntou. Até 25/09 o runbook
 * proibia raspar Instagram; o Lucas derrubou a regra para este recorte: só as
 * casas marcadas `soIG: true` no dados.js, uma vez por semana.
 *
 * POR QUE PELO APIFY E NÃO DIRETO
 * Testado em 25/09/2026: a rota pública do Instagram (web_profile_info)
 * devolveu 429 deslogado, do IP de casa, e 429 também logado, de dentro do
 * navegador. Raspar direto exigiria a sessão de uma conta, e é a conta que
 * leva o bloqueio. O actor `apify/instagram-post-scraper` roda com proxy
 * próprio e não encosta em conta nenhuma. Custo medido na página do actor:
 * US$ 2,70 por 1.000 posts; ~20 perfis × poucos posts por semana cabe no
 * crédito grátis mensal com folga.
 *
 * O QUE ELE FAZ
 * Busca os posts dos últimos dias de cada casa `soIG`, descarta os já vistos
 * (INSTAGRAM-VISTOS.json, versionado) e escreve:
 *   PENDENTE/INSTAGRAM.md          legendas + imagens, para a rotina ler
 *   PENDENTE/instagram-novos.json  os mesmos posts, crus
 * Não escreve no dados.js. Decidir se um post anuncia mostra e escrever a
 * entrada é julgamento, e fica com a rotina (.github/prompts/instagram.md).
 *
 * Uso:
 *   APIFY_TOKEN=... node instagram.js [--dias 10] [--por-perfil 8]
 *   node instagram.js --arquivo saida-apify.json     (sem rede, para testar)
 *   node instagram.js --marcar                       (depois da rotina: novos -> vistos)
 */

'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const VISTOS = path.join(RAIZ, 'INSTAGRAM-VISTOS.json');
const DIR_PEND = path.join(RAIZ, 'PENDENTE');
const NOVOS = path.join(DIR_PEND, 'instagram-novos.json');
const RELATORIO = path.join(DIR_PEND, 'INSTAGRAM.md');

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i > -1 && argv[i + 1] ? argv[i + 1] : d; };
const DIAS = Number(flag('dias', '10')) || 10;        // semanal + 3 dias de sobreposição
const POR_PERFIL = Number(flag('por-perfil', '8')) || 8;
const GUARDA_DIAS = 120;                               // vistos mais velhos que isso saem do arquivo
const hoje = () => new Date().toISOString().slice(0, 10);

const lerJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const gravar = (f, obj) => fs.writeFileSync(f, JSON.stringify(obj, null, 1) + '\n');

/* NFKC desfaz o "negrito" de Unicode que as casas usam em legenda
   (𝗔𝗯𝗲𝗿𝘁𝘂𝗿𝗮: 𝟮𝟱.𝟬𝟵 vira "Abertura: 25.09"). Sem isso nenhuma data é lida. */
const limpa = s => String(s || '').normalize('NFKC');

function venues() {
  const win = {};
  new Function('window', fs.readFileSync(path.join(RAIZ, 'dados.js'), 'utf8') +
               '\n;window.DATA=window.DATA||DATA;')(win);
  return (win.DATA.venues || []).filter(v => v.soIG && v.ig);
}

async function buscarApify(handles) {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.error('Falta APIFY_TOKEN. Crie a conta em apify.com, copie o token em Settings > API & Integrations\n' +
                  'e rode: gh secret set APIFY_TOKEN');
    process.exit(2);
  }
  const url = 'https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items?timeout=280';
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      username: handles,
      resultsLimit: POR_PERFIL,
      onlyPostsNewerThan: DIAS + ' days',
      skipPinnedPosts: true
    })
  });
  const txt = await r.text();
  if (!r.ok) {
    console.error('Apify respondeu ' + r.status + ': ' + txt.slice(0, 400));
    process.exit(3);
  }
  return JSON.parse(txt);
}

function imagens(p) {
  if (p.type === 'Video') return [];                 // capa de reel quase nunca é obra
  const lista = (p.images && p.images.length ? p.images : [p.displayUrl]).filter(Boolean);
  return [...new Set(lista)].slice(0, 6);
}

function marcar() {
  const novos = lerJSON(NOVOS, []);
  const vistos = lerJSON(VISTOS, {});
  novos.forEach(p => { vistos[p.shortCode] = hoje(); });
  const corte = new Date(Date.now() - GUARDA_DIAS * 864e5).toISOString().slice(0, 10);
  for (const k of Object.keys(vistos)) if (vistos[k] < corte) delete vistos[k];
  gravar(VISTOS, vistos);
  console.log(novos.length + ' posts marcados como vistos (' + Object.keys(vistos).length + ' no arquivo).');
}

async function principal() {
  if (argv.includes('--marcar')) return marcar();

  const casas = venues();
  if (!casas.length) { console.error('Nenhuma casa com soIG:true no dados.js.'); process.exit(1); }
  const porHandle = {};
  casas.forEach(v => { porHandle[v.ig.toLowerCase()] = v; });

  const arq = flag('arquivo');
  const brutos = arq ? lerJSON(path.resolve(arq), []) : await buscarApify(casas.map(v => v.ig));

  /* O actor devolve um item de erro por perfil que não abriu (handle trocado,
     conta privada). Isso é informação: casa com handle morto precisa de
     correção no dados.js, não de silêncio. */
  const falhas = brutos.filter(p => p.error).map(p => (p.username || p.inputUrl || '?') + ': ' + p.error);
  const vistos = lerJSON(VISTOS, {});
  const novos = brutos
    .filter(p => !p.error && p.shortCode && !vistos[p.shortCode])
    .map(p => {
      const v = porHandle[String(p.ownerUsername || '').toLowerCase()];
      return {
        shortCode: p.shortCode,
        venue: v ? v.name : null,
        ig: p.ownerUsername,
        data: String(p.timestamp || '').slice(0, 10),
        url: p.url || 'https://www.instagram.com/p/' + p.shortCode + '/',
        tipo: p.type,
        legenda: limpa(p.caption),
        imagens: imagens(p)
      };
    })
    .filter(p => p.venue)
    .sort((a, b) => a.venue.localeCompare(b.venue) || b.data.localeCompare(a.data));

  const quebrados = new Set(brutos.filter(p => p.error).map(p => String(p.username || '').toLowerCase()));
  const semPost = casas.filter(v => !quebrados.has(v.ig.toLowerCase()) &&
    !brutos.some(p => String(p.ownerUsername || '').toLowerCase() === v.ig.toLowerCase()));

  fs.mkdirSync(DIR_PEND, { recursive: true });
  gravar(NOVOS, novos);

  let s = '# Instagram — ' + hoje() + '\n\n';
  s += casas.length + ' casas `soIG`, posts dos últimos ' + DIAS + ' dias, ' + novos.length + ' novos.\n';
  s += 'Imagens são URL de CDN do Instagram: expiram em horas. Só servem se o\n';
  s += '`espelhar.js` rodar no mesmo job (o workflow já faz isso).\n';
  if (falhas.length) s += '\n## Perfis que não abriram\n\n' + falhas.map(f => '- ' + f).join('\n') + '\n';
  if (semPost.length) s += '\n## Sem post no período\n\n' + semPost.map(v => '- ' + v.name + ' (@' + v.ig + ')').join('\n') + '\n';
  let atual = null;
  for (const p of novos) {
    if (p.venue !== atual) { atual = p.venue; s += '\n## ' + atual + '\n'; }
    s += '\n### ' + p.data + ' · ' + p.tipo + ' · ' + p.url + '\n\n';
    s += (p.legenda || '(sem legenda)').split('\n').map(l => '> ' + l).join('\n') + '\n';
    if (p.imagens.length) s += '\nImagens:\n' + p.imagens.map((u, i) => (i + 1) + '. ' + u).join('\n') + '\n';
  }
  fs.writeFileSync(RELATORIO, s);

  console.log(novos.length + ' posts novos de ' + casas.length + ' casas -> ' + path.relative(RAIZ, RELATORIO));
  /* O motivo vai por extenso no log do Actions: o relatório fica no runner e
     some, e "não abriu" pode ser handle morto ou só perfil sem post recente. */
  if (falhas.length) console.log('Perfis que não abriram (' + falhas.length + '):\n  ' + falhas.join('\n  '));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'novos=' + novos.length + '\n');
}

principal().catch(e => { console.error(e); process.exit(1); });
