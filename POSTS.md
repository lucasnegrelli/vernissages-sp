# POSTS.md — sistema visual dos carrosséis do Vernissages SP

Especificação do kit de post: o que o `post.html` gera, com que tipografia, que tratamento de imagem e sob que regras editoriais.

> **Documento reconstruído em 10/08/2026.** O original foi escrito na pasta `outputs` de uma sessão anterior, que é efêmera, e se perdeu. A espinha (sistema tipográfico, as duas travas, a regra ética, os dez tratamentos) veio do registro daquela sessão. Os pontos marcados **[confirmar]** são preenchimentos plausíveis, não decisões que você aprovou — reveja antes de implementar.
>
> Este arquivo mora na pasta do projeto, não em `outputs`. Não mova.

---

## 0. Linha editorial

### Regra de ouro — o que aprendemos em 11/08

**Só é postagem oficial o que sai da tarefa agendada.** Nada gerado em sessão de debug, teste, ou conferência manual do `post.html` vai para o Instagram, mesmo que pareça pronto. Em 10/08 uma sessão de debug gerou o carrossel da semana 02 como prova de que um bug de sobreposição tinha sido corrigido — não era pra publicar — e foi postado por engano, criando duplicidade quando a tarefa `vsp-carrossel-terca` rodou certinho no dia seguinte. Se um carrossel de teste parecer bom o bastante pra ir ao ar, espere a tarefa agendada gerar a versão oficial; não adiante.

### Objetivo

**5.000 seguidores orgânicos até dezembro de 2026**, partindo de ~40. Sem colabs por enquanto — prioridade é encorpar o perfil e ganhar tração própria antes de dividir palco com outras contas.

### O que dá para automatizar e o que não dá

Importante não prometer automação que a IA não cumpre:

- **Automatizável por mim (Claude), via tarefa agendada:** roteiro de texto, legenda, carrossel estático (`post.html`), pesquisa de dados para o `dados.js`, script/roteiro escrito para Reels (o texto que o Lucas fala ou lê, não o vídeo em si).
- **Exige o Lucas em pessoa:** filmar e editar Reels, ir a eventos ("cobertura in loco"), comentar em perfis de outras contas ("ataque ativo"/engajamento manual — além disso, automatizar curtidas/comentários em massa viola os termos do Instagram e arrisca a conta. Isto aqui é redação, não bot de engajamento.). Esses itens ficam no calendário como lembrete, não como tarefa que roda sozinha.

### Calendário semanal de conteúdo

**Meta: pelo menos uma peça de conteúdo pronta por dia.** "Pronta" quer dizer rascunho — imagem+legenda ou roteiro de texto — esperando o Lucas revisar e postar. **A publicação em si nunca é automática**, em nenhum dia da semana: é limite de segurança/ToS do Instagram, não uma preferência a discutir a cada rodada.

**Regra de 11/08, corrigida depois que o Lucas apontou o furo: Reel, Story e quiz não substituem o post do dia.** São conteúdo adicional. Todo dia da semana precisa ter, além de qualquer Reel/Story/quiz que exista naquele dia, **um post de verdade no feed** — carrossel ou imagem única, com arte montada. Um dia só com Story não conta como dia coberto.

| dia | post do feed (obrigatório) | + Reel/Story/quiz (extra) | status em 11/08 |
|---|---|---|---|
| segunda | Destaque do dia (imagem única, mostra em foco) | — | formato ainda por decidir — ver nota abaixo |
| terça | Carrossel da agenda (aberturas do próximo sábado) | — | `vsp-carrossel-terca`, rodando |
| quarta | Carrossel "quebra de gelo" | Story: quiz de mercado de arte | **feito**, `SOCIAL/08/12/` |
| quinta | Glossário (recorrente, ver §9.4) | Roteiro de Reel — lista rápida | Reel: `vsp-roteiro-reel-quinta`, rodando. **Nesta semana (13/08) o glossário já saiu terça, fora de hora — usar um Destaque (§9.7) no lugar, só nesta semana** |
| sexta | Lembrete da véspera (aberturas de amanhã) | — | `vsp-lembrete-sexta`, rodando |
| sábado | Post da abertura imersiva do dia (nota 2 do §10) | Reel de cobertura (roteiro por Claude, filmagem pelo Lucas) | os dois a fazer |
| domingo | Carrossel roteiro temático (bairro/tema) — ou reciclar um evergreen já pronto | Story: review do fim de semana | post do feed a construir (§9.2) ou reciclar |

