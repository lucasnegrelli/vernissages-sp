/* ============================================================
   O ROLÊ — formato de social do Vernissages SP
   ============================================================

   O que e.

   Tres roteiros prontos para o sabado, em regioes diferentes da cidade, sem
   sobreposicao entre eles. Cada um traz as obras que voce vai ver, as paradas
   na ordem mais curta e a distancia total a pe. A pessoa escolhe pelo bairro
   onde esta e sai.

   Por que no sabado.

   Sabado a pessoa nao esta lendo, esta saindo — olhando o telefone na rua,
   decidindo agora. O problema dela nao e falta de opcao: sao 22 casas com
   mostra e obra em cartaz, e opcao demais paralisa. Este formato existe para
   reduzir 22 a tres, e tres a um.

   O que este formato nao e.

   Nao e a deriva de quarta. La o assunto e a caminhada em si — um percurso so,
   com mapa desenhado e distancia medida entre cada parada, para quem quer
   andar. Aqui o assunto e a escolha: tres opcoes lado a lado, com a obra a
   vista, para quem quer decidir. Um e sobre o trajeto, o outro sobre o destino.

   Uma coisa que a base nao tem, e por isso a peca nao promete.

   O dado mais util do sabado seria a hora de fechamento — galeria fecha cedo, e
   quem sai as 15h costuma pegar porta fechada. Levantamento de 29/08: das 37
   casas com mostra em cartaz, **so cinco publicam horario de sabado**. Sem
   dado nao ha promessa: a peca manda conferir antes de sair, em vez de fingir
   que sabe.

   As travas:

   1. TODA PARADA TEM OBRA. Casa cuja mostra nao tem imagem em disco nao entra
      em rolê nenhum.
   2. OS TRES ROLÊS SAO DISJUNTOS. Nenhuma casa aparece em dois roteiros — o
      script monta o maior aglomerado, remove essas casas do pote e monta o
      proximo com o que sobrou.
   3. ROLÊ COM MENOS DE TRES PARADAS NAO SAI, e se nao houver tres roteiros
      possiveis a peca aborta em vez de repetir casa.

   Uso:
     node role.js --config=SOCIAL/08/29/role.json --out=SOCIAL/08/29 --date=2026-08-29

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, exigirObra, medir, RAIZ, CSS, esc, porExtenso, carimbo,
        arroba, tituloCurto, autoria, PALETAS, cssPaleta } = base;

const W = 1080, H = 1350;
/* 900 m e o teto do que se atravessa sem pensar. Com 1400 o script montava
   roteiros com salto de 1,1 km entre duas paradas — tecnicamente um aglomerado,
   na pratica uma caminhada que ninguem faz de sabado a tarde. */
const RAIO = 900;
const MAX_PARADAS = 5;
const MIN_PARADAS = 3;
const ROLES = 3;

/* ---------- geografia ---------- */

const rad = g => g * Math.PI / 180;
function metros(a, b) {
  const R = 6371000;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function melhorRota(pontos) {
  const n = pontos.length, idx = [...Array(n).keys()];
  let melhor = null, menor = Infinity;
  const permutar = (atual, resto) => {
    if (!resto.length) {
      let d = 0;
      for (let i = 1; i < atual.length; i++) d += metros(pontos[atual[i - 1]], pontos[atual[i]]);
      if (d < menor) { menor = d; melhor = atual.slice(); }
      return;
    }
    for (let i = 0; i < resto.length; i++) {
      permutar(atual.concat(resto[i]), resto.slice(0, i).concat(resto.slice(i + 1)));
    }
  };
  permutar([], idx);
  return { ordem: melhor, total: menor };
}

/* ---------- selecao ---------- */

async function elegiveis(DATA, hoje, fora) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const excluir = new Set(fora || []);
  const porCasa = new Map();
  for (const e of DATA.expos) {
    if (!e.ini || e.ini > hoje) continue;
    if (e.fim && e.fim < hoje) continue;
    if (excluir.has(e.t + '|' + e.v)) continue;
    const v = V[e.v];
    if (!v || typeof v.lat !== 'number') continue;
    let rel;
    try { rel = exigirObra(e); } catch { continue; }
    const ant = porCasa.get(e.v);
    if (!ant || (e.d || '').length > (ant.e.d || '').length) porCasa.set(e.v, { e, v, rel });
  }
  const out = [...porCasa.values()];
  for (const o of out) o.dim = await medir(o.rel);
  return out;
}

/* Monta rolês disjuntos: acha o aglomerado mais cheio, tira essas casas do
   pote e repete. Sem isso o mesmo quarteirao dos Jardins apareceria nos tres,
   que e o oposto de dar opcao. */
