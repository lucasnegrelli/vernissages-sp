/* ============================================================
   REEL — monta o Reel com as SUAS filmagens de um rolê
   ============================================================

   O que é.

   Você filma no celular (vertical), joga os clipes numa pasta e isto monta:
   cortes curtos na ordem dos arquivos, o som ao vivo mantido, a frase-gancho
   por cima dos primeiros segundos e, no fim, o cartão da mostra (casa,
   título, até quando) no desenho do Vernissages.

   Por que existe — e por que mudou.

   A v1 (mesmo dia, 25/09/2026) animava o carrossel da agenda em vídeo. O
   Lucas cortou: vídeo igual ao carrossel não faz sentido, "o vídeo é outra
   proposta". O dado do Instagram de 2026 concorda: no Reels o gancho
   autêntico, de quem está reagindo a algo real, rende mais que o polido, e
   POV é o formato de gancho que mais segura. Gente, som e sala cheia não
   saem da base — saem do celular.

   O que ele NÃO faz: não escolhe trecho bom por você (corta a partir de
   --pulo segundos de cada clipe) e não põe música. O som é o do lugar; se
   quiser áudio em alta, troque no app.

   Uso:
     node reel.js --clipes=SOCIAL/09/27/jam --mostra="Passeio Noturno" \
         --gancho="POV: domingo de jam dentro de uma galeria" --out=SOCIAL/09/27
   Opções: --corte=2.4 (s por clipe)  --pulo=0.8 (s ignorados no início)
           --nome=reel   --max=10 (clipes)
   Precisa de ffmpeg no PATH.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { carregarDados, RAIZ, esc, tituloCurto, autoria, porExtenso, PALETAS } = require('./rima.js');

const W = 1080, H = 1920, FPS = 30;
const ACENTO = '#C96F4A';
const T_FIM = 2.2;          // cartão final, segundos
const T_GANCHO = 2.6;       // frase de abertura, segundos
const VIDEO = /\.(mp4|mov|m4v|webm)$/i;

const argv = process.argv.slice(2);
const flag = (n, d) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=').slice(1).join('=') : d; };

function acharMostra(DATA, nome) {
  if (!nome) return null;
  const n = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const e = (DATA.expos || []).find(x => n(x.t).includes(n(nome)));
  if (!e) throw new Error('Mostra "' + nome + '" não está no dados.js.');
  return { e, v: DATA.venues.find(v => v.name === e.v) };
}

/* Os dois cartões em PNG transparente: o gancho vai POR CIMA do vídeo (é
   filmagem de gente, não reprodução de obra — a regra da obra não se aplica),
   o fim cobre a tela. */
function html(gancho, m) {
  const p = PALETAS.escuro;
  const quem = m ? autoria(m.e) : '';
  const hoje = new Date().toISOString().slice(0, 10);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:transparent}
