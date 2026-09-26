/* ============================================================
   IDENTIDADES — três direções visuais para comparar (26/09/2026)
   ============================================================
   O Lucas não está contente com a cara do Instagram (terracota + Switzer
   pesada) nem com a do site (painel de SaaS), e liberou refazer tudo. Em vez
   de discutir em abstrato, isto desenha três sistemas completos com os mesmos
   dados reais — capa da agenda, slide de obra e topo do site — para escolher
   olhando. Referências de cada um no DESIGN.md.

     A  ARQUIVO  — e-flux, Ubu, Bloco Gráfico: serifa editorial, papel, jornal
     B  CARTAZ   — Stedelijk, Public Theater: tipo condensado gigante, azul sinal
     C  ROTA     — See Saw, diagrama de metrô: mono + mapa, cinza e verde ácido

   Uso: node identidades.js   → SOCIAL/_identidade/<direcao>.png
   ============================================================ */
'use strict';
const path = require('path');
const { renderizar } = require('./agenda.js');

const IMG = { obra: 'img/territorio-de-disputa-galeria-lume.jpg', a: 'img/smoke-gomide-co.webp',
              b: 'img/confluencias-masp.jpg', c: 'img/controle-corrosao-dispersao-galeria-leme.webp' };
const ABRE = [['SÁB 03', 'Roxo em Tons', 'Vazio Criativo', 'Barra Funda'], ['SÁB 03', 'Mirações', 'Massapê Projetos', 'Santa Cecília']];
const FECHA = [['SEX 02', 'Controle | Corrosão | Dispersão', 'Galeria Leme', 'Butantã'], ['SÁB 03', 'Smoke — Lucia Nogueira', 'Gomide&Co', 'Consolação'],
               ['DOM 04', 'confluências — Carolina Caycedo', 'MASP', 'Bela Vista'], ['DOM 04', '50 anos sem JK', 'MIS', 'Jardim Europa']];
const FONTES = `<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&family=Big+Shoulders+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">
<style>@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}</style>`;

const quadro = (nome, conceito, paleta, tipos, paineis) => `
<div class="s" style="width:2400px;padding:60px;background:#1a1a1a;color:#eee;font-family:'Inter Tight',sans-serif">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px">
    <div><div style="font-size:64px;font-weight:600;letter-spacing:-.02em">${nome}</div>
      <div style="font-size:26px;color:#aaa;margin-top:8px;max-width:1500px">${conceito}</div></div>
    <div style="text-align:right"><div style="display:flex;gap:10px;justify-content:flex-end">${paleta.map(c => `<div style="width:56px;height:56px;background:${c};border:1px solid #444"></div>`).join('')}</div>
      <div style="font-size:20px;color:#aaa;margin-top:10px">${tipos}</div></div>
  </div>
  <div style="display:flex;gap:40px;align-items:flex-start">
    <div style="zoom:.6">${paineis[0]}</div><div style="zoom:.6">${paineis[1]}</div><div style="zoom:.6">${paineis[2]}</div>
  </div>
</div>`;

const post = (css, html) => `<div style="position:relative;width:1080px;height:1350px;overflow:hidden;${css}">${html}</div>`;
const site = (css, html) => `<div style="position:relative;width:1440px;height:1350px;overflow:hidden;${css}">${html}</div>`;

