# design-astra-001 验收映射

## 范围与依据

- 唯一业务事实来源：[核心认知](../../_task/system-design/spec/核心认知.md)。本文件只记录实现映射、设计取舍与验证证据。
- 版本范围与 BDD：[产品设计 v0.1](../../_task/system-design/spec/prd/v0.1/设计文档v0.1.md)，以第 9 节已填写裁决收窄前文范围。
- 当前任务：[feature_list.json](../../_task/system-design/feature_list.json)，`design-astra-001`。
- 实现交接：[implementation-handoff.md](implementation-handoff.md) 记录状态机契约、模拟点与生产替换清单；本文只记录验收映射与证据。
- 设计来源：[React Spectrum S2](../react-spectrum-s2/readme.md)，独立导入到 [_ds/react-spectrum-s2](_ds/react-spectrum-s2)。资产索引见 [_d_meta.json](_d_meta.json)。
- 未读取、复制或参考其他原型的代码、DOM、CSS、截图；未读取 draft。

## 实现

`index.html` 按 Baoyu Design 导入结果加载 S2 的全部 CSS 依赖及组件 bundle。React、ReactDOM 与 Babel 从 `vendor/` 本地加载（同版本原文件，`integrity` 保留作校验，来源与哈希见 [vendor/README.md](vendor/README.md)），因此启动不依赖 CDN。`components.jsx` 消费其 Button、TextField、TextArea，`app.jsx` 另用 StatusLight、Skeleton。组件源是本地视觉样件；适配层为其返回元素添加受控输入、ARIA、事件及表单提交。弹窗使用浏览器原生 dialog 管理焦点和 Escape，不修改源设计系统。

`app.css` 以 S2 的字体、颜色、语义表面、圆角与间距令牌构成视觉。穹顶由七条 CSS 椭圆线组成，点击空白处、触摸及键盘均可触发依次律动。铁灰地平线无刻度。Public Identity 使用有厚度的 CSS 3D 身份板，支持旋转、拖动、滑块与重置；尊重减少动态效果偏好。

`model.js` 保存原型状态迁移。异步操作携带会话序号；账户切换或断开时清除上下文并使旧回调失效。`app.jsx` 管理计时器和界面状态。头像仅使用本地 blob URL 预览，不定义或伪造上传端点。示例名称、BAP ID 与交易结果均为模拟数据。

## BDD 对应

PRD v0.1 第 5 节、8.8 节与第 9 节裁决共 31 条场景；第 5.7 节 3 条按第 9 节第 5 项裁决下放 v0.1.1，不在原型范围。其余 **28 条**逐条映射如下，断言名与 `evidence/browser-results.json` 的 `checks` 一一对应，模型断言见 `evidence/model-results.txt`。

