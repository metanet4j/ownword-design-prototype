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
import sys
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
CONTROLS_ONLY = '--controls-only' in sys.argv
FEEDBACK_ONLY = '--feedback-only' in sys.argv

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

def scroll_to(selector):
    js(f'document.querySelector({json.dumps(selector)})?.scrollIntoView({{block: "center", behavior: "instant"}})')
    time.sleep(0.05)

def click_selector(selector):
    scroll_to(selector)
    call('click', selector)

def dome_center():
    return js('(()=>{const r=document.querySelector(".dome").getBoundingClientRect();return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)]})()')

def click_action(name):
    """Click by stable data-action hook instead of user-visible copy.

    Scrolls first: a scrollable dialog can place a secondary action below the
    fold at 320px, and a coordinate click would otherwise miss it.
    """
    js(f'document.querySelector(\'[data-action="{name}"]\')?.scrollIntoView({{block: "center", behavior: "instant"}})')
    time.sleep(0.05)
    # The 3D card animates its transform; a coordinate click fired mid-transition
    # can land beside the target, so wait for finite transitions first.
    settle()
    call('click', f'[data-action="{name}"]')

def drag_card(dx, steps=8):
    """Turn the 3D card by dragging it, the way a visitor does.

    The card turns 0.35 degrees per horizontal pixel, so +320px crosses the
    90-degree mark and exposes the chain record. Pointer capture keeps the
    handler receiving moves after the cursor leaves the card box.
    """
    js('document.querySelector(".identity-object").scrollIntoView({block: "center", behavior: "instant"})')
    time.sleep(0.05)
    settle()
    center = js('(()=>{const r=document.querySelector(".identity-object").getBoundingClientRect();return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)]})()')
    call('mouse', 'move', center[0], center[1])
    call('mouse', 'down')
    for step in range(1, steps + 1):
        call('mouse', 'move', center[0] + round(dx * step / steps), center[1])
        time.sleep(0.04)
    call('mouse', 'up')
    time.sleep(0.3)

def state(attribute):
    return f'document.querySelector("main").dataset.{attribute}'

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
    click_selector('.preference-anchor > button')
    click_action('locale-zh' if locale == 'zh' else 'locale-en')
    click_action('theme-dark' if theme == 'dark' else 'theme-light')
    click_selector('.preferences > button')
    settle()

def audit_state(label, when=None):
    """Audit a transient UI state (dialog, exposed card face, busy screen).

    Page-level axe runs with these surfaces hidden, so they need their own pass.
    `when` guards short-lived states: it must hold before and after the audit, so
    evidence can never be mislabelled with a state that already moved on.
    """
    if when:
        assert js(when), f'{label}: state not present before audit'
    settle()
    a11y = call('a11y', json_result=True)
    (EVIDENCE / f'state-{label}-axe.json').write_text(json.dumps(a11y, ensure_ascii=False, indent=2), encoding='utf-8')
    assert not a11y['violations'], f'{label}: {a11y["violations"]}'
    for rule in a11y.get('incomplete', []):
        nodes = rule.get('nodes', [])
        incomplete_audit.append({
            'screen': label,
            'rule': rule['id'],
            'nodes': rule.get('nodeCount', 0),
            'targets': sorted({target for node in nodes for target in (node.get('target') or [])}),
            'reasons': sorted({(node.get('failureSummary') or '').split('Fix any of the following:')[-1].strip() for node in nodes if node.get('failureSummary')}),
        })
    if when:
        assert js(when), f'{label}: state left before the audit finished'
    results.append(f'{label} axe 0 violations')
    print(f'PASS {label} axe 0 violations ({len(a11y.get("incomplete", []))} incomplete recorded)', flush=True)

WIDTHS = (320, 390, 768, 960)
# Container-overflow probe: text and controls must stay inside their parent's
# content box. Descendants of the 3D card are skipped: their projected rects
# change with the viewing angle, which is a transform artefact, not a layout
# defect (the card is covered by the viewport-overflow check instead). OWNWORD_MEASURE=1 records findings instead of asserting, so the
# audit can be triaged before it becomes a gate.
MEASURE = os.environ.get('OWNWORD_MEASURE') == '1'
layout_findings = []
CONTAINER_OVERFLOW = '''(()=>{const out=[];const els=document.querySelectorAll('main button, main input:not([hidden]), main textarea, main h1, main h2, main h3, main p, main code, main .identifier');
for(const e of els){if(e.closest('.identity-object'))continue;const r=e.getBoundingClientRect();if(!r.width)continue;const p=e.parentElement;if(!p)continue;
const cs=getComputedStyle(p);const pr=p.getBoundingClientRect();
const padL=parseFloat(cs.paddingLeft)||0,padR=parseFloat(cs.paddingRight)||0;
const overRight=r.right-(pr.right-padR),overLeft=(pr.left+padL)-r.left;
if(overRight>1.5||overLeft>1.5){out.push({sel:e.tagName.toLowerCase()+(e.className?'.'+String(e.className).split(' ').slice(0,2).join('.'):''),text:(e.textContent||'').trim().slice(0,40),overRight:Math.round(overRight),overLeft:Math.round(overLeft),width:Math.round(r.width),parent:p.tagName.toLowerCase()+(p.className?'.'+String(p.className).split(' ').slice(0,2).join('.'):'')});}}
return out})()'''

