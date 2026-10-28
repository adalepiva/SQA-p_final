import { defineConfig } from 'vitest/config';
export default defineConfig({ test: {
  environment: 'jsdom', include: ['tests/frontend/**/*.test.js'],
  reporters: ['default', 'junit'], outputFile: { junit: 'reports/frontend.xml' },
  coverage: { provider: 'v8', include: ['desa_Agenda_Proyecto2/agenda-contactos/assets/*.js'],
    reporter: ['text', 'json-summary', 'lcov', 'html'],
    thresholds: { lines: 60, statements: 60, functions: 60, branches: 60 } }
} });
