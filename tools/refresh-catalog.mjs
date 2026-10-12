import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'store_catalog.json'), 'utf8'));
if (!Array.isArray(data.apps)) throw Error('Catalogo invalido');
fs.writeFileSync(
  path.join(root, 'apps/pipow-store/catalog.js'),
  'export default ' + JSON.stringify(data, null, 2) + ';\n'
);
console.log('catalog.js atualizado: ' + data.apps.length + ' registros.');