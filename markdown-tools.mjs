// 参考 xLog src/markdown/index.ts；仅保留本版文字内容的解析链。
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
const blockContainers = new Set(['root','list','listItem','blockquote','table','tableRow']);
const plain = node => node.type === 'break' ? ' ' : node.type === 'image' ? node.alt || '' : node.children ? node.children.map(plain).join(blockContainers.has(node.type) ? ' ' : '') : node.value || '';
const unsupported = node => ['image','imageReference','html','footnoteDefinition','footnoteReference'].includes(node.type) || (node.type === 'code' && ['mermaid','math','latex'].includes(node.lang));
function textOnly(options = {}) {
  return (tree, file) => {
    function walk(node) {
      if (!node.children) return;
      node.children = node.children.map(child => {
        if (unsupported(child) && !(options.media && ['image','imageReference'].includes(child.type))) {
          file.data.unsupported = true;
          const value = String(file.value).slice(child.position.start.offset, child.position.end.offset);
          return node.type === 'root' ? {type: 'paragraph', position: child.position, children: [{type:'text', value}]} : {type:'text', position: child.position, value};
        }
        walk(child); return child;
      });
    }
    walk(tree);
  };
}
function readableHtml() {
  return tree => {
    for (const node of tree.children) if (node.type === 'element' && node.position) node.properties.dataLine = node.position.start.line;
    function walk(node) {
      if (node.type === 'element') {
        if (node.tagName === 'a') {
          if (node.properties.href) {node.properties.target = '_blank'; node.properties.rel = ['noopener','noreferrer'];}
          else node.properties.ariaDisabled = 'true';
        }
        if (node.tagName === 'pre') node.properties.tabIndex = 0;
        if (node.tagName === 'table') {node.properties.tabIndex = 0;}
      }
      node.children?.forEach(walk);
    }
    walk(tree);
  };
}
const makePipeline = media => unified().use(remarkParse).use(remarkGfm, {singleTilde:false}).use(textOnly,{media}).use(remarkRehype).use(rehypeSanitize).use(readableHtml).use(rehypeStringify);
const textPipeline=makePipeline(false),mediaPipeline=makePipeline(true);
let cachedSource = null, cachedResult,cachedMedia;
export function renderMarkdown(source,{media=false}={}) {
  if (source === cachedSource && media===cachedMedia) return cachedResult;
  const pipeline=media?mediaPipeline:textPipeline;
  const tree = pipeline.parse(source);
  const metadata = {title: plain(tree.children.find(n => n.type === 'heading' && n.depth === 1) || {}), summary: tree.children.filter(n => n.type !== 'heading').map(plain).join(' ').replace(/\s+/g,' ').trim()};
  const file = {value:source, data:{unsupported:false}};
  const htmlTree = pipeline.runSync(tree, file);
  const result = {...metadata, html:pipeline.stringify(htmlTree), unsupported:file.data.unsupported};
  cachedSource = source; cachedResult = result;cachedMedia=media;
  return result;
}
export function metadata(source) {return renderMarkdown(source);}
