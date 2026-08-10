#!/usr/bin/env node
/**
 * espelhar.js — traz as imagens externas do dados.js para dentro do repositório.
 *
 * POR QUE ISTO EXISTE
 * O post.html exporta os slides por canvas. Canvas que recebe imagem de outro
 * domínio sem cabeçalho CORS fica "sujo" e não exporta — o slide cai no chapado
 * tipográfico mesmo tendo imagem. Galeria em WordPress e site de imprensa quase
 * nunca mandam Access-Control-Allow-Origin, então caçar imagem em fonte
 * "amigável" é enxugar gelo. Baixando pelo Actions (fetch de servidor, onde CORS
 * não existe) e servindo de img/, toda imagem passa a ser de mesma origem e
 * funciona sempre. De quebra, para de depender de URL de terceiro que expira.
 *
 * ÉTICA — vale o mesmo do POSTS.md §5.1
 * Espelhar é fazer cópia. O crédito da fonte continua obrigatório no campo cred,
 * o arquivo original não é alterado, e galeria que pedir remoção tem o arquivo
 * apagado de img/ e a entrada revertida para a URL de origem. Sem exceção.
 *
 * Uso:  node espelhar.js [--dry]
 */

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const DADOS = path.join(RAIZ, 'dados.js');
const DIR = path.join(RAIZ, 'img');
const DRY = process.argv.includes('--dry');

const MIN_KB = 15;                     // mesmo piso do check.js
const MAX_MB = 8;
const TIPOS = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
  'image/webp': '.webp', 'image/avif': '.avif'
};

const slug = s => String(s)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '').slice(0, 60);

function carregar(){
  const txt = fs.readFileSync(DADOS, 'utf8');
  const win = {};
  new Function('window', txt + '\n;window.DATA=window.DATA||DATA;')(win);
  if (!win.DATA || !Array.isArray(win.DATA.expos)) throw new Error('dados.js não expôs window.DATA.expos');
  return { txt, D: win.DATA };
}

async function baixar(url){
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'vernissages-sp/1.0 (+https://vernissagessp.com.br)' }
    });
    if (!r.ok) return { erro: 'HTTP ' + r.status };

    const ct = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const ext = TIPOS[ct];
    if (!ext) return { erro: 'content-type ' + (ct || 'ausente') };

    const buf = Buffer.from(await r.arrayBuffer());
    const kb = buf.length / 1024;
    if (kb < MIN_KB) return { erro: 'pequena demais (' + Math.round(kb) + ' KB)' };
    if (kb > MAX_MB * 1024) return { erro: 'grande demais (' + Math.round(kb / 1024) + ' MB)' };

    return { buf, ext, kb: Math.round(kb) };
  } catch (e) {
    return { erro: (e.name === 'AbortError' ? 'timeout' : String(e.message || e)).slice(0, 80) };
  } finally { clearTimeout(t); }
}

(async () => {
  let { txt, D } = carregar();

  const pendentes = D.expos.filter(e => e.img && /^https?:\/\//i.test(e.img));
  if (!pendentes.length){
    console.log('Nada a espelhar — todas as imagens já são locais.');
    process.exit(0);
  }

  if (!DRY && !fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

  const ok = [], falhou = [];

  for (const e of pendentes){
    const base = slug(e.t.replace(/ — .*/, '') + '-' + e.v);
    process.stdout.write('· ' + base + ' … ');

    const r = await baixar(e.img);
    if (r.erro){ console.log('FALHOU (' + r.erro + ')'); falhou.push({ t: e.t, url: e.img, erro: r.erro }); continue; }

    const nome = 'img/' + base + r.ext;
    if (!DRY) fs.writeFileSync(path.join(RAIZ, nome), r.buf);

    // troca a URL no texto do arquivo, não no objeto — preserva o resto da linha
    const antes = txt;
    txt = txt.split('"' + e.img + '"').join('"' + nome + '"');
    if (txt === antes){ console.log('FALHOU (URL não encontrada no texto)'); falhou.push({ t: e.t, url: e.img, erro: 'URL não bate com o texto' }); continue; }

    console.log('ok ' + r.kb + ' KB → ' + nome);
    ok.push({ t: e.t, nome, kb: r.kb });
  }

  if (ok.length && !DRY) fs.writeFileSync(DADOS, txt);

  console.log('\n' + ok.length + ' espelhada(s), ' + falhou.length + ' falha(s).');
  falhou.forEach(f => console.log('  ! ' + f.t + ' — ' + f.erro));

  // Falha de download não derruba o build: a imagem original continua no ar
  // pelo campo img, o site segue mostrando, só o kit é que cai no chapado.
  process.exit(0);
})();
