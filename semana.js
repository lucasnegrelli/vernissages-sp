/* ============================================================
   SEMANA — gera todas as peças de um período de uma vez
   ============================================================

   O que faz.

   Le um plano (`PLANO.json`), roda cada peca no seu dia e guarda tudo em
   `SOCIAL/<MM>/<DD>/`. Aceita mais de uma peca por dia, continua depois de
   qualquer falha e termina com um relatorio do que saiu, do que abortou e por
   que.

   Por que existe.

   Ate 30/08 cada peca era montada a mao, uma por vez, com um `.bat` diferente.
   Isso funcionava para uma peca por dia e nao escala para duas ou tres. O
   gargalo nunca foi montar: e lembrar de montar, e lembrar do que faltou.

   O que ele NAO faz.

   Nao inventa curadoria. `rima` e `aproximacao` dependem de escolha humana —
   qual par, qual obra, onde recortar — e o plano tem de apontar para um config
   ja escrito. Se faltar, a peca falha com uma mensagem dizendo o que escrever.
   Os outros cinco formatos montam sozinhos a partir da base, e para eles o
   script copia um modelo de `modelos/` quando nao houver config no dia.

   E nao posta nada. Como sempre.

   Uso:
     node semana.js                              (usa PLANO.json)
     node semana.js --plano=OUTRO.json
     node semana.js --so=2026-09-02              (um dia so)
     node semana.js --seco                       (nao gera imagem, so confere)

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = __dirname;

/* Cada formato conhecido, com o gerador e se depende de curadoria humana. */
const FORMATOS = {
  rima:        { script: 'rima.js',        curado: true,
                 precisa: 'as duas chaves de mostra (a, b), a tese e o argumento' },
  aproximacao: { script: 'aproximacao.js', curado: true,
                 precisa: 'a chave da obra, os pontos de recorte (zooms) e a leitura' },
  obra:        { script: 'obra.js',        curado: false },
  deriva:      { script: 'deriva.js',      curado: false },
  entrada:     { script: 'entrada.js',     curado: false },
  salao:       { script: 'salao.js',       curado: false },
  role:        { script: 'role.js',        curado: false },
  duracao:     { script: 'duracao.js',     curado: false }
};

const pad = n => String(n).padStart(2, '0');
const pastaDe = data => path.join('SOCIAL', data.slice(5, 7), data.slice(8, 10));

function planejadas(plano, filtroDia) {
  const out = [];
  for (const p of plano.posts) {
    if (filtroDia && p.data !== filtroDia) continue;
    if (p.pular) continue;
    out.push(p);
  }
  return out.sort((a, b) => a.data.localeCompare(b.data) || (a.ordem || 0) - (b.ordem || 0));
}

/* Config do dia: usa o que ja existe; se nao existir e o formato nao depender
   de curadoria, copia o modelo e injeta paleta e textura do plano. */
function prepararConfig(post, plano) {
  const F = FORMATOS[post.formato];
  const pasta = path.join(RAIZ, pastaDe(post.data));
  const alvo = path.join(pasta, (post.config || post.formato) + '.json');

  if (fs.existsSync(alvo)) return { caminho: alvo, novo: false };

  if (F.curado) {
    throw new Error('falta o config curado — ' + path.relative(RAIZ, alvo) +
      '\n      escreva ' + F.precisa);
  }

  const modelo = path.join(RAIZ, 'modelos', post.formato + '.json');
  if (!fs.existsSync(modelo)) throw new Error('sem modelo em modelos/' + post.formato + '.json');

  const cfg = JSON.parse(fs.readFileSync(modelo, 'utf8'));
  if (post.paleta) cfg.paleta = post.paleta;
  if (post.textura != null) cfg.textura = post.textura;
  if (post.nome) cfg.nome = post.nome;
  Object.assign(cfg, post.ajustes || {});
  if (plano.fora && plano.fora.length) cfg.fora = (cfg.fora || []).concat(plano.fora);

  fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(alvo, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  return { caminho: alvo, novo: true };
}

function rodar(post, plano, seco) {
  const F = FORMATOS[post.formato];
  if (!F) throw new Error('formato desconhecido: ' + post.formato);

  const { caminho, novo } = prepararConfig(post, plano);
  if (seco) return { saida: '(seco) config pronto' + (novo ? ' — modelo copiado' : ''), arquivos: 0 };

  const out = pastaDe(post.data);
  const saida = execFileSync('node', [
    path.join(RAIZ, F.script),
    '--config=' + caminho,
    '--out=' + out,
    '--date=' + post.data
  ], { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 });

  const arquivos = (saida.match(/^OK /gm) || []).length;
  return { saida: saida.trim().split('\n').slice(-1)[0], arquivos, novo };
}

/* ---------- execucao ---------- */

function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const seco = argv.includes('--seco');
  const plano = JSON.parse(fs.readFileSync(path.resolve(RAIZ, flag('plano', 'PLANO.json')), 'utf8'));
  const fila = planejadas(plano, flag('so'));

  console.log('\nPLANO: ' + (plano.titulo || '(sem título)'));
  console.log(fila.length + ' peça(s)' + (seco ? '  ·  modo seco, nada será gerado' : '') + '\n');

  const feitas = [], falhas = [];
  let diaAtual = '';

  for (const post of fila) {
    if (post.data !== diaAtual) {
      diaAtual = post.data;
      const d = new Date(post.data + 'T12:00:00Z');
      const nomes = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
      console.log('── ' + post.data.slice(8) + '/' + post.data.slice(5, 7) + '  ' + nomes[d.getUTCDay()]);
    }
    const rotulo = '   ' + post.formato.padEnd(12);
    try {
      const r = rodar(post, plano, seco);
      console.log(rotulo + (r.novo ? '· modelo novo  ' : '               ') + r.saida);
      feitas.push({ post, r });
    } catch (e) {
      const msg = (e.stdout ? String(e.stdout) : '') + (e.stderr ? String(e.stderr) : '') || e.message;
      const linha = (msg.match(/ABORTADO — .*/m) || [msg.trim().split('\n')[0]])[0];
      console.log(rotulo + 'FALHOU  ' + linha.replace(/^ABORTADO — /, ''));
      falhas.push({ post, motivo: linha.replace(/^ABORTADO — /, '') });
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(feitas.length + ' peça(s) prontas · ' + falhas.length + ' falha(s)');
  const imgs = feitas.reduce((s, f) => s + f.r.arquivos, 0);
  if (!seco) console.log(imgs + ' imagens geradas');

  if (falhas.length) {
    console.log('\nO QUE FALTA:');
    for (const f of falhas) console.log('  · ' + f.post.data + '  ' + f.post.formato + '\n      ' + f.motivo.replace(/\n/g, '\n      '));
  }
  console.log('\nA publicação continua manual. Nada foi postado.\n');
  process.exitCode = falhas.length ? 1 : 0;
}

if (require.main === module) {
  try { principal(); }
  catch (e) { console.error('\nPLANO NAO RODOU — ' + e.message + '\n'); process.exit(1); }
}
