# 本地依赖与构建产物

预览使用本地 React 与 ReactDOM 18.3.1 production UMD，来源为 npm 官方包 `react@18.3.1`、`react-dom@18.3.1` 的 `umd/` 目录，原文件与 MIT 许可头保持不变。页面保留 SHA-384 完整性校验。`react-dom-server.production.min.js` 来自同一包的 `react-dom-server-legacy.browser.production.min.js`，只用于构建中英文首页 HTML，不发送到浏览器。

| 文件 | SHA-384 |
| --- | --- |
| react.production.min.js | DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z |
| react-dom.production.min.js | gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1 |

`react.development.js`、`react-dom.development.js` 与 Babel 7.29.0 保留为本地基线和语法检查工具，浏览器预览不加载它们。

运行 `npm run build`，由锁定的 esbuild 0.28.2 生成以下文件：

- `app.js`：按原依赖顺序统一编译 JSX，保留共享辅助函数和既有全局导出。
- `markdown-tools.js`：原有 unified、remark、rehype 安全解析链，公开读取时加载。
- `editor-tools.js`：CodeMirror 与 Milkdown 完整编辑器，进入写作时加载。
- `styles.css`：页面及原有 S2 样式，移除无消费者的 token 声明；被引用声明的原值和模式保持不变。
- `workspace.css`：内容与 Artifact 的样式，在首页显示后加载；样式就绪后开放交互。
- `fonts.css`：S2 原有字体来源与回退规则，使用 optional 显示策略，在交互接续时加载。
- `build-manifest.json`：输入和产物 SHA-256，供初始化检查拒绝过期产物。文本输入统一按 LF 计算，产物按原始字节校验。

构建同时从 `index.template.html` 生成上级 `index.html`，其中的首页内容由同一 React App 渲染。修改源文件后必须重新构建，不能直接修改产物。正常启动只校验哈希，不安装业务依赖。

字体仍引用 `use.typekit.net`，不随仓库分发。首次慢速加载或离线时使用 S2 原有系统字体回退。本目录用于模拟原型，生产实现应通过包管理器与正式构建工程消费依赖。
