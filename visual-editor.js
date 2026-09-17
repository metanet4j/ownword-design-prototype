// Markdown 原文仍由草稿持有；可视化文档只在用户实际修改后回写。
import {Editor, rootCtx, defaultValueCtx, editorViewCtx, editorViewOptionsCtx, remarkStringifyOptionsCtx} from '@milkdown/kit/core';
import {commonmark, remarkPreserveEmptyLinePlugin, imageSchema, linkSchema, toggleStrongCommand, toggleEmphasisCommand, toggleInlineCodeCommand, wrapInHeadingCommand, wrapInBlockquoteCommand, wrapInBulletListCommand, wrapInOrderedListCommand, createCodeBlockCommand, insertHrCommand} from '@milkdown/kit/preset/commonmark';
import {gfm, extendListItemSchemaForTask, toggleStrikethroughCommand, insertTableCommand} from '@milkdown/kit/preset/gfm';
import {history, undoCommand, redoCommand} from '@milkdown/kit/plugin/history';
import {cursor} from '@milkdown/kit/plugin/cursor';
import {callCommand, getMarkdown, replaceAll, insert} from '@milkdown/kit/utils';
import {TextSelection} from '@milkdown/kit/prose/state';
import {renderMarkdown} from './markdown-tools.mjs';

export async function createVisualEditor(parent, value, options) {
  let raw=value, baseline=value, baselineMarkdown, lastMarkdown, disposed=false, updating=false;
  const instance=Editor.make().config(ctx=>{
    ctx.set(rootCtx,parent);ctx.set(defaultValueCtx,value);
    ctx.set(remarkStringifyOptionsCtx,{bullet:'-',emphasis:'*',strong:'*',fences:true,listItemIndent:'one'});
    ctx.update(imageSchema.key,prev=>context=>({...prev(context),toDOM:node=>['span',{'data-visual-literal':'image'},'!['+(node.attrs.alt || '')+']('+node.attrs.src+')']}));
    ctx.update(extendListItemSchemaForTask.key,prev=>context=>{
      const schema=prev(context);return {...schema,toDOM:node=>node.attrs.checked==null ? schema.toDOM(node) : ['li',{'data-item-type':'task','data-checked':String(node.attrs.checked)},['input',{type:'checkbox',...(node.attrs.checked ? {checked:''} : {}),contenteditable:'false','data-task-checkbox':'','aria-label':options.taskLabel}],['div',0]]};
    });
    ctx.update(editorViewOptionsCtx,prev=>({...prev,attributes:{...prev.attributes,class:'markdown-body visual-surface',role:'textbox','aria-multiline':'true','aria-label':options.label},
      handleDOMEvents:{click(view,event){
        if(event.target.matches('[data-task-checkbox]')) {
          event.preventDefault();const li=event.target.closest('li');const pos=view.state.doc.resolve(view.posAtDOM(li,0));
          for(let depth=pos.depth;depth>0;depth--){const node=pos.node(depth);if(node.type.name==='list_item'){view.dispatch(view.state.tr.setNodeMarkup(pos.before(depth),undefined,{...node.attrs,checked:!node.attrs.checked}));return true;}}
        }
        if(event.target.closest('a')){event.preventDefault();return true;}return false;
      }},
      handlePaste(view,event){
        const text=event.clipboardData?.getData('text/plain');if(!text)return true;
        if(renderMarkdown(text).unsupported || view.state.selection.$from.parent.type.spec.code) view.dispatch(view.state.tr.insertText(text));
        else instance.action(insert(text));return true;
      },handleDrop:()=>true
    }));
  }).use(commonmark.filter(plugin=>!remarkPreserveEmptyLinePlugin.includes(plugin))).use(gfm).use(history).use(cursor);
  await instance.create();
  const view=instance.ctx.get(editorViewCtx);
  baselineMarkdown=lastMarkdown=instance.action(getMarkdown());
  function selection() {
    const marks=view.state.storedMarks || view.state.selection.$from.marks();
    const state={};for(const [key,name] of Object.entries({bold:'strong',italic:'emphasis',link:'link'})){const mark=view.state.schema.marks[name];state[key]=!!mark && (marks.some(x=>x.type===mark) || (!view.state.selection.empty && view.state.doc.rangeHasMark(view.state.selection.from,view.state.selection.to,mark)));}
    options.onSelection?.(state);
  }
  view.setProps({dispatchTransaction(transaction){
    if(disposed)return;
    const previous=view.state.doc;view.updateState(view.state.apply(transaction));
    if(!updating && !previous.eq(view.state.doc)){
      const markdown=instance.action(getMarkdown());
      // 标题锚点等内部属性更新不回写原文；撤销到初始正文时恢复原始标记与换行。
      if(markdown!==lastMarkdown){lastMarkdown=markdown;const next=markdown===baselineMarkdown ? baseline : markdown;if(next!==raw){raw=next;options.onChange(next);}}
    }
    selection();
  }});
  const commands={bold:toggleStrongCommand,italic:toggleEmphasisCommand,strike:toggleStrikethroughCommand,code:toggleInlineCodeCommand,quote:wrapInBlockquoteCommand,unordered:wrapInBulletListCommand,ordered:wrapInOrderedListCommand,codeblock:createCodeBlockCommand,rule:insertHrCommand,table:insertTableCommand,undo:undoCommand,redo:redoCommand};
  const api={view,value:()=>raw,
    command(key){
      if(view.composing)return;
      if(/^h[1-3]$/.test(key))instance.action(callCommand(wrapInHeadingCommand.key,Number(key[1])));
      else if(key==='task'){
        instance.action(callCommand(wrapInBulletListCommand.key));const pos=view.state.selection.$from;
        for(let depth=pos.depth;depth>0;depth--){const node=pos.node(depth);if(node.type.name==='list_item'){view.dispatch(view.state.tr.setNodeMarkup(pos.before(depth),undefined,{...node.attrs,checked:node.attrs.checked==null ? false : null}));break;}}
      } else if(commands[key])instance.action(callCommand(commands[key].key,key==='table' ? {row:2,col:2} : undefined));
      view.focus();selection();
    },
    selectedText:()=>view.state.doc.textBetween(view.state.selection.from,view.state.selection.to,' '),
    selectedLink:()=>{const mark=[...(view.state.storedMarks || []),...view.state.selection.$from.marks()].find(x=>x.type.name==='link');return mark?.attrs.href || '';},
    link(href,label){
      const {from,to}=view.state.selection;const text=label || api.selectedText() || href;
      const tr=view.state.tr.insertText(text,from,to);tr.setSelection(TextSelection.create(tr.doc,from,from+text.length));
      const mark=linkSchema.type(instance.ctx);tr.removeMark(from,from+text.length,mark);if(href)tr.addMark(from,from+text.length,mark.create({href}));view.dispatch(tr);view.focus();
    },
    setValue(text){if(disposed || text===raw)return;updating=true;try{instance.action(replaceAll(text,true));raw=baseline=text;baselineMarkdown=lastMarkdown=instance.action(getMarkdown());}finally{updating=false;}selection();},
    setLabel(label,taskLabel){view.dom.setAttribute('aria-label',label);view.dom.querySelectorAll('[data-task-checkbox]').forEach(node=>node.setAttribute('aria-label',taskLabel));options.taskLabel=taskLabel;},
    destroy(){disposed=true;delete parent.ownwordVisualEditor;return instance.destroy();}
  };
  parent.ownwordVisualEditor=api;selection();return api;
}
