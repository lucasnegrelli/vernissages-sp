# POSTS.md — sistema visual das peças do Vernissages SP

v2 — 24/08/2026. Substitui a v1 de 11/08, que descrevia o kit do `post.html`:
carrossel de quatro slides, dez tratamentos de imagem e rodízio de seis fontes.
Aquele sistema foi aposentado junto com os formatos que ele servia.

Aqui está **como as peças são construídas**. O que cada peça diz está no
`EDITORIAL.md`; a voz do texto, no `ESTILO.md`; como rodar, no `COMOGERAR.md`.

## Por que a v1 caiu

Ela dava variedade de **superfície** e nenhuma de **sentido**. Dez tratamentos
de imagem e seis fontes produziam dez aparências para a mesma frase — e o
problema medido em 20/08 nunca foi a aparência: eram onze dias afirmando a
mesma coisa. Trocar a fonte não conserta o que o texto está dizendo.

O sistema novo faz o caminho inverso: **a construção é quase invariável e a
variedade vem da operação de cada formato.** Uma família tipográfica, uma
grade, seis superfícies. O que muda de peça para peça é o que ela faz com o
dado, não o filtro por cima da foto.

## 1. O que sai

PNG em tamanho real, **1080×1350 (4:5)**, um arquivo por slide, numerados:
`<nome>-01.png`, `-02.png`, e assim por diante, na pasta `SOCIAL/MM/DD/`. Cada
pasta leva também o `LEGENDAS.md` com o texto pronto para o Instagram.

A quantidade de slides varia por formato — ela é resultado do dado, não meta.
`salao` num mês cheio tem mais slides de catálogo; `duracao` numa semana sem
mostra encerrando não tem o slide de urgência.

## 2. Tipografia — uma família, dois registros

**Switzer variável**, em `fontes/Switzer-Variable.woff2`, embutida via
`@font-face` no HTML gerado. Dois registros, só:

| registro | peso | uso |
|---|---|---|
| leitura | 300 | tese, argumento, ficha, serviço — tudo que se lê devagar |
| etiqueta | 500, caixa-alta, tracking `.30em` | `kick`, assinatura, paginação |

O contraste é de **corpo**, não de família: tese em 56px ao lado de crédito em
16px na mesma peça. As outras cinco fontes seguem em `fontes/` porque o
`post.html` ainda as referencia — nenhum dos sete formatos usa.

## 3. A grade

Margem de **88px** nas laterais, **84px** no rodapé. Nada encosta na borda além
da obra, que pode sangrar quando o formato pede.

| elemento | onde | o que é |
|---|---|---|
| `kick` | topo esquerdo | rótulo do slide, caixa-alta |
| `tese` | corpo, 56px | a frase que a peça afirma |
| `arg` | corpo, 35px | o argumento; `.virada` é a última frase, maior |
| `obra` | centro | a imagem, proporção real preservada |
| `ficha` | abaixo da obra | título, autoria, serviço |
| `cred` | rodapé esquerdo | crédito da imagem, sempre |
| `risco` | filete de 64×1px | separador, no lugar de linha cheia |
| `marca` | rodapé esquerdo | `VERNISSAGES SP` |
| `pag` | rodapé direito | número do slide |

**A obra flutua, não sangra por padrão.** Recorte forçado de vista de sala mata
o vazio — que em algumas mostras é o assunto.

## 4. Seis superfícies

Três escuras, três claras. **Nenhuma tem cor de acento.** Todas trabalham por
temperatura e luminosidade, porque a cor da peça vem das obras. É a regra das
galerias grandes, e é o que faz a imagem parecer obra em vez de banner.

| paleta | fundo | texto | quando usar |
|---|---|---|---|
| `escuro` | `#0B0B0C` | `#EDEAE4` | obra isolada, sala de museu |
| `tinta` | `#0A0D12` | `#E6EAF0` | diagrama; e obra de cor quente, que salta |
| `barro` | `#14100D` | `#EFE8DE` | pintura e matéria; aquece o quadro |
| `papel` | `#E9E5DC` | `#17161A` | mapa e guia — coisa que se imprime e se dobra |
| `cal` | `#F5F3EE` | `#101013` | texto que é o objeto, cartão |
| `linho` | `#DCD3C2` | `#1B1712` | o único claro que aguenta obra colorida sem lavar |

Cada uma traz ainda `meio`, `fraco`, `apagado` e `traco` — a hierarquia de
cinzas que separa argumento de serviço e serviço de crédito. Definição em
`PALETAS`, no `rima.js`, importada pelos outros seis.

**Não repita paleta em dias seguidos.** Até 30/08 existiam só três e a semana
inteira saiu praticamente preta — cinco dos sete formatos em `escuro`. No feed,
sete peças do mesmo tom viram uma mancha só e a pessoa para de distinguir os
dias. Variedade de superfície não é enfeite; é o que dá cadência à semana.

### Uma tentativa descartada, registrada para não se repetir

