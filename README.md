# Ownword v0.3.0 原型

Identity Artifact 高保真模拟原型，沿用 React Spectrum S2。

在上一级目录运行 `./init.ps1 -Serve`，打开 http://127.0.0.1:4313/ 。单独运行 `node check-artifact.cjs` 可检查 Artifact 模型、JSX 和 S2 token。

页面源码保留为 JSX，预览使用已提交的构建产物，浏览器不运行 Babel。修改 JSX、样式、模型、文案或 `index.template.html` 后，在本目录运行 `npm run build`；依赖缺失时先按锁文件执行 `npm ci`。启动检查会拦截过期或修改过的产物，无需在正常预览时安装依赖。首页由同一 React 界面预生成中英文 HTML，再接续交互；正文解析与完整编辑器在使用时加载，加载失败可以重试。

`./check-loading.ps1` 验证初始点击接续、正文与编辑器按需加载、失败恢复、刷新后重新连接恢复草稿、阅读目录、安全解析和 S2 样式一致性。Windows 首次运行先单独执行 `agent-browser --session v030-r23-check open http://127.0.0.1:4313/`。字体遵循 S2 原有字体与回退栈，首次慢速载入可能先显示系统字体；字体文件仍来自原有许可外链。

交付范围、33 条 BDD 证据与限制见[交付验收v0.3.0-20260919-005031.md](交付验收v0.3.0-20260919-005031.md)。准确功能状态和提交见[任务清单](../feature_list.json)。

美学、交互和移动端的全面检查见[体验审查](evidence/artifact-v030/R02/体验审查-20260919-011800.md)。当前页面说明、纯数字排版和帮助交互调整见[说明收敛审查](evidence/artifact-v030/R03/说明收敛审查-20260919-071512.md)，等待用户视觉复核。

预览运行后，可在本目录执行 `./check-artifact-review.ps1`，重复检查模块下拉、名称校验、草稿保护、弹窗焦点与转移返回。需安装 `agent-browser`；Windows 首次运行先单独执行 `agent-browser --session v030-r02-regression open http://127.0.0.1:4313/#/artifacts`，避免首次启动的常驻进程阻塞日志重定向。脚本只操作独立会话的模拟数据，完成后关闭会话。

钱包、签名、交易和链上数据均为样例；本原型不接生产 API。

`./check-context-help.ps1` 验证帮助悬浮、键盘、点击、窄屏边界、授权弹窗内 Escape 和转移返回。Windows 首次运行先执行 `agent-browser --session v030-r03-check open http://127.0.0.1:4313/#/artifacts`，再运行脚本。模型与完整启动检查仍使用上一级目录的 `./init.ps1`。

当前模块导航与离开保护可执行 `./check-workspace-navigation.ps1`。Windows 首次运行先单独执行 `agent-browser --session v030-r04-check open http://127.0.0.1:4313/`；脚本检查窄屏边界、方向键、Escape、点击外部，以及身份资料和 Artifact 草稿的跨模块保护。只使用独立会话的模拟数据，结束后关闭会话。

最新批注修正、编号关联资格及多标签页验证见[R05 审查](evidence/artifact-v030/R05/批注体验审查-20260919-134718.md)。
