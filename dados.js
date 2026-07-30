/* ============================================================
   VERNISSAGES SP — ARQUIVO DE DADOS
   Edite este arquivo a cada nova divulgacao (nao mexa no index.html).
   ============================================================ */
window.DATA = (function(){
/* ================= VENUES =================
 tipo: galeria | institucional | feira  ·  ~ = endereço aproximado */
const VENUES = [
 // --- Jardins / Cerqueira César / Jardim América / Jardim Paulista (Oeste) ---
 {name:"Galeria Luisa Strina",addr:"R. Padre João Manuel, 755",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5646,lng:-46.6683,info:"Fundada em 1974, decana da arte contemporânea no Brasil. Alfredo Jaar, Cildo Meireles, Leonilson."},
 {name:"Galatea",addr:"R. Oscar Freire, 379",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5622,lng:-46.6661,info:"Dois espaços nos Jardins (Oscar Freire e Padre João Manuel). Arte brasileira moderna e contemporânea."},
 {name:"Casa Triângulo",addr:"R. Estados Unidos, 1324",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5668,lng:-46.6672,info:"Desde 1988 (Ricardo Trevisan). ~500 m² experimentais. Yuli Yamagata, Vânia Mignone."},
 {name:"Zipper Galeria",addr:"R. Estados Unidos, 1494",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5675,lng:-46.6681,info:"Desde 2010. Curadoria diversa, múltiplas mídias."},
 {name:"DAN Galeria",addr:"R. Estados Unidos, 1638",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5681,lng:-46.6712,info:"Modernismo brasileiro e concretismo; braço contemporâneo DAN Contemporânea."},
 {name:"Pinakotheke São Paulo",addr:"R. Estados Unidos, 1216",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5671,lng:-46.6653,info:"Casa histórica dedicada à arte brasileira dos séculos XX–XXI."},
 {name:"Galeria Marcelo Guarnieri",addr:"Al. Lorena, 1835",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5652,lng:-46.6672,info:"Origem em Ribeirão Preto (1985); espaço nos Jardins. Fotografia e contemporâneo."},
 {name:"Simões de Assis",addr:"Al. Lorena, 2050A",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5632,lng:-46.6691,info:"Fundada em Curitiba (1984). Abstração geométrica e contemporâneo."},
 {name:"Galeria Luis Maluf",addr:"R. Peixoto Gomide, 1887",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5660,lng:-46.6622,info:"Arte contemporânea brasileira emergente."},
 {name:"Choque Cultural",addr:"Al. Sarutaiá, 206",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5686,lng:-46.6603,info:"Referência em arte urbana, grafite e street art desde 2004."},
 {name:"Almeida & Dale",addr:"R. Caconde, 152",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5712,lng:-46.6650,info:"Uma das maiores do país; incorporou a Galeria Millan em 2025. Mercado primário e secundário."},
 {name:"Kogan Amaro",addr:"Al. Franca, 1054 ~",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5637,lng:-46.6602,info:"SP e Zurique. Contemporâneo brasileiro e internacional."},
 {name:"Verve Galeria",addr:"Al. Lorena, 1257 ~",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5670,lng:-46.6631,info:"Contemporâneo; forte presença em feiras nacionais."},
 {name:"Galeria Berenice Arvani",addr:"R. Oscar Freire, 540 ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5630,lng:-46.6672,info:"Modernos e contemporâneos brasileiros."},
 {name:"Galeria Superfície",addr:"R. Oscar Freire, 240 ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5614,lng:-46.6642,info:"Arte conceitual brasileira dos anos 1970 em diante."},
 {name:"Paulo Kuczynski Escritório de Arte",addr:"Al. Ministro Rocha Azevedo ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5633,lng:-46.6604,info:"Mercado secundário de alto nível; mostras curadas."},
 {name:"Ricardo Camargo Galeria",addr:"R. Bento de Andrade ~",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5768,lng:-46.6662,info:"Arte brasileira moderna."},
 {name:"Mônica Filgueiras Galeria",addr:"R. Bela Cintra, 1533 ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5601,lng:-46.6650,info:"Contemporâneo brasileiro desde os anos 1980."},
 {name:"Danielian São Paulo",addr:"Jardins (endereço a confirmar)",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5660,lng:-46.6645,info:"Galeria carioca com espaço recente em SP."},
 // --- Jardim Europa / Paulista ---
 {name:"Galeria Nara Roesler",addr:"Av. Europa, 655",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5719,lng:-46.6739,info:"SP, Rio e NY. Abraham Palatnik, Vik Muniz, Tomie Ohtake."},
 {name:"Luciana Brito Galeria",addr:"Av. Nove de Julho, 5162",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5758,lng:-46.6789,info:"Sede em casa modernista de Rino Levi (1958). Contemporâneo internacional."},
 {name:"Galeria Lume",addr:"R. Gumercindo Saraiva, 54 ~",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5731,lng:-46.6771,info:"Contemporâneo brasileiro e latino-americano."},
 {name:"Gomide&Co",addr:"Av. Paulista, 2644 (Ed. Rosa)",b:"Consolação",z:"Oeste",tipo:"galeria",lat:-23.5556,lng:-46.6622,info:"600 m² no corredor cultural da Paulista. Modernismo e contemporâneo."},
 // --- Pinheiros / Vila Madalena / Butantã ---
 {name:"Almeida & Dale | Millan",addr:"R. Fradique Coutinho, 1360",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5618,lng:-46.6898,info:"Espaço Fradique; a histórica Galeria Millan (1986) integrou-se à Almeida & Dale em 2025."},
 {name:"Fortes D'Aloia & Gabriel — Galeria",addr:"R. Fradique Coutinho, 1500",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5562,lng:-46.6931,info:"Ernesto Neto, Rivane Neuenschwander, Erika Verzutti. Espaço-irmão: Galpão (Barra Funda)."},
 {name:"Galeria Estação",addr:"R. Ferreira de Araújo, 625",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5641,lng:-46.6982,info:"Referência em arte popular brasileira e artistas autodidatas."},
 {name:"Central Galeria",addr:"R. Mourato Coelho ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5602,lng:-46.6890,info:"Contemporâneo emergente."},
 {name:"Galeria Raquel Arnaud",addr:"R. Fidalga, 125",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5572,lng:-46.6891,info:"Desde 1973. Construtivo e abstração: Sérgio Camargo, Carlos Zilio."},
 {name:"Galeria Dezoito",addr:"R. Simpatia, 23",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5561,lng:-46.6872,info:"Espaço da Vila Madalena com foco em paisagem e pintura contemporânea."},
 {name:"Marli Matsumoto Arte Contemporânea",addr:"Vila Madalena ~",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5542,lng:-46.6902,info:"Galeria + anexo experimental."},
 {name:"Galeria Leme",addr:"Av. Valdemar Ferreira, 130",b:"Butantã",z:"Oeste",tipo:"galeria",lat:-23.5672,lng:-46.7121,info:"Prédio brutalista de Paulo Mendes da Rocha. Latino-americanos e africanos."},
 // --- Barra Funda / Higienópolis / Vila Buarque / Centro ---
 {name:"Mendes Wood DM",addr:"R. Barra Funda, 216",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5266,lng:-46.6572,info:"SP, Bruxelas, NY, Paris. Sonia Gomes, Paulo Nazareth, Solange Pessoa."},
 {name:"Fortes D'Aloia & Gabriel — Galpão",addr:"R. James Holland, 71",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5245,lng:-46.6633,info:"Galpão industrial para mostras de grande escala."},
 {name:"Galeria Vermelho",addr:"R. Minas Gerais, 350",b:"Higienópolis",z:"Centro",tipo:"galeria",lat:-23.5541,lng:-46.6592,info:"Desde 2002. Performance, instalação e política. Verbo (mostra anual de performance)."},
 {name:"HOA Galeria",addr:"Higienópolis ~",b:"Higienópolis",z:"Centro",tipo:"galeria",lat:-23.5480,lng:-46.6560,info:"Fundada por Igi Ayedun; foco em artistas negros e periféricos."},
 {name:"Galeria Jaqueline Martins",addr:"R. Dr. Cesário Mota Jr., 443",b:"Vila Buarque",z:"Centro",tipo:"galeria",lat:-23.5452,lng:-46.6502,info:"SP e Bruxelas. Vanguardas dos anos 1970–80 e contemporâneo. Hudinilson Jr."},
 {name:"A Gentil Carioca SP",addr:"R. Barão de Itapetininga ~",b:"República",z:"Centro",tipo:"galeria",lat:-23.5445,lng:-46.6422,info:"Filial paulistana da galeria carioca fundada por Ernesto Neto, Márcio Botner e Laura Lima."},
 {name:"Sé Galeria",addr:"Centro ~",b:"Sé",z:"Centro",tipo:"galeria",lat:-23.5489,lng:-46.6388,info:"Programa experimental no centro histórico."},
 // --- Adições via Guia das Artes ---
 {name:"Baró Galeria",addr:"Santa Cecília (galpão de 1.500 m²) ~",b:"Santa Cecília",z:"Centro",tipo:"galeria",lat:-23.5362,lng:-46.6522,info:"Dirigida por Maria Baró; galpão reformado de 1.500 m². Diálogo Brasil–Espanha–América Latina."},
 {name:"A7MA Galeria",addr:"R. Harmonia, 239 ~",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5532,lng:-46.6912,info:"Arte urbana e cultura de rua na Vila Madalena."},
 {name:"Amoa Konoya Arte Indígena",addr:"R. João Moura, 1002 ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5602,lng:-46.6851,info:"Dedicada à arte dos povos indígenas do Brasil."},
 {name:"Blau Projects",addr:"R. Fradique Coutinho ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5608,lng:-46.6882,info:"Artistas emergentes e múltiplas linguagens."},
 {name:"Galeria Aura",addr:"Pinheiros (endereço a confirmar)",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5625,lng:-46.6870,info:"Entre Porto Alegre e SP; foco em projetos expositivos e feiras."},
 {name:"Adelina Galeria",addr:"Pinheiros (endereço a confirmar)",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5648,lng:-46.6920,info:"Arte contemporânea com foco em novos diálogos e pertencimento."},
 {name:"Arte Infinita",addr:"Jardim Europa (endereço a confirmar)",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5740,lng:-46.6760,info:"Fundada por Viviane Teperman em 2001; ênfase em escultura."},
 {name:"Arteedições Galeria",addr:"Jardins (endereço a confirmar)",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5655,lng:-46.6638,info:"Gravuras e edições: Hirst, Kapoor, Opie, Sonia Gomes, Leda Catunda."},
 {name:"A Casa das Artes",addr:"Itaim Bibi (endereço a confirmar)",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5820,lng:-46.6780,info:"Direção de Marta Veloso de Souza; modernos e contemporâneos."},
 // --- Itaim / Moema / Vila Mariana (Sul) ---
 {name:"Galeria Marília Razuk",addr:"R. Jerônimo da Veiga, 131",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5842,lng:-46.6752,info:"Desde 1992. Contemporâneo brasileiro."},
 {name:"Galeria Mario Cohen",addr:"R. Pedroso Alvarenga ~",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5851,lng:-46.6772,info:"Pop e contemporâneo internacional."},
 {name:"Arte 132 Galeria",addr:"Av. Juriti, 132",b:"Moema",z:"Sul",tipo:"galeria",lat:-23.6001,lng:-46.6642,info:"Casa-galeria em Moema; acervo moderno e contemporâneo."},
 {name:"Galeria Jacques Ardies",addr:"R. Morgado de Mateus, 579",b:"Vila Mariana",z:"Sul",tipo:"galeria",lat:-23.5811,lng:-46.6412,info:"Especializada em arte naïf brasileira desde 1979."},
 // --- INSTITUCIONAIS ---
 {name:"MASP",addr:"Av. Paulista, 1578",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5614,lng:-46.6559,info:"Museu de Arte de São Paulo Assis Chateaubriand + Ed. Pietro Maria Bardi (14 andares)."},
 {name:"Pinacoteca de São Paulo",addr:"Praça da Luz, 2",b:"Luz",z:"Centro",tipo:"institucional",lat:-23.5340,lng:-46.6336,info:"Pina Luz, Pina Estação e Pina Contemporânea."},
 {name:"CCBB São Paulo",addr:"R. Álvares Penteado, 112",b:"Sé",z:"Centro",tipo:"institucional",lat:-23.5470,lng:-46.6343,info:"Centro Cultural Banco do Brasil, centro histórico."},
 {name:"IMS Paulista",addr:"Av. Paulista, 2424",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5561,lng:-46.6620,info:"Instituto Moreira Salles: fotografia, cinema e literatura."},
 {name:"Itaú Cultural",addr:"Av. Paulista, 149",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5701,lng:-46.6462,info:"Programação gratuita na Paulista."},
 {name:"Centro Cultural São Paulo (CCSP)",addr:"R. Vergueiro, 1000",b:"Paraíso",z:"Centro",tipo:"institucional",lat:-23.5701,lng:-46.6402,info:"Exposições, acervo e residências."},
 {name:"Museu Judaico de São Paulo",addr:"R. Martinho Prado, 128",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5527,lng:-46.6478,info:"Junto à sinagoga Beth-El."},
 {name:"Pivô",addr:"Av. Ipiranga, 200 (Copan)",b:"República",z:"Centro",tipo:"institucional",lat:-23.5465,lng:-46.6448,info:"Plataforma sem fins lucrativos no Edifício Copan: mostras e residências."},
 {name:"Casa do Povo",addr:"R. Três Rios, 252",b:"Bom Retiro",z:"Centro",tipo:"institucional",lat:-23.5281,lng:-46.6392,info:"Centro cultural experimental no Bom Retiro."},
 {name:"MAB FAAP",addr:"R. Alagoas, 903",b:"Pacaembu",z:"Centro",tipo:"institucional",lat:-23.5426,lng:-46.6652,info:"Museu de Arte Brasileira da FAAP."},
 {name:"Instituto Tomie Ohtake",addr:"R. Coropés, 88",b:"Pinheiros",z:"Oeste",tipo:"institucional",lat:-23.5687,lng:-46.7017,info:"Torre de Ruy Ohtake na Faria Lima."},
 {name:"Sesc Pompeia",addr:"R. Clélia, 93",b:"Pompeia",z:"Oeste",tipo:"institucional",lat:-23.5273,lng:-46.6802,info:"Complexo de Lina Bo Bardi; exposições de grande porte."},
 {name:"MAM São Paulo",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5871,lng:-46.6572,info:"Museu de Arte Moderna, marquise do Ibirapuera."},
 {name:"MAC USP",addr:"Av. Pedro Álvares Cabral, 1301",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5866,lng:-46.6512,info:"Museu de Arte Contemporânea da USP, antigo Detran."},
 {name:"Museu Afro Brasil Emanoel Araujo",addr:"Parque Ibirapuera, portão 10",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5882,lng:-46.6632,info:"Pavilhão Padre Manoel da Nóbrega."},
 {name:"Oca — Pavilhão Lucas Nogueira Garcez",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5875,lng:-46.6598,info:"Pavilhão de Niemeyer para grandes mostras."},
 {name:"Fundação Bienal / Pavilhão Ciccillo Matarazzo",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5878,lng:-46.6553,info:"Sede da Bienal de São Paulo e da feira SP-Arte (abril)."},
 // --- FEIRA ---
 {name:"ARCA",addr:"Av. Manuel Bandeira, 360",b:"Vila Leopoldina",z:"Oeste",tipo:"feira",lat:-23.5232,lng:-46.7332,info:"Galpão de eventos; sede da SP-Arte Rotas."}
];

/* ================= EXPOS ================= */
const EXPOS = [
 {t:"Masao Yamamoto — individual",v:"Galeria Marcelo Guarnieri",ini:"2026-08-01",fim:"2026-09-19",d:"Fotografias em pequeno formato do mestre japonês; poética do silêncio."},
 {t:"Ígneo Piaga — Thiago Martins de Melo",v:"Almeida & Dale | Millan",ini:"2026-08-01",fim:"2026-09-12",d:"Pintura densa e mitologia amazônica no espaço Fradique."},
 {t:"Habitar a paisagem — Flavia Fabbriziani",v:"Galeria Dezoito",ini:"2026-08-05",fim:"2026-09-05",d:"Curadoria de Jurandy Valença."},
 {t:"Joan Miró: Mestre das Formas",v:"MAB FAAP",ini:"2026-08-07",fim:null,d:"Grande mostra do catalão no museu da FAAP."},
 {t:"O Lado Escuro da Lua — Alfredo Jaar",v:"Galeria Luisa Strina",ini:"2026-08-08",fim:null,d:"Novo projeto do artista chileno, Leão de Ouro de Veneza."},
 {t:"SP-Arte Rotas 2026 · 5ª edição",v:"ARCA",ini:"2026-08-26",fim:"2026-08-30",d:"~70 expositores; direção artística de Bernardo Mosqueira; foco América Latina. Dia 26 só convidados; 27–28 (13h–20h), 29 (12h–20h), 30 (12h–19h)."},
 {t:"Viver tecendo — Claudia Alarcón e Silät",v:"MASP",ini:"2026-03-06",fim:"2026-08-02",d:"Tecelagens do coletivo wichí (Argentina)."},
 {t:"Pop andino — La Chola Poblete",v:"MASP",ini:"2026-03-06",fim:"2026-08-02",d:"Primeira individual da artista argentina no Brasil."},
 {t:"O princípio do conhecimento — Santiago Yahuarcani",v:"MASP",ini:"2026-04-02",fim:"2026-08-02",d:"Pintura uitoto sobre llanchama."},
 {t:"Democracia radical — Colectivo Acciones de Arte",v:"MASP",ini:"2026-04-07",fim:"2026-08-02",d:"Ações do CADA contra a ditadura chilena."},
 {t:"Matéria e Energia — Damián Ortega",v:"MASP",ini:"2026-05-15",fim:"2026-09-13",d:"Três décadas do escultor mexicano."},
 {t:"Acervo em Transformação: Doações Recentes",v:"MASP",ini:"2026-05-15",fim:"2026-09-13",d:"Curadoria Adriano Pedrosa e equipe."},
 {t:"confluências — Carolina Caycedo",v:"MASP",ini:"2026-07-03",fim:"2026-10-04",d:"Rios, represas e resistência socioambiental."},
 {t:"Casa María Lionza — Sol Calero",v:"MASP",ini:"2026-07-03",fim:"2027-05-30",d:"Instalação de longa duração da venezuelana."},
 {t:"Knockout! — Pascale Marthine Tayou",v:"Pinacoteca de São Paulo",ini:"2026-03-07",fim:"2026-08-02",d:"Instalações do camaronês na Pina Contemporânea."},
 {t:"a mãe contempla o mar — Cristina Salgado",v:"Pinacoteca de São Paulo",ini:"2026-03-07",fim:"2026-08-02",d:"Escultura e imagem materna."},
 {t:"O que elas viram — coletiva",v:"IMS Paulista",ini:"2026-03-17",fim:"2026-08-03",d:"Fotógrafas pioneiras no acervo IMS."},
 {t:"Pele Azul — Vivian Caccuri",v:"CCBB São Paulo",ini:"2026-04-29",fim:"2026-08-03",d:"Som, mosquitos e ecologia no Espaço Anexo."},
 {t:"Plantas em Movimento — Burle Marx",v:"Museu Judaico de São Paulo",ini:"2026-04-30",fim:"2026-08-02",d:"Paisagismo e botânica em movimento."},
 {t:"Estrelas Escolhidas — Luiz Zerbini",v:"Instituto Tomie Ohtake",ini:"2026-06-26",fim:"2026-08-16",d:"~230 obras: monotipias, pinturas e instalações da última década."},
 {t:"Antes da Forma, o Encanto — Mônica Ventura",v:"Galeria Nara Roesler",ini:"2026-05-26",fim:"2026-08-01",d:"Cosmologias afro-ameríndias e geometria."},
 {t:"Fascination and Affection — coletiva",v:"Galeria Nara Roesler",ini:"2026-05-26",fim:"2026-08-01",d:"Recorte do programa da galeria."},
 {t:"Alfabeto Solare — Edival Ramosa",v:"Galatea",ini:"2026-06-09",fim:"2026-08-08",d:"Redescoberta do escultor ítalo-brasileiro."},
 {t:"Terra, cores naturais… — Tito Terapia",v:"Galatea",ini:"2026-05-12",fim:"2026-07-30",d:"Pigmentos naturais e pertencimento (espaço Padre João Manuel)."},
 {t:"Fluxos — Janet Vollebregt",v:"Galeria Luis Maluf",ini:"2026-05-16",fim:"2026-08-08",d:"Individual da artista holandesa-brasileira."},
 {t:"Almir Mavignier: Acaso Determinado",v:"DAN Galeria",ini:"2026-05-23",fim:"2026-08-15",d:"Concretismo e op art (DAN Contemporânea)."},
 {t:"Surrealismos: Arte para Além da Razão",v:"Pinakotheke São Paulo",ini:"2026-05-16",fim:"2026-08-15",d:"Curadoria Max Perlingeiro e Tadeu Chiarelli."},
 {t:"Oposições Geométricas — coletiva",v:"Paulo Kuczynski Escritório de Arte",ini:"2026-05-16",fim:"2026-08-22",d:"Geometrias em diálogo (Mavignier e outros)."},
 {t:"Água da Mata (Miguel Penha) + Gunga Guerra",v:"Zipper Galeria",ini:"2026-06-01",fim:"2026-08-01",d:"Duas mostras simultâneas; entrada gratuita."},
 {t:"A palavra errada — Rebecca Watson Horn",v:"Fortes D'Aloia & Gabriel — Galeria",ini:"2026-06-10",fim:"2026-08-01",d:"Pintura e linguagem."},
 {t:"Fugido — Anderson Borba",v:"Fortes D'Aloia & Gabriel — Galeria",ini:"2026-06-10",fim:"2026-08-01",d:"Esculturas em madeira."},
 {t:"Uma Folha Translúcida no Lugar dos Olhos — D. Steegmann Mangrané",v:"Mendes Wood DM",ini:"2026-04-07",fim:"2026-08-08",d:"Ecologia e percepção."},
 {t:"Geologia da forma — Germana Monte-Mór",v:"Galeria Leme",ini:"2026-06-25",fim:"2026-08-21",d:"Obras dos anos 90."},
 {t:"nem mais nem menos — Carlos Zilio",v:"Galeria Raquel Arnaud",ini:"2026-06-10",fim:"2026-08-22",d:"Pinturas recentes."},
 {t:"Etéreas — Chaim, Weffort, Giacomini, Belém",v:"Galeria Raquel Arnaud",ini:"2026-06-11",fim:"2026-08-22",d:"Coletiva sobre leveza e matéria."},
 {t:"Mão Amiga — José Bento",v:"A Gentil Carioca SP",ini:"2026-05-23",fim:"2026-08-01",d:"Madeira e ofício."}
];

const BAIRRO_COUNTS=[["Jardins",18],["Barra Funda",8],["Jardim Europa",7],["Pinheiros",6],
 ["Vila Madalena",3],["Itaim Bibi",3],["Cerqueira César",3],["Higienópolis",3],["Vila Buarque",3],
 ["Consolação",2],["Moema",2],["Vila Nova Conceição",2],["Butantã",1],["Pacaembu",1],["República",1],
 ["Santa Cecília",1],["Bela Vista",1],["Morumbi",1],["Sumarezinho",1]];
return { atualizado: "29/07/2026", venues: VENUES, expos: EXPOS, bairros: BAIRRO_COUNTS };
})();
