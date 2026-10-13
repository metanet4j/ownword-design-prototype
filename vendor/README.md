# 官方依赖与构建产物

当前预览直接消费锁定的 `@react-spectrum/s2@1.6.0` 和 React／ReactDOM 19.3.0。依赖许可证见对应 npm 包，打包保留法律注释。

`npm run build` 由 esbuild 与官方 style 宏生成：

- `runtime.js`：React、ReactDOM、官方 S2 组件、业务模型及页面；index.html 使用 SHA-384 校验。
- `runtime.css`：官方组件 CSS 和字体声明。
- `styles.css`：既有 S2 Token、业务别名与 OwnWord 页面布局，位于低优先级 ownword 层。
- `markdown-tools.js`、`editor-tools.js`：按需加载的 Markdown 解析与编辑器。
- `build-manifest.json`：输入与产物 SHA-256、生产模式标识、官方组件模块来源。

`node build-prototype.mjs --check` 拒绝过期产物及调试模式。不要直接编辑构建文件。旧 UMD、SSR、app.js、workspace.css 等文件为继承资料，主入口不加载它们；旧品牌展示页仍使用原绑定。

官方字体引用外部字体服务，离线采用系统回退。
