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
  encerra:     { script: 'obra.js',        curado: false },
  estreia:     { script: 'obra.js',        curado: false },
  numero:      { script: 'numero.js',      curado: false },
  deriva:      { script: 'deriva.js',      curado: false },
  entrada:     { script: 'entrada.js',     curado: false },
  salao:       { script: 'salao.js',       curado: false }
  /* role e duracao saíram em 01/09: a deriva cobre o percurso, e o diagrama de
     duração virou o painel "O panorama", ao vivo no site. */
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

/* Formatos que escolhem UMA obra da base. Duas peças da mesma semana não podem
   cair na mesma obra — o eixo do feed é justamente a variedade de trabalho. O
   semana.js junta o que já saiu (linha `PICK t|v` do gerador) e passa adiante
   no campo `evitar`. `deriva` também escolhe obras (uma por parada). */
const FAMILIA_OBRA = new Set(['obra', 'encerra', 'estreia']);
const CONSOME_OBRA = new Set(['obra', 'encerra', 'estreia', 'deriva']);

/* ---------- memória entre semanas ----------

   Duas listas persistentes em SOCIAL/:
   - USADAS.json    · id da IDEIA -> data da última vez (mesma que o planejar.js usa)
   - POSTADAS.json  · 'titulo|venue' de cada mostra que já saiu -> data da última vez

   O planejar.js só olha USADAS, e só quando ELE monta o plano. Plano editado à
   mão passa reto — foi o que aconteceu em 13/09, quando ÇA, Céu de concreto e
   É Tempo Ainda voltaram ao feed 10 dias depois de já terem saído. Agora o
   semana.js confere as duas listas antes de gerar e escreve nelas depois. */
const USADAS_PATH = path.join(RAIZ, 'SOCIAL', 'USADAS.json');
const POSTADAS_PATH = path.join(RAIZ, 'SOCIAL', 'POSTADAS.json');
const POSTADAS_JANELA = 45;   // dias que uma mostra fica fora do feed depois de sair
const DESCANSO_IDEIA = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(RAIZ, 'REPERTORIO.json'), 'utf8')).descansoPadrao || 35; }
  catch { return 35; }
})();

const _dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00') - Date.parse(a + 'T12:00:00')) / 864e5);
const lerJson = p => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; } };
const entradas = obj => Object.entries(obj).filter(([k]) => !k.startsWith('_'));

/* Ideias do plano que saíram há menos que o descanso — contando só o que saiu
   ANTES desta semana. Registro da própria semana (re-rodar o mesmo plano) não
   conta como repetição: é a mesma trava de idempotência do planejar.js. */
function conferirIdeias(fila, usadas, planoInicio) {
  const fora = [];
  for (const p of fila) {
    const id = p.ideia || p.nome;
    if (!id || !usadas[id] || usadas[id] >= planoInicio) continue;
    const folga = _dias(usadas[id], p.data);
    if (folga >= 0 && folga < DESCANSO_IDEIA) {
      fora.push(p.data + '  ' + p.formato.padEnd(11) + id + '  — saiu há ' + folga +
        ' dia(s) (descanso: ' + DESCANSO_IDEIA + ')');
    }
  }
  return fora;
}

/* Mostras postadas dentro da janela, vistas do dia de um post. Ignora o que
   esta mesma semana registrou (>= planoInicio), senão re-rodar o plano faria
   cada peça fugir da própria escolha e trocar de obra a cada rodada. */
function mostrasRecentes(postadas, data, planoInicio) {
  return entradas(postadas)
    .filter(([, d]) => d < planoInicio && Math.abs(_dias(d, data)) <= POSTADAS_JANELA)
    .map(([k]) => k);
}

