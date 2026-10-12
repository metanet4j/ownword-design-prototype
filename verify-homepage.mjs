import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), I=require('./model.js');
const feature=process.argv[2], session='ownword-v040-20261012';
const target=path.resolve('evidence/homepage-v040',feature);
fs.mkdirSync(target,{recursive:true});
const steps=[];
function browser(...args) {
  const result=JSON.parse(execFileSync('agent-browser',['--session',session,'--json',...args],{encoding:'utf8',maxBuffer:8*1024*1024}));
  assert.equal(result.success,true,JSON.stringify(result));
  return result.data;
}
const evaluate=source=>browser('eval',source).result;
async function ready(selector='[data-homepage-state]') {
  for(let i=0;i<30;i++){if(evaluate(`!!document.querySelector(${JSON.stringify(selector)}) && !document.querySelector('.homepage[aria-busy="true"]')`))return;await new Promise(r=>setTimeout(r,100));}
  throw new Error('页面没有就绪：'+selector);
}
async function route(hash) {browser('open','http://127.0.0.1:4314/'+hash);await ready();}
async function scenario(key,value) {
  if(!evaluate('!!document.querySelector(".scenario-panel")'))browser('click','[data-action="prototype-settings"]');
  browser('select',`[data-homepage-scenario="${key}"]`,value);
}
function check(id,label,source) {assert.equal(evaluate(source),true,label);steps.push({bdd:id,check:label,result:'passed'});}
function shot(name='desktop') {browser('mouse','move','0','0');browser('screenshot',path.join(target,name+'.png'));}
browser('set','viewport','1440','1000');
if(feature==='P01') {
  browser('open','http://127.0.0.1:4314/?check=P01#/identity/'+I.ids[0]);await ready();
  check('P01-A','未连接 Wallet 的公开身份、内容和关系列表入口',`document.querySelector('.homepage h1')?.textContent==='Maya Chen' && !!document.querySelector('[data-homepage-module="content"] article') && !!document.querySelector('[data-homepage-list="following"]') && !document.querySelector('.wallet-connected') && !document.querySelector('dialog[open]')`);
  shot();
  await route('#/identity/!!');check('P01-B','无效输入单独显示',`document.querySelector('[data-homepage-state]')?.dataset.homepageState==='invalid' && !document.querySelector('.homepage article')`);
  await route('#/identity/'+'9'.repeat(34));check('P01-B','不存在的 Identity 不显示其他人的资料',`document.querySelector('[data-homepage-state]')?.dataset.homepageState==='missing' && !document.querySelector('.homepage .portrait')`);
  await route('#/identity/'+I.ids[0]);await scenario('content','failure');
  check('P01-C','内容失败不遮蔽身份与关系入口',`document.querySelector('.homepage h1')?.textContent==='Maya Chen' && !!document.querySelector('[data-homepage-module="content"] [role="alert"]') && !!document.querySelector('[data-homepage-list="followers"]')`);
  await scenario('content','normal');await scenario('relationship','failure');
  check('P01-C','关系失败不清除公开作品',`!!document.querySelector('[data-homepage-module="relationship"] [role="alert"]') && document.querySelectorAll('.homepage article').length===2`);
  await scenario('relationship','normal');
} else throw new Error('未知功能：'+feature);
const errors=browser('errors');
assert.equal((errors.errors||[]).length,0,JSON.stringify(errors));
fs.writeFileSync(path.join(target,'verification.json'),JSON.stringify({feature,command:`node verify-homepage.mjs ${feature}`,scope:'本项新增流程与相关边界；确定性演练，无真实 Wallet 或交易',steps,browserErrors:errors,screenshot:'desktop.png',visualReview:'awaiting-user-review'},null,2)+'\n');
console.log(feature+'：'+steps.length+' 项实际浏览器断言通过。');
