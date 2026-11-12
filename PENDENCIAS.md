# PENDÊNCIAS — estado do projeto em 13/10/2026

Retrato refeito em 13/10. Substitui o de 10/09 (91 casas, 55 em cartaz), que estava velho.

**Base agora (`dados.js`, `atualizado` 13/10/2026):** 125 casas (72 galerias · 41 institucionais · 11 híbridos · 1 feira;
17 só com Instagram) · 96 mostras, 84 em cartaz, **55 com imagem e 29 sem** · 61 casas sem nenhuma mostra na agenda ·
2 editais.

---

## 1 · As frentes

| frente | estado |
|---|---|
| **Site / PWA** | no ar, atualização por Actions (`diaria`, `build`, `espelhar-imagens`, `valida`) |
| **Social** | semana 12 a 18/10 gerada (obra qua, agenda qui, encerra sex, deriva sáb) em `SOCIAL/10/`; publicação manual |
| **Captação** | `EDITAIS/DOSSIE.md` travado nos `» PREENCHER` do Lucas |
| **Intel** | `intel/` arquitetado, nunca lançado (boletim pago R$47/mês) |

---

## 2 · Gargalos reais

### 2.1 · Imagem é o limite do social
`obra` e `encerra` falham quando nenhuma obra passa na régua: ≥1400 px de largura, crédito, não vista de sala.
29 mostras em cartaz estão sem imagem. Mudança de 13/10: imagem em paisagem passa da régua de proporção quando o
`dados.js` traz `foco` (0 a 100, posição horizontal do recorte 4:5); sem `foco` vale a trava de 1.6x.
**Garimpo: nunca aceitar sem olhar.** Em 13/10, de 15 propostas, 10 eram banner, retrato, miniatura ou a mesma foto
em duas mostras. O `descobrir-imagens.js` roda sozinho aos sábados e abre a issue `garimpo`.

### 2.2 · Cobertura
61 das 125 casas nunca tiveram mostra na agenda. Metade do mapa é fachada. As 17 casas `soIG` dependem da raspagem
semanal do Instagram (`instagram.js`, Apify).

### 2.3 · Casas não mapeadas (radar de 10/10, #14)
Sem entrada no diretório, então nenhuma mostra delas vira agenda: Claraboia, Galeria Mayer Mizrahi, WG Galeria,
Move Arte, Biblioteca Mário de Andrade, e fora de SP (Museu FAMA em Itu, Pinacoteca de Piracicaba). Decidir caso a caso.

### 2.4 · Mostra do radar ainda fora da base
*A Elegância do Olhar* (Sebastião Salgado e Mirella Ricciardi, Galeria Mario Cohen, 29/09 a 11/11): o título não
apareceu no site da galeria, conferir antes de incluir. Divergências de data de Sol Calero e Histórias
Latino-Americanas (MASP) também esperam conferência na fonte.

---

## 3 · Decisões que são suas

1. **Curadoria semanal de `rima` e `aproximacao`:** falham de propósito sem `rima.json`/`aproximacao.json` no dia.
2. **Boletim `intel/`:** pago ou gratuito, domínio de envio, e apertar o botão.
3. **`» PREENCHER` do `EDITAIS/DOSSIE.md`:** CNPJ e CNAE do MEI, visitas/mês, mini-CV.
4. **Instagram:** publicação sempre manual. Peças em `SOCIAL/MM/DD/`, legendas em `*-LEGENDA.md`.
5. **Voz:** `ESTILO.md` e `NEGOCIO/Copywriter.md` pedem texto sem gíria, sem emoji e sem "imperdível".

---

## 4 · Arrumação da pasta (em curso desde 13/10)

