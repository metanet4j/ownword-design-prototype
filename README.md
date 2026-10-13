# OwnWord 官方组件改造版

独立分支 `codex/prototype-official-s2`，基于 v0.4.0 提交 `5b3cdf8`。包含 v0.1.0 身份、v0.2.0 内容、v0.3.0 Artifact、v0.4.0 个人主页。产品事实和流程继续遵循核心认知及当前 v0.4.0 PRD。

## 预览与启动

在上级任务目录运行 `./init.sh --serve`，打开 <http://127.0.0.1:4315/>。个人主页为 <http://127.0.0.1:4315/#/identity/2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD>。

直接浏览已提交产物不需要安装依赖。开发时运行 `npm ci`，修改后运行 `npm run build`；`npm run check` 核对生产构建来源、输入及产物哈希，并验证四模块模型。`npm run verify:browser` 使用 agent-browser 独立会话验收当前迁移；要求 4315 预览正在运行。

## 当前视觉布局

[本轮前后对照](visual-review.html)覆盖内容、Artifact 管理页的桌面与 320px 手机；[上一轮对照](visual-review-v2.html)保留个人主页及管理页的身份分组优化。身份主体与标识条分组，复制紧邻协议值；公开作品标题与筛选放在同一行，标题使用 S2 衬线字体，桌面 20px、手机 18px。内容工作区复用 Identifier／CopyButton；Artifact 持有对象使用官方 Card 的 tertiary 变体。

内容、Artifact 与主页复用 SectionTabs，内部采用官方 Tabs／TabList／TabPanel。管理页使用官方常规密度，主页保留 compact 密度；业务容器提供稳定的可用宽度，支持窄屏收敛和恢复桌面展开。手机当前数字 ID 与状态同行，长编号保留换行空间；草稿菜单对齐行首并与文字留出间距，手机标题保留完整行宽。组件内部样式和包源码保持官方来源。

## 官方组件与业务组合

运行时直接打包官方 `@react-spectrum/s2@1.6.0`，配套 `react@19.3.0`、`react-dom@19.3.0`，全部锁定于 package-lock。入口是 `official-s2.jsx`，样式由官方包及其 style 宏生成。原型不再加载 `_ds_bundle` 或本地仿制组件运行时。

- 官方组件负责 Provider、Button、ActionButton、ToggleButton、TextField、TextArea、Tooltip、ContextualHelp、Tabs、Link、Card、StatusLight、Skeleton、FileTrigger、Menu、ActionMenu、Popover、Dialog 和操作分组。
- 按钮、字段、弹窗仅保留业务参数适配；官方组件负责内部样式、键盘、禁用、校验和焦点。宽度使用官方 `style()` 的公开布局能力，未修改 node_modules。
- 工作流图标直接导入官方图标组件；返回箭头使用项目绑定的官方 S2 UI SVG。字体由官方 Provider 加载，保留系统回退。
- OwnWord 保留身份、作品、关系、证明、媒体、编辑器和页面布局。业务 Token 别名引用既有 S2 Token；页面 CSS 放在官方组件 CSS 之前的 cascade layer，避免旧控件样式覆盖官方组件。
- 个人主页与列表围绕居中内容轴组织。图片和视频预览保持桌面 160×120px、手机 96×72px；官方 Tabs 在窄屏自动收敛为选择菜单。

原型演练面板中的原生 select／checkbox 是测试场景控制器；媒体播放使用浏览器原生控件，Markdown 使用 CodeMirror／Milkdown。品牌穹顶、完整作品行和媒体入口是业务 HTML 组合。历史品牌探索页及旧验收脚本保留，未列入本次官方运行时交付范围。

## 验收与边界

官方组件迁移证据位于 `evidence/official-s2/verification.json`。本轮视觉调整证据位于 `evidence/official-s2/visual-v3/verification.json` 和对应截图，覆盖内容与 Artifact 筛选计数、键盘、菜单与帮助焦点、空列表及读取失败重试、手机、双语深色和主页共享 Tabs 回归。上一轮证据保留在 `evidence/official-s2/visual-v2/`。

迁移验收覆盖四模块主要流程、字段错误、授权取消、文件上传、复制成功和失败、菜单／Tabs 键盘、弹窗焦点、内容读取失败、中文深色，以及桌面和 320px 手机。未穷举原 PRD 的全部 BDD、全部浏览器或全部语言与屏宽组合。

`check-copy.cjs` 是继承的旧脚本，直接 require 浏览器字典时会报 window 未定义；它没有作为本轮迁移门禁。有效命令为上方的 `npm run check` 和 `npm run verify:browser`。继承的旧浏览器脚本指向 4314 和旧 DOM，不代表本次验收结果。

身份、钱包、签名、发布、索引、关系均使用确定性模拟，不产生真实交易。字体依赖官方外部资源；离线时使用系统字体。图片、视频、音频保留已有素材，出处和许可见 `fixtures/homepage/sources.json`。

实现状态以任务目录的 feature_list.json 为准；用户视觉复核前保持 `needs-review`。
