const words = {
  en: {
    connect: 'Connect Wallet', connected: 'Connected', notConnected: 'Not connected', connecting: 'Connecting', disconnect: 'Disconnect', accountSwitch: 'Switch account', wallet: 'Wallet',
    myIdentity: 'My Identity', publicIdentity: 'Public Identity', preferences: 'Preferences', theme: 'Theme', light: 'Light', dark: 'Dark', language: 'Language',
    headlineOne: 'Own your identity.', headlineTwo: 'Own your words.', welcomeIntro: 'A place to stand. A voice that belongs to you.', welcomeBody: 'Begin with your wallet. Create an identity you control, and give your words a lasting home.',
    welcomeNote: 'Your wallet controls your identity.', horizonCaption: 'A foundation for your voice', domeLabel: 'Play the seven sky lines',
    walletNote: 'Yours Wallet', independent: 'Your identity starts with you.', footer: 'Your wallet. Your identity. Your words.', prototype: 'Interactive prototype', scenarios: 'Explore scenarios', close: 'Close',
    scenario: 'Wallet identity', new: 'New identity', existing: 'Published identity', incomplete: 'Incomplete profile', resolveFail: 'Resolution fails', missing: 'Wallet unavailable',
    simulatorNote: 'Demo only. No wallet connection, signature or transaction is sent.', simulatorHint: 'Choose a scenario, then connect or resolve again. Wallet confirmations let you approve, cancel or simulate failure.',
    resolveAgain: 'Resolve again', failClipboard: 'Simulate copy failure', reset: 'Reset session',
    connectTitle: 'Connect Yours Wallet', connectBody: 'Allow this application to see your current wallet identity. Publishing requires a separate confirmation.', approve: 'Approve', cancel: 'Cancel', simulateFailure: 'Simulate failure',
    connectCancelled: 'Connection cancelled', connectFailed: 'Connection failed', connectFailedBody: 'The wallet connection could not be completed. Your identity is unchanged. Try again.',
    missingTitle: 'Yours Wallet is unavailable', missingBody: 'No supported wallet was found. Open Yours Wallet, then try again.', retry: 'Try Again',
    resolving: 'Resolving your identity...', resolvingBody: 'Checking whether your wallet has a published identity.', resolveFailed: "Couldn't resolve identity", resolveFailedBody: 'Your wallet is connected, but the identity lookup failed. Try again or disconnect.',
    setup: 'Identity Setup', setupHeading: 'Make it yours.', setupBody: 'Choose how your identity appears to the world.', complete: 'Complete your profile', completeBody: 'Your identity is already published. Add the missing profile information to continue.',
    avatar: 'Avatar', chooseImage: 'Choose image', removeImage: 'Remove image', imageHint: 'Local PNG, JPEG or WebP. Optional.', invalidImage: 'Choose a valid PNG, JPEG or WebP image.', name: 'Name', required: 'Enter a name.', nameLong: 'Use 100 characters or fewer.', bioLong: 'Use 1000 characters or fewer.', typeRequired: 'Choose Person or Organization.',
    type: 'Type', Person: 'Person', Organization: 'Organization', bio: 'Bio', optional: 'Optional', review: 'Review', back: 'Back', profile: 'Profile', editProfile: 'Edit Profile', editHeading: 'A little more you.', editBody: 'Update how you appear. Your BAP ID stays the same.',
    reviewHeading: 'This is your identity.', reviewBody: 'Review the details before confirming in your wallet.', create: 'Create Identity', createImpact: 'Your identity and profile will become public.', saveImpact: 'Your updated profile will become public. Your BAP ID will not change.', localId: 'Locally computed · not yet published', published: 'Published', controlStatement: 'Your wallet controls this identity.',
    copy: 'Copy', copied: 'Copied', copyFailed: "Couldn't copy", copyBap: 'Copy full BAP ID', noBio: 'No bio yet.',
    createTitle: 'Confirm identity creation', saveTitle: 'Confirm profile update', simulatedWallet: 'Simulated wallet confirmation', currentIdentity: 'Current identity',
    creating: 'Creating identity...', saving: 'Saving...', processingBody: 'Waiting for the operation to finish. You can disconnect or switch account to cancel this operation.',
    createCancelled: 'Creation cancelled', saveCancelled: 'Saving cancelled', retained: 'Your editing values are kept. Review them and try again when ready.',
    createFailed: "Couldn't create identity", saveFailed: "Couldn't save profile", operationFailedBody: 'The operation did not complete. Your values are kept. Try again.',
    ready: 'Your identity is ready', readyBody: 'You now have a place to stand. Your wallet remains in control.', goIdentity: 'Go to My Identity', saved: 'Saved',
    identityIntro: 'A constant in a changing world.', identityBody: 'Your public identity, under your control.', owner: 'Controlled by your connected wallet', profileDetails: 'Profile details', account: 'Wallet account',
    publicIntro: 'Your identity, in the open.', publicBody: 'A public view of the identity you control.', backIdentity: 'Back to My Identity', ownedByYou: 'Identity, owned by you.', rotate: 'Rotate identity', pauseRotation: 'Pause rotation', resetView: 'Reset view', angle: 'Viewing angle',
    save: 'Save Changes', discardTitle: 'Discard unsaved changes?', discardBody: 'Your changes have not been saved. Keep editing, or discard them to leave this page.', keepEditing: 'Keep editing', discard: 'Discard changes',
    accountChanged: 'Account changed. Pending operations were cancelled.', identityUnchanged: 'Your identity is unchanged.', current: 'Current', preferenceHint: 'Language and appearance stay on this device.', demoAccount: 'Demo account', demoData: 'Sample identity · prototype data',
    setupStep: 'Profile', reviewStep: 'Review', confirmStep: 'Confirm', doneStep: 'Ready', copyFailureOn: 'Copy failure simulation is on', privatePreview: 'Public view preview',
    walletStatus: 'Wallet status', persistFailed: 'Preferences could not be saved on this device.', reducedMotion: 'Reduced motion follows your device preference.'
  },
  zh: {
    connect: '连接钱包', connected: '已连接', notConnected: '未连接', connecting: '正在连接', disconnect: '断开连接', accountSwitch: '切换账户', wallet: '钱包',
    myIdentity: '我的身份', publicIdentity: '公开身份', preferences: '偏好设置', theme: '主题', light: '浅色', dark: '深色', language: '语言',
    headlineOne: '拥有你的身份。', headlineTwo: '拥有你的话语。', welcomeIntro: '立于自己的坐标，发出自己的声音。', welcomeBody: '从钱包开始，创建由你掌控的身份，让你的话语有一个长久的归属。',
    welcomeNote: '你的钱包掌控你的身份。', horizonCaption: '让话语有所立足', domeLabel: '拨动七条天幕线',
    walletNote: 'Yours Wallet', independent: '身份，由你开始。', footer: '你的钱包。你的身份。你的话语。', prototype: '交互原型', scenarios: '演练场景', close: '关闭',
    scenario: '钱包身份场景', new: '新身份', existing: '已发布身份', incomplete: '资料不完整', resolveFail: '解析失败', missing: '钱包不可用',
    simulatorNote: '仅作演示。不会连接钱包、签名或发送交易。', simulatorHint: '选择场景后连接或重新解析。钱包确认窗口支持批准、取消和模拟失败。',
    resolveAgain: '重新解析', failClipboard: '模拟复制失败', reset: '重置会话',
    connectTitle: '连接 Yours Wallet', connectBody: '允许应用查看当前钱包身份。发布操作需要另行确认。', approve: '批准', cancel: '取消', simulateFailure: '模拟失败',
    connectCancelled: '连接已取消', connectFailed: '连接失败', connectFailedBody: '无法完成钱包连接，身份未改变。请重试。',
    missingTitle: 'Yours Wallet 不可用', missingBody: '未发现支持的钱包。请打开 Yours Wallet 后重试。', retry: '重试',
    resolving: '正在解析身份…', resolvingBody: '正在查询当前钱包是否已有公开身份。', resolveFailed: '无法解析身份', resolveFailedBody: '钱包已连接，但身份查询失败。请重试或断开连接。',
    setup: '设置身份', setupHeading: '让身份属于你。', setupBody: '选择你向世界展示自己的方式。', complete: '完善你的资料', completeBody: '你的身份已发布。请补全资料后继续。',
    avatar: '头像', chooseImage: '选择图片', removeImage: '移除图片', imageHint: '本地 PNG、JPEG 或 WebP，可选。', invalidImage: '请选择有效的 PNG、JPEG 或 WebP 图片。', name: '名称', required: '请输入名称。', nameLong: '名称不能超过 100 个字符。', bioLong: '简介不能超过 1000 个字符。', typeRequired: '请选择个人或组织。',
    type: '类型', Person: '个人', Organization: '组织', bio: '简介', optional: '可选', review: '预览确认', back: '返回', profile: '资料', editProfile: '编辑资料', editHeading: '更真实地表达你。', editBody: '更新展示资料，BAP ID 保持不变。',
    reviewHeading: '这就是你的身份。', reviewBody: '核对资料后，在钱包中确认。', create: '创建身份', createImpact: '你的身份和资料将公开发布。', saveImpact: '更新后的资料将公开发布，BAP ID 保持不变。', localId: '已本地计算 · 尚未发布', published: '已发布', controlStatement: '你的钱包掌控此身份。',
    copy: '复制', copied: '已复制', copyFailed: '无法复制', copyBap: '复制完整 BAP ID', noBio: '尚未填写简介。',
    createTitle: '确认创建身份', saveTitle: '确认更新资料', simulatedWallet: '钱包确认模拟', currentIdentity: '当前身份',
    creating: '正在创建身份…', saving: '正在保存…', processingBody: '正在等待操作完成。断开连接或切换账户可取消此操作。',
    createCancelled: '创建已取消', saveCancelled: '保存已取消', retained: '已保留填写内容。核对后可重新尝试。',
    createFailed: '无法创建身份', saveFailed: '无法保存资料', operationFailedBody: '操作未完成，已保留填写内容。请重试。',
    ready: '你的身份已就绪', readyBody: '现在，你有了自己的坐标。钱包始终由你掌控。', goIdentity: '前往我的身份', saved: '已保存',
    identityIntro: '变化之中，自有坐标。', identityBody: '你的公开身份，由你掌控。', owner: '由当前连接的钱包控制', profileDetails: '资料详情', account: '钱包账户',
    publicIntro: '让世界看到你。', publicBody: '查看你所掌控身份的公开展示。', backIdentity: '返回我的身份', ownedByYou: '身份，属于你。', rotate: '旋转身份', pauseRotation: '暂停旋转', resetView: '重置视角', angle: '查看角度',
    save: '保存修改', discardTitle: '放弃未保存的修改？', discardBody: '修改尚未保存。可继续编辑，或放弃修改后离开。', keepEditing: '继续编辑', discard: '放弃修改',
    accountChanged: '账户已切换，进行中的操作已取消。', identityUnchanged: '身份未改变。', current: '当前', preferenceHint: '语言与主题偏好保存在此设备。', demoAccount: '演示账户', demoData: '示例身份 · 原型数据',
    setupStep: '资料', reviewStep: '核对', confirmStep: '确认', doneStep: '就绪', copyFailureOn: '已开启复制失败模拟', privatePreview: '公开展示预览',
    walletStatus: '钱包状态', persistFailed: '无法在此设备保存偏好。', reducedMotion: '动画遵循设备的减少动态效果设置。'
  }
};
function App() {
  const {initial, reducer, validate, ids} = OwnwordModel;
  const [state, dispatch] = React.useReducer(reducer, undefined, initial);
  const pref = (key, fallback) => {try {return localStorage.getItem(`ownword-astra-${key}`) || fallback;} catch {return fallback;}};
  const [locale, setLocale] = React.useState(() => pref('locale', 'en') === 'zh' ? 'zh' : 'en');
  const [theme, setTheme] = React.useState(() => pref('theme', 'light') === 'dark' ? 'dark' : 'light');
  const [scenario, setScenario] = React.useState('new');
  const [lab, setLab] = React.useState(false);
  const [prefs, setPrefs] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [imageError, setImageError] = React.useState('');
  const [failCopy, setFailCopy] = React.useState(false);
  const [rotating, setRotating] = React.useState(false);
  const [angle, setAngle] = React.useState(-10);
  const [storageError, setStorageError] = React.useState(false);
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
    setErrors({}); setImageError('');
    if (!state.modal) document.querySelector('main h1')?.focus({preventScroll: true});
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
  function confirmConnection() {
    operationScenario.current = scenario;
    dispatch({type: 'CONNECTED'});
  }
  function approveOperation(fail = false) {
    pendingResult.current = fail;
    dispatch({type: 'PROCESS', operation: state.modal});
  }
  function checkForm() {
    const found = validate(state.draft); setErrors(found);
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
  return <div className={`app page-${state.page}`} onPointerDown={e => {if (!e.target.closest('button, input, textarea, select, a, .identity-object')) window.dispatchEvent(new Event('ownword-vault'));}}>
    <a className="skip-link" href="#main">{locale === 'en' ? 'Skip to content' : '跳至正文'}</a>
    <header className="topbar">
      <Button variant="quiet" className="brand" onClick={() => navigate(state.wallet ? (state.published ? 'identity' : 'setup') : 'welcome')}>ownword<span className="brand-dot" aria-hidden="true"></span></Button>
      <nav aria-label={t('myIdentity')} className="topnav">
        {state.wallet && state.published && <Button variant="quiet" aria-current={state.page === 'identity' ? 'page' : undefined} onClick={() => navigate('identity')}>{t('myIdentity')}</Button>}
        <div className="preference-anchor"><Button variant="quiet" onClick={() => setPrefs(!prefs)} aria-expanded={prefs}>{locale === 'en' ? 'EN' : '中文'}<span className="pref-separator" aria-hidden="true">/</span>{t(theme)}</Button>
          {prefs && <section className="preferences" aria-label={t('preferences')}><h2>{t('preferences')}</h2><p className="field-label">{t('language')}</p><div className="choice-row"><Button aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</Button><Button aria-pressed={locale === 'zh'} onClick={() => setLocale('zh')}>中文</Button></div><p className="field-label">{t('theme')}</p><div className="choice-row"><Button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>{t('light')}</Button><Button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>{t('dark')}</Button></div><p className="hint">{t('preferenceHint')}</p><Button variant="quiet" onClick={() => setPrefs(false)}>{t('close')}</Button></section>}
        </div>
        {state.wallet && <Button onClick={disconnect}>{t('disconnect')}</Button>}
      </nav>
    </header>
    <Dome label={t('domeLabel')} />
    <main id="main" data-screen-label={state.page}>
      {state.notice && <div className="notice" role="status"><span className="notice-mark" aria-hidden="true"></span><div><strong>{t(state.notice)}</strong>{state.notice.includes('Cancelled') && <p>{state.notice === 'connectCancelled' ? t('identityUnchanged') : t('retained')}</p>}</div></div>}
      {storageError && <p role="alert">{t('persistFailed')}</p>}
      {state.page === 'welcome' && <section className="welcome">
        <p className="eyebrow">{t('independent')}</p>
        <h1 tabIndex="-1"><span>{t('headlineOne')}</span><em>{t('headlineTwo')}</em></h1>
        <p className="welcome-intro">{t('welcomeIntro')}</p>
        <p className="welcome-body">{t('welcomeBody')}</p>
        <div className="welcome-action"><Button variant="accent" onClick={() => dispatch({type: 'CONNECT'})}>{t('connect')}<span className="button-arrow" aria-hidden="true"></span></Button><p>{t('walletNote')}</p></div>
        {state.error && <div className="error-block" role="alert"><strong>{t(state.error)}</strong><p>{t('connectFailedBody')}</p><Button onClick={() => dispatch({type: 'CONNECT'})}>{t('retry')}</Button></div>}
        <div className="horizon"><span>{t('horizonCaption')}</span></div>
        <p className="welcome-note">{t('welcomeNote')}</p>
      </section>}
      {state.page === 'resolving' && <section className="center-state">{heading('resolving', 'resolvingBody', 'connected')}<div className="loading-orbit" role="status" aria-label={t('resolving')}></div><S2.Skeleton /><Button onClick={disconnect}>{t('disconnect')}</Button></section>}
      {state.page === 'resolve-error' && <section className="center-state">{heading('resolveFailed', 'resolveFailedBody', 'connected')}<div className="state-symbol error-symbol" aria-hidden="true">!</div><div className="action-row"><Button variant="accent" onClick={resolveAgain}>{t('retry')}</Button><Button onClick={disconnect}>{t('disconnect')}</Button></div></section>}
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
          {imageError && <p className="field-error" role="alert">{t(imageError)}</p>}
          <Field id="profile-name" label={`${t('name')} *`} value={state.draft.name} onChange={value => dispatch({type: 'DRAFT', field: 'name', value})} error={errors.name ? t(errors.name) : ''} required />
          <fieldset className="type-choice"><legend>{t('type')} *</legend><div className="choice-row">{['Person', 'Organization'].map(type => <Button key={type} aria-pressed={state.draft.type === type} onClick={() => dispatch({type: 'DRAFT', field: 'type', value: type})}>{t(type)}</Button>)}</div>{errors.type && <p className="field-error">{t(errors.type)}</p>}</fieldset>
          <Field id="profile-bio" label={`${t('bio')} · ${t('optional')}`} multiline value={state.draft.bio} onChange={value => dispatch({type: 'DRAFT', field: 'bio', value})} error={errors.bio ? t(errors.bio) : ''} />
          <p className="character-count">{[...state.draft.bio].length} / 1000</p>
          <div className="form-footer"><Button variant="quiet" onClick={() => navigate(state.published ? 'identity' : 'welcome')}>{t('back')}</Button><Button variant="accent" type="submit">{t(editing ? 'review' : 'review')}</Button></div>
        </form>
      </section>}
      {state.page === 'review' && <section className="workbench review-layout">
        <aside>{heading('reviewHeading', 'reviewBody', 'review')}<p className="impact">{t(state.published ? 'saveImpact' : 'createImpact')}</p><p className="hint">{t('controlStatement')}</p></aside>
        <div className="review-profile"><div className="person-row"><Portrait profile={state.draft} /><div><span className="profile-type">{t(state.draft.type)}</span><h2>{state.draft.name}</h2></div></div><p className="bio">{state.draft.bio || t('noBio')}</p><Identifier id={bapId} t={t} failCopy={failCopy} /><p className="hint">{t(state.published ? 'published' : 'localId')}</p>
          {state.error && <div className="error-block" role="alert"><strong>{t(state.error)}</strong><p>{t('operationFailedBody')}</p></div>}
          {state.busy ? <div className="processing" role="status"><div className="loading-orbit small"></div><strong>{t(state.busy === 'create' ? 'creating' : 'saving')}</strong><p>{t('processingBody')}</p><Button onClick={switchAccount}>{t('accountSwitch')}</Button></div> : <div className="form-footer"><Button variant="quiet" onClick={() => dispatch({type: 'GO', page: state.published && !state.incomplete ? 'edit' : 'setup'})}>{t('back')}</Button><Button variant="accent" onClick={() => dispatch({type: 'AUTHORIZE', operation: state.published ? 'save' : 'create'})}>{t(state.error ? 'retry' : state.published ? 'save' : 'create')}</Button></div>}
        </div>
      </section>}
      {state.page === 'ready' && <section className="center-state ready-state"><div className="ready-seal" aria-hidden="true"></div>{heading('ready', 'readyBody')}<Identifier id={bapId} t={t} failCopy={failCopy} /><Button variant="accent" onClick={() => dispatch({type: 'GO', page: 'identity'})}>{t('goIdentity')}</Button></section>}
      {state.page === 'identity' && <section className="identity-page">
        {heading('identityIntro', 'identityBody', 'myIdentity')}
        <div className="identity-layout"><div className="identity-primary"><div className="person-row"><Portrait profile={state.profile} large /><div><span className="profile-type">{t(state.profile.type)}</span><h2>{state.profile.name || t('complete')}</h2><p className="hint">{t('owner')}</p></div></div><Identifier id={bapId} t={t} failCopy={failCopy} /><div className="action-row"><Button variant="accent" onClick={() => dispatch({type: 'EDIT'})}>{t('editProfile')}</Button><Button onClick={() => {setAngle(-10); setRotating(!matchMedia('(prefers-reduced-motion: reduce)').matches); navigate('public');}}>{t('publicIdentity')}</Button></div></div>
        <aside className="profile-detail"><span className="eyebrow">{t('profileDetails')}</span><h3>{t('bio')}</h3><p className="bio">{state.profile.bio || t('noBio')}</p><div className="detail-bottom"><S2.StatusLight label={t('published')} /><span>{t('demoData')}</span></div></aside></div>
        <div className="flat-horizon" aria-hidden="true"></div>
      </section>}
      {state.page === 'public' && <section className="public-page">{heading('publicIntro', 'publicBody', 'publicIdentity')}<IdentityCard profile={profileDisplay} id={bapId} t={t} failCopy={failCopy} rotating={rotating} setRotating={setRotating} angle={angle} setAngle={setAngle} /><div className="public-back"><Button variant="quiet" onClick={() => navigate('identity')}>{t('backIdentity')}</Button></div></section>}
    </main>
    <footer className="footer"><p>{t('footer')}</p><div className="footer-controls">{state.wallet && <span className="wallet-connected"><S2.StatusLight label={t('connected')} /><Button variant="quiet" onClick={switchAccount}>{t('accountSwitch')}</Button></span>}<Button variant="quiet" onClick={() => setLab(!lab)} aria-expanded={lab}>{t('prototype')}<span className="prototype-dot" aria-hidden="true"></span></Button></div></footer>
    {lab && <section className="scenario-panel" aria-label={t('scenarios')}><div className="panel-title"><h2>{t('scenarios')}</h2><Button variant="quiet" onClick={() => setLab(false)}>{t('close')}</Button></div><p>{t('simulatorNote')}</p><label>{t('scenario')}<select value={scenario} onChange={e => setScenario(e.target.value)}>{['new', 'existing', 'incomplete', 'resolveFail', 'missing'].map(key => <option value={key} key={key}>{t(key)}</option>)}</select></label><p className="hint">{t('simulatorHint')}</p><label className="check-row"><input type="checkbox" checked={failCopy} onChange={e => setFailCopy(e.target.checked)} />{t('failClipboard')}</label><div className="action-row">{state.wallet && <Button onClick={resolveAgain}>{t('resolveAgain')}</Button>}<Button onClick={disconnect}>{t('reset')}</Button></div></section>}
    {state.modal && <Modal closeLabel={t('close')} title={t(state.modal === 'connect' ? (scenario === 'missing' ? 'missingTitle' : 'connectTitle') : state.modal === 'discard' ? 'discardTitle' : state.modal === 'create' ? 'createTitle' : 'saveTitle')} onCancel={() => dispatch({type: state.modal === 'discard' ? 'STAY' : 'CANCEL'})}>
      {state.modal === 'discard' ? <><p>{t('discardBody')}</p><div className="action-row"><Button onClick={() => dispatch({type: 'STAY'})}>{t('keepEditing')}</Button><Button variant="negative" onClick={() => dispatch({type: 'DISCARD'})}>{t('discard')}</Button></div></> : <>
        <p>{t(state.modal === 'connect' ? scenario === 'missing' ? 'missingBody' : 'connectBody' : state.modal === 'create' ? 'createImpact' : 'saveImpact')}</p>
        {state.modal !== 'connect' && <><div className="person-row compact"><Portrait profile={state.draft} /><div><span className="eyebrow">{t('currentIdentity')}</span><strong>{state.draft.name}</strong></div></div><Identifier id={bapId} t={t} failCopy={failCopy} /><p className="hint">{t('controlStatement')}</p></>}
        <div className="simulation-label"><span>{t('simulatedWallet')}</span><p>{t('simulatorNote')}</p></div>
        <div className="action-row"><Button onClick={() => dispatch({type: 'CANCEL'})}>{t('cancel')}</Button><Button variant="accent" onClick={() => state.modal === 'connect' ? (scenario === 'missing' ? dispatch({type: 'CONNECT_FAILED'}) : confirmConnection()) : approveOperation()}>{t(scenario === 'missing' && state.modal === 'connect' ? 'retry' : 'approve')}</Button></div>
        <div className="modal-scenarios"><Button variant="quiet" onClick={() => state.modal === 'connect' ? dispatch({type: 'CONNECT_FAILED'}) : approveOperation(true)}>{t('simulateFailure')}</Button>{state.wallet && <><Button variant="quiet" onClick={switchAccount}>{t('accountSwitch')}</Button><Button variant="quiet" onClick={disconnect}>{t('disconnect')}</Button></>}</div>
      </>}
    </Modal>}
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
