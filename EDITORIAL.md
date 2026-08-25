# Vernissages SP — linha editorial

v3 — 24/08/2026. Substitui a v2 de 20/08, que organizava a semana por gatilho,
e a v1 de 16/08, que organizava por calendário. Se algo aqui não funcionar
depois de duas ou três semanas, mude — mas mude com o número na mão, como as
três versões foram escritas.

## O arco das três versões, porque ele explica a regra atual

**v1 — calendário.** Segunda `destaque`, terça `carrossel`, quarta `destaque`,
sexta `lembrete`. Onze dias medidos entre 10 e 20/08: onze galerias diferentes
e **onze vezes a mesma proposição** — *esta mostra existe, abre tal dia, fica
até tal dia.* Mudava o nome da casa; a frase, não.

**v2 — gatilho.** A troca partiu do diagnóstico certo: o problema não era o dia
da semana, era que **todos os quatro formatos eram de anúncio**. `carrossel`,
`destaque`, `nota` e `lembrete` faziam a mesma operação. Nenhum comparava,
ordenava, media ou discordava. A v2 tentou consertar isso com condição de
disparo — se acende, sai — mas manteve os formatos velhos e só rearranjou
quando cada um saía. Anúncio disparado por gatilho continua sendo anúncio.

**v3 — operação.** O que mudou em 24/08 não foi a cadência: foram os formatos.
Sete novos, e o critério de existir de cada um é fazer com o dado uma
**operação que os outros seis não fazem** — comparar, aprofundar, percorrer,
precificar, acumular, escolher, medir. Com sete operações distintas, o
calendário volta a ser seguro: mesmo dia, mesma hora, e ainda assim sete frases
diferentes por semana. A repetição nunca esteve no calendário. Estava na
monocultura de formato.

Corolário que vale guardar: **grade fixa só é aceitável quando os formatos
divergem de operação.** Se um dia um formato novo repetir a operação de outro,
o calendário volta a ser o problema.

## A semana

| dia | formato | operação | curado |
|---|---|---|---|
| seg | `rima` | comparar duas mostras | **sim** |
| ter | `aproximacao` | aprofundar numa obra | **sim** |
| qua | `deriva` | percorrer a cidade | não |
| qui | `entrada` | quanto custa e como se entra | não |
| sex | `salao` | tudo de uma vez, denso | não |
| sáb | `role` | escolher entre três roteiros | não |
| dom | `duracao` | ver o tempo, diagrama | não |

Quem manda no que sai é o **`PLANO.json`** na raiz, não este documento: aqui
está o porquê, lá está a semana. Mecânica de geração em `COMOGERAR.md`.

**Dois slots por dia, herdados da v2 e mantidos.** No plano são `ordem: 1` e
`ordem: 2`. O primeiro é serviço — a pessoa está decidindo onde ir. O segundo é
tese — algo com ponto de vista, para guardar e mandar pra alguém. **Dia com uma
peça só é resultado correto. Peça de enchimento é pior que silêncio** — foi ela
que criou a repetição que a v2 e a v3 vieram consertar.

## Os sete, um a um

O texto longo de cada formato — o que é, de onde veio, o que ele recusa — está
no cabeçalho do respectivo `.js`. Aqui fica só o que é decisão editorial.

### `rima` — segunda
Duas mostras em cartaz ao mesmo tempo, em casas diferentes, postas lado a lado
por uma afinidade que ninguém apontou. Não é agenda: é leitura do circuito, o
trabalho que um curador faz quando olha a cidade inteira de uma vez. Só dá para
fazer com as 91 casas e as mostras simultâneas mapeadas.
**Aborta** se qualquer uma das duas obras não tiver imagem válida em disco.

### `aproximacao` — terça
Uma obra só, lida de perto. Começa num recorte tão fechado que o leitor não
sabe o que está vendo e vai abrindo até revelar o trabalho inteiro. É o
contrário exato da rima: amplitude numa, profundidade na outra.
**Aborta** se a imagem não tiver pixel real por trás do zoom. Das 33 obras com
imagem espelhada em 24/08, **26 estavam em 1200×630** — medida de card de rede
social, que é preview de link, não reprodução de obra.

### `deriva` — quarta
Um percurso a pé entre casas com mostra em cartaz, distâncias calculadas das
coordenadas reais, mapa desenhado do zero — só os pontos e o fio que os liga.
Rima e aproximação trabalham o olho; esta trabalha as pernas, e depende de um
ativo que nenhum agregador tem: lat/lng das 91 casas.
**Declara** que a distância é em linha reta, não rota de calçada.

### `entrada` — quinta
O único formato que não mostra obra. Trata da porta: quanto custa entrar, quem
cobra, quem não cobra. Ninguém no circuito fala de dinheiro, e o resultado é
que a maior parte das pessoas acha que ver arte em São Paulo é caro. O dado diz
o contrário com folga. **A barreira real nunca foi o preço — é não saber que se
pode empurrar a porta.**
**Casa com `conf` não entra na conta**: sai em linha separada dizendo que falta
confirmar. Precisão inventada aqui é pior que silêncio, porque a pessoa vai com
o dinheiro contado.

### `salao` — sexta
Todas as obras em cartaz penduradas juntas na mesma parede e numeradas, com
catálogo em seguida — como o Salon de Paris pendurava até o fim do século XIX.
O cubo branco é invenção do modernismo e tem cem anos; não é a única forma
possível. O salão obriga as obras a conviverem, e aí se vê o que a cidade está
pintando neste mês.
**Aborta abaixo de doze obras** — a peça depende da densidade para dizer o que
quer dizer. E toda obra na parede tem crédito no catálogo: salão sem catálogo é
mural decorativo.

