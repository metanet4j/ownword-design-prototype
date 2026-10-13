// 预览启动后运行；独立浏览器 session 抽检最终跨模块复制及失败恢复。
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const session=process.env.OWNWORD_BROWSER_SESSION||'ownword-final-review-'+Date.now();
const out=process.cwd()+'/evidence/homepage-v040/R12';fs.mkdirSync(out,{recursive:true});
const data={date:new Date().toISOString(),checks:[],copies:[],screenshots:[]};
const save=()=>fs.writeFileSync(out+'/verification.json',JSON.stringify(data,null,2)+'\n');
const b=(...args)=>{const r=JSON.parse(execFileSync('agent-browser',['--session',session,'--json',...args],{encoding:'utf8',maxBuffer:8e6}));assert.equal(r.success,true,r.error);return r.data;};
const ev=s=>b('eval',s).result,wait=s=>b('wait',s),click=s=>b('click',s);
const check=(name,s)=>{assert.equal(ev(s),true,name);data.checks.push({name,passed:true});save();};
function key(s){b('mouse','move','0','0');b('focus',s);b('press','Tab');b('press','Shift+Tab');}
function nav(name){click('#navigation-toggle');click('[data-action=nav-'+name+']');}
function shot(name){ev('document.fonts.ready.then(()=>true)');b('screenshot',out+'/'+name+'.png');data.screenshots.push(name+'.png');save();}
function copy(name,selector,expected,press='Enter'){
  key(selector);wait('[role=tooltip]');
  const rect=ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),i=e.querySelector('.ui-icon').getBoundingClientRect();return {width:r.width,height:r.height,radius:getComputedStyle(e).borderRadius,iconWidth:i.width,iconHeight:i.height,offsetX:Math.abs((r.left+r.right-i.left-i.right)/2),offsetY:Math.abs((r.top+r.bottom-i.top-i.bottom)/2),action:e.classList.contains('s2d-action-button'),focus:e.matches(':focus-visible'),label:e.getAttribute('aria-label')};})()`);
  assert.ok(rect.action&&rect.focus&&rect.label&&rect.width===44&&rect.height===44&&rect.offsetX<1&&rect.offsetY<1,name+' 尺寸、图标居中与焦点');
  if(data.copies.length)assert.equal(rect.radius,data.copies[0].radius,name+' 圆角一致');
  b('press',press);b('wait','100');check(name+' 成功切换统一勾选图标',`document.querySelector(${JSON.stringify(selector)}).querySelector('.ui-icon').style.maskImage.includes('Checkmark')`);
  ev(`(()=>{document.querySelector('#final-paste')?.remove();const e=document.createElement('textarea');e.id='final-paste';(document.querySelector('dialog[open]')||document.body).append(e);e.focus();return true;})()`);b('press','Control+V');
  assert.equal(ev('document.querySelector("#final-paste").value'),expected,name+' 完整剪贴板原值');ev('document.querySelector("#final-paste").remove();true');
  data.copies.push({name,...rect,valueVerified:true});save();
}
function failClipboard(enabled){key('[data-action=prototype-settings]');b('press','Enter');wait('.scenario-panel');key('.scenario-panel .check-row input');b('press',' ');check('复制失败模拟开关为 '+enabled,`document.querySelector('.scenario-panel .check-row input').checked===${enabled}`);b('press','Escape');}
b('set','viewport','1440','900');b('open','http://127.0.0.1:4314/?final-review='+Date.now());wait('[data-action=connect]');click('[data-action=connect]');wait('[data-action=approve]');click('[data-action=approve]');wait('[data-action=edit]');
const A='2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD';copy('我的身份 BAP ID','main [data-action=copy-bap]',A);
nav('content');wait('.content-row');click('[data-action=filter-records]');wait('.content-row');click('.content-row');wait('[data-action=reader-copy-link]');const link=ev(`location.origin+location.pathname+'#/read/'+encodeURIComponent(document.querySelector('[data-record-id]').dataset.recordId)`);copy('阅读分享链接','[data-action=reader-copy-link]',link,' ');
nav('artifacts');wait('.artifact-card');click('.artifact-current-overview>button');wait('[data-action=copy-number]');copy('Artifact 数字编号','[data-action=copy-number]','165');click('[role=tab][id$="-tab-proof"]');wait('[data-action=copy-inscription]');const inscription=ev(`document.querySelector('[data-action=copy-inscription]').closest('.identifier').querySelector('code').title`);copy('Artifact 铭文标识','[data-action=copy-inscription]',inscription,' ');
ev(`location.hash='#/identity/'+${JSON.stringify(A)};true`);wait('.homepage-stream');copy('公开主页 BAP ID','[data-action=copy-bap]',A);click('[data-homepage-action=details]');wait('dialog[open]');const tx=ev(`document.querySelector('dialog [data-action=copy-identity-proof-tx]').closest('.identifier').querySelector('code').title`);copy('公开身份 TxID','dialog [data-action=copy-identity-proof-tx]',tx);b('press','Escape');
b('set','viewport','320','900');click('.header-preferences');click('[data-action=locale-zh]');click('[data-action=theme-dark]');b('press','Escape');key('[data-action=copy-bap]');b('press','Enter');wait('[data-copy-feedback=copied]');shot('copy-success-dark');b('press','Escape');
failClipboard(true);key('[data-action=copy-bap]');b('press','Enter');wait('.copy-failed');b('wait','6200');check('失败说明持续保留完整 BAP ID',`document.querySelector('.copy-failed code').textContent===${JSON.stringify(A)}&&document.querySelector('.copy-failed [role=status]').textContent.length>0`);check('失败全文可见且手机无横向溢出',`document.documentElement.scrollWidth===320&&document.querySelector('.copy-failed code').scrollWidth<=document.querySelector('.copy-failed code').clientWidth`);shot('copy-failure-dark');failClipboard(false);copy('失败后重试 BAP ID','[data-action=copy-bap]',A,' ');check('重试成功后退出失败状态',`!document.querySelector('.copy-failed')`);
const a=b('a11y','--tags','wcag2a,wcag2aa');fs.writeFileSync(out+'/accessibility.json',JSON.stringify(a,null,2)+'\n');assert.equal(a.counts.violations,0);assert.equal(a.counts.incomplete,0);data.axe=a.counts;data.errors=b('errors');assert.deepEqual(data.errors.errors,[]);data.source='26055b4';save();console.log(JSON.stringify({checks:data.checks.length,copies:data.copies.length,axe:data.axe,errors:data.errors.errors}));
