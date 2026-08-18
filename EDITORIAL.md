# Vernissages SP — linha editorial

v1 — 16/08/2026. Isto é ponto de partida, não regra fixa: qualquer dia dá pra
ajustar cadência, peça ou critério. Se algo aqui não estiver funcionando depois
de duas ou três semanas, mude.

## Por que isto existe

A varredura semanal e a diária de destaque alimentam o `dados.js`. Esta rotina
diária de social usa esse material pra publicar todo dia — antes disso, só
saía carrossel (terça) e lembrete (sexta), com o meio da semana vazio.

Direção: o impacto visual de galeria grande (Gagosian, David Zwirner, Galerie
König — a obra ocupa o quadro, texto é o mínimo que precisa estar ali), o
ritmo de quem cobre o circuito inteiro todo dia (e-flux Announcements,
Contemporary Art Daily — uma peça por dia, sem falha), e a disposição de
escrever com ponto de vista que a crítica especializada tem (Hyperallergic,
Artnet News, Frieze — sem virar fofoca, mas também sem soar nota de
assessoria). Isso não é pra imitar nenhum desses; é a régua de qualidade.

## As quatro peças (`post.html`)

O gerador já tinha `carrossel` e `lembrete`. Entram `destaque` e `nota` —
reaproveitando o mesmo motor (tratamentos, rotação de fonte, guarda de
sobreposição, crédito ético). Nenhuma peça nova é gambiarra por fora do
sistema; todas passam pelo mesmo `desenharArte`/`addSlide`.

| Peça | O que é | Slides |
|---|---|---|
| **carrossel** | Agenda da semana, uma mostra por slide | 4 a 12, variável |
| **destaque** | Uma mostra ou artista só, tratamento de imagem cheio | 1 |
| **nota** | Observação sobre o meio — sem imagem, chapado tipográfico | 1 |
| **lembrete** | Aberturas de amanhã, agrupado por bairro | 1 |

`destaque` é a peça que carrega o "impacto": trata a imagem igual à isca do
carrossel (sangria, duotone, contorno — nunca o chapado por padrão, só cai
nele se a mostra não tiver imagem utilizável). É o espaço pra tratar uma
exposição como a notícia do dia, não como item de lista.

`nota` é texto puro — pensada pra comentário curto sobre algo do circuito que
não é "abertura": uma galeria mudando de endereço, um prêmio, uma feira, um
padrão que a varredura semanal percebeu (tipo "três espaços da Augusta
fecharam programação em julho"). Sempre com fonte verificável. Sem fonte
verificável, não sai — vira ideia anotada pra quando achar a fonte.

## Calendário semanal

| Dia | Peça | Critério |
|---|---|---|
| Segunda | `destaque` | Mostra ou artista já em cartaz, prioridade pra quem ainda não foi destaque nas últimas 2 semanas |
| Terça | `carrossel` | Agenda da semana — como já era |
| Quarta | `destaque` | Prioridade explícita pra espaço `hibrido`/independente (Mata Lab, Auroras, Massapê, Ateliê397, Aparelha Luzia, GRUTA, HOA, Sé Galeria, Casa do Povo, A7MA, Espaço República, Galeria Café, Ateliê Fidalga, Galeria Metrópole) — são os que menos aparecem em cobertura grande |
| Quinta | `nota` ou `destaque` | `nota` se tiver algo real pra comentar essa semana; senão `destaque` de reserva |
| Sexta | `lembrete` | Aberturas de amanhã — como já era, mas agora pode usar imagem em vez de cair sempre no chapado |
| Sábado | opcional | Só se sobrar material forte; sem pressão de publicar todo sábado |
| Domingo | nada | É o dia da varredura semanal — sem post, sem sobrepor o próprio processo interno |

Regra de variedade: a mesma galeria não vira `destaque` duas vezes em 7 dias
(mesma trava que o `foco` do site já usa — `E20` do `check.js`). Se o
candidato óbvio já apareceu, desce a lista.

## Recorrência mensal

- **Primeira segunda do mês — "panorama do mês":** carrossel estendido,
  olhando 3-4 semanas à frente em vez de 2. Serve pra quem quer planejar o mês,
  não só a semana.
- **Último dia útil do mês — "o que fechou":** nota curta sobre as mostras que
  encerraram no mês, sem tom de balanço institucional — só registro.

Sem recorrência trimestral ou semestral por enquanto. Se em um mês isso fizer
sentido (aniversário do site, retrospectiva de ano), decide na hora.

## Consistência sem ficar maçante

O `post.html` já resolve isso na camada visual: 10 tratamentos e 6 fontes de
título em rodízio determinístico, sem repetir a mesma combinação em semanas
seguidas. A variedade editorial vem de cima disso — trocar o tipo de peça a
cada dia é o que evita a sensação de fórmula, mesmo com a paleta e a
tipografia sempre reconhecíveis. Consistência é a paleta, a assinatura, a voz
do texto. Variedade é o que cada peça escolhe mostrar.

## O que NÃO muda

- Voz e estrutura de texto: `ESTILO.md`, sem exceção.
- Publicação continua manual. Nenhuma automação posta no Instagram sozinha.
- `foco`/`destaques` do `dados.js` continuam exclusivos da rotina diária
  `agenda-vernissages-sp` — esta linha editorial é sobre as peças de social,
  não sobre o que o site mostra como destaque do dia.
