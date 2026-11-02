# Temporadas: pesquisa e curadoria (02/11/2026)

Concreto (out) e Lambe (nov) não pegaram. Este documento diz por que e propõe o que fazer.
A temporada continua mexendo em tudo (site e social), conforme decidido com o Lucas.
O site tem ~450 visitas por mês, então não há apego a estabilidade visual dele.

## Diagnóstico

1. As duas são cartaz gráfico alto e chapado. Brigam com a foto da obra, que é o produto.
2. Variam tudo ao mesmo tempo (cor, fonte, forma, grafismo), e isso lê como fantasia.
3. Nasceram de nostalgia de design gráfico, não de uma obra ou acervo com fonte verificável.
4. O doc previa out = Lambe e nov = Concreto. O código fez o contrário. Corrigido neste texto.

## Benchmark: o que as instituições fixam e o que variam

| Caso | Fixo | Varia |
|---|---|---|
| Whitney (Experimental Jetset, 2013) | tipografia neo-grotesca e paleta | a forma do W, que vira grade para texto e imagem |
| Bienal de SP | preto, branco e cinza em uma tipografia só | o cartaz de cada edição, de um artista ou designer diferente |
| MACBA (Mucho) | um arcabouço claro | a voz de cada programa e exposição |
| Huis Marseille | o logo | o caráter tipográfico de cada mostra |
| MoMA (Gretel) | o comportamento (blocos que giram) | a campanha a cada troca de acervo |

Conclusão: **fixa muito, varia pouco, deixa a obra falar.** Nossa regra passa a ser:

- **Fixo (o esqueleto):** posição de data, título e casa; a voz; "nada escrito sobre a obra"; tipografia de texto corrido; o selo "Temporada NN · nome".
- **Varia:** a paleta (tirada de UMA obra ou acervo real), a fonte de título, uma regra de forma e um grafismo.
- **Obrigatório:** a temporada nasce de uma fonte citável (obra, acervo, designer) e o primeiro post do mês conta isso.
- **Teste de aceite:** a foto da obra tem de ficar mais forte com a temporada do que sem ela.

## Finalistas (renders em `SOCIAL/_identidade/c*-01.png`, gerados por `identidades-c.js`)

| | Referência | Regra de forma | Leitura |
|---|---|---|---|
| C1 Transparência | Mira Schendel, Objetos gráficos (c. 1967): papel de arroz, letra decalcada, folha sobre folha | texto em folha translúcida abaixo da obra, moldura de fio | a mais silenciosa, protege a obra |
| C2 Fachada | Alfredo Volpi: casinhas e bandeirinhas, têmpera de pigmentos | blocos chapados, janela em arco quando abre, obra em arco | a mais viva e brasileira |
| C3 Oficina | Tipografia Paulistana (LabVisual, FAU USP): oficinas tipográficas de SP, 1827 a 1927 | filete duplo, duas tintas, hierarquia de impresso | a mais editorial, perto da direção A já descartada |

Ressalvas dos testes:
- As paletas dos renders C1 a C3 eram aproximações. Ao amostrar a obra real da C2 (Volpi, Fachada com bandeiras, 1959, MASP), a paleta é outra: **índigo #2D3068, violeta fosco #6F486A, branco cru #E2DACF**, sem cor primária. É bem mais calma e protege melhor a obra. Lição: nunca fechar paleta antes de amostrar a imagem do acervo.
- A reprodução do MASP é JPEG CMYK (FOGRA39). Ler sem converter o perfil dá cores erradas (vivas demais ou foscas demais). Converter com o perfil embutido (sharp, ou lcms) antes de amostrar.
- Nos três, o painel do site fica vazio embaixo porque o teste usa só 6 itens.

## Decisão (02/11/2026)

**Novembro = Temporada 02 Fachada.** O Lambe foi arquivado em `temporadas/_banco/lambe.json`.

- Capa do social em índigo (a pintura), festão de bandeirinhas em branco cru, destaques em lilás claro (violeta clareado, só na capa).
- Mostra de obra e lista em papel branco cru, obra inteira, nada por cima.
- Site: papel e tinta índigo, violeta como acento, festão de bandeirinhas sob o cabeçalho, bandeirinha ao lado do nome.
- O site base é escuro; `temporada.js` ganhou uma camada para temporada clara (`camadaClara`), que vale para qualquer fundo claro futuro.

Pendências conhecidas:
- O mapa (MapLibre) continua escuro. Estilo de mapa por temporada ainda não existe.
- Próximas: janeiro Transparência (Schendel), março Oficina (Tipografia Paulistana). Amostrar a paleta de imagem do acervo antes de criar o JSON.

## Banco de reserva (com origem verificada)

- **Cauduro/Martino, Metrô de SP**: escritório fundado em 1964, autor da sinalização e do mobiliário da Av. Paulista e do primeiro diagrama de rede do Metrô (1967). Falta levantar a paleta e a codificação das linhas em fonte primária.
- **Antonio Maluf, cartaz da 1ª Bienal (1951)**: venceu concurso, retângulos repetidos criando vibração óptica. Acervo no MoMA e no MFAH. É a versão boa do Concreto, se quisermos voltar ao tema.
- **Rogério Duarte**: cartazes de cinema (Deus e o Diabo na Terra do Sol, Terra em Transe) e capas tropicalistas de 1968. Material acadêmico abundante, falta arquivo de imagem aberto.
- **Boca do Lixo e letreiros do Centro**: não achei acervo de imagem aberto. Pesquisar antes de prometer.

## Fontes

- Bienal de SP, identidade por edição: <https://a-g-i.org/design/bienal-de-sao-paulo>, <https://www.studiointernational.com/building-an-identity-through-innovation-and-change-the-bienal-de-s-atilde-o-paulo>
- Whitney, Responsive W: <https://www.dezeen.com/2013/05/21/whitney-graphic-identity-by-experimental-jetset/>
- Identidades flexíveis em museus (MoMA/Gretel, Leeum, MACBA, Huis Marseille): <https://campaignlive.com/article/moma-launches-seasonal-gallery-reveals-new-brand-identity/1700846>, <https://wearemucho.com/work/macba>, <https://wkams.com/?p=13962>
- Maluf: <https://www.moma.org/collection/works/7587>, <https://emuseum.mfah.org/objects/60081/cartaz-da-primeira-bienal-de-sao-paulo>
- Volpi: <https://masp.org.br/exposicoes/volpi-popular>, <https://masp.org.br/acervo/obra/fachada-com-bandeiras>
- Mira Schendel: <https://www.moma.org/collection/works/108826>, <https://frieze.com/article/mira-schendel-0>
- Tipografia Paulistana: <https://labvisual.fau.usp.br/tipografiapaulistana/?lang=en>
- Cauduro/Martino: <https://edisciplinas.usp.br/mod/resource/view.php?id=4592066>, <https://transitmap.net/tag/cauduro-martino>
- Rogério Duarte: <https://ojs.uel.br/revistas/uel/index.php/dominiosdaimagem/article/view/37387>
