# Benchmark (09/11/2026)

Feito com busca e leitura de páginas pela ferramenta de texto: dá para ver estrutura, rótulos e dados, **não** a tipografia, a cor nem o ritmo visual. A parte visual precisa de olho humano (lista de contas e sites para abrir no fim).

## O que encontrei, e o que mudou por causa disso

| referência | o que faz | o que levamos |
|---|---|---|
| **Res Artis** (open calls) | lista por prazo, mas com rótulos contraditórios ("No deadline!" com prazo), título com data e local misturados, sem campo estruturado, sem filtro útil | página de Editais com campos separados (tipo, onde, prazo, custo), custo do artista à vista, e a seção "quem paga" |
| **EntryThingy, Artwork Archive** | taxa, local e prazo à vista; sincronizam prazos com agenda; resumos mensais por prazo | botão **Lembrete** em cada edital (arquivo de calendário com alarme 3 dias antes) |
| **Open Calls Index** | newsletter semanal paga de chamadas | o card semanal de editais vira o produto de segunda; boletim fica como ideia (intel/) |
| **e-flux** | coluna única, imagem grande, instituição em corpo pequeno, título da mostra em itálico, hierarquia modesta | confirma a nossa escolha: artista em itálico serifado, casa em caixa-alta pequena |
| **Contemporary Art Daily** | feed seco e frequente: data como cabeçalho, imagem, artista, título, casa, cidade, período; quase sem texto editorial | já é a nossa regra (fato, sem adjetivo); a data como cabeçalho é o que o número gigante faz |
| **Gallery Weekend Berlin** | cartão quadrado, nome da galeria em caixa-alta, título, período no formato `03.11.–19.12.2026`; "save the date" como faixa; Galerias e Mapa como entradas separadas | período em dd.mm; faixa de "marque a data" para eventos grandes (SP-Arte, Bienal); mapa como seção com nome próprio |
| **Guia da Semana, Elle, Visite São Paulo, Bravo** (concorrência BR) | listas mensais "N exposições para ver", agenda por dia, newsletter semanal; local, horário e gratuidade em cada item | nenhum deles tem mapa, percurso a pé, editais nem formato salvável; nosso espaço está aí |
| **The Art Newspaper sobre museus no Instagram** | MoMA foi de 114 para 172 Reels em um ano; mais Reel não garantiu mais seguidor; o que mais alcança é evento e pessoa | Reel é a porta de alcance, mas não basta: o carrossel salvável e o site fazem a retenção |
| **Guias de carrossel 2026** | carrossel tem o maior engajamento por formato e mais salvamentos que imagem única; "lista de recursos" é isca de salvar; 3:4 ocupa mais tela que 4:5 | série de listas salváveis ("para quem faz", "de graça"); testar 1080x1440 |

## Decisões que saíram daqui

1. **Editais, semana a semana** no lugar do histograma de quadrados (legível, clicável, mobile empilha), mais **Lembrete** por edital.
2. **Aproximação real** de obra (recorte da resolução original nas regiões de mais detalhe) como formato de carrossel: `detalhes.js`. Funciona bem em obra de textura (a escultura da Jessica Costa); em obra gráfica sobre fundo branco rende menos.
3. **Margem de 70 px nas laterais** de toda peça: a grade do perfil recorta 4:5 em 3:4 e come cerca de 6% dos lados.
4. **Ideia a testar**: feed em 1080x1440 (3:4), que ocupa mais tela. Exige refazer a margem vertical de todos os geradores; só vale se o alcance justificar.

## Para o Lucas abrir e olhar (o que eu não consigo ver daqui)

Perfis de Instagram para ver ritmo de grade e capa de carrossel: Contemporary Art Daily, e-flux, Artforum, Frieze, Cultured, Hyperallergic, Pinacoteca, MASP, Instituto Moreira Salles, Bienal, SP-Arte, Galeria Vermelho, Mendes Wood DM. Sites para ver tipografia e mapa: contemporaryartdaily.com, e-flux.com/announcements, galleryweekendberlin.com, are.na, rhizome.org, resartis.org. O que anotar: como a capa de cada carrossel faz a pessoa arrastar, quantos slides têm, onde o texto fica e como a grade do perfil alterna cor.

## Visto no navegador (09/11/2026, perfis abertos de verdade)

- **@masp**: a grade alterna cartão de cor com cartaz tipográfico e foto de gente olhando arte (de costas). Uma série com molde fixo e a cor mudando ("Vem pro Vão" em rosa, lilás, off-white) é reconhecível a distância. Capa de exposição com identidade própria por mostra (padrão colorido, tipografia da mostra) e rodapé fixo: marca, "Até 31.1.2027", andar.
- **@imoreirasalles**: cada exposição ganha uma capa feita da própria obra, tratada como material gráfico (cinza texturizado, duotone, meio-tom) com título grande por cima. Moldura fixa em volta: categoria no canto de cima ("exposição", "cinema"), data embaixo à direita ("até 22/11", "últimos dias"), marca e endereço embaixo à esquerda. Variedade total dentro de um sistema inconfundível. A capa da retrospectiva do Fernando Lemos é a imagem dele em cinza com a frase do título.
- **@artforum**: grade editorial de foto, retrato e capa; título em caixa-alta pesada no canto da foto; **destaques fixos por série** (Art Week NYC, Reviews, From the Archive, Art Guide) funcionando como menu do perfil.
- (e-flux e Gallery Weekend Berlin bloquearam a captura de tela; só texto.)

### O que muda por causa disso
1. **Capa em cartão de cor chapada** (cor da obra) com título tipográfico, sem a obra por baixo. A ideia do IMS de tratar a imagem como gráfico foi vetada pelo Lucas: **nunca texto sobre a obra, nem tratada**. A obra aparece limpa no slide 2.
2. **Moldura fixa** em toda peça: marca embaixo à esquerda, data embaixo à direita, categoria em cima. Hoje cada gerador posiciona do seu jeito.
3. **Série com molde e cor variável**, como o "Vem pro Vão": capas de série em cartão de cor chapada (a cor da obra do dia), para a grade alternar foto e cartão.
4. **Destaques do perfil** por série: Editais, Mapa, A fundo, Abre esta semana, A pé por.
5. **Gente na imagem**: MASP e IMS misturam foto de visitante. Não temos esse material; vale pedir às casas ou fotografar nas aberturas.
