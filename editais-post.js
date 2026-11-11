#!/usr/bin/env node
/* ============================================================
   editais-post.js — carrossel de editais para o Instagram (v3, 11/11/2026)

   v1 (09/11): lista com título cru em inglês. v2: carrossel com número gigante. v3 (hoje): o Lucas
   disse que não gosta de número em copy nem de "big number", e que o perfil é imagem e arte. Então:
     capa     uma obra em cartaz (da base, com crédito) + "CHAMADAS ABERTAS". Nenhum número.
     chamada  a imagem da PRÓPRIA página da chamada (og:image), título em português, para quem
              serve, a leitura em uma frase, a ficha (prazo, onde, idioma, custo).
     fim      quem cobra taxa fica à parte, e o link.

   CUIDADO COM O DADO. O radar lê prazo de texto solto e erra (caso real, 11/11: a Dasartes dizia
   "inscrições até 5 de novembro" e o radar marcava 16/11, que era o INÍCIO da residência). Por isso
   cada candidata é aberta na rede e só entra se a página confirma o prazo ao lado de uma palavra de
   prazo e não diz "encerrada" (edital-confere.js). Sem 3 confirmadas, incluindo ao menos 1 daqui,
   o script NÃO gera nada (código 2) e o dia-auto cai no feed normal. Quem bloqueia o robô (ex.: Res
   Artis) fica de fora: o robô não se disfarça.

   A legenda passa pelo lint da voz (copy.js). Se violar, aborta.

   Uso: node editais-post.js [--date=AAAA-MM-DD] [--out=pasta] [--n=4] [--seco] [--previa]
     --seco    confere e imprime a legenda, sem renderizar
     --previa  aceita menos de 3 confirmadas e grava como editais-previa-NN.png (nunca vira post)
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('./direcao.js');
const C = require('./copy.js');
const E = require('./edital-confere.js');

const RAIZ = __dirname;
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
const N = Math.max(3, Math.min(5, parseInt(flag('n', '4'), 10)));
const PREVIA = argv.includes('--previa');
const out = path.resolve(RAIZ, flag('out', path.join('SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10))));
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const W = 1080, H = 1350;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const url = p => 'file:///' + path.resolve(p).replace(/\\/g, '/');
const ler = f => { try { return JSON.parse(fs.readFileSync(path.join(RAIZ, 'radar', f), 'utf8')); } catch (e) { return null; } };
const lista = j => Array.isArray(j) ? j : (j && j.itens) || [];

/* ---------- 1. o pool: TODAS as fontes do radar, não só as 12 linhas do proximos.json ---------- */
const CAT = { residencia: 'Residência', premio: 'Prêmio', bolsa: 'Bolsa', fomento: 'Fomento', edital: 'Edital', chamada: 'Chamada' };
const ONDE = { sp: 'São Paulo', brasil: 'Brasil', exterior: 'Exterior' };
const pool = [], vistos = new Set();
for (const f of fs.existsSync(path.join(RAIZ, 'radar')) ? fs.readdirSync(path.join(RAIZ, 'radar')).filter(f => /^editais.*\.json$/.test(f)) : []) {
  for (const r of lista(ler(f))) {
    if (!r.link || !r.prazo || vistos.has(r.link)) continue; vistos.add(r.link);
    pool.push({ t: r.t, org: r.fonte || r.org || '', cat: CAT[r.cat] || 'Chamada', onde: ONDE[r.onde] || 'Brasil', prazo: r.prazo, link: r.link,
      custo: r.custo || '', taxaTxt: r.taxaTxt || '', cita: r.cita || [], d: r.resumo || '' });
  }
}
const _rs = ler('editais-resartis.json');
const foraTaxa = lista(_rs).filter(r => r.custo === 'taxa' && r.prazo && C.dias(hoje, r.prazo) >= 0).length;

