function ArtifactDetail({asset,data,identity,resolveIdentity,t,failCopy,go,onBack,backLabel,onConnect,onRefresh,onTransfer,onBind,onVerify,children}) {
  const [retry,setRetry]=React.useState(0),[refreshState,setRefreshState]=React.useState(''),M=OwnwordArtifactModel;
  if(!asset)return <section className="artifact-page" data-artifact-screen="detail"><ArtifactBack t={t} label={backLabel} onClick={onBack}/><h1 className="task-title" tabIndex="-1">{t('artifactNotFound')}</h1><p>{t('artifactLocalScope')}</p></section>;
  function refresh(){try{onRefresh();setRefreshState('artifactRefreshed');}catch{setRefreshState('artifactSaveFailed');}}
  const defaultContent=asset.content.kind==='brand',binding=M.binding(data,asset.id),history=data.bindings.filter(b=>b.assetId===asset.id&&b.state==='history'),canManage=identity&&asset.owner===M.ownerFor(identity.bapId);
  const candidate=data.bindings.find(b=>b.assetId===asset.id&&b.state==='current'),associationState=M.bindingState(data,candidate);
  const value=(id,label,target,compact=false)=>id?<Identifier compact={compact} id={String(id)} label={label} copyLabel="artifactCopyFull" target={target} t={t} failCopy={failCopy}/>:<p className="hint">{label}: {t('artifactUnknownOrdinal')}</p>;
  return <section className="artifact-page" data-artifact-screen="detail">
    <ArtifactBack t={t} label={backLabel} onClick={onBack}/>
    <div className="artifact-detail-overview">
      <div className="artifact-detail-main"><NumberStatus asset={asset} t={t} copyable failCopy={failCopy} label={binding&&binding.bapId===identity?.bapId?t('artifactCurrentId'):undefined}><ContextHelp label={t('artifactConfirmationHelp')}><p>{t('artifactSubmissionMeaning')}</p><p>{t('artifactInscriptionConfirmations')}: {asset.confirmations}</p><p>{t('artifactLastObserved')}: {artifactTime(asset.observedAt,t)}</p></ContextHelp><Button iconOnly variant="quiet" className="artifact-refresh-button" aria-label={t('artifactRefreshNumber')} title={t('artifactRefreshNumber')} onClick={refresh}><UiIcon name="Refresh"/></Button></NumberStatus><h1 className="task-title" tabIndex="-1">{asset.name}</h1>{refreshState&&<p role="status" className="hint">{t(refreshState)}</p>}</div>
      <section className="artifact-association"><h2 className="eyebrow">{t('artifactAssociatedTitle')}</h2>{binding?<><strong>{resolveIdentity(binding.bapId)?.profile.name||t('publicIdentity')}</strong>{value(binding.bapId,'BAP ID','associated',true)}<Button variant="quiet" onClick={()=>go('identity-view',binding.bapId)}>{t('artifactOpenIdentity')}</Button></>:candidate?<><p>{t(associationState==='unverified'?'artifactAssociationUnverified':'artifactAssociationInvalid')}</p>{value(candidate.bapId,t('artifactRecordedIdentity'),'recorded-identity',true)}<p className="hint">{t('artifactBinding-'+associationState)}</p></>:<p>{t('artifactNoBinding')}</p>}{canManage&&!binding&&<ArtifactDetailActions placement="association" asset={asset} data={data} identity={identity} t={t} onBind={onBind}/>}</section>
    </div>
    {children}
    {canManage&&asset.transfer&&<ArtifactTransferResult asset={asset} t={t} onVerify={onVerify}/>}
    <ArtifactRecordTabs key={asset.id} t={t} items={[
      {id:'content',title:t('artifactContent'),content:<>{!defaultContent&&<div className="artifact-content-preview"><ArtifactArt key={asset.id+':'+retry} asset={asset} t={t} large/>{M.previewSafe(asset.content)&&<Button variant="quiet" onClick={()=>setRetry(v=>v+1)}>{t('artifactRefreshPreview')}</Button>}</div>}{defaultContent&&<p className="hint">{t('artifactBuiltIn')}</p>}<section className="artifact-facts"><dl><div><dt>{t('artifactContentName')}</dt><dd>{asset.inscriptionName||asset.name}</dd></div><div><dt>{t('artifactContentType')}</dt><dd>{asset.content.type}</dd></div></dl>{value(asset.creator,t('artifactCreator'),'creator')}</section></>},
      {id:'ownership',title:t('artifactOwnership'),content:<section className="artifact-facts"><dl><div><dt>{t('artifactMetadata')}</dt><dd>{asset.mapName}</dd></div></dl>{value(asset.owner,t(asset.ownershipCheck==='verified'?'artifactOwner':'artifactLastOwner'),'owner')}{canManage&&<ArtifactDetailActions placement="ownership" asset={asset} data={data} identity={identity} t={t} onTransfer={onTransfer}/>}</section>},
      {id:'proof',title:t('artifactProof'),content:<div className="artifact-proof-body">{value(asset.id,'Inscription ID','inscription')}{value(asset.ordinal,t('artifactOrdinal'),'ordinal')}{value(asset.origin,'Origin','origin')}{value(asset.outpoint,'Current Outpoint','outpoint')}{value(location.origin+location.pathname+'#/artifact/'+encodeURIComponent(asset.id),t('artifactLink'),'artifact-link')}{asset.transactions.map((record,index)=><section className="artifact-transaction" key={record.txid+index}><h3>{t('artifactKind-'+record.kind)}</h3>{value(record.txid,t('publishSampleTx'),'tx-'+index)}<IdentitySignatureProof bapId={record.bapId} signer={record.signer} signature={record.signature} keyEpoch={record.keyEpoch} t={t} failCopy={failCopy}/><p>{record.confirmations} {t('artifactConfirmations')}</p></section>)}</div>},
      {id:'history',title:t('artifactHistory'),content:history.length?<ArtifactHistory resolveIdentity={resolveIdentity} records={history} data={data} t={t} showIdentity/>:<p className="artifact-inventory-empty">{t('artifactHistoryEmpty')}</p>}
    ]}/>
    {!identity&&<Button onClick={onConnect}>{t('connect')}</Button>}
  </section>;
}
window.ArtifactDetail=ArtifactDetail;

