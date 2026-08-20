/* Testes do check.js. Rode com: node check.test.js
   Cada caso quebra o dado de um jeito e espera um codigo de erro especifico.
   Se um caso passar sem o erro esperado, o validador tem buraco. */

var VSP = require("./check.js");

var HOJE = "2026-08-10";

function base() {
  return {
    atualizado: "10/08/2026",
    venues: [
      { name: "Galeria Aura", addr: "Rua X, 1", b: "Jardim Paulista", z: "Oeste",
        tipo: "galeria", lat: -23.56, lng: -46.66, site: "https://aura.art.br" },
      { name: "Galeria Luisa Strina", addr: "Rua Y, 2", b: "Cerqueira Cesar", z: "Oeste",
        tipo: "galeria", lat: -23.56, lng: -46.66, ig: "galerialuisastrina" }
    ],
    expos: [
      { t: "Bauci", a: "Erica Magalhaes", v: "Galeria Aura",
        ini: "2026-08-08", fim: "2026-09-23", d: "Esculturas de porcelana e concreto.",
        img: "https://exemplo.test/obra.jpg", cred: "Foto: Flavio Freire" },
      { t: "O Lado Escuro da Lua", a: "Alfredo Jaar", v: "Galeria Luisa Strina",
        ini: "2026-08-08", fim: "2026-09-19", d: "Trabalhos dos anos 1970 e 1980.",
        img: "https://exemplo.test/jaar.jpg", cred: "Cortesia da galeria" }
    ],
    editais: [{ t: "Residencia", prazo: "2026-08-30", d: "Bolsa de um mes." }],
    foco: { t: "Bauci", v: "Galeria Aura", quem: "Erica Magalhaes",
            txt: "Esculturas recentes.", publi: false },
    destaques: [
      { d: "2026-08-10", k: "Bauci|Galeria Aura" },
      { d: "2026-08-01", k: "O Lado Escuro da Lua|Galeria Luisa Strina" }
    ],
    contato: {}, bairros: []
  };
}