| PRD 场景 | 断言与证据 |
| --- | --- |
| 5.1 连接成功 | 浏览器 `Connection shows Connected status`；模型 `CONNECTED` 后 `wallet=true`、`page=resolving` |
| 5.1 用户取消 | 浏览器 `Connection cancellation returns to welcome`；模型 `notice=connectCancelled` |
| 5.1 连接失败 | 浏览器 `Connection failure provides retry`；模型 `error=connectFailed` |
| 5.2 切换账户 | 浏览器 `Account switch cancels confirmation and clears old identity`；模型 4 组 `SWITCH` 后旧 `epoch` 回调被丢弃 |
| 5.2 断开连接 | 浏览器流程 `Disconnect` 回到 Welcome；模型 `wallet=false`、`page=welcome` |
| 5.3 已发布完整 → My Identity | 浏览器 `Published identity opens My Identity` |
| 5.3 身份不存在 → Setup | 模型 `connect('new').page=setup`；浏览器 `Invalid required name blocks Review` 前的 setup 路径 |
| 5.3 资料不完整 → Setup + 提示 | 浏览器 `Incomplete identity routes to completion`；模型 `incomplete=true` |
| 5.3 解析失败 | 浏览器 `Resolution failure explains and offers retry or disconnect`；模型 `page=resolve-error` |
| 5.4 核对有效资料 | 浏览器 `My Identity shows avatar, name, type, bio and BAP ID` 前的 Review 路径与 `review` 组检查 |
| 5.4 阻止无效资料 | 浏览器 `Invalid required name blocks Review`、`Name maximum 100 enforced`、`Bio maximum 1000 enforced`；模型 `validate()` 5 组 |
| 5.4 创建成功 | 浏览器 `Creation processing visible`、`ready` 组检查；模型 `RESULT` 后 `page=ready`、`published=true` |
| 5.4 取消创建 | 浏览器 `Escape cancels wallet creation`、`Cancelled creation preserves values`；模型 `createCancelled` |
| 5.4 创建失败 | 浏览器 `Creation failure retains review and retry`；模型 `createFailed` 且 `published=false` |
| 5.5 打开 My Identity | 浏览器 `My Identity shows avatar, name, type, bio and BAP ID`、`Desktop/320px BAP ID in first viewport` |
| 5.5 复制完整 BAP ID | 浏览器 `Copy success feedback`、`Clipboard contains complete BAP ID` |
| 5.5 复制失败 | 浏览器 `Copy failure preserves identifier` |
| 5.6 保存修改 | 浏览器 `Save updates My Identity`、`Profile update keeps BAP ID`；模型 `saved.profile.name` 与 `ids` 不变 |
| 5.6 取消更新 | 浏览器 `Save cancellation retains editing values on form`；模型 `saveCancelled` 保留 draft |
| 5.6 未保存离开 | 浏览器 `Unsaved changes ask before leaving`、`Keep editing preserves draft`；模型 `DISCARD_ASK`/`DISCARD`/`STAY` |
| 8.8 首次访问 | 浏览器 `First visit English and Light` |
| 8.8 切换中文 | 浏览器 `Preferences persist after refresh`（`lang=zh-CN`）；`zh/*` 组检查；`Unwritable storage is announced instead of failing silently`（设备存储不可写时不静默失败） |
| 8.8 保留协议值 | 浏览器 `Locale and theme preserve profile and BAP ID` |
| 5.9 切换深色 | 浏览器 `Dark theme applies different semantic surface tokens`、`Preferences persist after refresh` |
| 5.9 切换浅色 | 8 屏 `en light and dark layouts match`（动画定格到 t=0 后逐元素比对矩形，深浅主题布局零位移） |
| 5.9 状态可理解 | 浏览器 `Status states carry text, not colour alone` |
| 5.10 320px 视口 | 各屏 `320/390/768/960px no page overflow`、`controls fit`、`320px touch targets`、`320px BAP ID in first viewport` |
| 5.10 键盘导航 | 各屏 axe 审计 0 violations；`5 keyboard stops show a visible focus ring`、`Skip link becomes visible when focused`、`Skip link moves focus into the main landmark`、`Wallet dialog moves focus inside`、`Closing the dialog returns focus to its trigger`、`Keyboard plays sky lines`、`Icon buttons expose accessible names`、`Reduced motion stops automatic 3D rotation` |

第 9 节裁决对应：头像本地选择预览（`Choose image` 与格式错误反馈）、默认 Light（`First visit English and Light`）、断开仅当前会话（`Disconnect` 流程）、无分享 URL（Public Identity 无分享入口）、无 Key Rotation（无该入口）。

## 核心认知可验证验收映射（v0.1 范围内）

[核心认知](../../_task/system-design/spec/核心认知.md)第 11 节共 12 条，其中 4 条落在 v0.1 原型范围；其余属 Content、Artifact、Relationship 或 Binding，本版无对应界面。

| 核心认知 11.x | 断言 |
| --- | --- |
| 6 缩略值 Copy 返回完整原值 | `Clipboard contains complete BAP ID` |
| 7 Wallet 拒绝发布 → Cancelled 且 Draft 不变 | `Escape cancels wallet creation`、`Cancelled creation preserves values` |
| 10 Account Switch 取消敏感操作并显示新 Identity | `Account switch cancels confirmation and clears old identity` |
| 11 语言/主题刷新后偏好保留，链上标识与内容不变 | `Preferences persist after refresh`、`Locale and theme preserve profile and BAP ID` |

## 复现与观测

在工作区根目录启动静态服务（Linux / macOS / Windows 通用，端口可换）：

```bash
python3 -m http.server 4311 --bind 127.0.0.1 --directory ownword/designs
```

