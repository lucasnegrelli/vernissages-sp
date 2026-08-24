# Como gerar a semana

Um comando monta tudo:

```
cd C:\Users\lucas\Desktop\Negrelli\Artes\VernissagesSP
node semana.js --seco     ← confere o que falta, sem gerar imagem
node semana.js            ← gera de verdade
```

O que manda é o **`PLANO.json`** na raiz. Cada linha de `posts` vira uma peça,
e ele aceita **mais de uma por dia** — é só repetir a data com `ordem: 1`,
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
| `ajustes` | sobrescreve qualquer campo do modelo naquele dia |
| `pular` | `true` desliga sem apagar |

`fora` no topo do plano exclui mostras de todas as peças da semana — serve para
imagem que é cartaz e não obra.

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