### Por que nem todo dia está automatizado ainda

O `post.html` hoje só sabe montar **dois** formatos: `carrossel` (agenda) e `lembrete` (imagem única, hoje usado só pra véspera de sexta). Roteiro temático e quebra de gelo são formatos que **não existem no kit ainda** — construir cada um é trabalho real (desenhar o layout, decidir a fonte de dados, testar o canvas), não só criar uma tarefa agendada apontando pra eles. Agendar uma tarefa pra um formato que o kit não sabe gerar só ia produzir outra rodada de erro e crédito gasto à toa — o mesmo problema de hoje cedo, de um jeito diferente.

Ordem de construção proposta (mais simples primeiro): quebra de gelo (evergreen, sem dependência de dados) → destaque do dia (reaproveita o bloco `FOCO` que a `agenda-vernissages-sp` já calcula) → roteiro temático (precisa de agrupamento geográfico, mais complexo — mas o slide "a pé" do carrossel já faz esse cálculo por haversine, dá pra reaproveitar).

Segunda, quarta e domingo ficam sem tarefa agendada até esse trabalho estar feito. Enquanto isso, esses dias não têm post automatizado — é a apuração honesta, não uma meta ainda não perseguida.

---

## 1. O que o kit produz

Um carrossel semanal com as aberturas de São Paulo, montado no navegador a partir da agenda do dia, e um lembrete avulso na véspera.

| peça | quando | arquivos | formato |
|---|---|---|---|
| Carrossel da agenda | terça, início da noite | `vsp-sNN-<dia>-slide-01..NN` | 4:5 |
| Lembrete | sexta, início da noite | `vsp-sNN-sex-lembrete` | 4:5 |

**4:5, 1080×1350.** Não use 1:1 — o quadrado corta a assinatura do rodapé. O `post.html` exporta PNG; a subpasta `UPLOAD/` guarda os JPG que vão de fato para o Instagram.

Nomenclatura: `vsp-s<semana>-<dia>-slide-<nn>`, semana com dois dígitos, dia abreviado em três letras (`sab`, `dom`, `sex`). Pasta por mês e dia: `SOCIAL/<MM>/<DD>/`.

Nada é enviado para servidor nenhum. Tudo é gerado no navegador do usuário — é premissa do kit, e a página diz isso ao vivo.

---

## 2. Anatomia do slide

De cima para baixo:

1. **Kicker** — dia e data por extenso, ou o nome da seção (`AGENDA`, `LEMBRETE`). Caixa alta, tracking aberto.
2. **Título** — nome da mostra, ou a chamada do slide de capa. É o único elemento que rotaciona de fonte.
3. **Corpo** — artista, curadoria, uma ou duas frases de conceito.
4. **Serviço** — galeria, `@`, endereço, bairro, período. Linha seca, sem adjetivo.
5. **Rodapé** — assinatura `vernissagessp.com.br`. Posição fixa em todos os slides, inclusive nos com imagem sangrada.

O último slide do carrossel é sempre o de encerramento com a assinatura e o convite ao site — nunca uma obra.

### 2.1 Regra contra cara de deck de IA — de 11/08

O Lucas apontou que os formatos evergreen (glossário, homenagem) saíram parecidos com slide de apresentação genérica. Causa: bolinha + frase curta, repetida três vezes por slide. É reconhecível de longe como "IA fez isso" porque é o output padrão de qualquer LLM pedido pra "estruturar em tópicos". Regra daqui pra frente:

