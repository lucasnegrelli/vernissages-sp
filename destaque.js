"use strict";

/* destaque.js — a fase D1 do OPERACAO.md, sem ninguem no volante.
 *
 * Ate 25/08/2026 a escolha do destaque do dia era feita pela tarefa agendada
 * do desktop. Ela nunca precisou de julgamento: a regra da Parte 1 e um
 * filtro seguido de uma ordenacao, e foi executada como script improvisado em
 * toda rodada. O que quebrava nao era a decisao, era o ambiente — em 25/08 a
 * rotina escolheu certo, validou, commitou e nao conseguiu dar `git push`,
 * porque o sandbox onde ela roda nao tem credencial de GitHub.
 *
 * O site tem um plano B para o dia em que ninguem publica: o renderFoco() do
 * index.html escolhe sozinho. So que ele ordena por "abre hoje" ANTES de olhar
 * imagem, entao no dia 25 ele premiou justamente a mostra que esta regra aqui
 * barra — a sem `img` e sem `cred` — e o destaque foi ao ar com capa gerada.
 * Enquanto os dois criterios discordarem, o site so acerta se esta rotina
 * rodar. Ela roda todo dia; o plano B e que precisa ser raro.
 *
 * Uso:
 *   node destaque.js            escolhe e reescreve o dados.js
 *   node destaque.js --seco     mostra a escolha e nao encosta no arquivo
 *   node destaque.js --dia AAAA-MM-DD    finge outra data (teste)
 *
 * Saida: 0 escreveu · 2 sem candidata (nao e erro) · 1 erro.
 *
 * NAO valida nada. Quem valida e o check.js, que roda depois e manda mais que
 * este arquivo. Se os dois discordarem, o check.js esta certo. */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

/* O mesmo medidor que o check.js e o descobrir-imagens.js usam. Se a regua da
   imagem mudar, muda para os tres de uma vez. */
const medidor = require("./medir-imagem.js");

const RAIZ = __dirname;
const ARQ = path.join(RAIZ, "dados.js");

/* Dias que uma galeria fica de molho antes de poder voltar ao topo.
   Mesmo numero do JANELA_VARIEDADE do check.js — se um mudar, muda o outro,
   senao esta rotina escolhe o que o validador reprova. */
const JANELA_VARIEDADE = 7;

/* Dias que uma mostra encerrada ainda fica no arquivo. Espelha o
   JANELA_ENCERRADAS do check.js pelo mesmo motivo. */
const JANELA_ENCERRADAS = 7;

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const FAIXAS = ["abre hoje", "abertura na semana", "abertura no mes", "em cartaz"];

/* ---------- utilidades ---------- */

function hojeSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

function arg(nome, padrao) {
  const i = process.argv.indexOf(nome);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : padrao;
}

function somaDias(iso, n) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function distanciaDias(a, b) {
  return Math.abs(Date.parse(a + "T12:00:00Z") - Date.parse(b + "T12:00:00Z")) / 864e5;
}

function porExtenso(iso) {
  const p = String(iso).split("-");
  return Number(p[2]) + " de " + MESES[Number(p[1]) - 1];
}

function paraBR(iso) {
  const p = String(iso).split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
}

const chave = e => e.t + "|" + e.v;

/* Mede a imagem da mostra, se ela for arquivo do repo.
 *
 * Imagem remota (http) nao e medida aqui: baixar 60 imagens toda madrugada
 * para desempatar seria caro e frageis. O espelhar-imagens.js ja traz tudo
 * para img/ no push seguinte, entao remota e estado de passagem. Enquanto
 * esta, entra como grau intermediario para nao ser premiada nem punida. */
const GRAU = { ok: 3, curta: 2, desconhecido: 1, cartao: 0 };

function medirDaMostra(e) {
  const src = String(e.img || "");
  if (!src) return { grau: -1, largura: 0 };
  if (/^https?:/i.test(src)) return { grau: GRAU.desconhecido, largura: 0 };
  try {
    const dim = medidor.medirArquivo(path.join(RAIZ, src));
    const diag = medidor.diagnosticar(dim);
    return {
      grau: GRAU[diag.grau] == null ? GRAU.desconhecido : GRAU[diag.grau],
      largura: dim && dim.w ? dim.w : 0
    };
  } catch (_) {
    return { grau: GRAU.desconhecido, largura: 0 };
  }
}

