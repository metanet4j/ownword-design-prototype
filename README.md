# OwnWord 官方组件改造版

独立分支 `codex/prototype-official-s2`，基于 v0.4.0 提交 `5b3cdf8`。包含 v0.1.0 身份、v0.2.0 内容、v0.3.0 Artifact、v0.4.0 个人主页。产品事实和流程继续遵循核心认知及当前 v0.4.0 PRD。

## 预览与启动

在上级任务目录运行 `./init.sh --serve`，打开 <http://127.0.0.1:4315/>。个人主页为 <http://127.0.0.1:4315/#/identity/2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD>。

直接浏览已提交产物不需要安装依赖。开发时运行 `npm ci`，修改后运行 `npm run build`；`npm run check` 核对生产构建来源、输入及产物哈希，并验证四模块模型。`npm run verify:browser` 使用 agent-browser 独立会话验收当前迁移；要求 4315 预览正在运行。

## 当前视觉布局

[本轮前后对照](visual-review.html)展示身份编辑和关系确认。[阅读与详情](visual-review-v4.html)、[筛选与手机列表](visual-review-v3.html)、[身份与作品层级](visual-review-v2.html)保留此前对照。

身份表单的名称与类型由官方组件生成必填标记，个人／组织使用官方 RadioGroup 与 Radio 表达互斥选择。编辑页的 BAP ID 和发布状态组成紧凑上下文，复用 Identifier／CopyButton。关系确认先展示双方身份，再展示关系规则与公开影响；双方完整标识可换行和复制，缺少展示名时直接呈现标识，说明保留在弹层正文。

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

官方组件迁移证据位于 `evidence/official-s2/verification.json`。本轮视觉调整证据位于 `evidence/official-s2/visual-v5/verification.json` 和对应截图，覆盖身份单选键盘、必填、取消保留、无改动、复制与字段错误、创建共用字段、双语深色，以及关系确认对象和焦点。此前证据保留在各轮 visual-v2／visual-v3／visual-v4 目录。

迁移验收覆盖四模块主要流程、字段错误、授权取消、文件上传、复制成功和失败、菜单／Tabs 键盘、弹窗焦点、内容读取失败、中文深色，以及桌面和 320px 手机。未穷举原 PRD 的全部 BDD、全部浏览器或全部语言与屏宽组合。

`check-copy.cjs` 是继承的旧脚本，直接 require 浏览器字典时会报 window 未定义；它没有作为本轮迁移门禁。有效命令为上方的 `npm run check` 和 `npm run verify:browser`。继承的旧浏览器脚本指向 4314 和旧 DOM，不代表本次验收结果。

身份、钱包、签名、发布、索引、关系均使用确定性模拟，不产生真实交易。字体依赖官方外部资源，加载失败时使用既有系统字体回退。本轮最终会话记录到 8 条官方字体 CDN 请求失败，业务应用错误为 0；原始记录见 visual-v4/verification.json 和 font-network-observation.json。字体加载稳定性仍待单独处理。图片、视频、音频保留已有素材，出处和许可见 `fixtures/homepage/sources.json`。

实现状态以任务目录的 feature_list.json 为准；用户视觉复核前保持 `needs-review`。
