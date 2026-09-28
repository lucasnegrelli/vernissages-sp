#!/usr/bin/env node
/**
 * gerar-edicao.mjs — monta a edição semanal do Intel a partir do dados.js.
 *
 * POR QUE EXISTE
 * Até 28/09/2026 só a edição 1 existia no banco, escrita à mão. O cron de
 * domingo envia "a próxima edição agendada" — sem ninguém escrever a da
 * semana, domingo não saía nada, e quem pagou ficava sem receber.
 *
 * O QUE FAZ
 * Lê o dados.js do site (a mesma base de 124 casas) e monta, para a semana
 * que começa na segunda seguinte:
 *   - abre esta semana      (dia, título, artistas, casa, bairro, horário se houver)
 *   - últimos dias          (o que fecha até domingo)
 *   - só no Instagram       (aberturas de casas `soIG`, que não saem em lista)
 *   - leitura de mercado    (texto de intel/mercado/AAAA-MM-DD.md, se existir —
 *                            é o único trecho escrito à mão; sem ele, a seção
 *                            diz que não houve registro com fonte na semana)
 * Grava em newsletter_issues com scheduled_for = domingo 23:00 UTC (20h SP)
 * e manda uma prévia para OWNER_EMAIL. Para NÃO enviar: apagar a linha no
 * Supabase antes de domingo.
 *
 * Sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY, só imprime (modo prévia).
 *
 * Uso: node intel/scripts/gerar-edicao.mjs [--domingo=2026-10-04] [--seco]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=')[1] : d; };
const SECO = argv.includes('--seco');

const iso = d => d.toISOString().slice(0, 10);
const soma = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const dia = s => DIAS[new Date(s + 'T12:00:00Z').getUTCDay()] + ' ' + s.slice(8, 10) + '/' + s.slice(5, 7);

/* domingo do envio = o próximo domingo (ou hoje, se hoje for domingo) */
function proximoDomingo() {
  const d = new Date(Date.now() - 3 * 3600e3);
  d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7));
  return iso(d);
}
const DOMINGO = flag('domingo', proximoDomingo());
const SEG = soma(DOMINGO, 1), DOM = soma(DOMINGO, 7);

const win = {};
new Function('window', fs.readFileSync(path.join(RAIZ, 'dados.js'), 'utf8') + '\n;window.DATA=window.DATA||DATA;')(win);
const D = win.DATA;
const V = {}; D.venues.forEach(v => { V[v.name] = v; });

const hora = e => { const m = String(e.d || '').match(/abertura[^.;]*?(\d{1,2}h(?:\d{2})?(?:\s*(?:às|a|–|-)\s*\d{1,2}h(?:\d{2})?)?)/i); return m ? m[1] : ''; };
const titulo = e => e.t.replace(/ — .*$/, '');
const linha = (e, d) => `• ${dia(d)} — ${titulo(e)}${e.a ? ', ' + e.a : ''} · ${e.v}, ${V[e.v].b}${hora(e) && d === e.ini ? ' · ' + hora(e) : ''}`;

const abre = D.expos.filter(e => V[e.v] && e.ini >= SEG && e.ini <= DOM).sort((a, b) => a.ini.localeCompare(b.ini));
const fecha = D.expos.filter(e => V[e.v] && e.fim && e.fim >= SEG && e.fim <= DOM && e.ini < SEG).sort((a, b) => a.fim.localeCompare(b.fim));
const soIG = abre.filter(e => V[e.v].soIG);

const arqMercado = path.join(AQUI, '..', 'mercado', DOMINGO + '.md');
const mercado = fs.existsSync(arqMercado) ? fs.readFileSync(arqMercado, 'utf8').trim()
  : 'Nenhum resultado de leilão ou feira com fonte verificável envolvendo artistas em cartaz em São Paulo nesta semana. Preferimos o silêncio ao boato.';

const sections = [];
if (abre.length) sections.push({ heading: `Abre esta semana (${abre.length})`, body: abre.map(e => linha(e, e.ini)).join('\n') });
if (fecha.length) sections.push({ heading: `Últimos dias (${fecha.length})`, body: fecha.map(e => linha(e, e.fim)).join('\n') });
if (soIG.length) sections.push({ heading: 'Só no Instagram', body: 'Estas aberturas não saem em nenhuma lista — as casas só anunciam no próprio perfil:\n' + soIG.map(e => linha(e, e.ini)).join('\n') });
if (!sections.length) sections.push({ heading: 'Semana sem aberturas registradas', body: 'Nenhuma abertura nem encerramento confirmado para esta semana na base. Se souber de algo, responda este e-mail.' });

const issue = {
  subject: `Semana de ${SEG.slice(8, 10)}/${SEG.slice(5, 7)}: ${abre.length} ${abre.length === 1 ? 'abertura' : 'aberturas'}, ${fecha.length} nos últimos dias`,
  preview_text: abre.slice(0, 2).map(titulo).join(' · ') || 'O circuito paulistano da semana',
  intro: `A semana de ${dia(SEG)} a ${dia(DOM)} no circuito de São Paulo: o que abre, o que fecha e o que só aparece no Instagram das casas pequenas. Tudo conferido na base do Vernissages SP.`,
  sections,
  market_read: mercado,
  scheduled_for: DOMINGO + 'T23:00:00Z'
};

console.log(JSON.stringify(issue, null, 2));
if (SECO) process.exit(0);

const { SUPABASE_URL: URL_, SUPABASE_SERVICE_ROLE_KEY: KEY, RESEND_API_KEY: RKEY, OWNER_EMAIL: DONO } = process.env;
if (!URL_ || !KEY) { console.log('\nSem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY: modo prévia, nada gravado.'); process.exit(0); }

const h = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
/* não duplica: se já há edição para este domingo, não grava outra */
const ja = await fetch(`${URL_}/rest/v1/newsletter_issues?select=id&scheduled_for=eq.${encodeURIComponent(issue.scheduled_for)}`, { headers: h }).then(r => r.json());
if (Array.isArray(ja) && ja.length) { console.log('\nJá existe edição para ' + DOMINGO + '. Nada gravado.'); process.exit(0); }
const r = await fetch(`${URL_}/rest/v1/newsletter_issues`, { method: 'POST', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify(issue) });
if (!r.ok) { console.error('Supabase respondeu ' + r.status + ': ' + (await r.text()).slice(0, 300)); process.exit(1); }
console.log('\nGravada para ' + issue.scheduled_for);

if (RKEY && DONO) {
  const txt = `A edição de domingo ${DOMINGO} está pronta e sai às 20h.\nPara NÃO enviar: apague a linha em newsletter_issues no Supabase.\n\n` +
    `${issue.subject}\n\n${issue.intro}\n\n` + sections.map(s => s.heading.toUpperCase() + '\n' + s.body).join('\n\n') + '\n\nLEITURA DE MERCADO\n' + mercado;
  await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + RKEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.INTEL_FROM || 'Vernissages SP: Intel <intel@vernissagessp.com.br>', to: DONO, subject: '[Intel] Prévia da edição de ' + DOMINGO, text: txt }) })
    .then(x => console.log('prévia para o dono: ' + x.status)).catch(e => console.log('prévia falhou: ' + e.message));
}