### `role` — sábado
Três roteiros prontos, em regiões diferentes, sem sobreposição. Sábado a pessoa
não está lendo, está saindo. O problema dela não é falta de opção — são 22
casas com mostra e obra em cartaz, e **opção demais paralisa**. O formato reduz
22 a três, e três a um.
**Não promete horário de fechamento**: só 5 das 37 casas publicam horário de
sábado. Sem dado não há promessa — a peça manda conferir antes de sair.

### `duracao` — domingo
Todas as mostras como linhas de tempo, ordenadas por encerramento. Sem foto,
sem título: é diagrama. Mede o que ninguém mede — galeria tem mediana de 42
dias, instituição de 141. **A arte comercial é efêmera e a institucional é
quase permanente, e ninguém conta isso a quem está decidindo o que ver.**
Domingo é o único dia em que faz sentido publicar uma peça que não manda
ninguém a lugar nenhum agora.

## Os dois que dependem de você

`rima` e `aproximacao` são `curado: true` no `semana.js`. **Não montam
sozinhas, e vão falhar toda semana até o config existir** — de propósito.

- **rima** — as duas chaves de mostra (`a` e `b`), a tese e o argumento. A
  afinidade entre duas mostras é olho, não algoritmo: o que uma máquina acharia
  é palavra repetida no título.
- **aproximacao** — a chave da obra, os pontos de recorte (`zooms`) e a
  leitura. Onde vale chegar perto é quem olha a obra que decide.

Os outros cinco copiam de `modelos/` e montam da base. O que o operador escreve
nesses dois é **só a tese** — título, artista, casa, endereço, prazo e o campo
`d` continuam vindo do `dados.js`. Curadoria é humana; dado é do banco.

## Travas anti-repetição

1. **Galeria** — a mesma casa não vira destaque duas vezes em 7 dias (`E20`).
2. **Obra** — nenhuma imagem aparece duas vezes dentro de uma peça, e nenhuma
   obra entra duas vezes no salão.
3. **Conteúdo** — a peça não sai se a lista dela for igual à da última vez que
   o formato rodou. `salao` com as mesmas obras de sexta passada não é peça
   nova, é a mesma peça com data diferente.
4. **Superfície** — não repita paleta em dias seguidos. Na semana de 24/08,
   cinco dos sete formatos saíram em `escuro` e o feed virou uma mancha só.
   Detalhe no `POSTS.md`.

A trava de **formato** da v2 morreu com o gatilho: a grade agora garante
sozinha que nenhum formato repita antes de sete dias.

## Obra e vista de sala

Nem toda imagem em cartaz mostra o trabalho. Boa parte do que instituição
publica é **vista de sala** — a parede fotografada, com as obras pequenas
dentro dela. Isso não é defeito: é informação honesta sobre o que se vai
encontrar, e serve perfeitamente a `deriva`, `salao` e `role`, cujo assunto é
o percurso e a densidade.

O que ela não serve é a `rima` e à `aproximacao`, os dois formatos que
**afirmam alguma coisa sobre o trabalho**. Comparar duas mostras pela matéria,
ou ampliar até a trama do linho, exige a reprodução da obra.

O campo `vista: true` no `dados.js` registra a diferença, e os dois formatos
recusam sozinhos. Quem preenche é quem abriu a imagem para olhar — nenhuma
verificação de arquivo distingue as duas coisas, porque vista de sala bem
fotografada tem peso, dimensão e crédito de sobra.

## Regra de matéria-prima

**Mostra sem fato concreto no campo `d` não vira peça.** O `check.js` acusa com
`A07` (abaixo de 60 caracteres). O modelo está no `ESTILO.md`: *"48 trabalhos
realizados entre 1974 e 1981, no Chile sob a ditadura militar"* — um número, um
período, um lugar. "Pinturas recentes." não é fato; é preenchimento de campo.

Isso é trabalho da **varredura de domingo**, não da redação: cada mostra tem
que voltar com um dado conferível. Sem ele, entra na agenda do site normalmente
mas não é candidata a peça.

## Recorrência mensal

- **Primeira segunda do mês** — `rima` de fôlego mais largo, comparando duas
  mostras que abriram no mês.
- **Último domingo** — `duracao` com a janela aberta, para ler o mês que vem em
  vez das próximas duas semanas.

## Régua de qualidade

Impacto visual de galeria grande (Gagosian, Zwirner, König: a obra ocupa o
quadro, texto é o mínimo). Ritmo de quem cobre o circuito todo dia (e-flux,
Contemporary Art Daily). Disposição de escrever com ponto de vista que a
crítica tem (Hyperallergic, Frieze) sem soar nota de assessoria. Não é para
imitar ninguém; é a régua.

Consistência é a paleta, a assinatura e a voz. Variedade é **a operação que
cada peça faz** — nunca o tratamento de imagem. O rodízio de 10 tratamentos e 6
fontes do `post.html` nunca foi o problema e não foi a solução.

## Ideia de formato novo

Formato novo só entra se fizer uma operação que os sete não fazem. A mecânica
está no `COMOGERAR.md`; o teste editorial é uma pergunta: **qual frase esta
peça afirma que nenhuma das outras sete afirma?** Se a resposta descrever um
tratamento visual em vez de uma operação sobre o dado, não é formato novo.

## O que NÃO muda

- Voz e estrutura de texto: `ESTILO.md`, sem exceção.
- Publicação continua manual. Nenhuma automação posta no Instagram sozinha.
- Nada é inventado. Data, endereço, autoria e crédito só entram confirmados.
  Na dúvida, fica de fora e a peça declara.
- Todo número é calculado na hora, nunca digitado no config.
- Peça sem obra não é peça — o script aborta em vez de cair no chapado.
- `foco` e `destaques` do `dados.js` são do destaque do site, não daqui.
