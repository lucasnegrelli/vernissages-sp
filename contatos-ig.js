#!/usr/bin/env node
/* ============================================================
   contatos-ig.js — pega e-mail, telefone e link da bio do Instagram das casas
   que só divulgam lá, para a abordagem comercial (serviço de site).

   POR QUE EXISTE (13/10/2026)
   Quase toda casa sem site põe o contato na bio do Instagram. A lista de leads
   tinha o nome e não tinha como falar com ninguém. Isto fecha o buraco.

   COMO
   Mesmo desenho do instagram.js: Apify, sem conta de Instagram envolvida.
   Actor: apify/instagram-profile-scraper (um item por perfil).

   PRIVACIDADE
   A saída vai pra `contatos-ig.json`, que está no .gitignore, e o workflow só a
   publica como artifact (privado, 7 dias). O repositório é público: NÃO commitar
   contato de ninguém.

   Uso:
     APIFY_TOKEN=... node contatos-ig.js                  (todas as casas candidatas)
     node contatos-ig.js --so="galeriasuperficie,a7magaleria"
     node contatos-ig.js --arquivo=saida-apify.json       (sem rede, para testar)
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const SAIDA = path.join(RAIZ, 'contatos-ig.json');
const argv = process.argv.slice(2);
const flag = (n, p) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=').slice(1).join('=') : p; };

function candidatas() {
  global.window = {};
  require(path.join(RAIZ, 'dados.js'));
  const so = flag('so', '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return (window.DATA.venues || []).filter(v => {
    if (!v.ig) return false;
    if (so.length) return so.includes(v.ig.toLowerCase());
    if (v.tipo === 'institucional' || v.tipo === 'feira') return false;
    return v.soIG || !v.site;
  });
}

async function buscarApify(handles) {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.error('Falta APIFY_TOKEN. Local: APIFY_TOKEN=... node contatos-ig.js | Nuvem: workflow contatos-ig.yml');
    process.exit(2);
  }
  const url = 'https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?timeout=280';
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ usernames: handles })
  });
  const txt = await r.text();
  if (!r.ok) { console.error('Apify respondeu ' + r.status + ': ' + txt.slice(0, 400)); process.exit(3); }
  return JSON.parse(txt);
}

const RE_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
/* telefone BR: (11) 91234-5678, 11 91234-5678, +55 11 91234 5678, 11912345678 */
const RE_FONE = /(?:\+?55\s?)?\(?\b([1-9]{2})\)?[\s.-]?(9?\d{4})[\s.-]?(\d{4})\b/g;

function textoDe(item) {
  const partes = [item.biography, item.bio, item.externalUrl, item.businessEmail, item.publicEmail,
    item.businessPhoneNumber, item.publicPhoneNumber, item.contactPhoneNumber];
  (item.externalUrls || []).forEach(u => partes.push(u && (u.url || u)));
  /* qualquer outro campo cujo nome sugira contato */
  Object.keys(item).forEach(k => { if (/mail|phone|whats|contact/i.test(k) && typeof item[k] === 'string') partes.push(item[k]); });
  return partes.filter(Boolean).join('\n');
}

function extrair(item) {
  const txt = textoDe(item);
  const emails = [...new Set((txt.match(RE_EMAIL) || []).map(e => e.toLowerCase()))]
    .filter(e => !/\.(png|jpg|jpeg|gif|webp)$/i.test(e));
  const fones = [];
  let m;
  RE_FONE.lastIndex = 0;
  while ((m = RE_FONE.exec(txt))) {
    const num = '55' + m[1] + m[2] + m[3];
    if (!fones.includes(num)) fones.push(num);
  }
  /* wa.me/55119... nas URLs da bio vale mais que qualquer outro padrão */
  const wa = (txt.match(/wa\.me\/(\d{10,13})/g) || []).map(s => s.replace('wa.me/', ''));
  wa.forEach(n => { if (!fones.includes(n)) fones.unshift(n); });
  const ehCelular = n => /^55\d{2}9\d{8}$/.test(n);
  return {
    emails,
    telefones: fones,
    whatsapp_provavel: fones.find(ehCelular) || null,
    site_bio: item.externalUrl || (item.externalUrls && item.externalUrls[0] && (item.externalUrls[0].url || item.externalUrls[0])) || null,
    bio: item.biography || item.bio || null,
    seguidores: item.followersCount != null ? item.followersCount : null,
    conta_comercial: item.isBusinessAccount != null ? item.isBusinessAccount : null,
    privado: !!item.private
  };
}

async function principal() {
  const casas = candidatas();
  const porHandle = {};
  casas.forEach(v => { porHandle[v.ig.toLowerCase()] = v; });
  const handles = Object.keys(porHandle);
  console.log(handles.length + ' perfil(is) candidato(s).');

  const arq = flag('arquivo', null);
  const brutos = arq ? JSON.parse(fs.readFileSync(path.resolve(arq), 'utf8')) : await buscarApify(handles);

  const saida = {};
  let comEmail = 0, comFone = 0;
  for (const item of brutos) {
    const h = String(item.username || item.inputUrl || '').toLowerCase().replace(/^.*instagram\.com\//, '').replace(/\/$/, '');
    const v = porHandle[h];
    if (!v) continue;
    const c = extrair(item);
    if (c.emails.length) comEmail++;
    if (c.telefones.length) comFone++;
    saida[v.name] = Object.assign({ instagram: v.ig }, c);
  }
  const faltaram = handles.filter(h => !Object.values(saida).some(s => s.instagram.toLowerCase() === h));
  fs.writeFileSync(SAIDA, JSON.stringify({ gerado: new Date().toISOString().slice(0, 10), casas: saida, sem_resposta: faltaram }, null, 2));
  console.log('Perfis lidos: ' + Object.keys(saida).length + ' · com e-mail: ' + comEmail + ' · com telefone: ' + comFone);
  if (faltaram.length) console.log('Sem resposta do Apify (handle trocado ou privado): ' + faltaram.join(', '));
  console.log('Escrito em ' + SAIDA + ' (fora do git).');
}

principal().catch(e => { console.error('ABORTADO: ' + e.message); process.exit(1); });
