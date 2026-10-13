/* Prototype copy dictionary. Terminology authority: _task/system-design/spec/核心认知.md §2. */
(function (root) {
  const words = {
  en: {
    flipToBack: 'Flip card', flipToFront: 'Back to front',
    viewChainRecord: 'View chain record', hideChainRecord: 'Hide chain record',
    viewFullProfile: 'View full profile', hideFullProfile: 'Hide full profile',
    connect: 'Connect Wallet', connected: 'Connected', notConnected: 'Not connected', connecting: 'Connecting', disconnect: 'Disconnect', accountSwitch: 'Switch account', wallet: 'Wallet',
    myIdentity: 'My Identity', publicIdentity: 'Public Identity', backHome: 'Back to home', backFind: 'Back to find identity', backArtifact: 'Back to Artifact', backPublicIdentity: 'Back to profile', artifactDetailTitle: 'Artifact', preferences: 'Preferences', theme: 'Theme', light: 'Light', dark: 'Dark', language: 'Language',
    headlineOne: 'Own your identity.', headlineTwo: 'Own your words.', welcomeIntro: 'A place to stand. A voice that belongs to you.', welcomeBody: 'Start with your wallet. Your identity and your words stay yours.',
    welcomeDiscoveryBody: 'An identity you control. Words you sign. A record anyone can inspect.',
    welcomeStoryTitle: 'A voice. An author. A record.', welcomeStoryBody: 'Follow one identity from its profile to its words and the record behind them.',
    'welcomeChapter-identity': 'Identity', 'welcomeChapter-words': 'Words', 'welcomeChapter-proof': 'Proof',
    'welcomeChapterBody-identity': 'Your profile introduces you. Your BAP ID stays with you.',
    'welcomeChapterBody-words': 'Every published piece has an author. A revision preserves the words that came before.',
    'welcomeChapterBody-proof': 'Inspect the author, signature and transaction behind the words.',
    welcomeStoryPrinciple: 'Anyone can read a public identity and its words without connecting a wallet.',
    welcomeProofTitle: 'Trace the words to their author.', welcomeProofBody: 'Open the record to inspect the signature and blockchain status separately.', welcomeReadWords: 'Read words',
    welcomeNote: 'Your wallet controls your identity.', horizonCaption: 'A foundation for your voice', domeLabel: 'Play the seven sky lines',
    walletNote: 'Yours Wallet', independent: 'Your identity starts with you.', footer: 'Your wallet. Your identity. Your words.', prototype: 'Interactive prototype', scenarios: 'Explore scenarios', close: 'Close',
    scenario: 'Wallet identity', new: 'New identity', existing: 'Published identity', incomplete: 'Incomplete profile', resolveFail: 'Resolution fails', missing: 'Wallet unavailable',
    simulatorNote: 'Demo only. No wallet connection, signature or transaction is sent.', simulatorHint: 'Choose an identity scenario, then connect or resolve again.',
    sampleDataNote: 'Identity and chain records are sample data. Authorization dialogs represent the external wallet.', walletAuthorization: 'Yours Wallet · External authorization',
    nextResult: 'Next operation result', resultSuccess: 'Success', nextResultHint: 'Applies once after approving a connection, creation or update. Cancelling keeps this setting.',
    accountEvent: 'Next account event', none: 'No event', 'switch-confirm': 'Switch during authorization', 'switch-process': 'Switch during processing', 'disconnect-confirm': 'Disconnect during authorization', 'disconnect-process': 'Disconnect during processing',
    accountEventHint: 'Runs once on create or update: after 1.2s in authorization, or 0.6s in processing.',
    resolveAgain: 'Resolve again', failClipboard: 'Simulate copy failure', reset: 'Reset session',
    connectTitle: 'Connect Yours Wallet', connectBody: 'Let this app see your wallet identity. Publishing needs a separate confirmation.', approve: 'Approve', cancel: 'Cancel', simulateFailure: 'Simulate failure',
    connectCancelled: 'Connection cancelled', connectFailed: 'Connection failed', connectFailedBody: 'Your identity is unchanged. Check your wallet and try again.',
    missingTitle: 'Yours Wallet is unavailable', missingBody: 'No supported wallet was found. Open Yours Wallet, then try again.', retry: 'Try Again',
    resolving: 'Resolving your identity...', resolvingBody: 'Checking whether your wallet has a published identity.', resolveFailed: "Couldn't resolve identity", resolveFailedBody: 'Try again, or disconnect and switch to another account.',
    setup: 'Identity Setup', setupHeading: 'Set up identity', setupBody: 'Choose how your identity appears to the world.', complete: 'Complete your profile', completeBody: 'Already published. Add the missing profile details to continue.',
    avatar: 'Avatar', chooseImage: 'Choose image', removeImage: 'Remove image', imageHint: 'Local PNG, JPEG or WebP. Optional.', invalidImage: 'Choose a valid PNG, JPEG or WebP image.', name: 'Name', required: 'Enter a name.', nameLong: 'Use 100 characters or fewer.', bioLong: 'Use 1000 characters or fewer.', typeRequired: 'Choose Person or Organization.',
    type: 'Type', Person: 'Person', Organization: 'Organization', bio: 'Bio', optional: 'Optional', review: 'Review', noChanges: 'No changes', back: 'Back', profile: 'Profile', editProfile: 'Edit Profile', editHeading: 'Edit profile', editBody: 'Update how you appear. Your BAP ID stays the same.',
    reviewHeading: 'Review identity', reviewBody: 'Review the details before confirming in your wallet.', create: 'Create Identity', createImpact: 'Your identity and profile will become public.', saveImpact: 'Your updated profile will become public. Your BAP ID will not change.', localId: 'Locally computed · not yet published', published: 'Published', controlStatement: 'Your wallet controls this identity.',
    copy: 'Copy', copied: 'Copied', copyFailed: "Couldn't copy", copyManually: "Copy unavailable. Select the full value to copy it manually.", copyBap: 'Copy full BAP ID', noBio: 'No bio yet.',
    createTitle: 'Confirm identity creation', saveTitle: 'Confirm profile update', currentIdentity: 'Current identity',
    creating: 'Creating identity...', saving: 'Saving...', processingBody: 'Waiting for the wallet. Disconnecting or switching account cancels this operation.',
    createCancelled: 'Creation cancelled', saveCancelled: 'Saving cancelled', retained: 'Your draft is kept.',
    createFailed: "Couldn't create identity", saveFailed: "Couldn't save profile", operationFailedBody: 'The operation did not complete. Your values are kept. Try again.',
    ready: 'Your identity is ready', readyBody: 'You now have a place to stand. Your wallet remains in control.', goIdentity: 'Go to My Identity', saved: 'Saved',
    identityIntro: 'A constant in a changing world.', identityBody: 'Your public identity, under your control.', owner: 'Controlled by your connected wallet', profileDetails: 'Profile details', account: 'Wallet account',
    publicIntro: 'Your identity, in the open.', publicBody: 'A public view of the identity you control.', backIdentity: 'Back to My Identity', ownedByYou: 'Identity, owned by you.',
    save: 'Save Changes', discardTitle: 'Discard unsaved changes?', discardBody: 'Changes are not saved. Keep editing, or discard them to leave.', keepEditing: 'Keep editing', discard: 'Discard changes',
    accountChanged: 'Account changed. Pending operations were cancelled.', identityUnchanged: 'Your identity is unchanged.', current: 'Current', preferenceHint: 'Language and appearance stay on this device.',
    setupStep: 'Profile', reviewStep: 'Review', confirmStep: 'Confirm', doneStep: 'Ready', copyFailureOn: 'Copy failure simulation is on', privatePreview: 'Public view preview',
    walletStatus: 'Wallet status', persistFailed: 'Preferences could not be saved on this device.',
    chainRecord: 'Chain record', identityPublication: 'Identity publication', blockHeight: 'Block height', confirmation: 'Confirmation', confirmed: 'Confirmed', pendingConfirmation: 'Awaiting block confirmation', pendingBlock: 'Awaiting block', publicationTx: 'Publication TxID', copyTx: 'Copy publication TxID', recordUnavailable: 'Transaction record unavailable'
  },
  zh: {
    flipToBack: '翻面', flipToFront: '翻回正面',
    viewChainRecord: '查看链上记录', hideChainRecord: '收起链上记录',
    viewFullProfile: '查看完整资料', hideFullProfile: '收起完整资料',
    connect: '连接钱包', connected: '已连接', notConnected: '未连接', connecting: '正在连接', disconnect: '断开连接', accountSwitch: '切换账户', wallet: '钱包',
    myIdentity: '我的身份', publicIdentity: '公开身份', backHome: '返回首页', backFind: '返回查找身份', backArtifact: '返回 Artifact', backPublicIdentity: '返回公开身份', artifactDetailTitle: 'Artifact', preferences: '偏好设置', theme: '主题', light: '浅色', dark: '深色', language: '语言',
    headlineOne: '拥有你的身份。', headlineTwo: '拥有你的话语。', welcomeIntro: '立于自己的坐标，发出自己的声音。', welcomeBody: '从钱包开始。身份与话语，都由你掌控。',
    welcomeDiscoveryBody: '身份由你掌控，话语由你签名，记录可公开查验。',
    welcomeStoryTitle: '话语、作者与记录，彼此相连。', welcomeStoryBody: '从一个身份出发，阅读它发表的文字，再查看文字背后的记录。',
    'welcomeChapter-identity': '身份', 'welcomeChapter-words': '文字', 'welcomeChapter-proof': '凭证',
    'welcomeChapterBody-identity': '资料介绍你，BAP ID 始终标识你。',
    'welcomeChapterBody-words': '每篇发表的文字都有明确作者。修订产生新版本，保留此前的文字。',
    'welcomeChapterBody-proof': '查看文字的作者、身份签名与交易记录。',
    welcomeStoryPrinciple: '无需连接钱包，任何人都能阅读公开身份及其文字。',
    welcomeProofTitle: '让文字可以追溯到作者。', welcomeProofBody: '展开记录，分别查看身份签名与链上状态。', welcomeReadWords: '阅读文字',
    welcomeNote: '你的钱包掌控你的身份。', horizonCaption: '让话语有所立足', domeLabel: '拨动七条天幕线',
    walletNote: 'Yours Wallet', independent: '身份，由你开始。', footer: '你的钱包。你的身份。你的话语。', prototype: '交互原型', scenarios: '演练场景', close: '关闭',
    scenario: '钱包身份场景', new: '新身份', existing: '已发布身份', incomplete: '资料不完整', resolveFail: '解析失败', missing: '钱包不可用',
    simulatorNote: '仅作演示。不会连接钱包、签名或发送交易。', simulatorHint: '选择身份场景后，连接钱包或重新解析。',
    sampleDataNote: '身份与链上记录均为示例数据。授权弹窗代表外部钱包界面。', walletAuthorization: 'Yours Wallet · 外部钱包授权',
    nextResult: '下一次操作结果', resultSuccess: '成功', nextResultHint: '批准连接、创建或更新后生效一次；取消授权会保留此设置。',
    accountEvent: '下一次账户变化', none: '不触发', 'switch-confirm': '授权时切换账户', 'switch-process': '处理中切换账户', 'disconnect-confirm': '授权时断开连接', 'disconnect-process': '处理中断开连接',
    accountEventHint: '创建身份或更新资料时触发一次：授权开始 1.2 秒后，或处理开始 0.6 秒后。',
    resolveAgain: '重新解析', failClipboard: '模拟复制失败', reset: '重置会话',
    connectTitle: '连接 Yours Wallet', connectBody: '允许应用查看钱包身份；发布时另行确认。', approve: '批准', cancel: '取消', simulateFailure: '模拟失败',
    connectCancelled: '连接已取消', connectFailed: '连接失败', connectFailedBody: '身份未改变。请检查钱包后重试。',
    missingTitle: 'Yours Wallet 不可用', missingBody: '未发现支持的钱包。请打开 Yours Wallet 后重试。', retry: '重试',
    resolving: '正在解析身份…', resolvingBody: '正在查询当前钱包是否已有公开身份。', resolveFailed: '无法解析身份', resolveFailedBody: '可重试，或断开后切换其他账户。',
    setup: '设置身份', setupHeading: '设置身份', setupBody: '选择你向世界展示自己的方式。', complete: '完善你的资料', completeBody: '身份已发布。补全资料后继续。',
    avatar: '头像', chooseImage: '选择图片', removeImage: '移除图片', imageHint: '本地 PNG、JPEG 或 WebP，可选。', invalidImage: '请选择有效的 PNG、JPEG 或 WebP 图片。', name: '名称', required: '请输入名称。', nameLong: '名称不能超过 100 个字符。', bioLong: '简介不能超过 1000 个字符。', typeRequired: '请选择个人或组织。',
    type: '类型', Person: '个人', Organization: '组织', bio: '简介', optional: '可选', review: '预览确认', noChanges: '暂无修改', back: '返回', profile: '资料', editProfile: '编辑资料', editHeading: '编辑资料', editBody: '更新展示资料，BAP ID 保持不变。',
    reviewHeading: '核对身份资料', reviewBody: '核对资料后，在钱包中确认。', create: '创建身份', createImpact: '你的身份和资料将公开发布。', saveImpact: '更新后的资料将公开发布，BAP ID 保持不变。', localId: '已本地计算 · 尚未发布', published: '已发布', controlStatement: '你的钱包掌控此身份。',
    copy: '复制', copied: '已复制', copyFailed: '无法复制', copyManually: '自动复制不可用，请选中完整标识手动复制。', copyBap: '复制完整 BAP ID', noBio: '尚未填写简介。',
    createTitle: '确认创建身份', saveTitle: '确认更新资料', currentIdentity: '当前身份',
    creating: '正在创建身份…', saving: '正在保存…', processingBody: '正在等待钱包返回。断开或切换账户会取消此操作。',
    createCancelled: '创建已取消', saveCancelled: '保存已取消', retained: '填写内容已保留。',
    createFailed: '无法创建身份', saveFailed: '无法保存资料', operationFailedBody: '操作未完成，已保留填写内容。请重试。',
    ready: '你的身份已就绪', readyBody: '现在，你有了自己的坐标。钱包始终由你掌控。', goIdentity: '前往我的身份', saved: '已保存',
    identityIntro: '变化之中，自有坐标。', identityBody: '你的公开身份，由你掌控。', owner: '由当前连接的钱包控制', profileDetails: '资料详情', account: '钱包账户',
    publicIntro: '让世界看到你。', publicBody: '查看你所掌控身份的公开展示。', backIdentity: '返回我的身份', ownedByYou: '身份，属于你。',
    save: '保存修改', discardTitle: '放弃未保存的修改？', discardBody: '修改未保存。继续编辑，或放弃后离开。', keepEditing: '继续编辑', discard: '放弃修改',
    accountChanged: '账户已切换，进行中的操作已取消。', identityUnchanged: '身份未改变。', current: '当前', preferenceHint: '语言与主题偏好保存在此设备。',
    setupStep: '资料', reviewStep: '核对', confirmStep: '确认', doneStep: '就绪', copyFailureOn: '已开启复制失败模拟', privatePreview: '公开展示预览',
    walletStatus: '钱包状态', persistFailed: '无法在此设备保存偏好。',
    chainRecord: '链上记录', identityPublication: '身份发布记录', blockHeight: '区块高度', confirmation: '确认状态', confirmed: '已确认', pendingConfirmation: '等待区块确认', pendingBlock: '等待入块', publicationTx: '发布交易 TxID', copyTx: '复制发布交易 TxID', recordUnavailable: '暂无交易记录'
  }
  };
  Object.assign(words.en, {"myContent": "My content", "contentEyebrow": "WORDS & IDENTITY", "contentIntro": "A place for drafts. A record of your published words.", "contentNew": "New draft", "contentWritingAs": "Writing as", "contentDrafts": "Drafts", "contentPublished": "Published", "contentDraft": "Draft", "contentPublishedOne": "Published", "contentFilter": "Content filter", "contentContinue": "Continue writing", "contentRead": "Read", "contentUntitled": "Untitled", "contentStartWriting": "Start with a thought.", "contentLoading": "Loading your words…", "contentLoadFailed": "Couldn’t load your content", "contentLoadFailedBody": "Your saved words are unchanged. Try again.", "contentEmptyDrafts": "A blank page, a new beginning.", "contentEmptyDraftsBody": "Start a draft. Your words can take their time.", "contentEmptyPublished": "Your first publication starts here.", "contentEmptyPublishedBody": "When you publish, your words will appear here.", "contentLocalNote": "Drafts stay in this browser until you publish.", "contentBack": "My content", "contentMissing": "Content not found", "contentGateTitle": "Your words begin with your identity.", "contentGateUnpublished": "Your wallet is connected. Set up your identity to start writing.", "contentGateIncomplete": "Your wallet is connected. Complete your profile to start writing.", "contentSetupIdentity": "Set up identity", "contentCompleteProfile": "Complete profile", "contentGateBody": "Connect your wallet and prepare your identity to open your drafts. Public writing is always readable.", "contentReadSample": "Read a sample", "contentScenarios": "Content scenarios", "contentListScenario": "Content list", "contentScenario-normal": "Normal", "contentScenario-empty": "Empty", "contentScenario-failure": "Load failure"});
  Object.assign(words.zh, {"myContent": "我的内容", "contentEyebrow": "文字与身份", "contentIntro": "留住想法，整理草稿，查看每一次发布。", "contentNew": "新建草稿", "contentWritingAs": "当前写作身份", "contentDrafts": "草稿", "contentPublished": "已发布", "contentDraft": "草稿", "contentPublishedOne": "已发布", "contentFilter": "内容筛选", "contentContinue": "继续写作", "contentRead": "阅读", "contentUntitled": "未命名内容", "contentStartWriting": "从一个想法开始。", "contentLoading": "正在载入内容…", "contentLoadFailed": "暂时无法载入内容", "contentLoadFailedBody": "已保存的内容没有改变，请重试。", "contentEmptyDrafts": "新的一页，新的想法。", "contentEmptyDraftsBody": "先写下来，慢慢整理。", "contentEmptyPublished": "第一篇内容，从这里开始。", "contentEmptyPublishedBody": "发布成功后，你的文字将显示在这里。", "contentLocalNote": "草稿保存在当前浏览器，发布前仅你可见。", "contentBack": "我的内容", "contentMissing": "未找到此内容", "contentGateTitle": "用你的身份，写下你的文字。", "contentGateUnpublished": "钱包已连接。设置身份后即可开始写作。", "contentGateIncomplete": "钱包已连接。补全资料后即可开始写作。", "contentSetupIdentity": "设置身份", "contentCompleteProfile": "补全资料", "contentGateBody": "连接钱包并准备好身份后，即可打开草稿。公开文章无需连接钱包即可阅读。", "contentReadSample": "阅读示例", "contentScenarios": "内容场景", "contentListScenario": "内容列表", "contentScenario-normal": "正常", "contentScenario-empty": "空内容", "contentScenario-failure": "加载失败"});
  Object.assign(words.en, {"editorSource": "Markdown source", "editorFormatting": "Text formatting", "editorHeading": "Heading", "editorPlaceholder": "text", "editorFiles": "File", "editorModeHelp": "About editor views", "editorMore": "More", "editorMode": "Editor view", "editorCharacters": "characters", "editorBytes": "bytes", "editorUtf8": "Markdown · UTF-8", "editorTooLong": "This draft exceeds the prototype limit of 100 KiB. Shorten it before reviewing. Your text is kept.", "editor-bold": "Bold", "editor-italic": "Italic", "editor-link": "Link", "editor-strike": "Strikethrough", "editor-quote": "Quote", "editor-unordered": "Bullet list", "editor-ordered": "Numbered list", "editor-task": "Task list", "editor-code": "Inline code", "editor-codeblock": "Code block", "editor-table": "Table", "editor-rule": "Divider", "editor-undo": "Undo", "editor-redo": "Redo", "editor-find": "Find", "editor-edit": "Source", "editor-split": "Split view", "editor-preview": "Preview"});
  Object.assign(words.zh, {"editorSource": "Markdown 源码", "editorFormatting": "文字格式", "editorHeading": "标题", "editorPlaceholder": "文字", "editorFiles": "文件", "editorModeHelp": "编辑器视图说明", "editorMore": "更多", "editorMode": "编辑器视图", "editorCharacters": "字", "editorBytes": "字节", "editorUtf8": "Markdown · UTF-8", "editorTooLong": "正文超过原型的 100 KiB 上限，请缩短后检查发布。全文已保留。", "editor-bold": "粗体", "editor-italic": "斜体", "editor-link": "链接", "editor-strike": "删除线", "editor-quote": "引用", "editor-unordered": "无序列表", "editor-ordered": "有序列表", "editor-task": "任务列表", "editor-code": "行内代码", "editor-codeblock": "代码块", "editor-table": "表格", "editor-rule": "分隔线", "editor-undo": "撤销", "editor-redo": "重做", "editor-find": "查找", "editor-edit": "源码", "editor-split": "双栏", "editor-preview": "预览"});
  Object.assign(words.en, {"markdownUnsupported": "This text includes syntax outside the supported set. It is shown as text; no media is loaded."});
  Object.assign(words.zh, {"markdownUnsupported": "正文包含暂不支持的语法，已按文字展示，不加载媒体。"});
  Object.assign(words.en, {"draft-saving": "Saving…", "draft-saved": "Saved in this browser", "draft-error": "Not saved", "draftSaveFailedBody": "Your latest words are still on this page. Storage is unavailable. Keep this page open and try again.", "draftReadFailed": "Saved drafts could not be read. Existing storage has not been replaced. Try again when storage is available.", "draftDelete": "Delete draft", "draftDeleteTitle": "Delete this draft?", "draftDeleteBody": "This removes only the local draft from this browser. Published versions remain unchanged.", "draftLeaveTitle": "Keep your latest words?", "draftLeaveBody": "Some changes have not been saved. Choose how to leave this draft.", "draftSaveLeave": "Save and leave", "draftDiscardLeave": "Discard unsaved changes", "draftDeleted": "Draft deleted.", "draftDeleteFailed": "The draft could not be deleted. It is still available.", "draftStorageScenario": "Draft storage", "draftStorageFailure": "Storage write fails"});
  Object.assign(words.zh, {"draft-saving": "保存中…", "draft-saved": "已保存到此浏览器", "draft-error": "尚未保存", "draftSaveFailedBody": "最新正文仍保留在页面中。暂时无法写入存储，请保持页面打开并重试。", "draftReadFailed": "无法读取已保存的草稿，原有存储未被覆盖。请在存储恢复后重试。", "draftDelete": "删除草稿", "draftDeleteTitle": "删除这份草稿？", "draftDeleteBody": "此操作仅移除当前浏览器中的草稿，不影响已发布版本。", "draftLeaveTitle": "保留最新修改？", "draftLeaveBody": "部分修改尚未保存，请选择如何离开这份草稿。", "draftSaveLeave": "保存并离开", "draftDiscardLeave": "放弃未保存修改", "draftDeleted": "草稿已删除。", "draftDeleteFailed": "草稿未能删除，内容仍保留。", "draftStorageScenario": "草稿存储", "draftStorageFailure": "存储写入失败"});
  Object.assign(words.en, {"markdownImport": "Import .md", "markdownExport": "Export .md", "importType": "Choose a Markdown (.md) file. Your draft is unchanged.", "importSize": "This file exceeds 100 KiB. Your draft is unchanged.", "importEncoding": "This file is not valid UTF-8. Your draft is unchanged.", "importReadError": "Could not read this file. Please try again.", "importReplaceTitle": "Replace this draft?", "importReplaceBody": "The imported Markdown will replace the current text. Export a copy first if you want to keep it.", "importReplace": "Replace text"});
  Object.assign(words.zh, {"markdownImport": "导入 .md", "markdownExport": "导出 .md", "importType": "请选择 Markdown（.md）文件，当前正文未改变。", "importSize": "文件超过 100 KiB，当前正文未改变。", "importEncoding": "文件不是有效的 UTF-8 编码，当前正文未改变。", "importReadError": "文件读取失败，请重试。", "importReplaceTitle": "替换当前草稿？", "importReplaceBody": "导入的 Markdown 将替换当前正文。如需保留，请先导出一份副本。", "importReplace": "替换正文"});
  Object.assign(words.en, {"contentReview": "Review publication", "reviewEyebrow": "Before your words go public", "reviewIntro": "Read it once more. This exact text will carry your identity.", "reviewExpired": "Review this draft again before signing. The text or identity has changed, or this review has expired.", "reviewEmpty": "Write something before publishing.", "reviewImpactTitle": "A public, lasting record", "reviewImpact": "Your text and author identity will be public. Published words cannot be overwritten. Changes create a new version; earlier versions remain readable.", "reviewEdit": "Back to editing", "contentSignPublish": "Sign and publish"});
  Object.assign(words.zh, {"contentReview": "检查发布", "reviewEyebrow": "发布之前", "reviewIntro": "再读一遍。这份正文将以你的身份签名发布。", "reviewExpired": "正文或身份已变化，或本次确认已失效。请回到草稿重新检查发布。", "reviewEmpty": "正文为空，请先写下一些内容。", "reviewImpactTitle": "公开且保留的记录", "reviewImpact": "正文和作者身份将公开。发布后不能覆盖原文；修改会追加新版本，旧版本仍可阅读。", "reviewEdit": "返回修改", "contentSignPublish": "签名并发布"});
  Object.assign(words.en, {"publishEyebrow": "Your words, your identity", "publish-authorize": "Ready for your signature", "publish-signing": "Signing your words", "publish-broadcasting": "Publishing your words", "publish-published": "Your words are published", "publish-unknown": "Publication needs checking", "publish-failed": "Publication did not complete", "publish-cancelled": "Signature cancelled", "publishCancelled": "Signature cancelled. Your draft is kept.", "publishSignatureStep": "Identity signature", "publishChainStep": "Publish on chain", "publishSigned": "Signature step complete", "publishSignDescription": "Authorize this identity and this exact text.", "publishChainDescription": "A signature is complete only for this step; publication has its own result.", "publishAccepted": "Accepted and recorded", "publishProcessing": "Keep this page open while this step completes.", "publishStorage": "The publication record could not be saved. Your draft and operation are kept. Restore storage, then check the result.", "publishNotReceived": "The query confirms this publication was not received. Review again before retrying.", "publishStillUnknown": "The result is still unknown. Check again later.", "publishSignFailed": "Identity signing failed. No publication was submitted.", "publishBroadcastFailed": "Publication was rejected after signing. Your draft is kept.", "publishUnknownBody": "This operation may have been received. Check its result before publishing again; the original text and identity are retained.", "publishDraftKept": "Your words are still in your draft. Review the text and identity before trying again.", "publishSampleRecord": "Publication record", "publishSampleTx": "TxID", "publishSimulation": "Prototype simulation: no real signature, transaction or fee is created.", "publishQuery": "Check result", "publishReviewAgain": "Return to draft and review", "publishAuthorizeTitle": "Authorize identity signing", "publishSampleWallet": "Yours Wallet", "publishAuthorizeBody": "Sign the Markdown you just reviewed with the following identity, then publish it.", "publishAuthorize": "Authorize signing", "scenario-publish": "Publication outcome", "scenario-query": "Unknown-result query", "scenario-confirmation": "Chain confirmation", "scenario-account": "Account change during publication", "scenario-success": "Success", "scenario-sign-failed": "Signature failure", "scenario-broadcast-failed": "Publication rejected", "scenario-unknown": "Result unknown", "scenario-accepted": "Accepted", "scenario-not-received": "Definitely not received", "scenario-pending": "Pending confirmation", "scenario-confirmed": "Confirmed", "scenario-none": "No change", "scenario-broadcasting-switch": "Switch during publication", "scenario-broadcasting-disconnect": "Disconnect during publication"});
  Object.assign(words.zh, {"publishEyebrow": "你的文字，你的身份", "publish-authorize": "等待身份签名授权", "publish-signing": "正在签名", "publish-broadcasting": "正在发布", "publish-published": "内容已发布", "publish-unknown": "结果待核实", "publish-failed": "发布未完成", "publish-cancelled": "签名已取消", "publishCancelled": "签名已取消，草稿已保留。", "publishSignatureStep": "身份签名", "publishChainStep": "链上发布", "publishSigned": "签名步骤已完成", "publishSignDescription": "授权当前身份与本次正文。", "publishChainDescription": "签名完成后继续发布，发布结果单独确认。", "publishAccepted": "已接收并保存发布记录", "publishProcessing": "正在处理，请稍候。", "publishStorage": "发布记录暂时无法保存，草稿与操作快照仍保留。请恢复存储后查询结果。", "publishNotReceived": "查询结果明确未接收。请重新检查正文后再发布。", "publishStillUnknown": "结果仍待核实，请稍后再次查询。", "publishSignFailed": "身份签名失败，尚未提交发布。", "publishBroadcastFailed": "签名完成，但发布被拒绝，草稿已保留。", "publishUnknownBody": "本次操作可能已被接收。请先查询结果，再决定是否重新发布；原始正文与作者已保留。", "publishDraftKept": "正文仍保留在草稿中。再次发布前，请重新检查正文与作者。", "publishSampleRecord": "发布记录", "publishSampleTx": "TxID", "publishSimulation": "原型演示：使用签名与交易样例，不发送真实交易，也不产生费用。", "publishQuery": "查询结果", "publishReviewAgain": "返回草稿重新检查", "publishAuthorizeTitle": "授权身份签名", "publishSampleWallet": "模拟钱包", "publishAuthorizeBody": "使用以下身份为刚才确认的 Markdown 正文签名，随后发布。", "publishAuthorize": "授权签名", "scenario-publish": "发布结果", "scenario-query": "待核实查询", "scenario-confirmation": "链上确认", "scenario-account": "发布时账户变化", "scenario-success": "成功", "scenario-sign-failed": "签名失败", "scenario-broadcast-failed": "发布拒绝", "scenario-unknown": "结果待核实", "scenario-accepted": "已接收", "scenario-not-received": "明确未接收", "scenario-pending": "确认中", "scenario-confirmed": "已确认", "scenario-none": "不触发", "scenario-broadcasting-switch": "发布中切换账户", "scenario-broadcasting-disconnect": "发布中断开连接"});
  Object.assign(words.en, {"publishStorageBefore": "The operation could not be saved, so signing has not started. Your draft is kept. Restore storage and review again."});
  Object.assign(words.zh, {"publishStorageBefore": "本次操作暂时无法保存，尚未开始签名，草稿已保留。请恢复存储后重新检查。"});
  Object.assign(words.en, {"readerPublic": "Public reading", "readerMissing": "This demo content was not found", "readerMissingBody": "This link may point to content created in another browser. Demo publications are stored only in the browser that created them. You can read a built-in sample instead.", "readerCopyLink": "Copy link", "readerVersion": "Version", "readerLocalScope": "Demo publication: built-in samples are shareable. New demo content can be reopened in this browser; it is not retrieved from a live chain."});
  Object.assign(words.zh, {"readerPublic": "公开阅读", "readerMissing": "未找到此演示内容", "readerMissingBody": "此链接可能来自另一浏览器。新发布的演示内容只保存在发布时使用的浏览器中，你也可以阅读内置样例。", "readerCopyLink": "复制链接", "readerVersion": "版本", "readerLocalScope": "演示内容：内置样例可分享；新发布的内容可在当前浏览器重开，未连接真实链上查询。"});
  Object.assign(words.en, {"versionHistory": "Version history", "versionHistorical": "Reading an earlier version", "versionLatest": "Read latest version", "versionCurrent": "Latest", "revisionContinue": "Continue revision", "revisionCreate": "Create revision", "revisionUnchanged": "There are no changes yet. Edit the text before reviewing this revision.", "reviewOutdated": "A newer version exists. Open the latest version to start a revision.", "historyBack": "Back to reading", "versionHistoryBody": "Each publication keeps its own words. Earlier versions remain readable."});
  Object.assign(words.zh, {"versionHistory": "版本历史", "versionHistorical": "正在阅读历史版本", "versionLatest": "查看最新版本", "versionCurrent": "最新", "revisionContinue": "继续修订", "revisionCreate": "创建修订", "revisionUnchanged": "暂无修改。请修改正文后再检查发布。", "reviewOutdated": "已有更新版本，请查看最新版本后创建修订。", "historyBack": "返回阅读", "versionHistoryBody": "每次发布保留独立正文，旧版本仍可阅读。"});
  Object.assign(words.en, {"proofSummary": "Signature and chain record", "proofSimulation": "Sample evidence for this prototype. No cryptographic verification or live chain query is performed.", "proofSignature": "Content signature", "proof-valid": "Valid", "proof-unverified": "Not verified", "proof-failed": "Verification failed", "proofConfirmation": "Chain confirmation", "proofSource": "Query sample source", "proofLocalSource": "Publication simulated in this browser", "proofFixtureSource": "Built-in public sample", "proofFailedBody": "The signature does not match. This text could not be verified.", "proofUnverifiedBody": "No verified signature result is available.", "scenario-proof": "Proof signature sample", "scenario-proofConfirmation": "Proof confirmation sample", "scenario-record": "Use this record", "scenario-valid": "Valid sample", "scenario-unverified": "Not verified", "scenario-failed": "Signature mismatch"});
  Object.assign(words.zh, {"proofSummary": "签名与链上记录", "proofSimulation": "以下为原型证据样例，未执行真实密码学验证或链上查询。", "proofSignature": "内容签名", "proof-valid": "有效", "proof-unverified": "未验证", "proof-failed": "验证失败", "proofConfirmation": "链上确认", "proofSource": "查询样例来源", "proofLocalSource": "当前浏览器的发布演示", "proofFixtureSource": "内置公开样例", "proofFailedBody": "签名不匹配，此正文未通过验证。", "proofUnverifiedBody": "当前暂无已验证的签名结果。", "scenario-proof": "Proof 签名样例", "scenario-proofConfirmation": "Proof 确认样例", "scenario-record": "沿用当前记录", "scenario-valid": "有效样例", "scenario-unverified": "未验证", "scenario-failed": "签名不匹配"});
  Object.assign(words.en, {"writerTitle-checking": "Opening your workspace", "writerBody-checking": "Checking which page is editing your content.", "writerTitle-busy": "Your workspace is open in another tab", "writerBody-busy": "Continue editing there, or close that tab and retry here. This keeps your drafts and publication records from replacing each other.", "writerTitle-unavailable": "This page is available for reading", "writerBody-unavailable": "Editing needs a browser that supports coordinating tabs. Open this prototype on localhost or HTTPS in a current browser, then retry."});
  Object.assign(words.zh, {"writerTitle-checking": "正在打开内容工作区", "writerBody-checking": "正在检查当前编辑页面。", "writerTitle-busy": "内容工作区已在另一页打开", "writerBody-busy": "请在原页面继续编辑，或关闭原页面后在此重试，避免草稿和发布记录相互覆盖。", "writerTitle-unavailable": "当前页面可供阅读", "writerBody-unavailable": "编辑需要浏览器支持页面协作。请使用新版浏览器，通过 localhost 或 HTTPS 打开原型后重试。"});
  Object.assign(words.en, {"draftRecovered": "Recovered draft", "draftRecoveredBody": "Your unsaved words are in recovered drafts. Open each draft to check that it saves."});
  Object.assign(words.zh, {"draftRecovered": "恢复草稿", "draftRecoveredBody": "未保存文字已保留在恢复草稿中。请打开草稿，确认保存状态。"});
  Object.assign(words.en, {"readerContents": "On this page", "readerTocExpand": "Expand", "readerTocCollapse": "Collapse"});
  Object.assign(words.zh, {"readerContents": "本文目录", "readerTocExpand": "展开", "readerTocCollapse": "收起"});
  Object.assign(words.en, {"editor-visual": "Visual", "editorVisualBody": "Edit formatted Markdown", "editorTaskToggle": "Toggle task completion", "editorVisualHint": "Edit directly in the text. Visual changes update Markdown formatting; use Source to preserve its exact syntax.", "editorVisualUnsupported": "This text contains syntax that needs to be preserved. Continue in Source to edit the full text.", "editorVisualFailed": "The visual editor could not load. Your text is kept; continue in Source.", "editorOpenSource": "Edit source", "editorVisualLoading": "Loading visual editor", "editorLinkText": "Link text", "editorLinkUrl": "URL (https://, http:// or mailto:)", "editorLinkInvalid": "Enter a valid HTTP, HTTPS or email link.", "editorLinkApply": "Apply link"});
  Object.assign(words.zh, {"editor-visual": "可视化", "editorVisualBody": "编辑排版正文", "editorTaskToggle": "切换任务完成状态", "editorVisualHint": "直接编辑正文。可视化修改会更新 Markdown 排版；需要保留原始写法时使用源码。", "editorVisualUnsupported": "此内容包含需保留的原始语法，请在源码模式编辑全文。", "editorVisualFailed": "可视化编辑器未能加载。全文已保留，可继续使用源码编辑。", "editorOpenSource": "编辑源码", "editorVisualLoading": "正在加载可视化编辑器", "editorLinkText": "链接文字", "editorLinkUrl": "链接地址（https://、http:// 或 mailto:）", "editorLinkInvalid": "请输入有效的 HTTP、HTTPS 或邮件链接。", "editorLinkApply": "应用链接"});
  const api = {en: words.en, zh: words.zh, locales: ['en', 'zh'], keys: Object.keys(words.en)};
  if (typeof module !== 'undefined') module.exports = api;
  else root.OwnwordCopy = api;
})(typeof window !== 'undefined' ? window : globalThis);

