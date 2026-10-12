import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), I=require('./model.js'),H=require('./homepage-model.js');
const feature=process.argv[2], session=process.env.OWNWORD_BROWSER_SESSION||'ownword-v040-clean-20261012';
const target=path.resolve('evidence/homepage-v040',feature);
fs.mkdirSync(target,{recursive:true});
const steps=[];
function browser(...args) {
  if(args[0]==='click' && !args[1].startsWith('@'))evaluate(`(()=>{document.querySelector(${JSON.stringify(args[1])})?.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'});return true;})()`);
  const result=JSON.parse(execFileSync('agent-browser',['--session',session,'--json',...args],{encoding:'utf8',maxBuffer:8*1024*1024}));
  assert.equal(result.success,true,JSON.stringify(result));
  return result.data;
}
const evaluate=source=>browser('eval',source).result;
async function ready(selector='[data-homepage-state]') {
  for(let i=0;i<30;i++){if(evaluate(`document.getElementById('root')?.dataset.ready==='true' && !!document.querySelector(${JSON.stringify(selector)}) && !document.querySelector('.homepage[aria-busy="true"]')`))return;await new Promise(r=>setTimeout(r,100));}
  throw new Error('页面没有就绪：'+selector);
}
async function route(hash) {browser('open','http://127.0.0.1:4314/'+evaluate('location.search')+hash);await ready();}
async function scenario(key,value,{keepOpen=false}={}) {
  if(!evaluate('!!document.querySelector(".scenario-panel")'))browser('click','[data-action="prototype-settings"]');
  browser('select',`[data-homepage-scenario="${key}"]`,value);
  if(!keepOpen)browser('click','.scenario-panel .panel-title button');
}
async function resetRelationships(mode='initial'){await scenario('relationshipFixture',mode,{keepOpen:true});browser('click','[data-homepage-action="reset-relationships"]');browser('click','.scenario-panel .panel-title button');}
async function walletConnect(){browser('click','[data-action="approve"]');await ready('[data-relationship-actor="'+I.ids[0]+'"]');}
async function perform(action){browser('click','[data-relationship-action="'+action+'"]');await ready('dialog[data-modal-title="relationship-review"]');browser('click','[data-relationship-action="sign"]');await ready('dialog[data-modal-title="relationship-wallet"]');browser('click','[data-relationship-action="approve"]');}
function check(id,label,source) {assert.equal(evaluate(source),true,label);steps.push({bdd:id,check:label,result:'passed'});}
function shot(name='desktop') {browser('mouse','move','0','0');browser('screenshot',path.join(target,name+'.png'));}
browser('set','viewport','1440','1000');
browser('open','about:blank');
if(feature==='P01') {
  browser('open','http://127.0.0.1:4314/?check=P01#/identity/'+I.ids[0]);await ready();
  check('P01-A','未连接 Wallet 的公开身份、内容和关系列表入口',`document.querySelector('.homepage h1')?.textContent==='Maya Chen' && !!document.querySelector('[data-homepage-module="content"] article') && !!document.querySelector('[data-homepage-list="following"]') && !document.querySelector('.wallet-connected') && !document.querySelector('dialog[open]')`);
  shot();
  await route('#/identity/!!');check('P01-B','无效输入单独显示',`document.querySelector('[data-homepage-state]')?.dataset.homepageState==='invalid' && !document.querySelector('.homepage article')`);
  await route('#/identity/'+'9'.repeat(34));check('P01-B','不存在的 Identity 不显示其他人的资料',`document.querySelector('[data-homepage-state]')?.dataset.homepageState==='missing' && !document.querySelector('.homepage .portrait')`);
  await route('#/identity/'+I.ids[0]);await scenario('content','failure');
  check('P01-C','内容失败不遮蔽身份与关系入口',`document.querySelector('.homepage h1')?.textContent==='Maya Chen' && !!document.querySelector('[data-homepage-module="content"] [role="alert"]') && !!document.querySelector('[data-homepage-list="followers"]')`);
  await scenario('content','normal');await scenario('relationship','failure');
  check('P01-C','关系失败不清除公开作品',`!!document.querySelector('[data-homepage-module="relationship"] [role="alert"]') && document.querySelectorAll('.homepage article').length>=2`);
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
 } else if(feature==='P03') {
  browser('open','http://127.0.0.1:4314/?check=P03#/identity/'+I.ids[0]);await ready();
  browser('click','[role="tab"][id$="-all"]');browser('click','[data-homepage-action="more-content"]');
  check('P03-A','只展示公开作品，四种内容均可到达',`document.querySelectorAll('[data-homepage-post]').length===5 && ['blog','image','video','audio'].every(k=>document.querySelector('[data-content-type="'+k+'"]')) && !document.querySelector('.homepage').textContent.includes('Private notebook')`);
  check('P03-A','公开发布时间稳定倒序',`(()=>{const times=[...document.querySelectorAll('[data-published-at]')].map(n=>n.dataset.publishedAt);return times.every((t,i)=>!i||times[i-1]>=t);})()`);
  check('P03-C','当前版本只出现一次，历史原文仍在源模型',`document.querySelectorAll('[data-homepage-post="'+ 'c3'.repeat(32)+'"]').length===1 && !document.querySelector('[data-homepage-post="'+'a1'.repeat(32)+'"]') && OwnwordHomepageModel.records().some(r=>r.txid==='a1'.repeat(32))`);
  browser('click','[role="tab"][id$="-image"]');check('P03-B','图片是独立内容条目',`document.querySelectorAll('[data-homepage-post]').length===1 && !!document.querySelector('[data-content-type="image"] img')`);shot();
  browser('reload');await ready();check('P03-B','刷新恢复原有内容筛选',`document.querySelector('[role="tab"][aria-selected="true"]')?.textContent==='Images'`);
  await route('#/identity/'+I.ids[1]);browser('click','[role="tab"][id$="-audio"]');check('P03-B','没有音频时显示明确类型空状态',`!document.querySelector('[data-homepage-post]') && document.querySelector('.homepage-empty')?.textContent.includes('this type')`);
  await route('#/identity/'+I.ids[0]);browser('click','[role="tab"][id$="-all"]');await scenario('pagination','failure');browser('click','[data-homepage-action="more-content"]');
  check('P03-A','后续页失败保留首批作品',`document.querySelectorAll('[data-homepage-post]').length===3 && !!document.querySelector('.homepage-stream [role="alert"]')`);await scenario('pagination','normal');browser('click','[data-homepage-action="more-content"]');
 } else if(feature==='P04') {
  browser('open','http://127.0.0.1:4314/?check=P04#/identity/'+I.ids[0]);await ready();browser('click','[role="tab"][id$="-blog"]');browser('click','a[href="#/content/'+ 'c3'.repeat(32)+'"]');await ready('.markdown-body h1');
  check('P04-A','从主页按 TxID 阅读正文与内嵌媒体',`location.hash==='#/content/'+'c3'.repeat(32) && document.querySelector('.markdown-body h1')?.textContent==='Your words deserve a home' && !!document.querySelector('.markdown-body img') && document.querySelector('.reader-author-link')?.textContent.includes('Maya Chen')`);
  browser('click','[data-action="reader-author"]');await ready();check('P04-A','作者入口回到该作者稳定主页',`location.hash==='#/identity/'+${JSON.stringify(I.ids[0])}`);
  await route('#/content/'+'a1'.repeat(32));await ready('.markdown-body h1');
  check('P04-B','历史链接保留旧正文并明确标记',`location.hash==='#/content/'+'a1'.repeat(32) && !!document.querySelector('[data-action="reader-latest"]') && !document.querySelector('.markdown-body').textContent.includes('A note from the workbench')`);
  shot();browser('click','[data-action="reader-latest"]');await ready('.markdown-body h1');
  check('P04-B','可从历史版本进入当前正文',`location.hash==='#/content/'+'c3'.repeat(32) && document.querySelector('.markdown-body').textContent.includes('A note from the workbench')`);
  browser('click','[data-action="reader-history"]');await ready('.content-history');check('P04-B','历史列表包含两个不可变版本',`document.querySelectorAll('[data-version-id]').length===2 && location.hash.endsWith('/history')`);
  await route('#/content/'+'c3'.repeat(32));await scenario('markdown','unsafe');await ready('.markdown-body h1');await ready('[data-reader-media-error]');
  check('P04-C','脚本和危险 URL 不执行，局部媒体失败保留正文和来源',`window.__unsafeHomepage!==true && !document.querySelector('.markdown-body script') && !document.querySelector('.markdown-body a[href^="javascript:"]') && !!document.querySelector('[data-reader-media-error]') && !!document.querySelector('.markdown-body a[href^="https://github.com/mdn/"]') && document.querySelector('.markdown-body').textContent.includes('Start with the author')`);await scenario('markdown','normal');
 } else if(feature==='P05') {
  browser('open','http://127.0.0.1:4314/?check=P05#/content/'+'d4'.repeat(32));await ready('.homepage-image-stage img');
  check('P05-A','图片加载并可完整查看',`document.querySelector('.homepage-image-stage img').naturalWidth>0`);browser('click','[data-homepage-action="zoom"]');check('P05-A','图片可放大并恢复',`document.querySelector('.homepage-image-stage').classList.contains('is-zoomed')`);browser('click','[data-homepage-action="zoom"]');
  await route('#/content/'+'e5'.repeat(32));await ready('[data-media-duration]');check('P05-A','视频读取真实时长且不自动播放',`document.querySelector('.homepage-media video').paused && document.querySelector('.homepage-media video').duration>0`);
  evaluate('window.__testedVideo=document.querySelector(".homepage-media video");window.__testedVideo.focus();true');browser('press','Space');await ready('[data-media-playing="true"]');
  await new Promise(r=>setTimeout(r,350));check('P05-A','键盘启动视频，实际播放进度增加',`window.__testedVideo.currentTime>0 && !window.__testedVideo.paused`);shot();browser('press','Space');await ready('[data-media-playing="false"]');
  evaluate('window.__testedVideo.focus();true');browser('press','Space');await ready('[data-media-playing="true"]');await route('#/identity/'+I.ids[0]);check('P05-A','离开视频后停止播放',`window.__testedVideo.paused`);
  await route('#/content/'+'f6'.repeat(32));await ready('[data-media-duration]');evaluate('window.__testedAudio=document.querySelector(".homepage-media audio");window.__testedAudio.focus();true');browser('press','Space');await ready('[data-media-playing="true"]');await new Promise(r=>setTimeout(r,300));check('P05-A','音频实际播放且可暂停',`window.__testedAudio.currentTime>0 && !window.__testedAudio.paused`);browser('press','Space');await ready('[data-media-playing="false"]');
  evaluate('window.__testedAudio.focus();true');browser('press','Space');await ready('[data-media-playing="true"]');await route('#/identity/'+I.ids[0]);check('P05-A','离开音频后停止播放',`window.__testedAudio.paused`);
  await route('#/content/'+'e5'.repeat(32));await scenario('media','unsupportedFormat');check('P05-B','格式不支持与资源失败分别反馈',`!!document.querySelector('[data-media-error="unsupported"]') && !!document.querySelector('[data-action="reader-author"]') && !document.querySelector('[data-media-duration]')`);await scenario('media','missingAsset');await ready('[data-media-error="resource"]');check('P05-B','资源不可用仍保留作者及来源，不显示假时长',`!!document.querySelector('[data-media-error="resource"]') && !!document.querySelector('.homepage-media-source') && !document.querySelector('[data-media-duration]')`);
  await scenario('media','normal');await ready('[data-media-duration]');browser('click','[data-content-proof] summary');check('P05-C','可播放资源不会把未核实签名改成有效',`document.querySelector('[data-proof-state]')?.dataset.proofState==='unverified' && document.querySelector('.homepage-media video').duration>0`);
 } else if(feature==='P09') {
  browser('open','http://127.0.0.1:4314/?check=P09#/identity/'+I.ids[1]);await ready();await resetRelationships();
  browser('click','[data-relationship-action="follow"]');await ready('dialog[data-modal-title="connectTitle"]');browser('click','[data-action="cancel"]');
  check('P09-A','取消连接后仍能读取公开主页，不产生关系事件',`!!document.querySelector('[data-homepage-module="content"]') && !document.querySelector('dialog[open]') && !document.querySelector('.wallet-connected') && OwnwordHomepageModel.loadRelationships().events.length===7`);
  browser('click','[data-relationship-action="follow"]');await ready('dialog[data-modal-title="connectTitle"]');await walletConnect();await ready('dialog[data-modal-title="relationship-review"]');
  check('P09-A','连接完成后重新进入 Review，未自动签名或提交',`document.querySelector('dialog[open]').textContent.includes(${JSON.stringify(I.ids[0])}) && document.querySelector('dialog[open]').textContent.includes(${JSON.stringify(I.ids[1])}) && OwnwordHomepageModel.loadRelationships().events.length===7`);shot();
  browser('click','[data-relationship-action="sign"]');await ready('dialog[data-modal-title="relationship-wallet"]');browser('click','[data-relationship-action="cancel"]');
  check('P09-B','钱包授权取消与失败分别呈现，关系不提前变化',`!!document.querySelector('[data-relationship-message="cancelled"]') && OwnwordHomepageModel.loadRelationships().events.length===7`);
  await scenario('signature','mismatch');await perform('follow');await ready('[data-relationship-message="relationshipMismatch"]');check('P09-B','签名身份不匹配时没有广播记录',`OwnwordHomepageModel.loadRelationships().events.length===7 && !OwnwordHomepageModel.relation(OwnwordHomepageModel.loadRelationships(),${JSON.stringify(I.ids[0])},${JSON.stringify(I.ids[1])}).following`);
  await scenario('signature','match');await scenario('relationshipOutcome','unknown');await scenario('relationshipQuery','unknown');await perform('follow');await ready('[data-relationship-phase="unknown"]');
  const original=evaluate(`OwnwordHomepageModel.loadOperations(${JSON.stringify(I.ids[0])}).operations.at(-1).id`);
  browser('reload');await ready();browser('click','[data-relationship-action="follow"]');await ready('dialog[data-modal-title="connectTitle"]');await walletConnect();await ready('[data-relationship-phase="unknown"]');
  check('P09-C','刷新并恢复原身份后保留未知操作，禁止再次提交',`!document.querySelector('dialog[open]') && document.querySelector('[data-relationship-action="follow"]')?.disabled && OwnwordHomepageModel.loadOperations(${JSON.stringify(I.ids[0])}).operations.at(-1).id===${JSON.stringify(original)}`);
  await scenario('relationshipQuery','unknown');browser('click','[data-relationship-action="query"]');check('P09-C','结果仍未知只查询，不新建交易',`OwnwordHomepageModel.loadOperations(${JSON.stringify(I.ids[0])}).operations.at(-1).id===${JSON.stringify(original)} && !OwnwordHomepageModel.loadRelationships().events.some(e=>e.id===${JSON.stringify(original)})`);
  await scenario('relationshipQuery','accepted');browser('click','[data-relationship-action="query"]');await ready('[data-relationship-phase="verified"]');check('P09-C','查询原操作得到接收结果并只归并一次',`OwnwordHomepageModel.loadRelationships().events.filter(e=>e.id===${JSON.stringify(original)}).length===1`);
  await route('#/identity/'+H.additionalIds[1]);await scenario('relationshipOutcome','unknown');await scenario('relationshipQuery','not-received');await perform('follow');await ready('[data-relationship-phase="unknown"]');browser('click','[data-relationship-action="query"]');await ready('[data-relationship-phase="not-received"]');browser('click','[data-relationship-action="follow"]');await ready('dialog[data-modal-title="relationship-review"]');check('P09-C','确认未接收后可重新 Review，仍由用户确认',`!!document.querySelector('[data-relationship-action="sign"]')`);browser('click','[data-relationship-action="cancel"]');
  await route('#/identity/'+H.additionalIds[0]);await scenario('relationshipAccount','review-switch');browser('click','[data-relationship-action="unfollow"]');await ready('dialog[data-modal-title="relationship-review"]');await ready('[data-relationship-actor="'+I.ids[1]+'"]');
  check('P09-D','Review 切换身份使未提交授权失效，主页目标保持不变',`!document.querySelector('dialog[open]') && location.hash==='#/identity/'+${JSON.stringify(H.additionalIds[0])} && !!document.querySelector('[data-relationship-message="identityChanged"]')`);
  if(!evaluate('!!document.querySelector(".scenario-panel")'))browser('click','[data-action="prototype-settings"]');browser('click','[data-action="simulate-switch"]');await ready('[data-relationship-actor="'+I.ids[0]+'"]');
  await scenario('relationshipOutcome','unknown');await scenario('relationshipAccount','submitted-switch');await perform('unfollow');await ready('[data-relationship-actor="'+I.ids[1]+'"]');
  check('P09-D','已提交操作只保存在原身份，切换不改写主页归属',`location.hash==='#/identity/'+${JSON.stringify(H.additionalIds[0])} && OwnwordHomepageModel.loadOperations(${JSON.stringify(I.ids[0])}).operations.some(op=>op.target===${JSON.stringify(H.additionalIds[0])}&&op.phase==='unknown') && !OwnwordHomepageModel.loadOperations(${JSON.stringify(I.ids[1])}).operations.some(op=>op.actor===${JSON.stringify(I.ids[0])})`);
 } else if(feature==='P06') {
  browser('open','http://127.0.0.1:4314/?check=P06#/identity/'+I.ids[1]);await ready();await resetRelationships();browser('click','[data-relationship-action="follow"]');await ready('dialog[data-modal-title="connectTitle"]');await walletConnect();await ready('dialog[data-modal-title="relationship-review"]');browser('click','[data-relationship-action="sign"]');await ready('dialog[data-modal-title="relationship-wallet"]');browser('click','[data-relationship-action="approve"]');await ready('[data-relationship-phase="verified"]');
  check('P06-A','关注后按钮与目标粉丝总人数同步，记录归实际操作方',`!!document.querySelector('[data-following-state]') && document.querySelector('[data-relationship-count="followers"]')?.textContent==='3' && OwnwordHomepageModel.loadRelationships().events.at(-1).actor===${JSON.stringify(I.ids[0])} && OwnwordHomepageModel.loadRelationships().events.at(-1).target===${JSON.stringify(I.ids[1])}`);shot();
  await route('#/identity/'+I.ids[0]+'/following');check('P06-A','实际出向列表含目标 Identity',`document.querySelector('.homepage-list')?.textContent.includes('North Studio')`);
  await route('#/identity/'+I.ids[1]);await resetRelationships('mutual');await perform('unfollow');await ready('[data-relationship-phase="verified"]');
  check('P06-B','取消一个方向的关注，反向关注与 Friend 均保留',`(()=>{const state=OwnwordHomepageModel.relation(OwnwordHomepageModel.loadRelationships(),${JSON.stringify(I.ids[0])},${JSON.stringify(I.ids[1])});return !state.following && state.followedBy && state.friend==='friends';})()`);
  await resetRelationships();await scenario('relationshipIndex','delayed');await perform('follow');await ready('[data-relationship-phase="indexing"]');
  check('P06-C','索引延迟时保留已核实人数并阻止重复提交',`document.querySelector('[data-relationship-count="followers"]')?.textContent==='2' && !!document.querySelector('[data-relationship-count-sync]') && document.querySelector('[data-relationship-action="follow"]')?.disabled`);
  await scenario('relationshipQuery','accepted');browser('click','[data-relationship-action="query"]');await ready('[data-relationship-phase="verified"]');check('P06-C','查询完成后同步人数与按钮',`document.querySelector('[data-relationship-count="followers"]')?.textContent==='3' && !!document.querySelector('[data-following-state]') && !document.querySelector('[data-relationship-count-sync]')`);
 } else if(feature==='P07') {
  browser('open','http://127.0.0.1:4314/?check=P07#/identity/'+I.ids[1]);await ready();await resetRelationships('none');browser('click','[data-relationship-action="request"]');await ready('dialog[data-modal-title="connectTitle"]');await walletConnect();await ready('dialog[data-modal-title="relationship-review"]');browser('click','[data-relationship-action="sign"]');await ready('dialog[data-modal-title="relationship-wallet"]');browser('click','[data-relationship-action="approve"]');await ready('[data-friend-state="sent"]');
  check('P07-A','A 单方申请后等待 B 接受，尚未成为好友',`document.querySelector('[data-friend-state="sent"]')?.textContent==='Request sent' && OwnwordHomepageModel.loadRelationships().events.filter(e=>e.kind==='friend').length===1`);
  check('P07-C','单方申请不会自动关注或显示好友',`(()=>{const state=OwnwordHomepageModel.relation(OwnwordHomepageModel.loadRelationships(),${JSON.stringify(I.ids[0])},${JSON.stringify(I.ids[1])});return state.friend==='sent'&&!state.following&&!state.followedBy;})()`);
  browser('click','[data-friend-state="sent"]');await ready('dialog[data-modal-title="friend-details"]');check('P07-D','再次点击申请只查看原记录，不出现重复签名入口',`!document.querySelector('[data-relationship-action="sign"]') && document.querySelectorAll('[data-friend-record]').length===1`);browser('press','Escape');
  if(!evaluate('!!document.querySelector(".scenario-panel")'))browser('click','[data-action="prototype-settings"]');browser('click','[data-action="simulate-switch"]');await route('#/identity/'+I.ids[0]);await ready('[data-relationship-actor="'+I.ids[1]+'"]');await ready('[data-friend-state="received"]');
  check('P07-A','B 通过独立钱包身份看到 A 的申请',`document.querySelector('[data-friend-state="received"]')?.textContent==='Accept request' && location.hash==='#/identity/'+${JSON.stringify(I.ids[0])}`);
  await perform('accept');await ready('[data-friend-state="friends"]');check('P07-B','B 授权相反方向记录后，双方派生为好友',`(()=>{const data=OwnwordHomepageModel.loadRelationships();return data.events.filter(e=>e.kind==='friend').length===2 && data.events.at(-1).actor===${JSON.stringify(I.ids[1])} && data.events.at(-1).target===${JSON.stringify(I.ids[0])} && OwnwordHomepageModel.relation(data,${JSON.stringify(I.ids[0])},${JSON.stringify(I.ids[1])}).friend==='friends';})()`);shot();
  browser('click','[data-friend-state="friends"]');await ready('dialog[data-modal-title="friend-details"]');check('P07-D','已成立关系只提供详情，保留两个原始方向',`document.querySelectorAll('[data-friend-record]').length===2 && !document.querySelector('[data-relationship-action="sign"]')`);browser('press','Escape');
  await resetRelationships('none');await perform('follow');await ready('[data-following-state]');if(!evaluate('!!document.querySelector(".scenario-panel")'))browser('click','[data-action="prototype-settings"]');browser('click','[data-action="simulate-switch"]');await route('#/identity/'+I.ids[1]);await ready('[data-relationship-actor="'+I.ids[0]+'"]');await perform('follow');await ready('[data-following-state]');
  check('P07-C','双方 Follow 仍不等于 Friend',`(()=>{const state=OwnwordHomepageModel.relation(OwnwordHomepageModel.loadRelationships(),${JSON.stringify(I.ids[0])},${JSON.stringify(I.ids[1])});return state.following&&state.followedBy&&state.friend==='none';})()`);
} else throw new Error('未知功能：'+feature);
const errors=browser('errors');
assert.equal((errors.errors||[]).length,0,JSON.stringify(errors));
fs.writeFileSync(path.join(target,'verification.json'),JSON.stringify({feature,command:`node verify-homepage.mjs ${feature}`,scope:'本项新增流程与相关边界；确定性演练，无真实 Wallet 或交易',steps,browserErrors:errors,screenshot:'desktop.png',visualReview:'awaiting-user-review'},null,2)+'\n');
console.log(feature+'：'+steps.length+' 项实际浏览器断言通过。');