/* O venue de uma chave "titulo|venue". O nome do venue pode conter barra
   ("Almeida & Dale | Millan"), entao o titulo e so o primeiro pedaco e o resto
   inteiro e o venue. Mesma conta do check.js. */
function venueDaChave(k) {
  return String(k).split("|").slice(1).join("|");
}

/* A casa por tras do espaco — usado SO para avisar, nunca para barrar.
 *
 * A regra da Parte 1 fala em "galeria", mas o dados.js guarda ESPACO:
 * "Mendes Wood DM" e "Mendes Wood DM — Casa Iramaia" sao duas entradas. Cortar
 * no travessao agrupa exatamente dois casos nos 91 venues — Fortes D'Aloia &
 * Gabriel (Galeria + Galpao) e Mendes Wood DM (+ Casa Iramaia) — e os dois sao
 * a mesma casa; os outros travessoes sao expansao de sigla ("MIS — Museu da
 * Imagem e do Som") e nao colidem com ninguem.
 *
 * Cheguei a usar isso como filtro. Estava errado, por dois motivos.
 *
 * Primeiro, o check.js compara venue literal no E20, e o OPERACAO.md diz que
 * em caso de conflito o check.js ganha de tudo por ser executavel. Um filtro
 * mais rigido que o validador faz esta rotina recusar em silencio o que o
 * validador aprovaria — e ninguem descobre, porque o resultado e so uma
 * escolha diferente, nunca um erro.
 *
 * Segundo, a pratica ja respondeu: em 25/08 o destaque foi "Cantaria", na
 * Mendes Wood DM, um dia depois da Casa Iramaia. A normalizacao teria barrado.
 *
 * Fica como observacao no relatorio: se a casa repetir em dois dias, o --seco
 * diz, e a decisao continua sendo de quem le. */
function galeriaBase(nome) {
  return String(nome).split("—")[0].trim();
}

function carregar() {
  const codigo = fs.readFileSync(ARQ, "utf8");
  const caixa = { window: {}, console: console };
  vm.runInNewContext(codigo, caixa, { filename: "dados.js", timeout: 5000 });
  return caixa.window.DATA;
}

/* ---------- a escolha ----------
 *
 * Ordem da Parte 1, na letra:
 *   1. entre as nao encerradas, quem tem `ini` = hoje;
 *   2. senao, a abertura mais proxima, para tras ou para frente;
 *   3. fora: chave ja usada em `destaques`, a mostra no `foco` agora, e toda
 *      mostra cuja galeria esteve em foco nos ultimos 7 dias;
 *   4. so e elegivel quem tem `img` E `cred`;
 *   5. quem o check.js acusaria com A07 (descricao < 60) vai para o fim.
 *
 * O runbook para aqui, e em 25/08 sobraram cinco mostras empatadas em tudo
 * isso. Os tres criterios abaixo do A07 sao desempate que eu inventei naquele
 * dia e que agora fica escrito — a vantagem de virar codigo e que a duvida se
 * resolve uma vez, em vez de ser redecidida toda noite. Reordene a vontade:
 * o efeito de cada um esta no relatorio do --seco. */
/* JANELA — o quanto a abertura ainda pesa.
 *
 * A versao anterior ordenava por distancia exata da abertura, e com isso a
 * data decidia tudo: cinco mostras que abriram no mesmo dia empatavam, e o
 * desempate virava criterio de consolacao. Ficou incoerente — a mostra mais
 * interessante da semana perdia para outra que abriu no mesmo dia por causa de
 * um tamanho de arquivo.
 *
 * Agora a data agrupa em vez de ordenar. Quem abre hoje continua na frente
 * (isso e noticia), depois quem abriu ou abre na mesma semana, depois no mes.
 * Dentro do grupo, quem manda e a NOTA — que e a pergunta certa: entre estas,
 * qual rende mais a home hoje. */
