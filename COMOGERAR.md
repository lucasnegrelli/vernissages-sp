# Como gerar a semana

Dois comandos. O primeiro decide o que sai, o segundo monta:

```
cd C:\Users\lucas\Desktop\Negrelli\Artes\VernissagesSP
node planejar.js --seco   ← mostra o plano da semana que vem, sem escrever
node planejar.js          ← escreve o PLANO.json
node semana.js --seco     ← confere o que falta, sem gerar imagem
node semana.js            ← gera de verdade
```

## Por que existe um planejador — mudou em 30/08/2026

Até 30/08 o `PLANO.json` era escrito à mão toda semana, e a saída era sempre a
mesma: os sete formatos, na mesma ordem, com o mesmo conteúdo. O salão de 24/08
e o de 31/08 diferiam em três obras de quarenta. A `deriva` saiu duas vezes na
mesma semana com o percurso **idêntico**, mudando só a paleta. E o plano
quebrava a própria regra de não repetir paleta em dias seguidos.

O problema não era falta de formato. Era falta de **recorte** e de **memória**:

- **Recorte.** Cada formato só sabia fazer uma coisa — o `salao` pendurava
  todas as obras, a `duracao` desenhava todas as mostras, a `deriva` achava
  sempre o mesmo aglomerado dos Jardins. Agora existe um `filtro` compartilhado
  (em `rima.js`, aplicado por `salao`, `duracao`, `deriva` e `role`), e "salão"
  deixou de ser uma peça para virar dez.
- **Memória.** O `SOCIAL/USADAS.json` guarda o dia em que cada ideia saiu. Uma
  ideia só volta depois do `descanso` (35 dias). Com 50 ideias e 10 peças por
  semana, o mês inteiro passa sem repetir — e quando começa a reciclar, avisa.

O banco de ideias é o **`REPERTORIO.json`**. Para mudar o que a rotina pode
fazer, mexa nele — não no `PLANO.json`, que é gerado.

## O filtro

Recorta quais mostras entram na peça. Nenhum campo é obrigatório; config sem
`filtro` se comporta como antes. Ele só estreita: mostra que passa no filtro
ainda precisa de obra em disco, crédito e o resto.

| campo | o que faz |
|---|---|
| `tipo` | `galeria` · `institucional` · `hibrido` · `feira` (ou lista) |
| `zona` | `Oeste` · `Centro` · `Sul` · `Norte` · `Leste` (ou lista) |
| `bairro` | nome exato do campo `b` do venue (ou lista) |
| `casa` | nome exato do venue (ou lista) |
| `fechaEm` | só o que encerra dentro de N dias |
| `duraMais` | só o que dura mais de N dias |
| `abriuEm` | só o que abriu nos últimos N dias |
| `vista` | `false` = só reprodução de obra · `true` = só vista de sala |
| `temFim` | `true` = só com data de encerramento divulgada |

**Cuidado com recorte apertado em formato que promete estrutura.** O `role`
precisa de três roteiros disjuntos em três regiões; com `fechaEm: 21` ele
abortou dizendo que com menos de três ele mente — e estava certo. Urgência
curta é assunto de formato de lista (`salao`, `duracao`), não do `role`.

## Editar o plano à mão

Continua funcionando. O `PLANO.json` é um arquivo normal e o `semana.js` lê o
que estiver lá. Só saiba que **a edição se perde no próximo `planejar.js`** —
para mudar de vez, mexa no `REPERTORIO.json`.

O `planejar.js` preserva o `fora` do plano anterior, porque exclusão curatorial
custou olho humano e não deve morrer a cada replanejamento.

O que manda na geração é o **`PLANO.json`**. Cada linha de `posts` vira uma
peça, e ele aceita **mais de uma por dia** — é só repetir a data com `ordem: 1`,
`ordem: 2`, e assim por diante.

Uma peça que falha não derruba as outras. No fim sai um bloco **O QUE FALTA**
dizendo exatamente o que escrever.

---

## Editar o plano

```json
{ "data": "2026-09-02", "formato": "deriva", "ordem": 1,
  "paleta": "papel", "textura": 0.07 }
```

