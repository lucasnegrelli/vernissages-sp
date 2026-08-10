# fontes/

As seis grotescas do sistema de título, mais o chassi. **Sem CDN** — o kit precisa rodar offline e o PWA tem cache próprio. Os arquivos ficam aqui, versionados no repositório.

Formato: `.woff2`, versão variável quando existir. Nomes exatos esperados pelo `post.html`:

| arquivo | fonte | onde pegar | licença |
|---|---|---|---|
| `Archivo-Variable.woff2` | Archivo | fonts.google.com/specimen/Archivo | OFL 1.1 |
| `Switzer-Variable.woff2` | Switzer | fontshare.com/fonts/switzer | Fontshare (uso livre) |
| `SpaceGrotesk-Variable.woff2` | Space Grotesk | fonts.google.com/specimen/Space+Grotesk | OFL 1.1 |
| `GeneralSans-Variable.woff2` | General Sans | fontshare.com/fonts/general-sans | Fontshare (uso livre) |
| `InstrumentSans-Variable.woff2` | Instrument Sans | fonts.google.com/specimen/Instrument+Sans | OFL 1.1 |
| `BricolageGrotesque-Variable.woff2` | Bricolage Grotesque | fonts.google.com/specimen/Bricolage+Grotesque | OFL 1.1 |

Baixe o `.ttf` variável e converta para `woff2` (`fonttools`, `woff2_compress` ou qualquer conversor local). Renomeie exatamente como na tabela — o `@font-face` do `post.html` procura por esses nomes.

Enquanto faltar algum arquivo, o `post.html` mostra um aviso no topo dizendo quais estão ausentes e os slides caem na pilha do sistema. Funciona, mas não é o visual aprovado.

**Archivo é o chassi e não rotaciona.** É a fonte de kicker, corpo, serviço, rodapé e dos slides de `AGENDA`. Se só der para subir um arquivo agora, suba o Archivo.

## Critério de entrada no conjunto

Antes de acrescentar qualquer fonte nova aqui, ela precisa passar nos cinco critérios do `POSTS.md` §3: grotesca neo ou contemporânea, altura-x alta, peso 400–700 no mínimo com itálico verdadeiro ou nenhum, licença aberta e hospedável, números tabulares.
