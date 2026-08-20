# Vernissages SP — linha editorial

v2 — 20/08/2026. Substitui a v1 de 16/08, que organizava a semana por
calendário. Se algo aqui não funcionar depois de duas ou três semanas, mude —
mas mude com o número na mão, como esta versão foi escrita.

## Por que a v1 foi trocada

A v1 dizia: segunda `destaque`, terça `carrossel`, quarta `destaque`, sexta
`lembrete`. Um calendário fixo **garante** que a mesma coisa saia no mesmo dia
para sempre, independente do que está acontecendo na cidade. Ele não olha para
o dado; só preenche casa.

O resultado, medido no histórico de destaques de 10 a 20/08: onze dias, onze
galerias diferentes e **onze vezes a mesma proposição** — *esta mostra existe,
abre tal dia, fica até tal dia.* O nome da casa mudava. A frase, não.

Três causas, todas estruturais:

1. **Todas as peças eram de anúncio.** `carrossel`, `destaque`, `nota` e
   `lembrete` fazem a mesma coisa: avisam que algo vai abrir. Nenhuma compara,
   ordena, lembra ou discorda.
2. **O filtro de imagem virou a linha editorial sem ninguém decidir isso.** A
   Fase 2 só considera mostra com `img` e `cred`. Quem tem press kit bom é
   galeria estabelecida dos Jardins; quem não tem é o independente que este
   projeto existe para cobrir. O runbook manda priorizar `hibrido` na varredura
   e o filtro devolvia Jardins todo dia. Em 20/08, das 57 mostras em cartaz,
   apenas **3** estavam em espaço híbrido — e 2 delas sem imagem.
3. **A trava anti-repetição protege a galeria, não a forma.** `E20` impede a
   mesma casa duas vezes em 7 dias. Nada impedia 30 dias seguidos da mesma
   frase.

E o motivo da legenda ser sem graça não era redação: **20 das 57 mostras em
cartaz tinham o campo `d` com menos de 60 caracteres** — "Pinturas recentes.",
"Obras dos anos 90.", "Exposição individual anunciada pela galeria." Nenhum
layout salva isso. Virou o aviso `A07` do `check.js`.

## O desenho novo: gatilho no lugar de calendário

Cada formato tem uma **condição de disparo** na base. Se acende, sai. Se não
acende, não sai — e outro ocupa o lugar. O dia da semana deixa de mandar.

**Dois slots por dia:**

| Slot | Hora | Função | Sai sempre? |
|---|---|---|---|
| **A** | manhã | **serviço** — a pessoa está decidindo onde ir | sim |
| **B** | noite | **tese** — algo com ponto de vista, para guardar e mandar pra alguém | só com gatilho |

Em dia fraco sai uma peça só, e está certo. Slot B vazio é resultado do
sistema funcionando, não falha de produção. **Peça de enchimento é pior que
silêncio** — foi ela que criou a repetição que estamos consertando.

## Catálogo de formatos

Prioridade: quando dois gatilhos acendem no mesmo slot, ganha o de cima.

### Slot A — serviço

| # | Formato | Gatilho | Estado |
|---|---|---|---|
| A1 | **abre hoje** | existe expo com `ini` = hoje | usa `destaque`, já existe |
| A2 | **sai de cartaz** | ≥1 expo com `fim` nos próximos 7 dias (abre para 14 se render menos de 3) | **pronto no `post.html`** |
| A3 | **fim de semana** | é sexta ou sábado | usa `carrossel`, já existe |
| A4 | **roteiro a pé** | ≥3 casas com mostra ativa a menos de 700 m entre si | a construir |
| A5 | **carrossel da agenda** | sempre — é o fallback quando nada acima acende | já existe |

**A2 é o carro-chefe.** Galeria anuncia abertura; ninguém anuncia
encerramento. É a única informação da agenda com prazo, a única que obriga o
leitor a se mexer, e a única em que o nosso dado vale mais que o post da
própria casa — que não tem interesse em lembrar que a mostra vai acabar. Em
20/08 havia seis mostras encerrando em quatro dias enquanto o feed passava a
semana anunciando abertura.

O nome não é "última chance": essa expressão está na lista de `PROIBIDOS` do
`check.js`, junto com "corra para" e "imperdível". "Sai de cartaz" é o termo da
imprensa cultural e diz o mesmo fato sem registro de venda.

