# PENDENTE — 2026-09-14 (rotina de domingo, `vsp-semana`)

## O que falhou

**Acesso à rede continua bloqueado — segunda semana seguida.** Testado
`WebFetch` em dois domínios (`masp.org.br` e `example.com`, este último só
para confirmar que não é bloqueio por domínio): ambos voltaram
`EGRESS_BLOCKED`. Mesma causa raiz do `PENDENTE/LEIA.md` de 13/09: política de
rede do ambiente de nuvem, não algo específico de site.

Sem `WebFetch` funcionando, o Passo 3 do runbook — abrir a página da própria
casa pra confirmar título, datas e cidade antes de escrever no `dados.js` — é
impossível de novo. **Nada foi escrito em `dados.js` nesta rodada.**

## O que verifiquei antes de desistir

- `git pull --rebase origin main`: limpo, sem conflito, sem commit novo do
  remoto além do que já estava (`508eb53`, o próprio `FALHOU` de 13/09).
- Issues `radar` abertas: **#4** (2026-09-12) e **#2** (2026-09-05) — as
  mesmas de semana passada. Conferido via `mcp__github__actions_list` que o
  `radar.yml` só rodou duas vezes no total (05/09 e 12/09); **não rodou de
  novo desde então**, então não há conteúdo novo pra tratar além do que já
  estava pendente.
- Issues `garimpo` abertas: **#5** (2026-09-12), **#3** (2026-09-05), **#1**
  (2026-08-29) — mesmas quatro propostas de imagem de sempre (Itaú Cultural
  ×2, Sesc Pinheiros, MAM São Paulo), agora **quatro semanas** sem decisão.
  Mesma trava de rede impede abrir as URLs de imagem pra julgar obra vs.
  cartaz.
- `node check.js` no estado atual (sem nenhuma edição minha): termina em
  **"OK. Pode commitar."** — o `E20` que travava a semana passada
  (Galeria Museu da Imigração repetida em `foco`) não aparece mais; a diária
  já rodou e resolveu sozinha, como esperado. Isso só confirma que a base
  está saudável — não há nada meu para commitar nela.

## Pendências (sem mudança de conteúdo desde 13/09 — ver aquele arquivo para o detalhe completo)

- Issue #4: 2 mostras novas (MASP — *Histórias Latino-Americanas*; DAN
  Galeria — *Por Elas, Com Elas*), 2 divergências de data/venue (Sol Calero
  no MASP; Paula Siebra na Mendes Wood DM), 4 casas não mapeadas (Casa
  Bradesco, Estação Pinacoteca, Galeria Base, Biblioteca Mário de Andrade),
  3 editais possíveis (PIPA/Gasworks — prazo lido 13/09, **já deve ter
  vencido**; Salão de Goiás; Quadrienal de Praga).
- Issue #2: mesmo conteúdo, mais antiga, considerar fechar depois que a #4
  for aplicada.
- Garimpo #5/#3/#1: 4 propostas de imagem sem decisão há 4 semanas.

## Como retomar

1. Confirmar que o ambiente de nuvem tem saída de rede liberada **antes** de
   iniciar a rotina — um `WebFetch` de teste em qualquer domínio resolve a
   dúvida em segundos.
2. Se seguir bloqueado numa terceira semana, vale o Lucas revisar a
   configuração de rede deste ambiente (`claude.ai/code/routines` ou as
   configurações do ambiente de execução) — duas falhas seguidas pela mesma
   causa sugerem política de rede, não instabilidade pontual.
3. Com rede disponível: repetir o Passo 3 usando a issue #4 (já cobre tudo
   da #2). O edital do PIPA/Gasworks provavelmente já venceu (prazo lido
   13/09) — confirmar e, se vencido, ignorar antes de gastar tempo nele.
4. Revisar as 4 propostas de `garimpo` acumuladas de uma vez, já que nenhuma
   foi decidida em um mês.