访问 [原型](http://127.0.0.1:4311/own-word-prototype-s2-astra-001/index.html)。先确认服务的就是当前工作区文件，否则检查脚本会验到别的版本：

```bash
curl -s "http://127.0.0.1:4311/own-word-prototype-s2-astra-001/index.html" | diff - index.html && echo LIVE
```

不一致说明该端口上跑的是快照或另一份拷贝，换端口（例如 4312）后重跑。在本项目目录运行：

```bash
node check-model.cjs
OWNWORD_PORT=4312 python3 check-browser.py
OWNWORD_PORT=4312 python3 check-offline.py
```

`check-browser.py` 用 `OWNWORD_URL`（整条 URL，优先）或 `OWNWORD_PORT`（默认 4311）指向实时服务。`check-offline.py` 用 `--allowed-domains 127.0.0.1,localhost` 阻断全部外部请求，验证启动只依赖本地资源（`evidence/offline-startup.json`）。

浏览器检查使用宿主环境的独立 agent-browser 会话。`evidence/browser-results.json` 记录逐项结果；`evidence/*-axe.json` 是各页面审计；`evidence/*-320.png` 和 `*-desktop.png` 为截图。控制台日志使用 `[Ownword prototype]` 前缀，不记录填写内容；输出保存到 `evidence/browser-console.txt`。HTTP 访问日志在启动服务的终端；交付时保存本次记录到 `evidence/http-access.log`。不连接数据库、后端、真实 Wallet 或 Indexer，因此不存在数据库连接串或真实交易证据。

HTTP 日志中的 6 个错误路径来自执行 axe 后新增的 XHR。独立会话对照表明：页面初始请求零错误，8 个样式文件正常加载；运行审计才出现向项目根目录错误解析的 CSS `@import` 请求。前后网络记录为 `evidence/network-before-audit.json`、`network-after-audit.json`。据此归因为审计工具的路径解析，不是页面样式加载失败；没有复制一套重复 CSS 来掩盖探测错误。

## 术语与设计系统一致性

- **术语**：按核心认知第 2.3 节扫描原型文案与结构，禁区用词命中数为 0（`注册`、`登录`、`sign up`、`log in`、`register`、`Verified`、`BAP NFT`、`Create BAP NFT`、`Broadcast`、`Push`）；唯一 `Submit` 命中是表单事件处理器名 `onSubmit`，不是用户文案。Publish 用词统一为 `Published` / `Publishing`。记录见 `evidence/term-scan.txt`。
- **设计系统**：`check-tokens.py` 提取原型自身 CSS 中全部 `var(--s2*)` 引用，与 `_ds/react-spectrum-s2` 下 7 个 CSS 文件定义的 2509 个令牌比对，66 个引用全部解析，无未定义令牌。记录见 `evidence/token-resolution.json`。
- **axe incomplete 复核**：26 项 incomplete 均为 `color-contrast`，原因是文本位于装饰层、渐变或伪元素之上，axe 无法判定背景。逐项复核方式：取实测计算样式（颜色、字号、字重）与元素实际背景（页面表面或身份卡渐变的三个端点色），按 WCAG 2.1 计算最差对比度。22 组组合全部达标，最差 6.37:1（`.eyebrow` 深色，要求 4.5:1）。记录见 `evidence/axe-incomplete-review.json`。

## 同步评估与边界

- PRD：本次落实现有 v0.1 验收与第 9 节裁决，无新增需求，不修改 PRD。
- 核心认知：不变；本文件引用权威来源，不重新定义业务规则。
- 后端：本次不修改。真实钱包适配、头像存储、索引与交易行为仍需后续实现验证；核心认知第 12 节的生产契约待确认不属于本次原型阻塞。
- 原型数据只保存在当前页面内存；刷新清除模拟会话，语言与主题单独持久化。界面不要求或收集 Private Key、Seed Phrase 或 WIF。
- `_d_meta.json` 中原型应用效果保留 `needs-review`；穹顶与单条地平线已由用户选定，新轮廓效果记为 `needs-review`。

## 本次复核

观测层加固（2026-09-09）：

- `check-browser.py` 的服务地址改为读 `OWNWORD_URL` / `OWNWORD_PORT`（默认 4311），避免误测同端口的快照服务。
- 新增 `settle()`：测量与 axe 之前等待有限 CSS 过渡结束。按钮存在 150ms 的 `color/background/border` 过渡，切换语言或主题后立即审计会采到过渡中间色，曾误报 `ready zh/light` 对比度 4.17:1；稳定后实测为 `rgb(255,255,255)` 文字配 `rgb(59,99,251)` 背景，axe 0 violations。
- 响应式矩阵由 320px 扩展为 320/390/768/960，另保留 1440 桌面截图。
- axe 断言由“无严重/致命”收紧为 **0 violations**；incomplete 逐条记录屏幕、规则、目标与原因到 `evidence/axe-incomplete-summary.json`。
- 新增错误路径断言：把 `Storage.prototype.setItem` 改为抛错后切换偏好，页面以 `role="alert"` 明示「偏好无法保存」，不静默失败。
- 新增主题断言：8 屏浅色/深色布局矩形逐一相等（`en light and dark layouts match`），对应 PRD 5.9「切换浅色布局不位移」。
- 新增无障碍断言：跳至正文链接聚焦可见并把焦点移入 `main` 地标、键盘 Tab 经过的 5 个控件都有可见焦点环、钱包弹窗打开时焦点进入弹窗且关闭后回到触发按钮、`prefers-reduced-motion` 下 3D 自动旋转关闭且装饰动画时长降为 0.01ms。
- 修复：`main` 缺 `tabindex="-1"` 导致跳至正文链接不移动焦点；补上后实测 `document.activeElement === main`，并加 `main:focus { outline: none }`。
- 新增显式断言：连接后状态显示 Connected、解析失败解释并给出 Try Again 与 Disconnect、已发布身份直接进入 My Identity、My Identity 呈现头像/姓名/类型/简介/BAP ID 五项、切换深色后语义表面令牌改变、320px 下 BAP ID 首屏可见、图标按钮具备可访问名称、状态不以颜色单独表达。

已发现并修复（实现层）：320px Review 页 BAP ID 所在 Grid 的固有最小宽度导致 Copy 按钮溢出；设置 `minmax(0, 1fr)` 后复测。头像回退标识补上 img 语义；Save 取消返回编辑表单并保留值；离开未发布 Setup 后清除会话。

最终结果：59 条状态断言、382 项浏览器检查通过。32 份 axe 审计 0 violations；26 项 incomplete 全为 `color-contrast`（文本位于装饰层、渐变或伪元素之上，axe 无法判定背景），逐条记录于 `evidence/axe-incomplete-summary.json`。运行错误列表为空（`evidence/browser-errors.txt` 为空）。桌面以及 320px 的 Welcome、Setup、Review、Ready、My Identity、Public Identity、Edit Profile、Resolution error 均完成双语/双主题检查。头像、焦点约束、Processing 期间切换账户、减少动态效果与指针律动的补查见 `evidence/edge-checks.json`。人工截图复核后另缩小移动端头像首字母，避免圆形边缘裁切。

已复核事实来源、版本范围、验收映射、异常恢复与后端同步边界。没有原型范围内的阻塞待确认项。提交见任务记录。

## 品牌应用 · brand-astra-002

用户要求将已选图标应用于原型和加载状态。导航、公开身份卡、favicon 与启动/解析/创建/保存状态已接入；规范与资产源见 [品牌说明](brand/README.md)。本次仅改变视觉呈现，无需同步业务 PRD、核心认知或后端。

验证：59 条 model 断言、12 项浏览器专项检查通过。为观察启动，测试会话拦截 `app.jsx`，确认静态图标可见且沿用中文/深色偏好；恢复请求后检查正常应用。仅在测试会话将 850/1500ms 操作计时延至 8 秒，捕获解析、创建、保存图标并确认流程完成，交付代码保持原计时。检查品牌导航、320px 浅深主题、减少动态效果，运行错误为空。

桌面、手机启动、解析、创建及公开身份截图已目视复核；浅深主题 axe 各零违规。3D 卡片伪元素使部分文字对比度无法由 axe 自动判定，保留 incomplete 原始结果并人工检查可读性。证据为 `evidence/brand-applied-*`。

## 穹顶与地平线 · brand-astra-004

按用户选择更新主标及16px版本，颜色变体由源 SVG 派生；导航、公开身份卡、favicon 与全部加载入口继续引用同一品牌资产。去掉加载容器额外横线。规范见 [品牌说明](brand/README.md)。无业务变更。

桌面品牌页、320px 浅深主题、主界面和解析加载截图已复核；启动测试拦截 app.jsx，确认图标加载且无额外横线、无溢出。解析计时只在测试会话延长至8秒供观察。品牌深色 axe 零违规，正常应用运行错误为空；证据 `evidence/horizon-*`。本次不改变状态逻辑，不重复运行业务测试。
