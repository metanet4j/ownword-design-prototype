import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// 检查当前原型的实际页面和操作状态，不调用生产钱包或 API。
const session=process.env.OWNWORD_BROWSER_SESSION||'ownword-all-pages-20261013';
const destination=path.resolve('evidence/homepage-v040/R02');
fs.mkdirSync(destination,{recursive:true});
const pages=[],checks=[];
function browser(...args){const r=JSON.parse(execFileSync('agent-browser',['--session',session,'--json',...args],{encoding:'utf8',maxBuffer:8*1024*1024}));assert.equal(r.success,true,JSON.stringify(r));return r.data;}
const evaluate=source=>browser('eval',source).result;
async function ready(selector){for(let n=0;n<50;n++){if(evaluate(`document.getElementById('root')?.dataset.ready==='true' && [...document.querySelectorAll(${JSON.stringify(selector)})].some(e=>e.getClientRects().length) && !document.querySelector('.homepage[aria-busy="true"]')`))return;await new Promise(r=>setTimeout(r,100));}throw Error('页面未就绪：'+selector);}
function click(selector){evaluate(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',behavior:'instant'});true`);browser('click',selector);}
async function route(hash,selector){browser('open','http://127.0.0.1:4314/?review=R02'+hash);await ready(selector);}
function check(label,source){assert.equal(evaluate(source),true,label);checks.push({check:label,result:'passed'});}
async function scenario(key,value){if(!evaluate('!!document.querySelector(".scenario-panel")'))click('[data-action="prototype-settings"]');browser('select',key,value);click('.scenario-panel .panel-title button');}
async function capture(name,selector,{desktop=true,mobile=true}={}){
 await ready(selector);
 for(const [size,width,height] of [['desktop',1440,900],['mobile',320,900]]){
  if(size==='desktop'&&!desktop||size==='mobile'&&!mobile)continue;
  browser('set','viewport',String(width),String(height));evaluate('window.scrollTo({top:0,behavior:"instant"});true');
  const data=evaluate(`(()=>{const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';const text=[...document.querySelectorAll('main *,dialog[open] *')].filter(e=>visible(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));return {viewport:[innerWidth,innerHeight],locale:document.documentElement.lang,theme:document.documentElement.dataset.colorScheme,screen:document.querySelector('main').dataset.screenLabel,scrollWidth:document.documentElement.scrollWidth,maxFont:Math.max(0,...text.map(e=>parseFloat(getComputedStyle(e).fontSize))),largeText:text.filter(e=>parseFloat(getComputedStyle(e).fontSize)>28.1).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,50),font:getComputedStyle(e).fontSize})),outsideControls:[...document.querySelectorAll('main button,main input:not([type=file]),main textarea,main select,dialog[open] button')].filter(e=>visible(e)&&!e.closest('[role=tablist],.cm-scroller,.cm-panels')).filter(e=>{let r=e.getBoundingClientRect();return r.left<-1||r.right>innerWidth+1;}).map(e=>({tag:e.tagName,text:e.textContent.slice(0,40)})),firstEditorTop:Math.round(document.querySelector('.editor-visual:not([hidden]),.editor-source:not([hidden]),.editor-preview:not([hidden])')?.getBoundingClientRect().top||0),firstRowTop:Math.round(document.querySelector('.content-row,.artifact-wallet-grid,.homepage-stream article')?.getBoundingClientRect().top||0),mainHeight:Math.round(document.querySelector('main').getBoundingClientRect().height)};})()`);
  assert.ok(data.scrollWidth<=width+1,name+' 页面横向溢出：'+JSON.stringify(data));
  assert.deepEqual(data.largeText,[],name+' 存在超大字号');
  assert.deepEqual(data.outsideControls,[],name+' 控件超出页面');
  const screenshot=name+'-'+size+'.png';browser('mouse','move','0','0');browser('screenshot',path.join(destination,screenshot));
  pages.push({page:name,size,...data,screenshot,result:'passed'});
 }
 console.log(name+' 布局检查通过');
}
async function resetConnect(mode='existing',selector='.identity-page'){
 // 独立演练通过新页面隔离连接上下文，避免配置面板的自动关闭影响下一步。
 browser('open','about:blank');browser('open','http://127.0.0.1:4314/?review=R02');await ready('.welcome h1');
 await scenario('[data-scenario="identity"]',mode);click('[data-action="connect"]');await ready('dialog[open]');click('[data-action="approve"]');await ready(selector);
}
const A='2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD',B='3GkA8rRtC4a6oX9PzM2cV7mHxTqB5wEeNs';
const asset=n=>n.toString(16).padStart(64,'0')+'_0';
browser('set','viewport','1440','900');browser('open','about:blank');browser('open','http://127.0.0.1:4314/?review=R02');await ready('.welcome h1');click('[aria-controls="preferences-panel"]');click('[data-action="locale-en"]');click('[data-action="theme-light"]');click('.preferences>button:last-child');
await capture('welcome','.welcome h1');click('[aria-controls="preferences-panel"]');await capture('preferences','.preferences');click('.preferences>button:last-child');
await route('#/content','[data-content-screen="gate"]');await capture('content-gate','[data-content-screen="gate"]');
await route('#/artifacts','[data-artifact-screen="gate"]');await capture('artifact-gate','[data-artifact-screen="gate"]');
await route('#/find','#artifact-query');await capture('find-idle','#artifact-query');browser('fill','#artifact-query','165');click('[data-action="artifact-find-submit"]');await ready('[data-lookup-state="found"]');await capture('find-result','[data-lookup-state="found"]');
browser('fill','#artifact-query','invalid');click('[data-action="artifact-find-submit"]');await ready('[data-lookup-state="invalid"]');await capture('find-invalid','[data-lookup-state="invalid"]');
await route('#/identity/'+A,'.homepage h1');await capture('public-home','.homepage h1');
await route('#/identity/'+A+'/followers','[data-relationship-list]');await capture('public-followers','[data-relationship-list]');
await route('#/content/'+'c3'.repeat(32),'.markdown-body h1');await capture('reader','.markdown-body h1');
click('[data-action="reader-history"]');await ready('.content-history');await capture('reader-history','.content-history');
for(const [name,tx] of [['image','d4'],['video','e5'],['audio','f6']]){await route('#/content/'+tx.repeat(32),'.homepage-media-stage');await capture('media-'+name,'.homepage-media-stage');}
check('媒体使用真实控件且字号修订没有开启自动播放',`document.querySelector('audio').controls && document.querySelector('audio').paused`);
browser('focus','audio');browser('press','Space');await new Promise(r=>setTimeout(r,300));check('音频可以实际播放',`document.querySelector('audio').currentTime>0 && !document.querySelector('audio').paused`);evaluate('window.__layoutAudio=document.querySelector("audio");true');
await route('#/identity/'+A,'.homepage h1');check('离开媒体页停止后台播放',`window.__layoutAudio.paused`);
await route('#/identity/'+B,'.homepage h1');click('[data-relationship-action="follow"]');await ready('dialog[open]');await capture('wallet-connect','dialog[open]');click('[data-action="approve"]');await ready('dialog[data-modal-title="relationship-review"]');await capture('relationship-review','dialog[open]');browser('press','Escape');
click('#navigation-toggle');await capture('navigation','#primary-navigation');click('[data-action="nav-identity"]');await ready('.identity-page');await capture('identity','.identity-page');
click('[data-action="edit"]');await ready('#profile-name');await capture('profile-edit','#profile-name');browser('fill','#profile-name','Maya Chen · layout review');click('[data-action="review"]');await ready('[data-screen-label="review"]');await capture('profile-review','[data-screen-label="review"]');click('[data-action="submit-operation"]');await ready('dialog[open]');await capture('profile-wallet','dialog[open]');browser('press','Escape');if(!evaluate('!!document.querySelector("#profile-name")'))click('[data-action="back"]');await ready('#profile-name');click('[data-action="back"]');await ready('dialog[data-modal-title="discardTitle"]');await capture('profile-discard','dialog[open]');click('[data-action="discard"]');await ready('.identity-page');
await route('#/content','[data-content-id]');await capture('content-drafts','[data-content-id]');click('[data-action="filter-records"]');await capture('content-published','[data-content-id]');
await scenario('[data-scenario="content-list"]','empty');await capture('content-empty','.content-empty h2');await scenario('[data-scenario="content-list"]','failure');await capture('content-error','[role="alert"]');await scenario('[data-scenario="content-list"]','normal');
await route('#/write/draft-first','.visual-surface');await capture('editor-visual','.visual-surface');check('视觉编辑器正文符合常规字级',`parseFloat(getComputedStyle(document.querySelector('.visual-surface')).fontSize)<=16`);
click('[data-mode="edit"]');await capture('editor-source','.editor-source:not([hidden])');check('Markdown 源编辑器实际字体不超过 16px',`parseFloat(getComputedStyle(document.querySelector('.cm-editor')).fontSize)<=16`);
browser('set','viewport','1440','900');click('[data-mode="split"]');await capture('editor-split','.editor-source:not([hidden])');click('[data-mode="preview"]');await capture('editor-preview','.editor-preview:not([hidden])');
click('[data-mode="edit"]');await scenario('[data-scenario="content-storage"]','failure');browser('focus','.cm-content');browser('press','Control+End');browser('keyboard','inserttext','\n\nLayout audit: the original draft remains recoverable.');click('#navigation-toggle');click('[data-action="nav-find"]');await ready('dialog[data-modal-title="draft-leave"]');await capture('draft-leave','dialog[open]');click('[data-action="draft-stay"]');await scenario('[data-scenario="content-storage"]','normal');click('[data-action="content-back"]');if(evaluate('!!document.querySelector("dialog[open]")'))click('[data-action="draft-save-leave"]');await ready('[data-content-screen="content"]');
click('[data-action="filter-drafts"]');click('[data-draft-options="draft-first"]');click('[data-action="draft-delete"]');await capture('draft-delete','dialog[open]');browser('press','Escape');
click('[data-action="content-new"]');await ready('.visual-surface');click('[data-mode="edit"]');browser('focus','.cm-content');browser('keyboard','inserttext','# Compact publication\n\nA short sample for layout verification.');click('[data-action="content-review"]');await ready('[data-content-screen="review"]');await capture('content-review','[data-content-screen="review"]');click('[data-action="content-publish"]');await ready('[data-publish-phase="authorize"]');await capture('content-authorize','[data-content-screen="publish"]');click('[data-action="publish-approve"]');await ready('[data-publish-phase="published"]');await capture('content-result','[data-publish-phase="published"]');
await route('#/artifacts','.artifact-wallet-grid');await capture('artifact-list','.artifact-wallet-grid');click('.artifact-filter-option:nth-child(2) button[aria-pressed]');await capture('artifact-history','.artifact-history-event');
await route('#/artifact/'+asset(165),'[data-artifact-screen="detail"]');await capture('artifact-detail','[data-artifact-screen="detail"]');
await route('#/artifact-select','[data-select-artifact]');await capture('artifact-select','[data-select-artifact]');click('[data-select-artifact="'+asset(2048)+'"]');await ready('[data-artifact-screen="action-review"]');await capture('artifact-bind-review','[data-artifact-screen="action-review"]');click('[data-action="artifact-action-sign"]');await ready('dialog[open]');await capture('artifact-wallet','dialog[open]');click('[data-action="artifact-cancel"]');await ready('[data-artifact-phase="cancelled"]');await capture('artifact-cancelled','[data-artifact-phase="cancelled"]');
await route('#/artifact-transfer/'+asset(2048),'#artifact-recipient');await capture('artifact-transfer','#artifact-recipient');browser('fill','#artifact-recipient','1BitcoinEaterAddressDontSendf59kuE');click('[data-action="artifact-transfer-review"]');await capture('artifact-transfer-review','[data-artifact-screen="action-review"]');
await route('#/artifact-create','#artifact-name');await capture('artifact-create','#artifact-name');click('.artifact-form button[type="submit"]');await ready('[data-artifact-screen="review"]');await capture('artifact-create-review','[data-artifact-screen="review"]');click('.artifact-review-copy .s2d-button-accent');await ready('dialog[open]');click('[data-action="artifact-approve"]');await ready('[data-artifact-phase="accepted"]');await capture('artifact-result','[data-artifact-phase="accepted"]');
await resetConnect('resolveFail','[data-screen-label="resolve-error"]');await capture('identity-error','[data-screen-label="resolve-error"]');
await resetConnect('new','#profile-name');await capture('profile-setup','#profile-name');browser('fill','#profile-name','Layout Sample');browser('fill','#profile-bio','A short description.');click('[data-action="review"]');await ready('[data-screen-label="review"]');await capture('profile-create-review','[data-screen-label="review"]');click('[data-action="submit-operation"]');await ready('dialog[open]');click('[data-action="approve"]');await ready('[data-screen-label="ready"]');await capture('identity-ready','[data-screen-label="ready"]');
click('[data-action="go-identity"]');await ready('.identity-page');click('[aria-controls="preferences-panel"]');click('[data-action="locale-zh"]');click('[data-action="theme-dark"]');click('.preferences>button:last-child');await capture('identity-chinese-dark','.identity-page');
await route('#/find','#artifact-query');await capture('find-chinese-dark','#artifact-query');
await route('#/content/'+'c3'.repeat(32),'.markdown-body h1');await capture('reader-chinese-dark','.markdown-body h1');
const errors=browser('errors');assert.deepEqual(errors.errors,[]);
fs.writeFileSync(path.join(destination,'verification.json'),JSON.stringify({feature:'R02',command:'node verify-layout.mjs',checkedAt:new Date().toISOString(),scope:'当前原型的全部主要页面类型及列出的相关状态；桌面 1440×900、窄屏 320×900，另查中文深色。样例钱包与交易，不等同完整业务 BDD 或生产验证。',pages,checks,browserErrors:errors,userVisualReview:'pending'},null,2)+'\n');
console.log(JSON.stringify({pageTypes:new Set(pages.map(p=>p.page)).size,viewportChecks:pages.length,interactionChecks:checks.length}));
