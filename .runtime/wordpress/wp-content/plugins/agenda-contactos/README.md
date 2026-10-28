# Agenda de contactos 1.2.0

Plugin de WordPress con agenda privada por usuario, CRUD y API REST JSON.

## Uso

1. Activar **Agenda de contactos** en Plugins.
2. Iniciar sesión con una cuenta de WordPress (administrador o suscriptor).
3. Abrir **Mis contactos** en el panel. También se puede insertar `[mis_contactos]` en una página.

La página con `[mis_contactos]` ofrece **Iniciar sesión** y **Crear una cuenta** a visitantes. El registro pide nombre, usuario, correo y contraseña confirmada (8 a 72 bytes), crea una cuenta de WordPress con rol fijo **Suscriptor** e inicia sesión automáticamente. El acceso admite usuario o correo. Dentro de la agenda aparece **Cerrar sesión**. Cada cuenta ve únicamente sus contactos; tampoco un administrador ve los contactos de otros usuarios en esta agenda.

El registro público se ofrece a través del plugin sin cambiar la opción global de registro de WordPress. El administrador también puede crear usuarios desde **Usuarios → Añadir nuevo**. La recuperación de contraseña utiliza WordPress y necesita envío de correo configurado en el servidor; el registro no verifica la propiedad del correo.

## Clima en el inicio

Open-Meteo aparece encima del acceso y de la agenda de usuarios autenticados. Muestra inicialmente Ciudad de Guatemala y permite buscar y seleccionar otra ciudad, consultar temperatura, sensación térmica, humedad y viento, y actualizar o reintentar. No solicita ubicación del dispositivo ni comparte datos de contactos; el navegador consulta directamente las coordenadas y el nombre de ciudad buscado. Requiere conexión a Internet. Los fallos del clima no bloquean el acceso ni la agenda.

La plantilla `templates/weather.php` y el script independiente `assets/weather.js` se cargan desde el shortcode. Documentación: https://open-meteo.com/en/docs y https://open-meteo.com/en/docs/geocoding-api. REST Countries no se incluye por decisión del usuario al requerir una clave para v5.