**A4 é o mais difícil de copiar.** Exige lat/lng das 91 casas, que só nós
temos. Um trecho real da base de hoje: Casa Triângulo → Zipper (120 m) → Paulo
Kuczynski (166 m) → Marcelo Guarnieri (125 m) → Luisa Strina (130 m). Cinco
galerias em menos de 700 metros de caminhada.

### Slot B — tese

| # | Formato | Gatilho | Estado |
|---|---|---|---|
| B1 | **abriu e ninguém viu** | expo em venue `hibrido` aberta nos últimos 7 dias e nunca destacada | a construir |
| B2 | **o mesmo artista em duas casas** | artista com ≥2 mostras não encerradas | a construir |
| B3 | **voltou** | artista com `primeiroRegistro` há mais de 6 meses e mostra nova | a construir |
| B4 | **número da semana** | sempre disponível — usar no máximo 1×/semana | a construir |
| B5 | **nota** | há fato do circuito com fonte verificável | já existe |

B2 e B3 saem do `acervo.json`, que ninguém mais tem: 105 mostras, 114 artistas
e 92 casas com data de primeiro registro. Testado em 20/08, B2 dá **zero** — e
está certo. Formato que não tem o que dizer não sai.

B4 é fato com tese dentro, sem adjetivo: "dos 91 espaços do mapa, 50 estão na
Zona Oeste e 1 na Zona Leste". Respeita o `ESTILO.md`, que proíbe adjetivo
comercial e não proíbe ter tese. Usar pouco: vira maneirismo rápido.

## Travas anti-repetição

As três valem juntas. A primeira já existia; as outras duas são a novidade.

1. **Galeria** — a mesma casa não vira destaque duas vezes em 7 dias (`E20`).
2. **Formato** — o mesmo formato não repete em 3 dias no mesmo slot, exceto
   `A2` e `A5`, que são serviço contínuo. `A1` fura a fila sempre que acende:
   abertura no dia é a notícia.

   **Exceção descoberta em 20/08, na primeira execução real:** `A2` fura o `A1`
   quando houver mostra encerrando em **dois dias ou menos**. A razão é a vida
   útil da informação — abertura tem oito semanas pela frente e a galeria mesma
   divulga; encerramento tem dois dias e ninguém divulga. Naquele dia abria a
   individual da Tania Ximena na Galatea e fechavam três mostras no sábado. O
   aviso de fechamento não tinha outro dia para sair.
3. **Conteúdo** — a peça não sai se a lista dela for igual à da última vez que
   o formato rodou. `sai de cartaz` com as mesmas três mostras de anteontem não
   é peça nova, é a mesma peça com data diferente.

## Regra de matéria-prima

**Mostra sem fato concreto no campo `d` não vira destaque.** O `check.js`
acusa com `A07` (abaixo de 60 caracteres). O modelo está no `ESTILO.md`:
*"48 trabalhos realizados entre 1974 e 1981, no Chile sob a ditadura militar"*
— um número, um período, um lugar.

Isso é trabalho da **Fase 1**, não da redação: a varredura de domingo tem que
trazer um dado conferível por mostra. Sem ele, a mostra entra na agenda do site
normalmente, mas não é candidata a peça.

## Recorrência mensal

- **Primeira segunda do mês — panorama:** carrossel estendido, 3 a 4 semanas à
  frente em vez de 2.
- **Último dia útil — o que fechou:** registro das mostras que encerraram no
  mês. Sem tom de balanço institucional.

## Régua de qualidade

Impacto visual de galeria grande (Gagosian, Zwirner, König: a obra ocupa o
quadro, texto é o mínimo). Ritmo de quem cobre o circuito todo dia (e-flux,
Contemporary Art Daily). Disposição de escrever com ponto de vista que a
crítica tem (Hyperallergic, Frieze) sem soar nota de assessoria. Não é para
imitar ninguém; é a régua.

Consistência é a paleta, a assinatura e a voz. Variedade é **o que cada peça
escolhe dizer** — não o tratamento de imagem. O rodízio de 10 tratamentos e 6
fontes do `post.html` nunca foi o problema e não é a solução.

## O que NÃO muda

- Voz e estrutura de texto: `ESTILO.md`, sem exceção.
- Publicação continua manual. Nenhuma automação posta no Instagram sozinha.
- `foco` e `destaques` do `dados.js` continuam sendo da Fase 2 da rotina
  `vernissages-sp` — esta linha editorial trata das peças de social, não do
  destaque do site.
