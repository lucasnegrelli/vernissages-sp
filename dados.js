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
{name:"Galeria Dezoito",ig:"galeria.dezoito",site:"https://galeriadezoito.com",addr:"R. Simpatia, 23",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5561,lng:-46.6872,info:"Espaço da Vila Madalena com foco em paisagem e pintura contemporânea."},
{name:"Marli Matsumoto Arte Contemporânea",ig:"marlimatsumoto_",site:"https://marlimatsumoto.com.br",addr:"R. João Alberto Moreira, 128",b:"Vila Madalena",z:"Oeste",tipo:"galeria",lat:-23.5542,lng:-46.6902,info:"Galeria + anexo experimental. Casa modernista de fim dos anos 1950."},
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
{name:"Yehudi Hollander-Pappi",site:"https://yehudihollanderpappi.com",addr:"Al. Lorena, 1295",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5628,lng:-46.6641,info:"Galeria de jovens artistas; linguagens experimentais e temporalidade expandida."},
/* site tirado em 23/09/2026: adelina.org.br tentou dois golpes na mesma
   sessao — popup falso pedindo pra abrir o PowerShell e colar comando
   ("ClickFix", tecnica de malware) numa tentativa, reCAPTCHA bloqueando
   o grid de exposicoes na outra. NAO visitar — nem o radar-fontes.js,
   nem ninguem — enquanto isso nao for investigado (site comprometido ou
   dominio expirado/repassado). */
{name:"Adelina Galeria",ig:"adelinainstituto",soIG:true,site:"",addr:"Pinheiros (endereço a confirmar)",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5648,lng:-46.6920,info:"Arte contemporânea com foco em novos diálogos e pertencimento."},
{name:"Arteedições Galeria",ig:"arteedicoes_galeria",soIG:true,addr:"Jardins (endereço a confirmar)",b:"Jardim Paulista",z:"Oeste",tipo:"galeria",lat:-23.5655,lng:-46.6638,info:"Gravuras e edições: Hirst, Kapoor, Opie, Sonia Gomes, Leda Catunda."},
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
{name:"Centro Cultural FIESP",site:"https://centrocultural.fiesp.com.br",addr:"Av. Paulista, 1313",b:"Cerqueira César",z:"Oeste",tipo:"institucional",lat:-23.5635,lng:-46.6544,ing:{g:true},info:"Centro cultural do Sesi-SP na Paulista, em frente à estação Trianon-Masp. Ingressos gratuitos, com reserva pelo Meu SESI."},
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
{name:"Mendes Wood DM — Casa Iramaia",ig:"mendeswooddm",site:"https://mendeswooddm.com",addr:"R. Iramaia, 105",b:"Jardim Europa",z:"Oeste",tipo:"galeria",lat:-23.5748,lng:-46.6752,info:"Segundo espaço paulistano da Mendes Wood DM, em casa modernista. Segunda a sexta, 11h–19h. Não abre sábado."},
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
{name:"Fólio Galeria",ig:"foliogaleria",site:"https://www.foliolivraria.com.br",addr:"R. Pedroso Alvarenga, 1046",b:"Itaim Bibi",z:"Sul",tipo:"galeria",lat:-23.5824,lng:-46.6804,info:"Especializada em livros de artista, edições limitadas e obras em papel desde 2000. Atendimento com hora marcada. Site e catálogo, sem mostra rotativa."},
{name:"Galeria Frente",ig:"galeriafrente",site:"https://galeriafrente.com.br",addr:"R. Dr. Melo Alves, 400",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5609,lng:-46.6705,info:"Já expôs Portinari, Tarsila do Amaral e Tomie Ohtake."},
{name:"Fundação Maria Luisa e Oscar Americano",site:"https://fundacaooscaramericano.org.br",addr:"Av. Morumbi, 4077",b:"Morumbi",z:"Oeste",tipo:"institucional",lat:-23.6013,lng:-46.7096,info:"Casa-museu com 75 mil m² de área verde. Terça a domingo, 10h–17h30."},
/* site tirado em 23/09/2026: bergamingomide.com.br nao resolve (DNS
   morto, confirmado no navegador e por fetch direto — ENOTFOUND). */
{name:"Galeria Carbono",site:"https://carbonogaleria.com.br",addr:"R. Joaquim Antunes, 59",b:"Jardim Paulistano",z:"Oeste",tipo:"galeria",lat:-23.5674,lng:-46.6790,info:"Edições de arte contemporânea (múltiplos, gravuras, livros de artista) desde 2013, membro da ABACT. Entrada gratuita."},
{name:"Estação Pinacoteca",site:"https://pinacoteca.org.br",addr:"Largo General Osório, 66",b:"Santa Ifigênia",z:"Centro",tipo:"institucional",lat:-23.5348,lng:-46.6388,info:"Prédio \"Pina Estação\" da Pinacoteca de São Paulo — mesma instituição, endereço e programação próprios."},
{name:"Galeria Olido",site:"https://prefeitura.sp.gov.br/web/cultura/galeria_olido",addr:"Av. São João, 473",b:"Centro",z:"Centro",tipo:"institucional",lat:-23.5433,lng:-46.6389,info:"Centro cultural municipal com salas de exposição e Centro de Fotografia, reformado em 2004."},
{name:"Galeria Pilar",site:"https://galeriapilar.com",addr:"R. Barra Funda, 1030",b:"Santa Cecília",z:"Centro",tipo:"galeria",lat:-23.5267,lng:-46.6597,info:"Desde 2011, 400 m² de espaço expositivo."},
{name:"Galeria Tato",ig:"galeriatato",site:"https://www.galeriatato.com",addr:"R. Barra Funda, 893",b:"Barra Funda",z:"Centro",tipo:"galeria",lat:-23.5275,lng:-46.6587,info:"Fundada em 2010 por Tato DiLascio."},
/* site tirado em 23/09/2026: cantogravura.com.br mostra pagina padrao
   da Locaweb "Dominio nao encontrado" — hospedagem sem site ativo. */
{name:"Gravura Brasileira",ig:"gravurabrasileira",site:"https://www.gravurabrasileira.com",addr:"R. Ásia, 219",b:"Cerqueira César",z:"Oeste",tipo:"galeria",lat:-23.5549,lng:-46.6840,info:"Fundada em 1998, único espaço do país dedicado exclusivamente à gravura. Acervo de cerca de 3 mil gravuras originais."},
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
{name:"MuBE",ig:"mube_sp",site:"",addr:"R. Alemanha, 221",b:"Jardim Europa",z:"Oeste",tipo:"institucional",lat:-23.5763,lng:-46.6764,info:"Museu Brasileiro de Escultura e Ecologia. Acervo arqueológico da FUMDHAM (Piauí) ao lado de escultura, desenho, pintura, gravura, fotografia e vídeo contemporâneos."},
{name:"Museu de Arte Sacra de São Paulo",site:"https://museuartesacra.org.br",addr:"Av. Tiradentes, 676",b:"Luz",z:"Centro",tipo:"institucional",lat:-23.5304,lng:-46.6314,info:"Na ala esquerda do Mosteiro da Luz. Via-Sacra de Victor Brecheret em terracota (1942–1946); obras de Anita Malfatti e Aldo Bonadei."},
{name:"Museu Lasar Segall",site:"https://museulasarsegall.org.br",addr:"R. Berta, 111",b:"Vila Mariana",z:"Sul",tipo:"institucional",lat:-23.5947,lng:-46.6353,info:"Museu federal (Ibram) dedicado ao pintor e gravador Lasar Segall."},
/* site tirado em 23/09/2026: oficinasculturais.org.br nao resolve (DNS
   morto, confirmado no navegador e por fetch direto — ENOTFOUND). */
{name:"Paço das Artes",site:"https://pacodasartes.org.br",addr:"R. Dr. Albuquerque Lins, 1345",b:"Higienópolis",z:"Centro",tipo:"institucional",lat:-23.5420,lng:-46.6589,info:"Instituição da Secretaria de Cultura do Estado de SP."},
{name:"Pinacoteca Contemporânea",site:"https://pinacoteca.org.br",addr:"Av. Tiradentes, 273",b:"Luz",z:"Centro",tipo:"institucional",lat:-23.5332,lng:-46.6333,info:"Terceiro prédio da Pinacoteca de São Paulo, inaugurado em 2023, integrado aos prédios Pina Luz e Pina Estação — ingresso único."},
{name:"Quadra Galeria",ig:"quadragaleria",soIG:true,addr:"R. Barão de Tatuí, 521",b:"Vila Buarque",z:"Centro",tipo:"galeria",lat:-23.5405,lng:-46.6547,info:"Unidades em São Paulo e Rio de Janeiro."},
/* site tirado em 23/09/2026: redbullstation.com.br nao resolve (DNS
   morto, confirmado por fetch direto — ENOTFOUND). */
