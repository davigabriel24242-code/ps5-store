import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'store_catalog.json'), 'utf8'));
if (!Array.isArray(catalog.apps)) throw Error('store_catalog.json precisa conter apps[]');

const assetRoot = path.resolve(process.argv[2] || root);
let missing = 0;
for (const relative of [
  'assets/logo.png',
  ...catalog.apps.filter(a => a.titleid).map(a => 'covers/' + a.titleid + '.jpg')
]) {
  const ok = fs.existsSync(path.join(assetRoot, relative));
  console.log((ok ? 'OK    ' : 'FALTA ') + relative);
  if (!ok) missing++;
}

const jsxPath = path.join(root, 'apps/pipow-store/index.jsx');
if (fs.existsSync(jsxPath)) {
  const src = fs.readFileSync(jsxPath, 'utf8');
  for (const api of ['window.', 'document.', 'localStorage', 'fetch(']) {
    if (src.includes(api)) throw Error('API de navegador encontrada: ' + api);
  }
} else {
  console.log('AVISO apps/pipow-store/index.jsx ainda nao existe.');
}

console.log('Catalogo: ' + catalog.apps.length + ' registros. Assets ausentes: ' + missing + '.');
console.log('Esta verificacao NAO compila o motor, NAO valida a API de Image e NAO gera aplicativo PS5.');
process.exitCode = missing ? 2 : 0;