#!/usr/bin/env node
/**
 * leads-sites.js — quem do mapa precisa de site.
 *
 * POR QUE ISTO EXISTE
 * A mesma falha que obriga a raspar Instagram (casa sem site, site parado,
 * domínio expirado) é o mercado do serviço de desenvolvimento de site do
 * Lucas. Em 25/09/2026: 36 das 124 casas sem site nenhum, e três domínios
 * mortos achados num dia só (Blau Projects virou afiliado da AliExpress,
 * Virgilio e Adelina expirados). A base já existe e é atualizada toda semana;
 * isto só lê ela com outro olho.
 *
 * O QUE ELE FAZ
 * Abre o `site` de cada venue (uma vez, sem seguir crawling) e mede o que um
 * cliente sentiria: fora do ar, domínio tomado, sem HTTPS, sem versão de
 * celular, rodapé com ano velho, lento. Soma uma nota e escreve
 * NEGOCIO/LEADS-SITES.md, ordenado de quem mais precisa para quem menos.
 * NEGOCIO/ é gitignored: lista de prospecção não vai para o GitHub Pages.
 *
 * Não manda mensagem para ninguém. Quem aborda é o Lucas.
 *
 * Uso:  node leads-sites.js [--so-sem-site]
 */

'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const SAIDA_DIR = path.join(RAIZ, 'NEGOCIO');
const SAIDA = path.join(SAIDA_DIR, 'LEADS-SITES.md');
const ANO = new Date().getFullYear();
const TIMEOUT = 15000;
const PARALELO = 8;

function venues() {
  const win = {};
  new Function('window', fs.readFileSync(path.join(RAIZ, 'dados.js'), 'utf8') +
               '\n;window.DATA=window.DATA||DATA;')(win);
  return win.DATA.venues || [];
}

const dominio = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };

async function medir(v) {
  const r = { v, problemas: [], nota: 0 };
  const add = (pontos, txt) => { r.nota += pontos; r.problemas.push(txt); };
  if (!v.site) { add(10, 'sem site' + (v.ig ? ' — agenda só no Instagram @' + v.ig : ' e sem Instagram')); return r; }

  const t0 = Date.now();
  let res, html = '';
  try {
    res = await fetch(v.site, {
      redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' }
    });
    html = await res.text();
  } catch (e) {
    add(9, 'fora do ar (' + (e.cause && e.cause.code || e.name) + ')');
    return r;
  }
  const ms = Date.now() - t0;

  if (res.status >= 400) add(8, 'responde ' + res.status);
  const final = dominio(res.url);
  if (final && final !== dominio(v.site)) add(8, 'redireciona para outro domínio: ' + final + ' (domínio perdido?)');
  if (/domain (is )?for sale|comprar este dom[ií]nio|this domain|parked|godaddy|hugedomains|sedo/i.test(html.slice(0, 20000)))
    add(9, 'página de domínio à venda / estacionado');
  if (!res.url.startsWith('https://')) add(3, 'sem HTTPS');
  if (!/<meta[^>]+name=["']viewport/i.test(html)) add(4, 'sem versão de celular (sem meta viewport)');
  const anos = (html.match(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/gi) || [])
    .map(s => +s.match(/20\d{2}/g).pop());
  if (anos.length && Math.max(...anos) <= ANO - 2) add(3, 'rodapé parado em ' + Math.max(...anos));
  if (/wix\.com|wixstatic/i.test(html)) add(1, 'Wix');
  if (ms > 6000) add(2, 'lento (' + (ms / 1000).toFixed(1) + ' s)');
  if (html.length < 3000 && res.status < 400) add(3, 'página quase vazia (' + html.length + ' bytes)');
  return r;
}

async function principal() {
  const soSem = process.argv.includes('--so-sem-site');
  const lista = venues().filter(v => v.tipo !== 'institucional' && (!soSem || !v.site));
  const out = [];
  for (let i = 0; i < lista.length; i += PARALELO) {
    out.push(...await Promise.all(lista.slice(i, i + PARALELO).map(medir)));
    process.stdout.write('.');
  }
  console.log('');
  out.sort((a, b) => b.nota - a.nota || a.v.name.localeCompare(b.v.name));

  const faixa = (min, max) => out.filter(x => x.nota >= min && x.nota < max);
  const linha = x => '| ' + x.v.name + ' | ' + (x.v.b || '') + ' | ' + (x.v.ig ? '@' + x.v.ig : '—') + ' | ' +
                     (x.v.site ? dominio(x.v.site) : '—') + ' | ' + x.nota + ' | ' + x.problemas.join('; ') + ' |';
  const tabela = l => l.length
    ? '| Casa | Bairro | Instagram | Site | Nota | O que tem de errado |\n|---|---|---|---|---|---|\n' + l.map(linha).join('\n') + '\n'
    : '_ninguém_\n';

  let s = '# Leads de site — ' + new Date().toISOString().slice(0, 10) + '\n\n';
  s += 'Gerado por `leads-sites.js` a partir do dados.js. Institucionais fora (compra por licitação).\n';
  s += 'Nota = quanto a casa precisa de site. 8+ é quente: sem site ou site morto.\n\n';
  s += '**Antes de abordar, confira.** "Sem site" é sem site *na base*: galeria grande sem `site`\n';
  s += '(ex.: Kogan Amaro) quase sempre é cadastro incompleto, não falta de site. O lead de verdade\n';
  s += 'é "sem site, agenda só no Instagram". E site que abre não é site bom: a A7MA sai "fria"\n';
  s += 'aqui, mas a agenda dela parou em 2023 — isso o script não mede, o olho mede.\n\n';
  s += '## Quentes (8+) — sem site ou site morto\n\n' + tabela(faixa(8, 99)) + '\n';
  s += '## Mornos (4–7) — site existe mas afasta visitante\n\n' + tabela(faixa(4, 8)) + '\n';
  s += '## Frios (1–3) — detalhe\n\n' + tabela(faixa(1, 4)) + '\n';
  s += '_' + faixa(0, 1).length + ' casas sem problema detectável._\n';

  fs.mkdirSync(SAIDA_DIR, { recursive: true });
  fs.writeFileSync(SAIDA, s);
  console.log('quentes ' + faixa(8, 99).length + ' · mornos ' + faixa(4, 8).length + ' · frios ' + faixa(1, 4).length +
              ' -> ' + path.relative(RAIZ, SAIDA));
}

principal().catch(e => { console.error(e); process.exit(1); });
