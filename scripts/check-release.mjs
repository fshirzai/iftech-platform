import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';

const root = process.cwd();
const required = [
  'apps/api/src/app.js',
  'apps/api/src/server.js',
  'apps/api/src/modules/platform.js',
  'apps/api/src/modules/auth.js',
  'apps/api/src/modules/resources.js',
  'apps/api/src/modules/payments.js',
  'apps/web/src/components/Studio.tsx',
  'apps/web/src/components/PortalShell.tsx',
  'apps/web/src/lib/api.ts',
];
async function collect(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', 'dist'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collect(path));
    else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) files.push(path);
  }
  return files;
}
for (const file of required) await readFile(join(root, file));
for (const file of await collect(join(root, 'apps/api/src'))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(`Syntax check failed: ${relative(root, file)}\n${result.stderr}`);
    process.exit(1);
  }
}
const app = await readFile(join(root, 'apps/api/src/app.js'), 'utf8');
const platform = await readFile(join(root, 'apps/api/src/modules/platform.js'), 'utf8');
const studio = await readFile(join(root, 'apps/web/src/components/Studio.tsx'), 'utf8');
if (!/export default app\s*;/.test(app)) throw Error('Vercel Express entry point needs a default export');
if (platform.indexOf('Project.schema.index') < platform.indexOf('export const Project =')) throw Error('Project index registered before declaration');
if (!/satisfies readonly View\[\]/.test(studio)) throw Error('Studio navigation needs narrow types');
console.log('PASS: Required files exist; backend JavaScript syntax; known Vercel and TypeScript regression guards.');
console.log('NOTE: This does not replace npm run typecheck, npm test, npm run build, or browser/API tests.');
