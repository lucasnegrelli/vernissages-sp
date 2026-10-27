#!/usr/bin/env node
/* ============================================================
   dia-auto.js — o dia inteiro do Instagram, sem o Lucas (27/10/2026)

   Roda todo dia no Actions (dia-auto.yml). Para o dia D (hoje, em Brasília):
     1. gera UMA peça de feed: quinta = agenda (collab); nos outros dias tenta
        encerra -> obra -> estreia e fica com a primeira que passar nas réguas
        do próprio gerador (imagem, foto nunca repete, mostra descansada)
     2. gera até 4 stories do dia (stories.js)
     3. enfileira: stories às 09:00, feed às 12:00 (publicar.js enfileirar).
        Quem vai visitar decide de manhã; 19h chega tarde para "abre hoje".
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
  const ordem = dow === 4 ? ['agenda', 'encerra', 'obra'] : ['encerra', 'obra', 'estreia', 'agenda'];
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
    if (png) { console.log(`feed: ${f} gerado`); return f; }
    const falha = (saida.match(/FALHOU\s+.*/) || saida.match(/ABORTADO — .*/) || [saida.replace(/\s+/g, ' ').slice(-300)])[0];
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

/* Fatos da mostra que o Claude vai usar na legenda: só o que está na base. */
function fatos(f) {
  const post = (() => { try { return JSON.parse(fs.readFileSync(path.join(RAIZ, 'SOCIAL', 'POSTADAS.json'), 'utf8')); } catch (e) { return {}; } })();
  const d = require('./rima.js').carregarDados();
  const chaves = Object.keys(post).filter(k => post[k] === DATA);
  const itens = chaves.map(k => {
    const e = d.expos.find(x => x.t + '|' + x.v === k); if (!e) return null;
    const v = d.venues.find(x => x.name === e.v) || {};
    return { titulo: e.t, artista: e.a || null, casa: e.v, instagram_da_casa: v.ig ? '@' + v.ig : null,
             bairro: v.b || null, endereco: v.addr || null, horarios: (v.ing && v.ing.obs) || null,
             abre: e.ini || null, fecha: e.fim || null, descricao: e.d || null, credito_da_foto: e.cred || null };
  }).filter(Boolean);
  fs.writeFileSync(path.join(PASTA, '_feed.json'), JSON.stringify({ data: DATA, formato: f, mostras: itens }, null, 2));
  return itens.length;
}

/* Fase 1: gera feed e stories. Deixa _feed.json para o Claude legendar. */
function fase1() {
  const feed = gerarFeed();
  gerarStories();
  if (feed) {
    // tira o que sobrou de tentativas que não foram a escolhida
    for (const x of arquivos())
      if (x.endsWith('.png') && !x.startsWith(feed) && !x.startsWith('story')) fs.rmSync(path.join(PASTA, x), { force: true });
    const n = fatos(feed);
    console.log(`feed ${feed}: ${n} mostra(s) nos fatos`);
  }
  return feed;
}

/* Fase 2: enfileira. Feed sem legenda não sai (melhor sem do que sem texto). */
function fase2(temStory, temFeed) {
  const enf = (so, q) => {
    try { console.log(rodar('publicar.js', ['enfileirar', DATA, `--conta=${CONTA}`, `--so=${so}`, `--quando=${q}`])); }
    catch (e) { console.log(`enfileirar ${so}: ` + String(e.stderr || e.message).trim().split('\n').pop()); }
  };
  if (!temStory) enf('story', flag('story', '09:00'));
  const comLegenda = arquivos().some(x => /-LEGENDA.md$/.test(x));
  const temPngFeed = arquivos().some(x => x.endsWith('.png') && !x.startsWith('story'));
  if (!temFeed && temPngFeed && comLegenda) enf('feed', flag('feed', '12:00'));
  else if (!temFeed) console.log('AVISO: sem feed hoje (sem peça ou sem legenda)');
  if (!filaDoDia().length) { console.log('nada entrou na fila'); process.exit(1); }
}

(function principal() {
  const fase = flag('fase', 'tudo');
  console.log(`dia-auto ${DATA} (dow ${dow}) fase=${fase}${SECO ? ' [seco]' : ''}`);
  const ja = filaDoDia();
  const temFeed = ja.some(n => !/story/.test(n));
  const temStory = ja.some(n => /story/.test(n));
  if (temFeed && temStory) { console.log(`fila do dia já existe (${ja.length}): nada a fazer`); return; }
  if (SECO) { console.log('seco: pararia aqui'); return; }
  if (fase === 'gerar' || fase === 'tudo') { if (!temFeed) fase1(); else gerarStories(); }
  if (fase === 'enfileirar' || fase === 'tudo') fase2(temStory, temFeed);
})();
