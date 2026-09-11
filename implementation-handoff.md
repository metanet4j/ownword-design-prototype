# design-astra-001 实现交接

本文只记录「原型 → 生产实现」的替换契约与状态机契约。业务事实以[核心认知](../../_task/system-design/spec/核心认知.md)为唯一来源；范围与验收以[产品设计 v0.1](../../_task/system-design/spec/prd/v0.1/设计文档v0.1.md)为准；逐条验收映射与证据见[verification.md](verification.md)。本文不重复定义上述任何规则。

## 1. 原型构成

| 文件 | 职责 |
| --- | --- |
| `index.html` | 加载顺序：S2 令牌与组件 CSS → `vendor/` 的 React/ReactDOM/Babel → `model.js` → `components.jsx` → `app.jsx` |
| `model.js` | 纯函数状态机：`initial()`、`validate()`、`reducer()`。无 DOM、无计时器 |
| `copy.js` | 双语词典（142 键），术语权威是核心认知第 2 节；`check-copy.cjs` 校验键对齐、空串与禁区词 |
| `app.jsx` | 界面与副作用：计时器、剪贴板、头像本地预览、偏好持久化、导航保护 |
| `components.jsx` | S2 组件适配层：为设计系统返回的元素补受控输入、ARIA、事件与表单提交 |
| `app.css` | 视觉：穹顶、地平线、语义表面、3D 身份板 |
| `_ds/react-spectrum-s2/` | 设计系统（只读，不修改） |
| `check-model.cjs` | 状态断言（几何、能力、标识、校验、状态机、术语、视图） |
| `check-browser.py` | 浏览器断言（双语、双主题、四宽度矩阵 + 短窗口、axe 审计；当前条数以 `verification.md` 为准） |
| `check-offline.py` | 4 项离线启动断言（阻断外部域） |
| `check-tokens.py` | 设计系统令牌解析检查（原型 CSS 全部 `var(--s2*)` 引用对 2509 个令牌） |
| `check-copy.cjs` | 双语词典契约检查 |
| `brand.html`、`brand-explorations.html` | 品牌图标规范与方向探索页，供设计参考；不是产品页面，生产不迁移 |

## 2. 状态机契约（必须原样移植）

状态字段见 `model.js` 的 `initial()`：`page`、`wallet`、`account`、`published`、`profile`、`draft`、`modal`、`notice`、`error`、`busy`、`epoch`、`incomplete`、`destination`。

关键不变量：

1. **会话序号 `epoch`**：`SWITCH`、`DISCONNECT`、每次异步操作都会自增；`reducer` 顶部的守卫丢弃过期回调，账户切换后旧操作的结果不得落回界面。
2. **敏感操作可取消**：`create`、`save` 进行中若发生账户切换或断开，必须取消并清空上一身份。
3. **草稿与资料分离**：`draft` 是编辑中的值，`profile` 是已发布值。取消保留 `draft`；成功时 `profile = draft`。
4. **校验规则**：`name` 必填且不超过 100 个码点；`bio` 不超过 1000 个码点；`type` 只能是 `Person` 或 `Organization`。
5. **解析分流**：`RESOLVED` 的四种结果决定落到 `identity`、`setup`、`setup`+`incomplete` 或 `resolve-error`，不得由界面自行推断。

`check-model.cjs` 是这套契约的可执行回归测试，生产实现应保留等价断言。

动作与转移（`model.js` 的 `reducer`，可直接照搬）：

