# Dogfood Report: Ownword Astra 原型（design-astra-001）

| Field | Value |
|-------|-------|
| **Date** | 2026-09-10 |
| **App URL** | http://127.0.0.1:4312/own-word-prototype-s2-astra-001/index.html |
| **Session** | ownword-dogfood |
| **Scope** | 探索式测试：路由/后退、刷新、表单边界、输入渲染、弹窗键盘、状态一致性、小屏弹窗、复制反馈、装饰元素可访问性 |
| **Evidence** | `evidence/dogfood/screenshots/`（本报告引用）；**repro 视频 N/A**：本环境为无头浏览器，`agent-browser record` 报 `No frames captured`，无法产出 WebM，故每个问题用分步截图替代 |

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 5 |
| **Total** | **7** |

已修：ISSUE-002、ISSUE-003、ISSUE-004、ISSUE-006、ISSUE-007（见各条 Status）。保留记录：ISSUE-001（超出 v0.1 范围）、ISSUE-005（已在实现交接 3.2 记录为可接受行为）。

## Issues

### ISSUE-001: 浏览器后退键直接离开应用，进行中的会话静默丢失

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | ux / functional |
| **URL** | `index.html`（任意页内状态） |
| **Status** | 保留记录（原型无路由，属 v0.1 范围外） |
| **Repro Video** | N/A（无头环境无法录制） |

**Repro steps**

1. 连接钱包 → 批准 → 进入 Identity Setup（`issue-001-step-1-setup.png`）
2. 填名称 → 点 Review → 进入 Review 页，URL 仍是 `index.html`（`issue-001-step-2-review.png`）
3. 按浏览器后退键

**Expected**：退回上一界面（Welcome），或至少留在应用内。
**Actual**：直接跳到 `about:blank`，应用整体消失（`issue-001-result.png`），全部进行中状态丢失；无 dirty 表单时连浏览器原生离开确认都不会出现。

**Notes**：应用是单页状态机，从不 pushState，因此浏览器历史里只有一条记录，后退即离开文档。有未保存表单时会触发 `beforeunload` 确认；已发布身份（无 dirty）时静默丢失。生产实现需要真实路由 + 会话恢复策略（实现交接「内存态」一行已列为待实现方决策）。

### ISSUE-002: 字符计数按码点而非字素簇，emoji 被重复计数

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | content / functional |
| **URL** | `#setup`、`#edit` |
| **Status** | **已修** |
| **Repro Video** | N/A |

**Repro steps**

1. 进入 Identity Setup，Bio 输入 5 个家庭 emoji `👨‍👩‍👧‍👦`（用户看到 5 个字符）
2. 观察 Bio 下方计数器 → 显示 `35 / 1000`（`emoji-counter.png`）
3. 名称输入 15 个家庭 emoji → 点 Review → 被拦下并提示「Use 100 characters or fewer.」（实际视觉上只有 15 个字符）

**Expected**：计数器与长度校验按用户感知的字符（字素簇）计数。
**Actual**：按 Unicode 码点计数，一个 ZWJ 家庭 emoji 计 7 个。

**修复**：`model.js` 新增 `countGraphemes()`（优先 `Intl.Segmenter` 的 grapheme 粒度，缺浏览器支持时回退 `[...text].length`），`validate()` 与 Bio 计数器统一使用它。

### ISSUE-003: 复制成功反馈「Copied」不会消失

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | ux |
| **URL** | `#review`、`#identity`、`#public`（所有含 BAP ID / TxID 的位置） |
| **Status** | **已修** |
| **Repro Video** | N/A |

**Repro steps**

1. 进入 Review 页，点「Copy full BAP ID」（或卡背面「Copy publication TxID」）
2. 等待 5.5 秒、9.5 秒后分别读取反馈文本 → 始终是 `Copied`（`copy-feedback-sticky.png`）

**Expected**：确认类反馈在一段时间后消失（应用内其他确认提示 6 秒后自动消失）。
**Actual**：反馈一直停留，直到该组件卸载或 ID 变化；旁边长期挂着「Copied」会让人误以为剪贴板刚被改写。

