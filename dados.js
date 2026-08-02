/* ============================================================
   VERNISSAGES SP — ARQUIVO DE DADOS
   Edite este arquivo a cada nova divulgacao (nao mexa no index.html).
   ============================================================ */
window.DATA = (function(){
/* ================= VENUES =================
 tipo: galeria | institucional | hibrido | feira  ·  ~ = endereço aproximado
 hibrido = loja-conceito, café, ateliê ou espaço independente que mantém
 programa expositivo com curadoria e visitação pública (ex.: Mata Lab). */
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
 {name:"Gomide&Co",ig:"gomideco",addr:"Av. Paulista, 2644 (Ed. Rosa)",b:"Consolação",z:"Oeste",tipo:"galeria",lat:-23.5556,lng:-46.6622,info:"600 m² no corredor cultural da Paulista. Modernismo e contemporâneo."},
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
 {name:"Galeria Jaqueline Martins",ig:"galeriajaquelinemartins",addr:"R. Dr. Cesário Mota Jr., 443",b:"Vila Buarque",z:"Centro",tipo:"galeria",lat:-23.5452,lng:-46.6502,info:"SP e Bruxelas. Vanguardas dos anos 1970–80 e contemporâneo. Hudinilson Jr."},
 {name:"A Gentil Carioca SP",ig:"agentilcarioca",site:"https://agentilcarioca.com.br",addr:"R. Barão de Itapetininga ~",b:"República",z:"Centro",tipo:"galeria",lat:-23.5445,lng:-46.6422,info:"Filial paulistana da galeria carioca fundada por Ernesto Neto, Márcio Botner e Laura Lima."},
 {name:"Sé Galeria",addr:"Centro ~",b:"Sé",z:"Centro",tipo:"galeria",lat:-23.5489,lng:-46.6388,info:"Programa experimental no centro histórico."},
 // --- Adições via Guia das Artes ---
 {name:"Baró Galeria",ig:"barogaleria",site:"https://barogaleria.com",addr:"Santa Cecília (galpão de 1.500 m²) ~",b:"Santa Cecília",z:"Centro",tipo:"galeria",lat:-23.5362,lng:-46.6522,info:"Dirigida por Maria Baró; galpão reformado de 1.500 m². Diálogo Brasil–Espanha–América Latina."},
 {name:"A7MA Galeria",addr:"R. Harmonia, 239 ~",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5532,lng:-46.6912,info:"Arte urbana e cultura de rua na Vila Madalena."},
 {name:"Amoa Konoya Arte Indígena",ig:"amoakonoya",addr:"R. João Moura, 1002 ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5602,lng:-46.6851,info:"Dedicada à arte dos povos indígenas do Brasil."},
 {name:"Blau Projects",ig:"blauprojects",addr:"R. Fradique Coutinho ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5608,lng:-46.6882,info:"Artistas emergentes e múltiplas linguagens."},
 {name:"Galeria Aura",ig:"aura.galeria",site:"https://aura.art.br",addr:"R. da Consolação, 2767",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5566,lng:-46.6612,info:"Entre Porto Alegre e SP; foco em projetos expositivos e feiras."},
 {name:"Yehudi Hollander-Pappi",site:"https://yehudihollanderpappi.com",addr:"Al. Lorena, 1295",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5628,lng:-46.6641,info:"Galeria de jovens artistas; linguagens experimentais e temporalidade expandida."},
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
 {name:"Itaú Cultural",ig:"itaucultural",site:"https://www.itaucultural.org.br",addr:"Av. Paulista, 149",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5701,lng:-46.6462,ing:{g:true,obs:"Entrada gratuita.",fonte:"itaucultural.org.br"},info:"Programação gratuita na Paulista."},
 {name:"Centro Cultural São Paulo (CCSP)",site:"https://centrocultural.sp.gov.br",addr:"R. Vergueiro, 1000",b:"Paraíso",z:"Centro",tipo:"institucional",lat:-23.5701,lng:-46.6402,ing:{g:true},info:"Exposições, acervo e residências."},
 {name:"Museu Judaico de São Paulo",ig:"museujudaicosp",site:"https://museujudaico.org.br",addr:"R. Martinho Prado, 128",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5527,lng:-46.6478,ing:{i:20,m:10,free:"sábados",fonte:"museujudaicosp.org.br"},info:"Junto à sinagoga Beth-El."},
 {name:"Pivô",site:"https://www.pivo.org.br",addr:"Av. Ipiranga, 200 (Copan)",b:"República",z:"Centro",tipo:"institucional",lat:-23.5465,lng:-46.6448,ing:{g:true},info:"Plataforma sem fins lucrativos no Edifício Copan: mostras e residências."},
 {name:"Casa do Povo",ig:"casadopovo",site:"https://casadopovo.org.br",addr:"R. Três Rios, 252",b:"Bom Retiro",z:"Centro",tipo:"institucional",lat:-23.5281,lng:-46.6392,ing:{g:true},info:"Centro cultural experimental no Bom Retiro."},
 {name:"MAB FAAP",site:"https://www.faap.br/museu",addr:"R. Alagoas, 903",b:"Pacaembu",z:"Centro",tipo:"institucional",lat:-23.5426,lng:-46.6652,ing:{conf:true,obs:"Acervo e mostras regulares com entrada gratuita, mas a exposição Miró: Mestre das Formas tem ingresso vendido à parte em mmf26.com.br. A imprensa noticia R$ 50 (meia R$ 25) de terça a sexta e R$ 60 (meia R$ 30) aos sábados, domingos e feriados; os valores não estão publicados no site oficial.",fonte:"faap.br/mab"},info:"Museu de Arte Brasileira da FAAP."},
 {name:"Instituto Tomie Ohtake",ig:"institutotomieohtake",site:"https://www.institutotomieohtake.org.br",addr:"R. Coropés, 88",b:"Pinheiros",z:"Oeste",tipo:"institucional",lat:-23.5687,lng:-46.7017,ing:{g:true},info:"Torre de Ruy Ohtake na Faria Lima."},
 {name:"Sesc Pompeia",ig:"sescpompeia",site:"https://www.sescsp.org.br/unidades/sesc-pompeia",addr:"R. Clélia, 93",b:"Pompeia",z:"Oeste",tipo:"institucional",lat:-23.5273,lng:-46.6802,ing:{g:true,obs:"exposições gratuitas; alguns espetáculos são pagos"},info:"Complexo de Lina Bo Bardi; exposições de grande porte."},
 {name:"MAM São Paulo",ig:"mamsaopaulo",site:"https://mam.org.br",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5871,lng:-46.6572,ing:{conf:true,obs:"sede fechada para reforma da marquise desde 2024"},info:"Museu de Arte Moderna. Sede no Ibirapuera fechada desde 2024 para a reforma da marquise; programação segue em instituições parceiras."},
 {name:"MAC USP",site:"https://www.mac.usp.br",addr:"Av. Pedro Álvares Cabral, 1301",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5866,lng:-46.6512,ing:{g:true},info:"Museu de Arte Contemporânea da USP, antigo Detran."},
 {name:"Museu Afro Brasil Emanoel Araujo",ig:"museuafrobrasil",site:"https://museuafrobrasil.org.br",addr:"Parque Ibirapuera, portão 10",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5882,lng:-46.6632,ing:{i:15,m:7.5,free:"quartas-feiras",fonte:"museuafrobrasil.org.br"},info:"Pavilhão Padre Manoel da Nóbrega."},
 {name:"Oca — Pavilhão Lucas Nogueira Garcez",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5875,lng:-46.6598,ing:{conf:true,obs:"varia conforme a mostra"},info:"Pavilhão de Niemeyer para grandes mostras."},
 {name:"Fundação Bienal / Pavilhão Ciccillo Matarazzo",ig:"bienalsaopaulo",site:"https://bienal.org.br",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5878,lng:-46.6553,ing:{conf:true,obs:"Bienal é gratuita; demais eventos variam"},info:"Sede da Bienal de São Paulo e da feira SP-Arte (abril)."},
 // --- FEIRA ---
 {name:"ARCA",ig:"sp_arte",site:"https://www.sp-arte.com",addr:"Av. Manuel Bandeira, 360",b:"Vila Leopoldina",z:"Oeste",tipo:"feira",lat:-23.5232,lng:-46.7332,ing:{conf:true,obs:"feira com ingresso pago; confira valores na SP-Arte"},info:"Galpão de eventos; sede da SP-Arte Rotas."}
,
 {name:"Mendes Wood DM — Casa Iramaia",site:"https://mendeswooddm.com",addr:"R. Iramaia, Jardim Europa (a confirmar)",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5748,lng:-46.6752,info:"Segundo espaço paulistano da Mendes Wood DM, em casa modernista."},
 {name:"GRUTA Espaço de Arte Contemporânea",addr:"R. Barra Funda, 450 ~",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5271,lng:-46.6585,info:"Espaço independente na Barra Funda; foco em artistas em início de carreira."},
 {name:"Janaina Torres Galeria",addr:"R. Vitorino Carmilo, 427 ~",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5322,lng:-46.6567,info:"Galeria com sedes em São Paulo e Nova York; contemporâneo brasileiro."},
 {name:"Sesc Pinheiros",ig:"sescpinheiros",site:"https://www.sescsp.org.br/unidades/pinheiros",addr:"R. Paes Leme, 195",b:"Pinheiros",z:"Oeste",tipo:"institucional",lat:-23.5665,lng:-46.7010,ing:{g:true,obs:"exposições gratuitas"},info:"Unidade do Sesc em Pinheiros; espaço expositivo no 2º andar."},
 {name:"Farol Santander",ig:"farolsantander",site:"https://www.farolsantander.com.br/sp",addr:"R. João Brícola, 24",b:"Centro",z:"Centro",tipo:"institucional",lat:-23.5462,lng:-46.6340,ing:{i:45,m:22.5,obs:"ingresso único dá acesso às exposições, ao mirante e à Pista do 21; 10% de desconto com cartão Santander",fonte:"farolsantander.com.br/sp/ingressos"},info:"Centro cultural no antigo edifício Altino Arantes, no centro histórico."},
 {name:"Cultura Artística",ig:"culturaartistica",site:"https://culturaartistica.org",addr:"R. Nestor Pestana, 196",b:"Consolação",z:"Centro",tipo:"institucional",lat:-23.5455,lng:-46.6440,ing:{g:true},info:"Teatro de Rino Levi; nova área expositiva inaugurada em 2026 com o programa Aberto Solo."},
 // --- HÍBRIDOS: lojas-conceito, cafés, ateliês e espaços independentes com programa expositivo ---
 {name:"Mata Lab — Mata São Paulo",ig:"matasaopaulo",addr:"Al. Rio Claro, 260",b:"Bela Vista",z:"Centro",tipo:"hibrido",lat:-23.5642,lng:-46.6522,ing:{g:true,obs:"visitação gratuita"},info:"Loja-conceito de design e natureza com espaço expositivo próprio, o Mata Lab; mostras com curadoria e entrada franca."}
];

/* ================= EXPOS ================= */
const EXPOS = [
 {t:"Verso: na encruzilhada da revolta — Ravioli e Ussami",a:"Frederico Ravioli, Gabriel Ussami",v:"Galeria Vermelho",ini:"2026-07-30",fim:"2026-08-01",d:"Abertura 30/07, 19h–22h, com DJ sets de Cashu e Regis. Dez pinturas sobre cartazes de ponto de ônibus; texto de Caio Bonifácio."},
 {t:"Omẽ Mahsã – Seres invisíveis — Daiara Tukano",a:"Daiara Tukano",v:"Almeida & Dale | Millan",ini:"2026-07-04",fim:"2026-08-01",d:"Cerca de 20 pinturas inéditas sobre seres ligados ao ar na cosmologia Yepá Mahsã."},
 {t:"Inverno dentro do bosque — coletiva",v:"Luciana Brito Galeria",ini:"2026-07-04",fim:"2026-08-08",d:"Coletiva de inverno na casa modernista de Rino Levi."},
 {t:"Quarto — coletiva",v:"Galeria Marília Razuk",ini:"2026-05-09",fim:"2026-08-08",d:"No Anexo, com Cristina Tolovi e Luana Fortes: o quarto como campo de projeção subjetiva."},
 {t:"Rajada encarnada — coletiva",v:"Casa de Cultura do Parque",ini:"2026-07-25",fim:"2026-10-25",d:"II Ciclo Expositivo em parceria com o ICCo. Quarta a domingo, 11h–18h."},
 {t:"Política da superfície — coletiva",v:"Casa de Cultura do Parque",ini:"2026-07-25",fim:"2026-10-25",d:"II Ciclo Expositivo em parceria com o ICCo. Quarta a domingo, 11h–18h."},
 {t:"Natureza Tecida — Somos Um Único Fio",a:"Sandra Anselmi",v:"Mata Lab — Mata São Paulo",ini:"2026-06-10",fim:"2026-08-31",d:"Cogumelos monumentais e tramas de tricô ocupam o Mata Lab; curadoria de Lilian Pacce. Visitação gratuita."},
 {t:"Masao Yamamoto — individual",a:"Masao Yamamoto",v:"Galeria Marcelo Guarnieri",ini:"2026-08-01",fim:"2026-09-19",d:"Fotografias em pequeno formato do mestre japonês; poética do silêncio."},
 {t:"Ígneo Piaga — Thiago Martins de Melo",a:"Thiago Martins de Melo",v:"Almeida & Dale | Millan",ini:"2026-08-01",fim:"2026-09-12",d:"Pintura densa e mitologia amazônica no espaço Fradique.",img:"https://almeidaedale.com.br/wp-content/uploads/2026/07/thiago-martins-de-melo_260707eeo_30151_eoo.jpg",cred:"Cortesia Almeida & Dale"},
 {t:"ÇA — Rita Lessa",a:"Rita Lessa",v:"Almeida & Dale | Millan",ini:"2026-08-01",fim:"2026-09-12",d:"Individual da artista, em paralelo a Thiago Martins de Melo.",img:"https://almeidaedale.com.br/wp-content/uploads/2026/07/rita-lessa_29678_ph-eeo_02.jpg",cred:"Cortesia Almeida & Dale"},
 {t:"Mensageiro da Manhã — André Ricardo",a:"André Ricardo",v:"Almeida & Dale | Millan",ini:"2026-08-15",fim:"2026-09-19",d:"Individual do pintor paulistano anunciada pela galeria."},
 {t:"Abstenções (uma miragem, mas permanente) — Nino Kapanadze",a:"Nino Kapanadze",v:"Almeida & Dale | Millan",ini:"2026-08-15",fim:"2026-09-19",d:"Exposição individual anunciada pela galeria."},
 {t:"Bauci: a cidade e os olhos — Érica Magalhães",a:"Érica Magalhães",v:"Galeria Aura",ini:"2026-08-08",fim:"2026-09-23",d:"Esculturas que equilibram porcelana e concreto; texto curatorial de Tatiana Ferraz."},
 {t:"Perpétuo — Samuel Alves de Jesus",a:"Samuel Alves de Jesus",v:"Yehudi Hollander-Pappi",ini:"2026-07-21",fim:"2026-08-15",d:"Primeira individual do artista; o sal como matéria, corrosão e símbolo."},
 {t:"Contra Cena — MEXA",a:"MEXA",v:"Yehudi Hollander-Pappi",ini:"2026-07-21",fim:"2026-08-15",d:"Fotografias do coletivo MEXA sobre o que antecede e sucede a cena: camarins, esperas, intervalos."},
 {t:"Síntese — Arte e Tecnologia",v:"Itaú Cultural",ini:"2026-07-02",fim:"2026-08-31",d:"Coletiva com obras da Coleção Itaú de Arte e Tecnologia; curadoria de Leno Veras."},
 {t:"Habitar a paisagem — Flavia Fabbriziani",a:"Flavia Fabbriziani",v:"Galeria Dezoito",ini:"2026-08-05",fim:"2026-09-05",d:"Curadoria de Jurandy Valença."},
 {t:"Joan Miró: Mestre das Formas",a:"Joan Miró",v:"MAB FAAP",ini:"2026-08-07",fim:"2026-10-12",d:"140 obras originais do catalão, várias inéditas no Brasil. Ingresso pago, vendido em mmf26.com.br."},
 {t:"O Lado Escuro da Lua — Alfredo Jaar",a:"Alfredo Jaar",v:"Galeria Luisa Strina",ini:"2026-08-08",fim:"2026-09-19",d:"Novo projeto do artista chileno, Leão de Ouro de Veneza.",img:"https://static-assets.artlogic.net/w_1200,h_630,c_fill,f_auto,fl_lossy,q_auto/ws-galerialuisastrina/usr/images/exhibitions/main_image_override/293/aj_public_001-web.jpg",cred:"Cortesia Galeria Luisa Strina"},
 {t:"SP-Arte Rotas 2026 · 5ª edição",v:"ARCA",ini:"2026-08-26",fim:"2026-08-30",d:"~70 expositores; direção artística de Bernardo Mosqueira; foco América Latina. Dia 26 só convidados; 27–28 (13h–20h), 29 (12h–20h), 30 (12h–19h)."},
 {t:"Viver tecendo — Claudia Alarcón e Silät",a:"Claudia Alarcón",v:"MASP",ini:"2026-03-06",fim:"2026-08-02",d:"Tecelagens do coletivo wichí (Argentina)."},
 {t:"Pop andino — La Chola Poblete",a:"La Chola Poblete",v:"MASP",ini:"2026-03-06",fim:"2026-08-02",d:"Primeira individual da artista argentina no Brasil."},
 {t:"O princípio do conhecimento — Santiago Yahuarcani",a:"Santiago Yahuarcani",v:"MASP",ini:"2026-04-02",fim:"2026-08-02",d:"Pintura uitoto sobre llanchama."},
 {t:"Democracia radical — Colectivo Acciones de Arte",a:"Colectivo Acciones de Arte (CADA)",v:"MASP",ini:"2026-04-07",fim:"2026-08-02",d:"Ações do CADA contra a ditadura chilena."},
 {t:"Matéria e Energia — Damián Ortega",a:"Damián Ortega",v:"MASP",ini:"2026-05-15",fim:"2026-09-13",d:"Três décadas do escultor mexicano."},
 {t:"Acervo em Transformação: Doações Recentes",v:"MASP",ini:"2026-05-15",fim:"2026-09-13",d:"Curadoria Adriano Pedrosa e equipe."},
 {t:"confluências — Carolina Caycedo",a:"Carolina Caycedo",v:"MASP",ini:"2026-07-03",fim:"2026-10-04",d:"Rios, represas e resistência socioambiental."},
 {t:"Casa María Lionza — Sol Calero",a:"Sol Calero",v:"MASP",ini:"2026-07-03",fim:"2027-01-30",d:"Instalação de longa duração da venezuelana."},
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
 {t:"Uma Folha Translúcida no Lugar dos Olhos — D. Steegmann Mangrané",a:"Daniel Steegmann Mangrané",v:"Mendes Wood DM — Casa Iramaia",ini:"2026-04-07",fim:"2026-08-08",d:"Ecologia e percepção."},
 {t:"Geologia da forma — Germana Monte-Mór",a:"Germana Monte-Mór",v:"Galeria Leme",ini:"2026-06-25",fim:"2026-08-21",d:"Obras dos anos 90."},
 {t:"nem mais nem menos — Carlos Zilio",a:"Carlos Zilio",v:"Galeria Raquel Arnaud",ini:"2026-06-10",fim:"2026-08-22",d:"Pinturas recentes."},
 {t:"Etéreas — Chaim, Weffort, Giacomini, Belém",a:"Carla Chaim, Marina Weffort, Amalia Giacomini, Laura Belém",v:"Galeria Raquel Arnaud",ini:"2026-06-11",fim:"2026-08-22",d:"Coletiva sobre leveza e matéria."},
 {t:"Mão Amiga — José Bento",a:"José Bento",v:"A Gentil Carioca SP",ini:"2026-05-23",fim:"2026-08-01",d:"Madeira e ofício."},
 {t:"Presença — Anna Maria Maiolino",a:"Anna Maria Maiolino",v:"Galeria Luisa Strina",ini:"2026-08-08",fim:"2026-09-19",d:"Individual da artista ítalo-brasileira; abre na mesma noite que Alfredo Jaar.",img:"https://static-assets.artlogic.net/w_1200,h_630,c_fill,f_auto,fl_lossy,q_auto/ws-galerialuisastrina/usr/images/exhibitions/main_image_override/292/ana-maria-maiolino_29814_ph-julia-thompson_01-copiar.jpg",cred:"Cortesia Galeria Luisa Strina"},
 {t:"Ojú-Inú — Ayrson Heráclito",a:"Ayrson Heráclito",v:"Simões de Assis",ini:"2026-08-08",fim:"2026-09-12",d:"Corpo, ritual e memória afro-atlântica no espaço dos Jardins.",img:"https://simoesdeassis.com/images/exposicao/1785428510-260727eeo-simoes-067.jpg",cred:"Cortesia Simões de Assis"},
 {t:"Flores e Vasos — coletiva",v:"Luciana Brito Galeria",ini:"2026-08-22",fim:"2026-10-17",d:"Coletiva com curadoria de Nessia Pope."},
 {t:"Imagens do Interior — Fabiana de Barros",a:"Fabiana de Barros",v:"Luciana Brito Galeria",ini:"2026-08-22",fim:"2026-10-17",d:"Individual da artista brasileira radicada na Suíça."},
 {t:"Cantaria — Daniel Jorge",a:"Daniel Jorge",v:"Mendes Wood DM",ini:"2026-08-22",fim:"2026-11-06",d:"Individual do artista no espaço da Barra Funda."},
 {t:"Déboussolé est le mot exact — Jean Claracq",a:"Jean Claracq",v:"Mendes Wood DM",ini:"2026-08-22",fim:"2026-11-06",d:"Pintura em pequeno formato do artista francês."},
 {t:"Sendo — Lygia Pape",a:"Lygia Pape",v:"Mendes Wood DM — Casa Iramaia",ini:"2026-04-07",fim:"2026-08-08",d:"Mostra dedicada à artista neoconcreta, em dois endereços da galeria."},
 {t:"Playful, Stormy, Continuing",v:"Baró Galeria",ini:"2026-08-20",fim:"2026-09-03",d:"Coletiva na sede da Rua Amauri."},
 {t:"É Tempo Ainda",v:"Janaina Torres Galeria",ini:"2026-08-15",fim:"2026-10-17",d:"Mostra na sede da Barra Funda."},
 {t:"Sala de Vídeo: Regina José Galindo",a:"Regina José Galindo",v:"MASP",ini:"2026-07-03",fim:"2026-08-23",d:"Vídeo-performances da artista guatemalteca."},
 {t:"Uma Obra: Pintura sem fim",v:"Pinacoteca de São Paulo",ini:"2026-07-04",fim:"2028-01-31",d:"Terceira edição do projeto Uma Obra: pintura em construção permanente com o público (Pina Luz)."},
 {t:"Para crianças: experiências com a arte desde 1968",v:"Pinacoteca de São Paulo",ini:"2026-05-30",fim:"2026-10-18",d:"Mostra que convida crianças a pensar e intervir no mundo pela arte (Pina Contemporânea)."},
 {t:"Beatriz Milhazes: gravuras do acervo da Pinacoteca",a:"Beatriz Milhazes",v:"Pinacoteca de São Paulo",ini:"2026-05-16",fim:"2027-03-14",d:"27 gravuras feitas entre 1996 e 2019 com a Durham Press (Pina Estação)."},
 {t:"trágico subúrbio — Paulo Pedro Leal",a:"Paulo Pedro Leal",v:"Pinacoteca de São Paulo",ini:"2026-04-11",fim:"2026-11-08",d:"Primeira individual do artista (Pina Luz)."},
 {t:"um ato fotográfico — Alice Yura",a:"Alice Yura",v:"Pinacoteca de São Paulo",ini:"2026-04-11",fim:"2026-09-13",d:"Fotografia, arquivo e memória (Pina Contemporânea)."},
 {t:"Ibirapema — Olinda Tupinambá",a:"Olinda Tupinambá",v:"Pinacoteca de São Paulo",ini:"2026-04-11",fim:"2026-12-27",d:"Videoinstalação na Sala de Vídeo da Pina Luz."},
 {t:"Macunaíma é Duwid",v:"Pinacoteca de São Paulo",ini:"2026-03-28",fim:"2026-09-13",d:"Coletiva que revisita Mário de Andrade em diálogo com artistas indígenas (Pina Estação)."},
 {t:"Miss Ceilingfan – ad nauseam — Joeun Kim Aatchim",a:"Joeun Kim Aatchim",v:"Almeida & Dale | Millan",ini:"2026-07-04",fim:"2026-08-01",d:"Individual da artista coreano-americana no espaço Fradique."},
 {t:"Primeiro Mergulho — Beatriz Buendia",a:"Beatriz Buendia",v:"GRUTA Espaço de Arte Contemporânea",ini:"2026-07-11",fim:"2026-08-08",d:"Primeira individual da artista no espaço da Barra Funda."},
 {t:"Solange Pessoa: outras escalas",a:"Solange Pessoa",v:"Itaú Cultural",ini:"2026-08-04",fim:"2026-11-01",d:"150 desenhos inéditos, filmes experimentais e uma instalação da artista mineira."},
 {t:"Delírio Tropical – Recanto",v:"Sesc Pinheiros",ini:"2026-05-06",fim:"2026-10-12",d:"Cerca de 280 obras de 130 artistas de todas as regiões; curadoria de Orlando Maneschy e Keyla Sobral."},
 {t:"Tudo que eu sei, eu aprendi à noite — Luísa Matsushita",a:"Luísa Matsushita",v:"Cultura Artística",ini:"2026-08-15",fim:"2026-09-27",d:"Pinturas inéditas sobre o centro e a noite paulistana; estreia do programa Aberto Solo."},
 {t:"Tecituras",v:"Farol Santander",ini:"2026-07-17",fim:"2026-10-18",d:"Cerca de 30 obras têxteis de 30 artistas brasileiros; curadoria de Denise Mattar."},
 {t:"Pequeno mapa do tempo — Paula Siebra",a:"Paula Siebra",v:"Mendes Wood DM — Casa Iramaia",ini:"2026-08-25",fim:"2026-10-24",d:"Pinturas a óleo sobre os ciclos de chuva, festa, vento e seca em Fortaleza."},
 {t:"Tudo que inventei aconteceu — Flávia Junqueira",a:"Flávia Junqueira",v:"Zipper Galeria",ini:"2026-08-08",fim:"2026-09-19",d:"Fotografias inéditas produzidas ao longo de um mês em Nova York."},
 {t:"No corpo e na paisagem, o que resta é o pó — Henrique Detomi",a:"Henrique Detomi",v:"Zipper Galeria",ini:"2026-08-08",fim:"2026-09-19",d:"Pintura a partir da caminhada e da terra aberta do interior de Minas."},
 {t:"Sistema-mundo — Marina Camargo",a:"Marina Camargo",v:"Galeria Superfície",ini:"2026-06-18",fim:"2026-08-08",d:"Segunda individual da artista na galeria; mapas e desenho expandido, curadoria de Tiago Mesquita."}
];

/* ================= EDITAIS =================
 cat: fomento | residencia | premio | chamada
 prazo: YYYY-MM-DD  ·  null = fluxo continuo (sem data de encerramento divulgada)
 Nunca inventar prazo: se a fonte nao trouxer data, deixe null e explique no campo d. */
const EDITAIS = [
 {t:"Residências Cruzadas — línguas e conhecimentos indígenas além das fronteiras",org:"IDBRASIL (Museu da Língua Portuguesa) e Cité internationale de la langue française",cat:"residencia",prazo:"2026-08-30",quem:"Artistas e pesquisadores indígenas residentes no Brasil — atenção especial à região de fronteira com a Guiana Francesa",onde:"Brasil (residência na França)",valor:"Bolsa de 3.000 euros",taxa:"gratuita",d:"Duas bolsas, uma para residente no Brasil e outra na Guiana Francesa, para um mês de residência no Château de Villers-Cotterêts (França), de 15 de março a 11 de abril de 2027. Projetos ligados à valorização, circulação e história das línguas e conhecimentos indígenas.",link:"https://www.idbr.org.br/edital-do-programa-de-residencias-cruzadas-linguas-e-conhecimentos-indigenas-alem-das-fronteiras/",fonte:"idbr.org.br via Mapa das Artes"},
 {t:"Fomento CultSP / ProAC 2026 — pacote de 9 editais",org:"Secretaria da Cultura, Economia e Indústria Criativas de SP",cat:"fomento",prazo:"2026-08-03",quem:"Pessoas físicas e jurídicas do estado de São Paulo",onde:"Estado de São Paulo",valor:"R$ 90 milhões no conjunto",taxa:"gratuita",d:"Pacote publicado em 10 de junho com editais de audiovisual, games, arquitetura (ocupação de bens tombados pelo CONDEPHAAT), economia criativa (moda e design de produtos), festivais e eventos, cinemas de rua e municípios de até 50 mil habitantes. Inscrições prorrogadas até 3 de agosto, só pela plataforma Fomento CultSP.",link:"https://www.cultura.sp.gov.br/sec_cultura/Fomento/Programa_ProAC_(Editais)",fonte:"Agência SP, 27/07/2026"},
 {t:"Prêmio Photothings de Fotolivro Artesanal",org:"Festival Photothings",cat:"premio",prazo:"2026-08-02",quem:"Fotógrafos e artistas visuais brasileiros — não elegíveis artistas representados por galerias comerciais",onde:"Brasil",taxa:"gratuita",d:"Um projeto fotográfico selecionado vira fotolivro produzido de forma 100% artesanal. O regulamento fica no link da bio do Instagram do festival.",link:"https://www.instagram.com/photo.things/",fonte:"Artvsm e Dasartes, julho/2026"},
 {t:"Propostas de exposição para o MAB FAAP",org:"Museu de Arte Brasileira da FAAP",cat:"chamada",prazo:null,quem:"Artistas, curadores e coletivos",onde:"São Paulo",taxa:"gratuita",d:"O museu recebe propostas de exposição em fluxo contínuo, por formulário online. Não há data de encerramento divulgada.",link:"https://faapinscricao.crmeducacional.com/formulario/2406",fonte:"faap.br/mab"}
];

const BAIRRO_COUNTS=[["Jardins",18],["Barra Funda",8],["Jardim Europa",7],["Pinheiros",6],
 ["Vila Madalena",3],["Itaim Bibi",3],["Cerqueira César",3],["Higienópolis",3],["Vila Buarque",3],
 ["Consolação",2],["Moema",2],["Vila Nova Conceição",2],["Butantã",1],["Pacaembu",1],["República",1],
 ["Santa Cecília",1],["Bela Vista",1],["Morumbi",1],["Sumarezinho",1]];
/* ================= EM FOCO =================
 Bloco de destaque no topo. Troque quando quiser.
 publi:true acrescenta o selo "conteúdo patrocinado" (use sempre que for espaço pago). */
const FOCO = {
 t:"O Lado Escuro da Lua — Alfredo Jaar",
 v:"Galeria Luisa Strina",
 quem:"Alfredo Jaar",
 txt:"Dia 8 de agosto a Luisa Strina abre duas individuais na mesma noite. Jaar traz 48 trabalhos dos anos 1970 e 1980, feitos sob a ditadura de Pinochet — um conjunto raramente visto no Brasil, mais perto do documento do que do objeto de galeria. Na sala ao lado, Anna Maria Maiolino apresenta Presença. Vale reservar a noite inteira para os Jardins.",
 link:"https://www.galerialuisastrina.com.br/exhibitions",
 publi:false
};

return { foco: FOCO, atualizado: "02/08/2026", venues: VENUES, expos: EXPOS, editais: EDITAIS, bairros: BAIRRO_COUNTS };
})();
