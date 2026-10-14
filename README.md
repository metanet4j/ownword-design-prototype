# OwnWord 官方组件改造版

独立分支 `codex/prototype-official-s2`，基于 v0.4.0 提交 `5b3cdf8`。包含 v0.1.0 身份、v0.2.0 内容、v0.3.0 Artifact、v0.4.0 个人主页。产品事实和流程继续遵循核心认知及当前 v0.4.0 PRD。

## 预览与启动

在上级任务目录运行 `./init.sh --serve`，打开 <http://127.0.0.1:4315/>。个人主页为 <http://127.0.0.1:4315/#/identity/2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD>。

直接浏览已提交产物不需要安装依赖。开发时运行 `npm ci`，修改后运行 `npm run build`；`npm run check` 核对生产构建来源、输入及产物哈希，并验证四模块模型。`npm run verify:browser` 使用 agent-browser 独立会话验收当前迁移；要求 4315 预览正在运行。

## 当前视觉布局

[本轮前后对照](visual-review.html)展示身份任务、内容确认和 Artifact 创建恢复标题左对齐的效果。[整站验收总览](acceptance-review.html)汇总交付；[上轮中轴与比例](visual-review-v12.html)、[手机首屏](visual-review-v11.html)、[Artifact 核对](visual-review-v9.html)、[身份安全](visual-review-v8.html)和[编辑器](visual-review-v7.html)对照保留。

阅读正文与阅读页头共同居中，修正此前正文中轴向左偏移122px的问题，外侧目录保留220px。页头统一1120px，单栏编辑区960px，双栏仍保留1184px；任务标题、说明、帮助按钮组恢复原有左对齐，正文与字段沿相同阅读方向排列。手机沿用既有布局。

阅读复制与导出使用官方图标操作；Artifact 稳定短编号、复制与状态同行，长编号、未稳定状态、编号变化及复制失败保留展开空间，帮助与刷新成组。三个模块共用 SectionTabs，支持窄屏收敛与恢复桌面；手机草稿标题使用完整行宽，主页作品采用受控媒体窗口。组件内部样式和包源码保持官方来源。

## 官方组件与业务组合

运行时直接打包官方 `@react-spectrum/s2@1.6.0`，配套 `react@19.3.0`、`react-dom@19.3.0`，全部锁定于 package-lock。入口是 `official-s2.jsx`，样式由官方包及其 style 宏生成。原型不再加载 `_ds_bundle` 或本地仿制组件运行时。

- 官方组件负责 Provider、Button、ActionButton、ToggleButton、RadioGroup、Radio、TextField、TextArea、Tooltip、ContextualHelp、Tabs、Link、Card、StatusLight、Skeleton、FileTrigger、Menu、ActionMenu、Popover、Dialog 和操作分组。
- 按钮、字段、弹窗仅保留业务参数适配；官方组件负责内部样式、键盘、禁用、校验和焦点。宽度使用官方 `style()` 的公开布局能力，未修改 node_modules。
- 工作流图标直接导入官方图标组件；返回箭头使用项目绑定的官方 S2 UI SVG。字体由官方 Provider 加载，保留系统回退。
- OwnWord 保留身份、作品、关系、证明、媒体、编辑器和页面布局。业务 Token 别名引用既有 S2 Token；页面 CSS 放在官方组件 CSS 之前的 cascade layer，避免旧控件样式覆盖官方组件。
- 个人主页与列表围绕居中内容轴组织。图片和视频预览保持桌面 160×120px、手机 96×72px；官方 Tabs 在窄屏自动收敛为选择菜单。

原型演练面板中的原生 select／checkbox 是测试场景控制器；媒体播放使用浏览器原生控件，Markdown 使用 CodeMirror／Milkdown。品牌穹顶、完整作品行和媒体入口是业务 HTML 组合。历史品牌探索页及旧验收脚本保留，未列入本次官方运行时交付范围。

## 验收与边界

官方组件迁移证据位于 `evidence/official-s2/verification.json`。本轮证据为 `evidence/official-s2/task-alignment/verification.json`：定向核对三个任务页、320px、中文深色和帮助按钮键盘动作。构建来源与四模块模型检查通过；本轮只撤回任务标题居中规则，未扩大为全站重复验收。

迁移验收覆盖四模块主要流程、字段错误、授权取消、文件上传、复制成功和失败、菜单／Tabs 键盘、弹窗焦点、内容读取失败、中文深色，以及桌面和 320px 手机。未穷举原 PRD 的全部 BDD、全部浏览器或全部语言与屏宽组合。

`check-copy.cjs` 是继承的旧脚本，直接 require 浏览器字典时会报 window 未定义；它没有作为本轮迁移门禁。有效命令为上方的 `npm run check` 和 `npm run verify:browser`。继承的旧浏览器脚本指向 4314 和旧 DOM，不代表本次验收结果。

身份、钱包、签名、发布、索引、关系均使用确定性模拟，不产生真实交易。字体依赖官方外部资源，加载失败时使用既有系统字体回退。本轮浏览器和控制台错误为零；历史字体请求失败保留在各轮原始证据，当前通过不证明外部 CDN 永久稳定。图片、视频、音频保留已有素材，出处和许可见 `fixtures/homepage/sources.json`。

实现状态以任务目录的 feature_list.json 为准；用户视觉复核前保持 `needs-review`。
