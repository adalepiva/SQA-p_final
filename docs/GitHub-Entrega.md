# GitHub, revisión y entrega

Repositorio destino: https://github.com/adalepiva/SQA-proyecto-final

## Publicación con GitHub Desktop

Agregar la carpeta raíz como repositorio local mediante File → Add local repository. Si aún no es repositorio, crearlo aquí con rama main. Revisar cambios; `.runtime`, node_modules, reports y coverage deben quedar excluidos. Confirmar fuente, pruebas, docs, package-lock y workflow. Configurar origin con el repositorio destino y Push origin. No crear otro repositorio por error.

La sesión de GitHub Desktop no garantiza que el Git de terminal tenga credenciales; si la terminal solicita autenticación, usar Desktop o completar personalmente el inicio de sesión. No pegar tokens en el chat.

## Protección obligatoria de main

Después de la primera ejecución, abrir Settings → Branches o Rulesets y crear una regla para `main`:

- Require a pull request before merging.
- Require status checks to pass: seleccionar `report` del workflow SQA CI (ver nombre exacto que GitHub muestre).
- Require branches to be up to date.
- Require conversation resolution.
- Bloquear force pushes y eliminación de main.
- Incluir administradores o no permitir bypass habitual.
- Una aprobación humana si hay docente/colaborador disponible; el autor no puede autoaprobarse.

Guardar captura de la regla activa. La disponibilidad depende de la visibilidad y plan de GitHub. No considerar protegida la rama mientras la regla no esté guardada. [Referencia oficial](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Demostración de rechazo y recuperación

1. Crear rama `demo/quality-gate`.
2. Agregar temporalmente `console.log(variableNoDefinida);` al final de un archivo JS productivo, confirmar y abrir PR.
3. Mostrar el fallo de test/lint y el bloqueo del merge. No fusionar ese cambio.
4. Eliminar esa línea en la misma rama, confirmar y hacer push.
5. Mostrar nueva ejecución aprobada, reportes y revisión humana antes de merge.

Para demostrar específicamente cobertura, subir temporalmente el umbral de ramas a 100 en una rama de demostración: el 84,61% actual debe rechazarla. Restaurar el umbral aprobado de 60 antes de integrar. No editar resultados ni ocultar ejecuciones fallidas.

## Evidencias requeridas para cierre

- URL de ejecución Actions aprobada y rechazada.
- Captura del grafo build/test/analyze/report.
- PR con checks y revisión.
- Regla de protección guardada.
- Postman: resumen y solicitudes con sus assertions.
- Dashboard HTML real o Sonar si se conecta.
- Video MP4 narrado por el estudiante, 720p o más, 4 a 5 minutos.

Las capturas locales de Postman no reemplazan la evidencia de GitHub. La presentación debe actualizarse cuando se disponga de las capturas remotas.
