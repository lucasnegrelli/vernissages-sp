#!/usr/bin/env node
/**
 * engajar.js — a lista da semana de quem comentar, na mão.
 *
 * POR QUE ISTO EXISTE
 * Em 25/09/2026 o Lucas perguntou se dava para automatizar curtir, seguir e
 * comentar "como se fosse ele". Não: é exatamente o que o Instagram pune
 * (bloqueio de ação, alcance derrubado, suspensão), e não se opera a conta
 * de ninguém em massa. O que funciona é o mesmo gesto feito à mão, com as
 * pessoas certas, uns dez minutos por dia. Este script decide quem são as
 * pessoas certas; quem comenta é o Lucas.
 *
 * QUEM ENTRA, EM ORDEM
 *   1. casas que vão aparecer nos nossos posts desta semana — comentar antes
 *      do post sair e convidar como Collab no dia;
 *   2. casas com abertura nos próximos 7 dias — comentar no anúncio;
 *   3. casas que só divulgam no Instagram (`soIG`) — seguir e ligar
 *      notificação: a agenda delas só existe ali.
 * Cada linha traz um fato da base para puxar conversa. Comentário genérico
 * ("🔥", "incrível") não gera nada; pergunta concreta gera resposta.
 *
 * Saída: SOCIAL/ENGAJAR-<data>.md (gitignored). Não abre Instagram, não
 * manda nada para ninguém.
 *
 * Uso: node engajar.js [--date=2026-09-28] [--dias=7]
 */

'use strict';
const fs = require('fs');
const path = require('path');
const { carregarDados, RAIZ, tituloCurto, autoria } = require('./rima.js');

const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
const DIAS = Number(flag('dias', '7'));
const soma = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const fimJanela = soma(hoje, DIAS);
const curto = iso => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const lerJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };

/* Um fato da base para abrir conversa: a primeira frase do campo d, se ela
   diz alguma coisa. "Exposição individual." não diz. */
function gancho(e) {
  const d = String(e.d || '').split(/(?<=\.)\s/)[0].trim();
  if (d.length < 40) return autoria(e) ? 'pergunte sobre o trabalho de ' + autoria(e) + ' que está na mostra' : 'pergunte o que motivou a mostra';
  return d.length > 170 ? d.slice(0, 167) + '…' : d;
}

function principal() {
  const D = carregarDados();
  const V = {}; D.venues.forEach(v => V[v.name] = v);
  const postadas = lerJSON(path.join(RAIZ, 'SOCIAL', 'POSTADAS.json'), {});
  const vistos = new Set();
  const linhas = { nossos: [], aberturas: [], soIG: [] };

  /* 1. o que sai nos nossos posts na janela (POSTADAS guarda a data do post) */
  Object.entries(postadas).filter(([k, d]) => !k.startsWith('_') && d >= hoje && d <= fimJanela)
    .sort((a, b) => a[1].localeCompare(b[1])).forEach(([k, d]) => {
      const casa = k.slice(k.indexOf('|') + 1), titulo = k.slice(0, k.indexOf('|'));
      const v = V[casa], e = D.expos.find(x => x.t === titulo && x.v === casa);
      if (!v || !v.ig || vistos.has(v.ig)) return;
      vistos.add(v.ig);
      linhas.nossos.push({ v, quando: 'antes de ' + curto(d), acao: 'comente no último post deles; no dia ' + curto(d) + ', convide como Collab',
        fato: e ? gancho(e) : '' });
    });

  /* 2. aberturas na janela */
  D.expos.filter(e => e.ini && e.ini >= hoje && e.ini <= fimJanela && V[e.v] && V[e.v].ig)
    .sort((a, b) => a.ini.localeCompare(b.ini)).forEach(e => {
      const v = V[e.v];
      if (vistos.has(v.ig)) return;
      vistos.add(v.ig);
      linhas.aberturas.push({ v, quando: 'até ' + curto(soma(e.ini, -1)), acao: 'comente no anúncio de ' + tituloCurto(e) + ' (abre ' + curto(e.ini) + ')',
        fato: gancho(e) });
    });

  /* 3. casas só-Instagram, as que ainda não entraram acima */
  D.venues.filter(v => v.soIG && v.ig && !vistos.has(v.ig)).forEach(v => {
    vistos.add(v.ig);
    linhas.soIG.push({ v, quando: 'uma vez', acao: 'siga e ligue a notificação de posts', fato: v.info || '' });
  });

  const bloco = (titulo, l, nota) => !l.length ? '' :
    '## ' + titulo + ' (' + l.length + ')\n\n' + (nota ? nota + '\n\n' : '') +
    l.map(x => '- [ ] **@' + x.v.ig + '** — ' + x.v.name + ' · ' + x.quando + '\n  ' + x.acao + (x.fato ? '\n  gancho: ' + x.fato : '') +
               '\n  https://www.instagram.com/' + x.v.ig + '/').join('\n') + '\n\n';

  const total = linhas.nossos.length + linhas.aberturas.length;
  let s = '# Engajar — ' + curto(hoje) + ' a ' + curto(fimJanela) + '\n\n';
  s += 'Dez minutos por dia, na mão. ' + total + ' contas para comentar esta semana (~' + Math.ceil(total / 5) + ' por dia útil), mais as só-Instagram para seguir.\n\n';
  s += 'Regra do comentário: uma pergunta ou observação concreta sobre a obra, com o fato do "gancho". Nada de emoji solto. ' +
       'Não comente em tudo no mesmo minuto — o Instagram lê rajada como robô.\n\n';
  s += bloco('Vão aparecer nos nossos posts', linhas.nossos, 'Comentar antes cria o contato; o convite de Collab no dia do post vira aceite mais fácil.');
  s += bloco('Abrem nos próximos dias', linhas.aberturas, 'Quem comenta no anúncio da abertura aparece para o público da casa na semana em que ele está mais atento.');
  s += bloco('Só divulgam no Instagram', linhas.soIG, 'A agenda destas casas só existe ali (a raspagem de quarta também lê). São também os leads do serviço de sites.');
  const saida = path.join(RAIZ, 'SOCIAL', 'ENGAJAR-' + hoje + '.md');
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, s);
  console.log(linhas.nossos.length + ' dos nossos posts · ' + linhas.aberturas.length + ' aberturas · ' + linhas.soIG.length + ' só-Instagram -> ' + path.relative(RAIZ, saida));
}

principal();