/* ---------- 2. capa: uma obra em cartaz da base ---------- */
async function escolherCapa(sharp) {
  const { carregarDados } = require('./rima.js');
  const DATA = carregarDados(), V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const h = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  const lista = DATA.expos.filter(e => e.img && e.cred && !e.vista && !e.cartaz && e.ini && e.ini <= hoje && (!e.fim || e.fim >= hoje) && V[e.v] && fs.existsSync(path.join(RAIZ, e.img)))
    .sort((a, b) => (h(hoje + a.t) - h(hoje + b.t)));
  for (const e of lista) {
    try {
      const m = await sharp(path.join(RAIZ, e.img)).metadata();
      const r = m.width / m.height;
      if (m.width >= 1400 && r >= .8 && r <= 2.4) return { arquivo: path.join(RAIZ, e.img), titulo: e.t.replace(/\s+[–—-]+\s+.*$/, ''), artista: String(e.a || '').split(',').slice(0, 2).join(', ').trim(), casa: e.v, cred: e.cred, foco: typeof e.foco === 'number' ? e.foco : 50 };
    } catch (x) { /* próxima */ }
  }
  return null;
}

/* ---------- 3. o fluxo ---------- */
const tamTit = t => t.length <= 22 ? 92 : t.length <= 34 ? 80 : t.length <= 52 ? 66 : 54;

