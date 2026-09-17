function ContentReader({record,t,locale,identity,go,onExport,failCopy}) {
  const [feedback,setFeedback]=React.useState('');
  React.useEffect(()=>setFeedback(''),[record?.id]);
  async function copyLink() {
    try {if(failCopy)throw new Error('Simulated clipboard failure');await navigator.clipboard.writeText(location.origin+location.pathname+'#/read/'+encodeURIComponent(record.id));setFeedback('copied');} catch {setFeedback('copyFailed');}
  }
  if (!record) return <section className="content-missing" data-content-screen="read"><p className="eyebrow">{t('readerPublic')}</p><h1 tabIndex="-1">{t('readerMissing')}</h1><p>{t('readerMissingBody')}</p><Button data-action="reader-sample" onClick={()=>go('read','first-words')}>{t('contentReadSample')}</Button></section>;
  const time=new Intl.DateTimeFormat(locale==='zh'?'zh-CN':'en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(record.publishedAt));
  return <section className="content-reader" data-content-screen="read" data-record-id={record.id}>
    <div className="reader-toolbar"><Button variant="quiet" onClick={()=>go('content')}>{t(identity ? 'contentBack' : 'myContent')}</Button><div><Button data-action="reader-copy-link" onClick={copyLink}>{t('readerCopyLink')}</Button><Button data-action="reader-export" onClick={()=>onExport(record)}>{t('markdownExport')}</Button></div></div>
    {feedback && <p role="status" className="reader-feedback" data-reader-copy={feedback}>{t(feedback)}</p>}
    <div className="reader-byline"><Portrait profile={record.author} /><div><strong>{record.author.name}</strong><span><time dateTime={record.publishedAt}>{time}</time><span aria-hidden="true"> · </span>{t('readerVersion')} {record.revisionNo}</span></div></div>
    <article className="reader-paper">{!OwnwordContentModel.title(record.content) && <h1 tabIndex="-1">{t('contentUntitled')}</h1>}<MarkdownBody source={record.content} t={t} /></article>
    <div className="reader-record"><Identifier id={record.authorBapId} t={t} failCopy={failCopy} /><Identifier id={record.txid} label={t('publishSampleTx')} copyLabel="copyTx" target="reader-tx" t={t} failCopy={failCopy} /><p className="hint">{t('readerLocalScope')}</p></div>
  </section>;
}
Object.assign(window,{ContentReader});
