import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// 验收使用独立演示会话；eval 只读取 DOM，不改写状态或网络行为。
const session=process.env.OWNWORD_BROWSER_SESSION||`ownword-acceptance-${Date.now()}`;
const target=path.resolve(process.env.OWNWORD_EVIDENCE||'evidence/official-s2/acceptance');
fs.mkdirSync(target,{recursive:true});
const report={session,checkedAt:new Date().toISOString(),runtime:'@react-spectrum/s2@1.6.0',scope:'官方组件优化的跨模块布局、自动无障碍、主要流程与适用边界；不等于所有历史 PRD 的全部 BDD 或真实钱包、签名、链上验证。',checks:[],screens:[],audits:[]};
const save=()=>fs.writeFileSync(path.join(target,'verification.json'),JSON.stringify(report,null,2)+'\n');
function b(...args){const r=JSON.parse(execFileSync('agent-browser',['--session',session,'--json',...args],{encoding:'utf8',maxBuffer:12e6}));assert.equal(r.success,true,r.error);return r.data;}
const read=code=>b('eval',code).result;
const click=selector=>b('click',selector);
const named=name=>b('find','role','button','click','--name',name,'--exact');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(selector){for(let i=0;i<50;i++){if(read(`!!document.querySelector(${JSON.stringify(selector)})`))return;await delay(100);}throw Error('状态未就绪：'+selector);}
function check(id,label,code){assert.equal(read(code),true,label);report.checks.push({id,label,result:'passed'});save();}
async function nav(name,selector){click('#navigation-toggle');await ready('[data-action=nav-'+name+']');click('[data-action=nav-'+name+']');await ready(selector);}
async function scenario(selector,value){b('focus','[data-action=prototype-settings]');b('press','Enter');await ready('.scenario-panel');b('select',selector,value);b('press','Escape');await delay(300);}
async function capture(name,width=1440){b('set','viewport',String(width),width===320?'720':'1000');b('scroll','up','10000');await delay(400);read('document.fonts.ready.then(()=>true)');
  const layout=read(`({width:innerWidth,scroll:document.documentElement.scrollWidth,outside:[...document.querySelectorAll('main button,main input:not([type=file]),main a,[role=dialog] button')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').filter(e=>{const r=e.getBoundingClientRect();return r.left<-1||r.right>innerWidth+1}).map(e=>e.getAttribute('aria-label')||e.textContent.slice(0,60))})`);
  b('screenshot',path.join(target,name+'.png'));report.screens.push({name,...layout,result:layout.scroll<=width+1&&!layout.outside.length?'passed':'failed'});
  const audit=b('a11y');report.audits.push({name,counts:audit.counts,violations:audit.violations,incomplete:audit.incomplete});save();console.log(name+': '+layout.scroll+'px，axe '+audit.counts.violations+' violations');
}
async function pair(name){await capture(name);await capture(name+'-mobile',320);b('set','viewport','1440','1000');}
async function route(hash,selector){b('open','http://127.0.0.1:4315/?acceptance='+Date.now()+hash);await ready(selector);}

