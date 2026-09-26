# DESIGN.md — referências estéticas e a direção única (site + Instagram)

Aberto em 26/09/2026. Problema dito pelo Lucas: "o Instagram tem uma cara, o
site tem outra, e o site tem cara de coisa feita por IA".

## Diagnóstico (olhando o site em 26/09)

O site tem cara de **painel de SaaS**, não de publicação de arte:
- faixa de KPIs no topo ("72 galerias · 40 espaços · 11 híbridos…") — linguagem de dashboard;
- cartões com canto arredondado, borda fina e sombra, um dentro do outro;
- "pílulas" coloridas (ABERTURA amarela, GRÁTIS verde) e chips de filtro;
- amarelo como acento — o Instagram usa terracota `#C96F4A`;
- tabela de diretório com ícones em botões redondos;
- emoji no título do README e em rótulos.

É exatamente o repertório padrão que ferramentas de IA geram. O que tira essa
cara é **tipografia com opinião, imagem grande, filete no lugar de caixa, e
menos componentes**.

## A direção: um sistema só

| elemento | hoje (site) | direção (site = Instagram) |
|---|---|---|
| tipografia | Switzer em tudo, peso médio | Switzer **800** para título e data, Switzer 400 para texto; opcional um serifado editorial para citação (Zodiak ou Instrument Serif) |
| acento | amarelo | **terracota `#C96F4A`**, e só ele |
| fundo | preto azulado com cartões | **papel `#E9E5DC`** e **escuro `#0B0B0C`**, alternando por seção como os slides |
| estrutura | cartões e pílulas | **filetes** de 1–2 px, grade larga, listas como agenda de jornal |
| datas | texto pequeno | **grandes**, como no carrossel ("SÁB 26") |
| imagem | miniatura dentro de cartão | **grande**, sangrando a coluna, crédito pequeno embaixo |
| mapa | Leaflet com mapa pronto escuro | mapa **no traço da deriva**: ruas finas, pontos pretos, rota terracota |
| status | pílula colorida | palavra em caixa-alta espaçada (ABRE / ÚLTIMOS DIAS), no máximo um bloco terracota |

Regra de ouro: se um componente parece de painel de administração, sai.

## Referências — estúdios e identidades de instituições de arte

| referência | por que olhar |
|---|---|
| **Experimental Jetset** — Whitney Museum ("Responsive W") | identidade que é só uma linha que se adapta; prova que pouco elemento basta |
| **Mevis & Van Deursen** — Stedelijk Museum | tipografia gigante como imagem |
| **Pentagram / Paula Scher** — The Public Theater | cartaz tipográfico de rua; energia sem perder rigor |
| **Wolff Olins** — Tate | uma marca que muda e continua reconhecível |
| **Bloco Gráfico** (SP) | design editorial brasileiro para livro e arte; grade e respiro |
| **Elaine Ramos / Ubu Editora** (SP) | capas tipográficas, cor chapada, serifa + grotesca |
| **Rico Lins** (SP) | cartaz brasileiro com tipografia expressiva |
| **Casa Rex** (SP) | identidade de marca cultural em escala |
| Daniel Trench · Celso Longo *(conferir trabalhos para a Bienal)* | design de catálogo e identidade de instituição em SP |

## Referências — sites

| site | o que roubar |
|---|---|
| **Hauser & Wirth**, **David Zwirner** | imagem enorme, texto mínimo, navegação silenciosa |
| **Mendes Wood DM**, **Fortes D'Aloia & Gabriel**, **Luisa Strina**, **Vermelho** | como galerias de SP apresentam mostra (nossas vizinhas no mapa) |
| **e-flux** | lista de anúncios como jornal: densidade sem cartão |
| **Are.na** | minimalismo que virou culto; branco, preto, cinza e só |
| **Contemporary Art Daily** | uma mostra, várias vistas de sala, nada mais |
| **See Saw** | agenda por bairro com mapa, sem enfeite |

**Vitrines para caçar referência:** Awwwards, Siteinspire, Godly, Hoverstat.es,
Brutalist Websites, Minimal Gallery, Fonts In Use, It's Nice That.

## Fontes (licença livre para uso comercial)

- **Fontshare** (mesma casa da Switzer): Satoshi, General Sans, Cabinet Grotesk,
  Clash Display (grotescas); Zodiak, Gambetta (serifadas).
