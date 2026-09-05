# 穹印 · Ownword 品牌图标

这是用户于 2026-09-05 请求的品牌提案。概念来自当前原型的穹顶与地平，以及 [核心认知](../../../_task/system-design/spec/核心认知.md) 的品牌主张；不改变业务事实或 PRD 范围。

- `ownword-mark.svg`：64 × 64 蓝色主标，是标准轮廓唯一编辑源。上部厚弧与下部 W 组成 OW；水平空隙呼应地平。
- `ownword-small.svg`：16 × 16 光学校正版本，针对 favicon 加粗并对齐主要边缘。
- `ownword-mono.svg`、`ownword-reverse.svg`：由主标生成的单色、反白导出。修改主标后运行 `node brand/generate-variants.mjs`，不要分别编辑轮廓。
- 色值来自固定导入的 S2：Blue 900 `#3b63fb`、Gray 900 `#131313`、White `#ffffff`。品牌文件保持固定色，界面主题切换不改变导出资产。
- 四周留白至少为图标宽度的 1/4；保持比例。单色可用于压印、打印，反白用于深色底。
- [审阅页](../brand.html) 提供浅深背景、字标组合、小尺寸与界面应用。原型主界面尚未替换品牌，资产状态为 `needs-review`。

验证：1320px 桌面与 320px 移动视口目视复核；图像均加载，控件可用；浅深主题 axe 零违规，运行错误为空。截图与审计在 `../evidence/brand-*`。