.c{position:relative;width:${W}px;height:${H}px;font-family:'Switzer',sans-serif;overflow:hidden}
.g{position:absolute;left:64px;right:64px;top:250px}
.g span{background:${p.texto};color:${p.fundo};font-size:66px;font-weight:800;line-height:1.28;letter-spacing:-.025em;
  padding:4px 18px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.f{background:${p.fundo};color:${p.texto}}
.f .et{position:absolute;left:72px;top:230px;font-size:24px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:${ACENTO}}
.f .col{position:absolute;left:72px;right:60px;top:300px}
.f .t{margin-left:-6px;font-size:124px;font-weight:800;line-height:.9;letter-spacing:-.045em;text-transform:uppercase}
.f .q{margin-top:34px;font-size:44px;font-weight:300;color:${p.meio}}
.f .o{margin-top:56px;font-size:40px;font-weight:600;line-height:1.3}
.f .o small{display:block;font-size:32px;font-weight:400;color:${p.meio}}
.f .b{margin-top:90px;font-size:30px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:${p.fraco}}
</style></head><body>
<div class="c" id="gancho"><div class="g"><span>${esc(gancho || '')}</span></div></div>
<div class="c f" id="fim">
  <div class="et">${m ? (m.e.ini > hoje ? 'abre ' + esc(porExtenso(m.e.ini)) : 'em cartaz') : 'Vernissages SP'}</div>
  <div class="col"><div class="t">${m ? esc(tituloCurto(m.e)) : 'Vernissages SP'}</div>
  ${quem ? `<div class="q">${esc(quem)}</div>` : ''}
  ${m ? `<div class="o">${esc(m.v.name)}${m.v.ig ? ' · @' + esc(m.v.ig) : ''}<small>${esc(m.v.addr)} · ${esc(m.v.b)}${m.e.fim ? ' · até ' + esc(porExtenso(m.e.fim)) : ''}</small></div>` : ''}
  <div class="b">Agenda e mapa: link na bio</div></div>
</div></body></html>`;
}

async function cartoes(pasta, gancho, m) {
  const tmp = path.join(RAIZ, '.reel-tmp.html');
  fs.writeFileSync(tmp, html(gancho, m), 'utf8');
  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
  });
  try {
    const page = await browser.newPage();
    await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const out = {};
    for (const id of ['gancho', 'fim']) {
      out[id] = path.join(pasta, '.reel-' + id + '.png');
      await (await page.$('#' + id)).screenshot({ path: out[id], omitBackground: true });
    }
    return out;
  } finally { await browser.close(); fs.unlinkSync(tmp); }
}

const temAudio = f => {
  try {
    return execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', f],
      { encoding: 'utf8' }).trim() !== '';
  } catch { return false; }
};

async function principal() {
  const dir = flag('clipes');
  if (!dir || !fs.existsSync(dir)) throw new Error('Passe --clipes=<pasta com os vídeos>.');
  const clipes = fs.readdirSync(dir).filter(f => VIDEO.test(f)).sort().slice(0, Number(flag('max', '10')))
    .map(f => path.resolve(dir, f));
  if (clipes.length < 2) throw new Error('Precisa de pelo menos 2 clipes em ' + dir);
  const corte = Number(flag('corte', '2.4')), pulo = Number(flag('pulo', '0.8'));
  const saida = path.resolve(RAIZ, flag('out', dir));
  const nome = flag('nome', 'reel');
  const m = acharMostra(carregarDados(), flag('mostra'));
  fs.mkdirSync(saida, { recursive: true });
  const cart = await cartoes(saida, flag('gancho'), m);

  const total = clipes.length * corte + T_FIM;
  const args = ['-y'];
  clipes.forEach(c => args.push('-ss', String(pulo), '-t', String(corte), '-i', c));
  args.push('-loop', '1', '-t', String(total), '-i', cart.gancho);
  args.push('-loop', '1', '-t', String(total), '-i', cart.fim);
  const iG = clipes.length, iF = clipes.length + 1;

  /* Cada clipe: preenche 1080x1920 (corta o excesso; filmagem deitada perde
     as laterais), 30 fps, áudio 44,1 kHz estéreo. Clipe mudo ganha silêncio
     para o concat não quebrar. */
  const f = [];
  clipes.forEach((c, i) => {
    f.push(`[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},setsar=1,trim=0:${corte},setpts=PTS-STARTPTS[v${i}]`);
    f.push(temAudio(c)
      ? `[${i}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${corte},asetpts=PTS-STARTPTS[a${i}]`
      : `anullsrc=r=44100:cl=stereo,atrim=0:${corte}[a${i}]`);
  });
  f.push(clipes.map((_, i) => `[v${i}][a${i}]`).join('') + `concat=n=${clipes.length}:v=1:a=1[cv][ca]`);
  /* o cartão final prolonga o vídeo: último quadro congelado por baixo e o
     som do lugar sumindo */
  f.push(`[cv]tpad=stop_mode=clone:stop_duration=${T_FIM}[cvp]`);
  f.push(`[ca]apad=pad_dur=${T_FIM},afade=t=out:st=${(total - T_FIM - 0.4).toFixed(2)}:d=${(T_FIM + 0.4).toFixed(2)}[ao]`);
  f.push(`[cvp][${iG}:v]overlay=0:0:enable='lt(t,${T_GANCHO})'[g]`);
  f.push(`[g][${iF}:v]overlay=0:0:enable='gte(t,${(total - T_FIM).toFixed(2)})',format=yuv420p[vo]`);

  const mp4 = path.join(saida, nome + '.mp4');
  args.push('-filter_complex', f.join(';'), '-map', '[vo]', '-map', '[ao]', '-t', total.toFixed(2),
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-c:a', 'aac', '-b:a', '160k',
            '-r', String(FPS), '-movflags', '+faststart', mp4);
  execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
  fs.copyFileSync(cart.fim, path.join(saida, nome + '-capa.png'));
  [cart.gancho, cart.fim].forEach(x => fs.unlinkSync(x));
  console.log('OK ' + mp4 + '  (' + clipes.length + ' clipes, ' + total.toFixed(1) + ' s)');
  if (m && m.v.ig) console.log('Collab: convide @' + m.v.ig + (autoria(m.e) ? ' e marque ' + autoria(m.e) : ''));
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