| 动作 | 效果 |
| --- | --- |
| `CONNECT` | 打开钱包确认弹窗 |
| `CONNECTED` | `wallet=true`、进入 `resolving`、`epoch+1` |
| `RESOLVED {scenario}` | `resolveFail` → `resolve-error`；`existing` → `identity`；`incomplete` → `setup` 且 `incomplete=true`；否则 → `setup` |
| `RETRY_RESOLVE` | 重新进入 `resolving`、`epoch+1` |
| `CONNECT_FAILED` | `error=connectFailed`、关闭弹窗 |
| `DRAFT {field,value}` | 只改 `draft`，清除提示与错误 |
| `REVIEW` | 进入 `review` |
| `EDIT` | 进入 `edit`，`draft=profile` |
| `AUTHORIZE {operation}` | 打开该操作的钱包确认弹窗 |
| `CANCEL` | 关闭弹窗；`connect` → `connectCancelled`，`create` → `createCancelled`，`save` → `saveCancelled` 并回到表单 |
| `PROCESS {operation}` | 关闭弹窗、进入 `busy`、`epoch+1` |
| `RESULT {operation,fail}` | 失败 → `createFailed`/`saveFailed` 且保留 `draft`；成功 → `create` 进 `ready`、`save` 进 `identity`，`profile=draft`、`published=true` |
| `GO {page}` | 直接切换页面并清提示 |
| `DISCARD_ASK {page}` / `DISCARD` / `STAY` | 离开未保存表单的三分支 |
| `SWITCH` | 回到初始态但保留钱包、切换 `account`、进入 `resolving`、`epoch+1` |
| `DISCONNECT` | 回到初始态、`epoch+1` |

文件对应关系（原型 → 生产模块）：

| 原型 | 生产 |
| --- | --- |
| `model.js` | 状态层（store/reducer）与其单元测试 |
| `app.jsx` 的页面分支 | 路由与页面组件 |
| `app.jsx` 的计时器与副作用 | 真实网络调用、会话恢复、剪贴板 |
| `components.jsx` | 设计系统适配层（生产直接用组件库，不再需要 DOM 适配） |
| `app.css` | 主题与布局样式 |
| `vendor/` | 包管理器依赖 |
| `check-model.cjs` | 状态机回归测试 |
| `check-browser.py`、`check-offline.py`、`check-tokens.py` | 端到端与一致性测试的起点 |

## 3. 模拟点 → 生产替换

| 原型行为 | 生产替换 | 输入 / 输出 | 验收 |
| --- | --- | --- | --- |
| 钱包确认弹窗：Approve / Cancel / Simulate failure（`app.jsx` 的 `confirmConnection`、`approveOperation`） | `@1sat/react`：`WalletProvider` 包裹应用并自动发现 BRC-100 钱包，`useWallet()` 提供 `wallet`、`status`（`disconnected`/`detecting`/`selecting`/`connecting`/`connected`）、`providerType`、`identityKey`、`connect()`、`disconnect()` | 输入：用户手势；输出：连接状态与 `identityKey`；取消 = 用户拒绝或关闭钱包请求；失败 = `connect()` 抛错或 `status` 未达 `connected` | PRD 5.1、5.2；依据 provider-api.md「Connection」「Context & Action Pattern」 |
| 身份解析：850ms 计时器 + 场景选择 | `@1sat/actions` 的 `getProfile.execute(ctx, {})` → `{bapId?, profile?, error?}`；`ctx` 由 `createContext(wallet, {chain, services})` 建立，`services` 来自 `@1sat/client` 的 `OneSatServices` | 输入：钱包上下文；输出：`bapId` 与 `profile`，或 `error` | PRD 5.3；依据 provider-api.md「Identity (BAP)」「Context & Action Pattern」 |
| 创建/更新：`PROCESS` → 1500ms → `RESULT` | `publishIdentity.execute(ctx, {})` 建初始 BAP ID；`updateProfile.execute(ctx, {profile})` 更新资料（文档注明未发布时会自动发布）。签名由动作内部完成 | 输入：`profile` 字段与钱包上下文；输出：发布结果或 `error` | PRD 5.4、5.6；核心认知 11.7；依据 provider-api.md「Identity (BAP)」 |
| 公开身份卡背面的「链上记录」：`transaction` fixture（区块高度、确认状态、TxID） | 交易查询结果 → `{state: 'pending'\|'confirmed', txid: string\|null, blockHeight: number\|null}`。生产按核心认知第 12 节第 3 项归一化（SEEN / ACCEPTED / MINED / IMMUTABLE），原型只呈现 pending / confirmed 两态 | 输入：交易查询结果；输出：区块高度、确认状态与 TxID | 核心认知 11.8、12.3 |
| 头像：本地 blob URL 预览，无上传 | 维持本地预览。v0.1 第 9 节第 1 项裁决为「支持本地、暂不支持 URL」 | 输入：用户选择的图片文件；输出：预览或格式错误提示 | PRD 5.4、第 9 节裁决 |
| 复制：Clipboard API + `Copied` / `Couldn't copy` 反馈 | 同一 API；必须复制完整原值 | 输入：可见的缩略 BAP ID；输出：剪贴板完整值 + 不改布局的反馈 | PRD 5.5；核心认知 11.6 |
| 语言与主题：`localStorage` 持久化 | 保留为客户端偏好 | 输入：用户选择；输出：界面语言/主题；链上标识与用户内容不得改变 | PRD 8.8、5.9；核心认知 11.11 |
| 示例数据：`model.js` 的 `ids`、`fixtures`、模拟 BAP ID 与交易结果 | 全部替换为真实数据 | — | 禁止进入生产 |
| 演示面板：页脚 `Interactive prototype`（场景选择、复制失败开关、重置） | 生产删除，只保留在测试构建 | — | 禁止进入生产 |
| 人为延时 850ms / 1500ms | 真实网络延迟 | — | 保留加载状态与可取消性，不保留延时 |
| 内存态：刷新清空会话 | 需定义会话恢复策略（本版未规定，属实现决策） | — | 待实现方决策 |

