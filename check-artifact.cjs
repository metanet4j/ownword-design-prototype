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
const Babel=require('./vendor/babel.min.js');
for(const f of fs.readdirSync('.').filter(f=>f.endsWith('.jsx'))){try{Babel.transform(fs.readFileSync(f,'utf8'),{presets:['react'],filename:f});}catch(e){console.error(e.message);process.exit(1);}}
const cssFiles=fs.readdirSync('_ds/react-spectrum-s2',{recursive:true}).filter(f=>f.endsWith('.css')).map(f=>path.join('_ds/react-spectrum-s2',f));
const defined=new Set(cssFiles.flatMap(f=>[...fs.readFileSync(f,'utf8').matchAll(/(--s2[a-z0-9-]*)\s*:/g)].map(m=>m[1])));
for(const m of fs.readFileSync('artifact.css','utf8').matchAll(/var\((--s2[a-z0-9-]*)/g))assert.ok(defined.has(m[1]),'Unknown S2 token '+m[1]);
console.log('Artifact JSX and S2 tokens passed; '+checks.length+' model groups.');
