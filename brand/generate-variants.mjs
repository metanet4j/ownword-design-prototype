import {readFileSync, writeFileSync} from 'node:fs';
const primary = readFileSync(new URL('ownword-mark.svg', import.meta.url), 'utf8');
for (const [file, color] of [['ownword-mono.svg', '#131313'], ['ownword-reverse.svg', '#ffffff']]) {
  writeFileSync(new URL(file, import.meta.url), primary.replace('fill="#3b63fb"', `fill="${color}"`));
}
console.log('Two color variants generated from ownword-mark.svg');
