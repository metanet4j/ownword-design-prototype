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
function NumberStatus({asset,t,compact=false,copyable=false,failCopy=false}) {
  const state=OwnwordArtifactModel.numberState(asset),known=['assigned','stable'].includes(state),number=known?asset.number:'—';
  return <div className={'artifact-number '+(compact?'compact':'')+(number.length>8?' long-number':'')} data-number-status={state}>
    {known&&copyable?<Identifier className="artifact-number-identifier" id={asset.number} displayValue={number} label={t('digitalId')} copyLabel="artifactCopyNumber" target="number" t={t} failCopy={failCopy}/>:<><p className="eyebrow">{t('digitalId')}</p><strong>{number}</strong></>}
    <div className="artifact-number-state"><S2.StatusLight label={t('artifactNumber-'+state)}/>{known&&state==='assigned'&&<span className="hint">{asset.confirmations}/6 {t('artifactConfirmations')}</span>}</div>
    {!compact&&['reorg','unverified'].includes(state)&&<p className="hint">{t('artifactLastNumber')}: {asset.number??t('artifactUnknownOrdinal')} · <time dateTime={asset.observedAt}>{artifactTime(asset.observedAt,t)}</time></p>}
    {!compact&&asset.previousNumber&&known&&asset.previousNumber!==asset.number&&<p role="status">{t('artifactNumberChanged')}: {asset.previousNumber} → {asset.number}</p>}
  </div>;
}
function ArtifactSummary({data,bapId,t,onManage,onOpen}) {
  const b=OwnwordArtifactModel.current(data,bapId),asset=data.assets.find(a=>a.id===b?.assetId),validity=OwnwordArtifactModel.bindingState(data,b);
  return <section className="artifact-summary" aria-label={t('digitalId')}><div>{asset&&validity!=='valid'?<><p className="eyebrow">{t('digitalId')}</p><h3>{t(validity==='unverified'?'artifactAssociationUnverified':'artifactAssociationInvalid')}</h3><p className="hint">{t('artifactBinding-'+validity)}</p></>:asset?<NumberStatus asset={asset} t={t} compact/>:<><p className="eyebrow">{t('digitalId')}</p><h3>{t('artifactOptional')}</h3><p className="hint">{t('artifactOptionalBody')}</p></>}</div><div className="action-row">{asset&&<Button onClick={()=>onOpen(asset.id)}>{t('artifactView')}</Button>}<Button onClick={onManage}>{t('artifactManage')}</Button></div></section>;
}
function ArtifactCard({asset,data,bapId,t,onOpen,children}) {
  const b=OwnwordArtifactModel.binding(data,asset.id),isCurrent=b?.bapId===bapId;
  return React.cloneElement(S2.Card(), {className:"s2d-card artifact-card","data-artifact-id":asset.id,"data-current":isCurrent}, <>
    {asset.content.kind!=='brand'&&<ArtifactArt asset={asset} t={t}/>}
    <div className="artifact-card-content"><div className="artifact-card-top"><NumberStatus asset={asset} t={t} compact/>{isCurrent&&<span className="artifact-current">{t('artifactCurrent')}</span>}</div><h2>{asset.name}</h2><p className="hint">{t(b?(isCurrent?'artifactYourCurrent':'artifactAssociated'):'artifactNoBinding')}</p><div className="artifact-card-actions"><Button variant={children?'quiet':'secondary'} onClick={()=>onOpen(asset.id)} aria-label={t('artifactView')+' · '+asset.name}>{t('artifactView')}</Button>{children}</div></div>
  </>);
}
function ArtifactSettings({settings,setSettings,store,t}) {
  return <fieldset className="artifact-settings"><legend>{t('artifactLab')}</legend><ArtifactFixtureControls store={store} t={t}/><ArtifactReset store={store} t={t}/><label>{t('artifactInventory')}<select data-artifact-scenario="list" value={settings.list} onChange={e=>setSettings(s=>({...s,list:e.target.value}))}>{['all','empty','error'].map(v=><option key={v} value={v}>{t('artifactList-'+v)}</option>)}</select></label><label>{t('artifactStorage')}<select data-artifact-scenario="storage" value={settings.storage} onChange={e=>setSettings(s=>({...s,storage:e.target.value}))}><option value="normal">{t('contentScenario-normal')}</option><option value="failure">{t('draftStorageFailure')}</option></select></label>{[['lookup',['normal','error','reorg']],['ownership',['verified','unavailable']],['number',['record','pending','resolving','five','six','reorg','changed','error']],['preview',['record','html','svg','damaged','metadata']],['outcome',['success','invalid','missing','mismatch','spend-only','reject','unknown']],['binding',['success','reject','unknown']],['query',['accepted','unknown','not-received']],['account',['none','authorize-switch','submitting-switch']]].map(([key,values])=><label key={key}>{t('artifactScenario-'+key)}<select data-artifact-scenario={key} value={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))}>{values.map(v=><option key={v} value={v}>{t('artifactScenario-'+v)}</option>)}</select></label>)}</fieldset>;
}
Object.assign(window,{ArtifactArt,NumberStatus,ArtifactSummary,ArtifactCard,ArtifactSettings});

function ArtifactSelector({data,identity,t,onSelect,onOpen,onBack}) {
  const M=OwnwordArtifactModel,[filter,setFilter]=React.useState('held');
  const assets=data.assets.filter(a=>filter==='held'?a.owner===M.ownerFor(identity.bapId):data.bindings.some(b=>b.assetId===a.id&&b.bapId===identity.bapId));
  return <section className="artifact-page" data-artifact-screen="select"><div className="page-heading"><h1 tabIndex="-1">{t('artifactSelect')}</h1><ContextHelp label={t('artifactAssociationHelp')}><p>{t('artifactSelectBody')}</p></ContextHelp></div><div className="artifact-filters">{['held','associated'].map(f=><Button key={f} variant="quiet" aria-pressed={filter===f} onClick={()=>setFilter(f)}>{t('artifactSelect-'+f)}</Button>)}</div><div className="artifact-grid">{assets.map(a=>{const why=M.eligible(a,identity.bapId),current=M.binding(data,a.id)?.bapId===identity.bapId,busy=M.conflict(data,identity.bapId,a.id);return <ArtifactCard key={a.id} asset={a} data={data} bapId={identity.bapId} t={t} onOpen={onOpen}>
    {!current&&<Button variant="accent" disabled={!!why||!!busy} data-select-artifact={a.id} onClick={()=>onSelect(a.id)}>{t('artifactSetCurrent')}</Button>}{(why||busy)&&<p className="hint" role="status">{t(busy?'artifactUnresolved':'artifactEligibility-'+why)}</p>}
  </ArtifactCard>;})}</div>{!assets.length&&<p>{t('artifactEmpty')}</p>}<Button variant="quiet" onClick={onBack}>{t('artifactBack')}</Button></section>;
}
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
