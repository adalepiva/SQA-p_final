const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const archiver = require('archiver');
const root = 'desa_Agenda_Proyecto2/agenda-contactos';
const php = process.env.PHP_BIN || 'php';
function check(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) check(file);
    else if (file.endsWith('.php')) {
      const r = spawnSync(php, ['-l', file], { stdio: 'inherit' });
      if (r.error) throw r.error;
      if (r.status !== 0) process.exit(r.status || 1);
    }
  }
}
check(root);
fs.mkdirSync('artifacts', { recursive: true });
const output = fs.createWriteStream('artifacts/agenda-contactos.zip');
const zip = archiver('zip', { zlib: { level: 9 } });
zip.on('error', error => { throw error; });
output.on('close', () => console.log(`Plugin generado: ${zip.pointer()} bytes`));
zip.pipe(output); zip.directory(root, 'agenda-contactos'); zip.finalize();
