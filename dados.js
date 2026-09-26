/* ============================================================
   VERNISSAGES SP — ARQUIVO DE DADOS
   Edite este arquivo a cada nova divulgacao (nao mexa no index.html).
   ============================================================ */
window.DATA = (function(){
/* ================= VENUES =================
tipo: galeria | institucional | hibrido | feira · ~ = endereço aproximado
hibrido = loja-conceito, café, ateliê ou espaço independente que mantém
programa expositivo com curadoria e visitação pública (ex.: Mata Lab).
soIG:true = agenda só sai no Instagram (sem site ou site parado); entra na
raspagem semanal do instagram.js. */
const VENUES = [
// --- Jardins / Cerqueira César / Jardim América / Jardim Paulista (Oeste) ---
{name:"Galeria Luisa Strina",ig:"galerialuisastrina",site:"https://www.luisastrina.com.br",addr:"R. Padre João Manuel, 755",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5646,lng:-46.6683,info:"Fundada em 1974, decana da arte contemporânea no Brasil. Alfredo Jaar, Cildo Meireles, Leonilson. Segunda a sexta, 10h–19h; sábado, 10h–17h."},
{name:"Galatea",ig:"galatea.art_",site:"https://galatea.art",addr:"R. Oscar Freire, 379",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5622,lng:-46.6661,info:"Dois espaços nos Jardins (Oscar Freire e Padre João Manuel) e uma sede em Salvador. Arte brasileira moderna e contemporânea."},
{name:"Casa Triângulo",ig:"casatriangulo",site:"https://www.casatriangulo.com",addr:"R. Estados Unidos, 1324",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5668,lng:-46.6672,info:"Desde 1988 (Ricardo Trevisan). ~500 m² experimentais. Yuli Yamagata, Vânia Mignone. Terça a sexta, 10h–19h; sábado, 10h–17h."},
{name:"Zipper Galeria",ig:"zippergaleria",site:"https://www.zippergaleria.com.br",addr:"R. Estados Unidos, 1494",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5675,lng:-46.6681,info:"Desde 2010. Curadoria diversa, múltiplas mídias. Segunda a sexta, 10h–19h; sábado, 11h–17h."},
{name:"DAN Galeria",ig:"dangaleria",site:"https://www.dangaleria.com.br",addr:"R. Estados Unidos, 1638",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5681,lng:-46.6712,info:"Modernismo brasileiro e concretismo; braço contemporâneo DAN Contemporânea."},
{name:"Pinakotheke São Paulo",site:"https://www.pinakotheke.com.br",addr:"R. Estados Unidos, 1216",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5671,lng:-46.6653,info:"Casa histórica dedicada à arte brasileira dos séculos XX–XXI."},
{name:"Galeria Marcelo Guarnieri",ig:"galeriamarceloguarnieri",site:"https://www.galeriamarceloguarnieri.com.br",addr:"Al. Lorena, 1835",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5652,lng:-46.6672,info:"Origem em Ribeirão Preto (1985); espaço nos Jardins. Fotografia e contemporâneo. Segunda a sexta, 10h–19h; sábado, 10h–17h."},
{name:"Simões de Assis",ig:"simoesdeassis",site:"https://simoesdeassis.com",addr:"Al. Lorena, 2050A",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5632,lng:-46.6691,info:"Fundada em Curitiba (1984). Abstração geométrica e contemporâneo."},
{name:"Galeria Luis Maluf",ig:"luis_maluf",site:"https://luismaluf.com",addr:"R. Peixoto Gomide, 1887",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5660,lng:-46.6622,info:"Arte contemporânea brasileira emergente."},
{name:"Choque Cultural",ig:"choquecultural",site:"http://choquecultural.com.br",addr:"Al. Sarutaiá, 206",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5686,lng:-46.6603,info:"Referência em arte urbana, grafite e street art desde 2004."},
{name:"Almeida & Dale",ig:"almeidaedale",site:"https://www.almeidaedale.com.br",addr:"R. Caconde, 152",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5712,lng:-46.6650,info:"Uma das maiores do país; incorporou a Galeria Millan em 2025. Mercado primário e secundário."},
/* site tirado em 23/09/2026: koganamaro.com nao resolve (DNS morto,
   confirmado no navegador e por fetch direto — ENOTFOUND). */
{name:"Kogan Amaro",site:"",addr:"Al. Franca, 1054 ~",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5637,lng:-46.6602,info:"SP e Zurique. Contemporâneo brasileiro e internacional."},
{name:"Verve Galeria",ig:"vervegaleria",site:"https://www.vervegaleria.com",addr:"Av. São Luís, 192 — Ed. Louvre, sobreloja 06",b:"República",z:"Centro",tipo:"galeria",lat:-23.5452,lng:-46.6425,info:"Contemporâneo; forte presença em feiras nacionais. Fica no Edifício Louvre, no centro — não nos Jardins."},
/* site tirado em 23/09/2026: galeriaberenicearvani.com redireciona pro
   dominio da Pinacoteca de Sao Paulo — dominio expirado ou repassado,
   nao serve mais a galeria. Sem substituto confirmado; nao visitar
   ate achar o endereco certo (Instagram @galeriaberenicearvani talvez
   tenha o link novo, mas isso e trabalho de captar.js, nao de radar). */
{name:"Galeria Berenice Arvani",ig:"galeriaberenicearvani",soIG:true,site:"",addr:"R. Oscar Freire, 540",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5630,lng:-46.6672,info:"Modernos e contemporâneos brasileiros."},
/* site tirado em 23/09/2026: certificado SSL de galeriasuperficie.com.br
   aponta pra "battlemap.live" — dominio mal configurado ou tomado. Nao
   investigar mais sem checar primeiro se e seguro. */
{name:"Galeria Superfície",ig:"galeriasuperficie",soIG:true,site:"",addr:"R. Oscar Freire, 240 ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5614,lng:-46.6642,info:"Arte conceitual brasileira dos anos 1970 em diante."},
{name:"Paulo Kuczynski Escritório de Arte",ig:"pkgaleria",site:"https://www.pkgaleria.com",addr:"Al. Lorena, 1661",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5657,lng:-46.6661,info:"Mercado secundário de alto nível; mostras curadas."},
{name:"Ricardo Camargo Galeria",ig:"ricardocamargogaleria",soIG:true,addr:"R. Bento de Andrade ~",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5768,lng:-46.6662,info:"Arte brasileira moderna."},
{name:"Mônica Filgueiras Galeria",addr:"R. Bela Cintra, 1533 ~",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5601,lng:-46.6650,info:"Contemporâneo brasileiro desde os anos 1980."},
{name:"Danielian São Paulo",ig:"danielian_galeria",site:"https://www.danielian.com.br",addr:"R. Estados Unidos, 2114 e 2157",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5695,lng:-46.6760,info:"Galeria carioca com espaço recente em SP."},
// --- Jardim Europa / Paulista ---
{name:"Galeria Nara Roesler",ig:"galerianararoesler",site:"https://nararoesler.art",addr:"Av. Europa, 655",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5719,lng:-46.6739,info:"SP, Rio e NY. Abraham Palatnik, Vik Muniz, Tomie Ohtake."},
{name:"Luciana Brito Galeria",ig:"lucianabritogaleria",site:"https://lucianabritogaleria.com.br",addr:"Av. Nove de Julho, 5162",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5758,lng:-46.6789,info:"Sede em casa modernista de Rino Levi (1958). Contemporâneo internacional. Segunda, 10h–18h; terça a sexta, 10h–19h; sábado, 11h–17h."},
{name:"Galeria Lume",ig:"galerialume",site:"https://www.galerialume.com",addr:"R. Gumercindo Saraiva, 54 ~",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5731,lng:-46.6771,info:"Contemporâneo brasileiro e latino-americano."},
{name:"Gomide&Co",ig:"gomideco",site:"https://gomideco.com.br",addr:"Av. Paulista, 2644 (Ed. Rosa)",b:"Consolação",z:"Oeste",tipo:"galeria",lat:-23.5556,lng:-46.6622,info:"600 m² no corredor cultural da Paulista, com mezanino para individuais. Modernismo e contemporâneo. Segunda a sexta, 10h–19h; sábado, 11h–17h."},
// --- Pinheiros / Vila Madalena / Butantã ---
{name:"Almeida & Dale | Millan",ig:"galeriamillan",site:"https://almeidaedale.com.br",addr:"R. Fradique Coutinho, 1360",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5618,lng:-46.6898,info:"Espaço Fradique; a histórica Galeria Millan (1986) integrou-se à Almeida & Dale em 2025. Segunda a sexta, 10h–19h; sábado, 11h–16h."},
{name:"Fortes D'Aloia & Gabriel — Galeria",ig:"fortesdaloiagabriel",site:"https://fdag.com.br",addr:"R. Barão de Capanema, 343",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5601,lng:-46.6673,info:"Unidade FDAG Jardins. Ernesto Neto, Rivane Neuenschwander, Erika Verzutti. Espaço-irmão: Galpão (Barra Funda). Terça a sexta, 10h–19h; sábado, 10h–18h."},
{name:"Galeria Estação",ig:"galeriaestacao",site:"https://www.galeriaestacao.com.br",addr:"R. Ferreira de Araújo, 625",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5641,lng:-46.6982,info:"Referência em arte popular brasileira e artistas autodidatas."},
{name:"Central Galeria",ig:"centralgaleria",site:"https://www.centralgaleria.com",addr:"R. Minas Gerais, 362",b:"Higienópolis",z:"Centro",tipo:"galeria",lat:-23.5539,lng:-46.6590,info:"Contemporâneo emergente. Segunda a sexta, 10h–19h; sábado, 11h–17h."},
{name:"Casa de Cultura do Parque",ig:"casadeculturadoparque",site:"https://ccparque.com.br",addr:"Av. Prof. Fonseca Rodrigues, 1300",b:"Alto de Pinheiros",z:"Oeste",tipo:"institucional",lat:-23.5477,lng:-46.7135,ing:{g:true},info:"Centro cultural em Alto de Pinheiros; ciclos expositivos em parceria com o ICCo. Quarta, quinta, sexta e domingo, 11h–18h; sábado, 11h–18h."},
{name:"Galeria Raquel Arnaud",ig:"galeriaraquelarnaud",site:"https://www.raquelarnaud.com",addr:"R. Fidalga, 125",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5572,lng:-46.6891,info:"Desde 1973. Construtivo e abstração: Sérgio Camargo, Carlos Zilio."},
{name:"Galeria Dezoito",site:"https://galeriadezoito.com",addr:"R. Simpatia, 23",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5561,lng:-46.6872,info:"Espaço da Vila Madalena com foco em paisagem e pintura contemporânea."},
{name:"Marli Matsumoto Arte Contemporânea",site:"https://marlimatsumoto.com.br",addr:"Vila Madalena ~",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5542,lng:-46.6902,info:"Galeria + anexo experimental."},
{name:"Galeria Leme",ig:"galerialeme",site:"https://galerialeme.com",addr:"Av. Valdemar Ferreira, 130",b:"Butantã",z:"Oeste",tipo:"galeria",lat:-23.5672,lng:-46.7121,info:"Prédio brutalista de Paulo Mendes da Rocha. Latino-americanos e africanos."},
// --- Barra Funda / Higienópolis / Vila Buarque / Centro ---
{name:"Mendes Wood DM",ig:"mendeswooddm",site:"https://mendeswooddm.com",addr:"R. Barra Funda, 216",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5266,lng:-46.6572,info:"SP, Bruxelas, NY, Paris. Sonia Gomes, Paulo Nazareth, Solange Pessoa. Terça a sexta, 11h–19h; sábado, 10h–17h."},
{name:"Fortes D'Aloia & Gabriel — Galpão",ig:"fortesdaloiagabriel",site:"https://fdag.com.br",addr:"R. James Holland, 71",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5245,lng:-46.6633,info:"Galpão industrial para mostras de grande escala. Terça a sexta, 10h–19h; sábado, 10h–18h."},
{name:"Galeria Vermelho",ig:"galeriavermelho",site:"https://galeriavermelho.com.br",addr:"R. Minas Gerais, 350",b:"Higienópolis",z:"Centro",tipo:"galeria",lat:-23.5541,lng:-46.6592,info:"Desde 2002. Performance, instalação e política. Verbo (mostra anual de performance). Terça a sexta, 10h–19h; sábado, 11h–17h."},
{name:"HOA Galeria",ig:"hoa.goooold",soIG:true,addr:"Higienópolis ~",b:"Higienópolis",z:"Centro",tipo:"galeria",lat:-23.5480,lng:-46.6560,info:"Fundada por Igi Ayedun; foco em artistas negros e periféricos. Endereço a confirmar: guias da cidade dão Barra Funda. O domínio hoatour.art caiu e hoje serve outra coisa — não use."},
{name:"Galeria Jaqueline Martins",ig:"galeriajaquelinemartins",addr:"R. Dr. Cesário Mota Jr., 443",b:"Vila Buarque",z:"Centro",tipo:"galeria",lat:-23.5452,lng:-46.6502,info:"SP e Bruxelas. Vanguardas dos anos 1970–80 e contemporâneo. Hudinilson Jr. O domínio galeriajaquelinemartins.com saiu do ar; use o Instagram."},
{name:"A Gentil Carioca SP",ig:"agentilcarioca",site:"https://agentilcarioca.com.br",addr:"R. Barão de Itapetininga ~",b:"República",z:"Centro",tipo:"galeria",lat:-23.5445,lng:-46.6422,info:"Filial paulistana da galeria carioca fundada por Ernesto Neto, Márcio Botner e Laura Lima."},
/* site tirado em 23/09/2026: segaleria.com.br redireciona pro site do
   Memorial da America Latina — nao e mais o site desta galeria. */
{name:"Sé Galeria",site:"",addr:"Al. Lorena, 1257 (Vila Modernista, casa 2)",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5670,lng:-46.6631,info:"Nasceu no centro histórico e mudou para os Jardins em 2019; o nome ficou."},
// --- Adições via Guia das Artes ---
{name:"Baró Galeria",ig:"barogaleria",site:"https://barogaleria.com",addr:"R. Amauri, 62 (pop-up Taller Zaragoza)",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5800,lng:-46.6815,info:"Dirigida por Maria Baró. Sede transferida para a Espanha; retomou presença em São Paulo em 2026 com pop-up no Taller Zaragoza, em Jardim Europa. Diálogo Brasil–Espanha–América Latina."},
{name:"A7MA Galeria",addr:"R. Medeiros de Albuquerque, 250",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5545,lng:-46.6858,site:"https://a7ma.com.br",ig:"a7magaleria",soIG:true,info:"Arte urbana e cultura de rua na Vila Madalena. Divulga majoritariamente pelo Instagram."},
{name:"Amoa Konoya Arte Indígena",ig:"amoakonoya",addr:"R. João Moura, 1002 ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5602,lng:-46.6851,info:"Dedicada à arte dos povos indígenas do Brasil."},
/* NAO adicionar site: blauprojects.com (visto no Instagram @blauprojects,
   23/09/2026) redireciona pra afiliado da AliExpress — dominio expirado
   e tomado, terceiro caso do dia (junto com Virgilio e Adelina). */
{name:"Blau Projects",ig:"blauprojects",soIG:true,addr:"R. Fradique Coutinho ~",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5608,lng:-46.6882,info:"Artistas emergentes e múltiplas linguagens."},
{name:"Galeria Aura",ig:"aura.galeria",site:"https://aura.art.br",addr:"R. da Consolação, 2767",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5566,lng:-46.6612,info:"Entre Porto Alegre e SP; foco em projetos expositivos e feiras."},
/* site tirado em 23/09/2026: a extensao de seguranca do navegador
   bloqueou yehudihollanderpappi.com por classificacao de risco. Pode ser
   falso positivo, mas nao investigado a fundo — reconferir antes de usar. */
{name:"Yehudi Hollander-Pappi",site:"",addr:"Al. Lorena, 1295",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5628,lng:-46.6641,info:"Galeria de jovens artistas; linguagens experimentais e temporalidade expandida."},
/* site tirado em 23/09/2026: adelina.org.br tentou dois golpes na mesma
   sessao — popup falso pedindo pra abrir o PowerShell e colar comando
   ("ClickFix", tecnica de malware) numa tentativa, reCAPTCHA bloqueando
   o grid de exposicoes na outra. NAO visitar — nem o radar-fontes.js,
   nem ninguem — enquanto isso nao for investigado (site comprometido ou
   dominio expirado/repassado). */
{name:"Adelina Galeria",ig:"adelinainstituto",soIG:true,site:"",addr:"Pinheiros (endereço a confirmar)",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5648,lng:-46.6920,info:"Arte contemporânea com foco em novos diálogos e pertencimento."},
{name:"Arte Infinita",addr:"Jardim Europa (endereço a confirmar)",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5740,lng:-46.6760,info:"Fundada por Viviane Teperman em 2001; ênfase em escultura."},
{name:"Arteedições Galeria",ig:"arteedicoes_galeria",soIG:true,addr:"Jardins (endereço a confirmar)",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5655,lng:-46.6638,info:"Gravuras e edições: Hirst, Kapoor, Opie, Sonia Gomes, Leda Catunda."},
{name:"A Casa das Artes",addr:"Itaim Bibi (endereço a confirmar)",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5820,lng:-46.6780,info:"Direção de Marta Veloso de Souza; modernos e contemporâneos."},
// --- Itaim / Moema / Vila Mariana (Sul) ---
{name:"Galeria Marília Razuk",ig:"galeriamariliarazuk",site:"https://www.galeriamariliarazuk.com.br",addr:"R. Jerônimo da Veiga, 131",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5842,lng:-46.6752,info:"Desde 1992. Contemporâneo brasileiro."},
{name:"Galeria Mario Cohen",site:"https://galeriamariocohen.com.br",addr:"R. Pedroso Alvarenga ~",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5851,lng:-46.6772,info:"Pop e contemporâneo internacional."},
{name:"Galeria Jacques Ardies",site:"https://www.ardies.com",addr:"R. Morgado de Mateus, 579",b:"Vila Mariana",z:"Sul",tipo:"galeria",lat:-23.5811,lng:-46.6412,info:"Especializada em arte naïf brasileira desde 1979."},
// --- INSTITUCIONAIS ---
{name:"MASP",ig:"masp",site:"https://masp.org.br",addr:"Av. Paulista, 1578",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5614,lng:-46.6559,ing:{i:85,m:42,free:"terças o dia todo (Nubank) e sextas das 18h às 21h (B3)",fonte:"masp.org.br/visite"},info:"Museu de Arte de São Paulo Assis Chateaubriand + Ed. Pietro Maria Bardi (14 andares). Terça, 10h–20h; quarta, quinta e domingo, 10h–18h; sexta, 10h–21h; sábado, 10h–18h; segunda, fechado."},
{name:"Pinacoteca de São Paulo",ig:"pinasp",site:"https://pinacoteca.org.br",addr:"Praça da Luz, 2",b:"Luz",z:"Centro",tipo:"institucional",lat:-23.5340,lng:-46.6336,ing:{i:40,m:20,free:"sábados e no 2º domingo de cada mês",obs:"+R$ 2 de taxa online; ingresso vale os três prédios",fonte:"pinacoteca.org.br"},info:"Pina Luz, Pina Estação e Pina Contemporânea."},
{name:"CCBB São Paulo",ig:"ccbbsp",site:"https://ccbb.com.br",addr:"R. Álvares Penteado, 112",b:"Sé",z:"Centro",tipo:"institucional",lat:-23.5470,lng:-46.6343,ing:{g:true,obs:"retirada de ingresso no site do BB ou na bilheteria"},info:"Centro Cultural Banco do Brasil, centro histórico."},
{name:"IMS Paulista",ig:"imoreirasalles",site:"https://ims.com.br",addr:"Av. Paulista, 2424",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5561,lng:-46.6620,ing:{g:true},info:"Instituto Moreira Salles: fotografia, cinema e literatura."},
{name:"Itaú Cultural",ig:"itaucultural",site:"https://www.itaucultural.org.br",addr:"Av. Paulista, 149",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5701,lng:-46.6462,ing:{g:true,obs:"Entrada gratuita.",fonte:"itaucultural.org.br"},info:"Programação gratuita na Paulista. Terça a sábado, 11h–20h; domingo, 11h–19h; segunda, fechado."},
{name:"Centro Cultural São Paulo (CCSP)",site:"https://centrocultural.sp.gov.br",addr:"R. Vergueiro, 1000",b:"Paraíso",z:"Centro",tipo:"institucional",lat:-23.5701,lng:-46.6402,ing:{g:true},info:"Exposições, acervo e residências."},
{name:"Museu Judaico de São Paulo",ig:"museujudaicosp",site:"https://museujudaicosp.org.br",addr:"R. Martinho Prado, 128",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5527,lng:-46.6478,ing:{i:20,m:10,free:"sábados",fonte:"museujudaicosp.org.br"},info:"Junto à sinagoga Beth-El."},
{name:"Pivô",site:"https://www.pivo.org.br",addr:"Av. Ipiranga, 200 (Copan, loja 54)",b:"República",z:"Centro",tipo:"institucional",lat:-23.5465,lng:-46.6448,ing:{g:true},info:"Plataforma sem fins lucrativos no Edifício Copan: mostras e residências. Segunda sede em Salvador desde 2023."},
{name:"Casa do Povo",site:"https://casadopovo.org.br",addr:"R. Três Rios, 252",b:"Bom Retiro",z:"Centro",tipo:"institucional",lat:-23.5281,lng:-46.6392,ing:{g:true},info:"Centro cultural experimental no Bom Retiro. Perfil de Instagram a confirmar."},
{name:"MAB FAAP",site:"https://www.faap.br/museu",addr:"R. Alagoas, 903",b:"Pacaembu",z:"Centro",tipo:"institucional",lat:-23.5426,lng:-46.6652,ing:{conf:true,obs:"Acervo e mostras regulares com entrada gratuita, mas a exposição Miró: Mestre das Formas tem ingresso vendido à parte em mmf26.com.br. A imprensa noticia R$ 50 (meia R$ 25) de terça a sexta e R$ 60 (meia R$ 30) aos sábados, domingos e feriados; os valores não estão publicados no site oficial.",fonte:"faap.br/mab"},info:"Museu de Arte Brasileira da FAAP."},
{name:"Instituto Tomie Ohtake",ig:"institutotomieohtake",site:"https://www.institutotomieohtake.org.br",addr:"R. Coropés, 88",b:"Pinheiros",z:"Oeste",tipo:"institucional",lat:-23.5687,lng:-46.7017,ing:{g:true},info:"Torre de Ruy Ohtake na Faria Lima."},
{name:"Sesc Pompeia",ig:"sescpompeia",site:"https://www.sescsp.org.br/unidades/sesc-pompeia",addr:"R. Clélia, 93",b:"Pompeia",z:"Oeste",tipo:"institucional",lat:-23.5273,lng:-46.6802,ing:{g:true,obs:"exposições gratuitas; alguns espetáculos são pagos"},info:"Complexo de Lina Bo Bardi; exposições de grande porte."},
{name:"MAM São Paulo",ig:"mamsaopaulo",site:"https://mam.org.br",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5871,lng:-46.6572,ing:{conf:true,obs:"o site do museu ainda informa a sede temporariamente fechada; confirme antes de ir"},info:"Museu de Arte Moderna. A sede do Ibirapuera está fechada desde 2024 para a reforma da marquise; o 39º Panorama, previsto para 12 de setembro de 2026, marca o retorno do museu ao endereço. Horário informado pelo museu: terça a sexta e domingo, 10h–18h; sábado, 10h–18h."},
{name:"MAC USP",site:"https://www.mac.usp.br",addr:"Av. Pedro Álvares Cabral, 1301",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5866,lng:-46.6512,ing:{g:true},info:"Museu de Arte Contemporânea da USP, antigo Detran."},
{name:"Museu Afro Brasil Emanoel Araujo",ig:"museuafrobrasil",site:"https://museuafrobrasil.org.br",addr:"Parque Ibirapuera, portão 10",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5882,lng:-46.6632,ing:{i:15,m:7.5,free:"quartas-feiras",fonte:"museuafrobrasil.org.br"},info:"Pavilhão Padre Manoel da Nóbrega."},
{name:"Oca — Pavilhão Lucas Nogueira Garcez",site:"https://www.parquedoibirapuera.org/oca/",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5875,lng:-46.6598,ing:{conf:true,obs:"varia conforme a mostra"},info:"Pavilhão de Niemeyer para grandes mostras."},
{name:"Fundação Bienal / Pavilhão Ciccillo Matarazzo",ig:"bienalsaopaulo",site:"https://bienal.org.br",addr:"Parque Ibirapuera, portão 3",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5878,lng:-46.6553,ing:{conf:true,obs:"Bienal é gratuita; demais eventos variam"},info:"Sede da Bienal de São Paulo e da feira SP-Arte (abril)."},
// --- FEIRA ---
{name:"ARCA",ig:"sp_arte",site:"https://www.sp-arte.com",addr:"Av. Manuel Bandeira, 360",b:"Vila Leopoldina",z:"Oeste",tipo:"feira",lat:-23.5232,lng:-46.7332,ing:{conf:true,obs:"feira com ingresso pago; confira valores na SP-Arte"},info:"Galpão de eventos; sede da SP-Arte Rotas."}
,
{name:"Mendes Wood DM — Casa Iramaia",site:"https://mendeswooddm.com",addr:"R. Iramaia, 105",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5748,lng:-46.6752,info:"Segundo espaço paulistano da Mendes Wood DM, em casa modernista. Segunda a sexta, 11h–19h. Não abre sábado."},
{name:"GRUTA Espaço de Arte Contemporânea",site:"https://www.gruta.cc",ig:"gruta.cc",addr:"R. Barra Funda, 450 ~",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5271,lng:-46.6585,info:"Espaço independente na Barra Funda; foco em artistas em início de carreira."},
{name:"Janaina Torres Galeria",addr:"R. Vitorino Carmilo, 427",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5322,lng:-46.6567,info:"Galeria com sedes em São Paulo e Nova York; contemporâneo brasileiro.",site:"https://janainatorres.com.br",ig:"janainatorresgaleria"},
{name:"Sesc Pinheiros",ig:"sescpinheiros",site:"https://www.sescsp.org.br/unidades/pinheiros",addr:"R. Paes Leme, 195",b:"Pinheiros",z:"Oeste",tipo:"institucional",lat:-23.5665,lng:-46.7010,ing:{g:true,obs:"exposições gratuitas"},info:"Unidade do Sesc em Pinheiros; espaço expositivo no 2º andar."},
{name:"Farol Santander",ig:"farolsantander",site:"https://www.farolsantander.com.br/sp",addr:"R. João Brícola, 24",b:"Centro",z:"Centro",tipo:"institucional",lat:-23.5462,lng:-46.6340,ing:{i:45,m:22.5,obs:"ingresso único dá acesso às exposições, ao mirante e à Pista do 21; 10% de desconto com cartão Santander",fonte:"farolsantander.com.br/sp/ingressos"},info:"Centro cultural no antigo edifício Altino Arantes, no centro histórico."},
{name:"Cultura Artística",ig:"culturaartistica",site:"https://culturaartistica.org",addr:"R. Nestor Pestana, 196",b:"Consolação",z:"Centro",tipo:"institucional",lat:-23.5455,lng:-46.6440,ing:{g:true},info:"Teatro de Rino Levi; nova área expositiva inaugurada em 2026 com o programa Aberto Solo."},
{name:"MIS — Museu da Imagem e do Som",ig:"mis_sp",site:"https://www.mis-sp.org.br",addr:"Av. Europa, 158",b:"Jardim Europa",z:"Oeste",tipo:"institucional",lat:-23.5716,lng:-46.6706,ing:{conf:true,obs:"varia conforme a mostra"},info:"Museu estadual dedicado à imagem, ao som e à cultura audiovisual."},
{name:"Museu da Imigração",ig:"museudaimigracao",site:"https://museudaimigracao.org.br",addr:"R. Visconde de Parnaíba, 1316 ~",b:"Mooca",z:"Leste",tipo:"institucional",lat:-23.5497,lng:-46.6047,ing:{conf:true,obs:"confirme valores e gratuidades no site"},info:"Antiga Hospedaria de Imigrantes do Brás; acervo e mostras sobre migração."},
{name:"Vazio Criativo",ig:"vazio_criativo_",soIG:true,addr:"R. Lavradio, 573 ~",b:"Barra Funda",z:"Centro",tipo:"hibrido",lat:-23.5245,lng:-46.6650,ing:{g:true,obs:"terça a sexta, 10h–18h; sábado, 10h–16h"},info:"Espaço independente na Barra Funda que abriga mostras coletivas e projetos de artistas."},
// --- HÍBRIDOS: lojas-conceito, cafés, ateliês e espaços independentes com programa expositivo ---
{name:"Mata Lab — Mata São Paulo",ig:"matalabsp",soIG:true,addr:"Al. Rio Claro, 260",b:"Bela Vista",z:"Centro",tipo:"hibrido",lat:-23.5642,lng:-46.6522,ing:{g:true,obs:"visitação gratuita; aberto todos os dias"},info:"Loja-conceito de design e natureza com espaço expositivo próprio, o Mata Lab; mostras com curadoria e entrada franca."},
{name:"Auroras",ig:"auroras.art.br",site:"https://auroras.art.br",addr:"Av. São Valério, 426",b:"Morumbi",z:"Sul",tipo:"hibrido",lat:-23.6010,lng:-46.7180,ing:{g:true,obs:"sábados 11h–18h; demais dias com agendamento"},info:"Casa modernista de Gian Carlo Gasperini onde Ricardo Kugelmas mora e realiza cerca de cinco mostras por ano, cruzando artistas brasileiros e internacionais."},
{name:"Massapê Projetos",ig:"massape_projetos",soIG:true,addr:"R. Fortunato, 68",b:"Santa Cecília",z:"Centro",tipo:"hibrido",lat:-23.5395,lng:-46.6495,ing:{g:true,obs:"segunda a sexta, com agendamento"},info:"Plataforma de arte contemporânea gerida por artistas; galeria e ateliê compartilhado com Mano Penalva, Marcelo Pacheco, Marina Rodrigues, Fabiana Preti e Tchelo."},
{name:"Espaço República",ig:"espacorepublica",soIG:true,addr:"Av. São Luís, 86",b:"República",z:"Centro",tipo:"hibrido",lat:-23.5448,lng:-46.6405,ing:{g:true},info:"Núcleo cultural aberto em 2025 no centro histórico: cinco andares com ateliês privativos e coletivos, cursos, residência e andar expositivo. A Sala Vera Helena abriga as mostras."},
{name:"Ateliê397",ig:"atelie397",site:"https://atelie397.com",addr:"Travessa Dona Paula, 126",b:"Higienópolis",z:"Centro",tipo:"hibrido",lat:-23.5432,lng:-46.6558,ing:{g:true},info:"Desde 2003, um dos espaços independentes mais longevos da cidade: ateliê, residências e exposições de arte contemporânea. Mantém o Clínica Geral, grupo de acompanhamento de projetos."},
{name:"Ateliê Fidalga",site:"https://ateliefidalga.com.br",addr:"R. Fidalga, 299",b:"Vila Madalena",z:"Oeste",tipo:"hibrido",lat:-23.5578,lng:-46.6902,ing:{g:true},info:"Programa de formação e convivência entre artistas de diferentes gerações, com mostras coletivas periódicas."},
/* site tirado em 23/09/2026: aparelhaluzia.com.br nao resolve (DNS morto,
   confirmado no navegador e por fetch direto — ENOTFOUND). */
{name:"Aparelha Luzia",ig:"aparelhaluzia",soIG:true,site:"",addr:"R. Apa, 78",b:"Santa Cecília",z:"Centro",tipo:"hibrido",lat:-23.5375,lng:-46.6497,ing:{conf:true,obs:"varia conforme a programação"},info:"Quilombo urbano fundado em 2016: arte, cultura e política negra, com exposições, shows e encontros."},
{name:"Galeria Café",ig:"galeriacafesp",soIG:true,addr:"Praça Benedito Calixto, 103",b:"Pinheiros",z:"Oeste",tipo:"hibrido",lat:-23.5605,lng:-46.6862,ing:{g:true,obs:"exposições no térreo durante o dia"},info:"Café e bar com andar térreo dedicado a exposições com curadoria da Dasartes; obras à venda."},
{name:"Galeria Metrópole",site:"https://metropolegaleria.com.br",addr:"Av. São Luís, 187",b:"República",z:"Centro",tipo:"hibrido",lat:-23.5455,lng:-46.6415,ing:{g:true},info:"Edifício modernista transformado em polo criativo: lojas de design, ateliês, cafés e espaços de arte no centro."},
{name:"Galpão da Lapa",ig:"galpaodalapa",site:"https://galpaodalapa.art.br",addr:"Vila Anastácio, complexo Ceagesp (endereço exato a confirmar)",b:"Vila Anastácio",z:"Oeste",tipo:"institucional",lat:-23.5236,lng:-46.7159,info:"Coleção privada de arte contemporânea brasileira (mais de 2.000 obras, reunida por Andrea Pereira e José Olympio) instalada em galpão histórico do complexo Ceagesp. Visitas guiadas gratuitas mediante agendamento, quintas e sábados."},
{name:"Galeria Contempo",site:"https://galeriacontempo.com.br",addr:"Al. Gabriel Monteiro da Silva, 1644",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5730,lng:-46.6706,info:"Dirigida por Marcia e Mônica Felmanas; em 2026 promoveu o retorno da obra de Aldir Mendes de Souza ao circuito expositivo. Segunda a sexta, 10h–19h; sábado, 10h–16h."},

/* --- casas novas, mapeadas em 14/09/2026 via diretório do AQA + Guia das Artes,
   confirmadas na fonte primária (site/Instagram) antes de entrar --- */
{name:"AM Galeria",ig:"amgaleriadearte",site:"https://amgaleria.com.br",addr:"Av. Nove de Julho, 4865",b:"Itaim Bibi",z:"Oeste",tipo:"galeria",lat:-23.5774,lng:-46.6727,info:"Investigações escultóricas em mármore e fios metálicos, entre outras linguagens."},
{name:"Casa Seva",site:"https://casaseva.com",addr:"Al. Lorena, 1257, Casa 1",b:"Jardins",z:"Oeste",tipo:"galeria",lat:-23.5724,lng:-46.6569,info:"Espaço dedicado a arte e sustentabilidade, entrada gratuita. Terça a sexta, 11h–18h."},
{name:"Casa Museu Ema Klabin",site:"https://emaklabin.org.br",addr:"R. Portugal, 43",b:"Jardim Europa",z:"Oeste",tipo:"institucional",lat:-23.5735,lng:-46.6757,info:"Casa-museu da Fundação Ema Gordon Klabin, com acervo de arte e objetos. Quarta a domingo, 11h–17h."},
{name:"Fibra Galeria",addr:"R. Tinhorão, 69",b:"Higienópolis",z:"Centro",tipo:"galeria",lat:-23.5444,lng:-46.6618,info:"Galeria e leiloeira desde 2012, com exposições individuais e coletivas além de leilões mensais."},
{name:"Fólio Galeria",ig:"foliogaleria",site:"https://www.foliolivraria.com.br",addr:"R. Pedroso Alvarenga, 1046",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5824,lng:-46.6804,info:"Especializada em livros de artista, edições limitadas e obras em papel desde 2000. Atendimento com hora marcada. Site e catálogo, sem mostra rotativa."},
{name:"Galeria Frente",site:"https://galeriafrente.com.br",addr:"R. Dr. Melo Alves, 400",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5609,lng:-46.6705,info:"Já expôs Portinari, Tarsila do Amaral e Tomie Ohtake."},
{name:"Fundação Maria Luisa e Oscar Americano",site:"https://fundacaooscaramericano.org.br",addr:"Av. Morumbi, 4077",b:"Morumbi",z:"Oeste",tipo:"institucional",lat:-23.6013,lng:-46.7096,info:"Casa-museu com 75 mil m² de área verde. Terça a domingo, 10h–17h30."},
/* site tirado em 23/09/2026: bergamingomide.com.br nao resolve (DNS
   morto, confirmado no navegador e por fetch direto — ENOTFOUND). */
{name:"Bergamin & Gomide",site:"",addr:"R. Oscar Freire, 379, Lj 1",b:"Jardins",z:"Oeste",tipo:"galeria",lat:-23.5666,lng:-46.6656,info:"Desde 2000, já expôs Iberê Camargo, Mira Schendel, Lygia Pape e Tunga."},
{name:"Galeria Carbono",site:"https://carbonogaleria.com.br",addr:"R. Joaquim Antunes, 59",b:"Jardim Paulistano",z:"Oeste",tipo:"galeria",lat:-23.5674,lng:-46.6790,info:"Edições de arte contemporânea (múltiplos, gravuras, livros de artista) desde 2013, membro da ABACT. Entrada gratuita."},
{name:"Espaço Arte M. Mizrahi",addr:"Al. Ministro Rocha Azevedo, 1082",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5661,lng:-46.6642,info:"Galeria desde 2001, presente na Artsy e na SP-Arte. Nova sede em Jardins desde agosto de 2025."},
{name:"Estação Pinacoteca",site:"https://pinacoteca.org.br",addr:"Largo General Osório, 66",b:"Santa Ifigênia",z:"Centro",tipo:"institucional",lat:-23.5348,lng:-46.6388,info:"Prédio \"Pina Estação\" da Pinacoteca de São Paulo — mesma instituição, endereço e programação próprios."},
{name:"Galeria Olido",addr:"Av. São João, 473",b:"Centro",z:"Centro",tipo:"institucional",lat:-23.5433,lng:-46.6389,info:"Centro cultural municipal com salas de exposição e Centro de Fotografia, reformado em 2004."},
{name:"Galeria Pilar",site:"https://galeriapilar.com",addr:"R. Barra Funda, 1030",b:"Santa Cecília",z:"Centro",tipo:"galeria",lat:-23.5267,lng:-46.6597,info:"Desde 2011, 400 m² de espaço expositivo."},
{name:"Galeria Tato",ig:"galeriatato",site:"https://www.galeriatato.com",addr:"R. Barra Funda, 893",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5275,lng:-46.6587,info:"Fundada em 2010 por Tato DiLascio."},
/* site tirado em 23/09/2026: cantogravura.com.br mostra pagina padrao
   da Locaweb "Dominio nao encontrado" — hospedagem sem site ativo. */
{name:"Gravura Brasileira",site:"",addr:"R. Ásia, 219",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5549,lng:-46.6840,info:"Fundada em 1998, único espaço do país dedicado exclusivamente à gravura. Acervo de cerca de 3 mil gravuras originais."},
{name:"Instituto Çarê",ig:"institutoculturalcare",site:"https://institutocare.org.br",addr:"R. Dr. Avelino Chaves, 138",b:"Vila Leopoldina",z:"Oeste",tipo:"institucional",lat:-23.5364,lng:-46.7290,info:"Organização sem fins lucrativos criada em 2019, com núcleos de Acervos, Artes Visuais, Educação, Música e Pesquisa."},
{name:"Lombardi Galeria",ig:"lombardigaleria",soIG:true,addr:"R. Joaquim Antunes, 187",b:"Jardim Paulistano",z:"Oeste",tipo:"galeria",lat:-23.5666,lng:-46.6797,info:"Projeto focado em fotografia autoral como linguagem artística."},
{name:"Martins&Montero",ig:"martinsemontero",site:"https://martinsemontero.com",addr:"R. Jamaica, 50 ~",b:"Jardim América",z:"Oeste",tipo:"galeria",lat:-23.5680,lng:-46.6680,info:"Unidades em São Paulo e Bruxelas."},
/* endereco corrigido em 23/09/2026: bio do Instagram (@mits.galeria) diz
   "Al.Tietê 618, Casa_7" — diferente do R. Padre João Manuel, 740 que
   estava aqui. Nao conferi qual data de mudanca; mantendo o que a fonte
   mais recente diz. lat/lng nao reajustados, a rua muda mas o bairro
   (Jardim Paulista) e proximo. */
{name:"MITS Galeria",ig:"mits.galeria",site:"https://www.mitsgaleria.art",addr:"Al. Tietê, 618, Casa 7",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5638,lng:-46.6644,info:"Galeria contemporânea criada em 2023."},
/* site tirado em 23/09/2026: certificado SSL de mube.art.br esta
   expirado — navegador bloqueia. Reconferir quando renovarem. */
{name:"MuBE",site:"",addr:"R. Alemanha, 221",b:"Jardim Europa",z:"Oeste",tipo:"institucional",lat:-23.5763,lng:-46.6764,info:"Museu Brasileiro de Escultura e Ecologia. Acervo arqueológico da FUMDHAM (Piauí) ao lado de escultura, desenho, pintura, gravura, fotografia e vídeo contemporâneos."},
{name:"Museu de Arte Sacra de São Paulo",site:"https://museuartesacra.org.br",addr:"Av. Tiradentes, 676",b:"Luz",z:"Centro",tipo:"institucional",lat:-23.5304,lng:-46.6314,info:"Na ala esquerda do Mosteiro da Luz. Via-Sacra de Victor Brecheret em terracota (1942–1946); obras de Anita Malfatti e Aldo Bonadei."},
{name:"Museu Lasar Segall",site:"https://museulasarsegall.org.br",addr:"R. Berta, 111",b:"Vila Mariana",z:"Sul",tipo:"institucional",lat:-23.5947,lng:-46.6353,info:"Museu federal (Ibram) dedicado ao pintor e gravador Lasar Segall."},
/* site tirado em 23/09/2026: oficinasculturais.org.br nao resolve (DNS
   morto, confirmado no navegador e por fetch direto — ENOTFOUND). */
{name:"Oficina Cultural Oswald de Andrade",site:"",addr:"R. Três Rios, 363",b:"Bom Retiro",z:"Centro",tipo:"institucional",lat:-23.5295,lng:-46.6378,info:"Prédio histórico inaugurado em 1905."},
{name:"Olhão",addr:"R. Barra Funda, 288",b:"Barra Funda",z:"Centro",tipo:"hibrido",lat:-23.5313,lng:-46.6544,info:"Espaço experimental — jardim, cozinha, banheiro e telhado ocupados com objetos, esculturas, pinturas, performances e instalações. Visitas por agendamento."},
{name:"Paço das Artes",site:"https://pacodasartes.org.br",addr:"R. Dr. Albuquerque Lins, 1345",b:"Higienópolis",z:"Centro",tipo:"institucional",lat:-23.5420,lng:-46.6589,info:"Instituição da Secretaria de Cultura do Estado de SP."},
{name:"Pinacoteca Contemporânea",site:"https://pinacoteca.org.br",addr:"Av. Tiradentes, 273",b:"Luz",z:"Centro",tipo:"institucional",lat:-23.5332,lng:-46.6333,info:"Terceiro prédio da Pinacoteca de São Paulo, inaugurado em 2023, integrado aos prédios Pina Luz e Pina Estação — ingresso único."},
{name:"Quadra Galeria",ig:"quadragaleria",soIG:true,addr:"R. Barão de Tatuí, 521",b:"Vila Buarque",z:"Centro",tipo:"galeria",lat:-23.5405,lng:-46.6547,info:"Unidades em São Paulo e Rio de Janeiro."},
/* site tirado em 23/09/2026: redbullstation.com.br nao resolve (DNS
   morto, confirmado por fetch direto — ENOTFOUND). */
{name:"Red Bull Station",site:"",addr:"R. Frei Caneca, 569",b:"Consolação",z:"Centro",tipo:"institucional",lat:-23.5542,lng:-46.6524,info:"Antiga subestação de energia desativada desde 2004, reformada para arte. Programa de residência artística regular."},
/* site tirado em 23/09/2026: galeriasancovsky.com nao resolve (DNS
   morto, confirmado por fetch direto — ENOTFOUND). */
{name:"Sancovsky",site:"",addr:"Pça. Benedito Calixto, 103",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5585,lng:-46.6809,info:"Dirigida por Marcos Sancovsky, expõe pintura, vídeo, escultura e performance."},
{name:"Tendal da Lapa",addr:"R. Guaicurus, 1100",b:"Lapa",z:"Oeste",tipo:"institucional",lat:-23.5223,lng:-46.6963,info:"Complexo cultural apelidado \"A Fábrica dos Sonhos\", originalmente centro de distribuição de carnes construído a partir de 1936."},
{name:"Vila Itororó",site:"https://vilaitororo.prefeitura.sp.gov.br",addr:"R. Maestro Cardim, 60",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5614,lng:-46.6406,info:"Construída entre 1922 e 1929, virou centro cultural municipal em 2021, ruínas arquitetônicas preservadas."},
/* site tirado em 23/09/2026: o dominio galeriavirgilio.com.br foi
   sequestrado e agora serve spam de apostas/cassino. NAO visitar —
   nem o radar-fontes.js, nem ninguem. Confirmado abrindo em duas abas
   separadas. Precisa achar o dominio novo da galeria (se existir) antes
   de repor este campo. */
{name:"Galeria Virgilio",ig:"galeria.virgilio",soIG:true,site:"",addr:"R. Dr. Virgilio de Carvalho Pinto, 426",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5620,lng:-46.6845,info:"Aberta em 2002 por Izabel Pinheiro, representa artistas contemporâneos emergentes."},
{name:"Memorial da América Latina",site:"https://memorial.org.br",addr:"Av. Auro Soares de Moura Andrade, 664",b:"Barra Funda",z:"Oeste",tipo:"institucional",lat:-23.5275,lng:-46.6654,info:"Galeria Marta Traba: único espaço museológico do Brasil inteiramente dedicado à arte latino-americana, 1.000 m² circulares."},
{name:"Pavilhão das Culturas Brasileiras",addr:"Parque Ibirapuera, portão 2 ~",b:"Ibirapuera",z:"Sul",tipo:"institucional",lat:-23.5890,lng:-46.6600,info:"Edifício de 11 mil m² projetado por Oscar Niemeyer nos anos 1950, tombado nas três esferas de patrimônio."}
];

/* ================= EXPOS ================= */
const EXPOS = [
{t:"Sem Palavras — Vânia Mignone",a:"Vânia Mignone",v:"Casa Triângulo",ini:"2026-08-08",fim:"2026-09-19",d:"Individual com 17 pinturas inéditas. A artista trabalha com MDF e colagem e integra palavras à composição das cenas.",img:"img/sem-palavras-casa-triangulo.webp",cred:"Cortesia Casa Triângulo"},
{t:"Uma língua nova",a:"Arnold Schmidt, Aurelino dos Santos, Clovis Aparecido dos Santos, Enio Sérgio, Esther Morgannah, Josef Hofer, Ranchinho",v:"Galeria Estação",ini:"2026-08-25",fim:"2026-09-26",d:"Coletiva com curadoria de José Augusto Ribeiro. Reúne 60 obras de artistas diagnosticados com transtornos mentais e deficiência intelectual.",img:"",cred:""},
{t:"To Love — Claudia Andujar e George Love",a:"Claudia Andujar, George Love",v:"Galeria Vermelho",ini:"2026-08-15",fim:null,d:"Curadoria de Eder Chiodetto sobre a produção experimental de George Love e seu diálogo com Claudia Andujar nos anos 1960 e 1970. A mostra marca o início da representação do Arquivo de George Love pela galeria. Abertura em 15 de agosto; encerramento não divulgado.",img:"img/to-love-galeria-vermelho.png",cred:"Cortesia Galeria Vermelho"},
{t:"No meio da pedra — André Vargas",a:"André Vargas",v:"Galeria Vermelho",ini:"2026-08-15",fim:null,d:"Segunda individual do artista na galeria. Abertura em 15 de agosto; encerramento não divulgado.",img:"img/no-meio-da-pedra-galeria-vermelho.jpg",cred:"Cortesia Galeria Vermelho"},
{t:"Ocupação JAMAC",a:"JAMAC — Jardim Miriam Arte Clube",v:"Galeria Vermelho",ini:"2024-10-04",fim:"2026-12-19",d:"O coletivo fundado por Mônica Nador em 2004 ocupa a banca da galeria com os projetos Inventários e Aprender algo novo. Quinta e sexta, 12h–18h; sábado, 11h–17h."},
{t:"Rajada encarnada — coletiva",v:"Casa de Cultura do Parque",ini:"2026-07-25",fim:"2026-10-25",d:"II Ciclo Expositivo em parceria com o ICCo. Quarta a domingo, 11h–18h.",img:"img/rajada-encarnada-casa-de-cultura-do-parque.png",cred:"Cortesia Casa de Cultura do Parque"},
{t:"Política da superfície — coletiva",v:"Casa de Cultura do Parque",ini:"2026-07-25",fim:"2026-10-25",d:"II Ciclo Expositivo em parceria com o ICCo. Quarta a domingo, 11h–18h.",img:"img/politica-da-superficie-casa-de-cultura-do-parque.png",cred:"Cortesia Casa de Cultura do Parque"},
{t:"Mitologias do Mistério — Gabriel Omep",a:"Gabriel Omep",v:"Casa de Cultura do Parque",ini:"2026-07-25",fim:"2026-10-25",d:"Quatro séries — Alfabeto Ferramenta, Orís, Guardiões e Indumentária — em pintura sobre papelão, numa parede de 280 x 1020 cm. Curadoria de Claudio Cretti e texto crítico de André Pitol. Parte do II Ciclo Expositivo.",img:"img/mitologias-do-misterio-casa-de-cultura-do-parque.png",cred:"Cortesia Casa de Cultura do Parque"},
{t:"Charline von Heyl — individual",a:"Charline von Heyl",v:"Auroras",ini:"2026-06-14",fim:"2026-09-19",d:"Primeira exposição da pintora alemã-americana no Brasil: quinze pinturas recentes, entre grandes formatos e a série Sabotagerie (2026). Organizada em colaboração com a Petzel Gallery. Entrada gratuita, sábados 11h–18h.",img:"img/charline-von-heyl-auroras.png",vista:true,cred:"Cortesia Auroras"},
{t:"Masao Yamamoto — individual",a:"Masao Yamamoto",v:"Galeria Marcelo Guarnieri",ini:"2026-08-01",fim:"2026-09-19",d:"Fotografias em pequeno formato do mestre japonês; poética do silêncio.",img:"img/masao-yamamoto-galeria-marcelo-guarnieri.webp",cred:"Cortesia Galeria Marcelo Guarnieri",vista:true},
{t:"Mensageiro da Manhã — André Ricardo",a:"André Ricardo",v:"Almeida & Dale | Millan",ini:"2026-08-15",fim:"2026-09-19",d:"Nove pinturas a têmpera e o primeiro conjunto de monotipias do artista, com formas trazidas da luz da Ilha do Ferro, no sertão alagoano. Texto de Renato Menezes.",img:"img/mensageiro-da-manha-almeida-dale-millan.jpg",cred:"Cortesia Almeida & Dale"},
{t:"Abstenções (uma miragem, mas permanente) — Nino Kapanadze",a:"Nino Kapanadze",v:"Almeida & Dale | Millan",ini:"2026-08-15",fim:"2026-09-19",d:"Individual da artista com curadoria de Cristiano Raimondi, no espaço Fradique 1360.",img:"img/abstencoes-uma-miragem-mas-permanente-almeida-dale-millan.jpg",cred:"Cortesia Almeida & Dale"},
{t:"Bauci: a cidade e os olhos — Érica Magalhães",a:"Érica Magalhães",v:"Galeria Aura",ini:"2026-08-08",fim:"2026-09-23",d:"Esculturas que equilibram porcelana e concreto; texto curatorial de Tatiana Ferraz.",img:"img/bauci-a-cidade-e-os-olhos-galeria-aura.webp",cred:"Érica Magalhães, Sem título, 2026. Foto: Flavio Freire"},
{t:"Brasil das Múltiplas Faces",v:"Itaú Cultural",ini:"2025-10-22",fim:"2027-10-31",d:"Mostra de longa duração com obras do acervo do Itaú Cultural. Entrada gratuita."},
{t:"Joan Miró: Mestre das Formas",a:"Joan Miró",v:"MAB FAAP",ini:"2026-08-07",fim:"2026-10-12",d:"140 obras originais do catalão, várias inéditas no Brasil. Ingresso pago, vendido em mmf26.com.br."},
{t:"O Lado Escuro da Lua — Alfredo Jaar",a:"Alfredo Jaar",v:"Galeria Luisa Strina",ini:"2026-08-08",fim:"2026-09-19",d:"Trabalhos feitos no Chile entre 1974 e 1981, das grades de onzes sobre o golpe de 1973 ao projeto Estudos sobre a felicidade. Texto de Edward A. Vazquez.",img:"img/o-lado-escuro-da-lua-galeria-luisa-strina.webp",cred:"Cortesia Galeria Luisa Strina"},
{t:"confluências — Carolina Caycedo",a:"Carolina Caycedo",v:"MASP",ini:"2026-07-03",fim:"2026-10-04",d:"Fotografia, instalação, vídeo, performance e desenho no cruzamento entre arte, saberes ribeirinhos e movimentos sociais. Curadoria de Isabella Rjeille.",img:"img/confluencias-masp.jpg",cred:"Vista da exposição. Foto Eduardo Ortega / Cortesia MASP",vista:true},
{t:"Casa María Lionza — Sol Calero",a:"Sol Calero",v:"MASP",ini:"2026-07-03",fim:"2027-01-30",d:"Pavilhão no Vão Livre em dezesseis cores, com padrões pintados à mão e mosaicos, em referência a Lina Bo Bardi e às fachadas nordestinas. Curadoria de Adriano Pedrosa e Laura Cosendey."},
{t:"Histórias Latino-Americanas",v:"MASP",ini:"2026-09-04",fim:"2027-01-31",d:"Coletiva internacional em cinco núcleos temáticos sobre a construção histórica da ideia de América Latina. Curadoria de Amanda Carneiro e Julieta González, curadora-adjunta do MASP, com assistência de Teo Teotonio."},
{t:"Presença — Anna Maria Maiolino",a:"Anna Maria Maiolino",v:"Galeria Luisa Strina",ini:"2026-08-08",fim:"2026-09-19",d:"Individual da ítalo-brasileira, com obras de 1974 a 2026: as esculturas de vidro soprado da série Emanados, o raku de São Seis Raku, as radiografias de Marcas na Transparência e a fotografia X, da Fotopoemação. Texto de Lotte Johnson, curadora da Barbican.",img:"img/presenca-galeria-luisa-strina.webp",cred:"Sem título, da série Marcas na Transparência, 1998-2002 (detalhe). Cortesia Galeria Luisa Strina"},
{t:"Smoke — Lucia Nogueira",a:"Lucia Nogueira",v:"Gomide&Co",ini:"2026-08-07",fim:"2026-10-03",d:"Individual da artista no espaço da Avenida Paulista, organizada com o espólio de Lucia Nogueira.",img:"img/smoke-gomide-co.webp",cred:"Cortesia Gomide&Co"},
{t:"Quadros — Ubirajara Ribeiro",a:"Ubirajara Ribeiro",v:"Gomide&Co",ini:"2026-08-07",fim:"2026-10-03",d:"Individual no mezanino da galeria, em paralelo a Lucia Nogueira.",img:"img/quadros-gomide-co.webp",cred:"Cortesia Gomide&Co"},
{t:"Flores e Vasos — coletiva",a:"Rochelle Costi, Gaspar Gasparian, Robert Mapplethorpe",v:"Luciana Brito Galeria",ini:"2026-08-22",fim:"2026-10-17",d:"Curadoria de Nessia Pope. Fotografias de 1947 a 2020 em torno do gênero, entre vintages, prata e jato de tinta.",img:"",cred:""},
/* img/flores-e-vasos.jpg tirada em 23/09: e um padrao de azulejo circular, nao
   flor nem vaso — nao bate com a descricao nem com nenhum dos tres fotografos
   creditados. Apareceu errada no salao de 25/09 (a parede pendurou a mesma
   imagem que ja tinha passado por todas as medidas, sem ninguem checar SE ERA
   a obra). Achar a reproducao certa com a Luciana Brito antes de repor. */
{t:"Imagens do Interior — Fabiana de Barros",a:"Fabiana de Barros",v:"Luciana Brito Galeria",ini:"2026-08-22",fim:"2026-10-17",d:"Gravuras, colagens e assemblages de resina mineral, mais uma instalação feita com o cineasta Michel Favre para a casa modernista de Rino Levi.",img:"img/imagens-do-interior.jpg",cred:"Cortesia Luciana Brito Galeria"},
{t:"Cantaria — Daniel Jorge",a:"Daniel Jorge",v:"Mendes Wood DM",ini:"2026-08-22",fim:"2026-11-06",d:"Primeira individual do artista em São Paulo: 23 obras em pedra-sabão, entre escultura, relevo, instalação e performance. Ensaio de Carlos Quijon Jr.",img:"img/cantaria-daniel-jorge.jpg",cred:"Foto Renan Benedito / Cortesia Mendes Wood DM"},
{t:"Déboussolé est le mot exact — Jean Claracq",a:"Jean Claracq",v:"Mendes Wood DM",ini:"2026-08-22",fim:"2026-11-06",d:"Dez pinturas de pequeno formato, a maioria entre 10 e 20 centímetros. Texto de Renato Menezes.",img:"img/deboussole-jean-claracq.jpg",cred:"Cortesia do artista e Mendes Wood DM"},
{t:"É Tempo Ainda",v:"Janaina Torres Galeria",ini:"2026-08-15",fim:"2026-10-17",d:"Vinte e seis artistas de gerações diferentes, com curadoria de Heloisa Amaral Peixoto, nos dez anos da galeria.",img:"img/e-tempo-ainda-janaina-torres-galeria.webp",cred:"Cortesia Janaina Torres Galeria"},
{t:"Céu de concreto — Luiz Carlos Paulino",a:"Luiz Carlos Paulino",v:"Central Galeria",ini:"2026-08-15",fim:"2026-09-19",d:"Individual do artista com texto crítico de Lilia Moritz Schwarcz.",img:"img/ceu-de-concreto-central-galeria.webp",cred:"Cortesia Central Galeria"},
{t:"Uma Obra: Pintura sem fim",a:"Gui Teixeira",v:"Pinacoteca de São Paulo",ini:"2026-07-04",fim:"2028-01-31",d:"Terceira edição do projeto Uma Obra: uma parede de carpete recebe centenas de peças de feltro colorido que o público move e recompõe (Pina Luz). Colaboração do artista Gui Teixeira.",img:"img/uma-obra-pintura-sem-fim-pinacoteca-de-sao-paulo.jpg",cred:"Cortesia Pinacoteca de São Paulo"},
{t:"Para crianças: experiências com a arte desde 1968",v:"Pinacoteca Contemporânea",ini:"2026-05-30",fim:"2026-10-18",d:"Onze artistas e obras que convidam crianças a intervir; a mais antiga é de 1968. Concebida pela Haus der Kunst, de Munique, com a Pinacoteca (Pina Contemporânea).",img:"img/para-criancas-experiencias-com-a-arte-desde-1968-pinacoteca-.jpg",cred:"Vista da exposição. Foto Levi Fanan / Cortesia Pinacoteca de São Paulo",vista:true},
{t:"Beatriz Milhazes: gravuras do acervo da Pinacoteca",a:"Beatriz Milhazes",v:"Estação Pinacoteca",ini:"2026-05-16",fim:"2027-03-14",d:"27 gravuras feitas entre 1996 e 2019 com a Durham Press (Pina Estação).",img:"img/beatriz-milhazes-gravuras-do-acervo-da-pinacoteca-pinacoteca.jpg",cred:"Vista da exposição. Foto Levi Fanan / Cortesia Pinacoteca de São Paulo",vista:true},
{t:"trágico subúrbio — Paulo Pedro Leal",a:"Paulo Pedro Leal",v:"Pinacoteca de São Paulo",ini:"2026-04-11",fim:"2026-11-08",d:"Mais de 50 pinturas dos anos 1950 e 1960, entre naufrágios, conflitos urbanos e cenas de rua. Primeira mostra institucional do artista autodidata carioca.",img:"img/tragico-suburbio-pinacoteca-de-sao-paulo.jpg",cred:"Vista da exposição. Foto Levi Fanan / Cortesia Pinacoteca de São Paulo",vista:true},
{t:"Ibirapema — Olinda Tupinambá",a:"Olinda Tupinambá",v:"Pinacoteca de São Paulo",ini:"2026-04-11",fim:"2026-12-27",d:"Filme de 2022 comissionado para a mostra Atos Modernos, com a transformação em onça como método. Curadoria de Ana Paula Lopes."},
{t:"Solange Pessoa: outras escalas",a:"Solange Pessoa",v:"Itaú Cultural",ini:"2026-08-04",fim:"2026-11-01",d:"150 desenhos inéditos, filmes experimentais e uma instalação da artista mineira."},
{t:"Delírio Tropical – Recanto",v:"Sesc Pinheiros",ini:"2026-05-06",fim:"2026-10-12",d:"Cerca de 280 obras de 130 artistas de todas as regiões; curadoria de Orlando Maneschy e Keyla Sobral."},
{t:"Tudo que eu sei, eu aprendi à noite — Luísa Matsushita",a:"Luísa Matsushita",v:"Cultura Artística",ini:"2026-08-15",fim:"2026-09-27",d:"Pinturas inéditas sobre o centro e a noite paulistana; estreia do programa Aberto Solo.",img:"img/tudo-que-eu-sei-eu-aprendi-a-noite-cultura-artistica.jpg",cred:"Divulgação"},
{t:"Tecituras",v:"Farol Santander",ini:"2026-07-17",fim:"2026-10-18",d:"Cerca de 30 obras têxteis de 30 artistas brasileiros; curadoria de Denise Mattar."},
{t:"Pequeno mapa do tempo — Paula Siebra",a:"Paula Siebra",v:"Mendes Wood DM — Casa Iramaia",ini:"2026-08-25",fim:"2026-10-24",d:"Pinturas a óleo sobre os ciclos de chuva, festa, vento e seca em Fortaleza.",img:"img/pequeno-mapa-do-tempo-mendes-wood-dm-casa-iramaia.webp",cred:"Cortesia Mendes Wood DM"},
{t:"Tudo que inventei aconteceu — Flávia Junqueira",a:"Flávia Junqueira",v:"Zipper Galeria",ini:"2026-08-08",fim:"2026-09-26",d:"Fotografias inéditas produzidas ao longo de um mês em Nova York.",img:"img/tudo-que-inventei-aconteceu-zipper-galeria.webp",cred:"Cortesia Zipper Galeria"},
{t:"No corpo e na paisagem, o que resta é o pó — Henrique Detomi",a:"Henrique Detomi",v:"Zipper Galeria",ini:"2026-08-08",fim:"2026-09-26",d:"Pintura a partir da caminhada e da terra aberta do interior de Minas.",img:"img/no-corpo-e-na-paisagem-o-que-resta-e-o-po-zipper-galeria.webp",cred:"Cortesia Zipper Galeria"},
{t:"Assim Bordei Meus Sonhos: Margarida L. Kanciukaitis Pandolfo",a:"Margarida L. Kanciukaitis Pandolfo",v:"Museu da Imigração",ini:"2026-07-10",fim:"2026-10-06",d:"Cerca de 100 peças em bordado, retalho, crochê e pintura, algumas feitas com os filhos, OSGEMEOS, que assinam a curadoria. Primeira individual da artista no Brasil.",img:"img/assim-bordei-meus-sonhos-margarida-l-kanciukaitis-pandolfo-m.png",cred:"Cortesia Museu da Imigracao"},
{t:"Beijo de Língua — Nelson Felix",a:"Nelson Felix",v:"MAC USP",ini:"2026-05-30",fim:"2026-11-29",d:"Individual do escultor carioca no MAC USP. Entrada gratuita."},
{t:"39º Panorama da Arte Brasileira: Depois que tudo foi dito",v:"MAM São Paulo",ini:"2026-09-12",fim:"2027-01-24",d:"Curadoria de Diane Lima, com 33 artistas de 13 estados. A mostra marca o retorno do museu à sede do Ibirapuera após a reforma da marquise."},
{t:"Constelação em trânsito: uma escuta cartográfica",v:"Galpão da Lapa",ini:"2025-09-06",fim:"2027-03-01",d:"Mostra de longa duração da coleção privada de arte contemporânea brasileira do Galpão da Lapa, organizada em três eixos - Arquiteturas do Inconsciente, Geometrias do Sul e Topologias do Orgânico - a partir de uma escuta do próprio acervo. Visitas guiadas gratuitas mediante agendamento, quintas e sábados.",img:"img/constelacao-em-transito-uma-escuta-cartografica-galpao-da-la.jpg",cred:"Cortesia Galpão da Lapa"},
{t:"Arteônica da Paisagem — Aldir Mendes de Souza",a:"Aldir Mendes de Souza",v:"Galeria Contempo",ini:"2026-08-15",fim:"2026-09-19",d:"Cerca de 20 obras marcam o retorno da produção do artista ao circuito após cerca de 15 anos. Curadoria de Fabrício Reiner.",img:"img/arteonica-da-paisagem-galeria-contempo.jpg",cred:"Cortesia Galeria Contempo"},
{t:"Vonta de vi dada dada — Ernesto Neto (Jardins)",a:"Ernesto Neto",v:"Fortes D'Aloia & Gabriel — Galeria",ini:"2026-08-22",fim:"2026-10-17",d:"Individual aberta simultaneamente nas duas sedes paulistanas da galeria. Esculturas em crochê de algodão, cordas trançadas, bambu, aço corten e barro, com a série inédita de esculturas de parede que o artista chama de InsePás.",img:"img/vonta-de-vi-dada-dada-fortes-d-aloia-gabriel-galeria.jpg",cred:"Vista da exposição. Foto Eduardo Ortega / Cortesia Fortes D'Aloia & Gabriel",vista:true},
{t:"Vonta de vi dada dada — Ernesto Neto (Barra Funda)",a:"Ernesto Neto",v:"Fortes D'Aloia & Gabriel — Galpão",ini:"2026-08-22",fim:"2026-10-24",d:"Metade em galpão da individual que Neto abriu nas duas sedes da galeria no mesmo dia. Inclui escultura monumental em aço corten cuja estrutura ramificada evoca ao mesmo tempo paisagem montanhosa e corpo vivo.",img:"img/vonta-de-vi-dada-dada-fortes-d-aloia-gabriel-galpao.jpg",cred:"Vista da exposição. Foto Eduardo Ortega / Cortesia Fortes D'Aloia & Gabriel",vista:true},
{t:"O homem nu — Efrain Almeida",a:"Efrain Almeida",v:"Fortes D'Aloia & Gabriel — Galpão",ini:"2026-08-22",fim:"2026-10-24",d:"Primeira mostra abrangente do artista na galeria desde sua morte: obras produzidas entre 1995 e 2024, entre escultura em madeira umburana, pintura a óleo, bordado e aquarela. Texto de Márcia Fortes.",img:"img/o-homem-nu-fortes-d-aloia-gabriel-galpao.jpg",cred:"Vista da exposição. Foto Eduardo Ortega / Cortesia Fortes D'Aloia & Gabriel",vista:true},
{t:"No encalço do líquen — Tania Ximena",a:"Tania Ximena",v:"Galatea",ini:"2026-08-20",fim:"2026-10-17",d:"Individual da artista no espaço da Oscar Freire, com texto crítico de Miguel A. López.",img:"img/no-encalco-do-liquen.jpg",cred:"Cortesia Galatea"},
{t:"Representações brasileiras — Bienal de Veneza (1978)",v:"Galatea",ini:"2026-08-20",fim:"2026-10-17",d:"Coletiva no espaço da Padre João Manuel sobre a representação brasileira na Bienal de Veneza de 1978; curadoria de Guto Ezek e Tomás Toledo."},
{t:"Por Elas, Com Elas: Do Moderno ao Contemporâneo",v:"DAN Galeria",ini:"2026-09-09",fim:"2026-11-07",d:"Coletiva com obras de meados do século 20 aos dias atuais, em núcleo histórico — com Tarsila do Amaral, Anita Malfatti, Lygia Clark e Tomie Ohtake — e núcleo contemporâneo. Curadoria de Maria Alice Milliet.",img:"img/por-elas-com-elas-do-moderno-ao-contemporaneo-dan-galeria.jpg",cred:"Cortesia DAN Galeria"},

/* --- confirmadas na fonte primária em 14/09/2026, casas já mapeadas sem nada em cartaz na base --- */
{t:"Uma Coisa Leva à Outra",a:"Fernanda Pompermayer",v:"Galeria Luis Maluf",ini:"2026-08-22",fim:"2026-09-23",d:"Exposição individual, na unidade da Barra Funda.",img:"",cred:""},
{t:"Mensageiro da Manhã",a:"André Ricardo",v:"Almeida & Dale",ini:"2026-08-15",fim:"2026-09-19",d:"Exposição individual.",img:"",cred:""},
{t:"Abstenções (uma miragem, mas permanente)",a:"Nino Kapanadze",v:"Almeida & Dale",ini:"2026-08-15",fim:"2026-09-19",d:"Exposição individual.",img:"",cred:""},
{t:"Autobiografia de um Fio",a:"Sheila Hicks",v:"Galeria Nara Roesler",ini:"2026-08-29",fim:"2026-10-24",d:"Exposição individual.",img:"img/autobiografia-de-um-fio-galeria-nara-roesler.webp",cred:"Foto Tatiana Mito / Cortesia Nara Roesler"},
{t:"Abismos Urbanos e o Plano Celeste",a:"Eduardo Coimbra",v:"Galeria Lume",ini:"2026-09-12",fim:"2026-11-14",d:"Exposição individual.",img:"img/abismos-urbanos-e-o-plano-celeste-galeria-lume.jpg",cred:"Cortesia Galeria Lume"},
{t:"Território de Disputa",a:"Kilian Glasner",v:"Galeria Lume",ini:"2026-09-12",fim:"2026-11-14",d:"Pinturas feitas com saibro — laterita alaranjada recolhida no sertão —, cortadas pelas faixas brancas de uma quadra de tênis, como alegoria de disputa por território.",img:"img/territorio-de-disputa-galeria-lume.jpg",cred:"Cortesia Galeria Lume"},
{t:"ambiguidade construtiva e ativação do espaço",a:"Wolfram Ullrich",v:"Galeria Raquel Arnaud",ini:"2026-09-02",fim:"2026-10-30",d:"Exposição individual; imagem de divulgação de autoria de Elizabeth Jobim.",img:"img/ambiguidade-construtiva-e-ativacao-do-espaco-galeria-raquel-.jpg",cred:"Foto Elizabeth Jobim / Cortesia Galeria Raquel Arnaud",vista:true},
{t:"Desculpe, Rafael",a:"Felipe Scandelari",v:"Galeria Dezoito",ini:"2026-09-12",fim:"2026-10-24",d:"Exposição individual, na sede paulistana da galeria.",img:"",cred:""},
{t:"Longitudes",a:"Johanna Calle",v:"Galeria Marília Razuk",ini:"2026-09-12",fim:"2026-12-12",d:"Exposição individual.",img:"img/longitudes-galeria-marilia-razuk.webp",cred:"Cortesia Galeria Marília Razuk"},
{t:"Cavalinhas e Falésias",a:"Carolina Colichio",v:"Galeria Marília Razuk",ini:"2026-09-12",fim:"2026-11-03",d:"Exposição individual.",img:"img/cavalinhas-e-falesias-galeria-marilia-razuk.webp",cred:"Cortesia Galeria Marília Razuk"},
{t:"Antonio Peticov – A Exposição",a:"Antonio Peticov",v:"Centro Cultural São Paulo (CCSP)",ini:"2026-09-15",fim:"2026-09-20",d:"Retrospectiva de 50 anos de carreira, cerca de 400 obras entre pintura, desenho, escultura, instalação, gravura e música, no Piso Caio Graco.",img:"",cred:""},
{t:"Água / Óleo",a:"Marina Sader, Poli Pieratti",v:"GRUTA Espaço de Arte Contemporânea",ini:"2026-08-22",fim:"2026-09-19",d:"Coletiva com curadoria de Ariana Nuala, na sede da Barra Funda.",img:"",cred:""},

/* --- casas novas mapeadas hoje: mostra atual confirmada na fonte --- */
{t:"Habitar São Paulo: relatos femininos",a:"",v:"Casa Museu Ema Klabin",ini:"2026-05-30",fim:"2026-09-27",d:"Coletiva de relatos femininos sobre a cidade de São Paulo.",img:"",cred:""},
{t:"Do museu ao ateliê, do ateliê ao museu: o que a gráfica pode imaginar?",a:"",v:"Museu Lasar Segall",ini:"2026-07-18",fim:"2026-10-19",d:"Coletiva reunindo gravura em metal, xilogravura, monotipia e desenho de doze artistas visuais.",img:"",cred:""},

/* --- 91 de 125 casas sem nada em cartaz (23/09/2026): apuração de 50 casas
   com sinal no site, em 5 frentes paralelas. 18 mostras confirmadas na fonte
   primária, cada uma abrindo casa nova na base ou corrigindo uma já mapeada.
   Uma delas (Paço das Artes) ainda não abriu — fica registrada certa e o
   `check.js`/`destaque.js` já sabem lidar com `ini` no futuro. */
{t:"Paisagem temática para um novo normal",a:"Daniel Acosta",v:"Verve Galeria",ini:"2026-08-29",fim:"2026-10-31",d:"Instalação que ocupa a nova sala da galeria e a sobreloja do Edifício Louvre, com texto crítico de Agnaldo Farias; usa materiais de design e arquitetura — flores e arbustos de plástico, fórmica — em tom irônico sobre o \"novo normal\".",img:"",cred:""},
{t:"Espaço tempo",a:"Wojtek Kostrzewa",v:"Danielian São Paulo",ini:"2026-08-17",fim:"2026-10-27",d:"Primeira individual no Brasil do artista polonês radicado em São Paulo, com curadoria de Ginevra Bria; transita entre fotografia, escultura e pintura a partir de códigos visuais e objetos da paisagem urbana.",img:"",cred:""},
{t:"Irracional",a:"Frederico Filippi",v:"Marli Matsumoto Arte Contemporânea",ini:"2026-08-01",fim:"2026-10-10",d:"Reúne diferentes grupos de trabalhos em que o acaso, o descontrole e o gesto errático operam como motores de criação, com curadoria de Germano Dushá.",img:"img/irracional-marli-matsumoto.jpg",cred:"Cortesia Marli Matsumoto Arte Contemporânea",vista:true},
{t:"Controle | Corrosão | Dispersão",a:"Beto Shwafaty",v:"Galeria Leme",ini:"2026-09-03",fim:"2026-10-02",d:"Individual com cerca de 15 trabalhos que pensam a sociedade contemporânea a partir de objetos e materiais do cotidiano, incluindo a obra inédita \"O sonho da terra, é o sonho americano\".",img:"img/controle-corrosao-dispersao-galeria-leme.webp",cred:"Cortesia Galeria Leme",vista:true},
{t:"Espaço Profundo",a:"Mariana Rocha",v:"A Gentil Carioca SP",ini:"2026-08-15",fim:"2026-10-24",d:"Pinturas que expandem a pesquisa da artista sobre corpos d'água, aproximando dimensões corporal e cósmica; texto de André Pitol, curador adjunto da 36ª Bienal de São Paulo.",img:"img/espaco-profundo-a-gentil-carioca.jpg",cred:"Cortesia A Gentil Carioca",vista:true},
{t:"Marlene Barros: tecitura do feminino",a:"Marlene Barros",v:"CCBB São Paulo",ini:"2026-08-26",fim:"2027-01-25",d:"Reúne 15 obras entre esculturas, bordados, crochês, instalações e objetos que discutem a feminilidade como construção histórica, social e cultural; curadoria de Betânia Pinheiro.",img:"",cred:""},
{t:"Fernando Lemos: quanto mais desejo, mais invento o que vejo",a:"Fernando Lemos",v:"IMS Paulista",ini:"2026-09-19",fim:"2027-02-07",d:"Retrospectiva do centenário de nascimento de Fernando Lemos (1926–2019), com cerca de 400 itens entre fotografias, desenhos, projetos gráficos e poesia produzidos ao longo de 70 anos; curadoria de Thyago Nogueira.",img:"",cred:""},
{t:"Sheila Hicks: o que que é isso?",a:"Sheila Hicks",v:"Instituto Tomie Ohtake",ini:"2026-08-28",fim:"2026-10-25",d:"Cerca de 30 obras de seis décadas de carreira em fibra têxtil — tecelagens, relevos, esculturas de escala arquitetônica — e fotografias feitas por Hicks e por Sergio Larrain na América Latina nos anos 1950; curadoria de Ana Roman, Luis Pérez-Oramas e Paulo Miyada.",img:"",cred:""},
{t:"Tatiana Blass: Contrarregra",a:"Tatiana Blass",v:"Instituto Tomie Ohtake",ini:"2026-08-28",fim:"2026-10-25",d:"Cerca de 50 obras produzidas entre 2008 e 2026 — pinturas, esculturas, instalações e vídeos em vidro, bronze, cera e cerâmica —, das séries Contraluz, Metade da fala no chão, Quebra-quebra e Nó; curadoria de Ana Roman e Lahayda Mamani Poma.",img:"",cred:""},
{t:"O Barco",a:"Grada Kilomba",v:"Sesc Pompeia",ini:"2026-09-22",fim:"2026-10-25",d:"Instalação de 134 blocos de madeira queimada somando mais de 220 m², desenhando a silhueta do porão de um navio negreiro; dezoito blocos trazem um poema da artista em seis línguas. Curadoria de Marília Loureiro e Júlia Rebouças.",img:"",cred:""},
{t:"Mulheres da Boca",a:"Wagner Carvalho",v:"MIS — Museu da Imagem e do Som",ini:"2026-09-02",fim:"2026-10-18",d:"Fotografias inéditas feitas durante as filmagens do documentário \"Mulheres da Boca\" (1981), nas ruas da Boca do Lixo na virada dos anos 1970 para os 1980; curadoria de Inês Castilho, Marcelo Colaiácovo e William Plotnik.",img:"img/mulheres-da-boca-mis.png",cred:"Fotografia de Wagner Carvalho"},
{t:"50 anos sem JK",a:"Jean Manzon",v:"MIS — Museu da Imagem e do Som",ini:"2026-08-15",fim:"2026-10-04",d:"Fotografias inéditas de Juscelino Kubitschek da coleção do fotógrafo francês Jean Manzon, somadas a imagens do acervo do MIS; curadoria de André Sturm, em parceria com o Consulado-Geral da República Tcheca em São Paulo.",img:"img/50-anos-sem-jk-mis.jpg",cred:"Cortesia MIS"},
{t:"Chão de histórias | Nova Fotografia 2026",a:"Ana Leal",v:"MIS — Museu da Imagem e do Som",ini:"2026-08-11",fim:"2026-09-27",d:"Quarta exposição do programa anual Nova Fotografia do MIS; série fotográfica sobre o sertão pernambucano, cruzando fotografia, colagem, tecidos e argila em torno de memória e território.",img:"img/chao-de-historias-mis.png",cred:"Cortesia MIS"},
{t:"Invenção da Paisagem-Memória",a:"Jeane Terra",v:"Casa Seva",ini:"2026-08-19",fim:"2026-09-26",d:"Mostra realizada em parceria entre Casa Seva e Janaina Torres Galeria, com curadoria de Heloisa Amaral Peixoto.",img:"",cred:""},
{t:"Frei Agostinho de Jesus – séc. XVII: Pioneiro da Arte Sacra no Brasil",a:"Frei Agostinho de Jesus",v:"Fundação Maria Luisa e Oscar Americano",ini:"2026-05-17",fim:"2026-10-02",d:"Primeira individual do escultor-oleiro Frei Agostinho de Jesus (c.1600/10–1661), ativo em Santana de Parnaíba a partir de 1643; reúne esculturas em terracota, oratórios bandeiristas, prataria sacra e mobiliário colonial. Curadoria de Rafael Schunk.",img:"img/frei-agostinho-fmloa.webp",cred:"Cortesia Fundação Maria Luisa e Oscar Americano",vista:true},
{t:"loopinpindorama",a:"",v:"Martins&Montero",ini:"2026-08-20",fim:"2026-10-17",d:"Coletiva com curadoria de Felipe Molitor que articula obras do acervo da galeria com artistas convidados: uma sala de videoarte brasileira em sistema de projeção interativa e um conjunto de pinturas, esculturas, fotografias e instalações organizado por afinidades formais.",img:"",cred:""},
{t:"Elementares",a:"Denise Milan",v:"Museu de Arte Sacra de São Paulo",ini:"2026-05-29",fim:"2026-09-27",d:"Quatro décadas de pesquisa com geodos e cristais organizados em cinco núcleos, incluindo peças em alumínio fundido derivadas de formas cristalinas. Curadoria de Naomi Moniz, apoio DAN Galeria.",img:"img/elementares-museu-arte-sacra.jpg",cred:"Cortesia Museu de Arte Sacra de São Paulo"},
{t:"NO LIMITE: forma e transformação",a:"",v:"Paço das Artes",ini:"2026-09-26",fim:"2026-11-15",d:"Coletiva com 17 artistas de 6 países que explora o conceito de \"situação-limite\" do filósofo Karl Jaspers, combinando aspectos psicológicos com elementos como água, pedras, sal e luz. Curadoria de Martin Juef, cocuradoria de Francisco Klinger Carvalho.",img:"img/no-limite-paco-das-artes.png",cred:"Nina E. Schönefeld, still de vídeo / Cortesia Paço das Artes"},
{t:"Um Xirê para Emanoel",a:"Alberto Pitta",v:"Museu Afro Brasil Emanoel Araujo",ini:"2026-05-22",fim:"",d:"Reúne 22 serigrafias e pinturas de Alberto Pitta em homenagem a Emanoel Araujo (1940–2022), ao lado de duas esculturas em relevo do acervo do museu e bonecas Abayomi de Mãe Detinha de Xangô. Curadoria de Vera Nunes.",img:"",cred:""},
{t:"Afríquia: o artista como colecionador",a:"",v:"Museu Afro Brasil Emanoel Araujo",ini:"2026-06-26",fim:"",d:"Reúne mais de 200 obras e materiais de arquivo — esculturas, pinturas, máscaras, fotografias, livros, discos e têxteis, com destaque para peças da Nigéria e do Benin — mostrando como Emanoel Araujo formou o acervo de arte africana do museu. Curadoria de Gabrielle Nascimento.",img:"",cred:""},
{t:"Há quanto tempo pensando nisso",a:"Rachel Zuanon, Edson Pfutzenreuter, Sylvia Furegatti, Marta Strambi, Mauricius Farina, Sérgio Niculitcheff, Luise Weiss, Gilberto Alexandre Sobrinho, Cesar & Lois",v:"Memorial da América Latina",ini:"2026-09-23",fim:"2026-10-13",d:"Nove docentes-artistas do Instituto de Artes da Unicamp, com trabalhos em pintura, fotografia, gravura, xilogravura, vídeo e instalações multissensoriais, na Galeria Marta Traba. Curadoria de Sylvia Furegatti, Mauricius Farina e César Baio.",img:"",cred:""},
{t:"Esgarçar",a:"Andrey Rossi, Beatriz Lindenberg, Bruno Cançado, Desali, Giovani Fantauzzi, Julia Pereira, Laura Villarosa, Liane Roditi, Manoel Veiga, Manuela Costa Lima, Maria Helena Andrés, Marina Rodrigues, Marinalva Rosa, Michelle Rosset, Moara Tupinambá, Naira Pennacchi, Paula Huven, Renata Egreja, Thany Sanches, Yasmin Guimarães, Yohana Oizumi",v:"AM Galeria",ini:"2026-09-12",fim:"2026-10-10",d:"Coletiva com 21 artistas, curadoria de Mario Gioia, cruzando pintura, fotografia, têxtil, escultura, vídeo, performance e desenho em torno de noções de limite (dentro/fora, figuração/abstração).",img:"img/esgarcar-am-galeria.jpg",cred:"Cortesia AM Galeria",vista:true},
/* confirmado no Instagram (@vazio_criativo_, 23/09/2026), checagem manual.
   Só cartaz disponível, sem imagem de obra. */
{t:"Roxo em Tons",a:"",v:"Vazio Criativo",ini:"2026-10-03",fim:"2026-10-09",d:"Tons Coletivo apresenta exposição coletiva para ver o mundo em roxo, com curadoria de Audrey Barbosa.",img:"",cred:""},
{t:"Passeio Noturno — André Crespo",a:"André Crespo",v:"A7MA Galeria",ini:"2026-09-25",fim:null,d:"Pinturas da noite de Paris feitas por um corpo à deriva, que deixa a cidade escolher o caminho. Curadoria de Rogério D’Avila Ortiz. Abertura em 25 de setembro, das 16h às 22h; encerramento não divulgado.",img:"",cred:""},
/* confirmado no Instagram (@mits.galeria, 23/09/2026). Curadoria e lista
   de artistas apareciam no cartaz mas cortados/ilegiveis no zoom -- nao
   incluidos, para nao chutar nome. */
{t:"Coordenadas Improváveis",a:"",v:"MITS Galeria",ini:"2026-09-24",fim:"",d:"Coletiva na MITS Galeria.",img:"",cred:""},
/* confirmado no Instagram (@espacorepublica, 25/09/2026). Lista de artistas
   tirada do cartaz da 2a edicao (imagem do post); flyer tipografico, sem
   imagem de obra disponivel. */
{t:"Vestígios: cartografias de gestos do Espaço República",a:"Alberto Boni, Alessandro Corrêa, Alexis Lopes, Andrea Natali, Andréia Reis, Claudia Briza, Claudia Vicente, Daniel Almeida, Duda Breda, Elaine Fontes, Gabriella Arantes, Gabriela Siqueira, Gisele Hasler, Igor Romana, Jacson Trierveiler, Jaques Faing, João Rietmann, Luciana Arantes, Luisa Bresser, Maazo Heck, Maria do Carmo Verdi, Marina Sadala, Michaela A F, Phil Haji-Touma, Rafael Beck, Sheila Kracochansky, Silvana Boni, Silvio Dworecki, Sylvia Sóglia, Tamara Roman, Tiago Alencar, Veridiana Magalhães, Witor Ressutti, Zico Farina",v:"Espaço República",ini:"2026-09-24",fim:"2026-10-10",d:"Segunda edição da mostra dos artistas residentes do Espaço República, com curadoria de Ana Carolina Ralston, reunindo 34 artistas. Visitação de quarta a sábado, 12h às 18h, com programação de ateliês abertos aos sábados.",img:"",cred:""},
/* confirmado no Instagram (@galeriasuperficie, 17 e 23/09/2026). */
{t:"Gestos",v:"Galeria Superfície",ini:"2026-08-29",fim:"2026-10-17",d:"Coletiva com 27 artistas de diferentes gerações, a partir da ideia de gesto do livro de Vilém Flusser. Curadoria de Paulo Venancio Filho e Gustavo Nóbrega, inaugura a nova sede da galeria na Vila Madalena.",img:"img/gestos-galeria-superficie.jpg",cred:"Cortesia Galeria Superfície",vista:true},
/* confirmado no Instagram (@massape_projetos, 21/09/2026). */
{t:"Mirações",a:"Yohana Oizumi, Bruno Romi",v:"Massapê Projetos",ini:"2026-10-03",fim:null,d:"Individual dupla com curadoria de Ana Cândida de Avelar. Instalação, performance, desenho, colagem, pintura e escultura a partir do imaginário religioso cristão. Abertura em 3 de outubro, das 14h às 18h, com performance às 15h; encerramento não divulgado.",img:"",cred:""}
];

/* ================= IMERSIVAS =================
Experiencias imersivas comerciais - nao sao mostra com curadoria, sao produto
pago. Entram no escopo do site por decisao do Lucas em 11/08/2026, mas em array
proprio: misturar com EXPOS estragaria a agenda, que e so galeria e museu com
curadoria. Mesma estrutura de EXPOS, mais o campo `valor` (ingresso), que aqui
e obrigatorio. */
const IMERSIVAS = [
{t:"Horizonte de Quéops: Viagem ao Antigo Egito",v:"Espaço Cultura VR",ini:"2025-12-19",fim:"2026-09-21",d:"Expedição imersiva de realidade virtual sobre o Egito Antigo, em parceria com Peter Der Manuelian, egiptólogo de Harvard. Quinta a segunda, 10h-21h20.",valor:"A partir de R$ 88 (meia R$ 44)",addr:"Shopping Cidade São Paulo, Av. Paulista",b:"Bela Vista",fonte:"icarabe.org, espacoculturavr.com.br"},
{t:"O Brasil de Tarsila",a:"Tarsila do Amaral",v:"Nubank Arte Lab",ini:"2026-08-15",fim:"2026-10-31",d:"Maior exposição imersiva já dedicada à artista: cerca de 40 obras em projeção 360° distribuídas por dez salas, com trilha sonora e recursos sensoriais. Marca os 140 anos de nascimento da artista e inaugura o Nubank Arte Lab. Quarta a segunda e feriados, 10h-22h.",valor:"conferir no site - nao divulgado nas fontes consultadas",addr:"Conjunto Nacional, Av. Paulista",b:"Bela Vista",fonte:"dasartes.com.br, jammusical.com"}
];


/* ================= EDITAIS =================
cat: fomento | residencia | premio | chamada
prazo: YYYY-MM-DD · null = fluxo continuo (sem data de encerramento divulgada)
Nunca inventar prazo: se a fonte nao trouxer data, deixe null e explique no campo d. */
const EDITAIS = [
{t:"Clínica Geral 2026 — Ateliê397",org:"Ateliê397",cat:"chamada",prazo:null,quem:"Artistas visuais em qualquer estágio de carreira",onde:"São Paulo",taxa:"a confirmar",d:"Grupos de acompanhamento de projetos do Ateliê397 no segundo semestre de 2026. O espaço informa inscrições abertas e prorrogadas, sem divulgar data de encerramento.",link:"https://atelie397.com",fonte:"Instagram @atelie397, 03/08/2026"},
{t:"Propostas de exposição para o MAB FAAP",org:"Museu de Arte Brasileira da FAAP",cat:"chamada",prazo:null,quem:"Artistas, curadores e coletivos",onde:"São Paulo",taxa:"gratuita",d:"O museu recebe propostas de exposição em fluxo contínuo, por formulário online. Não há data de encerramento divulgada.",link:"https://faapinscricao.crmeducacional.com/formulario/2406",fonte:"faap.br/mab"}
];

/* ================= BAIRROS =================
Contagem de casas por bairro, usada na barra do rodapé e no filtro do diretório.

Era escrita à mão e envelhecia: em 20/08 anunciava 19 bairros e uma distribuição
que já não era a do VENUES, e o clique em "Jardins" filtrava só Jardim Paulista,
escondendo Cerqueira César, Jardim América e Jardim Europa. Agora sai do próprio
VENUES e não tem como divergir.

GRUPO_BAIRRO junta o que o leitor lê como um lugar só — "Jardins" é o circuito,
não um bairro do IBGE. Quem não está aqui entra pelo próprio nome. */
const GRUPO_BAIRRO = {
  "Jardim Paulista": "Jardins",
  "Cerqueira César": "Jardins",
  "Jardim América": "Jardins",
  "Jardim Europa":  "Jardins"
};
const bairroDe = v => GRUPO_BAIRRO[v.b] || v.b;
const BAIRRO_COUNTS = Object.entries(
  VENUES.reduce((acc, v) => { const k = bairroDe(v); if (k) acc[k] = (acc[k] || 0) + 1; return acc; }, {})
).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'));
/* ================= EM FOCO =================
Bloco de destaque no topo. Troque quando quiser.
publi:true acrescenta o selo "conteúdo patrocinado" (use sempre que for espaço pago). */
 const FOCO = {
  t: "Mulheres da Boca",
  v: "MIS — Museu da Imagem e do Som",
  quem: "Wagner Carvalho",
  txt: "Fotografias inéditas feitas durante as filmagens do documentário \"Mulheres da Boca\" (1981), nas ruas da Boca do Lixo na virada dos anos 1970 para os 1980; curadoria de Inês Castilho, Marcelo Colaiácovo e William Plotnik. Abertura em 2 de setembro, até 18 de outubro.",
  link: "https://www.mis-sp.org.br",
  publi: false
};

/* ================= DESTAQUES JA USADOS =================
Historico do bloco "Em foco", para nao repetir a mesma mostra.
d = dia em que foi destaque (YYYY-MM-DD) · k = "titulo|venue", exatamente como no expo.
A entrada com a data de hoje trava o destaque do dia. Sem ela, o site escolhe sozinho:
primeiro quem abre hoje, depois a abertura mais proxima, ignorando tudo que ja apareceu
em algum dia anterior. Quando o acervo se esgota, o rodizio recomeca.
As entradas de 05/08 fecham o rodizio automatico antigo, que so girava entre as mostras
com imagem e por isso repetia a cada cinco dias.
Em empate de data de abertura, evite galeria que ja esteve em foco nos ultimos 7 dias,
mesmo que isso custe procurar a imagem de divulgacao. */
const DESTAQUES = [
  {d:"2026-09-26", k:"Mulheres da Boca|MIS — Museu da Imagem e do Som"},
  {d:"2026-09-25", k:"Controle | Corrosão | Dispersão|Galeria Leme"},
  {d:"2026-09-24", k:"NO LIMITE: forma e transformação|Paço das Artes"},
  {d:"2026-09-23", k:"Por Elas, Com Elas: Do Moderno ao Contemporâneo|DAN Galeria"},
  {d:"2026-09-22", k:"Autobiografia de um Fio|Galeria Nara Roesler"},
  {d:"2026-09-18", k:"Rajada encarnada — coletiva|Casa de Cultura do Parque"},
  {d:"2026-09-15", k:"Uma Obra: Pintura sem fim|Pinacoteca de São Paulo"},
  {d:"2026-09-14", k:"confluências — Carolina Caycedo|MASP"},
  {d:"2026-09-11", k:"Assim Bordei Meus Sonhos: Margarida L. Kanciukaitis Pandolfo|Museu da Imigração"},
  {d:"2026-09-10", k:"Mitologias do Mistério — Gabriel Omep|Casa de Cultura do Parque"},
  {d:"2026-09-09", k:"O homem nu — Efrain Almeida|Fortes D'Aloia & Gabriel — Galpão"},
  {d:"2026-09-08", k:"Charline von Heyl — individual|Auroras"},
  {d:"2026-09-07", k:"Macunaíma é Duwid|Pinacoteca de São Paulo"},
  {d:"2026-09-06", k:"Matéria e Energia — Damián Ortega|MASP"},
  {d:"2026-09-05", k:"Quadros — Ubirajara Ribeiro|Gomide&Co"},
  {d:"2026-09-04", k:"Déboussolé est le mot exact — Jean Claracq|Mendes Wood DM"},
  {d:"2026-09-03", k:"No meio da pedra — André Vargas|Galeria Vermelho"},
  {d:"2026-09-02", k:"No corpo e na paisagem, o que resta é o pó — Henrique Detomi|Zipper Galeria"},
  {d:"2026-09-01", k:"Vonta de vi dada dada — Ernesto Neto (Barra Funda)|Fortes D'Aloia & Gabriel — Galpão"},
  {d:"2026-08-31", k:"Presença — Anna Maria Maiolino|Galeria Luisa Strina"},
  {d:"2026-08-30", k:"Vonta de vi dada dada — Ernesto Neto (Jardins)|Fortes D'Aloia & Gabriel — Galeria"},
  {d:"2026-08-29", k:"Imagens do Interior — Fabiana de Barros|Luciana Brito Galeria"},
  {d:"2026-08-28", k:"Smoke — Lucia Nogueira|Gomide&Co"},
  {d:"2026-08-27", k:"Abstenções (uma miragem, mas permanente) — Nino Kapanadze|Almeida & Dale | Millan"},
  {d:"2026-08-26", k:"Masao Yamamoto — individual|Galeria Marcelo Guarnieri"},
  /* O historico so registra o dia em que a tarefa diaria rodou. Nos dias em que
     ela nao rodou, o site escolheu sozinho e ninguem anotou — e a trava
     anti-repeticao fica cega justamente ali. Foi assim que "Flores e Vasos"
     apareceu de novo em 25/08: ela ja tinha sido o destaque em 21 e 22/08, dias
     sem registro, porque abria em 22 e o codigo antigo punha abertura na frente
     de tudo. As duas linhas abaixo sao a reposicao desse buraco.
     Uma entrada por mostra, nao por dia (E17): fica o primeiro dia em que saiu.
     Continuam sem registro 07, 08 e 09/08. Nao foram preenchidos de proposito:
     reconstruir o que o site mostrou ha tres semanas exigiria a base daquele
     dia, e chutar entrada de historico e inventar dado. O check.js agora avisa
     quando existe dia sem registro. */
  {d:"2026-08-25", k:"Cantaria — Daniel Jorge|Mendes Wood DM"},
  {d:"2026-08-21", k:"Flores e Vasos — coletiva|Luciana Brito Galeria"},
  {d:"2026-08-24", k:"Pequeno mapa do tempo — Paula Siebra|Mendes Wood DM — Casa Iramaia"},
  {d:"2026-08-20", k:"No encalço do líquen — Tania Ximena|Galatea"},
   {d:"2026-08-19", k:"Tudo que inventei aconteceu — Flávia Junqueira|Zipper Galeria"},
   {d:"2026-08-18", k:"Sem Palavras — Vânia Mignone|Casa Triângulo"},
  {d:"2026-08-17", k:"Playful, Stormy, Continuing — Ayako Rokkaku|Baró Galeria"},
  {d:"2026-08-16",k:"Arteônica da Paisagem — Aldir Mendes de Souza|Galeria Contempo"},
  { d: "2026-08-15", k: "É Tempo Ainda|Janaina Torres Galeria" },
  { d: "2026-08-14", k: "Mensageiro da Manhã — André Ricardo|Almeida & Dale | Millan" },
  { d: "2026-08-13", k: "Tudo que eu sei, eu aprendi à noite — Luísa Matsushita|Cultura Artística" },
  { d: "2026-08-12", k: "Céu de concreto — Luiz Carlos Paulino|Central Galeria" },
{d:"2026-08-11",k:"To Love — Claudia Andujar e George Love|Galeria Vermelho"},
{d:"2026-08-10",k:"Bauci: a cidade e os olhos — Érica Magalhães|Galeria Aura"},
{d:"2026-08-04",k:"O Lado Escuro da Lua — Alfredo Jaar|Galeria Luisa Strina"},
{d:"2026-08-05",k:"Ígneo Piaga — Thiago Martins de Melo|Almeida & Dale | Millan"},
{d:"2026-08-05",k:"ÇA — Rita Lessa|Almeida & Dale | Millan"},
{d:"2026-08-05",k:"Ojú-Inú — Ayrson Heráclito|Simões de Assis"},
{d:"2026-08-06",k:"Eclodir o Efêmero — Luisa Bresser|Espaço República"}
];

/* ================= CONTATO =================
Para onde vão os envios do botão "Divulgue sua vernissage".
wa: número com DDI e DDD, só dígitos (ex.: "5511999999999"). Deixe "" para esconder o botão de WhatsApp. */
const CONTATO = { wa:"", email:"propagang8@gmail.com" };

return { foco: FOCO, destaques: DESTAQUES, contato: CONTATO, atualizado: "26/09/2026", venues: VENUES, expos: EXPOS, editais: EDITAIS, imersivas: IMERSIVAS, bairros: BAIRRO_COUNTS, grupoBairro: GRUPO_BAIRRO };
})();