- **Sem marcador de lista (bolinha, traço, número) nos slides.** Texto corrido, em parágrafo, como legenda de parede de museu — não como slide de treinamento corporativo.
- **Variar o ritmo tipográfico dentro do próprio carrossel.** Uma frase de abertura maior/mais pesada funcionando como pull quote, depois o corpo em peso menor — não três frases do mesmo tamanho empilhadas.
- **Não estruturar todo slide com o mesmo esqueleto.** Se todo slide do carrossel é "kicker + título + três frases do mesmo tamanho", é o padrão que entrega que foi feito em série. Varie: um slide pode ser só uma frase grande; outro, dois parágrafos corridos; outro, um número em destaque.
- Vale pra qualquer formato novo em texto corrido (glossário, quebra de gelo, homenagem, quote) — não só carrossel de agenda, que já tem estrutura fixa por design (§2).

---

## 3. Tipografia

### Chassi fixo: Archivo

Kicker, corpo, serviço e rodapé são **sempre Archivo**, para sempre. Isso não rotaciona. É o que faz semanas diferentes ainda parecerem o mesmo veículo.

### Título: seis grotescas irmãs

Só o título rotaciona, dentro deste conjunto fechado:

- Archivo
- Switzer
- Space Grotesk
- General Sans
- Instrument Sans
- Bricolage Grotesque

**Critério de entrada no conjunto** — para não entrar qualquer coisa depois:

1. Grotesca neo ou contemporânea. Nada de serifada, humanista de contraste alto, display ou geométrica pura.
2. Altura-x alta e caixa alta estreita o bastante para o título caber em duas linhas a 1080 px de largura.
3. Peso disponível de 400 a 700 no mínimo, com itálico verdadeiro ou sem itálico algum — nada de oblíquo sintético.
4. Licença aberta e arquivo hospedável no repositório. Sem CDN de terceiros.
5. Números tabulares, porque datas e números de rua aparecem no título.

### As duas travas

- **Uma fonte por carrossel.** O carrossel inteiro usa a mesma fonte de título. Nada de alternar entre slides.
- **Sem repetir em semanas seguidas.** A fonte da semana passada está fora do sorteio desta.
- **`AGENDA` usa sempre Archivo.** A âncora não pode variar, senão não é âncora. Vale para qualquer slide cujo kicker seja `AGENDA`, e para o slide de capa do carrossel semanal.

O `post.html` guarda a fonte usada na última semana em `localStorage` e exclui ela do sorteio. **[confirmar]** — se preferir determinístico em vez de sorteado, o índice pode vir do número da semana.

### Fontes no repositório

Embutir os `.woff2` em `/fontes/` no repo e declarar por `@font-face`. Sem Google Fonts, sem CDN: o kit precisa funcionar offline e o PWA já tem cache próprio.

---

## 4. Paleta — areia e grafite

Substitui o escuro-dourado da versão atual do `post.html`.

| papel | cor | uso |
|---|---|---|
| Areia | `#E8E1D4` **[confirmar]** | fundo padrão dos slides tipográficos |
| Grafite | `#22252A` **[confirmar]** | texto sobre areia; fundo dos slides com imagem |
| Areia clara | `#F4F0E8` **[confirmar]** | texto sobre grafite |
| Grafite médio | `#6B7078` **[confirmar]** | serviço, crédito, metadado secundário |

Sem cor de acento. Sem dourado. O contraste vem da tipografia e do tratamento da imagem, não de cor. **Esta regra vale sempre que a peça carrega obra de terceiro** — carrossel da agenda, lembrete, qualquer slide com `img`. É a obra que dá a cor; o kit não compete com ela.

Contraste mínimo 4.5:1 entre texto e fundo em todas as combinações — inclusive texto sobre imagem tratada, onde a chapa de proteção é obrigatória.

### 4.1 Paleta de contraste — só para formatos evergreen sem obra

Decisão de 11/08: manter o feed só em areia/grafite ficava monótono, e o Lucas pediu contraste de personalidade em pelo menos um formato. Abre-se uma segunda paleta, mas com escopo travado:

| papel | cor | uso |
|---|---|---|
| Azul profundo | `#1B2A4A` — aprovado 11/08 | fundo do slide de capa e de encerramento, só nos formatos desta lista |
| Dourado | `#C9A15C` — aprovado 11/08 | um único elemento de destaque por slide — o kicker, ou um filete, nunca o corpo do texto |
| Areia | `#E8E1D4` | texto sobre o azul, e fundo dos slides internos (mesmo formato, dentro do carrossel) |

