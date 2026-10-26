#!/usr/bin/env node
/* ============================================================
   publicar.js — fila de publicação no Instagram (Graph API). Sem dependência.

   POR QUE EXISTE (26/10/2026)
   Até aqui o social parava no arquivo: o semana.js gera PNG + legenda em
   SOCIAL/MM/DD/ e o Lucas postava na mão. Este script fecha a última ponta.
   O julgamento continua dele (olhar a peça), o resto é máquina.

   FLUXO
     1. node publicar.js enfileirar 2026-10-29 [--conta=vernissagessp] [--quando=19:00]
        Lê SOCIAL/MM/DD/, converte PNG -> JPEG (a API só aceita JPEG), tira a
        lista de Collab da legenda, grava em fila/<conta>/<data>_<tipo>/ e
        escreve post.json com o horário. Ao enfileirar, o Lucas está
        APROVANDO: é o único passo humano. Depois dá commit + push.
     2. node publicar.js rodar [--seco]
        Roda em cron (.github/workflows/publicar.yml). Publica o que já
        venceu. Mídia vai por URL pública (raw.githubusercontent.com).

   REGRAS DE SEGURANÇA
   - Post vencido há mais de 6 h NÃO sai ("ABRE HOJE" velho é pior que nada):
     fica status "perdido" e o job falha pra avisar.
   - Collab: a API aceita no máx. 3. Pega as 3 primeiras; as demais ficam
     como @ na própria legenda e o Lucas convida na mão, se quiser.
   - Collab só existe no fluxo Facebook Login (Page token, graph.facebook.com).
     Por isso este script usa esse fluxo, não o Instagram Login.
   - Multi-conta: cada conta é um arquivo em contas/<conta>.json. O token
     nunca vai pro repo: vem do ambiente (campo tokenEnv).
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
// Host por conta: fluxo "instagram" (Instagram Login, token de 60 dias) ou
// "facebook" (Página, token que não expira, aceita Collab).
const HOSTS = { instagram: 'https://graph.instagram.com/v23.0', facebook: 'https://graph.facebook.com/v23.0' };
const REPO_RAW = 'https://raw.githubusercontent.com/lucasnegrelli/vernissages-sp/main';
const JANELA_MS = 6 * 3600e3;
const MAX_COLLAB = 3;

const args = process.argv.slice(2);
const cmd = args.find(a => !a.startsWith('--'));
const flag = (n, d) => { const a = args.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const SECO = args.includes('--seco');

const ler = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const gravar = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n');
const pad = n => String(n).padStart(2, '0');

function conta(nome) {
  const f = path.join(RAIZ, 'contas', `${nome}.json`);
  if (!fs.existsSync(f)) throw new Error(`conta "${nome}" não existe (${f})`);
  return ler(f);
}

/* ---------- enfileirar ---------- */

// Separa a legenda do bloco "Convidar como Collab" que o agenda.js escreve.
function separarLegenda(txt) {
  const m = txt.split(/\n---\s*\nConvidar como Collab[^\n]*\n/);
  const legenda = m[0].trim();
  const collab = m[1] ? (m[1].match(/@[\w.]+/g) || []).map(s => s.slice(1)) : [];
  return { legenda, collab };
}

