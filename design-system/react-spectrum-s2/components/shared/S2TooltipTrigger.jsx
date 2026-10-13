import React from 'react';

// 绑定 S2 1.6.0 的原型行为适配：悬停延迟、键盘立即显示、Escape 与边界翻转。
export function S2TooltipTrigger({children, delay = 1500}) {
  const [trigger, tooltip] = React.Children.toArray(children);
  const [anchor, setAnchor] = React.useState(null), [position, setPosition] = React.useState(null);
  const timer = React.useRef(0), id = React.useId();
  const close = () => {clearTimeout(timer.current); setAnchor(null); setPosition(null);};
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const place = () => {
    const element = document.getElementById(id);
    if (!anchor || !element) return;
    const box = anchor.getBoundingClientRect(), tip = element.getBoundingClientRect();
    if (box.bottom < 0 || box.top > innerHeight) {close(); return;}
    const gap = 8, edge = 8, below = box.top < tip.height + gap + edge;
    const left = Math.max(edge, Math.min(box.left + box.width / 2 - tip.width / 2, innerWidth - tip.width - edge));
    setPosition({left, top: below ? box.bottom + gap : box.top - tip.height - gap,
      '--s2-tooltip-arrow-x': Math.max(edge, Math.min(box.left + box.width / 2 - left, tip.width - edge)) + 'px',
      placement: below ? 'bottom' : 'top'});
  };
  React.useEffect(() => {
    if (!anchor) return;
    const key = event => {if (event.key === 'Escape') {event.preventDefault(); event.stopPropagation(); close();}};
    // 聚焦引起的自动滚动只重新定位，避免提示刚显示就被滚动事件关闭。
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    document.addEventListener('keydown', key, true);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('keydown', key, true);
    };
  }, [anchor]);
  React.useLayoutEffect(place, [anchor, tooltip.props.children]);
  const enter = event => {
    if (event.pointerType === 'touch' || trigger.props.disabled) return;
    const target = event.currentTarget;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAnchor(target), delay);
  };
  const leave = () => {clearTimeout(timer.current); if (anchor === document.activeElement) return; timer.current = setTimeout(close, 100);};
  const button = React.cloneElement(trigger, {
    'aria-describedby': [trigger.props['aria-describedby'], anchor ? id : null].filter(Boolean).join(' ') || undefined,
    onPointerEnter: event => {trigger.props.onPointerEnter?.(event); enter(event);},
    onPointerLeave: event => {trigger.props.onPointerLeave?.(event); leave();},
    onFocus: event => {trigger.props.onFocus?.(event); if (event.target.matches(':focus-visible')) {clearTimeout(timer.current); setAnchor(event.currentTarget);}},
    onBlur: event => {trigger.props.onBlur?.(event); close();},
    onPointerDown: event => {trigger.props.onPointerDown?.(event); close();},
    onClick: event => {close(); trigger.props.onClick?.(event);}
  });
  const portal = anchor && window.ReactDOM.createPortal(React.cloneElement(tooltip, {
    id, 'data-placement': position?.placement,
    style: {left: position?.left, top: position?.top, '--s2-tooltip-arrow-x': position?.['--s2-tooltip-arrow-x'], visibility: position ? 'visible' : 'hidden'},
    onPointerEnter: () => clearTimeout(timer.current), onPointerLeave: leave
  }), anchor.closest('dialog[open]') || anchor.closest('.s2') || document.body);
  return <>{button}{portal}</>;
}
