param([string]$PreviewUrl='http://127.0.0.1:4313/')
$ErrorActionPreference = 'Stop'
$browserCommand = (Get-Command agent-browser).Source
if ($browserCommand.EndsWith('.ps1')) { $browserCommand = Join-Path (Split-Path $browserCommand) 'node_modules/agent-browser/bin/agent-browser-win32-x64.exe' }
$evidence = Join-Path $PSScriptRoot 'evidence/artifact-v030/R23'
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
function ab { & $browserCommand --session v030-r23-check @args; if ($LASTEXITCODE -ne 0) { throw ('加载验证失败：'+($args -join ' ')) } }
function probe([string]$source) { ab eval -b ([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('(()=>{'+$source+';return "PASS";})()'))) }
function tokens {
  ab eval -b ([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(@'
(async()=>{
  const fontLink=document.getElementById('ownword-fonts');
  if(fontLink&&!fontLink.sheet)await new Promise(resolve=>{fontLink.addEventListener('load',resolve,{once:true});fontLink.addEventListener('error',resolve,{once:true});});
  await document.fonts.ready;
  const nodes=[...document.querySelectorAll('body *')].filter(n=>n.getClientRects().length);
  const properties=['color','backgroundColor','fontSize','lineHeight','borderColor','padding','gap','margin','width','height'];
  const values=()=>nodes.map(n=>properties.map(p=>getComputedStyle(n)[p]).join('|'));
  const before=values(), style=document.createElement('style');
  const files=['tokens/page.css','tokens/s2-tokens.css','tokens/semantic.css','components/components.css','guidelines/cards.css'].map(f=>'_ds/react-spectrum-s2/'+f).concat(['s2-adapter.css','app.css','content.css','artifact.css','welcome.css']);
  style.textContent=(await Promise.all(files.map(async file=>(await fetch(file)).text()))).join('\n');
  document.head.append(style);
  const after=values();style.remove();
  if(before.some((value,index)=>value!==after[index]))throw Error('优化样式与原始 S2 和页面样式计算结果不一致');
  return 'PASS original styles: '+nodes.length+' elements';
})()
'@)))
}
try {
  ab set viewport 320 568
  ab network route '**/vendor/app.js*' --abort
  ab open ($PreviewUrl+'?quality=R23-startup-error')
  ab wait '#boot-status:not([hidden]) button:not([hidden])'
  probe 'const b=document.querySelector("#boot-status button"),r=b.getBoundingClientRect();if(!document.getElementById("root").hidden||document.activeElement!==b||r.height<44||r.right>innerWidth||r.bottom>innerHeight)throw Error("启动失败不能通过可达的重试恢复")'
  ab screenshot (Join-Path $evidence 'startup-error-mobile.png') --full
  ab network unroute
  ab click '#boot-status button'
  ab wait '[data-ready="true"]'
  ab open ($PreviewUrl+'?quality=R23-unknown#/unknown')
  ab wait '[data-ready="true"]'
  ab set viewport 1440 1000
  ab network route '**/vendor/app.js*' --body ''
  ab open ($PreviewUrl+'?quality=R23-early-click')
  ab wait '.welcome-story'
  ab click '[data-action="connect"]'
  probe 'if(window.OwnwordBootAction?.dataset.action!=="connect"||document.querySelector("dialog[open]"))throw Error("初始点击未等待交互加载")'
  ab network unroute
  ab eval 'const script=document.createElement("script");script.src="vendor/app.js?quality=early-click";document.body.append(script)'
  ab wait 'dialog[open]'
  ab press Escape
  probe 'if(document.getElementById("root").dataset.ready!=="true"||document.activeElement.dataset.action!=="connect")throw Error("初始点击未接续或取消未恢复焦点")'
  ab open ($PreviewUrl+'?quality=R23-loading')
  ab wait '[data-ready="true"]'
  ab wait '.welcome-story'
  probe 'if(typeof Babel!=="undefined"||window.OwnwordEditorTools||performance.getEntriesByType("resource").some(x=>/babel|editor-tools|markdown-tools/.test(x.name)))throw Error("首页仍在编译或加载编辑器/阅读器")'
  tokens
  ab screenshot (Join-Path $evidence 'home.png') --full
  ab find role tab click --name Words --exact
  ab wait '.welcome-words-example .markdown-body p'
  probe 'if(!window.OwnwordEditorTools.renderMarkdown||window.OwnwordEditorTools.createEditor)throw Error("公开读取加载了完整编辑器")'
  ab click '[data-action="welcome-open-words"]'
  ab wait '.reader-paper .markdown-body h1'
  ab wait '.reader-toc'
  tokens
  ab screenshot (Join-Path $evidence 'reader.png') --full
  ab network route '**/vendor/markdown-tools.js*' --abort
  ab reload
  ab wait '[data-content-load="error"]'
  probe 'if(location.hash!=="#/read/first-words")throw Error("正文加载失败丢失路线")'
  ab network unroute
  ab click '[data-action="reader-load-retry"]'
  ab wait '.reader-paper .markdown-body h1'
  ab wait '.reader-toc'
  ab open ($PreviewUrl+'?quality=R23-writing')
  ab click '[data-action="connect"]'
  ab find role button click --name Approve --exact
  ab wait '.identity-page'
  tokens
  ab click '#navigation-toggle'
  ab click '[data-action="nav-content"]'
  ab wait '[data-action="content-new"]'
  ab network route '**/vendor/editor-tools.js*' --abort
  ab click '[data-action="content-new"]'
  ab wait '[data-editor-load="error"]'
  ab screenshot (Join-Path $evidence 'editor-load-error.png') --full
  ab network unroute
  ab click '[data-action="editor-load-retry"]'
  ab wait '[data-visual-state="ready"]'
  probe 'if(document.activeElement.tagName!=="H1")throw Error("编辑器重试未恢复可见焦点")'
  ab find role textbox fill --name 'Edit formatted Markdown' 'R23 draft survives reload and retry'
  ab wait --fn 'Object.values(localStorage).some(v=>v.includes("R23 draft survives reload and retry"))'
  tokens
  ab screenshot (Join-Path $evidence 'editor.png') --full
  ab network route '**/vendor/editor-tools.js*' --abort
  ab reload
  ab wait '[data-action="content-connect"]'
  ab click '[data-action="content-connect"]'
  ab find role button click --name Approve --exact
  ab wait '[data-editor-load="error"]'
  probe 'if(!Object.values(localStorage).some(v=>v.includes("R23 draft survives reload and retry")))throw Error("草稿在加载失败后丢失")'
  ab network unroute
  ab click '[data-action="editor-load-retry"]'
  ab wait '[data-visual-state="ready"]'
  probe 'if(!document.querySelector(".visual-editor-host").textContent.includes("R23 draft survives reload and retry"))throw Error("重试没有恢复原草稿");if(/<script|<img|href="javascript:/i.test(OwnwordEditorTools.renderMarkdown("<script>alert(1)</script>\n\n[x](javascript:alert(1))").html))throw Error("按需解析丢失安全边界")'
  $errors = ab errors --json | ConvertFrom-Json
  if($errors.data.errors.Count -gt 0) {throw '浏览器存在运行异常'}
  Write-Output 'PASS：按需读取、失败重试、目录、草稿持久化、安全解析、样式一致性及浏览器错误检查。'
} finally { ab network unroute; ab close }
