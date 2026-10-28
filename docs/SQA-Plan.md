# Plan de Aseguramiento de la Calidad

Fecha: 27 de octubre de 2026. Responsable: Emilio Adalberto Pivaral Delgado. Producto: Agenda de contactos 1.2.0 con intervención SQA.

## 1. Propósito y alcance

Evitar que cambios defectuosos ingresen a `main` mediante revisión y controles reproducibles. Se cubren registro, autenticación, autorización por propietario, validación, CRUD, búsqueda, interfaz y fallos de servicios externos. Se reutiliza una base PHP/WordPress/MySQL/JavaScript existente. No se incluyen carga, estrés ni rendimiento; los tiempos de Newman son informativos.

## 2. Referencias de calidad

Estructura inspirada en IEEE 730 (planificación, actividades, responsabilidades y registros de SQA) y categorías de ISO/IEC 25010 (adecuación funcional, fiabilidad, seguridad y mantenibilidad). Es una adaptación académica, no una certificación ni una declaración de cumplimiento completo de las normas. La matriz hace trazables requisito, prueba y resultado.

## 3. Roles y revisión

El estudiante implementa, ejecuta, mantiene evidencia y gestiona incidencias. El docente o un colaborador invitado revisa el PR: aislamiento por usuario, validación, tratamiento de errores y claridad. El autor no puede aprobar su propio PR en GitHub. En trabajo individual se conserva revisión automática obligatoria y se coordina la revisión humana; no se inventan aprobaciones.

## 4. Actividades y herramientas

| Actividad | Herramienta | Momento | Evidencia |
|---|---|---|---|
| Línea base | ZIP original, SHA256, PHP, jscpd | Antes del refactor | JSON y registro inicial |
| Pruebas unitarias | Dobles PHP, Vitest/jsdom | Cada push/PR | Salida PHP, JUnit |
| Integración | WordPress real, MySQL, REST dispatch | Cada push/PR | integration.txt |
| Regresión | Casos PHP existentes y frontend | Cada push/PR | Suite y matriz |
| E2E de API | Postman / Newman HTTP y cookies | Cada push/PR | JUnit, JSON, capturas Postman |
| Cobertura | Xdebug y V8 | Cada push/PR | Clover, LCOV, HTML |
| Análisis estático | php -l, ESLint, Prettier, jscpd | Cada push/PR | Logs y reporte duplicación |
| Revisión humana | Pull request | Antes del merge | Conversación y aprobación |
| Entrega | ZIP de plugin | Después del gate | Artefacto de Actions |

Postman verifica el flujo de extremo a extremo HTTP del backend, no los píxeles del navegador. jsdom cubre comportamiento de la interfaz con respuestas controladas. La verificación visual de la app complementa ambas técnicas.

## 5. Métricas y criterios de aceptación

| Métrica | Umbral | Incumplimiento |
|---|---|---|
| Pruebas fallidas | 0 | Salida distinta de cero |
| Cobertura JS (líneas, sentencias, ramas, funciones) | ≥60% cada una | Vitest falla |
| Cobertura PHP de clases backend | ≥60% líneas | coverage.php falla |
| Instrumentación PHP en CI | Obligatoria | Falla si falta Xdebug |
| Errores/advertencias ESLint | 0/0 | ESLint falla |
| Archivos JS con formato incorrecto | 0 | Prettier falla |
| Duplicación jscpd | ≤5% | jscpd falla |
| Jobs build, test, analyze | Todos success | report falla ante skipped/cancelled/failure |

Cobertura PHP: `agenda-contactos.php` e `includes/auth.php`; templates PHP no se incluyen en ese porcentaje. La prueba de HTTP ejercita su renderización, pero esa cobertura no se suma. Cobertura JS: los tres archivos productivos de assets, incluidos los no ejecutados. No se suman porcentajes de lenguajes ni se presenta cobertura como prueba de ausencia de bugs.

## 6. Incidencias y deuda técnica

Registrar ID, evidencia, severidad, responsable y criterio de cierre. Crítico: filtración entre usuarios, pérdida de datos o bypass de acceso; bloquea entrega. Mayor: CRUD roto o gate eludible; corregir antes de merge. Menor: formato o mantenibilidad; corregir o registrar plazo. La deuda vigente está en `Deuda-Tecnica.md`.

## 7. Gestión de configuración

Versionar fuente, package-lock.json, workflow, pruebas y documentos. `npm ci` respeta el lock. CI usa PHP 8.3, Node 22, MySQL 8.4 y WordPress 6.8.3 como plataforma de pruebas reproducible; no se presenta esta versión fijada como recomendación de producción. Las actualizaciones requieren nueva ejecución de las suites. Los datos CI son desechables. Los secretos de servicios externos irían en GitHub Secrets; nunca en el YAML ni documentos.

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Internet/Open-Meteo caído | Respuestas simuladas en unitarias y manejo visible del error |
| Cobertura inflada por dobles | Integración adicional con WordPress/MySQL real |
| Error de instalación con salida 0 de WordPress | Verificaciones de integración y shutdown con fallo si no completa |
| Pipeline verde sin proteger main | Requerir check report y PR en configuración de GitHub |
| Sesiones o contactos en reportes | Publicar resumen/capturas de datos ficticios; no subir JSON crudo de Newman |
| Falta de revisor en modalidad individual | Coordinar docente/colaborador; documentar pendiente |
| Dependencias de herramientas obsoletas | Revisión de actualizaciones y auditoría antes de entrega |

## 9. Cierre

Aceptación: suites y gates aprobados, repositorio con PR/check obligatorio, evidencia remota verificable, documentación consistente, presentación de hasta 10 diapositivas y video narrado entre 4 y 5 minutos. No marcar como terminado un requisito que solo tenga configuración preparada.
