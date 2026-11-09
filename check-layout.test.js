/* Guarda da secao "Abre esta semana" na home. Rode com: node check-layout.test.js (o check.yml tambem roda).
   Historico (nov/2026): o cartao de reserva laranja (.im.sem), sem position:relative, jogava titulo e data
   por cima da pagina inteira. Regra do Lucas: NAO EXISTE cartao de reserva. Mostra sem imagem nao aparece
   na secao; se nenhuma tem imagem, a secao some. */
var fs = require("fs");
var html = fs.readFileSync(__dirname + "/index.html", "utf8");
var erros = [];
function exige(cond, msg) { if (!cond) erros.push(msg); }

var fn = html.match(/function renderSemana\(\)\{[\s\S]*?\n\}\n/);
exige(fn, "renderSemana nao encontrada");
var corpo = fn ? fn[0] : "";
exige(/comImg\s*=\s*wk\.filter\(e=>e\.img&&String\(e\.img\)\.trim\(\)\)/.test(corpo), "renderSemana precisa filtrar so mostras COM imagem (comImg)");
exige(/if\(!comImg\.length\)\{sec\.hidden=true;return;\}/.test(corpo), "sem mostra com imagem a secao tem que sumir (sec.hidden=true)");
exige(!/class="im sem"|'sem'/.test(corpo), "proibido cartao de reserva (.im.sem) em renderSemana");
exige(/onerror="semanaSemImg\(this\)"/.test(corpo), "imagem quebrada tem que remover o cartao (semanaSemImg)");
exige(/function semanaSemImg\(img\)\{/.test(html), "falta a funcao semanaSemImg");
exige(!/\.cartao \.im\.sem/.test(html), "CSS do cartao de reserva (.cartao .im.sem) nao pode voltar");
exige(/\.pino\.curto\{/.test(html), "falta .pino.curto (secao curta, sem pin, quando os cartoes cabem na tela)");
exige(/dist\(\)<=\d+\)\{[^}]*classList\.add\('curto'\)/.test(html), "o pin do trilho precisa pular quando dist()<=limite");

if (erros.length) { console.error("FALHOU layout da home:\n- " + erros.join("\n- ")); process.exit(1); }
console.log("ok: secao Abre esta semana (so com imagem, sem cartao de reserva, sem pin vazio)");
