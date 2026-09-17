// 交互参考本地 xLog 的 CodeMirror、toolbar helper 与 DualColumnEditor。
import {EditorState, EditorSelection, Compartment, Annotation} from '@codemirror/state';
import {EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine} from '@codemirror/view';
import {history, historyKeymap, defaultKeymap, undo, redo} from '@codemirror/commands';
import {markdown, markdownKeymap} from '@codemirror/lang-markdown';
import {HighlightStyle, syntaxHighlighting, indentOnInput} from '@codemirror/language';
import {searchKeymap, openSearchPanel} from '@codemirror/search';
import {tags} from '@lezer/highlight';
const externalUpdate = Annotation.define();
const highlight = HighlightStyle.define([
  {tag: tags.heading, fontWeight: '600', color: 'var(--s2-gray-900)'},
  {tag: tags.strong, fontWeight: '700'}, {tag: tags.emphasis, fontStyle: 'italic'},
  {tag: tags.strikethrough, textDecoration: 'line-through'},
  {tag: [tags.link, tags.url], color: 'var(--s2d-accent)'},
  {tag: [tags.meta, tags.contentSeparator], color: 'var(--s2-gray-600)'},
  {tag: tags.monospace, color: 'var(--s2-blue-1000)'}
]);
function insert(view, text, from, to, anchor, head = anchor) {
  view.dispatch({changes: {from, to, insert: text}, selection: EditorSelection.single(anchor, head), userEvent: 'input', scrollIntoView: true});
  view.focus();
}
export function format(view, command, placeholder = 'text') {
  if (view.composing) return false;
  if (command === 'undo') return undo(view);
  if (command === 'redo') return redo(view);
  if (command === 'find') return openSearchPanel(view);
  const {from, to} = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const wrappers = {bold: ['**', '**'], italic: ['*', '*'], strike: ['~~', '~~'], code: ['`', '`'], link: ['[', '](https://example.com)'], codeblock: ['```\n', '\n```']};
  if (wrappers[command]) {
    const [left, right] = wrappers[command];
    if (selected && from >= left.length && view.state.sliceDoc(from - left.length, from) === left && view.state.sliceDoc(to, to + right.length) === right) {
      insert(view, selected, from - left.length, to + right.length, from - left.length, to - left.length);
    } else {
      const body = selected || placeholder;
      insert(view, left + body + right, from, to, from + left.length, from + left.length + body.length);
    }
    return true;
  }
  if (command === 'table' || command === 'rule') {
    const text = command === 'table' ? '\n| Heading | Heading |\n| --- | --- |\n| Text | Text |\n' : '\n\n---\n\n';
    insert(view, text, from, to, from + text.length); return true;
  }
  const prefix = {h1: '# ', h2: '## ', h3: '### ', quote: '> ', unordered: '- ', ordered: '1. ', task: '- [ ] '}[command];
  if (!prefix) return false;
  const first = view.state.doc.lineAt(from), last = view.state.doc.lineAt(to);
  const text = view.state.sliceDoc(first.from, last.to).split(/\r?\n/).map((line, i) => {
    if (command[0] === 'h') return prefix + line.replace(/^#{1,6}\s+/, '');
    return (command === 'ordered' ? `${i + 1}. ` : prefix) + line;
  }).join('\n');
  insert(view, text, first.from, last.to, first.from, first.from + text.length); return true;
}
export function createEditor(parent, value, options) {
  const labels = new Compartment(), separator = new Compartment();
  const attributes = (label, locale) => [EditorView.contentAttributes.of({'aria-label': label, spellcheck: 'false'}), EditorState.phrases.of(locale === 'zh' ? {Find:'查找', Replace:'替换', next:'下一项', previous:'上一项', all:'全部', 'match case':'区分大小写', regexp:'正则表达式', 'by word':'整词', replace:'替换', 'replace all':'全部替换', close:'关闭', 'Go to line':'跳转到行', go:'前往', 'current match':'当前匹配', 'on line':'行'} : {})];
  const view = new EditorView({parent, state: EditorState.create({doc: value, extensions: [
    labels.of(attributes(options.label, options.locale)), separator.of(EditorState.lineSeparator.of(value.includes('\r\n') ? '\r\n' : '\n')),
    history(), lineNumbers(), drawSelection(), highlightActiveLine(), indentOnInput(), markdown(), syntaxHighlighting(highlight), EditorView.lineWrapping,
    keymap.of([{key: 'Mod-b', run: v => format(v, 'bold')}, {key: 'Mod-i', run: v => format(v, 'italic')}, {key: 'Mod-k', run: v => format(v, 'link')}, ...markdownKeymap, ...historyKeymap, ...searchKeymap, ...defaultKeymap]),
    EditorView.updateListener.of(update => {if (update.docChanged && !update.transactions.some(tr => tr.annotation(externalUpdate))) options.onChange(update.state.sliceDoc());}),
    EditorView.domEventHandlers({scroll: (_event, v) => {options.onScroll?.(v);}}),
    EditorView.theme({'&': {height: '100%', fontSize: 'var(--s2-font-size-100)', color: 'var(--s2-gray-900)'}, '.cm-scroller': {fontFamily: 'var(--s2d-font-mono)', lineHeight: '1.85', overflow: 'auto'}, '.cm-content': {padding: '24px 0', caretColor: 'var(--s2d-accent)'}, '.cm-line': {padding: '0 20px 0 12px'}, '.cm-gutters': {background: 'transparent', color: 'var(--s2-gray-600)', border: 'none', padding: '0 4px 0 8px'}, '.cm-activeLine,.cm-activeLineGutter': {background: 'var(--s2-gray-75)'}, '.cm-cursor': {borderLeftColor: 'var(--s2d-accent)'}, '&.cm-focused': {outline: '2px solid var(--s2d-focus)', outlineOffset: '-2px'}, '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {background: 'var(--s2-blue-200)'}, '.cm-panels': {background: 'var(--s2-gray-75)', color: 'var(--s2-gray-900)'}, '.cm-search input': {maxWidth: '130px'}})
  ]})});
  const api = {view, value: () => view.state.sliceDoc(), command: (cmd, hint) => {format(view, cmd, hint); if (cmd !== 'find') view.focus();},
    setValue(text) {if (text !== view.state.sliceDoc()) view.dispatch({changes: {from: 0, to: view.state.doc.length, insert: text}, effects: separator.reconfigure(EditorState.lineSeparator.of(text.includes('\r\n') ? '\r\n' : '\n')), annotations: externalUpdate.of(true)});},
    setLabel(label, locale) {view.dispatch({effects: labels.reconfigure(attributes(label, locale))});}, destroy() {view.destroy(); delete parent.ownwordEditor;}};
  parent.ownwordEditor = api;
  return api;
}
export {renderMarkdown, metadata} from './markdown-tools.mjs';
