const assert = require('node:assert/strict');
const {initial, reducer: step, validate, countGraphemes, ids} = require('./model.js');
let checks = 0;
const eq = (a, b) => {assert.deepEqual(a, b); checks++;};
const connect = scenario => step(step(initial(), {type: 'CONNECTED'}), {type: 'RESOLVED', scenario});
eq(connect('new').page, 'setup');
eq(connect('existing').page, 'identity');
eq(connect('incomplete').page, 'setup');
eq(connect('incomplete').published, true);
eq(connect('resolveFail').page, 'resolve-error');
eq(step(step(initial(), {type: 'CONNECT'}), {type: 'CANCEL'}).notice, 'connectCancelled');
eq(step(initial(), {type: 'CONNECT_FAILED'}).error, 'connectFailed');
eq(validate({name: ' ', bio: '', type: 'Person'}).name, 'required');
eq(validate({name: '字'.repeat(101), bio: '', type: 'Person'}).name, 'nameLong');
eq(validate({name: '字'.repeat(100), bio: '文'.repeat(1000), type: 'Organization'}), {name: '', bio: '', type: ''});
eq(validate({name: 'A', bio: '文'.repeat(1001), type: 'Unknown'}), {name: '', bio: 'bioLong', type: 'typeRequired'});
let creating = connect('new');
creating = step(creating, {type: 'DRAFT', field: 'name', value: 'Horizon'});
creating = step(step(creating, {type: 'REVIEW'}), {type: 'AUTHORIZE', operation: 'create'});
eq(step(creating, {type: 'CANCEL'}).draft.name, 'Horizon');
eq(step(creating, {type: 'CANCEL'}).notice, 'createCancelled');
let processing = step(creating, {type: 'PROCESS', operation: 'create'});
eq(step(processing, {type: 'RESULT', operation: 'create', fail: true}).draft.name, 'Horizon');
eq(step(processing, {type: 'RESULT', operation: 'create', fail: true}).published, false);
let ready = step(processing, {type: 'RESULT', operation: 'create', epoch: processing.epoch});
eq(ready.page, 'ready'); eq(ready.profile.name, 'Horizon'); eq(ready.published, true);
let editing = step(connect('existing'), {type: 'EDIT'});
// 原值与改回原值均不进入保存；每种资料字段的实际修改都可继续。
eq(step(editing, {type: 'REVIEW'}), editing);
eq(step(editing, {type: 'AUTHORIZE', operation: 'save'}), editing);
for (const [field, value] of Object.entries({name: 'Changed', bio: 'New bio', type: 'Organization', image: 'blob:avatar'})) {
  const changed = step(editing, {type: 'DRAFT', field, value});
  eq(step(changed, {type: 'REVIEW'}).page, 'review');
  eq(step(changed, {type: 'AUTHORIZE', operation: 'save'}).modal, 'save');
  const reverted = step(changed, {type: 'DRAFT', field, value: editing.profile[field]});
  eq(step(reverted, {type: 'REVIEW'}), reverted);
  eq(step(reverted, {type: 'AUTHORIZE', operation: 'save'}), reverted);
}
editing = step(editing, {type: 'DRAFT', field: 'name', value: 'Changed'});
editing = step(step(editing, {type: 'REVIEW'}), {type: 'AUTHORIZE', operation: 'save'});
const cancelled = step(editing, {type: 'CANCEL'});
eq(cancelled.page, 'edit'); eq(cancelled.draft.name, 'Changed'); eq(cancelled.profile.name, 'Maya Chen');
const saved = step(step(editing, {type: 'PROCESS', operation: 'save'}), {type: 'RESULT', operation: 'save'});
eq(saved.profile.name, 'Changed'); eq(ids[saved.account], ids[editing.account]); eq(saved.notice, 'saved');
for (const old of [creating, processing, editing, step(editing, {type: 'PROCESS', operation: 'save'})]) {
  const switched = step(old, {type: 'SWITCH'});
  eq(switched.profile.name, ''); eq(switched.draft.name, ''); eq(switched.modal, null);
  eq(step(switched, {type: 'RESULT', epoch: old.epoch, operation: 'create'}), switched);
  eq(step(switched, {type: 'RESOLVED', scenario: 'existing'}).profile.name, 'North Studio');
  const disconnected = step(old, {type: 'DISCONNECT'});
  eq(disconnected.wallet, false); eq(disconnected.page, 'welcome');
  eq(step(disconnected, {type: 'RESULT', epoch: old.epoch, operation: 'save'}), disconnected);
}
const discard = step(step(cancelled, {type: 'DISCARD_ASK', page: 'identity'}), {type: 'DISCARD'});
eq(discard.draft, discard.profile); eq(discard.page, 'identity');
eq(step(step(creating, {type: 'DISCARD_ASK', page: 'welcome'}), {type: 'DISCARD'}).wallet, false);
// Transient confirmations clear only for the notice they were scheduled for,
// and never for a newer operation (epoch guard).
const transient = {...initial(), notice: 'saved', error: 'saveFailed', epoch: 4};
eq(step(transient, {type: 'CLEAR_NOTICE', notice: 'saved', epoch: 4}), {...transient, notice: ''});
eq(step(transient, {type: 'CLEAR_NOTICE', notice: 'connectCancelled', epoch: 4}), transient);
eq(step(transient, {type: 'CLEAR_NOTICE', notice: 'saved', epoch: 3}), transient);
// Chain record: a new publication is pending, an existing identity is confirmed,
// and the record never survives a session change.
const createdRecord = step(step(initial(), {type: 'PROCESS', operation: 'create'}), {type: 'RESULT', operation: 'create'});
eq(createdRecord.transaction.blockHeight, null);
eq(typeof createdRecord.transaction.txid, 'string');
const existingRecord = connect('existing');
eq(existingRecord.transaction.blockHeight, 912684);
eq(step(existingRecord, {type: 'DISCONNECT'}).transaction, null);
eq(step(existingRecord, {type: 'SWITCH'}).transaction, null);
eq(step(existingRecord, {type: 'RESULT', operation: 'save'}).transaction, existingRecord.transaction);
eq(step(step(initial(), {type: 'PROCESS', operation: 'create'}), {type: 'RESULT', operation: 'create', fail: true}).transaction, null);
// Character counting follows grapheme clusters: one family emoji is one character.
const family = '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}';
eq(countGraphemes(family.repeat(5)), 5);
eq(countGraphemes('字'), 1);
eq(validate({name: family.repeat(15), bio: '', type: 'Person'}).name, '');
eq(validate({name: 'a'.repeat(101), bio: '', type: 'Person'}).name, 'nameLong');
eq(validate({name: 'a'.repeat(100), bio: family.repeat(5), type: 'Person'}).bio, '');
console.log(`${checks} model assertions passed`);