function ArtifactRecordTabs({items,t}) {
  return <S2.Tabs aria-label={t('artifactRecords')} UNSAFE_className="artifact-records">
    <S2.TabList>{items.map(item=><S2.Tab id={item.id} key={item.id}>{t('artifactTab-'+item.id)}</S2.Tab>)}</S2.TabList>
    {items.map(item=><S2.TabPanel id={item.id} key={item.id}><S2.Card styles={fullWidth} variant="quiet"><div className="artifact-record-panel"><h2>{item.title}</h2>{item.content}</div></S2.Card></S2.TabPanel>)}
  </S2.Tabs>;
}

function ArtifactPublicIdentity({bapId,resolveIdentity,t,failCopy,onBack,backLabel,data,onOpenArtifact}) {
  const [rotating,setRotating]=React.useState(false),[angle,setAngle]=React.useState(0),record=resolveIdentity(bapId);
  return <section className="artifact-page" data-artifact-screen="public-identity"><ArtifactBack t={t} label={backLabel} onClick={onBack}/><h1 className="task-title" tabIndex="-1">{t(!!record?'publicIdentity':'artifactNotFound')}</h1>{!!record&&<IdentityCard profile={record.profile} id={bapId} t={t} failCopy={failCopy} transaction={record.transaction} rotating={rotating} setRotating={setRotating} angle={angle} setAngle={setAngle} artifactData={data} onOpenArtifact={onOpenArtifact}/>}</section>;
}
window.ArtifactPublicIdentity=ArtifactPublicIdentity;
