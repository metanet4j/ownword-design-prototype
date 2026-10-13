const S2 = window.ReactSpectrumS2_ad4872;

function UiIcon({name,className=''}) {
  const directional={ArrowLeft:['S2_ArrowSize400','back'],ChevronRight:['S2_ChevronSize100','forward'],ChevronDown:['S2_ChevronSize100','down']}[name];
  const asset=directional?`ui-icons/${directional[0]}.svg`:`workflow-icons/S2_Icon_${name}_20_N.svg`;
  return <span className={'ui-icon '+(directional?'ui-direction ui-direction-'+directional[1]+' ':'')+className} aria-hidden="true" style={{maskImage:`url('_ds/react-spectrum-s2/assets/${asset}')`}}/>;
}
window.UiIcon=UiIcon;
function BackButton({children,className='',...props}) {return <Button variant="quiet" className={'back-button '+className} {...props}><UiIcon name="ArrowLeft"/>{children}</Button>;}
function ArtifactBack({onClick,t,label='artifactBack'}) {return <BackButton data-action="artifact-back" onClick={onClick}>{t(label)}</BackButton>;}

// 公开页面的返回语义跟随浏览器历史；刷新后仍可回到实际入口。
function rememberPublicScroll() {
  if(!window.OwnwordHomepageModel?.publicRoute(location.hash))return;
  history.replaceState({...history.state,ownwordPublicScroll:window.scrollY},'',location.href);
}
window.rememberPublicScroll=rememberPublicScroll;
function openPublicRoute(page,id,tail='') {
  rememberPublicScroll();
  if(page==='identity-view')page='identity';
  const screen=document.querySelector('main')?.dataset.screenLabel;
  const labels={identity:'backPublicIdentity',find:'backFind',artifact:'backArtifact','identity-view':'backPublicIdentity',read:'historyBack',history:'versionHistory',content:'contentBack',artifacts:'artifactBack'};
  const route=location.hash.split('/')[1];
  const back=screen==='welcome'?'backHome':screen==='identity'?'backIdentity':labels[route];
  const oldURL=location.href;
  history.pushState(back?{ownwordBack:back}:null,'', '#/'+page+(id?'/'+encodeURIComponent(id):'')+(tail?'/'+tail:''));
  window.dispatchEvent(new HashChangeEvent('hashchange',{oldURL,newURL:location.href}));
}
function publicBackLabel(fallback,connected) {const label=history.state?.ownwordBack||fallback;return typeof connected==='boolean'&&['backIdentity','backHome'].includes(label)?(connected?'backIdentity':'backHome'):label;}
function returnFromPublic(fallback) {if(history.state?.ownwordBack)history.back();else fallback();}
window.ArtifactBack=ArtifactBack;
function BrandMark() {
  return <img className="brand-mark" src="brand/ownword-mark.svg" width="32" height="32" alt="" aria-hidden="true" />;
}
function LoadingMark({small = false, label}) {
  return <div className={`brand-loading ${small ? 'small' : ''}`} role={label ? 'status' : undefined} aria-label={label} aria-hidden={label ? undefined : true}><BrandMark /></div>;
}

