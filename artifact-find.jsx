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
  return <section className="artifact-page artifact-find" data-artifact-screen="find" data-lookup-state={result.status}><div className="page-heading"><h1 tabIndex="-1">{t('artifactFindTitle')}</h1></div><form className="artifact-search-form" onSubmit={e=>{e.preventDefault();search();}}><Field id="artifact-query" label={t('artifactFindLabel')} value={input} onChange={edit}/><Button type="submit" variant="accent" data-action="artifact-find-submit">{t('artifactFindSubmit')}</Button></form><p className="hint">{t('artifactFindHint')}</p><div className="artifact-samples"><Button variant="quiet" data-find-sample="165" onClick={()=>{edit('165');search('165');}}>{t('artifactFindSample')} 165</Button></div>
    {['asset','binding'].includes(result.status)&&<div role="status"><LoadingMark label={t('artifactFind-'+result.status)}/></div>}
    {['invalid','not-found','error','unverified'].includes(result.status)&&<div className="artifact-find-message" role={result.status==='invalid'||result.status==='error'?'alert':'status'}><h2>{t(result.issue||'artifactFind-'+result.status)}</h2>{['error','unverified'].includes(result.status)&&<Button onClick={()=>search()}>{t('retry')}</Button>}</div>}
    {result.status==='found'&&asset&&<div className="artifact-find-result" data-found-artifact={asset.id}><div><NumberStatus asset={asset} t={t} copyable failCopy={failCopy}/><h2>{asset.name}</h2>{bapId?<><p className="eyebrow">{t('artifactAssociatedTitle')}</p><h3>{profile?.name}</h3><Identifier id={bapId} t={t} failCopy={failCopy}/><Button data-action="find-open-identity" onClick={()=>go('identity-view',bapId)}>{t('artifactOpenIdentity')}</Button></>:<p data-no-association>{t(result.associationState==='none'?'artifactFind-unassociated':'artifactBinding-'+result.associationState)}</p>}<Button onClick={()=>go('artifact',asset.id)}>{t('artifactView')}</Button></div>{M.previewFixture(asset,store.settings.preview).content.kind!=='brand'&&<ArtifactArt asset={M.previewFixture(asset,store.settings.preview)} t={t}/>}</div>}
    {result.status==='identity'&&<div className="artifact-find-message"><Portrait profile={profile}/><h2>{profile.name}</h2><Identifier id={bapId} t={t} failCopy={failCopy}/><Button onClick={()=>go('identity-view',bapId)}>{t('publicIdentity')}</Button></div>}
  </section>;
}
window.ArtifactFind=ArtifactFind;
