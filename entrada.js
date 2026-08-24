/* ============================================================
   A ENTRADA — formato de social do Vernissages SP
   ============================================================

   O que e.

   O unico formato da semana que nao mostra obra nenhuma. Ele trata da porta:
   quanto custa entrar, quem cobra, quem nao cobra, e o que ninguem explica
   sobre atravessar a porta de uma galeria pela primeira vez.

   Por que existe.

   Ninguem no circuito fala de dinheiro. Galeria nao poe preco na parede,
   museu esconde a gratuidade no rodape do site, e o resultado e que a maior
   parte das pessoas acha que ver arte em Sao Paulo e caro e restrito. O dado
   diz o contrario, e com folga: das 37 casas com mostra em cartaz em
   27/08/2026, vinte sao galerias — e galeria nao tem bilheteria, pelo mesmo
   motivo que loja nao tem.

   A barreira real nunca foi o preco. E nao saber que se pode empurrar a
   porta. Este formato existe para dizer isso com numero na mao.

   As travas:

   1. NENHUM NUMERO E ESCRITO A MAO. Contagem, precos, dias gratuitos e
      fontes saem do `ing` dos venues e da agenda do dia. O config so traz
      texto de opiniao. Numero em peca de servico tem que poder ser refeito.

   2. CASA COM `conf` NAO ENTRA NA CONTA. Venue cujo ingresso esta marcado
      "a confirmar" nao e contado como gratuito nem como pago — sai numa
      linha separada, dizendo que falta confirmar. Precisao inventada aqui
      seria pior que silencio, porque a pessoa vai com o dinheiro contado.

   3. TODO PRECO CARREGA A FONTE. O `ing.fonte` vai impresso na peca.

   Uso:
     node entrada.js --config=SOCIAL/08/27/entrada.json --out=SOCIAL/08/27 --date=2026-08-27

   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const base = require('./rima.js');
const { carregarDados, RAIZ, CSS, esc, porExtensoAno, carimbo,
        PALETAS, cssPaleta } = base;

const W = 1080, H = 1350;

const EXTENSO = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito',
  'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete',
  'dezoito', 'dezenove', 'vinte'];
const numExtenso = n => (n <= 20 ? EXTENSO[n] : String(n));

const dinheiro = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',').replace(/,00$/, '');

/* ---------- leitura da bilheteria ---------- */

function levantar(DATA, hoje) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const emCartaz = new Set();
  for (const e of DATA.expos) {
    if (!e.ini || e.ini > hoje) continue;
    if (e.fim && e.fim < hoje) continue;
    if (V[e.v]) emCartaz.add(e.v);
  }
  const casas = [...emCartaz].map(n => V[n]);

  /* Galeria sem campo `ing` nao e dado faltando: e a norma do setor. Galeria
     comercial vive de vender obra, nao entrada, e por isso nao tem bilheteria.
     Deixo essa inferencia explicita aqui e na peca, em vez de somar tudo num
     "gratuito" que embaralharia o confirmado com o presumido. */
  const galerias = casas.filter(v => v.tipo === 'galeria' && !v.ing);
  const gratis = casas.filter(v => v.ing && v.ing.g);
  const pagas = casas.filter(v => v.ing && typeof v.ing.i === 'number')
    .sort((a, b) => b.ing.i - a.ing.i);
  const conferir = casas.filter(v => v.ing && v.ing.conf);
  const resto = casas.filter(v => !galerias.includes(v) && !gratis.includes(v) &&
    !pagas.includes(v) && !conferir.includes(v));

  return { casas, galerias, gratis, pagas, conferir, resto };
}

/* ---------- slides ---------- */

/* O numeral em contorno, ocupando quase o quadro inteiro. O zero e a unica
   figura que a peca tem, e ele nao e enfeite: e o preco e a forma de uma
   porta ao mesmo tempo. */
