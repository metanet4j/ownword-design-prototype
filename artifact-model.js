/* Deterministic local fixtures. No wallet, network or cryptographic claims. */
(function(root) {
  const KEY='ownword-artifact-v030';
  const identities=['2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD','3GkA8rRtC4a6oX9PzM2cV7mHxTqB5wEeNs'];
  const addresses=['1BoatSLRHtKNngkdXEeobR76b53LETtpyT','1BitcoinEaterAddressDontSendf59kuE'];
  const tx=n=>n.toString(16).padStart(64,'0');
  function seed() {
    const asset=(n,name,number,owner,extra={})=>({id:tx(n)+'_0',origin:tx(n)+'_0',outpoint:tx(n)+'_0',name,mapName:name,number,ordinal:String(100000+n),confirmations:12,numberCheck:'verified',observedAt:'2026-09-18T12:00:00Z',owner,creator:identities[1],content:{kind:'brand',type:'image/svg+xml'},originValid:true,ownershipCheck:'verified',transactions:[{kind:'create',txid:tx(n),bapId:identities[1],signer:'1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',signature:'valid',keyEpoch:'historical-key-at-creation',confirmations:12}],...extra});
    return {version:1,revision:0,assets:[asset(165,'A place to stand','165',addresses[0]),asset(2048,'The quiet horizon','2048',addresses[0],{confirmations:5}),asset(3072,'Open sky','3072',addresses[1]),asset(4096,'An earlier chapter','4096',addresses[0]),asset(9001,'Beyond safe integers','900719925474099312345',addresses[1])],bindings:[{id:'binding-165',assetId:tx(165)+'_0',bapId:identities[0],state:'current',validity:'valid'},{id:'binding-4096',assetId:tx(4096)+'_0',bapId:identities[0],state:'history',validity:'valid'},{id:'binding-3072',assetId:tx(3072)+'_0',bapId:identities[1],state:'current',validity:'valid'}],drafts:{},operations:[]};
  }
  function load(storage=root.localStorage) {try {const raw=storage.getItem(KEY);if(!raw)return seed();const d=JSON.parse(raw);if(d.version!==1||!Array.isArray(d.assets)||!Array.isArray(d.bindings)||!Array.isArray(d.operations)||!d.drafts)throw Error('schema');return d;} catch {const fallback=seed();return {...fallback,readFailure:true,assets:fallback.assets.map(a=>({...a,numberCheck:'unverified',ownershipCheck:'unverified'}))};}}
  function save(data,storage=root.localStorage) {if(data.readFailure)throw Error('read-failure');storage.setItem(KEY,JSON.stringify(data));return data;}
  const ownerFor=bapId=>addresses[identities.indexOf(bapId)];
  const signerFor=bapId=>['1CounterpartyXXXXXXXXXXXXXXXUWLpVr','1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp'][identities.indexOf(bapId)];
  const current=(data,bapId)=>data.bindings.find(b=>b.bapId===bapId&&b.state==='current');
  function bindingState(data,b) {
    if(!b||b.state!=='current')return 'none';
    const asset=data.assets.find(a=>a.id===b.assetId);if(!asset||!asset.originValid)return 'origin-invalid';
    if(asset.ownershipCheck!=='verified'||b.validity==='unverified')return 'unverified';
    if(asset.owner!==ownerFor(b.bapId))return 'not-owned';
    const competing=data.bindings.filter(x=>x.state==='current'&&(x.bapId===b.bapId||data.assets.find(a=>a.id===x.assetId)?.origin===asset.origin));
    if(competing.length!==1||b.validity==='duplicate')return 'duplicate';
    return b.validity==='valid'?'valid':'unverified';
  }
  const binding=(data,id)=>data.bindings.find(b=>b.assetId===id&&bindingState(data,b)==='valid');
  function eligible(asset,bapId) {return !asset.originValid?'origin-invalid':asset.ownershipCheck!=='verified'?'unverified':asset.owner!==ownerFor(bapId)?'not-owned':'';}
  function parseRoute(hash) {const [page,id]=hash.replace(/^#\//,'').split('/');try{return {page:['artifacts','artifact','artifact-create','artifact-select','artifact-review','artifact-operation','artifact-transfer','artifact-action','find','identity-view'].includes(page)?page:'artifacts',id:decodeURIComponent(id||'')};}catch{return {page:'artifact',id:'invalid'};}}
  function validateDraft(draft) {const length=[...draft.name.trim()].length;return length<1||length>100?'artifactNameError':'';}
  function validImageHeader(bytes,type) {
    if(type==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    if(type!=='image/png'||[137,80,78,71,13,10,26,10].some((v,i)=>bytes[i]!==v))return false;
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let offset=8;
    while(offset+12<=bytes.length){const size=view.getUint32(offset),kind=String.fromCharCode(...bytes.slice(offset+4,offset+8));if(kind==='acTL'||offset+12+size>bytes.length)return false;if(kind==='IEND')return true;offset+=size+12;}return false;
  }
  const pending=op=>['authorize','signing','validating','submitting','unknown'].includes(op.phase);
  const cleanDraft=d=>({name:d.name.trim(),content:Object.fromEntries(Object.entries(d.content).filter(([k])=>k!=='blob'))});
  const bindingVersion=(data,bapId)=>JSON.stringify(data.bindings.filter(b=>b.state==='current'));
  function recover(data){return {...data,operations:data.operations.map(op=>({...op,phase:op.phase==='submitting'?'unknown':['authorize','signing','validating'].includes(op.phase)?'cancelled':op.phase}))};}
  function conflict(data,bapId,assetId){return data.operations.find(op=>pending(op)&&(op.bapId===bapId||(assetId&&op.assetId===assetId)));}
  function reviewIssue(data,review) {
    if(!identities.includes(review.bapId))return 'artifactReviewExpired';
    if(conflict(data,review.bapId,review.assetId))return 'artifactUnresolved';
    if(review.kind==='create')return validateDraft(review.draft)|| (JSON.stringify(cleanDraft(data.drafts[review.bapId]||{name:'',content:{}}))!==JSON.stringify(cleanDraft(review.draft))?'artifactReviewExpired':'');
    const asset=data.assets.find(a=>a.id===review.assetId);
    if(!asset)return 'artifactNotFound';
    if(review.kind==='transfer'){const addressIssue=recipientIssue(review.recipient,review.network);if(addressIssue)return addressIssue;}
    if(review.kind==='remove')return current(data,review.bapId)?.assetId!==asset.id||review.bindingVersion!==bindingVersion(data,review.bapId)?'artifactReviewExpired':'';
    const why=eligible(asset,review.bapId);if(why)return 'artifactEligibility-'+why;
    if(review.outpoint!==asset.outpoint||review.bindingVersion!==bindingVersion(data,review.bapId))return 'artifactReviewExpired';
    if(review.kind==='bind'&&current(data,review.bapId)?.assetId===asset.id&&binding(data,asset.id)?.bapId===review.bapId)return 'artifactAlreadyCurrent';
    return '';
  }
  function begin(data,review,id,outcome='success'){
    const issue=reviewIssue(data,review);if(issue)throw Error(issue);
    const op={id,kind:review.kind,bapId:review.bapId,assetId:review.assetId||null,review:JSON.parse(JSON.stringify(review)),phase:'authorize',outcome,txid:tx(100000+data.operations.length),createdAt:new Date().toISOString()};
    return {...data,operations:[op,...data.operations]};
  }
  function replaceOperation(data,op){return {...data,operations:data.operations.map(x=>x.id===op.id?op:x)};}
  function signatureResult(op,bapId){return op.bapId!==bapId?'artifactSignatureMismatch':['invalid','missing','mismatch','spend-only'].includes(op.outcome)?'artifactSignature-'+op.outcome:'';}
  function accept(data,op){
    if(data.operations.find(x=>x.id===op.id)?.phase==='accepted')return data;
    if(op.signature!=='valid'||op.signerBapId!==op.bapId)throw Error('artifactSignatureMismatch');
    let next={...data,assets:[...data.assets],bindings:[...data.bindings]};
    const record={kind:op.kind,txid:op.txid,bapId:op.bapId,signer:op.signer,signature:'valid',keyEpoch:op.keyEpoch,confirmations:0};
    let assetId=op.assetId;
    if(op.kind==='create'){
      assetId=op.txid+'_0';
      if(!next.assets.some(a=>a.id===assetId))next.assets.unshift({id:assetId,origin:assetId,outpoint:assetId,name:op.review.draft.name,mapName:op.review.draft.name,number:null,ordinal:null,confirmations:0,numberCheck:'verified',observedAt:new Date().toISOString(),owner:ownerFor(op.bapId),creator:op.bapId,content:op.review.draft.content,originValid:true,ownershipCheck:'verified',transactions:[record]});
    }else if(op.kind==='transfer'){
      const asset=next.assets.find(a=>a.id===assetId);if(!asset||eligible(asset,op.bapId)||asset.outpoint!==op.review.outpoint)throw Error('artifactReviewExpired');
      next.assets=next.assets.map(a=>a.id===assetId?{...a,ownershipCheck:'unverified',transfer:{opId:op.id,txid:op.txid,recipient:op.review.recipient,previousOwner:a.owner,verification:'pending',confirmations:0},transactions:[...a.transactions,record]}:a);
    }else if(op.kind==='remove'){
      if(current(next,op.bapId)?.assetId!==assetId)throw Error('artifactReviewExpired');
      next.bindings=next.bindings.map(b=>b.bapId===op.bapId&&b.assetId===assetId&&b.state==='current'?{...b,state:'history',removedBy:op.txid}:b);
      next.assets=next.assets.map(a=>a.id===assetId?{...a,transactions:[...a.transactions,record]}:a);
    }else if(op.kind==='bind'){
      const asset=next.assets.find(a=>a.id===assetId);if(!asset||eligible(asset,op.bapId))throw Error('artifactReviewExpired');
      next.bindings=next.bindings.map(b=>(b.bapId===op.bapId||next.assets.find(a=>a.id===b.assetId)?.origin===asset.origin)&&b.state==='current'?{...b,state:'history'}:b);
      next.bindings.unshift({id:op.id,assetId,bapId:op.bapId,state:'current',validity:'valid',txid:op.txid});
      next.assets=next.assets.map(a=>a.id===assetId?{...a,transactions:[...a.transactions,record]}:a);
    }
    return replaceOperation(next,{...op,assetId,phase:'accepted'});
  }
  function previewFixture(asset,mode) {
    if(mode==='html'||mode==='svg')return {...asset,content:{kind:'external',type:mode==='html'?'text/html':'image/svg+xml',raw:'<script>window.unsafeArtifactExecuted=true</script>'}};
    if(mode==='damaged')return {...asset,content:{kind:'upload',type:'image/png',blobId:'missing-preview-fixture'}};
    if(mode==='metadata')return {...asset,name:'<img src=x onerror=alert(1)>',mapName:'<script>alert(1)</script>'};
    return asset;
  }
  const previewSafe=content=>content?.kind==='brand'||(content?.kind==='upload'&&['image/png','image/jpeg'].includes(content.type));
  function numberState(asset){
    if(asset.numberCheck==='reorg')return 'reorg';
    if(asset.numberCheck!=='verified')return 'unverified';
    if(asset.number===null||asset.number===undefined)return asset.confirmations>0?'resolving':'pending';
    return asset.confirmations>=6?'stable':'assigned';
  }
  function numberObservation(asset,scenario,now=new Date().toISOString()){
    if(scenario==='error')return {...asset,numberCheck:'unverified',checkedAt:now};
    if(scenario==='reorg')return {...asset,numberCheck:'reorg',previousNumber:asset.number,checkedAt:now};
    const base={...asset,numberCheck:'verified',observedAt:now,checkedAt:now};
    if(scenario==='pending')return {...base,number:null,confirmations:0};
    if(scenario==='resolving')return {...base,number:null,confirmations:3};
    if(scenario==='changed')return {...base,previousNumber:asset.number||asset.previousNumber,number:'166',confirmations:2};
    if(scenario==='five'||scenario==='six')return {...base,number:asset.number??'620000',confirmations:scenario==='five'?5:6};
    return base;
  }
  function factScenario(data,id,scenario){
    const asset=data.assets.find(a=>a.id===id);if(!asset)return data;
    if(scenario==='duplicate')return {...data,bindings:data.bindings.map(b=>b.assetId===id&&b.state==='current'?{...b,validity:'duplicate'}:b)};
    if(scenario==='concurrent')return {...data,bindings:data.bindings.map(b=>b.state==='current'?{...b,observedRevision:(b.observedRevision||0)+1}:b)};
    const changes=scenario==='unknown'?{ownershipCheck:'unverified'}:scenario==='origin'?{originValid:false}:scenario==='owner'?{owner:addresses[asset.owner===addresses[0]?1:0],ownershipCheck:'verified'}:scenario==='outpoint'?{outpoint:tx(800000+data.revision)+'_1'}:{ownershipCheck:'verified',originValid:true};
    return {...data,assets:data.assets.map(a=>a.id===id?{...a,...changes}:a),bindings:scenario==='normal'?data.bindings.map(b=>b.assetId===id?{...b,validity:'valid'}:b):data.bindings};
  }
  function recipientIssue(value,network='mainnet'){
    if(network!=='mainnet')return 'artifactWrongNetwork';
    if(!value||!/^1[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value))return 'artifactAddressInvalid';
    return addresses.includes(value)?'':'artifactSampleAddressOnly';
  }
  function reconcileOwnership(data,id,verified){
    const asset=data.assets.find(a=>a.id===id);if(!asset)return data;
    if(!verified)return {...data,assets:data.assets.map(a=>a.id===id?{...a,ownershipCheck:'unverified'}:a)};
    const transfer=asset.transfer?.verification==='pending'?asset.transfer:null;
    const updated={...asset,ownershipCheck:'verified',...(transfer?{owner:transfer.recipient,outpoint:transfer.txid+'_0',transfer:{...transfer,verification:'verified'}}:{})};
    return {...data,assets:data.assets.map(a=>a.id===id?updated:a),bindings:transfer?data.bindings.map(b=>b.assetId===id&&b.state==='current'&&updated.owner!==ownerFor(b.bapId)?{...b,state:'history',validity:'not-owned'}:b):data.bindings};
  }
  function parseLookup(raw){
    const text=raw.trim(),numeric=text.startsWith('#')?text.slice(1):text;
    if(/^(0|[1-9][0-9]*)$/.test(numeric))return {kind:'number',value:numeric};
    if(/^[+-]?[0-9]+(?:\.[0-9]+)?[eE][+-]?[0-9]+$/.test(numeric))return {kind:'invalid',issue:'artifactFindInvalid'};
    if(!text.startsWith('#')&&/^[1-9A-HJ-NP-Za-km-z]{25,64}$/.test(text)&&/[A-Za-z]/.test(text))return {kind:'bap',value:text};
    return {kind:'invalid',issue:/^0[0-9]+$/.test(numeric)?'artifactFindLeadingZero':'artifactFindInvalid'};
  }
  function lookup(data,parsed,scenario='normal'){
    if(data.readFailure||scenario==='error')return {status:'error'};
    if(parsed.kind==='invalid')return {status:'invalid',issue:parsed.issue};
    if(parsed.kind==='bap')return identities.includes(parsed.value)?{status:'identity',bapId:parsed.value}:{status:'not-found'};
    const matches=data.assets.filter(a=>a.number===parsed.value);
    if(matches.length>1)return {status:'unverified'};
    const asset=matches[0];
    if(!asset)return data.assets.some(a=>a.previousNumber===parsed.value&&['reorg','unverified'].includes(numberState(a)))?{status:'unverified'}:{status:'not-found'};
    if(['reorg','unverified'].includes(numberState(asset))||scenario==='reorg')return {status:'unverified',assetId:asset.id};
    const b=binding(data,asset.id),candidate=data.bindings.find(x=>x.assetId===asset.id&&x.state==='current');
    return {status:'found',assetId:asset.id,bapId:b?.bapId||null,associationState:bindingState(data,candidate)};
  }
  const historicalSignerFor=bapId=>['1HB5XMLmzFVj8ALj6mfBsbifRoD4miY36v','1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'][identities.indexOf(bapId)];
  const api={historicalSignerFor,parseLookup,lookup,recipientIssue,reconcileOwnership,bindingState,factScenario,numberState,numberObservation,previewFixture,previewSafe,signerFor,pending,cleanDraft,bindingVersion,recover,conflict,reviewIssue,begin,replaceOperation,signatureResult,accept,validateDraft,validImageHeader,KEY,identities,addresses,tx,seed,load,save,ownerFor,current,binding,eligible,parseRoute};
  if(typeof module!=='undefined')module.exports=api;else root.OwnwordArtifactModel=api;
})(typeof window!=='undefined'?window:globalThis);
