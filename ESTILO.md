# Vernissages SP — guia editorial e visual

Referência para qualquer texto ou peça publicada pelo projeto: site, Instagram,
envio de sexta e conteúdo gerado automaticamente pela rotina diária.

## 1. Voz

Curador e arquivista. Objetivo, culto, direto. O texto informa; não convence.

**Regras invioláveis**

- Sem gírias. Sem emojis. Sem exclamações.
- Sem adjetivo comercial ou apelativo: *imperdível, incrível, venha conferir,
  magia, jornada, único, imersivo* (quando não for descrição técnica da obra).
- Sem chamada para ação afetiva. A informação é a chamada.
- Frases curtas. Voz ativa. Nada de subordinação empilhada.
- Não interpretar a obra além do que a fonte afirma. Na dúvida, descrever.

## 2. Estrutura do texto de divulgação

Nesta ordem, sem cabeçalhos decorativos:

1. **Título da exposição · Artista(s)**
2. **Conceito curatorial** — 1 a 2 frases, no máximo. O que a mostra reúne e sob
   qual operação. Curadoria assinada entra aqui.
3. **Serviço**, em tópicos simples: Período · Local · Endereço · Visitação · Entrada.
4. Assinatura fixa: `Agenda completa das aberturas de São Paulo: vernissagessp.com.br`

Datas por extenso no corpo (8 de agosto a 19 de setembro de 2026) e em formato
curto nas peças gráficas (08.08 — 19.09).

### Modelo

```
O Lado Escuro da Lua  ·  Alfredo Jaar

Reúne 48 trabalhos realizados entre 1974 e 1981, no Chile sob a ditadura militar.
O conjunto opera entre registro documental e intervenção pública.

—

Período: 8 de agosto a 19 de setembro de 2026
Local: Galeria Luisa Strina
Endereço: Rua Padre João Manuel, 755 — Cerqueira César
Visitação: terça a sexta, 10h às 19h. Sábado, 11h às 17h
Entrada: gratuita

Agenda completa das aberturas de São Paulo: vernissagessp.com.br
```

## 3. Conteúdo pago

Todo conteúdo patrocinado é sinalizado, sempre, com o selo **conteúdo
patrocinado** (campo `publi: true` no bloco `foco` do `dados.js`). A credibilidade
da curadoria é o ativo do projeto; publicidade não sinalizada a destrói.

## 4. Identidade visual

**Formato** — peças de 1080×1350 (4:5). Cada formato tem seu número de slides;
todos usam o mesmo sistema.

**O eixo é `obra`** (reescrito em 01/09/2026). Uma reprodução por vez, tela
cheia, sem uma palavra no primeiro slide; a etiqueta de parede no segundo.
É o que o Contemporary Art Daily faz há quinze anos, e o oposto do que o feed
era em agosto — cinza sobre preto, a obra de miniatura. Selecionar já é opinar.

Os outros formatos existentes, por peso:

| formato | o que é | cadência |
|---|---|---|
| **obra** | uma obra, tela cheia + etiqueta | 3–4×/semana, monta sozinho |
| **rima** | duas mostras lado a lado por uma afinidade | 1×/semana, curadoria sua |
| **aproximação** | chegar perto de uma obra até a filigrana | 1×/semana, curadoria sua |
| **entrada** | como se entra numa galeria — porta, preço, sábado | ~1×/semana, monta sozinho |
| **deriva** | um percurso a pé entre casas próximas | ~1×/semana, monta sozinho |
| **salão** | tudo em cartaz na mesma parede (o Salon vs o cubo branco) | 1×/mês |

Saíram do social em 01/09: **rolê** (percurso, redundante com a deriva) e
**duração** (o diagrama de linha do tempo — agora é o painel *O panorama*, ao
vivo no site, melhor).

**Paletas** — seis, três escuras (`escuro`, `tinta`, `barro`) e três claras
(`papel`, `cal`, `linho`). Nenhuma tem cor de acento: todas trabalham por
temperatura e luminosidade, porque a cor vem da obra. Definidas no `rima.js`
(`PALETAS`). **Nunca a mesma paleta em dias seguidos** — o `planejar.js` já
cuida disso; se estiver montando à mão, cuide você.

Sobre o fundo, grão: um SVG de turbulência a ~5% de opacidade, por cima de
tudo, inclusive da obra. Tira o aspecto de tela chapada, que é o que mais
denuncia peça feita em navegador.

**Tipografia** — Switzer, uma família só, dois registros: 300 para o que se lê
devagar, 500 caixa-alta com tracking largo para o que só se etiqueta. Título em
corpo grande, serviço em corpo pequeno. Espaço vazio é composição, não sobra.

**Assinatura** — `Vernissages SP` em caixa alta, corpo pequeno, tracking largo,
canto inferior esquerdo. Numeração do slide no canto oposto.

## 5. Ferramentas

O `EDITORIAL.md` e o `post.html` estão **aposentados** (24/08/2026). A geração
mora em:

- `REPERTORIO.json` — o banco de ideias (formato + recorte + texto). Para mudar
  o que a rotina pode fazer, mexe aqui.
- `planejar.js` — sorteia do repertório, respeita descanso e paleta, escreve o
  `PLANO.json`.
- `semana.js` — lê o `PLANO.json` e chama o gerador de cada formato
  (`obra.js`, `rima.js`, `salao.js`, `deriva.js`, `entrada.js`, `aproximacao.js`).
- `COMOGERAR.md` — o passo a passo.

`rima` e `aproximação` **falham de propósito** sem o config curado: dependem de
escolha humana, e a mensagem de erro diz o que escrever.
