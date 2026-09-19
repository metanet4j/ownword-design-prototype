function ArtifactArt({asset,large=false,t}) {
  const image=useArtifactImage(asset.content);
  if(!OwnwordArtifactModel.previewSafe(asset.content))return <div className={'artifact-art artifact-placeholder '+(large?'large':'')}><p>{t('artifactSafePlaceholder')}</p><code>{asset.content?.type||'application/octet-stream'}</code></div>;
  if(asset.content.kind==='upload')return <div className={'artifact-art artifact-image '+(large?'large':'')}>{image.src?<img src={image.src} alt={asset.name}/>:<p role="status">{t(image.failed?'artifactPreviewFailed':'artifactLoading')}</p>}</div>;
  return <div className="artifact-art artifact-default"><p>{t('artifactBuiltIn')}</p></div>;
}
function artifactTime(value,t) {
  const date=new Date(value);
  return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat(t('artifactLocale'),{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(date);
}
function NumberStatus({asset,t,compact=false,copyable=false,failCopy=false,label,children}) {
  const state=OwnwordArtifactModel.numberState(asset),known=['assigned','stable'].includes(state),number=known?asset.number:'—';
  return <div className={'artifact-number '+(compact?'compact':'')+(number.length>8?' long-number':'')} data-number-status={state}>
    {known&&copyable?<Identifier className="artifact-number-identifier" id={asset.number} displayValue={number} label={label||t('digitalId')} copyLabel="artifactCopyNumber" target="number" t={t} failCopy={failCopy}/>:<><p className="eyebrow">{label||t('digitalId')}</p><strong>{number}</strong></>}
    <div className="artifact-number-state"><S2.StatusLight label={t('artifactNumber-'+state)}/>{known&&state==='assigned'&&<span className="hint">{asset.confirmations}/6 {t('artifactConfirmations')}</span>}{children}</div>
    {!compact&&['reorg','unverified'].includes(state)&&<p className="hint">{t('artifactLastNumber')}: {asset.number??t('artifactUnknownOrdinal')} · <time dateTime={asset.observedAt}>{artifactTime(asset.observedAt,t)}</time></p>}
    {!compact&&asset.previousNumber&&known&&asset.previousNumber!==asset.number&&<p role="status">{t('artifactNumberChanged')}: {asset.previousNumber} → {asset.number}</p>}
  </div>;
}
function ArtifactSummary({data,bapId,t,onManage,onOpen}) {
  const b=OwnwordArtifactModel.current(data,bapId),asset=data.assets.find(a=>a.id===b?.assetId),validity=OwnwordArtifactModel.bindingState(data,b);
  return <section className="artifact-summary" aria-label={t('digitalId')}>
    {asset&&validity==='valid'?<NumberStatus asset={asset} t={t} compact/>:<div className="artifact-summary-empty"><p className="eyebrow">{t('digitalId')}</p><p className="artifact-summary-state">{t(asset?(validity==='unverified'?'artifactAssociationUnverified':'artifactAssociationInvalid'):'digitalIdNotSet')}</p></div>}
    <Button variant="quiet" onClick={()=>asset?onOpen(asset.id):onManage()}>{t(asset?(validity==='valid'?'artifactView':'reviewAssociation'):'chooseDigitalId')}<UiIcon name="ChevronRight"/></Button>
  </section>;
}
function ArtifactCard({asset,data,bapId,t,onOpen,children}) {
  const b=OwnwordArtifactModel.binding(data,asset.id),isCurrent=b?.bapId===bapId;
  return React.cloneElement(S2.Card(), {className:"s2d-card artifact-card","data-artifact-id":asset.id,"data-current":isCurrent}, <>
    {asset.content.kind!=='brand'&&<ArtifactArt asset={asset} t={t}/>}
    <div className="artifact-card-content"><div className="artifact-card-top"><NumberStatus asset={asset} t={t} compact/>{isCurrent&&<span className="artifact-current">{t('artifactCurrent')}</span>}{children&&<Button iconOnly variant="quiet" className="artifact-card-open" onClick={()=>onOpen(asset.id)} aria-label={t('artifactView')+' · '+asset.name}><UiIcon name="ChevronRight"/></Button>}</div><h2>{asset.name}</h2>{!isCurrent&&b&&<p className="hint">{t('artifactAssociated')}</p>}<div className="artifact-card-actions">{!children&&<Button onClick={()=>onOpen(asset.id)} aria-label={t('artifactView')+' · '+asset.name}>{t('artifactView')}</Button>}{children}</div></div>
  </>);
}
function ArtifactSettings({settings,setSettings,store,t}) {
  return <fieldset className="artifact-settings"><legend>{t('artifactLab')}</legend><ArtifactFixtureControls store={store} t={t}/><ArtifactReset store={store} t={t}/><label>{t('artifactInventory')}<select data-artifact-scenario="list" value={settings.list} onChange={e=>setSettings(s=>({...s,list:e.target.value}))}>{['all','empty','error'].map(v=><option key={v} value={v}>{t('artifactList-'+v)}</option>)}</select></label><label>{t('artifactStorage')}<select data-artifact-scenario="storage" value={settings.storage} onChange={e=>setSettings(s=>({...s,storage:e.target.value}))}><option value="normal">{t('contentScenario-normal')}</option><option value="failure">{t('draftStorageFailure')}</option></select></label>{[['lookup',['normal','error','reorg']],['ownership',['verified','unavailable']],['number',['record','pending','resolving','five','six','reorg','changed','error']],['preview',['record','html','svg','damaged','metadata']],['outcome',['success','invalid','missing','mismatch','spend-only','reject','unknown']],['binding',['success','reject','unknown']],['query',['accepted','unknown','not-received']],['account',['none','authorize-switch','submitting-switch']]].map(([key,values])=><label key={key}>{t('artifactScenario-'+key)}<select data-artifact-scenario={key} value={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))}>{values.map(v=><option key={v} value={v}>{t('artifactScenario-'+v)}</option>)}</select></label>)}</fieldset>;
}
Object.assign(window,{ArtifactArt,NumberStatus,ArtifactSummary,ArtifactCard,ArtifactSettings});

