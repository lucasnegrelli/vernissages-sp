# 🥂 Vernissages SP

**Site ao vivo: https://vernissagessp.com.br**

Guia diário da cena de arte contemporânea de São Paulo: um mapa vivo de 91
galerias, museus e centros culturais, com a agenda de todas as aberturas de
exposição da cidade, roteiros de visita, páginas por artista, acervo histórico e
uma página de editais e chamadas para artistas.

Site estático + PWA (instalável no celular direto do navegador). Sem backend,
sem build. Atualização diária por GitHub Actions.

---

## As três frentes

### 1. Site / PWA
`index.html` (arquivo único) + `dados.js` (a base). GitHub Pages.

- 🗺️ **Mapa interativo** (Leaflet) com 91 espaços, coloridos por status.
- 🥂 **Vernissages desta semana** — banner das aberturas dos próximos 7 dias.
- 📊 **O panorama** — timeline ao vivo de todas as mostras em cartaz, do dia que
  abriram ao dia que fecham.
- 🎨 **Página de artista** e **página de exposição** — geradas e indexadas
  (133 + 110 páginas).
- 🗄️ **Acervo** — as 110 mostras que já passaram, com ficha completa.
- 📋 **Editais** — chamadas, residências e prêmios abertos para artistas.
- 🧭 **Montador de roteiro** multiparadas · **compartilhar a agenda** pro WhatsApp.
- 📲 PWA instalável, funciona offline.

### 2. Social
Pipeline que gera slides PNG 1080×1350 para o Instagram. **Nunca posta sozinho.**

```
REPERTORIO.json  (banco de ideias)
   → planejar.js   escreve o PLANO.json (respeita descanso e paleta)
   → semana.js     confere USADAS/POSTADAS contra repetição, chama os geradores
   → SOCIAL/MM/DD/ PNGs + LEGENDAS-SEMANA-*.md   (gitignored)
```

Formatos: `obra` / `encerra` / `estreia` (uma reprodução, tela cheia, sem marca),
`numero` (um dado calculado da base), `rima` e `aproximacao` (curadoria humana),
`deriva` (percurso a pé), `entrada`, `salao`. Sistema visual em `POSTS.md`, voz
em `ESTILO.md`, passo a passo em `COMOGERAR.md`.

### 3. Intel *(não lançado)*
`intel/` — boletim semanal pago (R$ 47/mês). Next.js + Stripe + Supabase +
Resend, para deploy na Vercel. App isolado, README próprio em `intel/`.

---

## Formato do `dados.js`

```js
window.DATA = {
  atualizado: "dd/mm/aaaa",
  venues: [...], expos: [...], editais: [...],
  foco, destaques, bairros, imersivas
}
// venue: { name, addr, b (bairro), z (Oeste|Centro|Sul|Norte|Leste),
//          tipo (galeria|institucional|hibrido|feira), lat, lng, site?, ig?, info }
// expo:  { t (título), v (name EXATO do venue), a? (artistas, ", "-separados),
//          ini, fim (YYYY-MM-DD | null), d (descrição), img?, cred?, vista? }
// edital: { t, org, cat, prazo (YYYY-MM-DD | null), quem, onde, taxa, d, link, fonte }
```

O status de cada mostra é calculado na hora pelo navegador; mostras encerradas
somem sozinhas. Endereços com `~` são aproximados.

---

## Ferramentas

| script | o que faz | saída |
|---|---|---|
| `destaque.js` | escolhe a mostra em foco do dia | `dados.js` (via Actions) |
| `gerar.js` | páginas de artista/mostra + `arquivo.html` + `artistas.html` + `editais.html` + sitemap | arquivos no repo |
| `check.js` | valida a base (datas, crédito, dimensão de imagem, editais vencidos) | relatório |
| `radar.js` | quem do mapa nunca foi coberto, por onde começar a varredura | `PENDENTE/RADAR.md` |
| `radar-fontes.js` | varre o Arte Que Acontece: mostra nova, divergência de data | `PENDENTE/RADAR-FONTES.md` |
| `radar-editais.js` | varre feeds de edital/chamada/residência/prêmio | `PENDENTE/EDITAIS.md` |
| `captar.js` | transcreve legenda de Instagram → entrada do `dados.js` | stdout |
| `descobrir-imagens.js` · `espelhar.js` · `medir-imagem.js` | acham, baixam e medem imagem de obra | `PENDENTE/`, `img/` |
| `planejar.js` · `semana.js` + `obra.js` `numero.js` `rima.js` `aproximacao.js` `deriva.js` `entrada.js` `salao.js` | o pipeline de social | `SOCIAL/` |

Nenhum `radar-*` nem `captar` escreve no `dados.js` — todos cospem relatório
para conferência na fonte primária.

## Automação (GitHub Actions)

| workflow | quando | o que |
|---|---|---|
| `diaria.yml` | todo dia 00:00 UTC | sincroniza, destaque, valida, publica |
| `radar.yml` | sábado 08:12 UTC | `radar-fontes` + `radar-editais` → issue |
| `imagens.yml` | conforme agenda | varredura de imagens de obra → issue |
| `build.yml` | on push | regenera acervo, páginas, sitemap |
| `espelhar-imagens.yml` · `check.yml` | on push / manual | espelha imagens · roda os testes |

## Publicação

**GitHub Pages** (branch `main`, root), domínio próprio via `CNAME`. Qualquer
push na `main` republica em ~1 minuto.

## Fontes

[Arte Que Acontece](https://artequeacontece.com.br) ·
[Guia das Artes](https://www.guiadasartes.com.br) ·
[ArteRef/FGV](https://arteref.com/galerias/o-mapa-de-galerias-em-sao-paulo/) ·
[Dasartes](https://dasartes.com.br) · [Prêmio PIPA](https://www.premiopipa.com) ·
[SP-Arte](https://www.sp-arte.com) · sites oficiais e Instagram das casas.

Confirme data e horário nos canais de cada espaço — nem toda abertura tem evento
público.