**Regra de escopo — para não vazar pro resto do feed:**

- Só entra nesta paleta o que **não carrega obra de terceiro**: glossário, quiz/enquete, quebra de gelo, quote (com fonte verificada). No instante em que o slide tem `img` de uma mostra real, a regra volta a ser areia/grafite sem exceção — a obra manda na cor, sempre.
- Dentro de um mesmo carrossel evergreen, o azul entra só na capa e no encerramento — os slides de conteúdo (meio do carrossel) ficam em areia/grafite, para o texto longo não perder legibilidade. Contraste no gancho e no fecho, não a peça inteira gritando.
- Contraste mínimo 4.5:1 continua valendo — dourado só como acento pontual (kicker, filete, ícone), nunca corpo de texto sobre azul.
- Um formato evergreen usa sempre a mesma paleta de contraste (não fica sorteando cor a cada carrossel, isso já é o suficiente pra quebrar o padrão sem virar bagunça visual).

---

## 5. Tratamento de imagem

Dez tratamentos. Cada um com quando funciona e quando falha — a segunda coluna é a que evita duotone em Milhazes.

### 5.1 Regra ética — vem antes de tudo

Isto aqui é agenda de arte e a obra é de outra pessoa.

- **Tratamento que impede reconhecer o trabalho não é estilo, é dano.** Se depois do tratamento a obra não é mais identificável como aquela obra, o tratamento está errado.
- **Toda alteração obriga o crédito a dizer `Tratamento Vernissages SP`**, somado ao crédito original da fonte. Se a fonte só diz "Divulgação", o crédito é `Divulgação · Tratamento Vernissages SP`.
- **Galeria pediu sem tratamento, é sem tratamento.** Sem discussão, sem contraproposta.
- **Nada de inventar imagem.** Sem banco de imagem, sem ilustração, sem geração no lugar da obra. Sem imagem utilizável, o post é tipográfico — o tratamento 10 existe para isso.
- Obra de artista vivo com política de imagem conhecida: na dúvida, sangria limpa ou nada.

### 5.2 Os dez

| # | tratamento | quando funciona | quando falha |
|---|---|---|---|
| 1 | **Sangria limpa** — imagem inteira, sem alteração, borda a borda | Sempre. É o padrão e o fallback de qualquer dúvida | Nunca falha. Se o resto falhar, é este |
| 2 | **Bloco sobreposto** — chapa de areia ou grafite cobrindo 30–40% do slide, texto dentro da chapa | Obra com área morta (céu, parede, fundo chapado) onde a chapa não cobre nada | Composição cheia até a borda; a chapa vira mordida |
| 3 | **Grade** — imagem dividida em módulos com fio de 1 px | Obra serial, repetição, trama, tecido | Figura única e centrada; a grade corta o rosto ou o corpo |
| 4 | **Díptico** — duas obras da mesma mostra lado a lado, meio a meio | Individual com duas peças de escala parecida; mostra de dupla | Escalas ou temperaturas muito diferentes; vira comparação que ninguém pediu |
| 5 | **Grão / meio-tom** — retícula sobre a imagem em grafite | Fotografia em preto e branco, documento, arquivo, imagem de baixa resolução que já ia sofrer | Pintura com nuance de cor; a retícula come a matéria da tinta |
| 6 | **Contorno** — traço de 2 px na cor complementar acompanhando a silhueta principal | Escultura, objeto, obra com recorte claro contra fundo neutro | Obra sem silhueta legível; instalação; o contorno inventa uma forma que não existe |
| 7 | **Detalhe ampliado** **[confirmar]** — recorte de 1:3 da obra, ampliado, com a obra inteira em miniatura no canto | Obra de superfície rica: pincelada, textura, colagem, bordado | Obra cujo sentido está na composição total; o detalhe mente sobre o trabalho |
| 8 | **Duotone areia-grafite** **[confirmar]** — mapeamento de dois tons | Imagem de registro, foto de espaço expositivo, retrato de artista | **Qualquer obra em que a cor é o assunto.** Milhazes, Volpi, Bhering: proibido |
| 9 | **Passe-partout** **[confirmar]** — imagem reduzida centralizada, margem larga de areia, crédito na margem | Obra pequena, papel, gravura, fotografia de pequeno formato | Obra monumental; a margem contradiz a escala |
| 10 | **Chapado tipográfico** **[confirmar]** — sem imagem, título grande sobre areia ou grafite | Sem imagem utilizável; galeria pediu sem imagem; mostra ainda sem release | Nunca falha. É o fallback ético |

