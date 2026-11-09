/* ============================================================
   direcao.js — a direção de arte do Vernissages SP, em código (09/11/2026)

   Uma fonte só para tudo o que é peça de movimento e para quem mais quiser
   falar a mesma língua do site: papel e tinta, a cor vem da obra, tipografia
   pesada contra serifa em itálico, filete no lugar de caixa, data gigante.
   Ver docs/DIRECAO-DE-ARTE.md para o porquê.

   Sem IA: tudo aqui é regra determinística.
   ============================================================ */
'use strict';

const PAPEL = '#F2EFE9';
const TINTA = '#0E0E0E';
const TERRA = '#C96F4A';   /* acento da casa: mapa, e a cor quando a obra não tem cor */

/* ---------- cor ---------- */
const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function rgb2hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let h = 0, s = 0;
  if (d) {
    s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}
function hsl2rgb([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const contraste = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + .05) / (Math.min(la, lb) + .05); };

/* Cor dominante da obra: o balde de matiz mais "pesado" (saturação e meio-tom), sem cinza e sem
   branco de parede. Devolve null se a obra é praticamente sem cor (então vale TERRA). */
async function corDaObra(sharp, arquivo) {
  const { data, info } = await sharp(arquivo).rotate().resize(48, 48, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const baldes = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
  let tot = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const c = [data[i], data[i + 1], data[i + 2]], [h, s, l] = rgb2hsl(c);
    if (s < .22 || l < .14 || l > .88) continue;
    const peso = s * (1 - Math.abs(l - .5) * 1.4);
    const k = baldes[Math.floor(h / 30) % 12];
    k.w += peso; k.r += c[0] * peso; k.g += c[1] * peso; k.b += c[2] * peso; tot += peso;
  }
  const px = info.width * info.height;
  const top = baldes.sort((a, b) => b.w - a.w)[0];
  if (!top.w || tot / px < .035) return null;
  return [top.r / top.w, top.g / top.w, top.b / top.w];
}

/* Três papéis para a mesma cor: `texto` (legível sobre o papel, contraste >= 3), `campo` (chapado vivo
   para fundo de capa) e `sobre` (cor da letra em cima do campo). */
function paletaDaCor(rgb) {
  const base = rgb || hex2rgb(TERRA);
  let [h, s, l] = rgb2hsl(base);
  s = Math.max(.42, Math.min(.85, s));
  let t = [h, s, Math.min(l, .5)];
  while (contraste(hsl2rgb(t), hex2rgb(PAPEL)) < 3.2 && t[2] > .12) t[2] -= .02;
  const campo = hsl2rgb([h, Math.min(.9, s + .05), Math.max(.5, Math.min(.62, l))]);
  const sobre = contraste(campo, hex2rgb(TINTA)) >= 6 ? TINTA : PAPEL;
  return { texto: rgb2hex(hsl2rgb(t)), campo: rgb2hex(campo), sobre, cor: !!rgb };
}

/* ---------- tempo ---------- */
const FPS = 30;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/* ---------- voz dos ganchos (sem gíria, sem exclamação, sem travessão) ---------- */
const pick = (lista, semente) => lista[Math.abs(semente) % lista.length];
const semente = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

module.exports = { PAPEL, TINTA, TERRA, FPS, clamp, corDaObra, paletaDaCor, hex2rgb, rgb2hex, lum, contraste, pick, semente };
