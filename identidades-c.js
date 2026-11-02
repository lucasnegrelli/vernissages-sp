/* ============================================================
   IDENTIDADES C — temporadas de arte, não de cartaz (02/11/2026)
   ============================================================
   Concreto e Lambe não pegaram: as duas são design gráfico alto e chapado,
   e brigam com a foto da obra, que é o produto. O benchmark (Whitney,
   Bienal de SP, MACBA) aponta o contrário: fixa muito, varia pouco, e deixa
   a obra falar. Aqui, cada temporada nasce de UMA obra ou UM acervo real de
   SP, e a paleta e a regra de forma saem dele.

     C1  TRANSPARÊNCIA — Mira Schendel, Objetos gráficos (c. 1967): papel de
                         arroz, letra decalcada solta, folha sobre folha.
     C2  FACHADA       — Volpi: casinhas e bandeirinhas, têmpera, terra e azul.
     C3  OFICINA       — Tipografia Paulistana (FAU USP): as oficinas
                         tipográficas de SP, 1827 a 1927, cartaz de composição
                         manual, duas tintas.

   As paletas são aproximações pensadas para o teste. Antes de virar
   temporada, cada uma é amostrada da imagem do acervo.

   Uso: node identidades-c.js → SOCIAL/_identidade/c1-transparencia-01.png ...
   ============================================================ */
'use strict';
const path = require('path');
const { renderizar } = require('./agenda.js');

const FOTO = 'img/chao-de-historias-mis.png';
const ABRE = [['SÁB 03', 'Roxo em Tons', 'Vazio Criativo', 'Barra Funda'], ['SÁB 03', 'Mirações', 'Massapê Projetos', 'Santa Cecília']];
const FECHA = [['SEX 02', 'Controle Corrosão Dispersão', 'Galeria Leme', 'Butantã'], ['SÁB 03', 'Smoke', 'Gomide&Co', 'Consolação'],
               ['DOM 04', 'confluências', 'MASP', 'Bela Vista'], ['DOM 04', '50 anos sem JK', 'MIS', 'Jardim Europa']];
const TODAS = ABRE.concat(FECHA);
const FONTES = `<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;700;800&family=IBM+Plex+Mono:wght@400;500&family=Bricolage+Grotesque:wght@500;700;800&family=Abril+Fatface&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=block" rel="stylesheet">`;

const quadro = (nome, conceito, paleta, tipos, paineis) => `
<div class="s" style="width:2400px;padding:60px;background:#161616;color:#eee;font-family:'Inter Tight',sans-serif">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px">
    <div><div style="font-size:64px;font-weight:700;letter-spacing:-.02em">${nome}</div>
      <div style="font-size:26px;color:#aaa;margin-top:8px;max-width:1550px;line-height:1.35">${conceito}</div></div>
    <div style="text-align:right"><div style="display:flex;gap:10px;justify-content:flex-end">${paleta.map(c => `<div style="width:56px;height:56px;background:${c};border:1px solid #444"></div>`).join('')}</div>
      <div style="font-size:20px;color:#aaa;margin-top:10px">${tipos}</div></div></div>
  <div style="display:flex;gap:40px;align-items:flex-start">${paineis.map(p => `<div style="zoom:.6">${p}</div>`).join('')}</div>
</div>`;
const caixa = (w, h, css, html) => `<div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;${css}">${html}</div>`;

