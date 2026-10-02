param([string]$EvidenceDirectory='evidence/artifact-v030/R28')
$ErrorActionPreference='Stop'
$evidence=Join-Path $PSScriptRoot $EvidenceDirectory
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
$browserCommand=(Get-Command agent-browser).Source
if($browserCommand.EndsWith('.ps1')){$browserCommand=Join-Path (Split-Path $browserCommand) 'node_modules/agent-browser/bin/agent-browser-win32-x64.exe'}
function ab { & $browserCommand --session v030-r28-states @args; if($LASTEXITCODE -ne 0){throw ('浏览器检查失败：'+($args -join ' '))} }
function encode([string]$source){[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($source))}
$cases=@(
  @{name='稳定编号'; change='d.assets[0]=M.numberObservation(d.assets[0],"six")'; text='Stable'; number='165'; state='stable'; view=$true; screenshot='state-stable-320.png'},
  @{name='五次确认'; change='d.assets[0]=M.numberObservation(d.assets[0],"five")'; text='5/6'; number='165'; state='assigned'; view=$true},
  @{name='编号待确认'; change='d.assets[0]=M.numberObservation(d.assets[0],"pending")'; text='Number pending'; number='—'; state='pending'; view=$true},
  @{name='编号解析中'; change='d.assets[0]=M.numberObservation(d.assets[0],"resolving")'; text='Resolving number'; number='—'; state='resolving'; view=$true},
  @{name='重组重新核实'; change='d.assets[0]=M.numberObservation(d.assets[0],"reorg")'; text='Number being verified after reorganization'; number='—'; state='reorg'; view=$true; screenshot='state-reorg-320.png'},
  @{name='编号不可核实'; change='d.assets[0]=M.numberObservation(d.assets[0],"error")'; text='Number status not verified'; number='—'; state='unverified'; view=$true},
  @{name='关联不可核实'; change='d.assets[0].ownershipCheck="unverified"'; text='Association needs verification'; number=$null; state=$null; view=$true; screenshot='state-association-unverified-320.png'},
  @{name='已转移'; change='d.assets[0].owner=M.addresses[1]'; text='Current association is unavailable'; number=$null; state=$null; view=$true},
  @{name='来源失效'; change='d.assets[0].originValid=false'; text='Current association is unavailable'; number=$null; state=$null; view=$true},
  @{name='重复关联'; change='d.bindings[0].validity="duplicate"'; text='Current association is unavailable'; number=$null; state=$null; view=$true},
  @{name='资产缺失'; change='d.assets.shift()'; text='Current association is unavailable'; number=$null; state=$null; view=$false; screenshot='state-asset-missing-320.png'},
  @{name='只有历史关联'; change='d.bindings=d.bindings.filter(b=>b.bapId!==M.identities[0]||b.state==="history")'; text='Not linked'; number=$null; state=$null; view=$false},
  @{name='长编号'; change='d.assets[0].number="900719925474099312345"'; text='Stable'; number='900719925474099312345'; state='stable'; view=$true; screenshot='state-long-number-320.png'}
)
$results=@()
try {
  ab open 'http://127.0.0.1:4313/#/identity-view/2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD'
  ab wait '.public-identifiers'
  ab set viewport 320 844
  foreach($case in $cases){
    ab eval -b (encode ('(()=>{const M=OwnwordArtifactModel,d=M.seed();'+$case.change+';M.save(d);return "样例已设置";})()'))
    ab reload
    ab wait '.public-identifiers'
    $expected=$case | ConvertTo-Json -Compress
    $source='(()=>{const expected='+$expected+';const group=document.querySelector(".public-identifiers"),summary=group.querySelector(".artifact-summary"),number=summary.querySelector(".artifact-number>strong"),state=summary.querySelector("[data-number-status]"),actions=[...summary.querySelectorAll("button")].map(b=>b.textContent.trim());if(!summary.textContent.includes(expected.text))throw Error("状态文案不符："+summary.textContent);if((number?.textContent||null)!==expected.number)throw Error("展示了不正确的编号");if((state?.dataset.numberStatus||null)!==expected.state)throw Error("编号状态不符");if(actions.length!==(expected.view?1:0)||actions.some(a=>a!=="View Artifact"))throw Error("公开动作不正确");if(document.documentElement.scrollWidth>innerWidth)throw Error("横向溢出");if(group.getBoundingClientRect().bottom>innerHeight)throw Error("标识未完整出现在首屏");if(group.querySelector("code").textContent!==OwnwordArtifactModel.identities[0])throw Error("BAP ID不完整");return {场景:expected.name,文案:summary.textContent.trim(),编号:number?.textContent||null,状态:state?.dataset.numberStatus||null,动作:actions,视口宽度:innerWidth,页面宽度:document.documentElement.scrollWidth,首屏标识底部:Math.round(group.getBoundingClientRect().bottom),结果:"通过"};})()'
    $result=ab eval --json -b (encode $source) | ConvertFrom-Json
    if(!$result.success){throw '状态探针未成功'}
    $results+=$result.data.result
    if($case.screenshot){ab hover 'header'; ab screenshot (Join-Path $evidence $case.screenshot)}
  }
  ab eval -b (encode 'OwnwordArtifactModel.save(OwnwordArtifactModel.seed()); "默认样例已恢复"')
  ab errors
  $results | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $evidence 'state-matrix.json') -Encoding utf8
  Write-Output 'R28 公开数字 ID 的 13 个状态及 320px 首屏检查通过。'
} finally {ab close}
