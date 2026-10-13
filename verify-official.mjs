import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// 在独立浏览器中演练模拟数据，不调用真实钱包或生产服务。
const session=process.env.OWNWORD_BROWSER_SESSION||`ownword-s2-check-${Date.now()}`;
const origin='http://127.0.0.1:4315/';
const target=path.resolve('evidence/official-s2');
fs.mkdirSync(target,{recursive:true});
const checks=[],screens=[];
function browser(...args){const value=JSON.parse(execFileSync('agent-browser',['--session',session,'--json',...args],{encoding:'utf8',maxBuffer:8e6}));assert.equal(value.success,true,JSON.stringify(value));return value.data;}
const evaluate=code=>browser('eval',code).result;
const click=selector=>browser('click',selector);
const named=name=>browser('find','role','button','click','--name',name,'--exact');
async function ready(selector){for(let n=0;n<35;n++){if(evaluate(`!!document.querySelector(${JSON.stringify(selector)})`))return;await new Promise(r=>setTimeout(r,100));}throw Error('未找到页面状态：'+selector);}
function check(label,code){assert.equal(evaluate(code),true,label);checks.push(label);}
async function capture(name,width=1440){browser('set','viewport',String(width),'1000');evaluate('window.scrollTo({top:0,behavior:"instant"});true');await new Promise(r=>setTimeout(r,250));const layout=evaluate(`({width:innerWidth,scroll:document.documentElement.scrollWidth,outside:[...document.querySelectorAll('main button,main input:not([type=file]),main a,[role=dialog] button')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').filter(e=>{const r=e.getBoundingClientRect();return r.left<-1||r.right>innerWidth+1}).map(e=>e.textContent.slice(0,50))})`);assert.ok(layout.scroll<=width+1,name+' 页面溢出');assert.deepEqual(layout.outside,[],name+' 控件溢出');browser('screenshot',path.join(target,name+'.png'));screens.push({name,...layout});console.log(name+' 通过');}
async function nav(action){click('#navigation-toggle');click('[data-action=nav-'+action+']');}
async function scenario(selector,value){click('[data-action=prototype-settings]');browser('select',selector,value);click('.scenario-panel .panel-title button');}