function faixa(l) {
  if (l.abreHoje) return 0;
  if (l.distancia <= 7) return 1;
  if (l.distancia <= 30) return 2;
  return 3;
}

/* NOTA EDITORIAL — o que faz uma mostra valer a maior imagem do site.
 *
 * Tudo aqui sai do dados.js. Nada consulta rede, nada estima publico, nada
 * mede repercussao: "mais midiatica" nao existe como campo, e inventar um
 * indice de hype a partir de nada seria exatamente o tipo de dado inventado
 * que o runbook proibe. O que da pra medir com honestidade e o que o proprio
 * arquivo ja sabe, e da pra medir bastante.
 *
 * Os pesos sao chute calibrado, nao lei. Mexer neles e a forma certa de
 * discordar do resultado — o --seco imprime a nota aberta, criterio por
 * criterio, entao da pra ver quem ganhou de quem e por quantos pontos. */
const PESOS = [

  /* DESPEDIDA. O maior servico ao leitor: mostra que fecha logo e informacao
     que ele perde se nao vir agora. Uma que fica seis meses pode esperar. */
  ["fecha logo", l => {
    if (!l.e.fim) return [0, "sem data de fim"];
    const d = distanciaDias(l.e.fim, l.hoje);
    if (l.e.fim < l.hoje) return [0, "encerrada"];
    if (d <= 10) return [34, "fecha em " + d + " dia(s)"];
    if (d <= 21) return [22, "fecha em " + d + " dias"];
    if (d <= 45) return [12, "fecha em " + d + " dias"];
    if (d <= 90) return [4, "fecha em " + d + " dias"];
    return [0, "longa (" + d + " dias)"];
  }],

  /* RODIZIO. A casa que nao aparece ha mais tempo entra na frente. E o mesmo
     principio do radar.js: com 91 casas no mapa, sem isso a home vira vitrine
     das cinco galerias que mandam release bonito. A janela de 7 dias do E20 ja
     barrou as recentes; aqui a escala continua. */
  ["casa fora de cartaz", l => {
    if (l.diasDesdeCasa === null) return [30, "nunca foi destaque"];
    const d = l.diasDesdeCasa;
    if (d >= 60) return [24, "ultima vez ha " + d + " dias"];
    if (d >= 30) return [16, "ultima vez ha " + d + " dias"];
    if (d >= 14) return [8, "ultima vez ha " + d + " dias"];
    return [2, "ultima vez ha " + d + " dias"];
  }],

  /* ASSINATURA. Mostra com nome e curadoria assinada rende texto e rende
     busca; coletiva anonima nao rende nem legenda. */
  ["assinatura", l => {
    let p = 0; const p_ = [];
    const artistas = String(l.e.a || "").split(",").map(s => s.trim()).filter(Boolean);
    if (artistas.length === 1) { p += 14; p_.push("individual"); }
    else if (artistas.length >= 2) { p += 8; p_.push(artistas.length + " artistas nomeados"); }
    else p_.push("sem artista no campo a");
    if (/curadoria|curador/i.test(l.e.d || "")) { p += 8; p_.push("curadoria assinada"); }
    return [p, p_.join(", ")];
  }],

  /* FATO CONFERIVEL. A escala continua do A07: abaixo de 60 caracteres o
     check.js ja reclama, e acima disso mais fato costuma ser mais materia. */
  ["fato no campo d", l => {
    const n = l.tamDesc;
    if (n >= 160) return [12, n + " caracteres"];
    if (n >= 110) return [8, n + " caracteres"];
    if (n >= 60) return [4, n + " caracteres"];
    return [0, "A07: so " + n + " caracteres"];
  }],

  /* IMAGEM. Deixou de ser o criterio que decide e virou o que era pra ser: um
     ajuste. Reproducao grande ajuda, vista de sala atrapalha (o Em foco quer a
     obra, nao a parede), medida de card de rede social e sinal de que ninguem
     procurou direito. Flyer nao pontua negativo — flyer desqualifica, e isso
     esta nas barreiras, nao aqui. */
  ["imagem", l => {
    const p_ = [];
    let p = 0;
    if (l.grauImg === 3) { p += 10; p_.push(l.largura + " px, aguenta recorte"); }
    else if (l.grauImg === 2) { p += 4; p_.push(l.largura + " px, so capa"); }
    else if (l.grauImg === 0) { p -= 10; p_.push("medida de card de rede social"); }
    else p_.push("dimensao desconhecida");
    /* Penalidade maior que o bonus de tamanho, de proposito: uma parede
       fotografada em 2400 px nao vale mais que uma obra em 1400. Antes eram
       -6 e uma vista gigante empatava com reproducao pequena. */
    if (l.e.vista) { p -= 14; p_.push("vista de sala, nao a obra"); }
    return [p, p_.join(", ")];
  }],

  /* CASA. Independente e hibrido ganham um empurrao porque nao tem imprensa
     propria: MASP e Pinacoteca saem no jornal com ou sem a gente. E o mesmo
     criterio que a varredura ja usa pra priorizar perfil de Instagram. */
  ["tipo de casa", l => {
    const t = (l.venue && l.venue.tipo) || "";
    if (t === "hibrido") return [8, "espaco hibrido"];
    if (t === "feira") return [6, "feira, tem data curta"];
    if (t === "galeria") return [3, "galeria"];
    if (t === "institucional") return [0, "instituicao, ja tem publico proprio"];
    return [0, "tipo nao declarado"];
  }]
];