/* site tirado em 23/09/2026: galeriasancovsky.com nao resolve (DNS
   morto, confirmado por fetch direto — ENOTFOUND). */
{name:"Vila Itororó",site:"https://vilaitororo.prefeitura.sp.gov.br",addr:"R. Maestro Cardim, 60",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5614,lng:-46.6406,info:"Construída entre 1922 e 1929, virou centro cultural municipal em 2021, ruínas arquitetônicas preservadas."},
/* site tirado em 23/09/2026: o dominio galeriavirgilio.com.br foi
   sequestrado e agora serve spam de apostas/cassino. NAO visitar —
   nem o radar-fontes.js, nem ninguem. Confirmado abrindo em duas abas
   separadas. Precisa achar o dominio novo da galeria (se existir) antes
   de repor este campo. */
{name:"Galeria Virgilio",ig:"galeria.virgilio",soIG:true,site:"",addr:"R. Dr. Virgilio de Carvalho Pinto, 426",b:"Pinheiros",z:"Oeste",tipo:"galeria",lat:-23.5620,lng:-46.6845,info:"Aberta em 2002 por Izabel Pinheiro, representa artistas contemporâneos emergentes."},
{name:"Memorial da América Latina",site:"https://memorial.org.br",addr:"Av. Auro Soares de Moura Andrade, 664",b:"Barra Funda",z:"Oeste",tipo:"institucional",lat:-23.5275,lng:-46.6654,info:"Galeria Marta Traba: único espaço museológico do Brasil inteiramente dedicado à arte latino-americana, 1.000 m² circulares."},
// --- Mapeamento de 02/11/2026 (diretórios AQA + Guia das Artes, cruzados com a base; endereço e Instagram conferidos no site oficial) ---
{name:"Sesc Belenzinho",ig:"sescbelenzinho",site:"https://www.sescsp.org.br/unidades/belenzinho/",addr:"R. Padre Adelino, 1000",b:"Belenzinho",z:"Leste",tipo:"institucional",lat:-23.5441,lng:-46.5845,info:"Unidade do Sesc São Paulo na zona leste, com exposições e programação cultural gratuita."},
{name:"Sesc Bom Retiro",ig:"sescbomretiro",site:"https://www.sescsp.org.br/unidades/bom-retiro/",addr:"Alameda Nothmann, 185",b:"Bom Retiro",z:"Centro",tipo:"institucional",lat:-23.5311,lng:-46.6433,info:"Unidade do Sesc São Paulo com exposições e programação cultural."},
{name:"Sesc Consolação",ig:"sescconsolacao",site:"https://www.sescsp.org.br/unidades/consolacao/",addr:"R. Dr. Vila Nova, 245",b:"Higienópolis",z:"Centro",tipo:"institucional",lat:-23.5461,lng:-46.6503,info:"Unidade do Sesc São Paulo entre Higienópolis e a Consolação, com exposições e programação cultural."},
{name:"Sesc Santana",ig:"sescsantana",site:"https://www.sescsp.org.br/unidades/santana/",addr:"Av. Luiz Dumont Villares, 579",b:"Santana",z:"Norte",tipo:"institucional",lat:-23.4980,lng:-46.6130,info:"Unidade do Sesc São Paulo na zona norte, com exposições e programação cultural."},
{name:"Sesc Itaquera",ig:"sescitaquera",site:"https://www.sescsp.org.br/unidades/itaquera/",addr:"Av. Fernando do Espírito Santo Alves de Mattos, 1000",b:"Itaquera",z:"Leste",tipo:"institucional",lat:-23.5816,lng:-46.4619,info:"Unidade do Sesc São Paulo ao lado do Parque do Carmo, com exposições e programação cultural."},
{name:"Sesc 24 de Maio",ig:"sesc24demaio",site:"https://www.sescsp.org.br/unidades/24-de-maio/",addr:"R. 24 de Maio, 109",b:"República",z:"Centro",tipo:"institucional",lat:-23.5441,lng:-46.6400,info:"Unidade do Sesc São Paulo no centro, com exposições e programação cultural."},
{name:"Sesc Vila Mariana",ig:"sescvilamariana",site:"https://www.sescsp.org.br/unidades/vila-mariana/",addr:"R. Pelotas, 141",b:"Vila Mariana",z:"Sul",tipo:"institucional",lat:-23.5820,lng:-46.6453,info:"Unidade do Sesc São Paulo com exposições e programação cultural."},
{name:"Sesc Avenida Paulista",ig:"sescavpaulista",site:"https://www.sescsp.org.br/unidades/avenida-paulista/",addr:"Av. Paulista, 119",b:"Paraíso",z:"Centro",tipo:"institucional",lat:-23.5707,lng:-46.6457,info:"Unidade do Sesc São Paulo na Avenida Paulista, com exposições e programação cultural."},
{name:"Sesc Ipiranga",ig:"sescipiranga",site:"https://www.sescsp.org.br/unidades/ipiranga/",addr:"R. Bom Pastor, 822",b:"Ipiranga",z:"Sul",tipo:"institucional",lat:-23.5841,lng:-46.6080,info:"Unidade do Sesc São Paulo com exposições e programação cultural."},
{name:"Galleria Continua São Paulo",ig:"galleriacontinua",site:"https://www.galleriacontinua.com",addr:"R. Des. Paulo Passaláqua, s/n, Portão 14 ~",b:"Pacaembu",z:"Centro",tipo:"galeria",lat:-23.5501,lng:-46.6659,info:"Unidade brasileira da galeria italiana Galleria Continua, junto ao Estádio do Pacaembu."},
{name:"Casa das Rosas",ig:"casadasrosas",site:"https://www.casadasrosas.org.br",addr:"Av. Paulista, 37",b:"Bela Vista",z:"Centro",tipo:"institucional",lat:-23.5711,lng:-46.6452,info:"Espaço de literatura e poesia no casarão da Avenida Paulista, com exposições e programação gratuita."},
{name:"Casa Guilherme de Almeida",ig:"casaguilhermedealmeida",site:"https://www.casaguilhermedealmeida.org.br",addr:"R. Macapá, 187",b:"Sumaré",z:"Oeste",tipo:"institucional",lat:-23.5469,lng:-46.6739,info:"Casa-museu do poeta Guilherme de Almeida, com exposições temporárias e programação literária."},
{name:"Instituto Bardi Casa de Vidro",ig:"institutobardi",site:"https://institutobardi.com.br",addr:"R. Gen. Almério de Moura, 200",b:"Morumbi",z:"Sul",tipo:"institucional",lat:-23.6137,lng:-46.7088,info:"Casa projetada por Lina Bo Bardi em 1951, onde viveu com Pietro Maria Bardi. Visitas e exposições com agendamento."},
{name:"Complexo Cultural Funarte",site:"https://www.gov.br/funarte",addr:"Alameda Nothmann, 1058",b:"Campos Elíseos",z:"Centro",tipo:"institucional",lat:-23.5353,lng:-46.6509,info:"Complexo da Funarte em São Paulo, com galerias, teatro e salas de ensaio. Exposições gratuitas."},
{name:"Museu da Casa Brasileira",site:"https://www.mcb.org.br",addr:"Av. Brigadeiro Faria Lima, 2705",b:"Jardim Europa",z:"Oeste",tipo:"institucional",lat:-23.5800,lng:-46.6844,info:"Museu de arquitetura e design, em casarão dos anos 1940 na Faria Lima, com exposições temporárias."},
{name:"Memorial da Resistência",ig:"memorialdaresistenciasp",site:"https://memorialdaresistenciasp.org.br",addr:"Largo General Osório, 66",b:"Luz",z:"Centro",tipo:"institucional",lat:-23.5348,lng:-46.6388,info:"Museu no antigo prédio do Deops, ao lado da Estação Pinacoteca, com exposição de longa duração e mostras temporárias."},
{name:"Museu da Língua Portuguesa",ig:"museudalinguaportuguesa",site:"https://www.museudalinguaportuguesa.org.br",addr:"Praça da Luz, s/n",b:"Luz",z:"Centro",tipo:"institucional",lat:-23.5343,lng:-46.6361,info:"Museu instalado na Estação da Luz, com mostras temporárias além da exposição principal."},
{name:"Museu Belas Artes de São Paulo",ig:"belasartes",site:"https://www.belasartes.br",addr:"Praça da Liberdade, 71",b:"Liberdade",z:"Centro",tipo:"institucional",lat:-23.5545,lng:-46.6353,info:"Museu privado na Liberdade, com exposições temporárias de arte."},
{name:"Museu Casa Modernista",ig:"museudacidade",site:"https://www.museudacidade.prefeitura.sp.gov.br",addr:"R. Santa Cruz, 325",b:"Vila Mariana",z:"Sul",tipo:"institucional",lat:-23.5964,lng:-46.6335,info:"Casa projetada por Gregori Warchavchik em 1930, marco da arquitetura modernista brasileira. Abriga exposições."},
{name:"Casa da Imagem",ig:"museudacidade",site:"https://www.museudacidade.prefeitura.sp.gov.br",addr:"R. Roberto Simonsen, 136",b:"Sé",z:"Centro",tipo:"institucional",lat:-23.5486,lng:-46.6323,info:"Casa do século XVIII no centro histórico, dedicada à memória visual da cidade, com exposições de fotografia e artes."}
];

