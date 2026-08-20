/* ============================================================
   VERNISSAGES SP — VALIDADOR DE dados.js

   Roda em dois lugares, com o mesmo codigo:

   1. Node / GitHub Actions ....... node check.js
      Le o dados.js da raiz, valida, imprime o relatorio e sai
      com codigo 1 se houver erro. E o que trava o push.

   2. Navegador (rotina diaria) ... antes de commitar,
      carregue este arquivo na pagina e chame:
         await VSP.validar(DATA, { fetch, hoje: "AAAA-MM-DD" })
      Serve para pegar o erro ANTES do commit, nao depois.

   Regra de ouro: o script decide, nao a boa vontade de quem edita.
   Se um erro aqui te incomodar, discuta a regra — nao contorne.
   ============================================================ */

(function (raiz) {
"use strict";

/* ---------- constantes de dominio ---------- */

var ZONAS = ["Oeste", "Centro", "Sul", "Norte", "Leste"];
var TIPOS = ["galeria", "institucional", "hibrido", "feira"];

// Caixa geografica generosa da capital. Pega coordenada trocada,
// virgula no lugar errado e endereco que foi parar em outro estado.
var SP_BBOX = { latMin: -24.05, latMax: -23.30, lngMin: -46.90, lngMax: -46.30 };

// Dias que uma mostra encerrada ainda pode ficar no arquivo.
var JANELA_ENCERRADAS = 7;

// Dias em que uma mesma galeria nao pode voltar ao bloco Em foco.
var JANELA_VARIEDADE = 7;

// Minimo de caracteres no campo d para a mostra ter o que virar legenda.
// Medido em 20/08: 20 das 57 mostras em cartaz ficavam abaixo disso, com
// coisas como "Pinturas recentes." — e era dai que vinha a repeticao do social.
var MIN_DESC = 60;

// Vocabulario proibido pelo ESTILO.md. Comparado sem acento e sem caixa.
var PROIBIDOS = [
  "imperdivel", "incrivel", "venha conferir", "nao pode faltar",
  "magia", "magico", "jornada", "unico em sao paulo",
  "experiencia unica", "surpreendente", "espetacular",
  "voce precisa", "corra para", "ultima chance"
];

// Tolerados com ressalva: viram aviso, nao erro.
var SUSPEITOS = ["imersivo", "imersiva", "unico", "unica"];

// Campos onde a voz editorial vale.
var CAMPOS_EDITORIAIS = ["d", "info", "txt"];

/* ---------- utilidades ---------- */

function semAcento(s) {
  return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function hojeSaoPaulo() {
  var p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
  return p; // AAAA-MM-DD
}

function paraBR(iso) {
  var p = iso.split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
}

function somaDias(iso, n) {
  var d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function isoValido(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  var d = new Date(s + "T12:00:00Z");
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function temEmoji(s) {
  return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(String(s));
}

function chave(t, v) { return t + "|" + v; }

/* ---------- coletor de resultado ---------- */

function Relatorio() {
  this.erros = [];
  this.avisos = [];
}
Relatorio.prototype.erro = function (codigo, msg) {
  this.erros.push({ codigo: codigo, msg: msg });
};
Relatorio.prototype.aviso = function (codigo, msg) {
  this.avisos.push({ codigo: codigo, msg: msg });
};
Relatorio.prototype.ok = function () { return this.erros.length === 0; };

/* ---------- validacao sincrona ---------- */

function validarSync(DATA, opts) {
  opts = opts || {};
  var hoje = opts.hoje || hojeSaoPaulo();
  var r = new Relatorio();

  // Checagens que dependem do calendario so travam quando a rotina do dia
  // esta sendo publicada. Num push de README numa terca qualquer elas viram
  // aviso, senao o repo fica vermelho sozinho com o passar dos dias.
  var deHojeVale = opts.exigeHoje !== false;
  function datado(codigo, msg) {
    if (deHojeVale) r.erro(codigo, msg); else r.aviso(codigo, msg + "  (aviso: rodada sem --exige-hoje)");
  }

  /* --- estrutura --- */
  if (!DATA || typeof DATA !== "object") {
    r.erro("E01", "window.DATA nao existe ou nao e objeto.");
    return r;
  }
  ["venues", "expos", "editais", "foco", "destaques", "atualizado"].forEach(function (k) {
    if (!(k in DATA)) r.erro("E02", "Chave obrigatoria ausente em window.DATA: " + k);
  });
  if (r.erros.length) return r;

  var venues = DATA.venues, expos = DATA.expos;
  var editais = DATA.editais || [], destaques = DATA.destaques || [], foco = DATA.foco;

  /* --- E03: carimbo de data --- */
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(String(DATA.atualizado))) {
    r.erro("E03", 'Campo "atualizado" fora do formato dd/mm/aaaa: ' + DATA.atualizado);
  } else if (DATA.atualizado !== paraBR(hoje)) {
    datado("E03", 'Campo "atualizado" e ' + DATA.atualizado + ", deveria ser " + paraBR(hoje) +
                  ". Se a rotina nao rodou hoje, isso e sintoma, nao detalhe.");
  }

  /* --- E04..E08: venues --- */
  var nomes = Object.create(null);
  venues.forEach(function (v, i) {
    var ref = "venue[" + i + "] " + (v.name || "(sem name)");
    if (!v.name) { r.erro("E04", ref + ": sem name."); return; }
    if (nomes[v.name]) r.erro("E04", "Venue duplicado: " + v.name);
    nomes[v.name] = true;

    if (!v.addr) r.erro("E05", ref + ": sem addr.");
    if (!v.b) r.erro("E05", ref + ": sem bairro (b).");
    if (ZONAS.indexOf(v.z) === -1) r.erro("E05", ref + ": zona invalida (" + v.z + ").");
    if (TIPOS.indexOf(v.tipo) === -1) r.erro("E05", ref + ": tipo invalido (" + v.tipo + ").");

    if (typeof v.lat !== "number" || typeof v.lng !== "number") {
      r.erro("E06", ref + ": lat/lng ausente ou nao numerico.");
    } else if (v.lat < SP_BBOX.latMin || v.lat > SP_BBOX.latMax ||
               v.lng < SP_BBOX.lngMin || v.lng > SP_BBOX.lngMax) {
      r.erro("E06", ref + ": coordenada fora da capital (" + v.lat + ", " + v.lng + ").");
    }
    if (!v.site && !v.ig) r.aviso("A01", ref + ": sem site e sem ig, impossivel checar em rodizio.");
  });

  /* --- E09..E12: expos --- */
  var vistas = Object.create(null);
  var limite = somaDias(hoje, -JANELA_ENCERRADAS);

  expos.forEach(function (e, i) {
    var ref = "expo[" + i + "] " + (e.t || "(sem titulo)");
    if (!e.t) { r.erro("E09", ref + ": sem titulo."); return; }
    if (!e.v) { r.erro("E09", ref + ": sem venue."); return; }

    if (!nomes[e.v]) {
      r.erro("E10", ref + ': venue "' + e.v + '" nao existe em venues (tem que bater exato).');
    }

    var k = chave(e.t, e.v);
    if (vistas[k]) r.erro("E11", "Expo duplicada (mesmo titulo e venue): " + k);
    vistas[k] = true;

    ["ini", "fim"].forEach(function (campo) {
      var val = e[campo];
      if (val !== null && val !== undefined && val !== "" && !isoValido(val)) {
        r.erro("E12", ref + ": " + campo + ' invalido "' + val + '" (use AAAA-MM-DD ou null).');
      }
    });
    if (isoValido(e.ini) && isoValido(e.fim) && e.fim < e.ini) {
      r.erro("E12", ref + ": fim anterior ao ini.");
    }
    if (isoValido(e.fim) && e.fim < limite) {
      datado("E13", ref + ": encerrou em " + e.fim + ", passou da janela de " +
                    JANELA_ENCERRADAS + " dias. Remova.");
    }
    if (!e.a) r.aviso("A02", ref + ": campo de artistas (a) vazio.");
    if (!e.img) r.aviso("A03", ref + ": sem imagem.");

    /* A07 — descricao curta demais para virar legenda.
     *
     * O campo d e a unica materia-prima do texto da peca. Quando ele diz so
     * "Pinturas recentes." ou "Obras dos anos 90.", nao existe redacao que
     * salve: a legenda sai igual a de ontem porque o dado e igual ao de ontem.
     * Era essa a causa da repeticao do social, nao o layout.
     *
     * O modelo esta no ESTILO.md: "48 trabalhos realizados entre 1974 e 1981,
     * no Chile sob a ditadura militar" — um numero, um periodo, um lugar. O
     * comprimento e so um proxy grosseiro disso, mas e o unico que da para
     * medir sem interpretar o texto. Nao trava publicacao: quem desempata e a
     * Fase 2, que desoprioriza a mostra na hora de escolher o destaque. */
    if (!e.d || String(e.d).trim().length < MIN_DESC) {
      r.aviso("A07", ref + ": descricao com " + (e.d ? String(e.d).trim().length : 0) +
        " caracteres, abaixo de " + MIN_DESC + ". Falta um fato conferivel (numero, periodo, material, curadoria).");
    }
  });

  /* --- E14..E19: bloco Em foco e historico --- */
  if (!foco || !foco.t || !foco.v) {
    r.erro("E14", "Bloco FOCO incompleto (precisa de t e v).");
  } else {
    var kFoco = chave(foco.t, foco.v);
    var expoFoco = expos.filter(function (e) { return chave(e.t, e.v) === kFoco; })[0];

    if (!expoFoco) {
      r.erro("E15", "FOCO aponta para " + kFoco + ", que nao existe em expos.");
    } else {
      if (!expoFoco.img) r.erro("E16", "Destaque do dia sem imagem: " + kFoco);
      if (!expoFoco.cred) r.erro("E16", "Destaque do dia sem credito (cred): " + kFoco);
      if (isoValido(expoFoco.fim) && expoFoco.fim < hoje) {
        r.erro("E16", "Destaque do dia ja encerrou em " + expoFoco.fim + ": " + kFoco);
      }
    }

    // Historico
    var porChave = Object.create(null);
    var repetidas = [];
    destaques.forEach(function (d, i) {
      if (!d || !d.d || !d.k) { r.erro("E17", "destaques[" + i + "] malformado."); return; }
      if (!isoValido(d.d)) r.erro("E17", "destaques[" + i + "]: data invalida " + d.d);
      if (porChave[d.k]) repetidas.push(d.k); else porChave[d.k] = d.d;
    });
    repetidas.forEach(function (k) {
      r.erro("E17", "Chave repetida no historico DESTAQUES: " + k);
    });

    var deHoje = destaques.filter(function (d) { return d.d === hoje; });

    if (deHoje.length === 0) {
      datado("E18", "Nao ha entrada em DESTAQUES com a data de hoje (" + hoje + "). " +
                    "Sem ela o destaque do dia nao fica travado.");
    } else if (deHoje.length > 1) {
      datado("E18", "Ha " + deHoje.length + " entradas em DESTAQUES com a data de hoje.");
    } else if (deHoje[0].k !== kFoco) {
      r.erro("E18", "Incoerencia: FOCO mostra " + kFoco +
                    " mas DESTAQUES de hoje registra " + deHoje[0].k + ".");
    }

    // Este e o erro que passou batido em 10/08/2026: o FOCO ficou dias
    // no ar sem nunca entrar no historico, entao a chave parecia inedita.
    if (!porChave[kFoco]) {
      r.erro("E19", "O que esta no FOCO (" + kFoco + ") nao consta em DESTAQUES. " +
                    "Registre o dia em que entrou no ar, senao ele pode ser reescolhido.");
    }

    // Variedade de galeria
    var corte = somaDias(hoje, -JANELA_VARIEDADE);
    destaques.forEach(function (d) {
      if (d.d >= hoje || d.d < corte) return;
      var venueAntigo = String(d.k).split("|").slice(1).join("|");
      if (venueAntigo === foco.v) {
        r.erro("E20", "Galeria " + foco.v + " esteve em foco em " + d.d +
                      ", dentro da janela de " + JANELA_VARIEDADE + " dias. Escolha outra.");
      }
    });
  }

  /* --- E21: editais vencidos --- */
  editais.forEach(function (ed, i) {
    if (!ed.prazo) return;
    if (!isoValido(ed.prazo)) {
      r.erro("E21", "edital[" + i + "]: prazo invalido " + ed.prazo);
    } else if (ed.prazo < hoje) {
      datado("E21", "edital[" + i + ' "' + ed.t + '"]: prazo venceu em ' + ed.prazo + ". Remova.");
    }
  });

  /* --- E22: voz editorial --- */
  var alvos = [];
  venues.forEach(function (v, i) { alvos.push(["venue[" + i + "] " + v.name, v]); });
  expos.forEach(function (e, i) { alvos.push(["expo[" + i + "] " + e.t, e]); });
  editais.forEach(function (e, i) { alvos.push(["edital[" + i + "] " + e.t, e]); });
  if (foco) alvos.push(["FOCO", foco]);

  alvos.forEach(function (par) {
    var ref = par[0], obj = par[1];
    CAMPOS_EDITORIAIS.forEach(function (campo) {
      var txt = obj[campo];
      if (!txt || typeof txt !== "string") return;
      var plano = semAcento(txt);

      PROIBIDOS.forEach(function (p) {
        if (plano.indexOf(p) !== -1) {
          r.erro("E22", ref + " (" + campo + '): termo proibido pelo ESTILO.md — "' + p + '".');
        }
      });
      SUSPEITOS.forEach(function (p) {
        if (new RegExp("\\b" + p + "\\b").test(plano)) {
          r.aviso("A04", ref + " (" + campo + '): "' + p + '" so vale se for descricao tecnica.');
        }
      });
      if (txt.indexOf("!") !== -1) {
        r.erro("E22", ref + " (" + campo + "): exclamacao. O texto informa, nao anima.");
      }
      if (temEmoji(txt)) {
        r.erro("E22", ref + " (" + campo + "): emoji.");
      }
    });
  });

  return r;
}

/* ---------- validacao da imagem (rede) ---------- */

/* Caminho relativo (ex.: img/obra.jpg) aponta para arquivo do proprio repo.
   No navegador o fetch resolve contra a pagina; no Node ele nao resolve e
   quebra com "Failed to parse URL". Por isso, quando o caminho e relativo e
   estamos no Node, conferimos o arquivo em disco: mesma garantia de antes
   (existe, e imagem de verdade, nao e SVG e tem peso de obra). */
function ehAbsoluta(u) {
  return /^https?:\/\//i.test(u) || String(u).indexOf("//") === 0;
}

function validarImagemLocal(rel) {
  var fs, path;
  try {
    fs = require("fs");
    path = require("path");
  } catch (e) {
    return { ok: false, motivo: "caminho relativo e sem base para resolver: " + rel };
  }
  var limpo = String(rel).split("?")[0].split("#")[0].replace(/^\.?\//, "");
  var bases = [process.cwd()];
  if (typeof __dirname !== "undefined") bases.push(__dirname);
  var alvo = null;
  for (var i = 0; i < bases.length; i++) {
    var tent = path.resolve(bases[i], limpo);
    if (fs.existsSync(tent)) { alvo = tent; break; }
  }
  if (!alvo) return { ok: false, motivo: "arquivo nao existe no repo: " + limpo };

  var buf = fs.readFileSync(alvo);
  var kb = Math.round(buf.length / 1024);
  var hex = buf.slice(0, 12).toString("hex");
  if (/\.svgz?$/i.test(limpo) || buf.slice(0, 400).toString("utf8").indexOf("<svg") !== -1) {
    return { ok: false, motivo: "SVG. Quase sempre e logo ou forma geometrica, nao a obra." };
  }
  var ehImagem =
    hex.indexOf("ffd8ff") === 0 ||
    hex.indexOf("89504e47") === 0 ||
    hex.indexOf("47494638") === 0 ||
    (hex.indexOf("52494646") === 0 && buf.slice(8, 12).toString("latin1") === "WEBP");
  if (!ehImagem) {
    return { ok: false, motivo: "arquivo nao e imagem reconhecivel (jpeg, png, gif ou webp)" };
  }
  if (buf.length < 15000) {
    return { ok: false, motivo: "so " + kb + " KB. Provavel logo, icone ou placeholder." };
  }
  return { ok: true, motivo: "arquivo local, " + kb + " KB" };
}

function validarImagem(url, doFetch) {
  if (!ehAbsoluta(url) && typeof require !== "undefined") {
    return Promise.resolve(validarImagemLocal(url));
  }
  return doFetch(url, { method: "GET", redirect: "follow" }).then(function (res) {
    if (!res.ok) return { ok: false, motivo: "HTTP " + res.status };
    var ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.indexOf("image/") !== 0) {
      return { ok: false, motivo: "content-type nao e imagem (" + (ct || "vazio") + ")" };
    }
    if (ct.indexOf("svg") !== -1) {
      return { ok: false, motivo: "SVG. Quase sempre e logo ou forma geometrica, nao a obra." };
    }
    return res.arrayBuffer().then(function (buf) {
      var kb = Math.round(buf.byteLength / 1024);
      if (buf.byteLength < 15000) {
        return { ok: false, motivo: "so " + kb + " KB. Provavel logo, icone ou placeholder." };
      }
      return { ok: true, motivo: ct + ", " + kb + " KB" };
    });
  }).catch(function (e) {
    return { ok: false, motivo: "falhou ao carregar: " + (e && e.message ? e.message : e) };
  });
}

/* ---------- entrada assincrona (sync + rede) ---------- */

function validar(DATA, opts) {
  opts = opts || {};
  var r = validarSync(DATA, opts);
  var doFetch = opts.fetch || (typeof fetch !== "undefined" ? fetch : null);

  if (opts.rede === false || !doFetch || !DATA || !DATA.foco) {
    if (opts.rede === false) r.aviso("A05", "Checagem de imagem pulada (--sem-rede).");
    return Promise.resolve(r);
  }

  var kFoco = chave(DATA.foco.t, DATA.foco.v);
  var e = (DATA.expos || []).filter(function (x) { return chave(x.t, x.v) === kFoco; })[0];
  if (!e || !e.img) return Promise.resolve(r);

  return validarImagem(e.img, doFetch).then(function (res) {
    if (!res.ok) {
      r.erro("E23", "Imagem do destaque do dia nao serve: " + res.motivo + "\n        " + e.img);
    } else {
      r.aviso("A06", "Imagem do destaque conferida: " + res.motivo);
    }
    return r;
  });
}

/* ---------- relatorio legivel ---------- */

function formatar(r, DATA, hoje) {
  var L = [];
  L.push("VERNISSAGES SP — validacao de dados.js  (" + (hoje || hojeSaoPaulo()) + ")");
  L.push("");
  if (DATA) {
    L.push("  venues " + DATA.venues.length +
           " · expos " + DATA.expos.length +
           " · editais " + (DATA.editais || []).length +
           " · destaques " + (DATA.destaques || []).length +
           " · atualizado " + DATA.atualizado);
    if (DATA.foco) L.push("  em foco: " + DATA.foco.t + " — " + DATA.foco.v);
    L.push("");
  }
  if (r.erros.length) {
    L.push("ERROS (" + r.erros.length + ") — travam a publicacao");
    r.erros.forEach(function (e) { L.push("  [" + e.codigo + "] " + e.msg); });
    L.push("");
  }
  if (r.avisos.length) {
    L.push("AVISOS (" + r.avisos.length + ") — nao travam, mas olhe");
    r.avisos.forEach(function (a) { L.push("  [" + a.codigo + "] " + a.msg); });
    L.push("");
  }
  L.push(r.ok() ? "OK. Pode commitar." : "REPROVADO. Corrija antes de commitar.");
  return L.join("\n");
}

/* ---------- exportacao ---------- */

var API = {
  validar: validar,
  validarSync: validarSync,
  validarImagem: validarImagem,
  formatar: formatar,
  hojeSaoPaulo: hojeSaoPaulo,
  JANELA_ENCERRADAS: JANELA_ENCERRADAS,
  JANELA_VARIEDADE: JANELA_VARIEDADE
};

if (typeof module !== "undefined" && module.exports) module.exports = API;
raiz.VSP = API;

/* ---------- execucao direta no Node ---------- */

if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  var fs = require("fs");
  var path = require("path");
  var vm = require("vm");

  var argv = process.argv.slice(2);
  function flag(nome, padrao) {
    var achou = argv.filter(function (a) { return a.indexOf("--" + nome + "=") === 0; })[0];
    return achou ? achou.split("=").slice(1).join("=") : padrao;
  }

  var arquivo = path.resolve(flag("data", "dados.js"));
  var hoje = flag("date", hojeSaoPaulo());
  var semRede = argv.indexOf("--sem-rede") !== -1;
  var exigeHoje = argv.indexOf("--exige-hoje") !== -1;

  var codigo;
  try {
    codigo = fs.readFileSync(arquivo, "utf8");
  } catch (e) {
    console.error("Nao consegui ler " + arquivo + ": " + e.message);
    process.exit(1);
  }

  var sandbox = { window: {}, console: console };
  try {
    vm.runInNewContext(codigo, sandbox, { filename: arquivo, timeout: 5000 });
  } catch (e) {
    console.error("dados.js nao executa: " + e.message);
    process.exit(1);
  }

  var DATA = sandbox.window.DATA;

  validar(DATA, { hoje: hoje, rede: !semRede, exigeHoje: exigeHoje }).then(function (r) {
    console.log(formatar(r, DATA, hoje));
    process.exit(r.ok() ? 0 : 1);
  }).catch(function (e) {
    console.error("Validador quebrou: " + (e && e.stack ? e.stack : e));
    process.exit(1);
  });
}

})(typeof globalThis !== "undefined" ? globalThis : this);