// v0.3.0 Artifact interface copy.
Object.assign(window.OwnwordCopy.en, {
  "digitalId": "Digital ID",
  "myArtifacts": "My Artifacts",
  "artifactIntro": "A memorable number. A lasting link to your identity.",
  "artifactManage": "Manage Artifacts",
  "artifactView": "View Artifact",
  "artifactCreate": "Create Artifact",
  "artifactSelect": "Choose from wallet",
  "artifactOptional": "Make your identity memorable.",
  "artifactOptionalBody": "An Artifact is optional. Your identity and words work without one.",
  "numberStable": "Stable",
  "numberAssigned": "Not yet stable",
  "numberPending": "Number pending confirmation",
  "artifactConfirmations": "confirmations",
  "artifactYourCurrent": "Associated with your identity",
  "artifactAssociated": "Associated identity",
  "artifactRecordedIdentity": "Last recorded BAP ID",
  "artifactNoBinding": "No identity currently associated",
  "artifactFilter": "Filter Artifacts",
  "artifactFilter-all": "All",
  "artifactFilter-usable": "Available",
  "artifactFilter-history": "Association history",
  "artifactEmpty": "No Artifacts here yet.",
  "artifactLoading": "Loading Artifacts…",
  "artifactLoadError": "Unable to load Artifacts",
  "artifactLoadErrorBody": "Your assets may still exist. Retry to check the latest information.",
  "artifactGate": "Your identity comes first.",
  "artifactGateBody": "Connect your wallet and complete your published identity to create or associate an Artifact.",
  "artifactSample": "Explore a sample Artifact",
  "artifactBack": "Back to My Artifacts",
  "artifactNotFound": "Artifact not found",
  "artifactLocalScope": "This demo asset may belong to another browser or have been cleared. No on-chain recovery is simulated.",
  "artifactCopyId": "Copy full Inscription ID",
  "artifactCreateBody": "Choose what your Artifact holds. Its number is assigned only after confirmation.",
  "artifactLab": "Artifact scenarios",
  "artifactInventory": "Wallet inventory",
  "artifactList-all": "Multiple Artifacts",
  "artifactList-empty": "No Artifacts",
  "artifactList-error": "Service unavailable"
});
Object.assign(window.OwnwordCopy.zh, {
  "digitalId": "数字 ID",
  "myArtifacts": "我的 Artifact",
  "artifactIntro": "一个可记忆的数字，连接你的身份。",
  "artifactManage": "管理 Artifact",
  "artifactView": "查看 Artifact",
  "artifactCreate": "创建 Artifact",
  "artifactSelect": "选择钱包资产",
  "artifactOptional": "让你的身份更容易记住。",
  "artifactOptionalBody": "Artifact 是可选的，没有它仍可使用身份和发布内容。",
  "numberStable": "稳定",
  "numberAssigned": "尚未稳定",
  "numberPending": "编号待确认",
  "artifactConfirmations": "个确认",
  "artifactYourCurrent": "当前关联你的身份",
  "artifactAssociated": "已关联身份",
  "artifactRecordedIdentity": "上次记录的 BAP ID",
  "artifactNoBinding": "当前没有关联身份",
  "artifactFilter": "筛选 Artifact",
  "artifactFilter-all": "全部",
  "artifactFilter-usable": "可用",
  "artifactFilter-history": "关联历史",
  "artifactEmpty": "这里还没有 Artifact。",
  "artifactLoading": "正在载入 Artifact…",
  "artifactLoadError": "暂时无法加载 Artifact",
  "artifactLoadErrorBody": "这不表示资产不存在。请重试以核实最新信息。",
  "artifactGate": "从你的身份开始。",
  "artifactGateBody": "连接钱包并完成已发布身份的设置，才能创建或关联 Artifact。",
  "artifactSample": "查看样例 Artifact",
  "artifactBack": "返回我的 Artifact",
  "artifactNotFound": "未找到 Artifact",
  "artifactLocalScope": "此演示资产可能在另一浏览器创建，或已清除。本原型不声称可从链上恢复。",
  "artifactCopyId": "复制完整 Inscription ID",
  "artifactCreateBody": "选择 Artifact 承载的内容，编号只在确认后分配。",
  "artifactLab": "Artifact 场景",
  "artifactInventory": "钱包资产列表",
  "artifactList-all": "多个 Artifact",
  "artifactList-empty": "无资产",
  "artifactList-error": "服务不可用"
});

