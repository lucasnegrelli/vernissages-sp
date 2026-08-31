/* ============================================================
   PLANEJAR — monta o PLANO.json da semana a partir do REPERTORIO
   ============================================================

   Por que existe.

   Ate 30/08/2026 o `PLANO.json` era escrito a mao toda semana, e o resultado
   era previsivel: os mesmos sete formatos, na mesma ordem, com a mesma saida.
   O salao de 24/08 e o de 31/08 diferiam em tres obras de quarenta. A `deriva`
   saiu duas vezes na mesma semana com o percurso identico, mudando so a paleta.
   Nao era falta de formato — era falta de recorte e de memoria.

   Este script resolve as duas coisas:

   1. RECORTE. Cada ideia do `REPERTORIO.json` traz um `filtro` (implementado em
      rima.js e aplicado por salao, duracao, deriva e role). "Salao" deixa de ser
      uma peca e vira dez: a parede inteira, so galeria, so o que fecha em tres
      semanas, so o Centro, so vista de sala.

   2. MEMORIA. O `USADAS.json` guarda o dia em que cada ideia saiu. Uma ideia so
      voltaAt depois do `descanso` (35 dias por padrao). Com 50 ideias e 10 pecas
      por semana, o mes inteiro passa sem repetir.

   O que ele NAO faz, de proposito:

   - Nao escreve curadoria. `rima` e `aproximacao` sao agendadas, mas o script
     avisa que falta config e nunca inventa o par nem o recorte.
   - Nao posta nada. Ele so escreve o PLANO.json; quem gera e o semana.js, e
     quem publica e o Lucas, na mao.
   - Nao mexe no dados.js.

   Regras que ele respeita:

   - Nao repete paleta em dias seguidos (a regra do COMOGERAR.md que o plano de
     31/08 quebrava, com `barro` na sexta e no sabado).
   - Nao repete formato no mesmo dia.
   - No maximo uma peca curada por dia — sao as que custam trabalho humano.
   - Sabado ganha `role` quando ele estiver disponivel: e o dia em que a pessoa
     esta na rua decidindo.

   Uso:
     node planejar.js --seco                 mostra o plano, nao escreve
     node planejar.js                        escreve PLANO.json e USADAS.json
     node planejar.js --de=2026-09-07        semana comecando nessa data
     node planejar.js --pecas=10             quantas pecas na semana (padrao 10)
     node planejar.js --esquecer             zera o USADAS.json

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const REPERTORIO = path.join(RAIZ, 'REPERTORIO.json');
const USADAS = path.join(RAIZ, 'SOCIAL', 'USADAS.json');
const PLANO = path.join(RAIZ, 'PLANO.json');

const argv = process.argv.slice(2);
const seco = argv.includes('--seco');
const flag = (n, p) => {
  const a = argv.filter(x => x.startsWith('--' + n + '='))[0];
  return a ? a.split('=').slice(1).join('=') : p;
};

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const somar = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const distancia = (a, b) =>
  Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);

/* Proxima segunda-feira, que e onde a semana do plano comeca. */
function proximaSegunda() {
  const hoje = new Date();
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return iso(d);
}

/* ---------- estado ---------- */

function lerUsadas() {
  if (argv.includes('--esquecer')) return {};
  try { return JSON.parse(fs.readFileSync(USADAS, 'utf8')); } catch { return {}; }
}

/* ---------- escolha ----------

   Ordena as ideias pela folga: quanto mais tempo desde a ultima saida, mais na
   frente. Ideia nunca usada vem primeiro. Empate desempata por sorteio estavel
   na data, para que rodar duas vezes no mesmo dia de o mesmo plano. */
function ranquear(ideias, usadas, inicio) {
  const semente = [...inicio].reduce((s, c) => s + c.charCodeAt(0), 0);
  return ideias.map((ia, i) => {
    const ultima = usadas[ia.id];
    const folga = ultima ? distancia(ultima, inicio) : 9999;
    const ruido = ((semente * (i + 7)) % 97) / 1000;   // desempate estavel
    return { ia, folga, ordem: folga + ruido };
  }).sort((a, b) => b.ordem - a.ordem);
}

function escolherPaleta(ia, usadasNoDiaAnterior, usadasHoje) {
  const opcoes = ia.paletas || ['escuro'];
  const livre = opcoes.filter(p => !usadasNoDiaAnterior.has(p) && !usadasHoje.has(p));
  if (livre.length) return livre[0];
  const semOntem = opcoes.filter(p => !usadasNoDiaAnterior.has(p));
  return semOntem[0] || opcoes[0];
}

/* Grao entre 0,05 e 0,09, que e a faixa que o COMOGERAR.md chama de "o ponto".
   Varia com a paleta para que clara e escura nao recebam o mesmo ruido. */
const TEXTURA = { escuro: 0.05, tinta: 0.05, barro: 0.07, papel: 0.07, cal: 0.06, linho: 0.09 };

