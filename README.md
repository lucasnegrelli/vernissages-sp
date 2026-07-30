# 🥂 Vernissages SP

**Site ao vivo: https://lucasnegrelli.github.io/vernissages-sp/**

Mapa vivo da cena de arte de São Paulo: galerias, museus e centros culturais, com agenda de
vernissages e aberturas de exposições, roteiros de visita e compartilhamento da programação da semana.

Site estático + PWA (instalável no celular direto do navegador). Sem backend, sem build.

## Funcionalidades

- 🗺️ **Mapa interativo** (Leaflet + tiles CARTO dark @2x) com ~70 espaços: galerias comerciais,
  institucionais e feiras, coloridos por status — abertura próxima, em cartaz, últimos dias, feira.
- 🥂 **Vernissages desta semana**: banner com as aberturas dos próximos 7 dias.
- 📲 **Compartilhar agenda**: gera a lista da semana pronta pro WhatsApp (ou copia pra qualquer lugar).
- 🎨 **Página de artista**: clique no nome de qualquer artista para ver todas as mostras dele na
  agenda + atalhos (Google, obras, Instagram, Wikipédia).
- 🔎 **Busca e filtros**: texto livre (galeria, artista, endereço, bairro), status, zona, bairro,
  tipo de espaço, galeria específica e artista.
- 🧭 **Rotas**: botão "Rota" (Google Maps) em cada card e um **montador de roteiro** multi-paradas
  para circuitos de vernissage.
- 📇 **Diretório** ordenável com endereço, bairro, zona, site oficial e ações.
- 📊 Distribuição de galerias por bairro (estudo FGV/ArteRef — 67 galerias no mercado primário).

## Estrutura

| arquivo | função |
|---|---|
| `index.html` | interface completa (mapa, filtros, roteiros, modal de artista) |
| `dados.js` | **base de dados** — venues, exposições, artistas, sites |
| `manifest.webmanifest` + `sw.js` + `icon-*.png` | PWA: instalação e cache offline (network-first) |

### Formato do `dados.js`

```js
window.DATA = { atualizado: "dd/mm/aaaa", venues: [...], expos: [...], bairros: [...] }
// venue: { name, addr, b (bairro), z (Oeste|Centro|Sul), tipo (galeria|institucional|feira),
//          lat, lng, site?, info }
// expo:  { t (título), v (name EXATO do venue), a? (artistas, separados por ", "),
//          ini, fim (YYYY-MM-DD | null), d (descrição curta) }
```

O status de cada mostra (abertura próxima / em cartaz / últimos dias) é calculado na hora pelo
navegador; mostras encerradas somem sozinhas. Endereços com `~` ou "(a confirmar)" são aproximados.

## Atualização automática

Uma rotina diária (agente Claude, ~9h) lê o `dados.js` publicado, varre agregadores
(Arte Que Acontece, Ocula, Guia das Artes) e os sites oficiais das galerias em rodízio,
adiciona as novas aberturas, remove as encerradas e faz commit direto na `main` —
o GitHub Pages republica em ~1 minuto. Sem novidade, sem commit.

## Publicação

Hospedado no **GitHub Pages** (Settings → Pages → branch `main`, root). Qualquer push na `main`
atualiza o site. Domínio próprio: Settings → Pages → Custom domain.

## Roadmap para as lojas de app

1. **Google Play**: empacotar a PWA como TWA com [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (conta US$ 25, única).
2. **App Store**: empacotar com [Capacitor](https://capacitorjs.com/) e somar recursos nativos
   (push de vernissages, "perto de mim", favoritos) — conta US$ 99/ano.

## Fontes

[Arte Que Acontece](https://artequeacontece.com.br) · [Ocula](https://ocula.com) ·
[ArteRef/FGV](https://arteref.com/galerias/o-mapa-de-galerias-em-sao-paulo/) ·
[Guia das Artes](https://www.guiadasartes.com.br) · [São Paulo Secreto](https://saopaulosecreto.com) ·
[SP-Arte](https://www.sp-arte.com) · sites oficiais das galerias.

Confirme data e horário de vernissage nos canais de cada espaço — nem toda abertura tem evento público.