Object.assign(window.OwnwordCopy.en, {
  "artifactReview": "Review your Artifact",
  "artifactReviewBody": "Confirm the content and the identity behind this transaction.",
  "artifactDefaultBinding": "Once its number is assigned, you can authorize linking this Artifact to your current identity.",
  "artifactOldCurrent": "Your previous Current will become a historical association:",
  "artifactNoFees": "Yours Wallet and chain data. No transaction or fee is created.",
  "artifactEdit": "Back to edit",
  "artifactSignCreate": "Sign & Create Artifact",
  "artifactContent": "Content",
  "artifactBuiltIn": "Default content",
  "artifactUpload": "Upload image",
  "artifactImageHint": "One PNG or JPEG, up to 2 MiB. Your original image stays unchanged.",
  "artifactNumberOutside": "The inscription number appears beside your image after confirmation. It is not embedded in it.",
  "artifactName": "Artifact name",
  "artifactNameError": "Use 1–100 Unicode characters after trimming spaces.",
  "artifactImageSize": "Choose an image no larger than 2 MiB. Your previous image is kept.",
  "artifactImageType": "Use a static PNG or JPEG. SVG, HTML and animated files are not supported.",
  "artifactImageDecode": "This image could not be decoded. Your previous selection is kept.",
  "artifactSave": "Save draft",
  "artifactCheckCreate": "Review creation",
  "artifactSaved": "Draft saved in this browser",
  "artifactSaving": "Saving…",
  "artifactUnsaved": "Unsaved changes",
  "artifactSaveFailed": "Draft could not be saved. Keep this page open and retry.",
  "artifactStorage": "Artifact storage",
  "artifactLeave": "Keep your changes?",
  "artifactLeaveBody": "Your latest image and name have not been saved.",
  "artifactSaveLeave": "Save and leave"
});
Object.assign(window.OwnwordCopy.zh, {
  "artifactReview": "检查 Artifact",
  "artifactReviewBody": "确认本次交易的内容与操作身份。",
  "artifactDefaultBinding": "编号分配后，可授权将此 Artifact 关联到当前身份。",
  "artifactOldCurrent": "成功关联后，原数字 ID 将保留为历史关联：",
  "artifactNoFees": "模拟钱包与链上数据，不产生真实交易或费用。",
  "artifactEdit": "返回修改",
  "artifactSignCreate": "签名并创建 Artifact",
  "artifactContent": "内容",
  "artifactBuiltIn": "默认内容",
  "artifactUpload": "上传图片",
  "artifactImageHint": "单张 PNG 或 JPEG，上限 2 MiB。保留原图，不裁剪或压缩。",
  "artifactNumberOutside": "编号确认后显示在图片之外，不写入图片内容。",
  "artifactName": "Artifact 名称",
  "artifactNameError": "去除首尾空格后，名称须为 1–100 个 Unicode 码点。",
  "artifactImageSize": "请选择不超过 2 MiB 的图片，原选择已保留。",
  "artifactImageType": "仅支持静态 PNG 或 JPEG，不支持 SVG、HTML 或动画。",
  "artifactImageDecode": "图片无法解码，原选择已保留。",
  "artifactSave": "保存草稿",
  "artifactCheckCreate": "检查创建",
  "artifactSaved": "草稿已保存在当前浏览器",
  "artifactSaving": "正在保存…",
  "artifactUnsaved": "有未保存的修改",
  "artifactSaveFailed": "草稿保存失败，请保留此页面并重试。",
  "artifactStorage": "Artifact 本地存储",
  "artifactLeave": "保存这些修改？",
  "artifactLeaveBody": "最新图片和名称尚未保存。",
  "artifactSaveLeave": "保存并离开"
});

