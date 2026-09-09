"""Offline startup check.

The prototype must boot with every external request blocked: React, ReactDOM and
Babel are served from `vendor/`, and the production build will not fetch them
from a CDN. Fonts still fall back to system fonts when `use.typekit.net` is
unreachable (see vendor/README.md).

Run: python check-offline.py. Server selection matches check-browser.py
(OWNWORD_URL, or OWNWORD_PORT defaulting to 4311). Evidence:
evidence/offline-startup.json.
"""
import base64
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / 'evidence'
EVIDENCE.mkdir(exist_ok=True)
CLI = shutil.which('agent-browser.cmd') or shutil.which('agent-browser')
SESSION = 'ownword-astra-offline'
PORT = os.environ.get('OWNWORD_PORT', '4311')
URL = os.environ.get('OWNWORD_URL') or (
    f'http://127.0.0.1:{PORT}/own-word-prototype-s2-astra-001/index.html')
results = []

def call(*args, json_result=False):
    # --allowed-domains keeps the browser from reaching any host but the local
    # preview server, so a CDN dependency fails the check instead of hiding.
    command = [CLI, '--session', SESSION, '--allowed-domains', '127.0.0.1,localhost',
               *map(str, args)]
    if json_result:
        command.append('--json')
    with tempfile.TemporaryFile() as output, tempfile.TemporaryFile() as errors:
        process = subprocess.run(command, stdout=output, stderr=errors, timeout=90, cwd=ROOT)
        output.seek(0); errors.seek(0)
        stdout = output.read().decode('utf-8', errors='replace')
        stderr = errors.read().decode('utf-8', errors='replace')
    if process.returncode:
        raise AssertionError(f'{args}: {stdout} {stderr}')
    if json_result:
        payload = json.loads(stdout)
        assert payload['success'], payload
        return payload['data']
    return stdout

def js(source):
    encoded = base64.b64encode(source.encode()).decode()
    return call('eval', '-b', encoded, json_result=True).get('result')

def check(expression, label):
    value = js(expression)
    assert value, f'{label}: got {value!r}'
    results.append(label)
    print(f'PASS {label}', flush=True)

try:
    call('open', URL)
    js('localStorage.clear();true')
    call('reload')
    call('wait', '--text', 'Own your identity.')
    check("[...document.scripts].every(s=>!s.src || new URL(s.src).origin===location.origin)", 'All startup scripts load from the local origin')
    check("document.querySelector('.welcome h1').getBoundingClientRect().height>0", 'Welcome renders with external requests blocked')
    check("!document.body.innerText.includes('Loading your space')", 'Boot placeholder replaced by the application')
    call('find', 'role', 'button', 'click', '--name', 'Connect Wallet', '--exact')
    call('find', 'role', 'button', 'click', '--name', 'Approve', '--exact')
    call('wait', '--fn', 'document.querySelector("main").dataset.screenLabel === "setup"')
    check("!!document.querySelector('#profile-name')", 'Babel compiles JSX offline and the flow reaches Setup')
    errors = call('errors')
    (EVIDENCE / 'offline-errors.txt').write_text(errors, encoding='utf-8')
    assert not errors.strip(), errors
    print(f'{len(results)} offline startup checks passed', flush=True)
finally:
    (EVIDENCE / 'offline-startup.json').write_text(
        json.dumps({'passed': len(results), 'checks': results}, ensure_ascii=False, indent=2),
        encoding='utf-8')
    call('close')
