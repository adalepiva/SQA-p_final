import js from '@eslint/js';
import globals from 'globals';
export default [js.configs.recommended, {
  files: ['desa_Agenda_Proyecto2/agenda-contactos/assets/*.js'],
  languageOptions: { globals: globals.browser },
  rules: { 'no-unused-vars': 'error', 'no-eval': 'error', 'eqeqeq': 'error', 'complexity': ['error', 18] }
}];
