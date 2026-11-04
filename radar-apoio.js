#!/usr/bin/env node
/**
 * radar-apoio.js — apoio.art no radar de editais.
 *
 * O apoio.art reúne, em português, programas de apoio e fomento à cultura de fundações e
 * instituições alemãs e francesas (bolsas, residências, prêmios, chamadas), abertos a artistas
 * de vários países. Cada cartão da página inicial traz o PRAZO (na própria classe do cartão,
 * `search-result apoio DD/MM/AAAA`), o título, a instituição e o LINK OFICIAL do programa.
 *
 * Aqui lemos esses cartões e levamos o leitor direto à página oficial, com o crédito ao
 * apoio.art. Só entra o que fala de artes visuais (fotografia, pintura, residência, arte digital,
 * mídia, curadoria...): dança, música e teatro puros ficam de fora. O tipo de post comum do site
 * não é lido de propósito (traz conteúdo alheio ao tema).
 *
 * O site é lento (~30 s por página), então é UMA requisição por rodada, com tempo de sobra.
 *
 * USO   node radar-apoio.js [--saida radar/editais-apoio.json]
 *       node radar-apoio.js --arquivo pagina.html     (sem rede, para testar)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { categoriaDe, norm, decodeHTML, HOJE } = require('./radar-editais.js');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const SAIDA = path.join(RAIZ, flag('saida', 'radar/editais-apoio.json'));
const lerJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } };

const VISUAL = /(artes? visua|arte contemporanea|artistas? visua|fotograf|pintura|escultura|desenho|gravura|instalac|video|digital|midia|residencia|curador|exposic|multidisciplinar|audiovisual|artes? plastic|ceramica|bienal|salao|premio de arte|bolsa de pesquisa e criacao)/;
const OUTRA = /(filme|animacao|danca|coreograf|musica|musical|orquestra|teatro|literatura|escritor|poesia|cinema de ficcao|opera|circo)/;

async function baixar() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 120000);
  try {
    const r = await fetch('https://apoio.art/', { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; vernissages-sp/1.0; +https://vernissagessp.com.br)', 'accept-language': 'pt-BR,pt;q=0.9' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}

function ler(html) {
  const itens = [];
  for (const p of html.split('<div class="search-result apoio ').slice(1)) {
    const d = p.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    const prazo = d ? `${d[3]}-${d[2]}-${d[1]}` : null;
    const titulo = decodeHTML((p.match(/data-title="([^"]+)"/) || [])[1]);
    const inst = decodeHTML((p.match(/<span class="target">([\s\S]*?)<\/span>/) || [])[1]);
    const link = (p.match(/<a href="(https?:[^"]+)"[^>]*class="trigger"[^>]*target="_blank"/) || p.match(/<a href="(https?:[^"]+)"[^>]*target="_blank"/) || [])[1];
    const desc = decodeHTML((p.match(/<div class="description">([\s\S]*?)<\/div>/) || [])[1]);
    const tags = [...(p.match(/<div class="tipos tags[^>]*>([\s\S]*?)<\/div>/) || ['', ''])[1].matchAll(/>([^<]{2,40})<\/a>/g)].map(m => decodeHTML(m[1])).join(' ');
    if (!titulo || !link) continue;
    const n = norm(titulo + ' ' + desc.slice(0, 500) + ' ' + tags);
    if (!VISUAL.test(n)) continue;
    if (OUTRA.test(norm(titulo + ' ' + tags)) && !/(artes? visua|fotograf|pintura|escultura|arte contemporanea|multidisciplinar)/.test(n)) continue;
    if (prazo && prazo < HOJE) continue;
    const it = { titulo, resumo: desc };
    itens.push({
      t: titulo.length > 120 ? titulo.slice(0, 117).replace(/\s+\S*$/, '') + '…' : titulo,
      fonte: 'apoio.art' + (inst ? ' · ' + inst.split(';')[0].trim() : ''),
      link, pub: '', prazo, cat: categoriaDe(it), onde: 'exterior',
      resumo: desc.replace(/\s+/g, ' ').trim().slice(0, 240), visto: HOJE, via: 'plataforma'
    });
  }
  return itens;
}

(async () => {
  const arq = flag('arquivo', null);
  console.log('radar-apoio · ' + HOJE + (arq ? ' · arquivo ' + arq : ' · apoio.art (lento, ~30 s)'));
  const html = arq ? fs.readFileSync(path.resolve(arq), 'utf8') : await baixar();
  const itens = ler(html);
  const cartoes = html.split('<div class="search-result apoio ').length - 1;
  console.log(`  ${cartoes} cartão(ões) lidos · ${itens.length} de artes visuais com prazo futuro ou sem prazo`);

  const dif = (a, b) => Math.round((Date.parse(b + 'T12:00') - Date.parse(a + 'T12:00')) / 864e5);
  const vivo = x => x.prazo ? x.prazo >= HOJE : (x.visto && dif(x.visto, HOJE) <= 10);
  const porLink = new Map();
  [...((lerJSON(SAIDA, {}).itens) || []), ...itens].forEach(x => { if (x.link && vivo(x)) porLink.set(x.link, Object.assign({}, porLink.get(x.link) || {}, x)); });
  const finais = [...porLink.values()].sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'));
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify({ gerado: HOJE, aviso: 'Listado por apoio.art; a página do programa é a oficial. Confirme prazo e requisitos nela.', itens: finais }, null, 1) + '\n');
  console.log(`  ${finais.length} viva(s) no arquivo · ${path.relative(RAIZ, SAIDA)}`);
  finais.slice(0, 20).forEach(x => console.log('   ', x.prazo || 'sem prazo', '·', x.t.slice(0, 80)));
})().catch(e => { console.error(e.message || e); process.exit(1); });
