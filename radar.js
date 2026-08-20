#!/usr/bin/env node
/**
 * radar.js — quem do mapa está sendo coberto e quem virou enfeite.
 *
 * POR QUE ISTO EXISTE
 * O `OPERACAO.md` manda a varredura de domingo abrir 10 sites "em rodízio" e
 * "anotar em que venue o rodízio parou". Ninguém nunca anotou, porque não havia
 * onde. O resultado, medido em 20/08/2026: 45 dos 91 venues nunca tiveram uma
 * única mostra registrada. Metade do mapa é fachada — aparece no diretório,
 * aparece no mapa, nunca produziu uma linha de agenda.
 *
 * E o problema é aritmético, não de esforço. Com 91 casas e teto de 10 sites por
 * domingo, cada venue é visitado a cada nove semanas. Mostra de galeria dura
 * seis a oito. **O rodízio é mais lento que o ciclo das exposições**, então
 * mostra abre e fecha inteira entre duas visitas.
 *
 * O QUE ELE FAZ
 * Cruza `dados.js` (agenda de agora) com `acervo.json` (tudo que já passou) e
 * responde três perguntas que hoje ninguém consegue responder:
 *   1. quem nunca foi coberto;
 *   2. quem não é coberto há quanto tempo;
 *   3. por onde a varredura de domingo deve começar.
 *
 * Não escreve no `dados.js` e não decide nada. Cospe `PENDENTE/RADAR.md`.
 *
 * Uso:  node radar.js [--hoje AAAA-MM-DD] [--fila 10]
 */

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const HOJE = arg('--hoje', new Date().toISOString().slice(0, 10));
const FILA = Number(arg('--fila', '10')) || 10;
const SAIDA = path.join(RAIZ, 'PENDENTE', 'RADAR.md');

function carregarDados(){
  const win = {};
  new Function('window', fs.readFileSync(path.join(RAIZ, 'dados.js'), 'utf8'))(win);
  if (!win.DATA) throw new Error('dados.js nao expos window.DATA');
  return win.DATA;
}

function carregarAcervo(){
  const p = path.join(RAIZ, 'acervo.json');
  if (!fs.existsSync(p)) return { expos: [] };
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return { expos: [] }; }
}

const dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00') - Date.parse(a + 'T12:00:00')) / 864e5);
const ativa = e => e.ini <= HOJE && (!e.fim || e.fim >= HOJE);

const D = carregarDados();
const ACERVO = carregarAcervo();

/* Última vez que cada casa entrou na base. O acervo guarda `primeiroRegistro`
   de cada mostra: a data mais recente entre elas é a última vez que alguém
   olhou para aquela casa e achou alguma coisa. */
const ultimoRegistro = {};
ACERVO.expos.forEach(e => {
  const d = e.primeiroRegistro || e.visto;
  if (!d) return;
  if (!ultimoRegistro[e.v] || d > ultimoRegistro[e.v]) ultimoRegistro[e.v] = d;
});

const porVenue = {};
D.venues.forEach(v => {
  const naAgenda = D.expos.filter(e => e.v === v.name);
  porVenue[v.name] = {
    venue: v,
    agenda: naAgenda.length,
    ativas: naAgenda.filter(ativa).length,
    noAcervo: ACERVO.expos.filter(e => e.v === v.name).length,
    ultimo: ultimoRegistro[v.name] || null
  };
});

const todos = Object.values(porVenue);
const nunca = todos.filter(x => x.noAcervo === 0 && x.agenda === 0);
const frios = todos.filter(x => x.ultimo && dias(x.ultimo, HOJE) > 30 && x.ativas === 0)
  .sort((a, b) => a.ultimo.localeCompare(b.ultimo));

/* Fila da próxima varredura: quem está há mais tempo sem nada entra primeiro.
   Quem nunca teve nada vem antes de quem já teve, porque é onde o mapa mente. */
const fila = [
  ...nunca.map(x => ({ ...x, motivo: 'nunca teve mostra registrada' })),
  ...frios.map(x => ({ ...x, motivo: 'sem mostra nova ha ' + dias(x.ultimo, HOJE) + ' dias' }))
].slice(0, FILA);

/* Onde procurar cada uma. Casa sem site é o caso difícil: o release não existe
   em lugar nenhum além do Instagram, e o runbook proíbe raspar de lá. */
