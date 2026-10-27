# Triagem visual das imagens de mostra

Você é a etapa de JULGAMENTO do `cacar-imagens.js`. A etapa mecânica já rodou: para cada mostra sem imagem boa, há
candidatas baixadas e uma **folha de contato numerada**. Seu trabalho é olhar e decidir. Nada além disso.

## Entrada
- `PENDENTE/cacador/fila.json`: lista de mostras (`key`, `t`, `a`, `v`, `d`, `folha`, `pasta`, `credLegenda`, `candidatos`).
- Para cada mostra, abra a `folha` (Read na imagem). Se uma candidata exigir detalhe, abra o arquivo dela em `pasta`.

## Como decidir (nesta ordem)
1. **É obra, ou foto da obra montada?** Reprodução de trabalho, detalhe de obra, instalação mostrando a obra: serve.
2. **Não serve:** cartaz com texto, flyer, banner de rede social, logo, retrato do artista ou do curador, foto de público
   ou de inauguração, mapa, captura de tela, imagem genérica de fachada. Se for a única, responda `escolha: null`.
3. **Vista de sala** (parede inteira, várias obras, sala vazia): serve só se não houver reprodução de obra. Nesse caso
   marque `"vista": true`. O formato `obra` recusa vista; o site e a agenda aceitam.
4. **Bate com a mostra?** Confira com `t`, `a` e `d`. Imagem de OUTRA mostra da mesma casa é o erro mais caro: na dúvida,
   `null`. Imagem com `jaNoFeed` preenchido já saiu no feed: não escolha.
5. **Dê preferência** a: maior resolução entre as que servem (`serveObra: true`); enquadramento que sobrevive ao corte 4:5
   (assunto no centro); obra inteira em vez de recorte aleatório.
6. **Candidata larga demais** (`serveObra: false`, `serveComFoco: true`): serve se o assunto cabe numa faixa 4:5; informe
   `"foco"` (0 a 100, posição horizontal do recorte) olhando a imagem.

## Crédito (`cred`), sem inventar
- Legenda ou nome de arquivo com autoria explícita (ex.: `FotoJoaoLMusa`, "Foto: Fulano"): `"Foto: Fulano / <casa>"`.
- Legenda dizendo só "Divulgação" ou nada: `"Cortesia <casa>"` (nome da casa exatamente como em `v`).
- Nunca atribua autoria que não esteja na legenda, no nome do arquivo ou na página.

## Saída: `PENDENTE/cacador/decisoes.json`
```json
{
  "Título exato|Casa exata": { "escolha": 2, "cred": "Cortesia Casa", "foco": 40, "vista": false, "motivo": "reprodução da obra X, 2400 px" },
  "Outro título|Outra casa": { "escolha": null, "motivo": "só cartaz com texto" }
}
```
`key` é copiada de `fila.json`, sem alteração. Uma entrada por mostra da fila. `motivo` sempre, curto e verificável.

## Depois
Rode `node cacar-imagens.js --aplicar`. Ele copia a escolhida para `img/`, edita o `dados.js` e roda o `check.js`;
se reprovar, desfaz tudo e você corrige a decisão. **Não edite `dados.js` à mão.**

## Regras que não mudam
- Nada inventado. Dúvida real vira `null` e entra no relatório para o Lucas: é o 1% dele.
- Nunca escolha uma imagem sem tê-la visto.
- Se mais de 40% da fila virar `null`, diga isso no resumo final: é sinal de fonte quebrada, não de mostra sem imagem.