try{
  await route('','[data-action=connect]');await pair('welcome');
  click('[data-action=connect]');await capture('connect-mobile',320);b('press','Escape');check('v01-connect','取消连接保留欢迎页',`!document.querySelector('[role=dialog]')&&!!document.querySelector('[data-action=connect]')`);
  click('[data-action=connect]');click('[data-action=approve]');await ready('.identity-page');await pair('identity');
  click('[data-action=edit]');await ready('#profile-name');await pair('identity-edit');b('fill','#profile-bio','完整验收：保留身份与公开归属。');click('[data-action=review]');await ready('.review-profile');await pair('identity-review');click('[data-action=submit-operation]');await capture('identity-wallet-mobile',320);b('press','Escape');await ready('#profile-bio');check('v01-cancel','取消授权保留未保存修改',`document.querySelector('#profile-bio').value==='完整验收：保留身份与公开归属。'`);click('[data-action=back]');await ready('[role=dialog]');click('[data-action=discard]');await ready('.identity-page');
  b('set','viewport','1440','1000');await nav('content','.content-workspace');await ready('.content-row');await pair('content-drafts');click('[data-action=filter-records]');await pair('content-published');
  await scenario('[data-scenario=content-list]','empty');await pair('content-empty');await scenario('[data-scenario=content-list]','failure');await pair('content-failure');await scenario('[data-scenario=content-list]','normal');
  click('[data-action=content-new]');await ready('[data-visual-state=ready]');await pair('editor');b('fill','.ProseMirror[contenteditable=true]','完整验收正文：界面切换保持内容。');click('[data-mode=preview]');for(let i=0;i<50&&!read("document.querySelector('.editor-preview .markdown-body')?.textContent.includes('完整验收正文')");i++)await delay(100);check('C02-B','编辑到预览保持正文',`document.querySelector('.editor-preview .markdown-body').textContent.includes('完整验收正文')`);click('[data-mode=visual]');check('C02-B','返回可视化保留正文',`document.querySelector('.ProseMirror').textContent.includes('完整验收正文')`);click('[data-action=content-review]');
  await ready('[data-content-screen=review]');await pair('content-review');named('Sign and publish');await ready('[role=dialog]');await capture('content-wallet-mobile',320);b('press','Escape');
  b('set','viewport','1440','1000');await nav('artifacts','[data-artifact-screen=list]');await ready('[data-artifact-id]');await pair('artifacts');click('.artifact-current-overview button');await ready('[data-artifact-screen=detail]');await pair('artifact-detail');
  b('find','role','tab','click','--name','Proof','--exact');await pair('artifact-proof');b('find','role','tab','click','--name','Ownership','--exact');click('[data-action=artifact-transfer]');await ready('#artifact-recipient');await pair('artifact-transfer');b('fill','#artifact-recipient','invalid');click('[data-action=artifact-transfer-review]');await ready('[aria-invalid=true]');check('A07-B','无效接收地址阻止进入授权',`!!document.querySelector('[aria-invalid=true]')&&!document.querySelector('[role=dialog]')`);
  b('fill','#artifact-recipient','1BoatSLRHtKNngkdXEeobR76b53LETtpyT');click('[data-action=artifact-transfer-review]');await ready('[data-artifact-screen=action-review]');await pair('artifact-transfer-review');click('[data-action=artifact-action-sign]');await ready('[role=dialog]');await capture('artifact-wallet-mobile',320);b('press','Escape');await ready('[data-artifact-phase=cancelled]');check('A07-cancel','取消转移不显示成功',`!!document.querySelector('[data-artifact-phase=cancelled]')`);
  await nav('artifacts','[data-artifact-screen=list]');click('[data-action=artifact-create]');await ready('#artifact-name');await pair('artifact-create');b('fill','#artifact-name','官方组件验收样例');named('Review creation');await ready('[data-artifact-screen=review]');await pair('artifact-create-review');
  click('[data-action=artifact-review-edit]');named('Save draft');await nav('find','#artifact-query');b('fill','#artifact-query','#165');click('[data-action=artifact-find-submit]');await ready('[data-lookup-state=found]');await pair('find-result');check('A09-A','数字 ID 查找展示关联身份',`!!document.querySelector('[data-action=find-open-identity]')`);b('fill','#artifact-query','abc');click('[data-action=artifact-find-submit]');await ready('[aria-invalid=true]');await pair('find-invalid');
  const A='2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD';await route('#/identity/'+A,'[data-homepage-state=ready]');click('[data-homepage-action=more-content]');await pair('homepage');
  for(const [name,id,selector] of [['reader','c3','.reader-paper'],['image','d4','.homepage-media-stage'],['video','e5','.homepage-media-stage'],['audio','f6','.homepage-media-stage']]){
    await route('#/content/'+id.repeat(32),selector);await pair(name);
    if(name==='reader'){click('[data-action=reader-history]');await ready('.content-history');await pair('content-history');}
    if(name==='video'||name==='audio'){b('focus',name);b('press','Space');await delay(1200);check('P05-A',name+' 实际播放',`document.querySelector('${name}').currentTime>0&&!document.querySelector('${name}').paused`);b('press','Space');check('P05-A',name+' 可暂停',`document.querySelector('${name}').paused`);}
  }
  await route('#/identity/'+A,'[data-homepage-state=ready]');click('[data-homepage-list=following]');await ready('[data-view=connections]');await pair('following');
  await route('#/identity/'+A,'[data-homepage-state=ready]');named('Appearance & language');click('[data-action=locale-zh]');click('[data-action=theme-dark]');b('press','Escape');await pair('homepage-zh-dark');click('[data-homepage-action=details]');await ready('[role=dialog]');await pair('identity-proof-zh-dark');b('press','Escape');
  report.errors=b('errors').errors;report.warnings=b('console').messages.filter(x=>['warning','error'].includes(x.type));
  report.network=b('network','requests').requests.filter(r=>r.url.includes('typekit')).map(r=>({url:r.url,status:r.status,resourceType:r.resourceType}));report.fonts=read(`[...document.fonts].map(f=>({family:f.family,status:f.status}))`);
  report.result=report.screens.some(s=>s.result==='failed')||report.audits.some(a=>a.violations.length)||report.errors.length?'needs-fix':'passed';save();console.log(report.result);
}catch(error){report.failure=error.stack;save();throw error;}
