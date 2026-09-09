# design-astra-001 实现交接

本文只记录「原型 → 生产实现」的替换契约与状态机契约。业务事实以[核心认知](../../_task/system-design/spec/核心认知.md)为唯一来源；范围与验收以[产品设计 v0.1](../../_task/system-design/spec/prd/v0.1/设计文档v0.1.md)为准；逐条验收映射与证据见[verification.md](verification.md)。本文不重复定义上述任何规则。

## 1. 原型构成

| 文件 | 职责 |
| --- | --- |
| `index.html` | 加载顺序：S2 令牌与组件 CSS → `vendor/` 的 React/ReactDOM/Babel → `model.js` → `components.jsx` → `app.jsx` |
| `model.js` | 纯函数状态机：`initial()`、`validate()`、`reducer()`。无 DOM、无计时器 |
| `app.jsx` | 界面与副作用：计时器、剪贴板、头像本地预览、偏好持久化、导航保护 |
| `components.jsx` | S2 组件适配层：为设计系统返回的元素补受控输入、ARIA、事件与表单提交 |
| `app.css` | 视觉：穹顶、地平线、语义表面、3D 身份板 |
| `_ds/react-spectrum-s2/` | 设计系统（只读，不修改） |
| `check-model.cjs` | 59 项状态断言 |
| `check-browser.py` | 360 项浏览器断言（双语、双主题、四宽度、axe） |
| `check-offline.py` | 4 项离线启动断言（阻断外部域） |

## 2. 状态机契约（必须原样移植）

状态字段见 `model.js` 的 `initial()`：`page`、`wallet`、`account`、`published`、`profile`、`draft`、`modal`、`notice`、`error`、`busy`、`epoch`、`incomplete`、`destination`。

关键不变量：

1. **会话序号 `epoch`**：`SWITCH`、`DISCONNECT`、每次异步操作都会自增；`reducer` 顶部的守卫丢弃过期回调，账户切换后旧操作的结果不得落回界面。
2. **敏感操作可取消**：`create`、`save` 进行中若发生账户切换或断开，必须取消并清空上一身份。
3. **草稿与资料分离**：`draft` 是编辑中的值，`profile` 是已发布值。取消保留 `draft`；成功时 `profile = draft`。
4. **校验规则**：`name` 必填且不超过 100 个码点；`bio` 不超过 1000 个码点；`type` 只能是 `Person` 或 `Organization`。
5. **解析分流**：`RESOLVED` 的四种结果决定落到 `identity`、`setup`、`setup`+`incomplete` 或 `resolve-error`，不得由界面自行推断。

`check-model.cjs` 是这套契约的可执行回归测试，生产实现应保留等价断言。

## 3. 模拟点 → 生产替换

| 原型行为 | 生产替换 | 输入 / 输出 | 验收 |
| --- | --- | --- | --- |
| 钱包确认弹窗：Approve / Cancel / Simulate failure（`app.jsx` 的 `confirmConnection`、`approveOperation`） | Yours Wallet Provider（`@1sat/react` 的 `WalletProvider`：`connect`、`disconnect`、`status`、`identityKey`；`signWithBAP`）。参考 `reference/yours-wallet-main/.../docs/provider-api.md` | 输入：用户手势与待签内容；输出：连接状态、`identityKey`、签名结果；取消 = 用户拒绝签名；失败 = provider 抛错 | PRD 5.1、5.2 |
| 身份解析：850ms 计时器 + 场景选择 | 按 `identityKey` 查询已发布 BAP 身份与 profile（Indexer / 1sat-stack） | 输入：`identityKey`；输出：`{exists, profile, published, incomplete}` 或解析失败 | PRD 5.3 |
| 创建/更新：`PROCESS` → 1500ms → `RESULT` | BAP 签名 + 广播交易，返回 TxID | 输入：profile 字段 + `identityKey`；输出：TxID 或失败原因 | PRD 5.4、5.6；核心认知 11.7 |
| 无对应状态 | 交易确认状态归一化（SEEN / ACCEPTED / MINED / IMMUTABLE） | 输入：交易查询结果；输出：归一化状态与「Confirmation pending」提示 | 核心认知 11.8、12.3 |
| 头像：本地 blob URL 预览，无上传 | 维持本地预览。v0.1 第 9 节第 1 项裁决为「支持本地、暂不支持 URL」 | 输入：用户选择的图片文件；输出：预览或格式错误提示 | PRD 5.4、第 9 节裁决 |
| 复制：Clipboard API + `Copied` / `Couldn't copy` 反馈 | 同一 API；必须复制完整原值 | 输入：可见的缩略 BAP ID；输出：剪贴板完整值 + 不改布局的反馈 | PRD 5.5；核心认知 11.6 |
| 语言与主题：`localStorage` 持久化 | 保留为客户端偏好 | 输入：用户选择；输出：界面语言/主题；链上标识与用户内容不得改变 | PRD 8.8、5.9；核心认知 11.11 |
| 示例数据：`model.js` 的 `ids`、`fixtures`、模拟 BAP ID 与交易结果 | 全部替换为真实数据 | — | 禁止进入生产 |
| 演示面板：页脚 `Interactive prototype`（场景选择、复制失败开关、重置） | 生产删除，只保留在测试构建 | — | 禁止进入生产 |
| 人为延时 850ms / 1500ms | 真实网络延迟 | — | 保留加载状态与可取消性，不保留延时 |
| 内存态：刷新清空会话 | 需定义会话恢复策略（本版未规定，属实现决策） | — | 待实现方决策 |

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
