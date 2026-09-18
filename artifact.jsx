function useArtifactStore() {
  const [data,setData]=React.useState(()=>OwnwordArtifactModel.recover(OwnwordArtifactModel.load()));
  const [settings,setSettings]=React.useState({list:'all',preview:'record',storage:'normal',outcome:'success',binding:'success',query:'accepted',account:'none'});
  const settingsRef=React.useRef(settings);settingsRef.current=settings;
  const dataRef=React.useRef(data);dataRef.current=data;
  const writer=useContentWriter(()=>{const latest=OwnwordArtifactModel.recover(OwnwordArtifactModel.load());dataRef.current=latest;setData(latest);},'ownword-v030-artifact-writer');
  function persist(next){if(!writer.canWrite.current||settingsRef.current.storage==='failure'||dataRef.current.readFailure)throw Error('artifactSaveFailed');const value={...next,revision:dataRef.current.revision+1};OwnwordArtifactModel.save(value);dataRef.current=value;setData(value);return value;}
  React.useEffect(()=>{const sync=e=>{if(e.key===OwnwordArtifactModel.KEY&&!writer.canWrite.current){const latest=OwnwordArtifactModel.recover(OwnwordArtifactModel.load());dataRef.current=latest;setData(latest);}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
  return {data,dataRef,setData,settings,settingsRef,setSettings,writer,persist};
}
const ArtifactWorkspace=React.forwardRef(function ArtifactWorkspace({active,identity,connected,locale,t,store,onConnect,onIdentity,failCopy,onAccountEvent},ref) {
  const M=OwnwordArtifactModel,{settings,setSettings}=store;
  const data={...store.data,assets:store.data.assets.map(a=>M.previewFixture(a,settings.preview))};
  const [route,setRoute]=React.useState(()=>M.parseRoute(location.hash));
  const operations=useArtifactOperations({store,identity,onAccountEvent});
  const [actionReview,setActionReview]=React.useState(null);
  React.useEffect(()=>setActionReview(null),[identity?.bapId]);
  const [filter,setFilter]=React.useState('all');
  const [loading,setLoading]=React.useState(true);
  const leaveHandler=React.useRef(null),lastHash=React.useRef(location.hash),routeRef=React.useRef(route);routeRef.current=route;
  const leave=action=>leaveHandler.current?leaveHandler.current(action):action();
  const go=(page,id='')=>leave(()=>{location.hash='/'+page+(id?'/'+encodeURIComponent(id):'');});
  React.useImperativeHandle(ref,()=>({go,leave}));
  const allowHash=React.useRef(false);
  React.useEffect(()=>{const change=event=>{
    const incoming=location.hash,isArtifact=/^#\/(artifacts|artifact(?:-[a-z]+)?|find|identity-view)(\/|$)/.test(incoming);
    if(incoming==='#main')return;
    if(!leaveHandler.current||allowHash.current){allowHash.current=false;if(isArtifact){lastHash.current=incoming;setRoute(M.parseRoute(incoming));}return;}
    event.stopImmediatePropagation();history.replaceState(null,'',lastHash.current);
    leave(()=>{history.replaceState(null,'',incoming);allowHash.current=true;window.dispatchEvent(new HashChangeEvent('hashchange'));});
  };window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  React.useEffect(()=>{setLoading(true);const timer=setTimeout(()=>setLoading(false),250);return()=>clearTimeout(timer);},[active,identity?.bapId,settings.list]);
  React.useEffect(()=>{if(active){window.scrollTo({top:0,behavior:'instant'});document.querySelector('[data-artifact-screen] h1')?.focus({preventScroll:true});}},[active,route.page,route.id]);
  function prepare(kind,assetId){const asset=store.dataRef.current.assets.find(a=>a.id===assetId);if(!asset||!identity)return;setActionReview({kind,bapId:identity.bapId,assetId,outpoint:asset.outpoint,bindingVersion:M.bindingVersion(store.dataRef.current,identity.bapId)});go('artifact-action');}
  function start(review){const op=operations.start(review);if(op)go('artifact-operation',op.id);}
  if(!active)return null;
  const header=(title,body)=><div className="page-heading"><p className="eyebrow">IDENTITY ARTIFACT</p><h1 tabIndex="-1">{t(title)}</h1><p>{t(body)}</p></div>;
  const gate=<section className="artifact-page" data-artifact-screen="gate">{header('artifactGate','artifactGateBody')}<div className="action-row"><Button variant="accent" onClick={connected?onIdentity:onConnect}>{t(connected?'complete':'connect')}</Button><Button onClick={onIdentity}>{t('myIdentity')}</Button><Button variant="quiet" onClick={()=>go('artifact',M.seed().assets[0].id)}>{t('artifactSample')}</Button></div></section>;
  if(!identity&&!['artifact','find','identity-view'].includes(route.page))return gate;
  const asset=data.assets.find(a=>a.id===route.id);
  if(identity&&['artifact-create','artifact-review','artifact-select','artifact-transfer'].includes(route.page)&&store.writer.state!=='ready')return <section className="artifact-page" data-artifact-screen="writer-gate"><h1 tabIndex="-1">{t('writerTitle-'+store.writer.state)}</h1><p>{t('writerBody-'+store.writer.state)}</p><Button onClick={store.writer.retry}>{t('retry')}</Button></section>;
  if(route.page==='artifact-operation'){const op=data.operations.find(o=>o.id===route.id&&o.bapId===identity?.bapId);return <ArtifactOperation op={op} data={data} t={t} failCopy={failCopy} operations={operations} onBind={id=>prepare('bind',id)} onReview={op=>op.kind==='create'?go('artifact-create'):prepare(op.kind,op.assetId)} onOpen={id=>go('artifact',id)} onBack={()=>go('artifacts')}/>;}
  if(route.page==='artifact-action')return <ArtifactActionReview review={actionReview?.bapId===identity?.bapId?actionReview:null} data={data} t={t} failCopy={failCopy} onSign={()=>start(actionReview)} onBack={()=>go('artifacts')} issue={operations.message}/>;
  if(['artifact-create','artifact-review'].includes(route.page))return <ArtifactComposer key={identity.bapId} identity={identity} store={store} t={t} failCopy={failCopy} go={go} reviewPage={route.page==='artifact-review'} setLeaveHandler={fn=>{leaveHandler.current=fn;}} operationIssue={operations.message} onReview={draft=>start({kind:'create',bapId:identity.bapId,draft:M.cleanDraft(draft)})}/>;
  if(route.page==='identity-view')return <ArtifactPublicIdentity bapId={route.id} t={t} failCopy={failCopy} onBack={()=>go('artifacts')}/>;
  if(route.page==='artifact')return <ArtifactDetail asset={asset} data={data} identity={identity} t={t} failCopy={failCopy} go={go} onBack={()=>identity?go('artifacts'):onConnect()} />;
  if(route.page!=='artifacts')return <section className="artifact-page" data-artifact-screen={route.page}>{header('artifactCreate','artifactCreateBody')}<Button onClick={()=>go('artifacts')}>{t('artifactBack')}</Button></section>;
  const owned=settings.list==='empty'?[]:data.assets.filter(a=>a.owner===M.ownerFor(identity.bapId)||data.bindings.some(b=>b.assetId===a.id&&b.bapId===identity.bapId));
  const assets=owned.filter(a=>filter==='all'||(filter==='usable'?!M.eligible(a,identity.bapId):data.bindings.some(b=>b.assetId===a.id&&b.bapId===identity.bapId&&b.state==='history')||!!M.eligible(a,identity.bapId)));
  return <section className="artifact-page" data-artifact-screen="list"><div className="artifact-heading">{header('myArtifacts','artifactIntro')}<div className="action-row"><Button onClick={()=>go('artifact-select')}>{t('artifactSelect')}</Button><Button variant="accent" data-action="artifact-create" onClick={()=>go('artifact-create')}>{t('artifactCreate')}</Button></div></div><div className="artifact-author"><Portrait profile={identity.profile}/><div><p className="eyebrow">{t('currentIdentity')}</p><strong>{identity.profile.name}</strong><code>{identity.bapId}</code></div></div>
    {data.operations.filter(o=>o.bapId===identity.bapId&&M.pending(o)).map(o=><div key={o.id} className="artifact-recovery" role="status"><p>{t('artifactUnknownBody')}</p><Button onClick={()=>go('artifact-operation',o.id)}>{t('artifactQueryOperation')}</Button></div>)}<div className="artifact-filters" aria-label={t('artifactFilter')}>{['all','usable','history'].map(f=><Button key={f} variant="quiet" aria-pressed={filter===f} onClick={()=>setFilter(f)}>{t('artifactFilter-'+f)}</Button>)}</div>
    {loading?<div role="status" className="artifact-loading"><S2.Skeleton/><p>{t('artifactLoading')}</p></div>:settings.list==='error'||data.readFailure?<div className="artifact-empty" role="alert"><h2>{t('artifactLoadError')}</h2><p>{t('artifactLoadErrorBody')}</p><Button onClick={()=>setSettings(s=>({...s,list:'all'}))}>{t('retry')}</Button></div>:assets.length?React.cloneElement(S2.CardView(),{className:'s2d-card-view artifact-grid'},assets.map(a=><ArtifactCard key={a.id} asset={a} data={data} bapId={identity.bapId} t={t} onOpen={id=>go('artifact',id)}/>)):<div className="artifact-empty"><BrandMark/><h2>{t('artifactEmpty')}</h2><p>{t('artifactOptionalBody')}</p><Button variant="accent" onClick={()=>go('artifact-create')}>{t('artifactCreate')}</Button></div>}<Button variant="quiet" onClick={onIdentity}>{t('backIdentity')}</Button></section>;
});
Object.assign(window,{useArtifactStore,ArtifactWorkspace});