Object.assign(window.OwnwordCopy.en, {
  "artifactReviewExpired": "The review is out of date. Check the latest information and review again.",
  "artifactUnresolved": "An earlier operation needs verification. Query its result before starting another.",
  "artifactJournalFailed": "The operation record could not be saved. Nothing new will be submitted. If already submitted, query the original operation.",
  "artifactSignatureMismatch": "The signature does not belong to the operation BAP ID. Nothing was submitted.",
  "artifactSignature-invalid": "Identity signature is invalid. Nothing was submitted.",
  "artifactSignature-missing": "Identity signature is missing. Nothing was submitted.",
  "artifactSignature-mismatch": "Identity signature belongs to another BAP ID. Nothing was submitted.",
  "artifactSignature-spend-only": "An input spending signature cannot replace an identity signature. Nothing was submitted.",
  "artifactRejected": "The network rejected this operation. Review before trying again.",
  "artifactNotReceived": "Confirmed not received. You can review and try again.",
  "artifactStillUnknown": "The result is still unknown. Keep the operation record and query again.",
  "artifactAlreadyCurrent": "This is already your Current Artifact.",
  "artifactReview-bind": "Associate with your identity",
  "artifactImpact-bind": "Only a successful association changes your Current. The previous association remains in history.",
  "artifactSign-bind": "Sign & Set Current",
  "artifactKind-create": "Creation transaction",
  "artifactKind-bind": "Association transaction",
  "artifactPhase-authorize": "Waiting for your approval",
  "artifactPhase-signing": "Signing with your identity",
  "artifactPhase-validating": "Checking signature ownership",
  "artifactPhase-submitting": "Submitting the transaction",
  "artifactPhase-unknown": "Result needs verification",
  "artifactPhase-accepted": "Transaction accepted",
  "artifactPhase-failed": "Operation failed",
  "artifactPhase-cancelled": "Operation cancelled",
  "artifactIdentitySignature": "Identity signature",
  "artifactSignatureValid": "Identity signature valid",
  "artifactSignatureScope": "Signed by the BAP identity key effective at this transaction. This is a sample verification, not a real identity check.",
  "artifactAccepted": "Accepted by the network",
  "artifactNetwork": "Network acceptance",
  "artifactConfirmationSeparate": "Confirmation and inscription number are tracked separately.",
  "artifactUnknownBody": "The outcome is unknown. Query this operation; do not submit it or a conflicting action again.",
  "artifactDraftKept": "Your saved draft is kept. No Artifact was created.",
  "artifactAssetKept": "Your Artifact is kept. This operation did not change its association.",
  "artifactCreatedUnbound": "Your Artifact is created. Association is a separate step.",
  "artifactBindingComplete": "This Artifact is now Current. Your previous association is preserved in history.",
  "artifactQueryOperation": "Check operation result",
  "artifactContinueBinding": "Continue to association",
  "artifactReviewAgain": "Review again",
  "artifactAuthorize": "Approve identity signature",
  "artifactScenario-outcome": "Next creation / transfer result",
  "artifactScenario-binding": "Next association result",
  "artifactScenario-query": "Operation query result",
  "artifactScenario-account": "Account change during operation",
  "artifactScenario-success": "Success",
  "artifactScenario-invalid": "Invalid identity signature",
  "artifactScenario-missing": "Missing identity signature",
  "artifactScenario-mismatch": "Signature belongs to another identity",
  "artifactScenario-spend-only": "Input spending signature only",
  "artifactScenario-reject": "Network rejection",
  "artifactScenario-unknown": "Result unknown",
  "artifactScenario-accepted": "Accepted",
  "artifactScenario-not-received": "Definitely not received",
  "artifactScenario-none": "No change",
  "artifactScenario-authorize-switch": "Switch while awaiting approval",
  "artifactScenario-submitting-switch": "Switch after submission",
  "artifactEligibility-origin-invalid": "Origin is no longer valid.",
  "artifactEligibility-unverified": "Ownership needs verification. Try refreshing.",
  "artifactEligibility-not-owned": "The current wallet does not control this output."
});
Object.assign(window.OwnwordCopy.zh, {
  "artifactReviewExpired": "确认内容已过期，请读取最新信息后重新确认。",
  "artifactUnresolved": "此前操作的结果待核实，请先查询，不能再次提交。",
  "artifactJournalFailed": "操作记录保存失败，不提交新操作；若已提交，请查询原操作结果。",
  "artifactSignatureMismatch": "签名不属于操作 BAP ID，未提交交易。",
  "artifactSignature-invalid": "身份签名无效，未提交交易。",
  "artifactSignature-missing": "缺少身份签名，未提交交易。",
  "artifactSignature-mismatch": "身份签名归属另一 BAP ID，未提交交易。",
  "artifactSignature-spend-only": "输入花费签名不能代替身份签名，未提交交易。",
  "artifactRejected": "网络明确拒绝本次操作，请重新检查后再试。",
  "artifactNotReceived": "已核实未接收，可以重新检查后执行。",
  "artifactStillUnknown": "结果仍未知，请保留原操作记录并继续查询。",
  "artifactAlreadyCurrent": "这已是当前 Artifact，无需重复授权。",
  "artifactReview-bind": "关联到你的身份",
  "artifactImpact-bind": "只有关联成功才替换当前数字 ID，原关联保留在历史中。",
  "artifactSign-bind": "签名并设为当前数字 ID",
  "artifactKind-create": "创建交易",
  "artifactKind-bind": "关联交易",
  "artifactPhase-authorize": "等待钱包授权",
  "artifactPhase-signing": "正在进行身份签名",
  "artifactPhase-validating": "正在验证签名归属",
  "artifactPhase-submitting": "正在提交交易",
  "artifactPhase-unknown": "结果待核实",
  "artifactPhase-accepted": "交易已接收",
  "artifactPhase-failed": "操作失败",
  "artifactPhase-cancelled": "操作已取消",
  "artifactIdentitySignature": "身份签名",
  "artifactSignatureValid": "身份签名有效",
  "artifactSignatureScope": "使用交易发生时有效的 BAP 身份签名密钥。这里是模拟验证，不是现实身份认证。",
  "artifactAccepted": "网络已接收",
  "artifactNetwork": "网络接收结果",
  "artifactConfirmationSeparate": "链上确认与铭文编号分别追踪。",
  "artifactUnknownBody": "操作结果未知。请查询此操作，不要重复提交或执行冲突操作。",
  "artifactDraftKept": "已保存草稿保留，未创建 Artifact。",
  "artifactAssetKept": "Artifact 保留，本次操作未改变其关联。",
  "artifactCreatedUnbound": "Artifact 已创建，关联为当前数字 ID 是独立步骤。",
  "artifactBindingComplete": "此 Artifact 已作为当前数字 ID，原关联已保留在历史中。",
  "artifactQueryOperation": "查询操作结果",
  "artifactContinueBinding": "继续检查关联",
  "artifactReviewAgain": "重新检查",
  "artifactAuthorize": "授权身份签名",
  "artifactScenario-outcome": "下一次创建 / 转移结果",
  "artifactScenario-binding": "下一次关联结果",
  "artifactScenario-query": "操作查询结果",
  "artifactScenario-account": "操作期间账户变化",
  "artifactScenario-success": "成功",
  "artifactScenario-invalid": "身份签名无效",
  "artifactScenario-missing": "缺少身份签名",
  "artifactScenario-mismatch": "签名归属不匹配",
  "artifactScenario-spend-only": "只有输入花费签名",
  "artifactScenario-reject": "网络明确拒绝",
  "artifactScenario-unknown": "结果未知",
  "artifactScenario-accepted": "已接收",
  "artifactScenario-not-received": "明确未接收",
  "artifactScenario-none": "不变化",
  "artifactScenario-authorize-switch": "授权时切换账户",
  "artifactScenario-submitting-switch": "提交后切换账户",
  "artifactEligibility-origin-invalid": "Origin 不再有效。",
  "artifactEligibility-unverified": "所有权待核实，请刷新。",
  "artifactEligibility-not-owned": "当前钱包不控制此输出。"
});

