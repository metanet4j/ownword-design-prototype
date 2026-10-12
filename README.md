# OwnWord v0.4.0 Identity 个人主页原型

从 v0.3.0 的最终分支提交 `1355bdc4a14197d1d2dfec09e26096446d080be5` 继续制作，保留身份、内容、Artifact 与绑定的 Spectrum S2。旧 v0.4.0 已作废，本目录是按当前 P01–P10 / 32 条 BDD 制作的新原型。

## 预览与检查

在任务容器（本目录的上一级）运行 `./init.sh --serve`，预览为 `http://127.0.0.1:4314/`。Windows 使用 `./init.ps1 -Serve`；普通检查使用 `./init.sh`。

公开主页：`http://127.0.0.1:4314/#/identity/2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD`。公开浏览不要求 Wallet。页脚的原型演练面板提供读取失败、签名不匹配、未知提交、索引延迟与账户变化场景。

在原型目录运行 `npm ci --no-audit --no-fund` 安装锁定的构建依赖；修改 JSX、CSS、模型或模板后运行 `npm run build`。浏览器加载预编译资源，启动检查拒绝过期产物。直接浏览已提交产物不需要安装依赖。

模型检查为 `node check-homepage.cjs`，浏览器按功能运行 `node verify-homepage.mjs Pxx`，例如 `P07` 完成 A 申请、B 接受。需要 agent-browser；用 `OWNWORD_BROWSER_SESSION` 指定独立会话。验证命令与断言、截图见 `evidence/homepage-v040/`。

## 可操作范围

公开身份介绍、完整 BAP ID 复制、有效 Current 编号、混合内容与筛选、不可变版本阅读、图片放大、视频与音频原生播放、关注/取消、好友申请/接受、公开关注与粉丝名单均可演练。列表分页、失败恢复、返回位置、语言和主题、键盘及原有模块入口保持连续。

关系演练从“重置关系演练记录”选择初始或空场景。A 为 Maya Chen，B 为 North Studio；通过已有 Wallet 场景中的“切换账户”操作改变当前签名身份，访问另一方主页再接受。切换路由只改变主页目标。

身份、Wallet、签名、交易、索引与 Proof 使用确定性样例，不接生产 API，也不产生真实交易。公开关系事件同源共享；授权与恢复记录按操作 Identity 隔离。通信公钥不在本原型中派生，生产 Friend 与媒体适配继续按核心认知第 12 节验证。

图片、视频和音频实际工作。素材出处、许可与 SHA-256 在 `fixtures/homepage/sources.json`；原有字体按既有绑定加载并提供系统回退。生产实现应采用官方 S2 组件；本原型消费的是继承的轻量视觉运行时。

当前界面采用常规字级和紧凑身份区，字号、首屏与相关操作的定向检查见 `evidence/homepage-v040/R01/verification.json`。当前成果等待用户视觉复核，资产保持 `needs-review`。
