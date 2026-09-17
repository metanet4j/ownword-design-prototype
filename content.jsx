const ContentWorkspace = React.forwardRef(function ContentWorkspace({active, identity, locale, t, settings, setSettings, onConnect, onIdentity}, ref) {
  const M = window.OwnwordContentModel;
  const [data, setData] = React.useState(M.seed);
  const [route, setRoute] = React.useState(() => M.parseRoute(location.hash));
  const [filter, setFilter] = React.useState('drafts');
  const [loading, setLoading] = React.useState(true);
  const ready = !!identity;
  React.useEffect(() => {const read = () => setRoute(M.parseRoute(location.hash)); window.addEventListener('hashchange', read); return () => window.removeEventListener('hashchange', read);}, []);
  React.useEffect(() => {setLoading(true); const timer = setTimeout(() => setLoading(false), 350); return () => clearTimeout(timer);}, [identity?.bapId, settings.list, active]);
  React.useEffect(() => {if (active) {window.scrollTo(0, 0); document.querySelector('[data-content-screen] h1')?.focus({preventScroll: true}); console.info('[Ownword content]', {page: route.page, identity: identity?.bapId || 'visitor'});}}, [route.page, route.id, active, identity?.bapId]);
  const go = (page, id = '') => {location.hash = '/' + page + (id ? '/' + encodeURIComponent(id) : '');};
  React.useImperativeHandle(ref, () => ({go, leave: action => action()}));
  function create() {if (!ready) return; const item = M.draft(identity.bapId); setData(d => ({...d, drafts: [item, ...d.drafts]})); go('write', item.id);}
  const current = data.drafts.find(d => d.id === route.id && d.authorBapId === identity?.bapId);
  const record = data.records.find(r => r.id === route.id);
  const date = value => new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {month: 'short', day: 'numeric'}).format(new Date(value));
  const itemTitle = item => M.title(item.content) || t('contentUntitled');
  if (!active) return null;
  if (!ready && !['read', 'history'].includes(route.page)) return <section className="content-gate" data-content-screen="gate"><p className="eyebrow">{t('contentEyebrow')}</p><h1 tabIndex="-1">{t('contentGateTitle')}</h1><p>{t('contentGateBody')}</p><div className="action-row"><Button variant="accent" data-action="content-connect" onClick={onConnect}>{t('connect')}</Button><Button onClick={onIdentity}>{t('myIdentity')}</Button><Button variant="quiet" onClick={() => go('read', 'first-words')}>{t('contentReadSample')}</Button></div></section>;
  if (route.page === 'write') return <section data-content-screen="write"><Button variant="quiet" data-action="content-back" onClick={() => go('content')}>{t('contentBack')}</Button>{current ? <ContentEditor draft={current} t={t} locale={locale} onChange={value => setData(d => ({...d, drafts: d.drafts.map(item => item.id === current.id ? {...item, content: value, updatedAt: new Date().toISOString()} : item)}))} /> : <h1 tabIndex="-1">{t('contentMissing')}</h1>}</section>;
  if (route.page === 'read') return <section className="content-reading" data-content-screen="read"><Button variant="quiet" onClick={() => go('content')}>{t('contentBack')}</Button><h1 tabIndex="-1">{record ? itemTitle(record) : t('contentMissing')}</h1>{record && <MarkdownBody source={record.content} t={t} />}</section>;
  const items = settings.list === 'empty' ? [] : data[filter].filter(item => item.authorBapId === identity.bapId).sort((a, b) => (b.updatedAt || b.publishedAt).localeCompare(a.updatedAt || a.publishedAt));
  return <section className="content-workspace" data-content-screen="content">
    <div className="content-heading"><div><p className="eyebrow">{t('contentEyebrow')}</p><h1 tabIndex="-1">{t('myContent')}</h1><p>{t('contentIntro')}</p></div><Button variant="accent" data-action="content-new" onClick={create}>{t('contentNew')}</Button></div>
    <div className="content-author"><Portrait profile={identity.profile} /><div><span>{t('contentWritingAs')}</span><strong>{identity.profile.name}</strong></div><code title={identity.bapId}>{identity.bapId}</code></div>
    <div className="content-filters" role="group" aria-label={t('contentFilter')}>
      {['drafts', 'records'].map(key => <Button key={key} variant="quiet" data-action={'filter-' + key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{t(key === 'drafts' ? 'contentDrafts' : 'contentPublished')}<span className="content-count">{settings.list === 'empty' ? 0 : data[key].filter(item => item.authorBapId === identity.bapId).length}</span></Button>)}
    </div>
    {loading ? <div className="content-empty" role="status"><LoadingMark small /><p>{t('contentLoading')}</p></div> : settings.list === 'failure' ? <div className="content-empty" role="alert"><h2>{t('contentLoadFailed')}</h2><p>{t('contentLoadFailedBody')}</p><Button onClick={() => setSettings(s => ({...s, list: 'normal'}))}>{t('retry')}</Button></div> : !items.length ? <div className="content-empty"><div className="content-empty-rule" aria-hidden="true"></div><h2>{t(filter === 'drafts' ? 'contentEmptyDrafts' : 'contentEmptyPublished')}</h2><p>{t(filter === 'drafts' ? 'contentEmptyDraftsBody' : 'contentEmptyPublishedBody')}</p><Button onClick={create}>{t('contentNew')}</Button></div> : <ul className="content-list">{items.map(item => <li key={item.id}><Button variant="quiet" className="s2d-button s2d-button-quiet content-row" data-content-id={item.id} onClick={() => go(filter === 'drafts' ? 'write' : 'read', item.id)}><span className="content-row-main"><span className="content-row-title">{itemTitle(item)}</span><span className="content-summary">{M.summary(item.content) || t('contentStartWriting')}</span></span><span className="content-row-meta"><span>{t(filter === 'drafts' ? 'contentDraft' : 'contentPublishedOne')}</span><time dateTime={item.updatedAt || item.publishedAt}>{date(item.updatedAt || item.publishedAt)}</time><span>{t(filter === 'drafts' ? 'contentContinue' : 'contentRead')}</span></span></Button></li>)}</ul>}
    <p className="content-local-note">{t('contentLocalNote')}</p>
  </section>;
});
function ContentSettings({settings, setSettings, t}) {return <fieldset className="content-settings"><legend>{t('contentScenarios')}</legend><label>{t('contentListScenario')}<select data-scenario="content-list" value={settings.list} onChange={e => setSettings(s => ({...s, list: e.target.value}))}>{['normal','empty','failure'].map(value => <option value={value} key={value}>{t('contentScenario-' + value)}</option>)}</select></label></fieldset>;}
Object.assign(window, {ContentWorkspace, ContentSettings});