async function enfileirar() {
  const data = args.filter(a => !a.startsWith('--'))[1];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) throw new Error('uso: publicar.js enfileirar AAAA-MM-DD');
  const nomeConta = flag('conta', 'vernissagessp');
  const hora = flag('quando', conta(nomeConta).horaPadrao || '19:00');
  const [ano, mes, dia] = data.split('-');
  const pasta = path.join(RAIZ, 'SOCIAL', mes, dia);
  if (!fs.existsSync(pasta)) throw new Error(`não existe ${pasta}`);
  const sharp = require(path.join(RAIZ, '.render', 'node_modules', 'sharp'));

  const arquivos = fs.readdirSync(pasta);
  const pngs = arquivos.filter(f => /\.png$/i.test(f)).sort();
  if (!pngs.length) throw new Error('nenhum PNG nessa pasta');

  // Agrupa por formato: "obra-01.png", "obra-02.png" -> grupo "obra".
  const grupos = {};
  for (const p of pngs) (grupos[p.replace(/-\d+\.png$/i, '')] ||= []).push(p);

  const quandoISO = `${data}T${hora}:00-03:00`;
  const criados = [];
  for (const [nome, lista] of Object.entries(grupos)) {
    const meta = await sharp(path.join(pasta, lista[0])).metadata();
    const story = meta.height >= 1900;
    const leg = [`${nome}-LEGENDA.md`, 'LEGENDA.txt'].map(f => path.join(pasta, f)).find(fs.existsSync);
    const { legenda, collab } = leg && !story ? separarLegenda(fs.readFileSync(leg, 'utf8')) : { legenda: '', collab: [] };
    if (!story && !legenda) throw new Error(`${nome}: sem legenda`);

    const destinos = story ? lista.map((p, i) => [p, `${nome}-${pad(i + 1)}`]) : [[null, nome]];
    for (const [so, sufixo] of destinos) {
      const imgs = story ? [so] : lista;
      const id = `${data}_${sufixo}`;
      const dir = path.join(RAIZ, 'fila', nomeConta, id);
      fs.mkdirSync(dir, { recursive: true });
      const jpgs = [];
      for (const [i, p] of imgs.entries()) {
        const nomeJpg = `${pad(i + 1)}.jpg`;
        await sharp(path.join(pasta, p)).flatten({ background: '#000' }).jpeg({ quality: 92, mozjpeg: true })
          .toFile(path.join(dir, nomeJpg));
        jpgs.push(nomeJpg);
      }
      const post = {
        conta: nomeConta, id, status: 'aprovado',
        tipo: story ? 'story' : jpgs.length > 1 ? 'carrossel' : 'feed',
        quando: quandoISO, imagens: jpgs, legenda,
        collab: collab.slice(0, MAX_COLLAB), collabExtra: collab.slice(MAX_COLLAB),
      };
      gravar(path.join(dir, 'post.json'), post);
      criados.push(`${post.tipo.padEnd(9)} ${id}  ${jpgs.length} img  ${quandoISO}` +
        (post.collab.length ? `  collab: ${post.collab.map(c => '@' + c).join(' ')}` : ''));
    }
  }
  console.log(criados.join('\n'));
  console.log('\nPróximo passo: git add fila && git commit && git push');
}

/* ---------- publicar ---------- */

async function api(metodo, caminho, params, token, fluxo = 'instagram') {
  const url = new URL(`${HOSTS[fluxo]}/${caminho}`);
  const opt = { method: metodo };
  const body = new URLSearchParams({ ...params, access_token: token });
  if (metodo === 'GET') url.search = body.toString(); else opt.body = body;
  const r = await fetch(url, opt);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`${metodo} ${caminho}: ${JSON.stringify(j.error || j)}`);
  return j;
}

async function aguardar(id, token, fluxo) {
  for (let i = 0; i < 30; i++) {
    const { status_code, status } = await api('GET', id, { fields: 'status_code,status' }, token, fluxo);
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`container ${id}: ${status_code} ${status || ''}`);
    await new Promise(r => setTimeout(r, 4000));
  }
  throw new Error(`container ${id}: tempo esgotado`);
}

async function publicarPost(post, dir, cfg, token) {
  const url = f => `${REPO_RAW}/fila/${post.conta}/${post.id}/${f}`;
  const ig = cfg.igUserId;
  const fluxo = cfg.fluxo || 'instagram';
  const A = (m, c, p) => api(m, c, p, token, fluxo);
  // Collab só foi documentado no fluxo Facebook; no Instagram Login fica opt-in.
  const collab = cfg.collab === false ? [] : post.collab;
  let container;
  if (post.tipo === 'carrossel') {
    const filhos = [];
    for (const f of post.imagens) {
      const c = await A('POST', `${ig}/media`, { image_url: url(f), is_carousel_item: 'true' });
      filhos.push(c.id);
    }
    for (const c of filhos) await aguardar(c, token, fluxo);
    const p = { media_type: 'CAROUSEL', children: filhos.join(','), caption: post.legenda };
    if (collab.length) p.collaborators = JSON.stringify(collab);
    container = (await A('POST', `${ig}/media`, p)).id;
  } else if (post.tipo === 'story') {
    container = (await A('POST', `${ig}/media`, { media_type: 'STORIES', image_url: url(post.imagens[0]) })).id;
  } else {
    const p = { image_url: url(post.imagens[0]), caption: post.legenda };
    if (collab.length) p.collaborators = JSON.stringify(collab);
    container = (await A('POST', `${ig}/media`, p)).id;
  }
  await aguardar(container, token, fluxo);
  return (await A('POST', `${ig}/media_publish`, { creation_id: container })).id;
}

