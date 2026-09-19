const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const React = require('./vendor/react.development.js');
const Babel = require('./vendor/babel.min.js');
const context = {window: {}, React, console};
vm.createContext(context);
vm.runInContext(fs.readFileSync('_ds/react-spectrum-s2/_ds_bundle.js', 'utf8'), context);
vm.runInContext(Babel.transform(fs.readFileSync('components.jsx', 'utf8'), {presets: ['react']}).code, context);
const {Button, Field} = context.window;
const click = () => {};
const primary = Button({variant: 'accent', className: 's2d-button artifact-action', disabled: true, onClick: click});
assert.match(primary.props.className, /s2d-button-accent/);
assert.match(primary.props.className, /artifact-action/);
assert.equal(primary.props.disabled, true);
assert.equal(primary.props.onClick, click);
const selected = Button({'aria-pressed': true, variant: 'quiet'});
assert.equal(selected.props['aria-pressed'], true);
assert.match(selected.props.className, /s2d-button-primary/);
const icon = Button({iconOnly: true, variant: 'quiet', 'aria-label': 'Refresh'});
assert.match(icon.props.className, /icon-button/);
assert.equal(icon.props['aria-label'], 'Refresh');
function flatten(element) {
  return React.isValidElement(element) ? [element, ...React.Children.toArray(element.props.children).flatMap(flatten)] : [];
}
const field = flatten(Field({id: 'name', label: 'Name', value: '', error: 'Required', onChange: click}));
assert.equal(field.some(node => node.props.className === 's2d-field-shell'), false);
assert.equal(field.find(node => node.type === 'input').props['aria-invalid'], true);
assert.equal(field.find(node => node.type === 'input').props['aria-describedby'], 'name-error');
for (const file of fs.readdirSync('.').filter(file => file.endsWith('.jsx'))) {
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/<UiIcon\s+name="([^"]+)"/g)) {
    assert.ok(fs.existsSync(`_ds/react-spectrum-s2/assets/workflow-icons/S2_Icon_${match[1]}_20_N.svg`), `${file}: missing ${match[1]}`);
  }
}
const links = [...fs.readFileSync('index.html', 'utf8').matchAll(/href="(_ds\/[^\"]+\.css)"/g)].map(match => match[1]);
assert.deepEqual(links, ['_ds/react-spectrum-s2/styles.css']);
const tokens = new Set([...['tokens/s2-tokens.css', 'tokens/semantic.css', 'components/components.css'].map(file => fs.readFileSync('_ds/react-spectrum-s2/' + file, 'utf8')).join('\n').matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]));
for (const [, token] of fs.readFileSync('s2-adapter.css', 'utf8').matchAll(/var\((--[\w-]+)/g)) assert.ok(tokens.has(token), `Unknown S2 token: ${token}`);
console.log('R08 button variants, selection, disabled state, field accessibility and S2 icon assets passed');