def freeze_animations():
    """Pin every running animation to t=0 so layout signatures are deterministic."""
    js('document.getAnimations().forEach(a=>{a.currentTime=0;a.pause()});true')

def resume_animations():
    js('document.getAnimations().forEach(a=>a.play());true')

def layout_signature():
    freeze_animations()
    # Absolute x plus y relative to the first measured element: a transient notice
    # (it auto-dismisses after 6s) shifts everything uniformly between passes and
    # would otherwise read as a theme-driven layout shift.
    signature = js('JSON.stringify((()=>{const els=Array.from(document.querySelectorAll("main button, main h1, main .identifier, main .person-row, main .page-heading"));const rects=els.map(e=>e.getBoundingClientRect());const base=rects.length?rects[0].top+scrollY:0;return rects.map(r=>[Math.round(r.x+scrollX),Math.round(r.y+scrollY-base),Math.round(r.width),Math.round(r.height)])})())')
    resume_animations()
    return signature

def inspect(label, matrix=False):
    combinations = [('en', 'light'), ('en', 'dark'), ('zh', 'light'), ('zh', 'dark')] if matrix else [('en', 'light')]
    light_layout = None
    for locale, theme in combinations:
        pref(locale, theme)
        combo_findings = []
        for width in WIDTHS:
            call('set', 'viewport', width, 800)
            settle()
            expect('document.documentElement.scrollWidth <= innerWidth', f'{label} {locale}/{theme} {width}px no page overflow')
            expect('Array.from(document.querySelectorAll("main button, main input:not([hidden]), main textarea")).filter(e=>e.getBoundingClientRect().width).every(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1})', f'{label} {locale}/{theme} {width}px controls fit')
            combo_findings.extend({**(item), 'width': width} for item in (js(CONTAINER_OVERFLOW) or []))
        if MEASURE:
            layout_findings.extend({**item, 'screen': label, 'locale': locale, 'theme': theme} for item in combo_findings)
        else:
            assert not combo_findings, f'{label} {locale}/{theme} container overflow: {combo_findings[:3]}'
            results.append(f'{label} {locale}/{theme} no element overflows its container')
            print(f'PASS {label} {locale}/{theme} no element overflows its container', flush=True)
        if locale == 'en':
            call('set', 'viewport', 390, 800); settle()
            signature = layout_signature()
            if theme == 'light':
                light_layout = signature
            else:
                assert signature == light_layout, f'{label}: layout shifted between light and dark\n{light_layout}\n{signature}'
                results.append(f'{label} en light and dark layouts match')
                print(f'PASS {label} en light and dark layouts match', flush=True)
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
    click_selector('.footer-controls > button')
    scroll_to('[data-scenario=identity]')
    call('select', '[data-scenario=identity]', value)
    click_selector('.panel-title button')

def configure_control(control, value):
    click_selector('.footer-controls > button')
    selector = f'[data-scenario="{control}"]'
    scroll_to(selector)
    call('select', selector, value)
    click_selector('.panel-title button')

def connect(value='new', audit=None):
    scenario(value)
    click_action('connect')
    click_action('approve')
    if audit:
        # The resolving state lasts 850ms, which is too short for a stable axe run
        # (the audit could finish after the state moved on). Assert its essentials
        # instead of producing evidence that may describe a different screen.
        expect('document.querySelector("main").dataset.busy === "resolving"', 'Resolution shows a busy state before it completes')
        expect('!!document.querySelector("[role=status]") && !!(document.querySelector("[role=status]").getAttribute("aria-label") || document.querySelector("[role=status]").textContent.trim())', 'Resolving state announces itself with a name')
        expect('!document.querySelector(".s2d-skeleton") || !!document.querySelector(".s2d-skeleton").closest(String.raw`[aria-hidden="true"]`)', 'Decorative skeleton stays out of the accessibility tree')
        expect('!!document.querySelector("[data-action=disconnect]")', 'Resolving state offers a way out')
    wait_page('identity' if value == 'existing' else 'resolve-error' if value == 'resolveFail' else 'setup')

