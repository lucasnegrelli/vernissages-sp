#!/usr/bin/env node
/* ============================================================
   dia-auto.js — o dia inteiro do Instagram, sem o Lucas (27/10/2026)

   Roda todo dia no Actions (dia-auto.yml). Para o dia D (hoje, em Brasília):
     1. gera UMA peça de feed: quinta = agenda (collab); nos outros dias tenta
        encerra -> obra -> estreia e fica com a primeira que passar nas réguas
        do próprio gerador (imagem, foto nunca repete, mostra descansada)
     2. gera até 4 stories do dia (stories.js)
     3. enfileira: stories às 12:00, feed às 19:00 (publicar.js enfileirar)
   O publicar.yml (de hora em hora) posta o que venceu.

   Idempotente: se já existe fila do dia, não gera de novo.
   Curadoria (rima, aproximação, história) fica fora de propósito: depende
   de escolha humana e de texto escrito. Continuam opcionais, à mão.

   Uso: node dia-auto.js [--date=AAAA-MM-DD] [--seco] [--feed=19:00] [--story=12:00]
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = __dirname;
const args = process.argv.slice(2);
const flag = (n, d) => { const a = args.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const SECO = args.includes('--seco');
const CONTA = flag('conta', 'vernissagessp');

const hojeBR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const DATA = flag('date', hojeBR());
const [, MES, DIA] = DATA.split('-');
const PASTA = path.join(RAIZ, 'SOCIAL', MES, DIA);
const dow = new Date(DATA + 'T12:00:00Z').getUTCDay();   // 4 = quinta

const rodar = (script, a) => execFileSync(process.execPath, [path.join(RAIZ, script), ...a],
  { cwd: RAIZ, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'] });

const arquivos = () => (fs.existsSync(PASTA) ? fs.readdirSync(PASTA) : []);

function filaDoDia() {
  const d = path.join(RAIZ, 'fila', CONTA);
  return fs.existsSync(d) ? fs.readdirSync(d).filter(n => n.startsWith(DATA + '_')) : [];
}

const PALETAS = ['escuro', 'tinta', 'papel'];
function post(formato) {
  const p = { data: DATA, formato, ordem: 1, paleta: PALETAS[Number(DIA) % 3], nome: formato };
  if (formato !== 'agenda') p.textura = 0.05;
  if (formato === 'encerra') p.ajustes = { filtro: { fechaEm: 7 } };
  return p;
}

function gerarFeed() {
  const ordem = dow === 4 ? ['agenda', 'encerra', 'obra'] : ['encerra', 'obra', 'estreia'];
  const motivos = [];
  for (const f of ordem) {
    // limpa o que uma tentativa anterior deixou, para a próxima não herdar config
    for (const x of arquivos()) if (x.startsWith(f)) fs.rmSync(path.join(PASTA, x), { force: true });
    const plano = path.join(RAIZ, `.plano-dia-${DATA}.json`);
    fs.writeFileSync(plano, JSON.stringify({ titulo: 'dia-auto ' + DATA, fora: [], posts: [post(f)] }));
    let saida = '';
    try { saida = rodar('semana.js', [`--plano=${plano}`, '--forcar']); }
    catch (e) { saida = String(e.stdout || '') + String(e.stderr || '') || e.message; }
    fs.rmSync(plano, { force: true });
    const png = arquivos().some(x => x.startsWith(f) && x.endsWith('.png'));
    const leg = arquivos().some(x => /LEGENDA/i.test(x) && x.startsWith(f));
    if (png && leg) { console.log(`feed: ${f} gerado`); return f; }
    const falha = (saida.match(/FALHOU .*/) || saida.match(/ABORTADO — .*/) || [saida.trim().split('\n').pop()])[0];
    motivos.push(`${f}: ${falha}`);
    console.log(`feed: ${f} não passou (${falha})`);
  }
  console.log('feed: nenhuma peça passou nas réguas\n  ' + motivos.join('\n  '));
  return null;
}

function gerarStories() {
  try { rodar('stories.js', [`--date=${DATA}`, '--max=4']); }
  catch (e) { console.log('stories: ' + String(e.stdout || e.message).trim().split('\n').pop()); }
  console.log(`pngs na pasta do dia: ${arquivos().filter(x => x.endsWith('.png')).length}`);
}

(function principal() {
  console.log(`dia-auto ${DATA} (dow ${dow})${SECO ? ' [seco]' : ''}`);
  const ja = filaDoDia();
  if (ja.length) { console.log(`fila do dia já existe (${ja.length}): nada a fazer`); return; }
  if (SECO) { console.log('seco: pararia aqui'); return; }

  const feed = gerarFeed();
  gerarStories();
  if (!fs.existsSync(PASTA)) { console.log('nada gerado'); process.exit(1); }

  const enf = (so, q) => {
    try { console.log(rodar('publicar.js', ['enfileirar', DATA, `--conta=${CONTA}`, `--so=${so}`, `--quando=${q}`])); }
    catch (e) { console.log(`enfileirar ${so}: ` + String(e.stderr || e.message).trim().split('\n').pop()); }
  };
  enf('story', flag('story', '12:00'));
  if (feed) enf('feed', flag('feed', '19:00'));

  if (!filaDoDia().length) { console.log('nada entrou na fila'); process.exit(1); }
  if (!feed) console.log('AVISO: só stories hoje, o feed não passou nas réguas');
})();
