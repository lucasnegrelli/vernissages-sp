/* recorte.js — acha a caixa da obra numa foto de divulgação (09/11/2026).

   Duas versões lado a lado para comparar (recorte-test): a ANTIGA olha a cor dos cantos e anda até
   achar "diferente do fundo"; falha em parede em degradê (vinheta, luz de galeria) e inclui a sombra
   da obra como se fosse obra. A NOVA olha BORDAS: obra tem contorno e textura (gradiente forte);
   parede em degradê e sombra são suaves (gradiente fraco) e ficam de fora.

   Entrada: d = pixels RGBA (ImageData.data), w, h (imagem reduzida). Saída: {x,y,w,h} na escala da
   entrada, ou null se não achou caixa melhor que a imagem inteira. Código sem dependência de DOM:
   o mesmo texto roda no navegador (index.html) e no teste. */
function caixaAntiga(d, w, h) {
  const at = (i, j) => { const o = (j * w + i) * 4; return [d[o], d[o + 1], d[o + 2]]; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const cant = [at(1, 1), at(w - 2, 1), at(1, h - 2), at(w - 2, h - 2)];
  let bg = null, best = 0;
  for (const c1 of cant) { const n = cant.filter(o => dist(o, c1) < 26).length; if (n > best) { best = n; bg = c1; } }
  if (best < 3) return null;
  const fg = (i, j) => dist(at(i, j), bg) > 40;
  const lin = j => { let n = 0; for (let i = 0; i < w; i++) if (fg(i, j)) n++; return n / w; };
  const col = i => { let n = 0; for (let j = 0; j < h; j++) if (fg(i, j)) n++; return n / h; };
  const T = .012;
  const bloco = (n, f, gap) => {
    const runs = []; let cur = null;
    for (let k = 0; k < n; k++) { const v = f(k); if (v >= T) { if (cur && k - cur.b <= gap) { cur.b = k; cur.s += v; } else { cur = { a: k, b: k, s: v }; runs.push(cur); } } }
    if (!runs.length) return [0, n - 1];
    runs.sort((p, q) => q.s - p.s);
    const m = runs[0]; let a = m.a, b2 = m.b;
    for (const r of runs.slice(1)) if (r.s >= .4 * m.s) { a = Math.min(a, r.a); b2 = Math.max(b2, r.b); }
    return [a, b2];
  };
  const [y0, y1] = bloco(h, lin, Math.max(2, Math.round(h * .05)));
  const colR = i => { let n = 0; for (let j = y0; j <= y1; j++) if (fg(i, j)) n++; return n / (y1 - y0 + 1); };
  const [x0, x1] = bloco(w, colR, Math.max(2, Math.round(w * .05)));
  const bw = (x1 - x0 + 1) / w, bh = (y1 - y0 + 1) / h;
  if ((bw < .985 || bh < .985) && bw * bh >= .16 && bw >= .3 && bh >= .25) return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  return null;
}

function caixaDaObra(d, w, h) {
  /* cinza, com um borrão leve para o grão da foto não virar borda */
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) g[i] = .299 * d[i * 4] + .587 * d[i * 4 + 1] + .114 * d[i * 4 + 2];
  const b = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += g[(y + dy) * w + x + dx]; b[y * w + x] = s / 9;
  }
  /* gradiente numa janela de 2 px (borda de obra é nítida; sombra e degradê de parede, não) */
  const m = new Float32Array(w * h), vals = [];
  for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
    const gx = b[y * w + x + 2] - b[y * w + x - 2], gy = b[(y + 2) * w + x] - b[(y - 2) * w + x];
    const v = Math.abs(gx) + Math.abs(gy); m[y * w + x] = v; vals.push(v);
  }
  vals.sort((p, q) => p - q);
  const p98 = vals[Math.floor(vals.length * .98)] || 0;
  /* varre do limiar mais sensível ao mais duro e fica com o primeiro que isola uma caixa: foto limpa pega
     até a parte lisa da tela (sensível); foto com textura na parede só fecha com limiar duro */
  for (const [k, td] of [[.2, .012], [.3, .012], [.3, .03], [.45, .03], [.65, .03]]) {
    const r = caixaComLimiar(m, w, h, Math.max(k === .2 ? 9 : 14, k * p98), td);
    if (r) return r;
  }
  return null;
}