function notaDe(l) {
  let total = 0;
  const linhas = [];
  for (const [nome, fn] of PESOS) {
    const [p, porque] = fn(l);
    total += p;
    linhas.push({ nome, p, porque });
  }
  return { total, linhas };
}

function escolher(D, hoje) {
  const corte = somaDias(hoje, -JANELA_VARIEDADE);
  const destaques = D.destaques || [];

  /* Queimada e a mostra com registro em QUALQUER outro dia, inclusive dia
     futuro — mesma TRAVA 2 do renderFoco(). Entrada de hoje nao conta, senao a
     rotina nao seria idempotente: rodar duas vezes no mesmo dia barraria a
     propria escolha da primeira vez. */
  const venuePorNome = {};
  (D.venues || []).forEach(v => { venuePorNome[v.name] = v; });

  const jaUsadas = new Set(destaques.filter(d => d.d !== hoje).map(d => d.k));
  const focoChave = D.foco && D.foco.t ? chave(D.foco) : null;

  /* Venue literal, igual ao E20 do check.js e a TRAVA 3 do renderFoco().
     Janela aberta no fim: o dia de hoje nao queima a propria casa. */
  const casasQuentes = new Set(
    destaques
      .filter(d => d.d >= corte && d.d < hoje)
      .map(d => venueDaChave(d.k))
  );

  const linhas = (D.expos || []).map((e, i) => {
    const barreiras = [];
    if (jaUsadas.has(chave(e))) barreiras.push("ja foi destaque");
    if (focoChave && chave(e) === focoChave) barreiras.push("esta no foco agora");
    if (casasQuentes.has(e.v)) barreiras.push("venue em foco nos ultimos " + JANELA_VARIEDADE + " dias");
    if (!e.img) barreiras.push("sem imagem");
    if (!e.cred) barreiras.push("sem credito");

    /* Flyer nao e reproducao, e cartaz com o nome da mostra impresso. Nenhuma
       medida de arquivo pega: o do Coletivo Poiesis tem 1200x821 e 124 KB e
       passa em tudo. Quem pega e o olho de quem abriu, e `cartaz: true` e o
       registro disso — irmao do `vista: true`, mesmo motivo. Vista de sala so
       perde ponto; flyer esta fora, porque nao mostra obra nenhuma. */
    if (e.cartaz) barreiras.push("cartaz/flyer, nao reproducao");

    /* Nao barra: so anota que a casa e a mesma de um espaco recente. */
    const irma = [...casasQuentes].filter(q => q !== e.v && galeriaBase(q) === galeriaBase(e.v))[0];
    const img = barreiras.length ? { grau: -1, largura: 0 } : medirDaMostra(e);

    /* Dias desde a ultima vez que esta casa foi destaque. null = nunca. */
    const passagens = destaques
      .filter(d => venueDaChave(d.k) === e.v && d.d < hoje)
      .map(d => d.d)
      .sort();
    const diasDesdeCasa = passagens.length
      ? Math.round(distanciaDias(passagens[passagens.length - 1], hoje))
      : null;

    return {
      i, e, hoje, diasDesdeCasa,
      venue: venuePorNome[e.v] || null,
      encerrada: !!(e.fim && e.fim < hoje),
      abreHoje: e.ini === hoje,
      distancia: e.ini ? distanciaDias(e.ini, hoje) : 1e9,
      a07: String(e.d || "").trim().length < 60,
      tamDesc: String(e.d || "").trim().length,
      grauImg: img.grau,
      largura: img.largura,
      irma,
      barreiras
    };
  });

  const vivas = linhas.filter(l => !l.encerrada);
  const elegiveis = vivas.filter(l => l.barreiras.length === 0);

  elegiveis.forEach(l => {
    l.faixa = faixa(l);
    const n = notaDe(l);
    l.nota = n.total;
    l.notaLinhas = n.linhas;
  });

  elegiveis.sort((a, b) =>
    (a.faixa - b.faixa) ||        // abre hoje, depois a semana, depois o mes
    (b.nota - a.nota) ||          // dentro do grupo, a nota editorial manda
    (a.i - b.i)                   // e por ultimo a ordem do arquivo, so pra nao sortear
  );

  return { elegiveis, vivas, corte, casasQuentes };
}