def check_header_feedback():
    for locale, theme, width, height in [('en', 'light', 1220, 420), ('en', 'dark', 320, 568), ('zh', 'light', 320, 568), ('zh', 'dark', 1220, 555)]:
        call('set', 'viewport', width, height)
        pref(locale, theme)
        js('scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})')
        expect('Math.abs(document.querySelector(".topbar").getBoundingClientRect().top)<1', f'{locale}/{theme} header stays at viewport top after scrolling')
        configure_control('result', 'failure')
        click_action('connect'); click_action('approve')
        call('wait', '[data-error=connectFailed]')
        call('hover', '.toast')
        expect('!document.querySelector("main [role=alert]") && document.querySelector(".toast").getBoundingClientRect().bottom <= innerHeight && innerHeight-document.querySelector(".toast").getBoundingClientRect().bottom < 40', f'{locale}/{theme} global error appears at bottom')
        expect('document.documentElement.scrollWidth <= innerWidth && document.querySelector(".toast").scrollWidth <= document.querySelector(".toast").clientWidth', f'{locale}/{theme} error toast fits viewport')
        audit_state(f'header-feedback-{locale}-{theme}')
        call('screenshot', str(EVIDENCE / f'header-feedback-{locale}-{theme}.png'))
        click_action('dismiss-toast')
        expect('!document.querySelector(".toast") && document.querySelector("[data-action=connect]").textContent.includes(OwnwordCopy[document.documentElement.lang === "zh-CN" ? "zh" : "en"].retry)', f'{locale}/{theme} dismiss retains retry')
    pref()
    configure_control('result', 'failure')
    click_action('connect'); click_action('approve')
    call('hover', '.toast'); time.sleep(6.3)
    expect('document.querySelector(".toast")?.dataset.paused === "true"', 'Hover pauses error expiry')
    call('mouse', 'move', 5, 5)
    wait_until('!document.querySelector(".toast")', 'Error disappears automatically after leaving', timeout=8)
    expect('document.querySelector("[data-action=connect]").textContent.includes("Try Again")', 'Automatic dismissal retains connection retry')
    connect('new')
    call('set', 'viewport', 320, 568)
    click_action('review')
    expect('document.querySelector("#profile-name").getAttribute("aria-invalid") === "true" && !document.querySelector(".toast")', 'Field validation stays inline')
    call('fill', '#profile-name', 'Header and Toast')
    click_action('review')
    configure_control('result', 'failure')
    click_action('submit-operation'); click_action('approve')
    call('wait', '[data-error=createFailed]')
    call('focus', '[data-action=dismiss-toast]')
    expect('document.querySelector(".toast").getBoundingClientRect().bottom <= document.querySelector(".form-footer").getBoundingClientRect().top', 'Toast does not cover short-screen form actions')
    expect('Math.abs(document.querySelector(".topbar").getBoundingClientRect().top)<1', 'Header remains sticky on long forms')
    time.sleep(6.3)
    expect('document.querySelector(".toast")?.dataset.paused === "true"', 'Keyboard focus pauses error expiry')
    call('press', 'Enter')
    expect('!document.querySelector(".toast") && document.querySelector(".review-profile h2").textContent === "Header and Toast"', 'Keyboard dismissal preserves draft')
    click_action('submit-operation'); click_action('approve'); wait_page('ready')
    expect('document.querySelector("main").dataset.screenLabel === "ready"', 'Retry still succeeds after error toast closes')
    errors = call('errors')
    (EVIDENCE / 'header-feedback-errors.txt').write_text(errors, encoding='utf-8')
    assert not errors.strip(), errors
    print(f'{len(results)} header and feedback checks passed', flush=True)

