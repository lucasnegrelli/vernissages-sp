#!/usr/bin/env node
/* ============================================================
   copy-lint.js — confere legendas contra a voz (ESTILO.md + docs/COPY.md)

   Uso:
     node copy-lint.js arquivo.md [outro.txt ...]   confere os arquivos dados
     node copy-lint.js --recentes[=14]              confere SOCIAL/MM/DD/*LEGENDA* dos últimos N dias (padrão 14)
     node copy-lint.js --texto="uma frase qualquer"  confere um texto solto
   Opções: --aviso  mostra tudo mas nunca sai com erro (útil para olhar o histórico)

   Sai com código 1 se houver violação GRAVE (travessão, exclamação, emoji, palavra vetada,
   abertura fraca, legenda longa). Os avisos (intensidade, primeira linha sem dado etc.)
   aparecem mas não derrubam.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { lint } = require('./copy.js');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const flag = (n) => { const a = argv.find(x => x === `--${n}` || x.startsWith(`--${n}=`)); return a === undefined ? null : (a.includes('=') ? a.split('=').slice(1).join('=') : true); };
const soAviso = !!flag('aviso');

function recentes(dias) {
  const lim = new Date(Date.now() - 3 * 3600e3 - dias * 864e5).toISOString().slice(0, 10), ano = new Date().getFullYear();
  const achados = [], base = path.join(RAIZ, 'SOCIAL');
  if (!fs.existsSync(base)) return achados;
  for (const mm of fs.readdirSync(base).filter(x => /^\d\d$/.test(x))) {
    for (const dd of fs.readdirSync(path.join(base, mm)).filter(x => /^\d\d$/.test(x))) {
      /* o ano do SOCIAL é o corrente; vira o ano em janeiro e dezembro anterior conta como ano passado */
      const iso = `${(+mm > new Date().getMonth() + 2 ? ano - 1 : ano)}-${mm}-${dd}`;
      if (iso < lim) continue;
      const pasta = path.join(base, mm, dd);
      fs.readdirSync(pasta).filter(f => /LEGENDA/i.test(f) && /\.(md|txt)$/i.test(f)).forEach(f => achados.push(path.join(pasta, f)));
    }
  }
  return achados;
}

let arquivos = argv.filter(a => !a.startsWith('--')).map(a => path.resolve(a));
if (flag('recentes')) arquivos = arquivos.concat(recentes(parseInt(flag('recentes'), 10) || 14));
const texto = flag('texto');

let graves = 0, avisos = 0, total = 0;
const confere = (nome, t) => {
  total++;
  const v = lint(t, { tipo: 'legenda' });
  const g = v.filter(x => x.grave), a = v.filter(x => !x.grave);
  graves += g.length; avisos += a.length;
  if (!v.length) { console.log('ok     ' + nome); return; }
  console.log((g.length ? 'ERRO   ' : 'aviso  ') + nome);
  v.forEach(x => console.log(`         ${x.grave ? 'x' : '-'} ${x.regra}: "${x.trecho}"  (${x.dica})`));
};

if (typeof texto === 'string') confere('--texto', texto);
for (const f of arquivos) { if (!fs.existsSync(f)) { console.log('não achei ' + f); graves++; continue; } confere(path.relative(RAIZ, f), fs.readFileSync(f, 'utf8')); }
if (!total) { console.log('Nada para conferir. Passe arquivos, --recentes ou --texto="...".'); process.exit(0); }
console.log(`\n${total} texto(s) · ${graves} violação(ões) grave(s) · ${avisos} aviso(s)`);
process.exit(graves && !soAviso ? 1 : 0);
