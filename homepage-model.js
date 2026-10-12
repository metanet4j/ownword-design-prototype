/* 确定性演练数据；产品事实和生产适配边界以核心认知、v0.4.0 PRD 为准。 */
(function(root) {
  const I = typeof module !== 'undefined' ? require('./model.js') : root.OwnwordModel;
  const C = typeof module !== 'undefined' ? require('./content-model.js') : root.OwnwordContentModel;
  const defaults = {profile:'normal',content:'normal',relationship:'normal',proof:'record'};
  const additionalIds=['4','5','6','7'].map(value=>value.repeat(34));
  const additionalProfiles=[I.emptyProfile(),{name:'Eli Park',type:'Person',bio:'Field notes, photographs, and small discoveries.',image:''},{name:'Jules Morgan',type:'Person',bio:'Listening for the everyday.',image:''},{name:'Aster Library',type:'Organization',bio:'A shared collection of independent writing.',image:''}];
  const publicRoute = hash => /^#\/(?:identity\/|content\/)/.test(hash);
  function parseRoute(hash) {
    const match = /^#\/(identity|content)\/([^/?#]+)(?:\/(following|followers|history))?$/.exec(hash);
    if (!match) return {kind:'invalid',id:''};
    try {return {kind:match[1] === 'content' ? match[3]==='history'?'history':'content' : match[3] || 'identity',id:decodeURIComponent(match[2])};}
    catch {return {kind:'invalid',id:''};}
  }
  const validId = id => /^[1-9A-HJ-NP-Za-km-z]{20,64}$/.test(id);
  function resolveIdentity(id,current,scenario='normal') {
    if (!validId(id)) return {status:'invalid'};
    const index=additionalIds.indexOf(id);
    const found = I.resolveIdentity(id,current) || (index>=0?{bapId:id,profile:additionalProfiles[index]}:null);
    if (!found) return {status:'missing'};
    if (scenario === 'failure') return {status:'error',bapId:id};
    return {status:'ready',...found,...(scenario==='missing-fields'?{profile:I.emptyProfile()}:{} )};
  }
  function contentFixtures() {
    const original=C.seed().records[0];
    const media=(key,mime,src,title,publishedAt,author=0)=>({id:key,rootContentId:key,revisionNo:1,authorBapId:I.ids[author],author:{...I.fixtures[author]},title,content:title,publishedAt,txid:({image:'d4',video:'e5',audio:'f6',studio:'17'})[key].repeat(32),confirmation:'confirmed',proof:'unverified',mime,src,status:'published'});
    return [
      {...original,id:'first-words-v2',revisionNo:2,previousContentId:original.id,txid:'c3'.repeat(32),publishedAt:'2026-10-11T09:00:00Z',proof:'valid',content:original.content+'\n\n## A note from the workbench\n\nColour can hold a small memory. This public-domain image is shared as a study, with its source kept visible.\n\n![A painted hand holding colour](fixtures/homepage/painted-hand.jpg)\n\n[Image source](https://github.com/mdn/interactive-examples/tree/main/live-examples/media/cc0-images)'},
      media('image','image/jpeg','fixtures/homepage/painted-hand.jpg','Colour, held in a hand','2026-10-10T11:00:00Z'),
      media('video','video/mp4','fixtures/homepage/flower.mp4','A breeze in the garden','2026-10-09T11:00:00Z'),
      {...media('audio','audio/wav','fixtures/homepage/four-notes.wav','Four notes, one idea','2026-10-08T11:00:00Z'),source:'Local tone study: C, E, G, C.'},
      {...media('studio','image/jpeg','fixtures/homepage/painted-hand.jpg','An experiment in colour','2026-10-09T10:00:00Z',1),source:'MDN CC0 image'},
      {...original,id:'private-draft',txid:'18'.repeat(32),status:'draft',content:'# Private notebook'}
    ].map(record=>record.mime?{source:'MDN CC0 media example',...record}:record);
  }
  function records() {return [...C.load().records,...contentFixtures()];}
  const kind = record => record.mime?.startsWith('image/')?'image':record.mime?.startsWith('video/')?'video':record.mime?.startsWith('audio/')?'audio':'blog';
  function stream(author,all=records()) {
    const groups=new Map();
    for(const record of all.filter(r=>r.authorBapId===author&&r.status!=='draft')) {
      const key=record.rootContentId||record.txid,old=groups.get(key);
      if(!old || record.revisionNo>old.revisionNo || record.revisionNo===old.revisionNo&&record.publishedAt>old.publishedAt)groups.set(key,record);
    }
    return [...groups.values()].sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')||a.txid.localeCompare(b.txid));
  }
  function proof(record,scenario='record') {
    const source=[...C.seed().records,...contentFixtures()].find(r=>r.id===record.id);
    if(!source)return C.proofResult(record,scenario,C.load().operations);
    if(record.content!==source.content||record.authorBapId!==source.authorBapId||record.txid!==source.txid)return 'failed';
    return scenario==='record'?source.proof:['valid','failed'].includes(scenario)?scenario:'unverified';
  }
  const relationshipKey='ownword-v040-public-relationships';
  const operationKey=actor=>'ownword-v040-relationship-ops:'+actor;
  const pending=op=>['submitting','unknown','indexing'].includes(op.phase);
  function relationshipSeed(mode='initial') {
    const [a,b]=I.ids,[c,d,e,f]=additionalIds;
    const rows=mode==='none'?[]:[['follow',a,c],['follow',b,a],['follow',b,c],['follow',b,d],['follow',b,e],['follow',c,b],['follow',d,b]];
    if(mode==='mutual'||mode==='friends')rows.push(['follow',a,b],['follow',b,a],['friend',a,b],['friend',b,a]);
    return {version:1,events:rows.map(([kind,actor,target],index)=>({id:'seed-'+index,kind,actor,target,signature:'sample',indexed:true,txid:(index+32).toString(16).padStart(2,'0').repeat(32)}))};
  }
  function loadRelationships(storage) {
    try {
      storage=storage||root.localStorage;
      const raw=storage.getItem(relationshipKey);if(!raw)return relationshipSeed();
      const data=JSON.parse(raw);
      if(data.version!==1||!Array.isArray(data.events)||data.events.some(e=>!validId(e.actor)||!validId(e.target)||!['follow','unfollow','friend'].includes(e.kind)||typeof e.id!=='string'))throw Error('schema');
      return data;
    } catch {return {...relationshipSeed(),readFailure:true};}
  }
  function loadOperations(actor,storage,recover=false) {
    if(!actor)return {operations:[],readFailure:false};
    try {
      storage=storage||root.localStorage;
      const raw=storage.getItem(operationKey(actor)),operations=raw?JSON.parse(raw):[];
      if(!Array.isArray(operations)||operations.some(op=>op.actor!==actor||!validId(op.target)||typeof op.id!=='string'||!['authorize','submitting','unknown','indexing','verified','cancelled','failed','not-received'].includes(op.phase)))throw Error('schema');
      return {operations:operations.map(op=>({...op,phase:recover?(op.phase==='authorize'?'cancelled':op.phase==='submitting'?'unknown':op.phase):op.phase})),readFailure:false};
    } catch {return {operations:[],readFailure:true};}
  }
  function relation(data,actor,target) {
    if(data.readFailure)return {known:false};
    const directions=new Map(),friends=new Set();
    for(const event of data.events.filter(e=>e.indexed&&e.signature==='sample')) {
      const key=event.actor+'>'+event.target;
      if(event.kind==='friend')friends.add(key);else directions.set(key,event.kind==='follow');
    }
    const outward=friends.has(actor+'>'+target),inward=friends.has(target+'>'+actor);
    return {known:true,following:directions.get(actor+'>'+target)===true,followedBy:directions.get(target+'>'+actor)===true,friend:outward&&inward?'friends':outward?'sent':inward?'received':'none'};
  }
  function relationshipList(data,id,direction) {
    if(data.readFailure)return null;
    const targets=new Set(data.events.flatMap(e=>[e.actor,e.target]));
    return [...targets].filter(target=>target!==id&&relation(data,id,target)[direction==='following'?'following':'followedBy']).sort();
  }
  function actionError(data,actor,target,action) {
    if(!actor||actor===target||!validId(actor)||!validId(target))return 'identityChanged';
    const state=relation(data,actor,target);if(!state.known)return 'relationshipUnknown';
    if(action==='follow'&&state.following||action==='unfollow'&&!state.following||action==='request'&&state.friend!=='none'||action==='accept'&&state.friend!=='received')return 'relationshipChanged';
    return '';
  }
  function saveOperation(storage,operation) {
    const loaded=loadOperations(operation.actor,storage);if(loaded.readFailure)throw Error('relationshipStorage');
    const operations=[...loaded.operations.filter(op=>op.id!==operation.id),operation];
    storage.setItem(operationKey(operation.actor),JSON.stringify(operations));return operations;
  }
  function beginOperation(storage,actor,target,action,names={}) {
    const data=loadRelationships(storage),loaded=loadOperations(actor,storage);
    if(loaded.readFailure||data.readFailure)throw Error('relationshipStorage');
    if(loaded.operations.some(op=>op.target===target&&pending(op)))throw Error('relationshipPending');
    const error=actionError(data,actor,target,action);if(error)throw Error(error);
    const id=root.crypto?.randomUUID?.()||C.newId();
    const op={id,actor,target,action,...names,phase:'authorize',createdAt:new Date().toISOString(),txid:id.replace(/[^a-f0-9]/gi,'').padEnd(32,'0').slice(0,32).repeat(2)};
    saveOperation(storage,op);return op;
  }
  function submitOperation(storage,op,signer) {
    if(signer!==op.actor)throw Error('relationshipMismatch');
    const error=actionError(loadRelationships(storage),op.actor,op.target,op.action);if(error)throw Error(error);
    const other=loadOperations(op.actor,storage);if(other.readFailure)throw Error('relationshipStorage');
    const original=other.operations.find(x=>x.id===op.id);if(!original||original.phase!=='authorize')throw Error('relationshipPending');
    if(other.operations.some(x=>x.id!==op.id&&x.target===op.target&&pending(x)))throw Error('relationshipPending');
    const next={...op,phase:'submitting',signature:'sample'};saveOperation(storage,next);return next;
  }
  function acceptOperation(storage,op,indexed=true) {
    const data=loadRelationships(storage);if(data.readFailure)throw Error('relationshipStorage');
    if(op.signature!=='sample')throw Error('relationshipMismatch');
    const prior=data.events.find(e=>e.id===op.id);
    const event=prior?{...prior,indexed:prior.indexed||indexed}:{id:op.id,actor:op.actor,target:op.target,kind:['request','accept'].includes(op.action)?'friend':op.action,signature:'sample',txid:op.txid,indexed,acceptedAt:new Date().toISOString()};
    const next={version:1,events:[...data.events.filter(e=>e.id!==op.id),event]};
    // 公开事件先落盘；私有结果写入失败时，可凭原操作 ID 查询恢复，不能重发。
    storage.setItem(relationshipKey,JSON.stringify(next));
    const operation={...op,phase:event.indexed?'verified':'indexing'};saveOperation(storage,operation);return {data:next,operation};
  }
  function queryOperation(storage,op,result) {
    const data=loadRelationships(storage);if(data.readFailure)throw Error('relationshipStorage');
    if(data.events.some(e=>e.id===op.id)||result==='accepted')return acceptOperation(storage,op,true);
    const operation={...op,phase:result==='not-received'?'not-received':'unknown'};saveOperation(storage,operation);return {data,operation};
  }
  const api = {defaults,additionalIds,publicRoute,parseRoute,validId,resolveIdentity,records,contentFixtures,kind,stream,proof,relationshipKey,operationKey,pending,relationshipSeed,loadRelationships,loadOperations,relation,relationshipList,actionError,saveOperation,beginOperation,submitOperation,acceptOperation,queryOperation};
  if (typeof module !== 'undefined') module.exports=api; else root.OwnwordHomepageModel=api;
})(typeof window !== 'undefined' ? window : globalThis);
