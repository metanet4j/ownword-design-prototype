function MarkdownBody({source}) {return <pre className="content-plain">{source}</pre>;}
function ContentEditor({draft, onChange, t, locale, actions, savedState}) {
  const host = React.useRef(null), editor = React.useRef(null), menuRef = React.useRef(null), latestChange = React.useRef(onChange);
  latestChange.current = onChange;
  const [mode, setMode] = React.useState(() => matchMedia('(min-width:960px)').matches ? 'split' : 'edit');
  const [wide, setWide] = React.useState(() => matchMedia('(min-width:960px)').matches);
  const [more, setMore] = React.useState(false);
  const [preview, setPreview] = React.useState(draft.content);
  useDismissable(more, () => setMore(false), menuRef);
  React.useEffect(() => {
    editor.current = OwnwordEditorTools.createEditor(host.current, draft.content, {label: t('editorSource'), locale, onChange: value => latestChange.current(value)});
    return () => editor.current.destroy();
  }, [draft.id]);
  React.useEffect(() => {editor.current?.setValue(draft.content); const timer = setTimeout(() => setPreview(draft.content), 500); return () => clearTimeout(timer);}, [draft.content]);
  React.useEffect(() => {editor.current?.setLabel(t('editorSource'), locale);}, [locale]);
  React.useEffect(() => {const query = matchMedia('(min-width:960px)'); const change = () => {setWide(query.matches); setMode(query.matches ? 'split' : 'edit');}; query.addEventListener('change', change); return () => query.removeEventListener('change', change);}, []);
  React.useEffect(() => {if (mode !== 'preview') editor.current?.view.requestMeasure();}, [mode]);
  const command = key => {editor.current.command(key, t('editorPlaceholder')); setMore(false);};
  const bytes = new TextEncoder().encode(draft.content).length;
  return <div className="content-editor" data-editor-mode={mode}>
    <div className="editor-topline"><div><span className="eyebrow">{t('contentDraft')}</span><h1 tabIndex="-1">{OwnwordContentModel.title(draft.content) || t('contentUntitled')}</h1></div><div className="editor-actions">{savedState}{actions}</div></div>
    <div className="editor-controls"><div className="editor-tools" role="group" aria-label={t('editorFormatting')}>
      <label className="editor-heading-picker"><span className="sr-only">{t('editorHeading')}</span><select aria-label={t('editorHeading')} value="" onChange={e => command(e.target.value)}><option value="" disabled>{t('editorHeading')}</option>{['h1','h2','h3'].map((v,i) => <option value={v} key={v}>{t('editorHeading')} {i+1}</option>)}</select></label>
      {['bold','italic','link'].map(key => <Button key={key} variant="quiet" data-format={key} aria-label={t('editor-' + key)} onClick={() => command(key)}>{key === 'bold' ? <strong>B</strong> : key === 'italic' ? <em>I</em> : t('editor-link')}</Button>)}
      <div className="editor-more" ref={menuRef}><Button variant="quiet" data-action="editor-more" aria-expanded={more} onClick={() => setMore(!more)}>{t('editorMore')}</Button>{more && <div className="editor-menu" role="group" aria-label={t('editorMore')}>{['strike','quote','unordered','ordered','task','code','codeblock','table','rule','undo','redo','find'].map(key => <Button variant="quiet" key={key} data-format={key} onClick={() => command(key)}>{t('editor-' + key)}</Button>)}</div>}</div>
    </div><div className="editor-modes" role="group" aria-label={t('editorMode')}>{(wide ? ['edit','split','preview'] : ['edit','preview']).map(key => <Button key={key} variant="quiet" data-mode={key} aria-pressed={mode === key} onClick={() => setMode(key)}>{t('editor-' + key)}</Button>)}</div></div>
    <div className="editor-columns"><section className="editor-source" hidden={mode === 'preview'} aria-label={t('editorSource')}><div className="editor-pane-label">Markdown</div><div className="editor-host" ref={host}></div></section><section className="editor-preview" hidden={mode === 'edit'} aria-label={t('editor-preview')}><div className="editor-pane-label">{t('editor-preview')}</div><div className="editor-preview-scroll"><MarkdownBody source={preview} t={t} /></div></section></div>
    <div className="editor-status"><span>{OwnwordModel.countGraphemes(draft.content.replace(/\s/g,''))} {t('editorCharacters')}<span aria-hidden="true"> · </span>{bytes.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')} / 102,400 {t('editorBytes')}</span><span>{t('editorUtf8')}</span></div>
    {bytes > 102400 && <p className="field-error" role="alert">{t('editorTooLong')}</p>}
  </div>;
}
Object.assign(window, {ContentEditor, MarkdownBody});
