# PENDENTE — 2026-09-13 (rotina de domingo, `vsp-semana`)

## O que falhou

**Acesso à rede bloqueado nesta execução.** Todo `WebFetch` para domínio externo
voltou `EGRESS_BLOCKED` — inclusive `example.com` e `artequeacontece.com.br`,
não só os sites das casas (`masp.org.br`, `dangaleria.com.br`,
`mendeswooddm.com`). Não é bloqueio de domínio específico: é a política de
rede deste ambiente de nuvem, que não abre internet geral (só os hosts de
pacote/API já liberados por padrão). Sem isso, o Passo 3 do runbook — abrir a
página da própria casa pra confirmar título, datas e cidade antes de escrever
no `dados.js` — é impossível de cumprir.

Como o S1 existe justamente para *confirmar antes de aplicar*, e a trava
"nunca inventar dado" é absoluta, **nada foi escrito em `dados.js` nesta
rodada.** `git pull --rebase` rodou limpo (sem conflito, sem novidade do
remoto).

## O que ficou pendente, por issue

### Issue #4 — Radar de fontes, 2026-09-12 (a mais recente; ainda aberta)

Supersede a #2 (abaixo) no essencial — mesmos dois itens de divergência, e as
"novas" da #2 continuam de fora da base.

**Novas — casa já mapeada (confirmar em `masp.org.br` e `dangaleria.com.br`):**
- *Histórias Latino-Americanas* — MASP, 2026-09-04 → 2026-12-31. Confirmar
  título, datas, e achar um fato concreto pro campo `d` (não usar o texto do
  agregador).
- *Por Elas, Com Elas: Do Moderno ao Contemporâneo* — DAN Galeria,
  2026-09-09 → 2026-11-07. Idem.

**Divergência de data (confirmar em `masp.org.br` e `mendeswooddm.com`):**
- *Casa María Lionza — Sol Calero* (MASP, já na base): base tem
  `fim:"2027-01-30"`, agregador diz `2027-05-30`. Abrir a página oficial e
  corrigir o campo `fim` com o que estiver lá — hoje a base pode estar errada
  (encerrando cedo demais) ou o agregador pode estar errado (data longe
  demais). Linha 138 do `dados.js`.
- *Pequeno mapa do tempo — Paula Siebra* (Mendes Wood DM, já na base, linha
  160): checar se "Mendes Wood DM — Casa Iramaia" (o que a base tem) é
  mesmo o espaço da mostra, ou se o agregador está certo ao casar só com
  "Mendes Wood DM" (espaço principal, Barra Funda). Ajustar `v:` se for o
  caso.

**Casa não mapeada (só relatar, não adicionar venue — vale registrar pro
Lucas decidir):** Casa Bradesco, Estação Pinacoteca, Galeria Base, Biblioteca
Mário de Andrade – BMA.

**Editais possíveis novos (confirmar prazo, quem pode se inscrever, taxa e
elegibilidade SP na fonte oficial, um por um):**
- *Residência Artística The PIPA Foundation na Gasworks* — prazo lido no
  texto: 2026-09-13 (**hoje** — pode já estar vencido a esta altura;
  confirmar e, se vencido, ignorar). Link:
  https://www.premiopipa.com/2026/09/residencia-artistica-the-pipa-foundation-na-gasworks-abertura-das-inscricoes-em-1309/
- *2º Salão Nacional de Arte Contemporânea de Goiás* — prazo lido: 2026-09-25,
  mas o trecho do próprio texto fala em inscrições "até 24 de maio" — checar
  se há prorrogação real ou se o prazo lido está errado. Link:
  https://dasartes.com.br/de-arte-a-z/2o-salao-nacional-de-arte-contemporanea-de-goias-oferece-r-160-mil-em-premiacoes/
- *Estudantes brasileiros — Quadrienal de Praga* — prazo lido: 2026-10-31,
  conferir se cabe artista/estudante com atuação em SP. Link:
  https://dasartes.com.br/de-arte-a-z/estudantes-brasileiros-ganham-convocatoria-para-a-quadrienal-de-praga/

### Issue #2 — Radar de fontes, 2026-09-05 (mais antiga, também aberta)

Parece nunca ter sido processada (nenhum dos itens está no `dados.js`). O
único item que não repete na #4 é *Síntese — Arte e Tecnologia* (Itaú
Cultural, "pode ter encerrado") — já não está em `dados.js`, então esse já
saiu da base por conta própria e não precisa de ação. O resto (a mostra nova
do MASP, as duas divergências, as casas não mapeadas) é o mesmo conteúdo da
#4, tratado acima. Vale considerar fechar a #2 depois que a #4 for aplicada,
pra não duplicar trabalho todo domingo.

### Issues de `garimpo` (#5, #3, #1) — imagens propostas

Também dependem de abrir a URL da imagem pra julgar obra vs. cartaz (mesma
trava de rede). As mesmas quatro propostas (Itaú Cultural ×2, Sesc Pinheiros,
MAM São Paulo) aparecem repetidas desde 29/08 sem decisão — nenhuma foi
aceita ou recusada em três semanas. Não estava no escopo desta rodada
(PASSOS do prompt só detalham a issue `radar`), mas registra aqui porque tem
a mesma causa raiz.

## Achado à parte — não é desta rotina, mas trava o `check.js`

`node check.js` reprovou (rodada de hoje, sem nenhuma mudança minha) por
**um** erro bloqueante:

```
[E20] Galeria Museu da Imigração esteve em foco em 2026-09-11, dentro da
janela de 7 dias. Escolha outra.
```

Isso é competência da diária (`destaque.js`/`diaria.yml`), não do S1 — a
trava do runbook proíbe esta rotina de mexer em `foco`/`destaques`. Só
registro porque, se alguém tentar commitar qualquer coisa em `dados.js` hoje
(inclusive as correções acima, quando a rede voltar), o `check.js` vai
reprovar por essa razão até a diária rodar de novo e escolher outro destaque.
Também sinaliza `atualizado` desatualizado (11/09) e o de sempre, `E13` da
Coletivo Poíesis vencida — limpeza que é da diária, não do domingo.

## Como retomar

1. Confirmar que o ambiente de nuvem tem saída de rede liberada (testar
   `WebFetch` num domínio qualquer antes de tentar os sites das casas).
2. Repetir o Passo 3 do runbook usando a issue #4 como base (ela já contém
   tudo que a #2 tem, mais um item novo).
3. Depois de aplicar, `node check.js` só vai fechar OK se a diária já tiver
   resolvido o `E20` acima — checar isso antes de gastar tempo tentando
   commitar.
4. Considerar fechar as issues #2, #4 (radar) depois de aplicadas, e revisar
   as três `garimpo` acumuladas de uma vez.
