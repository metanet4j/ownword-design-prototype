// 在独立测试会话的草稿编辑页运行：agent-browser --session content-r03 eval --stdin < evidence/R03/check-visual.js
(async () => {
  const assert=(value,message)=>{if(!value)throw Error(message);};
  const tick=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const source=()=>document.querySelector('.editor-host').ownwordEditor;
  const visual=()=>document.querySelector('.visual-editor-host').ownwordVisualEditor;
  const original=source().value(), results={};
  async function setSource(value){const view=source().view;view.dispatch({changes:{from:0,to:view.state.doc.length,insert:value}});await tick();}
  async function mode(value){document.querySelector('[data-mode="'+value+'"]').click();await tick();}
  function selectText(text){const view=visual().view;let from;view.state.doc.descendants((node,pos)=>{if(from==null && node.isText && node.text.includes(text))from=pos+node.text.indexOf(text);});assert(from!=null,'找不到选区 '+text);view.dispatch(view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc,from,from+text.length)));}
  async function format(key){if(!document.querySelector('[data-format="'+key+'"]')){document.querySelector('[data-action="editor-more"]').click();await tick();}document.querySelector('[data-format="'+key+'"]').click();await tick();}
  try {
    await setSource('# 可视化验证\n\n测试文字\n\n+ 第一项\n+ 第二项\n');
    const baseline=source().value();
    for(const value of ['visual','edit','preview','visual'])await mode(value);
    assert(source().value()===baseline,'模式切换改写原文');results.noOp=true;
    selectText('测试文字');await format('bold');assert(source().value().includes('**测试文字**'),'粗体未同步');await format('undo');assert(source().value()===baseline,'撤销未恢复原文');results.boldUndoExact=true;
    selectText('测试文字');await format('italic');assert(source().value().includes('*测试文字*'),'斜体失败');await format('undo');
    selectText('测试文字');await format('strike');assert(source().value().includes('~~测试文字~~'),'删除线失败');await format('undo');
    selectText('测试文字');await format('code');assert(source().value().includes('`测试文字`'),'行内代码失败');await format('undo');results.inlineFormats=true;
    selectText('测试文字');const picker=document.querySelector('.editor-heading-picker select');picker.value='h2';picker.dispatchEvent(new Event('change',{bubbles:true}));await tick();assert(source().value().includes('## 测试文字'),'标题失败');await format('undo');results.heading=true;
    for(const [key,pattern] of [['quote','> 测试文字'],['ordered','1. 测试文字'],['unordered','- 测试文字'],['codeblock','```']]){await setSource('# 可视化验证\n\n测试文字\n');selectText('测试文字');await format(key);assert(source().value().includes(pattern),key+'失败');}results.blocks=true;
    await setSource('# 可视化验证\n\n测试文字\n');selectText('测试文字');await format('task');assert(source().value().includes('[ ] 测试文字'),'任务列表失败');const checkbox=document.querySelector('[data-task-checkbox]');assert(checkbox,'缺少任务框');checkbox.click();await tick();assert(source().value().includes('[x] 测试文字'),'勾选任务未同步');results.taskCheckbox=true;
    await setSource('# 可视化验证\n\n测试文字\n');selectText('测试文字');await format('table');assert(document.querySelector('.visual-surface table'),'未插入表格');assert(source().value().includes('|'),'表格未同步');results.table=true;
    await setSource('# 原文保留\n\n![media](https://example.invalid/never-load.png)\n\n<script>window.unsafeRun=true</script>\n\n正文[^1]\n\n[^1]: 脚注');const unsafe=source().value();await mode('visual');assert(!document.querySelector('[data-action="visual-source"]').hidden,'缺少源码入口');assert(document.querySelector('.visual-editor-host').hidden,'不支持语法仍可视化编辑');assert(!document.querySelector('.visual-surface img'),'加载了媒体');assert(!window.unsafeRun,'执行了 HTML');await mode('edit');assert(source().value()===unsafe,'原文丢失');results.unsupportedPreserved=true;
    assert(document.documentElement.scrollWidth<=innerWidth,'页面溢出');results.noOverflow=true;
    return results;
  } finally {await setSource(original);await mode('visual');}
})();
