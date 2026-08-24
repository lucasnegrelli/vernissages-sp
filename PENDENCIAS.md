# PENDÊNCIAS — 24/08/2026

Levantamento fechando a semana em que a linha editorial foi refeita. Ordenado
por **quem resolve**: primeiro o que só você pode decidir, depois o que a
varredura resolve sozinha, depois o que é dívida técnica.

Estado da base neste momento: **91 casas · 67 mostras · 58 em cartaz ·
`atualizado` 24/08/2026.**

---

## 1 · Decisões que são suas

### 1.1 Aposentar `EDITORIAL.md` e `POSTS.md`
Os dois descrevem os formatos antigos — carrossel, destaque, nota, lembrete,
sai de cartaz — aposentados em 24/08 e substituídos pelos sete geradores. O
`OPERACAO.md` já avisa que estão obsoletos, mas **enquanto existirem, uma
execução futura pode tropeçar neles e seguir a regra errada.**

Opções: apagar, ou reescrever descrevendo os sete formatos novos. Não fiz por
conta própria porque é decisão editorial sua.

### 1.2 A curadoria semanal de duas peças
`rima` e `aproximacao` **não montam sozinhas** e vão falhar toda semana até
você escrever o config. É de propósito: a afinidade entre duas mostras e o
ponto onde vale chegar perto numa obra são escolha humana.

Para a semana de 31/08 faltam:

- `SOCIAL/08/31/rima.json` — as duas chaves de mostra, a tese e o argumento
- `SOCIAL/09/01/aproximacao.json` — a chave da obra, os pontos de recorte e a leitura

Use `SOCIAL/08/24/rima.json` e `SOCIAL/08/25/aproximacao.json` como referência.
**As outras 8 peças da semana já estão geradas** — 45 imagens em `SOCIAL/08/31`
até `SOCIAL/09/06`.

Duas rimas já visíveis na base, se quiser aproveitar:
- **a pedra** — Cantaria, de Daniel Jorge (Mendes Wood DM) × No meio da pedra,
  de André Vargas (Galeria Vermelho)
- **a terra seca** — Paula Siebra, sobre os ciclos de seca em Fortaleza ×
  Henrique Detomi, sobre a terra aberta de Minas

### 1.3 Publicar
Nada foi postado. Sete peças da semana de 24 a 30/08 estão em `SOCIAL/08/24`
a `SOCIAL/08/30`, com legenda pronta no `LEGENDAS.md` de cada pasta.

### 1.4 Rodar a varredura de 23/08, que não aconteceu
O log mostra que **nada rodou entre 20 e 24/08**. A varredura de domingo 23/08
passou em branco, e é por isso que 25 mostras em cartaz seguem sem imagem.

A tarefa `vsp-semana` agora está em **domingo 23h** — horário em que o app tem
mais chance de estar aberto do que às 00:00, que era quando a antiga tentava.
Se quiser recuperar a semana perdida antes disso, é rodar a tarefa à mão.

---

## 2 · O que a varredura de domingo resolve

Estas não exigem decisão: exigem alguém abrindo o site das casas. A `vsp-semana`
faz isso, mas vale saber o tamanho do buraco.

| pendência | quantas | efeito |
|---|---|---|
| **mostras sem imagem** | 25 de 58 | ficam fora de todos os formatos que mostram obra |
| **imagem em medida de card** (`A08`) | 7 | serve de capa, não aguenta recorte fechado |
| **imagem curta** (`A09`) | 15 | idem |
| **sem data de encerramento** | 4 | ficam fora do formato `duracao` |
| **horário de sábado** | só 5 casas de 35 | a maior lacuna, no dia de maior movimento |
| **casas nunca cobertas** | 36 de 91 | nunca tiveram uma mostra registrada aqui |

### As quatro sem data de fim
- To Love — Claudia Andujar e George Love · Galeria Vermelho
- No meio da pedra — André Vargas · Galeria Vermelho
- Acontecimentos de Corpos — Novas Poéticas · Massapê Projetos
- Onda Avalanche Vulcão — Mauro Restiffe · Fortes D'Aloia & Gabriel

### O rodízio é mais lento que o ciclo das mostras
36 das 91 casas nunca tiveram mostra registrada. Com teto de 10 sites por
domingo, cada casa é visitada a cada nove semanas — e mostra de galeria dura
seis a oito. **Isso não se resolve varrendo com mais vontade: ou o mapa
encolhe, ou as casas passam a mandar a abertura.** Vale pensar num canal de
envio.

---

## 3 · Dívida técnica

### 3.1 Uma `img` que é cartaz, não obra
`Terra que Desmancha, Evapora e Solidifica` (Vazio Criativo) tem no campo `img`
o **flyer da exposição**, com letreiro. Passa em todas as travas automáticas —
peso, dimensão, crédito — porque nenhuma verificação de arquivo distingue obra
de cartaz.

Hoje ela está na lista `fora` do `PLANO.json`, o que a exclui das peças. Mas o
dado continua errado no `dados.js`: precisa virar uma obra de verdade ou ser
zerado.

### 3.2 O `check.js` não avisa quando a imagem é cartaz
Ele acusa `A08` para medida de card e `A09` para largura curta, mas não tem
como saber que uma imagem bem dimensionada é um flyer. **É um limite real, não
um bug** — só o olho resolve. Vale registrar que a exclusão manual existe.

### 3.3 Cinco imagens do salão são vista de sala, não obra
Aparecem na peça de 28/08 (números 01, 07, 08, 15 e 28). Deixei porque é o
retrato honesto do que a cidade oferece, mas são as casas que ainda não
divulgam trabalho — candidatas naturais da próxima varredura.

### 3.4 `post.html` ficou órfão
Era o gerador antigo, com dez tratamentos e seis fontes. Não é mais usado por
nenhum formato. Corrigi um bug nele em 24/08 antes de aposentá-lo. **Decidir se
apaga ou mantém como referência.**

---

## 4 · Como está a operação agora

| tarefa | quando | o que faz |
|---|---|---|
| `vsp-site` | todo dia 00:00 | sincroniza, destaque, valida, publica. Zero páginas externas |
| `vsp-semana` | **domingo 23h** | varredura + `node semana.js` + arquivo |
| ~~`vernissages-sp`~~ | — | desativada em 30/08, arquivo preservado |
| ~~`vsp-social-diario`~~ | — | apagada, morta desde 19/08 |

Runbook em `OPERACAO.md` — Parte 1 é a diária, Parte 2 é o domingo, Parte 3
vale para as duas. Geração de social em `COMOGERAR.md` e `PLANO.json`.

**Tarefa agendada só roda com o app aberto.** Se estiver fechado no horário,
ela dispara na próxima vez que você abrir. Foi o que aconteceu com a semana de
21 a 23/08.

---

## 5 · Os sete formatos, para referência

| dia | formato | operação | paleta em 31/08–06/09 |
|---|---|---|---|
| seg | `rima` | comparar duas mostras | escuro |
| ter | `aproximacao` | aprofundar numa obra | linho |
| qua | `deriva` | percorrer a cidade | papel |
| qui | `entrada` | quanto custa e como se entra | tinta |
| sex | `salao` | tudo de uma vez, denso | barro |
| sáb | `role` | escolher entre três roteiros | barro |
| dom | `duracao` | ver o tempo, diagrama | tinta |

Seis paletas disponíveis: `escuro`, `tinta`, `barro` (escuras) · `papel`,
`cal`, `linho` (claras). **Não repita a mesma em dias seguidos.**