function caixaComLimiar(m, w, h, T, TD) {
  const em = (x, y) => m[y * w + x] > T;
  /* faixas (linhas/colunas) com borda: tira o ruído exigindo uma fração mínima da largura */
  const lin = y => { let n = 0; for (let x = 2; x < w - 2; x++) if (em(x, y)) n++; return n / w; };
  const bloco = (n, f, gap) => {
    const runs = []; let cur = null;
    for (let k = 2; k < n - 2; k++) { const v = f(k); if (v >= TD) { if (cur && k - cur.b <= gap) { cur.b = k; cur.s += v; } else { cur = { a: k, b: k, s: v }; runs.push(cur); } } }
    if (!runs.length) return null;
    runs.sort((p, q) => q.s - p.s);
    const mm = runs[0]; let a = mm.a, b2 = mm.b;
    for (const r of runs.slice(1)) if (r.s >= .4 * mm.s) { a = Math.min(a, r.a); b2 = Math.max(b2, r.b); }
    return [a, b2];
  };
  const ry = bloco(h, lin, Math.max(3, Math.round(h * .06)));
  if (!ry) return null;
  const col = x => { let n = 0; for (let y = ry[0]; y <= ry[1]; y++) if (em(x, y)) n++; return n / (ry[1] - ry[0] + 1); };
  const rx = bloco(w, col, Math.max(3, Math.round(w * .06)));
  if (!rx) return null;
  const pad = Math.max(1, Math.round(Math.max(w, h) * .008));
  const x0 = Math.max(0, rx[0] - pad), x1 = Math.min(w - 1, rx[1] + pad), y0 = Math.max(0, ry[0] - pad), y1 = Math.min(h - 1, ry[1] + pad);
  const bw = (x1 - x0 + 1) / w, bh = (y1 - y0 + 1) / h;
  if ((bw < .985 || bh < .985) && bw * bh >= .12 && bw >= .25 && bh >= .2) return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  return null;
}
/* Os cantos da foto parecem fundo (parede)? Foto sangrada (obra até a borda) não pode ser recortada: a
   detecção por borda acharia "miolo" e cortaria obra de verdade (Diáfana, Glauco Rodrigues). */
function cantosParecemParede(d, w, h, tol) {
  const at = (i, j) => { const o = (j * w + i) * 4; return [d[o], d[o + 1], d[o + 2]]; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const k = Math.max(2, Math.round(Math.min(w, h) * .04));
  const cant = [at(k, k), at(w - 1 - k, k), at(k, h - 1 - k), at(w - 1 - k, h - 1 - k)];
  /* parede é clara e quase sem cor; céu, vermelho, verde e foto escura sangrada não são */
  const lum = c => .299 * c[0] + .587 * c[1] + .114 * c[2], croma = c => Math.max(...c) - Math.min(...c);
  if (cant.some(c => lum(c) < 150 || croma(c) > 45)) return false;
  return Math.max(...cant.map(c1 => cant.filter(o => dist(o, c1) < tol).length)) >= 3;
}

/* Decisão final.
   - sem cara de parede nos cantos: não recorta (obra sangrada);
   - a antiga achou caixa grande (>= 90% da imagem): fica ela (pouca margem; a nova poderia cortar obra);
   - a antiga achou caixa e a nova também: interseção (a antiga erra por excesso com parede em degradê e sombra,
     a nova às vezes erra por excesso em obra branca sobre parede branca);
   - só a nova (parede em degradê, que a antiga não leu): vale a nova, se os cantos parecem parede (tolerância larga). */
function caixaFinal(d, w, h) {
  const A = caixaAntiga(d, w, h);
  if (A) {
    if (A.w * A.h >= .9 * w * h) return A;
    const N = caixaDaObra(d, w, h);
    if (!N) return A;
    const x0 = Math.max(A.x, N.x), y0 = Math.max(A.y, N.y), x1 = Math.min(A.x + A.w, N.x + N.w), y1 = Math.min(A.y + A.h, N.y + N.h);
    const I = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    if (I.w > 0 && I.h > 0 && I.w * I.h >= .6 * Math.min(A.w * A.h, N.w * N.h)) return I;
    return A;
  }
  if (!cantosParecemParede(d, w, h, 60)) return null;
  return caixaDaObra(d, w, h);
}
if (typeof module !== 'undefined') module.exports = { caixaAntiga, caixaDaObra, caixaFinal };
