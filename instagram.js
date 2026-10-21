#!/usr/bin/env node
/**
 * instagram.js — raspa, uma vez por semana, o perfil das casas com Instagram.
 *
 * POR QUE ISTO EXISTE
 * Parte do mapa não tem site, ou tem site parado. A A7MA é o caso-modelo: a
 * agenda do site mostra um evento de 2023, e em 25/09/2026 ela abria "Passeio
 * Noturno" (André Crespo) anunciada só no Instagram. Nenhuma varredura
 * pegava, e a mostra só entrou porque o Lucas perguntou. Até 25/09 o runbook
 * proibia raspar Instagram; o Lucas derrubou a regra para este recorte: só as
 * casas marcadas `soIG: true` no dados.js, uma vez por semana.
 *
 * 29/09/2026: escopo ampliado de `soIG` para toda casa com `ig` (78 vs 18).
 * Motivo mudou: não é só achar mostra que nenhuma outra varredura pegaria —
 * é também achar FOTO DE OBRA pra mostra que já está no dados.js mas img:""
 * (o cartaz.js virou o caso mais visível disso: formato sem foto que fica
 * melhor com uma quando existe uma boa). O passo 3 do prompt já cobria isso
 * ("mostra que já existe: só complete o que falta"), só faltava a raspagem
 * chegar nessas casas. Custo Apify ainda cabe folgado no crédito grátis: ver
 * conta abaixo.
 *
 * POR QUE PELO APIFY E NÃO DIRETO
 * Testado em 25/09/2026: a rota pública do Instagram (web_profile_info)
 * devolveu 429 deslogado, do IP de casa, e 429 também logado, de dentro do
 * navegador. Raspar direto exigiria a sessão de uma conta, e é a conta que
 * leva o bloqueio. O actor `apify/instagram-post-scraper` roda com proxy
 * próprio e não encosta em conta nenhuma. Custo medido na página do actor:
 * US$ 2,70 por 1.000 posts; com POR_PERFIL=8 e ~78 perfis, o teto é ~624
 * posts/semana (~2,7 mil/mês) SE toda casa postasse o máximo toda semana —
 * na prática bem menos, a maioria não posta 8x/semana. Ainda assim, se o
 * crédito grátis apertar, baixar `--por-perfil` é o primeiro corte, não
 * voltar o escopo pra soIG.
 *
 * O QUE ELE FAZ
 * Busca os posts dos últimos dias de cada casa com `ig`, descarta os já vistos
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
  return (win.DATA.venues || []).filter(v => v.ig);
}

async function buscarApify(handles, opc) {
  const o = opc || {};
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
      resultsLimit: o.limite || POR_PERFIL,
      onlyPostsNewerThan: (o.dias || DIAS) + ' days',
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

/* ---------- modo --faltantes (21/10/2026) ----------

   O modo semanal só olha posts dos últimos 10 dias, então a mostra que abriu há
   três semanas nunca ganhava foto: o post dela já saiu da janela. Foi o que
   deixou a base com 4 fotos inéditas (regra "foto nunca repete") e 45 mostras
   sem imagem utilizável. Aqui a pergunta inverte: quais mostras em cartaz não
   têm foto de obra servível? Só os perfis dessas casas são buscados, olhando
   para trás até a abertura de cada mostra.

   Servível = arquivo local, ≥ 1400 px de largura ou cobrindo o quadro 4:5 de
   1080x1350 (a régua do obra.js), sem `vista: true`. Qualquer coisa abaixo disso conta como faltando. */
function dimensoes(buf) {
  try {
    if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') {
      const t = buf.slice(12, 16).toString('latin1');
      if (t === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (t === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      if (t === 'VP8L') { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) }; }
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
  } catch (e) { /* cai no null */ }
  return null;
}

function carregarDados() {
  const win = {};
  new Function('window', fs.readFileSync(path.join(RAIZ, 'dados.js'), 'utf8') +
               '\n;window.DATA=window.DATA||DATA;')(win);
  return win.DATA;
}