/* ---------- A · ARQUIVO ---------- */
const A = (() => {
  const papel = '#F3EFE6', tinta = '#141311', cinza = '#77736B', verm = '#C8261B';
  const serif = "font-family:'Instrument Serif',serif", sans = "font-family:'Inter Tight',sans-serif";
  const lin = (d, t, c, b, cor) => `<div style="display:flex;gap:28px;padding:18px 0;border-top:1px solid ${tinta}">
    <div style="${sans};width:130px;font-size:22px;font-weight:600;letter-spacing:.06em;color:${cor || tinta}">${d}</div>
    <div style="flex:1"><div style="${serif};font-size:46px;line-height:1">${t}</div><div style="${sans};font-size:20px;color:${cinza};margin-top:6px">${c}, ${b}</div></div></div>`;
  const capa = post(`background:${papel};color:${tinta}`, `
    <div style="position:absolute;left:64px;right:64px;top:56px;display:flex;justify-content:space-between;${sans};font-size:20px;font-weight:500;letter-spacing:.14em;text-transform:uppercase">
      <span>Vernissages SP</span><span>Nº 39 · 01—04.10.2026</span></div>
    <div style="position:absolute;left:64px;right:64px;top:110px;border-top:3px solid ${tinta};border-bottom:1px solid ${tinta};padding:26px 0 30px">
      <div style="${serif};font-size:150px;line-height:.9;letter-spacing:-.02em">O fim de <i>semana</i></div></div>
    <div style="position:absolute;left:64px;right:64px;top:420px">
      <div style="${sans};font-size:18px;font-weight:600;letter-spacing:.18em;margin:0 0 6px">ABRE</div>
      ${ABRE.map(x => lin(...x)).join('')}
      <div style="${sans};font-size:18px;font-weight:600;letter-spacing:.18em;margin:30px 0 6px;color:${verm}">ÚLTIMOS DIAS</div>
      ${FECHA.map(x => lin(...x, verm)).join('')}</div>`);
  const obra = post(`background:${papel};color:${tinta}`, `
    <img src="${IMG.obra}" style="position:absolute;left:64px;top:64px;width:952px;height:760px;object-fit:cover">
    <div style="position:absolute;left:64px;right:64px;top:860px;display:flex;gap:40px">
      <div style="${sans};font-size:20px;line-height:1.5;width:260px;color:${cinza}">Kilian Glasner<br>Território de Disputa<br>Galeria Lume<br>até 14.11</div>
      <div style="${serif};font-size:52px;line-height:1.08;flex:1">“O artista não pinta a terra; <i>pinta com a terra.</i>” Saibro do sertão, cortado pelas linhas de uma quadra de tênis.</div></div>`);
  const web = site(`background:${papel};color:${tinta}`, `
    <div style="display:flex;justify-content:space-between;align-items:baseline;padding:40px 64px 22px;border-bottom:3px solid ${tinta}">
      <div style="${serif};font-size:60px">Vernissages SP</div>
      <div style="${sans};font-size:20px;letter-spacing:.12em;display:flex;gap:40px">AGENDA<span>MAPA</span><span>ROTEIROS</span><span>ARTISTAS</span><span>EDITAIS</span></div></div>
    <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:56px;padding:48px 64px">
      <div><div style="${sans};font-size:18px;letter-spacing:.18em;color:${verm};font-weight:600">EM FOCO</div>
        <div style="${serif};font-size:110px;line-height:.92;margin:14px 0 20px">Território<br><i>de Disputa</i></div>
        <img src="${IMG.obra}" style="width:100%;height:470px;object-fit:cover"></div>
      <div><div style="${sans};font-size:18px;letter-spacing:.18em;font-weight:600">ESTA SEMANA</div>${ABRE.concat(FECHA.slice(0, 4)).map(x => lin(...x)).join('')}</div></div>`);
  return quadro('A · Arquivo', 'Jornal de arte. Serifa editorial (Instrument Serif), papel, preto e um vermelho de carimbo só para prazo. Referências: e-flux, Ubu, Bloco Gráfico. Sério, culto, reconhecível — o risco é parecer revista demais.',
    [papel, tinta, cinza, verm], 'Instrument Serif + Inter Tight', [capa, obra, web]);
})();