def check_prototype_controls():
    # 演练控制通过真实点击配置，验证产品页面与故障结果均可使用。
    for locale in ('en', 'zh'):
        for theme in ('light', 'dark'):
            pref(locale, theme)
            call('set', 'viewport', 320, 568)
            click_selector('.footer-controls > button')
            expect('document.querySelectorAll(".scenario-panel select").length === 3', f'{locale}/{theme} all scenario selectors available')
            expect('document.documentElement.scrollWidth <= innerWidth && document.querySelector(".scenario-panel").scrollWidth <= document.querySelector(".scenario-panel").clientWidth', f'{locale}/{theme} panel has no horizontal overflow')
            audit_state(f'prototype-controls-{locale}-{theme}')
            call('screenshot', str(EVIDENCE / f'prototype-controls-{locale}-{theme}.png'))
            click_selector('.panel-title button')
            click_action('connect')
            expect('document.querySelector(".modal-top .eyebrow").textContent === OwnwordCopy[document.documentElement.lang === "zh-CN" ? "zh" : "en"].walletAuthorization && !document.querySelector(".simulation-label")', f'{locale}/{theme} external wallet boundary stays visible')
            expect('[...document.querySelectorAll("dialog button")].every(e=>{const r=e.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight})', f'{locale}/{theme} wallet actions fit short phone viewport')
            audit_state(f'wallet-boundary-{locale}-{theme}')
            call('screenshot', str(EVIDENCE / f'wallet-boundary-{locale}-{theme}.png'))
            click_action('cancel')
    call('set', 'viewport', 1440, 1000)
    pref()
    configure_control('result', 'failure')
    click_action('connect')
    expect('!document.querySelector(".modal-scenarios") && document.querySelectorAll("dialog [data-action]").length === 2', 'Wallet dialog contains only product decision actions')
    click_action('cancel')
    click_action('connect'); click_action('approve')
    wait_until('document.querySelector("[data-error]")?.dataset.error === "connectFailed"', 'Cancelled authorization preserves next failure')
    connect('new')
    expect('!document.querySelector(".wallet-connected button")', 'Footer contains no simulated account switch')
    call('fill', '#profile-name', 'Controls Review')
    click_action('review')
    configure_control('result', 'failure')
    click_action('submit-operation'); click_action('approve')
    wait_until('document.querySelector("[data-error]")?.dataset.error === "createFailed"', 'Configured creation failure preserves review')
    expect('document.querySelector(".review-profile h2").textContent === "Controls Review"', 'Creation failure preserves draft')
    click_action('submit-operation'); click_action('approve'); wait_page('ready')
    click_action('go-identity')
    expect('!document.querySelector("main").textContent.includes("prototype data")', 'Identity has no sample-data annotation')
    click_action('public'); wait_page('public')
    expect('!document.querySelector("main").textContent.includes("prototype data")', 'Public identity and chain record have no sample-data annotation')
    call('screenshot', str(EVIDENCE / 'prototype-product-public.png'))
    click_action('back-identity'); click_action('edit')
    call('fill', '#profile-name', 'Updated Controls')
    click_action('review')
    configure_control('result', 'failure')
    click_action('submit-operation'); click_action('approve')
    wait_until('document.querySelector("[data-error]")?.dataset.error === "saveFailed"', 'Configured profile update can fail')
    click_action('submit-operation'); click_action('approve'); wait_page('identity')
    expect('document.querySelector(".person-row h2").textContent === "Updated Controls"', 'Failure is consumed once and retry succeeds')
    for event in ('switch-confirm', 'switch-process', 'disconnect-confirm', 'disconnect-process'):
        click_action('edit'); call('fill', '#profile-name', 'Discard This Account Draft')
        click_action('review')
        configure_control('account-event', event)
        click_action('submit-operation')
        if event.endswith('process'):
            click_action('approve')
        if event.startswith('switch'):
            call('wait', '--fn', 'document.querySelector(".person-row h2")?.textContent === "North Studio"')
            expect('!document.body.innerText.includes("Discard This Account Draft")', f'{event} clears old identity and draft')
            time.sleep(1.7)
            expect('document.querySelector(".person-row h2")?.textContent === "North Studio"', f'{event} ignores stale operation result')
            click_action('disconnect')
        else:
            wait_page('welcome')
            time.sleep(1.7)
            expect('document.querySelector("main").dataset.screenLabel === "welcome" && !document.querySelector("[data-action=disconnect]")', f'{event} stays disconnected after old operation settles')
        connect('existing')
        click_selector('.footer-controls > button')
        expect('document.querySelector("[data-scenario=account-event]").value === "none"', f'{event} is consumed once')
        click_action('simulate-switch')
        call('wait', '--fn', 'document.querySelector(".person-row h2")?.textContent === "North Studio"')
        click_action('simulate-disconnect'); wait_page('welcome')
        click_selector('.panel-title button')
        connect('existing')
    configure_control('result', 'failure')
    configure_control('account-event', 'switch-process')
    click_selector('.footer-controls > button')
    click_action('reset-session'); wait_page('welcome')
    expect('document.querySelector("[data-scenario=result]").value === "success" && document.querySelector("[data-scenario=account-event]").value === "none"', 'Reset clears pending scenario settings')
    click_selector('.panel-title button')
    expect('!document.querySelector("[data-scenario], [data-action=simulate-switch], [data-action=simulate-disconnect]")', 'Closing prototype settings removes all scenario controls')
    errors = call('errors')
    (EVIDENCE / 'prototype-controls-errors.txt').write_text(errors, encoding='utf-8')
    assert not errors.strip(), errors
    print(f'{len(results)} prototype control checks passed', flush=True)

