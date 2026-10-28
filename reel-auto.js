#!/usr/bin/env node
/* ============================================================
   reel-auto.js — Reel montado só da base, sem filmagem (27/10/2026)

   POR QUE EXISTE
   O algoritmo do Instagram distribui para quem NÃO segue quase só o Reel; o
   feed de imagem fica entre os seguidores. A conta tinha 100 seguidores e
   nenhum Reel porque o reel.js exige filmagem do Lucas. Este monta um Reel
   de 15 s com as mesmas obras que o caçador de imagens já levantou:

     gancho (2,2 s) -> 5 mostras (2,4 s cada, zoom lento) -> chamada (1,8 s)

   O gancho segue a situação do dia (regra de estratégia, não de enfeite):
     - 4+ mostras fechando em 7 dias  -> "ÚLTIMOS DIAS" (urgência vende)
     - sexta                            -> "O QUE VER NO FIM DE SEMANA"
     - demais                           -> "N EXPOSIÇÕES PARA VER ESSA SEMANA"

   REGRAS (as do projeto)
   - Só fato da base (título, casa, bairro, data, crédito). Nada inventado.
   - Imagem passa por exigirObra (crédito, obra, tamanho). Foto de feed pode
     repetir aqui: é outro formato, outra audiência (não-seguidores).
   - Uma casa por Reel; mostra não repete em 21 dias (SOCIAL/REELS-USADOS.json).
   - Sem áudio por enquanto (a API não escolhe trilha do Instagram).

   Uso:
     node reel-auto.js [--date=AAAA-MM-DD] [--n=5] [--seco]
                       [--fila --quando=HH:MM]   (grava em fila/ para o publicar.yml)
   Precisa de ffmpeg no PATH e de .render (sharp + puppeteer-core) ou RENDER_DIR.
   ============================================================ */

'use strict';

process.env.VSP_FOTOS_LIVRE = '1';   // foto de feed pode repetir no Reel

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const base = require('./rima.js');
const { carregarDados, exigirObra, medir, RAIZ, CSS, esc, porExtenso, arroba, tituloCurto, autoria } = base;

const W = 1080, H = 1920, FPS = 30;
const T_GANCHO = 2.2, T_MOSTRA = 2.4, T_FIM = 1.8;
const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
const N = parseInt(flag('n', '5'), 10);
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const REND = process.env.RENDER_DIR || path.join(RAIZ, '.render');
const USADOS = path.join(RAIZ, 'SOCIAL', 'REELS-USADOS.json');

const lerJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
const dow = new Date(hoje + 'T12:00:00Z').getUTCDay();

/* ---------- escolha ---------- */
async function escolher(DATA) {
  const V = Object.fromEntries(DATA.venues.map(v => [v.name, v]));
  const usados = lerJson(USADOS, {});
  const aberta = DATA.expos.filter(e => e.ini && e.fim && e.ini <= hoje && e.fim >= hoje && V[e.v]);
  const cand = [];
  for (const e of aberta) {
    const k = e.t + '|' + e.v;
    if (usados[k] && dias(usados[k], hoje) < 21) continue;
    let rel = null, dim = null;
    try { rel = exigirObra(e, { recusarVista: true }); dim = await medir(rel); } catch (x) { rel = null; }
    if (!rel || !dim || !dim.w || dim.w < 1080) continue;
    cand.push({ e, v: V[e.v], rel, dim, falta: dias(hoje, e.fim) });
  }
  const fecham = cand.filter(c => c.falta <= 7);
  const modo = fecham.length >= 4 ? 'ultimos' : dow === 5 ? 'fds' : 'semana';
  const ordem = (modo === 'ultimos' ? fecham : cand).slice().sort((a, b) => a.falta - b.falta);
  const casas = new Set(), pick = [];
  for (const c of ordem) { if (casas.has(c.v.name)) continue; casas.add(c.v.name); pick.push(c); if (pick.length === N) break; }
  return { modo, pick };
}

const GANCHO = {
  ultimos: n => ['ÚLTIMOS DIAS', `${n} exposições que fecham essa semana em SP`],
  fds: n => ['FIM DE SEMANA', `${n} exposições para ver em SP`],
  semana: n => ['EM CARTAZ EM SP', `${n} exposições para ver essa semana`],
};

/* coletiva com lista longa de nomes: 3 primeiros + "e outros" (fato, sem inventar) */
function quemCurto(q) {
  const n = q.split(/,\s*| e /).filter(Boolean);
  return n.length > 4 ? n.slice(0, 3).join(', ') + ' e outros' : q;
}

function selo(c, modo) {
  if (c.falta <= 0) return 'ÚLTIMO DIA';
  if (c.falta === 1) return 'FECHA AMANHÃ';
  if (c.falta <= 7) return `FECHA EM ${c.falta} DIAS`;
  return 'EM CARTAZ';
}

