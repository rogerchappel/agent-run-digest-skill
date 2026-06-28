import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const files = ['bin/agent-run-digest.js', ...readdirSync('src').map(file => `src/${file}`)];
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('build ok');
