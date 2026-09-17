/* 仅供高保真原型使用；全局事实见核心认知，版本行为见 PRD v0.2.0。 */
(function (root) {
  const identity = typeof module !== 'undefined' ? require('./model.js') : root.OwnwordModel;
  const defaultScenarios = {list: 'normal', storage: 'normal'};
  const title = text => root.OwnwordEditorTools?.metadata ? root.OwnwordEditorTools.metadata(text).title : (/^#\s+(.+)$/m.exec(text)?.[1] || '').replace(/[*_`]/g, '').trim();
  const summary = text => root.OwnwordEditorTools?.metadata ? root.OwnwordEditorTools.metadata(text).summary : text.replace(/^#.*$/gm, '').replace(/[*_`>\[\]#]/g, '').replace(/\s+/g, ' ').trim();
  const newId = () => 'draft-' + (root.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
  function draft(authorBapId, content = '') {return {id: newId(), authorBapId, content, updatedAt: new Date().toISOString()};}
  function seed() {
    const authors = identity.ids;
    return {
      drafts: [{...draft(authors[0], '# A space for unfinished thoughts\n\nSome ideas need room before they need an audience.\n\n- Keep the original words.\n- Make the author visible.\n- Leave room for what comes next.'), id: 'draft-first', updatedAt: '2026-09-17T08:30:00Z'}],
      records: [
        {id: 'first-words', rootContentId: 'first-words', revisionNo: 1, authorBapId: authors[0], author: {...identity.fixtures[0]}, content: '# Your words deserve a home\n\nA thought begins in a quiet place. A notebook. A margin. A line you return to.\n\nPublishing should keep that sense of ownership intact.\n\n## Start with the author\n\nAn identity gives a piece of writing a clear origin. A signature makes that intention visible.\n\n> A permanent record can still leave room for a changing mind.\n\nNew ideas become new versions. The earlier words remain part of the story.', publishedAt: '2026-09-16T09:00:00Z', txid: 'a1'.repeat(32), confirmation: 'confirmed', proof: 'valid'},
        {id: 'open-notebook', rootContentId: 'open-notebook', revisionNo: 1, authorBapId: authors[0], author: {...identity.fixtures[0]}, content: '# Notes on an open notebook\n\nSmall observations, written with care.\n\n1. Write something worth keeping.\n2. Read it once more.\n3. Let the words travel with their author.', publishedAt: '2026-09-15T10:00:00Z', txid: 'b2'.repeat(32), confirmation: 'pending', proof: 'valid'}
      ], operations: []
    };
  }
  const draftKey = author => 'ownword-v020-drafts:' + author;
  function load(storage) {
    const data = seed(); data.readFailure = false;
    try {storage = storage || root.localStorage;} catch {data.readFailure = true; return data;}
    for (const author of identity.ids) {
      try {
        const raw = storage.getItem(draftKey(author));
        if (raw === null) continue;
        const items = JSON.parse(raw);
        if (!Array.isArray(items) || items.some(d => typeof d.id !== 'string' || typeof d.content !== 'string' || d.authorBapId !== author)) throw new Error('Invalid draft data');
        data.drafts = [...data.drafts.filter(d => d.authorBapId !== author), ...items];
      } catch {data.readFailure = true;}
    }
    return data;
  }
  function saveDrafts(storage, author, drafts) {
    storage.setItem(draftKey(author), JSON.stringify(drafts.filter(d => d.authorBapId === author)));
  }
  function parseRoute(hash) {
    const match = /^#\/(content|write|review|publish|read|history)(?:\/([^/?#]+))?$/.exec(hash);
    if (!match) return {page: 'content', id: ''};
    try {return {page: match[1], id: decodeURIComponent(match[2] || '')};} catch {return {page: 'read', id: 'invalid'};}
  }
  const api = {load, saveDrafts, draftKey, defaultScenarios, title, summary, newId, draft, seed, parseRoute};
  if (typeof module !== 'undefined') module.exports = api; else root.OwnwordContentModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
