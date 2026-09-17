// 在有章节目录的阅读页运行：agent-browser --session content-r02 eval --stdin < evidence/R02/check-toc.js
(async () => {
  const assert=(value,message)=>{if(!value)throw Error(message);};
  const toggle=document.querySelector('[data-action="reader-toc-toggle"]');
  if(toggle?.getAttribute('aria-expanded')==='false'){toggle.click();await new Promise(resolve=>requestAnimationFrame(resolve));}
  const buttons=[...document.querySelectorAll('[data-toc-target]')];
  assert(buttons.length>0,'未生成目录');
  assert(new Set(buttons.map(x=>x.dataset.tocTarget)).size===buttons.length,'标题锚点重复');
  for(const button of buttons){const heading=document.getElementById(button.dataset.tocTarget);assert(heading && /^H[1-6]$/.test(heading.tagName),'目录目标不是标题');assert(heading.textContent.trim()===button.textContent,'目录文字不匹配');}
  const button=buttons[Math.floor(buttons.length/2)], route=location.hash;
  button.click();
  const deadline=Date.now()+4000;
  while(Date.now()<deadline){await new Promise(resolve=>setTimeout(resolve,50));if(button.getAttribute('aria-current')==='location' && document.getElementById(button.dataset.tocTarget).getBoundingClientRect().top<(document.querySelector('.topbar').getBoundingClientRect().bottom+160))break;}
  assert(location.hash===route,'目录破坏阅读路由');
  assert(document.activeElement.id===button.dataset.tocTarget,'键盘焦点未移到章节');
  assert(button.getAttribute('aria-current')==='location','当前章节未更新');
  if(toggle)assert(toggle.getAttribute('aria-expanded')==='false','手机跳转后目录未收起');
  assert(document.documentElement.scrollWidth<=innerWidth,'页面横向溢出');
  return {headings:buttons.length,uniqueTargets:true,routePreserved:true,focusMoved:true,currentSection:true,noOverflow:true};
})();
