/* ============================================================
   medir-imagem.js — largura e altura a partir dos primeiros bytes

   Por que existe.

   Em 24/08/2026, ao procurar obra que aguentasse recorte fechado, medimos as
   33 imagens de mostras em cartaz: 26 estavam salvas em 1200x630. Essa nao e
   uma medida qualquer — e o tamanho padrao de `og:image`, o card que o site
   gera para o link ficar bonito no WhatsApp. Preview de link, nao reproducao
   de obra. O `check.js` aprovava todas (pesam mais de 15 KB, sao imagem de
   verdade, nao sao SVG) porque nunca olhou a dimensao.

   Le so o cabecalho, sem decodificar: sao dezenas de bytes por arquivo, o que
   permite chamar isto para a base inteira dentro do check.js sem custo, e
   pedir Range: bytes=0-1023 quando a imagem ainda esta na rede.

   Sem dependencia externa de proposito: o check.js roda no CI e no navegador,
   e o sharp so existe dentro de .render/, que nao e versionado.
   ============================================================ */

(function (raiz) {
'use strict';

/* Assinaturas de card de rede social. Nenhuma delas e proporcao de obra: sao
   as medidas que Open Graph, Twitter e LinkedIn pedem para o preview. */
var CARTOES = [
  [1200, 630], [1200, 628], [1200, 627], [1200, 675], [1200, 600],
  [1080, 566], [600, 315], [1920, 1005]
];

/* Abaixo disto nao ha pixel para recorte fechado: o formato `aproximacao`
   recusa, e a peca cai para enquadramento aberto. */
var LARGURA_MIN_RECORTE = 1600;

function u16be(b, i) { return b[i] * 256 + b[i + 1]; }
function u16le(b, i) { return b[i] + b[i + 1] * 256; }
function u32be(b, i) { return ((b[i] << 8 | b[i + 1]) << 8 | b[i + 2]) * 256 + b[i + 3]; }
function u24le(b, i) { return b[i] + b[i + 1] * 256 + b[i + 2] * 65536; }

function medirBuffer(b) {
  if (!b || b.length < 16) return null;

  // PNG — IHDR e sempre o primeiro chunk, em offset fixo
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
    return { w: u32be(b, 16), h: u32be(b, 20), tipo: 'png' };
  }

  // GIF
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
    return { w: u16le(b, 6), h: u16le(b, 8), tipo: 'gif' };
  }

  // WEBP — tres codificacoes, cada uma guarda a dimensao em lugar diferente
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    var marca = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (marca === 'VP8 ') {
      return { w: u16le(b, 26) & 0x3FFF, h: u16le(b, 28) & 0x3FFF, tipo: 'webp' };
    }
    if (marca === 'VP8L') {
      var bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
      return { w: (bits & 0x3FFF) + 1, h: ((bits >> 14) & 0x3FFF) + 1, tipo: 'webp' };
    }
    if (marca === 'VP8X') {
      return { w: u24le(b, 24) + 1, h: u24le(b, 27) + 1, tipo: 'webp' };
    }
    return null;
  }

  // JPEG — percorre os marcadores ate achar um SOF
  if (b[0] === 0xFF && b[1] === 0xD8) {
    var i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xFF) { i++; continue; }
      var m = b[i + 1];
      if (m === 0xFF) { i++; continue; }
      // SOF0..SOF15, menos DHT (C4), JPG (C8) e DAC (CC)
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
        return { w: u16be(b, i + 7), h: u16be(b, i + 5), tipo: 'jpeg' };
      }
      var tam = u16be(b, i + 2);
      if (tam < 2) return null;
      i += 2 + tam;
    }
    return null;
  }

  return null;
}

function medirArquivo(caminho) {
  try {
    var fs = require('fs');
    var fd = fs.openSync(caminho, 'r');
    var buf = Buffer.alloc(65536);
    var lidos = fs.readSync(fd, buf, 0, 65536, 0);
    fs.closeSync(fd);
    return medirBuffer(buf.slice(0, lidos));
  } catch (e) { return null; }
}

/* Diagnostico em uma frase, para o check.js e para o descobrir-imagens
   dizerem a mesma coisa com as mesmas palavras. */
function diagnosticar(dim) {
  if (!dim) return { grau: 'desconhecido', msg: 'nao consegui ler a dimensao' };
  var ehCartao = CARTOES.some(function (c) { return c[0] === dim.w && c[1] === dim.h; });
  if (ehCartao) {
    return { grau: 'cartao', msg: dim.w + 'x' + dim.h +
      ' e medida de card de rede social (og:image), nao reproducao de obra. Procure a imagem na pagina da mostra ou na viewing room.' };
  }
  if (dim.w < LARGURA_MIN_RECORTE) {
    return { grau: 'curta', msg: dim.w + 'x' + dim.h + ', abaixo de ' + LARGURA_MIN_RECORTE +
      ' px de largura. Serve para capa, nao aguenta recorte fechado.' };
  }
  return { grau: 'ok', msg: dim.w + 'x' + dim.h };
}

var API = { medirBuffer: medirBuffer, medirArquivo: medirArquivo,
            diagnosticar: diagnosticar, CARTOES: CARTOES,
            LARGURA_MIN_RECORTE: LARGURA_MIN_RECORTE };

if (typeof module !== 'undefined' && module.exports) module.exports = API;
raiz.VSPImagem = API;

})(typeof globalThis !== 'undefined' ? globalThis : this);
