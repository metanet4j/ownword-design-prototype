# vendor — 本地化的启动依赖

原型启动只需三个 UMD 构建。它们原先从 unpkg 加载；为保证离线可复现，这里保存同一版本的原始文件，`index.html` 改为引用本地路径。文件未做任何修改，`integrity` 属性保留，作为内容校验。

| 文件 | 版本 | 来源 | 大小 | sha384 |
| --- | --- | --- | --- | --- |
| `react.development.js` | 18.3.1 | `https://unpkg.com/react@18.3.1/umd/react.development.js` | 109931 | `hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L` |
| `react-dom.development.js` | 18.3.1 | `https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js` | 1080227 | `u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm` |
| `babel.min.js` | 7.29.0（`@babel/standalone`） | `https://unpkg.com/@babel/standalone@7.29.0/babel.min.js` | 3137752 | `m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y` |

获取日期：2026-09-09。三个哈希与 `index.html` 中既有的 `integrity` 值逐一相等（`openssl dgst -sha384 -binary | openssl base64 -A`）。

许可：React 与 ReactDOM 为 MIT（文件头保留 Facebook 许可声明）；`@babel/standalone` 为 MIT。此处只做原样分发，未修改内容。

用途限定：这是原型运行依赖，不是产品依赖。生产实现用包管理器与打包器引入同名依赖，不引用本目录。

字体不在本地化范围内：`_ds/react-spectrum-s2/tokens/font-faces.css` 仍引用 `use.typekit.net`，离线时浏览器回退到系统字体，页面照常可用。许可不允许随仓库分发该字体文件，因此保留外链并记录降级行为。
