/* ============================================================
   IDENTIDADES B — o "Cartaz" tirado do genérico (26/09/2026)
   ============================================================
   O Lucas escolheu o caminho do B (fundo forte, letra grossa, imagem) mas
   achou genérico: "busca mais referência". Duas versões, cada uma presa a
   uma referência paulistana concreta:

     B2  LAMBE    — lambe-lambe da Gráfica Fidalga (Vila Madalena): letra de
                    madeira, papel fino fluorescente, duas cores com registro
                    fora, o mesmo cartaz repetido no muro.
     B3  CONCRETO — Wollner / Geraldo de Barros (cartazes da Bienal, Grupo
                    Ruptura) e o Stedelijk de Mevis & Van Deursen: grade
                    rígida, colunas de texto como poesia concreta, círculo como
                    signo, risco sobre o que acabou.

   Uso: node identidades-b.js → SOCIAL/_identidade/b2-lambe-01.png, b3-concreto-01.png
   ============================================================ */
'use strict';
const path = require('path');
const { renderizar } = require('./agenda.js');

const FOTO = 'img/chao-de-historias-mis.png', OBRA2 = 'img/territorio-de-disputa-galeria-lume.jpg';
const ABRE = [['SÁB 03', 'Roxo em Tons', 'Vazio Criativo', 'Barra Funda'], ['SÁB 03', 'Mirações', 'Massapê Projetos', 'Santa Cecília']];
const FECHA = [['SEX 02', 'Controle Corrosão Dispersão', 'Galeria Leme', 'Butantã'], ['SÁB 03', 'Smoke', 'Gomide&Co', 'Consolação'],
               ['DOM 04', 'confluências', 'MASP', 'Bela Vista'], ['DOM 04', '50 anos sem JK', 'MIS', 'Jardim Europa']];
const FONTES = `<link href="https://fonts.googleapis.com/css2?family=Anton&family=Alfa+Slab+One&family=Inter+Tight:wght@400;500;700;800&display=block" rel="stylesheet">`;

/* papel fino: grão e um véu irregular de tinta, sem imagem externa */
const PAPEL = '';   /* textura vai pela classe .papel (inline quebrava as aspas do style) */

const quadro = (nome, conceito, paleta, tipos, paineis) => `
<div class="s" style="width:2400px;padding:60px;background:#161616;color:#eee;font-family:'Inter Tight',sans-serif">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px">
    <div><div style="font-size:64px;font-weight:700;letter-spacing:-.02em">${nome}</div>
      <div style="font-size:26px;color:#aaa;margin-top:8px;max-width:1550px">${conceito}</div></div>
    <div style="text-align:right"><div style="display:flex;gap:10px;justify-content:flex-end">${paleta.map(c => `<div style="width:56px;height:56px;background:${c};border:1px solid #444"></div>`).join('')}</div>
      <div style="font-size:20px;color:#aaa;margin-top:10px">${tipos}</div></div></div>
  <div style="display:flex;gap:40px;align-items:flex-start">${paineis.map(p => `<div style="zoom:.6">${p}</div>`).join('')}</div>
</div>`;
const caixa = (w, h, css, html) => `<div class="papel" style="position:relative;width:${w}px;height:${h}px;overflow:hidden;${css}">${html}</div>`;