/* ---------- B · CARTAZ ---------- */
const B = (() => {
  const branco = '#FFFFFF', preto = '#000000', azul = '#1F2BFF';
  const big = "font-family:'Big Shoulders Display',sans-serif;font-weight:900;text-transform:uppercase";
  const sans = "font-family:'Inter Tight',sans-serif";
  const capa = post(`background:${azul};color:${branco}`, `
    <div style="position:absolute;left:48px;top:40px;${big};font-size:330px;line-height:.78;letter-spacing:-.01em">FIM<br>DE<br>SEMANA</div>
    <div style="position:absolute;right:48px;top:52px;${sans};font-size:26px;font-weight:600;text-align:right">01—04<br>OUT</div>
    <div style="position:absolute;left:48px;right:48px;bottom:48px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      ${[IMG.a, IMG.b, IMG.c].map(i => `<div style="height:300px;background:url('${i}') center/cover"></div>`).join('')}</div>
    <div style="position:absolute;left:48px;bottom:380px;${big};font-size:64px;line-height:1">2 ABREM · 5 FECHAM</div>`);
  const obra = post(`background:${branco};color:${preto}`, `
    <img src="${IMG.obra}" style="position:absolute;left:0;top:0;width:1080px;height:860px;object-fit:cover">
    <div style="position:absolute;left:48px;right:48px;top:890px;${big};font-size:120px;line-height:.86">TERRITÓRIO<br>DE DISPUTA</div>
    <div style="position:absolute;left:48px;right:48px;bottom:48px;display:flex;justify-content:space-between;${sans};font-size:26px;font-weight:600">
      <span>KILIAN GLASNER</span><span>GALERIA LUME</span><span style="background:${azul};color:#fff;padding:2px 10px">ATÉ 14.11</span></div>`);
  const web = site(`background:${branco};color:${preto}`, `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:28px 48px;background:${preto};color:#fff;${sans};font-size:20px;font-weight:600">
      <span style="${big};font-size:44px">VERNISSAGES SP</span><span style="display:flex;gap:32px">AGENDA<span>MAPA</span><span>ROTEIROS</span><span>ARTISTAS</span></span></div>
    <div style="padding:30px 48px 0;${big};font-size:250px;line-height:.8">ESTA<br><span style="color:${azul}">SEMANA</span></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:36px 48px">
      ${[[IMG.a, FECHA[1]], [IMG.b, FECHA[2]], [IMG.c, FECHA[0]]].map(([i, x]) => `<div><div style="height:330px;background:url('${i}') center/cover"></div>
        <div style="${big};font-size:48px;line-height:.95;margin-top:14px">${x[0]} — ${x[1].split(' — ')[0]}</div><div style="${sans};font-size:20px;margin-top:6px">${x[2]} · ${x[3]}</div></div>`).join('')}</div>`);
  return quadro('B · Cartaz', 'Cartaz de rua. Tipo condensado gigante (Big Shoulders), branco, preto e um azul-sinal. Referências: Stedelijk (Mevis & Van Deursen), Public Theater (Pentagram). Para o dedo no feed — o risco é gritar mais que a obra.',
    [azul, branco, preto], 'Big Shoulders Display + Inter Tight', [capa, obra, web]);
})();