function ArtifactHistory({records,data,t,onOpen,resolveIdentity,showIdentity=false}) {
  return <ol className="artifact-history-list">{records.map(b=>{const asset=data.assets.find(a=>a.id===b.assetId),replacement=data.assets.find(a=>a.id===b.replacedBy),reason=b.endReason||(b.removedBy?'removed':b.validity==='not-owned'?'transferred':'ended'),name=resolveIdentity?.(b.bapId)?.profile.name;
    return <li key={b.id}><div className="artifact-history-marker"><UiIcon name="History"/></div><div className="artifact-history-event"><strong>{t('artifactHistory-'+reason)}</strong><p>{asset?.name||b.assetId}{replacement&&<> · {t('artifactHistoryReplacement')}: {replacement.name}</>}</p>{showIdentity&&<div className="artifact-history-identity"><span>{name||t('artifactAssociatedTitle')}</span><code>{b.bapId}</code></div>}<p className="hint">{b.endedAt?<time dateTime={b.endedAt}>{artifactTime(b.endedAt,t)}</time>:t('artifactHistoryTimeUnknown')}</p></div>{onOpen&&asset&&<Button variant="quiet" aria-label={t('artifactView')+' · '+asset.name} onClick={()=>onOpen(asset.id)}><UiIcon name="ChevronRight"/></Button>}</li>;
  })}</ol>;
}
function ArtifactInventory({data,identity,t,onSelect,onOpen,onCreate}) {
  const M=OwnwordArtifactModel,[filter,setFilter]=React.useState('held'),held=M.selectionAssets(data,identity.bapId),record=M.current(data,identity.bapId),validity=M.bindingState(data,record),current=data.assets.find(a=>a.id===record?.assetId),others=held.filter(a=>a.id!==current?.id),history=data.bindings.filter(b=>b.bapId===identity.bapId&&b.state==='history');
  if(!held.length&&!history.length)return <section className="artifact-empty"><h2>{t('artifactEmpty')}</h2><p>{t('artifactOptionalBody')}</p>{onCreate&&<Button variant="accent" onClick={onCreate}>{t('artifactCreate')}</Button>}</section>;
  return <div className="artifact-inventory">
    {current?<section className="artifact-current-overview" aria-label={t(validity==='valid'?'artifactCurrentId':validity==='unverified'?'artifactAssociationUnverified':'artifactAssociationInvalid')}><div>{validity==='valid'?<NumberStatus asset={current} t={t} label={t('artifactCurrentId')}/>:<><p className="eyebrow">{t(validity==='unverified'?'artifactAssociationUnverified':'artifactAssociationInvalid')}</p><p>{t('artifactLastNumber')}: {current.number??'—'}</p><p className="hint">{t('artifactLastObserved')}: {artifactTime(current.observedAt,t)}</p></>}<h2>{current.name}</h2></div><Button aria-label={t('artifactView')} onClick={()=>onOpen(current.id)}><span className="artifact-current-view-label">{t('artifactView')}</span><UiIcon name="ChevronRight"/></Button></section>:<section className="artifact-current-empty"><div><h2>{t('digitalIdNotSet')}</h2><p className="hint">{t(held.length?'artifactChooseFromWallet':'artifactOptionalBody')}</p></div><ContextHelp label={t('artifactAssociationHelp')}><p>{t('artifactOptionalBody')}</p></ContextHelp></section>}
    <div className="artifact-filters" role="group" aria-label={t('artifactFilter')}>{['held','history'].map(f=><div className="artifact-filter-option" key={f}><Button variant="quiet" aria-pressed={filter===f} onClick={()=>setFilter(f)}>{t('artifactSelect-'+f)} <span className="content-count">{f==='held'?held.length:history.length}</span></Button>{f==='history'&&<ContextHelp label={t('artifactHistoryHelp')}><p>{t('artifactHistoryHelpBody')}</p></ContextHelp>}</div>)}</div>
    {filter==='history'?(history.length?<ArtifactHistory records={history} data={data} t={t} onOpen={onOpen}/>:<p className="artifact-inventory-empty">{t('artifactHistoryEmpty')}</p>):others.length?<div className="artifact-grid artifact-wallet-grid">{others.map(a=>{const why=M.bindingEligibility(a,identity.bapId),busy=M.conflict(data,identity.bapId,a.id);return <ArtifactCard key={a.id} asset={a} data={data} bapId={identity.bapId} t={t} onOpen={onOpen}><Button disabled={!!why||!!busy} data-select-artifact={a.id} onClick={()=>onSelect(a.id)}>{t('artifactSetCurrent')}</Button>{(why||busy)&&<p className="hint">{t(busy?'artifactUnresolved':'artifactEligibility-'+why)}</p>}</ArtifactCard>;})}</div>:<div className="artifact-inventory-empty"><p>{t(current?'artifactNoOtherAssets':'artifactEmpty')}</p>{onCreate&&<Button variant={current?'secondary':'accent'} onClick={onCreate}>{t('artifactCreate')}</Button>}</div>}
  </div>;
}
function ArtifactSelector({data,identity,t,onSelect,onOpen,onBack}) {
  return <section className="artifact-page" data-artifact-screen="select"><ArtifactBack t={t} onClick={onBack}/><div className="page-heading"><h1 className="task-title" tabIndex="-1">{t('artifactSelect')}</h1></div><ArtifactInventory data={data} identity={identity} t={t} onSelect={onSelect} onOpen={onOpen}/></section>;
}
Object.assign(window,{ArtifactInventory,ArtifactHistory});
function ArtifactFixtureControls({store,t}) {
  const assetId=store.settings.target||OwnwordArtifactModel.seed().assets[0].id,scenario=store.settings.facts||'normal',[message,setMessage]=React.useState('');
  const setAssetId=target=>store.setSettings(s=>({...s,target})),setScenario=facts=>store.setSettings(s=>({...s,facts}));
  function apply(){try{store.persist(OwnwordArtifactModel.factScenario(store.dataRef.current,assetId,scenario));setMessage('artifactScenarioApplied');}catch{setMessage('artifactSaveFailed');}}
  return <><label>{t('artifactScenarioTarget')}<select data-artifact-scenario="target" value={assetId} onChange={e=>setAssetId(e.target.value)}>{store.data.assets.map(a=><option key={a.id} value={a.id}>{a.name} · {a.number??'—'}</option>)}</select></label><label>{t('artifactScenarioFacts')}<select data-artifact-scenario="facts" value={scenario} onChange={e=>setScenario(e.target.value)}>{['normal','unknown','owner','origin','duplicate','outpoint','concurrent'].map(v=><option key={v} value={v}>{t('artifactFact-'+v)}</option>)}</select></label><Button data-action="artifact-apply-facts" onClick={apply}>{t('artifactApplyFacts')}</Button>{message&&<p role="status">{t(message)}</p>}</>;
}
Object.assign(window,{ArtifactSelector,ArtifactFixtureControls});

