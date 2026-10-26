#!/usr/bin/env node
/* ============================================================
   metricas.js — placar diário do perfil, sem dependência.

   POR QUE EXISTE (26/10/2026)
   O ESTRATEGIA.md pedia "anotar toda segunda seguidores e salvamentos" e nunca
   saiu do papel porque dependia de memória. Aqui a Action anota todo dia.
   Usa só instagram_business_basic: seguidores, nº de posts, curtidas e
   comentários de cada mídia. Alcance e salvamentos exigem a permissão
   instagram_business_manage_insights (não ligada ainda).

   Saída (versionada; seguidor é número público):
     metricas/<conta>.json   uma linha por dia + foto das últimas mídias
     metricas/RESUMO.md      ritmo, projeção até a meta e ranking por formato

   Ranking por formato: cruza a mídia com fila/<conta>/<id>/post.json
   (campo midiaId, e o id "AAAA-MM-DD_formato"). Story não entra: a API não dá
   curtida de story.

   Uso: node metricas.js   (token em IG_TOKEN_<CONTA> via contas/<conta>.json)
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const API = 'https://graph.instagram.com/v23.0';
const ler = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const dias = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

async function get(caminho, params, token) {
  const u = new URL(`${API}/${caminho}`);
  u.search = new URLSearchParams({ ...params, access_token: token }).toString();
  const r = await fetch(u);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`GET ${caminho}: ${JSON.stringify(j.error || j)}`);
  return j;
}

async function coletar(arqConta) {
  const cfg = ler(path.join(RAIZ, 'contas', arqConta));
  if ((cfg.fluxo || 'instagram') !== 'instagram') return null;
  const token = process.env[cfg.tokenEnv];
  if (!token) throw new Error(`falta ${cfg.tokenEnv}`);
  const perfil = await get('me', { fields: 'username,followers_count,follows_count,media_count' }, token);
  const midias = (await get('me/media', {
    fields: 'id,media_type,media_product_type,timestamp,like_count,comments_count,permalink', limit: '50'
  }, token)).data || [];
  return { cfg, perfil, midias };
}

function formatoDe(midiaId) {
  // fila/<conta>/<id>/post.json -> "2026-10-29_agenda" -> "agenda"
  const raiz = path.join(RAIZ, 'fila');
  if (!fs.existsSync(raiz)) return null;
  for (const c of fs.readdirSync(raiz)) {
    const dc = path.join(raiz, c);
    if (!fs.statSync(dc).isDirectory()) continue;
    for (const id of fs.readdirSync(dc)) {
      const p = ler(path.join(dc, id, 'post.json'));
      if (p && p.midiaId === midiaId) return String(p.id).replace(/^\d{4}-\d{2}-\d{2}_/, '').replace(/-\d+$/, '');
    }
  }
  return null;
}

(async () => {
  const contas = fs.readdirSync(path.join(RAIZ, 'contas')).filter(f => f.endsWith('.json'));
  const resumo = [`# Métricas (gerado em ${hoje})`, ''];
  fs.mkdirSync(path.join(RAIZ, 'metricas'), { recursive: true });

  for (const arq of contas) {
    const col = await coletar(arq);
    if (!col) continue;
    const { cfg, perfil, midias } = col;
    const f = path.join(RAIZ, 'metricas', arq);
    const dado = ler(f, { conta: cfg.usuario, dias: [], midias: {} });

    const linha = { data: hoje, seguidores: perfil.followers_count, seguindo: perfil.follows_count, posts: perfil.media_count };
    dado.dias = dado.dias.filter(d => d.data !== hoje).concat(linha).sort((a, b) => a.data.localeCompare(b.data));
    for (const m of midias) {
      dado.midias[m.id] = { tipo: m.media_product_type, quando: m.timestamp, curtidas: m.like_count ?? null,
        comentarios: m.comments_count ?? 0, link: m.permalink, formato: formatoDe(m.id) || (dado.midias[m.id] || {}).formato || null };
    }
    fs.writeFileSync(f, JSON.stringify(dado, null, 2) + '\n');

    // ritmo e projeção
    const d = dado.dias;
    const ult = d[d.length - 1];
    const antes = n => { const alvo = d.filter(x => dias(x.data, hoje) >= n).pop(); return alvo ? ult.seguidores - alvo.seguidores : null; };
    const s7 = antes(7), s30 = antes(30);
    resumo.push(`## @${cfg.usuario}`, '',
      `- Seguidores hoje: **${ult.seguidores}** (${ult.posts} posts)`,
      `- Últimos 7 dias: ${s7 === null ? 'sem histórico ainda' : (s7 >= 0 ? '+' : '') + s7}`,
      `- Últimos 30 dias: ${s30 === null ? 'sem histórico ainda' : (s30 >= 0 ? '+' : '') + s30}`);
    if (s7 !== null && s7 > 0) {
      const porDia = s7 / 7;
      for (const meta of [200, 500, 1000].filter(m => m > ult.seguidores)) {
        resumo.push(`- No ritmo da última semana (${porDia.toFixed(1)}/dia), ${meta} seguidores em ~${Math.ceil((meta - ult.seguidores) / porDia)} dias`);
      }
    }

    // ranking por formato (só feed e carrossel)
    const por = {};
    for (const m of Object.values(dado.midias)) {
      if (!m.formato || m.curtidas === null) continue;
      (por[m.formato] ||= []).push(m.curtidas + m.comentarios * 3);
    }
    const rank = Object.entries(por).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length, v.length])
      .sort((a, b) => b[1] - a[1]);
    resumo.push('', '### Engajamento por formato (curtidas + 3 x comentários, média por post)', '');
    if (!rank.length) resumo.push('Ainda sem posts publicados pela fila para comparar.');
    else rank.forEach(([k, v, n]) => resumo.push(`- ${k}: ${v.toFixed(1)} (${n} post${n > 1 ? 's' : ''})`));
    resumo.push('');
    console.log(`@${cfg.usuario}: ${ult.seguidores} seguidores, ${ult.posts} posts`);
  }
  fs.writeFileSync(path.join(RAIZ, 'metricas', 'RESUMO.md'), resumo.join('\n') + '\n');
})().catch(e => { console.error(e.message); process.exit(1); });