/* ---------- B2 · LAMBE ---------- */
const B2 = (() => {
  const rosa = '#FF4FA0', amarelo = '#FFE419', verde = '#3BE37B', laranja = '#FF7A1F', preto = '#111';
  const madeira = "font-family:'Anton',sans-serif;text-transform:uppercase;line-height:.84";
  const slab = "font-family:'Alfa Slab One',serif;text-transform:uppercase;line-height:.9";
  /* registro fora: a segunda cor sai deslocada, como na máquina de 1929 */
  const fora = (txt, css, c2) => `<span style="position:relative;display:inline-block;white-space:nowrap">
    <span style="position:absolute;left:6px;top:5px;color:${c2};mix-blend-mode:multiply">${txt}</span><span style="position:relative;${css}">${txt}</span></span>`;
  const lambe = (cor, l1, l2, l3, dia) => `<div class="papel" style="background:${cor};padding:22px 20px;text-align:center;color:${preto}">
    <div style="${madeira};font-size:30px">${dia}</div><div style="${slab};font-size:58px;margin:8px 0">${l1}</div>
    <div style="${madeira};font-size:40px">${l2}</div><div style="font-family:'Inter Tight';font-weight:800;font-size:18px;margin-top:8px">${l3}</div></div>`;
  const capa = caixa(1080, 1350, `background:${rosa};color:${preto};text-align:center`, `
    <div style="position:absolute;left:0;right:0;top:48px;${madeira};font-size:64px">VERNISSAGES SP APRESENTA</div>
    <div style="position:absolute;left:0;right:0;top:140px;${slab};font-size:250px">${fora('ARTE', '', verde)}</div>
    <div style="position:absolute;left:0;right:0;top:400px;${madeira};font-size:150px">NO FIM DE SEMANA</div>
    <div style="position:absolute;left:60px;right:60px;top:590px;border-top:10px solid ${preto};border-bottom:10px solid ${preto};padding:20px 0;${madeira};font-size:96px">01 · 02 · 03 · 04 OUT</div>
    <div style="position:absolute;left:0;right:0;top:790px;${madeira};font-size:74px;line-height:1.02">ROXO EM TONS · MIRAÇÕES<br>SMOKE · CONFLUÊNCIAS<br>CONTROLE CORROSÃO DISPERSÃO</div>
    <div style="position:absolute;left:0;right:0;bottom:54px;${slab};font-size:72px">${fora('ENTRADA FRANCA', '', amarelo)}</div>`);
  const obra = caixa(1080, 1350, `background:${amarelo};color:${preto}`, `
    <img src="${FOTO}" style="position:absolute;left:40px;top:40px;width:1000px;height:820px;object-fit:cover">
    <div style="position:absolute;left:40px;right:40px;top:890px;${slab};font-size:112px">CHÃO DE<br>HISTÓRIAS</div>
    <div style="position:absolute;left:40px;right:40px;bottom:46px;display:flex;justify-content:space-between;${madeira};font-size:58px">
      <span>ANA LEAL</span><span>MIS</span><span style="background:${preto};color:${amarelo};padding:6px 14px">ÚLTIMO DIA DOM 27</span></div>`);
  const muro = [[rosa, 'ROXO EM TONS', 'VAZIO CRIATIVO', 'Barra Funda', 'ABRE SÁB 03'], [verde, 'MIRAÇÕES', 'MASSAPÊ', 'Santa Cecília', 'ABRE SÁB 03'],
                [amarelo, 'SMOKE', 'GOMIDE&CO', 'Consolação', 'FECHA SÁB 03'], [laranja, 'CONFLUÊN­CIAS', 'MASP', 'Bela Vista', 'FECHA DOM 04'],
                [rosa, 'CONTROLE', 'GALERIA LEME', 'Butantã', 'FECHA SEX 02'], [verde, '50 ANOS SEM JK', 'MIS', 'Jardim Europa', 'FECHA DOM 04'],
                [amarelo, 'ROXO EM TONS', 'VAZIO CRIATIVO', 'Barra Funda', 'ABRE SÁB 03'], [laranja, 'MIRAÇÕES', 'MASSAPÊ', 'Santa Cecília', 'ABRE SÁB 03']];
  const web = caixa(1440, 1350, `background:#8F8A82;`, `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:26px 44px;background:${preto};color:#fff">
      <span style="${slab};font-size:46px">VERNISSAGES SP</span><span style="${madeira};font-size:30px;display:flex;gap:34px">AGENDA<span>MAPA</span><span>ROTEIROS</span><span>ARTISTAS</span></span></div>
    <div style="padding:34px 44px 0;${madeira};font-size:140px;color:${preto}">O MURO DA SEMANA</div>
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding:26px 60px 26px 44px">
      ${muro.map(([c, a, b, d, e], i) => `<div style="transform:rotate(${[-1.2, .8, -.4, 1.1, .6, -.9, 1.3, -.6][i]}deg)">${lambe(c, a, b, d, e)}</div>`).join('')}</div>`);
  return quadro('B2 · Lambe', 'Lambe-lambe da Gráfica Fidalga: letra de madeira (Anton + Alfa Slab), papel fluorescente com grão, segunda cor com o registro fora, o site como um muro de cartazes colados. A obra continua limpa, com o cartaz em volta. É a rua de SP — ninguém no nicho de arte usa.',
    [rosa, amarelo, verde, laranja, preto], 'Anton + Alfa Slab One + Inter Tight', [capa, obra, web]);
})();

