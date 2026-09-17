const ContentWorkspace = React.forwardRef(function ContentWorkspace({active, identity, locale, t, settings, setSettings, onConnect, onIdentity, failCopy, onAccountEvent}, ref) {
  const M = window.OwnwordContentModel;
  const [data, reactSetData] = React.useState(() => M.load());
  const dataRef = React.useRef(data);
  const setData = update => {const next = typeof update === 'function' ? update(dataRef.current) : update; dataRef.current = next; reactSetData(next);};
  const [route, setRoute] = React.useState(() => M.parseRoute(location.hash));
  const routeRef = React.useRef(route), identityRef = React.useRef(identity), lastHash = React.useRef(location.hash);
  routeRef.current = route; identityRef.current = identity;
  const publication=useContentPublication({dataRef,setData,identityRef,identity,settings,onAccountEvent});
  const saved = React.useRef(new Map(data.drafts.map(d => [d.id, d.content])));
  const [filter, setFilter] = React.useState('drafts');
  const [loading, setLoading] = React.useState(true);
  const [saveState, setSaveState] = React.useState(data.readFailure ? 'error' : 'saved');
  const [dialog, setDialog] = React.useState(null);
  const [menu, setMenu] = React.useState(null);
  const [review, setReview] = React.useState(null);
  const [reviewIssue, setReviewIssue] = React.useState('');
  const upload = React.useRef(null);
  const [fileError, setFileError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const menuRef = React.useRef(null), previousAuthor = React.useRef(identity?.bapId);
  useDismissable(!!menu, () => setMenu(null), menuRef);
  const ready = !!identity;
  const currentDraft = () => dataRef.current.drafts.find(d => d.id === routeRef.current.id && d.authorBapId === identityRef.current?.bapId);
  const dirty = item => item && saved.current.get(item.id) !== item.content;
  function persist(author, drafts = dataRef.current.drafts) {
    try {
      if (settings.storage === 'failure' || dataRef.current.readFailure) throw new Error('Draft storage unavailable');
      M.saveDrafts(localStorage, author, drafts);
      drafts.filter(d => d.authorBapId === author).forEach(d => saved.current.set(d.id, d.content));
      setSaveState('saved'); setMessage('');
      console.info('[Ownword content] drafts saved', {author}); return true;
    } catch {
      setSaveState('error'); console.warn('[Ownword content] draft save failed', {author}); return false;
    }
  }
  function requestLeave(action) {
    const item = currentDraft();
    if (dirty(item)) {setDialog({type:'leave', itemId:item.id, action}); return;}
    action();
  }
  function go(page, id = '') {requestLeave(() => {location.hash = '/' + page + (id ? '/' + encodeURIComponent(id) : '');});}
  React.useImperativeHandle(ref, () => ({go, leave: requestLeave}));
  const hashHandler = React.useRef(null);
  hashHandler.current = () => {
      const incoming = location.hash;
      if (!/^#\/(content|write|review|publish|read|history)(\/|$)/.test(incoming)) return;
      const apply = () => {lastHash.current = incoming; setRoute(M.parseRoute(incoming));};
      if (dirty(currentDraft())) {
        history.replaceState(null, '', lastHash.current || '#/content');
        requestLeave(() => {history.pushState(null, '', incoming); apply();});
      } else apply();
  };
  React.useEffect(() => {
    const change = () => hashHandler.current();
    window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change);
  }, []);
  React.useEffect(() => {setLoading(true); const timer = setTimeout(() => setLoading(false), 350); return () => clearTimeout(timer);}, [identity?.bapId, settings.list, active]);
  React.useEffect(() => {
    if (active) {window.scrollTo({top:0, behavior:'instant'}); document.querySelector('[data-content-screen] h1')?.focus({preventScroll:true}); console.info('[Ownword content]', {page:route.page, identity:identity?.bapId || 'visitor'});}
    setMenu(null); setFileError(''); setReviewIssue('');
  }, [route.page, route.id, active, identity?.bapId]);
  React.useEffect(() => {
    const author = identity?.bapId;
    if (previousAuthor.current && previousAuthor.current !== author) {
      setDialog(null); setMenu(null); setReview(null);
      if (!['read','history'].includes(routeRef.current.page)) {lastHash.current = '#/content'; history.replaceState(null, '', '#/content'); setRoute({page:'content', id:''});}
    }
    previousAuthor.current = author;
  }, [identity?.bapId]);
  const current = data.drafts.find(d => d.id === route.id && d.authorBapId === identity?.bapId);
  React.useEffect(() => {
    if (!current) return;
    if (!dirty(current)) {setSaveState(data.readFailure ? 'error' : 'saved'); return;}
    setSaveState('saving');
    const timer = setTimeout(() => persist(current.authorBapId), 800);
    return () => clearTimeout(timer);
  }, [current?.id, current?.content, settings.storage, identity?.bapId]);
  React.useEffect(() => {
    const block = event => {if (dataRef.current.drafts.some(d => dirty(d))) {event.preventDefault(); event.returnValue = '';}};
    window.addEventListener('beforeunload', block); return () => window.removeEventListener('beforeunload', block);
  }, []);
  function create() {
    if (!ready) return;
    requestLeave(() => {const item = M.draft(identity.bapId); setData(d => ({...d, drafts:[item, ...d.drafts]})); persist(identity.bapId); location.hash = '/write/' + item.id;});
  }
  function edit(value) {
    if (!current) return;
    setReview(null); setReviewIssue('');
    setData(d => ({...d, drafts:d.drafts.map(item => item.id === current.id ? {...item, content:value, updatedAt:new Date().toISOString()} : item)}));
  }
  function createRevision(record) {
    if (!identityRef.current) return;
    try {
      const item=M.revisionDraft(dataRef.current.records,dataRef.current.drafts,record,identityRef.current.bapId);
      if (!dataRef.current.drafts.some(d=>d.id===item.id)) {setData(d=>({...d,drafts:[item,...d.drafts]}));persist(item.authorBapId);}
      go('write',item.id);
    } catch {setMessage('reviewOutdated');}
  }
  function checkPublication() {
    const item=currentDraft(), issue=M.reviewError(item,dataRef.current.records); setReviewIssue(issue);
    console.info('[Ownword review]',{draft:item?.id,author:item?.authorBapId,bytes:item ? new TextEncoder().encode(item.content).length : 0,issue});
    if (issue || !item || !identityRef.current) return;
    if (!persist(item.authorBapId)) return;
    setReview({draftId:item.id,baseContentId:item.baseContentId,content:item.content,authorBapId:item.authorBapId,author:{...identityRef.current.profile}});
    go('review',item.id);
  }
  const reviewValid = review && current && review.draftId===current.id && review.authorBapId===identity?.bapId && review.content===current.content && !M.reviewError(current,data.records);
  async function importFile(event) {
    const file=event.target.files[0], item=currentDraft(); event.target.value='';
    if (!file || !item) return;
    console.info('[Ownword import] reading',{name:file.name,bytes:file.size,draft:item.id});
    try {
      const source=M.decodeMarkdown(await file.arrayBuffer(),file.name);
      if (currentDraft()?.id !== item.id || identityRef.current?.bapId !== item.authorBapId) {console.info('[Ownword import] context changed');return;}
      console.info('[Ownword import] decoded',{draft:item.id,characters:source.length});
      setFileError('');
      requestLeave(() => {if (currentDraft()?.content) setDialog({type:'replace',source,itemId:item.id}); else edit(source);});
    } catch(error) {console.warn('[Ownword import] rejected',error.message);setFileError(['importType','importSize','importEncoding'].includes(error.message) ? error.message : 'importReadError');}
  }
  function exportFile(item) {
    const url=URL.createObjectURL(new Blob([item.content],{type:'text/markdown;charset=utf-8'}));
    const link=document.createElement('a'); link.href=url; link.download=(M.title(item.content) || 'untitled').replace(/[\\/:*?"<>|]/g,'-').slice(0,80)+'.md'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function saveAndLeave() {
    const item = dataRef.current.drafts.find(d => d.id === dialog.itemId);
    if (item && persist(item.authorBapId)) {const action = dialog.action; setDialog(null); action();}
  }
  function discardAndLeave() {
    const item = dataRef.current.drafts.find(d => d.id === dialog.itemId);
    if (item) setData(d => ({...d, drafts:saved.current.has(item.id) ? d.drafts.map(x => x.id === item.id ? {...x, content:saved.current.get(x.id)} : x) : d.drafts.filter(x => x.id !== item.id)}));
    const action = dialog.action; setDialog(null); action();
  }
  function deleteDraft() {
    const item = data.drafts.find(d => d.id === dialog.itemId && d.authorBapId === identity?.bapId);
    if (!item) {setDialog(null); return;}
    const drafts = data.drafts.filter(d => d.id !== item.id);
    if (!persist(item.authorBapId, drafts)) {setMessage('draftDeleteFailed'); return;}
    saved.current.delete(item.id); setData(d => ({...d, drafts})); setDialog(null); setMessage('draftDeleted');
    setTimeout(() => document.querySelector('[data-content-screen] h1')?.focus(), 0);
  }
  const operation=data.operations.find(op=>op.draftId===route.id && op.authorBapId===identity?.bapId);
  const record = data.records.find(r => r.id === route.id);
  const date = value => new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {month:'short', day:'numeric'}).format(new Date(value));
  const itemTitle = item => M.title(item.content) || t('contentUntitled');
  const saveIndicator = <span className={'draft-save-state ' + saveState} role="status" data-save-state={saveState}>{t('draft-' + saveState)}</span>;
  function renderScreen() {
    if (!ready && !['read','history'].includes(route.page)) return <section className="content-gate" data-content-screen="gate"><p className="eyebrow">{t('contentEyebrow')}</p><h1 tabIndex="-1">{t('contentGateTitle')}</h1><p>{t('contentGateBody')}</p><div className="action-row"><Button variant="accent" data-action="content-connect" onClick={onConnect}>{t('connect')}</Button><Button onClick={onIdentity}>{t('myIdentity')}</Button><Button variant="quiet" onClick={() => go('read','first-words')}>{t('contentReadSample')}</Button></div></section>;
    if (route.page==='publish' || (['write','review'].includes(route.page) && M.unresolved(operation))) return <ContentPublication operation={operation && {...operation,confirmation:data.records.find(r=>r.id===operation.recordId)?.confirmation}} t={t} locale={locale} failCopy={failCopy} onApprove={publication.approve} onCancel={id=>{publication.cancel(id);setReview(null);setMessage('publishCancelled');go('write',route.id);}} onQuery={publication.query} onEdit={()=>{setReview(null);go(current ? 'write' : 'content',current?.id);}} onRead={id=>go('read',id)} onBack={()=>go('content')} />;
    if (route.page === 'write') return <section data-content-screen="write"><Button variant="quiet" data-action="content-back" onClick={() => go('content')}>{t('contentBack')}</Button>{current ? <>{message && <p className="draft-message" role="status">{t(message)}</p>}<ContentEditor draft={current} t={t} locale={locale} onChange={edit} savedState={saveIndicator} actions={<><Button data-action="markdown-import" onClick={()=>upload.current.click()}>{t("markdownImport")}</Button><Button data-action="markdown-export" onClick={()=>exportFile(current)}>{t("markdownExport")}</Button><Button variant="accent" data-action="content-review" onClick={checkPublication}>{t("contentReview")}</Button></>} /><input type="file" accept=".md" hidden ref={upload} data-action="markdown-file" onChange={importFile} />{reviewIssue && <p className="field-error" role="alert" data-review-error={reviewIssue}>{t(reviewIssue)}</p>}{fileError && <p role="alert" className="field-error">{t(fileError)}</p>}{saveState === 'error' && <div className="draft-error" role="alert"><p>{t('draftSaveFailedBody')}</p><Button onClick={() => persist(current.authorBapId)}>{t('retry')}</Button></div>}</> : <h1 tabIndex="-1">{t('contentMissing')}</h1>}</section>;
    if (route.page === 'review') return <section className="content-review" data-content-screen="review"><div className="page-heading"><p className="eyebrow">{t('reviewEyebrow')}</p><h1 tabIndex="-1">{t('contentReview')}</h1><p>{t(reviewValid ? 'reviewIntro' : 'reviewExpired')}</p></div>{reviewValid ? <><div className="review-author"><Portrait profile={review.author} /><div><span className="eyebrow">{t('contentWritingAs')}</span><strong>{review.author.name}</strong></div></div><Identifier id={review.authorBapId} t={t} failCopy={failCopy} /><article className="review-paper"><MarkdownBody source={review.content} t={t} /></article><aside className="publish-impact"><strong>{t('reviewImpactTitle')}</strong><p>{t('reviewImpact')}</p></aside><div className="review-footer"><Button data-action="review-edit" onClick={()=>go('write',current.id)}>{t('reviewEdit')}</Button><Button variant="accent" data-action="content-publish" onClick={()=>{if(reviewValid){publication.start(review);go('publish',current.id);}}}>{t('contentSignPublish')}</Button></div></> : <Button data-action="review-edit" onClick={()=>go(current ? 'write' : 'content',current?.id)}>{t('reviewEdit')}</Button>}</section>;
    if (route.page === 'read') return <ContentReader record={record} t={t} locale={locale} identity={identity} go={go} onExport={exportFile} failCopy={failCopy} settings={settings} operations={data.operations} records={data.records} drafts={data.drafts} onRevision={createRevision} />;
    if (route.page==='history') return <ContentHistory record={record} records={data.records} go={go} t={t} locale={locale} />;
    const latestRecords=data.records.filter(r=>M.versions(data.records,r)[0]?.id===r.id);
    const visible={drafts:data.drafts,records:latestRecords};
    const items = settings.list === 'empty' ? [] : visible[filter].filter(item => item.authorBapId === identity.bapId).sort((a,b) => (b.updatedAt || b.publishedAt).localeCompare(a.updatedAt || a.publishedAt));
    return <section className="content-workspace" data-content-screen="content">
      <div className="content-heading"><div><p className="eyebrow">{t('contentEyebrow')}</p><h1 tabIndex="-1">{t('myContent')}</h1><p>{t('contentIntro')}</p></div><Button variant="accent" data-action="content-new" onClick={create}>{t('contentNew')}</Button></div>
      <div className="content-author"><Portrait profile={identity.profile} /><div><span>{t('contentWritingAs')}</span><strong>{identity.profile.name}</strong></div><code title={identity.bapId}>{identity.bapId}</code></div>
      {data.readFailure && <div className="draft-error" role="alert"><p>{t('draftReadFailed')}</p><Button onClick={() => {const loaded=M.load(); if (!loaded.readFailure) {setData(loaded); saved.current=new Map(loaded.drafts.map(d=>[d.id,d.content]));}}}>{t('retry')}</Button></div>}
      {message && <p className="draft-message" role="status">{t(message)}</p>}
      <div className="content-filters" role="group" aria-label={t('contentFilter')}>{['drafts','records'].map(key => <Button key={key} variant="quiet" data-action={'filter-'+key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{t(key === 'drafts' ? 'contentDrafts' : 'contentPublished')}<span className="content-count">{settings.list === 'empty' ? 0 : visible[key].filter(item => item.authorBapId === identity.bapId).length}</span></Button>)}</div>
      {loading ? <div className="content-empty" role="status"><LoadingMark small /><p>{t('contentLoading')}</p></div> : settings.list === 'failure' ? <div className="content-empty" role="alert"><h2>{t('contentLoadFailed')}</h2><p>{t('contentLoadFailedBody')}</p><Button onClick={() => setSettings(s=>({...s,list:'normal'}))}>{t('retry')}</Button></div> : !items.length ? <div className="content-empty"><div className="content-empty-rule" aria-hidden="true"></div><h2>{t(filter === 'drafts' ? 'contentEmptyDrafts' : 'contentEmptyPublished')}</h2><p>{t(filter === 'drafts' ? 'contentEmptyDraftsBody' : 'contentEmptyPublishedBody')}</p><Button onClick={create}>{t('contentNew')}</Button></div> : <ul className="content-list">{items.map(item => <li key={item.id}>
        <Button variant="quiet" className="s2d-button s2d-button-quiet content-row" data-content-id={item.id} onClick={() => go(filter === 'drafts' ? 'write' : 'read',item.id)}><span className="content-row-main"><span className="content-row-title">{itemTitle(item)}</span><span className="content-summary">{M.summary(item.content) || t('contentStartWriting')}</span></span><span className="content-row-meta"><span>{t(filter === 'drafts' ? 'contentDraft' : 'contentPublishedOne')}</span><time dateTime={item.updatedAt || item.publishedAt}>{date(item.updatedAt || item.publishedAt)}</time><span>{t(filter === 'drafts' ? 'contentContinue' : 'contentRead')}</span></span></Button>
        {filter === 'drafts' && <div className="draft-options" ref={menu===item.id ? menuRef : undefined}><Button variant="quiet" data-draft-options={item.id} aria-label={t('editorMore')+' · '+itemTitle(item)} aria-expanded={menu===item.id} onClick={()=>setMenu(menu===item.id ? null : item.id)}>{t('editorMore')}</Button>{menu===item.id && <div className="draft-options-menu"><Button variant="negative" data-action="draft-delete" onClick={()=>{setMenu(null);setMessage('');setDialog({type:'delete',itemId:item.id});}}>{t('draftDelete')}</Button></div>}</div>}
      </li>)}</ul>}
      <p className="content-local-note">{t('contentLocalNote')}</p>
    </section>;
  }
  if (!active) return null;
  return <>{renderScreen()}{dialog?.type==='replace' ? <Modal title={t('importReplaceTitle')} titleKey="import-replace" closeLabel={t('close')} onCancel={()=>setDialog(null)}><p>{t('importReplaceBody')}</p><div className="action-row"><Button data-action="import-cancel" onClick={()=>setDialog(null)}>{t('cancel')}</Button><Button variant="accent" data-action="import-confirm" onClick={()=>{if(currentDraft()?.id===dialog.itemId) edit(dialog.source);setDialog(null);}}>{t('importReplace')}</Button></div></Modal> : dialog && <Modal title={t(dialog.type==='delete' ? 'draftDeleteTitle' : 'draftLeaveTitle')} titleKey={dialog.type==='delete' ? 'draft-delete' : 'draft-leave'} closeLabel={t('close')} onCancel={()=>setDialog(null)}>
    <p>{t(dialog.type==='delete' ? 'draftDeleteBody' : 'draftLeaveBody')}</p>
    {dialog.type==='delete' && <strong className="draft-dialog-title">{itemTitle(data.drafts.find(d=>d.id===dialog.itemId) || {content:''})}</strong>}
    {saveState==='error' && <p className="field-error" role="alert">{t('draftSaveFailedBody')}</p>}
    <div className="action-row"><Button data-action="draft-stay" onClick={()=>setDialog(null)}>{t(dialog.type==='delete' ? 'cancel' : 'keepEditing')}</Button>{dialog.type==='delete' ? <Button variant="negative" data-action="draft-confirm-delete" onClick={deleteDraft}>{t('draftDelete')}</Button> : <><Button variant="accent" data-action="draft-save-leave" onClick={saveAndLeave}>{t('draftSaveLeave')}</Button><Button variant="quiet" data-action="draft-discard-leave" onClick={discardAndLeave}>{t('draftDiscardLeave')}</Button></>}</div>
  </Modal>}</>;
});
function ContentSettings({settings,setSettings,t}) {return <fieldset className="content-settings"><legend>{t('contentScenarios')}</legend><label>{t('contentListScenario')}<select data-scenario="content-list" value={settings.list} onChange={e=>setSettings(s=>({...s,list:e.target.value}))}>{['normal','empty','failure'].map(value=><option value={value} key={value}>{t('contentScenario-'+value)}</option>)}</select></label><label>{t('draftStorageScenario')}<select data-scenario="content-storage" value={settings.storage} onChange={e=>setSettings(s=>({...s,storage:e.target.value}))}><option value="normal">{t('contentScenario-normal')}</option><option value="failure">{t('draftStorageFailure')}</option></select></label>{[['publish',['success','sign-failed','broadcast-failed','unknown']],['query',['accepted','unknown','not-received']],['confirmation',['pending','confirmed']],['account',['none','authorize-switch','authorize-disconnect','broadcasting-switch','broadcasting-disconnect']],['proof',['record','valid','unverified','failed']],['proofConfirmation',['record','pending','confirmed']]].map(([key,values])=><label key={key}>{t('scenario-'+key)}<select data-scenario={'content-'+key} value={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))}>{values.map(value=><option key={value} value={value}>{t(({'authorize-switch':'switch-confirm','authorize-disconnect':'disconnect-confirm'})[value] || 'scenario-'+value)}</option>)}</select></label>)}</fieldset>;}
Object.assign(window,{ContentWorkspace,ContentSettings});