browser('set','viewport','1440','1000');browser('open',origin+'?verify=official-'+Date.now());await ready('[data-ready=true]');
await capture('welcome');
named('Connect Wallet');await ready('[role=dialog]');check('授权弹窗有可访问名称',`document.querySelector('[role=dialog]').getAttribute('aria-label')==='Connect Yours Wallet'`);
browser('press','Tab');check('弹窗键盘焦点保留在弹窗内',`document.activeElement.closest('[role=dialog]')!==null`);
browser('press','Escape');await ready('[data-action=connect]');check('Escape 关闭授权',`!document.querySelector('[role=dialog]')`);
named('Connect Wallet');click('[data-action=approve]');await ready('.identity-page');await capture('identity');
click('[data-action=edit]');click('#profile-name');browser('press','Control+a');browser('press','Backspace');click('[data-action=review]');await ready('[aria-invalid=true]');check('官方字段显示错误并获得焦点',`document.activeElement.id==='profile-name'&&!!document.querySelector('[data-field-error]')`);
browser('fill','#profile-name','Maya Chen');browser('fill','#profile-bio','Official S2 review.');click('[data-action=review]');click('[data-action=submit-operation]');click('[data-action=approve]');await ready('.identity-page');
await nav('content');await ready('[data-content-screen=content]');click('[data-action=content-new]');await ready('[data-visual-state=ready]');click('[data-action=editor-heading]');browser('press','ArrowDown');browser('press','Enter');browser('fill','.ProseMirror[contenteditable=true]','Official S2 component review');click('[data-action=editor-files]');await ready('[role=menuitem]');check('文件菜单使用官方菜单语义',`document.querySelectorAll('[role=menuitem]').length===2`);browser('press','Escape');await capture('editor');await capture('editor-mobile',320);browser('set','viewport','1440','1000');click('[data-action=content-review]');named('Sign and publish');click('[data-action=publish-approve]');await ready('[data-action=publish-read]');click('[data-action=publish-read]');await capture('reader');
await nav('artifacts');await ready('[data-artifact-id]');await capture('artifacts');await capture('artifacts-mobile',320);browser('set','viewport','1440','1000');named('Create Artifact');await ready('#artifact-name');browser('upload','input[type=file]',path.resolve('fixtures/homepage/painted-hand.jpg'));await ready('.artifact-preview img');browser('fill','#artifact-name','Official component study');named('Review creation');await ready('[data-artifact-screen=review]');await capture('artifact-review');named('Sign & Create Artifact');await ready('[role=dialog]');browser('press','Escape');await ready('[data-artifact-phase=cancelled]');check('取消 Artifact 授权保留草稿',`!!document.querySelector('[data-artifact-phase=cancelled]')&&document.body.textContent.includes('Official component study')`);
await nav('identity');await ready('.identity-page');click('[data-action=public]');await ready('[data-homepage-state=ready]');
click('[data-action=copy-bap]');await ready('[data-copy-feedback=copied]');check('复制控件为官方 ActionButton',`document.querySelector('[data-action=copy-bap]').hasAttribute('data-rac')`);
click('[data-homepage-action=details]');await ready('[role=dialog]');browser('press','Escape');await new Promise(r=>setTimeout(r,250));check('详情关闭后焦点返回入口',`document.activeElement.dataset.homepageAction==='details'`);
click('[data-homepage-action=more-content]');await capture('homepage');
const media=evaluate(`[...document.querySelectorAll('.homepage-work-preview')].map(e=>({width:Math.round(e.getBoundingClientRect().width),height:Math.round(e.getBoundingClientRect().height)}))`);
// 桌面布局与最窄手机均检查，媒体尺寸见截图及报告。
await capture('homepage-mobile',320);browser('set','viewport','1440','1000');
browser('find','role','tab','click','--name','Images','--exact');browser('press','ArrowRight');check('官方 Tabs 支持方向键切换',`document.querySelector('[role=tab][aria-selected=true]').textContent==='Video'`);
await scenario('[data-homepage-scenario=content]','failure');check('内容读取失败保留身份主体',`!!document.querySelector('[data-homepage-module=content] [role=alert]')&&!!document.querySelector('.homepage h1')`);await scenario('[data-homepage-scenario=content]','normal');
click('[data-action=prototype-settings]');browser('find','role','checkbox','check','--name','Simulate copy failure');click('.scenario-panel .panel-title button');click('[data-action=copy-bap]');await ready('[data-copy-feedback=copyFailed]');check('复制失败保留完整标识',`document.querySelector('[data-copy-feedback=copyFailed]').closest('[role=group]').textContent.includes('2FfJxP9rMWqeBZQ3KxL2wZsLbS7xw8bVpD')`);
named('Appearance & language');click('[data-action=locale-zh]');click('[data-action=theme-dark]');browser('press','Escape');await new Promise(r=>setTimeout(r,250));await capture('homepage-zh-dark',320);check('深色业务正文和标题可见',`getComputedStyle(document.body).colorScheme==='dark'&&getComputedStyle(document.querySelector('.homepage h1')).color.match(/\\d+/g).slice(0,3).every(v=>Number(v)>180)`);check('中文和深色偏好生效',`document.documentElement.lang==='zh-CN'&&document.documentElement.dataset.colorScheme==='dark'`);
const errors=browser('errors').errors;assert.deepEqual(errors,[],'浏览器运行错误');const warnings=browser('console').messages.filter(x=>['warning','error'].includes(x.type));
fs.writeFileSync(path.join(target,'verification.json'),JSON.stringify({runtime:'@react-spectrum/s2@1.6.0',session,checkedAt:new Date().toISOString(),checks,screens,media,errors,warnings,scope:'四模块主要流程、相关错误边界、双语深色、320px 移动端；未穷举原 PRD 全部 BDD。'},null,2)+'\n');
console.log(`${checks.length} 项交互断言、${screens.length} 张截图通过。`);
