# PENDENTE — 20/09/2026 (domingo, vsp-semana)

## O que travou

`node check.js` reprova com um erro que **não vem** do meu trabalho de hoje:

```
[E20] Galeria Casa de Cultura do Parque esteve em foco em 2026-09-18,
dentro da janela de 7 dias. Escolha outra.
```

Confirmei isso rodando `check.js` em cima do `dados.js` original (antes de
qualquer edição minha, via `git stash`) — o erro já estava lá. Causa raiz: o
`destaque.js` (rotina diária, `diaria.yml`) rodou com sucesso em 19/09 e
20/09, mas nas duas execuções concluiu **"SEM CANDIDATA. O foco fica como
está e nada é commitado"** — 0 mostras elegíveis, a maioria sem `img`/`cred`.
Como o `FOCO` não avançou, ele continua apontando pra Casa de Cultura do
Parque desde 18/09, e isso está dentro da janela de 7 dias que o `check.js`
proíbe (`E20`). Esse erro é incondicional (não depende de `--exige-hoje`) —
trava qualquer commit em `dados.js`, meu ou da diária, até o `FOCO`
avançar.

Runbook: nunca mexo em `foco`/`destaques` (é da diária via Action) e nunca
commito sem `check.js` aprovado. As duas regras juntas me impedem de
desbloquear isso sozinho — é uma decisão do Lucas.

**Possível decisão para destravar** (não tomei, é curatorial): ajustar o
`FOCO`/`DESTAQUES` manualmente para uma mostra elegível de outra galeria, ou
avaliar se a janela de 7 dias do `E20` faz sentido continuar tão rígida
quando `destaque.js` fica preso em "sem candidata" por falta de imagem —
como aconteceu agora.

## O que eu apurei e confirmei (issues `radar` #6 e `garimpo` #7)

Está em `PENDENTE/dados-2026-09-20.patch` (diff contra o `dados.js` do
commit `de5567f`), pronto pra aplicar assim que o `check.js` voltar a
aprovar:

```
git apply PENDENTE/dados-2026-09-20.patch
node check.js   # deve terminar em "OK. Pode commitar." assim que o E20 sumir
git add -A && git commit -m "..." && git push origin main
rm PENDENTE/dados-2026-09-20.patch PENDENTE/LEIA.md   # depois de aplicado
```

Conteúdo do patch, um por um:

- **Beatriz Milhazes: gravuras do acervo da Pinacoteca** — troquei o venue de
  "Pinacoteca de São Paulo" pra "Estação Pinacoteca". Confirmado no site da
  Pinacoteca: a mostra é no prédio Pina Estação, que tem entrada própria no
  `VENUES` (endereço e Instagram diferentes do prédio Luz).
- **um ato fotográfico — Alice Yura** e **Macunaíma é Duwid** (Pinacoteca de
  São Paulo) — removidas. `fim` 2026-09-13 já tinha passado e nenhuma das
  duas aparece mais na lista de exposições em cartaz do site oficial da
  Pinacoteca.
- **Mendes Wood DM — Casa Iramaia** — endereço confirmado no site oficial:
  "R. Iramaia, 105" (tirei o "a confirmar").
- **Histórias Latino-Americanas** (MASP) — divergência do radar era da
  fonte agregadora (Arte Que Acontece), não da base: confirmei no site do
  MASP que o `fim` 2027-01-31 já cadastrado está correto.
- **Casa María Lionza — Sol Calero** (MASP) — **não confirmei** o `fim`. A
  página oficial da mostra no site do MASP só traz a data de abertura
  (03/07/2026), sem data de encerramento em lugar nenhum que eu tenha
  achado. Nem a base (2027-01-30) nem o agregador (2027-05-30) puderam ser
  confirmados na fonte — deixei como estava. Fica pendente de fato.
- **Imagens confirmadas** (`garimpo` #7), abri e olhei cada uma, adicionei
  `img`/`cred` só nas que eram obra de verdade, não cartaz/flyer/tipografia:
  - Constelação em trânsito (Galpão da Lapa) — peças cerâmicas na parede.
  - Por Elas, Com Elas (DAN Galeria) — escultura, close.
  - Autobiografia de um Fio — Sheila Hicks (Galeria Nara Roesler) — têxtil,
    crédito confirmado na página: "Foto Tatiana Mito / Cortesia Nara
    Roesler".
  - ambiguidade construtiva e ativação do espaço — Wolfram Ullrich (Galeria
    Raquel Arnaud) — vista de sala (`vista:true`); crédito Elizabeth Jobim
    já estava anotado no campo `d` da própria base.
  - Longitudes — Johanna Calle e Cavalinhas e Falésias — Carolina Colichio
    (ambas Galeria Marília Razuk).
  - **Rejeitei** as outras 6 propostas do `garimpo`: retrato de pessoa sem
    relação com a mostra (Itaú/Brasil das Múltiplas Faces), dois cartazes
    tipográficos puros (Itaú/Solange Pessoa, Sesc/Delírio Tropical), um
    banner que é print de tela sem crédito (MAM/39º Panorama) e uma
    ilustração gráfica de skyline, não foto de obra (Ema Klabin). "Sempre
    Acesa" (Galeria Luis Maluf) também fica de fora: a mostra já encerrou
    (`fim` 2026-09-16).
- **Edital "2º Salão Nacional de Arte Contemporânea de Goiás"** (issue
  `radar`) — **não entra**. O próprio texto da matéria-fonte (Dasartes) diz
  que as inscrições foram de "2 de abril a 24 de maio" de 2026 — prazo já
  vencido, mesmo a extração automática tendo lido 25/09/2026 por engano.
- **Casa não mapeada** (Casa Bradesco, Galeria Base, Biblioteca Mário de
  Andrade — BMA) — só relato, não adicionei venue, conforme runbook.
- **`atualizado`** — atualizei pra 20/09/2026 dentro do patch.

## Issues antigas ainda abertas

`radar` #4 (12/09) e #2 (05/09) seguem abertas no GitHub mas já estão
obsoletas — a base already avançou (91→125 casas, contagens de mostra
mudaram) desde então, sinal de que já foram tratadas em domingos
anteriores e só não foram fechadas. Não fechei nenhuma issue — não é meu
escopo.

## Como retomar

1. Resolver o impasse do `FOCO`/`E20` (decisão do Lucas, ou deixar a
   diária achar uma candidata sozinha assim que houver mostra elegível —
   o que este patch, uma vez aplicado, ajuda a viabilizar).
2. Aplicar `PENDENTE/dados-2026-09-20.patch`.
3. Rodar `node check.js` de novo — só commitar se aprovado.
4. Apagar os dois arquivos deste `PENDENTE/` depois de aplicado.