| campo | o que faz |
|---|---|
| `data` | AAAA-MM-DD. Define a pasta `SOCIAL/MM/DD/` |
| `formato` | rima · aproximacao · deriva · entrada · salao · role · duracao |
| `ordem` | 1 é a primeira do dia. Só organiza a saída |
| `paleta` | escuro · tinta · barro · papel · cal · linho |
| `textura` | 0 a 0,12. `false` desliga o grão |
| `nome` | prefixo do arquivo, quando o mesmo formato sai duas vezes na semana |
| `ajustes` | sobrescreve qualquer campo do modelo naquele dia, inclusive o `filtro` |
| `ideia` | id da ideia do `REPERTORIO.json` que gerou a linha (escrito pelo planejador) |
| `pular` | `true` desliga sem apagar |

`fora` no topo do plano exclui mostras de todas as peças da semana — serve para
imagem que é cartaz e não obra.

**Antes de usar o `fora`, veja se o caso é de `vista`.** Imagem que mostra a
parede da galeria em vez do trabalho não precisa sair da semana inteira: marque
`vista: true` na mostra, no `dados.js`, e ela some de `rima` e `aproximacao`
continuando disponível para `deriva`, `salao` e `role`. O `fora` é para dado
errado — cartaz, logotipo, foto de vernissage.

---

## Os dois que precisam de você

**`rima`** e **`aproximacao`** dependem de escolha humana e não têm modelo. O
script falha de propósito e diz o que escrever:

- **rima** — as duas chaves de mostra (`a` e `b`), a tese e o argumento. A
  afinidade entre duas mostras é olho, não algoritmo: o que uma máquina acharia
  é palavra repetida no título.
- **aproximacao** — a chave da obra, os pontos de recorte (`zooms`) e a leitura.
  Onde vale chegar perto é quem olha a obra que decide.

Escreva o arquivo em `SOCIAL/MM/DD/rima.json` (ou `aproximacao.json`) e rode de
novo. Use os de `SOCIAL/08/24/` e `SOCIAL/08/25/` como referência.

Os outros cinco montam sozinhos da base: se não houver config no dia, o script
copia de `modelos/` e aplica paleta e textura do plano.

---

## Paletas

Três escuras e três claras. Nenhuma tem cor de acento — todas trabalham por
temperatura e luminosidade, porque a cor continua vindo das obras.

| paleta | fundo | quando usar |
|---|---|---|
| `escuro` | quase preto neutro | obra isolada, sala de museu |
| `tinta` | azul-noite | diagrama, e obra de cor quente, que salta contra ele |
| `barro` | terra escura | pintura e matéria; aquece o quadro |
| `papel` | bege claro | mapa e guia — coisa que se imprime e se dobra |
| `cal` | quase branco duro | texto que é o objeto, cartão |
| `linho` | bege médio quente | o único claro que aguenta obra colorida sem lavar |

**Não use a mesma paleta dois dias seguidos.** Na semana de 24/08 cinco dos
sete formatos saíram em `escuro` e o feed virou uma mancha só.

O **grão** é um ruído em opacidade baixa por cima de tudo, inclusive das obras.
Tira o aspecto de tela chapada, que é o que mais denuncia peça feita em
navegador. Entre 0,05 e 0,09 quase não se vê — é o ponto.

---

## Ideias novas

Formato novo entra como um arquivo `<nome>.js` na raiz, seguindo o padrão dos
sete que existem, mais uma linha em `FORMATOS` no `semana.js` e um
`modelos/<nome>.json`. Se ele depender de curadoria, marque `curado: true` e
escreva no campo `precisa` o que falta — a mensagem de erro vira instrução.

As regras que nenhum formato novo quebra:

1. **Nada é postado automaticamente.** Todos param no arquivo.
2. **Nada é inventado.** Data, endereço, autoria e crédito só entram
   confirmados na base. Na dúvida, fica de fora e a peça declara.
3. **Peça sem obra não é peça** — nos formatos que mostram trabalho, o script
   aborta em vez de cair no chapado.
4. **Todo número é calculado na hora**, nunca digitado no config.