function slideZero(L, cfg, total) {
  return `<div class="slide">
    <div class="kick">a entrada</div>
    <div style="position:absolute;left:0;right:0;top:150px;height:760px;display:flex;
                align-items:center;justify-content:center">
      <span style="font-family:'Switzer';font-size:1000px;font-weight:200;line-height:.72;
                   letter-spacing:-.04em;color:transparent;
                   -webkit-text-stroke:1.5px ${cfg.paleta.texto}">0</span>
    </div>
    <div class="tese" style="top:1000px;width:870px;font-size:44px">${esc(
      'É o que custa entrar em qualquer uma das ' + numExtenso(L.galerias.length) +
      ' galerias com mostra em cartaz hoje.')}</div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">1/${total}</div>
  </div>`;
}

function slidePorque(L, cfg, total) {
  return `<div class="slide">
    <div class="kick">por que</div>
    <div class="risco" style="top:150px"></div>
    <div class="arg" style="top:250px">
      <p style="margin-bottom:30px">Galeria não cobra ingresso pelo mesmo motivo que loja não cobra: ela vive de vender obra, não de vender entrada. Não existe bilheteria, catraca nem lista.</p>
      <p style="margin-bottom:30px">Museu cobra porque a exposição é o produto, e o ingresso paga a montagem, o seguro e o transporte das obras.</p>
      <p>Das <b>${L.casas.length}</b> casas com mostra em cartaz hoje, <b>${L.galerias.length}</b> são galerias e <b>${L.gratis.length}</b> são instituições de entrada gratuita.</p>
      <span class="virada">${esc(cfg.virada)}</span>
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">2/${total}</div>
  </div>`;
}

function slidePrecos(L, cfg, total) {
  const linhas = L.pagas.map(v => `
    <div style="margin-bottom:40px">
      <div style="display:flex;align-items:baseline;gap:18px">
        <span style="font-size:52px;font-weight:300;letter-spacing:-.02em;color:${cfg.paleta.texto}">${dinheiro(v.ing.i)}</span>
        <span style="font-size:24px;font-weight:300;color:${cfg.paleta.fraco}">meia ${dinheiro(v.ing.m)}</span>
      </div>
      <div style="font-size:29px;font-weight:400;margin-top:8px;color:${cfg.paleta.texto}">${esc(v.name)}</div>
      ${v.ing.free ? '<div style="font-size:23px;font-weight:300;margin-top:8px;color:' + cfg.paleta.meio + '">de graça ' + esc(v.ing.free) + '</div>' : ''}
    </div>`).join('');

  /* Nao afirmar que estas cobram. O `conf` diz que o valor nao esta publicado,
     nao que existe cobranca — do Museu da Imigracao, por exemplo, so sabemos
     que a pagina nao informa. Escrever "cobram" seria inventar o dado que a
     propria marcacao existe para admitir que falta. */
  const cf = L.conferir.length
    ? '<div class="serv" style="margin-top:8px;font-size:20px;color:' + cfg.paleta.apagado + '">' +
      esc(L.conferir.map(v => v.name).join(', ')) +
      (L.conferir.length === 1 ? ' não publica o valor no site oficial. Confirme antes de ir.'
                               : ' não publicam os valores no site oficial. Confirme antes de ir.') +
      '</div>'
    : '';

  return `<div class="slide">
    <div class="kick">as ${numExtenso(L.pagas.length)} que cobram</div>
    <div class="risco" style="top:150px"></div>
    <div class="ficha" style="top:214px;bottom:214px;display:flex;flex-direction:column;justify-content:center">
      ${linhas}
      ${cf}
    </div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">3/${total}</div>
  </div>`;
}

/* O slide que justifica a peca existir. Preco e a barreira que se mede;
   esta e a que ninguem mede e todo mundo sente. */
function slidePorta(cfg, total) {
  const itens = cfg.porta.map(p => `
    <div style="display:flex;gap:26px;margin-bottom:26px">
      <span style="color:${cfg.paleta.apagado};font-size:26px;line-height:1.5">—</span>
      <span style="flex:1">${esc(p)}</span>
    </div>`).join('');
  return `<div class="slide">
    <div class="kick">na porta</div>
    <div class="risco" style="top:150px"></div>
    <div style="position:absolute;left:88px;right:88px;top:214px;bottom:214px;
                display:flex;flex-direction:column;justify-content:center;font-size:30px;
                font-weight:300;line-height:1.42;color:${cfg.paleta.meio}">${itens}</div>
    <div class="marca">Vernissages SP</div>
    <div class="pag">4/${total}</div>
  </div>`;
}

