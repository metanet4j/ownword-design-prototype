const assert = require('node:assert/strict');
const M = require('./content-model.js');
assert.deepEqual(M.parseRoute('#/read/%E0%A4%A'), {page: 'read', id: 'invalid'});
assert.deepEqual(M.parseRoute('#/write/draft-first'), {page: 'write', id: 'draft-first'});
assert.equal(M.title('# My first words\n\nText'), 'My first words');
assert.equal(M.seed().drafts.filter(d => d.authorBapId === require('./model.js').ids[1]).length, 0);
console.log('C01 route and author fixtures passed');
const values = new Map();
const storage = {getItem:key => values.get(key) ?? null, setItem:(key,value) => values.set(key,value)};
const [authorA,authorB] = require('./model.js').ids;
const itemA = M.draft(authorA, '# Saved 中文'); const itemB = M.draft(authorB, '# Private B');
M.saveDrafts(storage,authorA,[itemA,itemB]);
assert.deepEqual(JSON.parse(values.get(M.draftKey(authorA))),[itemA]);
assert.equal(M.load(storage).drafts.find(d=>d.id===itemA.id).content,'# Saved 中文');
assert.equal(M.load(storage).drafts.some(d=>d.id===itemB.id),false);
assert.throws(()=>M.saveDrafts({setItem(){throw new Error('quota');}},authorA,[itemA]));
console.log('C04 durable draft and author separation passed');

const encoded = new TextEncoder().encode('\ufeff# 中文\r\n\r\n原文。\r\n');
assert.equal(M.decodeMarkdown(encoded,'sample.md'),'# 中文\r\n\r\n原文。\r\n');
assert.throws(()=>M.decodeMarkdown(new Uint8Array([255]),'bad.md'),/importEncoding/);
assert.throws(()=>M.decodeMarkdown(encoded,'bad.txt'),/importType/);
assert.throws(()=>M.decodeMarkdown(new Uint8Array(102401),'big.md'),/importSize/);
console.log('C05 UTF-8, BOM, CRLF and invalid import boundaries passed');

assert.equal(M.reviewError({content:' \n\t'}),'reviewEmpty');
assert.equal(M.reviewError({content:'中'.repeat(34134)}),'editorTooLong');
assert.equal(M.reviewError({content:'没有标题的正文'}),'');
console.log('C06 empty / UTF-8 byte limit / optional title review gates passed');