## Rutas de contactos y autenticación

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/wp-json/agenda/v1/contactos?buscar=texto` | Listar o buscar por nombre o cualquiera de los dos teléfonos |
| POST | `/wp-json/agenda/v1/contactos` | Crear |
| GET | `/wp-json/agenda/v1/contactos/123` | Leer uno |
| PUT | `/wp-json/agenda/v1/contactos/123` | Reemplazar los campos editables |
| DELETE | `/wp-json/agenda/v1/contactos/123` | Eliminar |
| POST | `/wp-json/agenda/v1/registro` | Crear un suscriptor e iniciar sesión |
| POST | `/wp-json/agenda/v1/login` | Iniciar sesión con usuario o correo |
| POST | `/wp-json/agenda/v1/logout` | Cerrar sesión |

En instalaciones con enlaces simples, WordPress utiliza `?rest_route=/agenda/v1/contactos` y `&buscar=texto`. La interfaz obtiene la URL mediante `rest_url()` y funciona con ambas modalidades, en subcarpetas y al migrar el dominio.

POST y PUT requieren `Content-Type: application/json`:

```json
{"nombre":"Ana","telefono":"12345678","telefono2":"87654321","email":"ana@example.com","direccion":"Ciudad"}
```

Nombre y ambos teléfonos son obligatorios. Correo y dirección son opcionales y se vacían si se omiten en PUT. Nombre y correo: máximo 100 caracteres; teléfonos: máximo 20 y mínimo 7 dígitos; dirección: máximo 5000. Los datos se validan y se limpian en el servidor.

Éxito: `{"ok":true,"data":...}`; listado devuelve un arreglo, lectura/creación/edición un contacto. Crear devuelve HTTP 201; las demás operaciones 200. PUT sin cambios también devuelve 200.

Los errores conservan el formato estándar de WordPress: `{"code":"...","message":"...","data":{"status":422}}`. Códigos principales: 400 JSON incorrecto, 401 sin sesión, 403 nonce/permisos inválidos, 404 contacto inexistente o ajeno, 415 tipo de contenido, 422 validaciones y 500 error de base de datos.

La interfaz usa cookies de WordPress y `X-WP-Nonce` generado con `wp_create_nonce('wp_rest')` en todas las solicitudes. Abrir una ruta privada directamente sin nonce no equivale a probar la interfaz: puede devolver 401 aun estando conectado. Para inspeccionar el CRUD usar la pestaña Red del navegador dentro de Mis contactos. Para integraciones externas se pueden utilizar las contraseñas de aplicación de WordPress sobre HTTPS cuando estén habilitadas.

Excepción para visitantes: login y registro envían `X-Agenda-Nonce` con el nonce `agenda_auth` de la página; también se comprueba el origen de la petición. Login recibe `usuario` y `password`. Registro recibe `nombre`, `usuario`, `email`, `password` y `confirm_password`. Logout requiere el nonce REST habitual. Cada operación de login/registro admite 15 intentos por IP en una ventana que se renueva con los intentos; el límite devuelve 429 y se libera tras 15 minutos sin intentos aceptados por el limitador. Las páginas de agenda envían cabeceras que evitan caché; las herramientas de caché externas deben respetarlas.

## Datos y migración

- La activación crea `${prefijo}agenda_contactos` con `dbDelta`; no modifica `db_contactos` del proyecto PHP anterior.
- Se utiliza el ID del usuario autenticado; los parámetros recibidos no permiten cambiar el propietario.
- Al borrar un usuario de WordPress se eliminan sus contactos.
- Desactivar o eliminar el plugin conserva su tabla; no incluye un borrado automático de datos.
- La migración al hosting requiere el plugin, su tabla y las cuentas de WordPress relacionadas. No contiene direcciones localhost fijas ni credenciales de base de datos.
- Excluir la página de la agenda de cachés de página completa y mantener HTTPS en producción. Los endpoints envían `Cache-Control: private, no-store`.
- Esta versión está destinada a una instalación individual de WordPress; no implementa activación en red Multisite.

## Pruebas locales

Desde la carpeta que contiene `agenda-contactos/` y `tests/`:

```sh
php tests/php-regression.php
node tests/frontend.test.cjs
```

La primera prueba comprueba validaciones, permisos, consultas por propietario, errores y autenticación mediante dobles de WordPress y de la base de datos. La segunda ejecuta los scripts con un DOM y respuestas HTTP simulados para comprobar CRUD, búsqueda, edición, autenticación, errores y ambos formatos de URL. No requieren instalar dependencias. Estos dobles no sustituyen las pruebas con WordPress real ni una revisión visual en un navegador.

Las pruebas incluidas usan dobles de WordPress y respuestas HTTP simuladas. Para publicar, completa también la comprobación funcional descrita en ../INSTALACION-PRODUCCION.md.

## Guía para leer y modificar el código

| Archivo | Responsabilidad |
| --- | --- |
| `agenda-contactos.php` | Tabla, permisos, rutas REST de contactos, validación, CRUD, shortcode y hooks de WordPress. |
| `includes/auth.php` | Registro, login, logout, nonce de visitantes, origen y límite de intentos. |
| `templates/agenda.php` | Formularios y contenedor de la agenda. |
| `templates/auth.php` | Formularios de acceso y registro. |
| `assets/agenda.js` | Peticiones de contactos, tarjetas, editor y eventos de la agenda. |
| `assets/auth.js` | Cambio de formulario, envío de credenciales y cierre de sesión. |
| `assets/agenda.css` | Apariencia de formularios, tarjetas y mensajes. |

En la agenda, un evento llama a `runAction()`, que bloquea los botones y muestra los errores. Cada operación (`loadContacts()`, `editContact()`, `createContact()`, `updateContact()` y `deleteContact()`) contiene su propia URL y su propia llamada `fetch`, con el método HTTP, las cabeceras y el manejo de errores visibles. `saveContact()` elige entre crear y actualizar. No hay un constructor de URL ni una solicitud genérica compartidos. La URL base sigue llegando desde `rest_url()` de WordPress para conservar la compatibilidad con cambios de dominio, subcarpetas y enlaces simples o permanentes; el ID y la búsqueda se agregan dentro de la operación correspondiente. `createContactCard()` crea cada tarjeta; `showEditor()` y `closeEditor()` controlan el formulario. Cada instancia del shortcode mantiene su propio estado.

Las clases PHP conservan sus métodos públicos y los nombres de los campos de la API. La validación mantiene su orden porque determina qué error recibe el usuario cuando hay varios campos incorrectos. No unificar las validaciones de contactos y autenticación sin revisar sus diferencias: por ejemplo, autenticación rechaza cualquier campo que no sea texto, mientras que contactos solo valida sus campos conocidos.

También se conservan las unidades de los límites: los contactos cuentan caracteres Unicode, pero el registro limita nombre y contraseña en bytes. Las restricciones HTML no coinciden exactamente con todas las del servidor; esta refactorización conserva ambas. Las expresiones regulares de teléfonos, los nonces, la comprobación de origen, las consultas por propietario y los formatos de URL de WordPress mantienen sus reglas originales.
