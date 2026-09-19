function ArtifactFind({store,resolveIdentity,t,failCopy,go}) {
  const [input,setInput]=React.useState(''),[request,setRequest]=React.useState(null),[result,setResult]=React.useState({status:'idle'}),sequence=React.useRef(0),M=OwnwordArtifactModel;
  function edit(value){sequence.current++;setInput(value);setRequest(null);setResult({status:'idle'});}
  function search(value=input){setRequest({value,id:++sequence.current});}
  React.useEffect(()=>{
    if(!request)return;
    const ticket=++sequence.current,parsed=M.parseLookup(request.value);let second;
    if(parsed.kind==='invalid'){setResult({status:'invalid',issue:parsed.issue});return;}
    setResult({status:'asset'});
    const first=setTimeout(()=>{if(ticket!==sequence.current)return;setResult({status:'binding'});second=setTimeout(()=>{if(ticket===sequence.current)setResult(M.lookup(store.dataRef.current,parsed,store.settingsRef.current.lookup));},400);},400);
    return()=>{clearTimeout(first);clearTimeout(second);};
  },[request,store.settings.lookup,store.data.revision]);
  const asset=store.data.assets.find(a=>a.id===result.assetId),bapId=result.bapId,profile=resolveIdentity(bapId)?.profile;
  const busy=['asset','binding'].includes(result.status),invalid=result.status==='invalid';
  return <section className="artifact-page artifact-find" data-artifact-screen="find" data-lookup-state={result.status}>
    <header className="artifact-find-heading"><h1 className="task-title" tabIndex="-1">{t('artifactFindTitle')}</h1><p>{t('artifactFindIntro')}</p></header>
    <form className="artifact-search-form" role="search" aria-label={t('artifactFindTitle')} noValidate onSubmit={e=>{e.preventDefault();search();}}>
      <div className="artifact-query-field"><Field id="artifact-query" label={t('artifactFindLabel')} value={input} onChange={edit} autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search" aria-describedby="artifact-query-hint" error={invalid?t(result.issue):''} errorKey={result.issue}/><p id="artifact-query-hint" className="hint">{t('artifactFindHint')}</p></div>
      <Button type="submit" variant="accent" data-action="artifact-find-submit" disabled={busy}>{t('artifactFindSubmit')}</Button>
    </form>
    {busy&&<div className="artifact-find-progress" role="status"><LoadingMark small/><p>{t('artifactFind-'+result.status)}</p></div>}
    {['not-found','error','unverified'].includes(result.status)&&<div className="artifact-find-message" role={result.status==='error'?'alert':'status'}><p>{t('artifactFind-'+result.status)}</p>{['error','unverified'].includes(result.status)&&<Button onClick={()=>search()}>{t('retry')}</Button>}</div>}
    {(result.status==='identity'||result.status==='found'&&asset)&&<div className="artifact-find-result" data-found-artifact={asset?.id}>
      {profile&&<section className="artifact-find-person" aria-labelledby="artifact-result-name"><div className="artifact-find-person-heading"><Portrait profile={profile}/><div><p className="eyebrow">{t(result.status==='identity'?'publicIdentity':'artifactAssociatedTitle')}</p><h2 id="artifact-result-name">{profile.name}</h2></div></div><Identifier id={bapId} t={t} failCopy={failCopy}/><Button variant="accent" data-action="find-open-identity" onClick={()=>go('identity-view',bapId)}>{t('viewPublicIdentity')}<UiIcon name="ChevronRight"/></Button></section>}
      {result.status==='found'&&asset&&<section className="artifact-find-asset" aria-label={asset.name}><div className="artifact-find-asset-facts"><NumberStatus asset={asset} t={t} compact copyable failCopy={failCopy}/><div className="artifact-find-asset-summary"><h2>{asset.name}</h2>{!bapId&&<p className="hint" data-no-association>{t(result.associationState==='none'?'artifactFind-unassociated':'artifactBinding-'+result.associationState)}</p>}<Button onClick={()=>go('artifact',asset.id)}>{t('artifactView')}</Button></div></div>{M.previewFixture(asset,store.settings.preview).content.kind!=='brand'&&<ArtifactArt asset={M.previewFixture(asset,store.settings.preview)} t={t}/>}</section>}
    </div>}
  </section>;
}
window.ArtifactFind=ArtifactFind;
