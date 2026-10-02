param([string]$EvidenceDirectory='evidence/artifact-v030/R25')
$ErrorActionPreference='Stop'
$evidence=Join-Path $PSScriptRoot $EvidenceDirectory
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
$browserCommand=(Get-Command agent-browser).Source
if($browserCommand.EndsWith('.ps1')){$browserCommand=Join-Path (Split-Path $browserCommand) 'node_modules/agent-browser/bin/agent-browser-win32-x64.exe'}
function ab { & $browserCommand --session v030-r25-verification @args; if($LASTEXITCODE -ne 0){throw ('浏览器检查失败：'+($args -join ' '))} }
function probe([string]$source){ab eval -b ([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('(()=>{'+$source+';return "PASS";})()')))}
try {
  ab open http://127.0.0.1:4313/
  ab wait '[data-ready="true"]'
  ab set viewport 1440 1000
  ab click '[data-action="welcome-find"]'
  ab fill '#artifact-query' 165
  ab click '[data-action="artifact-find-submit"]'
  ab wait '[data-action="find-open-identity"]'
  ab click '[data-action="find-open-identity"]'
  probe 'if(!document.querySelector("#navigation-toggle").textContent.includes("Public Identity"))throw Error("公开身份导航标签不正确");if(!document.querySelector("[data-action=artifact-back]").textContent.includes("Back to find identity"))throw Error("返回标签不正确")'
  ab screenshot (Join-Path $evidence 'public-identity-desktop.png')
  ab reload
  ab wait '[data-artifact-screen="public-identity"]'
  ab click '[data-action="artifact-back"]'
  ab wait '[data-action="find-open-identity"]'
  probe 'if(document.querySelector("#artifact-query").value!=="165")throw Error("刷新身份后返回丢失查询");if(document.querySelector("[data-artifact-screen=gate]"))throw Error("访客返回触发钱包门槛")'
  ab find role button click --name 'View Artifact' --exact
  ab wait '[data-artifact-screen="detail"]'
  probe 'if(!document.querySelector("[data-action=artifact-back]").textContent.includes("Back to find identity"))throw Error("详情返回入口与来源不符")'
  ab find role button click --name 'View associated identity' --exact
  ab wait '[data-artifact-screen="public-identity"]'
  probe 'if(!document.querySelector("[data-action=artifact-back]").textContent.includes("Back to Artifact"))throw Error("身份未记住资产来源")'
  ab click '[data-action="artifact-back"]'
  ab wait '[data-artifact-screen="detail"]'
  ab click '[data-action="artifact-back"]'
  ab wait '[data-action="find-open-identity"]'
  ab set viewport 390 844
  ab screenshot (Join-Path $evidence 'find-return-mobile.png')
  probe 'if(document.documentElement.scrollWidth>innerWidth)throw Error("查找结果横向溢出")'
  ab reload
  ab wait '[data-action="find-open-identity"]'
  probe 'if(document.querySelector("#artifact-query").value!=="165")throw Error("查找刷新丢失查询")'
  ab open http://127.0.0.1:4313/
  ab wait '[data-ready="true"]'
  ab find role tab click --name Words --exact
  ab find role button click --name 'Read words' --exact
  ab wait '[data-content-screen="read"]'
  probe 'if(!document.querySelector("#navigation-toggle").textContent.includes("Public reading"))throw Error("公开阅读导航标签不正确");if(!document.querySelector("[data-action=reader-back]").textContent.includes("Back to home"))throw Error("阅读未记住首页来源")'
  ab screenshot (Join-Path $evidence 'reader-return-mobile.png')
  ab focus '[data-action="reader-back"]'
  ab press Enter
  ab wait '.welcome-story'
  probe 'if(location.hash||document.querySelector("[data-content-screen=read]"))throw Error("返回首页 URL 与页面不一致")'
  ab find role tab click --name Words --exact
  ab find role button click --name 'Read words' --exact
  ab wait '[data-content-screen="read"]'
  ab back
  ab wait '.welcome-story'
  ab forward
  ab wait '[data-content-screen="read"]'
  ab reload
  ab wait '[data-content-screen="read"]'
  ab click '[data-action="reader-back"]'
  ab wait '.welcome-story'
  ab find role button click --name 'View public profile' --exact
  ab wait '[data-artifact-screen="public-identity"]'
  ab click '[data-action="artifact-back"]'
  ab wait '.welcome-story'
  ab open 'http://127.0.0.1:4313/#/read/first-words'
  ab wait '[data-content-screen="read"]'
  probe 'if(!document.querySelector("[data-action=reader-back]").textContent.includes("Back to find identity"))throw Error("直接阅读缺少公开返回入口")'
  ab click '[data-action="reader-back"]'
  ab wait '#artifact-query'
  ab errors
  Write-Output 'R25 公开路径、刷新、后退前进、查询保留、键盘与 390px 检查通过。'
} finally { ab close }