**修复**：`Identifier` 增加 6 秒自动清除计时器（与 `CLEAR_NOTICE` 的确认提示同一节奏），失败反馈同样适用。

### ISSUE-004: 解析中的装饰骨架未标记 aria-hidden

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | accessibility |
| **URL** | `#resolving`（连接后 850ms 的解析中界面） |
| **Status** | **已修** |
| **Repro Video** | N/A |

**Repro steps**

1. 点连接 → 批准，在 850ms 的解析窗口内检查 DOM（`resolving-state.png`）
2. `document.querySelector('.s2d-skeleton')` → `aria-hidden` 与 `role` 均为 null

**Expected**：纯装饰的加载骨架对辅助技术隐藏（旁边的 `role="status"` 已提供可读标签「Resolving your identity...」）。
**Actual**：骨架留在可访问树中，读屏会遍历到一个无标签元素。

**修复**：为骨架容器补 `aria-hidden="true"`（不改设计系统源文件）。

### ISSUE-005: 320px 下钱包确认弹窗的次级操作被裁在视口外

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | ux / visual |
| **URL** | `#review` → 钱包确认弹窗（320×800） |
| **Status** | 保留记录（实现交接 3.2 已说明，属可接受行为） |
| **Repro Video** | N/A |

**Repro steps**

1. 视口设为 320×800，走到 Review，点「Create Identity」打开钱包确认弹窗
2. 观察：主操作 Cancel / Approve 在首屏内；「Simulate failure / Switch account / Disconnect」一行位于 y=771–911，底部被视口裁掉，需在弹窗内滚动（`dialog-320-secondary.png`）

**Expected**：主操作首屏可用（满足）；次级操作可滚动到达（满足），但理想情况下小屏应减少弹窗内边距或折叠模拟区。
**Actual**：次级操作部分在首屏之外。

**Notes**：模拟区是原型脚手架、生产会删除，因此不作为缺陷修复；已由断言 `Dialog primary actions stay inside a 320px viewport` 守住主操作可见性。

### ISSUE-006: 首屏加载时把焦点移进 main，第一次 Tab 落在页面中段

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | accessibility |
| **URL** | 首次加载（任意页面进入前） |
| **Status** | **已修** |
| **Repro Video** | N/A |

**Repro steps**

1. 打开应用（不点任何东西），读取 `document.activeElement` → `H1`（应用在挂载时主动把焦点移到 `main h1`）
2. 按一次 Tab → 焦点落到「Connect Wallet」，**跳过了跳至正文链接、品牌按钮、偏好设置与穹顶按钮**
3. 继续 Tab → 焦点跑到 `BODY`，再按一次才回到 `skip-link`，然后才轮到顶栏

**Expected**：首屏不改动焦点，Tab 从文档开头（skip link）开始；站内页面切换时再移动焦点。
**Actual**：首屏即抢焦点，键盘用户第一下 Tab 就进入 `main` 中段，必须绕整页一圈才能回到顶栏，等于让 skip link 失去意义。

**修复**：`app.jsx` 增加 `firstPaint` ref，仅首屏跳过焦点搬移；站内路由切换仍聚焦新页面的 h1。

### ISSUE-007: 翻面显示的「链上记录」在 Tab 顺序里位于翻面按钮之前

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | accessibility / ux |
| **URL** | `#public` → 卡背面 |
| **Status** | **已修** |
| **Repro Video** | N/A |

**Repro steps**

1. 键盘走到「View chain record」按 Enter 翻面
2. 继续按 Tab：焦点走向「暂停旋转 → 重置视角 → 视角滑块 → 页面底部 BAP ID → 返回」，**始终不到刚露出的 TxID 复制按钮**（它在 DOM 中位于翻面按钮之前，只能靠 Shift+Tab 或绕整页返回）

**Expected**：翻面后焦点进入刚显示出来的内容。
**Actual**：新内容在 Tab 顺序中"在身后"，键盘用户要绕整页才能操作它。

**修复**：显式翻面按钮在设定角度后用 `requestAnimationFrame` 把焦点移到背面第一个可操作元素（`copy-tx`）；用视角滑块跨过 90° 时不搬焦点（避免拖动过程中焦点被抢，属有意取舍，已在 `verification.md` 记录）。