Derivar o fundo da cor dominante da própria obra — um preto diferente por peça,
tingido pelo trabalho que ela mostra. Falhou três vezes, por um motivo que só
aparece depois de medir: **imagem de divulgação de galeria é quase sempre vista
de sala**, e ali a cor de maior área é parede branca e piso de madeira, não a
obra. Média de matiz deu o mesmo laranja em nove obras diferentes. Moda de
histograma devolveu o ouro da filigrana em vez do azul-cobalto, porque o
cobalto profundo cai abaixo do piso de luminosidade e é filtrado junto com a
sombra.

## 5. O grão

Textura, não ruído: turbulência SVG em opacidade baixa, por cima de tudo —
inclusive das obras, porque grão de papel não respeita moldura. Serve para
tirar o aspecto de tela chapada, **que é o que mais denuncia peça feita em
navegador**.

Ajuste no `PLANO.json`, campo `textura`: entre **0,05 e 0,09** quase não se vê,
e é justamente o ponto. Máximo 0,12. `false` desliga.

Detalhe de implementação que custou uma peça: o grão é um `::after` inerte. A
primeira versão punha a camada atrás e empurrava os filhos com
`.slide > *{position:relative}` — aquilo anulou o `position:absolute` de todo
mundo e a assinatura foi parar no meio do texto.

## 6. Anatomia por formato

| formato | slides |
|---|---|
| `rima` | capa com as duas obras em escalas diferentes · obra A · ficha A · obra B · ficha B · argumento |
| `aproximacao` | recortes em zoom estritamente decrescente · obra inteira, contida · leitura |
| `deriva` | mapa desenhado · uma parada por casa, com distância · fecho com o total |
| `entrada` | abertura · por que ninguém fala disso · os preços · a porta · as fontes |
| `salao` | parede numerada · tese · catálogo em fatias |
| `role` | capa com os três · um slide por rolê · fecho |
| `duracao` | diagrama · leitura · o que encerra primeiro |

O mapa da `deriva` é desenhado do zero — só os pontos e o fio que os liga. Sem
rua, sem satélite, sem logotipo de serviço de mapa, e **sem usar nenhuma obra**.

O diagrama da `duracao` é a única peça que não é nem fotografia nem tipografia:
linhas finas sobre escuro, sem grade, sem rótulo, sem legenda dentro do
desenho — mais perto de um sismógrafo ou de uma partitura do que de um gráfico.
A leitura vem no slide seguinte; o primeiro é para olhar.

## 7. Regras de imagem — vêm antes de tudo

1. **Peça sem obra não é peça.** Se a imagem não estiver em disco, o script
   aborta antes de abrir o navegador. Não existe fallback tipográfico, não
   existe "sai assim mesmo". É aviso de que faltou apuração.
2. **Todo crédito vai impresso.** Nenhuma obra aparece sem `cred`. No salão,
   toda obra na parede tem linha no catálogo — salão sem catálogo é mural.
3. **Nunca chutar autoria de foto.** O padrão é `Cortesia <venue>` + CONFERIR.
4. **Nenhuma imagem se repete dentro de uma peça.**
5. **Densidade antes de zoom.** A `aproximacao` calcula quantos pixels da
   original alimentam cada pixel do slide e recusa abaixo do mínimo. Em 24/08,
   26 de 33 obras espelhadas estavam em 1200×630 — medida de card de rede
   social, que é preview de link e não aguenta recorte fechado.
6. **Vista de sala não é obra, e a base sabe disso.** O campo `vista: true`
   no `dados.js` marca a imagem que mostra a parede, e não o trabalho. Quem
   preenche é quem abriu a imagem para olhar — passo que o runbook já exige.
   Com o campo marcado, `rima` e `aproximacao` **recusam sozinhas**, e
   `deriva`, `salao` e `role` continuam aceitando: ali o assunto é o percurso
   e a densidade, e a parede fotografada é informação honesta. O `check.js`
   imprime a conta na primeira tela — *obra X, vista de sala Y*.
7. **Imagem que passa no `check.js` não é imagem boa.** O validador confere
   peso, dimensão e crédito; ele não distingue obra de cartaz, foto social de
   vernissage ou logotipo. Isso é limite real, não bug — só o olho resolve. O
   `vista` cobre um dos casos; para o resto, o mecanismo é a lista **`fora`**
   no `PLANO.json`, que exclui a mostra de todas as peças da semana.
   **Cartaz nunca vira `vista`:** cartaz é dado errado e sai do campo `img`.

## 8. Fora de escopo

- **Nada é postado automaticamente.** Os sete formatos param no arquivo.
- **Nada é inventado.** Data, endereço, autoria e crédito só entram
  confirmados. Na dúvida, fica de fora e a peça declara.
- **Todo número é calculado na hora**, nunca digitado no config. Contagens,
  medianas, distâncias e preços saem da base no momento da geração.
- Vídeo, Reels e Stories não estão no sistema.

## 9. Mexer no visual

A camada compartilhada — `PALETAS`, `cssPaleta`, `grao`, `CSS`, `tituloCurto`,
`autoria`, `slideObra` — mora no **`rima.js`** e é importada pelos outros seis.
Mudança de grade, de tipografia ou de paleta se faz lá, uma vez, e vale para
todos. Mudança dentro de um `<nome>.js` só vale para aquele formato, e é assim
que os formatos divergem sem o sistema se soltar.

O `post.html` não faz parte deste sistema. Está órfão desde 24/08.