/* ---------- B3 · CONCRETO ---------- */
const B3 = (() => {
  const preto = '#0A0A0A', branco = '#F2F0EA', verm = '#FF3B1D', cinza = '#6F6D68';
  const sans = "font-family:'Inter Tight',sans-serif";
  const risco = t => `<span style="text-decoration:line-through;text-decoration-thickness:6px;text-decoration-color:${verm}">${t}</span>`;
  const circ = (cheio, s) => `<span style="display:inline-block;width:${s}px;height:${s}px;border-radius:50%;border:${Math.max(3, s / 9)}px solid ${branco};background:${cheio ? branco : 'transparent'};vertical-align:middle"></span>`;
  const col = (x, i) => `<div style="border-top:2px solid ${branco};padding-top:14px">
    <div style="display:flex;justify-content:space-between;align-items:center">${circ(i < 2, 34)}<span style="${sans};font-size:22px;font-weight:700;letter-spacing:.1em">${x[0]}</span></div>
    <div style="${sans};font-size:44px;font-weight:800;line-height:.95;letter-spacing:-.03em;margin-top:18px">${i < 2 ? x[1] : risco(x[1])}</div>
    <div style="${sans};font-size:19px;color:${cinza};margin-top:10px">${x[2]}<br>${x[3]}</div></div>`;
  const todas = ABRE.concat(FECHA);
  const capa = caixa(1080, 1350, `background:${preto};color:${branco}`, `
    <div style="position:absolute;left:56px;right:56px;top:56px;display:grid;grid-template-columns:repeat(6,1fr);gap:0">
      ${Array.from({ length: 24 }, (_, i) => `<div style="height:74px;display:flex;align-items:center;justify-content:center">${circ(i === 7 || i === 8, i === 7 || i === 8 ? 58 : 30)}</div>`).join('')}</div>
    <div style="position:absolute;left:56px;right:56px;top:360px;${sans};font-size:160px;font-weight:800;line-height:.84;letter-spacing:-.055em">fim de<br>semana<br><span style="color:${verm}">01—04</span></div>
    <div style="position:absolute;left:56px;right:56px;bottom:56px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px">${todas.slice(0, 6).map(col).join('')}</div>`);
  const obra = caixa(1080, 1350, `background:${preto};color:${branco}`, `
    <img src="${FOTO}" style="position:absolute;left:56px;top:56px;width:968px;height:780px;object-fit:cover">
    <div style="position:absolute;left:56px;right:56px;top:870px;display:grid;grid-template-columns:2fr 1fr;gap:30px;border-top:2px solid ${branco};padding-top:20px">
      <div style="${sans};font-size:92px;font-weight:800;line-height:.88;letter-spacing:-.045em">Chão de<br>histórias</div>
      <div style="${sans};font-size:22px;line-height:1.5">Ana Leal<br>Nova Fotografia 2026<br>MIS · Jardim Europa<br><span style="color:${verm};font-weight:700">último dia dom 27</span></div></div>`);
  const web = caixa(1440, 1350, `background:${preto};color:${branco}`, `
    <div style="display:grid;grid-template-columns:repeat(6,1fr);border-bottom:2px solid ${branco};${sans};font-size:20px;font-weight:700;letter-spacing:.08em">
      <div style="grid-column:span 2;padding:28px 44px;font-size:30px;letter-spacing:-.01em;font-weight:800">Vernissages SP</div>
      ${['agenda', 'mapa', 'roteiros', 'artistas'].map(x => `<div style="padding:34px 20px;border-left:2px solid ${branco}">${x}</div>`).join('')}</div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:22px;padding:40px 44px">
      <div style="grid-column:span 4;${sans};font-size:210px;font-weight:800;line-height:.82;letter-spacing:-.06em">esta<br>semana</div>
      <div style="grid-column:span 2;background:url('${FOTO}') center/cover;height:360px"></div>
      ${todas.map((x, i) => `<div>${col(x, i)}</div>`).join('')}</div>`);
  return quadro('B3 · Concreto', 'Concretismo paulista (Wollner, Geraldo de Barros, cartazes da Bienal) + Stedelijk: grade de 6 colunas, texto em colunas como poesia concreta, círculo cheio = abre, vazio = fecha, risco vermelho sobre o que acaba. Fundo preto e letra grossa, como você gostou, mas com regra própria.',
    [preto, branco, cinza, verm], 'Inter Tight 800', [capa, obra, web]);
})();

(async () => {
  const saida = path.join(__dirname, 'SOCIAL', '_identidade');
  for (const [nome, q] of [['b2-lambe', B2], ['b3-concreto', B3]]) {
    const html = `<!doctype html><html><head><meta charset="utf-8">${FONTES}<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#161616}.papel{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .16 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}</style></head><body>${q}</body></html>`;
    console.log('OK ' + (await renderizar(html, saida, nome, 2400, 1400)).join(', '));
  }
})().catch(e => { console.error(e); process.exit(1); });
