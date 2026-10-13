import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {build,transform} from 'esbuild';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const pages=['components','content-editor','content-publication','content-reader','content','artifact-compose','artifact-components','artifact-operations','artifact-transfer','artifact-detail','artifact-find','artifact','welcome','homepage','app'].map(x=>x+'.jsx');
const models=['model.js','content-model.js','artifact-model.js','homepage-model.js','copy.js'];
const css=['_ds/react-spectrum-s2/tokens/semantic.css','ownword-tokens.css','app.css','content.css','artifact.css','welcome.css','homepage.css','official-layout.css'];
const tokens='_ds/react-spectrum-s2/tokens/s2-tokens.css';
const inputs=['package.json','package-lock.json','build-prototype.mjs','official-s2.jsx','index.template.html','editor-tools.js','markdown-tools.mjs','visual-editor.js','_ds/react-spectrum-s2/tokens/page.css',tokens,...models,...pages,...css];
const outputs=['vendor/runtime.js','vendor/runtime.css','vendor/styles.css','vendor/markdown-tools.js','vendor/editor-tools.js','index.html'];
const hash=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const hashes=ps=>Object.fromEntries(ps.map(p=>[p,hash(p)]));
const manifest='vendor/build-manifest.json';
if(process.argv.includes('--check')){
 const saved=JSON.parse(fs.readFileSync(manifest));assert.equal(saved.mode,'production');assert.deepEqual(saved.inputs,hashes(inputs));assert.deepEqual(saved.outputs,hashes(outputs));assert.ok(saved.officialInputs.some(p=>p.includes('@react-spectrum/s2/dist/')));assert.ok(!saved.officialInputs.some(p=>p.includes('_ds_bundle')));console.log('官方 S2 包来源及预编译产物与当前源码一致。');
}else{
 const {default:macros}=await import('unplugin-parcel-macros');
 const source="import React from 'react';\nimport * as ReactDOM from 'react-dom/client';\nimport {S2,officialIcons,fullWidth} from './official-s2.jsx';\nwindow.React=React;\n"+models.map(p=>'(function(module){\n'+fs.readFileSync(p,'utf8')+'\n})(undefined);').join('\n')+'\n'+pages.map(p=>fs.readFileSync(p,'utf8')).join('\n');
 const options={absWorkingDir:root,bundle:true,minify:!process.env.OWNWORD_DEBUG,target:'es2022',define:{'process.env.NODE_ENV':JSON.stringify(process.env.OWNWORD_DEBUG?'development':'production')},legalComments:'eof'};
 const result=await build({...options,stdin:{contents:source,resolveDir:root,loader:'jsx',sourcefile:'ownword-official-app.jsx'},outfile:'vendor/runtime.js',format:'iife',plugins:[macros.esbuild()],metafile:true});
 for(const [entry,out] of [['markdown-tools.mjs','vendor/markdown-tools.js'],['editor-tools.js','vendor/editor-tools.js']])await build({...options,entryPoints:[entry],outfile:out,format:'iife',globalName:entry==='markdown-tools.mjs'?'OwnwordMarkdownTools':'OwnwordEditorTools'});
 // 页面仅继承 Token 与 OwnWord 布局；官方控件 CSS 由官方包构建，不引入本地仿制控件样式。
 const appCss=css.map(p=>fs.readFileSync(p,'utf8')).join('\n');
 const references=s=>[...s.matchAll(/var\((--[\w-]+)/g)].map(m=>m[1]);
 const tokenSource=fs.readFileSync(tokens,'utf8'),decls=[...tokenSource.matchAll(/(--[\w-]+)\s*:[^;{}]+;/g)],used=new Set(references(appCss));
 let old;do{old=used.size;for(const m of decls)if(used.has(m[1]))for(const ref of references(m[0]))used.add(ref);}while(old!==used.size);
 const tokenCss=tokenSource.replace(/(--[\w-]+)\s*:[^;{}]+;/g,(decl,name)=>used.has(name)?decl:'');
 const styles='@layer ownword, _;\n@layer ownword {\n'+fs.readFileSync('_ds/react-spectrum-s2/tokens/page.css','utf8')+'\n'+tokenCss+'\n'+appCss+'\n}';
 fs.writeFileSync('vendor/styles.css',(await transform(styles,{loader:'css',minify:true,target:'chrome120'})).code);
 const integrity='sha384-'+createHash('sha384').update(fs.readFileSync('vendor/runtime.js')).digest('base64');
 fs.writeFileSync('index.html',fs.readFileSync('index.template.html','utf8').replaceAll('<!-- RUNTIME_INTEGRITY -->',integrity));
 fs.writeFileSync(manifest,JSON.stringify({mode:process.env.OWNWORD_DEBUG?'development':'production',runtime:'official @react-spectrum/s2@1.6.0',react:JSON.parse(fs.readFileSync('node_modules/react/package.json')).version,inputs:hashes(inputs),outputs:hashes(outputs),officialInputs:Object.keys(result.metafile.inputs).filter(p=>p.includes('@react-spectrum/s2/'))},null,2)+'\n');
 console.log('官方组件改造版构建完成；官方 S2 运行时与 CSS 已打包。');
}
