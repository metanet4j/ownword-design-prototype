function ContentReader({record,t,locale,identity,go,onExport,failCopy,records,drafts,onRevision,settings,operations}) {
  const [feedback,setFeedback]=React.useState('');
  React.useEffect(()=>setFeedback(''),[record?.id]);
  async function copyLink() {
    try {if(failCopy)throw new Error('Simulated clipboard failure');await navigator.clipboard.writeText(location.origin+location.pathname+'#/read/'+encodeURIComponent(record.id));setFeedback('copied');} catch {setFeedback('copyFailed');}
  }
  if (!record) return <section className="content-missing" data-content-screen="read"><p className="eyebrow">{t('readerPublic')}</p><h1 tabIndex="-1">{t('readerMissing')}</h1><p>{t('readerMissingBody')}</p><Button data-action="reader-sample" onClick={()=>go('read','first-words')}>{t('contentReadSample')}</Button></section>;
  const history=OwnwordContentModel.versions(records,record), latest=history[0];
  const revision=drafts.find(d=>d.baseContentId===record.id && d.authorBapId===identity?.bapId);
  const time=new Intl.DateTimeFormat(locale==='zh'?'zh-CN':'en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(record.publishedAt));
  return <section className="content-reader" data-content-screen="read" data-record-id={record.id}>
    <div className="reader-toolbar"><Button variant="quiet" onClick={()=>go('content')}>{t(identity ? 'contentBack' : 'myContent')}</Button><div><Button data-action="reader-copy-link" onClick={copyLink}>{t('readerCopyLink')}</Button><Button data-action="reader-export" onClick={()=>onExport(record)}>{t('markdownExport')}</Button></div></div>
    {feedback && <p role="status" className="reader-feedback" data-reader-copy={feedback}>{t(feedback)}</p>}
    <div className="reader-byline"><Portrait profile={record.author} /><div><strong>{record.author.name}</strong><span><time dateTime={record.publishedAt}>{time}</time><span aria-hidden="true"> · </span>{t('readerVersion')} {record.revisionNo}</span></div></div>
    <div className="reader-version-bar"><Button variant="quiet" data-action="reader-history" onClick={()=>go("history",record.id)}>{t("versionHistory")} · {history.length}</Button>{latest.id!==record.id ? <><span>{t("versionHistorical")}</span><Button data-action="reader-latest" onClick={()=>go("read",latest.id)}>{t("versionLatest")}</Button></> : identity?.bapId===record.authorBapId && <Button data-action="reader-revise" onClick={()=>onRevision(record)}>{t(revision ? "revisionContinue" : "revisionCreate")}</Button>}</div><article className="reader-paper">{!OwnwordContentModel.title(record.content) && <h1 tabIndex="-1">{t('contentUntitled')}</h1>}<MarkdownBody source={record.content} t={t} /></article>
    <ContentProof key={record.id} record={record} settings={settings} operations={operations} t={t} failCopy={failCopy} /><p className="reader-local-note">{t('readerLocalScope')}</p>
  </section>;
}
function ContentHistory({record,records,go,t,locale}) {
  if (!record) return <ContentReader record={null} t={t} go={go} />;
  const items=OwnwordContentModel.versions(records,record);
  return <section className="content-history" data-content-screen="history"><Button variant="quiet" onClick={()=>go('read',record.id)}>{t('historyBack')}</Button><div className="page-heading"><p className="eyebrow">{OwnwordContentModel.title(record.content) || t('contentUntitled')}</p><h1 tabIndex="-1">{t('versionHistory')}</h1><p>{t('versionHistoryBody')}</p></div><ol className="version-list">{items.map((item,index)=><li key={item.id}><div><span className="eyebrow">{t('readerVersion')} {item.revisionNo}{index===0 ? ' · '+t('versionCurrent') : ''}</span><h2>{OwnwordContentModel.title(item.content) || t('contentUntitled')}</h2><time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleString(locale==='zh' ? 'zh-CN' : 'en-US')}</time></div><Button data-version-id={item.id} onClick={()=>go('read',item.id)}>{t('contentRead')}</Button></li>)}</ol></section>;
}
function ContentProof({record,settings,operations,t,failCopy}) {
  const proof=OwnwordContentModel.proofResult(record,settings.proof,operations);
  const confirmation=settings.proofConfirmation==='record' ? record.confirmation : settings.proofConfirmation;
  return <details className="content-proof" data-content-proof><summary>{t('proofSummary')}</summary><div className="proof-body"><p className="proof-sample-note">{t('proofSimulation')}</p><dl className="proof-facts"><div><dt>{t('proofSignature')}</dt><dd data-proof-state={proof}>{t('proof-'+proof)}</dd></div><div><dt>{t('proofConfirmation')}</dt><dd data-proof-confirmation={confirmation}>{t(confirmation==='confirmed'?'confirmed':'pendingConfirmation')}</dd></div><div><dt>{t('proofSource')}</dt><dd>{t(record.operationId ? 'proofLocalSource' : 'proofFixtureSource')}</dd></div></dl>{proof==='failed' && <p className="field-error" role="alert">{t('proofFailedBody')}</p>}{proof==='unverified' && <p className="hint">{t('proofUnverifiedBody')}</p>}<Identifier id={record.authorBapId} t={t} failCopy={failCopy} /><Identifier id={record.txid} label={t('publishSampleTx')} copyLabel="copyTx" target="proof-tx" t={t} failCopy={failCopy} /></div></details>;
}
Object.assign(window,{ContentReader,ContentHistory,ContentProof});
