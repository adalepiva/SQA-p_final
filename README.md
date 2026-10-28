# Agenda de contactos · SQA y CI/CD

[![SQA CI](https://github.com/adalepiva/SQA-proyecto-final/actions/workflows/ci.yml/badge.svg)](https://github.com/adalepiva/SQA-proyecto-final/actions/workflows/ci.yml)

Proyecto de **Emilio Adalberto Pivaral Delgado**, curso Aseguramiento de la Calidad del Software. Se reutiliza la Agenda de contactos 1.2.0 existente y se incorpora un pipeline con pruebas, cobertura, análisis y entrega de un ZIP instalable. El badge refleja GitHub cuando exista una ejecución; no sustituye las evidencias locales.

## Aplicación y stack

Agenda privada por usuario: registro, acceso, CRUD, búsqueda y clima. Backend PHP 8.3 / WordPress, base MySQL 8.4, frontend JavaScript y CSS. Se mantiene la aplicación original conforme al requisito de reutilización. No se reemplaza por una aplicación Node desde cero. Node 22 se utiliza para Vitest, ESLint, Prettier, jscpd y Newman.

## Instalación de la aplicación

1. Instalar WordPress y configurar su base de datos.
2. Ejecutar `npm ci` y `npm run build` con PHP en PATH, o definir `PHP_BIN` con la ruta de PHP.
3. Instalar `artifacts/agenda-contactos.zip` desde Plugins → Añadir plugin → Subir plugin.
4. Crear una página con `[mis_contactos]` y publicarla.
5. Registrarse y probar la agenda. El clima requiere conexión a Open-Meteo.

El código activo está en `desa_Agenda_Proyecto2/agenda-contactos/`. El ZIP original en la raíz se conserva como línea base; no instalar ese archivo como versión SQA. Los ZIP, hashes y documentos dentro de `desa_Agenda_Proyecto2` pertenecen a la entrega anterior. El build SQA se genera siempre desde el código actual.

## Verificación local

```sh
npm ci
npm run build
npm test
npm run test:php
npm run analyze
npm run report
```

La cobertura PHP requiere Xdebug con `XDEBUG_MODE=coverage`. En CI, `REQUIRE_PHP_COVERAGE=1` hace fallar la ejecución si falta. Sin Xdebug, el comando local ejecuta regresiones y avisa que la cobertura no se midió.

Para integración y Postman se requiere WordPress temporal en `.runtime/wordpress`, puerto 8080 y MySQL con la base exclusiva `agenda_sqa`. Ver [Manual técnico](docs/Manual-Tecnico.md). No usar la colección contra producción: crea usuarios y contactos de prueba.

## Pipeline y quality gates

`build → test → analyze → report`: empaquetado, pruebas frontend/PHP/integración/Postman, análisis estático y dashboard HTML. Los fallos bloquean el gate final. El ZIP de build es un candidato; solo se considera entregable si el job `report` queda aprobado. No hay despliegue cloud automático configurado.

- JavaScript: líneas, sentencias, ramas y funciones ≥60%.
- PHP: líneas ejecutables de las dos clases backend ≥60%.
- ESLint: cero errores y cero advertencias; formato Prettier conforme.
- Duplicación jscpd: máximo 5% con bloques de al menos 8 líneas/70 tokens.
- Pruebas: cero fallos en todas las suites.

Se usa ESLint + jscpd + dashboard reproducible como variante local de análisis. `sonar-project.properties` queda preparado para SonarQube Cloud, pero no implica que ese servicio esté conectado. Ver las limitaciones y pendientes en la documentación.

## Entregables

- [Plan SQA](docs/SQA-Plan.md)
- [Matriz de pruebas](docs/Matriz-Pruebas.md)
- [Línea base](docs/Linea-Base-Calidad.md)
- [Reporte de mejora](docs/Reporte-Mejora.md)
- [Manual técnico](docs/Manual-Tecnico.md) y [manual de uso](docs/Manual-Uso.md)
- [Configuración GitHub y demostración](docs/GitHub-Entrega.md)
- [Guion de video de 4:45](docs/Guion-Video.md)
- [Deuda técnica](docs/Deuda-Tecnica.md)
- `docs/evidencias/`: mediciones y capturas reales; `output/`: presentación.

## Revisión y seguridad

Cada cambio se trabaja en una rama y se propone mediante PR. La revisión automática la realizan los checks; una persona distinta del autor realiza la revisión humana. La protección debe activarse en GitHub, según [la guía](docs/GitHub-Entrega.md). Nunca subir `.runtime`, `.env`, bases de datos, credenciales ni cookies de sesiones. Las credenciales del servicio CI son desechables y solo existen durante el job.
