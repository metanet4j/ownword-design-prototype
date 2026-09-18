function ArtifactArt({asset,large=false,t}) {
  return <div className={'artifact-art '+(large?'large':'')}><div className="artifact-vault" aria-hidden="true">{[0,1,2,3,4,5,6].map(n=><span key={n} style={{'--curve':n}} />)}</div><img src="brand/ownword-mark.svg" alt="" /><p>{t('artifactArtCaption')}</p></div>;
}
function NumberStatus({asset,t,compact=false}) {
  const known=asset.number&&asset.numberCheck==='verified';
  return <div className={'artifact-number '+(compact?'compact':'')} data-number-status={known?(asset.confirmations>=6?'stable':'assigned'):'pending'}><p className="eyebrow">{t('digitalId')}</p><strong>{known?'#'+asset.number:'—'}</strong><S2.StatusLight label={t(known?(asset.confirmations>=6?'numberStable':'numberAssigned'):'numberPending')} />{known&&asset.confirmations<6&&<p className="hint">{asset.confirmations}/6 {t('artifactConfirmations')}</p>}</div>;
}
function ArtifactSummary({data,bapId,t,onManage,onOpen}) {
  const b=OwnwordArtifactModel.current(data,bapId),asset=data.assets.find(a=>a.id===b?.assetId);
  return <section className="artifact-summary" aria-label={t('digitalId')}><div>{asset?<NumberStatus asset={asset} t={t} compact/>:<><p className="eyebrow">{t('digitalId')}</p><h3>{t('artifactOptional')}</h3><p className="hint">{t('artifactOptionalBody')}</p></>}</div><div className="action-row">{asset&&<Button onClick={()=>onOpen(asset.id)}>{t('artifactView')}</Button>}<Button onClick={onManage}>{t('artifactManage')}</Button></div></section>;
}
function ArtifactCard({asset,data,bapId,t,onOpen}) {
  const b=OwnwordArtifactModel.binding(data,asset.id),isCurrent=b?.bapId===bapId;
  return React.cloneElement(S2.Card(), {className:"s2d-card artifact-card","data-artifact-id":asset.id}, <><ArtifactArt asset={asset} t={t}/><div className="artifact-card-content"><div className="artifact-card-top"><NumberStatus asset={asset} t={t} compact/>{isCurrent&&<span className="artifact-current">Current</span>}</div><h2>{asset.name}</h2><p className="hint">{t(b?(isCurrent?'artifactYourCurrent':'artifactAssociated'):'artifactNoBinding')}</p><Button onClick={()=>onOpen(asset.id)} aria-label={t('artifactView')+' · '+asset.name}>{t('artifactView')}</Button></div></>);
}
function ArtifactSettings({settings,setSettings,t}) {
  return <fieldset className="artifact-settings"><legend>{t('artifactLab')}</legend><label>{t('artifactInventory')}<select data-artifact-scenario="list" value={settings.list} onChange={e=>setSettings(s=>({...s,list:e.target.value}))}>{['all','empty','error'].map(v=><option key={v} value={v}>{t('artifactList-'+v)}</option>)}</select></label></fieldset>;
}
Object.assign(window,{ArtifactArt,NumberStatus,ArtifactSummary,ArtifactCard,ArtifactSettings});
