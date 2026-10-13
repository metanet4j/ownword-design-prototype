/* Public discovery composes real prototype records and existing S2 components. */
function WelcomeStory({t, onIdentity, onRead, failCopy}) {
  const [chapter, setChapter] = React.useState('identity');
  const record = React.useMemo(() => OwnwordContentModel.seed().records[0], []);
  const chapters = ['identity', 'words', 'proof'];
  const id=React.useId();
  return <section className="welcome-story" aria-labelledby={`${id}-heading`}>
    <div className="welcome-story-intro">
      <h2 id={`${id}-heading`}>{t('welcomeStoryTitle')}</h2>
      <p>{t('welcomeStoryBody')}</p>
    </div>
    <S2.Tabs selectedKey={chapter} onSelectionChange={setChapter} aria-label={t('welcomeStoryTitle')} ><div className="welcome-story-layout">
      <div className="welcome-story-navigation">
        <S2.TabList>{chapters.map(item=><S2.Tab key={item} id={item}>{t('welcomeChapter-'+item)}</S2.Tab>)}</S2.TabList>
        <p className="welcome-chapter-description">{t('welcomeChapterBody-' + chapter)}</p>
        <p className="welcome-story-principle">{t('welcomeStoryPrinciple')}</p>
      </div>
      {chapters.map(item => <S2.TabPanel key={item} id={item} UNSAFE_className="welcome-story-surface">
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
          <div className="welcome-example-action"><Button variant="quiet" data-action={`welcome-open-${item}`} onClick={() => item === 'identity' ? onIdentity(record.authorBapId) : onRead(record.id)}>{t(item === 'identity' ? 'viewPublicIdentity' : 'welcomeReadWords')}</Button></div>
        </>}
      </S2.TabPanel>)}
    </div></S2.Tabs>
  </section>;
}
window.WelcomeStory = WelcomeStory;
