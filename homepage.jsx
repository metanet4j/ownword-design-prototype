const homepageWords = {
  en:{publicProfile:'Public profile',content:'Published work',following:'Following',followers:'Followers',invalid:'Check the BAP ID',invalidBody:'Use a complete BAP ID in this public link.',missing:'Identity not found',missingBody:'No public identity was found for this BAP ID.',profileError:'The identity could not be loaded.',contentError:'Published work could not be loaded.',relationshipError:'Relationships could not be verified.',retry:'Try again',empty:'No public work yet.',sample:'Explore a sample profile',loading:'Loading public profile…',back:'Back',prototype:'Homepage scenarios',normal:'Normal',failure:'Read failure',signature:'Identity signature',proofRecord:'Recorded result',proofUnverified:'Not verified',proofFailed:'Verification failed'},
  zh:{publicProfile:'公开个人主页',content:'公开作品',following:'关注',followers:'粉丝',invalid:'请检查 BAP ID',invalidBody:'公开链接需要完整、有效的 BAP ID。',missing:'未找到 Identity',missingBody:'没有找到此 BAP ID 对应的公开 Identity。',profileError:'身份资料暂时无法读取。',contentError:'公开作品暂时无法读取。',relationshipError:'关系暂时无法核实。',retry:'重试',empty:'尚未发表公开内容。',sample:'查看示例主页',loading:'正在读取公开主页…',back:'返回',prototype:'主页演练',normal:'正常',failure:'读取失败',signature:'身份签名',proofRecord:'记录中的结果',proofUnverified:'尚未验证',proofFailed:'验证失败'}
};
function HomepageWorkspace({active,identity,locale,t,settings,setSettings,failCopy}) {
  const M=OwnwordHomepageModel, h=key=>homepageWords[locale][key]||homepageWords.en[key]||t(key);
  const [route,setRoute]=React.useState(()=>M.parseRoute(location.hash));
  const [loading,setLoading]=React.useState(true);
  React.useEffect(()=>{const update=()=>setRoute(M.parseRoute(location.hash));window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
  React.useEffect(()=>{if(!active)return;setLoading(true);const timer=setTimeout(()=>setLoading(false),180);return()=>clearTimeout(timer);},[route.id,active]);
  const profile=M.resolveIdentity(route.id,identity,settings.profile);
  if(!active)return null;
  const go=(kind,id=route.id)=>openPublicRoute(kind==='identity'?'identity':kind==='content'?'content':'identity',kind==='following'||kind==='followers'?id+'/'+kind:id);
  // 列表路径中的分隔符单独拼接，标识仍按原值编码。
  const openList=kind=>{location.hash='/identity/'+encodeURIComponent(route.id)+'/'+kind;};
  if(loading)return <section className="homepage" aria-busy="true"><LoadingMark small label={h('loading')}/></section>;
  if(profile.status!=='ready')return <section className="homepage homepage-message" data-homepage-state={profile.status}><p className="eyebrow">{h('publicProfile')}</p><h1 tabIndex="-1">{h(profile.status==='error'?'profileError':profile.status==='invalid'?'invalid':'missing')}</h1><p>{profile.status==='error'?route.id:h(profile.status==='invalid'?'invalidBody':'missingBody')}</p>{profile.status==='error'?<Button onClick={()=>setSettings(s=>({...s,profile:'normal'}))}>{h('retry')}</Button>:<Button onClick={()=>go('identity',OwnwordModel.ids[0])}>{h('sample')}</Button>}</section>;
  const rows=M.records().filter(r=>r.authorBapId===route.id);
  return <section className="homepage" data-homepage-state="ready" data-homepage-id={route.id}>
    <Button variant="quiet" className="homepage-back" onClick={()=>returnFromPublic(()=>{location.hash='/find';})}><UiIcon name="ChevronLeft"/>{h('back')}</Button>
    <header className="homepage-summary"><Portrait profile={profile.profile} large/><div className="homepage-person"><p className="eyebrow">{t(profile.profile.type||'Person')}</p><h1 tabIndex="-1">{profile.profile.name||route.id}</h1>{profile.profile.bio&&<p className="bio">{profile.profile.bio}</p>}<Identifier id={route.id} t={t} failCopy={failCopy}/></div></header>
    <div className="homepage-relations" data-homepage-module="relationship">{settings.relationship==='failure'?<div role="alert"><p>{h('relationshipError')}</p><Button onClick={()=>setSettings(s=>({...s,relationship:'normal'}))}>{h('retry')}</Button></div>:['following','followers'].map(kind=><Button variant="quiet" key={kind} data-homepage-list={kind} onClick={()=>openList(kind)}><strong>{M.list(route.id,kind).length}</strong> {h(kind)}</Button>)}</div>
    {['following','followers'].includes(route.kind)?<section className="homepage-list"><h2>{h(route.kind)}</h2>{M.list(route.id,route.kind).map(id=><div key={id}><Button variant="quiet" onClick={()=>go('identity',id)}>{OwnwordModel.resolveIdentity(id)?.profile.name||id}</Button></div>)}</section>:<section data-homepage-module="content"><h2>{h('content')}</h2>{settings.content==='failure'?<div role="alert"><p>{h('contentError')}</p><Button onClick={()=>setSettings(s=>({...s,content:'normal'}))}>{h('retry')}</Button></div>:<div className="homepage-stream">{rows.length?rows.map(record=><article key={record.id}><h3>{OwnwordContentModel.title(record.content)||t('contentUntitled')}</h3><p>{OwnwordContentModel.summary(record.content).slice(0,180)}</p><time dateTime={record.publishedAt}>{new Date(record.publishedAt).toLocaleDateString(locale==='zh'?'zh-CN':'en-US')}</time></article>):<p>{h('empty')}</p>}</div>}</section>}
  </section>;
}
function HomepageSettings({settings,setSettings,locale}) {
  const h=key=>homepageWords[locale][key]||key;
  return <fieldset className="homepage-scenarios"><legend>{h('prototype')}</legend>{['profile','content','relationship'].map(key=><label key={key}>{h(key==='profile'?'publicProfile':key)}<select data-homepage-scenario={key} value={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))}><option value="normal">{h('normal')}</option><option value="failure">{h('failure')}</option></select></label>)}</fieldset>;
}
Object.assign(window,{HomepageWorkspace,HomepageSettings});
