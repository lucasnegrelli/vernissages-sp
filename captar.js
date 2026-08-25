#!/usr/bin/env node
/**
 * captar.js — legenda de post vira entrada do dados.js.
 *
 * POR QUE ISTO EXISTE
 * Cinco casas do mapa só divulgam no Instagram: A7MA, Mata Lab, Massapê,
 * Espaço República e Vazio Criativo. Perfil exige login, então nenhuma
 * varredura alcança — e são justamente os independentes, que é o que o projeto
 * existe para cobrir. Em 25/08/2026, 49 das 91 casas não tinham uma linha de
 * agenda.
 *
 * O gargalo nunca foi achar o post: é transcrever a legenda para o dados.js sem
 * errar data e sem inventar campo. Isto faz a transcrição e **declara o que não
 * conseguiu ler**, em vez de chutar.
 *
 * O QUE ELE NAO FAZ
 * Não abre Instagram, não raspa e não baixa nada. Você lê o post, copia a
 * legenda, cola aqui. Se passar `--img`, a URL entra crua no campo e quem baixa
 * é o `espelhar.js` — que já carrega a ética do projeto: cópia local, crédito
 * obrigatório, arquivo apagado se a casa pedir.
 *
 * Mostra sem imagem entra na agenda e no mapa normalmente, e só fica fora dos
 * formatos que mostram obra. Isso é o comportamento correto, não uma falha.
 *
 * USO
 *   node captar.js --venue "A7MA Galeria" --texto arquivo.txt
 *   node captar.js --venue "A7MA Galeria" --texto post.txt \
 *       --img "https://..." --cred "Foto Fulano / Cortesia A7MA"
 *   node captar.js --venue "A7MA Galeria"        (cola e termina com Ctrl+Z, Enter no Windows)
 *
 * Sai a linha pronta para colar no EXPOS do dados.js, mais a lista do que
 * ficou faltando. Nada e escrito em disco.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const flag = n => { const i = argv.indexOf('--' + n); return i > -1 ? argv[i + 1] : null; };

const MES = { janeiro:1, fevereiro:2, marco:3, março:3, abril:4, maio:5, junho:6, julho:7,
              agosto:8, setembro:9, outubro:10, novembro:11, dezembro:12,
              jan:1, fev:2, mar:3, abr:4, mai:5, jun:6, jul:7, ago:8, set:9, out:10, nov:11, dez:12 };

const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const pad = n => String(n).padStart(2, '0');
const ANO_PADRAO = new Date().getFullYear();

/* Datas. Aceita "12 de setembro", "12/09", "12.09.2026" e "12 set".
   Ano ausente assume o corrente — e isso vai declarado no relatorio, porque
   virada de ano e o erro classico deste tipo de transcricao. */
