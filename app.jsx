const words = window.OwnwordCopy;
function App() {
  const {initial, reducer, validate, countGraphemes, ids} = OwnwordModel;
  const {useDismissable} = window;
  const [state, dispatch] = React.useReducer(reducer, undefined, initial);
  const pref = (key, fallback) => {try {return localStorage.getItem(`ownword-astra-${key}`) || fallback;} catch {return fallback;}};
  const [locale, setLocale] = React.useState(() => pref('locale', 'en') === 'zh' ? 'zh' : 'en');
  const [theme, setTheme] = React.useState(() => pref('theme', 'light') === 'dark' ? 'dark' : 'light');
  const [scenario, setScenario] = React.useState('new');
  const [lab, setLab] = React.useState(false);
  const [nextResult, setNextResult] = React.useState('success');
  const [accountEvent, setAccountEvent] = React.useState('none');
  const [prefs, setPrefs] = React.useState(false);
  const [validationShown, setValidationShown] = React.useState(false);
  const [imageError, setImageError] = React.useState('');
  const [failCopy, setFailCopy] = React.useState(false);
  const [rotating, setRotating] = React.useState(false);
  const [angle, setAngle] = React.useState(-10);
  const [storageError, setStorageError] = React.useState(false);
  const prefsRef = React.useRef(null);
  const firstPaint = React.useRef(true);
  const pendingResult = React.useRef(false);
  const operationScenario = React.useRef('new');
  const currentState = React.useRef(state);
  const upload = React.useRef(null);
  currentState.current = state;
  const t = key => (words[locale][key] || words.en[key] || key);
  const bapId = ids[state.account];
  const formPage = state.page === 'setup' || state.page === 'edit';
  const editing = state.page === 'edit';
  const dirty = JSON.stringify(state.profile) !== JSON.stringify(state.draft);
  const errors = validationShown ? validate(state.draft) : {};
  useDismissable(prefs, () => setPrefs(false), prefsRef);
  React.useEffect(() => {
    document.documentElement.dataset.colorScheme = theme;
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    try {localStorage.setItem('ownword-astra-locale', locale); localStorage.setItem('ownword-astra-theme', theme);} catch {setStorageError(true);}
  }, [locale, theme]);
  React.useEffect(() => {
    if (!state.busy) return;
    const epoch = state.epoch;
    const timer = setTimeout(() => {
      if (state.busy === 'resolving') dispatch({type: 'RESOLVED', scenario: operationScenario.current, epoch});
      else dispatch({type: 'RESULT', operation: state.busy, fail: pendingResult.current, epoch});
    }, state.busy === 'resolving' ? 850 : 1500);
    return () => clearTimeout(timer);
  }, [state.busy, state.epoch]);
  React.useEffect(() => {
    console.info('[Ownword prototype]', {page: state.page, wallet: state.wallet ? 'connected' : 'disconnected', operation: state.busy || state.modal || 'none', account: state.account, notice: state.notice, error: state.error, epoch: state.epoch});
    setValidationShown(false); setImageError('');
    // 页面切换回到顶部并聚焦标题，避免沿用上一页的滚动位置。
    // 首次加载保留默认焦点，让 Tab 从跳转链接和页头开始。
    if (firstPaint.current) {firstPaint.current = false; return;}
    if (!state.modal) {
      window.scrollTo({top: 0, behavior: 'instant'});
      document.querySelector('main h1')?.focus({preventScroll: true});
    }
  }, [state.page, state.epoch]);
  React.useEffect(() => {
    const block = e => {if (dirty && (formPage || state.page === 'review')) {e.preventDefault(); e.returnValue = '';}};
    window.addEventListener('beforeunload', block); return () => window.removeEventListener('beforeunload', block);
  }, [dirty, formPage, state.page]);
  function navigate(page) {
    setPrefs(false);
    if ((formPage || state.page === 'review') && dirty) dispatch({type: 'DISCARD_ASK', page});
    else if (page === 'welcome' && state.wallet) disconnect();
    else dispatch({type: 'GO', page});
  }
  function resolveAgain() {operationScenario.current = scenario === 'missing' ? 'new' : scenario; dispatch({type: 'RETRY_RESOLVE'});}
  function switchAccount() {operationScenario.current = 'existing'; setPrefs(false); dispatch({type: 'SWITCH'});}
  function disconnect() {setPrefs(false); dispatch({type: 'DISCONNECT'});}
  // 演练配置只决定下一次操作，不进入产品状态或签名输入。
  function confirmConnection() {
    operationScenario.current = scenario;
    const failed = nextResult === 'failure' || scenario === 'missing';
    setNextResult('success');
    dispatch({type: failed ? 'CONNECT_FAILED' : 'CONNECTED'});
  }
  function approveOperation() {
    pendingResult.current = nextResult === 'failure';
    setNextResult('success');
    dispatch({type: 'PROCESS', operation: state.modal});
  }
  function resetSession() {
    setNextResult('success'); setAccountEvent('none'); setFailCopy(false);
    disconnect();
  }
  React.useEffect(() => {
    if (!state.wallet || accountEvent === 'none') return;
    const [action, phase] = accountEvent.split('-');
    const active = phase === 'confirm'
      ? ['create', 'save'].includes(state.modal)
      : ['create', 'save'].includes(state.busy);
    if (!active) return;
    const epoch = state.epoch;
    const timer = setTimeout(() => {
      if (currentState.current.epoch !== epoch) return;
      setAccountEvent('none');
      console.info('[Ownword prototype] account event', {action, phase, epoch});
      if (action === 'switch') switchAccount(); else disconnect();
    }, phase === 'confirm' ? 1200 : 600);
    return () => clearTimeout(timer);
  }, [accountEvent, state.wallet, state.modal, state.busy, state.epoch]);
  function checkForm() {
    const found = validate(state.draft); setValidationShown(true);
    if (Object.values(found).some(Boolean)) {setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0); return;}
    dispatch({type: 'REVIEW'});
  }
  async function chooseFile(e) {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    const capturedEpoch = state.epoch;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {setImageError('invalidImage'); return;}
    const url = URL.createObjectURL(file);
    try {
      const picture = new Image(); picture.src = url; await picture.decode();
      // A local blob URL is preview-only; no upload/API contract is invented.
      if (currentState.current.epoch !== capturedEpoch) {URL.revokeObjectURL(url); return;}
      dispatch({type: 'DRAFT', field: 'image', value: url}); setImageError('');
    } catch {URL.revokeObjectURL(url); setImageError('invalidImage');}
  }
  function heading(k, subtitle, eyebrow) {return <div className="page-heading">{eyebrow && <p className="eyebrow">{t(eyebrow)}</p>}<h1 tabIndex="-1">{t(k)}</h1><p>{t(subtitle)}</p></div>;}
  const isFlow = ['setup', 'review', 'ready'].includes(state.page);
  const profileDisplay = state.page === 'identity' || state.page === 'public' ? state.profile : state.draft;
  const toastError = state.page !== 'resolve-error' ? state.error : '';
  const toastMessage = toastError || (storageError ? 'persistFailed' : state.notice);
  const toastBody = toastError ? (toastError === 'connectFailed' ? 'connectFailedBody' : 'operationFailedBody')
    : state.notice.includes('Cancelled') && !storageError ? (state.notice === 'connectCancelled' ? 'identityUnchanged' : 'retained') : '';
  const retryError = toastError ? () => dispatch(toastError === 'connectFailed'
    ? {type: 'CONNECT'} : {type: 'AUTHORIZE', operation: toastError === 'createFailed' ? 'create' : 'save'}) : undefined;
  return <div className={`app page-${state.page}`} onPointerDown={e => {if (!e.target.closest('button, input, textarea, select, a, .identity-object')) window.dispatchEvent(new Event('ownword-vault'));}}>
    <a className="skip-link" href="#main">{locale === 'en' ? 'Skip to content' : '跳至正文'}</a>
    <header className="topbar">
      <Button variant="quiet" className="brand" onClick={() => navigate(state.wallet ? (state.published ? 'identity' : 'setup') : 'welcome')}><BrandMark />ownword</Button>
      <nav aria-label={t('myIdentity')} className="topnav">
        {state.wallet && state.published && <Button variant="quiet" aria-current={state.page === 'identity' ? 'page' : undefined} onClick={() => navigate('identity')}>{t('myIdentity')}</Button>}
        <div className="preference-anchor" ref={prefsRef}><Button variant="quiet" onClick={() => setPrefs(!prefs)} aria-expanded={prefs} aria-controls="preferences-panel">{locale === 'en' ? 'EN' : '中文'}<span className="pref-separator" aria-hidden="true">/</span>{t(theme)}</Button>
          {prefs && <section className="preferences" id="preferences-panel" aria-label={t('preferences')}><h2>{t('preferences')}</h2><p className="field-label">{t('language')}</p><div className="choice-row"><Button data-action="locale-en" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</Button><Button data-action="locale-zh" aria-pressed={locale === 'zh'} onClick={() => setLocale('zh')}>中文</Button></div><p className="field-label">{t('theme')}</p><div className="choice-row"><Button data-action="theme-light" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>{t('light')}</Button><Button data-action="theme-dark" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>{t('dark')}</Button></div><p className="hint">{t('preferenceHint')}</p><Button variant="quiet" onClick={() => setPrefs(false)}>{t('close')}</Button></section>}
        </div>
        {state.wallet && <Button data-action="disconnect" onClick={disconnect}>{t('disconnect')}</Button>}
      </nav>
    </header>
    <Dome label={t('domeLabel')} />
    <main id="main" data-screen-label={state.page} data-modal={state.modal || ""} data-busy={state.busy || ""} data-incomplete={state.incomplete ? "true" : "false"} tabIndex="-1">
      {state.page === 'welcome' && <section className="welcome">
        <p className="eyebrow">{t('independent')}</p>
        <h1 tabIndex="-1"><span>{t('headlineOne')}</span><em>{t('headlineTwo')}</em></h1>
        <p className="welcome-intro">{t('welcomeIntro')}</p>
        <p className="welcome-body">{t('welcomeBody')}</p>
        <div className="welcome-action"><Button variant="accent" data-action="connect" onClick={() => dispatch({type: 'CONNECT'})}>{t(state.error === 'connectFailed' ? 'retry' : 'connect')}<span className="button-arrow" aria-hidden="true"></span></Button><p>{t('walletNote')}</p></div>
        <div className="horizon"><span>{t('horizonCaption')}</span></div>
        <p className="welcome-note">{t('welcomeNote')}</p>
      </section>}
      {state.page === 'resolving' && <section className="center-state">{heading('resolving', 'resolvingBody', 'connected')}<LoadingMark label={t('resolving')} /><span aria-hidden="true"><S2.Skeleton /></span><Button onClick={disconnect}>{t('disconnect')}</Button></section>}
      {state.page === 'resolve-error' && <section className="center-state">{heading('resolveFailed', 'resolveFailedBody', 'connected')}<div className="state-symbol error-symbol" aria-hidden="true">!</div><div className="action-row"><Button variant="accent" data-action="retry" onClick={resolveAgain}>{t('retry')}</Button><Button data-action="disconnect" onClick={disconnect}>{t('disconnect')}</Button></div></section>}
      {isFlow && <ol className="flow-steps" aria-label={t('setup')}>
        {['setupStep', 'reviewStep', 'confirmStep', 'doneStep'].map((step, i) => <li key={step} aria-current={(state.page === 'setup' ? 0 : state.page === 'review' ? (state.busy ? 2 : 1) : 3) === i ? 'step' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{t(step)}</li>)}
      </ol>}
      {formPage && <section className="workbench">
        <aside>{heading(editing ? 'editHeading' : state.incomplete ? 'complete' : 'setupHeading', editing ? 'editBody' : state.incomplete ? 'completeBody' : 'setupBody', editing ? 'editProfile' : 'setup')}
          <div className="aside-identity"><span className="eyebrow">{t('currentIdentity')}</span><code>{bapId}</code><p>{t(state.published ? 'published' : 'localId')}</p></div>
        </aside>
        <form className="profile-form" noValidate onSubmit={e => {e.preventDefault(); checkForm();}}>
          <div className="avatar-field"><Portrait profile={state.draft} /><div><span className="field-label">{t('avatar')}</span><div className="action-row"><Button onClick={() => upload.current.click()}>{t('chooseImage')}</Button>{state.draft.image && <Button variant="quiet" onClick={() => dispatch({type: 'DRAFT', field: 'image', value: ''})}>{t('removeImage')}</Button>}</div><p className="hint">{t('imageHint')}</p></div></div>
          <input ref={upload} type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseFile} hidden aria-label={t('chooseImage')} />
          {imageError && <p className="field-error" role="alert" data-field-error={imageError}>{t(imageError)}</p>}
          <Field id="profile-name" label={`${t('name')} *`} value={state.draft.name} onChange={value => dispatch({type: 'DRAFT', field: 'name', value})} error={errors.name ? t(errors.name) : ''} errorKey={errors.name || ''} required />
          <fieldset className="type-choice"><legend>{t('type')} *</legend><div className="choice-row">{['Person', 'Organization'].map(type => <Button key={type} aria-pressed={state.draft.type === type} onClick={() => dispatch({type: 'DRAFT', field: 'type', value: type})}>{t(type)}</Button>)}</div>{errors.type && <p className="field-error" data-field-error={errors.type}>{t(errors.type)}</p>}</fieldset>
          <Field id="profile-bio" label={`${t('bio')} · ${t('optional')}`} multiline value={state.draft.bio} onChange={value => dispatch({type: 'DRAFT', field: 'bio', value})} error={errors.bio ? t(errors.bio) : ''} errorKey={errors.bio || ''} />
          <p className="character-count">{countGraphemes(state.draft.bio)} / 1000</p>
          <div className="form-footer"><Button variant="quiet" data-action="back" onClick={() => navigate(state.published ? 'identity' : 'welcome')}>{t('back')}</Button><Button variant="accent" data-action="review" type="submit">{t(editing ? 'review' : 'review')}</Button></div>
        </form>
      </section>}
      {state.page === 'review' && <section className="workbench review-layout">
        <aside>{heading('reviewHeading', 'reviewBody', 'review')}<p className="impact">{t(state.published ? 'saveImpact' : 'createImpact')}</p><p className="hint">{t('controlStatement')}</p></aside>
        <div className="review-profile"><div className="person-row"><Portrait profile={state.draft} /><div><span className="profile-type">{t(state.draft.type)}</span><h2>{state.draft.name}</h2></div></div><p className="bio">{state.draft.bio || t('noBio')}</p><Identifier id={bapId} t={t} failCopy={failCopy} /><p className="hint">{t(state.published ? 'published' : 'localId')}</p>
          {state.busy ? <div className="processing" role="status"><LoadingMark small /><strong>{t(state.busy === 'create' ? 'creating' : 'saving')}</strong><p>{t('processingBody')}</p></div> : <div className="form-footer"><Button variant="quiet" data-action="back" onClick={() => dispatch({type: 'GO', page: state.published && !state.incomplete ? 'edit' : 'setup'})}>{t('back')}</Button><Button variant="accent" data-action="submit-operation" data-operation={state.published ? 'save' : 'create'} onClick={() => dispatch({type: 'AUTHORIZE', operation: state.published ? 'save' : 'create'})}>{t(state.error ? 'retry' : state.published ? 'save' : 'create')}</Button></div>}
        </div>
      </section>}
      {state.page === 'ready' && <section className="center-state ready-state"><div className="ready-seal" aria-hidden="true"></div>{heading('ready', 'readyBody')}<Identifier id={bapId} t={t} failCopy={failCopy} /><Button variant="accent" data-action="go-identity" onClick={() => dispatch({type: 'GO', page: 'identity'})}>{t('goIdentity')}</Button></section>}
      {state.page === 'identity' && <section className="identity-page">
        {heading('myIdentity', 'identityBody')}
        <div className="identity-layout">
          <div className="identity-primary">
            <div className="person-row"><Portrait profile={state.profile} large /><div className="identity-person"><div className="identity-meta"><span className="profile-type">{t(state.profile.type)}</span><S2.StatusLight label={t('published')} /></div><h2>{state.profile.name || t('complete')}</h2><p className="hint">{t('owner')}</p></div></div>
            <Identifier id={bapId} t={t} failCopy={failCopy} />
            <div className="action-row"><Button variant="accent" data-action="edit" onClick={() => dispatch({type: 'EDIT'})}>{t('editProfile')}</Button><Button data-action="public" onClick={() => {setAngle(-10); setRotating(!matchMedia('(prefers-reduced-motion: reduce)').matches); navigate('public');}}>{t('publicIdentity')}</Button></div>
          </div>
          <section className="profile-detail" aria-labelledby="identity-bio-heading"><h3 id="identity-bio-heading">{t('bio')}</h3><p className="bio">{state.profile.bio || t('noBio')}</p></section>
        </div>
        <div className="flat-horizon" aria-hidden="true"></div>
      </section>}
      {state.page === 'public' && <section className="public-page">{heading('publicIntro', 'publicBody', 'publicIdentity')}<IdentityCard profile={profileDisplay} id={bapId} t={t} failCopy={failCopy} transaction={state.transaction} rotating={rotating} setRotating={setRotating} angle={angle} setAngle={setAngle} /><div className="public-back"><Button variant="quiet" data-action="back-identity" onClick={() => navigate('identity')}>{t('backIdentity')}</Button></div></section>}
    </main>
    {toastMessage && <Toast key={toastMessage + ':' + state.epoch} message={toastMessage} body={toastBody} error={!!(toastError || storageError)} notice={!toastError && !storageError ? state.notice : undefined} storageError={!toastError && storageError} t={t} onRetry={retryError} onDismiss={() => {
      if (storageError && !toastError) setStorageError(false);
      if (!toastError && !storageError) dispatch({type: 'CLEAR_NOTICE', notice: state.notice, epoch: state.epoch});
    }} />}
    <footer className="footer"><p>{t('footer')}</p><div className="footer-controls">{state.wallet && <span className="wallet-connected"><S2.StatusLight label={t('connected')} /></span>}<Button variant="quiet" onClick={() => setLab(!lab)} aria-expanded={lab}>{t('prototype')}<span className="prototype-dot" aria-hidden="true"></span></Button></div></footer>
    {lab && <section className="scenario-panel" aria-label={t('scenarios')}><div className="panel-title"><h2>{t('scenarios')}</h2><Button variant="quiet" onClick={() => setLab(false)}>{t('close')}</Button></div><p>{t('simulatorNote')}</p><p>{t('sampleDataNote')}</p><label>{t('scenario')}<select data-scenario="identity" value={scenario} onChange={e => setScenario(e.target.value)}>{['new', 'existing', 'incomplete', 'resolveFail', 'missing'].map(key => <option value={key} key={key}>{t(key)}</option>)}</select></label><p className="hint">{t('simulatorHint')}</p>
      <label>{t('nextResult')}<select data-scenario="result" value={nextResult} onChange={e => setNextResult(e.target.value)}><option value="success">{t('resultSuccess')}</option><option value="failure">{t('simulateFailure')}</option></select></label>
      <p className="hint">{t('nextResultHint')}</p>
      <label>{t('accountEvent')}<select data-scenario="account-event" value={accountEvent} onChange={e => setAccountEvent(e.target.value)}>{['none', 'switch-confirm', 'switch-process', 'disconnect-confirm', 'disconnect-process'].map(value => <option key={value} value={value}>{t(value)}</option>)}</select></label>
      <p className="hint">{t('accountEventHint')}</p>
      <label className="check-row"><input type="checkbox" checked={failCopy} onChange={e => setFailCopy(e.target.checked)} />{t('failClipboard')}</label><div className="action-row">{state.wallet && <><Button onClick={resolveAgain}>{t('resolveAgain')}</Button><Button data-action="simulate-switch" onClick={switchAccount}>{t('accountSwitch')}</Button><Button data-action="simulate-disconnect" onClick={disconnect}>{t('disconnect')}</Button></>}<Button data-action="reset-session" onClick={resetSession}>{t('reset')}</Button></div></section>}
    {state.modal && <Modal context={state.modal === 'discard' || (state.modal === 'connect' && scenario === 'missing') ? 'OWNWORD' : t('walletAuthorization')} closeLabel={t('close')} titleKey={state.modal === 'connect' ? (scenario === 'missing' ? 'missingTitle' : 'connectTitle') : state.modal === 'discard' ? 'discardTitle' : state.modal === 'create' ? 'createTitle' : 'saveTitle'} title={t(state.modal === 'connect' ? (scenario === 'missing' ? 'missingTitle' : 'connectTitle') : state.modal === 'discard' ? 'discardTitle' : state.modal === 'create' ? 'createTitle' : 'saveTitle')} onCancel={() => dispatch({type: state.modal === 'discard' ? 'STAY' : 'CANCEL'})}>
      {state.modal === 'discard' ? <><p>{t('discardBody')}</p><div className="action-row"><Button data-action="keep-editing" onClick={() => dispatch({type: 'STAY'})}>{t('keepEditing')}</Button><Button variant="negative" data-action="discard" onClick={() => dispatch({type: 'DISCARD'})}>{t('discard')}</Button></div></> : <>
        <p>{t(state.modal === 'connect' ? scenario === 'missing' ? 'missingBody' : 'connectBody' : state.modal === 'create' ? 'createImpact' : 'saveImpact')}</p>
        {state.modal !== 'connect' && <><div className="person-row compact"><Portrait profile={state.draft} /><div><span className="eyebrow">{t('currentIdentity')}</span><strong>{state.draft.name}</strong></div></div><Identifier id={bapId} t={t} failCopy={failCopy} /><p className="hint">{t('controlStatement')}</p></>}
        <div className="action-row"><Button data-action="cancel" onClick={() => dispatch({type: 'CANCEL'})}>{t('cancel')}</Button><Button variant="accent" data-action="approve" onClick={() => state.modal === 'connect' ? confirmConnection() : approveOperation()}>{t(scenario === 'missing' && state.modal === 'connect' ? 'retry' : 'approve')}</Button></div>
      </>}
    </Modal>}
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