/* ---------- C1 · TRANSPARÊNCIA (Mira Schendel) ---------- */
const C1 = (() => {
  const papel = '#EFEBE1', tinta = '#1F1E1C', fio = 'rgba(31,30,28,.28)', ocre = '#A9823A';
  const mono = "font-family:'IBM Plex Mono',monospace";
  const sans = "font-family:'Inter Tight',sans-serif";
  /* letra decalcada: cada letra solta, com desvio mínimo, como Letraset aplicado à mão */
  const solta = (t, extra = '') => [...t].map((c, i) => c === ' ' ? '<span style="display:inline-block;width:.3em"></span>'
    : `<span style="display:inline-block;transform:translate(${((i * 7) % 5 - 2) * .6}px,${((i * 11) % 5 - 2) * .9}px) rotate(${((i * 13) % 7 - 3) * .5}deg);${extra}">${c}</span>`).join('');
  const folha = (css, html) => `<div style="background:rgba(255,255,255,.55);border:1px solid ${fio};${css}">${html}</div>`;
  const linha = (x, i) => `<div style="display:grid;grid-template-columns:130px 1fr;gap:20px;padding:18px 0;border-top:1px solid ${fio}">
    <div style="${mono};font-size:21px;color:${i < 2 ? ocre : tinta};letter-spacing:.08em">${x[0]}</div>
    <div><div style="${sans};font-size:38px;font-weight:400;line-height:1.02;letter-spacing:-.01em">${x[1]}</div>
    <div style="${mono};font-size:18px;color:rgba(31,30,28,.62);margin-top:6px">${x[2]}, ${x[3]}</div></div></div>`;
  const capa = caixa(1080, 1350, `background:${papel};color:${tinta}`, `
    <div style="position:absolute;left:640px;top:-180px;width:640px;height:640px;border-radius:50%;border:1px solid ${fio}"></div>
    <div style="position:absolute;left:500px;top:-60px;width:640px;height:640px;border-radius:50%;border:1px solid ${fio}"></div>
    <div style="position:absolute;left:70px;top:64px;${mono};font-size:20px;letter-spacing:.3em">${solta('VERNISSAGES SP')}</div>
    <div style="position:absolute;left:70px;top:210px;${sans};font-size:150px;font-weight:300;line-height:.92;letter-spacing:-.045em">${solta('fim de')}<br>${solta('semana')}</div>
    <div style="position:absolute;left:74px;top:540px;${mono};font-size:30px;color:${ocre};letter-spacing:.2em">${solta('01 · 04 OUT')}</div>
    ${folha('position:absolute;left:70px;right:70px;top:640px;bottom:70px;padding:10px 38px 0', TODAS.slice(0, 6).map(linha).join(''))}`);
  const obra = caixa(1080, 1350, `background:${papel};color:${tinta}`, `
    <div style="position:absolute;left:84px;top:84px;width:930px;height:790px;border:1px solid ${fio}"></div>
    <img src="${FOTO}" style="position:absolute;left:70px;top:70px;width:930px;height:790px;object-fit:cover">
    ${folha('position:absolute;left:70px;right:70px;top:900px;height:370px;padding:34px 40px', `
      <div style="${sans};font-size:92px;font-weight:300;line-height:.92;letter-spacing:-.04em">Chão de histórias</div>
      <div style="display:flex;justify-content:space-between;margin-top:46px;${mono};font-size:21px;letter-spacing:.06em">
        <span>Ana Leal</span><span>MIS, Jardim Europa</span><span style="color:${ocre}">último dia dom 27</span></div>`)}`);
  const web = caixa(1440, 1350, `background:${papel};color:${tinta}`, `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:30px 64px;border-bottom:1px solid ${fio};${mono};font-size:20px;letter-spacing:.2em">
      <span>${solta('VERNISSAGES SP')}</span><span style="display:flex;gap:44px">agenda<span>mapa</span><span>roteiros</span><span>artistas</span></span></div>
    <div style="padding:56px 64px 20px;${sans};font-size:190px;font-weight:300;line-height:.9;letter-spacing:-.05em">esta semana</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:26px;padding:20px 64px">
      ${TODAS.map((x, i) => folha('padding:8px 30px 22px;min-height:230px', linha(x, i).replace(`border-top:1px solid ${fio}`, 'border-top:0'))).join('')}</div>`);
  return quadro('C1 · Transparência', 'Mira Schendel, Objetos gráficos: papel de arroz entre duas folhas, letra decalcada solta. A obra fica inteira numa moldura fina, e o texto vai em folha translúcida embaixo, nunca sobre a imagem. Tudo em tom de papel e tinta, uma única cor quente para o que abre. É a mais silenciosa: quem fala é a obra.',
    [papel, tinta, ocre, '#CFC9BA'], 'Inter Tight 300 + IBM Plex Mono', [capa, obra, web]);
})();

