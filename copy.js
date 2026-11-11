/* ============================================================
   copy.js — o motor de copy do Vernissages SP (11/11/2026)

   Voz, métodos e vieses: docs/COPY.md. Personas: docs/PERSONAS.md.
   Regras de escrita que não mudam: ESTILO.md.

   O que faz, sem IA e sem rede (tudo determinístico e auditável):
     lint(texto, {tipo})          confere uma legenda/peça contra o ESTILO e a voz
     classificar(item, hoje)      transforma um edital do radar em fatos (onde, custo, idioma, apoio)
     notaPorPersona(c)            nota 0..10 para A (artista em SP), B (residência fora), C (estudante)
     escolher(itens, hoje, n)     triagem: os melhores para as três personas, sem repetir perfil
     titulo(c) · ficha(c) · leitura(c, i)   o texto de cada item, só com o que o dado sustenta
     gancho(...) · legendaEditais(...)      capa e legenda

   Regra de ouro: uma frase só afirma o que está em `c` (o dado). Sem dado, a frase não existe.
   ============================================================ */
'use strict';

/* ---------- 1. LINT: o ESTILO.md e a voz, em regex ---------- */

const EM = '—', EN = '–';
const BANIDAS = /\b(imperd[ií]vel|incr[ií]vel|n[ãa]o perca|venha conferir|mergulh(e|ar|o)|jornada|imersiv[oa]s?|m[áa]gic[oa]s?|espetacular|sensacional|maravilhos[oa]|show de bola|bora|arrasa(r|m)?|mano|sacou|gente|top demais)\b/i;
const INTENSIDADE = /\b(muito|super|extremamente|incrivelmente|absolutamente|totalmente)\b/i;
const ENCHIMENTO = /\b(vale a pena|vale lembrar|vale ressaltar|n[ãa]o poderia faltar|fica a dica|a dica [ée])\b/i;
const ABERTURAS_FRACAS = /^\s*(voc[êe] sabia|prepare-se|aten[çc][ãa]o|imagine|em um mundo|que tal|hoje (vamos|[ée] dia de)|olha s[óo])/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{2B50}\u{2B06}\u{2194}-\u{21AA}]/u;
const NAO_E_E = /\bn[ãa]o [ée] [^.,;:\n]{1,40},\s*[ée]\b/gi;

