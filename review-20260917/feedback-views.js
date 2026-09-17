window.__overlays = {views: [
  {id: 'interaction', label: '交互优先', finding: '先保证用户能看见当前步骤、完整标识和卡片操作。', dim: 1, elements: [
    {id: 'confirm-heading', callout: {head: '01 已修复阅读起点', body: '切页回到顶部并聚焦标题。步骤、标题位于页头下方，返回编辑保留草稿。', dx: 390, dy: -40}},
    {id: 'confirm-id', callout: {head: '02 标识已完整展示', body: 'BAP ID 自动换行，复制按钮独立保留。390px 手机两行完整显示。', dx: 390, dy: -40}},
    {id: 'card-affordance', callout: {head: '05 已加入翻面入口', body: '按钮固定在卡片上方，支持点击、Enter 与空格；保留拖动。等待视觉复核。', dx: 390, dy: -40}}
  ]},
  {id: 'visual', label: '视觉打磨', finding: '保留穹顶与地平线，收紧任务页面的铺垫与空白。', dim: 1, elements: [
    {id: 'form-intro', callout: {head: '03 铺垫占据首屏', body: '名称输入框从约 y=636px 开始。压缩标题、身份摘要和头像组的高度。', dx: 390, dy: -40}},
    {id: 'card-proportion', callout: {head: '04 已收紧卡片比例', body: '示例卡片由约 549px 降至 376px，复制入口进入首屏。等待视觉复核。', dx: 390, dy: -40}},
    {id: 'identity-heading', callout: {head: '06 已收紧身份层次', body: '小标题标明页面，姓名成为视觉重点，发布状态靠近姓名。等待视觉复核。', place: 'below'}},
    {id: 'identity-details', callout: {head: '06 简介自然衔接', body: '简介放在主信息和操作下方；短内容紧凑，长内容完整换行。', place: 'below'}}
  ]},
  {id: 'keep', label: '保留优势', finding: '品牌语言、单一主操作与身份标识已有清晰基础。', dim: 1, elements: [
    {id: 'identity-bap', callout: {head: '标识明确', body: '桌面 BAP ID 完整展示，复制操作清楚。优化布局时保留。', place: 'below'}},
    {id: 'home-dome', callout: {head: '保留品牌结构', body: '七线穹顶和地平线形成辨识度，适合继续作为视觉主线。', place: 'below'}},
    {id: 'home-action', callout: {head: '保留单一主操作', body: '蓝色连接钱包按钮容易发现；首页不需要增加竞争入口。', place: 'below'}}
  ]}
]};
