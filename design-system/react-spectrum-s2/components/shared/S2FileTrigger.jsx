import React from 'react';

// 对照绑定版本的 React Aria FileTrigger：外观由子按钮决定，原生 input 负责选文件。
// 原型只实现当前使用的单文件选择；不宣称覆盖生产 PressResponder 的全部能力。
export function S2FileTrigger({children,acceptedFileTypes,onSelect}) {
  const input=React.useRef(null);
  const trigger=React.Children.only(children);
  return <>{React.cloneElement(trigger,{onClick:event=>{
    trigger.props.onClick?.(event);
    if(event.defaultPrevented)return;
    input.current.value='';
    input.current.click();
  }})}<input ref={input} type="file" hidden accept={acceptedFileTypes?.join(',')}
    onClick={event=>event.stopPropagation()} onChange={event=>onSelect?.(event.target.files)}/></>;
}
