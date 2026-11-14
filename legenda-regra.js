#!/usr/bin/env node
/* ============================================================
   legenda-regra.js: legenda do feed (obra, encerra, estreia) por regra, sem IA (14/11/2026)

   Substitui o passo "Legendar o feed" (Claude) do dia-auto. Regra de ouro: toda frase sai de um
   campo da base (titulo, artista, casa, bairro, endereco, datas, descricao, credito). Campo vazio,
   frase ausente. Nada é inventado. O que exige voz editorial (texto profundo) continua sendo
   escrito na conversa, como nos carrosséis.

   Uso:  node legenda-regra.js SOCIAL/MM/DD/_feed.json      (escreve <formato>-LEGENDA.md ao lado)
         require('./legenda-regra.js').legendar(feed)        (devolve {texto, avisos} ou null)
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { lint, semTravessao } = require('./copy.js');

const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const ext = iso => { const p = iso.split('-'); return Number(p[2]) + ' de ' + MES[Number(p[1]) - 1]; };
const dow = iso => SEMANA[new Date(iso + 'T12:00:00Z').getUTCDay()];
const dias = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5);

/* "Título — Artista" na base: o título curto é o que vem antes do travessão */
const curto = t => String(t).replace(/\s+[—–]\s+.*$/, '').trim();
/* intervalo de horário (12h–18h) vira "12h às 18h" ANTES de tirar o travessão; senão vira dois-pontos */
const limpa = s => semTravessao(String(s || '').replace(/(\d+h(?:\d\d)?)\s*[–—-]\s*(\d+h(?:\d\d)?)/g, '$1 às $2').replace(/\s*~\s*$/, '').replace(/\s+/g, ' ').trim());
const norm = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/* o artista só entra se o nome dele (ou de cada um) não estiver já no título */
const jaNoTitulo = (nome, quem) => norm(quem).split(/,| e /).map(x => x.trim()).filter(Boolean).every(p => norm(nome).includes(p)) || norm(nome).includes(norm(quem)) || norm(quem).includes(norm(nome));

/* chamadas para salvar: rodízio fixo pelo dia do mês, nenhuma inventa fato */
const CHAMADAS = [
  'Salva para ir e manda para quem vai com você.',
  'Salva para o fim de semana.',
  'Manda para quem gosta de ver exposição.',
  'Salva e leva alguém junto.',
];
const TAGS = '#exposicaosp #arteemsp #saopaulo #artecontemporanea #galeriadearte';

/* corpo: a descrição da base, cortada em frase inteira até ~420 caracteres. Sem descrição, sem corpo. */
function corpo(m) {
  const d = limpa(m.descricao);
  if (d.length < 40) return '';
  const frases = d.match(/[^.!?]+[.!?]+(\s|$)/g) || [d];
  let out = '';
  for (const f of frases) { if ((out + f).length > 420) break; out += f; }
  return (out || '').trim();
}

function gancho(m, formato, hoje) {
  const nome = curto(m.titulo), quem = m.artista && !/^coletiva|individual$/i.test(m.artista) ? m.artista : '';
  const rotulo = quem && !jaNoTitulo(nome, quem) ? `${nome}, ${quem}` : nome;
  if (formato === 'encerra' && m.fecha) {
    const n = dias(hoje, m.fecha);
    if (n <= 0) return `Último dia: ${rotulo}.`;
    if (n === 1) return `Fecha amanhã: ${rotulo}.`;
    return `Fecha ${dow(m.fecha)}, ${ext(m.fecha)}: ${rotulo}.`;
  }
  if (formato === 'estreia' && m.abre) {
    const n = dias(hoje, m.abre);
    if (n < 0) return `Abriu ${n === -1 ? 'ontem' : 'em ' + ext(m.abre)}: ${rotulo}.`;
    if (n === 0) return `Abre hoje: ${rotulo}.`;
    if (n === 1) return `Abre amanhã: ${rotulo}.`;
    return `Abre ${dow(m.abre)}, ${ext(m.abre)}: ${rotulo}.`;
  }
  return `${rotulo}.`;
}

function servico(m, formato, hoje) {
  const onde = [m.casa + (m.instagram_da_casa ? ' ' + m.instagram_da_casa : ''), m.bairro].filter(Boolean).join(', ');
  const fut = m.abre && m.abre > hoje;
  const fim = fut ? (m.fecha ? `Abre ${ext(m.abre)}, até ${ext(m.fecha)}.` : `Abre ${ext(m.abre)}.`)
    : m.fecha ? (formato === 'encerra' ? `Até ${ext(m.fecha)}.` : `Em cartaz até ${ext(m.fecha)}.`) : 'Em cartaz.';
  const end = m.endereco ? ` ${m.endereco}.` : '';
  const hor = m.horarios ? ` ${limpa(m.horarios).replace(/\.$/, '')}.` : '';
  return `Serviço: ${onde}.${end} ${fim}${hor}`.replace(/\s+/g, ' ');
}

function montar(feed, comCorpo) {
  const ms = (feed.mostras || []).filter(m => m && m.titulo && m.casa);
  if (!ms.length) return null;
  const hoje = feed.data, f = feed.formato;
  const partes = [];
  if (ms.length === 1) {
    partes.push(gancho(ms[0], f, hoje));
    if (comCorpo && corpo(ms[0])) partes.push(corpo(ms[0]));
    partes.push(servico(ms[0], f, hoje));
  } else {
    partes.push(ms.map(m => gancho(m, f, hoje)).join('\n'));
    partes.push(ms.map(m => `${curto(m.titulo)}: ${servico(m, f, hoje).replace(/^Serviço: /, '')}`).join('\n'));
  }
  const cred = ms.map(m => m.credito_da_foto).filter(Boolean);
  if (cred.length) partes.push('Imagem: ' + [...new Set(cred.map(limpa))].join('; ').replace(/\.$/, '') + '.');
  partes.push(CHAMADAS[Number(hoje.slice(8, 10)) % CHAMADAS.length] + ' Agenda completa de exposições em vernissagessp.com.br');
  partes.push(TAGS);
  return semTravessao(partes.join('\n\n'));
}

/* tenta com corpo; se o lint apontar erro grave, tenta sem corpo; se ainda falhar, devolve null (feed sem legenda não sai) */
function legendar(feed) {
  for (const comCorpo of [true, false]) {
    const texto = montar(feed, comCorpo);
    if (!texto) return null;
    const v = lint(texto, { tipo: 'legenda' });
    if (!v.some(x => x.grave) && texto.length <= 1300) return { texto, avisos: v.map(x => x.regra + ': ' + x.trecho), comCorpo };
  }
  return null;
}

module.exports = { legendar };

if (require.main === module) {
  const arq = process.argv[2];
  if (!arq) { console.error('uso: node legenda-regra.js SOCIAL/MM/DD/_feed.json'); process.exit(1); }
  const feed = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const r = legendar(feed);
  if (!r) { console.log('legenda: fatos insuficientes ou lint grave; nenhuma legenda escrita'); process.exit(0); }
  const dest = path.join(path.dirname(arq), `${feed.formato}-LEGENDA.md`);
  fs.writeFileSync(dest, r.texto + '\n');
  console.log(`legenda: ${path.basename(dest)} (${r.texto.length} caracteres${r.comCorpo ? ', com descrição da base' : ', só fatos'})${r.avisos.length ? ' · avisos: ' + r.avisos.join(' | ') : ''}`);
  if (process.argv.includes('--mostrar')) console.log('\n' + r.texto);
}
