const S2 = window.ReactSpectrumS2_ad4872;

function BrandMark() {
  return <img className="brand-mark" src="brand/ownword-mark.svg" width="32" height="32" alt="" aria-hidden="true" />;
}
function LoadingMark({small = false, label}) {
  return <div className={`brand-loading ${small ? 'small' : ''}`} role={label ? 'status' : undefined} aria-label={label} aria-hidden={label ? undefined : true}><BrandMark /></div>;
}

// The imported S2 bundle is a cosmetic preview. Add behavior to its returned
// elements without copying or modifying the design-system implementation.
function Button({children, onClick, variant = 'secondary', ...props}) {
  return React.cloneElement(S2.Button({children, onPress: onClick, variant, isDisabled: props.disabled}), props);
}
function Field({errorKey, id, label, value, onChange, multiline, error, required, maxLength}) {
  const base = (multiline ? S2.TextArea : S2.TextField)({label, value: value || ' '});
  function wire(node) {
    if (!React.isValidElement(node)) return node;
    if (node.type === 'button') return null;
    if (node.type === 'input' || node.type === 'textarea') return React.cloneElement(node, {id, value, defaultValue: undefined, required, maxLength, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined, onChange: e => onChange(e.target.value)});
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
function useDismissable(open, onClose, ref) {
  React.useEffect(() => {
    if (!open) return undefined;
    // Escape and Tab-out are the keyboard equivalents of clicking away; the
    // dialog check keeps a modal confirmation in charge of its own dismissal.
    const pointer = e => {if (!document.querySelector('dialog[open]') && ref.current && !ref.current.contains(e.target)) onClose();};
    const key = e => {
      if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      onClose();
      ref.current?.querySelector('button')?.focus();
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
  }, [open, onClose, ref]);
}
function Modal({title, titleKey, children, onCancel, closeLabel, context = 'OWNWORD'}) {
  const dialog = React.useRef(null);
  React.useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    return () => {if (previous?.isConnected) previous.focus();};
  }, []);
  return <dialog ref={dialog} className="modal" data-modal-title={titleKey || ""} aria-labelledby="dialog-title" onCancel={e => {e.preventDefault(); onCancel();}}>
    <div className="modal-top"><span className="eyebrow">{context}</span><Button variant="quiet" onClick={onCancel} aria-label={title + ' — ' + closeLabel}>{closeLabel}</Button></div>
    <h2 id="dialog-title">{title}</h2>{children}
  </dialog>;
}
function Identifier({id, t, failCopy = false, label = 'BAP ID', copyLabel = 'copyBap', target = 'bap'}) {
  const [feedback, setFeedback] = React.useState('');
  const feedbackTimer = React.useRef(0);
  const announce = value => {
    setFeedback(value);
    clearTimeout(feedbackTimer.current);
    // A confirmation should not outlive its moment; six seconds matches the notice cadence.
    feedbackTimer.current = setTimeout(() => setFeedback(''), 6000);
  };
  React.useEffect(() => {setFeedback(''); return () => clearTimeout(feedbackTimer.current);}, [id]);
  async function copy() {
    try {if (failCopy) throw new Error('Simulated clipboard failure'); await navigator.clipboard.writeText(id); announce('copied');}
    catch {announce('copyFailed');}
  }
  return <div className="identifier">
    <div className="identifier-top"><span className="eyebrow">{label}</span><span className="copy-feedback" role="status" data-copy-target={target} data-copy-feedback={feedback || ""}>{feedback ? t(feedback) : ''}</span></div>
    <div className="identifier-value"><code title={id}>{id}</code><Button data-action={'copy-' + target} onClick={copy} aria-label={t(copyLabel)}>{t('copy')}</Button></div>
  </div>;
}
function IdentityCard({profile, id, t, failCopy, transaction, rotating, setRotating, angle, setAngle}) {
  const drag = React.useRef(null);
  const [reducedMotion, setReducedMotion] = React.useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  React.useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  // Auto-rotation is suppressed by the stylesheet too; keep the control honest by
  // removing it and saying why, instead of reporting a state that never happens.
  React.useEffect(() => {if (reducedMotion) setRotating(false);}, [reducedMotion, setRotating]);
  const normalized = ((angle % 360) + 360) % 360;
  // The back face is only exposed while the card is turned past 90 degrees;
  // auto-rotation keeps the front in the accessibility tree.
  const back = normalized > 90 && normalized < 270;
  return <div className="identity-stage">
    <div className="identity-object" onPointerDown={e => {if (e.target.closest('button')) return; drag.current = {x: e.clientX, angle}; setRotating(false); e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e => {if (drag.current) setAngle(drag.current.angle + (e.clientX - drag.current.x) * .35);}} onPointerUp={() => {drag.current = null;}} onPointerCancel={() => {drag.current = null;}}>
      <div className={`identity-sculpture ${rotating ? 'rotating' : ''}`} data-face={back ? 'back' : 'front'} style={{'--angle': `${angle}deg`}}>
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
          <dl className="chain-facts">
            <div><dt>{t('blockHeight')}</dt><dd data-chain="block">{transaction && transaction.blockHeight ? transaction.blockHeight.toLocaleString('en-US') : t('pendingBlock')}</dd></div>
            <div><dt>{t('confirmation')}</dt><dd data-chain="confirmation">{t(transaction && transaction.blockHeight ? 'confirmed' : 'pendingConfirmation')}</dd></div>
          </dl>
          {transaction ? <Identifier id={transaction.txid} label={t('publicationTx')} copyLabel="copyTx" target="tx" t={t} failCopy={failCopy} /> : <p className="hint">{t('recordUnavailable')}</p>}
          <div className="plate-foot"><span>BSV</span></div>
        </article>
      </div>
    </div>
    <div className="object-shadow" aria-hidden="true"></div>
    <div className="public-copy"><Identifier id={id} t={t} failCopy={failCopy} /></div>
  </div>;
}
Object.assign(window, {S2, BrandMark, LoadingMark, Button, Field, Portrait, Dome, Modal, Identifier, IdentityCard, useDismissable});