**Uma regra de uso:** um tratamento por carrossel, como a fonte. Slides diferentes da mesma semana não misturam tratamento — exceto o 10, que pode aparecer isolado quando uma mostra específica não tem imagem.

---

## 6. Voz das legendas

Vale o `ESTILO.md` do repositório. O essencial, mais o que a prática de agosto consolidou:

- Curador e arquivista: objetivo, culto, direto. O texto informa, não convence.
- Zero emoji, zero exclamação, zero gíria.
- Proibido adjetivo comercial: imperdível, incrível, venha conferir, magia, jornada, imersivo (salvo descrição técnica), único.
- Frases curtas, voz ativa. Conceito curatorial em uma ou duas frases, no máximo.
- Não interpretar a obra além do que a fonte afirma. Na dúvida, descrever.
- Conteúdo pago sempre com `publi: true` e marcação explícita na legenda.

### Estrutura da legenda do carrossel

```
<Frase de abertura: quantas aberturas, que dia, quantos endereços.>

<Galeria> @<arroba> — <endereço>, <bairro>
<Título>, de <artista>, com curadoria de <curador>. <Uma ou duas frases de conceito.> Até <data>.

<repete por endereço>

—

Agenda completa das aberturas de São Paulo: vernissagessp.com.br
```

Endereços agrupados por casa, não por mostra: galeria que abre duas mostras aparece uma vez, com as duas listadas. Quando o encerramento não foi divulgado, escreva `Encerramento não divulgado` — não omita e não chute.

### Estrutura do lembrete

Abertura com `Amanhã, <dia> <data>`, depois as casas agrupadas **por bairro**, fechando com o convite ao mapa. Mais curto que o carrossel: quem vai ler já viu a agenda na terça.

### Notas de apuração

Todo `LEGENDAS.md` fecha com uma seção de notas: o que não foi divulgado, coincidências de endereço que explicam a contagem, `@` que faltam no `dados.js`. É o que permite refazer a semana sem reapurar.

**Horário de abertura só entra se a casa divulgou.** Nunca inferir "a partir das 19h" porque é o costume.

---

## 7. O que falta no `post.html`

A versão no ar já é a base certa: html2canvas, roda inteiramente no navegador, baixa os PNGs, monta a legenda. O que muda:

1. **Trocar o visual escuro-dourado pelo areia/grafite** — variáveis CSS na raiz, para o tema virar uma linha.
2. **Embutir as seis fontes** em `/fontes/*.woff2` com `@font-face`, e implementar o sorteio com as duas travas (uma por carrossel; sem repetir na semana seguinte; `AGENDA` travado em Archivo).
3. **Implementar os dez tratamentos em canvas** — html2canvas não dá conta de grão, duotone e contorno. Desenhar em `<canvas>` antes de compor o slide.
4. **Forçar 4:5** na exportação, com o rodapé em posição fixa e testado contra corte.
5. **Crédito automático** — quando o tratamento for diferente de "sangria limpa", concatenar `· Tratamento Vernissages SP` ao `cred` vindo do `dados.js`.
6. **Fallback tipográfico** — expo sem `img` utilizável cai no tratamento 10 sozinha, sem quebrar o carrossel.

Escrever o arquivo em disco e subir num commit só. Sem screenshot, sem trabalhar dentro do editor do GitHub.

---

## 8. Fora de escopo

