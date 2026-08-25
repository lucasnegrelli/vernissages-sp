# OPERACAO.md — como o Vernissages SP roda sozinho

Fonte única da rotina. Duas tarefas agendadas apontam para cá e **não repetem
nada deste arquivo**:

| tarefa | quando | o que faz | seção |
|---|---|---|---|
| `vsp-site` | todo dia, 00:00 | destaque do site e publicação | [Parte 1](#parte-1--rotina-diária-vsp-site) |
| `vsp-semana` | domingo | varredura e o lote de social da semana | [Parte 2](#parte-2--rotina-de-domingo-vsp-semana) |

Regra que vale para as duas mora em [Parte 3](#parte-3--vale-para-as-duas), e
em nenhum outro lugar.

## Por que este arquivo existe, e por que continua sendo um só

Até 19/08/2026 a operação estava em três tarefas (`agenda-vernissages-sp`,
`vernissages-varredura-semanal`, `vsp-social-diario`) que repetiam entre si,
quase palavra por palavra, como ler a base, como validar, como publicar e o que
fazer ao falhar. Mudar uma regra exigia editar três arquivos, e quando alguém
esquecia um, as tarefas passavam a discordar.

Em 24/08 tudo virou **uma** tarefa. Funcionou, mas ela carregava a decisão da
peça de social todo dia — e decisão de design tomada durante a execução foi o
que gerou refação atrás de refação.

Em 30/08 a operação foi separada de novo, **em duas**, por um motivo diferente
do de agosto: agora as duas fazem coisas genuinamente distintas, e o social
virou lote semanal determinístico (`PLANO.json` + `semana.js`). O que **não**
mudou é a lição: **um runbook só.** Se uma regra vale para as duas, ela mora na
Parte 3.

## Mapa de quem manda em quê

| Assunto | Arquivo |
|---|---|
| Sequência operacional, publicação, falha, resumo | **este arquivo** |
| Como gerar o social em lote, paletas, plano da semana | `COMOGERAR.md` |
| O que sai em cada dia da próxima semana | `PLANO.json` |
| Regras de dado que reprovam publicação | `check.js` |
| Voz e vocabulário proibido | `ESTILO.md` |

Conflito entre eles: `check.js` ganha de tudo (é executável), depois `ESTILO.md`,
depois este arquivo. Divergência encontrada vai no resumo — não se contorna.

**`EDITORIAL.md` e `POSTS.md` estão obsoletos.** Descrevem os formatos antigos
(carrossel, destaque, nota, lembrete, sai de cartaz), aposentados em 24/08 e
substituídos pelos sete geradores. Não os siga; não os apaguei porque a decisão
é do Lucas.

## Ambiente

- Pasta de trabalho **é** o clone: `C:\Users\lucas\Desktop\Negrelli\Artes\VernissagesSP`
- `gh` autenticado como `lucasnegrelli` — `git push` funciona direto
- `main` rastreia `origin/main`. Se voltar a reclamar de "no tracking
  information", rode `git branch --set-upstream-to=origin/main main` e siga
- Node 20+; `.render/` tem puppeteer-core e sharp instalados
- `SOCIAL/`, `LOGO/`, `PENDENTE/` e `MAPA_GALERIAS.psd` estão fora do versionamento

## Quem mais escreve no repositório

Três workflows empurram para `main` sozinhos:

| Workflow | Dispara quando | O que faz |
|---|---|---|
| `Espelhar imagens` | push que mexe em `dados.js` | baixa `img` externa pra `img/` e reescreve o campo |
| `Gerar acervo e paginas` | push em `dados.js`/`gerar.js`, e 11h de SP | regenera `acervo.json`, `m/`, `a/`, `arquivo.html`, `sitemap.xml` |
| `valida dados.js` | todo push e todo PR | roda `check.test.js` e `check.js`; não escreve nada |

Os dois primeiros commitam, então **o clone local fica atrás minutos depois do
seu próprio push** — por isso toda rotina começa por `git pull --rebase`.

**Nunca edite à mão `acervo.json`, `sitemap.xml`, `m/` ou `a/`.** São gerados.

---

# PARTE 1 — Rotina diária (`vsp-site`)

Roda todo dia, inclusive domingo. **Não toca em social.** É curta de propósito:
o dia inteiro dela cabe em três fases.

## D0 — sincronizar

```
cd C:\Users\lucas\Desktop\Negrelli\Artes\VernissagesSP
git pull --rebase
```

Conflito no pull: **pare** e relate FALHOU com o arquivo em conflito. Nunca
resolva conflito de `dados.js` no automático — os workflows também empurram
para main e um merge errado apaga mostra.

Leia `dados.js` do disco. Se `atualizado` estiver 2 dias ou mais atrasado, a
rotina esteve parada — diga isso em negrito no resumo.

## D1 — destaque do site

Escolha entre as expos não encerradas: primeiro quem tem `ini` = hoje; senão a
abertura mais próxima, para trás ou para frente.

Exclua: toda chave já em `destaques`; a mostra que está no `foco` agora; toda
mostra cuja galeria esteve em foco nos últimos 7 dias.

**Só é elegível expo com `img` e `cred`.** Entre as elegíveis, desempate pelo
campo `d`: mostra que o `check.js` acusou com `A07` (descrição abaixo de 60
caracteres) vai para o fim da fila. Se todas estiverem com `A07`, publique
mesmo assim e registre no resumo — é dívida de varredura, não de hoje.

Sem candidata: mantenha o `foco`, não commite, e relate **SEM CANDIDATA**
listando os títulos barrados por falta de imagem.

Atualize `foco` e `destaques` apontando para a **mesma** mostra (o validador
confere) e insira `{d:"<hoje>",k:"<t>|<v>"}` na primeira posição de `destaques`.

Limpeza: remova expos com `fim` há mais de 7 dias, remova editais vencidos,
ponha `atualizado` = hoje.

## D2 — validar e publicar

```
node check.js
```

REPROVADO → corrija e rode de novo. **Nunca commite "pra ver se passa".**

Aprovado:

```
git add -A
git commit -m "<mensagem>"
git push origin main
```

Sem novidade, sem commit. Confirme que o workflow "valida dados.js" ficou verde
em https://github.com/lucasnegrelli/vernissages-sp/actions.

## Resumo da diária

3 a 5 linhas, começando com **PUBLICADO** (com o hash), **SEM CANDIDATA** (com
os títulos) ou **FALHOU**. Uma linha por fase que rodou.

---

# PARTE 2 — Rotina de domingo (`vsp-semana`)

Roda só no domingo. Faz a varredura e gera **a semana inteira** de social de uma
vez. Falha numa fase não cancela as outras.

## S1 — varredura

Único momento da semana que abre agregador, site de venue e Instagram. Teto:
**3 agregadores, 10 sites em rodízio, 8 perfis.**

**Comece rodando `node radar.js`.** Ele cruza `dados.js` com `acervo.json` e
escreve `PENDENTE/RADAR.md` com a fila do rodízio — quem nunca teve mostra
registrada primeiro.

### O rodízio tem duas velocidades — mudou em 25/08/2026

A fila era única: 91 casas, dez por domingo, cada uma a cada nove semanas. Isso
é tarde demais para galeria e desperdício para instituição, e o número que
prova está na própria base — o formato `duracao` mediu **mediana de 42 dias em
galeria contra 141 em instituição**. Visitar a Pinacoteca de seis em seis
semanas devolve a mesma mostra três vezes; visitar uma galeria de nove em nove
perde a mostra inteira.

Agora cada casa tem ciclo próprio (`CICLO` no `radar.js`): **42 dias** para
galeria, híbrido e feira, **141** para institucional. A fila ordena por
*atraso relativo ao ciclo da própria casa*, não por data absoluta. Mesmo teto
de páginas, cobertura muito maior.

**Empate na fila desempata pela enquete.** Entre duas casas com o mesmo atraso,
vai antes a que estiver na zona mais votada em "Que região cobrir", no rodapé do
site. É o único uso do resultado, e é o motivo de a enquete existir — a pergunta
anterior ("quem é o público") não alimentava decisão nenhuma e ficou sem um voto
sequer. A base tem 50 espaços na Zona Oeste e 1 na Leste; se a votação pedir
Leste, isso é sinal de que o mapa está espelhando a varredura e não a cidade.

O `RADAR.md` agora fecha com a conta explícita: cada casa de ciclo C exige 7/C
visitas por semana, e a soma diz se o teto basta. Em 25/08 a demanda era
**12,4 visitas por semana contra teto de 10** — ainda faltam 2,4. As duas
velocidades reduziram o buraco; não o fecharam. O resto vem do envio das casas.

### Espaço que só divulga no Instagram

Perfil exige login e o runbook proíbe raspar. **A7MA, Mata Lab, Massapê,
Espaço República e Vazio Criativo não têm entrada por varredura — nenhuma.**

Há duas vias, e nenhuma delas é raspar perfil.

**1. Você lê o post e cola a legenda no `captar.js`.**

```
node captar.js --venue "A7MA Galeria" --texto post.txt
```

Ele devolve a linha pronta do `EXPOS` e **declara o que não conseguiu ler** em
vez de chutar: título, datas, artistas, e o aviso de ano quando a legenda não
traz o ano — que é o erro clássico em mostra que atravessa a virada. Confere o
endereço da legenda contra o da base e acusa divergência. Não abre Instagram,
não baixa nada.

**Imagem do Instagram oficial da própria casa pode.** É a mesma postura que o
`espelhar.js` já aplica ao site da galeria, e ela está escrita lá desde sempre:
cópia local, crédito obrigatório no campo `cred`, arquivo apagado de `img/` e
entrada revertida se a casa pedir remoção. Sem exceção.

```
node captar.js --venue "A7MA Galeria" --texto post.txt \
    --img "<url da imagem>" --cred "Foto Fulano / Cortesia A7MA"
node espelhar.js
```

**Rode o `espelhar.js` no mesmo dia.** URL de CDN do Instagram é assinada e
expira em horas; depois de espelhada o arquivo vive em `img/` e isso deixa de
importar, mas antes disso a janela é curta.

Duas coisas que não mudam: **nunca chutar autoria de foto** — se o post não
nomeia o fotógrafo, o padrão é `Cortesia <casa>` —, e **olhar a imagem depois
de espelhada**, porque cartaz e vista de sala passam em peso e dimensão. Sendo
parede e não obra, marque `vista: true`.

Sem imagem a mostra entra na agenda e no mapa normalmente, e só fica fora dos
formatos que mostram obra — comportamento correto, não falha.

**2. O formulário "Divulgue sua abertura"**, no pré-rodapé do site, que abre o
`openForm()` do `index.html` e volta por e-mail. Ele existia no código desde
sempre e **não era chamado de lugar nenhum** — o canal estava escrito e
inalcançável até 25/08. Ao passar por uma dessas casas na fila do radar, o
trabalho não é caçar o release: é mandar o link do formulário para o perfil.

Encare o número. Em 20/08 eram 36 das 91 casas sem uma única mostra registrada,
e não só espaço independente: Almeida & Dale, Choque Cultural, Kogan Amaro e
Galeria Lume estavam na lista. Com 91 casas e teto de 10 sites, cada venue é
visitado a cada nove semanas, e mostra de galeria dura seis a oito. **O rodízio
é mais lento que o ciclo das exposições.** Ou o mapa encolhe, ou as casas passam
a mandar a abertura.

Agregadores: `artequeacontece.com.br/eventos/categoria/sao-paulo/AAAA-MM/`,
`ocula.com/cities/brazil/sao-paulo-art-galleries/exhibitions/`,
`guiadasartes.com.br/sao-paulo/sao-paulo/exposicoes`.

**Sempre confirme a cidade** — galeria com filial fora de SP aparece nos
agregadores como se fosse daqui.

Instagram: priorize `tipo: hibrido` e independentes (Mata Lab, Auroras, Massapê,
Ateliê397, Aparelha Luzia, Espaço República, Galeria Café, Ateliê Fidalga,
Galeria Metrópole, GRUTA, HOA, Sé Galeria, Casa do Povo, A7MA — esta só divulga
por lá). **Nunca use URL de imagem do CDN do Instagram: expira.**

### Imagens — a parte que mais importa

**A ordem de busca mudou em 24/08.** Ela era "site oficial → release → matéria
(`og:image`) → Instagram", e na prática o `og:image` virou a fonte padrão, por
ser o primeiro lugar onde qualquer raspador olha. Resultado medido: **26 das 33
mostras em cartaz estavam em 1200×630**, que é o card de preview de link, não
reprodução de obra.

Ordem correta:

1. **Viewing room ou página da obra** no site do venue.
2. **O lightbox da página da mostra.** Comprovado na Gomide&Co: o `og:image`
   dava 1200×630 e o link de ampliar dava a **mesma imagem em 2400×1601**.
3. **Press kit ou release.**
4. **`og:image`** — só se não houver nada acima.

`node descobrir-imagens.js` já faz essa ordem sozinho e mede cada candidata.
Para auditar uma casa: `node descobrir-imagens.js --testar-url <url>`.

**Régua:** 1600 px de largura é o piso para recorte fechado. `check.js` acusa
`A08` (medida de card social) e `A09` (largura curta). Nenhum trava publicação —
travam formato.

**Abra a URL e olhe a imagem.** Nenhuma conta automática distingue obra de
cartaz: em 24/08 a mostra do Coletivo Poíesis estava com o flyer da exposição no
campo `img`, com peso e dimensão de sobra.

Preencha `cred` com o crédito exato. Se a fonte só diz "Divulgação", use
"Divulgação". **Nunca invente autoria.**

**E marque `vista: true` quando a imagem for da parede, não do trabalho.** Você
acabou de abrir a imagem para olhar; é o único momento em que essa informação
existe. Sem a marca, ela se perde e a `aproximacao` de terça amplia o piso de
madeira da galeria. Instituição publica quase só vista de sala — em 24/08, sete
das nove imagens novas eram vista.

**Aprendido em 24/08:** o `og:image` de instituição costuma ser o **cartaz**,
com o letreiro da mostra impresso sobre a obra. MASP e Pinacoteca publicam as
vistas em alta numa galeria abaixo do texto de apresentação, com fotógrafo
nominal. A Pinacoteca ainda serve dois arquivos por foto: a listada vem com
sufixo de medida (`-1024x607`) e a original, sem sufixo ou com `-scaled`, é
bem maior — uma foi de 1024 para 2560 px só tirando o sufixo.

### Um fato conferível por mostra

**Toda mostra precisa de um dado concreto no campo `d`** — um número, um
período, um material, uma curadoria assinada. O modelo está no `ESTILO.md`:
*"48 trabalhos realizados entre 1974 e 1981, no Chile sob a ditadura militar"*.
O `check.js` acusa com `A07`.

Onde procurar: a página da própria mostra no site do venue (quase nunca linkada
na home — busque pelo nome); a aba de textos críticos; e, se não achar,
**os agregadores**, que frequentemente publicam o release inteiro.

Agregador serve como **fonte de fato**, nunca como fonte de link sem
conferência: em 20/08 o Arte Que Acontece anunciava `hoatour.art` como site da
HOA, e o domínio tinha caído e servia um cassino.

Nesta fase não toque em `foco` nem em `destaques`: são da diária.

### Duas lacunas conhecidas, para atacar aqui

- **Horário de sábado: 5 casas de 37.** É a informação mais crítica do dia de
  maior movimento e a maior lacuna da base.
- **Mostra sem data de fim.** Quatro em 30/08. Sem `fim` a mostra fica fora do
  formato `duracao`.

## S2 — o lote de social da semana

Leia `COMOGERAR.md` inteiro antes. Depois:

```
node semana.js --seco     # confere o que falta, sem gerar imagem
node semana.js            # gera
```

O `PLANO.json` manda no que sai. Uma peça que falha não derruba as outras, e o
relatório final diz o que falta.

**`rima` e `aproximacao` falham de propósito** quando não há config escrito à
mão: dependem de curadoria — qual par de mostras, qual obra, onde recortar. A
mensagem de erro diz o que escrever. Se você é a tarefa agendada e não o Lucas,
**não invente a curadoria**: relate as duas como pendentes e siga.

Os outros cinco montam sozinhos da base.

**Não repita paleta em dias seguidos.** Na semana de 24/08 cinco dos sete
formatos saíram em `escuro` e o feed virou uma mancha só.

## S3 — arquivar

As peças já saem em `SOCIAL/<MM>/<DD>/`. Falta:

- **`LEGENDAS.md`** em cada pasta, com a legenda do post e as **notas de
  apuração**: de onde veio cada dado, o que é inferência, o que foi corrigido à
  mão. É esse bloco que permite auditar o post depois.
- Uma linha por peça em `SOCIAL/HISTORICO-DESTAQUE-SOCIAL.md`.
- `node .render/comprimir.js` — lossless, mesmo nome, −72% na média.

## Resumo do domingo

4 a 8 linhas, começando com **PUBLICADO**, **SEM NOVIDADES** ou **FALHOU**.
Uma linha por fase: o que a varredura trouxe, quantas peças o lote gerou,
quais abortaram e por quê, o que ficou pendente.

---

# PARTE 3 — Vale para as duas

## O que NUNCA acontece sozinho

- **Postar no Instagram.** A publicação é sempre manual, feita pelo Lucas. As
  rotinas montam, arquivam e param.
- **Commitar sem `check.js` aprovado.**
- **Resolver conflito de merge em `dados.js`.**
- **Inventar dado.** Data, endereço, autoria e crédito só entram confirmados na
  fonte. Na dúvida: deixe de fora e diga no resumo.
- **Inventar curadoria.** Se um formato exige escolha humana e ela não existe,
  a peça não sai.

## Se falhar

Não termine em silêncio e não deixe trabalho só na memória. Salve o que foi
produzido em `PENDENTE/` com um `PENDENTE/LEIA.md` datado dizendo o que mudou,
por que falhou e como retomar. Não use a pasta de outputs — ela é efêmera.

Falha numa fase não cancela as outras.

## Nunca relate sucesso sem prova

Hash do commit, contagem de arquivos, saída do script. "Deu certo" não é
relatório.

## Orçamento de páginas externas

| Tarefa | Teto | Observação |
|---|---|---|
| `vsp-site`, qualquer dia | 0 | ela não abre nada; tudo vem do disco |
| `vsp-semana`, domingo | até 25 | 3 agregadores + 10 sites + 8 perfis |

Estourou o teto: pare, entregue o que tem, relate o que faltou.