/* ---------- legenda (só fatos) ---------- */
function legenda(modo, pick) {
  const [, tit] = GANCHO[modo](pick.length);
  const linhas = pick.map((c, i) =>
    `${i + 1}. ${tituloCurto(c.e)}${autoria(c.e) ? ', ' + quemCurto(autoria(c.e)) : ''}\n   ${(c.v.name + ' ' + arroba(c.v.ig)).trim()},${c.v.b} · até ${porExtenso(c.e.fim)}`);
  return `${tit.charAt(0).toUpperCase() + tit.slice(1)}.\n\n${linhas.join('\n\n')}\n\n` +
    `Salva para não esquecer e manda para quem vai com você.\n\n` +
    `Fotos: cortesia das casas e dos artistas.\n\n` +
    `#arteemsp #exposicaosp #saopaulo #galeriadearte #arte #museusp #agendacultural #oqueFazerEmSP`;
}

/* ---------- renderização ---------- */
const CSS_OVERLAY = `${CSS}
  html,body{background:transparent!important;margin:0}
  .ov{width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:'Switzer',system-ui,sans-serif;color:#fff}
  .ov .grad{position:absolute;left:0;right:0;bottom:0;height:62%;background:linear-gradient(to top,rgba(8,8,8,.88),rgba(8,8,8,.55) 55%,rgba(8,8,8,0))}
  .ov .topo{position:absolute;left:88px;top:96px;font-size:26px;letter-spacing:.28em;text-transform:uppercase;font-weight:500;opacity:.92}
  .ov .bloco{position:absolute;left:88px;right:88px;bottom:190px}
  .ov .selo{font-size:26px;font-weight:600;letter-spacing:.28em;margin-bottom:26px;color:#F0A47F}
  .ov .tit{font-size:84px;font-weight:500;line-height:1.06;letter-spacing:-.02em}
  .ov .quem{font-size:38px;font-weight:300;margin-top:18px;opacity:.95}
  .ov .serv{font-size:32px;font-weight:300;margin-top:34px;line-height:1.5;opacity:.95}
  .ov .cred{position:absolute;left:88px;bottom:84px;font-size:22px;font-weight:400;opacity:.9;text-shadow:0 1px 8px rgba(0,0,0,.7)}
  .ov .marca{position:absolute;right:88px;bottom:84px;font-size:26px;font-weight:600;letter-spacing:.06em;text-shadow:0 1px 8px rgba(0,0,0,.7)}
  .ov.gancho .grad{height:100%;background:linear-gradient(to bottom,rgba(8,8,8,.55),rgba(8,8,8,.62) 45%,rgba(8,8,8,.8))}
  .ov.gancho .bloco{bottom:auto;top:620px}
  .ov .tit,.ov .selo,.ov .quem,.ov .serv{text-shadow:0 2px 18px rgba(0,0,0,.55)}
  .ov.gancho .selo{font-size:34px;color:#FFB48C}
  .ov.gancho .tit{font-size:112px;line-height:1.02}
  .ov.fim .bloco{bottom:auto;top:700px}
  .ov.fim .tit{font-size:96px}
  .ov.fim .serv{font-size:40px}
  .ov.cheio .grad{height:100%;background:rgba(8,8,8,.58)}`;

function htmlOverlay(tipo, d) {
  let corpo = '';
  if (tipo === 'gancho') corpo = `<div class="bloco"><div class="selo">${esc(d.selo)}</div><div class="tit">${esc(d.titulo)}</div></div>`;
  else if (tipo === 'fim') corpo = `<div class="bloco"><div class="tit">Salva e manda para quem vai com você</div><div class="serv">Guia independente de exposições em São Paulo<br>@vernissagessp</div></div>`;
  else corpo = `<div class="bloco"><div class="selo">${esc(d.selo)}</div><div class="tit">${esc(d.titulo)}</div>${d.quem ? `<div class="quem">${esc(d.quem)}</div>` : ''}<div class="serv">${esc(d.casa)}<br>${esc(d.bairro)} · até ${esc(d.ate)}</div></div>`;
  const cred = tipo === 'mostra' && d.cred ? `<div class="cred">${esc(d.cred)}</div>` : '';
  const cls = tipo === 'gancho' ? 'gancho' : tipo === 'fim' ? 'fim cheio' : '';
  return `<!doctype html><meta charset="utf-8"><style>${CSS_OVERLAY}</style><body>
    <div class="ov ${cls}"><div class="grad"></div><div class="topo">Vernissages SP</div>${corpo}${cred}${tipo === 'mostra' ? '<div class="marca">@vernissagessp</div>' : ''}</div>`;
}

async function preparaImagem(sharp, c, destino) {
  const AW = 1188, AH = 2112;   // 10% maior que o quadro, espaço pro zoom
  const meta = await sharp(path.resolve(RAIZ, c.rel)).rotate().metadata();
  const esc2 = Math.max(AW / meta.width, AH / meta.height);
  const w = Math.round(meta.width * esc2), h = Math.round(meta.height * esc2);
  const foco = typeof c.e.foco === 'number' ? c.e.foco : 50;
  const left = Math.max(0, Math.min(w - AW, Math.round((w - AW) * foco / 100)));
  await sharp(path.resolve(RAIZ, c.rel)).rotate().resize(w, h).extract({ left, top: Math.round((h - AH) / 2), width: AW, height: AH })
    .jpeg({ quality: 92 }).toFile(destino);
}

