#!/usr/bin/env node
/* ============================================================
   extras-fotos.js — segunda e terceira foto de uma mostra (09/11/2026)

   Por quê: a regra "foto nunca repete" no feed já gastou 35 das 48 imagens
   das mostras em cartaz; só sobravam 6. Várias galerias publicam mais de uma
   reprodução por mostra e o caçador já as achava (acervo-imagens.json), mas
   só a primeira entrava. Agora a curadoria (olhando a folha de contato)
   escolhe até duas extras por mostra, em fotos-extras.json.

   O script baixa, grava em img/<nome>-2.jpg e -3.jpg, e acrescenta os campos
   img2 e img3 na linha da mostra no dados.js. O exigirObra (rima.js) usa a
   extra quando a principal já saiu no feed. Crédito da extra: "Cortesia <casa>"
   (o crédito da principal nomeia a obra dela, não vale para outra imagem).
   Se o check.js reprovar, volta tudo.

   Uso: node extras-fotos.js [--seco]
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const RAIZ = __dirname;
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const SECO = process.argv.includes('--seco');
const UA = 'Mozilla/5.0 (compatible; vernissages-sp/1.0; +https://vernissagessp.com.br)';
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

(async () => {
  const sharp = require(path.join(REND, 'node_modules', 'sharp'));
  const spec = JSON.parse(fs.readFileSync(path.join(RAIZ, 'fotos-extras.json'), 'utf8'));
  const dadosArq = path.join(RAIZ, 'dados.js');
  const txt = fs.readFileSync(dadosArq, 'utf8');
  const linhas = txt.split('\n');
  const ini = linhas.findIndex(l => /^const EXPOS = \[/.test(l));
  let fim = ini; while (fim < linhas.length && !/^\];/.test(linhas[fim])) fim++;
  const criados = [];
  for (const it of spec.itens) {
    const [t, v] = it.chave.split('|');
    const i = linhas.findIndex((l, k) => k > ini && k < fim && l.includes(`t:"${esc(t)}"`) && l.includes(`v:"${esc(v)}"`));
    if (i < 0) { console.log('  --  fora do dados.js: ' + it.chave); continue; }
    const m = linhas[i].match(/img:"([^"]+)"/);
    if (!m) { console.log('  --  sem img principal: ' + it.chave); continue; }
    const base = m[1].replace(/\.[a-z0-9]+$/i, '');
    const campos = [];
    for (const [j, url] of it.urls.entries()) {
      const campo = 'img' + (j + 2), rel = `${base}-${j + 2}.jpg`;
      if (new RegExp(`[,{]${campo}:`).test(linhas[i])) { console.log('  ok  já tem ' + campo + ': ' + it.chave); continue; }
      const dest = path.join(RAIZ, rel);
      if (!fs.existsSync(dest)) {
        const r = await fetch(url, { headers: { 'user-agent': UA } });
        if (!r.ok) { console.log('  --  HTTP ' + r.status + ' ' + url); continue; }
        if (!SECO) { await sharp(Buffer.from(await r.arrayBuffer())).rotate().resize({ width: 2800, height: 2800, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90, mozjpeg: true }).toFile(dest); criados.push(dest); }
      }
      campos.push(`${campo}:"${rel}"`);
      console.log('  ok  ' + it.chave.slice(0, 40) + ' -> ' + rel);
    }
    if (campos.length && !SECO) linhas[i] = linhas[i].replace(/\}(,?)\s*$/, ',' + campos.join(',') + '}$1');
  }
  if (SECO) return;
  fs.writeFileSync(dadosArq, linhas.join('\n'));
  try { execFileSync('node', ['check.js'], { cwd: RAIZ, stdio: 'pipe' }); console.log('check.js aprovou.'); }
  catch (e) { fs.writeFileSync(dadosArq, txt); criados.forEach(f => fs.rmSync(f, { force: true })); console.error('check.js REPROVOU; voltou tudo.\n' + String(e.stdout || e.message).slice(-800)); process.exit(1); }
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
