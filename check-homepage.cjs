const assert=require('node:assert/strict');
const H=require('./homepage-model.js'),I=require('./model.js');
assert.equal(H.parseRoute('#/identity/'+I.ids[0]+'/followers').kind,'followers');
assert.equal(H.parseRoute('#/identity/%E0%A4%A').kind,'invalid');
assert.equal(H.resolveIdentity('!!').status,'invalid');
assert.equal(H.resolveIdentity('9'.repeat(34)).status,'missing');
assert.equal(H.resolveIdentity(I.ids[0],null,'failure').status,'error');
assert.equal(H.resolveIdentity(I.ids[0]).profile.name,'Maya Chen');
assert.deepEqual(H.list(I.ids[0],'following'),[I.ids[1]]);
assert.deepEqual(H.list(I.ids[0],'followers'),[I.ids[1]]);
console.log('Homepage：公开路由、身份输入及独立读取边界通过。');

const all=H.records(),posts=H.stream(I.ids[0],all);
assert.equal(posts.length,5);assert.equal(posts.filter(p=>p.rootContentId==='first-words').length,1);assert.equal(posts.find(p=>p.rootContentId==='first-words').revisionNo,2);
assert.deepEqual([...new Set(posts.map(H.kind))].sort(),['audio','blog','image','video']);assert.ok(posts.every(r=>r.status!=='draft'));
assert.equal(H.stream(I.ids[1]).some(p=>H.kind(p)==='audio'),false);
console.log('Homepage：公开内容归属、Draft 隔离、混合媒体、当前版本归并和排序通过。');

assert.equal(H.parseRoute('#/content/'+'a1'.repeat(32)+'/history').kind,'history');
assert.equal(H.proof(H.contentFixtures()[0]),'valid');
assert.equal(H.proof({...H.contentFixtures()[0],authorBapId:I.ids[1]}),'failed');
