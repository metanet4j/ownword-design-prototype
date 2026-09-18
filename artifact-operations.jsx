function useArtifactOperations({store,identity,onAccountEvent}) {
  const M=OwnwordArtifactModel,identityRef=React.useRef(identity),[message,setMessage]=React.useState('');identityRef.current=identity;
  const active=store.data.operations.find(op=>op.bapId===identity?.bapId&&M.pending(op));
  function update(op){
    try{store.persist(M.replaceOperation(store.dataRef.current,op));setMessage('');console.info('[Ownword artifact]',{operation:op.id,kind:op.kind,phase:op.phase,bapId:op.bapId});return true;}
    catch{
      const previous=store.dataRef.current.operations.find(x=>x.id===op.id);
      const held={...previous,phase:['submitting','unknown'].includes(previous?.phase)?'unknown':'failed',issue:'artifactJournalFailed'};
      const next=M.replaceOperation(store.dataRef.current,held);store.dataRef.current=next;store.setData(next);setMessage('artifactJournalFailed');return false;
    }
  }
  function start(review){
    if(review.bapId!==identityRef.current?.bapId)return setMessage('artifactReviewExpired');
    try{const next=M.begin(store.dataRef.current,review,crypto.randomUUID(),['bind','remove'].includes(review.kind)?store.settingsRef.current.binding:store.settingsRef.current.outcome);store.persist(next);setMessage('');return next.operations[0];}
    catch(error){setMessage(error.message==='artifactSaveFailed'?'artifactJournalFailed':error.message);return null;}
  }
  function approve(id){
    const op=store.dataRef.current.operations.find(x=>x.id===id);
    if(!op||op.phase!=='authorize'||op.bapId!==identityRef.current?.bapId)return;
    const withoutSelf={...store.dataRef.current,operations:store.dataRef.current.operations.filter(x=>x.id!==id)};
    const issue=M.reviewIssue(withoutSelf,op.review);if(issue){update({...op,phase:'failed',issue});return;}
    update({...op,phase:'signing'});
  }
  function cancel(id){const op=store.dataRef.current.operations.find(x=>x.id===id);if(op?.phase==='authorize')update({...op,phase:'cancelled'});}
  function complete(op){try{store.persist(M.accept(store.dataRef.current,op));setMessage('');}catch(error){update({...op,phase:'unknown',issue:error.message==='artifactSaveFailed'?'artifactJournalFailed':error.message});}}
  function query(id){const op=store.dataRef.current.operations.find(x=>x.id===id);if(!op||op.phase!=='unknown'||op.bapId!==identityRef.current?.bapId)return;
    if(store.settingsRef.current.query==='accepted')complete(op);
    else update({...op,phase:store.settingsRef.current.query==='not-received'?'failed':'unknown',issue:store.settingsRef.current.query==='not-received'?'artifactNotReceived':'artifactStillUnknown'});
  }
  React.useEffect(()=>{
    if(!active||!['signing','validating','submitting'].includes(active.phase)||!store.writer.canWrite.current)return;
    const timer=setTimeout(()=>{
      const op=store.dataRef.current.operations.find(x=>x.id===active.id);if(!op||op.phase!==active.phase||op.bapId!==identityRef.current?.bapId)return;
      if(op.phase==='signing'){
        const issue=M.signatureResult(op,identityRef.current?.bapId);
        update(issue?{...op,phase:'failed',issue}:{...op,phase:'validating',signature:'valid',signerBapId:op.bapId,signer:M.signerFor(op.bapId),keyEpoch:'effective-at-signing'});
      }else if(op.phase==='validating'){const issue=M.reviewIssue({...store.dataRef.current,operations:store.dataRef.current.operations.filter(x=>x.id!==op.id)},op.review);update(issue?{...op,phase:'failed',issue}:{...op,phase:'submitting'});}
      else if(op.outcome==='reject')update({...op,phase:'failed',issue:'artifactRejected'});
      else if(op.outcome==='unknown')update({...op,phase:'unknown'});
      else complete(op);
    },active.phase==='submitting'?1000:650);return()=>clearTimeout(timer);
  },[active?.id,active?.phase,identity?.bapId,store.writer.state]);
  React.useEffect(()=>{if(!store.writer.canWrite.current)return;for(const op of store.dataRef.current.operations){if(op.bapId!==identity?.bapId&&['authorize','signing','validating','submitting'].includes(op.phase))update({...op,phase:op.phase==='submitting'?'unknown':'cancelled'});}},[identity?.bapId,store.writer.state]);
  React.useEffect(()=>{if(!active)return;const [phase,action]=store.settings.account.split('-');if(phase!==active.phase||!action)return;const timer=setTimeout(()=>{store.setSettings(s=>({...s,account:'none'}));onAccountEvent(action);},400);return()=>clearTimeout(timer);},[active?.id,active?.phase,store.settings.account]);
  return {start,approve,cancel,query,message};
}
function ArtifactActionReview({review,data,t,failCopy,onSign,onBack,issue}) {
  const asset=review?.assetSnapshot||data.assets.find(a=>a.id===review?.assetId);
  const previous=data.assets.find(a=>a.id===OwnwordArtifactModel.current(data,review?.bapId)?.assetId);
  if(!review||!asset)return <section className="artifact-page"><h1 tabIndex="-1">{t('reviewExpired')}</h1><Button onClick={onBack}>{t('artifactBack')}</Button></section>;
  return <section className="artifact-page" data-artifact-screen="action-review"><div className="page-heading"><p className="eyebrow">{t('review')}</p><h1 tabIndex="-1">{t('artifactReview-'+review.kind)}</h1><p>{t('artifactImpact-'+review.kind)}</p></div><div className="artifact-compose-grid"><ArtifactArt asset={asset} large t={t}/><div className="artifact-review-copy"><NumberStatus asset={asset} t={t}/><h2>{asset.name}</h2><Identifier id={review.bapId} t={t} failCopy={failCopy}/>{review.kind==='bind'&&previous&&previous.id!==asset.id&&<p>{t('artifactOldCurrent')} {previous.name}</p>}<Identifier id={asset.id} label="Inscription ID" copyLabel="artifactCopyFull" target="review-inscription" t={t} failCopy={failCopy}/><p>{t('artifactIdentitySignature')}</p><p className="hint">{t('artifactNoFees')}</p>{issue&&<p className="field-error" role="alert">{t(issue)}</p>}<div className="action-row"><Button onClick={onBack}>{t('back')}</Button><Button variant="accent" data-action="artifact-action-sign" onClick={onSign}>{t('artifactSign-'+review.kind)}</Button></div></div></div></section>;
}
function ArtifactOperation({op,data,t,failCopy,operations,onBind,onReview,onOpen,onBack}) {
  if(!op)return <section className="artifact-page"><h1 tabIndex="-1">{t('artifactNotFound')}</h1><Button onClick={onBack}>{t('artifactBack')}</Button></section>;
  const asset=data.assets.find(a=>a.id===op.assetId);
  return <section className="artifact-page artifact-operation" data-artifact-screen="operation" data-artifact-phase={op.phase} data-operation-kind={op.kind}><p className="eyebrow">{t('artifactKind-'+op.kind)}</p><h1 tabIndex="-1" role="status">{t('artifactPhase-'+op.phase)}</h1><p>{op.review.draft?.name||asset?.name}</p><div className="artifact-operation-steps"><div><S2.StatusLight label={t(op.signature==='valid'?'artifactSignatureValid':'artifactIdentitySignature')}/><p className="hint">{t('artifactSignatureScope')}</p></div><div><S2.StatusLight label={t(op.phase==='accepted'?'artifactAccepted':'artifactNetwork')}/><p className="hint">{t('artifactConfirmationSeparate')}</p></div></div>{['signing','validating','submitting'].includes(op.phase)&&<LoadingMark label={t('artifactPhase-'+op.phase)}/>}<Identifier id={op.bapId} t={t} failCopy={failCopy}/>{(op.issue||operations.message)&&<p className="field-error" role="alert">{t(op.issue||operations.message)}</p>}{op.phase==='unknown'&&<p>{t('artifactUnknownBody')}</p>}{['failed','cancelled'].includes(op.phase)&&<p>{t(op.kind==='create'?'artifactDraftKept':'artifactAssetKept')}</p>}{op.phase==='accepted'&&op.kind==='create'&&<><NumberStatus asset={asset} t={t}/><p>{t('artifactCreatedUnbound')}</p></>}{op.phase==='accepted'&&op.kind==='bind'&&<p>{t('artifactBindingComplete')}</p>}{op.phase==='accepted'&&op.kind==='remove'&&<p>{t('artifactRemovalComplete')}</p>}<div className="action-row">{op.phase==='unknown'?<Button variant="accent" onClick={()=>operations.query(op.id)}>{t('artifactQueryOperation')}</Button>:op.phase==='accepted'&&op.kind==='create'?<Button variant="accent" onClick={()=>onBind(op.assetId)}>{t('artifactContinueBinding')}</Button>:['failed','cancelled'].includes(op.phase)?<Button variant="accent" onClick={()=>onReview(op)}>{t('artifactReviewAgain')}</Button>:null}{asset&&<Button onClick={()=>onOpen(asset.id)}>{t('artifactView')}</Button>}<Button variant="quiet" onClick={onBack}>{t('artifactBack')}</Button></div>{op.phase==='authorize'&&<Modal title={t('artifactAuthorize')} context={t('walletAuthorization')} closeLabel={t('cancel')} onCancel={()=>operations.cancel(op.id)}><p>{t('artifactKind-'+op.kind)}</p><Identifier id={op.bapId} t={t} failCopy={failCopy}/><p>{t('artifactSignatureScope')}</p><p className="hint">{t('artifactNoFees')}</p><div className="action-row"><Button data-action="artifact-cancel" onClick={()=>operations.cancel(op.id)}>{t('cancel')}</Button><Button variant="accent" data-action="artifact-approve" onClick={()=>operations.approve(op.id)}>{t('approve')}</Button></div></Modal>}</section>;
}
Object.assign(window,{useArtifactOperations,ArtifactActionReview,ArtifactOperation});
