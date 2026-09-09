/* Prototype fixtures only. Product authority: _task/system-design/spec/核心认知.md. */
(function (root) {
  const ids = ['2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD', '3GkA8rRtC4a6oX9PzM2cV7mHxTqB5wEeNs'];
  const emptyProfile = () => ({name: '', type: 'Person', bio: '', image: ''});
  const fixtures = [
    {name: 'Maya Chen', type: 'Person', bio: 'Thinking in systems. Writing with intention.\nBuilding a more human internet.', image: ''},
    {name: 'North Studio', type: 'Organization', bio: 'An independent practice for ideas that endure.', image: ''}
  ];
  function initial() { return {page: 'welcome', wallet: false, account: 0, published: false, profile: emptyProfile(), draft: emptyProfile(), modal: null, notice: '', error: '', busy: '', epoch: 0, incomplete: false}; }
  function validate(p) {
    return {name: !p.name.trim() ? 'required' : [...p.name].length > 100 ? 'nameLong' : '', bio: [...p.bio].length > 1000 ? 'bioLong' : '', type: !['Person', 'Organization'].includes(p.type) ? 'typeRequired' : ''};
  }
  function reducer(s, a) {
    if (a.epoch !== undefined && a.epoch !== s.epoch) return s;
    switch (a.type) {
      case 'CONNECT': return {...s, modal: 'connect', notice: '', error: ''};
      case 'CONNECTED': return {...s, wallet: true, modal: null, page: 'resolving', busy: 'resolving', epoch: s.epoch + 1};
      case 'RESOLVED': {
        if (a.scenario === 'resolveFail') return {...s, page: 'resolve-error', busy: '', error: 'resolveFailed'};
        const published = a.scenario === 'existing' || a.scenario === 'incomplete';
        const profile = published ? {...fixtures[s.account], ...(a.scenario === 'incomplete' ? {name: ''} : {})} : emptyProfile();
        return {...s, page: a.scenario === 'existing' ? 'identity' : 'setup', profile, draft: {...profile}, published, incomplete: a.scenario === 'incomplete', busy: '', error: ''};
      }
      case 'RETRY_RESOLVE': return {...s, page: 'resolving', busy: 'resolving', error: '', epoch: s.epoch + 1};
      case 'DRAFT': return {...s, draft: {...s.draft, [a.field]: a.value}, notice: '', error: ''};
      case 'REVIEW': return {...s, page: 'review', notice: '', error: ''};
      case 'EDIT': return {...s, page: 'edit', draft: {...s.profile}, notice: '', error: ''};
      case 'AUTHORIZE': return {...s, modal: a.operation, error: '', notice: ''};
      case 'CANCEL': return {...s, modal: null, busy: '', page: s.modal === 'save' ? (s.incomplete ? 'setup' : 'edit') : s.page, notice: s.modal === 'connect' ? 'connectCancelled' : s.modal === 'create' ? 'createCancelled' : 'saveCancelled'};
      case 'CONNECT_FAILED': return {...s, modal: null, error: 'connectFailed'};
      case 'PROCESS': return {...s, modal: null, busy: a.operation, epoch: s.epoch + 1};
      case 'RESULT': return a.fail ? {...s, busy: '', error: a.operation === 'create' ? 'createFailed' : 'saveFailed'} : {...s, busy: '', page: a.operation === 'create' ? 'ready' : 'identity', published: true, incomplete: false, profile: {...s.draft}, notice: a.operation === 'save' ? 'saved' : '', error: ''};
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
  const api = {ids, fixtures, emptyProfile, initial, validate, reducer};
  if (typeof module !== 'undefined') module.exports = api;
  else root.OwnwordModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
