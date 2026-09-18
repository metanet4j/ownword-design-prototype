const ArtifactImages={
  async access(mode,key,value) {
    const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('ownword-artifact-v030-images',1);req.onupgradeneeded=()=>req.result.createObjectStore('images');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
    try{return await new Promise((resolve,reject)=>{const tx=db.transaction('images',mode),store=tx.objectStore('images');const req=mode==='readonly'?store.get(key):key===null?store.clear():store.put(value,key);tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
  },
  async validate(file) {
    if(file.size>2097152)throw Error('artifactImageSize');
    if(!['image/png','image/jpeg'].includes(file.type))throw Error('artifactImageType');
    const bytes=new Uint8Array(await file.arrayBuffer());
    if(!OwnwordArtifactModel.validImageHeader(bytes,file.type))throw Error('artifactImageType');
    try{const image=await createImageBitmap(file);if(!image.width||!image.height)throw Error();image.close();}catch{throw Error('artifactImageDecode');}
    return {kind:'upload',type:file.type,fileName:file.name,blobId:crypto.randomUUID(),blob:file};
  }
};
function useArtifactImage(content) {
  const [src,setSrc]=React.useState(''),[failed,setFailed]=React.useState(false);
  React.useEffect(()=>{let cancelled=false,url;setSrc('');setFailed(false);if(content?.kind!=='upload')return;
    (async()=>{const blob=content.blob||await ArtifactImages.access('readonly',content.blobId);if(!blob)throw Error();await ArtifactImages.validate(blob);if(cancelled)return;url=URL.createObjectURL(blob);setSrc(url);})().catch(()=>{if(!cancelled)setFailed(true);});
    return()=>{cancelled=true;if(url)URL.revokeObjectURL(url);};
  },[content?.blobId,content?.blob]);
  return {src,failed};
}
function ArtifactComposer({identity,store,t,failCopy,go,reviewPage,setLeaveHandler,onReview,operationIssue}) {
  const M=OwnwordArtifactModel;
  const initial=()=>store.dataRef.current.drafts[identity.bapId]||{name:identity.profile.name+' Artifact',content:{kind:'brand',type:'image/svg+xml'}};
  const [draft,setDraft]=React.useState(initial),saved=React.useRef(JSON.stringify(initial()));
  const [validationShown,setValidationShown]=React.useState(false);
  const [issue,setIssue]=React.useState(''),[saveState,setSaveState]=React.useState(''),[leave,setLeave]=React.useState(null),[snapshot,setSnapshot]=React.useState(null);
  const draftRef=React.useRef(draft),authorRef=React.useRef(identity.bapId),upload=React.useRef(null),busy=React.useRef(false);
  draftRef.current=draft;
  const digest=d=>JSON.stringify({name:d.name,content:{...d.content,blob:undefined}});
  const dirty=()=>digest(draftRef.current)!==saved.current;
  React.useEffect(()=>{saved.current=digest(initial());return()=>{authorRef.current=null;};},[]);
  React.useEffect(()=>{setLeaveHandler(action=>{if(dirty())setLeave({action});else action();});return()=>setLeaveHandler(null);},[]);
  React.useEffect(()=>{const block=e=>{if(dirty()){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',block);return()=>window.removeEventListener('beforeunload',block);},[]);
  function change(value){setSnapshot(null);setDraft(value);setSaveState('artifactUnsaved');setIssue('');}
  async function saveDraft() {
    if(busy.current)return false;busy.current=true;setSaveState('artifactSaving');
    const value=draftRef.current,author=identity.bapId;
    try {
      if(!store.writer.canWrite.current||store.settingsRef.current.storage==='failure')throw Error('storage');
      if(value.content.blob)await ArtifactImages.access('readwrite',value.content.blobId,value.content.blob);
      if(authorRef.current!==author||draftRef.current!==value)return false;
      const safe={...value,content:{...value.content}};delete safe.content.blob;
      store.persist({...store.dataRef.current,drafts:{...store.dataRef.current.drafts,[author]:safe}});
      saved.current=digest(value);setSaveState('artifactSaved');console.info('[Ownword artifact] draft saved',{bapId:author});return true;
    }catch{setSaveState('artifactSaveFailed');console.warn('[Ownword artifact] draft save failed',{bapId:author});return false;}finally{busy.current=false;}
  }
  async function choose(event) {
    const file=event.target.files[0];event.target.value='';if(!file)return;
    try {const content=await ArtifactImages.validate(file);if(authorRef.current===identity.bapId)change({...draftRef.current,content});}
    catch(error){setIssue(['artifactImageSize','artifactImageType','artifactImageDecode'].includes(error.message)?error.message:'artifactImageDecode');}
  }
  async function review() {
    setValidationShown(true);const error=M.validateDraft(draft);setIssue(error);if(error){if(error==='artifactNameError')document.getElementById('artifact-name')?.focus();return;}
    if(await saveDraft()){setSnapshot({...draftRef.current,bapId:identity.bapId});go('artifact-review');}
  }
  const current=M.current(store.data,identity.bapId),old=store.data.assets.find(a=>a.id===current?.assetId);
  if(reviewPage)return <section className="artifact-page" data-artifact-screen="review">{snapshot?<><div className="page-heading"><p className="eyebrow">{t('review')}</p><h1 tabIndex="-1">{t('artifactReview')}</h1><p>{t('artifactReviewBody')}</p></div><div className="artifact-compose-grid"><ArtifactArt asset={snapshot} large t={t}/><div className="artifact-review-copy"><h2>{snapshot.name}</h2><Identifier id={snapshot.bapId} t={t} failCopy={failCopy}/><p>{t('numberPending')}</p><p>{t('artifactDefaultBinding')}</p>{old&&<p className="hint">{t('artifactOldCurrent')} {old.name}</p>}<p className="hint">{t('artifactNoFees')}</p>{operationIssue&&<p className="field-error" role="alert">{t(operationIssue)}</p>}<div className="action-row"><Button onClick={()=>{setSnapshot(null);go('artifact-create');}}>{t('artifactEdit')}</Button>{onReview&&<Button variant="accent" onClick={()=>onReview(snapshot)}>{t('artifactSignCreate')}</Button>}</div></div></div></>:<><h1 tabIndex="-1">{t('reviewExpired')}</h1><Button onClick={()=>go('artifact-create')}>{t('artifactEdit')}</Button></>}</section>;
  return <section className="artifact-page" data-artifact-screen="create"><div className="page-heading"><p className="eyebrow">IDENTITY ARTIFACT</p><h1 tabIndex="-1">{t('artifactCreate')}</h1><p>{t('artifactCreateBody')}</p></div><div className={'artifact-compose-grid'+(draft.content.kind==='brand'?' artifact-compose-default':'')}>{draft.content.kind!=='brand'&&<div className="artifact-preview"><ArtifactArt asset={draft} large t={t}/><p className="hint">{t('artifactNumberOutside')}</p></div>}<form className="artifact-form" noValidate onSubmit={e=>{e.preventDefault();review();}}><div className="artifact-source"><p className="field-label">{t('artifactContent')}</p><div className="action-row"><Button aria-pressed={draft.content.kind==='brand'} onClick={()=>change({...draft,content:{kind:'brand',type:'image/svg+xml'}})}>{t('artifactBuiltIn')}</Button>{React.cloneElement(S2.FileTrigger({children:t('artifactUpload'),onPress:()=>upload.current.click()}),{'data-action':'artifact-upload'})}</div><input ref={upload} type="file" accept="image/png,image/jpeg" hidden onChange={choose} aria-label={t('artifactUpload')}/><p className="hint">{t('artifactImageHint')}</p>{draft.content.fileName&&<p className="hint">{draft.content.fileName}</p>}</div><Field id="artifact-name" label={t('artifactName')} value={draft.name} required onChange={name=>change({...draft,name})} error={validationShown&&M.validateDraft(draft)==='artifactNameError'?t('artifactNameError'):''}/><p className="hint">{[...draft.name.trim()].length}/100</p><Identifier id={identity.bapId} t={t} failCopy={failCopy}/>{issue&&issue!=='artifactNameError'&&<p className="field-error" role="alert">{t(issue)}</p>}<p role="status" data-artifact-save={saveState}>{saveState?t(saveState):''}</p><div className="action-row"><Button onClick={saveDraft}>{t('artifactSave')}</Button><Button variant="accent" type="submit">{t('artifactCheckCreate')}</Button></div><Button variant="quiet" onClick={()=>go('artifacts')}>{t('artifactBack')}</Button></form></div>{leave&&<Modal title={t('artifactLeave')} closeLabel={t('cancel')} onCancel={()=>setLeave(null)}><p>{t('artifactLeaveBody')}</p><div className="action-row"><Button onClick={()=>setLeave(null)}>{t('keepEditing')}</Button><Button variant="accent" onClick={async()=>{if(await saveDraft()){const action=leave.action;setLeave(null);action();}}}>{t('artifactSaveLeave')}</Button><Button variant="negative" onClick={()=>{const action=leave.action;setLeave(null);setLeaveHandler(null);saved.current=digest(draftRef.current);action();}}>{t('discard')}</Button></div>{saveState==='artifactSaveFailed'&&<p role="alert" className="field-error">{t(saveState)}</p>}</Modal>}</section>;
}
Object.assign(window,{ArtifactImages,useArtifactImage,ArtifactComposer});