try:
    call('open', URL)
    js('localStorage.removeItem("ownword-astra-locale");localStorage.removeItem("ownword-astra-theme");true')
    call('reload')
    call('wait', '--fn', 'document.querySelector("main").dataset.screenLabel === "welcome" && !!document.querySelector(".welcome h1")')
    if CONTROLS_ONLY:
        check_prototype_controls()
        sys.exit(0)
    if FEEDBACK_ONLY:
        check_header_feedback()
        sys.exit(0)
    expect('document.activeElement === document.body', 'First paint leaves focus at the document start')
    call('press', 'Tab')
    expect('document.activeElement.classList.contains("skip-link")', 'First Tab reaches the skip link instead of landing inside main')
    expect('document.documentElement.lang === "en" && document.documentElement.dataset.colorScheme === "light"', 'First visit English and Light')
    expect('document.querySelectorAll(".vault-line").length === 7', 'Exactly seven sky lines')
    call('focus', '.dome'); call('press', 'Enter')
    expect('document.querySelector(".vault").dataset.pulse === "true"', 'Keyboard plays sky lines')
    call('set', 'viewport', 1440, 1000); settle()
    center = dome_center()
    call('mouse', 'move', center[0], center[1]); time.sleep(0.4)
    expect('document.querySelector(".dome").dataset.lit === "true" && /px$/.test(document.querySelector(".dome").style.getPropertyValue("--light-x"))', 'Pointer movement lights the sky lines near the cursor')
    expect('getComputedStyle(document.querySelector(".vault-light")).maskImage.includes("radial-gradient") && getComputedStyle(document.querySelector(".vault-light")).opacity === "1"', 'Sky light is one masked overlay, not per-line paint')
    expect('Array.from(document.querySelectorAll(".light-line")).every(e=>getComputedStyle(e).animationName === "none")', 'Sky light adds no per-line animations')
    call('mouse', 'move', 1400, 985); time.sleep(0.5)
    expect('document.querySelector(".dome").dataset.lit === "false"', 'Leaving the sky clears the light')
    call('focus', '.skip-link')
    expect('getComputedStyle(document.querySelector(".skip-link")).top === "12px"', 'Skip link becomes visible when focused')
    stops = set()
    for _ in range(12):
        call('press', 'Tab')
        stop = js('(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e);return {tag:e.tagName,label:(e.getAttribute("aria-label")||e.textContent||"").trim().slice(0,40),ring:(parseFloat(cs.outlineWidth)>0&&cs.outlineStyle!=="none")||cs.boxShadow!=="none"}})()')
        if stop is None:
            break
        assert stop['ring'], f'no visible focus ring on {stop}'
        stops.add(stop['label'] or stop['tag'])
    assert len(stops) >= 4, f'expected several keyboard stops, saw {sorted(stops)}'
    results.append(f'{len(stops)} keyboard stops show a visible focus ring')
    print(f'PASS {len(stops)} keyboard stops show a visible focus ring', flush=True)
    call('focus', '.skip-link')
    call('press', 'Enter')
    expect('document.activeElement === document.querySelector("main")', 'Skip link moves focus into the main landmark')
    inspect('welcome', True)
    click_selector('.preference-anchor > button')
    expect('!!document.querySelector("#preferences-panel") && document.querySelector(".preference-anchor > button").getAttribute("aria-expanded") === "true"', 'Preferences panel opens with aria-expanded')
    call('press', 'Escape')
    expect('!document.querySelector("#preferences-panel") && !!document.activeElement.closest(".preference-anchor")', 'Escape closes the panel and returns focus to its trigger')
    click_selector('.preference-anchor > button'); click_selector('.footer > p')
    expect('!document.querySelector("#preferences-panel")', 'Clicking outside closes the panel')
    click_selector('.preference-anchor > button')
    for _ in range(6):
        call('press', 'Tab')
    expect('!document.querySelector("#preferences-panel")', 'Tabbing out of the panel closes it')
    click_action('connect')
    expect('!!document.querySelector("dialog[open]") && document.activeElement.closest("dialog") !== null', 'Wallet dialog moves focus inside')
    expect('!!document.querySelector("dialog[open]").getAttribute("aria-labelledby") && !!document.getElementById(document.querySelector("dialog[open]").getAttribute("aria-labelledby")).textContent.trim()', 'Wallet dialog exposes an accessible name')
    audit_state('wallet-confirmation')
    call('set', 'viewport', 320, 568); settle()
    expect('["[data-action=cancel]", "[data-action=approve]"].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})', 'Wallet dialog keeps its actions inside a 320x568 viewport')
    call('set', 'viewport', 1440, 1000); settle()
    click_action('cancel')
    expect('document.activeElement.dataset.action === "connect"', 'Closing the dialog returns focus to its trigger')
    expect('document.querySelector("[data-notice]")?.dataset.notice === "connectCancelled" && document.querySelector("[data-notice]").textContent.trim().length > 0', 'Connection cancellation returns to welcome')
    call('hover', '[data-notice]')
    time.sleep(6.5)
    expect('document.querySelector("[data-notice]")?.dataset.paused === "true"', 'Hovering keeps the confirmation on screen')
    call('mouse', 'move', 700, 950)
    time.sleep(6.5)
    expect('!document.querySelector("[data-notice]")', 'Confirmation clears after six seconds')
    configure_control('result', 'failure')
    click_action('connect'); click_action('approve')
    expect('document.querySelector("[data-error]")?.dataset.error === "connectFailed" && !!document.querySelector("[data-error] button")', 'Connection failure provides retry')
    connect('resolveFail')
    expect('document.querySelector("main").dataset.screenLabel === "resolve-error" && !!document.querySelector("[data-action=retry]") && !!document.querySelector("[data-action=disconnect]") && document.querySelector("main").textContent.trim().length > 0', 'Resolution failure explains and offers retry or disconnect')
    inspect('resolve-error', True)
    click_action('disconnect')
    scenario('existing'); click_action('connect'); click_action('approve')
    wait_page('identity')
    expect('!!document.querySelector(".identity-page .person-row h2")', 'Published identity opens My Identity')
    click_action('disconnect')
    connect('new', audit='identity-resolving')
    expect('!!document.querySelector(".wallet-connected .s2d-status") && document.querySelector(".wallet-connected .s2d-status").textContent.trim().length > 0', 'Connection shows Connected status')
    click_action('review')
    expect('document.querySelector("#profile-name").getAttribute("aria-invalid") === "true"', 'Invalid required name blocks Review')
    call('fill', '#profile-name', 'x' * 101); click_action('review')
    expect('document.querySelector("#profile-name-error")?.dataset.fieldError === "nameLong"', 'Name maximum 100 enforced')
    call('fill', '#profile-name', 'Maya Chen')
    call('fill', '#profile-bio', '\U0001F468\u200D\U0001F469\u200D\U0001F467\u200D\U0001F466' * 5)
    expect('document.querySelector(".character-count").textContent.trim().startsWith("5 /")', 'Character counter counts grapheme clusters, not code points')
    call('fill', '#profile-bio', 'x' * 1001); click_action('review')
    expect('document.querySelector("#profile-bio-error")?.dataset.fieldError === "bioLong"', 'Bio maximum 1000 enforced')
    call('fill', '#profile-bio', 'Thinking in systems. Writing with intention.')
    click_action('review'); wait_page('review')
    click_action('back'); wait_page('setup')
    inspect('setup', True)
    click_action('review'); wait_page('review')
    inspect('review', True)
    click_action('copy-bap')
    wait_until('document.querySelector("[data-copy-target=bap]")?.dataset.copyFeedback === "copied" && document.querySelector("[data-copy-target=bap]").textContent.trim().length > 0', 'Copy success feedback', diagnostic='(document.querySelector("[data-copy-target=bap]")||{}).dataset.copyFeedback')
    time.sleep(6.5)
    expect('document.querySelector("[data-copy-target=bap]").dataset.copyFeedback === ""', 'Copy confirmation clears itself after six seconds')
    # Paste through a user gesture; direct Clipboard.readText needs a separate
    # browser permission and is not part of this product's Copy behavior.
    click_action('back'); call('fill', '#profile-name', ''); call('focus', '#profile-name'); call('clipboard', 'paste')
    expect('document.querySelector("#profile-name").value === OwnwordModel.ids[0]', 'Clipboard contains complete BAP ID')
    call('fill', '#profile-name', 'Maya Chen'); click_action('review')
    click_selector('.footer-controls > button'); scroll_to('.scenario-panel input[type=checkbox]'); call('check', '.scenario-panel input[type=checkbox]'); click_selector('.panel-title button')
    click_action('copy-bap')
    wait_until('document.querySelector("[data-copy-target=bap]")?.dataset.copyFeedback === "copyFailed" && !!document.querySelector(".identifier code").textContent', 'Copy failure preserves identifier', diagnostic='(document.querySelector("[data-copy-target=bap]")||{}).dataset.copyFeedback')
    click_selector('.footer-controls > button'); scroll_to('.scenario-panel input[type=checkbox]'); call('uncheck', '.scenario-panel input[type=checkbox]'); click_selector('.panel-title button')
    click_action('submit-operation')
    call('set', 'viewport', 320, 800)
    expect('["[data-action=cancel]", "[data-action=approve]"].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})', 'Dialog primary actions stay inside a 320px viewport')
    call('set', 'viewport', 320, 568); settle()
    expect('["[data-action=cancel]", "[data-action=approve]"].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})', 'Dialog primary actions stay inside a 320x568 viewport')
    call('set', 'viewport', 320, 800); settle()
    audit_state('create-confirmation-320')
    call('screenshot', '--full', str(EVIDENCE / 'wallet-confirmation-320.png'))
    call('press', 'Escape')
    expect('document.querySelector("[data-notice]")?.dataset.notice === "createCancelled"', 'Escape cancels wallet creation')
    expect('document.querySelector(".review-profile h2").textContent === "Maya Chen"', 'Cancelled creation preserves values')
    configure_control('result', 'failure')
    click_action('submit-operation'); click_action('approve')
    wait_until('document.querySelector("[data-error]")?.dataset.error === "createFailed" && document.querySelector("main").dataset.screenLabel === "review"', 'Creation failure retains review and retry', diagnostic='(document.querySelector("[data-error]")||{}).dataset.error')
    click_action('submit-operation'); click_action('approve')
    wait_until('document.querySelector("main").dataset.busy === "create"', 'Creation processing visible', diagnostic='document.querySelector("main").dataset.busy')
    audit_state('processing-create', when='document.querySelector("main").dataset.busy === "create"')
    wait_page('ready')
    inspect('ready', True)
    click_action('go-identity'); wait_page('identity')
    inspect('identity', True)
    js('scrollTo(0, 0)'); settle()
    expect('document.querySelector(".identifier").getBoundingClientRect().bottom < innerHeight', 'Desktop BAP ID in first viewport')
    call('set', 'viewport', 320, 800); js('scrollTo(0, 0)'); settle()
    expect('document.querySelector(".identifier").getBoundingClientRect().bottom < innerHeight', '320px BAP ID in first viewport')
    expect('[".identity-page .portrait [role=\\"img\\"], .identity-page .portrait img", ".identity-page .profile-type", ".identity-page .person-row h2", ".identity-page .bio", ".identifier code"].every(s=>document.querySelector(s))', 'My Identity shows avatar, name, type, bio and BAP ID')
    expect('Array.from(document.querySelectorAll("button")).filter(b=>!b.textContent.trim()).every(b=>b.getAttribute("aria-label")||b.getAttribute("title"))', 'Icon buttons expose accessible names')
    expect('Array.from(document.querySelectorAll(".s2d-status")).every(e=>e.textContent.trim().length>0)', 'Status states carry text, not colour alone')
    call('set', 'viewport', 1440, 1000); settle()
    call('set', 'media', 'light', 'reduced-motion')
    expect('matchMedia("(prefers-reduced-motion: reduce)").matches', 'Reduced motion emulation active')
    call('mouse', 'move', 1400, 985); time.sleep(0.4)
    center = dome_center()
    call('mouse', 'move', center[0], center[1]); time.sleep(0.4)
    expect('document.querySelector(".dome").dataset.lit === "false"', 'Reduced motion stops the pointer light from tracking')
    call('focus', '.dome'); call('press', 'Enter'); time.sleep(0.3)
    expect('document.querySelector(".dome").dataset.lit === "true" && document.querySelector(".dome").style.getPropertyValue("--light-x") === ""', 'Reduced motion shows a static centred light instead')
    click_action('public'); wait_page('public')
    expect('!document.querySelector(".rotation-controls, .rotation-label, .card-actions")', 'The 3D card ships without viewer controls')
    expect('!document.querySelector(".identity-sculpture").classList.contains("rotating")', 'Reduced motion stops automatic 3D rotation')
    expect('getComputedStyle(document.querySelector(".identity-sculpture")).animationDuration === "1e-05s"', 'Reduced motion shortens decorative animation')
    click_action('back-identity'); wait_page('identity')
    call('set', 'media', 'light')
    click_action('public'); wait_page('public')
    inspect('public', True)
    expect('document.querySelector(".identity-sculpture").classList.contains("rotating")', 'Public Identity rotates')
    drag_card(320)
    expect('parseFloat(document.querySelector(".identity-sculpture").style.getPropertyValue("--angle")) > 90 && !document.querySelector(".identity-sculpture").classList.contains("rotating")', 'Dragging the card turns it past 90 degrees and stops the rotation')
    expect('document.querySelector(".identity-sculpture").dataset.face === "back" && !document.querySelector(".plate-back").hasAttribute("inert")', 'Turning past 90 degrees exposes the chain record face')
    audit_state('chain-record-face')
    expect('document.querySelector(".plate-front").hasAttribute("inert") && document.querySelector(".plate-front").getAttribute("aria-hidden") === "true"', 'Only one card face stays in the accessibility tree')
    expect('!!document.querySelector(".plate-back [data-chain=block]").textContent.trim() && !!document.querySelector(".plate-back [data-chain=confirmation]").textContent.trim()', 'Chain record shows block height and confirmation state')
    click_action('copy-tx')
    wait_until('document.querySelector("[data-copy-target=tx]")?.dataset.copyFeedback === "copied"', 'Publication TxID copy works', diagnostic='(document.querySelector("[data-copy-target=tx]")||{}).dataset.copyFeedback')
    drag_card(-320)
    expect('document.querySelector(".identity-sculpture").dataset.face === "front" && !document.querySelector(".plate-front").hasAttribute("inert")', 'Dragging the card back returns the identity face')
    click_action('back-identity'); click_action('edit')
    call('fill', '#profile-name', 'Maya Revised')
    click_action('back')
    expect('document.querySelector("dialog[data-modal-title]")?.dataset.modalTitle === "discardTitle" && document.querySelector("dialog[open]").textContent.trim().length > 0', 'Unsaved changes ask before leaving')
    audit_state('discard-changes')
    click_action('keep-editing')
    expect('document.querySelector("#profile-name").value === "Maya Revised"', 'Keep editing preserves draft')
    click_action('review'); click_action('submit-operation'); click_action('cancel')
    wait_page('edit')
    expect('document.querySelector("#profile-name").value === "Maya Revised" && document.querySelector("[data-notice]")?.dataset.notice === "saveCancelled"', 'Save cancellation retains editing values on form')
    # The responsive matrix varies width only, so a wide-but-short window (a
    # 1220x555 desktop window, or a 320x568 phone) is checked here: the form
    # actions must stay on screen instead of hiding below the fold.
    call('set', 'viewport', 1220, 555); settle()
    expect('document.documentElement.scrollWidth <= innerWidth', 'Short desktop window 1220x555 no page overflow')
    expect('["[data-action=back]", "[data-action=review]"].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})', 'Short desktop window keeps the form actions in view')
    call('set', 'viewport', 320, 568); settle()
    expect('document.documentElement.scrollWidth <= innerWidth', 'Short phone window 320x568 no page overflow')
    expect('["[data-action=back]", "[data-action=review]"].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})', 'Short phone window keeps the form actions in view')
    call('set', 'viewport', 1440, 1000); settle()
    inspect('edit', True)
    click_action('review'); click_action('submit-operation'); click_action('approve')
    wait_page('identity')
    expect('document.querySelector(".person-row h2").textContent === "Maya Revised"', 'Save updates My Identity')
    expect('document.querySelector(".identifier code").textContent === OwnwordModel.ids[0]', 'Profile update keeps BAP ID')
    click_action('edit'); call('fill', '#profile-name', 'Do not save this')
    click_action('review')
    configure_control('account-event', 'switch-confirm')
    click_action('submit-operation')
    wait_page('identity')
    expect('document.querySelector(".person-row h2").textContent === "North Studio" && !document.body.innerText.includes("Do not save this")', 'Account switch cancels confirmation and clears old identity')
    click_action('disconnect'); connect('incomplete')
    expect('document.querySelector("main").dataset.incomplete === "true" && document.querySelector("main").dataset.screenLabel === "setup"', 'Incomplete identity routes to completion')
    call('fill', '#profile-name', 'Completed Name'); click_action('review')
    expect('document.querySelector("[data-action=submit-operation]")?.dataset.operation === "save"', 'Incomplete published identity updates profile without duplicate creation')
    click_action('submit-operation'); click_action('approve'); wait_page('identity')
    js('window.__lightBg = getComputedStyle(document.body).backgroundColor')
    pref('zh', 'dark')
    expect('document.documentElement.dataset.colorScheme === "dark" && getComputedStyle(document.body).backgroundColor !== window.__lightBg', 'Dark theme applies different semantic surface tokens')
    expect('document.querySelector(".person-row h2").textContent === "Completed Name" && document.querySelector(".identifier code").textContent === OwnwordModel.ids[0]', 'Locale and theme preserve profile and BAP ID')
    call('reload'); call('wait', '--fn', 'document.documentElement.lang === "zh-CN" && !!document.querySelector(".welcome h1")')
    expect('document.documentElement.lang === "zh-CN" && document.documentElement.dataset.colorScheme === "dark"', 'Preferences persist after refresh')
    js('Object.defineProperty(Storage.prototype,"setItem",{configurable:true,value:()=>{throw new Error("quota")}});true')
    pref('en', 'light')
    wait_until('!!document.querySelector("[data-storage-error]") && document.querySelector("[data-storage-error]").textContent.trim().length > 0', 'Unwritable storage is announced instead of failing silently', diagnostic='!!document.querySelector("[data-storage-error]")')
    audit_state('storage-error-alert', when='!!document.querySelector("[data-storage-error]")')
    js('delete Storage.prototype.setItem;true')
    pref()
    scenario('missing'); click_action('connect')
    expect('document.querySelector("dialog[data-modal-title]")?.dataset.modalTitle === "missingTitle" && document.querySelector("dialog[open]").textContent.trim().length > 0', 'Unavailable wallet explains recovery')
    call('press', 'Escape')
    errors = call('errors')
    (EVIDENCE / 'browser-errors.txt').write_text(errors, encoding='utf-8')
    assert not errors.strip(), errors
    (EVIDENCE / 'browser-console.txt').write_text(call('console'), encoding='utf-8')
    (EVIDENCE / 'axe-incomplete-summary.json').write_text(json.dumps(incomplete_audit, ensure_ascii=False, indent=2), encoding='utf-8')
    if MEASURE:
        (EVIDENCE / 'layout-measurements.json').write_text(json.dumps(layout_findings, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'{len(layout_findings)} container-overflow findings recorded', flush=True)
    print(f'{len(results)} browser checks passed; {len(incomplete_audit)} axe incomplete recorded', flush=True)
finally:
    result_file = 'header-feedback-results.json' if FEEDBACK_ONLY else 'prototype-controls-results.json' if CONTROLS_ONLY else 'browser-results.json'
    (EVIDENCE / result_file).write_text(json.dumps({'passed': len(results), 'checks': results, 'axeIncomplete': incomplete_audit}, ensure_ascii=False, indent=2), encoding='utf-8')
    call('close')
