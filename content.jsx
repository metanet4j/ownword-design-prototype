const ContentWorkspace = React.forwardRef(function ContentWorkspace({active, identity, locale, t, settings, setSettings, onConnect, onIdentity}, ref) {
  const M = window.OwnwordContentModel;
  const [data, reactSetData] = React.useState(() => M.load());
  const dataRef = React.useRef(data);
  const setData = update => {const next = typeof update === 'function' ? update(dataRef.current) : update; dataRef.current = next; reactSetData(next);};
  const [route, setRoute] = React.useState(() => M.parseRoute(location.hash));
  const routeRef = React.useRef(route), identityRef = React.useRef(identity), lastHash = React.useRef(location.hash);
  routeRef.current = route; identityRef.current = identity;
  const saved = React.useRef(new Map(data.drafts.map(d => [d.id, d.content])));
  const [filter, setFilter] = React.useState('drafts');
  const [loading, setLoading] = React.useState(true);
  const [saveState, setSaveState] = React.useState(data.readFailure ? 'error' : 'saved');
  const [dialog, setDialog] = React.useState(null);
  const [menu, setMenu] = React.useState(null);
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
    setMenu(null);
  }, [route.page, route.id, active, identity?.bapId]);
  React.useEffect(() => {
    const author = identity?.bapId;
    if (previousAuthor.current && previousAuthor.current !== author) {
      setDialog(null); setMenu(null);
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
    setData(d => ({...d, drafts:d.drafts.map(item => item.id === current.id ? {...item, content:value, updatedAt:new Date().toISOString()} : item)}));
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
  const record = data.records.find(r => r.id === route.id);
  const date = value => new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {month:'short', day:'numeric'}).format(new Date(value));
  const itemTitle = item => M.title(item.content) || t('contentUntitled');
  const saveIndicator = <span className={'draft-save-state ' + saveState} role="status" data-save-state={saveState}>{t('draft-' + saveState)}</span>;
  function renderScreen() {
    if (!ready && !['read','history'].includes(route.page)) return <section className="content-gate" data-content-screen="gate"><p className="eyebrow">{t('contentEyebrow')}</p><h1 tabIndex="-1">{t('contentGateTitle')}</h1><p>{t('contentGateBody')}</p><div className="action-row"><Button variant="accent" data-action="content-connect" onClick={onConnect}>{t('connect')}</Button><Button onClick={onIdentity}>{t('myIdentity')}</Button><Button variant="quiet" onClick={() => go('read','first-words')}>{t('contentReadSample')}</Button></div></section>;
    if (route.page === 'write') return <section data-content-screen="write"><Button variant="quiet" data-action="content-back" onClick={() => go('content')}>{t('contentBack')}</Button>{current ? <><ContentEditor draft={current} t={t} locale={locale} onChange={edit} savedState={saveIndicator} />{saveState === 'error' && <div className="draft-error" role="alert"><p>{t('draftSaveFailedBody')}</p><Button onClick={() => persist(current.authorBapId)}>{t('retry')}</Button></div>}</> : <h1 tabIndex="-1">{t('contentMissing')}</h1>}</section>;
    if (route.page === 'read') return <section className="content-reading" data-content-screen="read"><Button variant="quiet" onClick={() => go('content')}>{t('contentBack')}</Button><h1 tabIndex="-1">{record ? itemTitle(record) : t('contentMissing')}</h1>{record && <MarkdownBody source={record.content} t={t} />}</section>;
    const items = settings.list === 'empty' ? [] : data[filter].filter(item => item.authorBapId === identity.bapId).sort((a,b) => (b.updatedAt || b.publishedAt).localeCompare(a.updatedAt || a.publishedAt));
    return <section className="content-workspace" data-content-screen="content">
      <div className="content-heading"><div><p className="eyebrow">{t('contentEyebrow')}</p><h1 tabIndex="-1">{t('myContent')}</h1><p>{t('contentIntro')}</p></div><Button variant="accent" data-action="content-new" onClick={create}>{t('contentNew')}</Button></div>
      <div className="content-author"><Portrait profile={identity.profile} /><div><span>{t('contentWritingAs')}</span><strong>{identity.profile.name}</strong></div><code title={identity.bapId}>{identity.bapId}</code></div>
      {data.readFailure && <div className="draft-error" role="alert"><p>{t('draftReadFailed')}</p><Button onClick={() => {const loaded=M.load(); if (!loaded.readFailure) {setData(loaded); saved.current=new Map(loaded.drafts.map(d=>[d.id,d.content]));}}}>{t('retry')}</Button></div>}
      {message && <p className="draft-message" role="status">{t(message)}</p>}
      <div className="content-filters" role="group" aria-label={t('contentFilter')}>{['drafts','records'].map(key => <Button key={key} variant="quiet" data-action={'filter-'+key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{t(key === 'drafts' ? 'contentDrafts' : 'contentPublished')}<span className="content-count">{settings.list === 'empty' ? 0 : data[key].filter(item => item.authorBapId === identity.bapId).length}</span></Button>)}</div>
      {loading ? <div className="content-empty" role="status"><LoadingMark small /><p>{t('contentLoading')}</p></div> : settings.list === 'failure' ? <div className="content-empty" role="alert"><h2>{t('contentLoadFailed')}</h2><p>{t('contentLoadFailedBody')}</p><Button onClick={() => setSettings(s=>({...s,list:'normal'}))}>{t('retry')}</Button></div> : !items.length ? <div className="content-empty"><div className="content-empty-rule" aria-hidden="true"></div><h2>{t(filter === 'drafts' ? 'contentEmptyDrafts' : 'contentEmptyPublished')}</h2><p>{t(filter === 'drafts' ? 'contentEmptyDraftsBody' : 'contentEmptyPublishedBody')}</p><Button onClick={create}>{t('contentNew')}</Button></div> : <ul className="content-list">{items.map(item => <li key={item.id}>
        <Button variant="quiet" className="s2d-button s2d-button-quiet content-row" data-content-id={item.id} onClick={() => go(filter === 'drafts' ? 'write' : 'read',item.id)}><span className="content-row-main"><span className="content-row-title">{itemTitle(item)}</span><span className="content-summary">{M.summary(item.content) || t('contentStartWriting')}</span></span><span className="content-row-meta"><span>{t(filter === 'drafts' ? 'contentDraft' : 'contentPublishedOne')}</span><time dateTime={item.updatedAt || item.publishedAt}>{date(item.updatedAt || item.publishedAt)}</time><span>{t(filter === 'drafts' ? 'contentContinue' : 'contentRead')}</span></span></Button>
        {filter === 'drafts' && <div className="draft-options" ref={menu===item.id ? menuRef : undefined}><Button variant="quiet" data-draft-options={item.id} aria-label={t('editorMore')+' · '+itemTitle(item)} aria-expanded={menu===item.id} onClick={()=>setMenu(menu===item.id ? null : item.id)}>{t('editorMore')}</Button>{menu===item.id && <div className="draft-options-menu"><Button variant="negative" data-action="draft-delete" onClick={()=>{setMenu(null);setMessage('');setDialog({type:'delete',itemId:item.id});}}>{t('draftDelete')}</Button></div>}</div>}
      </li>)}</ul>}
      <p className="content-local-note">{t('contentLocalNote')}</p>
    </section>;
  }
  if (!active) return null;
  return <>{renderScreen()}{dialog && <Modal title={t(dialog.type==='delete' ? 'draftDeleteTitle' : 'draftLeaveTitle')} titleKey={dialog.type==='delete' ? 'draft-delete' : 'draft-leave'} closeLabel={t('close')} onCancel={()=>setDialog(null)}>
    <p>{t(dialog.type==='delete' ? 'draftDeleteBody' : 'draftLeaveBody')}</p>
    {dialog.type==='delete' && <strong className="draft-dialog-title">{itemTitle(data.drafts.find(d=>d.id===dialog.itemId) || {content:''})}</strong>}
    {saveState==='error' && <p className="field-error" role="alert">{t('draftSaveFailedBody')}</p>}
    <div className="action-row"><Button data-action="draft-stay" onClick={()=>setDialog(null)}>{t(dialog.type==='delete' ? 'cancel' : 'keepEditing')}</Button>{dialog.type==='delete' ? <Button variant="negative" data-action="draft-confirm-delete" onClick={deleteDraft}>{t('draftDelete')}</Button> : <><Button variant="accent" data-action="draft-save-leave" onClick={saveAndLeave}>{t('draftSaveLeave')}</Button><Button variant="quiet" data-action="draft-discard-leave" onClick={discardAndLeave}>{t('draftDiscardLeave')}</Button></>}</div>
  </Modal>}</>;
});
function ContentSettings({settings,setSettings,t}) {return <fieldset className="content-settings"><legend>{t('contentScenarios')}</legend><label>{t('contentListScenario')}<select data-scenario="content-list" value={settings.list} onChange={e=>setSettings(s=>({...s,list:e.target.value}))}>{['normal','empty','failure'].map(value=><option value={value} key={value}>{t('contentScenario-'+value)}</option>)}</select></label><label>{t('draftStorageScenario')}<select data-scenario="content-storage" value={settings.storage} onChange={e=>setSettings(s=>({...s,storage:e.target.value}))}><option value="normal">{t('contentScenario-normal')}</option><option value="failure">{t('draftStorageFailure')}</option></select></label></fieldset>;}
Object.assign(window,{ContentWorkspace,ContentSettings});
