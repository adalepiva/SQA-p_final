const fs = require('node:fs');
function read(file) { try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return null; } }
const js = read('coverage/coverage-summary.json')?.total;
const php = read('reports/php-coverage.json');
const dup = read('reports/duplication/jscpd-report.json')?.statistics?.total;
const newman = read('reports/newman.json')?.run;
const metrics = { timestamp: new Date().toISOString(), js, php, duplication: dup,
  e2e: newman ? { assertions: newman.stats.assertions.total, failed: newman.stats.assertions.failed } : null,
  jobs: { build: process.env.SQA_BUILD || 'no registrado', test: process.env.SQA_TEST || 'no registrado', analyze: process.env.SQA_ANALYZE || 'no registrado' } };
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/metrics.json',JSON.stringify(metrics,null,2));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rows = [
 ['Cobertura JavaScript: líneas', js?.lines.pct, '≥ 60 %'],
 ['Cobertura JavaScript: ramas', js?.branches.pct, '≥ 60 %'],
 ['Cobertura JavaScript: funciones', js?.functions.pct, '≥ 60 %'],
 ['Cobertura PHP: líneas de clases backend', php?.percent?.toFixed(2), '≥ 60 %'],
 ['Duplicación de líneas (jscpd)', dup?.percentage, '≤ 5 %'],
 ['Aserciones E2E fallidas', metrics.e2e?.failed, '= 0'],
];
const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Agenda · Calidad SQA</title>
<style>body{font:18px system-ui;max-width:1000px;margin:60px auto;padding:24px;color:#18304a;background:#f4f7fa}h1{font-size:42px}table{width:100%;border-collapse:collapse;background:white}td,th{padding:17px;text-align:left;border-bottom:1px solid #dce4eb}small{color:#506579}code{font-size:15px}</style>
<h1>Agenda de contactos · Calidad</h1><p>Mediciones de pruebas, cobertura y análisis estático.</p>
<table><tr><th>Métrica</th><th>Resultado</th><th>Umbral</th></tr>${rows.map(r=>`<tr>${r.map(v=>`<td>${escape(v ?? 'No medido')}</td>`).join('')}</tr>`).join('')}</table>
<p>Etapas: ${escape(JSON.stringify(metrics.jobs))}</p><p>ESLint y Prettier bloquean el análisis ante errores. PHP se valida también con php -l.</p>
<p>Este panel no calcula bugs ni vulnerabilidades: esas cifras requieren una herramienta especializada y revisión. Duplicación no equivale a defectos.</p>
<small>Generado: ${escape(metrics.timestamp)}. Evidencias: metrics.json, reportes JUnit, LCOV, Clover y Newman. Los valores no medidos nunca se convierten en cero.</small></html>`;
fs.writeFileSync('reports/dashboard.html',html);
if(process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '| Métrica | Resultado | Umbral |\n|---|---|---|\n' + rows.map(r=>'| '+r.map(v=>v??'No medido').join(' | ')+' |').join('\n'));
console.log('Dashboard generado en reports/dashboard.html');
