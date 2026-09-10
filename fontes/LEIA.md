# fontes/

Uma fonte só. **Sem CDN** — a geração roda offline e o `@font-face` embute o
arquivo direto no HTML de cada peça.

| arquivo | fonte | onde pegar | licença |
|---|---|---|---|
| `Switzer-Variable.woff2` | Switzer | fontshare.com/fonts/switzer | Fontshare (uso livre) |

Baixe o `.ttf` variável e converta para `woff2` (`fonttools`, `woff2_compress`
ou qualquer conversor local). O nome tem de ser exatamente esse — o `CSS` do
`rima.js` procura por ele, e todos os geradores importam de lá.

## Por que uma só

O `post.html` (aposentado em 24/08, apagado em 10/09) rodiziava seis grotescas —
Archivo, Space Grotesk, General Sans, Instrument Sans, Bricolage, Switzer. O
sistema atual trocou o rodízio de superfície pela variedade de operação de cada
formato (ver `POSTS.md`): uma família, dois registros (300 para leitura, 500
caixa-alta para etiqueta). As outras cinco saíram do repo junto com o `post.html`.
