function MarkdownBody({source, t}) {
  const result = React.useMemo(() => OwnwordEditorTools.renderMarkdown(source), [source]);
  return <><div className="markdown-body" ref={node=>node?.querySelector("h1")?.setAttribute("tabindex","-1")} dangerouslySetInnerHTML={{__html: result.html}}></div>{result.unsupported && <p className="content-syntax-note">{t('markdownUnsupported')}</p>}</>;
}
function ContentEditor({draft, onChange, t, locale, actions, savedState}) {
  const host = React.useRef(null), editor = React.useRef(null), menuRef = React.useRef(null), latestChange = React.useRef(onChange);
  latestChange.current = onChange;
  const visualHost = React.useRef(null), visual = React.useRef(null), latestDraft = React.useRef(draft), latestLabels = React.useRef({});
  latestDraft.current = draft; latestLabels.current = {label:t('editorVisualBody'),taskLabel:t('editorTaskToggle')};
  const unsupported = React.useMemo(() => OwnwordEditorTools.renderMarkdown(draft.content).unsupported, [draft.content]);
  const [visualState, setVisualState] = React.useState('loading'), [formats, setFormats] = React.useState({}), [link, setLink] = React.useState(null);
  const previewScroll = React.useRef(null), activeArea = React.useRef('source'), scrollLock = React.useRef(false), currentMode = React.useRef('edit');
  function syncScroll(area, view = editor.current?.view) {
    if (currentMode.current !== 'split' || activeArea.current !== area || scrollLock.current || !view || !previewScroll.current) return;
    const previewElement = previewScroll.current;
    const nodes = [...previewElement.querySelectorAll('.markdown-body > [data-line]')];
    if (!nodes.length) return;
    const sourceOffsets = [], previewOffsets = [];
    for (const node of nodes) {
      const line = Math.min(Number(node.dataset.line), view.state.doc.lines);
      sourceOffsets.push(view.lineBlockAt(view.state.doc.line(line).from).top);
      previewOffsets.push(node.offsetTop + node.parentElement.offsetTop);
    }
    const source = area === 'source' ? view.scrollDOM : previewElement;
    const target = area === 'source' ? previewElement : view.scrollDOM;
    const from = area === 'source' ? sourceOffsets : previewOffsets;
    const to = area === 'source' ? previewOffsets : sourceOffsets;
    let index = 0;
    while (index < from.length - 1 && from[index + 1] <= source.scrollTop) index++;
    const ratio = Math.max(0, Math.min(1, (source.scrollTop - from[index]) / Math.max(1, (from[index + 1] ?? source.scrollHeight) - from[index])));
    scrollLock.current = true;
    target.scrollTop = source.scrollHeight - source.clientHeight - source.scrollTop < 2 ? target.scrollHeight : to[index] + ratio * ((to[index + 1] ?? target.scrollHeight) - to[index]);
    requestAnimationFrame(() => {scrollLock.current = false;});
  }
  const [mode, setMode] = React.useState('visual');
  currentMode.current = mode;
  const [wide, setWide] = React.useState(() => matchMedia('(min-width:960px)').matches);
  const [more, setMore] = React.useState(false);
  const [preview, setPreview] = React.useState(draft.content);
  useDismissable(more, () => setMore(false), menuRef);
  React.useEffect(() => {
    editor.current = OwnwordEditorTools.createEditor(host.current, draft.content, {label: t('editorSource'), locale, onChange: value => latestChange.current(value), onScroll: view => syncScroll('source', view)});
    return () => editor.current.destroy();
  }, [draft.id]);
  React.useEffect(() => {
    let cancelled = false, api;
    setVisualState('loading');
    const value = OwnwordEditorTools.renderMarkdown(draft.content).unsupported ? '' : draft.content;
    OwnwordEditorTools.createVisualEditor(visualHost.current, value, {...latestLabels.current,
      onChange:value => {if (!cancelled && currentMode.current === 'visual') latestChange.current(value);},
      onSelection:state => {if (!cancelled) setFormats(state);}
    }).then(created => {
      api = created;
      if (cancelled) {api.destroy(); return;}
      visual.current = api;
      if (!OwnwordEditorTools.renderMarkdown(latestDraft.current.content).unsupported) api.setValue(latestDraft.current.content);
      api.setLabel(latestLabels.current.label, latestLabels.current.taskLabel);
      setVisualState('ready');
    }).catch(error => {if (!cancelled) {console.error('Visual editor initialization failed', error); setVisualState('error');}});
    return () => {cancelled = true; visual.current = null; api?.destroy();};
  }, [draft.id]);
  React.useEffect(() => {if (!unsupported) visual.current?.setValue(draft.content);}, [draft.content, unsupported]);
  React.useEffect(() => {editor.current?.setValue(draft.content); const timer = setTimeout(() => setPreview(draft.content), 500); return () => clearTimeout(timer);}, [draft.content]);
  React.useEffect(() => {editor.current?.setLabel(t('editorSource'), locale); visual.current?.setLabel(t('editorVisualBody'), t('editorTaskToggle'));}, [locale]);
  React.useEffect(() => {const query = matchMedia('(min-width:960px)'); const change = () => {setWide(query.matches); setMode(value => !query.matches && value === 'split' ? 'edit' : value);}; query.addEventListener('change', change); return () => query.removeEventListener('change', change);}, []);
  React.useEffect(() => {if (mode !== 'preview') editor.current?.view.requestMeasure();}, [mode]);
  const visualBlocked = mode === 'visual' && (unsupported || visualState !== 'ready');
  const command = key => {
    setMore(false);
    if (mode === 'visual') {
      if (visualBlocked) return;
      if (key === 'link') {setLink({href:visual.current.selectedLink(),label:visual.current.selectedText(),error:false}); return;}
      if (key !== 'find') {visual.current.command(key); return;}
    }
    if (mode === 'preview' || key === 'find') setMode('edit');
    requestAnimationFrame(() => editor.current?.command(key, t('editorPlaceholder')));
  };
  function applyLink(event) {
    event.preventDefault();
    const href = link.href.trim();
    try {if (!['https:','http:','mailto:'].includes(new URL(href).protocol)) throw new Error('protocol');}
    catch {setLink({...link,error:true}); return;}
    visual.current?.link(href, link.label); setLink(null);
    requestAnimationFrame(() => visual.current?.view.focus());
  }
  const bytes = new TextEncoder().encode(draft.content).length;
  return <div className="content-editor" data-editor-mode={mode}>
    <div className="editor-topline"><div><span className="eyebrow">{t('contentDraft')}</span><h1 tabIndex="-1">{OwnwordContentModel.title(draft.content) || t('contentUntitled')}</h1></div><div className="editor-actions">{savedState}{actions}</div></div>
    <div className="editor-controls"><div className="editor-tools" role="group" aria-label={t('editorFormatting')}>
      <label className="editor-heading-picker"><span className="sr-only">{t('editorHeading')}</span><select disabled={visualBlocked} aria-label={t('editorHeading')} value="" onChange={e => command(e.target.value)}><option value="" disabled>{t('editorHeading')}</option>{['h1','h2','h3'].map((v,i) => <option value={v} key={v}>{t('editorHeading')} {i+1}</option>)}</select></label>
      {['bold','italic','link'].map(key => <Button key={key} variant="quiet" data-format={key} disabled={visualBlocked} aria-pressed={mode === 'visual' ? !!formats[key] : undefined} aria-label={t('editor-' + key)} onClick={() => command(key)}>{key === 'bold' ? <strong>B</strong> : key === 'italic' ? <em>I</em> : t('editor-link')}</Button>)}
      <div className="editor-more" ref={menuRef}><Button variant="quiet" data-action="editor-more" disabled={visualBlocked} aria-expanded={more} onClick={() => setMore(!more)}>{t('editorMore')}</Button>{more && <div className="editor-menu" role="group" aria-label={t('editorMore')}>{[...(!wide ? ['link'] : []),'strike','quote','unordered','ordered','task','code','codeblock','table','rule','undo','redo','find'].map(key => <Button variant="quiet" key={key} data-format={key} onClick={() => command(key)}>{t('editor-' + key)}</Button>)}</div>}</div>
    </div><div className="editor-modes" role="group" aria-label={t('editorMode')}>{(wide ? ['visual','edit','split','preview'] : ['visual','edit','preview']).map(key => <Button key={key} variant="quiet" data-mode={key} aria-pressed={mode === key} onClick={() => setMode(key)}>{t('editor-' + key)}</Button>)}</div></div>
    <section className="editor-visual" hidden={mode !== 'visual'} aria-label={t('editor-visual')}>
      <div className="editor-pane-label">{t('editorVisualHint')}</div>
      <div className="visual-editor-host" key={draft.id} ref={visualHost} hidden={unsupported || visualState !== 'ready'} data-visual-state={visualState}></div>
      {(unsupported || visualState === 'error') ? <div className="visual-fallback"><p>{t(unsupported ? 'editorVisualUnsupported' : 'editorVisualFailed')}</p><Button data-action="visual-source" onClick={() => setMode('edit')}>{t('editorOpenSource')}</Button></div> : visualState === 'loading' && <div className="visual-fallback"><LoadingMark small label={t('editorVisualLoading')} /></div>}
    </section>
    <div className="editor-columns"><section className="editor-source" onPointerEnter={() => {activeArea.current = 'source';}} onFocusCapture={() => {activeArea.current = 'source';}} hidden={mode === 'preview' || mode === 'visual'} aria-label={t('editorSource')}><div className="editor-pane-label">Markdown</div><div className="editor-host" ref={host}></div></section><section className="editor-preview" hidden={mode === 'edit' || mode === 'visual'} aria-label={t('editor-preview')}><div className="editor-pane-label">{t('editor-preview')}</div><div className="editor-preview-scroll" ref={previewScroll} onPointerEnter={() => {activeArea.current = 'preview';}} onFocusCapture={() => {activeArea.current = 'preview';}} onScroll={() => syncScroll('preview')}><MarkdownBody source={preview} t={t} /></div></section></div>
    <div className="editor-status"><span>{OwnwordModel.countGraphemes(draft.content.replace(/\s/g,''))} {t('editorCharacters')}<span aria-hidden="true"> · </span>{bytes.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')} / 102,400 {t('editorBytes')}</span><span>{t('editorUtf8')}</span></div>
    {link && <Modal title={t('editor-link')} onCancel={() => setLink(null)} closeLabel={t('close')}><form onSubmit={applyLink}>
      <Field id="visual-link-label" label={t('editorLinkText')} value={link.label} onChange={label => setLink({...link,label})} />
      <Field id="visual-link-url" label={t('editorLinkUrl')} value={link.href} onChange={href => setLink({...link,href,error:false})} error={link.error ? t('editorLinkInvalid') : ''} />
      <div className="action-row"><Button type="button" onClick={() => setLink(null)}>{t('cancel')}</Button><Button type="submit" variant="accent" data-action="visual-link-apply">{t('editorLinkApply')}</Button></div>
    </form></Modal>}
    {bytes > 102400 && <p className="field-error" role="alert">{t('editorTooLong')}</p>}
  </div>;
}
Object.assign(window, {ContentEditor, MarkdownBody});