Object.assign(window.OwnwordCopy.en,{
  "artifactSafePlaceholder": "Preview unavailable for this content type.",
  "artifactPreviewUnavailable": "Preview unavailable",
  "artifactPreviewFailed": "This image could not be loaded. Known identifiers remain available.",
  "artifactContent": "Inscribed content",
  "artifactMetadata": "Current metadata · MAP",
  "artifactCreator": "Creator · BAP ID",
  "artifactOwner": "Current owner · address",
  "artifactSigner": "Transaction signer · address",
  "artifactOperationIdentity": "Operation identity · BAP ID",
  "copyField": "Copy full {field}", "artifactCopyFull": "Copy full value",
  "artifactProof-valid": "Identity signature valid",
  "artifactProof-unverified": "Identity signature not verified",
  "artifactProof-invalid": "Identity signature invalid",
  "artifactHistoricalKey": "Historical signature: verified with the identity key effective when this transaction was signed. Later key rotation does not invalidate it.",
  "artifactEffectiveKey": "Key used: the BAP identity signing key effective at signing.",
  "artifactDataSource": "Source: deterministic local sample; no live chain verification.",
  "artifactHistory": "Association history",
  "artifactContentName": "Name at creation",
  "artifactContentType": "Original content type",
  "artifactOrdinal": "Ordinal Number · satoshi position",
  "artifactLink": "Permanent Artifact link",
  "artifactOpenIdentity": "View associated identity",
  "artifactProof": "Proof & transaction records",
  "artifactScenario-preview": "Existing content preview",
  "artifactScenario-record": "Original record",
  "artifactScenario-html": "Unsupported HTML",
  "artifactScenario-svg": "Unsupported external SVG",
  "artifactScenario-damaged": "Image cannot load",
  "artifactScenario-metadata": "Markup in metadata",
  "artifactUnknownOrdinal": "Not resolved",
  "artifactShare": "Copy Artifact link",
  "artifactRefreshPreview": "Retry preview"
});

