# OPERACAO.md — como o Vernissages SP roda sozinho

Fonte única da rotina diária. A tarefa agendada `vernissages-sp` (00:00, todo
dia) não repete nada disto: ela aponta para cá. Se uma regra vale para mais de
uma fase, ela mora aqui e em nenhum outro lugar.

## Por que este arquivo existe

Até 19/08/2026 a operação estava em três tarefas agendadas (`agenda-vernissages-sp`,
`vernissages-varredura-semanal`, `vsp-social-diario`) que repetiam entre si, quase
palavra por palavra, como ler a base, como validar, como publicar, o que fazer ao
falhar e o formato do resumo. Mudar uma regra exigia editar dois ou três arquivos,
e quando alguém esquecia um, as tarefas passavam a discordar. Além disso, as duas
do site publicavam pelo editor web do GitHub — select-all sintético no CodeMirror,
colagem por ClipboardEvent, espera de CDN — quando a pasta local já é um clone com
`gh` autenticado.

Uma tarefa, um runbook, publicação por git.

## Mapa de quem manda em quê

| Assunto | Arquivo |
|---|---|
| Sequência operacional, publicação, falha, resumo | **este arquivo** |
| Voz, vocabulário, o que é proibido escrever | `ESTILO.md` |
| Formatos de social, gatilhos, travas anti-repetição | `EDITORIAL.md` |
| Sistema visual dos slides, paleta, tratamentos | `POSTS.md` |
| Regras de dado que reprovam publicação | `check.js` |

Conflito entre eles: `check.js` ganha de tudo (é executável), depois `ESTILO.md`,
depois este arquivo. Divergência encontrada vai no resumo — não se contorna.

## Ambiente

- Pasta de trabalho **é** o clone: `C:\Users\lucas\Desktop\Negrelli\Artes\VernissagesSP`
- `gh` autenticado como `lucasnegrelli` (escopo `repo`) — `git push` funciona direto
- `main` rastreia `origin/main` (upstream configurado em 20/08). Sem isso o
  `git pull --rebase` da Fase 0 morre antes de começar. Se algum dia voltar a
  reclamar de "no tracking information", rode
  `git branch --set-upstream-to=origin/main main` e siga.
- Node 20+ disponível; `.render/` tem puppeteer-core e sharp instalados
- `SOCIAL/`, `LOGO/`, `PENDENTE/` e `MAPA_GALERIAS.psd` estão fora do versionamento

## Quem mais escreve no repositório

Você não é o único que empurra pra `main`. Três workflows fazem isso sozinhos:

| Workflow | Dispara quando | O que faz |
|---|---|---|
| `Espelhar imagens` | push que mexe em `dados.js` | baixa `img` externa pra `img/` e reescreve o campo |
| `Gerar acervo e paginas` | push em `dados.js`/`gerar.js`, e 11h de SP todo dia | regenera `acervo.json`, `m/`, `a/`, `arquivo.html`, `sitemap.xml` |
| `valida dados.js` | todo push e todo PR | roda `check.test.js` e `check.js`; não escreve nada |

Os dois primeiros commitam e empurram, então **o clone local fica atrás minutos
depois do seu próprio push** — é por isso que a Fase 0 sempre começa por
`git pull --rebase`. Os dois têm rebase-com-retry desde 20/08; antes disso o
gerador morria quando o espelhador ganhava a corrida.

Consequência prática: **nunca edite à mão `acervo.json`, `sitemap.xml`, `m/` ou
`a/`** esperando que fique. Eles são gerados. A exceção é remover do acervo uma
mostra duplicada — aí edite `acervo.json`, apague a página órfã em `m/` com
`git rm` e rode `node gerar.js`, senão o sitemap continua anunciando a URL morta.

---

## Fase 0 — sincronizar (sempre)

```
cd C:\Users\lucas\Desktop\Negrelli\Artes\VernissagesSP
git pull --rebase
```

Se o pull conflitar, **pare**: relate FALHOU com o arquivo em conflito. Nunca
resolva conflito de `dados.js` no automático — os workflows de acervo também
empurram pra main e um merge errado apaga mostra.

Leia `dados.js` do disco (já é a versão publicada). Não busque o raw do GitHub:
isso era necessário quando a pasta não era clone.

Se `atualizado` estiver 2 dias ou mais atrasado, a rotina esteve parada — diga
isso em negrito no resumo.

## Fase 1 — varredura (SÓ NO DOMINGO)

Único momento da semana que abre agregador, site de venue e Instagram. Teto por
execução, não ultrapasse: **3 agregadores, 10 sites em rodízio, 8 perfis**.
Anote onde o rodízio parou — a próxima semana continua dali.

Agregadores: `artequeacontece.com.br/eventos/categoria/sao-paulo/AAAA-MM/`,
`ocula.com/cities/brazil/sao-paulo-art-galleries/exhibitions/`,
`guiadasartes.com.br/sao-paulo/sao-paulo/exposicoes`.