function mostrasSemFoto(DATA) {
  const hoje0 = hoje();
  const limite = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
  const comIg = {};
  (DATA.venues || []).filter(v => v.ig).forEach(v => { comIg[v.name] = v; });
  return (DATA.expos || []).filter(e => {
    if (!comIg[e.v] || e.ini > limite || (e.fim && e.fim < hoje0)) return false;
    const rel = String(e.img || '').split('?')[0].replace(/^\.?\//, '');
    if (!rel || /^https?:/i.test(rel) || e.vista) return true;
    try {
      const d = dimensoes(fs.readFileSync(path.join(RAIZ, rel)));
      return !d || (d.w < 1400 && !(d.w >= 1080 && d.h >= 1350));
    } catch (err) { return true; }
  });
}

async function faltantes() {
  const DATA = carregarDados();
  const falta = mostrasSemFoto(DATA);
  const porCasa = {};
  falta.forEach(e => { (porCasa[e.v] = porCasa[e.v] || []).push(e); });
  const nomes = Object.keys(porCasa).sort();
  console.log(falta.length + ' mostras sem foto servível em ' + nomes.length + ' casas.');
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'faltam=' + falta.length + '\n');
  if (!falta.length) return;

  const casas = (DATA.venues || []).filter(v => porCasa[v.name]);
  const porHandle = {};
  casas.forEach(v => { porHandle[v.ig.toLowerCase()] = v; });

  /* Quanto olhar para trás: da abertura mais antiga da casa, com folga de uma
     semana, no teto de 120 dias (um post mais velho que isso quase nunca é a
     mostra em cartaz). `--dias` força um valor. */
  const maisAntiga = falta.reduce((m, e) => (e.ini && e.ini < m ? e.ini : m), hoje());
  const dias = Number(flag('dias', '0')) ||
    Math.min(120, Math.ceil((Date.now() - Date.parse(maisAntiga + 'T12:00:00')) / 864e5) + 7);
  const arq = flag('arquivo');
  const lim = Number(flag('por-perfil', '30')) || 30;
  const brutos = arq ? lerJSON(path.resolve(arq), []) : await buscarApify(casas.map(v => v.ig), { dias, limite: lim });

  const posts = brutos.filter(p => !p.error && p.shortCode).map(p => {
    const v = porHandle[String(p.ownerUsername || '').toLowerCase()];
    return v && {
      venue: v.name, data: String(p.timestamp || '').slice(0, 10),
      url: p.url || 'https://www.instagram.com/p/' + p.shortCode + '/',
      tipo: p.type, legenda: limpa(p.caption), imagens: imagens(p)
    };
  }).filter(Boolean).sort((a, b) => b.data.localeCompare(a.data));
  const quebrados = brutos.filter(p => p.error).map(p => (p.username || p.inputUrl || '?') + ': ' + p.error);

  let s = '# Fotos que faltam — ' + hoje() + '\n\n';
  s += falta.length + ' mostras em cartaz sem foto de obra servível (sem `img`, abaixo de 1400 px ou `vista: true`),\n';
  s += 'em ' + nomes.length + ' casas. Posts dos últimos ' + dias + ' dias de cada casa, ' + posts.length + ' no total.\n';
  s += 'Imagens são URL de CDN do Instagram: expiram em horas.\n';
  if (quebrados.length) s += '\n## Perfis que não abriram\n\n' + quebrados.map(f => '- ' + f).join('\n') + '\n';
  for (const nome of nomes) {
    s += '\n## ' + nome + ' (@' + casas.find(v => v.name === nome).ig + ')\n\n**Mostras sem foto:**\n';
    porCasa[nome].forEach(e => {
      const motivo = !e.img ? 'sem img' : e.vista ? 'vista de sala' : 'imagem pequena (' + e.img + ')';
      s += '- ' + e.t + (e.a ? ' — ' + e.a : '') + ' · ' + (e.ini || '?') + ' a ' + (e.fim || 'sem fim') + ' · ' + motivo + '\n';
    });
    const meus = posts.filter(p => p.venue === nome);
    if (!meus.length) s += '\n(nenhum post no período)\n';
    for (const p of meus) {
      s += '\n### ' + p.data + ' · ' + p.tipo + ' · ' + p.url + '\n\n';
      s += (p.legenda || '(sem legenda)').slice(0, 700).split('\n').map(l => '> ' + l).join('\n') + '\n';
      if (p.imagens.length) s += '\nImagens:\n' + p.imagens.map((u, i) => (i + 1) + '. ' + u).join('\n') + '\n';
    }
  }
  fs.mkdirSync(DIR_PEND, { recursive: true });
  fs.writeFileSync(path.join(DIR_PEND, 'INSTAGRAM-FOTOS.md'), s);
  console.log(posts.length + ' posts -> PENDENTE/INSTAGRAM-FOTOS.md');
  if (quebrados.length) console.log('Perfis que não abriram (' + quebrados.length + '):\n  ' + quebrados.join('\n  '));
}

async function principal() {
  if (argv.includes('--marcar')) return marcar();
  if (argv.includes('--faltantes')) return faltantes();

  const casas = venues();
  if (!casas.length) { console.error('Nenhuma casa com `ig` no dados.js.'); process.exit(1); }
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
  s += casas.length + ' casas com Instagram, posts dos últimos ' + DIAS + ' dias, ' + novos.length + ' novos.\n';
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