Object.assign(window.OwnwordCopy.zh,{
  "artifactSafePlaceholder": "此内容类型不提供预览。",
  "artifactPreviewUnavailable": "预览不可用",
  "artifactPreviewFailed": "图片加载失败，已知标识仍可查看。",
  "artifactContent": "铭文内容",
  "artifactMetadata": "当前元数据 · MAP",
  "artifactCreator": "创建者 · BAP ID",
  "artifactOwner": "当前持有人 · 地址",
  "artifactSigner": "交易签名者 · 地址",
  "artifactOperationIdentity": "操作身份 · BAP ID",
  "copyField": "复制完整{field}", "artifactCopyFull": "复制完整值",
  "artifactProof-valid": "身份签名有效",
  "artifactProof-unverified": "身份签名未验证",
  "artifactProof-invalid": "身份签名无效",
  "artifactHistoricalKey": "历史签名：按签名发生时有效的身份密钥验证。后续密钥轮换不使历史签名失效。",
  "artifactEffectiveKey": "使用签名发生时有效的 BAP 身份签名密钥。",
  "artifactDataSource": "来源：本地确定性样例，未进行真实链上验证。",
  "artifactHistory": "关联历史",
  "artifactContentName": "创建时名称",
  "artifactContentType": "原始内容类型",
  "artifactOrdinal": "Ordinal Number · 聪的位置",
  "artifactLink": "Artifact 固定链接",
  "artifactOpenIdentity": "查看关联身份",
  "artifactProof": "Proof 与交易记录",
  "artifactScenario-preview": "已有资产内容预览",
  "artifactScenario-record": "原始记录",
  "artifactScenario-html": "不支持的 HTML",
  "artifactScenario-svg": "不支持的外部 SVG",
  "artifactScenario-damaged": "图片加载失败",
  "artifactScenario-metadata": "元数据含 HTML",
  "artifactUnknownOrdinal": "尚未解析",
  "artifactShare": "复制 Artifact 链接",
  "artifactRefreshPreview": "重试预览"
});

Object.assign(window.OwnwordCopy.en,{
  "artifactScenario-number": "Next number refresh",
  "artifactScenario-pending": "Not in a block",
  "artifactScenario-resolving": "Confirmed, number resolving",
  "artifactScenario-five": "5 confirmations",
  "artifactScenario-six": "6 confirmations",
  "artifactScenario-reorg": "Reorganization detected",
  "artifactScenario-changed": "Re-resolved as #166 · 2 confirmations",
  "artifactScenario-error": "Query unavailable",
  "artifactNumber-pending": "Inscription Number pending confirmation",
  "artifactNumber-resolving": "Resolving inscription number",
  "artifactNumber-assigned": "Not yet stable",
  "artifactNumber-stable": "Stable",
  "artifactNumber-reorg": "Number being verified after reorganization",
  "artifactNumber-unverified": "Number status not verified",
  "artifactLastNumber": "Last observed number · historical only",
  "artifactNumberChanged": "Number changed; check before sharing",
  "artifactInscriptionConfirmations": "Inscription transaction confirmations",
  "artifactLastObserved": "Last successful observation",
  "artifactRefreshNumber": "Refresh status",
  "artifactRefreshed": "Status updated",
  "artifactCopyNumber": "Copy inscription number"
});

Object.assign(window.OwnwordCopy.zh,{
  "artifactScenario-number": "下次编号刷新",
  "artifactScenario-pending": "尚未入块",
  "artifactScenario-resolving": "已确认，编号解析中",
  "artifactScenario-five": "5 个确认",
  "artifactScenario-six": "6 个确认",
  "artifactScenario-reorg": "检测到重组",
  "artifactScenario-changed": "重新解析为 #166 · 2 个确认",
  "artifactScenario-error": "查询暂不可用",
  "artifactNumber-pending": "Inscription Number 待确认",
  "artifactNumber-resolving": "编号解析中",
  "artifactNumber-assigned": "尚未稳定",
  "artifactNumber-stable": "稳定",
  "artifactNumber-reorg": "重组后编号重新核实中",
  "artifactNumber-unverified": "编号状态待核实",
  "artifactLastNumber": "上次编号，仅作历史信息",
  "artifactNumberChanged": "编号已变化，分享前请核对",
  "artifactInscriptionConfirmations": "铭文交易确认数",
  "artifactLastObserved": "最近一次成功观测",
  "artifactRefreshNumber": "刷新状态",
  "artifactRefreshed": "状态已更新",
  "artifactCopyNumber": "复制铭文编号"
});

Object.assign(window.OwnwordCopy.en,{artifactCachedConfirmations:"Last observed inscription confirmations · not currently verified"});
Object.assign(window.OwnwordCopy.zh,{artifactCachedConfirmations:"上次观测的铭文确认数 · 当前待核实"});

Object.assign(window.OwnwordCopy.en,{
  "artifactSetCurrent": "Review & Set Current",
  "artifactSelectBody": "Choose an Artifact you control. Your current association changes only after the new association succeeds.",
  "artifactSelect-held": "Held by this wallet",
  "artifactSelect-associated": "Association history",
  "artifactScenarioTarget": "Target Artifact",
  "artifactScenarioFacts": "Ownership & association facts",
  "artifactFact-normal": "Verified facts",
  "artifactFact-unknown": "Temporarily unable to verify",
  "artifactFact-owner": "Ownership changes to another wallet",
  "artifactFact-origin": "Origin invalid",
  "artifactFact-outpoint": "Current output changes",
  "artifactFact-concurrent": "Association changes after Review",
  "artifactApplyFacts": "Apply sample facts",
  "artifactScenarioApplied": "Sample facts applied",
  "artifactEligibility-duplicate": "Association uniqueness needs resolution."
});

Object.assign(window.OwnwordCopy.zh,{
  "artifactSetCurrent": "设为当前数字 ID",
  "artifactSelectBody": "选择当前钱包可控制的 Artifact。新关联成功后，才替换当前数字 ID。",
  "artifactSelect-held": "当前钱包持有",
  "artifactSelect-associated": "关联历史",
  "artifactScenarioTarget": "目标 Artifact",
  "artifactScenarioFacts": "所有权与关联事实",
  "artifactFact-normal": "已核实事实",
  "artifactFact-unknown": "暂时无法核实",
  "artifactFact-owner": "控制权变为另一钱包",
  "artifactFact-origin": "Origin 失效",
  "artifactFact-outpoint": "当前输出变化",
  "artifactFact-concurrent": "确认后关联变化",
  "artifactApplyFacts": "应用样例事实",
  "artifactScenarioApplied": "已应用样例事实",
  "artifactEligibility-duplicate": "关联不满足唯一性。"
});