**Sempre confirme a cidade** — galeria com filial fora de SP aparece nos
agregadores como se fosse daqui (em 10/08 "O espaço e o lugar", da DAN, era em
Votorantim).

Instagram: priorize `tipo: hibrido` e independentes (Mata Lab, Auroras, Massapê,
Ateliê397, Aparelha Luzia, Espaço República, Galeria Café, Ateliê Fidalga,
Galeria Metrópole, GRUTA, HOA, Sé Galeria, Casa do Povo, A7MA — esta só divulga
por lá). **Nunca use URL de imagem do CDN do Instagram: expira.**

### Imagens — a parte que mais importa

Sem imagem, a peça do dia cai no chapado tipográfico. Para cada expo sem `img`,
procure nesta ordem: site oficial do venue → release/press kit → matéria de
imprensa (`og:image`) → post do Instagram do venue.

**Abra a URL e olhe a imagem.** O `check.js` confere tamanho e content-type, mas
não sabe o que a imagem mostra — logotipo, placeholder e forma geométrica passam
no validador e estragam o post. Preencha `cred` com o crédito exato da fonte; se
a fonte só diz "Divulgação", use "Divulgação". Nunca invente autoria: crédito
errado é pior que crédito ausente.

Basta pôr a URL externa no campo `img` — o workflow `espelhar-imagens` baixa
pra `img/` e reescreve o campo sozinho no push.

### Um fato conferível por mostra

Não basta data, endereço e imagem. **Toda mostra precisa de um dado concreto no
campo `d`** — um número, um período, um material, uma curadoria assinada. O
modelo está no `ESTILO.md`: *"48 trabalhos realizados entre 1974 e 1981, no
Chile sob a ditadura militar"*.

Isso não é capricho de redação, é o gargalo real do social: em 20/08, 20 das 57
mostras em cartaz tinham `d` com menos de 60 caracteres, coisas como "Pinturas
recentes." — e daí não sai legenda que preste. O `check.js` acusa com `A07`.

Mostra sem esse dado entra na agenda do site normalmente, mas **não é candidata
a destaque nem a peça de social**. Prefira gastar a página extra levantando o
fato de uma mostra a acrescentar mais uma mostra oca à lista.

**Onde procurar, nesta ordem:**

1. A página da própria mostra no site do venue. Repare que ela quase nunca está
   linkada na home: a Almeida & Dale usa `/exposicoes/<slug>/`, a Galeria
   Dezoito usa `/<titulosemespaco>/`, MASP e Pinacoteca renderizam bem em
   `/exposicoes/<slug>` mesmo com o índice quebrado. Busque pelo nome da mostra
   em vez de navegar pelo índice.
2. A aba de textos críticos do venue, quando existir. É lá que estão o número de
   obras e a técnica.
3. **Não achou no site oficial? Vá para os agregadores** — Arte Que Acontece,
   Dasartes, Guia das Artes, Mapa das Artes. Eles frequentemente publicam o
   release inteiro que a galeria não pôs no próprio site.

Uma ressalva que não se contorna: agregador serve como **fonte de fato**, nunca
como fonte de link sem conferência. Em 20/08 o Arte Que Acontece anunciava
`hoatour.art` como site da HOA Galeria; o domínio tinha caído e servia um
cassino. Fato do release, pode usar. URL, só depois de abrir.

Nesta fase não toque em `foco` nem em `destaques`: são da Fase 2.

## Fase 2 — destaque do site (todo dia)

Escolha entre as expos não encerradas: primeiro quem tem `ini` = hoje; senão a
abertura mais próxima, para trás ou para frente.

Exclua: toda chave já em `destaques`; a mostra que está no `foco` agora; toda
mostra cuja galeria esteve em foco nos últimos 7 dias.

**Só é elegível expo com `img` e `cred` preenchidos.** Entre as elegíveis,
**desempate pelo campo `d`**: mostra que o `check.js` acusou com `A07`
(descrição abaixo de 60 caracteres) vai para o fim da fila, porque a legenda
dela sai igual à de ontem. Se todas as candidatas estiverem com `A07`, publique
mesmo assim e registre a lista no resumo — é dívida de varredura, não de hoje.

Sem candidata, não force:
mantenha o `foco`, não commite, e relate SEM CANDIDATA listando os títulos
barrados por falta de imagem — o domingo começa por essa lista.

Atualize `foco` e `destaques` apontando para a **mesma** mostra (o validador
confere), insira `{d:"<hoje>",k:"<t>|<v>"}` na primeira posição de `destaques`.

Limpeza: remova expos com `fim` há mais de 7 dias, remova editais vencidos,
ponha `atualizado` = hoje.

## Fase 3 — validar e publicar

```
node check.js
```

REPROVADO → corrija e rode de novo. **Nunca commite "pra ver se passa"**: o CI
acusa e o repo fica vermelho.

