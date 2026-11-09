# Direção de arte e de conteúdo (09/11/2026)

Existe para uma coisa: toda peça nova (site, feed, story, Reel, edital) parecer da mesma casa e ser feita por quem entende de arte e de design, não por um gerador. Os tokens moram em `direcao.js`; este arquivo explica o porquê.

## A tese

O Vernissages SP é um **jornal de arte da cidade**, não um painel. A pessoa abre para saber **o que acontece, quando e onde**, e para sentir que quem fez gosta de arte. Três decisões seguram a identidade:

1. **Papel e tinta, a cor vem da obra.** Fundo `#F2EFE9`, tinta `#0E0E0E`. O acento muda a cada peça: é a cor dominante da obra (`corDaObra`), calibrada para ler no papel. Obra sem cor usa a terracota da casa `#C96F4A`. Nunca um acento fixo "de marca" por cima de tudo.
2. **A data é a protagonista.** Número gigante em Switzer 800 (dia da abertura, dias que faltam, parada do percurso). É o que a pessoa procura; é também o que dá cara de edição impressa. Capa de Reel em cor chapada da obra: legível como miniatura no grid, diferente de toda foto ao redor.
3. **Peso contra delicadeza.** Título em caixa-alta 800 com tracking apertado, artista em Instrument Serif itálico, casa e bairro em caixa-alta espaçada. Filete (3 px) no lugar de caixa, pílula ou sombra.

## O que nunca muda

- Nenhum texto em cima da obra. A imagem aparece inteira e limpa; o texto vive no papel em volta.
- Só fato da base. Nada inventado, nada interpretado além do que a fonte afirma.
- Sem travessão em texto corrido, sem exclamação, sem gíria, sem emoji. Voz de curador: seca, culta, direta.
- Zona segura de story: nada importante nos 250 px de cima e de baixo.
- Nenhuma foto repete no feed (veto por hash em `exigirObra`). No Reel pode repetir: outro formato, outra audiência.
- Automação recorrente não chama IA. Julgamento vira regra; dúvida vira "sem escolha".

## Movimento (Reel)

Linguagem: corte seco com **véu que sobe** (0,3 s), máscara de entrada no número e nas palavras, imagem revelada de baixo para cima com assentamento lento de escala (1,12 para 1). Sem fade genérico, sem zoom de "Ken Burns" sobre texto. Cada corte tem uma batida grave curta no áudio (a API não escolhe trilha; quem quiser música põe no app antes de publicar).

Estrutura fixa, três atos: **capa** (cor chapada, palavra gigante, o número de itens) → **uma cena por mostra** (2,6 s) → **cena final escura** com o mapa e a lista numerada. A capa já é o quadro que o Instagram usa de miniatura: ela tem de funcionar parada.

## Formatos e cadência

| formato | peça | quando | fonte |
|---|---|---|---|
| **abre** | Reel: o que abre nos próximos 7 dias, número = dia | sexta (preferido) | dados.js |
| **fecha** | Reel: últimos dias, número = dias que faltam | terça (preferido) | dados.js |
| **rota** | Reel: um bairro a pé, mapa com a linha do percurso | domingo (preferido) | dados.js + lat/lng |
| **obra / encerra / estreia** | feed: obra tela cheia + etiqueta (papel, data gigante) | todo dia | dados.js |
| **stories do dia** | selo gigante (ABRE HOJE, ÚLTIMO DIA, FECHA AMANHÃ) + obra | todo dia | dados.js |
| **editais** | feed: o que fecha primeiro para artista | segunda | radar do site |
| agenda, rima, deriva, salão, aproximação | feed curado | quinta e quando houver curadoria | ver ESTILO.md |

O motor de Reel não repete o formato dos dois últimos e não repete a mesma mostra em 14 dias (bairro em 21). Cai no `reel-auto.js` antigo só se o novo não achar 3 mostras que passem nas réguas.

## Para onde ir daqui (ideias que usam o que já temos, sem IA)

- **Reel "bairro por bairro"** já existe (rota); falta o equivalente por tipo de casa (museu, galeria, espaço independente).
- **Reel "grátis"**: as exposições de entrada gratuita da semana. O campo existe no `ing` das casas; vira o gancho mais compartilhável.
- **Reel "onde ainda dá tempo"**: o oposto do últimos dias, para quem planeja o mês (as que fecham entre 8 e 30 dias).
- **Mês em obras**: carrossel mensal com uma obra por semana de abertura, fechando o mês.
- **Edital em Reel**: o mesmo motor, número = dias do prazo, para a chamada brasileira que fecha primeiro.
- **Mapa vivo no story**: o mapa do Reel final como story de sexta, com as aberturas da semana acesas.
- **Temporadas** (docs/TEMPORADAS.md) ficam pausadas: Lambe e Concreto foram reprovadas. Se voltarem, entram como troca de paleta do `direcao.js`, não como outro sistema.

## Como mexer

- Mudou cor, fonte ou espaçamento: `direcao.js` (e a casca de `site.js` para o site). Depois rode `node reel-arte.js --seco` e, com Chrome, sem `--seco`, para ver o vídeo.
- Mudou o texto do gancho: `capa()` e `legenda()` em `reel-arte.js` (listas de variações escolhidas por semente da data).
- Peça nova: copie a cena `mostra` de `reel-arte.js` e troque só o "número". O motor (`setT(t)`, véu, máscara) já faz o resto.
