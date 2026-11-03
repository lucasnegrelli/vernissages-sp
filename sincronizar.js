#!/usr/bin/env node
/**
 * sincronizar.js — evita o conflito entre o que se edita aqui e o que os
 * robôs do GitHub Actions gravam (dados.js, fila, métricas) todo dia.
 *
 * POR QUE ISTO EXISTE
 * Em 03/11/2026 a cópia local estava 93 commits atrás do GitHub, com um
 * rebase interrompido desde o dia anterior. O validador acusava "destaque
 * vencido" porque lia um dados.js velho. O conflito nasce de editar em cima de
 * base velha e demorar para enviar; esta rotina encurta as duas coisas.
 *
 * USO
 *   node sincronizar.js            puxa: fetch + pull --rebase --autostash.
 *                                  Roda sozinho no início de cada sessão do
 *                                  Claude Code (hook em .claude/settings.json).
 *   node sincronizar.js --enviar   puxa, roda check.js e só então dá push.
 *                                  Use logo depois de commitar, não horas depois.
 *
 * REGRAS
 *   - Rebase ou merge pendente: para e avisa. Nunca apaga .git/rebase-merge.
 *   - Conflito: para e lista os arquivos. Não resolve no escuro.
 *   - check.js reprovado: não envia.
 */
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const enviar = process.argv.includes('--enviar');
const git = (...a) => spawnSync('git', a, { cwd: RAIZ, encoding: 'utf8' });
const sai = (msg, cod = 1) => { console.log(msg); process.exit(cod); };

const G = path.join(RAIZ, '.git');
for (const d of ['rebase-merge', 'rebase-apply', 'MERGE_HEAD']) {
  if (fs.existsSync(path.join(G, d))) {
    sai(`sincronizar: há um ${d} pendente em .git. Resolva (git rebase --continue ou --abort) antes de seguir. Nada foi alterado.`);
  }
}

const f = git('fetch', '-q');
if (f.status !== 0) sai('sincronizar: sem rede ou GitHub fora; seguindo com a cópia local (pode estar velha).\n' + (f.stderr || ''), 0);

const cont = () => {
  const r = git('rev-list', '--left-right', '--count', 'HEAD...@{u}');
  const [ahead, behind] = r.stdout.trim().split(/\s+/).map(Number);
  return { ahead, behind };
};

let { ahead, behind } = cont();
if (behind > 0) {
  const p = git('pull', '--rebase', '--autostash');
  if (p.status !== 0) {
    const conf = git('diff', '--name-only', '--diff-filter=U').stdout.trim();
    sai(`sincronizar: conflito ao puxar ${behind} commit(s).\nArquivos: ${conf || '(ver git status)'}\nA cópia local ficou como estava no rebase; resolva ou rode git rebase --abort.\n${p.stderr}`);
  }
  console.log(`sincronizar: puxei ${behind} commit(s) do GitHub.`);
} else {
  console.log('sincronizar: cópia local em dia com o GitHub.');
}
({ ahead, behind } = cont());

if (!enviar) {
  const sujo = git('status', '--short').stdout.trim().split('\n').filter(Boolean).length;
  console.log(`sincronizar: ${ahead} commit(s) por enviar · ${sujo} arquivo(s) alterado(s) sem commit.`);
  process.exit(0);
}

if (ahead === 0) sai('sincronizar: nada para enviar.', 0);
const c = spawnSync('node', ['check.js'], { cwd: RAIZ, encoding: 'utf8' });
if (c.status !== 0) sai('sincronizar: check.js reprovou, não enviei.\n' + c.stdout.split('\n').filter(l => /\[E\d+\]|REPROVADO/.test(l)).join('\n'));
const s = git('push');
if (s.status !== 0) sai('sincronizar: push recusado (alguém empurrou no meio). Rode de novo.\n' + s.stderr);
console.log(`sincronizar: enviei ${ahead} commit(s).`);
