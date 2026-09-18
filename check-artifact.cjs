const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('./artifact-model.js');
const checks=[];
function check(id,run){run();checks.push(id);console.log(id+' passed');}
check('A01 current, ownership and fixed routes',()=>{const d=M.seed();assert.equal(M.current(d,M.identities[0]).assetId,d.assets[0].id);assert.equal(M.eligible(d.assets[1],M.identities[0]),'');assert.equal(M.eligible(d.assets[2],M.identities[0]),'not-owned');assert.equal(M.parseRoute('#/artifact/%ZZ').id,'invalid');});
check('A02 name, formats and author-isolated storage',()=>{
  assert.equal(M.validateDraft({name:'  '}),'artifactNameError');assert.equal(M.validateDraft({name:'😀'.repeat(100)}),'');assert.equal(M.validateDraft({name:'😀'.repeat(101)}),'artifactNameError');
  const png=fs.readFileSync('evidence/artifact-v030/A01-gate.png');assert.ok(M.validImageHeader(png,'image/png'));assert.ok(!M.validImageHeader(Buffer.from('<svg/>'),'image/png'));assert.ok(!M.validImageHeader(png,'image/jpeg'));
  let raw;const disk={getItem:()=>raw,setItem:(k,v)=>raw=v};const data=M.seed();data.drafts[M.identities[0]]={name:'A',content:{kind:'upload',blobId:'saved-image'}};M.save(data,disk);assert.equal(M.load(disk).drafts[M.identities[0]].content.blobId,'saved-image');assert.equal(M.load(disk).drafts[M.identities[1]],undefined);assert.throws(()=>M.save(data,{setItem:()=>{throw Error('quota');}}));
});
check('A03 identity signatures, durable intent, recovery and separate association',()=>{
  let d=M.seed();const bap=M.identities[0],draft={name:'Created once',content:{kind:'brand',type:'image/svg+xml'}};d.drafts[bap]=draft;
  const review={kind:'create',bapId:bap,draft};d=M.begin(d,review,'create-one');let op=d.operations[0];
  assert.throws(()=>M.begin(d,review,'duplicate'),/artifactUnresolved/);
  for(const outcome of ['invalid','missing','mismatch','spend-only'])assert.notEqual(M.signatureResult({...op,outcome},bap),'');
  assert.equal(M.signatureResult(op,M.identities[1]),'artifactSignatureMismatch');
  assert.equal(M.recover(d).operations[0].phase,'cancelled');
  op={...op,phase:'submitting',signature:'valid',signerBapId:bap,signer:M.signerFor(bap),keyEpoch:'effective-at-signing'};
  d=M.replaceOperation(d,op);assert.equal(M.recover(d).operations[0].phase,'unknown');assert.throws(()=>M.begin(M.recover(d),review,'duplicate2'),/artifactUnresolved/);
  d=M.accept(d,op);const created=d.assets[0];assert.equal(created.number,null);assert.equal(created.confirmations,0);assert.notEqual(M.current(d,bap).assetId,created.id);assert.equal(M.accept(d,op).assets.length,d.assets.length);
  const bind={kind:'bind',bapId:bap,assetId:created.id,outpoint:created.outpoint,bindingVersion:M.bindingVersion(d,bap)};
  const bound=M.begin(d,bind,'bind-one','reject');assert.equal(M.current(bound,bap).assetId,M.seed().assets[0].id);
  const failed=M.replaceOperation(bound,{...bound.operations[0],phase:'failed'});let retried=M.begin(failed,bind,'bind-retry');const bindingOp={...retried.operations[0],signature:'valid',signerBapId:bap,signer:M.signerFor(bap)};retried=M.accept(retried,bindingOp);
  assert.equal(retried.assets.length,d.assets.length);assert.equal(M.current(retried,bap).assetId,created.id);assert.equal(retried.bindings.filter(b=>b.state==='current'&&b.bapId===bap).length,1);
  const changed={...d,drafts:{[bap]:{...draft,name:'changed'}}};assert.equal(M.reviewIssue(changed,review),'artifactReviewExpired');
  assert.throws(()=>M.accept(d,{...op,id:'bad-signature',signature:'invalid'}),/artifactSignatureMismatch/);
});
check('A04 safe preview and independent proof roles',()=>{
  const d=M.seed(),a=d.assets[0],b=M.binding(d,a.id);
  assert.equal(new Set([a.creator,a.owner,a.transactions[0].signer,b.bapId]).size,4);
  for(const mode of ['html','svg'])assert.equal(M.previewSafe(M.previewFixture(a,mode).content),false);
  assert.equal(M.previewFixture(a,'metadata').mapName,'<script>alert(1)</script>');
  assert.equal(a.transactions[0].keyEpoch,'historical-key-at-creation');
  assert.equal(M.binding(d,d.assets[1].id),undefined);
});
check('A05 confirmation boundary, resolving, reorg and stale evidence',()=>{
 const a=M.seed().assets[0],five=M.numberObservation(a,'five'),six=M.numberObservation(five,'six');
 assert.equal(M.numberState(five),'assigned');assert.equal(M.numberState(six),'stable');assert.equal(six.number,five.number);assert.deepEqual(six.transactions,a.transactions);
 assert.equal(M.numberState(M.numberObservation(a,'pending')),'pending');assert.equal(M.numberState(M.numberObservation(a,'resolving')),'resolving');
 const reorg=M.numberObservation(six,'reorg'),changed=M.numberObservation(reorg,'changed');assert.equal(M.numberState(reorg),'reorg');assert.equal(changed.id,a.id);assert.equal(changed.number,'166');assert.equal(M.numberState(changed),'assigned');
 const failed=M.numberObservation(six,'error');assert.equal(M.numberState(failed),'unverified');assert.equal(failed.observedAt,six.observedAt);
 assert.equal(M.numberState({...six,transactions:[{kind:'transfer',confirmations:0}]}),'stable');
});
check('A06 Current uniqueness, eligibility and stale Review',()=>{
 let d=M.seed(),bap=M.identities[0],a=d.assets[1],review={kind:'bind',bapId:bap,assetId:a.id,outpoint:a.outpoint,bindingVersion:M.bindingVersion(d,bap)};
 assert.equal(M.reviewIssue(M.factScenario(d,a.id,'concurrent'),review),'artifactReviewExpired');
 assert.equal(M.reviewIssue(M.factScenario(d,a.id,'unknown'),review),'artifactEligibility-unverified');
 const first=d.assets[0];assert.equal(M.reviewIssue(d,{...review,assetId:first.id,outpoint:first.outpoint}),'artifactAlreadyCurrent');
 d=M.begin(d,review,'switch');d=M.accept(d,{...d.operations[0],signature:'valid',signerBapId:bap});assert.equal(M.current(d,bap).assetId,a.id);assert.equal(M.binding(d,first.id),undefined);assert.equal(d.bindings.filter(x=>x.state==='current'&&x.bapId===bap).length,1);
 const alias={...a,id:'alias'};d.assets.push(alias);d.bindings.push({id:'duplicate',assetId:alias.id,bapId:M.identities[1],state:'current',validity:'valid'});assert.equal(M.binding(d,a.id),undefined);
});
check('A08 invalid versus unverified association, safe removal',()=>{
 const initial=M.seed(),a=initial.assets[0],bap=M.identities[0];
 for(const [scenario,state] of [['owner','not-owned'],['origin','origin-invalid'],['unknown','unverified'],['duplicate','duplicate']]){const d=M.factScenario(initial,a.id,scenario);assert.equal(M.bindingState(d,M.current(d,bap)),state);assert.equal(M.binding(d,a.id),undefined);}
 let d=M.factScenario(initial,a.id,'owner'),review={kind:'remove',assetId:a.id,bapId:bap,bindingVersion:M.bindingVersion(d,bap)};d=M.begin(d,review,'remove-one');assert.throws(()=>M.begin(d,review,'remove-duplicate'),/artifactUnresolved/);d=M.accept(d,{...d.operations[0],signature:'valid',signerBapId:bap});assert.equal(M.current(d,bap),undefined);assert.equal(d.assets.length,initial.assets.length);assert.equal(d.assets[0].id,a.id);assert.equal(d.bindings.find(b=>b.assetId===a.id).state,'history');
});
const Babel=require('./vendor/babel.min.js');
for(const f of fs.readdirSync('.').filter(f=>f.endsWith('.jsx'))){try{Babel.transform(fs.readFileSync(f,'utf8'),{presets:['react'],filename:f});}catch(e){console.error(e.message);process.exit(1);}}
const cssFiles=fs.readdirSync('_ds/react-spectrum-s2',{recursive:true}).filter(f=>f.endsWith('.css')).map(f=>path.join('_ds/react-spectrum-s2',f));
const defined=new Set(cssFiles.flatMap(f=>[...fs.readFileSync(f,'utf8').matchAll(/(--s2[a-z0-9-]*)\s*:/g)].map(m=>m[1])));
for(const m of fs.readFileSync('artifact.css','utf8').matchAll(/var\((--s2[a-z0-9-]*)/g))assert.ok(defined.has(m[1]),'Unknown S2 token '+m[1]);
console.log('Artifact JSX and S2 tokens passed; '+checks.length+' model groups.');
