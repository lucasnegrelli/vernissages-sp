# Registro de 03 e 04/11/2026: redesign do site e radar de editais

Tudo abaixo está no ar. Este arquivo existe para quem reabrir o projeto saber o que mudou, onde mora cada coisa e o que ficou pendente.

## O que mudou

**Home (`index.html`)**
- Visual novo: papel e tinta, Switzer + Instrument Serif, tipografia pesada em caixa-alta.
- Ordem: logo e menu, destaque do dia, "Abre esta semana" (trilho fixado), mapa com filtros, agenda, "A cidade agora", espaços, imersivas, chamada "Divulgue", rodapé.
- Destaque do dia mantém as 3 travas de rodízio de `destaque.js` e cabe exatamente na altura da janela.
- Cor da obra do dia vira o acento do site e o logo; o logo é a obra redesenhada em meio-tom. Obra sem cor usa cinza quente (`#8a857b`); o mapa mantém terracota.
- Imagens são recortadas na borda real por código (sem moldura branca). Na agenda a imagem aparece inteira e o cartão se move.
- Mapa (MapLibre): ruas escuras, pontos com brilho e sem contorno, anéis para "últimos dias" e para aberturas.
- Filtros: situação, zona, bairro, tipo, grátis, perto de mim, favoritos e busca.
- Corrigido: "Abre esta semana" perdia a abertura de hoje depois do meio-dia.
- Removidos: roteiro multi-paradas, hero 3D, Leaflet na home.

**Páginas internas** (geradas por `gerar.js`, com a casca em `site.js`)
- Acervo (filtros por situação, ano, espaço), Artistas (A–Z, mais mostras), Editais, Fim de semana, Monta seu sábado, página de mostra (`m/`) e de artista (`a/`).
- Leem a cor do dia que a home grava em `localStorage.vspAcento`.
- O acervo passou a guardar `img` por mostra.

**Editais**
- `editais.html` tem **Confirmados** (`const EDITAIS` em `dados.js`, manual) e **Radar** (automático, com aviso de conferir na fonte).
- Radar alimentado por `radar-editais.js` (feeds + busca WordPress de 6 sites), `radar-sites.js` (páginas oficiais: Pivô, CAPACETE, Tomie Ohtake, FAAP MAB, Prefeitura SP, Funarte), `radar-ig.js` (Instagram via Apify, `radar-ig.yml` terça e sexta) e `radar-apoio.js` (apoio.art).
- Listas editáveis: `radar/fontes-sites.json`, `radar/perfis-ig.json`. Dados gerados: `radar/editais*.json`.
- Fontes fixas no rodapé de todas as páginas e da home.
- Zealous e Artenda **não são raspadas** (robots.txt proíbe / prévia de produto pago); entram como links em "Outras plataformas para consultar".

**Infra**
- `sincronizar.js` (puxa antes de editar; `--enviar` valida e empurra) e hook de início de sessão em `.claude/settings.json`.
- `build.yml` roda os radares antes de gerar as páginas; novos gatilhos por arquivo.

## Pendências

- Desempenho real em celular fraco não foi medido.
- Recorte de borda pode cortar demais obra cuja margem é parte da obra.
- Instagram de editais: só 2 rodadas manuais testadas; a primeira agendada ainda não rodou. Procurar agregadores brasileiros mais ativos (`@editais_culturais` posta ~5 vezes por mês).
- `git stash list` guarda dois trabalhos antigos (WIP de temporada e um autostash de 02/11), nunca aplicados nem descartados.
- Conferir Fim de semana e Monta seu sábado em celular.
- Título da mostra da Auroras ("Jacqueline Humphries e JH Studio") não confirmado como oficial.

## Cuidados ao mexer

- Não commitar à mão as páginas geradas (`m/`, `a/`, `arquivo.html`, `artistas.html`, `editais.html`, `fim-de-semana.html`, `monta-meu-sabado.html`, `acervo.json`, `sitemap.xml`): o build regenera.
- `EDITAIS/` está no `.gitignore` (dossiê privado); dados públicos do radar moram em `radar/`.
- Apify custa ~US$ 0,35 por rodada do `radar-ig.js`.
