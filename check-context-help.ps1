$ErrorActionPreference = 'Stop'
# Windows: launch this isolated session once before redirecting this script's output.
$browserCommand = (Get-Command agent-browser).Source
if ($browserCommand.EndsWith('.ps1')) { $browserCommand = Join-Path (Split-Path $browserCommand) 'node_modules/agent-browser/bin/agent-browser-win32-x64.exe' }
function ab { Write-Output ('CHECK: '+$args[0]); & $browserCommand --session v030-r03-check @args; if ($LASTEXITCODE -ne 0) { throw ('Contextual help regression failed: '+($args -join ' ')) } }
function probe([string]$source) { ab eval -b ([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('(()=>{'+$source+'})()'))) }
try {
  ab open http://127.0.0.1:4313/#/artifacts
  ab wait '[data-artifact-screen="gate"]'
  ab find role button click --name 'Connect Wallet'
  ab find role button click --name 'Approve'
  ab wait '.artifact-grid'
  ab find role button click --name 'Choose from wallet'
  ab click '[data-select-artifact$="0800_0"]'
  ab wait '[data-artifact-screen="action-review"]'
  probe 'const main=document.querySelector("main");if(main.innerText.includes("simulated")||main.innerText.includes("#2048")||main.querySelector(".page-heading .eyebrow")||main.querySelector(".artifact-default"))throw Error("Redundant review content remains");if(main.querySelector(".artifact-number strong").textContent!=="2048"||!main.querySelector(".artifact-replacement").textContent.includes("165"))throw Error("Review lost its target or replacement")'
  ab hover '.context-help-trigger'
  ab wait '.context-help-panel'
  ab hover '.context-help-panel'
  probe 'if(!document.querySelector(".context-help-panel"))throw Error("Pointer cannot read the help panel")'
  ab hover 'h1'
  ab wait --fn '!document.querySelector(".context-help-panel")'
  ab focus '.context-help-trigger'
  ab wait '.context-help-panel'
  ab press Escape
  probe 'if(document.querySelector(".context-help-panel")||!document.activeElement.classList.contains("context-help-trigger"))throw Error("Escape did not dismiss help and restore its trigger")'
  ab click '.context-help-trigger'
  ab wait '.context-help-panel'
  ab click '.context-help-trigger'
  probe 'if(document.querySelector(".context-help-panel"))throw Error("Second click did not close pinned help")'
  ab set viewport 320 568
  ab click '.context-help-trigger'
  ab wait '.context-help-panel'
  probe 'const r=document.querySelector(".context-help-panel").getBoundingClientRect();if(r.left<0||r.right>innerWidth||r.top<0||r.bottom>innerHeight||document.documentElement.scrollWidth>innerWidth)throw Error("Help leaves the narrow viewport")'
  ab press Escape
  ab click '.artifact-review-details summary'
  probe 'if(!document.querySelector("[data-action=copy-review-inscription]"))throw Error("Full inscription ID is unavailable")'
  ab scroll down 240
  ab click '[data-action="artifact-action-sign"]'
  ab wait 'dialog[open]'
  ab find role button click --name 'About the signature'
  ab press Escape
  probe 'if(!document.querySelector("dialog[open]")||document.querySelector(".context-help-panel"))throw Error("Closing help cancelled the authorization dialog")'
  ab press Escape
  ab wait '[data-artifact-phase="cancelled"]'
  ab find role button click --name 'Back to My Artifacts'
  ab find role button click --name 'View Artifact · A place to stand'
  ab find role button click --name 'Transfer Artifact'
  ab find role button click --name 'Address requirements'
  ab find role button click --name 'Use recipient example 1BitcoinEaterAddressDontSendf59kuE'
  ab press Escape
  ab click '[data-action="artifact-transfer-review"]'
  ab find role button click --name 'Back' --exact
  probe 'if(document.querySelector("#artifact-recipient").value!=="1BitcoinEaterAddressDontSendf59kuE")throw Error("Transfer return lost the recipient")'
  & $browserCommand --session v030-r03-check errors --json | Set-Content -Encoding utf8 "$PSScriptRoot/evidence/artifact-v030/R03/regression-errors.json"
  'PASS: plain-number review, hover, keyboard, click, narrow-screen bounds, disclosure, nested dialog Escape and transfer return.'
} catch { & $browserCommand --session v030-r03-check snapshot -i; throw } finally { & $browserCommand --session v030-r03-check close }