const rota = x => {
  if (x.venue.site) return x.venue.site;
  if (x.venue.ig) return 'so Instagram: @' + x.venue.ig + ' — procure antes nos agregadores';
  return 'sem site e sem Instagram — nao ha por onde comecar';
};

const contar = (lista, campo) => lista.reduce((a, x) => {
  const k = x.venue[campo]; a[k] = (a[k] || 0) + 1; return a;
}, {});

const ativasPorTipo = {};
D.expos.filter(ativa).forEach(e => {
  const v = D.venues.find(x => x.name === e.v);
  if (v) ativasPorTipo[v.tipo] = (ativasPorTipo[v.tipo] || 0) + 1;
});

let s = '# Radar de cobertura — ' + HOJE + '\n\n';
s += 'Gerado pelo `radar.js`. **Nada foi escrito no `dados.js`.**\n\n';

s += '## O tamanho do buraco\n\n';
s += '- Venues no mapa: **' + todos.length + '**\n';
s += '- Nunca tiveram uma mostra registrada: **' + nunca.length + '**\n';
s += '- Com mostra em cartaz agora: **' + todos.filter(x => x.ativas > 0).length + '**\n';
s += '- Frios (já tiveram, mas nada novo ha mais de 30 dias): **' + frios.length + '**\n\n';

s += 'Mostras em cartaz por tipo de casa:\n\n';
Object.entries(ativasPorTipo).sort((a, b) => b[1] - a[1])
  .forEach(([k, n]) => { s += '- ' + k + ': ' + n + '\n'; });
s += '\nSe `hibrido` estiver muito abaixo de `galeria` e `institucional`, o feed\n';
s += 'esta espelhando quem tem assessoria, nao quem faz programa interessante.\n\n';

s += '## Fila da proxima varredura (' + fila.length + ')\n\n';
s += 'Ordem sugerida para o rodizio de domingo. Quem nunca teve nada vem antes,\n';
s += 'porque e onde o mapa promete e nao entrega.\n\n';
s += '| Casa | Tipo | Bairro | Por que | Por onde |\n|---|---|---|---|---|\n';
fila.forEach(x => {
  s += '| ' + x.venue.name + ' | ' + x.venue.tipo + ' | ' + x.venue.b + ' | ' + x.motivo + ' | ' + rota(x) + ' |\n';
});

const semNada = nunca.filter(x => !x.venue.site && !x.venue.ig);
if (semNada.length){
  s += '\n## Sem site e sem Instagram (' + semNada.length + ')\n\n';
  s += 'Nao ha por onde comecar sem contato humano. Ou alguem consegue o canal,\n';
  s += 'ou estas saem do diretorio — mapa que lista casa sobre a qual nao se sabe\n';
  s += 'nada esta enganando quem consulta.\n\n';
  semNada.forEach(x => { s += '- ' + x.venue.name + ' (' + x.venue.b + ')\n'; });
}

const soIg = nunca.filter(x => !x.venue.site && x.venue.ig);
if (soIg.length){
  s += '\n## So Instagram (' + soIg.length + ')\n\n';
  s += 'O runbook proibe raspar Instagram, e com razao: URL de imagem do CDN\n';
  s += 'expira. Mas o **fato** da mostra costuma aparecer nos agregadores alguns\n';
  s += 'dias depois. Procure por nome da casa antes de gastar visita de perfil.\n\n';
  soIg.forEach(x => { s += '- ' + x.venue.name + ' — @' + x.venue.ig + '\n'; });
}

s += '\n## A conta que nao fecha\n\n';
s += 'Com ' + todos.length + ' casas e teto de 10 sites por domingo, cada venue e visitado\n';
s += 'a cada ' + Math.round(todos.length / 10) + ' semanas. Mostra de galeria dura seis a oito. O rodizio e\n';
s += 'mais lento que o ciclo das exposicoes, entao mostra abre e fecha inteira\n';
s += 'entre duas visitas. Aumentar o teto resolve por forca bruta e custa caro;\n';
s += 'as saidas baratas sao duas: reduzir o mapa ao que da para cobrir, e fazer\n';
s += 'a casa mandar a abertura em vez de sair atras dela.\n';

fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
fs.writeFileSync(SAIDA, s, 'utf8');

console.log(todos.length + ' venues · ' + nunca.length + ' nunca cobertos · ' +
            frios.length + ' frios · fila de ' + fila.length);
console.log('Relatorio: ' + SAIDA);