function slideFonte(L, cfg, total) {
  const fontes = L.pagas.filter(v => v.ing.fonte)
    .map(v => esc(v.name) + ' — ' + esc(v.ing.fonte)).join('<br>');
  return `<div class="slide">
    <div class="kick">de onde vem</div>
    <div class="risco" style="top:150px"></div>
    <div class="ficha" style="top:214px;bottom:214px;display:flex;flex-direction:column;justify-content:center">
      <div class="serv" style="font-size:24px;color:${cfg.paleta.meio};margin-top:0">
        Valores publicados pelas próprias instituições:<br><br>${fontes}
      </div>
      <div class="serv" style="font-size:24px;margin-top:44px;color:${cfg.paleta.meio}">
        A contagem de casas com mostra em cartaz sai da agenda do Vernissages SP${cfg.carimbo ? ', em ' + esc(cfg.carimbo) : ''}.
        Preço muda: confirme no site da casa antes de ir.
      </div>
    </div>
    <div class="marca">vernissagessp.com.br</div>
    <div class="pag">${total}/${total}</div>
  </div>`;
}

function montarHTML(L, cfg) {
  const total = 5;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta)}</style></head><body>` +
    slideZero(L, cfg, total) + slidePorque(L, cfg, total) + slidePrecos(L, cfg, total) +
    slidePorta(cfg, total) + slideFonte(L, cfg, total) +
    `</body></html>`;
}

async function principal() {
  const argv = process.argv.slice(2);
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date().toISOString().slice(0, 10));
  const cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  const saida = path.resolve(RAIZ, flag('out', '.'));
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.escuro;
  cfg.carimbo = carimbo(cfg, hoje);

  const DATA = carregarDados();
  const L = levantar(DATA, hoje);

  console.log('em cartaz em ' + hoje + ': ' + L.casas.length + ' casas');
  console.log('  galerias sem bilheteria: ' + L.galerias.length);
  console.log('  instituições gratuitas:  ' + L.gratis.length);
  console.log('  cobram ingresso:         ' + L.pagas.length + ' (' + L.pagas.map(v => v.name).join(', ') + ')');
  console.log('  a confirmar:             ' + L.conferir.length + (L.conferir.length ? ' (' + L.conferir.map(v => v.name).join(', ') + ')' : ''));
  if (L.resto.length) console.log('  fora das categorias:     ' + L.resto.map(v => v.name + ' [' + v.tipo + ']').join(', '));

  /* Trava 1: a peca so faz sentido com galeria em quantidade. */
  if (L.galerias.length < 5) throw new Error('So ' + L.galerias.length + ' galerias em cartaz — a tese da peca nao se sustenta hoje.');
  /* Trava 3: preco sem fonte nao vai ao ar. */
  const semFonte = L.pagas.filter(v => !v.ing.fonte);
  if (semFonte.length) throw new Error('Preco sem fonte publicada: ' + semFonte.map(v => v.name).join(', ') +
    '. Preencha ing.fonte antes de publicar valor.');

  const tmp = path.join(RAIZ, '.entrada-tmp.html');
  fs.writeFileSync(tmp, montarHTML(L, cfg), 'utf8');

  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--force-device-scale-factor=1'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }
  });
  const page = await browser.newPage();
  page.on('pageerror', x => console.log('PAGEERROR: ' + x.message));
  await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 700));

  fs.mkdirSync(saida, { recursive: true });
  const els = await page.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    const p = path.join(saida, cfg.nome + '-' + String(i + 1).padStart(2, '0') + '.png');
    await els[i].screenshot({ path: p });
    console.log('OK ' + p);
  }
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('\n' + els.length + ' slides · todos os números calculados da base');
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