/* ---------- escrita no dados.js ----------
 *
 * Textual de proposito. O dados.js e escrito a mao, uma mostra por linha, com
 * comentarios que explicam decisao editorial; serializar de volta a partir do
 * objeto apagaria tudo isso e produziria um diff ilegivel todo dia. Aqui cada
 * operacao mexe nas linhas que precisa e deixa o resto intacto. */

function acharLinhaDoRegistro(linhas, t, v) {
  const alvoT = 't:"' + t + '"';
  const alvoV = v ? 'v:"' + v + '"' : null;
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].indexOf(alvoT) === -1) continue;
    if (alvoV && linhas[i].indexOf(alvoV) === -1) continue;
    return i;
  }
  return -1;
}

/* O texto do bloco FOCO.
 *
 * Vale menos do que parece: com publi:false o renderFoco() do index.html
 * ignora o FOCO e remonta o cartao a partir da expo, usando o campo `d` como
 * texto. Este txt so vai ao ar em conteudo patrocinado. Mesmo assim tem que
 * estar certo, porque o check.js cobra o bloco (E14..E20) e porque um dia
 * alguem le. Montado so com o que ja esta confirmado no dados.js: nada aqui
 * inventa data, autoria ou credito. */
function textoDoFoco(e) {
  const partes = [String(e.d || "").trim()];
  const jaFalaDeData = /abertura|até|ate /i.test(e.d || "");
  if (!jaFalaDeData && e.ini) {
    partes.push(e.fim
      ? "Abertura em " + porExtenso(e.ini) + ", até " + porExtenso(e.fim) + "."
      : "Abertura em " + porExtenso(e.ini) + ".");
  }
  return partes.join(" ").replace(/\s+/g, " ").trim();
}

