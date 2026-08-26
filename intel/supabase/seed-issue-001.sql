-- Vernissages SP: Intel — Edição Nº 1
--
-- Conteúdo com curadoria factual: a agenda vem direto do acervo.json do
-- site principal (base já validada por check.js); o radar de mercado e a
-- leitura de mercado citam apenas fatos publicados e verificáveis:
--   - SP-Arte Rotas 2026 (26–30/08, ARCA, 70 galerias, direção artística
--     de Bernardo Mosqueira): https://revistazelo.com.br/sp-arte-rotas-2026-reune-70-galerias-e-amplia-dialogo-com-a-producao-latino-americana/
--   - Trajetória de Bernardo Mosqueira (ISLAA Nova York 2023–2025, New
--     Museum 2021–2023): mesma fonte acima.
--   - Raio-x de vendas da SP-Arte 2026 (abril, recorde da Galatea, 38%
--     dos galeristas com queda de lucratividade): https://artequeacontece.com.br/vendas-da-sp-arte-2026-batem-recordes-mas-concentracao-nos-grandes-tickets-preocupa-galerias-menores/
--
-- Rode isto no SQL Editor do Supabase depois que a tabela newsletter_issues
-- existir (supabase/schema.sql). Ajuste "scheduled_for" se o domingo já
-- tiver passado antes de aplicar.

insert into newsletter_issues (subject, preview_text, intro, sections, market_read, scheduled_for)
values (
  $sub$Edição Nº 1 — o quarteirão que decide setembro$sub$,

  $prev$Dois fechamentos no domingo, a Mendes Wood DM em dois endereços na mesma semana, e o raio-x que a SP-Arte não pôs no release.$prev$,

  $intro$Esta é a primeira edição do Vernissages SP: Intel. Direto ao ponto: o que vence essa semana, o que abriu valendo rota, e um número de mercado que não apareceu em nenhum release.$intro$,

  $sections$[
    {
      "heading": "Agenda cronometrada da semana",
      "body": "Dois prazos vencem já na segunda-feira: 'Síntese — Arte e Tecnologia', no Itaú Cultural, e 'Natureza Tecida — Somos Um Único Fio', no Mata Lab — depois de 31/08 só resta o site. 'Playful, Stormy, Continuing', de Ayako Rokkaku no pop-up da Baró Galeria (R. Amauri, 62), fecha no domingo seguinte (03/09) — é o tipo de mostra que enche no fim de semana final. Do lado de quem abriu: a Mendes Wood DM está tocando dois calendários ao mesmo tempo — Daniel Jorge e Jean Claracq na sede da Barra Funda, e Paula Siebra na Casa Iramaia, no Jardim Europa, com menos de uma semana de diferença entre as duas aberturas."
    },
    {
      "heading": "Radar de movimentações",
      "body": "A SP-Arte Rotas 2026 fechou domingo (30/08) na ARCA com 70 galerias — seis vieram de fora do Brasil, contra três na edição passada. Quem assinou a direção artística foi Bernardo Mosqueira, direto do Institute for Studies on Latin American Art (ISLAA), em Nova York, onde foi curador-chefe entre 2023 e 2025, depois de passagem pela equipe curatorial do New Museum. Trazer um nome com esse trânsito internacional para desenhar uma feira paulistana é aposta institucional, não acaso — vale acompanhar quem ele convida pra próxima edição."
    },
    {
      "heading": "Onde circular",
      "body": "Jardim Europa concentrou quatro aberturas em menos de dez dias — Luciana Brito Galeria (Av. Nove de Julho, 5162), a Casa Iramaia da Mendes Wood DM, o pop-up da Baró na R. Amauri e a Galeria Contempo na Al. Gabriel Monteiro da Silva — todas a poucos minutos a pé umas das outras. É o quarteirão que concentra o maior trânsito de colecionadores nas próximas duas semanas: uma tarde só ali rende mais do que um dia inteiro espalhado pela cidade. Outro ponto que chamou atenção na nossa base: Almeida & Dale e Millan aparecem dividindo programação em pelo menos quatro mostras simultâneas neste ciclo — Thiago Martins de Melo, Rita Lessa, André Ricardo e Nino Kapanadze. Duas casas de peso próximas assim, por tempo suficiente, normalmente não é coincidência."
    }
  ]$sections$::jsonb,

  $mkt$A 22ª SP-Arte, em abril, fechou com dezenas de milhões de reais em negócios no Pavilhão da Bienal e recorde histórico da Galatea — 59 obras vendidas. Mas o levantamento que circulou depois da feira revelou a rachadura por trás do número redondo: 38% dos galeristas ouvidos relataram queda de lucratividade, e a faixa que mais vendeu foi a de obras até R$ 30 mil, muitas vezes de artistas pouco conhecidos. Recorde de vendas não é o mesmo que saúde financeira distribuída — o giro aumentou na base da pirâmide, não necessariamente no caixa das galerias médias. Para quem compra: a janela de entrada em nomes emergentes ainda está com preço de antes da fila aumentar.$mkt$,

  '2026-08-30 23:00:00+00'
);
