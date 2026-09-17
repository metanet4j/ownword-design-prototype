/* 仅供高保真原型使用；全局事实见核心认知，版本行为见 PRD v0.2.0。 */
(function (root) {
  const identity = typeof module !== 'undefined' ? require('./model.js') : root.OwnwordModel;
  const defaultScenarios = {list:'normal', storage:'normal', publish:'success', query:'accepted', confirmation:'pending', account:'none'};
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
    try {
      const raw=storage.getItem(publicationKey);
      if (raw) {
        const journal=JSON.parse(raw);
        if (!Array.isArray(journal.records) || !Array.isArray(journal.operations)) throw new Error('Invalid publication journal');
        data.records=journal.records;
        data.operations=journal.operations.map(op=>({...op,phase:['authorize','signing'].includes(op.phase) ? 'cancelled' : op.phase==='broadcasting' ? 'unknown' : op.phase}));
        const published=new Set(data.operations.filter(op=>op.phase==='published').map(op=>op.draftId));
        data.drafts=data.drafts.filter(d=>!published.has(d.id));
      }
    } catch {data.readFailure=true;}
    return data;
  }
  const publicationKey='ownword-v020-publications';
  const unresolved = op => op && ['authorize','signing','broadcasting','unknown'].includes(op.phase);
  function saveJournal(storage,data) {storage.setItem(publicationKey,JSON.stringify({records:data.records,operations:data.operations}));}
  function newOperation(review,outcome) {return {...review,id:newId().replace('draft-','op-'),phase:'authorize',outcome,createdAt:new Date().toISOString()};}
  function acceptPublication(storage,data,op,confirmation) {
    const existing=data.records.find(r=>r.operationId===op.id);
    const parent=data.records.find(r=>r.id===op.baseContentId);
    if (op.baseContentId && (!parent || parent.authorBapId!==op.authorBapId)) throw new Error('reviewOutdated');
    const record=existing || {id:'content-'+op.id,rootContentId:parent?.rootContentId || 'content-'+op.id,previousContentId:parent?.id,revisionNo:parent ? parent.revisionNo+1 : 1,content:op.content,authorBapId:op.authorBapId,author:op.author,txid:op.txid,operationId:op.id,publishedAt:new Date().toISOString(),confirmation,proof:'valid'};
    const result={...data,records:existing ? data.records : [record,...data.records],operations:data.operations.map(x=>x.id===op.id ? {...op,phase:'published',recordId:record.id,issue:''} : x)};
    // 先原子写入发布记录和操作结果，再清理草稿。写入失败由调用方保留草稿。
    saveJournal(storage,result);
    return {...result,drafts:data.drafts.filter(d=>d.id!==op.draftId)};
  }
  function saveDrafts(storage, author, drafts) {
    storage.setItem(draftKey(author), JSON.stringify(drafts.filter(d => d.authorBapId === author)));
  }
  function decodeMarkdown(bytes, filename) {
    if (!/\.md$/i.test(filename)) throw new Error('importType');
    if (bytes.byteLength > 102400) throw new Error('importSize');
    try {return new TextDecoder('utf-8', {fatal:true}).decode(bytes);} catch {throw new Error('importEncoding');}
  }
  function versions(records,record) {return records.filter(r=>r.rootContentId===record.rootContentId).sort((a,b)=>b.revisionNo-a.revisionNo);}
  function revisionDraft(records,drafts,record,author) {
    if (record.authorBapId!==author || versions(records,record)[0]?.id!==record.id) throw new Error('reviewOutdated');
    return drafts.find(d=>d.baseContentId===record.id && d.authorBapId===author) || {...draft(author,record.content),baseContentId:record.id};
  }
  function reviewError(item,records=[]) {
    if (!item?.content.trim()) return 'reviewEmpty';
    if (new TextEncoder().encode(item.content).length > 102400) return 'editorTooLong';
    if (item.baseContentId) {const base=records.find(r=>r.id===item.baseContentId);if(!base || versions(records,base)[0]?.id!==base.id)return 'reviewOutdated';if(item.content===base.content)return 'revisionUnchanged';}
    return '';
  }
  function parseRoute(hash) {
    const match = /^#\/(content|write|review|publish|read|history)(?:\/([^/?#]+))?$/.exec(hash);
    if (!match) return {page: 'content', id: ''};
    try {return {page: match[1], id: decodeURIComponent(match[2] || '')};} catch {return {page: 'read', id: 'invalid'};}
  }
  const api = {versions, revisionDraft, publicationKey, unresolved, saveJournal, newOperation, acceptPublication, reviewError, decodeMarkdown, load, saveDrafts, draftKey, defaultScenarios, title, summary, newId, draft, seed, parseRoute};
  if (typeof module !== 'undefined') module.exports = api; else root.OwnwordContentModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