/* ================= EXPOS ================= */
const EXPOS = [
{t:"To Love — Claudia Andujar e George Love",a:"Claudia Andujar, George Love",v:"Galeria Vermelho",ini:"2026-08-15",fim:null,d:"Curadoria de Eder Chiodetto sobre a produção experimental de George Love e seu diálogo com Claudia Andujar nos anos 1960 e 1970. A mostra marca o início da representação do Arquivo de George Love pela galeria. Abertura em 15 de agosto; encerramento não divulgado.",img:"img/to-love-galeria-vermelho.jpg",cred:"Cortesia Galeria Vermelho",foco:57},
{t:"No meio da pedra — André Vargas",a:"André Vargas",v:"Galeria Vermelho",ini:"2026-08-15",fim:null,d:"Segunda individual do artista na galeria. Abertura em 15 de agosto; encerramento não divulgado.",img:"img/no-meio-da-pedra-galeria-vermelho.jpg",cred:"Cortesia Galeria Vermelho"},
{t:"Ocupação JAMAC",a:"JAMAC — Jardim Miriam Arte Clube",v:"Galeria Vermelho",ini:"2024-10-04",fim:"2026-12-19",d:"O coletivo fundado por Mônica Nador em 2004 ocupa a banca da galeria com os projetos Inventários e Aprender algo novo. Quinta e sexta, 12h–18h; sábado, 11h–17h."},
{t:"Brasil das Múltiplas Faces",v:"Itaú Cultural",ini:"2025-10-22",fim:"2027-10-31",d:"Mostra de longa duração com obras do acervo do Itaú Cultural. Entrada gratuita.",img:"img/brasil-das-multiplas-faces-itau-cultural.webp",cred:"Emiliano di Cavalcanti, Vendedoras de Peixe, 1952. Divulgação Itaú Cultural"},
{t:"Casa María Lionza — Sol Calero",a:"Sol Calero",v:"MASP",ini:"2026-07-03",fim:"2027-01-30",d:"Pavilhão no Vão Livre em dezesseis cores, com padrões pintados à mão e mosaicos, em referência a Lina Bo Bardi e às fachadas nordestinas. Curadoria de Adriano Pedrosa e Laura Cosendey.",img:"img/casa-maria-lionza-masp.webp",cred:"Cortesia MASP",foco:50,img2:"img/casa-maria-lionza-masp-2.jpg"},
{t:"Histórias Latino-Americanas",v:"MASP",ini:"2026-09-04",fim:"2027-01-31",d:"Coletiva internacional em cinco núcleos temáticos sobre a construção histórica da ideia de América Latina. Curadoria de Amanda Carneiro e Julieta González, curadora-adjunta do MASP, com assistência de Teo Teotonio.",img:"img/historias-latino-americanas-masp.webp",cred:"Arte cusquenha, Virgem de Copacabana. Divulgação MASP"},
/* img/flores-e-vasos.jpg tirada em 23/09: e um padrao de azulejo circular, nao
   flor nem vaso — nao bate com a descricao nem com nenhum dos tres fotografos
   creditados. Apareceu errada no salao de 25/09 (a parede pendurou a mesma
   imagem que ja tinha passado por todas as medidas, sem ninguem checar SE ERA
   a obra). Achar a reproducao certa com a Luciana Brito antes de repor. */
{t:"Cantaria — Daniel Jorge",a:"Daniel Jorge",v:"Mendes Wood DM",ini:"2026-08-22",fim:"2026-11-06",d:"Primeira individual do artista em São Paulo: 23 obras em pedra-sabão, entre escultura, relevo, instalação e performance. Ensaio de Carlos Quijon Jr.",img:"img/cantaria-mendes-wood-dm.jpg",cred:"Foto: Divulgação / Mendes Wood DM",img2:"img/cantaria-mendes-wood-dm-2.jpg",img3:"img/cantaria-mendes-wood-dm-3.jpg"},
{t:"Déboussolé est le mot exact — Jean Claracq",a:"Jean Claracq",v:"Mendes Wood DM",ini:"2026-08-22",fim:"2026-11-06",d:"Dez pinturas de pequeno formato, a maioria entre 10 e 20 centímetros. Texto de Renato Menezes.",img:"img/deboussole-jean-claracq.jpg",cred:"Cortesia do artista e Mendes Wood DM"},
{t:"É Tempo Ainda",v:"Janaina Torres Galeria",ini:"2026-08-15",fim:"2026-12-18",d:"Vinte e seis artistas de gerações diferentes, com curadoria de Heloisa Amaral Peixoto, nos dez anos da galeria.",img:"img/e-tempo-ainda-janaina-torres-galeria.webp",cred:"Cortesia Janaina Torres Galeria"},
{t:"Uma Obra: Pintura sem fim",a:"Gui Teixeira",v:"Pinacoteca de São Paulo",ini:"2026-07-04",fim:"2028-01-31",d:"Terceira edição do projeto Uma Obra: uma parede de carpete recebe centenas de peças de feltro colorido que o público move e recompõe (Pina Luz). Colaboração do artista Gui Teixeira.",img:"img/uma-obra-pintura-sem-fim-pinacoteca-de-sao-paulo.jpg",cred:"Cortesia Pinacoteca de São Paulo"},
{t:"Beatriz Milhazes: gravuras do acervo da Pinacoteca",a:"Beatriz Milhazes",v:"Estação Pinacoteca",ini:"2026-05-16",fim:"2027-03-14",d:"27 gravuras feitas entre 1996 e 2019 com a Durham Press (Pina Estação).",img:"img/beatriz-milhazes-gravuras-do-acervo-da-pinacoteca-estacao-pi.webp",cred:"Beatriz Milhazes, O pato, 1996. Foto: Cortesia da artista e Pinacoteca de São Paulo",foco:50},
{t:"trágico subúrbio — Paulo Pedro Leal",a:"Paulo Pedro Leal",v:"Pinacoteca de São Paulo",ini:"2026-04-11",fim:"2026-11-08",d:"Mais de 50 pinturas dos anos 1950 e 1960, entre naufrágios, conflitos urbanos e cenas de rua. Primeira mostra institucional do artista autodidata carioca.",img:"img/tragico-suburbio-pinacoteca-de-sao-paulo.jpg",cred:"Vista da exposição. Foto Levi Fanan / Cortesia Pinacoteca de São Paulo",vista:true},
{t:"Ibirapema — Olinda Tupinambá",a:"Olinda Tupinambá",v:"Pinacoteca de São Paulo",ini:"2026-04-11",fim:"2026-12-27",d:"Filme de 2022 comissionado para a mostra Atos Modernos, com a transformação em onça como método. Curadoria de Ana Paula Lopes."},
{t:"Mundo Pequeno — Martin Parr",a:"Martin Parr",v:"Centro Cultural FIESP",ini:"2026-10-15",fim:"2027-04-04",d:"45 fotografias de Martin Parr (Magnum Photos) sobre turismo de massa, consumo e a obsessão de provar que se esteve ali, mostradas pela primeira vez no Brasil, com projeções e fotolivros. Curadoria de João Kulcsár. Terça a domingo, das 10h às 20h.",img:"",cred:""},
{t:"Beijo de Língua — Nelson Felix",a:"Nelson Felix",v:"MAC USP",ini:"2026-05-30",fim:"2026-11-29",d:"Individual do escultor carioca no MAC USP. Entrada gratuita.",img:"img/beijo-de-lingua-mac-usp.webp",cred:"Cortesia do artista"},
{t:"39º Panorama da Arte Brasileira: Depois que tudo foi dito",v:"MAM São Paulo",ini:"2026-09-12",fim:"2027-01-24",d:"Curadoria de Diane Lima, com 33 artistas de 13 estados. A mostra marca o retorno do museu à sede do Ibirapuera após a reforma da marquise.",img:"img/39-panorama-da-arte-brasileira-depois-que-tudo-foi-dito-mam-.webp",cred:"Foto Ding Musa / Cortesia MAM São Paulo",vista:true,img2:"img/39-panorama-da-arte-brasileira-depois-que-tudo-foi-dito-mam--2.jpg"},
{t:"Constelação em trânsito: uma escuta cartográfica",v:"Galpão da Lapa",ini:"2025-09-06",fim:"2027-03-01",d:"Mostra de longa duração da coleção privada de arte contemporânea brasileira do Galpão da Lapa, organizada em três eixos - Arquiteturas do Inconsciente, Geometrias do Sul e Topologias do Orgânico - a partir de uma escuta do próprio acervo. Visitas guiadas gratuitas mediante agendamento, quintas e sábados.",img:"img/constelacao-em-transito-uma-escuta-cartografica-galpao-da-la.jpg",cred:"Cortesia Galpão da Lapa",foco:50},
{t:"Por Elas, Com Elas: Do Moderno ao Contemporâneo",v:"DAN Galeria",ini:"2026-09-09",fim:"2026-11-07",d:"Coletiva com obras de meados do século 20 aos dias atuais, em núcleo histórico — com Tarsila do Amaral, Anita Malfatti, Lygia Clark e Tomie Ohtake — e núcleo contemporâneo. Curadoria de Maria Alice Milliet.",img:"img/por-elas-com-elas-do-moderno-ao-contemporaneo-dan-galeria.jpg",cred:"Cortesia DAN Galeria"},

/* --- confirmadas na fonte primária em 14/09/2026, casas já mapeadas sem nada em cartaz na base --- */
{t:"Abismos Urbanos e o Plano Celeste",a:"Eduardo Coimbra",v:"Galeria Lume",ini:"2026-09-12",fim:"2026-11-14",d:"Exposição individual.",img:"img/abismos-urbanos-e-o-plano-celeste-galeria-lume.webp",cred:"Cortesia Galeria Lume",conferida:true},
{t:"Território de Disputa",a:"Kilian Glasner",v:"Galeria Lume",ini:"2026-09-12",fim:"2026-11-14",d:"Pinturas feitas com saibro — laterita alaranjada recolhida no sertão —, cortadas pelas faixas brancas de uma quadra de tênis, como alegoria de disputa por território.",img:"img/territorio-de-disputa-galeria-lume.jpg",cred:"Cortesia Galeria Lume",foco:50},
{t:"Longitudes",a:"Johanna Calle",v:"Galeria Marília Razuk",ini:"2026-09-12",fim:"2026-12-12",d:"Exposição individual.",img:"img/longitudes-galeria-marilia-razuk.jpg",cred:"Cortesia Galeria Marília Razuk"},
{t:"Cavalinhas e Falésias",a:"Carolina Colichio",v:"Galeria Marília Razuk",ini:"2026-09-12",fim:"2026-11-03",d:"Exposição individual.",img:"img/cavalinhas-e-falesias-galeria-marilia-razuk.jpg",cred:"Cortesia Galeria Marília Razuk"},

/* --- casas novas mapeadas hoje: mostra atual confirmada na fonte --- */

/* --- 91 de 125 casas sem nada em cartaz (23/09/2026): apuração de 50 casas
   com sinal no site, em 5 frentes paralelas. 18 mostras confirmadas na fonte
   primária, cada uma abrindo casa nova na base ou corrigindo uma já mapeada.
   Uma delas (Paço das Artes) ainda não abriu — fica registrada certa e o
   `check.js`/`destaque.js` já sabem lidar com `ini` no futuro. */
{t:"Controle | Corrosão | Dispersão",a:"Beto Shwafaty",v:"Galeria Leme",ini:"2026-09-03",fim:"2026-11-13",d:"Individual com cerca de 15 trabalhos que pensam a sociedade contemporânea a partir de objetos e materiais do cotidiano, incluindo a obra inédita \"O sonho da terra, é o sonho americano\".",img:"img/controle-corrosao-dispersao-galeria-leme.jpg",cred:"Cortesia Galeria Leme"},
{t:"Marlene Barros: tecitura do feminino",a:"Marlene Barros",v:"CCBB São Paulo",ini:"2026-08-26",fim:"2027-01-25",d:"Reúne 15 obras entre esculturas, bordados, crochês, instalações e objetos que discutem a feminilidade como construção histórica, social e cultural; curadoria de Betânia Pinheiro.",img:"img/marlene-barros-tecitura-do-feminino-ccbb-sao-paulo.jpg",cred:"Cortesia CCBB São Paulo",foco:35},
{t:"Fernando Lemos: quanto mais desejo, mais invento o que vejo",a:"Fernando Lemos",v:"IMS Paulista",ini:"2026-09-19",fim:"2027-02-07",d:"Retrospectiva do centenário de nascimento de Fernando Lemos (1926–2019), com cerca de 400 itens entre fotografias, desenhos, projetos gráficos e poesia produzidos ao longo de 70 anos; curadoria de Thyago Nogueira.",img:"img/fernando-lemos-quanto-mais-desejo-mais-invento-o-que-vejo-im.webp",cred:"Fernando Lemos, Eu, poeta. Arquivo Fernando Lemos / Acervo Instituto Moreira Salles"},
{t:"NO LIMITE: forma e transformação",a:"",v:"Paço das Artes",ini:"2026-09-26",fim:"2026-11-15",d:"Coletiva com 17 artistas de 6 países que explora o conceito de \"situação-limite\" do filósofo Karl Jaspers, combinando aspectos psicológicos com elementos como água, pedras, sal e luz. Curadoria de Martin Juef, cocuradoria de Francisco Klinger Carvalho.",img:"img/no-limite-paco-das-artes.png",cred:"Nina E. Schönefeld, still de vídeo / Cortesia Paço das Artes"},
{t:"Afríquia: o artista como colecionador",a:"",v:"Museu Afro Brasil Emanoel Araujo",ini:"2026-06-26",fim:"2027-01-31",d:"Reúne mais de 200 obras e materiais de arquivo — esculturas, pinturas, máscaras, fotografias, livros, discos e têxteis, com destaque para peças da Nigéria e do Benin — mostrando como Emanoel Araujo formou o acervo de arte africana do museu. Curadoria de Gabrielle Nascimento.",img:"",cred:""},
/* confirmado no Instagram (@vazio_criativo_, 23/09/2026), checagem manual.
   Só cartaz disponível, sem imagem de obra. */
/* confirmado no Instagram (@mits.galeria, 23/09/2026). Curadoria e lista
   de artistas apareciam no cartaz mas cortados/ilegiveis no zoom -- nao
   incluidos, para nao chutar nome. */
{t:"Coordenadas Improváveis",a:"",v:"MITS Galeria",ini:"2026-09-24",fim:"2026-11-15",d:"Coletiva com 11 artistas, entre eles Jay Boggo, Maria Tereza Bomfim, Marcos Cavallaria, Letícia Façanha, Matheus Freitas e Cadeh Juaçaba. Em cartaz até 15 de novembro.",img:"img/coordenadas-improvaveis-mits-galeria.jpg",cred:"Cortesia MITS Galeria"},
/* confirmado no Instagram (@espacorepublica, 25/09/2026). Lista de artistas
   tirada do cartaz da 2a edicao (imagem do post); flyer tipografico, sem
   imagem de obra disponivel. */
/* confirmado no Instagram (@galeriasuperficie, 17 e 23/09/2026). */
{t:"Gestos",v:"Galeria Superfície",ini:"2026-08-29",fim:"2026-12-12",d:"Coletiva com 27 artistas de diferentes gerações, a partir da ideia de gesto do livro de Vilém Flusser. Curadoria de Paulo Venancio Filho e Gustavo Nóbrega, inaugura a nova sede da galeria na Vila Madalena.",img:"img/gestos-galeria-superficie.jpg",cred:"Cortesia Galeria Superfície",vista:true},
/* confirmado no Instagram (@massape_projetos, 21/09/2026). */
{t:"Pablo Delano: Museu da Antiga Colônia",a:"Pablo Delano",v:"MASP",ini:"2026-10-30",fim:"2027-01-31",d:"Individual no Edifício Lina Bo Bardi, com curadoria de Adriano Pedrosa e Fernando Oliva.",img:"img/pablo-delano-museu-da-antiga-colonia-masp.webp",cred:"Pablo Delano, As duas bandeiras (2020-em processo). Divulgação MASP",foco:50},
{t:"Rosa Elena Curruchich: crônicas de Comalapa",a:"Rosa Elena Curruchich",v:"MASP",ini:"2026-10-30",fim:"2027-04-04",d:"Primeira mostra da artista guatemalteca no Brasil: mais de 80 obras de pequeno formato. Curadoria de Yudi Rafael e Guilherme Giufrida.",img:"img/rosa-elena-curruchich-cronicas-de-comalapa-masp.webp",cred:"Rosa Elena Curruchich, Van a escoger capitana del nuevo año, c. 1980. Acervo MASP. Foto: Eduardo Ortega",foco:53,img2:"img/rosa-elena-curruchich-cronicas-de-comalapa-masp-2.jpg"},
{t:"Horizontes do Solo",a:"Bárbara Banida, Cláudio Cretti, Pedro França",v:"Ateliê397",ini:"2026-10-08",fim:"2026-11-21",d:"Coletiva com curadoria de Érica Burini, originada na primeira edição da residência artística IOD'A, no Piauí. Quarta a sábado, 14h às 18h; abertura das 19h às 22h.",img:"img/horizontes-do-solo-atelie397.webp",cred:"Cortesia Ateliê397",foco:53},
{t:"O tudo e o todo — André Vargas",a:"André Vargas",v:"Casa de Cultura do Parque",ini:"2026-10-03",fim:"2027-04-25",d:"Oito bandeiras feitas a partir de paramentas de orixás formam as palavras TUDO e TODO na fachada, na edição do Dando Bandeira. Quarta a domingo, 11h às 18h.",img:"img/o-tudo-e-o-todo-casa-de-cultura-do-parque.webp",cred:"Cortesia Casa de Cultura do Parque"},
{t:"Metragens — Pablo Accinelli e Gustavo Silvamaral",a:"Pablo Accinelli, Gustavo Silvamaral",v:"Casa de Cultura do Parque",ini:"2026-10-03",fim:"2027-04-25",d:"Projeto concebido em colaboração, no programa No Deck, com vidro, metal e utensílios de limpeza. Texto crítico de Omar Porto. Quarta a domingo, 11h às 18h.",img:"img/metragens-casa-de-cultura-do-parque.webp",cred:"Cortesia Casa de Cultura do Parque"},
{t:"Lava-Olhos de Emergência — Lucas Simões",a:"Lucas Simões",v:"Casa Triângulo",ini:"2026-09-26",fim:"2026-11-07",d:"Terceira individual do artista na galeria, com textos críticos de Pollyana Quintella e Ciro Miguel. Esculturas em aço galvanizado e concreto.",img:"img/lava-olhos-de-emergencia-casa-triangulo.jpg",cred:"Cortesia Casa Triângulo"},
{t:"Estado de Transe — Dora Smék",a:"Dora Smék",v:"Central Galeria",ini:"2026-10-03",fim:"2026-11-14",d:"Segunda individual da artista na galeria, com esculturas, instalações e vídeo inéditos. Texto de Yago Toscano. Segunda a sexta, 10h às 19h; sábado, 11h às 17h.",img:"img/estado-de-transe-central-galeria.jpg",cred:"Foto Ana Pigosso / Cortesia Central Galeria",foco:50,img2:"img/estado-de-transe-central-galeria-2.jpg"},
{t:"Corrente Contínua — tecfase",a:"",v:"Choque Cultural",ini:"2026-09-26",fim:"2026-11-26",d:"Individual com TVs pintadas, pinturas, colagem e vídeos. Aberta em 26 de setembro.",img:"img/corrente-continua-choque-cultural.jpg",cred:"Cortesia Choque Cultural",foco:50},
{t:"Khāmoshī — Fernanda Valadares",a:"Fernanda Valadares",v:"Galeria Aura",ini:"2026-10-03",fim:"2026-11-18",d:"Individual com pinturas inéditas em encáustica, numa paleta de negros profundos. Texto curatorial de Priscyla Gomes. Abertura em 3 de outubro; em cartaz até 18 de novembro.",img:"img/khamoshi-galeria-aura.jpg",cred:"Vista da exposição. Cortesia Galeria Aura",vista:true},
{t:"Toda minúcia — André Barion",a:"André Barion",v:"Galeria Estação",ini:"2026-10-06",fim:"2026-11-28",d:"Individual com curadoria de Amanda Tavares e pesquisa de Omar Porto, entre pintura, desenho, escultura, costura e instalação, no segundo andar e no mezanino. Abertura em 6 de outubro, das 18h às 21h.",img:"img/toda-minucia-galeria-estacao.jpg",cred:"Cortesia Galeria Estação"},
{t:"Não há só uma maneira — Oriol Vilanova",a:"Oriol Vilanova",v:"Galeria Luisa Strina",ini:"2026-10-01",fim:"2026-11-14",d:"Primeira individual do artista espanhol no Brasil, na Sala 2, sobre coleções e colecionadores. Inclui a performance Palabras prestadas, com datas a divulgar.",img:"img/nao-ha-so-uma-maneira-galeria-luisa-strina.jpg",cred:"Foto Mina Albespy / Cortesia Galeria Luisa Strina",vista:true},
{t:"nome ar — Jarbas Lopes",a:"Jarbas Lopes",v:"Galeria Luisa Strina",ini:"2026-10-01",fim:"2026-11-14",d:"Obras inéditas na Sala 1, com ensaios críticos de Érica Burini e Luiz Villares. Abertura em 1º de outubro, das 18h às 21h, com performance do artista às 19h.",img:"img/nome-ar-galeria-luisa-strina.jpg",cred:"Foto Julia Thompson / Cortesia Galeria Luisa Strina"},
{t:"Círio de Nazaré. Do sagrado ao profano: uma extensão do Brasil | Nova Fotografia 2026",a:"Fabricio Augusto",v:"MIS — Museu da Imagem e do Som",ini:"2026-10-06",fim:"2026-11-15",d:"Ensaio fotográfico documental sobre o Círio de Nazaré, em Belém, no programa anual Nova Fotografia do MIS. Abertura às 19h; entrada gratuita.",img:"",cred:""},
{t:"Marília Mendonça: Sentimento Louco",a:"",v:"MIS — Museu da Imagem e do Som",ini:"2026-10-09",fim:null,d:"Primeira grande exposição sobre a trajetória de Marília Mendonça, com memórias, objetos pessoais, música e audiovisual. Encerramento não divulgado.",img:"",cred:""},
{t:"NZO: Memórias Afro-brasileiras",a:"",v:"Museu Afro Brasil Emanoel Araujo",ini:"2026-09-26",fim:"2027-02-28",d:"Primeira exposição da Rede de Acervos Afro-brasileiros, com curadoria compartilhada e mais de 150 obras e registros de diferentes regiões do país.",img:"",cred:""},
{t:"Tinta sobre Memória — Luiz Fukushiro",a:"Luiz Fukushiro",v:"Museu da Imigração",ini:"2026-09-26",fim:"2026-11-08",d:"Instalação da residência artística 2026, a partir de haikus e esculturas de Takeo Hirata do acervo, com caligrafia japonesa (shodō). Sala das Comunidades.",img:"img/tinta-sobre-memoria-museu-da-imigracao.png",cred:"Cortesia Museu da Imigração",foco:62},
{t:"vem, vira, vai, voo — Selva de Carvalho",a:"Selva de Carvalho",v:"Verve Galeria",ini:"2026-10-03",fim:null,d:"Instalação inédita na vitrine da Sala de Projetos, no Edifício Louvre. Abertura das 12h às 17h; encerramento não divulgado.",img:"img/vem-vira-vai-voo-verve-galeria.jpg",cred:"Cortesia Verve Galeria",img2:"img/vem-vira-vai-voo-verve-galeria-2.jpg"},
{t:"Cardosinho: Acervo Especial",a:"José Bernardo Cardoso Júnior",v:"Galeria Estação",ini:"2026-10-06",fim:"2026-11-28",d:"Sala com oito pinturas recém-adquiridas de José Bernardo Cardoso Júnior (1861–1947), todas sem título e feitas entre 1931 e 1947. Ele começou a pintar por volta dos 70 anos, após se aposentar do ensino.",img:"img/cardosinho-acervo-especial-galeria-estacao.jpg",cred:"Cortesia Galeria Estação"},
{t:"Aquilo Que Não Cabe — Jessica Costa",a:"Jessica Costa",v:"Zipper Galeria",ini:"2026-10-08",fim:"2026-12-18",d:"Individual com curadoria de Carollina Lauriano, a primeira da artista no salão principal. Esculturas e tapeçarias que usam a modelagem de vestuário para pensar o volume do corpo. Abertura em 8 de outubro, das 18h às 21h.",img:"img/aquilo-que-nao-cabe-zipper-galeria.jpg",cred:"Jessica Costa, Voluptuosa II, 2026. Divulgação Zipper Galeria",foco:52,img2:"img/aquilo-que-nao-cabe-zipper-galeria-2.jpg"},
{t:"O Vaso de Ojuara — Claudia Marchetti",a:"Claudia Marchetti",v:"Zipper Galeria",ini:"2026-10-08",fim:"2026-12-18",d:"Individual no Zip'Up com texto crítico de Paula Alzugaray: quatorze pinturas recentes, o primeiro conjunto da artista em vinte anos. Abertura em 8 de outubro, das 18h às 21h.",img:"img/o-vaso-de-ojuara-zipper-galeria.jpg",cred:"Foto: Biah Schmidt / Zipper Galeria",foco:70,img2:"img/o-vaso-de-ojuara-zipper-galeria-2.jpg"},
{t:"Jacqueline Humphries e JH Studio",a:"Jacqueline Humphries, Peter Granados, Paul Kopkau, Ciccio",v:"Auroras",ini:"2026-10-17",fim:"2027-01-16",d:"Primeira exposição de Humphries no Brasil, com pinturas e seis livros de artista, e obras de três artistas do seu ateliê. Abertura em 17 de outubro, das 14h às 17h, com performance de Arto Lindsay às 16h. Em cartaz até 16 de janeiro de 2027.",img:"img/jacqueline-humphries-e-jh-studio-auroras.jpg",cred:"Cortesia Auroras"},
{t:"Deslocar, Desalinhar, Interromper — Antonio Bokel",a:"Antonio Bokel",v:"Galeria Luis Maluf",ini:"2026-10-08",fim:"2026-11-04",d:"Individual na unidade da Barra Funda com esculturas, instalações e pinturas que inserem galhos, rochas, espelhos e círculos em composições geométricas. Abertura em 8 de outubro, das 19h às 23h.",img:"img/deslocar-desalinhar-interromper-galeria-luis-maluf.jpg",cred:"Cortesia Galeria Luis Maluf",vista:true},
{t:"Pequenos Afetos",a:"",v:"Farol Santander",ini:"2026-10-16",fim:"2027-01-10",d:"Nova exposição temporária do Farol Santander, que estreia em 16 de outubro. Visitação de terça a domingo, das 9h às 20h, com última entrada às 19h.",img:"img/pequenos-afetos-farol-santander.jpg",cred:"Cortesia Farol Santander"},
{t:"Tábula Opaca — coletiva",a:"Fernanda Pacca, Jacque Faus, Kuenan Mayu, Olívia Lacerda, Uýra, Xinga Xow, Yaraçá",v:"Galeria Aura",ini:"2026-10-24",fim:null,d:"Curadoria do Projeto Mulheres Arquivadas. A mostra investiga a opacidade e a fugitividade como resistência aos sistemas de classificação. Abertura em 24 de outubro, a partir das 11h; encerramento não divulgado.",img:"img/tabula-opaca-galeria-aura.jpg",cred:"Cortesia Galeria Aura"},
{t:"Belezas Brasileiras",a:"Adriano Gambarini, Gabriel Bonatto, Ricardo Rojas, Toni Pires",v:"MIS — Museu da Imagem e do Som",ini:"2026-10-13",fim:null,d:"Quatro ensaios fotográficos percorrem a Caatinga, a Serra da Mantiqueira, a paisagem urbana paulistana e cenas do cotidiano. Abertura em 13 de outubro, às 19h; encerramento não divulgado.",img:"",cred:""},
{t:"Afropindorama: tecnologia do afeto. Práticas de bem viver",a:"",v:"Museu Afro Brasil Emanoel Araujo",ini:"2026-10-10",fim:"2026-12-13",d:"Curadoria de Vera Nunes, a partir das reflexões de Nego Bispo dos Santos, Célia Tupinambá e Alberto Acosta, com obras do acervo e produções contemporâneas. Galeria da Marquise; entrada gratuita.",img:"",cred:""},
{t:"Quarto de hora — Elisa Arruda",a:"Elisa Arruda",v:"AM Galeria",ini:"2026-10-29",fim:null,d:"Individual com curadoria de Luiza Testa. Gravuras sobre a relação da mulher com o ambiente doméstico e as padronagens do Raio que o Parta, estética modernista de Belém do Pará. Abertura adiada para 29 de outubro, das 16h às 21h; encerramento não divulgado.",img:"img/quarto-de-hora-am-galeria.jpg",cred:"Cortesia AM Galeria"},
{t:"Troca de segredos — Barrão",a:"Barrão",v:"Fortes D'Aloia & Gabriel — Galeria",ini:"2026-11-03",fim:null,d:"Esculturas feitas de fragmentos de porcelana de objetos decorativos e utilitários coletados em feiras de usados, e aquarelas do mesmo pensamento escultórico. Abertura em 3 de novembro, das 18h às 21h; encerramento não divulgado.",img:"img/troca-de-segredos-fortes-d-aloia-gabriel-galeria.jpg",cred:"Cortesia Fortes D'Aloia & Gabriel",img2:"img/troca-de-segredos-fortes-d-aloia-gabriel-galeria-2.jpg"},
{t:"Ver o mundo — João Luiz Musa",a:"João Luiz Musa",v:"Luciana Brito Galeria",ini:"2026-11-07",fim:"2026-12-19",d:"Primeira individual do artista desde 2012. Reúne fotografias da pesquisa de livre-docência na ECA-USP. Abertura em 7 de novembro.",img:"img/ver-o-mundo-luciana-brito-galeria.webp",cred:"Cortesia Luciana Brito Galeria",foco:55,img2:"img/ver-o-mundo-luciana-brito-galeria-2.jpg",img3:"img/ver-o-mundo-luciana-brito-galeria-3.jpg"},
{t:"Steps — Abbas Kiarostami",a:"Abbas Kiarostami",v:"MIS — Museu da Imagem e do Som",ini:"2026-10-20",fim:"2026-11-08",d:"Sessenta fotografias em preto e branco de escadarias, a maioria feita na Itália, apresentadas com o filme Me leve para casa (2016), finalizado por Ahmad Kiarostami. Terça a sexta, 10h às 19h; entrada gratuita.",img:"",cred:""},
{t:"Mucki Botkay: pinturas bordadas",a:"Mucki Botkay",v:"Galatea",ini:"2026-11-05",fim:null,d:"Curadoria e texto crítico de Tomás Toledo. Reúne 18 trabalhos de 2025 e 2026, feitos com milhares de miçangas de vidro bordadas à mão sobre tela, com fauna e flora brasileiras. Abertura em 5 de novembro, das 18h às 21h, na unidade Oscar Freire; encerramento não divulgado.",img:"img/mucki-botkay-pinturas-bordadas-galatea.jpg",cred:"Cortesia Galatea"},
{t:"Pull/Pulso — Marcia Grostein",a:"Marcia Grostein",v:"Luciana Brito Galeria",ini:"2026-11-07",fim:"2026-12-19",d:"Primeira individual da artista no Brasil desde 1995, no programa Artista Visitante, com colaboração da Kreëmart. Radicada em Nova York desde 1979, reúne trabalhos sobre as relações entre materiais, suportes e linguagens. Abertura em 7 de novembro.",img:"img/pull-pulso-luciana-brito-galeria.webp",cred:"Cortesia Luciana Brito Galeria",foco:50,img2:"img/pull-pulso-luciana-brito-galeria-2.jpg",img3:"img/pull-pulso-luciana-brito-galeria-3.jpg"},
{t:"Atrás da superfície — Paulo Monteiro",a:"Paulo Monteiro",v:"Mendes Wood DM — Casa Iramaia",ini:"2026-11-07",fim:null,d:"Grupo de pinturas de pequeno formato que revisitam a linha desenhada, com cor construída em camadas, umas transparentes e outras densas. Abertura em 7 de novembro; encerramento não divulgado.",img:"img/atras-da-superficie-mendes-wood-dm-casa-iramaia.webp",cred:"Cortesia Mendes Wood DM",foco:50,img2:"img/atras-da-superficie-mendes-wood-dm-casa-iramaia-2.jpg"},
{t:"Caleidoscópio Xapiri Yanomami — Leão Serva",a:"Leão Serva",v:"MIS — Museu da Imagem e do Som",ini:"2026-10-28",fim:null,d:"Curadoria de Ricardo Corrêa. Cerca de trinta fotografias feitas com celular na comunidade de Xihopi, rio Demini, nos trinta anos da homologação da Terra Indígena Yanomami, em 2022. Abertura em 28 de outubro, às 19h; encerramento não divulgado.",img:"",cred:""},
{t:"Encantário Ibejis: Salve as crianças!",a:"",v:"Museu Afro Brasil Emanoel Araujo",ini:"2026-10-31",fim:null,d:"Curadoria de Vera Nunes e cocuradoria de Camila Tuon e Gabriela de Paula. Inspirada nos Ibejis, nos Erês e em outros seres encantados. Abertura em 31 de outubro, às 11h; encerramento não divulgado.",img:"",cred:""},
{t:"Diáfana — Gretta Sarfaty",a:"Gretta Sarfaty",v:"Museu Judaico de São Paulo",ini:"2026-11-13",fim:"2027-04-11",d:"Curadoria de Patricia Wagner, com apoio da Central Galeria. Mais de 50 trabalhos percorrem seis décadas da artista, em fotografia, performance, vídeo e pintura. Inédita no museu.",img:"img/diafana-gretta-sarfaty-museu-judaico-de-sao-paulo.jpg",cred:"Cortesia Museu Judaico de São Paulo"},
{t:"Zanine Caldas: Criação de mundos",a:"Zanine Caldas",v:"Instituto Tomie Ohtake",ini:"2026-09-13",fim:"2026-11-07",d:"Curadoria de Sabrina Fontenele, com assistência de Lahayda Mamani Poma. Em cartaz na Casa-ateliê Tomie Ohtake, Rua Antônio de Macedo Soares, 1800, em parceria com o Instituto José Zanine Caldas. Quinta a domingo, 10h às 17h.",img:"img/zanine-caldas-criacao-de-mundos-instituto-tomie-ohtake.jpg",cred:"Cortesia Instituto Tomie Ohtake",foco:52,vista:true},
{t:"Hino às galáxias — Ivan Campos",a:"Ivan Campos",v:"Almeida & Dale",ini:"2026-11-07",fim:"2027-01-09",d:"Primeira mostra panorâmica do artista em São Paulo, com curadoria de Lisette Lagnado. Reúne obras inéditas e pinturas feitas desde os anos 1990. Abertura em 7 de novembro, das 11h às 15h, na Rua Fradique Coutinho, 1430.",img:"img/hino-as-galaxias-almeida-dale.jpg",cred:"Cortesia Almeida & Dale"},
{t:"Amarelinha — Alice Shintani",a:"Alice Shintani",v:"Almeida & Dale",ini:"2026-11-07",fim:"2027-01-09",d:"Primeira individual da artista na galeria, com texto crítico de José Augusto Ribeiro. Pinturas novas em grande formato e fitas amarelas de demarcação que traçam uma amarelinha no piso. Abertura em 7 de novembro, das 11h às 15h, na Rua Fradique Coutinho, 1360.",img:"img/amarelinha-almeida-dale.jpg",cred:"Cortesia Almeida & Dale"},
{t:"Glauco Rodrigues: devorador de imagens",a:"Glauco Rodrigues",v:"Galatea",ini:"2026-11-05",fim:null,d:"Individual em homenagem ao artista, com texto crítico de Ademar Britto Jr. Destaque para a série A Lenda do Coati-Puru, de 1977, com dez pinturas. Abertura em 5 de novembro, das 18h às 21h, na unidade Padre João Manuel; encerramento não divulgado.",img:"img/glauco-rodrigues-devorador-de-imagens-galatea.jpg",cred:"Cortesia Galatea"},
{t:"Voice Leading — Peter Shear",a:"Peter Shear",v:"Mendes Wood DM — Casa Iramaia",ini:"2026-11-07",fim:null,d:"Pinturas reunidas em pares, a partir da percepção do artista de que havia duplas entre seus trabalhos, com motivos que reaparecem de forma levemente diferente. Abertura em 7 de novembro; encerramento não divulgado.",img:"img/voice-leading-mendes-wood-dm-casa-iramaia.jpg",cred:"Cortesia Mendes Wood DM"},
{t:"Kansai Noguchi e Syotatsu",a:"Kansai Noguchi, Syotatsu",v:"Mendes Wood DM",ini:"2026-11-28",fim:null,d:"Mostra de dois artistas que reúne as cerâmicas de Noguchi, de tradição oleira japonesa antiga, e as obras de Syotatsu com sol, lua e estrelas. Abertura em 28 de novembro, na sede da Barra Funda; encerramento não divulgado.",img:"",cred:""},
{t:"A Ressaca da democracia — Alexander Apóstol",a:"Alexander Apóstol",v:"Galeria Raquel Arnaud",ini:"2026-11-12",fim:null,d:"Primeira individual do artista venezuelano no Brasil, com texto crítico de Ana Maria Maia. Dois trabalhos partem do abstracionismo geométrico para tratar da fragilidade política da Venezuela. Abertura em 12 de novembro, das 18h às 21h; encerramento não divulgado.",img:"",cred:""},
{t:"Residência Fause Hauten: Um artista em processo",a:"Fause Hauten",v:"CCBB São Paulo",ini:"2026-11-25",fim:"2027-01-25",d:"Estreia no Espaço Anexo do CCBB em 25 de novembro e fica em cartaz junto com a mostra de Marlene Barros. O centro abre todos os dias, exceto terças, das 9h às 20h.",img:"",cred:""},
{t:"Trickster — Sérgio Free",a:"Sérgio Free",v:"A7MA Galeria",ini:"2026-11-07",fim:"2026-12-05",d:"Em TRICKSTER, Sérgio Free apresenta o palhaço como uma figura que transita entre mundos. Nascido de sua pesquisa com a pixação nos anos 1990, o personagem ultrapassa o campo do lúdico para assumir um papel provocador, capaz de questionar valores, desestabilizar certezas e revelar aquilo que muitas vezes permanece oculto no cotidiano.",img:"",cred:""},
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
  t: "Diáfana — Gretta Sarfaty",
  v: "Museu Judaico de São Paulo",
  quem: "Gretta Sarfaty",
  txt: "Curadoria de Patricia Wagner, com apoio da Central Galeria. Mais de 50 trabalhos percorrem seis décadas da artista, em fotografia, performance, vídeo e pintura. Inédita no museu. Abertura em 13 de novembro, até 11 de abril.",
  link: "https://museujudaicosp.org.br",
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
  {d:"2026-11-09", k:"Diáfana — Gretta Sarfaty|Museu Judaico de São Paulo"},
  {d:"2026-11-08", k:"Ver o mundo — João Luiz Musa|Luciana Brito Galeria"},
  {d:"2026-11-07", k:"Pequenos Afetos|Farol Santander"},
  {d:"2026-11-06", k:"Glauco Rodrigues: devorador de imagens|Galatea"},
  {d:"2026-11-05", k:"Hino às galáxias — Ivan Campos|Almeida & Dale"},
  {d:"2026-11-04", k:"Pablo Delano: Museu da Antiga Colônia|MASP"},
  {d:"2026-11-03", k:"Jacqueline Humphries e JH Studio|Auroras"},
  {d:"2026-11-02", k:"Deslocar, Desalinhar, Interromper — Antonio Bokel|Galeria Luis Maluf"},
  {d:"2026-11-01", k:"Atrás da superfície — Paulo Monteiro|Mendes Wood DM — Casa Iramaia"},
  {d:"2026-10-31", k:"Pull/Pulso — Marcia Grostein|Luciana Brito Galeria"},
  {d:"2026-10-30", k:"Horizontes do Solo|Ateliê397"},
  {d:"2026-10-29", k:"Mucki Botkay: pinturas bordadas|Galatea"},
  {d:"2026-10-28", k:"Troca de segredos — Barrão|Fortes D'Aloia & Gabriel — Galeria"},
  {d:"2026-10-27", k:"Rosa Elena Curruchich: crônicas de Comalapa|MASP"},
  {d:"2026-10-26", k:"O Vaso de Ojuara — Claudia Marchetti|Zipper Galeria"},
  {d:"2026-10-25", k:"Cardosinho: Acervo Especial|Galeria Estação"},
  {d:"2026-10-24", k:"Khāmoshī — Fernanda Valadares|Galeria Aura"},
  {d:"2026-10-23", k:"Fazendo a América | Making America — Rosângela Rennó|Galeria Vermelho"},
  {d:"2026-10-22", k:"Quarto de hora — Elisa Arruda|AM Galeria"},
  {d:"2026-10-21", k:"O parado das coisas — Felipe Cohen|Almeida & Dale | Millan"},
  {d:"2026-10-20", k:"Sheila Hicks: o que que é isso?|Instituto Tomie Ohtake"},
  {d:"2026-10-19", k:"Espaço Profundo|A Gentil Carioca SP"},
  {d:"2026-10-18", k:"O tudo e o todo — André Vargas|Casa de Cultura do Parque"},
  {d:"2026-10-17", k:"Corrente Contínua — tecfase|Choque Cultural"},
  {d:"2026-10-16", k:"Tábula Opaca — coletiva|Galeria Aura"},
  {d:"2026-10-15", k:"Shh... — Edgard de Souza|Galeria Vermelho"},
  {d:"2026-10-14", k:"Aquilo Que Não Cabe — Jessica Costa|Zipper Galeria"},
  {d:"2026-10-13", k:"Two Big Footers — Atsushi Kaga e Tarsila do Amaral|Almeida & Dale | Millan"},
  {d:"2026-10-12", k:"Estado de Transe — Dora Smék|Central Galeria"},
  {d:"2026-10-11", k:"vem, vira, vai, voo — Selva de Carvalho|Verve Galeria"},
  {d:"2026-10-10", k:"Longitudes|Galeria Marília Razuk"},
  {d:"2026-10-09", k:"Não há só uma maneira — Oriol Vilanova|Galeria Luisa Strina"},
  {d:"2026-10-08", k:"Toda minúcia — André Barion|Galeria Estação"},
  {d:"2026-10-07", k:"Abismos Urbanos e o Plano Celeste|Galeria Lume"},
  {d:"2026-10-06", k:"Lava-Olhos de Emergência — Lucas Simões|Casa Triângulo"},
  {d:"2026-10-05", k:"Quarto de máscaras — Maya Weishof|Almeida & Dale | Millan"},
  {d:"2026-10-04", k:"Ecos — Ricardo Ribeiro|Galeria Marcelo Guarnieri"},
  {d:"2026-10-03", k:"MUNDO CADUCO|GRUTA Espaço de Arte Contemporânea"},
  {d:"2026-10-02", k:"Passeio Noturno — André Crespo|A7MA Galeria"},
  {d:"2026-10-01", k:"nome ar — Jarbas Lopes|Galeria Luisa Strina"},
  {d:"2026-09-30", k:"ambiguidade construtiva e ativação do espaço|Galeria Raquel Arnaud"},
  {d:"2026-09-29", k:"Cavalinhas e Falésias|Galeria Marília Razuk"},
  {d:"2026-09-28", k:"Território de Disputa|Galeria Lume"},
  {d:"2026-09-27", k:"Esgarçar|AM Galeria"},
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

return { foco: FOCO, destaques: DESTAQUES, contato: CONTATO, atualizado: "09/11/2026", venues: VENUES, expos: EXPOS, editais: EDITAIS, imersivas: IMERSIVAS, bairros: BAIRRO_COUNTS, grupoBairro: GRUPO_BAIRRO };
})();
