"""Black-box prototype checks. Requires agent-browser on PATH and a running HTTP
server for the prototype. Run: python check-browser.py. Browser/HTTP evidence is
written under evidence/.

Point the checks at the live preview with OWNWORD_URL (full page URL) or
OWNWORD_PORT (default 4311). A snapshot server on the default port would
silently validate the wrong build, so always pass the port you actually serve.
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
PORT = os.environ.get('OWNWORD_PORT', '4311')
URL = os.environ.get('OWNWORD_URL') or (
    f'http://127.0.0.1:{PORT}/own-word-prototype-s2-astra-001/index.html')
results = []
incomplete_audit = []

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

def settle(limit=80):
    """Wait for finite CSS transitions to finish before measuring or auditing.

    Buttons animate color/background/border over 150ms; sampling axe mid
    transition reports blended colors and invents contrast violations. Infinite
    animations (sky-line pulse, 3D rotation) are ignored on purpose.
    """
    expression = ('document.getAnimations().every(a=>a.playState!=="running"'
                  '||(a.effect&&a.effect.getTiming().iterations===Infinity))')
    for _ in range(limit):
        if js(expression):
            return
        time.sleep(0.05)
    raise AssertionError('CSS transitions did not settle')

def expect(expression, label):
    assert js(expression), label
    results.append(label)
    print(f'PASS {label}', flush=True)

def wait_until(expression, label, timeout=5.0, diagnostic=None):
    """Poll a condition that may settle asynchronously (clipboard, timers)."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if js(expression):
            results.append(label)
            print(f'PASS {label}', flush=True)
            return
        time.sleep(0.1)
    extra = ''
    if diagnostic:
        try:
            extra = f' | actual: {js(diagnostic)!r}'
        except Exception as error:  # keep the original failure visible
            extra = f' | diagnostic failed: {error}'
    raise AssertionError(f'{label}: condition not met within {timeout}s{extra}')

def pref(locale='en', theme='light'):
    # UI preference controls remain exercised for every screen, without reload.
    call('click', '.preference-anchor > button')
    click('中文' if locale == 'zh' else 'English')
    click(('深色' if theme == 'dark' else '浅色') if locale == 'zh' else ('Dark' if theme == 'dark' else 'Light'))
    call('click', '.preferences > button')
    settle()

WIDTHS = (320, 390, 768, 960)

