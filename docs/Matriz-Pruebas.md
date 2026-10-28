# Matriz de pruebas

Ejecución local del 27/10/2026. Resultado obtenido no equivale a ejecución remota de Actions. Los casos PHP agrupan las 77 aserciones del archivo existente; integración tiene 12 comprobaciones y frontend 10 casos (F04 se ejecuta en dos variantes).

| ID | Tipo / requisito | Entrada / acción | Resultado esperado | Obtenido |
|---|---|---|---|---|
| P01 | Unitaria, autorización | Anónimo; usuario sin read; usuario con read | 401; 403; true | Aprobado |
| P02 | Unitaria, contrato JSON | Tipo incorrecto, JSON roto, array, null, texto | 415 / 400 | Aprobado |
| P03 | Unitaria, validación | Requeridos vacíos/arrays y límites excedidos | 422 | Aprobado |
| P04 | Unitaria, teléfono/correo | Teléfono corto o letras; correo inválido | 422 | Aprobado |
| P05 | Regresión, propietario | Crear con usuario_id ajeno | Ignorar valor y usar usuario actual | Aprobado |
| P06 | Regresión, Unicode | Nombre de 100 caracteres acentuados | 201 | Aprobado |
| P07 | Regresión, idempotencia | PUT con datos sin cambios | 200, sin error de BD | Aprobado |
| P08 | Unitaria, errores BD | Dobles retornan false / last_error | 500 sin exponer SQL | Aprobado |
| P09 | Regresión, búsqueda | Comodines % y _ | Escape y tres campos de búsqueda | Aprobado |
| P10 | Unitaria, nonce/origen | Nonce ausente; origen ajeno; origen con puerto correcto | 403; 403; permitido | Aprobado |
| P11 | Regresión, login | Login por correo, password intacta | 200 y credenciales correctas | Aprobado |
| P12 | Unitaria, limitación | 16 intentos válidos estructuralmente | Intento 16: 429, ventana 900 s | Aprobado |
| P13 | Regresión, registro | Duplicado; rol administrator inyectado | 409; rol subscriber fijo | Aprobado |
| P14 | Regresión, logout | Sesión activa | Sesión cerrada y 200 | Aprobado |
| F01 | Frontend, XSS/privacidad | Nombre con etiqueta img | Texto literal, nonce y no-store | Aprobado |
| F02 | Frontend, búsqueda | Texto con espacios, respuesta vacía | Query trim y mensaje vacío | Aprobado |
| F03 | Frontend, creación | Submit del formulario | POST, limpieza, recarga y mensaje | Aprobado |
| F04a | Frontend/regresión | Editar y borrar con rest_route | ID correcto, PUT/DELETE | Aprobado |
| F04b | Frontend/regresión | Editar y borrar con wp-json | ID correcto, PUT/DELETE | Aprobado |
| F05 | Frontend, recuperación | Red falla, reintento, cancelación | Botones disponibles, sin DELETE al cancelar | Aprobado |
| F06 | Frontend, error HTTP | Guardado con 422 | Mostrar error y conservar editor | Aprobado |
| F07 | Frontend, autenticación | Alternar formularios, error login/registro/logout | Vista y errores correctos | Aprobado |
| F08 | Frontend, clima | Respuesta válida, buscar ciudad, seleccionar | Temperatura, ubicación y refresco | Aprobado |
| F09 | Frontend, red externa | Error HTTP y respuesta incompleta | Aviso y botones recuperados | Aprobado |
| I01 | Integración | Crear dos usuarios WordPress reales | Usuarios válidos | Aprobado |
| I02 | Integración, autorización | REST GET sin sesión | 401 | Aprobado |
| I03 | Integración, persistencia | POST y GET con usuario A | 201 y dato almacenado en MySQL | Aprobado |
| I04 | Integración, privacidad | B intenta GET/PUT/DELETE de A | Tres respuestas 404 | Aprobado |
| I05 | Integración, privacidad | Listar como B | Lista vacía | Aprobado |
| I06 | Integración, actualización | PUT como A | Nombre persistido | Aprobado |
| I07 | Integración, validación | POST incompleto | 422 | Aprobado |
| I08 | Integración/regresión | DELETE y GET posterior | 200 y 404 | Aprobado |
| E01 | E2E HTTP | GET anónimo | 401 | Aprobado |
| E02 | E2E HTTP | Página de acceso | 200 y nonce | Aprobado |
| E03 | E2E HTTP | Registro ficticio | 201 y cookies | Aprobado |
| E04 | E2E HTTP | Página con cookies | 200 y nonce de sesión | Aprobado |
| E05 | E2E HTTP | Contacto incompleto | 422 | Aprobado |
| E06 | E2E HTTP | Crear Ana E2E | 201 e ID numérico | Aprobado |
| E07 | E2E HTTP | Leer ID creado | 200 y nombre correcto | Aprobado |
| E08 | E2E HTTP | Buscar Ana | 200, contiene ID creado | Aprobado |
| E09 | E2E HTTP | Cambiar nombre | 200 y nombre actualizado | Aprobado |
| E10 | E2E HTTP | Eliminar ID | 200 | Aprobado |
| E11 | E2E/regresión | Leer ID borrado | 404 | Aprobado |
| E12 | E2E HTTP | Cerrar sesión | 200 | Aprobado |
| E13 | E2E HTTP | Listar tras logout | 401 | Aprobado |

Archivos ejecutables: `tests/frontend/`, `tests/integration/wordpress.php`, `tests/postman/agenda.postman_collection.json` y `desa_Agenda_Proyecto2/tests/php-regression.php`. Evidencia de Newman: 13 requests, 19 assertions, 0 failed. Las capturas de Postman complementan los reportes y deben corresponder a la misma colección.
