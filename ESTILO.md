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

**Formato** — carrossel de 4 slides, 1080×1350 (4:5).

| Slide | Função | Composição |
|---|---|---|
| 01 | Isca | Detalhe fechado da obra. Sem texto, salvo o título em corpo pequeno no rodapé. |
| 02 | Ambiente | Obra no espaço ou galeria vazia. Foco em luz e arquitetura. Ficha curta abaixo. |
| 03 | Ficha | Fundo chapado. Texto objetivo, contraste tipográfico máximo. |
| 04 | Agenda | Outras aberturas da semana, em lista. |

**Paleta** — neutra e sólida, para não competir com a obra:

| | hex |
|---|---|
| off-white creme | `#EDEAE4` |
| preto absoluto | `#0B0B0B` |
| cinza concreto | `#8C8A85` |
| bege cru | `#D9D2C5` |

Sobre o fundo chapado, granulado leve (noise a ~5% de opacidade), para dar
textura de convite impresso.

**Tipografia** — grotescas. Space Grotesk nos títulos, Inter no texto corrido.
O contraste é a regra: título em corpo muito grande, serviço em corpo pequeno
com entrelinha e tracking generosos. Espaço vazio é elemento de composição,
não sobra.

**Assinatura** — `VERNISSAGES SP` em caixa alta, corpo pequeno, tracking largo,
sempre no canto inferior esquerdo. Numeração do slide no canto oposto.

## 5. Ferramenta

`gerador-posts.html` monta os quatro slides e a legenda a partir dos campos da
exposição, exporta os PNG em tamanho real e aplica esta identidade
automaticamente.
