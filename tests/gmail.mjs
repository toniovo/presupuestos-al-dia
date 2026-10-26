import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile('integraciones/gmail/AutoRespuestas.gs','utf8');
function run(auto,safe){
  const logRows=[['Fecha','ID mensaje','Remitente','Estado','Detalle']];
  const log={getLastRow:()=>logRows.length,appendRow:row=>logRows.push(row),getRange:(row)=>({setValues:values=>{logRows[row-1].splice(3,2,...values[0]);}})};
  let sentCount=0,draftCount=0;
  const msg={isDraft:()=>false,isInInbox:()=>true,getFrom:()=>'<cliente@example.com>',getId:()=>`id-${auto}-${safe}`,getPlainBody:()=> 'Quiero remodelar la cocina. ¿Qué datos necesitan para cotizar?',reply:()=>{sentCount++},createDraftReply:()=>{draftCount++}};
  const labels={};
  const thread={getMessages:()=>[msg],removeLabel:()=>{},addLabel:()=>{}};
  labels['PAD/Por responder']={getThreads:()=>[thread]};
  labels['PAD/Revisar']={};labels['PAD/Respondido']={};
  const ctx={
    LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
    PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'test-key'})},
    GmailApp:{getUserLabelByName:name=>labels[name],getAliases:()=>[]},
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>log}),flush:()=>{}},
    Session:{getEffectiveUser:()=>({getEmail:()=> 'negocio@example.com'})},
    MailApp:{getRemainingDailyQuota:()=>10},
    Date
  };
  vm.createContext(ctx);
  vm.runInContext(source,ctx);
  ctx.cargarAjustesIA_=()=>({auto,business:'Negocio',services:'Cocinas',zone:'Zona Norte',rules:'Pedir fotos'});
  ctx.analizarConsultaIA_=()=>({safe_to_send:safe,reply:'Gracias por consultar. ¿Podés enviarnos fotos?'});
  ctx.yaRegistradoIA_=()=>false;
  ctx.procesarConsultasIA();
  return {sentCount,draftCount,status:logRows[1][3]};
}
assert.deepEqual(run(false,true),{sentCount:0,draftCount:1,status:'BORRADOR'});
assert.deepEqual(run(true,true),{sentCount:1,draftCount:0,status:'ENVIADO'});
assert.deepEqual(run(true,false),{sentCount:0,draftCount:1,status:'BORRADOR'});
console.log('Casilla apagada, envío permitido y revisión obligatoria: OK');
