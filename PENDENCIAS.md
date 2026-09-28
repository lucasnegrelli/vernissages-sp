# PENDÊNCIAS — estado do projeto em 10/09/2026

Retrato do projeto depois da limpeza de 10/09 (radar de editais, formatos
mortos apagados, verificação de duplicata no `semana.js`). Substitui o
levantamento de 24/08, que era anterior à virada da linha editorial de 01/09.

**Base agora:** 91 casas (56 galerias · 24 instituições · 10 híbridos · 1 feira)
· 60 mostras na agenda, 55 em cartaz · 42 com imagem de obra · acervo com 110
mostras · 66 artistas com página · 2 editais · `atualizado` 10/09.

---

## 1 · As três frentes

| frente | o que é | estado |
|---|---|---|
| **Site / PWA** | `index.html` + `dados.js`, GitHub Pages, atualização diária por Actions | no ar, estável |
| **Social** | pipeline `REPERTORIO → planejar → semana` → PNG 1080×1350, nunca posta sozinho | no ar; `rima`/`aproximação` dependem de curadoria toda semana |
| **Captação** | `EDITAIS/DOSSIE.md` — o Vernissages se inscrevendo em editais de fomento | rascunho, travado nos `» PREENCHER` do Lucas |
| **Intel** | `intel/` — boletim pago R$47/mês (Next + Stripe + Supabase + Resend) | arquitetado, **nunca lançado** |

---

## 2 · Decisões que são suas

### 2.1 · A curadoria semanal de `rima` e `aproximação`
Falham de propósito sem config. Toda semana precisa de:
`SOCIAL/MM/DD/rima.json` (duas chaves de mostra, tese, argumento) e
`SOCIAL/MM/DD/aproximacao.json` (chave da obra, zooms, leitura). Sem isso as
duas peças abortam — e isso é o comportamento certo.

### 2.2 · O boletim `intel/`
Está pronto e parado desde 09/09. Falta: decidir se é pago (R$47/mês, receita)
ou gratuito (formação de público, cabe em edital), verificar o domínio de
envio, e apertar o botão. É a coisa mais próxima de receita que o projeto tem.

### 2.3 · Os `» PREENCHER` do `EDITAIS/DOSSIE.md`
CNPJ e CNAE do MEI, número de visitas/mês (está no rodapé do site), mini-CV.
Sem isso nenhuma inscrição em edital sai.

### 2.4 · Publicar no Instagram
A publicação é sempre manual. As peças da semana ficam em `SOCIAL/MM/DD/` com
`LEGENDAS-SEMANA-*.md` prontas.

---

## 3 · Cobertura — o problema estrutural

**35 dos 91 venues nunca tiveram uma linha de agenda. 10 estão frios** (sem
cobertura há muito). Metade do mapa é fachada: aparece no diretório e no mapa,
nunca produziu uma mostra.

É aritmético, não de esforço: com teto de ~10 sites por domingo, cada casa é
visitada a cada nove semanas, e mostra de galeria dura seis a oito. **O rodízio
é mais lento que o ciclo das exposições.** Ou o mapa encolhe, ou as casas
passam a mandar a abertura (o formulário existe, falta divulgar), ou entra mais
fonte automática.

Ferramentas que já atacam isso e cospem relatório em `PENDENTE/` (nenhuma
escreve no `dados.js`):
- `radar.js` — quem nunca foi coberto, por onde a varredura deve começar.
- `radar-fontes.js` — varre o Arte Que Acontece, aponta mostra nova e
  divergência de data.
- `radar-editais.js` — **novo, 10/09** — varre os feeds de edital/chamada/
  residência/prêmio (Dasartes, PIPA, seLecT, ArteBrasileiros). Roda no
  `radar.yml` de sábado junto com o `radar-fontes`.
- `captar.js` — transcreve legenda de Instagram para entrada do `dados.js`.

### Editais — o buraco mais óbvio
A página `editais.html` tinha **2 itens** porque o `const EDITAIS` do `dados.js`
é lista manual e nada a alimentava. O `radar-editais.js` resolve a coleta; falta
a rotina de domingo passar a olhar o relatório e o Lucas confirmar prazo na
fonte antes de cada linha entrar no `dados.js`.

---

## 4 · Dívida técnica

### 4.1 · 13 mostras em cartaz sem imagem de obra
Ficam fora de `obra`, `encerra`, `estreia`, `aproximacao` e das paradas de
`deriva`. A varredura de imagem (`descobrir-imagens.js` + `espelhar.js`) puxa,
mas depende de a casa divulgar trabalho e não só vista de sala.

### 4.2 · 2 mostras em cartaz sem data de encerramento
Ficam "em cartaz" para sempre — a limpeza da diária só olha `fim`. O
`radar-fontes.js` audita e lista.

### 4.3 · `POSTADAS.json` incompleto
A memória de duplicata foi semeada à mão das legendas de setembro e tem buracos
em peças antigas de vários slides (deriva, salão). Completa sozinha a cada
semana gerada.

### 4.4 · `espelhar.js` — comentário desatualizado
O cabeçalho fala do canvas do `post.html` (apagado). A função continua correta
(baixa a imagem do CDN do Instagram antes de a URL expirar); só a justificativa
no topo envelheceu.

---

## 5 · O que foi apagado em 10/09

`post.html` e `EDITORIAL.md` (aposentados em 24/08, substituídos pelos
geradores e pelo `REPERTORIO.json`) · `role.js` e `duracao.js` + seus modelos
(aposentados em 01/09) · `_sim.js`, `_alvos.js` (scratch) · as 5 fontes do
rodízio antigo em `fontes/`, sobrou a Switzer.