function ArtifactAssociationNotice({data,bapId,assetId,t,store,onReplace,onRemove}) {
  const [message,setMessage]=React.useState(''),M=OwnwordArtifactModel,b=M.current(data,bapId),state=M.bindingState(data,b);
  if(!b||state==='valid'||(assetId&&b.assetId!==assetId))return null;
  function retry(){try{store.refreshOwnership(b.assetId);setMessage('');}catch{setMessage('artifactSaveFailed');}}
  return <aside className="artifact-association-notice" data-binding-state={state} role="status"><div><h2>{t(state==='unverified'?'artifactAssociationUnverified':'artifactAssociationInvalid')}</h2><p>{t('artifactBinding-'+state)}</p><p className="hint">{t('artifactIdentityUnaffected')}</p>{message&&<p className="field-error">{t(message)}</p>}</div><div className="action-row">{state==='unverified'&&<Button onClick={retry}>{t('retry')}</Button>}<Button onClick={onReplace}>{t('artifactReplace')}</Button><Button disabled={!!M.conflict(data,bapId,b.assetId)} data-action="artifact-remove" onClick={()=>onRemove(b.assetId)}>{t('artifactRemove')}</Button></div></aside>;
}
window.ArtifactAssociationNotice=ArtifactAssociationNotice;

function ArtifactReset({store,t}) {
  const [open,setOpen]=React.useState(false),[message,setMessage]=React.useState(''),[busy,setBusy]=React.useState(false);
  async function reset(){setBusy(true);try{await store.resetDemo();setMessage('artifactResetComplete');setOpen(false);}catch(e){setMessage(e.message||'artifactSaveFailed');}finally{setBusy(false);}}
  return <><Button data-action="artifact-reset" onClick={()=>{setMessage('');setOpen(true);}}>{t('artifactReset')}</Button>{!open&&message&&<p role="status">{t(message)}</p>}{open&&<Modal title={t('artifactReset')} context={t('artifactLab')} closeLabel={t('cancel')} onCancel={()=>{if(!busy)setOpen(false);}}><p>{t('artifactResetBody')}</p>{message&&<p role="alert" className="field-error">{t(message)}</p>}<div className="action-row"><Button disabled={busy} onClick={()=>setOpen(false)}>{t('cancel')}</Button><Button disabled={busy} data-action="artifact-reset-confirm" onClick={reset}>{t('artifactResetConfirm')}</Button></div></Modal>}</>;
}
window.ArtifactReset=ArtifactReset;
