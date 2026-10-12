const assert=require('node:assert/strict');
const H=require('./homepage-model.js'),I=require('./model.js');
assert.equal(H.parseRoute('#/identity/'+I.ids[0]+'/followers').kind,'followers');
assert.equal(H.parseRoute('#/identity/%E0%A4%A').kind,'invalid');
assert.equal(H.resolveIdentity('!!').status,'invalid');
assert.equal(H.resolveIdentity('9'.repeat(34)).status,'missing');
assert.equal(H.resolveIdentity(I.ids[0],null,'failure').status,'error');
assert.equal(H.resolveIdentity(I.ids[0]).profile.name,'Maya Chen');
assert.deepEqual(H.relationshipList(H.relationshipSeed(),I.ids[0],'following'),[H.additionalIds[0]]);
assert.deepEqual(H.relationshipList(H.relationshipSeed(),I.ids[0],'followers'),[I.ids[1]]);
console.log('Homepage：公开路由、身份输入及独立读取边界通过。');

const all=H.records(),posts=H.stream(I.ids[0],all);
assert.equal(posts.length,5);assert.equal(posts.filter(p=>p.rootContentId==='first-words').length,1);assert.equal(posts.find(p=>p.rootContentId==='first-words').revisionNo,2);
assert.deepEqual([...new Set(posts.map(H.kind))].sort(),['audio','blog','image','video']);assert.ok(posts.every(r=>r.status!=='draft'));
assert.equal(H.stream(I.ids[1]).some(p=>H.kind(p)==='audio'),false);
console.log('Homepage：公开内容归属、Draft 隔离、混合媒体、当前版本归并和排序通过。');

assert.equal(H.parseRoute('#/content/'+'a1'.repeat(32)+'/history').kind,'history');
assert.equal(H.proof(H.contentFixtures()[0]),'valid');
assert.equal(H.proof({...H.contentFixtures()[0],authorBapId:I.ids[1]}),'failed');

const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),values};};
const db=memory(),a=I.ids[0],b=I.ids[1];
let request=H.beginOperation(db,a,b,'request');
assert.throws(()=>H.submitOperation(db,request,b),/relationshipMismatch/);
request=H.submitOperation(db,request,a);assert.throws(()=>H.submitOperation(db,request,a),/relationshipPending/);assert.equal(H.loadOperations(a,db,true).operations[0].phase,'unknown');
assert.throws(()=>H.beginOperation(db,a,b,'request'),/relationshipPending/);
H.acceptOperation(db,request);assert.equal(H.relation(H.loadRelationships(db),a,b).friend,'sent');assert.equal(H.relation(H.loadRelationships(db),b,a).friend,'received');
let response=H.beginOperation(db,b,a,'accept');response=H.submitOperation(db,response,b);H.acceptOperation(db,response);
assert.equal(H.relation(H.loadRelationships(db),a,b).friend,'friends');assert.equal(H.relation(H.loadRelationships(db),a,b).following,false);
assert.throws(()=>H.beginOperation(db,b,a,'accept'),/relationshipChanged/);
const follower=H.submitOperation(db,H.beginOperation(db,a,b,'follow'),a);H.acceptOperation(db,follower,false);assert.equal(H.relation(H.loadRelationships(db),a,b).following,false);assert.throws(()=>H.beginOperation(db,a,b,'follow'),/relationshipPending/);
H.queryOperation(db,follower,'accepted');H.queryOperation(db,follower,'accepted');assert.equal(H.loadRelationships(db).events.filter(e=>e.id===follower.id).length,1);assert.equal(H.relation(H.loadRelationships(db),a,b).following,true);
const outgoing=H.submitOperation(db,H.beginOperation(db,a,b,'unfollow'),a);H.acceptOperation(db,outgoing);assert.equal(H.relation(H.loadRelationships(db),a,b).following,false);assert.equal(H.relation(H.loadRelationships(db),a,b).friend,'friends');assert.equal(H.relation(H.loadRelationships(db),b,a).following,true);
assert.ok(H.loadOperations(a,db).operations.every(op=>op.actor===a));assert.ok(H.loadOperations(b,db).operations.every(op=>op.actor===b));
const broken={getItem:()=>{throw Error('storage');},setItem:()=>{throw Error('storage');}};assert.equal(H.loadRelationships(broken).readFailure,true);assert.throws(()=>H.beginOperation(broken,a,b,'follow'),/relationshipStorage/);
console.log('Homepage：关系方向、双方 Friend、签名守卫、未知恢复、索引延迟、去重与操作身份隔离通过。');