// 页面在绑定原型组件上接入业务事件；组件通用样式由 design-system 可维护源提供。
function Button({children, onClick, variant = 'secondary', className = '', iconOnly = false, tooltip = true, ...props}) {
  const selected = props['aria-pressed'] === true || props['aria-current'] === 'page';
  const Component = typeof props['aria-pressed'] === 'boolean' || selected ? S2.ToggleButton : iconOnly || variant === 'quiet' ? S2.ActionButton : S2.Button;
  const base = Component({children, onPress: onClick, variant, isQuiet: variant === 'quiet', isSelected: selected, fillStyle: props.fillStyle || (variant === 'secondary' ? 'outline' : 'fill'), isDisabled: props.disabled});
  // Keep the bundle's variant classes when callers add layout classes.
  const layoutClasses = className.split(/\s+/).filter(name => name && !/^s2d-button(?:-|$)/.test(name));
  const button = React.cloneElement(base, {...props, fillStyle: undefined, title: iconOnly ? undefined : props.title, className: [base.props.className, ...layoutClasses, iconOnly ? 'icon-button' : ''].filter(Boolean).join(' ')});
  const tooltipLabel = tooltip && iconOnly && (props.title || props['aria-label']);
  return tooltipLabel ? <S2.TooltipTrigger>{button}<S2.Tooltip>{tooltipLabel}</S2.Tooltip></S2.TooltipTrigger> : button;
}
function Field({errorKey, id, label, contextualHelp, value, onChange, multiline, error, required, maxLength, ...inputProps}) {
  const base = (multiline ? S2.TextArea : S2.TextField)({label, value: value || ' '});
  function wire(node) {
    if (!React.isValidElement(node)) return node;
    // Keep contextual help beside the label, never inside a native label.
    if (node.type === 'label') return <div className={node.props.className} onPointerDownCapture={e=>{if(!e.target.closest('button'))e.currentTarget.querySelector('input,textarea').dataset.pointerFocus='true';}} onBlurCapture={e=>{delete e.target.dataset.pointerFocus;}}><div className="field-label-row"><label htmlFor={id}>{label}</label>{contextualHelp}</div>{React.Children.map(React.Children.toArray(node.props.children).slice(1),wire)}</div>;
    if (node.type === 'button') return null;
    // The preview bundle adds a trailing action shell to every TextField.
    // A plain field has no such action; retain the field's own border instead.
    if (node.props.className === 's2d-field-shell') return <React.Fragment>{React.Children.map(node.props.children, wire)}</React.Fragment>;
    if (node.type === 'input' || node.type === 'textarea') return React.cloneElement(node, {...inputProps, id, value, defaultValue: undefined, required, maxLength, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : inputProps['aria-describedby'], onChange: e => onChange(e.target.value)});
    return React.cloneElement(node, {}, React.Children.map(node.props.children, wire));
  }
  return <div className="field-wrap">{wire(base)}{error && <p id={`${id}-error`} className="field-error" role="alert" data-field-error={errorKey || ""}>{error}</p>}</div>;
}
function Portrait({profile, large = false}) {
  return <div className={`portrait ${large ? 'large' : ''}`}>
    {profile.image ? <img src={profile.image} alt={profile.name || 'Avatar'} /> : <span role="img" aria-label={profile.name || 'Avatar'}>{profile.name ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('') : 'o'}</span>}
  </div>;
}
function Dome({label}) {
  const [pulse, setPulse] = React.useState(0);
  const [lit, setLit] = React.useState(false);
  const dome = React.useRef(null);
  const frame = React.useRef(0);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  React.useEffect(() => {const play = () => setPulse(p => p + 1); window.addEventListener('ownword-vault', play); return () => window.removeEventListener('ownword-vault', play);}, []);
  React.useEffect(() => {
    const leave = () => {cancelAnimationFrame(frame.current); setLit(false);};
    const move = e => {
      // Touch and reduced-motion users get the static state, never a moving light.
      if (reduced() || e.pointerType === 'touch') return leave();
      if (e.target.closest && e.target.closest('dialog, .preferences, .scenario-panel, .account-panel, .topbar, .footer')) return leave();
      const rect = dome.current.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return leave();
      cancelAnimationFrame(frame.current);
      // One CSS custom property pair per frame; the glyph work stays on the compositor.
      frame.current = requestAnimationFrame(() => {
        dome.current.style.setProperty('--light-x', `${x}px`);
        dome.current.style.setProperty('--light-y', `${y}px`);
        setLit(true);
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerleave', leave);
    return () => {window.removeEventListener('pointermove', move); window.removeEventListener('pointerleave', leave); cancelAnimationFrame(frame.current);};
  }, []);
  return <button ref={dome} className="dome" aria-label={label} data-lit={lit ? 'true' : 'false'} onPointerDown={() => setPulse(p => p + 1)} onClick={e => {if (e.detail === 0) {setPulse(p => p + 1); if (reduced()) {dome.current.style.removeProperty('--light-x'); dome.current.style.removeProperty('--light-y'); setLit(true);}}}}>
    <span className="sky-glow" aria-hidden="true"></span>
    <span className="vault" key={pulse} data-pulse={pulse > 0} aria-hidden="true">
      {Array.from({length: 7}, (_, i) => <span key={i} className="vault-line" style={{'--line': i}}></span>)}
    </span>
    <span className="vault-light" aria-hidden="true">
      {Array.from({length: 7}, (_, i) => <span key={i} className="light-line" style={{'--line': i}}></span>)}
    </span>
  </button>;
}
function useDismissable(open, onClose, ref, focusSelector='button') {
  React.useEffect(() => {
    if (!open) return undefined;
    // Escape and Tab-out are the keyboard equivalents of clicking away; the
    // dialog check keeps a modal confirmation in charge of its own dismissal.
    const pointer = e => {if (!document.querySelector('dialog[open]') && ref.current && !ref.current.contains(e.target)) onClose();};
    const key = e => {
      if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      onClose();
      (ref.current?.querySelector(focusSelector)||document.querySelector(focusSelector))?.focus();
    };
    const focusin = e => {if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) onClose();};
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', key);
    document.addEventListener('focusin', focusin);
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('keydown', key);
      document.removeEventListener('focusin', focusin);
    };
  }, [open, onClose, ref, focusSelector]);
}
function Modal({title, titleKey, children, onCancel, closeLabel, context = 'OWNWORD',returnFocus}) {
  const dialog = React.useRef(null);
  const parts=React.Children.toArray(children),actions=parts.findLast(child=>React.isValidElement(child)&&child.props.className==='action-row');
  function containFocus(event) {
    if(event.key!=='Tab')return;
    const controls=[...dialog.current.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(node=>node.tabIndex>=0&&node.getClientRects().length);
    const first=controls[0],last=controls[controls.length-1];
    if(first&&((event.shiftKey&&document.activeElement===first)||(!event.shiftKey&&document.activeElement===last))){event.preventDefault();(event.shiftKey?last:first).focus();}
  }
  React.useEffect(() => {
    const previous = returnFocus||document.activeElement;
    dialog.current.showModal();
    return () => {queueMicrotask(()=>{const target=previous?.isConnected&&previous.getClientRects().length&&!previous.disabled&&previous!==document.body&&previous.id!=='main'?previous:(document.querySelector('[data-artifact-screen] h1')||document.querySelector('#main h1')||document.getElementById('main'));target?.focus({preventScroll:true});});};
  }, []);
  return <dialog ref={dialog} className="modal" data-modal-title={titleKey || ""} aria-labelledby="dialog-title" onKeyDown={containFocus} onCancel={e => {e.preventDefault(); onCancel();}}>
    <div className="modal-body"><div className="modal-top"><span className="eyebrow">{context}</span><Button variant="quiet" onClick={onCancel} aria-label={title + ' — ' + closeLabel}>{closeLabel}</Button></div>
    <h2 id="dialog-title">{title}</h2>{parts.filter(child=>child!==actions)}</div>
    {actions&&<div className="modal-footer">{actions}</div>}
  </dialog>;
}
function ContextHelp({label,children}) {
  const [mode,setMode]=React.useState('closed'),[position,setPosition]=React.useState({left:16,top:16});
  const wrapper=React.useRef(null),panel=React.useRef(null),suppressFocus=React.useRef(false),leaveTimer=React.useRef(0),hoverTimer=React.useRef(0),id=React.useId(),open=mode!=='closed';
  function close(){clearTimeout(leaveTimer.current);clearTimeout(hoverTimer.current);suppressFocus.current=true;setMode('closed');}
  React.useEffect(()=>()=>{clearTimeout(leaveTimer.current);clearTimeout(hoverTimer.current);},[]);
  useDismissable(open,close,wrapper);
  React.useLayoutEffect(()=>{
    if(!open)return;
    const button=wrapper.current.querySelector('button').getBoundingClientRect(),box=panel.current.getBoundingClientRect();
    const below=button.bottom+8,top=below+box.height<=innerHeight-16?below:button.top-box.height-8;
    setPosition({left:Math.max(16,Math.min(button.left,innerWidth-box.width-16)),top:Math.max(16,top)});
    const dismiss=e=>{if(!panel.current?.contains(e.target))close();};
    const escape=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();wrapper.current.querySelector('button').focus({preventScroll:true});}};
    window.addEventListener('resize',close);document.addEventListener('scroll',dismiss,true);document.addEventListener('keydown',escape,true);
    return()=>{window.removeEventListener('resize',close);document.removeEventListener('scroll',dismiss,true);document.removeEventListener('keydown',escape,true);};
  },[open]);
  return <div className="context-help" ref={wrapper} onPointerEnter={e=>{clearTimeout(leaveTimer.current);clearTimeout(hoverTimer.current);if(e.pointerType==='mouse'){suppressFocus.current=false;hoverTimer.current=setTimeout(()=>setMode(v=>v==='closed'?'preview':v),300);}}} onPointerLeave={()=>{clearTimeout(hoverTimer.current);if(mode==='preview'&&!wrapper.current.contains(document.activeElement))leaveTimer.current=setTimeout(()=>setMode('closed'),180);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)){suppressFocus.current=false;setMode('closed');}}}>
    <Button iconOnly tooltip={false} variant="quiet" className="context-help-trigger" aria-label={label} aria-expanded={open} aria-controls={id} onFocus={()=>{if(!suppressFocus.current)setMode(v=>v==='closed'?'preview':v);}} onClick={()=>{suppressFocus.current=false;setMode(v=>v==='pinned'?'closed':'pinned');}}><UiIcon name="InfoCircle"/></Button>
    {open&&React.cloneElement(S2.ContextualHelpPopover(),{ref:panel,id,role:'region','aria-label':label,className:'s2d-overlay context-help-panel',style:position},children)}
  </div>;
}
window.ContextHelp=ContextHelp;
function Toast({message, body, error, notice, storageError, t, onRetry, onDismiss}) {
  const [visible, setVisible] = React.useState(true);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const dismissRef = React.useRef(onDismiss);
  dismissRef.current = onDismiss;
  const dismiss = () => {setVisible(false); dismissRef.current?.();};
  const paused = hovered || focused;
  React.useEffect(() => {
    if (paused || !visible) return;
    const timer = setTimeout(dismiss, 6000);
    return () => clearTimeout(timer);
  }, [paused, visible]);
  if (!visible) return null;
  return <div className={`toast ${error ? 'error-block' : 'notice'} ${!error && !onRetry ? 'toast-compact' : ''}`} role={error ? 'alert' : 'status'}
    data-error={error && !storageError ? message : undefined} data-notice={notice}
    data-storage-error={storageError || undefined} data-paused={paused ? 'true' : 'false'}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={e => {if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);}}>
    <div className="toast-copy"><strong>{t(message)}</strong>{body && <p>{t(body)}</p>}</div>
    <div className="toast-actions">{onRetry && <Button onClick={onRetry}>{t('retry')}</Button>}<Button iconOnly variant="quiet" data-action="dismiss-toast" aria-label={t('close')} onClick={dismiss}><UiIcon name="Close"/></Button></div>
  </div>;
}
// 复制入口共享同一种 ActionButton 和反馈周期，布局不改变操作类型。
function CopyButton({label,feedback,t,...props}) {
  return <Button iconOnly variant="quiet" className="copy-button" aria-label={label} title={feedback==='copied'?t('copied'):label} {...props}><UiIcon name={feedback==='copied'?'Checkmark':'Copy'}/></Button>;
}
function useCopyValue(value,failCopy) {
  const [feedback,setFeedback]=React.useState(''),timer=React.useRef(0),epoch=React.useRef(0);
  React.useEffect(()=>{setFeedback('');return()=>{epoch.current++;clearTimeout(timer.current);};},[value]);
  async function copy() {
    const request=++epoch.current;
    clearTimeout(timer.current);
    try {
      if(failCopy)throw new Error('Simulated clipboard failure');
      await navigator.clipboard.writeText(value);
      if(request!==epoch.current)return;
      setFeedback('copied');timer.current=setTimeout(()=>setFeedback(''),6000);
    } catch {if(request===epoch.current)setFeedback('copyFailed');}
  }
  return [feedback,copy];
}
function Identifier({id, t, failCopy = false, label = 'BAP ID', contextualHelp, copyLabel = 'copyBap', target = 'bap', displayValue, className = '', compact = false}) {
  const [feedback,copy]=useCopyValue(id,failCopy),labelId=React.useId();
  const copyName=copyLabel==='artifactCopyFull'?t('copyField').replace('{field}',label):t(copyLabel);
  return <div role="group" aria-labelledby={labelId} className={'identifier '+className+(compact?' identifier-compact':'')+(feedback==='copyFailed'?' copy-failed':'')}>
    <div className="identifier-top"><div className="field-label-row"><span id={labelId} className="eyebrow">{label}</span>{contextualHelp}</div><span className="copy-feedback" role="status" data-copy-target={target} data-copy-feedback={feedback || ""}>{feedback ? t(feedback==='copyFailed'?'copyManually':feedback) : ''}</span></div>
    <div className="identifier-value"><code title={id}>{feedback==='copyFailed'?id:(displayValue ?? id)}</code><CopyButton data-action={'copy-' + target} onClick={copy} label={copyName} feedback={feedback} t={t}/></div>
  </div>;
}
function ChainRecord({transaction, bapId, t, failCopy, target = 'tx'}) {
  return <>
    {transaction&&bapId&&<IdentitySignatureProof bapId={bapId} signer={transaction.blockHeight?OwnwordArtifactModel.historicalSignerFor(bapId):OwnwordArtifactModel.signerFor(bapId)} signature="valid" keyEpoch={transaction.blockHeight?'historical-key-at-creation':'effective-at-signing'} t={t} failCopy={failCopy}/>}
    <dl className="chain-facts">
      <div><dt>{t('blockHeight')}</dt><dd data-chain="block">{transaction && transaction.blockHeight ? transaction.blockHeight.toLocaleString('en-US') : t('pendingBlock')}</dd></div>
      <div><dt>{t('confirmation')}</dt><dd data-chain="confirmation">{t(transaction && transaction.blockHeight ? 'confirmed' : 'pendingConfirmation')}</dd></div>
    </dl>
    {transaction ? <Identifier id={transaction.txid} label={t('publicationTx')} copyLabel="copyTx" target={target} t={t} failCopy={failCopy} /> : <p className="hint">{t('recordUnavailable')}</p>}
  </>;
}
function IdentityCard({profile, id, t, failCopy, transaction, rotating, setRotating, angle, setAngle, artifactData, onOpenArtifact}) {
  const drag = React.useRef(null);
  const [recordOpen, setRecordOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  React.useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  // 减少动态效果时停止自动摆动，手动翻面仍可用。
  React.useEffect(() => {if (reducedMotion) setRotating(false);}, [reducedMotion, setRotating]);
  const normalized = ((angle % 360) + 360) % 360;
  // The back face is only exposed while the card is turned past 90 degrees;
  // auto-rotation keeps the front in the accessibility tree.
  const back = normalized > 90 && normalized < 270;
  function flipCard() {
    setRotating(false);
    // 按最短路径转向另一面，避免拖动多圈后点击按钮时整圈回转。
    const target = back ? 0 : 180;
    setAngle(angle + ((target - normalized + 540) % 360) - 180);
  }
  return <div className="identity-stage">
    <div className="identity-identifiers public-identifiers" role="region" aria-label={t('identityIdentifiers')}><Identifier id={id} t={t} failCopy={failCopy}/><ArtifactSummary data={artifactData} bapId={id} t={t} readOnly onOpen={onOpenArtifact}/></div>
    <div className="card-controls"><Button data-action="flip-card" aria-controls="identity-card-object" onClick={flipCard}>{t(back ? 'flipToFront' : 'flipToBack')}</Button></div>
    <div id="identity-card-object" className="identity-object" onPointerDown={e => {if (e.target.closest('button')) return; drag.current = {x: e.clientX, angle}; setRotating(false); e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e => {if (drag.current) setAngle(drag.current.angle + (e.clientX - drag.current.x) * .35);}} onPointerUp={() => {drag.current = null;}} onPointerCancel={() => {drag.current = null;}}>
      <div className={`identity-sculpture ${rotating ? 'rotating' : ''}`} data-face={back ? 'back' : 'front'} style={{'--angle': `${angle}deg`}} onAnimationEnd={e => {if (e.target === e.currentTarget && e.animationName === 'identity-turn') setRotating(false);}}>
        <div className="plate-depth" aria-hidden="true"></div>
        <article className="identity-plate plate-front" aria-hidden={back} inert={back ? '' : undefined}>
          <div className="plate-top"><span className="wordmark-small"><BrandMark />ownword</span><span className="eyebrow">{t('publicIdentity')}</span></div>
          <div className="plate-person"><Portrait profile={profile} large /><span className="profile-type">{t(profile.type)}</span><h2>{profile.name}</h2><p className="bio">{profile.bio || t('noBio')}</p></div>
          <div className="plate-id"><span>BAP ID</span><code>{id}</code></div>
          <div className="plate-foot"><span>{t('ownedByYou')}</span><span>OWNWORD</span></div>
        </article>
        <article className="identity-plate plate-back" aria-hidden={!back} inert={!back ? '' : undefined}>
          <div className="plate-top"><span className="wordmark-small"><BrandMark />ownword</span><span className="eyebrow">{t('chainRecord')}</span></div>
          <div className="chain-heading"><h2>{t('identityPublication')}</h2><p>{profile.name}</p></div>
          <div className="plate-chain-summary"><S2.StatusLight variant={transaction?.blockHeight?'positive':'neutral'}>{t(transaction?.blockHeight?'confirmed':'pendingConfirmation')}</S2.StatusLight><div><span>{t('blockHeight')}</span><strong>{transaction?.blockHeight?.toLocaleString('en-US')||t('pendingBlock')}</strong></div><div><span>{t('publicationTx')}</span><code>{transaction?.txid||t('recordUnavailable')}</code></div></div>
          <div className="plate-foot"><span>BSV</span></div>
        </article>
      </div>
    </div>
    <div className="object-shadow" aria-hidden="true"></div>
    <div className="profile-disclosure">
      <Button variant="quiet" data-action="toggle-full-profile" aria-expanded={profileOpen} aria-controls="public-profile-details" onClick={() => setProfileOpen(value => !value)}>{t(profileOpen ? 'hideFullProfile' : 'viewFullProfile')}<UiIcon name="ChevronDown"/></Button>
      <div id="public-profile-details" hidden={!profileOpen}>
        {profileOpen && <><h2>{profile.name}</h2><p className="bio">{profile.bio || t('noBio')}</p></>}
      </div>
    </div>
    <div className="chain-disclosure">
      <Button variant="quiet" data-action="toggle-chain-record" aria-expanded={recordOpen} aria-controls="chain-record-details" onClick={() => setRecordOpen(value => !value)}>{t(recordOpen ? 'hideChainRecord' : 'viewChainRecord')}<UiIcon name="ChevronDown"/></Button>
      <div id="chain-record-details" hidden={!recordOpen}>
        {recordOpen && <ChainRecord bapId={id} transaction={transaction} t={t} failCopy={failCopy} target="tx-details" />}
      </div>
    </div>
  </div>;
}
Object.assign(window, {S2, BrandMark, LoadingMark, Button, Field, Portrait, Dome, Modal, Toast, CopyButton, useCopyValue, Identifier, IdentityCard, useDismissable});

function IdentitySignatureProof({bapId,signer,signature='unverified',keyEpoch,t,failCopy}) {
  return <div className="identity-signature-proof" data-identity-signature={signature}><p>{t('artifactProof-'+signature)}</p><Identifier id={bapId} label={t('artifactOperationIdentity')} t={t} failCopy={failCopy}/>{signer&&<Identifier id={signer} label={t('artifactSigner')} copyLabel="artifactCopyFull" target="signer" t={t} failCopy={failCopy}/>}<p className="hint">{t(keyEpoch==='historical-key-at-creation'?'artifactHistoricalKey':'artifactEffectiveKey')}</p></div>;
}
window.IdentitySignatureProof=IdentitySignatureProof;
