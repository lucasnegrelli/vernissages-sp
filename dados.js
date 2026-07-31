/* ============================================================
   VERNISSAGES SP — ARQUIVO DE DADOS
   Edite este arquivo a cada nova divulgacao (nao mexa no index.html).
   ============================================================ */
window.DATA = (function(){
/* ================= VENUES =================
 tipo: galeria | institucional | feira  ·  ~ = endereço aproximado */
const VENUES = [
 // --- Jardins / Cerqueira César / Jardim América / Jardim Paulista (Oeste) ---
 {name:"Galeria Luisa Strina",ig:"galerialuisastrina",site:"https://www.galerialuisastrina.com.br",addr:"R. Padre João Manuel, 755",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5646,lng:-46.6683,info:"Fundada em 1974, decana da arte contemporânea no Brasil. Alfredo Jaar, Cildo Meireles, Leonilson."},
 {name:"Galatea",site:"https://galatea.art",addr:"R. Oscar Freire, 379",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5622,lng:-46.6661,info:"Dois espaços nos Jardins (Oscar Freire e Padre João Manuel). Arte brasileira moderna e contemporânea."},
 {name:"Casa Triângulo",ig:"casatriangulo",site:"https://www.casatriangulo.com",addr:"R. Estados Unidos, 1324",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5668,lng:-46.6672,info:"Desde 1988 (Ricardo Trevisan). ~500 m² experimentais. Yuli Yamagata, Vânia Mignone."},
 {name:"Zipper Galeria",ig:"zippergaleria",site:"https://www.zippergaleria.com.br",addr:"R. Estados Unidos, 1494",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5675,lng:-46.6681,info:"Desde 2010. Curadoria diversa, múltiplas mídias."},
 {name:"DAN Galeria",ig:"dangaleria",site:"https://www.dangaleria.com.br",addr:"R. Estados Unidos, 1638",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5681,lng:-46.6712,info:"Modernismo brasileiro e concretismo; braço contemporâneo DAN Contemporânea."},
 {name:"Pinakotheke São Paulo",site:"https://www.pinakotheke.com.br",addr:"R. Estados Unidos, 1216",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5671,lng:-46.6653,info:"Casa histórica dedicada à arte brasileira dos séculos XX–XXI."},
 {name:"Galeria Marcelo Guarnieri",ig:"galeriamarceloguarnieri",site:"https://www.galeriamarceloguarnieri.com.br",addr:"Al. Lorena, 1835",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5652,lng:-46.6672,info:"Origem em Ribeirão Preto (1985); espaço nos Jardins. Fotografia e contemporâneo."},
 {name:"Simões de Assis",ig:"simoesdeassis",site:"https://simoesdeassis.com",addr:"Al. Lorena, 2050A",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5632,lng:-46.6691,info:"Fundada em Curitiba (1984). Abstração geométrica e contemporâneo."},
 {name:"Galeria Luis Maluf",addr:"R. Peixoto Gomide, 1887",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5660,lng:-46.6622,info:"Arte contemporânea brasileira emergente."},
 {name:"Choque Cultural",ig:"choquecultural",site:"http://choquecultural.com.br",addr:"Al. Sarutaiá, 206",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5686,lng:-46.6603,info:"Referência em arte urbana, grafite e street art desde 2004."},
 {name:"Almeida & Dale",ig:"almeidaedale",site:"https://www.almeidaedale.com.br",addr:"R. Caconde, 152",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5712,lng:-46.6650,info:"Uma das maiores do país; incorporou a Galeria Millan em 2025. Mercado primário e secundário."},
 {name:"Kogan Amaro",site:"https://www.koganamaro.com",addr:"Al. Franca, 1054 ~",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5637,lng:-46.6602,info:"SP e Zurique. Contemporâneo brasileiro e internacional."},
 {name:"Verve Galeria",addr:"Al. Lorena, 1257 ~",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5670,lng:-46.6631,info:"Contemporâneo; forte presença em feiras nacionais."},
 {name:"Galeria Berenice Arvani",addr:"R. Oscar Freire, 540 ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5630,lng:-46.6672,info:"Modernos e contemporâneos brasileiros."},
 {name:"Galeria Superfície",ig:"galeriasuperficie",site:"https://www.galeriasuperficie.com.br",addr:"R. Oscar Freire, 240 ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5614,lng:-46.6642,info:"Arte conceitual brasileira dos anos 1970 em diante."},
 {name:"Paulo Kuczynski Escritório de Arte",addr:"Al. Ministro Rocha Azevedo ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5633,lng:-46.6604,info:"Mercado secundário de alto nível; mostras curadas."},
 {name:"Ricardo Camargo Galeria",addr:"R. Bento de Andrade ~",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5768,lng:-46.6662,info:"Arte brasileira moderna."},
 {name:"Mônica Filgueiras Galeria",addr:"R. Bela Cintra, 1533 ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5601,lng:-46.6650,info:"Contemporâneo brasileiro desde os anos 1980."},
 {name:"Danielian São Paulo",addr:"Jardins (endereço a confirmar)",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5660,lng:-46.6645,info:"Galeria carioca com espaço recente em SP."},
 // --- Jardim Europa / Paulista ---
 {name:"Galeria Nara Roesler",ig:"galerianararoesler",site:"https://nararoesler.art",addr:"Av. Europa, 655",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5719,lng:-46.6739,info:"SP, Rio e NY. Abraham Palatnik, Vik Muniz, Tomie Ohtake."},
 {name:"Luciana Brito Galeria",ig:"lucianabritogaleria",site:"https://lucianabritogaleria.com.br",addr:"Av. Nove de Julho, 5162",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5758,lng:-46.6789,info:"Sede em casa modernista de Rino Levi (1958). Contemporâneo internacional."},
 {name:"Galeria Lume",ig:"galerialume",site:"https://www.galerialume.com",addr:"R. Gumercindo Saraiva, 54 ~",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5731,lng:-46.6771,info:"Contemporâneo brasileiro e latino-americano."},
 {name:"Gomide&Co",ig:"gomideco",site:"https://gomide.co",addr:"Av. Paulista, 2644 (Ed. Rosa)",b:"Consolação",z:"Oeste",tipo:"galeria",lat:-23.5556,lng:-46.6622,info:"600 m² no corredor cultural da Paulista. Modernismo e contemporâneo."},
 // --- Pinheiros / Vila Madalena / Butantã ---
 {name:"Almeida & Dale | Millan",ig:"galeriamillan",site:"https://millan.art",addr:"R. Fradique Coutinho, 1360",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5618,lng:-46.6898,info:"Espaço Fradique; a histórica Galeria Millan (1986) integrou-se à Almeida & Dale em 2025."},
 {name:"Fortes D'Aloia & Gabriel — Galeria",ig:"fortesdaloiagabriel",site:"https://fdag.com.br",addr:"R. Fradique Coutinho, 1500",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5562,lng:-46.6931,info:"Ernesto Neto, Rivane Neuenschwander, Erika Verzutti. Espaço-irmão: Galpão (Barra Funda)."},
 {name:"Galeria Estação",ig:"galeriaestacao",site:"https://www.galeriaestacao.com.br",addr:"R. Ferreira de Araújo, 625",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5641,lng:-46.6982,info:"Referência em arte popular brasileira e artistas autodidatas."},
 {name:"Central Galeria",ig:"centralgaleria",site:"https://www.centralgaleria.com",addr:"R. Mourato Coelho ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5602,lng:-46.6890,info:"Contemporâneo emergente."},
 {name:"Casa de Cultura do Parque",addr:"Av. Prof. Fonseca Rodrigues, 1300",b:"Alto de Pinheiros",z:"Oeste",tipo:"institucional",lat:-23.5477,lng:-46.7135,ing:{g:true},info:"Centro cultural em Alto de Pinheiros; ciclos expositivos em parceria com o ICCo."},
 {name:"Galeria Raquel Arnaud",ig:"galeriaraquelarnaud",site:"https://www.raquelarnaud.com",addr:"R. Fidalga, 125",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5572,lng:-46.6891,info:"Desde 1973. Construtivo e abstração: Sérgio Camargo, Carlos Zilio."},
 {name:"Galeria Dezoito",site:"https://galeriadezoito.com",addr:"R. Simpatia, 23",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5561,lng:-46.6872,info:"Espaço da Vila Madalena com foco em paisagem e pintura contemporânea."},
 {name:"Marli Matsumoto Arte Contemporânea",addr:"Vila Madalena ~",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5542,lng:-46.6902,info:"Galeria + anexo experimental."},
 {name:"Galeria Leme",ig:"galerialeme",site:"https://galerialeme.com",addr:"Av. Valdemar Ferreira, 130",b:"Butantã",z:"Oeste",tipo:"galeria",lat:-23.5672,lng:-46.7121,info:"Prédio brutalista de Paulo Mendes da Rocha. Latino-americanos e africanos."},
 // --- Barra Funda / Higienópolis / Vila Buarque / Centro ---
 {name:"Mendes Wood DM",ig:"mendeswooddm",site:"https://mendeswooddm.com",addr:"R. Barra Funda, 216",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5266,lng:-46.6572,info:"SP, Bruxelas, NY, Paris. Sonia Gomes, Paulo Nazareth, Solange Pessoa."},
 {name:"Fortes D'Aloia & Gabriel — Galpão",ig:"fortesdaloiagabriel",site:"https://fdag.com.br",addr:"R. James Holland, 71",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5245,lng:-46.6633,info:"Galpão industrial para mostras de grande escala."},
 {name:"Galeria Vermelho",ig:"galeriavermelho",site:"https://galeriavermelho.com.br",addr:"R. Minas Gerais, 350",b:"Higienópolis",z:"Centro",tipo:"galeria",lat:-23.5541,lng:-46.6592,info:"Desde 2002. Performance, instalação e política. Verbo (mostra anual de performance)."},
 {name:"HOA Galeria",ig:"hoagaleria",addr:"Higienópolis ~",b:"Higienópolis",z:"Centro",tipo:"galeria",lat:-23.5480,lng:-46.6560,info:"Fundada por Igi Ayedun; foco em artistas negros e periféricos."},
 {name:"Galeria Jaqueline Martins",ig:"galeriajaquelinemartins",site:"https://www.galeriajaquelinemartins.com.br",addr:"R. Dr. Cesário Mota Jr., 443",b:"Vila Buarque",z:"Centro",tipo:"galeria",lat:-23.5452,lng:-46.6502,info:"SP e Bruxelas. Vanguardas dos anos 1970–80 e contemporâneo. Hudinilson Jr."},
 {name:"A Gentil Carioca SP",ig:"agentilcarioca",site:"https://agentilcarioca.com.br",addr:"R. Barão de Itapetininga ~",b:"República",z:"Centro",tipo:"galeria",lat:-23.5445,lng:-46.6422,info:"Filial paulistana da galeria carioca fundada por Ernesto Neto, Márcio Botner e Laura Lima."},
 {name:"Sé Galeria",addr:"Centro ~",b:"Sé",z:"Centro",tipo:"galeria",lat:-23.5489,lng:-46.6388,info:"Programa experimental no centro histórico."},
 // --- Adições via Guia das Artes ---
 {name:"Baró Galeria",ig:"barogaleria",site:"https://barogaleria.com",addr:"Santa Cecília (galpão de 1.500 m²) ~",b:"Santa Cecília",z:"Centro",tipo:"galeria",lat:-23.5362,lng:-46.6522,info:"Dirigida por Maria Baró; galpão reformado de 1.500 m². Diálogo Brasil–Espanha–América Latina."},
 {name:"A7MA Galeria",addr:"R. Harmonia, 239 ~",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5532,lng:-46.6912,info:"Arte urbana e cultura de rua na Vila Madalena."},
 {name:"Amoa Konoya Arte Indígena",ig:"amoakonoya",addr:"R. João Moura, 1002 ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5602,lng:-46.6851,info:"Dedicada à arte dos povos indígenas do Brasil."},
 {name:"Blau Projects",ig:"blauprojects",site:"https://www.blauprojects.com",addr:"R. Fradique Coutinho ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5608,lng:-46.6882,info:"Artistas emergentes e múltiplas linguagens."},
 {name:"Galeria Aura",addr:"Pinheiros (endereço a confirmar)",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5625,lng:-46.6870,info:"Entre Porto Alegre e SP; foco em projetos expositivos e feiras."},
 {name:"Adelina Galeria",addr:"Pinheiros (endereço a confirmar)",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5648,lng:-46.6920,info:"Arte contemporânea com foco em novos diálogos e pertencimento."},
 {name:"Arte Infinita",addr:"Jardim Europa (endereço a confirmar)",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5740,lng:-46.6760,info:"Fundada por Viviane Teperman em 2001; ênfase em escultura."},
 {name:"Arteedições Galeria",addr:"Jardins (endereço a confirmar)",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5655,lng:-46.6638,info:"Gravuras e edições: Hirst, Kapoor, Opie, Sonia Gomes, Leda Catunda."},
 {name:"A Casa das Artes",addr:"Itaim Bibi (endereço a confirmar)",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5820,lng:-46.6780,info:"Direção de Marta Veloso de Souza; modernos e contemporâneos."},
 // --- Itaim / Moema / Vila Mariana (Sul) ---
 {name:"Galeria Marília Razuk",ig:"galeriamariliarazuk",site:"https://www.galeriamariliarazuk.com.br",addr:"R. Jerônimo da Veiga, 131",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5842,lng:-46.6752,info:"Desde 1992. Contemporâneo brasileiro."},
 {name:"Galeria Mario Cohen",addr:"R. Pedroso Alvarenga ~",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5851,lng:-46.6772,info:"Pop e contemporâneo internacional."},
 {name:"Arte 132 Galeria",ig:"arte132galeria",site:"https://arte132.com.br",addr:"Av. Juriti, 132",b:"Moema",z:"Sul",tipo:"galeria",lat:-23.6001,lng:-46.6642,info:"Casa-galeria em Moema; acervo moderno e contemporâneo."},
 {name:"Galeria Jacques Ardies",site:"https://www.ardies.com",addr:"R. Morgado de Mateus, 579",b:"Vila Mariana",z:"Sul",tipo:"galeria",lat:-23.5811,lng:-46.6412,info:"Especializada em arte naïf brasileira desde 1979."},
 // --- INSTITUCIONAIS ---
 {name:"MASP",ig:"masp",site:"https://masp.org.br",addr:"Av. Paulista, 1578",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5614,lng:-46.6559,ing:{i:85,m:42,free:"terças o dia todo (Nubank) e sextas das 18h às 21h (B3)",fonte:"masp.org.br/visite"},info:"Museu de Arte de São Paulo Assis Chateaubriand + Ed. Pietro Maria Bardi (14 andares)."},
 {name:"Pinacoteca de São Paulo",ig:"pinasp",site:"https://pinacoteca.org.br",addr:"Praça da Luz, 2",b:"Luz",z:"Centro",tipo:"institucional",lat:-23.5340,lng:-46.6336,ing:{i:40,m:20,free:"sábados e no 2º domingo de cada mês",obs:"+R$ 2 de taxa online; ingresso vale os três prédios",fonte:"pinacoteca.org.br"},info:"Pina Luz, Pina Estação e Pina Contemporânea."},
 {name:"CCBB São Paulo",ig:"ccbbsp",site:"https://ccbb.com.br",addr:"R. Álvares Penteado, 112",b:"Sé",z:"Centro",tipo:"institucional",lat:-23.5470,lng:-46.6343,ing:{g:true,obs:"retirada de ingresso no site do BB ou na bilheteria"},info:"Centro Cultural Banco do Brasil, centro histórico."},
 {name:"IMS Paulista",ig:"imoreirasalles",site:"https://ims.com.br",addr:"Av. Paulista, 2424",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5561,lng:-46.6620,ing:{g:true},info:"Instituto Moreira Salles: fotografia, cinema e literatura."},
 {name:"Itaú Cultural",ig:"itaucultural",site:"https://www.itaucultural.org.br",addr:"Av. Paulista, 149",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5701,lng:-46.6462,ing:{g:true},info:"Programação gratuita na Paulista."},
 {name:"Centro Cultural São Paulo (CCSP)",site:"https://centrocultural.sp.gov.br",addr:"R. Vergueiro, 1000",b:"Paraíso",z:"Centro",tipo:"institucional",lat:-23.5701,lng:-46.6402,ing:{g:true},info:"Exposições, acervo e residências."},
 {name:"Museu Judaico de São Paulo",ig:"museujudaicosp",site:"https://museujudaico.org.br",addr:"R. Martinho Prado, 128",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5527,lng:-46.6478,ing:{i:20,m:10,free:"sábados",fonte:"museujudaicosp.org.br"},info:"Junto à sinagoga Beth-El."},
 {name:"Pivô",site:"https://www.pivo.org.br",addr:"Av. Ipiranga, 200 (Copan)",b:"República",z:"Centro",tipo:"institucional",lat:-23.5465,lng:-46.6448,ing:{g:true},info:"Plataforma sem fins lucrativos no Edifício Copan: mostras e residências."},
 {name:"Casa do Povo",ig:"casadopovo",site:"https://casadopovo.org.br",addr:"R. Três Rios, 252",b:"Bom Retiro",z:"Centro",tipo:"institucional",lat:-23.5281,lng:-46.6392,ing:{g:true},info:"Centro cultural experimental no Bom Retiro."},
 {name:"MAB FAAP",site:"https://www.faap.br/museu",addr:"R. Alagoas, 903",b:"Pacaembu",z:"Centro",tipo:"institucional",lat:-23.5426,lng:-46.6652,ing:{g:true},info:"Museu de Arte Brasileira da FAAP."},
 {name:"Instituto Tomie Ohtake",ig:"institutotomieohtake",site:"https://www.institutotomieohtake.org.br",addr:"R. Coropés, 88",b:"Pinheiros",z:"Oeste",tipo:"institucional",lat:-23.5687,lng:-46.7017,ing:{g:true},info:"Torre de Ruy Ohtake na Faria Lima."},
 {name:"Sesc Pompeia",ig:"sescpompeia",site:"https://www.sescsp.org.br/unidades/sesc-pompeia",addr:"R. Clélia, 93",b:"Pompeia",z:"Oeste",tipo:"institucional",lat:-23.5273,lng:-46.6802,ing:{g:true,obs:"exposições gratuitas; alguns espetáculos são pagos"},info:"Complexo de Lina Bo Bardi; exposições de grande porte."},
 {name:"MAM São Paulo",ig:"mamsaopaulo",site:"https://mam.org.br",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5871,lng:-46.6572,ing:{conf:true,obs:"sede fechada para reforma da marquise desde 2024"},info:"Museu de Arte Moderna. Sede no Ibirapuera fechada desde 2024 para a reforma da marquise; programação segue em instituições parceiras."},
 {name:"MAC USP",site:"https://www.mac.usp.br",addr:"Av. Pedro Álvares Cabral, 1301",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5866,lng:-46.6512,ing:{g:true},info:"Museu de Arte Contemporânea da USP, antigo Detran."},
 {name:"Museu Afro Brasil Emanoel Araujo",ig:"museuafrobrasil",site:"https://museuafrobrasil.org.br",addr:"Parque Ibirapuera, portão 10",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5882,lng:-46.6632,ing:{i:15,m:7.5,free:"quartas-feiras",fonte:"museuafrobrasil.org.br"},info:"Pavilhão Padre Manoel da Nóbrega."},
 {name:"Oca — Pavilhão Lucas Nogueira Garcez",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5875,lng:-46.6598,ing:{conf:true,obs:"varia conforme a mostra"},info:"Pavilhão de Niemeyer para grandes mostras."},
 {name:"Fundação Bienal / Pavilhão Ciccillo Matarazzo",ig:"bienalsaopaulo",site:"https://bienal.org.br",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5878,lng:-46.6553,ing:{conf:true,obs:"Bienal é gratuita; demais eventos variam"},info:"Sede da Bienal de São Paulo e da feira SP-Arte (abril)."},
 // --- FEIRA ---
 {name:"ARCA",ig:"sp_arte",site:"https://www.sp-arte.com",addr:"Av. Manuel Bandeira, 360",b:"Vila Leopoldina",z:"Oeste",tipo:"feira",lat:-23.5232,lng:-46.7332,ing:{conf:true,obs:"feira com ingresso pago; confira valores na SP-Arte"},info:"Galpão de eventos; sede da SP-Arte Rotas."}
];

/* ================= EXPOS ================= */
const EXPOS = [
 {t:"Verso: na encruzilhada da revolta — Ravioli e Ussami",a:"Frederico Ravioli, Gabriel Ussami",v:"Galeria Vermelho",ini:"2026-07-30",fim:"2026-08-01",d:"Abertura 30/07, 19h–22h, com DJ sets de Cashu e Regis. Dez pinturas sobre cartazes de ponto de ônibus; texto de Caio Bonifácio."},
 {t:"Omẽ Mahsã – Seres invisíveis — Daiara Tukano",a:"Daiara Tukano",v:"Almeida & Dale | Millan",ini:"2026-07-04",fim:"2026-08-01",d:"Cerca de 20 pinturas inéditas sobre seres ligados ao ar na cosmologia Yepá Mahsã."},
 {t:"Inverno dentro do bosque — coletiva",v:"Luciana Brito Galeria",ini:"2026-07-04",fim:"2026-08-08",d:"Coletiva de inverno na casa modernista de Rino Levi."},
 {t:"Quarto — coletiva",v:"Galeria Marília Razuk",ini:"2026-05-09",fim:"2026-08-08",d:"No Anexo, com Cristina Tolovi e Luana Fortes: o quarto como campo de projeção subjetiva."},
 {t:"Rajada encarnada — coletiva",v:"Casa de Cultura do Parque",ini:"2026-07-25",fim:"2026-10-25",d:"II Ciclo Expositivo em parceria com o ICCo. Quarta a domingo, 11h–18h."},
 {t:"Política da superfície — coletiva",v:"Casa de Cultura do Parque",ini:"2026-07-25",fim:"2026-10-25",d:"II Ciclo Expositivo em parceria com o ICCo. Quarta a domingo, 11h–18h."},
 {t:"Masao Yamamoto — individual",a:"Masao Yamamoto",v:"Galeria Marcelo Guarnieri",ini:"2026-08-01",fim:"2026-09-19",d:"Fotografias em pequeno formato do mestre japonês; poética do silêncio."},
 {t:"Ígneo Piaga — Thiago Martins de Melo",a:"Thiago Martins de Melo",v:"Almeida & Dale | Millan",ini:"2026-08-01",fim:"2026-09-12",d:"Pintura densa e mitologia amazônica no espaço Fradique."},
 {t:"Habitar a paisagem — Flavia Fabbriziani",a:"Flavia Fabbriziani",v:"Galeria Dezoito",ini:"2026-08-05",fim:"2026-09-05",d:"Curadoria de Jurandy Valença."},
 {t:"Joan Miró: Mestre das Formas",a:"Joan Miró",v:"MAB FAAP",ini:"2026-08-07",fim:null,d:"Grande mostra do catalão no museu da FAAP."},
 {t:"O Lado Escuro da Lua — Alfredo Jaar",a:"Alfredo Jaar",v:"Galeria Luisa Strina",ini:"2026-08-08",fim:null,d:"Novo projeto do artista chileno, Leão de Ouro de Veneza."},
 {t:"SP-Arte Rotas 2026 · 5ª edição",v:"ARCA",ini:"2026-08-26",fim:"2026-08-30",d:"~70 expositores; direção artística de Bernardo Mosqueira; foco América Latina. Dia 26 só convidados; 27–28 (13h–20h), 29 (12h–20h), 30 (12h–19h)."},
 {t:"Viver tecendo — Claudia Alarcón e Silät",a:"Claudia Alarcón",v:"MASP",ini:"2026-03-06",fim:"2026-08-02",d:"Tecelagens do coletivo wichí (Argentina)."},
 {t:"Pop andino — La Chola Poblete",a:"La Chola Poblete",v:"MASP",ini:"2026-03-06",fim:"2026-08-02",d:"Primeira individual da artista argentina no Brasil."},
 {t:"O princípio do conhecimento — Santiago Yahuarcani",a:"Santiago Yahuarcani",v:"MASP",ini:"2026-04-02",fim:"2026-08-02",d:"Pintura uitoto sobre llanchama."},
 {t:"Democracia radical — Colectivo Acciones de Arte",a:"Colectivo Acciones de Arte (CADA)",v:"MASP",ini:"2026-04-07",fim:"2026-08-02",d:"Ações do CADA contra a ditadura chilena."},
 {t:"Matéria e Energia — Damián Ortega",a:"Damián Ortega",v:"MASP",ini:"2026-05-15",fim:"2026-09-13",d:"Três décadas do escultor mexicano."},
 {t:"Acervo em Transformação: Doações Recentes",v:"MASP",ini:"2026-05-15",fim:"2026-09-13",d:"Curadoria Adriano Pedrosa e equipe."},
 {t:"confluências — Carolina Caycedo",a:"Carolina Caycedo",v:"MASP",ini:"2026-07-03",fim:"2026-10-04",d:"Rios, represas e resistência socioambiental."},
 {t:"Casa María Lionza — Sol Calero",a:"Sol Calero",v:"MASP",ini:"2026-07-03",fim:"2027-05-30",d:"Instalação de longa duração da venezuelana."},
 {t:"Knockout! — Pascale Marthine Tayou",a:"Pascale Marthine Tayou",v:"Pinacoteca de São Paulo",ini:"2026-03-07",fim:"2026-08-02",d:"Instalações do camaronês na Pina Contemporânea."},
 {t:"a mãe contempla o mar — Cristina Salgado",a:"Cristina Salgado",v:"Pinacoteca de São Paulo",ini:"2026-03-07",fim:"2026-08-02",d:"Escultura e imagem materna."},
 {t:"O que elas viram — coletiva",v:"IMS Paulista",ini:"2026-03-17",fim:"2026-08-03",d:"Fotógrafas pioneiras no acervo IMS."},
 {t:"Pele Azul — Vivian Caccuri",a:"Vivian Caccuri",v:"CCBB São Paulo",ini:"2026-04-29",fim:"2026-08-03",d:"Som, mosquitos e ecologia no Espaço Anexo."},
 {t:"Plantas em Movimento — Burle Marx",a:"Roberto Burle Marx",v:"Museu Judaico de São Paulo",ini:"2026-04-30",fim:"2026-08-02",d:"Paisagismo e botânica em movimento."},
 {t:"Estrelas Escolhidas — Luiz Zerbini",a:"Luiz Zerbini",v:"Instituto Tomie Ohtake",ini:"2026-06-26",fim:"2026-08-16",d:"~230 obras: monotipias, pinturas e instalações da última década."},
 {t:"Antes da Forma, o Encanto — Mônica Ventura",a:"Mônica Ventura",v:"Galeria Nara Roesler",ini:"2026-05-26",fim:"2026-08-08",d:"Cosmologias afro-ameríndias e geometria."},
 {t:"Fascination and Affection — coletiva",v:"Galeria Nara Roesler",ini:"2026-05-26",fim:"2026-08-08",d:"Recorte do programa da galeria."},
 {t:"Alfabeto Solare — Edival Ramosa",a:"Edival Ramosa",v:"Galatea",ini:"2026-06-09",fim:"2026-08-08",d:"Redescoberta do escultor ítalo-brasileiro."},
 {t:"Terra, cores naturais… — Tito Terapia",a:"Tito Terapia",v:"Galatea",ini:"2026-05-12",fim:"2026-07-30",d:"Pigmentos naturais e pertencimento (espaço Padre João Manuel)."},
 {t:"Fluxos — Janet Vollebregt",a:"Janet Vollebregt",v:"Galeria Luis Maluf",ini:"2026-05-16",fim:"2026-08-08",d:"Individual da artista holandesa-brasileira."},
 {t:"Almir Mavignier: Acaso Determinado",a:"Almir Mavignier",v:"DAN Galeria",ini:"2026-05-23",fim:"2026-08-15",d:"Concretismo e op art (DAN Contemporânea)."},
 {t:"Surrealismos: Arte para Além da Razão",v:"Pinakotheke São Paulo",ini:"2026-05-16",fim:"2026-08-15",d:"Curadoria Max Perlingeiro e Tadeu Chiarelli."},
 {t:"Oposições Geométricas — coletiva",v:"Paulo Kuczynski Escritório de Arte",ini:"2026-05-16",fim:"2026-08-22",d:"Geometrias em diálogo (Mavignier e outros)."},
 {t:"Água da Mata (Miguel Penha) + Gunga Guerra",a:"Miguel Penha, Gunga Guerra",v:"Zipper Galeria",ini:"2026-06-01",fim:"2026-08-01",d:"Duas mostras simultâneas; entrada gratuita."},
 {t:"A palavra errada — Rebecca Watson Horn",a:"Rebecca Watson Horn",v:"Fortes D'Aloia & Gabriel — Galeria",ini:"2026-06-10",fim:"2026-08-01",d:"Pintura e linguagem."},
 {t:"Fugido — Anderson Borba",a:"Anderson Borba",v:"Fortes D'Aloia & Gabriel — Galeria",ini:"2026-06-10",fim:"2026-08-01",d:"Esculturas em madeira."},
 {t:"Uma Folha Translúcida no Lugar dos Olhos — D. Steegmann Mangrané",a:"Daniel Steegmann Mangrané",v:"Mendes Wood DM",ini:"2026-04-07",fim:"2026-08-08",d:"Ecologia e percepção."},
 {t:"Geologia da forma — Germana Monte-Mór",a:"Germana Monte-Mór",v:"Galeria Leme",ini:"2026-06-25",fim:"2026-08-21",d:"Obras dos anos 90."},
 {t:"nem mais nem menos — Carlos Zilio",a:"Carlos Zilio",v:"Galeria Raquel Arnaud",ini:"2026-06-10",fim:"2026-08-22",d:"Pinturas recentes."},
 {t:"Etéreas — Chaim, Weffort, Giacomini, Belém",a:"Carla Chaim, Marina Weffort, Amalia Giacomini, Laura Belém",v:"Galeria Raquel Arnaud",ini:"2026-06-11",fim:"2026-08-22",d:"Coletiva sobre leveza e matéria."},
 {t:"Mão Amiga — José Bento",a:"José Bento",v:"A Gentil Carioca SP",ini:"2026-05-23",fim:"2026-08-01",d:"Madeira e ofício."}
];

const BAIRRO_COUNTS=[["Jardins",18],["Barra Funda",8],["Jardim Europa",7],["Pinheiros",6],
 ["Vila Madalena",3],["Itaim Bibi",3],["Cerqueira César",3],["Higienópolis",3],["Vila Buarque",3],
 ["Consolação",2],["Moema",2],["Vila Nova Conceição",2],["Butantã",1],["Pacaembu",1],["República",1],
 ["Santa Cecília",1],["Bela Vista",1],["Morumbi",1],["Sumarezinho",1]];
/* ================= EM FOCO =================
 Bloco de destaque no topo. Troque quando quiser.
 publi:true acrescenta o selo "conteúdo patrocinado" (use sempre que for espaço pago). */
const FOCO = {
 t:"Estrelas Escolhidas — Luiz Zerbini",
 v:"Instituto Tomie Ohtake",
 quem:"Luiz Zerbini · até 16 de agosto · entrada gratuita",
 txt:"Cerca de 230 obras da última década do artista: monotipias botânicas feitas com plantas colhidas por ele, pinturas de grande formato e instalações. É a mostra mais extensa de Zerbini em São Paulo até aqui — e uma das poucas chances de ver o conjunto das monotipias reunido.",
 link:"",
 publi:false
};

return { foco: FOCO, atualizado: "30/07/2026", venues: VENUES, expos: EXPOS, bairros: BAIRRO_COUNTS };
})();
