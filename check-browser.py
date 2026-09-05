"""Black-box prototype checks. Requires agent-browser on PATH and HTTP port 4311.
Run: python check-browser.py. Browser/HTTP evidence is written under evidence/.
"""
import base64
import json
import os
from pathlib import Path
import shutil
import subprocess
import time
import tempfile

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / 'evidence'
EVIDENCE.mkdir(exist_ok=True)
CLI = shutil.which('agent-browser.cmd') or shutil.which('agent-browser')
SESSION = 'ownword-astra-check'
URL = 'http://127.0.0.1:4311/own-word-prototype-s2-astra-001/index.html'
results = []

def call(*args, json_result=False):
    command = [CLI, '--session', SESSION, *map(str, args)]
    if json_result:
        command.append('--json')
    # Windows background daemons may inherit pipes. Regular files let the CLI
    # finish independently of its persistent browser process.
    with tempfile.TemporaryFile() as output, tempfile.TemporaryFile() as errors:
        process = subprocess.run(command, stdout=output, stderr=errors, timeout=40, cwd=ROOT)
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
    data = call('eval', '-b', encoded, json_result=True)
    return data.get('result', data)

def click(label):
    call('find', 'role', 'button', 'click', '--name', label, '--exact')

def wait_page(page):
    call('wait', '--fn', f'document.querySelector("main").dataset.screenLabel === "{page}"')

def expect(expression, label):
    assert js(expression), label
    results.append(label)
    print(f'PASS {label}', flush=True)

def pref(locale='en', theme='light'):
    # UI preference controls remain exercised for every screen, without reload.
    call('click', '.preference-anchor > button')
    click('中文' if locale == 'zh' else 'English')
    click(('深色' if theme == 'dark' else '浅色') if locale == 'zh' else ('Dark' if theme == 'dark' else 'Light'))
    call('click', '.preferences > button')

def inspect(label, matrix=False):
    combinations = [('en', 'light'), ('en', 'dark'), ('zh', 'light'), ('zh', 'dark')] if matrix else [('en', 'light')]
    for locale, theme in combinations:
        pref(locale, theme)
        call('set', 'viewport', 320, 800)
        expect('document.documentElement.scrollWidth <= innerWidth', f'{label} {locale}/{theme} 320px no page overflow')
        expect('Array.from(document.querySelectorAll("main button, main input:not([hidden]), main textarea")).filter(e=>e.getBoundingClientRect().width).every(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.width>=24&&r.height>=44})', f'{label} {locale}/{theme} controls fit and touch targets')
        a11y = call('a11y', json_result=True)
        (EVIDENCE / f'{label}-{locale}-{theme}-axe.json').write_text(json.dumps(a11y, ensure_ascii=False, indent=2), encoding='utf-8')
        serious = [v for v in a11y['violations'] if v.get('impact') in ('critical', 'serious')]
        assert not serious, f'{label}/{locale}/{theme}: {serious}'
        results.append(f'{label} {locale}/{theme} axe no serious/critical violations')
        call('screenshot', '--full', str(EVIDENCE / f'{label}-{locale}-{theme}-320.png'))
    pref()
    call('set', 'viewport', 1440, 1000)
    call('screenshot', '--full', str(EVIDENCE / f'{label}-desktop.png'))

def scenario(value):
    call('click', '.footer-controls > button')
    call('select', '.scenario-panel select', value)
    call('click', '.panel-title button')

def connect(value='new'):
    scenario(value)
    click('Connect Wallet')
    click('Approve')
    wait_page('identity' if value == 'existing' else 'resolve-error' if value == 'resolveFail' else 'setup')

