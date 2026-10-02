import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import vm from 'node:vm';

const root = path.dirname(fileURLToPath(import.meta.url));
const files = ['components', 'content-editor', 'content-publication', 'content-reader', 'content',
  'artifact-compose', 'artifact-components', 'artifact-operations', 'artifact-transfer', 'artifact-detail',
  'artifact-find', 'artifact', 'welcome', 'app'].map(name => name + '.jsx');
const styles = ['_ds/react-spectrum-s2/styles.css', 's2-adapter.css', 'app.css', 'content.css', 'artifact.css', 'welcome.css'];
const dsStyles = ['tokens/font-faces.css', 'tokens/page.css', 'tokens/s2-tokens.css', 'tokens/semantic.css',
  'components/components.css', 'guidelines/cards.css'].map(file => '_ds/react-spectrum-s2/' + file);
const inputs = ['build-prototype.mjs', 'package.json', 'package-lock.json', 'editor-tools.js',
  'markdown-tools.mjs', 'visual-editor.js', '_ds/react-spectrum-s2/_ds_bundle.js', 'index.template.html',
  'model.js', 'content-model.js', 'artifact-model.js', 'copy.js', 'vendor/react.production.min.js',
  'vendor/react-dom.production.min.js', 'vendor/react-dom-server.production.min.js', ...files, ...styles, ...dsStyles];
const outputs = ['vendor/app.js', 'vendor/markdown-tools.js', 'vendor/editor-tools.js', 'vendor/styles.css', 'index.html', 'vendor/fonts.css', 'vendor/workspace.css'];
const manifest = path.join(root, 'vendor/build-manifest.json');
const hash = (file, text = false) => createHash('sha256').update(text ?
  fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n') : fs.readFileSync(path.join(root, file))).digest('hex');
const hashes = (names, text = false) => Object.fromEntries(names.map(file => [file, hash(file, text)]));
assert.ok(process.argv.length <= 3 && (!process.argv[2] || process.argv[2] === '--check'), '用法：node build-prototype.mjs [--check]');
if (process.argv[2] === '--check') {
  const saved = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  assert.deepEqual(saved.inputs, hashes(inputs, true), '源码已变化，请在原型目录运行 npm run build');
  assert.deepEqual(saved.outputs, hashes(outputs), '构建产物缺失或被修改，请运行 npm run build');
  console.log('页面与阅读、编辑器构建产物均对应当前源码。');
} else {
  const esbuild = await import('esbuild');
  const options = {target: 'es2020', minify: true, legalComments: 'eof', supported: {'template-literal': false}};
  const source = files.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  const script = await esbuild.transform(source, {...options, loader: 'jsx', format: 'iife', sourcefile: 'ownword-app.jsx'});
  fs.writeFileSync(path.join(root, outputs[0]), script.code);
  for (const [entry, output] of [['markdown-tools.mjs', outputs[1]], ['editor-tools.js', outputs[2]]]) {
    await esbuild.build({...options, absWorkingDir: root, entryPoints: [entry], outfile: output,
      bundle: true, format: 'iife', globalName: entry === 'markdown-tools.mjs' ? 'OwnwordMarkdownTools' : 'OwnwordEditorTools'});
  }
  const tokenPath = '_ds/react-spectrum-s2/tokens/s2-tokens.css';
  const tokenSource = fs.readFileSync(path.join(root, tokenPath), 'utf8');
  const declarations = [...tokenSource.matchAll(/(--[\w-]+)\s*:[^;{}]+;/g)];
  const references = source => [...source.matchAll(/var\((--[\w-]+)/g)].map(match => match[1]);
  const consumers = inputs.filter(file => /\.(?:jsx|js|css)$/.test(file) && file !== tokenPath);
  const used = new Set(consumers.flatMap(file => references(fs.readFileSync(path.join(root, file), 'utf8'))));
  // 仅去掉没有消费者的 token 声明，保留被引用声明的原始值和全部模式。
  let previous;
  do {
    previous = used.size;
    for (const match of declarations) if (used.has(match[1])) for (const token of references(match[0])) used.add(token);
  } while (used.size !== previous);
  const cssFiles = [...dsStyles.filter(file => !file.endsWith('/font-faces.css')), 's2-adapter.css', 'app.css', 'welcome.css'];
  const css = cssFiles.map(file => {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    if (file === tokenPath) return tokenSource.replace(/(--[\w-]+)\s*:[^;{}]+;/g,
      (declaration, name) => used.has(name) ? declaration : '');
    return source;
  }).join('\n');
  fs.writeFileSync(path.join(root, outputs[3]), (await esbuild.transform(css, {loader: 'css', minify: true, target: 'chrome120'})).code);
  const workspaceCss = ['content.css', 'artifact.css'].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  fs.writeFileSync(path.join(root, outputs[6]), (await esbuild.transform(workspaceCss, {loader: 'css', minify: true, target: 'chrome120'})).code);
  const fonts = fs.readFileSync(path.join(root, dsStyles[0]), 'utf8').replace(/font-display:\s*auto/g, 'font-display: optional');
  fs.writeFileSync(path.join(root, outputs[5]), (await esbuild.transform(fonts, {loader: 'css', minify: true})).code);
  const React = createRequire(import.meta.url)('./vendor/react.production.min.js');
  const server = {exports: {}, module: {}, require: () => React};
  vm.createContext(server);
  vm.runInContext(fs.readFileSync(path.join(root, 'vendor/react-dom-server.production.min.js'), 'utf8'), server);
  function render(locale) {
    let html;
    const context = {React, ReactDOM: {hydrateRoot: (_root, element) => {html = server.exports.renderToString(element);}},
      console, localStorage: {getItem: key => key.endsWith('locale') ? locale : null}, location: {hash: ''},
      document: {getElementById: () => ({})}, matchMedia: () => ({matches: false}), navigator: {}, setTimeout, clearTimeout};
    context.window = context; vm.createContext(context);
    for (const file of ['_ds/react-spectrum-s2/_ds_bundle.js', 'model.js', 'content-model.js', 'artifact-model.js', 'copy.js', outputs[0]]) {
      vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
    }
    assert.ok(html?.includes('welcome-story'), '首页预生成失败');
    return html;
  }
  const template = fs.readFileSync(path.join(root, 'index.template.html'), 'utf8').replace(/\r\n/g, '\n');
  fs.writeFileSync(path.join(root, 'index.html'), template.replace('<!-- PRE_RENDER_EN -->', render('en')).replace('<!-- PRE_RENDER_ZH -->', render('zh')));
  fs.writeFileSync(manifest, JSON.stringify({esbuild: esbuild.version, inputs: hashes(inputs, true), outputs: hashes(outputs)}, null, 2) + '\n');
  console.log('页面已预编译；公开阅读与完整编辑器分别构建。');
}
