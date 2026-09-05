# design-astra-001 验收映射

## 范围与依据

- 唯一业务事实来源：[核心认知](../../_task/system-design/spec/核心认知.md)。本文件只记录实现映射、设计取舍与验证证据。
- 版本范围与 BDD：[产品设计 v0.1](../../_task/system-design/spec/prd/v0.1/设计文档v0.1.md)，以第 9 节已填写裁决收窄前文范围。
- 当前任务：[feature_list.json](../../_task/system-design/feature_list.json)，`design-astra-001`。
- 设计来源：[React Spectrum S2](../react-spectrum-s2/readme.md)，独立导入到 [_ds/react-spectrum-s2](_ds/react-spectrum-s2)。资产索引见 [_d_meta.json](_d_meta.json)。
- 未读取、复制或参考其他原型的代码、DOM、CSS、截图；未读取 draft。

## 实现

`index.html` 按 Baoyu Design 导入结果加载 S2 的全部 CSS 依赖及组件 bundle。`components.jsx` 消费其 Button、TextField、TextArea，`app.jsx` 另用 StatusLight、Skeleton。组件源是本地视觉样件；适配层为其返回元素添加受控输入、ARIA、事件及表单提交。弹窗使用浏览器原生 dialog 管理焦点和 Escape，不修改源设计系统。

`app.css` 以 S2 的字体、颜色、语义表面、圆角与间距令牌构成视觉。穹顶由七条 CSS 椭圆线组成，点击空白处、触摸及键盘均可触发依次律动。铁灰地平线无刻度。Public Identity 使用有厚度的 CSS 3D 身份板，支持旋转、拖动、滑块与重置；尊重减少动态效果偏好。

`model.js` 保存原型状态迁移。异步操作携带会话序号；账户切换或断开时清除上下文并使旧回调失效。`app.jsx` 管理计时器和界面状态。头像仅使用本地 blob URL 预览，不定义或伪造上传端点。示例名称、BAP ID 与交易结果均为模拟数据。

## BDD 对应

| PRD 验收 | 可操作入口与实现 | 证据 |
| --- | --- | --- |
| 5.1 连接成功、取消、失败 | Welcome / 钱包确认中的 Approve、Cancel、Simulate failure | `check-browser.py`；`check-model.cjs` |
| 5.2 切换账户、断开 | 页脚与确认窗口；清除旧身份、取消回调、重新解析 | 同上，会话序号断言涵盖 Review、确认和 Processing |
| 5.3 完整、缺失、不完整、失败分流 | 页脚 Interactive prototype 面板中的场景选择 | 浏览器分流与错误恢复检查 |
| 5.4 创建及必填校验 | Setup / Review / 钱包确认 / Creating / Ready | 空白名称、100/101 字符、1000/1001 字符；成功、取消、失败 |
| 5.5 展示与完整复制 | My Identity / Review / Public Identity；面板可模拟复制失败 | 实际 Clipboard 读回比较；反馈不改变布局 |
| 5.6 修改与离开保护 | Edit Profile / Review / 钱包确认；Back / Discard / Keep editing | 取消保留表单，保存更新资料，BAP ID 不变 |
| 5.7 Key Rotation | 按第 9 节裁决排除 | 原型无该入口；未改变核心认知 |
| 8.8 国际化 | 顶栏 EN/Light 或 中文/浅色 偏好面板 | 默认英文；双语切换、刷新持久化、标识与用户内容不变 |
| 5.9 主题 | 同一偏好面板 | 默认 Light；Light/Dark 语义令牌；状态有文字 |
| 5.10 响应式、无障碍 | 全部产品页及弹窗 | 320px 四组合布局、axe、键盘焦点、触控尺寸、截图 |
| 第 9 节头像裁决 | Choose image | 本地图片预览；格式错误反馈；移除 |
| 第 9 节 Public Identity 裁决 | Public Identity | 应用内公开展示，无分享 URL 功能 |

## 复现与观测

在工作区根目录运行：

```powershell
python -m http.server 4311 --bind 127.0.0.1 --directory C:\haodev\ownword\designs
```

访问 [原型](http://127.0.0.1:4311/own-word-prototype-s2-astra-001/index.html)。在本项目目录运行：

```powershell
node check-model.cjs
python check-browser.py
```

浏览器检查使用宿主环境的独立 agent-browser 会话。`evidence/browser-results.json` 记录逐项结果；`evidence/*-axe.json` 是各页面审计；`evidence/*-320.png` 和 `*-desktop.png` 为截图。控制台日志使用 `[Ownword prototype]` 前缀，不记录填写内容；输出保存到 `evidence/browser-console.txt`。HTTP 访问日志在启动服务的终端；交付时保存本次记录到 `evidence/http-access.log`。不连接数据库、后端、真实 Wallet 或 Indexer，因此不存在数据库连接串或真实交易证据。

HTTP 日志中的 6 个错误路径来自执行 axe 后新增的 XHR。独立会话对照表明：页面初始请求零错误，8 个样式文件正常加载；运行审计才出现向项目根目录错误解析的 CSS `@import` 请求。前后网络记录为 `evidence/network-before-audit.json`、`network-after-audit.json`。据此归因为审计工具的路径解析，不是页面样式加载失败；没有复制一套重复 CSS 来掩盖探测错误。

## 同步评估与边界

- PRD：本次落实现有 v0.1 验收与第 9 节裁决，无新增需求，不修改 PRD。
- 核心认知：不变；本文件引用权威来源，不重新定义业务规则。
- 后端：本次不修改。真实钱包适配、头像存储、索引与交易行为仍需后续实现验证；核心认知第 12 节的生产契约待确认不属于本次原型阻塞。
- 原型数据只保存在当前页面内存；刷新清除模拟会话，语言与主题单独持久化。界面不要求或收集 Private Key、Seed Phrase 或 WIF。
- `_d_meta.json` 的资产状态保留 `needs-review`，表示等待用户视觉审阅，不冒充用户批准。

## 本次复核

已发现并修复：320px Review 页 BAP ID 所在 Grid 的固有最小宽度导致 Copy 按钮溢出；设置 `minmax(0, 1fr)` 后复测。头像回退标识补上 img 语义；Save 取消返回编辑表单并保留值；离开未发布 Setup 后清除会话。

最终结果：59 条状态断言、125 项浏览器检查、7 项交互补查通过。32 份 axe 审计无严重或致命违规；运行错误列表为空。桌面以及 320px 的 Welcome、Setup、Review、Ready、My Identity、Public Identity、Edit Profile、Resolution error 均完成双语/双主题检查。头像、焦点约束、Processing 期间切换账户、减少动态效果与指针律动的补查见 `evidence/edge-checks.json`。人工截图复核后另缩小移动端头像首字母，避免圆形边缘裁切。

已复核事实来源、版本范围、验收映射、异常恢复与后端同步边界。没有原型范围内的阻塞待确认项。提交见任务记录。