- Publicação automática no Instagram. O kit gera e baixa; quem posta é uma pessoa.
- Filmagem, edição ou geração de vídeo de Reels — o kit e as tarefas agendadas produzem no máximo o roteiro em texto (§9.1). Gravar, editar e postar o vídeo é sempre o Lucas.
- Engajamento automatizado (curtir, comentar, seguir em massa) — viola os termos do Instagram. O "ataque ativo" da §0 é manual, sempre.
- Qualquer coisa que envie imagem para servidor.

---

## 9. Backlog de formatos de crescimento (ainda não implementado)

Vem do plano de crescimento orgânico (meta: 5.000 seguidores até dezembro/2026, §0). Nada aqui tem tarefa agendada ainda — são formatos de conteúdo a produzir sob demanda ou a formalizar em uma nova tarefa, um de cada vez, depois de aprovados. Não criar tarefa agendada nova para nada desta lista sem confirmação explícita — ver a regra de ouro em §0.

### 9.1 Roteiro de Reel (texto)

Claude escreve o roteiro (fala/legenda na tela, 15–30s), não o vídeo. Dois tipos:

- **Lista rápida**, formato "3 exposições gratuitas pra ir esse fim de semana em SP" — puxa do `dados.js`, prioriza `ing:{g:true}` ou entrada franca. Gera salvamento/compartilhamento.
- **Vibe/bastidores** — roteiro de cobertura in loco (o que filmar, em que ordem, que legenda usar). Depende do Lucas estar no evento; Claude prepara o roteiro antes, não o vídeo depois.

### 9.2 Carrossel roteiro temático

Variante do carrossel padrão (mesmo sistema tipográfico e paleta do §2–4), mas selecionando por geografia ou tema em vez de por data de abertura: "Roteiro de sábado: 2 galerias em Pinheiros + 1 café pra fechar". Fonte de dados: `VENUES` do `dados.js` (já tem `lat`/`lng`, `b` de bairro) — mesma lógica de agrupamento por proximidade que o slide "a pé" já usa (`PENDENTE/LEIA.md`).

### 9.3 Carrossel "quebra de gelo"

Formato institucional, não depende de agenda: "Primeira vez num vernissage? Veja como funciona." Texto evergreen, pode ser reciclado. Ainda por escrever.

### 9.4 Carrossel glossário do nicho

Um termo do vocabulário de arte/mercado por slide (ex.: "mercado primário x secundário", "vernissage x finissage", "edição x múltiplo"). **Confirmado recorrente, quintas-feiras** (decisão de 11/08). Usa a paleta de contraste (§4.1). Termos vêm de conhecimento geral de mercado de arte, não de fato específico de galeria — não precisa apurar no `dados.js`, mas precisa ser definição correta, não vaga.

Primeiro exemplo (11/08, avulso, fora da cadência de quinta): mercado primário x secundário, em `SOCIAL/08/11/`.

**Está confirmado que o formato persiste — entra na fila de construção no kit (§9.5), prioridade alta.** Enquanto isso não sai, cada edição é gerada à parte por script Python (ver `outputs/build_glossario.py` da sessão de 11/08), sem depender do `post.html`.

### 9.7 Destaque (spotlight de uma mostra só)

Diferente do carrossel de terça (que lista as 7 aberturas da semana rápido) — aqui é uma mostra só, com espaço pra respirar: mais contexto, a fala do curador se tiver, o porquê daquela mostra em especial. Serve pra tapar buraco de dia sem formato fixo, ou pra dar atenção a uma mostra que passou batido no carrossel semanal.

Usa `img` do `dados.js` quando a mostra já tiver imagem mirrorada. **Sem imagem, não force** — cai no chapado tipográfico (tratamento 10), que é legítimo, não gambiarra. Primeiro exemplo (13/08, avulso): "Céu de concreto", Central Galeria, sem imagem disponível nesta sessão por bloqueio de rede — tipográfico mesmo, com o dado real que tinha: texto crítico de Lilia Moritz Schwarcz.

**Fallback manual, de 11/08:** quando a sessão não conseguir buscar a imagem (proxy bloqueado, CORS, o que for), o Lucas sobe o arquivo em `PENDENTE/imagens/`, avisa, e a sessão refaz o slide 1 com sangria limpa em cima do arquivo local — sem precisar esperar a `vernissages-varredura-semanal` nem depender de acesso de rede da sessão. Não é o automatismo ideal (ainda depende do Lucas), mas destrava na hora sem gambiarra.