/* ---------- C · ROTA ---------- */
const C = (() => {
  const fundo = '#E6E8E4', preto = '#0E0F0E', cinza = '#8A8D88', acido = '#C6F432';
  const mono = "font-family:'IBM Plex Mono',monospace", sans = "font-family:'Switzer',sans-serif";
  const est = (d, t, c, b, k, ativo) => `<div style="display:flex;gap:26px;align-items:flex-start;padding:14px 0">
    <div style="width:34px;height:34px;border-radius:50%;border:4px solid ${preto};background:${ativo ? acido : fundo};flex:none;margin-top:6px"></div>
    <div><div style="${mono};font-size:20px;color:${cinza}">${k} · ${d}</div><div style="${sans};font-size:40px;font-weight:500;line-height:1.05;letter-spacing:-.01em">${t}</div>
    <div style="${mono};font-size:19px;margin-top:4px">${c} — ${b}</div></div></div>`;
  const linha = `<div style="position:absolute;left:80px;top:0;bottom:0;width:6px;background:${preto}"></div>`;
  const capa = post(`background:${fundo};color:${preto}`, `
    <div style="position:absolute;left:64px;right:64px;top:56px;display:flex;justify-content:space-between;${mono};font-size:20px"><span>VERNISSAGES SP</span><span>23°33′S 46°38′W</span></div>
    <div style="position:absolute;left:64px;top:110px;${sans};font-size:120px;font-weight:500;line-height:.95;letter-spacing:-.035em">Linha<br>fim de semana</div>
    <div style="position:absolute;left:64px;top:370px;${mono};font-size:22px;background:${acido};padding:4px 12px">01.10 → 04.10 · 7 estações</div>
    <div style="position:absolute;left:64px;right:64px;top:450px;bottom:60px">${linha}
      <div style="position:relative;left:62px">${ABRE.map(x => est(...x, 'ABRE', true)).join('')}${FECHA.map(x => est(...x, 'FECHA', false)).join('')}</div></div>`);
  const obra = post(`background:${fundo};color:${preto}`, `
    <div style="position:absolute;left:64px;right:64px;top:56px;display:flex;justify-content:space-between;${mono};font-size:20px"><span>ESTAÇÃO 03 · JARDIM EUROPA</span><span>−23.5731 −46.6771</span></div>
    <img src="${IMG.obra}" style="position:absolute;left:64px;top:110px;width:952px;height:760px;object-fit:cover">
    <div style="position:absolute;left:64px;top:900px;${sans};font-size:72px;font-weight:500;letter-spacing:-.03em;line-height:1">Território de Disputa</div>
    <div style="position:absolute;left:64px;right:64px;top:1000px;${mono};font-size:22px;line-height:1.6">Kilian Glasner · Galeria Lume<br>saibro sobre tela · até 14.11<br><span style="background:${acido}">+350 m a pé da estação anterior</span></div>`);
  const web = site(`background:${fundo};color:${preto}`, `
    <div style="display:flex;justify-content:space-between;padding:32px 56px;border-bottom:2px solid ${preto};${mono};font-size:20px"><span style="${sans};font-size:34px;font-weight:600">Vernissages SP</span><span>AGENDA · MAPA · ROTEIROS · ARTISTAS · EDITAIS</span></div>
    <div style="display:grid;grid-template-columns:1fr 1.1fr;height:1200px">
      <div style="position:relative;padding:40px 56px">${linha.replace('left:80px', 'left:73px')}
        <div style="${sans};font-size:72px;font-weight:500;letter-spacing:-.03em;margin-left:60px">Esta semana</div>
        <div style="margin-left:40px">${ABRE.map(x => est(...x, 'ABRE', true)).join('')}${FECHA.slice(0, 3).map(x => est(...x, 'FECHA', false)).join('')}</div></div>
      <div style="position:relative;border-left:2px solid ${preto};background:
        repeating-linear-gradient(0deg,transparent 0 59px,#c9ccc6 59px 60px),repeating-linear-gradient(90deg,transparent 0 59px,#c9ccc6 59px 60px)">
        ${[[160, 220], [320, 380], [420, 300], [520, 560], [260, 640], [610, 420]].map(([x, y], i) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${i < 2 ? 34 : 26}px;height:${i < 2 ? 34 : 26}px;border-radius:50%;background:${i < 2 ? acido : preto};border:4px solid ${preto}"></div>`).join('')}
        <div style="position:absolute;left:24px;bottom:24px;${mono};font-size:16px">mapa · ruas © OpenStreetMap</div></div></div>`);
  return quadro('C · Rota', 'Guia de navegação. A cidade como diagrama de metrô: mono (IBM Plex Mono) para dado, Switzer regular para nome, cinza, preto e um verde ácido só para o que abre. Referências: See Saw, sinalização de transporte. Útil e próprio — o risco é ficar frio.',
    [fundo, preto, cinza, acido], 'Switzer 500 + IBM Plex Mono', [capa, obra, web]);
})();

(async () => {
  const saida = path.join(__dirname, 'SOCIAL', '_identidade');
  for (const [nome, q] of [['a-arquivo', A], ['b-cartaz', B], ['c-rota', C]]) {
    const html = `<!doctype html><html><head><meta charset="utf-8">${FONTES}<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#1a1a1a}</style></head><body>${q}</body></html>`;
    const arq = await renderizar(html, saida, nome, 2400, 1400);
    console.log('OK ' + arq.join(', '));
  }
})().catch(e => { console.error(e); process.exit(1); });
