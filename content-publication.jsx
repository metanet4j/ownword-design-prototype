/* 本地演示状态：不生成密码学签名，不连接钱包，不发送交易。 */
function useContentPublication({dataRef,setData,identityRef,identity,settings,onAccountEvent}) {
  const M=OwnwordContentModel, settingsRef=React.useRef(settings); settingsRef.current=settings;
  const active=dataRef.current.operations.find(op=>op.authorBapId===identity?.bapId && M.unresolved(op));
  const write = data => {if (settingsRef.current.storage==='failure' || dataRef.current.readFailure) throw new Error('Publication storage unavailable'); M.saveJournal(localStorage,data);};
  function update(op) {
    const data=dataRef.current, next={...data,operations:[op,...data.operations.filter(x=>x.id!==op.id)]};
    let stored=true;
    try {write(next);} catch {stored=false;}
    setData(next); console.info('[Ownword publication]',{operation:op.id,phase:op.phase,author:op.authorBapId,stored});
    return stored;
  }
  function start(review) {
    const existing=dataRef.current.operations.find(op=>op.draftId===review.draftId && M.unresolved(op));
    if (existing) return existing;
    const op=M.newOperation(review,settingsRef.current.publish);
    if (!update(op)) {op.phase='failed';op.issue='publishStorageBefore';update(op);}
    return op;
  }
  function approve(id) {
    const op=dataRef.current.operations.find(x=>x.id===id);
    if (!op || op.phase!=='authorize' || op.authorBapId!==identityRef.current?.bapId) return;
    const next={...op,phase:'signing'};
    if (!update(next)) update({...op,phase:'failed',issue:'publishStorageBefore'});
  }
  function cancel(id) {
    const op=dataRef.current.operations.find(x=>x.id===id);
    if (op?.phase==='authorize') update({...op,phase:'cancelled'});
  }
  function complete(op) {
    try {
      if (settingsRef.current.storage==='failure' || dataRef.current.readFailure) throw new Error('Publication storage unavailable');
      const next=M.acceptPublication(localStorage,dataRef.current,op,settingsRef.current.confirmation);
      setData(next);
      try {M.saveDrafts(localStorage,op.authorBapId,next.drafts);} catch {console.warn('[Ownword publication] draft cleanup deferred',op.id);}
      console.info('[Ownword publication] accepted and saved',op.id);
    } catch {update({...op,phase:'unknown',issue:'publishStorage'});}
  }
  function query(id) {
    const op=dataRef.current.operations.find(x=>x.id===id);
    if (!op || op.phase!=='unknown' || op.authorBapId!==identityRef.current?.bapId) return;
    if (settingsRef.current.query==='accepted') complete(op);
    else update({...op,phase:settingsRef.current.query==='not-received' ? 'failed' : 'unknown',issue:settingsRef.current.query==='not-received' ? 'publishNotReceived' : 'publishStillUnknown'});
  }
  React.useEffect(()=>{
    if (!active || !['signing','broadcasting'].includes(active.phase)) return;
    const timer=setTimeout(()=>{
      const op=dataRef.current.operations.find(x=>x.id===active.id);
      if (!op || op.phase!==active.phase || op.authorBapId!==identityRef.current?.bapId) return;
      if (op.phase==='signing') {
        if (op.outcome==='sign-failed') {update({...op,phase:'failed',issue:'publishSignFailed'});return;}
        const txid=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
        const submitted={...op,phase:'broadcasting',txid,signature:'sample'};
        if (!update(submitted)) update({...submitted,phase:'unknown',issue:'publishStorage'});
      } else if (op.outcome==='broadcast-failed') update({...op,phase:'failed',issue:'publishBroadcastFailed'});
      else if (op.outcome==='unknown') update({...op,phase:'unknown',issue:''});
      else complete(op);
    },active.phase==='signing' ? 1100 : 1800);
    return ()=>clearTimeout(timer);
  },[active?.id,active?.phase,identity?.bapId]);
  React.useEffect(()=>{
    for (const op of dataRef.current.operations) {
      if (op.authorBapId===identity?.bapId || !['authorize','signing','broadcasting'].includes(op.phase)) continue;
      update({...op,phase:op.phase==='broadcasting' ? 'unknown' : 'cancelled',issue:''});
    }
  },[identity?.bapId]);
  React.useEffect(()=>{
    const [phase,action]=settings.account.split('-');
    if (!active || phase!==active.phase || !action) return;
    const timer=setTimeout(()=>onAccountEvent(action),phase==='authorize' ? 1300 : 650);
    return ()=>clearTimeout(timer);
  },[active?.id,active?.phase,settings.account]);
  return {start,approve,cancel,query};
}
function ContentPublication({operation:op,t,locale,failCopy,onApprove,onCancel,onQuery,onEdit,onRead,onBack}) {
  if (!op) return <section className="content-publication" data-content-screen="publish"><h1 tabIndex="-1">{t('reviewExpired')}</h1><Button onClick={onEdit}>{t('reviewEdit')}</Button></section>;
  return <section className="content-publication" data-content-screen="publish" data-publish-phase={op.phase}>
    <p className="eyebrow">{t('publishEyebrow')}</p><h1 tabIndex="-1" role="status">{t('publish-'+op.phase)}</h1>
    <p className="publish-subtitle">{OwnwordContentModel.title(op.content) || t('contentUntitled')}</p>
    <ol className="publish-steps"><li data-complete={!!op.signature}><span>{op.signature ? '✓' : '1'}</span><div><strong>{t('publishSignatureStep')}</strong><p>{t(op.signature ? 'publishSigned' : 'publishSignDescription')}</p></div></li><li data-complete={op.phase==='published'}><span>{op.phase==='published' ? '✓' : '2'}</span><div><strong>{t('publishChainStep')}</strong><p>{t(op.phase==='published' ? 'publishAccepted' : 'publishChainDescription')}</p></div></li></ol>
    {['signing','broadcasting'].includes(op.phase) && <div className="publish-processing"><LoadingMark small /><p>{t('publishProcessing')}</p></div>}
    {op.issue && <p className="field-error" role="alert">{t(op.issue)}</p>}
    {op.phase==='unknown' && <p className="publish-explanation">{t('publishUnknownBody')}</p>}
    {['failed','cancelled'].includes(op.phase) && <p className="publish-explanation">{t('publishDraftKept')}</p>}
    {op.phase==='published' && <p className="publication-confirmation" data-content-confirmation>{t(op.confirmation==='confirmed' ? 'confirmed' : 'pendingConfirmation')}</p>}
    {op.txid && <details className="publish-transaction"><summary>{t('publishSampleRecord')}</summary><Identifier id={op.txid} t={t} failCopy={failCopy} label={t('publishSampleTx')} copyLabel="copyTx" target="content-tx" /><p>{t('publishSimulation')}</p></details>}
    <div className="review-footer">{op.phase==='unknown' ? <Button variant="accent" data-action="publish-query" onClick={()=>onQuery(op.id)}>{t('publishQuery')}</Button> : op.phase==='published' ? <Button variant="accent" data-action="publish-read" onClick={()=>onRead(op.recordId)}>{t('contentRead')}</Button> : ['failed','cancelled'].includes(op.phase) ? <Button variant="accent" data-action="publish-edit" onClick={onEdit}>{t('publishReviewAgain')}</Button> : null}<Button variant="quiet" data-action="publish-back" onClick={onBack}>{t('contentBack')}</Button></div>
    {op.phase==='authorize' && <Modal title={t('publishAuthorizeTitle')} titleKey="content-authorize" context={t('publishSampleWallet')} closeLabel={t('cancel')} onCancel={()=>onCancel(op.id)}><p>{t('publishAuthorizeBody')}</p><div className="review-author"><Portrait profile={op.author} /><strong>{op.author.name}</strong></div><Identifier id={op.authorBapId} t={t} failCopy={failCopy} /><p className="publish-explanation">{OwnwordContentModel.title(op.content) || t('contentUntitled')} · {new TextEncoder().encode(op.content).length.toLocaleString(locale)} {t('editorBytes')}</p><p className="hint">{t('publishSimulation')}</p><div className="action-row"><Button data-action="publish-cancel" onClick={()=>onCancel(op.id)}>{t('cancel')}</Button><Button variant="accent" data-action="publish-approve" onClick={()=>onApprove(op.id)}>{t('publishAuthorize')}</Button></div></Modal>}
  </section>;
}
Object.assign(window,{useContentPublication,ContentPublication});
