/* ============================================================
   O NÚMERO — formato de social do Vernissages SP
   ============================================================

   Um dado só, gigante, e uma frase. Calculado da base na hora — nunca digitado.
   É o primo pobre e direto do painel "O panorama": em vez da linha do tempo
   inteira, uma medida só, do tamanho de um cartaz.

   `cfg.conta` escolhe qual:
     duracao-galeria    · dias que uma mostra de galeria fica em cartaz
     gratis             · espaços com entrada gratuita
     concentracao-oeste · casas na Zona Oeste
     fecha7             · mostras que encerram nos próximos 7 dias
     em-cartaz          · mostras em cartaz agora

   Uso:
     node numero.js --config=SOCIAL/09/04/numero.json --out=SOCIAL/09/04 --date=2026-09-04
     node numero.js --seco
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { carregarDados, RAIZ, CSS, esc, PALETAS, cssPaleta } = require('./rima.js');

const W = 1080, H = 1350;
const _dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00') - Date.parse(a + 'T12:00:00')) / 864e5);
const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

function calcular(DATA, hoje, conta) {
  const V = {}; DATA.venues.forEach(v => V[v.name] = v);
  const casas = DATA.venues.filter(v => v.tipo !== 'feira');
  const cartaz = DATA.expos.filter(e => e.ini && e.ini <= hoje && (!e.fim || e.fim >= hoje) && V[e.v]);

  switch (conta) {
    case 'duracao-galeria': {
      const d = cartaz.filter(e => e.fim && V[e.v].tipo === 'galeria').map(e => _dias(e.ini, e.fim));
      return { n: mediana(d), unidade: 'dias',
        linha: 'é quanto uma mostra de galeria fica em cartaz em São Paulo, na mediana.',
        virada: 'Seis semanas entre a abertura e a desmontagem. Quem adia a visita para "qualquer dia desses" quase sempre perde.' };
    }
    case 'gratis': {
      /* Modelo do entrada.js: galeria não tem bilheteria; instituição livre é
         a que traz `ing.g`; quem cobra traz `ing.i` numérico. */
      const livres = casas.filter(v => v.tipo === 'galeria' || (v.ing && v.ing.g)).length;
      const cobram = casas.filter(v => v.ing && typeof v.ing.i === 'number').length;
      return { n: livres, unidade: 'de ' + casas.length,
        linha: 'espaços do mapa não cobram para entrar.',
        virada: 'Só ' + cobram + ' pedem ingresso, e são instituições. Toda galeria é franca — não por generosidade, por não ter catraca.' };
    }
    case 'concentracao-oeste': {
      const o = casas.filter(v => v.z === 'Oeste').length;
      return { n: o, unidade: 'de ' + casas.length,
        linha: 'casas do mapa estão na Zona Oeste.',
        virada: 'A arte desta cidade não está espalhada. Ela se concentra num pedaço que se atravessa de bicicleta.' };
    }
    case 'fecha7': {
      const f = cartaz.filter(e => e.fim && _dias(hoje, e.fim) >= 0 && _dias(hoje, e.fim) <= 7).length;
      return { n: f, unidade: f === 1 ? 'mostra' : 'mostras',
        linha: (f === 1 ? 'encerra' : 'encerram') + ' nos próximos sete dias.',
        virada: 'Nenhuma delas vai avisar quando desmontar. A data já está marcada e ninguém publica obituário de exposição.' };
    }
    case 'em-cartaz':
    default: {
      return { n: cartaz.length, unidade: cartaz.length === 1 ? 'mostra' : 'mostras',
        linha: 'em cartaz agora em São Paulo, em ' + new Set(cartaz.map(e => e.v)).size + ' endereços.',
        virada: 'Mais do que qualquer pessoa consegue ver. O trabalho não é dar conta — é escolher.' };
    }
  }
}

function montarHTML(d, cfg) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}
    ${cssPaleta(cfg.paleta, cfg.textura)}
    .slide .num{position:absolute;left:88px;right:88px;top:300px;
      font-size:340px;font-weight:200;line-height:.86;letter-spacing:-.04em;color:${cfg.paleta.texto}}
    .slide .num small{font-size:64px;font-weight:300;letter-spacing:-.01em;color:${cfg.paleta.meio};
      display:block;margin-top:22px}
    .slide .linha{position:absolute;left:88px;right:110px;top:820px;
      font-size:40px;font-weight:300;line-height:1.36;letter-spacing:-.008em;color:${cfg.paleta.texto}}
    .slide .virada{position:absolute;left:88px;right:120px;top:1010px;
      font-size:27px;font-weight:300;line-height:1.5;color:${cfg.paleta.meio}}
    .slide .risco{position:absolute;left:88px;top:250px;width:64px;height:1px;background:${cfg.paleta.apagado}}
    .slide .marca{left:88px;right:auto}
  </style></head><body>
    <div class="slide">
      <div class="kick">a cidade em números</div>
      <div class="risco"></div>
      <div class="num">${esc(String(d.n))}<small>${esc(d.unidade)}</small></div>
      <div class="linha">${esc(d.linha)}</div>
      <div class="virada">${esc(d.virada)}</div>
      <div class="marca">Vernissages SP</div>
    </div>
  </body></html>`;
}

async function principal() {
  const argv = process.argv.slice(2);
  const seco = argv.includes('--seco');
  const flag = (n, p) => { const a = argv.filter(x => x.startsWith('--' + n + '=')) [0]; return a ? a.split('=').slice(1).join('=') : p; };
  const hoje = flag('date', new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10));

  let cfg;
  if (seco && !argv.some(x => x.startsWith('--config='))) {
    cfg = { paleta: 'escuro', textura: 0.05, conta: flag('conta', 'em-cartaz') };
  } else {
    cfg = JSON.parse(fs.readFileSync(path.resolve(flag('config')), 'utf8'));
  }
  cfg.paleta = PALETAS[cfg.paleta] || PALETAS.escuro;

  const DATA = carregarDados();
  const d = calcular(DATA, hoje, cfg.conta);
  console.log('conta ' + cfg.conta + ' → ' + d.n + ' ' + d.unidade + '\n  ' + d.linha);
  if (!d.n && d.n !== 0) throw new Error('conta ' + cfg.conta + ' não deu número.');
  if (d.n === 0 && cfg.conta === 'fecha7') throw new Error('fecha7 = 0: nenhuma mostra encerra em 7 dias. Escolha outra conta.');

  if (seco) { console.log('\n--seco: nada foi renderizado.'); return; }

  const saida = path.resolve(RAIZ, flag('out', '.'));
  const tmp = path.join(RAIZ, '.numero-tmp.html');
  fs.writeFileSync(tmp, montarHTML(d, cfg), 'utf8');

  const puppeteer = require(path.join(RAIZ, '.render', 'node_modules', 'puppeteer-core'));
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
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
  const el = await page.$('.slide');
  const p = path.join(saida, (cfg.nome || 'numero') + '-01.png');
  await el.screenshot({ path: p });
  console.log('OK ' + p);
  await browser.close();
  fs.unlinkSync(tmp);
}

if (require.main === module) {
  principal().catch(e => { console.error('\nABORTADO — ' + e.message + '\n'); process.exit(1); });
}