Aprovado:

```
git add -A
git commit -m "<mensagem>"
git push origin main
```

Sem novidade, sem commit. Confirme que o workflow "valida dados.js" ficou verde
em https://github.com/lucasnegrelli/vernissages-sp/actions.

## Fase 4 — peça de social (todo dia)

**Não existe mais grade por dia da semana.** Desde 20/08 o `EDITORIAL.md`
trabalha com dois slots e gatilho: slot A de manhã (serviço, sai sempre) e
slot B à noite (tese, só sai se um gatilho acender). Leia o catálogo de
formatos antes de montar — o Lucas pode tê-lo editado entre uma execução e
outra, e a ordem de prioridade dentro de cada slot importa.

Duas coisas que mudam a operação:

- **Slot B vazio é resultado correto.** Não force peça de enchimento; foi ela
  que criou a repetição de agosto. Relate o slot vazio no resumo.
- **Antes de montar, confira a trava de conteúdo.** Se o formato escolhido vai
  listar as mesmas mostras da última vez que ele rodou, ele não sai — mesmo que
  a data seja outra. O histórico está em `SOCIAL/HISTORICO-DESTAQUE-SOCIAL.md`.

Histórico anti-repetição: `SOCIAL/HISTORICO-DESTAQUE-SOCIAL.md` (uma linha
`AAAA-MM-DD | Venue | Título`). Ao montar `destaque`, exclua venue das últimas 2
entradas e a que está em `foco`. Depois **acrescente a linha do dia**.

Monte pelo renderizador headless, não pelo navegador:

```
cd .render
node render.js <tratamento> <indice> "<caminho de saida>.png"
```

O `render.js` sobe o `post.html` local, seleciona a peça e fotografa o slide em
1080x1350. **Não use o botão "Baixar todas as imagens" com a extensão do Chrome
attachada** — o html2canvas trava o renderer (comprovado em 19/08).

Escolha do tratamento: a imagem manda. Plano geral de sala com obra pequena no
centro morre em `sangria` e `contorno` — nesses casos use `detalhe`, que recorta
e faz a obra preencher o quadro. `duotone` mata cor forte; não use em obra cuja
cor é o assunto.

## Fase 5 — arquivar

Salve em `SOCIAL/<MM>/<DD>/` (o `<DD>` é o dia de referência da peça: hoje para
destaque/nota/carrossel, amanhã para lembrete). Acrescente a legenda ao
`LEGENDAS.md` da pasta como seção `## <Peça> — <hora>`, e escreva embaixo as
**notas de apuração**: de onde veio cada dado, por que a peça foi escolhida, o
que foi corrigido à mão. É esse bloco que permite auditar o post depois.

PNG exportado passa de 4 MB. Recomprima antes de fechar:

```
node .render/comprimir.js
```

Lossless, mesmo nome, mesmo formato — só encolhe (−72% na média).

## O que NUNCA acontece sozinho

- **Postar no Instagram.** A publicação é sempre manual, feita pelo Lucas. A
  rotina monta, arquiva e para.
- **Commitar sem `check.js` aprovado.**
- **Resolver conflito de merge em `dados.js`.**
- **Inventar dado.** Data, endereço, autoria e crédito só entram confirmados na
  fonte. Na dúvida: deixe de fora ou marque "a confirmar" e diga no resumo.

## Se falhar

Não termine em silêncio e não deixe trabalho só na memória. Salve o que foi
produzido em `PENDENTE/` com um `PENDENTE/LEIA.md` datado dizendo o que mudou,
por que falhou e como retomar. Não use a pasta de outputs — ela é efêmera.

Falha numa fase não cancela as outras: varredura travada no domingo não impede
o destaque do site nem a peça de social. Entregue o que deu e relate o resto.

## Resumo final

4 a 8 linhas, em português, começando com uma destas palavras em negrito:

- **PUBLICADO** — houve mudança e o push confirmou. Inclua o hash do commit.
- **SEM CANDIDATA** — nenhuma expo elegível tinha imagem. Liste os títulos.
- **SEM NOVIDADES** — só vale listando o que foi checado.
- **FALHOU** — qualquer outra coisa.

Depois, uma linha por fase que rodou: o que o site ganhou, que peça de social
saiu e por quê, onde o arquivo ficou, o que ficou pendente. Na Fase 4, diga
**qual gatilho acendeu** em cada slot — e, se o slot B ficou vazio, diga que
ficou e por quê. Última linha sempre lembrando que a postagem é manual.

Nunca relate sucesso sem prova.

## Orçamento

| Dia | Páginas externas | Observação |
|---|---|---|
| Segunda a sábado | até 6 | sem varredura, sem Instagram |
| Domingo | até 25 | 3 agregadores + 10 sites + 8 perfis |

Estourou o teto: pare, entregue o que tem, relate o que faltou.