function reescrever(D, escolhido, hoje) {
  const e = escolhido.e;
  const bruto = fs.readFileSync(ARQ, "utf8");
  const fimDeLinha = bruto.indexOf("\r\n") > -1 ? "\r\n" : "\n";
  let linhas = bruto.split(/\r?\n/);
  const feito = [];

  const venue = (D.venues || []).filter(v => v.name === e.v)[0] || {};

  /* --- FOCO --- */
  const ini = linhas.findIndex(l => /^\s*const FOCO\s*=\s*\{/.test(l));
  if (ini === -1) throw new Error("nao achei o bloco FOCO no dados.js");
  let fim = -1;
  for (let i = ini; i < linhas.length; i++) {
    if (/^\s*\};\s*$/.test(linhas[i])) { fim = i; break; }
  }
  if (fim === -1) throw new Error("bloco FOCO sem fechamento no dados.js");

  const cita = s => JSON.stringify(String(s == null ? "" : s));
  const blocoFoco = [
    " const FOCO = {",
    "  t: " + cita(e.t) + ",",
    "  v: " + cita(e.v) + ",",
    "  quem: " + cita(e.a || "") + ",",
    "  txt: " + cita(textoDoFoco(e)) + ",",
    "  link: " + cita(venue.site || "") + ",",
    "  publi: false",
    "};"
  ];
  linhas.splice(ini, fim - ini + 1, ...blocoFoco);
  feito.push("FOCO reescrito para " + e.t);

  /* --- DESTAQUES: entrada de hoje na primeira posicao --- */
  const abre = linhas.findIndex(l => /^\s*const DESTAQUES\s*=\s*\[/.test(l));
  if (abre === -1) throw new Error("nao achei o bloco DESTAQUES no dados.js");
  linhas.splice(abre + 1, 0,
    '  {d:"' + hoje + '", k:' + cita(chave(e)) + "},");
  feito.push("DESTAQUES ganhou a entrada de " + hoje);

  /* --- limpeza: mostras encerradas ha mais de JANELA_ENCERRADAS dias --- */
  const corteFim = somaDias(hoje, -JANELA_ENCERRADAS);
  const velhas = (D.expos || []).filter(x => x.fim && x.fim < corteFim);
  for (const x of velhas) {
    const li = acharLinhaDoRegistro(linhas, x.t, x.v);
    if (li > -1) {
      linhas.splice(li, 1);
      feito.push("removida (encerrou em " + x.fim + "): " + x.t);
    }
  }

  /* --- limpeza: editais vencidos --- */
  const vencidos = (D.editais || []).filter(x => x.prazo && x.prazo < hoje);
  for (const x of vencidos) {
    const li = acharLinhaDoRegistro(linhas, x.t, null);
    if (li > -1) {
      linhas.splice(li, 1);
      feito.push("edital vencido removido (prazo " + x.prazo + "): " + x.t);
    }
  }

  /* --- atualizado --- */
  let trocou = false;
  linhas = linhas.map(l => {
    if (trocou) return l;
    const novo = l.replace(/atualizado:\s*"\d{2}\/\d{2}\/\d{4}"/,
      'atualizado: "' + paraBR(hoje) + '"');
    if (novo !== l) { trocou = true; return novo; }
    return l;
  });
  if (!trocou) throw new Error("nao achei o campo atualizado no dados.js");
  feito.push("atualizado = " + paraBR(hoje));

  fs.writeFileSync(ARQ, linhas.join(fimDeLinha), "utf8");
  return feito;
}

/* ---------- relatorio ---------- */

function main() {
  const seco = process.argv.indexOf("--seco") > -1;
  const hoje = arg("--dia", hojeSaoPaulo());

  if (!/^\d{4}-\d{2}-\d{2}$/.test(hoje)) {
    console.error("data invalida: " + hoje);
    return 1;
  }

  const D = carregar();

  /* Ja rodou hoje?
   *
   * Numa tarefa de cron isso acontece de verdade: re-run manual depois de um
   * push rejeitado, dois gatilhos no mesmo dia, alguem clicando
   * workflow_dispatch. Sem esta saida o script inseriria uma segunda entrada
   * com a data de hoje e o check.js reprovaria com E18 ("Ha 2 entradas em
   * DESTAQUES com a data de hoje") — ou seja, a rotina quebraria a base
   * tentando consertar uma coisa que ja estava feita.
   *
   * Escrever so quando ha o que escrever tambem e o que faz o workflow poder
   * usar `git diff --quiet` como criterio de commit. */
  const deHoje = (D.destaques || []).filter(d => d.d === hoje);
  if (deHoje.length === 1 && D.foco && chave(D.foco) === deHoje[0].k) {
    console.log("VERNISSAGES SP — destaque do dia  (" + hoje + ")");
    console.log("");
    console.log("JA FEITO. " + D.foco.t + " — " + D.foco.v);
    console.log("DESTAQUES ja tem a entrada de hoje e o FOCO aponta para ela.");
    console.log("Nada a escrever.");
    return 0;
  }

  const r = escolher(D, hoje);

  console.log("VERNISSAGES SP — destaque do dia  (" + hoje + ")");
  console.log("");
  console.log("  em cartaz " + r.vivas.length +
    " · elegiveis " + r.elegiveis.length +
    " · venues de molho " + r.casasQuentes.size +
    " (desde " + r.corte + ")");
  if (D.foco) console.log("  foco atual: " + D.foco.t + " — " + D.foco.v);
  console.log("");

  if (!r.elegiveis.length) {
    /* Regra da Parte 1: mantem o foco, nao commita, e diz quem foi barrado
       por falta de imagem — que e quase sempre o motivo real. */
    const semImagem = r.vivas.filter(l =>
      l.barreiras.indexOf("sem imagem") > -1 || l.barreiras.indexOf("sem credito") > -1);
    console.log("SEM CANDIDATA. O foco fica como esta e nada e commitado.");
    console.log("");
    console.log("Barradas por falta de imagem ou credito (" + semImagem.length + "):");
    semImagem.slice(0, 20).forEach(l =>
      console.log("  - " + l.e.t + " — " + l.e.v + "  [" + l.barreiras.join(", ") + "]"));
    if (semImagem.length > 20) console.log("  ... e mais " + (semImagem.length - 20) + ".");
    return 2;
  }

  const ganhou = r.elegiveis[0];
  console.log("ESCOLHIDA: " + ganhou.e.t);
  console.log("  venue: " + ganhou.e.v);
  if (ganhou.irma) {
    console.log("  NOTA: mesma casa que \"" + ganhou.irma + "\", que esteve em foco nos ultimos " +
      JANELA_VARIEDADE + " dias. O E20 compara venue literal e aprova; se voce quer que");
    console.log("        conte como repeticao, a regra tem que mudar no check.js primeiro.");
  }
  console.log("  ini: " + ganhou.e.ini + (ganhou.abreHoje ? "  (abre hoje)" : "  (" + ganhou.distancia + " dia(s) de distancia)"));
  console.log("  img: " + ganhou.e.img + (ganhou.largura ? "  (" + ganhou.largura + " px de largura)" : ""));
  console.log("  cred: " + ganhou.e.cred);
  console.log("");
  console.log("  NOTA " + ganhou.nota + "  (faixa " + ganhou.faixa + ": " + FAIXAS[ganhou.faixa] + ")");
  ganhou.notaLinhas.forEach(x =>
    console.log("    " + (x.p >= 0 ? "+" : "") + String(x.p).padStart(3) + "  " +
      x.nome.padEnd(21) + x.porque));
  if (ganhou.e.vista) console.log("  ATENCAO: marcada `vista: true` — a capa e a parede, nao a obra.");
  if (ganhou.a07) console.log("  ATENCAO: A07, descricao com " + ganhou.tamDesc + " caracteres. Todas as elegiveis estao assim; e divida de varredura.");
  console.log("");

  if (r.elegiveis.length > 1) {
    console.log("Proximas na fila:");
    r.elegiveis.slice(1, 6).forEach(l =>
      console.log("  nota " + String(l.nota).padStart(3) + "  f" + l.faixa + "  " +
        l.e.t + " — " + l.e.v + (l.e.vista ? "  [vista]" : "")));
    console.log("");
  }

  if (seco) {
    console.log("--seco: nada foi escrito.");
    return 0;
  }

  const feito = reescrever(D, ganhou, hoje);
  feito.forEach(l => console.log("  " + l));
  console.log("");
  console.log("dados.js reescrito. Agora rode o check.js — ele e quem aprova.");
  return 0;
}

if (require.main === module) {
  try {
    process.exit(main());
  } catch (err) {
    console.error("FALHOU: " + (err && err.message ? err.message : String(err)));
    process.exit(1);
  }
}

module.exports = { escolher, galeriaBase, textoDoFoco, hojeSaoPaulo };