function montarRoles(cands, quantos) {
  let pote = cands.slice();
  const saida = [];

  while (saida.length < quantos && pote.length >= MIN_PARADAS) {
    let melhor = null;
    for (const c of pote) {
      const perto = pote.filter(o => o === c || metros(c.v, o.v) <= RAIO);
      if (perto.length < MIN_PARADAS) continue;
      /* Entre aglomerados do mesmo tamanho, fica o mais compacto. */
      const sel = perto.slice(0, MAX_PARADAS);
      const { total } = melhorRota(sel.map(x => x.v));
      if (!melhor || sel.length > melhor.sel.length ||
          (sel.length === melhor.sel.length && total < melhor.total)) {
        melhor = { sel, total };
      }
    }
    if (!melhor) break;
    const { ordem, total } = melhorRota(melhor.sel.map(x => x.v));
    const paradas = ordem.map(i => melhor.sel[i]);
    paradas.forEach((p, i) => {
      p.dist = i ? Math.round(metros(paradas[i - 1].v, p.v) / 10) * 10 : null;
    });
    saida.push({ paradas, total, bairro: paradas[0].v.b, zona: paradas[0].v.z });
    const usados = new Set(melhor.sel.map(x => x.v.name));
    pote = pote.filter(x => !usados.has(x.v.name));
  }
  return saida;
}

/* Nome do rolê: o bairro que mais aparece nas paradas.
 *
 * A primeira versao caia na zona quando os bairros divergiam, e dois roteiros
 * diferentes sairam ambos chamados "Zona Oeste" — inutil para quem esta
 * escolhendo onde ir. Se dois roles ainda empatarem no bairro modal, o
 * desempate acrescenta o segundo bairro de cada um. */
function nomear(role) {
  const cont = {};
  role.paradas.forEach(p => cont[p.v.b] = (cont[p.v.b] || 0) + 1);
  const ordenado = Object.entries(cont).sort((a, b) => b[1] - a[1]);
  return ordenado[0][0];
}

function nomearTodos(roles) {
  const nomes = roles.map(nomear);
  nomes.forEach((n, i) => {
    if (nomes.filter(x => x === n).length < 2) return;
    const outro = roles[i].paradas.map(p => p.v.b).find(b => b !== n);
    if (outro) nomes[i] = n + ' e ' + outro;
  });
  roles.forEach((r, i) => r.nome = nomes[i]);
  return roles;
}

/* ---------- slides ---------- */

function slideCapa(roles, cfg, total) {
  const linhas = roles.map((r, i) => `
    <div style="display:flex;align-items:baseline;gap:20px;margin-bottom:30px">
      <span style="font-size:24px;color:${cfg.paleta.apagado};min-width:44px">${String(i + 1).padStart(2, '0')}</span>
      <span style="flex:1">
        <span style="font-size:42px;font-weight:300;letter-spacing:-.02em;color:${cfg.paleta.texto}">${esc(r.nome)}</span>
        <span style="display:block;font-size:22px;font-weight:300;margin-top:6px;color:${cfg.paleta.fraco}">
          ${r.paradas.length} casas · ≈ ${(r.total / 1000).toFixed(1).replace('.', ',')} km a pé</span>
      </span>
    </div>`).join('');

  return `<div class="slide">
    <div class="kick">o rolê</div>
    <div style="position:absolute;left:88px;right:88px;top:210px;bottom:210px;
                display:flex;flex-direction:column;justify-content:center">
      <div style="font-size:52px;font-weight:300;line-height:1.16;letter-spacing:-.02em;
                  color:${cfg.paleta.texto};margin-bottom:56px">${esc(cfg.titulo)}</div>
      ${linhas}
      <div style="font-size:23px;font-weight:300;line-height:1.5;margin-top:26px;color:${cfg.paleta.meio}">${esc(cfg.chamada)}</div>
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">1/${total}</div>
  </div>`;
}

/* A faixa de obras no topo e o argumento: voce ve o que vai ver antes de ler
   qualquer endereco. Larguras iguais, altura sangrando — quem manda no corte e
   o numero de paradas. */
