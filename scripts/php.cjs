const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
fs.mkdirSync('reports', { recursive: true });
const result = spawnSync(process.env.PHP_BIN || 'php', ['tests/php/coverage.php'], { encoding: 'utf8', env: process.env });
process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
fs.writeFileSync('reports/php.txt', (result.stdout || '') + (result.stderr || ''));
if (result.error) throw result.error;
process.exit(result.status ?? 1);
