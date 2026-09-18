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
  const api={KEY,identities,addresses,tx,seed,load,save,ownerFor,current,binding,eligible,parseRoute};
  if(typeof module!=='undefined')module.exports=api;else root.OwnwordArtifactModel=api;
})(typeof window!=='undefined'?window:globalThis);
