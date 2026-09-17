/* Prototype fixtures only. Product authority: _task/system-design/spec/核心认知.md. */
(function (root) {
  const ids = ['2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD', '3GkA8rRtC4a6oX9PzM2cV7mHxTqB5wEeNs'];
  const emptyProfile = () => ({name: '', type: 'Person', bio: '', image: ''});
  // Display fixtures only. Production reads publication records from the wallet
  // or indexer contract; see implementation-handoff.md section 3.
  const transactions = [
    {txid: '7e3a91c4b8602fd59a6c4381de0752fb9014c8e6a3d5720b19f84e6c2a5037dd', blockHeight: 912684},
    {txid: 'b42f08d1e937ac65024e8b6f31c079da8456e19b02ad73c6f9054e8a1d2b670c', blockHeight: 912702}
  ];
  const fixtures = [
    {name: 'Maya Chen', type: 'Person', bio: 'Thinking in systems. Writing with intention.\nBuilding a more human internet.', image: ''},
    {name: 'North Studio', type: 'Organization', bio: 'An independent practice for ideas that endure.', image: ''}
  ];
  function initial() { return {page: 'welcome', wallet: false, account: 0, published: false, transaction: null, profile: emptyProfile(), draft: emptyProfile(), modal: null, notice: '', error: '', busy: '', epoch: 0, incomplete: false}; }
  // Count what the user perceives as characters: one ZWJ family emoji is one
  // character, not seven code points. Falls back to code points where the
  // platform lacks Intl.Segmenter.
  const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(undefined, {granularity: 'grapheme'}) : null;
  function countGraphemes(value) {
    const text = String(value || '');
    if (!segmenter) return [...text].length;
    let count = 0;
    for (const _ of segmenter.segment(text)) count++;
    return count;
  }
  function validate(p) {
    return {name: !p.name.trim() ? 'required' : countGraphemes(p.name) > 100 ? 'nameLong' : '', bio: countGraphemes(p.bio) > 1000 ? 'bioLong' : '', type: !['Person', 'Organization'].includes(p.type) ? 'typeRequired' : ''};
  }
  const hasProfileChanges = s => Object.keys(emptyProfile()).some(field => s.profile[field] !== s.draft[field]);
  function reducer(s, a) {
    if (a.epoch !== undefined && a.epoch !== s.epoch) return s;
    switch (a.type) {
      case 'CONNECT': return {...s, modal: 'connect', notice: '', error: ''};
      case 'CONNECTED': return {...s, wallet: true, modal: null, page: 'resolving', busy: 'resolving', epoch: s.epoch + 1};
      case 'RESOLVED': {
        if (a.scenario === 'resolveFail') return {...s, page: 'resolve-error', busy: '', error: 'resolveFailed'};
        const published = a.scenario === 'existing' || a.scenario === 'incomplete';
        const profile = published ? {...fixtures[s.account], ...(a.scenario === 'incomplete' ? {name: ''} : {})} : emptyProfile();
        return {...s, page: a.scenario === 'existing' ? 'identity' : 'setup', profile, draft: {...profile}, published, transaction: published ? {...transactions[s.account]} : null, incomplete: a.scenario === 'incomplete', busy: '', error: ''};
      }
      case 'RETRY_RESOLVE': return {...s, page: 'resolving', busy: 'resolving', error: '', epoch: s.epoch + 1};
      case 'DRAFT': return {...s, draft: {...s.draft, [a.field]: a.value}, notice: '', error: ''};
      case 'REVIEW': return s.published && !hasProfileChanges(s) ? s : {...s, page: 'review', notice: '', error: ''};
      case 'EDIT': return {...s, page: 'edit', draft: {...s.profile}, notice: '', error: ''};
      case 'AUTHORIZE': return a.operation === 'save' && !hasProfileChanges(s) ? s : {...s, modal: a.operation, error: '', notice: ''};
      case 'CANCEL': return {...s, modal: null, busy: '', page: s.modal === 'save' ? (s.incomplete ? 'setup' : 'edit') : s.page, notice: s.modal === 'connect' ? 'connectCancelled' : s.modal === 'create' ? 'createCancelled' : 'saveCancelled'};
      case 'CONNECT_FAILED': return {...s, modal: null, error: 'connectFailed'};
      case 'PROCESS': return {...s, modal: null, busy: a.operation, epoch: s.epoch + 1};
      case 'RESULT': return a.fail ? {...s, busy: '', error: a.operation === 'create' ? 'createFailed' : 'saveFailed'} : {...s, busy: '', page: a.operation === 'create' ? 'ready' : 'identity', published: true, transaction: a.operation === 'create' ? {...transactions[s.account], blockHeight: null} : s.transaction, incomplete: false, profile: {...s.draft}, notice: a.operation === 'save' ? 'saved' : '', error: ''};
      case 'CLEAR_NOTICE': return s.notice === a.notice ? {...s, notice: ''} : s;
      case 'GO': return {...s, page: a.page, notice: '', error: ''};
      case 'DISCARD_ASK': return {...s, modal: 'discard', destination: a.page};
      case 'DISCARD': return s.destination === 'welcome' ? {...initial(), epoch: s.epoch + 1} : {...s, modal: null, draft: {...s.profile}, page: s.destination, error: '', notice: ''};
      case 'STAY': return {...s, modal: null};
      case 'SWITCH': return {...initial(), wallet: true, account: s.account === 0 ? 1 : 0, page: 'resolving', busy: 'resolving', notice: 'accountChanged', epoch: s.epoch + 1};
      case 'DISCONNECT': return {...initial(), epoch: s.epoch + 1};
      default: return s;
    }
  }
  const api = {ids, fixtures, transactions, emptyProfile, initial, countGraphemes, validate, hasProfileChanges, reducer};
  if (typeof module !== 'undefined') module.exports = api;
  else root.OwnwordModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
