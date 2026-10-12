import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), I=require('./model.js'),H=require('./homepage-model.js');
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
 } else if(feature==='P02') {
  browser('open','http://127.0.0.1:4314/?check=P02#/identity/'+H.additionalIds[0]);await ready();
  check('P02-A','缺失资料只回退姓名，不生成简介或空资产卡',`document.querySelector('.homepage h1')?.textContent===${JSON.stringify(H.additionalIds[0].slice(0,8)+'…')} && !document.querySelector('.homepage .bio') && !document.querySelector('[data-homepage-digital]') && !!document.querySelector('[data-action="copy-bap"]')`);
  evaluate(`window.__clipboardWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=value=>{window.__copiedBap=value;return window.__clipboardWrite(value);};true`);
  browser('click','.homepage [data-action="copy-bap"]');await ready('[data-copy-feedback="copied"]');
  check('P02-A','完整 BAP ID 实际复制',`document.querySelector('[data-copy-target="bap"]')?.dataset.copyFeedback==='copied'`);
  assert.equal(evaluate('window.__copiedBap'),H.additionalIds[0]);evaluate('navigator.clipboard.writeText=window.__clipboardWrite;true');
  await route('#/identity/'+I.ids[0]);
  check('P02-B','Current 数字 ID 与 BAP ID 同时显示，编号状态独立',`!!document.querySelector('[data-homepage-digital]') && document.querySelector('.homepage code')?.textContent===${JSON.stringify(I.ids[0])}`);
  browser('click','[data-homepage-action="details"]');
  check('P02-B','身份详情包含完整身份与发布交易',`document.querySelector('dialog[open]')?.textContent.includes(${JSON.stringify(I.ids[0])}) && !!document.querySelector('[data-copy-target="identity-proof-tx"]')`);
  shot();browser('press','Escape');
  if(!evaluate('!!document.querySelector(".scenario-panel")'))browser('click','[data-action="prototype-settings"]');
  browser('select','[data-artifact-scenario="facts"]','unknown');browser('click','[data-action="artifact-apply-facts"]');
  check('P02-B','Current 关联未知时不声称数字 ID 有效',`!document.querySelector('[data-homepage-digital]')`);
  browser('select','[data-artifact-scenario="facts"]','normal');browser('click','[data-action="artifact-apply-facts"]');
  await scenario('proof','unverified');browser('click','[data-homepage-action="details"]');
  check('P02-C','尚未核实不宣称签名有效',`document.querySelector('[data-identity-signature]')?.dataset.identitySignature==='unverified'`);
  browser('press','Escape');await scenario('proof','failed');browser('click','[data-homepage-action="details"]');
  check('P02-C','验证失败与未验证分别显示',`document.querySelector('[data-identity-signature]')?.dataset.identitySignature==='invalid'`);
  browser('press','Escape');await scenario('proof','record');
} else throw new Error('未知功能：'+feature);
const errors=browser('errors');
assert.equal((errors.errors||[]).length,0,JSON.stringify(errors));
fs.writeFileSync(path.join(target,'verification.json'),JSON.stringify({feature,command:`node verify-homepage.mjs ${feature}`,scope:'本项新增流程与相关边界；确定性演练，无真实 Wallet 或交易',steps,browserErrors:errors,screenshot:'desktop.png',visualReview:'awaiting-user-review'},null,2)+'\n');
console.log(feature+'：'+steps.length+' 项实际浏览器断言通过。');