/* tipo: 'legenda' (prosa, rígido) ou 'peca' (texto dentro da imagem; o travessão estrutural `Título — Artista` passa) */
function lint(texto, { tipo = 'legenda' } = {}) {
  const t = String(texto || '');
  const v = [];
  const add = (regra, trecho, dica, grave = true) => v.push({ regra, trecho: String(trecho).slice(0, 60), dica, grave });
  const linhas = t.split('\n');

  if (tipo === 'legenda' && (t.includes(EM) || t.includes(EN))) add('travessao', t.slice(Math.max(0, t.search(/[–—]/) - 15), t.search(/[–—]/) + 15), 'sem travessão em prosa: use ponto, vírgula ou dois-pontos');
  if (t.includes('!')) add('exclamacao', t.slice(Math.max(0, t.indexOf('!') - 20), t.indexOf('!') + 1), 'sem exclamação');
  const emo = t.match(EMOJI); if (emo) add('emoji', emo[0], 'sem emoji');
  let m;
  if ((m = t.match(BANIDAS))) add('palavra-banida', m[0], 'adjetivo comercial ou gíria: o ESTILO.md veta');
  if ((m = t.match(INTENSIDADE))) add('intensidade', m[0], 'advérbio de intensidade não carrega dado: corte ou troque por número', false);
  if ((m = t.match(ENCHIMENTO))) add('enchimento', m[0], 'enchimento: a informação é a chamada', false);
  if (ABERTURAS_FRACAS.test(t)) add('abertura-fraca', linhas[0], 'abra com o dado, não com aquecimento');
  const nee = t.match(NAO_E_E);
  if (nee && nee.length > 1) add('nao-e-x-e-y', nee.join(' | '), '"não é X, é Y" mais de uma vez por peça: marca de texto gerado', false);

  if (tipo === 'legenda') {
    const corpo = t.replace(/(^|\s)#\S+/g, ' ').trim();
    const primeira = (corpo.split('\n').find(l => l.trim()) || '').trim();
    if (primeira.length > 125) add('primeira-linha-longa', primeira, 'a primeira linha aparece antes do "mais" (~125 caracteres): o dado precisa caber nela', false);
    if (primeira && !/\d/.test(primeira) && !/[A-ZÀ-Ý][a-zà-ÿ]{2,}.*[A-ZÀ-Ý][a-zà-ÿ]{2,}/.test(primeira.slice(1))) add('primeira-sem-dado', primeira, 'a primeira linha precisa de nome próprio, lugar ou data', false);
    /* regra do Lucas (11/11/2026): número não é gancho. Data ("15 de novembro", "15/11") e hora passam; estatística não. */
    if (/^\s*\d+(?![\d/.:h]|\s*(de\s+\w+|h\b|a\s+\d))\s*\S/.test(primeira)) add('numero-gancho', primeira, 'a primeira linha abre com número: o perfil não usa número como gancho, abra com nome, obra ou lugar', false);
    if (t.length > 1300) add('longa', t.length + ' caracteres', 'teto de 1.300 caracteres');
    const tags = (t.match(/#\S+/g) || []).length;
    if (tags && (tags < 5 || tags > 8)) add('hashtags', tags + ' hashtags', 'use de 5 a 8, específicas', false);
  }
  return v;
}

/* Trava final: nenhuma legenda sai com travessão (ESTILO.md, regra de 29/09/2026). Todo escritor de legenda
   passa o texto por aqui; o publicar.js passa de novo antes de enfileirar. Intervalo entre números vira "a"
   ("08.08 — 19.09" -> "08.08 a 19.09"); o primeiro travessão da linha vira dois-pontos; os seguintes, vírgula. */
function semTravessao(texto) {
  return String(texto).split('\n').map(l => {
    if (!/[–—]/.test(l)) return l;
    l = l.replace(/(\d)\s*[–—]\s*(\d)/g, '$1 a $2');
    let primeiro = true;
    return l.replace(/\s*[–—]\s*/g, (m, off, str) => { const r = /\d/.test(str[off - 1] || '') ? ', ' : primeiro ? ': ' : ', '; primeiro = false; return r; })
      .replace(/^\s*[:,]\s+/, '').replace(/:\s*:/g, ':').replace(/\s+([,.;:])/g, '$1');
  }).join('\n');
}

/* ---------- 2. DADOS: tradução e fatos ---------- */

const PAISES = { italy: 'Itália', norway: 'Noruega', greece: 'Grécia', thailand: 'Tailândia', spain: 'Espanha', france: 'França', germany: 'Alemanha', portugal: 'Portugal',
  uk: 'Reino Unido', 'united kingdom': 'Reino Unido', england: 'Inglaterra', scotland: 'Escócia', netherlands: 'Países Baixos', belgium: 'Bélgica', austria: 'Áustria',
  switzerland: 'Suíça', sweden: 'Suécia', denmark: 'Dinamarca', finland: 'Finlândia', iceland: 'Islândia', ireland: 'Irlanda', japan: 'Japão', korea: 'Coreia do Sul',
  india: 'Índia', mexico: 'México', argentina: 'Argentina', chile: 'Chile', colombia: 'Colômbia', usa: 'Estados Unidos', 'united states': 'Estados Unidos', canada: 'Canadá',
  turkey: 'Turquia', poland: 'Polônia', czechia: 'Tchéquia', 'czech republic': 'Tchéquia', hungary: 'Hungria', croatia: 'Croácia', estonia: 'Estônia', latvia: 'Letônia',
  lithuania: 'Lituânia', china: 'China', taiwan: 'Taiwan', indonesia: 'Indonésia', morocco: 'Marrocos', egypt: 'Egito', 'south africa': 'África do Sul', australia: 'Austrália',
  'new zealand': 'Nova Zelândia', slovenia: 'Eslovênia', serbia: 'Sérvia', romania: 'Romênia', bulgaria: 'Bulgária', cyprus: 'Chipre', malta: 'Malta', luxembourg: 'Luxemburgo' };
/* nome em inglês/original -> [nome em português, país] */
const CIDADES = { venice: ['Veneza', 'Itália'], milan: ['Milão', 'Itália'], rome: ['Roma', 'Itália'], florence: ['Florença', 'Itália'], naples: ['Nápoles', 'Itália'],
  arles: ['Arles', 'França'], fabre: ['Montpellier', 'França'], montpellier: ['Montpellier', 'França'], hamburg: ['Hamburgo', 'Alemanha'], lauenburg: ['Lauenburg', 'Alemanha'], lemgo: ['Lemgo', 'Alemanha'], berlin: ['Berlim', 'Alemanha'], niort: ['Niort', 'França'],
  paris: ['Paris', 'França'], marseille: ['Marselha', 'França'], kristiansand: ['Kristiansand', 'Noruega'], oslo: ['Oslo', 'Noruega'], 'chiang mai': ['Chiang Mai', 'Tailândia'],
  bangkok: ['Bangcoc', 'Tailândia'], lisbon: ['Lisboa', 'Portugal'], porto: ['Porto', 'Portugal'], athens: ['Atenas', 'Grécia'], crete: ['Creta', 'Grécia'],
  vienna: ['Viena', 'Áustria'], copenhagen: ['Copenhague', 'Dinamarca'], london: ['Londres', 'Reino Unido'], barcelona: ['Barcelona', 'Espanha'], madrid: ['Madri', 'Espanha'],
  mallorca: ['Maiorca', 'Espanha'], majorca: ['Maiorca', 'Espanha'], tokyo: ['Tóquio', 'Japão'], kyoto: ['Quioto', 'Japão'], 'new york': ['Nova York', 'Estados Unidos'],
  prague: ['Praga', 'Tchéquia'], brussels: ['Bruxelas', 'Bélgica'], seoul: ['Seul', 'Coreia do Sul'], amsterdam: ['Amsterdã', 'Países Baixos'], 'mexico city': ['Cidade do México', 'México'] };

const EN_PALAVRAS = /\b(the|of|in|and|for|with|residency|open call|artist|artists|studio|apartment|space|spend|winter|island|city|experience|funded|sponsored|partially|reviving|nature|international|festival)\b/gi;
const DE_PALAVRAS = /\b(und|der|die|das|für|stipendium|künstler\w*|haus|stadt)\b/gi;
const FR_PALAVRAS = /\b(appel|résidence|artiste|du|des|les|pour|porte|jeune)\b/gi;
const dias = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
const MES_EXT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const porExtenso = iso => `${+iso.slice(8)} de ${MES_EXT[+iso.slice(5, 7) - 1]}`;

function idiomaDe(t) {
  const en = (t.match(EN_PALAVRAS) || []).length, de = (t.match(DE_PALAVRAS) || []).length, fr = (t.match(FR_PALAVRAS) || []).length;
  if (en >= 2 && en >= de && en >= fr) return 'inglês';
  if (de >= 2) return 'alemão';
  if (fr >= 2) return 'francês';
  return 'português';
}

/* O item do radar vira um objeto de fatos. Nada aqui é inferido além do que o texto diz. */
function classificar(x, hoje) {
  const t = String(x.t || ''), org = String(x.org || x.fonte || ''), baixo = (t + ' ' + (x.d || '')).toLowerCase();
  const orgPais = (org.split('·')[1] || '').trim().toLowerCase();
  let cidade = null, pais = PAISES[orgPais] || null;
  for (const [k, [pt, p]] of Object.entries(CIDADES)) if (new RegExp('\\b' + k + '\\b', 'i').test(t)) { cidade = pt; pais = pais || p; break; }
  if (!pais) for (const [k, pt] of Object.entries(PAISES)) if (new RegExp('\\b' + k + '\\b', 'i').test(t)) { pais = pt; break; }
  const onde = x.onde === 'São Paulo' || x.onde === 'sp' ? 'sp' : (x.onde === 'Exterior' || x.onde === 'exterior') ? 'exterior' : 'brasil';
  const online = /\bon-?line\b|\bremote(ly)?\b|\bvirtual\b/i.test(t) || /^global$/i.test(orgPais);
  let apoio = null;
  if (/partially (funded|sponsored|supported)|part-?funded|apoio parcial|partial/i.test(t)) apoio = 'parcial';
  else if (/fully (funded|sponsored)|bolsa|stipend|grant|scholarship|stipendium/i.test(t) || x.custo === 'apoio' || (x.cita || []).length) apoio = 'consta';
  return {
    t, org, link: x.link, prazo: x.prazo, cat: x.cat || 'Chamada', onde, cidade, pais, online, apoio,
    custo: x.custo || '', taxaTxt: x.taxaTxt || '', cita: x.cita || [],
    idioma: onde === 'exterior' ? idiomaDe(t) : (idiomaDe(t) === 'português' ? 'português' : idiomaDe(t)),
    dias: x.prazo ? dias(hoje, x.prazo) : null, conf: !!x.conf, fonte: org.split('·')[0].replace(/\s*\(.*\)\s*$/, '').trim()
  };
}

/* ---------- 3. TRIAGEM POR PERSONA (pesos para editar depois da validação: docs/PERSONAS.md) ---------- */

const clamp = v => Math.max(0, Math.min(10, Math.round(v * 10) / 10));
function notaPorPersona(c) {
  const edit = ['Edital', 'Prêmio', 'Bolsa', 'Fomento'].includes(c.cat), resid = /resid/i.test(c.cat);
  const taxa = c.custo === 'taxa';
  let A = 5, B = 4, C = 4;
  /* A: artista em SP que ainda não vive de arte */
  A += c.onde === 'sp' ? 3 : c.onde === 'brasil' ? 2 : -2;
  A += c.idioma === 'português' ? 1 : -2;
  A += taxa ? -4 : 0; A += c.apoio ? 1 : 0; A += edit ? 1 : 0;
  A += c.dias != null && c.dias < 3 ? -2 : c.dias != null && c.dias <= 9 ? 1 : 0;
  /* B: trajetória, quer residência fora */
  B += c.onde === 'exterior' ? 3 : c.onde === 'sp' ? -1 : 0;
  B += resid ? 2 : 0; B += c.apoio ? 2 : 0; B += taxa && !c.apoio ? -2 : 0;
  B += c.dias != null && c.dias >= 4 ? 1 : 0; B += c.pais ? 1 : 0;
  /* C: estudante, pouca grana, pouco repertório */
  C += c.onde === 'sp' ? 2 : c.onde === 'brasil' ? 1 : -1;
  C += c.idioma === 'português' ? 1 : -1;
  C += taxa ? -3 : 0; C += edit || /chamada/i.test(c.cat) ? 1 : 0; C += resid && c.onde === 'exterior' ? -1 : 0;
  C += c.dias != null && c.dias >= 5 ? 1 : 0; C += c.online ? 1 : 0;
  return { A: clamp(A), B: clamp(B), C: clamp(C) };
}
const ROTULO_PERSONA = { A: 'para quem está em São Paulo', B: 'para quem quer sair do país', C: 'para quem está começando' };

/* Janela de prazo por origem: chamada daqui vale avisar com mais antecedência; a de fora só quando está perto. */
const JANELA = { sp: 45, brasil: 45, exterior: 21 };
const NAO_CHAMADA = /inscri[çc][õo]es\s+(fechadas|encerradas)|\bencerrad[ao]s?\b|\b(conversa|palestra|webinar|bate-papo|mesa redonda|lan[çc]amento de livro|visita guiada|oficina|curso|workshop|exposi[çc][ãa]o)\b|festival|jardin|garden/i;

/* Etapa 1: quem PODE entrar. Fora: o que já cobra taxa (seção própria no site), o que não é chamada, o que está fora da janela. */
function candidatos(itens, hoje) {
  return itens.filter(x => x.custo !== 'taxa' && x.prazo && !NAO_CHAMADA.test(x.t || '')).map(x => classificar(x, hoje))
    .filter(c => c.dias != null && c.dias >= 0 && c.dias <= JANELA[c.onde]).map(c => ({ ...c, nota: notaPorPersona(c) }))
    .sort((a, b) => Math.max(...Object.values(b.nota)) - Math.max(...Object.values(a.nota)) || a.prazo.localeCompare(b.prazo));
}

/* Etapa 3 (a etapa 2 é o edital-confere.js, na rede): o melhor de cada persona primeiro, para a lista não virar um perfil só. */
function escolher(itens, hoje, n = 4) { return selecionar(candidatos(itens, hoje), n); }
function selecionar(todos, n = 4) {
  const usados = new Set(), pick = [];
  for (const p of ['A', 'B', 'C']) {
    const melhor = todos.filter(c => !usados.has(c.link)).sort((a, b) => b.nota[p] - a.nota[p] || a.prazo.localeCompare(b.prazo))[0];
    if (melhor && melhor.nota[p] >= 5) { usados.add(melhor.link); pick.push({ ...melhor, para: p }); }
  }
  const resto = todos.filter(c => !usados.has(c.link)).sort((a, b) => Math.max(...Object.values(b.nota)) - Math.max(...Object.values(a.nota)) || a.prazo.localeCompare(b.prazo));
  for (const c of resto) { if (pick.length >= n) break; const p = Object.entries(c.nota).sort((a, b) => b[1] - a[1])[0][0]; pick.push({ ...c, para: p }); usados.add(c.link); }
  return pick.slice(0, n).sort((a, b) => a.prazo.localeCompare(b.prazo));
}

/* ---------- 4. TEXTO DE CADA ITEM (só afirma o que o dado sustenta) ---------- */

const MAIUS = s => s.charAt(0).toUpperCase() + s.slice(1);
const SEM_ARTIGO = new Set(['Portugal', 'Chipre', 'Malta', 'Taiwan', 'Luxemburgo', 'Israel', 'Cuba']);
const MASC = new Set(['Japão', 'México', 'Chile', 'Canadá', 'Marrocos', 'Egito', 'Reino Unido', 'Peru', 'Equador', 'Uruguai', 'Paraguai']);
const PLURAL = new Set(['Estados Unidos', 'Países Baixos']);
/* "em" + artigo: na Itália, no Japão, nos Estados Unidos, em Portugal */
const emPais = p => SEM_ARTIGO.has(p) ? 'em ' + p : PLURAL.has(p) ? 'nos ' + p : MASC.has(p) ? 'no ' + p : 'na ' + p;
function titulo(c) {
  if (c.idioma === 'português' || c.tituloPT) return semTravessao(c.t.replace(/\s+[–—-]+\s+/g, ': ')).replace(/\s+/g, ' ').trim();
  const cat = /resid/i.test(c.cat) ? 'Residência' : MAIUS(c.cat.toLowerCase());
  if (c.online) return `${cat} online`;
  if (c.cidade) return `${cat} em ${c.cidade}`;
  if (c.pais) return `${cat} ${emPais(c.pais)}`;
  return `${cat} no exterior`;
}

const DOW = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const diaSemana = iso => DOW[new Date(iso + 'T12:00:00Z').getUTCDay()];

/* prazo em palavras de gente: sem contagem regressiva em número */
function prazoTxt(c) {
  if (c.dias === 0) return 'último dia';
  if (c.dias === 1) return 'fecha amanhã';
  return c.dias <= 6 ? `fecha ${diaSemana(c.prazo)}` : `fecha dia ${+c.prazo.slice(8)}`;
}

function ficha(c) {
  const f = [['Prazo', `até ${porExtenso(c.prazo)}`]];
  f.push(['Onde', c.online ? 'online' : c.cidade && c.pais ? `${c.cidade}, ${c.pais}` : c.pais || (c.onde === 'sp' ? 'São Paulo' : c.onde === 'brasil' ? 'Brasil' : 'exterior')]);
  f.push(['Idioma', c.idioma]);
  f.push(['Custo', c.custo === 'taxa' ? (c.taxaTxt || 'taxa de inscrição') : c.apoio === 'parcial' ? 'apoio parcial, ver o que cobre' : c.apoio ? 'consta apoio, ver o que cobre' : 'taxa não informada na fonte']);
  return f;
}

/* A frase ácida: uma regra por situação, cada uma amarrada a um fato do objeto. `i` alterna a variante dentro do post. */
function leitura(c, i = 0) {
  const alt = (...v) => v[i % v.length];
  if (c.dias === 0) return 'Hoje. O regulamento não espera o seu fim de semana.';
  if (c.dias === 1) return 'É amanhã. Quem ia ler com calma vai ler com pressa.';
  if (c.custo === 'taxa') return `Cobra ${c.taxaTxt || 'inscrição'} para você tentar. Descubra o que a taxa compra antes de pagar.`;
  if (c.online) return alt('Online. Nenhuma passagem, nenhuma desculpa.', 'Online: a única viagem é até o regulamento.');
  if (c.apoio === 'parcial') return alt('O título diz "parcial". Descubra quanto sobra para você pagar antes de se animar.', 'Apoio parcial é a palavra que mais merece leitura. O resto da conta é sua.');
  if (c.onde === 'sp') return alt('Fica em São Paulo: a única viagem é até o regulamento.', `É em São Paulo e fecha ${c.dias <= 6 ? diaSemana(c.prazo) : 'dia ' + +c.prazo.slice(8)}. Falta pouco para a desculpa acabar.`);
  if (c.apoio === 'consta') return alt('Consta apoio na fonte. Descubra o que ele cobre: hospedagem, ateliê, passagem?', 'A fonte cita apoio. Antes de se animar, leia o que está dentro e o que está fora dele.');
  if (c.onde === 'exterior') return c.idioma !== 'português'
    ? alt(`Formulário em ${c.idioma}. Antes de abrir: o que cobre hospedagem, ateliê e passagem?`, `Programa fora do país, em ${c.idioma}. A inscrição é só a primeira conta.`)
    : alt('Fora do país. A inscrição é só a primeira conta: confira hospedagem, ateliê e passagem.', 'Fora do país. Antes de se animar: hospedagem, ateliê e passagem estão cobertos?');
  return 'Prazo conferido na página hoje. Prorrogação é comum: confirme.';
}

/* ---------- 5. CAPA E LEGENDA ---------- */

/* Capa sem número: palavra e imagem. A imagem é uma obra em cartaz (ver editais-post.js). */
function gancho() {
  return { linhas: ['CHAMADAS', 'ABERTAS'], sub: 'O prazo de cada uma foi conferido na página da chamada, hoje.' };
}

const AGREGADORES = /^(apoio\.art|res artis|dasartes|instagram|prêmio pipa)/i;
function legendaEditais({ pick, foraTaxa, capa }) {
  const lead = pick.find(c => c.onde !== 'exterior') || pick[0];
  const tl = titulo(lead);
  const primeira = `${tl}${lead.fonte && !AGREGADORES.test(lead.fonte) && !tl.includes(lead.fonte) ? ', ' + lead.fonte : ''}: inscrições até ${porExtenso(lead.prazo)}.`;
  const corpo = pick.map((c, i) => {
    const onde = c.online ? 'online' : c.cidade && c.pais ? `${c.cidade}, ${c.pais}` : c.pais || (c.onde === 'sp' ? 'São Paulo' : c.onde === 'brasil' ? 'Brasil' : 'exterior');
    const tt = titulo(c), dito = (c.pais && tt.includes(c.pais)) || (c.cidade && tt.includes(c.cidade));
    return `${tt}${dito ? '' : ' (' + onde + ')'}. Até ${porExtenso(c.prazo)}. ${leitura(c, i)}`;
  }).join('\n\n');
  const fora = foraTaxa ? '\n\nResidências em que o artista paga taxa de inscrição ficam numa seção à parte no site, com o valor lido da página.' : '';
  const credito = capa ? `\n\nImagem de capa: ${capa.titulo}${capa.artista ? ', ' + capa.artista : ''}, ${capa.casa}. ${capa.cred}` : '';
  return `${primeira}\n\nAs chamadas abaixo têm o prazo conferido na página de cada uma hoje.\n\n${corpo}${fora}\n\nProrrogação é comum, então o regulamento oficial é a palavra final. A lista completa está em vernissagessp.com.br/editais.\n\nSalva para a próxima sexta e manda para quem tem prazo pendente.${credito}\n\n#editaisdearte #chamadaaberta #artistasvisuais #arteemsp #residenciaartistica #artecontemporanea`;
}

module.exports = { lint, semTravessao, classificar, notaPorPersona, candidatos, selecionar, escolher, titulo, ficha, leitura, prazoTxt, diaSemana, gancho, legendaEditais, porExtenso, dias, ROTULO_PERSONA, BANIDAS, NAO_CHAMADA, JANELA };
