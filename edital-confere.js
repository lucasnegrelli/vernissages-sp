/* ============================================================
   edital-confere.js — confere o prazo de uma chamada NA PÁGINA, na hora (11/11/2026)

   Por que existe: o radar lê o prazo de texto solto e erra. Em 11/11 a Dasartes dizia "inscrições até
   5 de novembro" e o radar marcava 16/11. Post de edital com data errada queima o perfil inteiro.
   Regra nova: só entra em post o que a PÁGINA DA CHAMADA, aberta agora, confirma.

   confirmar(item) devolve { ok, motivo, achou, imagem }
     ok       true só se a data do prazo aparece no texto da página e a página não diz "encerrada"
     achou    o trecho da data que casou (para auditoria)
     imagem   url do og:image, se houver (a imagem da própria chamada)
   baixarImagem(url, destino) baixa e confere tamanho mínimo (nada de logo ou miniatura)

   Sem IA, sem chave: só fetch. Se a página não responde, a chamada NÃO entra (prazo não confirmado).
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const MESES = [
  ['janeiro', 'january', 'januar', 'janvier', 'enero'], ['fevereiro', 'february', 'februar', 'février', 'febrero'],
  ['março', 'march', 'märz', 'mars', 'marzo'], ['abril', 'april', 'april', 'avril', 'abril'], ['maio', 'may', 'mai', 'mai', 'mayo'],
  ['junho', 'june', 'juni', 'juin', 'junio'], ['julho', 'july', 'juli', 'juillet', 'julio'], ['agosto', 'august', 'august', 'août', 'agosto'],
  ['setembro', 'september', 'september', 'septembre', 'septiembre'], ['outubro', 'october', 'oktober', 'octobre', 'octubre'],
  ['novembro', 'november', 'november', 'novembre', 'noviembre'], ['dezembro', 'december', 'dezember', 'décembre', 'diciembre']
];
const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function textoDe(html) {
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').toLowerCase();
}

/* a data do prazo, em qualquer formato razoável (15/11, 15.11.2026, 15 de novembro, 15th November, November 15, 15. November) */
function acharData(texto, iso) {
  const d = +iso.slice(8), m = +iso.slice(5, 7), y = iso.slice(0, 4);
  const nomes = [...new Set(MESES[m - 1])];
  const alt = [...nomes, ...nomes.map(n => n.slice(0, 3))].map(esc).join('|');
  const padroes = [
    new RegExp('\\b0?' + d + '\\s*[/.\\-]\\s*0?' + m + '(?:\\s*[/.\\-]\\s*(?:' + y + '|' + y.slice(2) + '))?(?!\\d)'),
    new RegExp('\\b0?' + d + '\\s*(?:\\.|º|st|nd|rd|th)?\\s*(?:de\\s+|of\\s+)?(?:' + alt + ')(?![a-zà-ÿ])'),
    new RegExp('(?:' + alt + ')\\.?\\s*0?' + d + '(?:st|nd|rd|th)?(?!\\d)'),
    new RegExp(y + '-0?' + m + '-0?' + d)
  ];
  /* A data só vale como PRAZO se vem logo depois de uma palavra de prazo. "A residência acontece de 16 de
     novembro a 15 de dezembro" tem a data e não é prazo (caso real da Dasartes, 11/11/2026). */
  const CUE = /(?:até|ate|prazo|inscri[çc][õo]es?|inscrever|deadline|apply by|applications?|submissions?|due|until|closes?|closing|encerr\w*|limite|candidaturas?|bewerbung\w*|frist|bis zum|jusqu['’]au|date limite|hasta|fecha)[^.!?]{0,70}$/;
  for (const p of padroes) {
    const re = new RegExp(p.source, 'g');
    let x;
    while ((x = re.exec(texto))) {
      const antes = texto.slice(Math.max(0, x.index - 90), x.index);
      if (CUE.test(antes)) return (antes.slice(-28) + x[0]).trim();
    }
  }
  return null;
}

const ENCERRADA = /inscri[çc][õo]es\s+(?:est[ãa]o\s+)?encerradas|chamada\s+encerrada|applications?\s+(?:are\s+)?closed|call\s+(?:is\s+)?closed|deadline\s+(?:has\s+)?passed|bewerbungsphase\s+beendet|appel\s+(?:est\s+)?clos/i;
/* o que não é chamada para artista: evento, conversa, curso */
const NAO_CHAMADA = /\b(conversa|palestra|webinar|bate-papo|mesa redonda|lan[çc]amento de livro|visita guiada|oficina|curso|workshop|exposi[çc][ãa]o)\b/i;

/* Identifica o robô de forma honesta. Quem bloqueia (ex.: Res Artis) bloqueou: a chamada fica sem prazo
   confirmado e NÃO entra no post. Não trocar por UA de navegador para furar bloqueio. */
const UA = 'Mozilla/5.0 (compatible; VernissagesSP-radar)';
/* devolve { status, buf }. Tenta fetch; se a conexão falhar (ex.: Res Artis derruba HTTP/2 do fetch), tenta o curl. */
async function baixar(url, ms = 15000) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'user-agent': UA, 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' } });
    return { status: res.status, buf: Buffer.from(await res.arrayBuffer()) };
  } catch (e) {
    try {
      const { execFileSync } = require('child_process');
      const buf = execFileSync('curl', ['-sL', '--http1.1', '--compressed', '-m', String(Math.ceil(ms / 1000)), '-A', UA, '-H', 'Accept-Language: pt-BR,pt;q=0.9,en;q=0.8', '-w', '\n%{http_code}', url], { maxBuffer: 40 * 1048576, stdio: ['ignore', 'pipe', 'ignore'] });
      const i = buf.lastIndexOf(10); return { status: +buf.slice(i + 1).toString() || 0, buf: buf.slice(0, i) };
    } catch (e2) { throw e; }
  } finally { clearTimeout(to); }
}

