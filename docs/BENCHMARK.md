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