function montar(rep, usadas, inicio, quantasPecas) {
  const descanso = rep.descansoPadrao || 35;
  const ranque = ranquear(rep.ideias, usadas, inicio);

  /* Descansadas primeiro; se faltar, aceita as de folga menor em vez de
     abortar — plano incompleto e pior que plano com uma repeticao antiga. */
  const prontas = ranque.filter(r => r.folga >= descanso);
  const reserva = ranque.filter(r => r.folga < descanso);
  const pote = [...prontas, ...reserva];

  const dias = [...Array(7).keys()].map(i => somar(inicio, i));
  const posts = [];
  const paletaPorDia = {};
  const avisos = [];

  /* Quantas pecas por dia: distribui `quantasPecas` em 7 dias, sobra nos dias
     de maior circulacao (segunda, quarta, sabado). */
  const porDia = dias.map(() => 1);
  const prioridade = [0, 2, 5, 4, 1, 3, 6];   // seg, qua, sab, sex, ter, qui, dom
  let extra = Math.max(0, quantasPecas - 7);
  for (let i = 0; extra > 0; i = (i + 1) % prioridade.length) { porDia[prioridade[i]]++; extra--; }

  const usados = new Set();
  const pegar = pred => {
    const r = pote.find(x => !usados.has(x.ia.id) && pred(x.ia));
    if (r) usados.add(r.ia.id);
    return r || null;
  };

  /* Reserva de saida: uma `rima` e uma `aproximacao` por semana.
     Sao os dois formatos que so nos podemos fazer — comparar duas mostras e
     chegar perto de uma obra dependem de olho humano, e nenhum agregador os
     tem. Deixados ao sorteio, sumiam semanas inteiras: na primeira rodada do
     planejador a semana saiu sem nenhuma `rima`. Ficam ancorados na segunda e
     na terca, que e onde estavam quando o Lucas montava o plano a mao. */
  const ancoras = {};
  const rima = pegar(ia => ia.formato === 'rima');
  const aprox = pegar(ia => ia.formato === 'aproximacao');
  if (rima)  ancoras[dias[0]] = rima;
  if (aprox) ancoras[dias[1]] = aprox;
  if (!rima)  avisos.push('sem `rima` disponivel no repertorio para esta semana');
  if (!aprox) avisos.push('sem `aproximacao` disponivel no repertorio para esta semana');

  dias.forEach((data, di) => {
    const anterior = paletaPorDia[dias[di - 1]] || new Set();
    const hoje = new Set();
    paletaPorDia[data] = hoje;
    const formatosHoje = new Set();
    let curadaHoje = 0;

    for (let ordem = 1; ordem <= porDia[di]; ordem++) {
      const ehSabado = new Date(data + 'T12:00:00').getDay() === 6;

      let r = null;
      /* A ancora curada do dia sai sempre na ordem 1. */
      if (ordem === 1 && ancoras[data]) { r = ancoras[data]; delete ancoras[data]; }
      /* Sabado pede o role: e o dia em que a pessoa esta na rua decidindo. */
      if (!r && ehSabado && ordem === 1) r = pegar(ia => ia.formato === 'role');
      /* Fora das duas ancoras, nada de curado. Curadoria custa uma tarde de
         trabalho humano por peca, e quando o pote de ideias nao curadas fica
         curto o sorteio comecava a puxar `rima` e `aproximacao` para encher a
         semana — a quinta semana do primeiro teste saiu com quatro. Duas por
         semana e o que o Lucas ja fazia a mao; mais que isso e a rotina pedindo
         trabalho que ninguem prometeu. */
      if (!r) {
        r = pegar(ia => !formatosHoje.has(ia.formato) && !ia.curado);
      }
      if (!r) { avisos.push(data + ': faltou ideia disponivel para a ordem ' + ordem); continue; }

      formatosHoje.add(r.ia.formato);
      if (r.ia.curado) curadaHoje++;

      const paleta = escolherPaleta(r.ia, anterior, hoje);
      hoje.add(paleta);

      const post = {
        data, formato: r.ia.formato, ordem,
        paleta, textura: TEXTURA[paleta] ?? 0.06,
        ideia: r.ia.id,
        _titulo: r.ia.titulo
      };
      /* nome so quando o formato sai mais de uma vez na semana ou tem recorte,
         para o arquivo dizer o que e sem abrir a imagem. */
      if (r.ia.id !== r.ia.formato + '-geral') post.nome = r.ia.id;
      if (r.ia.ajustes) post.ajustes = JSON.parse(JSON.stringify(r.ia.ajustes));
      if (r.ia.curado) { post.curado = true; post.precisa = r.ia.precisa; }
      if (r.folga < descanso && r.folga < 9999) {
        avisos.push(data + ' ' + r.ia.id + ': repetida com ' + r.folga +
                    ' dias de folga (descanso e ' + descanso + ')');
      }
      posts.push(post);
    }
  });

  return { posts, avisos };
}

/* ---------- saida ---------- */