function montar(pick, capa, imgs, tmpDir) {
  const total = pick.length + 2;
  const cab = k => `<div class="cab"><b>Vernissages SP</b><span>${esc(k)}</span></div>`;
  const pag = i => `<div class="pag">${i}/${total}</div>`;
  const cap = C.gancho();

  const sCapa = `<div class="slide">${cab('Editais · ' + C.porExtenso(hoje))}
    ${capa ? `<img class="foto" src="${url(capa.arquivo)}" style="object-position:${capa.foco}% 50%">` : ''}
    <div class="gg">${cap.linhas.map(l => `<div>${l}</div>`).join('')}</div>
    <div class="sub">${esc(cap.sub)}</div>
    ${capa ? `<div class="cred">Na parede agora: ${esc(capa.titulo)}${capa.artista ? ', ' + esc(capa.artista) : ''}, ${esc(capa.casa)}. ${esc(capa.cred)}</div>` : ''}
    <div class="seta">arrasta para ver</div>${pag(1)}</div>`;

  const sItens = pick.map((c, i) => {
    const tit = C.titulo(c), urg = c.dias <= 3;
    const img = imgs[c.link];
    const lugar = c.online ? 'Online' : c.cidade || c.pais || (c.onde === 'sp' ? 'São Paulo' : c.onde === 'brasil' ? 'Brasil' : 'Exterior');
    const f = C.ficha(c).map(([k, v]) => `<div class="fr"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
    const naFonte = c.idioma !== 'português' ? ` · título na fonte: ${esc(C.semTravessao(c.t.length > 70 ? c.t.slice(0, 67).replace(/\s+\S*$/, '') + '...' : c.t))}` : '';
    return `<div class="slide">${cab(C.prazoTxt(c))}
    ${img ? `<img class="foto it" src="${url(img.arquivo)}"><div class="cr2">Imagem: página da chamada</div>` : `<div class="foto it vazio"><span>${esc(lugar)}</span></div>`}
    <div class="c2"><div class="para">${esc(C.ROTULO_PERSONA[c.para])}</div>
      <div class="h" style="font-size:${tamTit(tit)}px">${esc(tit)}</div>
      <div class="lei">${esc(C.leitura(c, i))}</div>
      <div class="fic">${f}</div></div>
    <div class="rod">Fonte: ${esc(c.fonte)}${naFonte}</div>${pag(i + 2)}</div>`.replace('class="cab"', urg ? 'class="cab urg"' : 'class="cab"');
  }).join('');

  const sFim = `<div class="slide">${cab('O que ficou de fora')}
    <div class="c"><div class="gg g2">${foraTaxa ? '<div>QUEM COBRA</div><div>FICA À PARTE</div>' : '<div>A LISTA</div><div>COMPLETA</div>'}</div>
    <div class="sub s2">${foraTaxa ? 'Residência em que o artista paga a inscrição tem seção própria no site, com o valor lido da página.' : 'Prêmios, bolsas e residências, com o que fecha primeiro no topo.'}</div>
    <div class="url">vernissagessp.com.br/editais</div></div>
    <div class="seta">prazo conferido na página. confirme no regulamento</div>${pag(total)}</div>`;

  const css = `
@font-face{font-family:'Switzer';src:url('${url(path.join(RAIZ, 'fontes/Switzer-Variable.woff2'))}') format('woff2-variations');font-weight:100 900}
@font-face{font-family:'IS';src:url('${url(path.join(RAIZ, 'fontes/InstrumentSerif-Regular.ttf'))}');font-style:normal}
@font-face{font-family:'IS';src:url('${url(path.join(RAIZ, 'fontes/InstrumentSerif-Italic.ttf'))}');font-style:italic}
*{margin:0;padding:0;box-sizing:border-box}
.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${D.PAPEL};color:${D.TINTA};font-family:'Switzer',sans-serif}
.cab{position:absolute;left:70px;right:70px;top:56px;height:46px;border-bottom:3px solid ${D.TINTA};display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.17em;text-transform:uppercase}
.cab span{color:${D.TERRA}}
.foto{position:absolute;left:70px;top:130px;width:940px;height:640px;object-fit:cover;display:block}
.foto.it{height:480px}
.foto.vazio{background:#E6E1D6;display:flex;align-items:center;justify-content:center}
.foto.vazio span{font-family:'IS',serif;font-size:150px;letter-spacing:-.02em;color:${D.TERRA};padding:0 30px;text-align:center;line-height:1}
.cr2{position:absolute;left:70px;top:616px;font-size:15px;letter-spacing:.04em;color:#9a948a}
.gg{position:absolute;left:62px;top:800px;font-weight:800;text-transform:uppercase;letter-spacing:-.06em;line-height:.86;font-size:150px;color:${D.TERRA}}
.sub{position:absolute;left:70px;right:70px;top:1076px;font-family:'IS',serif;font-size:42px;line-height:1.06}
.cred{position:absolute;left:70px;right:140px;bottom:96px;font-size:16px;letter-spacing:.03em;color:#8a857b;line-height:1.4}
.c{position:absolute;left:62px;right:70px;top:150px;bottom:130px;display:flex;flex-direction:column;justify-content:center}
.c .gg{position:static;font-size:128px}.c .gg.g2{font-size:128px}
.c .sub.s2{position:static;font-size:54px;margin:40px 8px 0;max-width:900px}
.url{font-weight:800;font-size:46px;letter-spacing:-.02em;color:${D.TERRA};margin:50px 0 0 8px}
.c2{position:absolute;left:70px;right:70px;top:648px}
.para{font-weight:800;font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:${D.TERRA};margin-bottom:14px}
.h{font-weight:800;text-transform:uppercase;letter-spacing:-.035em;line-height:.93}
.lei{font-family:'IS',serif;font-size:44px;line-height:1.08;margin-top:24px;max-width:930px}
.fic{margin-top:26px}
.fr{display:grid;grid-template-columns:150px 1fr;gap:20px;align-items:baseline;border-top:2px solid ${D.TINTA};padding:10px 0 9px}
.fr span{font-weight:800;font-size:17px;letter-spacing:.14em;text-transform:uppercase;color:#6f6a60}
.fr b{font-weight:600;font-size:27px;letter-spacing:-.005em}
.rod{position:absolute;left:70px;right:140px;bottom:50px;font-weight:700;font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:#6f6a60;line-height:1.5}
.seta{position:absolute;left:70px;right:140px;bottom:50px;font-weight:800;font-size:22px;letter-spacing:.14em;text-transform:uppercase}
.pag{position:absolute;right:70px;bottom:50px;font-weight:800;font-size:22px;letter-spacing:.14em;color:#9a948a}
`;
  return `<!doctype html><meta charset="utf-8"><style>${css}</style><body>${sCapa}${sItens}${sFim}</body>`;
}

(async () => {
  console.log(`EDITAIS ${hoje}${PREVIA ? ' (PRÉVIA)' : ''}: ${pool.length} no radar`);
  const cands = C.candidatos(pool, hoje);
  console.log(`  ${cands.length} dentro da janela de prazo, sem taxa conhecida e que parecem chamada`);

  /* etapa 2: conferir na rede. 14 candidatas, 4 por vez. */
  const topo = cands.slice(0, 14), conf = [];
  for (let i = 0; i < topo.length; i += 4) {
    const lote = await Promise.all(topo.slice(i, i + 4).map(async c => ({ c, r: await E.confirmar(c) })));
    lote.forEach(({ c, r }) => { console.log(`  ${r.ok ? 'confirmou' : 'FORA     '} ${c.prazo} ${c.t.slice(0, 48).padEnd(48)} ${r.motivo}${r.achou ? ' ["' + r.achou + '"]' : ''}`); if (r.ok) conf.push({ ...c, imagem: r.imagem, ...(r.idioma ? { idioma: r.idioma, tituloPT: c.idioma !== r.idioma } : {}) }); });
  }
  const daqui = conf.filter(c => c.onde !== 'exterior').length;
  const minimo = PREVIA ? 1 : 3;
  if (conf.length < minimo || (!PREVIA && daqui < 1)) {
    console.log(`\nSem carrossel de editais: ${conf.length} com prazo confirmado na página (${daqui} daqui). Precisa de 3, com ao menos 1 daqui.`);
    process.exit(2);
  }
  const pick = C.selecionar(conf, N);

  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const sharp = require(path.join(REND, 'node_modules', 'sharp'));
  const tmpDir = path.join(RAIZ, '.editais-tmp'); fs.mkdirSync(tmpDir, { recursive: true });
  const imgs = {};
  for (const [i, c] of pick.entries()) if (c.imagem) { const r = await E.baixarImagem(c.imagem, path.join(tmpDir, `c${i + 1}.jpg`), sharp); if (r) imgs[c.link] = r; }
  const capa = await escolherCapa(sharp);
  console.log(`  capa: ${capa ? capa.titulo + ' (' + capa.casa + ')' : 'sem obra elegível'} · imagens de chamada: ${Object.keys(imgs).length}/${pick.length}`);

  const legenda = C.legendaEditais({ pick, foraTaxa, capa });
  const pecas = [C.gancho().sub, ...pick.flatMap((c, i) => [C.titulo(c), C.leitura(c, i)])].join('\n');
  const falhas = [...C.lint(legenda, { tipo: 'legenda' }).map(v => ({ ...v, onde: 'legenda' })), ...C.lint(pecas, { tipo: 'peca' }).map(v => ({ ...v, onde: 'peça' }))];
  falhas.forEach(v => console.log(`  ${v.grave ? 'ERRO ' : 'aviso'} ${v.onde} · ${v.regra}: "${v.trecho}" (${v.dica})`));
  if (falhas.some(v => v.grave)) { console.error('\nABORTADO: o texto viola a voz (ESTILO.md / docs/COPY.md).'); fs.rmSync(tmpDir, { recursive: true, force: true }); process.exit(1); }
  if (argv.includes('--seco')) { console.log('\n' + legenda); fs.rmSync(tmpDir, { recursive: true, force: true }); return; }

  const html = path.join(RAIZ, '.editais-post.html');
  fs.writeFileSync(html, montar(pick, capa, imgs, tmpDir));
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const p = await browser.newPage();
  await p.goto(url(html), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 400));
  fs.mkdirSync(out, { recursive: true });
  const pre = PREVIA ? 'editais-previa' : 'editais';
  const els = await p.$$('.slide');
  for (let i = 0; i < els.length; i++) { const f = path.join(out, `${pre}-${String(i + 1).padStart(2, '0')}.png`); await els[i].screenshot({ path: f }); console.log('OK ' + f); }
  await browser.close(); fs.rmSync(html, { force: true }); fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.writeFileSync(path.join(out, `${pre}-LEGENDA.md`), legenda + '\n');
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
