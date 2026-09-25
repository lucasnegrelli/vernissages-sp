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
     fecha-dia          · a data em que mais mostras encerram de uma vez
     em-cartaz          · mostras em cartaz agora
   Contas novas de 25/09/2026 (repertório de 200 ideias):
     abre7 · fecha30 · sem-fim · zona-leste · zona-sul · zona-centro ·
     bairro-lider · mais-longa · mais-curta · artistas · individuais ·
     coletivas · instituicoes · casas-ativas · casas-paradas · abriu-mes

   As contas de urgência (fecha7, fecha-dia) trocam a tarja para "a conta
   regressiva" e engrossam um pouco o número. Mesmo sistema, 10% mais tenso.

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
        virada: 'Nenhuma delas vai avisar quando desmontar. A data já está marcada e ninguém publica obituário de exposição.',
        kick: 'a conta regressiva', peso: 300 };
    }
    case 'fecha-dia': {
      const prox = cartaz.filter(e => e.fim && _dias(hoje, e.fim) >= 0 && _dias(hoje, e.fim) <= 30);
      const porData = {};
      prox.forEach(e => { (porData[e.fim] = porData[e.fim] || []).push(e); });
      const alvo = Object.entries(porData).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))[0];
      if (!alvo) return { n: 0, unidade: '', linha: '', virada: '' };
      const [data, lista] = alvo;
      const dd = data.slice(8, 10) + '.' + data.slice(5, 7);
      const nomes = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
      const diaSem = nomes[new Date(data + 'T12:00:00Z').getUTCDay()];
      return { n: lista.length, unidade: 'no dia ' + dd,
        linha: 'exposições encerram todas no mesmo dia — ' + diaSem + ', ' + dd + '.',
        virada: 'A maioria das galerias fecha o ciclo no mesmo fim de semana. Quem deixa para decidir na hora escolhe uma e perde as outras ' + (lista.length - 1) + '.',
        kick: 'a conta regressiva', peso: 300 };
    }
    case 'abre7': {
      const a = DATA.expos.filter(e => V[e.v] && e.ini && _dias(hoje, e.ini) > 0 && _dias(hoje, e.ini) <= 7).length;
      return { n: a, unidade: a === 1 ? 'abertura' : 'aberturas', linha: 'confirmadas para os próximos sete dias em São Paulo.',
        virada: 'Abertura é a única noite em que a galeria vira festa com a porta aberta. Nenhuma cobra entrada, nenhuma pede lista.' };
    }
    case 'fecha30': {
      const f = cartaz.filter(e => e.fim && _dias(hoje, e.fim) >= 0 && _dias(hoje, e.fim) <= 30).length;
      return { n: f, unidade: 'de ' + cartaz.length, linha: 'mostras em cartaz hoje não estarão mais lá daqui a um mês.',
        virada: 'O circuito troca de pele a cada seis semanas. A cidade que você viu em setembro não é a de outubro.', kick: 'a conta regressiva', peso: 700 };
    }
    case 'sem-fim': {
      const n = cartaz.filter(e => !e.fim).length;
      return { n, unidade: 'de ' + cartaz.length, linha: 'mostras em cartaz não divulgaram quando fecham.',
        virada: 'Sem data de encerramento, a mostra parece eterna — e é exatamente assim que ela fecha sem ninguém ter ido.' };
    }
    case 'zona-leste': case 'zona-sul': case 'zona-centro': {
      const z = { 'zona-leste': 'Leste', 'zona-sul': 'Sul', 'zona-centro': 'Centro' }[conta];
      const n = casas.filter(v => v.z === z).length;
      const oeste = casas.filter(v => v.z === 'Oeste').length;
      return { n, unidade: 'de ' + casas.length, linha: (n === 1 ? 'casa do mapa está' : 'casas do mapa estão') + (z === 'Centro' ? ' no Centro.' : ' na Zona ' + z + '.'),
        virada: z === 'Centro' ? 'O Centro tem a Pinacoteca, o Bom Retiro e a República — e menos galeria comercial que um único bairro dos Jardins.'
                               : 'A Zona Oeste sozinha tem ' + oeste + '. A arte desta cidade mora longe de quase todo mundo que mora nela.' };
    }
    case 'bairro-lider': {
      const c = {}; cartaz.forEach(e => { const b = V[e.v].b; c[b] = (c[b] || 0) + 1; });
      const [b, n] = Object.entries(c).sort((x, y) => y[1] - x[1])[0] || ['', 0];
      return { n, unidade: 'em ' + b, linha: 'mostras em cartaz num bairro só — o mais denso da cidade agora.',
        virada: 'Dá para ver todas numa tarde, a pé. É a única conta desta página que termina com um programa.' };
    }
    case 'mais-longa': case 'mais-curta': {
      const d = cartaz.filter(e => e.fim).map(e => ({ e, d: _dias(e.ini, e.fim) })).filter(x => x.d > 0)
        .sort((x, y) => conta === 'mais-longa' ? y.d - x.d : x.d - y.d)[0];
      if (!d) return { n: 0, unidade: '', linha: '', virada: '' };
      const t = d.e.t.replace(/ — .*$/, '');
      return conta === 'mais-longa'
        ? { n: d.d, unidade: 'dias', linha: 'é quanto dura a mostra mais longa em cartaz: ' + t + ', em ' + d.e.v + '.',
            virada: 'Tempo de sobra — o que costuma ser o motivo de ninguém ir.' }
        : { n: d.d, unidade: d.d === 1 ? 'dia' : 'dias', linha: 'é quanto dura a mostra mais curta em cartaz: ' + t + ', em ' + d.e.v + '.',
            virada: 'Há exposição que dura menos que um feriado prolongado. Quem espera o fim de semana seguinte já perdeu.', kick: 'a conta regressiva', peso: 700 };
    }
    case 'artistas': {
      const nomes = new Set();
      cartaz.forEach(e => String(e.a || '').split(',').map(x => x.trim()).filter(Boolean).forEach(x => nomes.add(x)));
      return { n: nomes.size, unidade: 'artistas', linha: 'com trabalho na parede de São Paulo agora, só contando quem a agenda nomeia.',
        virada: 'E nenhum deles cobra ingresso para você ver o trabalho numa galeria.' };
    }
    case 'individuais': case 'coletivas': {
      const qtd = e => String(e.a || '').split(',').filter(x => x.trim()).length;
      const ind = cartaz.filter(e => qtd(e) === 1).length, col = cartaz.filter(e => qtd(e) >= 3).length;
      return conta === 'individuais'
        ? { n: ind, unidade: 'individuais', linha: 'mostras em cartaz dedicam a sala inteira a um artista só.',
            virada: 'Individual é aposta: a casa diz que aquele nome aguenta sozinho uma parede de seis semanas.' }
        : { n: col, unidade: 'coletivas', linha: 'mostras em cartaz juntam três artistas ou mais na mesma sala.',
            virada: 'Coletiva é argumento: o que interessa é o que aparece entre um trabalho e o outro, não cada um.' };
    }
    case 'instituicoes': {
      const n = cartaz.filter(e => V[e.v].tipo === 'institucional').length;
      return { n, unidade: 'de ' + cartaz.length, linha: 'mostras em cartaz estão em museus e centros culturais.',
        virada: 'O resto está em galeria, onde a entrada é livre e a obra, em geral, está à venda. Olhar não custa nada.' };
    }
    case 'casas-ativas': case 'casas-paradas': {
      const ativas = new Set(cartaz.map(e => e.v)).size;
      return conta === 'casas-ativas'
        ? { n: ativas, unidade: 'de ' + casas.length, linha: 'endereços do mapa têm mostra aberta hoje.',
            virada: 'Os outros estão entre uma exposição e a próxima — montando, desmontando ou pintando parede.' }
        : { n: casas.length - ativas, unidade: 'de ' + casas.length, linha: 'endereços do mapa estão sem mostra registrada hoje.',
            virada: 'Parte está trocando de exposição. Parte só avisa pelo Instagram, e a gente ainda não viu.' };
    }
    case 'abriu-mes': {
      const mes = hoje.slice(0, 7);
      const n = DATA.expos.filter(e => V[e.v] && e.ini && e.ini.slice(0, 7) === mes && e.ini <= hoje).length;
      return { n, unidade: n === 1 ? 'abertura' : 'aberturas', linha: 'já aconteceram este mês em São Paulo.',
        virada: 'Cada uma foi uma noite de porta aberta. Quem soube, foi.' };
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
      font-size:340px;font-weight:800;line-height:.86;letter-spacing:-.055em;color:${cfg.paleta.texto}}
    .slide .num small{font-size:64px;font-weight:300;letter-spacing:-.01em;color:${cfg.paleta.meio};
      display:block;margin-top:22px}
    .slide .linha{position:absolute;left:88px;right:110px;top:820px;
      font-size:44px;font-weight:600;line-height:1.24;letter-spacing:-.015em;color:${cfg.paleta.texto}}
    .slide .virada{position:absolute;left:88px;right:120px;top:1010px;
      font-size:27px;font-weight:300;line-height:1.5;color:${cfg.paleta.meio}}
    .slide .risco{position:absolute;left:88px;top:250px;width:64px;height:1px;background:${cfg.paleta.apagado}}
    .slide .marca{left:88px;right:auto}
    .slide .kick{color:#C96F4A;font-weight:600}
  </style></head><body>
    <div class="slide">
      <div class="kick">${esc(d.kick || 'a cidade em números')}</div>
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
  /* conta que da 0 ou 1 nao e noticia: aborta para o semana.js acusar e o plano trocar */
  if (d.n < 2 && ['abre7', 'abriu-mes', 'coletivas', 'mais-curta', 'bairro-lider'].includes(cfg.conta))
    throw new Error(cfg.conta + ' deu ' + d.n + ': pouco para virar peça agora. Escolha outra conta.');
  if (d.n === 0 && cfg.conta === 'fecha7') throw new Error('fecha7 = 0: nenhuma mostra encerra em 7 dias. Escolha outra conta.');
  if (d.n < 2 && cfg.conta === 'fecha-dia') throw new Error('fecha-dia < 2: nenhuma data concentra encerramento agora. Escolha outra conta.');

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
