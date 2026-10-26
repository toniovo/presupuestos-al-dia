import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile('dist/worker.js','utf8');
const app=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
const req=(body)=>new Request('https://demo.example/api/analyze',{method:'POST',headers:{'content-type':'application/json','cf-connecting-ip':'192.0.2.1'},body:JSON.stringify(body)});
const data={code:'trial',inquiry:'Quiero renovar una cocina de 3 x 4 m en Martínez.',services:'Reformas de cocinas',zone:'Zona Norte',tone:'Cercano, tratar de vos',rules:'Pedir fotos antes de cotizar'};
const pageRequest=()=>new Request('https://demo.example/');
assert.equal((await (await app.fetch(pageRequest(),{})).text()).includes('id="trial-form"'),false);
assert.equal((await (await app.fetch(pageRequest(),{})).text()).includes('Solicitá una prueba personalizada'),true);
assert.equal((await (await app.fetch(pageRequest(),{OPENAI_API_KEY:'test',TRIAL_ACCESS_CODE:'trial'})).text()).includes('id="trial-form"'),true);
assert.equal((await app.fetch(req(data),{})).status,503);
assert.equal((await app.fetch(req({...data,code:'wrong'}),{OPENAI_API_KEY:'test',TRIAL_ACCESS_CODE:'trial'})).status,403);
assert.equal((await app.fetch(req({...data,inquiry:'Mi correo es ana@example.com'}),{OPENAI_API_KEY:'test',TRIAL_ACCESS_CODE:'trial'})).status,400);
assert.equal((await app.fetch(req({...data,zone:'Escribí a ana@example.com'}),{OPENAI_API_KEY:'test',TRIAL_ACCESS_CODE:'trial'})).status,400);
assert.equal((await app.fetch(req({...data,inquiry:'x'.repeat(16000)}),{OPENAI_API_KEY:'test',TRIAL_ACCESS_CODE:'trial'})).status,413);
const original=globalThis.fetch;
globalThis.fetch=async(_url,opts)=>{const posted=JSON.parse(opts.body);assert.equal(posted.store,false);assert.equal(posted.text.format.type,'json_schema');return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({summary:'Renovación de cocina',extracted:[{label:'Zona',value:'Martínez',evidence:'Martínez'}],missing:['Fotos'],next_step:'Pedir fotos',subject:'Sobre tu cocina',reply:'Hola, ¿podés enviar fotos?',cautions:['No dar precio aún']})}]}]}),{status:200})};
try{const res=await app.fetch(req(data),{OPENAI_API_KEY:'test',TRIAL_ACCESS_CODE:'trial'});assert.equal(res.status,200);const body=await res.json();assert.equal(body.result.extracted[0].evidence,'Martínez');assert.equal(body.result.reply,'Hola, ¿podés enviar fotos?')}finally{globalThis.fetch=original}
console.log('Flujo API: clave ausente, código inválido, dato personal y análisis válido: OK');