---

## 6 · Operação atual

| tarefa | quando | o que faz |
|---|---|---|
| `diaria.yml` (`vsp-site`) | todo dia 00:00 | sincroniza, destaque, valida, publica |
| `radar.yml` | sábado 08:12 UTC | `radar-fontes` + `radar-editais` → issue |
| `imagens.yml` | conforme agenda | varredura de imagens de obra |
| `build.yml` | on push | regenera acervo, páginas de artista/mostra, sitemap |
| `vsp-semana` | domingo (rotina na nuvem) | varredura + `node semana.js` + arquivo |

Runbook em `OPERACAO.md`. Geração de social em `COMOGERAR.md`.

---

## Plano combinado em 26/09/2026 (em ordem)

1. **Medição de verdade.** O contador do rodapé (Abacus) funciona, mas só conta
   aparelho único acumulado: 332 em 26/09. Sem visitas por dia, origem nem
   página. → Lucas cria conta no **GoatCounter** (código `vernissagessp`);
   Claude instala o script no site. Sem cookie, sem banner.
2. **Página "fim de semana"** (`/fim-de-semana`): a agenda do post de quinta,
   ao vivo, com mapa — vira o link da bio e mira a busca "exposições em SP
   este fim de semana".
3. **Temporadas** (ver `DESIGN.md`): estrutura de um arquivo de tokens por mês,
   lido pelo site e pelos geradores. **Outubro = Concreto** (evolução do que já
   existe), **novembro = Lambe** (mais ousado, quando o conceito já estiver
   apresentado).
4. **"Monta meu sábado"**: a pessoa escolhe bairro e tempo, o site gera o
   roteiro com mapa (o motor da deriva virando ferramenta). Depois: "perto de
   mim", salvar mostra + lembrete, mapa como home (MapLibre).
5. **Formatos novos do social** (ver `IDEIAS.md`): começar por "De graça, vale
   milhões" e "A história por trás". Vetados: número, entrada, zoom sem revelação.
6. **Reconstruir rima e aproximação** com profundidade (várias imagens, revelação).

Referências e banco de ideias: `REFERENCIAS.md`, `IDEIAS.md`, `DESIGN.md`.

- **4 · MVP feito e testado no navegador:** `/monta-meu-sabado.html`. A pessoa
  escolhe um bairro (agrupado como no rodapé — "Jardins" é o circuito, não o
  bairro do IBGE) e quanto tempo tem (2, 4 ou 6 paradas); a página monta o
  roteiro a pé na ordem mais curta (mesmo motor do `deriva.js`: haversine +
  melhor ordem por força bruta + `apertar` quando sobram candidatos), desenha
  mapa Leaflet com a rota e lista as paradas com link pra página da mostra e
  botão "mandar no WhatsApp". Tudo roda no navegador a partir do `dados.js` já
  carregado — não depende de mais nada gerado, nunca fica velho. Testado local
  com servidor HTTP: bairro com 12 candidatos reduzido a 6 em 17ms, troca de
  bairro sem duplicar mapa, link de mostra bate com o arquivo real em `m/`.
  Linkado no menu, no rodapé e no sitemap. Ainda faltam os incrementos que o
  plano deixou como "depois": "perto de mim" (geolocalização), salvar mostra
  + lembrete, mapa como home (MapLibre).

### Andamento em 28/09/2026
- **2 · feito e testado:** `gerar.js` escreve `fim-de-semana.html` todo dia
  (abre na semana · últimos dias · também em cartaz por zona, mapa Leaflet,
  horário de sáb/dom quando a base diz, JSON-LD ItemList). Link no menu das
  páginas, no rodapé do `index.html` e no sitemap. `node gerar.js` rodado
  localmente: 157 mostras, 387 URLs no sitemap, `fim-de-semana.html` gerado
  sem erro. Trocar o link da bio para `vernissagessp.com.br/fim-de-semana.html`
  é com o Lucas.
- **3 · estrutura feita, propagação para os geradores concluída:**
  `temporadas/2026-10.json` (Concreto) e `2026-11.json` (Lambe, rascunho) +
  `temporada.js` (lê o mês; `--css` escreve `temporada.css`, rodando no
  `build.yml` antes do `gerar.js`). Site: `temporada.css` carregado por último
  no `index.html` e nas páginas do `gerar.js`. Social: `PALETAS.temporada` no
  `rima.js`; `agenda.js`, `obra.js`, `salao.js` e `deriva.js` agora caem em
  `PALETAS.temporada` quando a peça não tem paleta explícita no config (testado
  simulando `--date=2026-10-05`: paleta Concreto entra corretamente). Fora
  disso, de propósito: `aproximacao.js` (será reconstruído, item 6) e
  `numero.js`/`entrada.js` (formatos vetados).
- **1 · feito:** conta criada (código real é `vernissages`, não `vernissagessp` como
  estava anotado — a URL do painel é `vernissages.goatcounter.com`). Script
  instalado no `index.html` e no template do `gerar.js` (`pagina()`), então
  toda página gerada — mostra, artista, acervo, artistas, editais, fim de
  semana — já mede. Configuração padrão do GoatCounter já é sem cookie e sem
  necessidade de banner (sessão por hash rotativo, não por cookie); não mexi
  em mais nada no painel. Falta só o Lucas conferir o dashboard depois do
  próximo deploy pra ver as primeiras visitas chegando.
