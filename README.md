# 🥂 Vernissages SP

**Site ao vivo: https://vernissagessp.com.br** · Instagram: **@vernissagessp**

Guia da cena de arte contemporânea de São Paulo: mapa vivo de 124 galerias,
museus e espaços independentes, agenda de aberturas, roteiros a pé, páginas por
artista, acervo e editais. Site estático + PWA, sem backend. A base se atualiza
sozinha por GitHub Actions; o Instagram sai de um pipeline que gera as peças
prontas (a publicação é sempre manual).

---

## Mapa de documentos — comece por aqui

| arquivo | para que serve |
|---|---|
| **README.md** | este índice: o que é, onde está cada coisa |
| **OPERACAO.md** | o runbook: rotinas diárias e semanais, regras de apuração, imagem, Instagram |
| **PENDENCIAS.md** | retrato atual do projeto e pauta aberta |
| **POSTS.md** | sistema visual das peças (grade da semana, tipografia, paletas, acento terracota) |
| **ESTILO.md** | voz do texto |
| **COMOGERAR.md** | passo a passo para gerar a semana do social |
| **IDEIAS.md** | banco bruto de 240 ideias de post (o que ainda não virou formato) |
| **REFERENCIAS.md** | concorrência e inspiração: quem copiar e o quê |
| **REPERTORIO.json** | as 204 ideias que o planejador já sabe gerar sozinho |
| `EDITAIS/` · `NEGOCIO/` | captação e serviço de sites — **fora do git** (dado de negócio) |

---

## As frentes

### 1. Site / PWA
`index.html` (arquivo único) + `dados.js` (a base). GitHub Pages, domínio via `CNAME`.
Mapa (Leaflet), aberturas da semana, "O panorama" (linha do tempo das mostras),
páginas de artista e de mostra, acervo, editais, montador de roteiro, PWA offline.

### 2. Base de dados (`dados.js`)
Alimentada por varredura de sites e agregadores (`radar*.js`), garimpo de imagem
(`descobrir-imagens.js`, `espelhar.js`) e, desde 25/09/2026, **raspagem semanal
do Instagram** das casas que só divulgam lá (`instagram.js`, via Apify). Toda
entrada passa pelo `check.js` antes de publicar.

### 3. Social (Instagram)
```
REPERTORIO.json → planejar.js (PLANO.json) → semana.js → geradores → SOCIAL/MM/DD/
```
**Grade fixa (desde 25/09/2026):** qui **agenda** (o fim de semana, carrossel) ·
sáb **deriva** (roteiro a pé com mapa de ruas reais) · demais dias do repertório.
Legenda de cada post em `SOCIAL/MM/DD/LEGENDA.txt`. Nada é postado sozinho.

**Em revisão (26/09/2026):** número, entrada e aproximação-zoom foram vetados;
rima e aproximação serão reconstruídas. Formatos novos em estudo no `IDEIAS.md`
(mercado, história por trás, "Fui", quanto custa?).

### 4. Negócio
- **Serviço de sites para galerias** — `leads-sites.js` lista quem não tem site
  ou tem site morto (saída em `NEGOCIO/`, fora do git).
- **Captação** — dossiê de editais em `EDITAIS/` (fora do git).
- **Intel** *(não lançado)* — boletim pago em `intel/` (Next.js + Stripe + Supabase).

---

## Ferramentas

| script | o que faz |
|---|---|
| `check.js` | valida a base — **nada é commitado sem ele passar** |
| `destaque.js` | escolhe a mostra em foco do dia |
| `gerar.js` | páginas de artista/mostra, acervo, editais, sitemap |
| `radar.js` · `radar-fontes.js` · `radar-editais.js` | quem está sem cobertura; varredura de agregadores e editais |
| `instagram.js` | raspa as casas `soIG` (Apify) e deixa as legendas para a rotina ler |
| `captar.js` | legenda de Instagram colada à mão → linha do `dados.js` |
| `descobrir-imagens.js` · `espelhar.js` · `medir-imagem.js` | acham, copiam e medem imagem de obra |
| `planejar.js` · `semana.js` | planejam e geram a semana do social |
| `agenda.js` · `deriva.js` | os dois formatos fixos (carrossel do fim de semana; roteiro com mapa OSM) |
| `obra.js` · `rima.js` · `aproximacao.js` · `numero.js` · `entrada.js` · `salao.js` | formatos do repertório (vários em revisão) |
| `reel.js` | monta Reel a partir de filmagem própria (`--clipes=pasta`) |
| `engajar.js` | lista semanal de quem comentar à mão, com gancho |
| `leads-sites.js` | prospecção do serviço de sites |

## Automação (GitHub Actions)

| workflow | quando | o que |
|---|---|---|
| `diaria.yml` | todo dia 00:00 SP | destaque do dia, valida, publica |
| `instagram.yml` | quarta 08:00 SP | raspa Instagram das casas `soIG`, Claude escreve no `dados.js`, espelha imagem, valida |
| `radar.yml` | sábado | varredura de fontes e editais → issue |
| `imagens.yml` | sábado | garimpo de imagem de obra → issue |
| `vsp-semana.yml` | domingo / após garimpo | Claude aplica as issues no `dados.js` |
| `build.yml` | a cada push no `dados.js` + diário | acervo, páginas, sitemap |
| `espelhar-imagens.yml` · `check.yml` | a cada push | espelha imagem · valida |

Segredos: `CLAUDE_CODE_OAUTH_TOKEN`, `APIFY_TOKEN`.

## Formato do `dados.js`

```js
// venue: { name, addr, b (bairro), z (Oeste|Centro|Sul|Norte|Leste), tipo
//          (galeria|institucional|hibrido|feira), lat, lng, site?, ig?, soIG?, ing?, info }
// expo:  { t, v (name EXATO do venue), a? (artistas, ", "), ini, fim (YYYY-MM-DD | null),
//          d (fato conferível), img?, cred?, vista? }
// edital: { t, org, cat, prazo, quem, onde, taxa, d, link, fonte }
```
Status de cada mostra é calculado no navegador; encerradas somem sozinhas.
`~` no endereço = aproximado. `soIG: true` = agenda só no Instagram (entra na raspagem).

## Fontes

[Arte Que Acontece](https://artequeacontece.com.br) · [Guia das Artes](https://www.guiadasartes.com.br) ·
[ArteRef](https://arteref.com) · [Dasartes](https://dasartes.com.br) · [SP-Arte](https://www.sp-arte.com) ·
sites oficiais e Instagram das casas. Mapa da deriva: ruas © OpenStreetMap.
Confirme data e horário nos canais de cada espaço.
