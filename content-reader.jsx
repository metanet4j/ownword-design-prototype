function ContentReader({record,t,locale,identity,go,onExport,failCopy,records,drafts,onRevision,settings,operations}) {
  const [feedback,setFeedback]=React.useState('');
  const paper=React.useRef(null), toc=useReaderContents(paper,record);
  React.useEffect(()=>setFeedback(''),[record?.id]);
  async function copyLink() {
    try {if(failCopy)throw new Error('Simulated clipboard failure');await navigator.clipboard.writeText(location.origin+location.pathname+'#/read/'+encodeURIComponent(record.id));setFeedback('copied');} catch {setFeedback('copyFailed');}
  }
  if (!record) return <section className="content-missing" data-content-screen="read"><p className="eyebrow">{t('readerPublic')}</p><h1 tabIndex="-1">{t('readerMissing')}</h1><p>{t('readerMissingBody')}</p><Button data-action="reader-sample" onClick={()=>go('read','first-words')}>{t('contentReadSample')}</Button></section>;
  const history=OwnwordContentModel.versions(records,record), latest=history[0];
  const revision=drafts.find(d=>d.baseContentId===record.id && d.authorBapId===identity?.bapId);
  const time=new Intl.DateTimeFormat(locale==='zh'?'zh-CN':'en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(record.publishedAt));
  return <section className={'content-reader'+(toc.items.length ? ' has-toc' : '')} data-content-screen="read" data-record-id={record.id}>
    <div className="reader-toolbar"><Button variant="quiet" onClick={()=>go('content')}>{t(identity ? 'contentBack' : 'myContent')}</Button><div><Button data-action="reader-copy-link" onClick={copyLink}>{t('readerCopyLink')}</Button><Button data-action="reader-export" onClick={()=>onExport(record)}>{t('markdownExport')}</Button></div></div>
    {feedback && <p role="status" className="reader-feedback" data-reader-copy={feedback}>{t(feedback)}</p>}
    <div className="reader-byline"><Portrait profile={record.author} /><div><strong>{record.author.name}</strong><span><time dateTime={record.publishedAt}>{time}</time><span aria-hidden="true"> · </span>{t('readerVersion')} {record.revisionNo}</span></div></div>
    <div className="reader-version-bar"><Button variant="quiet" data-action="reader-history" onClick={()=>go("history",record.id)}>{t("versionHistory")} · {history.length}</Button>{latest.id!==record.id ? <><span>{t("versionHistorical")}</span><Button data-action="reader-latest" onClick={()=>go("read",latest.id)}>{t("versionLatest")}</Button></> : identity?.bapId===record.authorBapId && <Button data-action="reader-revise" onClick={()=>onRevision(record)}>{t(revision ? "revisionContinue" : "revisionCreate")}</Button>}</div>
    <div className="reader-layout">
      {!!toc.items.length && <nav className="reader-toc" ref={toc.nav} style={{top:toc.top}} aria-label={t('readerContents')}>
        {toc.wide ? <h2>{t('readerContents')}</h2> : <Button variant="quiet" className="s2d-button s2d-button-quiet reader-toc-toggle" data-action="reader-toc-toggle" aria-expanded={toc.expanded} aria-controls="reader-toc-items" onClick={()=>toc.setExpanded(!toc.expanded)}>{t('readerContents')}<span>{t(toc.expanded ? 'readerTocCollapse' : 'readerTocExpand')}</span></Button>}
        <ol id="reader-toc-items" hidden={!toc.wide && !toc.expanded}>{toc.items.map(item=><li key={item.id}><Button variant="quiet" className="s2d-button s2d-button-quiet reader-toc-item" style={{paddingInlineStart:12+(item.depth-toc.minDepth)*12}} data-toc-target={item.id} aria-current={toc.current===item.id ? 'location' : undefined} onClick={()=>toc.jump(item)}>{item.text}</Button></li>)}</ol>
      </nav>}
      <article className="reader-paper" ref={paper}>{!OwnwordContentModel.title(record.content) && <h1 tabIndex="-1">{t('contentUntitled')}</h1>}<MarkdownBody source={record.content} t={t} /></article>
    </div>
    <ContentProof key={record.id} record={record} settings={settings} operations={operations} t={t} failCopy={failCopy} /><p className="reader-local-note">{t('readerLocalScope')}</p>
  </section>;
}
function useReaderContents(paper,record) {
  const [items,setItems]=React.useState([]), [current,setCurrent]=React.useState(''), [expanded,setExpanded]=React.useState(false);
  const [wide,setWide]=React.useState(()=>matchMedia('(min-width:1200px)').matches), [top,setTop]=React.useState(112);
  const nav=React.useRef(null);
  React.useEffect(()=>{const query=matchMedia('(min-width:1200px)');const change=()=>setWide(query.matches);query.addEventListener('change',change);return ()=>query.removeEventListener('change',change);},[]);
  React.useEffect(()=>{
    // 从实际渲染的标题取目录，避免代码块、原始 HTML 和格式标记被误当作标题。
    const nodes=[...(paper.current?.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6') || [])].filter((node,index)=>!(index===0 && node.tagName==='H1') && node.textContent.trim());
    const next=nodes.map((node,index)=>{node.id='reader-heading-'+(index+1);node.tabIndex=-1;return {node,id:node.id,text:node.textContent.trim(),depth:Number(node.tagName[1])};});
    setItems(next);setExpanded(false);
    let frame;
    function update() {
      const headerBottom=Math.max(0,document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0);
      setTop(headerBottom+(wide ? 12 : 0));
      const boundary=headerBottom+24+(wide ? 0 : nav.current?.querySelector('button')?.offsetHeight || 0);
      let selected=next[0];
      for (const item of next) {if(item.node.getBoundingClientRect().top>boundary+4)break;selected=item;}
      setCurrent(selected?.id || '');
    }
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
    update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
  },[record?.id,record?.content,wide]);
  function jump(item) {
    setExpanded(false);setCurrent(item.id);
    requestAnimationFrame(()=>{
      const offset=(document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0)+24+(wide ? 0 : nav.current?.querySelector('button')?.offsetHeight || 0);
      item.node.focus({preventScroll:true});
      window.scrollTo({top:window.scrollY+item.node.getBoundingClientRect().top-offset,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    });
  }
  return {items,current,expanded,setExpanded,wide,top,nav,jump,minDepth:items.length ? Math.min(...items.map(x=>x.depth)) : 1};
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
