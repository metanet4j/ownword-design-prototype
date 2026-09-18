function ArtifactDetail({asset,data,identity,t,failCopy,go,onBack,onRefresh,children}) {
  const [retry,setRetry]=React.useState(0),[refreshState,setRefreshState]=React.useState(''),M=OwnwordArtifactModel;
  if(!asset)return <section className="artifact-page" data-artifact-screen="detail"><h1 tabIndex="-1">{t('artifactNotFound')}</h1><p>{t('artifactLocalScope')}</p><Button onClick={onBack}>{t('artifactBack')}</Button></section>;
  function refresh(){try{onRefresh();setRefreshState('artifactRefreshed');}catch{setRefreshState('artifactSaveFailed');}}
  const defaultContent=asset.content.kind==='brand',binding=M.binding(data,asset.id),history=data.bindings.filter(b=>b.assetId===asset.id&&b.state==='history');
  const value=(id,label,target)=>id?<Identifier id={String(id)} label={label} copyLabel="artifactCopyFull" target={target} t={t} failCopy={failCopy}/>:<p className="hint">{label}: {t('artifactUnknownOrdinal')}</p>;
  return <section className="artifact-page" data-artifact-screen="detail">
    <Button data-action="artifact-back" variant="quiet" onClick={identity?onBack:()=>go('find')}>{t(identity?'artifactBack':'artifactFind')}</Button>
    <div className="artifact-detail-grid">
      <div className="artifact-detail-main"><NumberStatus asset={asset} t={t} copyable failCopy={failCopy}/><h1 tabIndex="-1">{asset.name}</h1>
        <div className="artifact-number-observation"><p className="hint">{t(['reorg','unverified'].includes(M.numberState(asset))?'artifactCachedConfirmations':'artifactInscriptionConfirmations')}: {asset.confirmations}</p><p className="hint">{t('artifactLastObserved')}: <time dateTime={asset.observedAt} title={asset.observedAt}>{artifactTime(asset.observedAt,t)}</time></p><Button variant="quiet" onClick={refresh}>{t('artifactRefreshNumber')}</Button>{refreshState&&<p role="status">{t(refreshState)}</p>}</div>
      </div>
      <section className="artifact-association"><h2 className="eyebrow">{t('artifactAssociatedTitle')}</h2>{binding?<><strong>{OwnwordModel.fixtures[M.identities.indexOf(binding.bapId)]?.name}</strong>{value(binding.bapId,'BAP ID','associated')}<Button onClick={()=>go('identity-view',binding.bapId)}>{t('artifactOpenIdentity')}</Button></>:<p>{t('artifactNoBinding')}</p>}</section>
    </div>
    {children}
    {!defaultContent&&<div className="artifact-content-preview"><ArtifactArt key={asset.id+':'+retry} asset={asset} t={t} large/>{M.previewSafe(asset.content)&&<Button variant="quiet" onClick={()=>setRetry(v=>v+1)}>{t('artifactRefreshPreview')}</Button>}</div>}
    <details className="artifact-proof artifact-content-details"><summary>{t('artifactContent')}{defaultContent&&<span className="hint">{t('artifactBuiltIn')}</span>}</summary><section className="artifact-facts"><dl><div><dt>{t('artifactContentName')}</dt><dd>{asset.name}</dd></div><div><dt>{t('artifactContentType')}</dt><dd>{asset.content.type}</dd></div><div><dt>{t('artifactMetadata')}</dt><dd>{asset.mapName}</dd></div></dl>{value(asset.creator,t('artifactCreator'),'creator')}{value(asset.owner,t('artifactOwner'),'owner')}<p className="hint">{t('artifactDataSource')}</p></section></details>
    <details className="artifact-proof"><summary>{t('artifactProof')}</summary><div className="artifact-proof-body">{value(asset.id,'Inscription ID','inscription')}{value(asset.ordinal,t('artifactOrdinal'),'ordinal')}{value(asset.origin,'Origin','origin')}{value(asset.outpoint,'Current Outpoint','outpoint')}{value(location.origin+location.pathname+'#/artifact/'+encodeURIComponent(asset.id),t('artifactLink'),'artifact-link')}{asset.transactions.map((record,index)=><section className="artifact-transaction" key={record.txid+index}><h3>{t('artifactKind-'+record.kind)}</h3>{value(record.txid,t('publishSampleTx'),'tx-'+index)}<IdentitySignatureProof bapId={record.bapId} signer={record.signer} signature={record.signature} keyEpoch={record.keyEpoch} t={t} failCopy={failCopy}/><p>{record.confirmations} {t('artifactConfirmations')}</p><p className="hint">{t('artifactDataSource')}</p></section>)}</div></details>
    {!!history.length&&<details className="artifact-proof"><summary>{t('artifactHistory')} · {history.length}</summary><div className="artifact-proof-body">{history.map(b=><div key={b.id}>{value(b.bapId,'BAP ID','history-'+b.id)}<p className="hint">{t('artifactFilter-history')}</p></div>)}</div></details>}
    {!identity&&<Button onClick={onBack}>{t('connect')}</Button>}
  </section>;
}
window.ArtifactDetail=ArtifactDetail;

function ArtifactPublicIdentity({bapId,t,failCopy,onBack}) {
  const [rotating,setRotating]=React.useState(false),[angle,setAngle]=React.useState(0),index=OwnwordModel.ids.indexOf(bapId);
  return <section className="artifact-page" data-artifact-screen="public-identity"><h1 tabIndex="-1">{t(index>=0?'publicIdentity':'artifactNotFound')}</h1>{index>=0&&<IdentityCard profile={OwnwordModel.fixtures[index]} id={bapId} t={t} failCopy={failCopy} transaction={OwnwordModel.transactions[index]} rotating={rotating} setRotating={setRotating} angle={angle} setAngle={setAngle}/>}<Button onClick={onBack}>{t('artifactBack')}</Button></section>;
}
window.ArtifactPublicIdentity=ArtifactPublicIdentity;
