/* Public discovery composes real prototype records and existing S2 components. */
function WelcomeStory({t, onIdentity, onRead, failCopy}) {
  const [chapter, setChapter] = React.useState('identity');
  const record = React.useMemo(() => OwnwordContentModel.seed().records[0], []);
  const chapters = ['identity', 'words', 'proof'];
  const id = React.useId(), base = S2.Tabs();
  const list = React.Children.toArray(base.props.children)[0];
  const tab = React.Children.toArray(list.props.children)[0];
  function selectFromKeyboard(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % 3
      : event.key === 'ArrowLeft' ? (index + 2) % 3
      : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
    if (next === null) return;
    event.preventDefault();
    setChapter(chapters[next]);
    document.getElementById(`${id}-${chapters[next]}`).focus();
  }
  return <section className="welcome-story" aria-labelledby={`${id}-heading`}>
    <div className="welcome-story-intro">
      <h2 id={`${id}-heading`}>{t('welcomeStoryTitle')}</h2>
      <p>{t('welcomeStoryBody')}</p>
    </div>
    <div className="welcome-story-layout">
      <div className="welcome-story-navigation">
        {React.cloneElement(base, {}, React.cloneElement(list, {role:'tablist', 'aria-label':t('welcomeStoryTitle')}, chapters.map((item, index) => React.cloneElement(tab, {
          key:item, id:`${id}-${item}`, role:'tab', 'aria-selected':chapter === item,
          'aria-controls':`${id}-${item}-panel`, tabIndex:chapter === item ? 0 : -1,
          className:chapter === item ? 'is-selected' : '', onClick:() => setChapter(item),
          onKeyDown:event => selectFromKeyboard(event, index)
        }, t('welcomeChapter-' + item)))))}
        <p className="welcome-chapter-description">{t('welcomeChapterBody-' + chapter)}</p>
        <p className="welcome-story-principle">{t('welcomeStoryPrinciple')}</p>
      </div>
      {chapters.map(item => <div key={item} className="welcome-story-surface" id={`${id}-${item}-panel`} role="tabpanel" aria-labelledby={`${id}-${item}`} hidden={chapter !== item} tabIndex={0}>
        {chapter === item && <>
          {item === 'identity' && <div className="welcome-identity-example">
            <div className="person-row"><Portrait profile={record.author} /><div><p className="profile-type">{t(record.author.type)}</p><h3>{record.author.name}</h3></div></div>
            <p className="bio" lang="en">{record.author.bio}</p>
            <Identifier id={record.authorBapId} t={t} failCopy={failCopy}/>
          </div>}
          {item === 'words' && <article className="welcome-words-example" lang="en">
            <p className="welcome-example-author">{record.author.name}</p>
            <h3>{OwnwordContentModel.title(record.content)}</h3>
            <MarkdownBody source={record.content.split('\n\n').slice(1, 3).join('\n\n')} t={t}/>
          </article>}
          {item === 'proof' && <div className="welcome-proof-example">
            <h3>{t('welcomeProofTitle')}</h3>
            <p>{t('welcomeProofBody')}</p>
            <ContentProof record={record} settings={OwnwordContentModel.defaultScenarios} operations={[]} t={t} failCopy={failCopy}/>
          </div>}
          <div className="welcome-example-action"><Button variant="quiet" data-action={`welcome-open-${item}`} onClick={() => item === 'identity' ? onIdentity(record.authorBapId) : onRead(record.id)}>{t(item === 'identity' ? 'viewPublicIdentity' : 'welcomeReadWords')}<UiIcon name="ChevronRight"/></Button></div>
        </>}
      </div>)}
    </div>
  </section>;
}
window.WelcomeStory = WelcomeStory;
