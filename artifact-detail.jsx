function ArtifactDetail({asset,data,identity,t,failCopy,go,onBack,onRefresh,onTransfer,onBind,onVerify,children}) {
  const [retry,setRetry]=React.useState(0),[refreshState,setRefreshState]=React.useState(''),M=OwnwordArtifactModel;
  if(!asset)return <section className="artifact-page" data-artifact-screen="detail"><ArtifactBack t={t} onClick={onBack}/><h1 tabIndex="-1">{t('artifactNotFound')}</h1><p>{t('artifactLocalScope')}</p></section>;
  function refresh(){try{onRefresh();setRefreshState('artifactRefreshed');}catch{setRefreshState('artifactSaveFailed');}}
  const defaultContent=asset.content.kind==='brand',binding=M.binding(data,asset.id),history=data.bindings.filter(b=>b.assetId===asset.id&&b.state==='history'),canManage=identity&&asset.owner===M.ownerFor(identity.bapId);
  const value=(id,label,target)=>id?<Identifier id={String(id)} label={label} copyLabel="artifactCopyFull" target={target} t={t} failCopy={failCopy}/>:<p className="hint">{label}: {t('artifactUnknownOrdinal')}</p>;
  return <section className="artifact-page" data-artifact-screen="detail">
    <ArtifactBack t={t} onClick={identity?onBack:()=>go('find')}/>
    <div className="artifact-detail-overview">
      <div className="artifact-detail-main"><NumberStatus asset={asset} t={t} copyable failCopy={failCopy} label={binding&&binding.bapId===identity?.bapId?t('artifactCurrentId'):undefined}><ContextHelp label={t('artifactConfirmationHelp')}><p>{t('artifactSubmissionMeaning')}</p><p>{t('artifactInscriptionConfirmations')}: {asset.confirmations}</p><p>{t('artifactLastObserved')}: {artifactTime(asset.observedAt,t)}</p></ContextHelp>{React.cloneElement(S2.ActionButton({variant:'quiet',onPress:refresh}),{className:'s2d-button s2d-button-quiet artifact-refresh-button','aria-label':t('artifactRefreshNumber'),title:t('artifactRefreshNumber')},<UiIcon name="Refresh"/>)}</NumberStatus><h1 tabIndex="-1">{asset.name}</h1>{refreshState&&<p role="status" className="hint">{t(refreshState)}</p>}</div>
      <section className="artifact-association"><h2 className="eyebrow">{t('artifactAssociatedTitle')}</h2>{binding?<><strong>{OwnwordModel.fixtures[M.identities.indexOf(binding.bapId)]?.name||t('publicIdentity')}</strong>{value(binding.bapId,'BAP ID','associated')}<Button variant="quiet" onClick={()=>go('identity-view',binding.bapId)}>{t('artifactOpenIdentity')}<UiIcon name="ChevronRight"/></Button></>:<p>{t('artifactNoBinding')}</p>}{canManage&&!binding&&<ArtifactDetailActions placement="association" asset={asset} data={data} identity={identity} t={t} onBind={onBind}/>}</section>
    </div>
    {children}
    {canManage&&asset.transfer&&<ArtifactTransferResult asset={asset} t={t} onVerify={onVerify}/>}
    {!defaultContent&&<div className="artifact-content-preview"><ArtifactArt key={asset.id+':'+retry} asset={asset} t={t} large/>{M.previewSafe(asset.content)&&<Button variant="quiet" onClick={()=>setRetry(v=>v+1)}>{t('artifactRefreshPreview')}</Button>}</div>}
    <div className="artifact-records">
      <details className="artifact-proof artifact-content-details"><summary><UiIcon name="ChevronRight"/>{t('artifactContent')}{defaultContent&&<span className="hint">{t('artifactBuiltIn')}</span>}</summary><section className="artifact-facts"><dl><div><dt>{t('artifactContentName')}</dt><dd>{asset.inscriptionName||asset.name}</dd></div><div><dt>{t('artifactContentType')}</dt><dd>{asset.content.type}</dd></div></dl>{value(asset.creator,t('artifactCreator'),'creator')}</section></details>
      <details className="artifact-proof"><summary><UiIcon name="ChevronRight"/>{t('artifactOwnership')}</summary><section className="artifact-facts"><dl><div><dt>{t('artifactMetadata')}</dt><dd>{asset.mapName}</dd></div></dl>{value(asset.owner,t(asset.ownershipCheck==='verified'?'artifactOwner':'artifactLastOwner'),'owner')}{canManage&&<ArtifactDetailActions placement="ownership" asset={asset} data={data} identity={identity} t={t} onTransfer={onTransfer}/>}</section></details>
      <details className="artifact-proof"><summary><UiIcon name="ChevronRight"/>{t('artifactProof')}</summary><div className="artifact-proof-body">{value(asset.id,'Inscription ID','inscription')}{value(asset.ordinal,t('artifactOrdinal'),'ordinal')}{value(asset.origin,'Origin','origin')}{value(asset.outpoint,'Current Outpoint','outpoint')}{value(location.origin+location.pathname+'#/artifact/'+encodeURIComponent(asset.id),t('artifactLink'),'artifact-link')}{asset.transactions.map((record,index)=><section className="artifact-transaction" key={record.txid+index}><h3>{t('artifactKind-'+record.kind)}</h3>{value(record.txid,t('publishSampleTx'),'tx-'+index)}<IdentitySignatureProof bapId={record.bapId} signer={record.signer} signature={record.signature} keyEpoch={record.keyEpoch} t={t} failCopy={failCopy}/><p>{record.confirmations} {t('artifactConfirmations')}</p></section>)}</div></details>
      <details className="artifact-proof"><summary><UiIcon name="ChevronRight"/>{t('artifactHistory')}<span className="content-count">{history.length}</span></summary>{history.length?<ArtifactHistory records={history} data={data} t={t} showIdentity/>:<p className="artifact-inventory-empty">{t('artifactHistoryEmpty')}</p>}</details>
    </div>
    {!identity&&<Button onClick={onBack}>{t('connect')}</Button>}
  </section>;
}
window.ArtifactDetail=ArtifactDetail;

function ArtifactPublicIdentity({bapId,t,failCopy,onBack}) {
  const [rotating,setRotating]=React.useState(false),[angle,setAngle]=React.useState(0),index=OwnwordModel.ids.indexOf(bapId);
  return <section className="artifact-page" data-artifact-screen="public-identity"><ArtifactBack t={t} onClick={onBack}/><h1 tabIndex="-1">{t(index>=0?'publicIdentity':'artifactNotFound')}</h1>{index>=0&&<IdentityCard profile={OwnwordModel.fixtures[index]} id={bapId} t={t} failCopy={failCopy} transaction={OwnwordModel.transactions[index]} rotating={rotating} setRotating={setRotating} angle={angle} setAngle={setAngle}/>}</section>;
}
window.ArtifactPublicIdentity=ArtifactPublicIdentity;