function acharDatas(txt) {
  const t = semAcento(txt);
  const achadas = [];
  const push = (d, m, a, idx) => {
    if (!m || m < 1 || m > 12 || !d || d < 1 || d > 31) return;
    achadas.push({ iso: (a || ANO_PADRAO) + '-' + pad(m) + '-' + pad(d), semAno: !a, idx });
  };
  let m;
  const re1 = /(\d{1,2})\s*de\s*([a-z]+)(?:\s*de\s*(\d{4}))?/g;
  while ((m = re1.exec(t))) push(+m[1], MES[m[2]], m[3] && +m[3], m.index);
  const re2 = /(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?/g;
  while ((m = re2.exec(t))) {
    let a = m[3] ? +m[3] : null; if (a && a < 100) a += 2000;
    push(+m[1], +m[2], a, m.index);
  }
  const re3 = /(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/g;
  while ((m = re3.exec(t))) push(+m[1], MES[m[2]], null, m.index);
  achadas.sort((a, b) => a.idx - b.idx);
  const vistas = new Set(), fim = [];
  for (const d of achadas) if (!vistas.has(d.iso)) { vistas.add(d.iso); fim.push(d); }
  return fim;
}

function acharTitulo(linhas) {
  for (const l of linhas) {
    const m = l.match(/[“"']([^”"']{3,90})[”"']/);            // entre aspas
    if (m) return m[1].trim();
  }
  for (const l of linhas) {                                    // linha toda em caixa alta
    const s = l.trim();
    if (s.length > 3 && s.length < 90 && s === s.toUpperCase() && /[A-ZÀ-Ú]/.test(s)) return s;
  }
  const p = linhas.find(l => l.trim().length > 3);
  return p ? p.trim() : '';
}

const acharArtistas = txt => {
  const m = txt.match(/(?:de|com|por|artistas?)\s*:?\s*([A-ZÀ-Ú][\wÀ-ú.'-]+(?:\s+[A-ZÀ-Ú][\wÀ-ú.'-]+){1,3})/);
  return m ? m[1].trim() : '';
};
const acharEndereco = txt => {
  const m = txt.match(/((?:R\.|Rua|Av\.|Avenida|Alameda|Al\.|Praca|Praça|Largo)\s+[^\n,]{3,60},?\s*n?º?\s*\d{1,5}[^\n]{0,40})/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
};
/* Horario de VISITACAO, nao o da abertura. A primeira versao casava com
   "sexta, 5 de setembro, a partir das 19h" — que e o vernissage, e vira dado
   errado na ficha de servico. Prioriza a linha que diz visitacao, depois a que
   traz intervalo de dias ("terca a sabado"), e so entao qualquer coisa com
   hora. */
const acharHorario = txt => {
  const linhas = txt.split('\n');
  const comHora = /\d{1,2}\s*h/i;
  const dia = '(?:seg|ter|qua|qui|sex|s[áa]b|dom)';
  const intervalo = new RegExp(dia + '[a-zç]*\\s+(?:a|as|às|até)\\s+' + dia, 'i');
  const limpa = l => l.replace(/^\s*(?:visita[çc][ãa]o|hor[áa]rio)\s*:?\s*/i, '').trim();

  const porVisita = linhas.find(l => /visita[çc][ãa]o|hor[áa]rio/i.test(l) && comHora.test(l));
  if (porVisita) return limpa(porVisita);
  const porIntervalo = linhas.find(l => intervalo.test(l) && comHora.test(l));
  if (porIntervalo) return limpa(porIntervalo);
  /* Sobrou so linha de abertura: devolve marcada, para nao virar ficha errada. */
  const m = txt.match(new RegExp('(' + dia + '[^\\n]{0,80}?\\d{1,2}\\s*h[^\\n]{0,40})', 'i'));
  return m ? m[1].trim() + '   [parece hora de ABERTURA, nao de visitacao]' : '';
};
const gratis = txt => /entrada\s+(gratuita|franca|livre)|gr[áa]tis/i.test(txt);

function principal() {
  const venue = flag('venue');
  if (!venue) { console.error('Falta --venue "Nome exatamente como esta no dados.js"'); process.exit(1); }

  const arq = flag('texto');
  const txt = arq ? fs.readFileSync(path.resolve(arq), 'utf8')
                  : fs.readFileSync(0, 'utf8');
  if (!txt.trim()) { console.error('Nao veio texto nenhum.'); process.exit(1); }

  /* O venue precisa existir na base: nome torto vira mostra orfa, que o
     check.js so acusa depois. */
  const win = {};
  new Function('window', fs.readFileSync(path.join(__dirname, 'dados.js'), 'utf8'))(win);
  const V = (win.DATA.venues || []).find(v => v.name === venue);
  if (!V) {
    console.error('Venue "' + venue + '" nao existe no dados.js. Nomes parecidos:');
    (win.DATA.venues || []).filter(v => semAcento(v.name).includes(semAcento(venue).slice(0, 5)))
      .forEach(v => console.error('   ' + v.name));
    process.exit(1);
  }

  const linhas = txt.split('\n').filter(l => l.trim());
  const datas = acharDatas(txt);
  const titulo = acharTitulo(linhas);
  const artistas = acharArtistas(txt);
  const endereco = acharEndereco(txt);
  const horario = acharHorario(txt);

  const e = { t: titulo, v: venue };
  if (artistas) e.a = artistas;
  if (datas[0]) e.ini = datas[0].iso;
  if (datas[1]) e.fim = datas[1].iso;

  /* Imagem.
     A URL entra crua e quem baixa e o `espelhar.js`, que ja existe e ja carrega
     a etica do projeto: copia local, credito obrigatorio no campo `cred`,
     arquivo apagado se a casa pedir. Nao ha download aqui — este script nao
     abre rede.
     URL de CDN do Instagram e assinada e expira em horas. Isso deixa de
     importar depois de espelhada, porque o arquivo passa a viver em img/ —
     mas so se voce rodar `node espelhar.js` no mesmo dia em que colou. */
  const img = flag('img');
  const cred = flag('cred');
  if (img) {
    e.img = img;
    e.cred = cred || 'Cortesia ' + venue;
  }
  /* O campo d exige fato concreto (A07). Nao ha como inventa-lo: sai vazio e o
     relatorio cobra. */
  e.d = '';

  const falta = [];
  if (!titulo) falta.push('titulo — nao achei nem entre aspas nem em caixa alta');
  if (!datas[0]) falta.push('data de abertura (ini) — obrigatoria');
  if (!datas[1]) falta.push('data de encerramento (fim) — sem ela a mostra fica fora do formato duracao');
  if (datas.some(d => d.semAno)) falta.push('ANO: a legenda nao trazia ano, assumi ' + ANO_PADRAO + ' — confira se a mostra atravessa a virada');
  if (!artistas) falta.push('artistas (a) — vai disparar A02');
  falta.push('campo d: escreva um fato concreto com numero, periodo ou material. Sem ele a mostra entra na agenda mas nao vira peca (A07)');
  if (!img) {
    falta.push('imagem: passe --img "<url da imagem do post>" e rode `node espelhar.js` em seguida. ' +
               'Sem ela a mostra aparece na agenda e no mapa do mesmo jeito, e so fica fora dos formatos que mostram obra');
  } else {
    if (!cred) falta.push('CREDITO: assumi "Cortesia ' + venue + '". Se o post nomeia o fotografo, corrija — o padrao do projeto e nunca chutar autoria de foto');
    if (/cdninstagram|fbcdn/.test(img)) falta.push('URL de CDN do Instagram expira em horas: rode `node espelhar.js` AGORA, ainda hoje, ou o arquivo se perde');
    falta.push('OLHE a imagem depois de espelhada: cartaz e vista de sala passam em peso e dimensao. Se for parede e nao obra, marque `vista: true`');
  }

  const json = JSON.stringify(e)
    .replace(/"(\w+)":/g, '$1:')
    .replace(/^\{/, '{').replace(/\}$/, '},');

  console.log('\n── linha para colar no EXPOS do dados.js ──\n');
  console.log(json);
  console.log('\n── o que a legenda nao deu ──\n');
  falta.forEach(f => console.log('  · ' + f));
  console.log('\n── conferencia ──\n');
  console.log('  casa      ' + V.name + '  (' + V.b + ', ' + V.z + ')');
  if (endereco) console.log('  endereco  legenda diz "' + endereco + '"');
  console.log('            base diz  "' + V.addr + '"' +
              (endereco && semAcento(endereco).slice(0, 12) !== semAcento(V.addr).slice(0, 12)
                ? '   <-- DIVERGEM, confira' : ''));
  if (horario) console.log('  horario   ' + horario + '   (a base so tem horario de sabado de 5 casas em 37)');
  if (gratis(txt)) console.log('  entrada   legenda diz gratuita');
  console.log('\nRode `node check.js` depois de colar.\n');
}

principal();