**Backlog de kit, registrado aqui pra não esquecer:** um campo de upload de imagem dentro do próprio `post.html` — Lucas escolhe o arquivo local, o kit compõe o slide igual faria com a `img` do `dados.js`. Resolveria isso de vez, sem depender de pasta nem de aviso manual. Ainda não construído; entra na fila do §9.5 quando as prioridades de cima estiverem resolvidas.

### 9.6 Conteúdo de atualidade (texto de galeria, entrevista, notícia que impacta a cena)

Pedido do Lucas em 11/08: pros dias sem formato fixo (nem carrossel de agenda, nem quiz, nem Reel), buscar matéria real — texto que a própria mostra publica sobre o artista, entrevista, notícia aparentemente distante que tem efeito na cena de arte de SP (por exemplo: uma feira internacional cancelada afeta calendário local; uma lei de incentivo cultural muda; um museu fecha ou reabre).

Como isso funciona, sem inventar:

- Pesquisa via busca na web a cada vez — não dá pra automatizar 100% sem revisão, porque "o que é notícia relevante" é julgamento editorial, não dado fixo do `dados.js`. Mesma lição do caso Pandolfo: julgamento de enquadramento é do Lucas, a IA traz a matéria-prima apurada e sugere o ângulo.
- Toda citação de texto de galeria ou de entrevista é **transcrição literal com fonte**, nunca paráfrase apresentada como se fosse a voz de terceiro. Trecho curto, entre aspas, com crédito de onde saiu.
- Sempre sai como rascunho pra aprovação — nunca como tarefa que publica sozinha (regra de ouro, §0). Esse formato em particular é o que tem mais risco de sair errado sem revisão: notícia envelhece rápido, contexto importa.
- Fonte de ideia por dia, não é fixo — cada edição decide o ângulo com base no que realmente aconteceu naquela semana. Sem tema pra aquele dia, o dia fica sem post de atualidade; não forçar conteúdo fraco só pra preencher a grade.

### 9.5 Antes de virar tarefa agendada

Cada formato acima, quando for automatizado, precisa: dizer em que dia roda, o que aciona (dados fixos do `dados.js`? decisão editorial do Lucas a cada semana?), e se produz peça pronta pra postar ou só rascunho pro Lucas revisar. Registrar aqui a decisão antes de criar a tarefa.

Fila de construção no kit, em ordem:

1. **Glossário** (§9.4) — confirmado recorrente, usa a paleta de contraste nova (§4.1). Maior prioridade.
2. **Quebra de gelo** (§9.3) — evergreen, sem dependência de dados.
3. **Destaque do dia** — reaproveita o bloco `FOCO` que a `agenda-vernissages-sp` já calcula.
4. **Roteiro temático** (§9.2) — mais complexo, precisa do agrupamento geográfico que o slide "a pé" já calcula por haversine.

---

## 10. Calendário editorial — agosto 2026

Base: proposta trazida pelo Lucas em 11/08 (créditos ao "primo rico" que ajudou a estruturar). Adaptada depois de checar os fatos — alguns itens do rascunho original não resistiram à apuração; ver notas abaixo da tabela. **Nenhuma linha aqui vira postagem sem alguém (Lucas) aprovar o texto final** — isto é grade editorial, não fila de publicação automática (regra de ouro, §0).

### Semana de 11 a 17/08

| data | dia | formato | tema | status |
|---|---|---|---|---|
| 11/08 | ter | Carrossel avulso | Glossário: mercado primário x secundário | **feito**, em `SOCIAL/08/11/` |
| 12/08 | qua | Story (texto p/ colar) | Quiz/enquete de mercado de arte | a gerar — puro texto, sem dependência de kit |
| 13/08 | qui | — | (glossário já foi terça esta semana; próxima edição só na próxima quinta, 20/08, pra não repetir semana) | pular esta semana |
| 14/08 | sex | Lembrete da véspera (já existe) | Aberturas de 15/08 | `vsp-lembrete-sexta`, rodando |
| 15/08 | sáb | Reel — roteiro de texto | **Ver nota 1**: duas coisas abrem hoje — as 7 mostras de galeria (já cobertas no carrossel de terça) e "O Brasil de Tarsila", imersiva que estreia hoje no Nubank Arte Lab (Conjunto Nacional) | roteiro a escrever; checar se imersiva comercial entra no escopo do perfil (ver nota 2) |
| 16/08 | dom | Story | Review do fim de semana (enquete simples) | a gerar |
| 17/08 | seg | Carrossel | Ver nota 3 — item sensível, decisão do Lucas antes de escrever qualquer linha | **parado até decisão** |

