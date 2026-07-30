# Vernissages SP

Dashboard de galerias, aberturas de exposições e roteiros de arte na cidade de São Paulo.
Site estático + PWA (instalável no celular). Sem backend, sem build — é só hospedar a pasta.

## Estrutura

| arquivo | função |
|---|---|
| `index.html` | interface (mapa, filtros, roteiros) — raramente precisa mudar |
| `dados.js` | **base de dados** — é aqui que você atualiza galerias e exposições |
| `manifest.webmanifest` + `sw.js` + ícones | PWA (instalação e offline) |

## Como publicar (GitHub Pages, grátis)

1. Crie um repositório no GitHub (ex.: `vernissages-sp`).
2. Suba todos os arquivos desta pasta.
3. Em **Settings → Pages**, escolha *Deploy from a branch* → branch `main` → pasta `/ (root)`.
4. Em ~1 min o site estará em `https://SEU-USUARIO.github.io/vernissages-sp/`.
5. Domínio próprio (opcional): em Pages → *Custom domain*, aponte um CNAME.

Alternativas: arraste a pasta em https://app.netlify.com/drop (publica na hora) ou use Vercel.

## Como atualizar a agenda

Abra `dados.js` e edite:
- **EXPOS**: adicione objetos `{t, v, ini, fim, d}` (datas em `YYYY-MM-DD`; `fim: null` se não anunciado). O `v` precisa ser idêntico ao `name` de um espaço em VENUES.
- **VENUES**: novos espaços com `{name, addr, b, z, tipo, lat, lng, info}` (lat/lng: pegue no Google Maps com clique-direito no local).
- Atualize o campo `atualizado` no final do arquivo.

O status (abertura próxima / em cartaz / últimos dias) é calculado sozinho pela data do acesso.
Exposições encerradas somem automaticamente — não precisa apagar, mas vale limpar de vez em quando.

## PWA / instalação no celular

Servido via HTTPS (GitHub Pages já é), o navegador oferece "Adicionar à tela inicial".
Funciona offline (cache network-first: sempre tenta dados frescos primeiro).

## Caminho para as lojas

1. **Google Play**: empacote a PWA como TWA com [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (conta: US$ 25 única).
2. **App Store**: empacote com [Capacitor](https://capacitorjs.com/) e adicione recursos nativos
   (push de novas vernissages, geolocalização "perto de mim", favoritos) — a Apple rejeita apps que são "só um site" (conta: US$ 99/ano).

## Fontes dos dados

Arte Que Acontece · Ocula · ArteRef/FGV · São Paulo Secreto · Guia das Artes · SP-Arte.
Endereços com `~` ou "(a confirmar)" são aproximados — confirme antes de publicar como definitivo.
