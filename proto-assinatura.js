/* protótipo (14/11/2026): peça com a assinatura do site: logo com a textura da obra nas letras, obra inteira, data enorme */
const path=require('path'),fs=require('fs');const base=require('./rima.js');const D=require('./direcao.js');
const REND=path.join(base.RAIZ,'.render');const puppeteer=require(path.join(REND,'node_modules','puppeteer-core'));const sharp=require(path.join(REND,'node_modules','sharp'));
(async()=>{
const img=path.resolve(base.RAIZ,process.argv[2]||'img/o-avesso-mazzucchelli-cardoso.jpg');
const pal=D.paletaDaCor(await D.corDaObra(sharp,img));
const tex=path.join(process.env.TEMP,'tex.jpg');await sharp(img).rotate().resize(1400).jpeg({quality:88}).toFile(tex);
const U=x=>x.split(path.sep).join("/"),texU=U(tex),imgU=U(img);
const html=`<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Switzer';src:url('fontes/Switzer-Variable.woff2') format('woff2-variations');font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;background:${D.PAPEL};font-family:Switzer;color:${D.TINTA};position:relative;overflow:hidden}
.logo{position:absolute;left:34px;top:30px;font-weight:800;font-size:178px;letter-spacing:-.06em;line-height:.8;white-space:nowrap;background:url('file:///${texU}') center 40%/cover;-webkit-background-clip:text;color:transparent}
.fio{position:absolute;left:40px;right:40px;top:186px;border-top:4px solid ${D.TINTA}}
.obra{position:absolute;left:0;right:0;top:214px;height:760px;display:flex;justify-content:center;align-items:center}
.obra img{max-height:100%;max-width:100%;object-fit:contain}
.dt{position:absolute;left:40px;top:1000px;font-weight:800;font-size:150px;letter-spacing:-.06em;line-height:.8;text-transform:uppercase}
.dt i{font-style:normal;color:${pal.texto}}
.tt{position:absolute;left:40px;right:40px;top:1150px;font-weight:800;font-size:54px;letter-spacing:-.03em;line-height:.98;text-transform:uppercase}
.sv{position:absolute;left:40px;right:40px;bottom:36px;font-weight:700;font-size:22px;letter-spacing:.14em;text-transform:uppercase;display:flex;justify-content:space-between;color:#6f6a60}
</style><div class="logo">VERNISSAGES SP</div><div class="fio"></div>
<div class="obra"><img src="file:///${imgU}"></div>
<div class="dt">Abre hoje <i>→</i></div>
<div class="tt">O Avesso — Kim Gordon e Valentina Liernur</div>
<div class="sv"><span>Mazzucchelli Cardoso · Cerqueira César</span><span>até 30 jan</span></div>`;
const f=path.join(base.RAIZ,'.proto.html');fs.writeFileSync(f,html);
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--allow-file-access-from-files'],defaultViewport:{width:1080,height:1350}});
const p=await b.newPage();await p.goto('file:///'+U(f),{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:process.env.TEMP+'/proto.png'});await b.close();fs.rmSync(f);console.log('ok')})();