async function rodar() {
  const raiz = path.join(RAIZ, 'fila');
  if (!fs.existsSync(raiz)) return console.log('fila vazia');
  const agora = Date.now();
  const itens = [];
  for (const c of fs.readdirSync(raiz)) {
    if (!fs.statSync(path.join(raiz, c)).isDirectory()) continue;
    for (const id of fs.readdirSync(path.join(raiz, c))) {
      const dir = path.join(raiz, c, id);
      const f = path.join(dir, 'post.json');
      if (fs.existsSync(f)) itens.push({ dir, f, post: ler(f) });
    }
  }
  itens.sort((a, b) => a.post.quando.localeCompare(b.post.quando));

  let falhas = 0;
  for (const { dir, f, post } of itens) {
    if (post.status !== 'aprovado') continue;
    const t = Date.parse(post.quando);
    if (t > agora) continue;
    if (agora - t > JANELA_MS) {
      console.log(`PERDIDO  ${post.id} (venceu há mais de 6 h)`);
      if (!SECO) { post.status = 'perdido'; gravar(f, post); }
      falhas++;
      continue;
    }
    if (SECO) { console.log(`POSTARIA ${post.tipo} ${post.id}`); continue; }
    const cfg = conta(post.conta);
    const token = process.env[cfg.tokenEnv];
    if (!token) throw new Error(`falta a variável ${cfg.tokenEnv}`);
    try {
      post.midiaId = await publicarPost(post, dir, cfg, token);
      post.status = 'postado';
      post.postadoEm = new Date().toISOString();
      gravar(f, post);
      // A mídia já está no Instagram; tira os JPEG do repo pra não inchar.
      for (const img of post.imagens) fs.rmSync(path.join(dir, img), { force: true });
      console.log(`POSTADO  ${post.id} -> ${post.midiaId}`);
    } catch (e) {
      post.status = 'erro'; post.erro = String(e.message).slice(0, 500);
      gravar(f, post);
      console.error(`ERRO     ${post.id}: ${post.erro}`);
      falhas++;
    }
  }
  if (falhas) process.exit(1);
}

// Renova o token de 60 dias do Instagram Login (rodada quinzenal). O
// Instagram devolve um token NOVO a cada renovação, então o secret precisa ser
// reescrito: este comando grava o novo valor num arquivo (RENOVADO_ARQ) e a
// Action faz `gh secret set` a partir dele. O valor nunca vai pro log.
async function renovar() {
  const dir = path.join(RAIZ, 'contas');
  const saida = process.env.RENOVADO_ARQ;
  let falhas = 0;
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json'))) {
    const cfg = ler(path.join(dir, f));
    if ((cfg.fluxo || 'instagram') !== 'instagram') continue;
    const token = process.env[cfg.tokenEnv];
    if (!token) { console.error(`${f}: falta ${cfg.tokenEnv}`); falhas++; continue; }
    const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`);
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) { console.error(`${f}: ${JSON.stringify(j.error || j)}`); falhas++; continue; }
    console.log(`${f}: renovado, vale por mais ${Math.round(j.expires_in / 86400)} dias`);
    if (saida) fs.writeFileSync(saida, j.access_token);
  }
  if (falhas) process.exit(1);
}

(async () => {
  if (cmd === 'enfileirar') await enfileirar();
  else if (cmd === 'renovar') await renovar();
  else if (cmd === 'rodar') await rodar();
  else console.log('uso: publicar.js enfileirar AAAA-MM-DD | rodar [--seco] | renovar');
})().catch(e => { console.error(e.message); process.exit(1); });