def inspect(label, matrix=False):
    combinations = [('en', 'light'), ('en', 'dark'), ('zh', 'light'), ('zh', 'dark')] if matrix else [('en', 'light')]
    for locale, theme in combinations:
        pref(locale, theme)
        for width in WIDTHS:
            call('set', 'viewport', width, 800)
            settle()
            expect('document.documentElement.scrollWidth <= innerWidth', f'{label} {locale}/{theme} {width}px no page overflow')
            expect('Array.from(document.querySelectorAll("main button, main input:not([hidden]), main textarea")).filter(e=>e.getBoundingClientRect().width).every(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1})', f'{label} {locale}/{theme} {width}px controls fit')
        call('set', 'viewport', 320, 800)
        settle()
        expect('Array.from(document.querySelectorAll("main button, main input:not([hidden]), main textarea")).filter(e=>e.getBoundingClientRect().width).every(e=>{const r=e.getBoundingClientRect();return r.width>=24&&r.height>=44})', f'{label} {locale}/{theme} 320px touch targets')
        a11y = call('a11y', json_result=True)
        (EVIDENCE / f'{label}-{locale}-{theme}-axe.json').write_text(json.dumps(a11y, ensure_ascii=False, indent=2), encoding='utf-8')
        assert not a11y['violations'], f'{label}/{locale}/{theme}: {a11y["violations"]}'
        incomplete = a11y.get('incomplete', [])
        for rule in incomplete:
            nodes = rule.get('nodes', [])
            incomplete_audit.append({
                'screen': f'{label} {locale}/{theme}',
                'rule': rule['id'],
                'nodes': rule.get('nodeCount', 0),
                'targets': sorted({target for node in nodes for target in (node.get('target') or [])}),
                'reasons': sorted({(node.get('failureSummary') or '').split('Fix any of the following:')[-1].strip() for node in nodes if node.get('failureSummary')}),
            })
        results.append(f'{label} {locale}/{theme} axe 0 violations')
        print(f'PASS {label} {locale}/{theme} axe 0 violations ({len(incomplete)} incomplete recorded)', flush=True)
        call('screenshot', '--full', str(EVIDENCE / f'{label}-{locale}-{theme}-320.png'))
    pref()
    call('set', 'viewport', 1440, 1000)
    settle()
    expect('document.documentElement.scrollWidth <= innerWidth', f'{label} 1440px no page overflow')
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
    expect('document.body.innerText.includes("Couldn\u0027t resolve identity") && document.body.innerText.includes("Try Again") && document.body.innerText.includes("Disconnect")', 'Resolution failure explains and offers retry or disconnect')
    inspect('resolve-error', True)
    click('Disconnect')
    scenario('existing'); click('Connect Wallet'); click('Approve')
    wait_page('identity')
    expect('!!document.querySelector(".identity-page .person-row h2")', 'Published identity opens My Identity')
    click('Disconnect')
    connect('new')
    expect('document.querySelector(".wallet-connected").textContent.includes("Connected")', 'Connection shows Connected status')
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
    wait_until('document.querySelector(".copy-feedback").textContent === "Copied"', 'Copy success feedback', diagnostic='(document.querySelector(".copy-feedback")||{}).textContent')
    # Paste through a user gesture; direct Clipboard.readText needs a separate
    # browser permission and is not part of this product's Copy behavior.
    click('Back'); call('fill', '#profile-name', ''); call('focus', '#profile-name'); call('clipboard', 'paste')
    expect('document.querySelector("#profile-name").value === OwnwordModel.ids[0]', 'Clipboard contains complete BAP ID')
    call('fill', '#profile-name', 'Maya Chen'); click('Review')
    call('click', '.footer-controls > button'); call('check', '.scenario-panel input[type=checkbox]'); call('click', '.panel-title button')
    click('Copy full BAP ID')
    wait_until('document.querySelector(".copy-feedback").textContent === "Couldn\u0027t copy" && !!document.querySelector(".identifier code").textContent', 'Copy failure preserves identifier', diagnostic='(document.querySelector(".copy-feedback")||{}).textContent')
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
    wait_until('document.body.innerText.includes("Creating identity...")', 'Creation processing visible', diagnostic='document.querySelector("main").dataset.screenLabel')
    wait_page('ready')
    inspect('ready', True)
    click('Go to My Identity'); wait_page('identity')
    inspect('identity', True)
    expect('document.querySelector(".identifier").getBoundingClientRect().bottom < innerHeight', 'Desktop BAP ID in first viewport')
    call('set', 'viewport', 320, 800); settle()
    expect('document.querySelector(".identifier").getBoundingClientRect().bottom < innerHeight', '320px BAP ID in first viewport')
    expect('[".identity-page .portrait [role=\\"img\\"], .identity-page .portrait img", ".identity-page .profile-type", ".identity-page .person-row h2", ".identity-page .bio", ".identifier code"].every(s=>document.querySelector(s))', 'My Identity shows avatar, name, type, bio and BAP ID')
    expect('Array.from(document.querySelectorAll("button")).filter(b=>!b.textContent.trim()).every(b=>b.getAttribute("aria-label")||b.getAttribute("title"))', 'Icon buttons expose accessible names')
    expect('Array.from(document.querySelectorAll(".s2d-status")).every(e=>e.textContent.trim().length>0)', 'Status states carry text, not colour alone')
    call('set', 'viewport', 1440, 1000); settle()
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
    js('window.__lightBg = getComputedStyle(document.body).backgroundColor')
    pref('zh', 'dark')
    expect('document.documentElement.dataset.colorScheme === "dark" && getComputedStyle(document.body).backgroundColor !== window.__lightBg', 'Dark theme applies different semantic surface tokens')
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
    (EVIDENCE / 'axe-incomplete-summary.json').write_text(json.dumps(incomplete_audit, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{len(results)} browser checks passed; {len(incomplete_audit)} axe incomplete recorded', flush=True)
finally:
    (EVIDENCE / 'browser-results.json').write_text(json.dumps({'passed': len(results), 'checks': results, 'axeIncomplete': incomplete_audit}, ensure_ascii=False, indent=2), encoding='utf-8')
    call('close')