/* ---------- C2 · FACHADA (Volpi) ---------- */
const C2 = (() => {
  const pele = '#EFE5CF', tinta = '#2A211B', verm = '#B8472D', ocre = '#D9A441', azul = '#2E5E8C', verde = '#557A4F';
  const cores = [verm, ocre, azul, verde, ocre, verm];
  const sobre = c => (c === ocre ? tinta : pele);
  const sans = "font-family:'Bricolage Grotesque',sans-serif";
  const bandeirinhas = (n, s) => `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-top:3px solid ${tinta}">
    ${Array.from({ length: n }, (_, i) => `<div style="width:${s}px;height:${s * 1.15}px;background:${cores[i % cores.length]};clip-path:polygon(0 0,100% 0,50% 100%)"></div>`).join('')}</div>`;
  const casa = (x, i, h) => `<div style="background:${cores[i % cores.length]};color:${sobre(cores[i % cores.length])};border-radius:${h}px ${h}px 0 0;padding:${h * .9}px 26px 26px;min-height:300px">
    <div style="${sans};font-size:22px;font-weight:700;letter-spacing:.08em">${x[0]}</div>
    <div style="${sans};font-size:40px;font-weight:800;line-height:.98;margin-top:14px;letter-spacing:-.02em">${x[1]}</div>
    <div style="${sans};font-size:19px;font-weight:500;margin-top:14px;opacity:.9">${x[2]}<br>${x[3]}</div></div>`;
  const capa = caixa(1080, 1350, `background:${pele};color:${tinta}`, `
    <div style="position:absolute;left:0;right:0;top:36px">${bandeirinhas(15, 50)}</div>
    <div style="position:absolute;left:64px;right:64px;top:190px;${sans};font-size:172px;font-weight:800;line-height:.86;letter-spacing:-.05em">fim de<br>semana</div>
    <div style="position:absolute;left:68px;top:540px;${sans};font-size:44px;font-weight:700;color:${verm}">01 a 04 de outubro</div>
    <div style="position:absolute;left:64px;right:64px;bottom:64px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:end">${TODAS.slice(0, 6).map((x, i) => casa(x, i, [90, 0, 90, 0, 0, 90][i])).join('')}</div>`);
  const obra = caixa(1080, 1350, `background:${pele};color:${tinta}`, `
    <div style="position:absolute;left:0;right:0;top:36px">${bandeirinhas(15, 50)}</div>
    <img src="${FOTO}" style="position:absolute;left:64px;top:180px;width:952px;height:720px;object-fit:cover;border-radius:360px 360px 0 0">
    <div style="position:absolute;left:64px;right:64px;top:940px;display:grid;grid-template-columns:2fr 1fr;gap:20px">
      <div style="background:${verm};color:${pele};padding:30px 36px;${sans};font-size:84px;font-weight:800;line-height:.9;letter-spacing:-.04em">Chão de<br>histórias</div>
      <div style="background:${azul};color:${pele};padding:30px 28px;${sans};font-size:23px;font-weight:500;line-height:1.45">Ana Leal<br>MIS<br>Jardim Europa<br><b style="color:${ocre}">último dia dom 27</b></div></div>`);
  const web = caixa(1440, 1350, `background:${pele};color:${tinta}`, `
    <div style="padding:30px 64px 0;display:flex;justify-content:space-between;align-items:center;${sans}">
      <span style="font-size:44px;font-weight:800;letter-spacing:-.03em">Vernissages SP</span><span style="display:flex;gap:36px;font-size:24px;font-weight:700">agenda<span>mapa</span><span>roteiros</span><span>artistas</span></span></div>
    <div style="margin:24px 0 0">${bandeirinhas(24, 50)}</div>
    <div style="padding:30px 64px 16px;${sans};font-size:150px;font-weight:800;letter-spacing:-.05em;line-height:.9">esta semana</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;padding:20px 64px;align-items:end">
      ${TODAS.map((x, i) => casa(x, i, [100, 0, 100, 0][i % 4])).join('')}</div>`);
  return quadro('C2 · Fachada', 'Volpi: casinhas e bandeirinhas, cores de têmpera (terra, ocre, azul, verde) em blocos chapados sobre fundo de reboco. Cada exposição é uma fachada, janela em arco quando abre. A obra entra num arco, sem nada por cima. Calor e Brasil sem cair no cartaz fluorescente.',
    [pele, verm, ocre, azul, verde, tinta], 'Bricolage Grotesque', [capa, obra, web]);
})();

