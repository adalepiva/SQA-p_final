# Reporte de mejora

Intervención: 27/10/2026. Se agregaron controles automáticos y se extrajo una función común para las peticiones HTTP de la agenda. Se conservaron permisos, API, almacenamiento y versión funcional del plugin.

| Indicador | Antes | Después local | Interpretación |
|---|---:|---:|---|
| Comprobaciones PHP | 77 | 77 aprobadas | Se preservó la regresión existente |
| Casos frontend Vitest | No existían | 10 aprobados | Nueva evidencia de interfaz |
| Comprobaciones integración real | No incluidas | 12 aprobadas | Persistencia y privacidad verificadas |
| Solicitudes E2E HTTP | No incluidas | 13; 19 aserciones aprobadas | CRUD completo y sesión |
| Cobertura PHP instrumentada | 78,09% | 78,09% | No se afirma un aumento inexistente |
| Cobertura JS final de líneas | No medida | 98,48% | Suite nueva; no se compara con cero |
| Cobertura JS de ramas | No medida | 84,61% | Umbral 60% superado |
| Cobertura JS de funciones | No medida | 100% | Umbral 60% superado |
| Bloques duplicados jscpd | 4 | 0 | 52 líneas repetidas eliminadas |
| Duplicación jscpd | 4,51% | 0% | Mismos mínimos de detección |
| Archivos JS fuera de formato | 3 | 0 | Prettier aplicado |
| Errores ESLint | 0 | 0 | Se sostiene el gate |
| Etapas CI configuradas | 0 | 4 | Ejecución remota requiere publicación |

## Cambio de mantenibilidad

`requestContact` centraliza URL, nonce, cookies, caché, JSON y errores. Antes se repetían en lectura, creación, modificación y eliminación. Las regresiones verifican tanto enlaces simples (`rest_route`) como permanentes. jscpd encuentra cero duplicados con los parámetros establecidos; no significa que no exista ninguna similitud de código.

## Evidencia y límites

Las cifras anteriores son ejecuciones locales reales. Ver `evidencias/metricas-finales.json`, los resultados JUnit y capturas. Los porcentajes dependen del alcance especificado en el SQA Plan. No se han medido bugs, vulnerabilidades ni code smells con SonarCloud, por lo que no se presentan como cero. El linter y la detección de duplicación son la variante local seleccionada.

La publicación en GitHub, la ejecución remota y la protección de rama deben demostrarse con enlaces/capturas reales. Un archivo workflow por sí solo no prueba que se hayan activado esas protecciones. El video final requiere narración del estudiante y evidencia del PR.