var casos = [
  ["limpo passa", function (D) { return D; }, null],

  ["E03 atualizado velho", function (D) { D.atualizado = "06/08/2026"; return D; }, "E03"],

  ["E05 zona invalida", function (D) { D.venues[0].z = "Nordeste"; return D; }, "E05"],
  ["E05 tipo invalido", function (D) { D.venues[0].tipo = "museu"; return D; }, "E05"],
  ["E06 coordenada no Rio", function (D) { D.venues[0].lat = -22.9; D.venues[0].lng = -43.2; return D; }, "E06"],

  ["E10 venue orfao", function (D) { D.expos[0].v = "Galeria Aurea"; return D; }, "E10"],
  ["E11 expo duplicada", function (D) { D.expos.push(JSON.parse(JSON.stringify(D.expos[0]))); return D; }, "E11"],
  ["E12 data invalida", function (D) { D.expos[1].ini = "08/08/2026"; return D; }, "E12"],
  ["E12 fim antes do ini", function (D) { D.expos[1].fim = "2026-07-01"; return D; }, "E12"],
  ["E13 encerrada ha muito", function (D) { D.expos[1].fim = "2026-08-01"; return D; }, "E13"],

  ["E15 foco fantasma", function (D) { D.foco.t = "Mostra que nao existe"; return D; }, "E15"],
  ["E16 destaque sem imagem", function (D) { D.expos[0].img = ""; return D; }, "E16"],
  ["E16 destaque sem credito", function (D) { D.expos[0].cred = ""; return D; }, "E16"],

  ["E18 sem entrada de hoje", function (D) { D.destaques[0].d = "2026-08-09"; return D; }, "E18"],
  ["E18 foco diverge do historico", function (D) {
      D.destaques[0].k = "O Lado Escuro da Lua|Galeria Luisa Strina"; return D; }, "E18"],

  // O bug real de 10/08/2026: o que estava no ar nunca tinha sido registrado
  // no historico, entao a chave parecia inedita e podia ser reescolhida.
  ["E19 foco no ar sem registro", function (D) {
      D.foco = { t: "O Lado Escuro da Lua", v: "Galeria Luisa Strina", txt: "x" };
      D.destaques = [{ d: "2026-08-10", k: "Bauci|Galeria Aura" }];
      return D; }, "E19"],

  ["datado vira aviso sem exigeHoje", function (D) { D.atualizado = "06/08/2026"; return D; }, "SEM_ERRO_DATADO"],

  ["E20 mesma galeria na janela", function (D) {
      D.foco = { t: "O Lado Escuro da Lua", v: "Galeria Luisa Strina", txt: "x" };
      D.destaques = [
        { d: "2026-08-10", k: "O Lado Escuro da Lua|Galeria Luisa Strina" },
        { d: "2026-08-06", k: "Outra Mostra|Galeria Luisa Strina" }
      ];
      return D; }, "E20"],

  ["E17 chave repetida", function (D) {
      D.destaques.push({ d: "2026-07-20", k: "Bauci|Galeria Aura" }); return D; }, "E17"],

  ["E21 edital vencido", function (D) { D.editais[0].prazo = "2026-08-01"; return D; }, "E21"],

  ["E22 adjetivo comercial", function (D) { D.expos[0].d = "Mostra imperdivel na cidade."; return D; }, "E22"],
  ["E22 exclamacao", function (D) { D.foco.txt = "Abriu ontem!"; return D; }, "E22"],
  ["E22 emoji", function (D) { D.expos[0].d = "Esculturas de porcelana \u{1F3A8}"; return D; }, "E22"],

  /* A07 e aviso, nao erro: descricao curta nao trava publicacao, so tira a
     mostra da frente na hora de escolher destaque. Os dois casos andam juntos
     de proposito — o segundo garante que o limiar nao vira ruido em cima de
     descricao boa. */
  ["A07 descricao curta demais",
    function (D) { D.expos[0].d = "Pinturas recentes."; return D; }, "AVISO:A07"],
  ["A07 nao acusa descricao com fato concreto",
    function (D) {
      D.expos.forEach(function (e) {
        e.d = "Reune 48 trabalhos realizados entre 1974 e 1981, com curadoria de Ana Souza.";
      });
      return D; }, "SEM_AVISO:A07"]
];

var falhas = 0;
casos.forEach(function (c) {
  var nome = c[0], mutar = c[1], esperado = c[2];
  var D = mutar(base());
  var r = VSP.validarSync(D, { hoje: HOJE });
  var codigos = r.erros.map(function (e) { return e.codigo; });

  var avisosCod = r.avisos.map(function (a) { return a.codigo; });

  var passou;
  if (esperado === null) {
    passou = r.erros.length === 0;
  } else if (esperado.indexOf("AVISO:") === 0) {
    passou = avisosCod.indexOf(esperado.slice(6)) !== -1;
  } else if (esperado.indexOf("SEM_AVISO:") === 0) {
    passou = avisosCod.indexOf(esperado.slice(10)) === -1;
  } else if (esperado === "SEM_ERRO_DATADO") {
    var brando = VSP.validarSync(D, { hoje: HOJE, exigeHoje: false });
    passou = codigos.indexOf("E03") !== -1 &&
             brando.erros.map(function (e) { return e.codigo; }).indexOf("E03") === -1;
  } else {
    passou = codigos.indexOf(esperado) !== -1;
  }

  if (!passou) {
    falhas++;
    console.log("FALHOU  " + nome +
      "\n        esperava " + (esperado || "nenhum erro") +
      ", veio [" + codigos.join(", ") + "]");
    r.erros.forEach(function (e) { console.log("          " + e.codigo + " " + e.msg); });
  } else {
    console.log("ok      " + nome + (esperado ? "  -> " + esperado : ""));
  }
});

console.log("");
console.log(falhas === 0
  ? "Todos os " + casos.length + " casos passaram."
  : falhas + " de " + casos.length + " casos falharam.");
process.exit(falhas === 0 ? 0 : 1);