Object.assign(window.OwnwordCopy.en,{
  "artifactAssociationUnverified": "Association needs verification",
  "artifactAssociationInvalid": "Current association is unavailable",
  "artifactBinding-not-owned": "The current output is no longer controlled by this identity’s wallet.",
  "artifactBinding-origin-invalid": "The Origin is no longer valid.",
  "artifactBinding-duplicate": "This association does not meet the uniqueness rule.",
  "artifactBinding-unverified": "Temporarily unable to verify ownership or association. This is not a confirmed loss of ownership.",
  "artifactIdentityUnaffected": "Your BAP Identity, content and relationships remain unchanged.",
  "artifactReplace": "Choose another Artifact",
  "artifactRemove": "Remove association",
  "artifactReview-remove": "Remove this association?",
  "artifactImpact-remove": "This changes only the association. It does not destroy the NFT, delete your Identity or transfer the asset.",
  "artifactSign-remove": "Sign & Remove association",
  "artifactKind-remove": "Association removal transaction",
  "artifactRemovalComplete": "Association removed. This identity no longer has a Current Artifact. The asset is preserved.",
  "artifactScenario-ownership": "Next ownership verification",
  "artifactScenario-verified": "Verified",
  "artifactScenario-unavailable": "Service unavailable",
  "artifactFact-duplicate": "Association is not unique"
});

Object.assign(window.OwnwordCopy.zh,{
  "artifactAssociationUnverified": "关联待核实",
  "artifactAssociationInvalid": "当前关联不可用",
  "artifactBinding-not-owned": "当前输出已不受该身份的钱包控制。",
  "artifactBinding-origin-invalid": "Origin 已失效。",
  "artifactBinding-duplicate": "此关联不满足唯一性约束。",
  "artifactBinding-unverified": "暂时无法核实所有权或关联，尚不能确定控制权已丢失。",
  "artifactIdentityUnaffected": "BAP Identity、内容与关系保持不变。",
  "artifactReplace": "选择其他 Artifact",
  "artifactRemove": "移除关联",
  "artifactReview-remove": "移除此关联？",
  "artifactImpact-remove": "只改变关联，不销毁 NFT，不删除 Identity，也不转移资产。",
  "artifactSign-remove": "签名并移除关联",
  "artifactKind-remove": "移除关联交易",
  "artifactRemovalComplete": "关联已移除，此身份不再使用该数字 ID。资产仍保留。",
  "artifactScenario-ownership": "下次所有权核实",
  "artifactScenario-verified": "核实成功",
  "artifactScenario-unavailable": "服务暂不可用",
  "artifactFact-duplicate": "关联不满足唯一性"
});

Object.assign(window.OwnwordCopy.en,{
  "artifactTransfer": "Transfer Artifact",
  "artifactTransferIntro": "Send this Artifact to a wallet address. BAP Identity, content and relationships do not transfer with it.",
  "artifactRecipient": "Recipient address",
  "artifactRecipientSample": "Use recipient example",
  "artifactAddressHint": "Use a BSV Mainnet address. BAP IDs and inscription numbers are not recipient addresses.",
  "artifactAddressInvalid": "Enter a BSV Mainnet sample address, not a BAP ID or inscription number.",
  "artifactSampleAddressOnly": "This prototype supports only the displayed sample addresses.",
  "artifactWrongNetwork": "This sample is configured for BSV Mainnet.",
  "artifactReviewTransfer": "Check latest output & Review",
  "artifactReview-transfer": "Review this transfer",
  "artifactImpact-transfer": "Transfer the NFT to the full recipient address below. Ownership and association will be checked after acceptance. Identity, content and relationships stay with the original BAP ID.",
  "artifactSign-transfer": "Sign & transfer",
  "artifactKind-transfer": "Transfer transaction",
  "artifactTransferPending": "Transaction accepted. Ownership and association are being verified.",
  "artifactTransferVerified": "Ownership verified. The original association, if no longer valid, is preserved in history. No recipient identity was automatically associated.",
  "artifactVerifyOwnership": "Verify ownership & association",
  "artifactTransferConfirmations": "Transfer transaction confirmations",
  "artifactLastOwner": "Last observed owner · verification pending",
  "artifactTransferBlocked": "Ownership must be verified before another transfer or association.",
  "artifactLatestOutput": "Current output will be checked before Review and again before signing."
});

Object.assign(window.OwnwordCopy.zh,{
  "artifactTransfer": "转移 Artifact",
  "artifactTransferIntro": "将此 Artifact 转给钱包地址。BAP Identity、内容和关系不随资产转移。",
  "artifactRecipient": "接收地址",
  "artifactRecipientSample": "使用收款地址样例",
  "artifactAddressHint": "请使用 BSV 主网地址。BAP ID 和铭文编号不能作为接收地址。",
  "artifactAddressInvalid": "请输入 BSV 主网样例地址，不能使用 BAP ID 或铭文编号。",
  "artifactSampleAddressOnly": "本原型只支持展示的样例地址。",
  "artifactWrongNetwork": "当前样例仅配置 BSV 主网。",
  "artifactReviewTransfer": "检查转移",
  "artifactReview-transfer": "检查转移",
  "artifactImpact-transfer": "将 NFT 转给下方完整接收地址。接收后核实所有权与关联；Identity、内容和关系保留在原 BAP ID。",
  "artifactSign-transfer": "签名并转移",
  "artifactKind-transfer": "转移交易",
  "artifactTransferPending": "交易已接收，所有权与关联待核实。",
  "artifactTransferVerified": "所有权已核实。原关联不再有效时已转入历史，未自动关联接收者身份。",
  "artifactVerifyOwnership": "核实所有权与关联",
  "artifactTransferConfirmations": "转移交易确认数",
  "artifactLastOwner": "上次观测的持有人 · 当前待核实",
  "artifactTransferBlocked": "所有权核实前，不能再次转移或设置关联。",
  "artifactLatestOutput": "确认前和签名前，均核查资产是否仍可转移。"
});

Object.assign(window.OwnwordCopy.en,{
  "artifactFind": "Find identity",
  "artifactFindTitle": "Find identity",
  "artifactFindIntro": "Look up a public identity by its digital ID or BAP ID.",
  "artifactFindLabel": "Digital ID or BAP ID",
  "artifactFindSubmit": "Find",
  "artifactFindHint": "Enter the complete ID. Numbers can start with #.",
  "artifactFindInvalid": "Enter whole decimal digits, optionally preceded by one #, or a full BAP ID.",
  "artifactFindLeadingZero": "Remove leading zeros; for example, use 165 instead of 0165.",
  "artifactFind-asset": "Looking up the Artifact…",
  "artifactFind-binding": "Verifying its association…",
  "artifactFind-not-found": "No matching identity or Artifact found.",
  "artifactFind-error": "Lookup is temporarily unavailable. Your input is kept; try again.",
  "artifactFind-unverified": "The number mapping needs verification. Retry after reorganization or indexing completes.",
  "artifactFind-unassociated": "Artifact found. No identity is currently associated.",
  "artifactScenario-lookup": "Identity lookup result",
  "artifactScenario-normal": "Normal",
  "artifactReset": "Reset Artifact demo data",
  "artifactResetBody": "Clear v0.3.0 Artifact drafts, uploaded images, local assets, associations and operation records in this browser, then restore sample Artifacts. Earlier identity and content storage will be kept.",
  "artifactResetConfirm": "Clear & restore samples",
  "artifactResetComplete": "Artifact sample data restored.",
  "artifactResetImagesFailed": "Artifact records were reset, but image cleanup failed. Retry to finish cleanup."
});

Object.assign(window.OwnwordCopy.zh,{
  "artifactFind": "查找身份",
  "artifactFindTitle": "查找身份",
  "artifactFindIntro": "通过数字 ID 或 BAP ID，查找公开身份。",
  "artifactFindLabel": "数字 ID 或 BAP ID",
  "artifactFindSubmit": "查找",
  "artifactFindHint": "请输入完整 ID，数字编号可带 # 前缀。",
  "artifactFindInvalid": "请输入十进制整数，可带一个 # 前缀，或输入完整 BAP ID。",
  "artifactFindLeadingZero": "请去除前导零，例如使用 165 而不是 0165。",
  "artifactFind-asset": "正在查找资产…",
  "artifactFind-binding": "正在核实关联…",
  "artifactFind-not-found": "未找到匹配的身份或 Artifact。",
  "artifactFind-error": "查找暂不可用。输入已保留，请重试。",
  "artifactFind-unverified": "编号映射待核实，请在重组或索引解析完成后重试。",
  "artifactFind-unassociated": "已找到 Artifact，当前没有关联身份。",
  "artifactScenario-lookup": "身份查找结果",
  "artifactScenario-normal": "正常",
  "artifactReset": "重置 Artifact 演示数据",
  "artifactResetBody": "清除此浏览器中的 v0.3.0 Artifact 草稿、上传图片、本地资产、关联及操作记录，恢复样例资产。旧版身份与内容存储会保留。",
  "artifactResetConfirm": "清除并恢复样例",
  "artifactResetComplete": "Artifact 样例数据已恢复。",
  "artifactResetImagesFailed": "Artifact 记录已重置，但图片清理失败，请重试完成清理。"
});

Object.assign(window.OwnwordCopy.en,{artifactSignatureScope:"Each transaction requires a signature from the BAP identity key effective at that transaction. "});
Object.assign(window.OwnwordCopy.zh,{artifactSignatureScope:"每笔交易均须使用当时有效的 BAP 身份签名密钥。"});

Object.assign(window.OwnwordCopy.en,{navigationLabel:'Main navigation',artifactCurrent:'Current',artifactAssociatedTitle:'Associated identity',artifactSelectEyebrow:'Current digital ID',artifactLocale:'en-US'});
Object.assign(window.OwnwordCopy.zh,{navigationLabel:'主导航',artifactCurrent:'当前使用',artifactAssociatedTitle:'关联身份',artifactSelectEyebrow:'当前数字 ID',artifactLocale:'zh-CN'});

