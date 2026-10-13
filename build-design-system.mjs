import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = 'design-system/react-spectrum-s2', target = '_ds/react-spectrum-s2';
const manifestPath = path.join(root, 'vendor/design-system-manifest.json');
const hash = relative => {
  const bytes = fs.readFileSync(path.join(root, relative));
  const content = /\.(?:mjs|jsx|js|html|json|css|md|txt|svg)$/.test(relative) ? bytes.toString('utf8').replace(/\r\n/g, '\n') : bytes;
  return createHash('sha256').update(content).digest('hex');
};
function files(relative) {
  return fs.readdirSync(path.join(root, relative), {withFileTypes: true}).flatMap(entry => {
    const file = relative + '/' + entry.name;
    return entry.isDirectory() ? files(file) : [file];
  }).sort();
}
const hashes = list => Object.fromEntries(list.map(file => [file, hash(file)]));
const inputs = () => hashes(['build-design-system.mjs', ...files('design-system')]);
const outputs = () => hashes(files(target));
assert.ok(process.argv.length <= 3 && (!process.argv[2] || process.argv[2] === '--check'));
if (process.argv[2] === '--check') {
  const saved = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(saved.inputs, inputs(), 'S2 源已变化，请运行 npm run build:design-system');
  assert.deepEqual(saved.outputs, outputs(), 'S2 导入资源已变化，请从可维护源重新构建');
  const binding = JSON.parse(fs.readFileSync(path.join(root, '_d_meta.json'), 'utf8')).designSystems[0];
  assert.equal(binding.sourcePath, source);
  assert.equal(binding.namespace, 'ReactSpectrumS2_ad4872');
  console.log('S2 可维护源、编译资源与导入副本一致。');
} else {
  // 复用已有设计技能的编译、导入流程；源文件和消费副本均留在当前分支。
  const agents = process.env.OWNWORD_DESIGN_TOOLS || path.resolve(root, '../../../../.agents/skills/baoyu-design/agents');
  const run = args => execFileSync(process.execPath, args, {cwd: root, stdio: 'inherit'});
  run([source + '/tools/regenerate.mjs']);
  run([path.join(agents, 'compile-design-system.mjs'), source]);
  run([path.join(agents, 'import-design-system.mjs'), source, '.', '--primary']);
  fs.writeFileSync(manifestPath, JSON.stringify({inputs: inputs(), outputs: outputs()}, null, 2) + '\n');
}