### 3.0.1 签名入口的边界（据参考文档核实）

`signWithBAP` **不是**身份发布的签名入口——它是 `@1sat/actions` 的 `inscribe.execute(ctx, {...})` 上的一个可选字段，用于内容 Inscription 的 BAP 签名。身份发布、资料更新、Key Rotation 分别由 `publishIdentity`、`updateProfile`、`rotateIdentity` 完成，签名在这些动作内部处理。本文早期版本把 `signWithBAP` 列为身份签名替换点是错的，已按 `reference/yours-wallet-main/yours-wallet-main/docs/provider-api.md` 更正。

## 3.1 穹顶指针光（批 2-b）

`components.jsx` 的 `Dome` 维护 `--light-x/--light-y` 两个 CSS 自定义属性与 `data-lit`；高光由一个 `.vault-light` 覆盖层承载，用 radial-gradient 遮罩限制在指针附近，弧线本身不逐条动画。生产如需保留该效果，直接沿用这两个属性与遮罩规则即可，无需改动状态层；如需替换为品牌化动效，删除 `.vault-light` 与对应 effect 不影响任何产品状态。

## 3.2 小屏弹窗（实测）

320×800 下钱包确认弹窗内容高于视口，弹窗内部可滚动（`max-height` + `overflow-y:auto`）。主操作（Cancel / Approve）在首屏可见，原型专用的「模拟失败 / 切换账户 / 断开」一行需滚动。生产实现需保证主操作在 320px 首屏可见，次级操作允许滚动；断言 `Dialog primary actions stay inside a 320px viewport` 覆盖这一点。

## 4. 不得丢失的可观察行为

- 四种解析结果的分流，含「Complete your profile」提示。
- 校验失败留在表单并聚焦第一个无效字段；离开未保存表单时询问是否丢弃。
- 取消创建/保存保留草稿；保存成功后 My Identity 显示新值且 BAP ID 不变。
- 账户切换与断开取消进行中的敏感操作，并清除上一身份。
- 320px 视口下文字与控件不重叠溢出，主操作可用；键盘焦点可见，图标按钮有可访问名称。
- 状态用文字或图标表达，不依赖颜色。

## 5. 生产替换清单

- [ ] 接入钱包 provider，取消与失败路径与原型一致。
- [ ] 确认 Inscription Number 查询端点（核心认知 12.1）。
- [ ] 确认 Artifact 签名封装（核心认知 12.2）。
- [ ] 确认交易状态归一化映射（核心认知 12.3）。
- [ ] 删除演示面板、fixtures 与人为延时。
- [ ] 依赖改由包管理器引入，不再引用 `vendor/`。
- [ ] 复用 `check-model.cjs` 的断言作为状态机回归测试。
- [ ] 头像、解析、签名与广播分别接入真实存储与网络，并补齐对应失败路径。

## 6. 待确认（阻塞生产，不阻塞原型）

核心认知第 12 节三项：Inscription Number 端点、Artifact 签名封装、Blockchain 状态映射。实现前必须用实际 SDK、Indexer 输出或验证器关闭，未关闭前不得把假设写成事实。
