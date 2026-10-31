# PENDÊNCIAS — estado do projeto em 13/10/2026

Retrato refeito em 13/10. Substitui o de 10/09 (91 casas, 55 em cartaz), que estava velho.

**Base agora (`dados.js`, `atualizado` 13/10/2026):** 125 casas (72 galerias · 41 institucionais · 11 híbridos · 1 feira;
17 só com Instagram) · 96 mostras, 84 em cartaz, **55 com imagem e 29 sem** · 61 casas sem nenhuma mostra na agenda ·
2 editais.

---

## 1 · As frentes

| frente | estado |
|---|---|
| **Site / PWA** | no ar, atualização por Actions (`diaria`, `build`, `espelhar-imagens`, `valida`) |
| **Social** | semana 12 a 18/10 gerada (obra qua, agenda qui, encerra sex, deriva sáb) em `SOCIAL/10/`; publicação manual |
| **Captação** | `EDITAIS/DOSSIE.md` travado nos `» PREENCHER` do Lucas |
| **Intel** | `intel/` arquitetado, nunca lançado (boletim pago R$47/mês) |

---

## 2 · Gargalos reais

### 2.1 · Imagem é o limite do social
`obra` e `encerra` falham quando nenhuma obra passa na régua: ≥1400 px de largura, crédito, não vista de sala.
29 mostras em cartaz estão sem imagem. Mudança de 13/10: imagem em paisagem passa da régua de proporção quando o
`dados.js` traz `foco` (0 a 100, posição horizontal do recorte 4:5); sem `foco` vale a trava de 1.6x.
**Garimpo: nunca aceitar sem olhar.** Em 13/10, de 15 propostas, 10 eram banner, retrato, miniatura ou a mesma foto
em duas mostras. O `descobrir-imagens.js` roda sozinho aos sábados e abre a issue `garimpo`.

### 2.2 · Cobertura
61 das 125 casas nunca tiveram mostra na agenda. Metade do mapa é fachada. As 17 casas `soIG` dependem da raspagem
semanal do Instagram (`instagram.js`, Apify).

### 2.3 · Casas não mapeadas (radar de 10/10, #14)
Sem entrada no diretório, então nenhuma mostra delas vira agenda: Claraboia, Galeria Mayer Mizrahi, WG Galeria,
Move Arte, Biblioteca Mário de Andrade, e fora de SP (Museu FAMA em Itu, Pinacoteca de Piracicaba). Decidir caso a caso.

### 2.4 · Mostra do radar ainda fora da base
*A Elegância do Olhar* (Sebastião Salgado e Mirella Ricciardi, Galeria Mario Cohen, 29/09 a 11/11): o título não
apareceu no site da galeria, conferir antes de incluir. Divergências de data de Sol Calero e Histórias
Latino-Americanas (MASP) também esperam conferência na fonte.

---

## 3 · Decisões que são suas

1. **Curadoria semanal de `rima` e `aproximacao`:** falham de propósito sem `rima.json`/`aproximacao.json` no dia.
2. **Boletim `intel/`:** pago ou gratuito, domínio de envio, e apertar o botão.
3. **`» PREENCHER` do `EDITAIS/DOSSIE.md`:** CNPJ e CNAE do MEI, visitas/mês, mini-CV.
4. **Instagram:** publicação sempre manual. Peças em `SOCIAL/MM/DD/`, legendas em `*-LEGENDA.md`.
5. **Voz:** `ESTILO.md` e `NEGOCIO/Copywriter.md` pedem texto sem gíria, sem emoji e sem "imperdível".

---

## 4 · Arrumação da pasta (em curso desde 13/10)

