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
- [ ] Issues de radar e garimpo de 29/08 a 03/10 (#1 a #13) superadas por #14 e #15; fechar.
- [ ] `.md` da raiz para `docs/`, com links do README atualizados (conferir antes quem lê `ESTILO.md`).
- [ ] Triagem de resto: `PENDENTE/`, `img/constelacao-carmela-gross-*` (sem referência na base), `desktop.ini`.
- [ ] Descobrir quais dos `.html` soltos estão no ar (`estudio`, `limpar`, `monta-meu-sabado`, `fim-de-semana`).
- [ ] Scripts `.js` ficam na raiz: movê-los exige editar `require` e 5 workflows, só em sessão própria com teste.
