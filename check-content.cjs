const assert = require('node:assert/strict');
const M = require('./content-model.js');
assert.deepEqual(M.parseRoute('#/read/%E0%A4%A'), {page: 'read', id: 'invalid'});
assert.deepEqual(M.parseRoute('#/write/draft-first'), {page: 'write', id: 'draft-first'});
assert.equal(M.title('# My first words\n\nText'), 'My first words');
assert.equal(M.seed().drafts.filter(d => d.authorBapId === require('./model.js').ids[1]).length, 0);
console.log('C01 route and author fixtures passed');
