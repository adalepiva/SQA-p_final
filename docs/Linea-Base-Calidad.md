# Línea base de calidad

Medición: 27/10/2026, America/Guatemala. Base: `desa_Agenda_Proyecto2.zip`, SHA256 `AE9C2D3B32AD25AEA47804F972CE7E21ED1F66C430CFB1C3E52251DA1B28919B`. Se conserva el ZIP para poder repetir la medición sobre el código anterior.

| Indicador inicial | Resultado | Método |
|---|---:|---|
| Comprobaciones PHP existentes | 77 aprobadas | php-regression.php |
| Suite automatizada del frontend | No existía | Inspección de archivos |
| Integración con WordPress/MySQL real | No incluida | Pruebas originales usan dobles |
| Colección Postman de esta agenda | No incluida | Inspección |
| Workflow CI | No incluido | Inspección |
| Configuración de cobertura/gate | No incluida | Inspección |
| Cobertura PHP medida al instrumentar la base | 78,09% (196/251) | Xdebug, antes de cambiar código |
| Duplicación inicial | 4,51%, 52 líneas, 4 bloques | jscpd, min-lines 8, min-tokens 70 |
| Archivos JS no conformes a Prettier | 3 | Primera ejecución de prettier --check |
| Errores ESLint | 0 | Primera ejecución del linter configurado |
| Bugs/vulnerabilidades Sonar | No medidos | Servicio no conectado |

La cobertura era desconocida en la entrega original: **no era 0%**. El 78,09% se midió durante la intervención aplicando instrumentación al código original y su suite, antes de modificar comportamiento. La base ya contenía validaciones y regresiones; no se atribuyen esos logros al nuevo pipeline.

Evidencia: `evidencias/duplicacion-antes.json` y `evidencias/cobertura-php-antes-instrumentada.json`. Mantener las mismas reglas al comparar. El formato modifica el total de líneas; por eso también se compara el número absoluto de bloques duplicados.
