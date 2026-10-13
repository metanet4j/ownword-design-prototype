import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
// 在独立会话中复核本次变更，使用已有样例和演练控件。
const session=process.env.OWNWORD_BROWSER_SESSION||'ownword-r03-'+Date.now(),destination=path.resolve('evidence/homepage-v040/R03');
fs.mkdirSync(destination,{recursive:true});
const pages=[],checks=[];
function browser(...args){const r=JSON.parse(execFileSync('agent-browser',['--session',session,'--json',...args],{encoding:'utf8',maxBuffer:8*1024*1024}));assert.equal(r.success,true,JSON.stringify(r));return r.data;}
const evaluate=source=>browser('eval',source).result;
async function ready(selector){for(let n=0;n<50;n++){if(evaluate(`document.getElementById('root')?.dataset.ready==='true' && [...document.querySelectorAll(${JSON.stringify(selector)})].some(e=>e.getClientRects().length) && !document.querySelector('.homepage[aria-busy="true"]')`))return;await new Promise(r=>setTimeout(r,100));}throw Error('页面未就绪：'+selector);}
function click(selector){browser('click',selector);}
async function route(hash,selector){browser('open','http://127.0.0.1:4314/?review=R03'+hash);await ready(selector);}
function check(label,source){assert.equal(evaluate(source),true,label);checks.push({check:label,result:'passed'});}
async function scenario(key,value){click('[data-action="prototype-settings"]');browser('select',`[data-homepage-scenario="${key}"]`,value);click('.scenario-panel .panel-title button');await ready('.homepage');}
async function capture(name,widths=[1440,320]){
 for(const width of widths){browser('set','viewport',String(width),'720');evaluate('window.scrollTo({top:0,behavior:"instant"});true');browser('mouse','move','0','0');
 const data=evaluate(`(()=>{const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';return {viewport:[innerWidth,innerHeight],locale:document.documentElement.lang,theme:document.documentElement.dataset.colorScheme,scrollWidth:document.documentElement.scrollWidth,firstWorkTop:document.querySelector('.homepage-stream h3')?.getBoundingClientRect().top,largeText:[...document.querySelectorAll('main h1,main h2,main h3,dialog h2')].filter(e=>visible(e)&&parseFloat(getComputedStyle(e).fontSize)>28.1).map(e=>e.textContent),outsideControls:[...document.querySelectorAll('main button,main input:not([type=file]),dialog[open] button')].filter(e=>visible(e)&&!e.closest('[role=tablist],.cm-scroller,.cm-panels')).filter(e=>{let r=e.getBoundingClientRect();return r.left<-1||r.right>innerWidth+1;}).map(e=>e.outerHTML.slice(0,180))};})()`);
 assert.ok(data.scrollWidth<=width+1,name+' 页面横向溢出');assert.deepEqual(data.largeText,[],name+' 标题过大');assert.deepEqual(data.outsideControls,[],name+' 控件溢出');
 const screenshot=`${name}-${width}.png`;browser('screenshot',path.join(destination,screenshot));pages.push({page:name,...data,screenshot});}
 console.log(name+' 布局已检查');
}
const A='2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD',B='3GkA8rRtC4a6oX9PzM2cV7mHxTqB5wEeNs';
try {
 await route('#/identity/'+A,'.homepage h1');await capture('homepage');
 check('320×720 首条作品标题完整出现',`document.querySelector('.homepage-stream h3').getBoundingClientRect().bottom<=innerHeight`);
 check('五个筛选标签完整可见且操作区域至少 44px',`[...document.querySelectorAll('[role=tab]')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.width>=44&&r.height>=44;})`);
 click('.homepage-identifiers [data-action="copy-bap"]');await ready('[data-copy-feedback="copied"]');check('紧凑复制保留完整标识与成功反馈',`document.querySelector('.homepage-identifiers [data-copy-feedback="copied"]')!==null`);
 await route('#/find','#artifact-query');browser('fill','#artifact-query','');browser('press','Control+V');check('粘贴到查找框得到完整 BAP ID',`document.querySelector('#artifact-query').value==='${A}'`);await route('#/identity/'+A,'.homepage h1');
 browser('focus','[data-homepage-action="details"]');browser('press','Enter');await ready('dialog[open]');
 check('身份详情显示完整标识，焦点进入弹层',`document.querySelector('dialog').contains(document.activeElement)&&document.querySelector('dialog .identifier code').textContent==='${A}'`);
 browser('press','Shift+Tab');check('弹层反向 Tab 保持焦点范围',`document.querySelector('dialog').contains(document.activeElement)`);browser('press','Escape');
 check('关闭详情焦点返回触发按钮',`document.activeElement.matches('[data-homepage-action="details"]')`);
 browser('focus','[role=tab][aria-selected=true]');browser('press','End');await ready('[role=tab][aria-selected=true]:last-child');check('End 选择音频并显示选中焦点',`document.activeElement.textContent==='Audio' && document.activeElement.getAttribute('aria-selected')==='true' && getComputedStyle(document.activeElement).outlineStyle!=='none'`);browser('press','Home');
 click('[data-action="prototype-settings"]');browser('check','.scenario-panel input[type="checkbox"]');click('.scenario-panel .panel-title button');click('.homepage-identifiers [data-action="copy-bap"]');await ready('[data-copy-feedback="copyFailed"]');
 check('复制失败时完整 BAP ID 可手动读取并有错误反馈',`document.querySelector('.homepage-identifiers [data-copy-feedback="copyFailed"]')!==null && getComputedStyle(document.querySelector('.homepage-identifiers code')).whiteSpace==='normal'`);await capture('copy-failure',[320]);
 click('[data-action="prototype-settings"]');browser('uncheck','.scenario-panel input[type="checkbox"]');click('.scenario-panel .panel-title button');await route('#/find','#artifact-query');await route('#/identity/'+A,'.homepage h1');
 await scenario('profile','missing-fields');await capture('missing-profile',[320]);await scenario('profile','normal');
 await scenario('relationship','failure');await capture('relationship-unavailable',[320]);check('未知关系人数保持未知而非零',`document.querySelector('[data-relationship-count="followers"]').textContent==='—'`);await scenario('relationship','normal');
 await route('#/identity/'+B+'/following','[data-relationship-list]');await capture('connections');
 check('名单首个身份在手机首屏可见',`document.querySelector('[data-relationship-row] h3').getBoundingClientRect().bottom<innerHeight`);
 click('.homepage-back');await ready('.homepage-stream');check('名单页可直接返回所属身份主页',`location.hash==='#/identity/'+${JSON.stringify(B)}`);
 await route('#/identity/'+B+'/following','[data-relationship-list]');await scenario('relationship','failure');
 check('名单读取失败保留已加载行和上次核实信息',`!!document.querySelector('[data-list-error="first"]')&&document.querySelectorAll('[data-relationship-row]').length===2&&document.querySelector('[data-homepage-module="relationship"]').textContent.includes('Last checked')`);await capture('connections-error',[320]);await scenario('relationship','normal');
 await route('#/content/'+'c3'.repeat(32),'.markdown-body h1');await capture('reader');
 click('[data-action="reader-history"]');await ready('.content-history');await capture('versions');
 await route('#/content/'+'f6'.repeat(32),'audio');await capture('audio');browser('focus','audio');browser('press','Space');await new Promise(r=>setTimeout(r,400));check('音频控件可实际播放',`document.querySelector('audio').currentTime>0&&!document.querySelector('audio').paused`);
 await route('#/identity/'+B,'.homepage h1');click('[data-relationship-action="follow"]');await ready('dialog[open]');click('[data-action="approve"]');await ready('dialog[data-modal-title="relationship-review"]');await capture('relationship-review',[320]);browser('press','Escape');
 click('#navigation-toggle');click('[data-action="nav-identity"]');await ready('.identity-page');await capture('my-identity');
 click('[data-action="edit"]');await ready('#profile-name');await capture('profile-edit');click('[data-action="back"]');await ready('.identity-page');
 await route('#/content','[data-content-id]');await capture('my-content');
 await route('#/write/draft-first','.visual-surface');await capture('editor');
 await route('#/artifacts','.artifact-wallet-grid');await capture('artifacts');
 await route('#/find','#artifact-query');browser('fill','#artifact-query','165');click('[data-action="artifact-find-submit"]');await ready('[data-lookup-state="found"]');await capture('find-result');
 await route('#/identity/'+B,'.homepage h1');click('[aria-controls="preferences-panel"]');click('[data-action="locale-zh"]');click('[data-action="theme-dark"]');click('.preferences>button:last-child');await capture('homepage-zh-dark');
 const a11y=browser('a11y','--tags','wcag2a,wcag2aa');assert.equal(a11y.counts.violations,0,'当前深色中文主页存在 axe 违规');checks.push({check:'当前深色中文主页 axe WCAG A/AA 无违规',result:'passed'});fs.writeFileSync(path.join(destination,'accessibility.json'),JSON.stringify(a11y,null,2));
 const errors=browser('errors');assert.deepEqual(errors.errors,[],'浏览器运行异常');checks.push({check:'本轮会话无浏览器运行异常',result:'passed'});fs.writeFileSync(path.join(destination,'browser-errors.json'),JSON.stringify(errors,null,2));
 console.log('A11Y '+JSON.stringify(a11y).slice(0,350));console.log('ERRORS '+JSON.stringify(errors));
} finally {
 fs.writeFileSync(path.join(destination,'verification.json'),JSON.stringify({checkedAt:new Date().toISOString(),session,pages,checks,baseline:JSON.parse(fs.readFileSync(path.join(destination,'baseline.json'),'utf8')),scope:'R03 本次影响页面；不重跑全部业务 BDD'},null,2));
 browser('close');

}