- [x] Notas de negócio (`MVP.md`, `Copywriter.md`, `Social Media.md`) movidas pra `NEGOCIO/` (fora do git; repo é público).
- [x] Este arquivo refeito.
- [x] Issues de radar e garimpo de 29/08 a 03/10 (#1 a #13) fechadas; ficam #14 e #15.
- [x] `IDEIAS.md`, `REFERENCIAS.md` e `DESIGN.md` em `docs/`. `OPERACAO.md`, `ESTILO.md`, `POSTS.md`, `COMOGERAR.md`
      e `README.md` ficam na raiz de propósito: as rotinas de nuvem (`.github/prompts/`) e o `check.js` apontam pra eles.
- [x] Triagem de resto (13/10): `estudio.html` removido; imagens da Carmela Gross e propostas antigas de `PENDENTE/` tiradas da pasta.
- [x] `.html` soltos: todos são páginas do site, exceto `limpar.html` (ferramenta interna, só o index aponta).
- [x] Rotina de domingo: a rotina de nuvem (pausada desde 14/09 em claude.ai/code/routines) já foi substituída pela
      Action `vsp-semana.yml`, que roda e está verde (última 11/10). Não religar a antiga.
- [x] A Action aplicava as issues mas não as fechava (`issues: read`). Em 13/10 ganhou `issues: write` e um passo 7 no prompt: fecha com comentário (aplicado / não confirmado / pendente). Conferir na próxima execução (domingo 18/10 ou após o garimpo de sábado).
- [ ] Scripts `.js` ficam na raiz: movê-los exige editar `require` e 5 workflows, só em sessão própria com teste.

## Domingo 21/10/2026 — sobras das issues radar/garimpo
- NÃO confirmado: "A Elegância do Olhar" (Galeria Mario Cohen) — site da casa não menciona; fica fora.
- Divergências descartadas: Histórias Latino-Americanas (MASP confirma fim 31/01/2027, base certa); Tudo aquilo que move (Frente confirma abertura 29/09, base certa); Cavalinhas e Falésias (Razuk confirma 12/09, base certa). Sol Calero: página do MASP não dá fim; base mantida (30/01/2027) — conferir com o Lucas.
- Imagens recusadas: Itaú (retrato de Anísio Teixeira), Museu da Imigração (cartaz Canva), Museu Afro Brasil (banner genérico), MIS (réguas/banners), Galeria Frente (thumb 180px), IMS (página não confere). Demais: não verificadas/sem confirmação.
- Casas não mapeadas (só relato): Claraboia, Rosewood SP, Museu FAMA (Itu), Pinacoteca Miguel Dutra (Piracicaba), Move Arte, Mayer Mizrahi, WG Galeria, Casa Yara DW, Alma da Rua, Pina Contemporânea, Mitre Galeria, Cemitério Parque das Cerejeiras, Gomide&Co (variação de nome?), CCSP (variação?).

## Domingo 31/10/2026 — sobras das issues radar #21/#19 e garimpo #22
- NÃO confirmado (fora do dados.js): A Elegância do Olhar (Mario Cohen), A vigília do fogo (Metrópole), Sara Ramo (Pinacoteca; home só cita o título, sem datas), Amarelinha / Hino às galáxias / Ainda quero mergulhar (Almeida & Dale: datas 07/11/26–09/01/27 confirmadas na home, mas sem espaço/curadoria/fato para o campo `d`).
- África – Ancestralidade e Sincretismos (Oscar Americano): curadoria Rafael Schunk e Renato Araújo; site diz "Até 01 de Março" sem ano, agregador diz 2027-03-23. Falta confirmar data.
- MASP Sol Calero (fim base 30/01/2027 vs agregador 30/05/2027): MASP não confirmado nesta rodada, base mantida.
- To Love (Galeria Vermelho, fim null): site deu 403; segue na base.
- Imagens do garimpo recusadas: Museu Afro Brasil (img_apoie_01.jpg, banner genérico repetido em 4 mostras), MIS (img_expo_linha-fotografia-tb.jpg genérica; réguas/banners de período eleitoral).
- Casas não mapeadas (só relato): Claraboia, Sardenberg, Rosewood SP, Museu FAMA, Pinacoteca Miguel Dutra, Move Arte, Mayer Mizrahi, WG Galeria, Casa Yara DW, Pina Contemporânea, Mitre Galeria, Cemitério Parque das Cerejeiras, AM Galeria SP, Gomide&Co (grafia), Karla Osorio, CCSP.
- Mitologias do Mistério (Casa de Cultura do Parque) também tem fim 25/10 passado e não foi removida (não estava no radar).
