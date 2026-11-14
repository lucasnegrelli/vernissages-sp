# Linha editorial v2 (14/11/2026)

Substitui a versão de 09/11. Base: o diagnóstico de `CRESCIMENTO.md` (115 seguidores, meta de 1.000 em dezembro, orgânico primeiro) e o benchmark de `BENCHMARK.md`.

## 1. Tese

O Vernissages SP é a **inteligência da arte de São Paulo**: a única conta que lê a cidade inteira todo dia e devolve isso como achado, não como agenda. Galerias postam a própria mostra. A gente sabe o que a cidade faz.

Três promessas, em ordem:
1. **Você nunca perde nada** (agenda, último dia, abertura).
2. **Você entende a cidade** (dados, bairros, quem concentra o quê).
3. **Você entra no circuito** (editais, residências, como funciona).

Voz: seca, precisa, com ponto de vista. Dado e fato em frase curta. Nunca adjetivo de folheto, nunca exclamação, nunca emoji, nunca travessão.

## 2. Marca

- **Assinatura visual:** o logo VERNISSAGES SP com a textura da obra do dia nas letras, em todas as peças. É o que o site já tem e nenhuma outra página de arte tem.
- **Imagem:** a obra inteira, sem moldura e sem texto por cima. Quando não há foto, o dado vira a peça (tipografia grande, papel e tinta).
- **Tipografia:** Switzer pesada em caixa alta como grito curto; Instrument Serif só como apoio.
- **Cor:** papel `#F2EFE9`, tinta `#0E0E0E`, um acento vindo da obra.
- **Nome de série em toda peça:** a pessoa aprende o que esperar.

## 3. As séries (cada uma tem nome, dia e regra)

| série | o que é | formato | dia | fonte do conteúdo |
|---|---|---|---|---|
| **RAIO X** | o retrato da cidade em dados: concentração por bairro, zonas, quem fecha | carrossel de 5 | quinzenal, sábado | base (`raio-x.js`), sem IA |
| **ESTA SEMANA** | o que abre, o que fecha, o que vale a viagem | carrossel agenda (collab) | quinta | base |
| **FECHA** | últimos dias, uma exposição por vez | Reel obra em tela cheia | terça | base + foto |
| **ABRE** | estreias da semana | Reel | sexta | base + foto |
| **EDITAL** | chamadas abertas, taxa, prazo, o que perguntar | carrossel | segunda | radar de editais |
| **A BUSCA** | mostra de nome que as pessoas já procuram (Kim Gordon foi o primeiro caso) | carrossel de 4 + Reel | quando houver, no dia da abertura | base + imagem oficial da casa |
| **ROTA** | uma caminhada de 3 casas no mesmo bairro | Reel + carrossel | domingo | base + mapa |
| **DENTRO DA OBRA** | aproximações reais de uma obra (`detalhes.js`) | carrossel | quando houver foto de alta resolução | foto |

Regra de ouro: toda peça precisa responder **"por que alguém mandaria isto a um amigo?"** antes de sair. Se a resposta é "porque é bonito", é peça de apoio, não de série.

## 4. Os dez ganchos (primeira linha e capa)

1. Concentração: "7 em cada 10 exposições de SP estão em 6 bairros."
2. Contagem de risco: "10 exposições fecham em 7 dias."
3. Ausência: "Nenhuma exposição na Zona Leste na nossa base. Falta um espaço? Manda o nome."
4. Nome conhecido: "Kim Gordon abre hoje em São Paulo."
5. Pergunta de edital: "30 de 42 residências cobram taxa. O que perguntar antes de pagar."
6. Rota: "3 exposições a pé em Higienópolis em uma tarde."
7. Última chance com prazo: "Hoje é o último dia de ..."
8. Primeira vez: "A primeira individual de ... no Brasil abriu esta semana."
9. Grátis: "As exposições sem ingresso desta semana, por bairro."
10. Dado da casa: "A galeria que mais abre exposição em SP."

Toda capa tem uma frase completa, não uma etiqueta. Todo Reel tem gancho nos 2 primeiros segundos: a obra já na tela, sem logo e sem cartela antes.

## 5. Distribuição (o que faz acontecer)

- **Collab** com a casa em toda peça de mostra única. Já automático nas legendas por regra; a casa aceita no app.
- **Notícia de nome grande** no dia: nome na capa e na primeira linha (a busca do Instagram é por palavra).
- **Perguntar na legenda** (comentário gera conversa): "Falta um espaço perto de você? Manda o nome."
- **Carrossel de apresentação fixado** no topo do perfil (`apresentacao.js`).
- **Reels de teste** para não seguidores quando a conta chegar a 200 seguidores.
- **Mesmo horário, mesmos dias:** consistência vale mais que volume.

## 6. Calendário semanal

| dia | feed | Reel | story |
|---|---|---|---|
| segunda | EDITAL | | stories do dia |
| terça | | FECHA | stories do dia |
| quarta | A BUSCA ou DENTRO DA OBRA | | stories do dia |
| quinta | ESTA SEMANA | | stories do dia |
| sexta | | ABRE | stories do dia |
| sábado | RAIO X (quinzenal) ou A BUSCA | | stories do dia |
| domingo | | ROTA | stories do dia |

## 7. Medir

- Por peça: **envios e salvamentos divididos pelo alcance** (precisa da permissão `instagram_business_manage_insights`). Curtida sozinha engana.
- Por semana: seguidores novos (ritmo atual 1,3 por dia) e visitas ao perfil.
- Teste de 30 dias (15/11 a 14/12): comparar RAIO X, EDITAL e A BUSCA entre si. A série que mais gera envio recebe mais peso; a que menos gera, é revista.

## 8. Roadmap de 90 dias

1. **Novembro:** RAIO X no ar, apresentação fixada, Collab ligado, Reel com obra em tela cheia.
2. **Dezembro:** radar de nomes grandes, Reel ROTA e FECHA refeitos, primeiros testes de gancho em Reels de teste.
3. **Janeiro:** abertura do calendário de exposições do ano (o que abre em cada mês), série de bairros, parcerias com 3 casas para conteúdo conjunto.
4. **Depois:** anúncio de seguidores (decisão adiada pelo Lucas), voz ou rosto do Lucas em Reels, assinatura de espaços.

## 9. O que NÃO fazer

- Cartão de papel com título e itálico, o molde antigo.
- Texto sobre a obra, moldura fixa, número gigante de capa, zoom de mentira.
- Repetir a mesma imagem num carrossel.
- Opinião do Lucas escrita por mim sem ele aprovar (séries de "vale ir" ficam para quando ele topar a voz).
- Misturar galerias num carrossel de mostra única.
