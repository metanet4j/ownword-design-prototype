// Copy contract check. Run: node check-copy.cjs
// Verifies the bilingual dictionary stays complete and free of forbidden terms
// (核心认知 §2.3), so copy edits cannot silently drop a string or a language.
const assert = require('node:assert/strict');
const {writeFileSync} = require('node:fs');
const {join} = require('node:path');
const copy = require('./copy.js');

const FORBIDDEN = [
  '注册', '登录', 'sign up', 'log in', 'register', 'verified identity',
  'BAP NFT', 'create BAP NFT', 'broadcast', 'push'
];
const results = [];
const en = Object.keys(copy.en);
const zh = Object.keys(copy.zh);

assert.deepEqual(en.slice().sort(), zh.slice().sort(), 'en and zh must define the same keys');
results.push(`${en.length} keys defined in both languages`);

const empty = [...en, ...zh].filter(key => !String(copy.en[key] || copy.zh[key] || '').trim());
assert.deepEqual(empty, [], `empty strings: ${empty.join(', ')}`);
results.push('no empty strings');

for (const key of en) {
  for (const locale of copy.locales) {
    const value = copy[locale][key];
    assert.equal(typeof value, 'string', `${locale}.${key} must be a string`);
    const lower = value.toLowerCase();
    for (const term of FORBIDDEN) {
      assert(!lower.includes(term.toLowerCase()), `forbidden term "${term}" in ${locale}.${key}: ${value}`);
    }
  }
}
results.push(`${FORBIDDEN.length} forbidden terms absent from both languages`);

const sentences = new Map();
for (const locale of copy.locales) {
  for (const key of en) {
    const value = copy[locale][key].trim();
    if (value.length < 24) continue;
    const seen = sentences.get(`${locale}:${value}`);
    assert(!seen, `duplicate copy in ${locale}: ${key} repeats ${seen}`);
    sentences.set(`${locale}:${value}`, key);
  }
}
results.push('no duplicated long sentences');

writeFileSync(join(__dirname, 'evidence', 'copy-contract.json'),
  JSON.stringify({passed: results.length, checks: results, keys: en.length}, null, 2));
console.log(`${results.length} copy contract checks passed (${en.length} keys)`);