/* ---------- C3 · OFICINA (Tipografia Paulistana) ---------- */
const C3 = (() => {
  const papel = '#ECE3CC', tinta = '#1B1712', verm = '#A62B1F';
  const fat = "font-family:'Abril Fatface',serif", std = "font-family:'Old Standard TT',serif";
  const dupla = c => `border-top:5px double ${c}`;
  const bloco = (x, i) => `<div style="text-align:center;padding:20px 12px;${i ? `border-top:1px solid ${tinta}` : ''}">
    <div style="${std};font-size:20px;font-weight:700;letter-spacing:.3em;color:${i < 2 ? verm : tinta}">${x[0]}${i < 2 ? ' ABRE' : ''}</div>
    <div style="${fat};font-size:50px;line-height:1;margin:8px 0">${x[1]}</div>
    <div style="${std};font-size:22px;font-style:italic">${x[2]}, ${x[3]}</div></div>`;
  const capa = caixa(1080, 1350, `background:${papel};color:${tinta}`, `
    <div style="position:absolute;inset:36px;border:6px double ${tinta}"></div>
    <div style="position:absolute;left:80px;right:80px;top:84px;text-align:center">
      <div style="${std};font-size:22px;font-weight:700;letter-spacing:.4em">VERNISSAGES SP</div>
      <div style="${fat};font-size:168px;line-height:.9;margin-top:14px">Fim de<br>Semana</div>
      <div style="${std};font-size:34px;font-style:italic;color:${verm};margin-top:10px;${dupla(tinta)};padding-top:14px;display:inline-block">de 1 a 4 de outubro</div></div>
    <div style="position:absolute;left:80px;right:80px;bottom:80px;${dupla(tinta)};display:grid;grid-template-columns:1fr 1fr;column-gap:30px">
      ${TODAS.slice(0, 6).map((x, i) => bloco(x, i >= 2 && i % 2 === 0 ? 1 : (i >= 2 ? 1 : 0))).join('')}</div>`);
  const obra = caixa(1080, 1350, `background:${papel};color:${tinta}`, `
    <div style="position:absolute;inset:36px;border:6px double ${tinta}"></div>
    <img src="${FOTO}" style="position:absolute;left:84px;top:84px;width:912px;height:760px;object-fit:cover;outline:2px solid ${tinta};outline-offset:8px">
    <div style="position:absolute;left:84px;right:84px;top:890px;text-align:center">
      <div style="${fat};font-size:112px;line-height:.92">Chão de Histórias</div>
      <div style="${std};font-size:28px;font-style:italic;margin-top:20px;${dupla(tinta)};padding-top:16px">Ana Leal, no MIS, Jardim Europa</div>
      <div style="${std};font-size:24px;font-weight:700;letter-spacing:.3em;color:${verm};margin-top:14px">ÚLTIMO DIA DOMINGO 27</div></div>`);
  const web = caixa(1440, 1350, `background:${papel};color:${tinta}`, `
    <div style="margin:36px 64px 0;${dupla(tinta)};border-bottom:1px solid ${tinta};padding:14px 0;display:flex;justify-content:space-between;align-items:center">
      <span style="${std};font-size:20px;font-weight:700;letter-spacing:.3em">AGENDA · MAPA · ROTEIROS · ARTISTAS</span>
      <span style="${fat};font-size:56px">Vernissages SP</span></div>
    <div style="margin:10px 64px 0;text-align:center;${fat};font-size:190px;line-height:.95">Esta Semana</div>
    <div style="margin:10px 64px 0;${dupla(tinta)};display:grid;grid-template-columns:repeat(4,1fr);column-gap:26px">
      ${TODAS.map((x, i) => bloco(x, i)).join('')}</div>`);
  return quadro('C3 · Oficina', 'Tipografia Paulistana (FAU USP): a composição manual das oficinas de São Paulo, cartaz em tipo de caixa, filete duplo, duas tintas (preto e vermelho). Hierarquia de impresso, não de app. A obra recebe só um filete. Sem fluorescente nem preto total: papel antigo.',
    [papel, tinta, verm], 'Abril Fatface + Old Standard TT', [capa, obra, web]);
})();

(async () => {
  const saida = path.join(__dirname, 'SOCIAL', '_identidade');
  for (const [nome, q] of [['c1-transparencia', C1], ['c2-fachada', C2], ['c3-oficina', C3]]) {
    const html = `<!doctype html><html><head><meta charset="utf-8">${FONTES}<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#161616}</style></head><body>${q}</body></html>`;
    console.log('OK ' + (await renderizar(html, saida, nome, 2400, 1400)).join(', '));
  }
})().catch(e => { console.error(e); process.exit(1); });