- [x] Notas de negócio (`MVP.md`, `Copywriter.md`, `Social Media.md`) movidas pra `NEGOCIO/` (fora do git; repo é público).
- [x] Este arquivo refeito.
- [x] Issues de radar e garimpo de 29/08 a 03/10 (#1 a #13) fechadas; ficam #14 e #15.
- [x] `IDEIAS.md`, `REFERENCIAS.md` e `DESIGN.md` em `docs/`. `OPERACAO.md`, `ESTILO.md`, `POSTS.md`, `COMOGERAR.md`
      e `README.md` ficam na raiz de propósito: as rotinas de nuvem (`.github/prompts/`) e o `check.js` apontam pra eles.
- [x] Triagem de resto (13/10): `estudio.html` removido; imagens da Carmela Gross e propostas antigas de `PENDENTE/` tiradas da pasta.
- [x] `.html` soltos: todos são páginas do site, exceto `limpar.html` (ferramenta interna, só o index aponta).
- [x] Rotina de domingo: a rotina de nuvem (pausada desde 14/09 em claude.ai/code/routines) já foi substituída pela
      Action `vsp-semana.yml`, que roda e está verde (última 11/10). Não religar a antiga.
- [x] A Action aplicava as issues mas não as fechava (`issues: read`). Em 13/10 ganhou `issues: write` e um passo 7 no prompt: fecha com comentário (aplicado / não confirmado / pendente). Conferir na próxima execução (domingo 18/10 ou após o garimpo de sábado).
- [ ] Scripts `.js` ficam na raiz: movê-los exige editar `require` e 5 workflows, só em sessão própria com teste.

## Domingo 21/10/2026 — sobras das issues radar/garimpo
- NÃO confirmado: "A Elegância do Olhar" (Galeria Mario Cohen) — site da casa não menciona; fica fora.
- Divergências descartadas: Histórias Latino-Americanas (MASP confirma fim 31/01/2027, base certa); Tudo aquilo que move (Frente confirma abertura 29/09, base certa); Cavalinhas e Falésias (Razuk confirma 12/09, base certa). Sol Calero: página do MASP não dá fim; base mantida (30/01/2027) — conferir com o Lucas.
- Imagens recusadas: Itaú (retrato de Anísio Teixeira), Museu da Imigração (cartaz Canva), Museu Afro Brasil (banner genérico), MIS (réguas/banners), Galeria Frente (thumb 180px), IMS (página não confere). Demais: não verificadas/sem confirmação.
- Casas não mapeadas (só relato): Claraboia, Rosewood SP, Museu FAMA (Itu), Pinacoteca Miguel Dutra (Piracicaba), Move Arte, Mayer Mizrahi, WG Galeria, Casa Yara DW, Alma da Rua, Pina Contemporânea, Mitre Galeria, Cemitério Parque das Cerejeiras, Gomide&Co (variação de nome?), CCSP (variação?).

## Domingo 31/10/2026 — sobras das issues radar #21/#19 e garimpo #22
- NÃO confirmado (fora do dados.js): A Elegância do Olhar (Mario Cohen), A vigília do fogo (Metrópole), Sara Ramo (Pinacoteca; home só cita o título, sem datas), Amarelinha / Hino às galáxias / Ainda quero mergulhar (Almeida & Dale: datas 07/11/26–09/01/27 confirmadas na home, mas sem espaço/curadoria/fato para o campo `d`).
- África – Ancestralidade e Sincretismos (Oscar Americano): curadoria Rafael Schunk e Renato Araújo; site diz "Até 01 de Março" sem ano, agregador diz 2027-03-23. Falta confirmar data.
- MASP Sol Calero (fim base 30/01/2027 vs agregador 30/05/2027): MASP não confirmado nesta rodada, base mantida.
- To Love (Galeria Vermelho, fim null): site deu 403; segue na base.
- Imagens do garimpo recusadas: Museu Afro Brasil (img_apoie_01.jpg, banner genérico repetido em 4 mostras), MIS (img_expo_linha-fotografia-tb.jpg genérica; réguas/banners de período eleitoral).
- Casas não mapeadas (só relato): Claraboia, Sardenberg, Rosewood SP, Museu FAMA, Pinacoteca Miguel Dutra, Move Arte, Mayer Mizrahi, WG Galeria, Casa Yara DW, Pina Contemporânea, Mitre Galeria, Cemitério Parque das Cerejeiras, AM Galeria SP, Gomide&Co (grafia), Karla Osorio, CCSP.
- Mitologias do Mistério (Casa de Cultura do Parque) também tem fim 25/10 passado e não foi removida (não estava no radar).

---

## Atualização de 08/11/2026

**Feito e no ar nesta data**
- **Abre esta semana**: só mostra COM imagem; não existe cartão de reserva; sem nenhuma com imagem a seção some; trilho curto não prende a rolagem. Guardado por `check-layout.test.js` (roda no `check.yml`).
- **Recorte automático de imagem** (`analisa()` no `index.html`): acha o bloco principal de conteúdo e ignora legenda isolada (caso Coordenadas improváveis).
- **Caçador de imagens**: roda todo dia 07:30 SP (`--aberturas=10`, força a busca) e sexta (varredura completa). Julgamento `--auto` por regras, **sem IA e sem custo**. Resumo de cada rodada lista as aberturas da semana sem imagem.
- **Espaços**: o nome abre a ficha na própria página (`fichaCasa`); botões em ícone (globo, Instagram) e só "Rota" escrito.

**Próxima sessão**
1. **Social genérico e repetitivo, principalmente Reels**: criar formatos novos usando a estética nova do site.
2. **Página de Editais**: genérica, "cara de IA"; redesenhar.
3. **Residência paga** (Ilhabela, "Praia Mauro"?): selo "com taxa", separar ou rebaixar de edital com bolsa; conferir o caso no radar.
4. **A Ressaca da democracia** (Apóstol, Raquel Arnaud, abre 12/11) sem imagem: sai da seção até a galeria publicar.
5. Conferir a primeira rodada automática do caçador (Actions) e se aparece imagem errada.
6. Decidir se "Abre esta semana" inclui também as que abriram nesta semana.

**Regra firme**: automação recorrente não chama Claude nem outra IA paga.

---

## Atualização de 09/11/2026

**Feito e no ar nesta data** (detalhe da direção em `docs/DIRECAO-DE-ARTE.md`)
- **Direção de arte em código** (`direcao.js`): papel e tinta, cor da obra, Instrument Serif local em `fontes/`. Tudo abaixo usa isso.
- **Reel novo** (`reel-arte.js`): três formatos (abre, fecha, rota), capa em cor chapada da obra, data gigante, véu entre cenas, mapa na cena final, batida grave nos cortes. Renderiza frame a frame no Chrome, sem IA (~35 s). O `dia-auto` roda terça, sexta e domingo; o `reel-auto.js` antigo ficou só de reserva.
- **Feed**: etiqueta de obra, encerra e estreia refeita (data gigante na cor da obra). **Stories** refeitos (selo gigante, obra inteira, zona segura).
- **Card de editais** (`editais-post.js`): segunda-feira, feed, lê `radar/proximos.json` (escrito pelo `gerar.js`).
- **Página de Editais** redesenhada: histograma dos prazos, títulos em serifa, sem pílulas nem KPIs. **Residência com taxa** (lida da página da chamada, `radar-resartis.js`) vai para uma seção própria no fim; o caso de Ilhabela cobra a partir de 1.950 USD.
- **Aberturas da semana** inclui as que abriram nos últimos 6 dias (ABRIU, depois das que abrem).
- Bugs achados: `SOCIAL/REELS-USADOS.json` estava no `.gitignore` (a memória dos Reels nunca era salva no CI); o resumo do caçador falhava sem `aplicar.log`; o filtro de ruído do radar nasceu sem as barras dos `\b`.

**Pendências**
1. Conferir a primeira rodada real do Reel novo (terça 10/11, depois sexta 13/11) e o card de editais (segunda 16/11). Ver o vídeo antes de aprovar o formato.
2. O caçador diário ainda não rodou sozinho (primeiro cron 10/11 07:30 SP); a manual de 09/11 só confirmou que A Ressaca da democracia continua sem imagem em qualquer fonte.
3. `dia-auto.yml` ainda instala e chama o Claude para legendar obra/encerra/estreia (passo "Legendar o feed"): gasta crédito todo dia, contra a regra de 08/11. Legenda por regra resolve; falta o Lucas autorizar mexer.
4. Ideias da direção ainda não feitas: Reel "grátis", "onde ainda dá tempo", mapa vivo no story, carrossel do mês.

---

## Atualização de 09/11/2026, noite (continuação da sessão de direção de arte)

**Feito e no ar**
- **Postado hoje:** carrossel que apresenta a aba de Editais (15:30). Na fila: Reel "Últimos dias" (hoje 18:30), carrossel "Quem paga" (ter 10/11 12:30), carrossel "A fundo" do Fernando Lemos (qua 11/11 12:00), carrossel de aproximação da Jessica Costa (qui 12/11 19:00).
- **Geradores novos:** `carrossel.js` (spec JSON em `carrosseis/`, texto escrito na conversa, sem IA), `detalhes.js` (aproximação real de obra), `editais-post.js` (card semanal de editais, segunda), `editais-apresenta.js`, `destaques.js` (5 capas em `destaques/`).
- **Página de Editais v3** (`gerar.js`): hero em duas colunas, semana a semana, "No Brasil" em cards (contorno, luz que segue o cursor, inclinação, entrada em cascata) e "No exterior" em índice por prazo; atalhos de um clique; etiqueta COM TAXA; "a página cita" (hospedagem, ateliê, refeições) lido das chamadas; botão Lembrete (.ics). Plural do filtro corrigido (Editais).
- **Favicon novo** (V claro sobre terracota). **Benchmark** em `docs/BENCHMARK.md` (MASP, IMS, Artforum, ArtConnect vistos no navegador). **Linha editorial** em `docs/LINHA-EDITORIAL.md`.
- **Regras firmes anotadas:** nenhum texto sobre a obra, nem tratada; moldura fixa descartada (Lucas gosta de peça só de arte, tela cheia).
- **Infra:** `publicar.yml` agora roda a cada 30 min; `REELS-USADOS.json` liberado no `.gitignore`; `dia-auto` aceita carrossel manual como feed do dia e tem Reel ter/sex/dom.

**Pendências, em ordem**
1. **Conferir hoje:** o Reel das 18:30 saiu? (o disparo manual estava num processo local; se o computador dormir, o cron de 30 min cobre, mas pode atrasar).
2. **Primeiros Reels automáticos** (ter 10/11, sex 13/11, dom 15/11) e o card de editais (seg 16/11): ver o vídeo e a peça antes de confiar.
3. **Legendas do `dia-auto` ainda chamam o Claude** (gasta crédito todo dia). Trocar por legenda por regra, como em `editais-post.js`; falta o Lucas autorizar.
4. **Destaques do perfil:** só criam no app do celular. Capas prontas em `destaques/`; falta gerar um story por série (Editais, A fundo, Abre, A pé, Mapa) para empilhar em cada destaque.
5. **Ideias aprovadas para fazer:** "Quem expõe o quê" (perfil de uma galeria), "Na mesma rua" (Reel de quadra), calendário mensal de aberturas (carrossel dia 1), "Só a obra" (5 imagens tela cheia), Reel "De graça" e "Onde ainda dá tempo", carrosséis de apresentação do Mapa e do Acervo, carrossel de quarta fixo ("A fundo"; próximo: Sol Calero no MASP).
6. **Editais, limpeza de fonte:** muito título em inglês; duas chamadas de Ilhabela aparecem separadas; resumos raspados sujos ficam de fora, mas a fonte continua suja. Radar ainda lista chamada que não é de artista visual.
7. **Gargalo de foto fresca** (regra "foto nunca repete"): o feed de obra/encerra/estreia não passa há dias; o caçador diário ainda não foi visto rodando sozinho (primeiro cron 10/11 07:30).
8. **A testar:** feed em 1080x1440 (3:4); foto de gente nas aberturas; benchmark visual de e-flux e Gallery Weekend Berlin (bloquearam a captura).
9. Ressaca da democracia (Raquel Arnaud) segue sem imagem até a galeria publicar.

---

## 09/11/2026, fim do dia: itens 5, 6 e 7 resolvidos

- **7 (foto fresca):** o veto de foto repetida tinha gasto 35 das 48 imagens em cartaz (sobravam 6). Curei 14 fotos extras de 11 mostras olhando a folha de contato (`fotos-extras.json`, `extras-fotos.js`, campos `img2`/`img3` no dados.js); o `exigirObra` cai para a extra quando a principal já saiu ou é vista de sala. Agora 13 imagens passam (eram 6). `marcarFoto()` registra no veto a foto de carrossel gerada fora do semana.js. Se o estoque voltar a secar: rodar `alt-fotos` (folha de contato das candidatas do acervo-imagens.json) e curar mais. O caçador diário roda sozinho pela primeira vez em 10/11, 07:30.
- **6 (editais):** radar sem feira de arte e sem chamada para galerias; residência duplicada do Res Artis unida; título em inglês marcado "em inglês".
- **5 (ideias):** feitos `soaobra.js` (carrossel "Só a obra", na fila sáb 14/11 12:00) e os Reels "De graça" e "Ainda dá tempo" (modos `gratis` e `tempo` do reel-arte.js, entram no rodízio de terça, sexta e domingo). Ficam: "Quem expõe o quê" (perfil de galeria), "Na mesma rua", calendário mensal, apresentação do Mapa e do Acervo.

**Correção (09/11, noite):** o carrossel "Só a obra" (mistura de mostras de casas diferentes) foi descartado por decisão do Lucas: pode conflitar com o interesse das galerias. No lugar entrou o formato **uma exposição, várias fotos** (exposicao.js: fotos da mesma mostra, preenchendo o slide ou na parede quando a foto é larga; legenda de parede no fim). Primeiro: Ver o mundo, João Luiz Musa (Luciana Brito), sáb 14/11 12:00. Próximas candidatas: Pull/Pulso (Luciana Brito), Atrás da superfície (Mendes Wood DM).

**Panorâmica (09/11, noite):** pedido do Lucas de carrossel contínuo (a imagem passa de um slide para o seguinte). Feito: panoramica.js (tela única de N x 1080, tira a margem lisa, preenche com a cor exata do fundo da imagem, fatia em N slides + ficha). Primeiro: Casa María Lionza, Sol Calero (MASP), 4 partes, qua 18/11 12:00; usa a foto extra de 9933 px (img2). Candidatas boas para o formato: obra larga ou vista de sala longa.

**Exposição no feed, com busca na fonte (09/11, noite):** exposicao.js ganhou --buscar (abre a página da mostra no site da casa e no Arte Que Acontece, baixa todas as imagens grandes, sobe o tamanho no CDN Artlogic e tira duplicatas por hash perceptual) e --pano=índice:n (uma foto vira faixa contínua em n slides). Procedimento: node exposicao.js "Título" --buscar --folha=pasta, olhar a folha, depois --ordem=... --pano=... --out=... e publicar.js enfileirar. Na fila: Ver o mundo (sáb 14/11) e Pull/Pulso (ter 17/11, com a vista da casa em panorâmica). Datas de fim das duas mostras corrigidas no dados.js (19/12/2026, lido na página da galeria). A página da galeria também lista o texto curatorial: dá para usar em carrossel profundo.

---

## 09/11/2026, noite: Instagram sem IA e exposição automática

- **BLOQUEIO:** o Apify free estourou os US$ 5 do mês (403 platform-feature-disabled em 09/11). Enquanto não resetar o ciclo (ou o Lucas subir o limite em console.apify.com), nenhum raspador do Instagram roda: instagram.yml, instagram-fotos.yml e radar-ig.yml. A raspagem semanal de 102 casas é a que mais gasta; se o crédito apertar, voltar o escopo para soIG (18 casas) e para as casas com mostra sem foto.
- **A7MA / Trickster (Sergio Free, 07/11 a 05/12):** o post foi raspado em 04/11, o Claude do instagram.yml não criou a mostra e o post virou "visto". Entrou à mão no dados.js (sem foto). A foto virá quando o Apify voltar: gh workflow run instagram.yml -f so=a7magaleria -f dias=30 -f sem_vistos=true.
- **instagram-mostras.js (sem IA)** substitui o passo do Claude no instagram.yml: lê a legenda, acha título, artista, abertura, encerramento, curadoria e quem assina o texto; mostra nova ou completa a existente; dúvida vai para o resumo. instagram.js ganhou --so e --sem-vistos. Testado só com a legenda real do Trickster; a primeira rodada completa (com Apify) ainda não foi vista.
- **exposicao-auto.yml (sem IA), domingo e quarta 19h:** escolhe mostra em cartaz com página Artlogic (Luciana Brito, Mendes Wood DM e afins), >= 6 fotos e texto de >= 300 caracteres; monta carrossel de 10 slides (fotos, faixa contínua da vista de sala, 2 trechos do texto com assinatura, ficha) e enfileira para ter/qui/sáb 12:00; máximo 2 na fila. Memória em SOCIAL/EXPOSICOES-USADAS.json. Casas sem site Artlogic ficam fora (ex.: só Instagram).

**Recorte de imagem refeito (12/11):** recorte.js (fonte única; index.html e site.js recebem o código). Antes: a caixa da obra vinha da cor dos cantos e incluía parede em degradê e a sombra. Agora: a caixa antiga é cruzada com uma detecção por borda (obra tem contorno, sombra e degradê de parede não), e foto sangrada (cantos sem cara de parede) nunca é cortada. Testado em 40 imagens (recorte-test no scratchpad). Depois de mudar o recorte.js, rodar node gerar.js e atualizar o bloco RECORTE em index.html (patch-rc-site.js foi só a primeira injeção; para atualizar, trocar o texto entre /*RECORTE-INI*/ e /*RECORTE-FIM*/).