Object.assign(window.OwnwordCopy.en,{artifactTransferPendingTitle:'Transfer received',artifactTransferVerifiedTitle:'Transfer verified'});
Object.assign(window.OwnwordCopy.zh,{artifactTransferPendingTitle:'转移已接收',artifactTransferVerifiedTitle:'转移已核实'});

Object.assign(window.OwnwordCopy.en,{
  artifactHistoryHelp:'About previous associations',artifactHistoryHelpBody:'Records of earlier associations. An Artifact may still be held by this wallet.',artifactAssociationHelp:'About this association',artifactActionHelp:'What changes?',artifactSignatureHelp:'About the signature',artifactConfirmationHelp:'About confirmations',artifactTransactionDetails:'Transaction details',artifactReplacing:'Replaces digital ID',artifactTransferConsequence:'You will transfer control of this Artifact to the recipient.',artifactRemoveConsequence:'This digital ID will no longer point to your identity.',artifactCreationHelp:'About creating an Artifact',artifactAddressHelp:'Address requirements',artifactTransferHelp:'About this transfer'
});
Object.assign(window.OwnwordCopy.zh,{
  artifactHistoryHelp:'历史关联说明',artifactHistoryHelpBody:'记录曾经的身份关联。历史关联中的 Artifact 仍可能由当前钱包持有。',artifactAssociationHelp:'关联说明',artifactActionHelp:'操作说明',artifactSignatureHelp:'签名说明',artifactConfirmationHelp:'确认说明',artifactTransactionDetails:'交易详情',artifactReplacing:'替换当前数字 ID',artifactTransferConsequence:'转移后，此 Artifact 将由接收方控制。',artifactRemoveConsequence:'移除后，此数字 ID 将不再指向你的身份。',artifactCreationHelp:'创建说明',artifactAddressHelp:'地址要求',artifactTransferHelp:'转移说明'
});

Object.assign(window.OwnwordCopy.en,{rotationCompleteStatus:'Completed',identitySecurity:'Identity security',rotateKey:'Rotate key',rotationReview:'Review key rotation',rotationBody:'Update the key your wallet uses to sign for this identity.',rotationImpact:'Authorize a new signing key for this identity. Your BAP ID and profile will not change.',rotationStableId:'Your BAP ID will not change.',rotationStableProfile:'Your profile, published words and relationships stay with this identity.',rotationHistory:'New signatures use the updated key. Earlier signatures are verified using the key that was valid when they were signed.',rotationAuthorize:'Authorize key rotation',rotating:'Rotating…',rotationCompleted:'Key rotation completed',rotationCompletedBody:'The signing key has been updated for this identity.',rotationCancelled:'Rotation cancelled',rotationFailed:'Key rotation did not complete',rotationFailedBody:'The current signing key and identity are unchanged. Review the rotation before trying again.'});
Object.assign(window.OwnwordCopy.zh,{rotationCompleteStatus:'已完成',identitySecurity:'身份安全',rotateKey:'轮换密钥',rotationReview:'核对密钥轮换',rotationBody:'更新钱包为此身份签名时使用的密钥。',rotationImpact:'授权为此身份更新签名密钥。BAP ID 和身份资料保持不变。',rotationStableId:'你的 BAP ID 保持不变。',rotationStableProfile:'身份资料、已发布内容和关系仍属于此身份。',rotationHistory:'新签名使用更新后的密钥；历史签名按签名时有效的密钥验证。',rotationAuthorize:'授权密钥轮换',rotating:'正在轮换…',rotationCompleted:'密钥轮换已完成',rotationCompletedBody:'此身份使用的签名密钥已更新。',rotationCancelled:'轮换已取消',rotationFailed:'密钥轮换未完成',rotationFailedBody:'当前签名密钥和身份保持不变，请核对轮换后重试。'});
Object.assign(window.OwnwordCopy.en,{draftManage:'Manage draft',startUsing:'Get started',switchWorkspace:'Switch workspace',identityNavDescription:'Profile and identifiers',artifactNavDescription:'Digital ID and assets',contentNavDescription:'Drafts and publications',appearanceLanguage:'Appearance & language',disconnectWallet:'Disconnect wallet',viewPublicIdentity:'View public profile',identityIdentifiers:'Identity identifiers',digitalIdNotSet:'Not linked',chooseDigitalId:'Set up a digital ID',reviewAssociation:'Review association'});
Object.assign(window.OwnwordCopy.zh,{draftManage:'管理草稿',startUsing:'开始使用',switchWorkspace:'切换工作区',identityNavDescription:'资料与身份标识',artifactNavDescription:'数字 ID 与资产',contentNavDescription:'草稿与已发布内容',appearanceLanguage:'外观与语言',disconnectWallet:'断开钱包',viewPublicIdentity:'查看公开身份',identityIdentifiers:'身份标识',digitalIdNotSet:'尚未关联',chooseDigitalId:'设置数字 ID',reviewAssociation:'检查关联'});

Object.assign(window.OwnwordCopy.en,{
 'artifactWriterTitle-checking':'Opening Artifact workspace','artifactWriterBody-checking':'Checking the editing session.',
 'artifactWriterTitle-busy':'Another tab is editing Artifacts','artifactWriterBody-busy':'Finish or leave the Artifact workspace in that tab. This page will resume automatically, keeping your drafts and transactions safe.',
 'artifactWriterTitle-unavailable':'Artifact editing is unavailable','artifactWriterBody-unavailable':'Open this prototype in a browser that supports coordinating tabs, then retry.',
 'artifactResult-create':'Artifact created','artifactResult-bind':'Digital ID updated','artifactResult-remove':'Association removed','artifactResult-transfer':'Transfer submitted',
 artifactSigned:'Signed',artifactSubmitted:'Submitted to the network',artifactSubmissionMeaning:'The transaction was submitted to the network. This does not confirm inclusion in a block. The digital ID becomes stable after 6 confirmations of its inscription transaction; transfer confirmations are separate.',
 artifactAwaitNumber:'Waiting for the inscription number. You can link this Artifact once its number is available.',artifactReadyToLink:'Your digital ID is ready to link.',
 'artifactEligibility-number-pending':'Wait for a verified inscription number before linking.',
 'artifactSelect-history':'Previously linked',artifactHistoryEmpty:'No previous associations.',artifactAssociationEmpty:'This Artifact does not currently identify a BAP identity.',
 'artifactNumber-pending':'Number pending','artifactNumber-resolving':'Resolving number',
 'writerBody-busy':'Finish or leave the content workspace in the other tab. This page will resume automatically.'
});
Object.assign(window.OwnwordCopy.zh,{
 'artifactWriterTitle-checking':'正在打开 Artifact 工作区','artifactWriterBody-checking':'正在检查编辑会话。',
 'artifactWriterTitle-busy':'另一页面正在操作 Artifact','artifactWriterBody-busy':'请在原页面完成操作或离开 Artifact 工作区。此页面会自动恢复，避免覆盖草稿和交易记录。',
 'artifactWriterTitle-unavailable':'暂时无法编辑 Artifact','artifactWriterBody-unavailable':'请使用支持页面协作的浏览器打开原型后重试。',
 'artifactResult-create':'Artifact 已创建','artifactResult-bind':'数字 ID 已更新','artifactResult-remove':'关联已移除','artifactResult-transfer':'转移已提交',
 artifactSigned:'已签名',artifactSubmitted:'已提交到网络',artifactSubmissionMeaning:'交易已提交到网络，尚不代表已写入区块。数字 ID 在其铭文交易达到 6 个确认后稳定；转移交易的确认数单独计算。',
 artifactAwaitNumber:'正在等待铭文编号，编号可用后即可关联为数字 ID。',artifactReadyToLink:'数字 ID 已可用，可以继续关联。',
 'artifactEligibility-number-pending':'编号确认后才可设为当前数字 ID。',
 'artifactSelect-history':'历史关联',artifactHistoryEmpty:'暂无历史关联。',artifactAssociationEmpty:'此 Artifact 当前不用于标识任何 BAP 身份。',
 'artifactNumber-pending':'编号待确认','artifactNumber-resolving':'编号解析中',
 'writerBody-busy':'请在另一页完成编辑或离开内容工作区，此页面会自动恢复。'
});

Object.assign(window.OwnwordCopy.en,{
 readerViewAuthor:'View author profile',readerLoading:'Loading words',readerLoadFailed:'These words could not load. Try again.',editorBundleLoading:'Loading editor',editorBundleFailed:'The editor could not load. Your draft is kept; try again.',
 artifactRecords:'Artifact details','artifactTab-content':'Content','artifactTab-ownership':'Ownership','artifactTab-proof':'Proof','artifactTab-history':'History',artifactCurrentId:'Current digital ID',artifactChooseFromWallet:'Choose an Artifact from your wallet to link a digital ID.',artifactNoOtherAssets:'No other Artifacts in this wallet.',artifactOwnership:'Ownership & display name',
 'artifactHistory-replaced':'Replaced as current digital ID','artifactHistory-removed':'Association removed','artifactHistory-transferred':'Association ended after transfer','artifactHistory-ended':'Association ended',artifactHistoryReplacement:'Replaced by',artifactHistoryTimeUnknown:'End time not recorded'
});
Object.assign(window.OwnwordCopy.zh,{
 readerViewAuthor:'查看作者身份',readerLoading:'正在加载正文',readerLoadFailed:'正文暂时无法加载，请重试。',editorBundleLoading:'正在加载编辑器',editorBundleFailed:'编辑器暂时无法加载。草稿已保留，请重试。',
 artifactRecords:'Artifact 详情','artifactTab-content':'内容','artifactTab-ownership':'持有','artifactTab-proof':'凭证','artifactTab-history':'历史',artifactCurrentId:'当前数字 ID',artifactChooseFromWallet:'从钱包中选择 Artifact，关联你的数字 ID。',artifactNoOtherAssets:'钱包中没有其他 Artifact。',artifactOwnership:'持有与展示信息',
 'artifactHistory-replaced':'已更换数字 ID','artifactHistory-removed':'已移除关联','artifactHistory-transferred':'转出后关联结束','artifactHistory-ended':'关联已结束',artifactHistoryReplacement:'更换为',artifactHistoryTimeUnknown:'未记录结束时间'
});

Object.assign(window.OwnwordCopy.en,{readerMediaFailed:'Some media could not be loaded. The text and its source remain available.'});
Object.assign(window.OwnwordCopy.zh,{readerMediaFailed:'部分媒体暂时无法读取，正文及已知来源仍可阅读。'});
