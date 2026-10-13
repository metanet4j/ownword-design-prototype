import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const session=process.env.OWNWORD_BROWSER_SESSION||`ownword-editor-actions-${Date.now()}`;
const target=path.resolve(process.env.OWNWORD_EVIDENCE||'evidence/official-s2/editor-actions-before');
fs.mkdirSync(target,{recursive:true});
const report={session,checkedAt:new Date().toISOString(),scope:'逐按钮检查正文变化；DOM eval 只读，输入、选择与动作均通过浏览器控件。',actions:[]};
const save=()=>fs.writeFileSync(path.join(target,'verification.json'),JSON.stringify(report,null,2)+'\n');
function b(...args){const r=JSON.parse(execFileSync('agent-browser',['--session',session,'--json',...args],{encoding:'utf8',maxBuffer:12e6}));assert.equal(r.success,true,r.error);return r.data;}
const read=c=>b('eval',c).result,click=s=>b('click',s),delay=ms=>new Promise(r=>setTimeout(r,ms));
const source=()=>read(`document.querySelector('.editor-host')?.ownwordEditor?.value()`);
async function ready(code){for(let i=0;i<45;i++){if(read(code))return;await delay(100);}throw Error('未就绪：'+code);}
async function reset(mode,text='alpha beta'){
  click('[data-mode=edit]');await ready(`!!document.querySelector('.cm-content')`);b('focus','.cm-content');b('press','Control+a');b('press','Backspace');b('keyboard','inserttext',text);await delay(250);assert.equal(source(),text,'起始正文必须精确一致');
  if(mode==='visual'){click('[data-mode=visual]');await ready(`document.querySelector('[data-visual-state]')?.dataset.visualState==='ready'`);}
  const selector=mode==='visual'?'.ProseMirror':'.cm-content';b('focus',selector);b('press','Control+Home');b('press','Control+Shift+End');
}
async function command(key){
  if(/^h[1-3]$/.test(key)){click('[data-action=editor-heading]');await ready(`!!document.querySelector('[role=menu]')`);await delay(200);b('find','role','menuitem','click','--name','Heading '+key[1],'--exact');}
  else if(['bold','italic'].includes(key)||key==='link'&&read(`!!document.querySelector('button[data-format=link]')`))click('button[data-format='+key+']');
  else {click('[data-action=editor-more]');await ready(`!!document.querySelector('[role=menu]')`);b('scrollintoview','[data-format='+key+']');await delay(200);click('[data-format='+key+']');}
  await delay(300);
}
async function action(mode,width,key,expected,run){
  const item={mode,width,key,expected};
  try{await run();item.actual=source();item.result=expected(item.actual)?'passed':'failed';}
  catch(error){item.result='failed';item.error=error.message;}
  // 函数只用于本地断言；报告保存其文字表达。
  item.expected=String(expected);report.actions.push(item);save();console.log(mode+' '+width+' '+key+': '+item.result+' '+JSON.stringify(item.actual));
  if(item.result==='failed')b('screenshot',path.join(target,mode+'-'+width+'-'+key+'.png'));
}
b('open','http://127.0.0.1:4315/?editor-actions='+Date.now());await ready(`!!document.querySelector('[data-action=connect]')`);click('[data-action=connect]');click('[data-action=approve]');await ready(`!!document.querySelector('.identity-page')`);click('#navigation-toggle');click('[data-action=nav-content]');await ready(`!!document.querySelector('[data-action=content-new]')`);click('[data-action=content-new]');await ready(`!!document.querySelector('[data-visual-state=ready]')`);
const tests=[['h1',/^# alpha beta/m],['h2',/^## alpha beta/m],['h3',/^### alpha beta/m],['bold',/\*\*alpha beta\*\*/],['italic',/\*alpha beta\*/],['strike',/~~alpha beta~~/],['quote',/^> alpha beta/m],['unordered',/^- alpha beta/m],['ordered',/^1[.)] alpha beta/m],['task',/^- \[ \] alpha beta/m],['code',/`alpha beta`/],['codeblock',/```[\s\S]*alpha beta[\s\S]*```/],['table',/\|.*\|[\s\S]*\|\s*[-:]/],['rule',/(^|\n)(---|\*\*\*)(\n|$)/]];
for(const width of (process.env.OWNWORD_WIDTHS||'1440,320').split(',').map(Number)){
  b('set','viewport',''+width,width===320?'720':'1000');
  for(const mode of ['visual','edit']){
    for(const [key,expected] of tests)await action(mode,width,key,text=>expected.test(text)&&((text.match(/alpha beta/g)||[]).length===(key==='table'||key==='rule'?0:1)),async()=>{await reset(mode);await command(key);});
    await action(mode,width,'undo',text=>text.trim()==='alpha beta',async()=>{await reset(mode);await command('bold');await command('undo');});
    await action(mode,width,'redo',text=>/\*\*alpha beta\*\*/.test(text),async()=>{await command('redo');});
    await action(mode,width,'link',text=>/\[alpha beta\]\(https:\/\/example.com\)/.test(text),async()=>{await reset(mode);await command('link');if(mode==='visual'){await ready(`!!document.querySelector('#visual-link-url')`);b('fill','#visual-link-url','https://example.com');click('[data-action=visual-link-apply]');await delay(300);}});
    await action(mode,width,'find',text=>text.trim()==='alpha beta',async()=>{await reset(mode);await command('find');await ready(`!!document.querySelector('.cm-search')`);assert.equal(read(`document.activeElement.closest('.cm-search')!==null`),true);b('screenshot',path.join(target,mode+'-'+width+'-find.png'));b('press','Escape');});
    // 各模式按钮保留正文；预览等待实际文本而非仅等待容器。
    await reset(mode,'alpha beta');b('press','ArrowRight');const before=source();
    for(const next of width===320?['preview','edit','visual']:['split','preview','edit','visual']){
      click('[data-mode='+next+']');await delay(650);report.actions.push({mode,width,key:'mode-'+next,expected:before,actual:source(),result:source()===before?'passed':'failed'});save();
    }
    const audit=b('a11y');report.actions.push({mode,width,key:'a11y',result:audit.violations.length?'failed':'passed',audit});save();
  }
}
report.errors=b('errors').errors;report.console=b('console').messages.filter(m=>['warning','error'].includes(m.type));report.result=report.actions.some(x=>x.result==='failed')||report.errors.length?'needs-fix':'passed';save();console.log(report.result);if(report.result!=='passed')process.exitCode=1;
