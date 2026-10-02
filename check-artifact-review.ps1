param([string]$EvidenceDirectory='evidence/artifact-v030/R02')
$ErrorActionPreference = 'Stop'
$evidence = Join-Path $PSScriptRoot $EvidenceDirectory
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
# Uses an isolated, simulated-wallet browser session. No real transaction is sent.
$browserCommand = (Get-Command agent-browser).Source
# Resolve the native executable used by the Windows npm shim.
if ($browserCommand.EndsWith('.ps1')) { $browserCommand = Join-Path (Split-Path $browserCommand) 'node_modules/agent-browser/bin/agent-browser-win32-x64.exe' }
function ab { & $browserCommand --session v030-r02-regression @args; if ($LASTEXITCODE -ne 0) { throw 'Artifact browser regression failed' } }
function probe([string]$source) { ab eval -b ([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($source))) }
try {
  ab open http://127.0.0.1:4313/#/artifacts
  ab wait '[data-ready="true"]'
  ab set viewport 320 568
  ab find role button click --name 'Connect Wallet'
  ab find role button click --name 'Approve'
  ab wait '.artifact-grid'
  ab click '#navigation-toggle'
  ab press Escape
  probe 'if(document.activeElement.id!=="navigation-toggle"||document.querySelector("#primary-navigation"))throw Error("Menu focus was not restored")'
  ab find role button click --name 'Create Artifact'
  ab find role textbox fill --name 'Artifact name *' ('A' * 101)
  ab find role button click --name 'Review creation'
  ab find role textbox fill --name 'Artifact name *' ('A' * 102)
  probe 'if(document.querySelector("#artifact-name").getAttribute("aria-invalid")!=="true"||!document.querySelector(".field-error"))throw Error("Invalid edit hid the name error")'
  ab find role textbox fill --name 'Artifact name *' 'Review regression'
  probe 'if(document.querySelector(".field-error"))throw Error("Valid name kept the error")'
  ab click '#navigation-toggle'
  ab click '[data-action="nav-content"]'
  ab wait 'dialog[open]'
  ab press Escape
  probe 'if(document.activeElement.tagName!=="H1"||!document.querySelector("#artifact-name"))throw Error("Cancelled navigation lost the draft or visible focus")'
  ab find role button click --name 'Review creation'
  ab find role button click --name 'Sign & Create Artifact'
  ab wait 'dialog[open]'
  ab focus '.modal-top button'
  ab press Shift+Tab
  probe 'if(document.activeElement.dataset.action!=="artifact-approve")throw Error("Reverse Tab escaped the dialog")'
  ab press Tab
  probe 'if(document.activeElement!==document.querySelector(".modal-top button"))throw Error("Tab did not wrap to the first control");const body=document.querySelector(".modal-body").getBoundingClientRect(),footer=document.querySelector(".modal-footer").getBoundingClientRect();if(body.bottom>footer.top+1||footer.bottom>innerHeight)throw Error("Dialog actions cover content or leave the viewport")'
  ab press Escape
  ab wait '[data-artifact-phase="cancelled"]'
  probe 'if(document.activeElement.tagName!=="H1")throw Error("Cancelled signature lost the page heading focus")'
  ab a11y --json | Set-Content -Encoding utf8 "$evidence/final-operation-a11y.json"
  ab find role button click --name 'Back to My Artifacts'
  ab click '.artifact-current-overview button'
  ab wait '[role="tab"]'
  ab find role tab click --name Ownership --exact
  ab find role button click --name 'Transfer Artifact'
  ab find role button click --name 'Address requirements'
  ab find role button click --name 'Use recipient example 1BitcoinEaterAddressDontSendf59kuE'
  ab press Escape
  ab find role button click --name 'Check latest output & Review'
  ab find role button click --name 'Back' --exact
  ab wait '[data-artifact-screen="transfer"]'
  probe 'if(document.querySelector("#artifact-recipient").value!=="1BitcoinEaterAddressDontSendf59kuE")throw Error("Transfer review lost the recipient");if(document.documentElement.scrollWidth>innerWidth)throw Error("Mobile horizontal overflow")'
  ab screenshot "$evidence/transfer.png" --full
  ab errors --json | Set-Content -Encoding utf8 "$evidence/regression-errors.json"
  'PASS: menu, live validation, draft guard, dialog geometry, keyboard focus and transfer review return.'
} finally { & $browserCommand --session v030-r02-regression close }
