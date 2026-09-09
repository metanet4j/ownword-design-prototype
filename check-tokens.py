"""Design-system token resolution check.

Every `var(--s2...)` referenced by the prototype's own CSS must be defined by the
imported design system, so a renamed or mistyped token fails here instead of
silently falling back. Evidence: evidence/token-resolution.json.

Run: python check-tokens.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / 'evidence'
EVIDENCE.mkdir(exist_ok=True)

DS = ROOT / '_ds' / 'react-spectrum-s2'
OWN_CSS = ['app.css', 'brand.css', 'brand-explorations.css']
REFERENCE = re.compile(r'var\(\s*(--s2[a-z0-9-]*)\s*[,)]')
DEFINITION = re.compile(r'(--s2[a-z0-9-]*)\s*:')

def read(paths):
    return '\n'.join(path.read_text(encoding='utf-8') for path in paths if path.exists())

ds_files = sorted(DS.rglob('*.css'))
defined = set(DEFINITION.findall(read(ds_files)))

used = {}
for name in OWN_CSS:
    path = ROOT / name
    if not path.exists():
        continue
    for token in REFERENCE.findall(path.read_text(encoding='utf-8')):
        used.setdefault(token, []).append(name)

unresolved = {token: files for token, files in sorted(used.items()) if token not in defined}
report = {
    'designSystemCssFiles': len(ds_files),
    'definedTokens': len(defined),
    'referencedTokens': len(used),
    'unresolved': unresolved,
}
(EVIDENCE / 'token-resolution.json').write_text(
    json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(ds_files)} design-system CSS files define {len(defined)} tokens')
print(f'prototype CSS references {len(used)} tokens; unresolved: {len(unresolved)}')
for token, files in unresolved.items():
    print(f'  UNRESOLVED {token} ({", ".join(sorted(set(files)))})')
assert not unresolved, f'unresolved tokens: {sorted(unresolved)}'
print('all referenced tokens resolve', flush=True)