try:
    call('open', URL)
    js('localStorage.removeItem("ownword-astra-locale");localStorage.removeItem("ownword-astra-theme");true')
    call('reload')
    call('wait', '--text', 'Own your identity.')
    expect('document.documentElement.lang === "en" && document.documentElement.dataset.colorScheme === "light"', 'First visit English and Light')
    expect('document.querySelectorAll(".vault-line").length === 7', 'Exactly seven sky lines')
    call('focus', '.dome'); call('press', 'Enter')
    expect('document.querySelector(".vault").dataset.pulse === "true"', 'Keyboard plays sky lines')
    inspect('welcome', True)
    click('Connect Wallet'); click('Cancel')
    expect('document.body.innerText.includes("Connection cancelled")', 'Connection cancellation returns to welcome')
    click('Connect Wallet'); click('Simulate failure')
    expect('document.body.innerText.includes("Connection failed") && document.body.innerText.includes("Try Again")', 'Connection failure provides retry')
    connect('resolveFail')
    inspect('resolve-error', True)
    click('Disconnect')
    connect('new')
    click('Review')
    expect('document.querySelector("#profile-name").getAttribute("aria-invalid") === "true"', 'Invalid required name blocks Review')
    call('fill', '#profile-name', 'x' * 101); click('Review')
    expect('document.body.innerText.includes("100 characters")', 'Name maximum 100 enforced')
    call('fill', '#profile-name', 'Maya Chen')
    call('fill', '#profile-bio', 'x' * 1001); click('Review')
    expect('document.body.innerText.includes("1000 characters")', 'Bio maximum 1000 enforced')
    call('fill', '#profile-bio', 'Thinking in systems. Writing with intention.')
    click('Review'); wait_page('review')
    click('Back'); wait_page('setup')
    inspect('setup', True)
    click('Review'); wait_page('review')
    inspect('review', True)
    click('Copy full BAP ID')
    expect('document.querySelector(".copy-feedback").textContent === "Copied"', 'Copy success feedback')
    # Paste through a user gesture; direct Clipboard.readText needs a separate
    # browser permission and is not part of this product's Copy behavior.
    click('Back'); call('fill', '#profile-name', ''); call('focus', '#profile-name'); call('clipboard', 'paste')
    expect('document.querySelector("#profile-name").value === OwnwordModel.ids[0]', 'Clipboard contains complete BAP ID')
    call('fill', '#profile-name', 'Maya Chen'); click('Review')
    call('click', '.footer-controls > button'); call('check', '.scenario-panel input[type=checkbox]'); call('click', '.panel-title button')
    click('Copy full BAP ID')
    expect('document.querySelector(".copy-feedback").textContent === "Couldn\u0027t copy" && !!document.querySelector(".identifier code").textContent', 'Copy failure preserves identifier')
    call('click', '.footer-controls > button'); call('uncheck', '.scenario-panel input[type=checkbox]'); call('click', '.panel-title button')
    click('Create Identity')
    call('set', 'viewport', 320, 800)
    call('screenshot', '--full', str(EVIDENCE / 'wallet-confirmation-320.png'))
    call('press', 'Escape')
    expect('document.body.innerText.includes("Creation cancelled")', 'Escape cancels wallet creation')
    expect('document.querySelector(".review-profile h2").textContent === "Maya Chen"', 'Cancelled creation preserves values')
    click('Create Identity'); click('Simulate failure')
    call('wait', '--text', "Couldn't create identity")
    expect('document.querySelector("main").dataset.screenLabel === "review"', 'Creation failure retains review and retry')
    click('Try Again'); click('Approve')
    expect('document.body.innerText.includes("Creating identity...")', 'Creation processing visible')
    wait_page('ready')
    inspect('ready', True)
    click('Go to My Identity'); wait_page('identity')
    inspect('identity', True)
    expect('document.querySelector(".identifier").getBoundingClientRect().bottom < innerHeight', 'Desktop BAP ID in first viewport')
    click('Public Identity'); wait_page('public')
    inspect('public', True)
    expect('document.querySelector(".identity-sculpture").classList.contains("rotating")', 'Public Identity rotates')
    click('Pause rotation')
    call('focus', '.rotation-label input'); call('press', 'End')
    expect('document.querySelector(".identity-sculpture").style.getPropertyValue("--angle") === "40deg"', '3D viewing angle controllable')
    click('Reset view')
    click('Back to My Identity'); click('Edit Profile')
    call('fill', '#profile-name', 'Maya Revised')
    click('Back')
    expect('document.querySelector("dialog[open]").innerText.includes("Discard unsaved changes?")', 'Unsaved changes ask before leaving')
    click('Keep editing')
    expect('document.querySelector("#profile-name").value === "Maya Revised"', 'Keep editing preserves draft')
    click('Review'); click('Save Changes'); click('Cancel')
    wait_page('edit')
    expect('document.querySelector("#profile-name").value === "Maya Revised" && document.body.innerText.includes("Saving cancelled")', 'Save cancellation retains editing values on form')
    inspect('edit', True)
    click('Review'); click('Save Changes'); click('Approve')
    wait_page('identity')
    expect('document.querySelector(".person-row h2").textContent === "Maya Revised"', 'Save updates My Identity')
    expect('document.querySelector(".identifier code").textContent === OwnwordModel.ids[0]', 'Profile update keeps BAP ID')
    click('Edit Profile'); call('fill', '#profile-name', 'Do not save this')
    click('Review'); click('Save Changes')
    call('click', '.modal-scenarios button:nth-child(2)')
    wait_page('identity')
    expect('document.querySelector(".person-row h2").textContent === "North Studio" && !document.body.innerText.includes("Do not save this")', 'Account switch cancels confirmation and clears old identity')
    click('Disconnect'); connect('incomplete')
    expect('document.body.innerText.includes("Complete your profile")', 'Incomplete identity routes to completion')
    call('fill', '#profile-name', 'Completed Name'); click('Review')
    expect('document.body.innerText.includes("Save Changes") && !document.body.innerText.includes("Create Identity")', 'Incomplete published identity updates profile without duplicate creation')
    click('Save Changes'); click('Approve'); wait_page('identity')
    pref('zh', 'dark')
    expect('document.querySelector(".person-row h2").textContent === "Completed Name" && document.querySelector(".identifier code").textContent === OwnwordModel.ids[0]', 'Locale and theme preserve profile and BAP ID')
    call('reload'); call('wait', '--text', '拥有你的身份。')
    expect('document.documentElement.lang === "zh-CN" && document.documentElement.dataset.colorScheme === "dark"', 'Preferences persist after refresh')
    pref()
    scenario('missing'); click('Connect Wallet')
    expect('document.body.innerText.includes("Yours Wallet is unavailable")', 'Unavailable wallet explains recovery')
    call('press', 'Escape')
    errors = call('errors')
    (EVIDENCE / 'browser-errors.txt').write_text(errors, encoding='utf-8')
    assert not errors.strip(), errors
    (EVIDENCE / 'browser-console.txt').write_text(call('console'), encoding='utf-8')
    print(f'{len(results)} browser checks passed', flush=True)
finally:
    (EVIDENCE / 'browser-results.json').write_text(json.dumps({'passed': len(results), 'checks': results}, ensure_ascii=False, indent=2), encoding='utf-8')
    call('close')