function slideRole(role, cfg, n, total, indice) {
  const N = role.paradas.length;
  const fw = Math.ceil(W / N);
  const faixa = role.paradas.map((p, i) => `
    <div style="position:absolute;left:${i * fw}px;top:0;width:${fw}px;height:470px;overflow:hidden">
      <img src="${esc(p.rel)}" style="width:100%;height:100%;object-fit:cover;display:block">
      <div style="position:absolute;left:0;bottom:0;padding:4px 9px;font-family:'Switzer';
                  font-size:15px;font-weight:500;letter-spacing:.08em;
                  color:${cfg.paleta.fundo};background:${cfg.paleta.texto}">${String(i + 1).padStart(2, '0')}</div>
    </div>`).join('');

  const paradas = role.paradas.map((p, i) => `
    <div style="display:flex;gap:16px;margin-bottom:19px">
      <span style="min-width:40px;color:${cfg.paleta.apagado}">${String(i + 1).padStart(2, '0')}</span>
      <span style="flex:1">
        <span style="color:${cfg.paleta.texto}">${esc(p.v.name)}</span>${p.dist != null ? '<span style="color:' + cfg.paleta.apagado + '">  ≈ ' + p.dist + ' m</span>' : ''}
        <span style="display:block;font-size:19px;color:${cfg.paleta.fraco};margin-top:3px">
          ${esc(tituloCurto(p.e))}${autoria(p.e) ? ', de ' + esc(autoria(p.e)) : ''} · ${esc(p.v.addr)}</span>
      </span>
    </div>`).join('');

  return `<div class="slide">
    <div style="position:absolute;left:0;top:0;width:${W}px;height:470px;overflow:hidden">${faixa}</div>
    <div style="position:absolute;left:88px;right:88px;top:540px">
      <div style="font-size:24px;color:${cfg.paleta.apagado};letter-spacing:.2em;margin-bottom:14px">ROLÊ ${String(indice).padStart(2, '0')}</div>
      <div style="font-size:54px;font-weight:300;letter-spacing:-.025em;line-height:1.05;
                  color:${cfg.paleta.texto}">${esc(role.nome)}</div>
      <div style="font-size:23px;font-weight:300;margin-top:12px;color:${cfg.paleta.meio}">
        ${role.paradas.length} casas · ≈ ${(role.total / 1000).toFixed(1).replace('.', ',')} km a pé · cerca de ${Math.round(role.total / 1.25 / 60)} min de caminhada
      </div>
      <div style="font-size:22px;font-weight:300;line-height:1.4;margin-top:38px">${paradas}</div>
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">${n}/${total}</div>
  </div>`;
}

function slideFecho(roles, cfg, total) {
  const casas = roles.reduce((s, r) => s + r.paradas.length, 0);
  return `<div class="slide">
    <div class="kick">antes de sair</div>
    <div class="risco" style="top:150px"></div>
    <div style="position:absolute;left:88px;right:88px;top:214px;bottom:214px;
                display:flex;flex-direction:column;justify-content:center">
      <div class="arg" style="position:static;width:auto;font-size:31px">
        ${cfg.rodape.map(p => '<p style="margin-bottom:26px">' + esc(p) + '</p>').join('')}
        <span class="virada" style="margin-top:34px;font-size:40px">${esc(cfg.virada)}</span>
      </div>
      <div style="font-size:20px;font-weight:300;line-height:1.55;margin-top:46px;color:${cfg.paleta.apagado}">
        ${casas} casas em ${roles.length} roteiros, nenhuma repetida. Distâncias em linha reta entre as coordenadas: a calçada é um pouco mais longa.${cfg.carimbo ? '<br>Endereços conferidos na agenda do Vernissages SP em ' + esc(cfg.carimbo) + '.' : ''}
      </div>
    </div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">${total}/${total}</div>
  </div>`;
}

function montarHTML(roles, cfg) {
  const total = roles.length + 2;
  let s = slideCapa(roles, cfg, total);
  roles.forEach((r, i) => { s += slideRole(r, cfg, i + 2, total, i + 1); });
  s += slideFecho(roles, cfg, total);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta, cfg.textura)}</style></head><body>${s}</body></html>`;
}

/* ---------- execucao ---------- */

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date().toISOString().slice(0, 10));
  const cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  const saida = path.resolve(RAIZ, flag('out', '.'));
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.escuro;
  cfg.carimbo = carimbo(cfg, hoje);

  const DATA = carregarDados();
  const cands = await elegiveis(DATA, hoje, cfg.fora);
  console.log(cands.length + ' casas com mostra e obra em ' + hoje);

  const roles = nomearTodos(montarRoles(cands, ROLES));
  if (roles.length < ROLES) {
    throw new Error('So deu para montar ' + roles.length + ' rolê(s) sem repetir casa. ' +
      'A peca promete tres opcoes de regiao — com menos, ela mente.');
  }

  roles.forEach((r, i) => {
    console.log('\nrolê ' + (i + 1) + ' — ' + r.nome + ' · ' + r.paradas.length +
      ' casas · ' + Math.round(r.total) + ' m');
    r.paradas.forEach((p, k) => console.log('   ' + (k + 1) + '. ' + p.v.name +
      (p.dist != null ? '  (≈' + p.dist + ' m)' : '')));
  });

  const tmp = path.join(RAIZ, '.role-tmp.html');
  fs.writeFileSync(tmp, montarHTML(roles, cfg), 'utf8');

  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
  });
  const page = await browser.newPage();
  page.on('pageerror', x => console.log('PAGEERROR: ' + x.message));
  await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 900));

  fs.mkdirSync(saida, { recursive: true });
  const els = await page.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    const p = path.join(saida, cfg.nome + '-' + String(i + 1).padStart(2, '0') + '.png');
    await els[i].screenshot({ path: p });
    console.log('OK ' + p);
  }
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('\n' + els.length + ' slides · ' + roles.length + ' rolês disjuntos, todas as paradas com obra');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