function principal() {
  const rep = JSON.parse(fs.readFileSync(REPERTORIO, 'utf8'));
  const usadas = lerUsadas();
  const inicio = flag('de', proximaSegunda());
  const quantas = parseInt(flag('pecas', '10'), 10);

  const fim = somar(inicio, 6);
  const br = s => s.slice(8, 10) + '/' + s.slice(5, 7);

  const { posts, avisos } = montar(rep, usadas, inicio, quantas);

  console.log('\nPLANO da semana de ' + br(inicio) + ' a ' + br(fim) +
              (seco ? '   ·  modo seco, nada será escrito' : ''));
  console.log('repertório: ' + rep.ideias.length + ' ideias · descanso ' +
              (rep.descansoPadrao || 35) + ' dias · ' +
              Object.keys(usadas).length + ' já usadas\n');

  let diaAtual = null;
  const curadas = [];
  for (const p of posts) {
    if (p.data !== diaAtual) {
      diaAtual = p.data;
      const d = new Date(p.data + 'T12:00:00');
      console.log('── ' + br(p.data) + '  ' + DIAS[d.getDay()]);
    }
    const rec = p.ajustes && p.ajustes.filtro
      ? '  [' + require('./rima.js').descreverFiltro(p.ajustes.filtro) + ']' : '';
    console.log('   ' + p.formato.padEnd(12) + p.paleta.padEnd(8) +
                (p.curado ? 'CURADA  ' : '        ') + p._titulo + rec);
    if (p.curado) curadas.push(p);
  }

  console.log('\n' + '─'.repeat(60));
  console.log(posts.length + ' peça(s) · ' +
              posts.filter(p => p.curado).length + ' exigem curadoria sua');

  if (curadas.length) {
    console.log('\nO QUE PRECISA DE VOCÊ:');
    for (const p of curadas) {
      const pasta = 'SOCIAL/' + p.data.slice(5, 7) + '/' + p.data.slice(8, 10);
      console.log('  · ' + br(p.data) + '  ' + p.formato +
                  '  →  ' + pasta + '/' + p.formato + '.json');
      console.log('      ' + p._titulo);
      console.log('      falta: ' + p.precisa);
    }
    console.log('\n  Sem esses arquivos as peças abortam — e isso é o comportamento certo.');
  }

  if (avisos.length) {
    console.log('\nAVISOS:');
    avisos.forEach(a => console.log('  ! ' + a));
  }

  /* Confere a regra que o plano de 31/08 quebrava. */
  const porDia = {};
  posts.forEach(p => (porDia[p.data] = porDia[p.data] || []).push(p.paleta));
  const datas = Object.keys(porDia).sort();
  const colisoes = [];
  for (let i = 1; i < datas.length; i++) {
    const ontem = new Set(porDia[datas[i - 1]]);
    porDia[datas[i]].filter(p => ontem.has(p))
      .forEach(p => colisoes.push(br(datas[i]) + ' repete "' + p + '" de ' + br(datas[i - 1])));
  }
  console.log('\npaleta repetida em dias seguidos: ' +
              (colisoes.length ? colisoes.join(' · ') : 'nenhuma'));

  if (seco) { console.log('\n--seco: nada foi escrito.\n'); return; }

  const plano = {
    titulo: 'Semana de ' + br(inicio) + ' a ' + br(fim) + '/' + inicio.slice(0, 4),
    _leiame: [
      'ESTE ARQUIVO É GERADO. Rode `node planejar.js` para refazê-lo a partir do REPERTORIO.json.',
      'Editar à mão funciona e é legítimo — mas a edição se perde no próximo planejar.js.',
      'Para mudar o repertório de vez, mexa no REPERTORIO.json, não aqui.',
      'Gerado em ' + iso(new Date()) + '.'
    ],
    fora: [],
    posts: posts.map(p => {
      const o = { data: p.data, formato: p.formato, ordem: p.ordem,
                  paleta: p.paleta, textura: p.textura, ideia: p.ideia };
      if (p.nome) o.nome = p.nome;
      if (p.ajustes) o.ajustes = p.ajustes;
      return o;
    })
  };

  /* Preserva o `fora` do plano anterior: e exclusao curatorial, custou olho
     humano, e nao tem por que morrer a cada replanejamento. */
  try {
    const velho = JSON.parse(fs.readFileSync(PLANO, 'utf8'));
    if (Array.isArray(velho.fora) && velho.fora.length) {
      plano.fora = velho.fora;
      console.log('\n`fora` herdado do plano anterior: ' + velho.fora.length + ' item(ns).');
    }
  } catch { /* primeiro plano, sem anterior */ }

  fs.writeFileSync(PLANO, JSON.stringify(plano, null, 2) + '\n');

  const novo = Object.assign({}, usadas);
  posts.forEach(p => novo[p.ideia] = p.data);
  fs.mkdirSync(path.dirname(USADAS), { recursive: true });
  fs.writeFileSync(USADAS, JSON.stringify(novo, null, 2) + '\n');

  console.log('\nPLANO.json escrito · USADAS.json com ' + Object.keys(novo).length +
              ' de ' + rep.ideias.length + ' ideias marcadas.');
  console.log('Agora rode `node semana.js --seco` e depois `node semana.js`.');
  console.log('A publicação continua manual. Nada foi postado.\n');
}

principal();
