/* Deterministic local fixtures. No wallet, network or cryptographic claims. */
(function(root) {
  const KEY='ownword-artifact-v030';
  const identities=['2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD','3GkA8rRtC4a6oX9PzM2cV7mHxTqB5wEeNs'];
  const addresses=['1BoatSLRHtKNngkdXEeobR76b53LETtpyT','1BitcoinEaterAddressDontSendf59kuE'];
  const tx=n=>n.toString(16).padStart(64,'0');
  function seed() {
    const asset=(n,name,number,owner,extra={})=>({id:tx(n)+'_0',origin:tx(n)+'_0',outpoint:tx(n)+'_0',name,mapName:name,number,ordinal:String(100000+n),confirmations:12,numberCheck:'verified',observedAt:'2026-09-18T12:00:00Z',owner,creator:identities[1],content:{kind:'brand',type:'image/svg+xml'},originValid:true,ownershipCheck:'verified',transactions:[{kind:'create',txid:tx(n),bapId:identities[1],signer:addresses[1],signature:'valid',keyEpoch:'creation',confirmations:12}],...extra});
    return {version:1,revision:0,assets:[asset(165,'A place to stand','165',addresses[0]),asset(2048,'The quiet horizon','2048',addresses[0],{confirmations:5}),asset(3072,'Open sky','3072',addresses[1]),asset(4096,'An earlier chapter','4096',addresses[0])],bindings:[{id:'binding-165',assetId:tx(165)+'_0',bapId:identities[0],state:'current',validity:'valid'},{id:'binding-4096',assetId:tx(4096)+'_0',bapId:identities[0],state:'history',validity:'valid'},{id:'binding-3072',assetId:tx(3072)+'_0',bapId:identities[1],state:'current',validity:'valid'}],drafts:{},operations:[]};
  }
  function load(storage=root.localStorage) {try {const raw=storage.getItem(KEY);if(!raw)return seed();const d=JSON.parse(raw);if(d.version!==1||!Array.isArray(d.assets)||!Array.isArray(d.bindings)||!Array.isArray(d.operations)||!d.drafts)throw Error('schema');return d;} catch {return {...seed(),readFailure:true};}}
  function save(data,storage=root.localStorage) {if(data.readFailure)throw Error('read-failure');storage.setItem(KEY,JSON.stringify(data));return data;}
  const ownerFor=bapId=>addresses[identities.indexOf(bapId)];
  const current=(data,bapId)=>data.bindings.find(b=>b.bapId===bapId&&b.state==='current');
  const binding=(data,id)=>data.bindings.find(b=>b.assetId===id&&b.state==='current'&&b.validity==='valid');
  function eligible(asset,bapId) {return !asset.originValid?'origin-invalid':asset.ownershipCheck!=='verified'?'unverified':asset.owner!==ownerFor(bapId)?'not-owned':'';}
  function parseRoute(hash) {const [page,id]=hash.replace(/^#\//,'').split('/');try{return {page:['artifacts','artifact','artifact-create','artifact-select','artifact-review','artifact-operation','artifact-transfer','find','identity-view'].includes(page)?page:'artifacts',id:decodeURIComponent(id||'')};}catch{return {page:'artifact',id:'invalid'};}}
  function validateDraft(draft) {const length=[...draft.name.trim()].length;return length<1||length>100?'artifactNameError':'';}
  function validImageHeader(bytes,type) {
    if(type==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    if(type!=='image/png'||[137,80,78,71,13,10,26,10].some((v,i)=>bytes[i]!==v))return false;
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let offset=8;
    while(offset+12<=bytes.length){const size=view.getUint32(offset),kind=String.fromCharCode(...bytes.slice(offset+4,offset+8));if(kind==='acTL'||offset+12+size>bytes.length)return false;if(kind==='IEND')return true;offset+=size+12;}return false;
  }
  const api={validateDraft,validImageHeader,KEY,identities,addresses,tx,seed,load,save,ownerFor,current,binding,eligible,parseRoute};
  if(typeof module!=='undefined')module.exports=api;else root.OwnwordArtifactModel=api;
})(typeof window!=='undefined'?window:globalThis);