async function confirmar(item) {
  if (NAO_CHAMADA.test(item.t || '')) return { ok: false, motivo: 'não é chamada (evento, conversa ou curso)' };
  if (!item.link || !/^https?:/.test(item.link)) return { ok: false, motivo: 'sem link' };
  let res, html;
  try { res = await baixar(item.link); html = res.buf.toString('utf8'); }
  catch (e) { return { ok: false, motivo: 'página não respondeu (' + ((e.cause && e.cause.code) || e.name) + ')' }; }
  if (!res.status || res.status >= 400) return { ok: false, motivo: 'página devolveu ' + (res.status || 'nada') };
  const texto = textoDe(html);
  const og = (html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image/i) || [])[1];
  let imagem = null;
  if (og) { try { imagem = new URL(og.replace(/&amp;/g, '&'), item.link).href; } catch (e) { imagem = null; } }
  if (ENCERRADA.test(texto)) return { ok: false, motivo: 'a página diz que está encerrada', imagem };
  const achou = acharData(texto, item.prazo);
  if (!achou) return { ok: false, motivo: 'a data do prazo (' + item.prazo + ') não aparece na página', imagem };
  /* idioma do PROGRAMA (a página), que não é o do título traduzido pelo agregador */
  const lang = ((html.match(/<html[^>]*\blang=["']?([a-zA-Z]{2})/i) || [])[1] || '').toLowerCase();
  const idioma = { pt: 'português', en: 'inglês', fr: 'francês', de: 'alemão', es: 'espanhol', it: 'italiano' }[lang] || null;
  return { ok: true, motivo: 'prazo confirmado na página', achou, imagem, idioma };
}

/* baixa a imagem da chamada e confere que presta (largura mínima, não é quase quadrada pequena de logo) */
async function baixarImagem(url, destino, sharp, minLargura = 800) {
  try {
    const res = await baixar(url, 20000);
    if (!res.status || res.status >= 400) return null;
    const buf = res.buf;
    const m = await sharp(buf).metadata();
    if (!m.width || m.width < minLargura || m.height < 400) return null;
    if (m.format === 'svg' || (m.width === m.height && m.width < 1200)) return null;
    /* logo ou banner de texto: quase todo preto ou quase todo branco. Não é imagem de arte, cai no nome do lugar. */
    const { data } = await sharp(buf).resize(64, 64, { fit: 'fill' }).flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
    let extremos = 0; for (const v of data) if (v < 40 || v > 215) extremos++;
    if (extremos / data.length > 0.88) return null;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, await sharp(buf).rotate().flatten({ background: '#ffffff' }).jpeg({ quality: 90, mozjpeg: true }).toBuffer());
    return { arquivo: destino, w: m.width, h: m.height };
  } catch (e) { return null; }
}

module.exports = { confirmar, baixarImagem, acharData, textoDe, NAO_CHAMADA };
