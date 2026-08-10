# POSTS.md — sistema visual dos carrosséis do Vernissages SP

Especificação do kit de post: o que o `post.html` gera, com que tipografia, que tratamento de imagem e sob que regras editoriais.

> **Documento reconstruído em 10/08/2026.** O original foi escrito na pasta `outputs` de uma sessão anterior, que é efêmera, e se perdeu. A espinha (sistema tipográfico, as duas travas, a regra ética, os dez tratamentos) veio do registro daquela sessão. Os pontos marcados **[confirmar]** são preenchimentos plausíveis, não decisões que você aprovou — reveja antes de implementar.
>
> Este arquivo mora na pasta do projeto, não em `outputs`. Não mova.

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

Sem cor de acento. Sem dourado. O contraste vem da tipografia e do tratamento da imagem, não de cor.

Contraste mínimo 4.5:1 entre texto e fundo em todas as combinações — inclusive texto sobre imagem tratada, onde a chapa de proteção é obrigatória.

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
- Stories e Reels. Só feed 4:5, por enquanto.
- Qualquer coisa que envie imagem para servidor.