function clipe(img, ov, dur, saida, zoomIn) {
  const frames = Math.round(dur * FPS);
  const z = zoomIn ? `min(1+0.0011*on,1.14)` : `max(1.14-0.0011*on,1)`;
  const filtro = `[0:v]zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS}[v];` +
                 `[v][1:v]overlay=0:0:shortest=1,format=yuv420p[o]`;
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', img, '-loop', '1', '-framerate', String(FPS), '-i', ov,
    '-filter_complex', filtro, '-map', '[o]', '-t', String(dur), '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-an', saida]);
}

async function principal() {
  const DATA = carregarDados();
  const { modo, pick } = await escolher(DATA);
  console.log(`REEL ${hoje} · modo ${modo} · ${pick.length} mostra(s)`);
  pick.forEach((c, i) => console.log(`  ${i + 1}. ${tituloCurto(c.e)} · ${c.v.name} · fecha em ${c.falta} d · ${c.dim.w}px`));
  if (pick.length < 3) { console.log('Menos de 3 mostras com obra: sem Reel hoje.'); process.exit(2); }
  if (argv.includes('--seco')) return;

  const sharp = require(path.join(REND, 'node_modules', 'sharp'));
  const puppeteer = require(path.join(REND, 'node_modules', 'puppeteer-core'));
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'reel-'));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });

  const [seloG, titG] = GANCHO[modo](pick.length);
  const segs = [{ tipo: 'gancho', c: pick[0], dur: T_GANCHO, d: { selo: seloG, titulo: titG } }];
  pick.forEach(c => segs.push({ tipo: 'mostra', c, dur: T_MOSTRA, d: {
    selo: selo(c, modo), titulo: tituloCurto(c.e), quem: quemCurto(autoria(c.e)), casa: c.v.name, bairro: c.v.b,
    ate: porExtenso(c.e.fim), cred: c.e.cred } }));
  segs.push({ tipo: 'fim', c: pick[pick.length - 1], dur: T_FIM, d: {} });

  const lista = [];
  const pagina = path.join(RAIZ, '.reel-tmp.html');
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const img = path.join(tmp, `img${i}.jpg`), ov = path.join(tmp, `ov${i}.png`), out = path.join(tmp, `c${i}.mp4`);
    await preparaImagem(sharp, s.c, img);
    fs.writeFileSync(pagina, htmlOverlay(s.tipo, s.d));
    const p = await browser.newPage();
    await p.goto('file:///' + pagina.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await p.evaluate(() => document.fonts && document.fonts.ready);
    await p.screenshot({ path: ov, omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
    await p.close();
    clipe(img, ov, s.dur, out, i % 2 === 0);
    lista.push(out);
  }
  await browser.close(); fs.rmSync(pagina, { force: true });

  const txt = path.join(tmp, 'lista.txt');
  fs.writeFileSync(txt, lista.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const saidaDir = argv.includes('--fila')
    ? path.join(RAIZ, 'fila', 'vernissagessp', `${hoje}_reel`)
    : path.join(RAIZ, 'SOCIAL', hoje.slice(5, 7), hoje.slice(8, 10));
  fs.mkdirSync(saidaDir, { recursive: true });
  const mp4 = path.join(saidaDir, 'reel.mp4');
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', txt,
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '96k', mp4]);
  const leg = legenda(modo, pick);
  fs.writeFileSync(path.join(saidaDir, 'reel-LEGENDA.md'), leg + '\n');
  console.log(`OK ${path.relative(RAIZ, mp4)} (${(fs.statSync(mp4).size / 1048576).toFixed(1)} MB)`);

  if (argv.includes('--fila')) {
    const q = flag('quando', '18:00');
    const post = { conta: 'vernissagessp', id: `${hoje}_reel`, status: 'aprovado', tipo: 'reel', quando: `${hoje}T${q}:00-03:00`,
                   imagens: ['reel.mp4'], legenda: leg, collab: [], collabExtra: [] };
    fs.writeFileSync(path.join(saidaDir, 'post.json'), JSON.stringify(post, null, 2) + '\n');
    fs.rmSync(path.join(saidaDir, 'reel-LEGENDA.md'), { force: true });
    console.log(`na fila: ${post.id} às ${q}`);
  }
  const u = lerJson(USADOS, {});
  for (const c of pick) u[c.e.t + '|' + c.e.v] = hoje;
  if (!argv.includes('--sem-memoria')) fs.writeFileSync(USADOS, JSON.stringify(u, null, 2) + '\n');
  fs.rmSync(tmp, { recursive: true, force: true });
}

principal().catch(e => { console.error(e.message); process.exit(1); });