- **Google Fonts**: Instrument Serif, Fraunces, Bricolage Grotesque.
- Recomendação: **manter Switzer** (já é a do Instagram) e testar **Zodiak** ou
  **Instrument Serif** como segunda voz em citação e título de mostra.

## Bibliotecas de front

| biblioteca | para quê | veredito |
|---|---|---|
| **MapLibre GL JS** + tiles vetoriais livres (OpenFreeMap / Protomaps) | trocar o Leaflet com mapa pronto por um mapa **desenhado no nosso estilo** (o traço da deriva) | **sim — é a maior mudança de cara do site** |
| **GSAP** (gratuito, inclusive plugins, desde 2025) | animação de entrada, rolagem com texto grande, transição de agenda | sim, com parcimônia |
| **Lenis** | rolagem suave | talvez |
| **View Transitions API** (nativa do navegador) | transição entre página de artista/mostra sem framework | sim, custo zero |
| **Three.js** | 3D | **só para um momento especial** (ex.: mapa de SP em relevo na capa, ou sala 3D de uma mostra). Em guia de uso diário, 3D pesa no celular e vira enfeite — que é justamente a "cara de IA" que a gente quer tirar |

O site continua estático e rápido; nada disso exige backend.

## Próximos passos

1. Maquete da home nova (agenda + mapa no estilo deriva) para aprovar antes de mexer no `index.html`.
2. Trocar o mapa para MapLibre com estilo próprio.
3. Unificar tokens (cores, tipos, espaçamento) num arquivo só, usado pelo site e pelos geradores do social.
4. Tirar os emojis de títulos, KPIs e pílulas.

---

## Temporadas — uma estética por mês (proposta de 26/09/2026)

Ideia do Lucas: a cada virada de mês, **tudo** muda de estética (posts e site),
e cada mês reverencia uma referência da cultura visual — de preferência
paulistana. O conceito da marca deixa de ser "um visual" e passa a ser
**a curadoria de visuais**: o Vernissages SP como galeria que troca de
exposição, só que da própria cara. Precedentes: a Bienal de SP muda de
identidade a cada edição; o Pavilhão da Serpentine troca de arquiteto todo ano.

**O que nunca muda (o esqueleto):** o nome escrito do mesmo jeito em algum
lugar fixo; a estrutura dos formatos (agenda, deriva…); onde ficam data, título
e casa; a voz do texto; o selo "Temporada NN · nome".

**O que muda todo mês:** fontes, cores, textura, grafismo (círculo, risco,
papel, fio), estilo do mapa.

**Cada temporada vira conteúdo:** o primeiro post do mês explica a referência
(quem fez, quando, por que importa) — é "história por trás" de graça.

**Como fica técnico:** um arquivo por mês (`temporadas/2026-10.json`) com os
tokens — fontes, cores, textura, variações de componente. Site e geradores do
social leem a temporada do mês corrente. Trocar de mês = trocar um arquivo.

### Banco de temporadas (SP e Brasil primeiro)

| # | temporada | referência |
|---|---|---|
| 1 | **Lambe** | lambe-lambe da Gráfica Fidalga: letra de madeira, papel fluorescente |
| 2 | **Concreto** | Wollner, Geraldo de Barros, Grupo Ruptura, cartazes da Bienal |
| 3 | **Arquivo** | imprensa e editoras independentes: serifa, papel, jornal |
| 4 | **Rota** | sinalização do Metrô de SP e placas de rua: mono, diagrama |
| 5 | **Brutalista** | Lina Bo Bardi, SESC Pompeia, Paulo Mendes da Rocha: concreto aparente, letreiro pintado |
| 6 | **Abridor de letras** | pintura de letreiro popular de boteco e comércio |
| 7 | **Boca do Lixo** | cartazes do cinema da Boca (liga com "Mulheres da Boca", no MIS) |
| 8 | **Caipira de 22** | as "cores caipiras" de Tarsila, modernismo de 22 |
| 9 | **Tropicália** | capas de disco (Rogério Duarte e outros) |
| 10 | **Xerox** | fanzine e cartaz punk paulistano dos anos 80: fotocópia, recorte |
| 11 | **Neon do Centro** | letreiros luminosos do Centro velho, Galeria do Rock |
| 12 | **Pixo** | a tipografia da pichação paulistana (tratada com respeito e crédito) |

Proposta de início: **outubro = Lambe** (a jam da A7MA e a cidade na rua),
**novembro = Concreto**.
