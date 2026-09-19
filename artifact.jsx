const artifactDefaults=()=> ({list:'all',lookup:'normal',number:'record',ownership:'verified',preview:'record',storage:'normal',outcome:'success',binding:'success',query:'accepted',account:'none'});
function useArtifactStore(enabled=true) {
  const [data,setData]=React.useState(()=>OwnwordArtifactModel.recover(OwnwordArtifactModel.load()));
  const [settings,setSettings]=React.useState(artifactDefaults);
  const settingsRef=React.useRef(settings);settingsRef.current=settings;
  const dataRef=React.useRef(data);dataRef.current=data;
  const writer=useContentWriter(()=>{const latest=OwnwordArtifactModel.recover(OwnwordArtifactModel.load());dataRef.current=latest;setData(latest);},'ownword-v030-artifact-writer',enabled||data.operations.some(op=>['signing','validating','submitting'].includes(op.phase)));
  function persist(next){if(!writer.canWrite.current||settingsRef.current.storage==='failure'||dataRef.current.readFailure)throw Error('artifactSaveFailed');const value={...next,revision:dataRef.current.revision+1};OwnwordArtifactModel.save(value);dataRef.current=value;setData(value);return value;}
  React.useEffect(()=>{const sync=e=>{if(e.key===OwnwordArtifactModel.KEY&&!writer.canWrite.current){const latest=OwnwordArtifactModel.recover(OwnwordArtifactModel.load());dataRef.current=latest;setData(latest);}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
  function refreshNumber(id){const next={...dataRef.current,assets:dataRef.current.assets.map(a=>a.id===id?OwnwordArtifactModel.numberObservation(a,settingsRef.current.number):a)};persist(next);}
  function refreshOwnership(id){persist(OwnwordArtifactModel.reconcileOwnership(dataRef.current,id,settingsRef.current.ownership==='verified'));}
  function retryRead(){const latest=OwnwordArtifactModel.recover(OwnwordArtifactModel.load());dataRef.current=latest;setData(latest);}
  async function resetDemo(){if(!writer.canWrite.current||settingsRef.current.storage==='failure')throw Error('artifactSaveFailed');const next={...OwnwordArtifactModel.seed(),revision:dataRef.current.revision+1};OwnwordArtifactModel.save(next);dataRef.current=next;setData(next);try{await ArtifactImages.access('readwrite',null);setSettings(artifactDefaults());}catch{throw Error('artifactResetImagesFailed');}}
  return {retryRead,resetDemo,refreshOwnership,refreshNumber,data,dataRef,setData,settings,settingsRef,setSettings,writer,persist};
}
const ArtifactWorkspace=React.forwardRef(function ArtifactWorkspace({active,identity,resolveIdentity,connected,locale,t,store,onConnect,onIdentity,failCopy,onAccountEvent},ref) {
  const M=OwnwordArtifactModel,{settings,setSettings}=store;
  const data={...store.data,assets:store.data.assets.map(a=>M.previewFixture(a,settings.preview))};
  const [route,setRoute]=React.useState(()=>M.parseRoute(location.hash));
  const operations=useArtifactOperations({store,identity,onAccountEvent});
  const [actionReview,setActionReview]=React.useState(null);
  React.useEffect(()=>setActionReview(null),[identity?.bapId]);
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
  function prepare(kind,assetId){const asset=store.dataRef.current.assets.find(a=>a.id===assetId);if(!asset||!identity)return;setActionReview({kind,returnTo:{page:route.page,id:route.id},bapId:identity.bapId,assetId,assetSnapshot:JSON.parse(JSON.stringify(asset)),outpoint:asset.outpoint,bindingVersion:M.bindingVersion(store.dataRef.current,identity.bapId)});go('artifact-action');}
  function start(review){const op=operations.start(review);if(op)go('artifact-operation',op.id);}
  if(!active)return null;
  const header=(title,body)=><div className="page-heading"><h1 tabIndex="-1">{t(title)}</h1><p>{t(body)}</p></div>;
  const gate=<section className="artifact-page" data-artifact-screen="gate">{header('artifactGate','artifactGateBody')}<div className="action-row"><Button variant="accent" onClick={connected?onIdentity:onConnect}>{t(connected?'complete':'connect')}</Button><Button onClick={onIdentity}>{t('myIdentity')}</Button><Button variant="quiet" onClick={()=>go('artifact',M.seed().assets[0].id)}>{t('artifactSample')}</Button></div></section>;
  if(!identity&&!['artifact','find','identity-view'].includes(route.page))return gate;
  const asset=data.assets.find(a=>a.id===route.id);
  if(identity&&['artifact-create','artifact-review','artifact-select','artifact-transfer','artifact-action','artifact-operation'].includes(route.page)&&store.writer.state!=='ready')return <section className="artifact-page" data-artifact-screen="writer-gate"><ArtifactBack t={t} onClick={()=>go('artifacts')}/><h1 tabIndex="-1">{t('artifactWriterTitle-'+store.writer.state)}</h1><p>{t('artifactWriterBody-'+store.writer.state)}</p><Button onClick={store.writer.retry}>{t('retry')}</Button></section>;
  if(route.page==='find')return <ArtifactFind resolveIdentity={resolveIdentity} store={store} t={t} failCopy={failCopy} go={go}/>;
  if(route.page==='artifact-transfer')return <ArtifactTransfer key={identity.bapId+route.id} asset={asset} initialRecipient={actionReview?.kind==='transfer'&&actionReview.assetId===route.id?actionReview.recipient:''} identity={identity} store={store} t={t} failCopy={failCopy} onReview={review=>{setActionReview({...review,returnTo:{page:'artifact-transfer',id:route.id}});go('artifact-action');}} onBack={()=>go('artifact',route.id)}/>;
  if(route.page==='artifact-select')return <ArtifactSelector data={data} identity={identity} t={t} onSelect={id=>prepare('bind',id)} onOpen={id=>go('artifact',id)} onBack={()=>go('artifacts')}/>;
  if(route.page==='artifact-operation'){const op=data.operations.find(o=>o.id===route.id&&o.bapId===identity?.bapId);return <ArtifactOperation op={op} data={data} t={t} failCopy={failCopy} operations={operations} onBind={id=>prepare('bind',id)} onReview={op=>op.kind==='create'?go('artifact-create'):op.kind==='transfer'?go('artifact-transfer',op.assetId):prepare(op.kind,op.assetId)} onVerify={id=>store.refreshOwnership(id)} onOpen={id=>go('artifact',id)} onBack={()=>go('artifacts')}/>;}
  if(route.page==='artifact-action')return <ArtifactActionReview review={actionReview?.bapId===identity?.bapId?actionReview:null} data={data} t={t} failCopy={failCopy} onSign={()=>start(actionReview)} onBack={()=>actionReview?.returnTo?go(actionReview.returnTo.page,actionReview.returnTo.id):go('artifacts')} issue={operations.message}/>;
  if(['artifact-create','artifact-review'].includes(route.page))return <ArtifactComposer key={identity.bapId} identity={identity} store={store} t={t} failCopy={failCopy} go={go} reviewPage={route.page==='artifact-review'} setLeaveHandler={fn=>{leaveHandler.current=fn;}} operationIssue={operations.message} onReview={draft=>start({kind:'create',bapId:identity.bapId,draft:M.cleanDraft(draft)})}/>;
  if(route.page==='identity-view')return <ArtifactPublicIdentity resolveIdentity={resolveIdentity} bapId={route.id} t={t} failCopy={failCopy} onBack={()=>go('artifacts')}/>;
  if(route.page==='artifact')return <ArtifactDetail resolveIdentity={resolveIdentity} asset={asset} data={data} identity={identity} t={t} failCopy={failCopy} go={go} onBack={()=>identity?go('artifacts'):onConnect()} onRefresh={()=>store.refreshNumber(asset.id)} onTransfer={()=>go('artifact-transfer',asset.id)} onBind={()=>prepare('bind',asset.id)} onVerify={()=>store.refreshOwnership(asset.id)}><ArtifactAssociationNotice data={data} bapId={identity?.bapId} assetId={asset?.id} t={t} store={store} onReplace={()=>go('artifact-select')} onRemove={id=>prepare('remove',id)}/></ArtifactDetail>;
  if(route.page!=='artifacts')return <section className="artifact-page" data-artifact-screen={route.page}>{header('artifactCreate','artifactCreateBody')}<Button onClick={()=>go('artifacts')}>{t('artifactBack')}</Button></section>;
  const inventory=settings.list==='empty'?{...data,assets:[],bindings:[]}:data;
  const hasInventory=M.selectionAssets(inventory,identity.bapId).length||inventory.bindings.some(b=>b.bapId===identity.bapId);
  return <section className="artifact-page" data-artifact-screen="list">
    <div className="artifact-heading"><div className="page-heading"><h1 tabIndex="-1">{t('myArtifacts')}</h1></div>{hasInventory>0&&<Button data-action="artifact-create" onClick={()=>go('artifact-create')}><UiIcon name="Add"/>{t('artifactCreate')}</Button>}</div>
    <ArtifactAssociationNotice data={data} bapId={identity.bapId} t={t} store={store} onReplace={()=>go('artifact-select')} onRemove={id=>prepare('remove',id)}/>
    {data.operations.filter(o=>o.bapId===identity.bapId&&M.pending(o)).map(o=><div key={o.id} className="artifact-recovery" role="status"><p>{t('artifactUnknownBody')}</p><Button onClick={()=>go('artifact-operation',o.id)}>{t('artifactQueryOperation')}</Button></div>)}
    {loading?<div role="status" className="artifact-loading"><S2.Skeleton/><p>{t('artifactLoading')}</p></div>:settings.list==='error'||data.readFailure?<div className="artifact-empty" role="alert"><h2>{t('artifactLoadError')}</h2><p>{t('artifactLoadErrorBody')}</p><Button onClick={()=>{store.retryRead();setSettings(s=>({...s,list:'all'}));}}>{t('retry')}</Button></div>:<ArtifactInventory data={inventory} identity={identity} t={t} onSelect={id=>prepare('bind',id)} onOpen={id=>go('artifact',id)} onCreate={()=>go('artifact-create')}/>}
  </section>;
});
Object.assign(window,{useArtifactStore,ArtifactWorkspace});