function rodar(post, plano, seco, jaEscolhidas, postadas, planoInicio) {
  const F = FORMATOS[post.formato];
  if (!F) throw new Error('formato desconhecido: ' + post.formato);

  const { caminho, novo } = prepararConfig(post, plano);

  /* `evitar` = mostras já escolhidas nesta semana + mostras postadas nos
     últimos POSTADAS_JANELA dias. Vale para tudo que escolhe obra da base
     (obra/encerra/estreia e a deriva). O gerador some com essas da escolha
     em vez de repetir; se o recorte ficar sem candidata, ele aborta e diz. */
  if (CONSOME_OBRA.has(post.formato)) {
    const recentes = mostrasRecentes(postadas || {}, post.data, planoInicio);
    const evitar = [...new Set([...jaEscolhidas, ...recentes])];
    if (evitar.length) {
      const cfg = JSON.parse(fs.readFileSync(caminho, 'utf8'));
      cfg.evitar = evitar;
      /* a chave é `titulo|casa`, e o nome da casa pode conter `|` (ex.:
         "Almeida & Dale | Millan") — corta só no primeiro. Só a família obra
         usa evitarCasa (deriva quer poder repetir casa, nunca a mesma obra). */
      if (FAMILIA_OBRA.has(post.formato)) {
        cfg.evitarCasa = jaEscolhidas.map(k => k.slice(k.indexOf('|') + 1));
      }
      fs.writeFileSync(caminho, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
    }
  }

  /* rima e aproximacao também consomem obras da semana. Elas não imprimem
     PICK (o gerador não muda), então o semana.js lê a chave do config. */
  const consumidas = [];
  if (post.formato === 'rima' || post.formato === 'aproximacao') {
    try {
      const cfg = JSON.parse(fs.readFileSync(caminho, 'utf8'));
      [cfg.a, cfg.b, cfg.obra].forEach(k => k && consumidas.push(k));
    } catch { /* config ainda não escrito — a peça vai falhar adiante */ }
  }

  if (seco) return { saida: '(seco) config pronto' + (novo ? ' — modelo copiado' : ''), arquivos: 0, picks: consumidas };

  const out = pastaDe(post.data);
  const saida = execFileSync('node', [
    path.join(RAIZ, F.script),
    '--config=' + caminho,
    '--out=' + out,
    '--date=' + post.data
  ], { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 });

  const arquivos = (saida.match(/^OK /gm) || []).length;
  const picks = (saida.match(/^PICK (.+)$/gm) || []).map(l => l.replace(/^PICK /, '')).concat(consumidas);
  return { saida: saida.trim().split('\n').filter(l => !l.startsWith('PICK ')).slice(-1)[0], arquivos, novo, picks };
}

/* ---------- execucao ---------- */

function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const seco = argv.includes('--seco');
  const forcar = argv.includes('--forcar');
  const plano = JSON.parse(fs.readFileSync(path.resolve(RAIZ, flag('plano', 'PLANO.json')), 'utf8'));
  const fila = planejadas(plano, flag('so'));

  const usadas = lerJson(USADAS_PATH);
  const postadas = lerJson(POSTADAS_PATH);
  const planoInicio = fila.length ? fila.map(p => p.data).sort()[0] : '9999-99-99';

  console.log('\nPLANO: ' + (plano.titulo || '(sem título)'));
  console.log(fila.length + ' peça(s)' + (seco ? '  ·  modo seco, nada será gerado' : '') + '\n');

  /* CONFERÊNCIA — ideias do plano que saíram há menos que o descanso. Mostra
     sempre; em geração real, aborta a não ser que venha --forcar. Repetição
     de MOSTRA (a mesma obra) não é conferida aqui: é evitada na origem, no
     campo `evitar` que o rodar() passa a cada gerador. */
  const repetidas = conferirIdeias(fila, usadas, planoInicio);
  if (repetidas.length) {
    console.log('CONFERÊNCIA — ideias repetidas dentro do descanso:');
    repetidas.forEach(l => console.log('  ! ' + l));
    console.log('');
    if (!seco && !forcar) {
      console.log('Nada foi gerado. Troque as ideias no PLANO.json (o planejar.js escolhe\n' +
        'sozinho as descansadas), ou rode `node semana.js --forcar` para gerar assim mesmo.\n');
      process.exit(1);
    }
  }

  const feitas = [], falhas = [];
  const escolhidas = [];
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
      const r = rodar(post, plano, seco, escolhidas, postadas, planoInicio);
      (r.picks || []).forEach(k => { if (!escolhidas.includes(k)) escolhidas.push(k); });
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

  /* MEMÓRIA — grava o que foi gerado de verdade. Ideia -> data em USADAS,
     mostra -> data em POSTADAS. Só as peças que saíram; falha não conta. */
  if (!seco && feitas.length) {
    const uNovo = Object.assign({}, usadas);
    const pNovo = Object.assign({}, postadas);
    for (const { post, r } of feitas) {
      const id = post.ideia || post.nome;
      if (id) uNovo[id] = post.data > (uNovo[id] || '') ? post.data : uNovo[id];
      for (const k of (r.picks || [])) {
        if (k && post.data > (pNovo[k] || '')) pNovo[k] = post.data;
      }
    }
    fs.mkdirSync(path.dirname(USADAS_PATH), { recursive: true });
    fs.writeFileSync(USADAS_PATH, JSON.stringify(uNovo, null, 2) + '\n');
    fs.writeFileSync(POSTADAS_PATH, JSON.stringify(pNovo, null, 2) + '\n');
    const nMostras = entradas(pNovo).length - entradas(postadas).length;
    console.log('\nmemória: USADAS +' + (Object.keys(uNovo).length - Object.keys(usadas).length) +
      ' · POSTADAS +' + nMostras + ' mostra(s) nova(s)');
  }

  console.log('\nA publicação continua manual. Nada foi postado.\n');
  process.exitCode = falhas.length ? 1 : 0;
}

if (require.main === module) {
  try { principal(); }
  catch (e) { console.error('\nPLANO NAO RODOU — ' + e.message + '\n'); process.exit(1); }
}
