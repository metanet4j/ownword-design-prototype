param([string]$PreviewUrl='http://127.0.0.1:4313/',[string]$EvidenceDirectory='evidence/artifact-v030/R22')
$ErrorActionPreference = 'Stop'
$browserCommand = (Get-Command agent-browser).Source
if ($browserCommand.EndsWith('.ps1')) { $browserCommand = Join-Path (Split-Path $browserCommand) 'node_modules/agent-browser/bin/agent-browser-win32-x64.exe' }
$evidence = Join-Path $PSScriptRoot $EvidenceDirectory
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
function ab { & $browserCommand --session v030-r22-check @args; if ($LASTEXITCODE -ne 0) { throw ('首页验证失败：'+($args -join ' ')) } }
function probe([string]$source) { ab eval -b ([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('(()=>{'+$source+';return "PASS";})()'))) }
function home { ab open ($PreviewUrl+'?quality=R22-check'); ab wait '[data-ready="true"]'; ab wait '.welcome-story' }
function preferences([string]$locale,[string]$theme) {
  ab click '.header-preferences'
  ab click ('[data-action="locale-'+$locale+'"]')
  ab click ('[data-action="theme-'+$theme+'"]')
  ab press Escape
}
try {
  home
  preferences en light
  ab set viewport 1440 1000
  ab focus '[role="tab"][aria-selected="true"]'
  ab press ArrowRight
  probe 'if(document.activeElement.textContent!=="Words"||!document.querySelector("[role=tabpanel]:not([hidden]) .welcome-words-example"))throw Error("键盘选择未切换到文字")'
  ab screenshot (Join-Path $evidence 'words-desktop.png') --full
  ab press End
  probe 'if(document.activeElement.textContent!=="Proof"||document.querySelectorAll("[role=tabpanel]:not([hidden])").length!==1)throw Error("凭证选择或隐藏面板语义错误")'
  ab click '.welcome-proof-example summary'
  probe 'if(!document.querySelector(".welcome-proof-example details").open||!document.querySelector("[data-proof-state=valid]"))throw Error("凭证记录未展开")'
  ab screenshot (Join-Path $evidence 'proof-desktop.png') --full
  ab focus '[role="tab"][aria-selected="true"]'
  ab press Home
  ab click '[data-action="welcome-open-identity"]'
  ab wait '[data-artifact-screen="public-identity"]'
  probe 'if(document.querySelector("dialog[open]")||!document.querySelector(".identity-stage"))throw Error("公开身份需要连接或未显示身份卡")'
  home
  ab find role tab click --name Words --exact
  ab click '[data-action="welcome-open-words"]'
  ab wait '[data-content-screen="read"]'
  probe 'if(location.hash!=="#/read/first-words"||!document.querySelector(".reader-paper").textContent.includes("Your words deserve a home")||document.querySelector("dialog[open]"))throw Error("公开阅读入口错误")'
  home
  ab click '[data-action="welcome-find"]'
  ab wait '#artifact-query'
  ab fill '#artifact-query' '165'
  ab press Enter
  ab wait '[data-found-artifact]'
  probe 'if(!document.querySelector(".artifact-find-person").textContent.includes("Maya Chen"))throw Error("数字查找未关联到同一作者")'
  home
  ab click '[data-action="connect"]'
  ab wait 'dialog[open]'
  ab press Escape
  probe 'if(document.querySelector("dialog[open]")||!document.querySelector(".welcome-story")||document.activeElement.dataset.action!=="connect")throw Error("取消连接未保留首页或恢复焦点")'
  $cases = @(@{w=320;h=568;locale='en';theme='light'},@{w=390;h=844;locale='zh';theme='dark'},@{w=768;h=1024;locale='en';theme='dark'},@{w=1440;h=1000;locale='zh';theme='light'},@{w=1220;h=555;locale='en';theme='light'})
  foreach($case in $cases) {
    home
    preferences $case.locale $case.theme
    ab set viewport $case.w $case.h
    probe 'if(document.documentElement.scrollWidth>innerWidth)throw Error("首页横向溢出");for(const b of document.querySelectorAll(".welcome-action button")){const r=b.getBoundingClientRect();if(r.height<44||r.bottom>innerHeight||r.left<0||r.right>innerWidth)throw Error("首屏操作不可达")}for(const img of document.images){if(!img.complete||!img.naturalWidth)throw Error("图片未加载")}'
    ab screenshot (Join-Path $evidence ("home-$($case.w)-$($case.locale)-$($case.theme).png")) --full
    ab scrollintoview '.welcome-story'
    probe 'if(document.documentElement.scrollWidth>innerWidth)throw Error("叙事区域横向溢出");for(const tab of document.querySelectorAll(".welcome-story [role=tab]")){if(tab.getBoundingClientRect().height<44)throw Error("标签触控范围不足")}'
  }
  ab set media light reduced-motion
  home
  probe 'if(!matchMedia("(prefers-reduced-motion: reduce)").matches)throw Error("减少动态效果未模拟");if(document.getAnimations().some(a=>a.playState==="running"&&a.effect.getTiming().iterations===Infinity))throw Error("减少动态效果仍有循环动画")'
  $errors = ab errors --json | ConvertFrom-Json
  if($errors.data.errors.Count -gt 0) {throw '浏览器存在运行异常'}
  Write-Output '公开身份、公开阅读、数字查找、取消恢复、键盘标签、五组布局与减少动态效果检查通过。'
} finally { ab close }
