/* ============================================================
   REEL — o fim de semana em 15 segundos, vertical
   ============================================================

   O que é.

   A mesma seleção do agenda.js (abre + últimos dias) virada vídeo 1080×1920:
   capa com a pergunta, um cartão por mostra com a obra em movimento lento, e
   cartão final mandando para o link da bio. Sai sem áudio: o som entra no
   app, na hora de postar, com um áudio em alta — é o que o Instagram
   distribui melhor, e escolher faixa é decisão do dia, não do script.

   Por que existe.

   Em 2026 o sinal número um de distribuição do Instagram é tempo assistido,
   incluindo replay (Mosseri): um Reel de 15 s visto três vezes vale mais que
   um de 60 s visto uma. Imagem parada quase não chega em quem não segue.
   Curto de propósito, para o loop.

   Zona segura. A interface do Reels cobre ~250 px embaixo (legenda, botões)
   e ~200 px em cima. Nada importante mora nessas faixas.

   A regra da obra continua: texto nunca por cima da imagem.

   Uso:
     node reel.js --out=SOCIAL/10/02 --date=2026-10-02 [--config=...]
   Precisa de ffmpeg no PATH.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { carregarDados, RAIZ, esc, tituloCurto, autoria, PALETAS } = require('./rima.js');
const { escolher, renderizar, ACENTO, diaSemana, curto } = require('./agenda.js');

const W = 1080, H = 1920, FPS = 30;
const T_CAPA = 1.6, T_MOSTRA = 1.5, T_FIM = 1.8;

function css(p) {
  return `
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900;font-display:block}
*{margin:0;padding:0;box-sizing:border-box}
.s{position:relative;width:${W}px;height:${H}px;background:${p.fundo};color:${p.texto};font-family:'Switzer',sans-serif;overflow:hidden}
.et{font-size:24px;font-weight:600;letter-spacing:.28em;text-transform:uppercase}
.capa .g{position:absolute;left:70px;right:60px;top:300px;font-size:168px;font-weight:800;line-height:.86;letter-spacing:-.045em;text-transform:uppercase}
.capa .g em{font-style:normal;color:${ACENTO}}
.capa .d{position:absolute;left:74px;top:1000px;font-size:80px;font-weight:300;letter-spacing:-.02em}
.capa .n{position:absolute;left:74px;top:1120px;font-size:34px;font-weight:500;color:${p.meio};letter-spacing:.04em}
.m{display:flex;flex-direction:column;justify-content:center;padding:200px 0 260px}
.m .q{flex:none;max-height:1060px;display:flex;justify-content:center;overflow:hidden}
.m .q img{max-width:100%;max-height:1060px;display:block}
.m .q.cheio,.m .q.cheio img{width:100%;height:1060px;object-fit:cover}
.m .b{padding:44px 70px 0}
.chip{display:inline-block;background:${ACENTO};color:#fff;padding:12px 20px 11px;font-size:24px;font-weight:700;letter-spacing:.22em;text-transform:uppercase}
.chip.f{background:${p.texto};color:${p.fundo}}
.m .dia{font-size:120px;font-weight:800;line-height:.9;letter-spacing:-.045em;margin-top:26px}
.m .t{font-size:52px;font-weight:600;line-height:1.06;letter-spacing:-.02em;margin-top:22px}
.m .o{font-size:30px;font-weight:400;color:${p.fraco};margin-top:14px}
.fim .g{position:absolute;left:70px;right:70px;top:520px;font-size:120px;font-weight:800;line-height:.9;letter-spacing:-.04em;text-transform:uppercase}
.fim .p{position:absolute;left:74px;top:960px;font-size:44px;font-weight:300;line-height:1.3;color:${p.meio}}
.fim .p b{color:${ACENTO};font-weight:600}
.marca{position:absolute;left:74px;top:210px;color:${p.fraco}}
`;
}

function cartoes(sel) {
  const abre = sel.itens.filter(x => x.tipo === 'abre').length;
  const fecha = sel.itens.filter(x => x.tipo === 'fecha').length;
  const fotos = sel.itens.filter(x => x.rel).slice(0, 6);
  const partes = [];
  partes.push(`<div class="s capa"><div class="marca et">Vernissages SP</div>
    <div class="g">O que ver<br>em SP<br><em>este fim<br>de semana</em></div>
    <div class="d">${curto(sel.de)} — ${curto(sel.domingo)}</div>
    <div class="n">${[abre && abre + (abre > 1 ? ' aberturas' : ' abertura'), fecha && fecha + ' em últimos dias'].filter(Boolean).join(' · ')}</div></div>`);
  for (const x of fotos) {
    const vertical = x.dim && x.dim.h > x.dim.w;
    partes.push(`<div class="s m">
      <div class="q${vertical || x.e.vista ? ' cheio' : ''}"><img src="${esc(x.rel)}"></div>
      <div class="b">
        ${x.tipo === 'abre' ? '<span class="chip">abre</span>' : '<span class="chip f">último dia</span>'}
        <div class="dia">${diaSemana(x.dia)} ${x.dia.slice(8, 10)}</div>
        <div class="t">${esc(tituloCurto(x.e))}</div>
        <div class="o">${esc(x.v.name)} · ${esc(x.v.b)}</div>
      </div></div>`);
  }
  partes.push(`<div class="s fim"><div class="marca et">Vernissages SP</div>
    <div class="g">+ ${Math.max(0, sel.itens.length - fotos.length)} mostras<br>no mapa</div>
    <div class="p"><b>Link na bio.</b><br>Manda pra quem vai<br>com você.</div></div>`);
  return { html: partes.join(''), n: partes.length };
}

function montarVideo(pngs, saida, nome) {
  const dur = i => i === 0 ? T_CAPA : i === pngs.length - 1 ? T_FIM : T_MOSTRA;
  const args = ['-y'];
  /* Uma imagem por entrada, SEM -loop: o zoompan já gera d quadros a partir
     de um quadro só. Com -loop cada quadro repetido virava d quadros e o
     vídeo de 12 s saía com 8 minutos. */
  pngs.forEach(p => args.push('-i', p));
  /* Zoom lento de 1.00 a ~1.05 em cada cartão (sobe-amostra antes para não
     tremer) e corte seco entre eles — corte seco segura mais que fade. */
  const f = pngs.map((_, i) => {
    const frames = Math.round(dur(i) * FPS);
    return `[${i}:v]scale=${W * 2}:${H * 2},zoompan=z='1+0.05*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},setsar=1[v${i}]`;
  });
  const filtro = f.join(';') + ';' + pngs.map((_, i) => `[v${i}]`).join('') + `concat=n=${pngs.length}:v=1:a=0,format=yuv420p[out]`;
  const mp4 = path.join(saida, nome + '.mp4');
  args.push('-filter_complex', filtro, '-map', '[out]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
            '-r', String(FPS), '-movflags', '+faststart', mp4);
  execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
  return mp4;
}

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));
  const cfg = argv.some(x => x.startsWith('--config=')) && fs.existsSync(path.resolve(flag('config')))
    ? JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8')) : {};
  const nome = cfg.nome || 'reel';
  const p = PALETAS[cfg.paleta] || PALETAS.escuro;

  const sel = await escolher(carregarDados(), hoje, cfg);
  if (sel.itens.filter(x => x.rel).length < 2) throw new Error('Menos de 2 mostras com obra na janela — reel sem imagem não segura ninguém.');
  const c = cartoes(sel);
  const saida = path.resolve(RAIZ, flag('out', '.'));
  const quadros = path.join(saida, '.' + nome + '-quadros');
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css(p)}</style></head><body>${c.html}</body></html>`;
  const pngs = await renderizar(html, quadros, nome, W, H);
  const mp4 = montarVideo(pngs, saida, nome);
  /* A capa do Reel no grid: o primeiro cartão, em 1080×1920 (o app recorta 4:5). */
  fs.copyFileSync(pngs[0], path.join(saida, nome + '-capa.png'));
  fs.rmSync(quadros, { recursive: true, force: true });
  const seg = (T_CAPA + T_FIM + (c.n - 2) * T_MOSTRA).toFixed(1);
  console.log('OK ' + mp4 + '  (' + c.n + ' cartões, ' + seg + ' s, sem áudio: escolha um áudio em alta no app)');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
