const S2 = window.ReactSpectrumS2_ad4872;

// The imported S2 bundle is a cosmetic preview. Add behavior to its returned
// elements without copying or modifying the design-system implementation.
function Button({children, onClick, variant = 'secondary', ...props}) {
  return React.cloneElement(S2.Button({children, onPress: onClick, variant, isDisabled: props.disabled}), props);
}
function Field({id, label, value, onChange, multiline, error, required, maxLength}) {
  const base = (multiline ? S2.TextArea : S2.TextField)({label, value: value || ' '});
  function wire(node) {
    if (!React.isValidElement(node)) return node;
    if (node.type === 'button') return null;
    if (node.type === 'input' || node.type === 'textarea') return React.cloneElement(node, {id, value, defaultValue: undefined, required, maxLength, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined, onChange: e => onChange(e.target.value)});
    return React.cloneElement(node, {}, React.Children.map(node.props.children, wire));
  }
  return <div className="field-wrap">{wire(base)}{error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}</div>;
}
function Portrait({profile, large = false}) {
  return <div className={`portrait ${large ? 'large' : ''}`}>
    {profile.image ? <img src={profile.image} alt={profile.name || 'Avatar'} /> : <span role="img" aria-label={profile.name || 'Avatar'}>{profile.name ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('') : 'o'}</span>}
  </div>;
}
function Dome({label}) {
  const [pulse, setPulse] = React.useState(0);
  React.useEffect(() => {const play = () => setPulse(p => p + 1); window.addEventListener('ownword-vault', play); return () => window.removeEventListener('ownword-vault', play);}, []);
  return <button className="dome" aria-label={label} onPointerDown={() => setPulse(p => p + 1)} onClick={e => {if (e.detail === 0) setPulse(p => p + 1);}}>
    <span className="sky-glow" aria-hidden="true"></span>
    <span className="vault" key={pulse} data-pulse={pulse > 0} aria-hidden="true">
      {Array.from({length: 7}, (_, i) => <span key={i} className="vault-line" style={{'--line': i}}></span>)}
    </span>
  </button>;
}
function Modal({title, children, onCancel, closeLabel}) {
  const dialog = React.useRef(null);
  React.useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    return () => {if (previous?.isConnected) previous.focus();};
  }, []);
  return <dialog ref={dialog} className="modal" aria-labelledby="dialog-title" onCancel={e => {e.preventDefault(); onCancel();}}>
    <div className="modal-top"><span className="eyebrow">OWNWORD</span><Button variant="quiet" onClick={onCancel} aria-label={title + ' — ' + closeLabel}>{closeLabel}</Button></div>
    <h2 id="dialog-title">{title}</h2>{children}
  </dialog>;
}
function Identifier({id, t, failCopy = false}) {
  const [feedback, setFeedback] = React.useState('');
  React.useEffect(() => {setFeedback('');}, [id]);
  async function copy() {
    try {if (failCopy) throw new Error('Simulated clipboard failure'); await navigator.clipboard.writeText(id); setFeedback('copied');}
    catch {setFeedback('copyFailed');}
  }
  return <div className="identifier">
    <div className="identifier-top"><span className="eyebrow">BAP ID</span><span className="copy-feedback" role="status">{feedback ? t(feedback) : ''}</span></div>
    <div className="identifier-value"><code title={id}>{id}</code><Button onClick={copy} aria-label={t('copyBap')}>{t('copy')}</Button></div>
  </div>;
}
function IdentityCard({profile, id, t, failCopy, rotating, setRotating, angle, setAngle}) {
  const drag = React.useRef(null);
  return <div className="identity-stage">
    <div className="identity-object" onPointerDown={e => {if (e.target.closest('button')) return; drag.current = {x: e.clientX, angle}; setRotating(false); e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e => {if (drag.current) setAngle(drag.current.angle + (e.clientX - drag.current.x) * .35);}} onPointerUp={() => {drag.current = null;}} onPointerCancel={() => {drag.current = null;}}>
      <div className={`identity-sculpture ${rotating ? 'rotating' : ''}`} style={{'--angle': `${angle}deg`}}>
        <div className="plate-depth" aria-hidden="true"></div>
        <article className="identity-plate">
          <div className="plate-top"><span className="wordmark-small">ownword</span><span className="eyebrow">{t('publicIdentity')}</span></div>
          <div className="plate-person"><Portrait profile={profile} large /><span className="profile-type">{t(profile.type)}</span><h2>{profile.name}</h2><p className="bio">{profile.bio || t('noBio')}</p></div>
          <div className="plate-id"><span>BAP ID</span><code>{id}</code></div>
          <div className="plate-foot"><span>{t('ownedByYou')}</span><span>OWNWORD</span></div>
        </article>
      </div>
    </div>
    <div className="object-shadow" aria-hidden="true"></div>
    <div className="rotation-controls"><Button onClick={() => setRotating(!rotating)} aria-pressed={rotating}>{t(rotating ? 'pauseRotation' : 'rotate')}</Button><Button variant="quiet" onClick={() => {setRotating(false); setAngle(0);}}>{t('resetView')}</Button></div>
    <label className="rotation-label">{t('angle')}<input aria-label={t('angle')} type="range" min="-40" max="40" value={angle} onChange={e => {setRotating(false); setAngle(+e.target.value);}} /></label>
    <div className="public-copy"><Identifier id={id} t={t} failCopy={failCopy} /></div>
  </div>;
}
Object.assign(window, {S2, Button, Field, Portrait, Dome, Modal, Identifier, IdentityCard});
