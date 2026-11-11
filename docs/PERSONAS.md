# PERSONAS — para quem o Vernissages SP escreve

Criado em 11/11/2026. São **hipóteses de trabalho** derivadas da `LINHA-EDITORIAL.md` e dos dados do radar, não
pesquisa de campo. A seção final diz como validar. O `copy.js` usa as personas **A, B e C** para escolher quais
editais entram no post e que leitura cada um recebe.

A voz é uma só (ver `docs/COPY.md` §1). O que muda de uma persona para outra é **o dado escolhido e o estágio de
consciência** (Schwartz), não o tom.

---

## A · A artista que ainda não vive de arte
**Quem:** 22 a 35 anos, mora em SP, produz, expõe em coletiva ou espaço independente, tem outro trabalho.
**Estágio:** ciente do problema. Já perdeu prazo; segue Dasartes e grupos, mas a informação chega espalhada.
**O que busca:** edital sem taxa, em português, com prazo que dê para cumprir, que aceite artista sem galeria.
**O que trava:** regulamento longo e cheio de termo; taxa de inscrição; edital que exige CNPJ, currículo grande ou
mudança de cidade; prazo descoberto na véspera.
**O que salva e compartilha:** lista curta de chamadas com **data** e **custo** claros; "este cabe no seu
orçamento".
**Dado que pesa:** custo (zero ou valor), onde (SP/Brasil), dias restantes, para quem é.
**Primeira linha que funciona:** o nome e o prazo, sem estatística. "Residência Juntó, Instituto Tomie Ohtake: inscrições até 15 de novembro."
**Gatilhos aplicáveis:** aversão à perda (prazo), prova de fonte (autoridade), unidade (a cena), redução de atrito.
**Nunca:** condescender ("vai lá, você consegue"), prometer resultado, esconder taxa.

## B · O artista com trajetória que quer sair do país
**Quem:** 28 a 45, já expôs, quer residência fora (Europa, Ásia), avalia custo e prestígio.
**Estágio:** ciente da solução. Conhece Res Artis, apoio.art; compara programas.
**O que busca:** residência com apoio financeiro (bolsa, hospedagem, ateliê), reputação da casa, duração, prazo.
**O que trava:** "residência" que na verdade cobra do artista (*pay to play*); custo escondido; programa que não
paga passagem; formulário em inglês, alemão ou francês.
**O que salva e compartilha:** a diferença entre residência **com apoio** e residência **paga pelo artista**.
**Dado que pesa:** o que o programa cobre (hospedagem, ateliê, bolsa), país e cidade, duração, idioma exigido.
**Primeira linha que funciona:** a régua. "Residência em Veneza com apoio parcial. O 'parcial' é a palavra a ler."
**Gatilhos aplicáveis:** ancoragem (o custo real ao lado do que parece oferecido), lacuna de informação, autoridade
(quem organiza).
**Nunca:** vender a residência como oportunidade de vida; usar "sonho".

## C · A estudante de artes
**Quem:** graduação, 18 a 26, SP e arredores, pouca grana, muita vontade, pouco repertório de editais.
**Estágio:** inconsciente a ciente do problema. Ainda não sabe que **existe** um calendário de chamadas.
**O que busca:** por onde começar; chamada que aceite estudante; prêmio e bolsa de entrada; exposição para ir ver.
**O que trava:** jargão, achar que edital é para "artista de verdade", falta de portfólio.
**O que salva e compartilha:** "o que abre para quem está começando" e "o que você pode ver de graça neste fim
de semana".
**Dado que pesa:** aceita estudante? sem taxa? em português? presencial ou remoto?
**Primeira linha que funciona:** surpresa concreta. "Galeria de arte é de graça. Sempre. Só o ingresso de museu
cobra."
**Gatilhos aplicáveis:** curiosidade (lacuna), unidade, valor prático.
**Nunca:** explicar com didatismo infantil; a estudante lê rápido.

## D · O frequentador de galeria
**Quem:** 25 a 55, circula por Jardins, Vila Madalena, Centro; quer saber para onde ir no fim de semana.
**Estágio:** ciente do produto, ou quase.
**O que busca:** o que abre, o que fecha, perto de onde está, a pé.
**O que salva e compartilha:** o roteiro da semana (agenda de quinta, deriva de sábado).
**Dado que pesa:** data, endereço, entrada, distância entre casas.
**Primeira linha que funciona:** o nome e o fato. "Mendes Wood DM: Jean Claracq, até 6 de novembro."
**Gatilhos aplicáveis:** aversão à perda (últimos dias), antecipação (abre hoje), disponibilidade (cadência fixa).
**Nunca:** convite por adjetivo ("imperdível").

## E · A casa (parceira)
**Quem:** galeria, instituição, espaço independente que o perfil cita.
**O que busca:** ser retratada com precisão, receber visita, ser repostada.
**O que trava:** erro de data, nome, crédito de foto; tom de assessoria ou de crítica injusta.
**Regra:** a acidez **nunca mira a casa**. Crédito de foto copiado exato. Data conferida. Se a casa quer corrigir,
corrige na hora.

---

## Como o código usa as personas

`copy.js` → `notaPorPersona(item)` devolve uma nota 0 a 10 para **A**, **B** e **C** com base em: onde (SP, Brasil,
exterior), custo (sem taxa conhecida, taxa, com apoio), dias restantes, idioma do título (inglês = atrito para A e C),
categoria (edital, prêmio, bolsa, residência). O post de editais escolhe os itens com melhor nota **para as três**
e o texto de cada um indica para qual persona ele serve. A tabela de pesos está no começo do `copy.js` e é para ser
editada depois da validação abaixo.

## Como validar (as personas são hipótese)

1. Perguntar a 3 pessoas de cada perfil (A, B, C), em conversa de 15 minutos: "o que você faz quando vê um edital
   novo?", "o último que você perdeu, por quê?", "o que te faz salvar um post de edital?".
2. Anotar as palavras que a pessoa usa. **O vocabulário dela entra no copy**, o nosso sai.
3. Ajustar os pesos do `copy.js` e escrever aqui o que mudou, com data.
4. Cruzar com a métrica: quais editais **salvaram** mais. Se for sempre o de SP sem taxa, o peso de A sobe.
