param([string]$EvidenceDirectory='evidence/artifact-v030/R04')
$ErrorActionPreference = 'Stop'
$evidence = Join-Path $PSScriptRoot $EvidenceDirectory
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
# Run in an isolated browser session; only deterministic prototype data is used.
$browserCommand = (Get-Command agent-browser).Source
if ($browserCommand.EndsWith('.ps1')) { $browserCommand = Join-Path (Split-Path $browserCommand) 'node_modules/agent-browser/bin/agent-browser-win32-x64.exe' }
function ab { & $browserCommand --session v030-r04-check @args; if ($LASTEXITCODE -ne 0) { throw ('Workspace check failed: '+($args -join ' ')) } }
function probe([string]$source) { ab eval -b ([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('(()=>{'+$source+';return "PASS";})()'))) }
try {
  ab open http://127.0.0.1:4313/
  ab wait '[data-ready="true"]'
  ab wait '[data-action="connect"]'
  ab click '[data-action="connect"]'
  ab find role button click --name Approve --exact
  ab wait '.identity-page'
  ab set viewport 320 568
  probe 'if(document.querySelector(".content-entry")||document.querySelector(".dome"))throw Error("Identity contains other module or decoration");if(document.documentElement.scrollWidth>innerWidth)throw Error("Identity overflows")'
  ab focus '#navigation-toggle'
  ab press ArrowDown
  probe 'if(document.activeElement.dataset.action!=="nav-identity")throw Error("ArrowDown did not enter navigation");const r=document.querySelector("#primary-navigation").getBoundingClientRect();if(r.left<0||r.right>innerWidth||r.bottom>innerHeight)throw Error("Navigation exceeds viewport")'
  ab press ArrowDown
  probe 'if(document.activeElement.dataset.action!=="nav-artifacts")throw Error("Navigation order is wrong")'
  ab press Escape
  probe 'if(document.querySelector("#primary-navigation")||document.activeElement.id!=="navigation-toggle")throw Error("Escape did not close and restore focus")'
  ab set viewport 575 792
  ab click '#navigation-toggle'
  ab click '.footer > p'
  probe 'if(document.querySelector("#primary-navigation"))throw Error("Outside click did not close navigation")'
  ab click '[data-action="edit"]'
  ab fill '#profile-name' 'Unsaved profile edit'
  ab click '#navigation-toggle'
  ab click '[data-action="nav-content"]'
  ab wait 'dialog[open]'
  ab click '[data-action="keep-editing"]'
  probe 'if(document.querySelector("#profile-name").value!=="Unsaved profile edit")throw Error("Cancelled navigation lost profile input")'
  ab click '#navigation-toggle'
  ab click '[data-action="nav-content"]'
  ab wait 'dialog[open]'
  ab click '[data-action="discard"]'
  ab wait --fn 'location.hash==="#/content"'
  probe 'if(!document.querySelector("#navigation-toggle").textContent.includes("My content"))throw Error("Current module label is stale")'
  ab click '#navigation-toggle'
  ab click '[data-action="nav-artifacts"]'
  ab wait '.artifact-grid'
  ab click '[data-action="artifact-create"]'
  ab fill '#artifact-name' 'Keep this Artifact draft'
  ab click '#navigation-toggle'
  ab click '[data-action="nav-identity"]'
  ab wait 'dialog[open]'
  ab find role button click --name 'Keep editing' --exact
  probe 'if(document.querySelector("#artifact-name").value!=="Keep this Artifact draft")throw Error("Cancelled navigation lost Artifact input")'
  ab click '#navigation-toggle'
  ab click '[data-action="nav-content"]'
  ab wait 'dialog[open]'
  ab find role button click --name 'Discard changes' --exact
  ab wait --fn 'location.hash==="#/content"'
  ab errors --json | Set-Content -Encoding utf8 "$evidence/regression-errors.json"
  Write-Output 'PASS: workspace navigation, 320px bounds, keyboard, outside dismissal and two draft guards.'
} finally { ab close }
