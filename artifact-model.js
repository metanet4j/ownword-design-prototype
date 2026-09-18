/* Deterministic local fixtures. No wallet, network or cryptographic claims. */
(function(root) {
  const KEY='ownword-artifact-v030';
  const identities=['2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD','3GkA8rRtC4a6oX9PzM2cV7mHxTqB5wEeNs'];
  const addresses=['1BoatSLRHtKNngkdXEeobR76b53LETtpyT','1BitcoinEaterAddressDontSendf59kuE'];
  const tx=n=>n.toString(16).padStart(64,'0');
  function seed() {
    const asset=(n,name,number,owner,extra={})=>({id:tx(n)+'_0',origin:tx(n)+'_0',outpoint:tx(n)+'_0',name,mapName:name,number,ordinal:String(100000+n),confirmations:12,numberCheck:'verified',observedAt:'2026-09-18T12:00:00Z',owner,creator:identities[1],content:{kind:'brand',type:'image/svg+xml'},originValid:true,ownershipCheck:'verified',transactions:[{kind:'create',txid:tx(n),bapId:identities[1],signer:'1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp',signature:'valid',keyEpoch:'historical-key-at-creation',confirmations:12}],...extra});
    return {version:1,revision:0,assets:[asset(165,'A place to stand','165',addresses[0]),asset(2048,'The quiet horizon','2048',addresses[0],{confirmations:5}),asset(3072,'Open sky','3072',addresses[1]),asset(4096,'An earlier chapter','4096',addresses[0])],bindings:[{id:'binding-165',assetId:tx(165)+'_0',bapId:identities[0],state:'current',validity:'valid'},{id:'binding-4096',assetId:tx(4096)+'_0',bapId:identities[0],state:'history',validity:'valid'},{id:'binding-3072',assetId:tx(3072)+'_0',bapId:identities[1],state:'current',validity:'valid'}],drafts:{},operations:[]};
  }
  function load(storage=root.localStorage) {try {const raw=storage.getItem(KEY);if(!raw)return seed();const d=JSON.parse(raw);if(d.version!==1||!Array.isArray(d.assets)||!Array.isArray(d.bindings)||!Array.isArray(d.operations)||!d.drafts)throw Error('schema');return d;} catch {return {...seed(),readFailure:true};}}
  function save(data,storage=root.localStorage) {if(data.readFailure)throw Error('read-failure');storage.setItem(KEY,JSON.stringify(data));return data;}
  const ownerFor=bapId=>addresses[identities.indexOf(bapId)];
  const signerFor=bapId=>['1CounterpartyXXXXXXXXXXXXXXXUWLpVr','1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp'][identities.indexOf(bapId)];
  const current=(data,bapId)=>data.bindings.find(b=>b.bapId===bapId&&b.state==='current');
  const binding=(data,id)=>data.bindings.find(b=>b.assetId===id&&b.state==='current'&&b.validity==='valid');
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
  const bindingVersion=(data,bapId)=>JSON.stringify(data.bindings.filter(b=>b.bapId===bapId&&b.state==='current'));
  function recover(data){return {...data,operations:data.operations.map(op=>({...op,phase:op.phase==='submitting'?'unknown':['authorize','signing','validating'].includes(op.phase)?'cancelled':op.phase}))};}
  function conflict(data,bapId,assetId){return data.operations.find(op=>pending(op)&&(op.bapId===bapId||(assetId&&op.assetId===assetId)));}
  function reviewIssue(data,review) {
    if(!identities.includes(review.bapId))return 'artifactReviewExpired';
    if(conflict(data,review.bapId,review.assetId))return 'artifactUnresolved';
    if(review.kind==='create')return validateDraft(review.draft)|| (JSON.stringify(cleanDraft(data.drafts[review.bapId]||{name:'',content:{}}))!==JSON.stringify(cleanDraft(review.draft))?'artifactReviewExpired':'');
    const asset=data.assets.find(a=>a.id===review.assetId);
    if(!asset)return 'artifactNotFound';
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
    }else if(op.kind==='bind'){
      const asset=next.assets.find(a=>a.id===assetId);if(!asset||eligible(asset,op.bapId))throw Error('artifactReviewExpired');
      next.bindings=next.bindings.map(b=>(b.bapId===op.bapId||b.assetId===assetId)&&b.state==='current'?{...b,state:'history'}:b);
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
  const api={previewFixture,previewSafe,signerFor,pending,cleanDraft,bindingVersion,recover,conflict,reviewIssue,begin,replaceOperation,signatureResult,accept,validateDraft,validImageHeader,KEY,identities,addresses,tx,seed,load,save,ownerFor,current,binding,eligible,parseRoute};
  if(typeof module!=='undefined')module.exports=api;else root.OwnwordArtifactModel=api;
})(typeof window!=='undefined'?window:globalThis);