### Notas de apuração desta semana

**1. "Horizonte de Quéops" não é o que o rascunho original descrevia.** É real — expedição imersiva de realidade virtual sobre o Egito Antigo, no Shopping Cidade São Paulo, em cartaz até 21/09/2026, ingresso a partir de R$ 88 ([icarabe.org](https://icarabe.org/agenda/exposicao-imersiva-horizonte-de-queops-viagem-ao-antigo-egito-de-19-de-dezembro-a-22-de-marco-de-2026-sp/), [espacoculturavr.com.br](https://espacoculturavr.com.br/horizonte-de-queops/)). Não é FAAP nem é sobre Miró — o rascunho original misturou duas coisas. Miró ("Mestre das Formas") está mesmo no MAB FAAP, isso bateu com o `dados.js`.

**2. Duas mostras imersivas comerciais entraram no radar** (Quéops e "O Brasil de Tarsila", esta confirmada: estreia 15/08 no Nubank Arte Lab, Conjunto Nacional, ~40 obras em projeção 360°, até 31/10 — [dasartes.com.br](https://dasartes.com.br/de-arte-a-z/conheca-exposicao-imersiva-tarsila-do-amaral-a-maior-ja-dedicada-a-sua-obra/), [jammusical.com](https://www.jammusical.com/2026/07/tarsila-do-amaral-exposicao-imersiva-conjunto-nacional.html)). São eventos reais, mas são experiência imersiva paga, não galeria com curadoria — categoria diferente do que o `dados.js` cobre hoje (`VENUES`/`EXPOS` são tudo galeria, museu ou espaço independente). **Decisão do Lucas**: o perfil passa a cobrir também esse tipo de experiência, ou fica só na cena de galeria? Se entrar, precisa de uma seção nova no `dados.js` pra não misturar com `EXPOS`.

**3. Margarida Pandolfo — mostra no Museu da Imigração, item de 17/08 no rascunho original — precisa de cuidado.** Ela morreu em 3 de agosto de 2026, aos 82 anos, poucos dias atrás ([correio24horas.com.br](https://www.correio24horas.com.br/em-alta/aos-82-anos-morre-margarida-pandolfo-mae-da-dupla-osgemeos-0826), [dgabc.com.br](https://www.dgabc.com.br/Noticia/4339135/morre-a-artista-margarida-pandolfo-mae-da-dupla-osgemeos)). A mostra "Assim Bordei Meus Sonhos" (Museu da Imigração, até 6/10) segue em cartaz, mas ela era mãe da dupla OSGEMEOS e bordou a vida inteira antes de expor pela primeira vez aos 82 — isso muda completamente o tom certo do post. O rascunho original ("A arte por trás dos bordados", tom leve de curiosidade) não é apropriado agora. Não escrevi nada para este slot — fica parado até o Lucas decidir se: (a) vira um post de homenagem, com tom sério, sem a moldura de "curiosidade" do rascunho; (b) sai do calendário esta semana, por respeito ao momento; (c) outra abordagem. Nenhuma das três é decisão que a IA deveria tomar sozinha.

### Semanas seguintes (18/08 em diante)

Não escritas ainda — ficam por semana, depois que a paleta de contraste e a fila do kit (§9.5) estiverem rodando de verdade, e depois da decisão sobre imersivas (nota 2). Escrever a próxima semana inteira agora, em cima de formatos que ainda não existem no kit, ia só acumular mais peça sem lugar pra sair — o mesmo erro do carrossel de terça, em escala maior.
