# Validación de la entrega 1.2.0

Fecha: 26 de octubre de 2026.

## Comprobaciones realizadas

- 77 comprobaciones PHP aprobadas con dobles de WordPress y base de datos: permisos, validación, aislamiento por propietario, CRUD y autenticación.
- 8 pruebas JavaScript aprobadas: CRUD, formatos de URL, búsqueda, login, registro, logout, clima, elección de ciudad, fallos de conexión y reintentos.
- Sintaxis válida de los 5 archivos PHP y los 3 archivos JavaScript.
- Plantilla XML válida con una sola página de tipo page y el shortcode de la agenda.
- Código PHP y JavaScript sin dominios localhost ni rutas locales del desarrollador.
- Versión del plugin y versiones de los recursos actualizadas a 1.2.0.
- ZIP instalable comprobado contra los archivos fuente por contenido; incluye la carpeta raíz agenda-contactos y los recursos del clima.

## Alcance

Las pruebas automáticas no ejecutan un WordPress real ni prueban un hosting de producción. En el momento de preparar esta entrega no se detectaron Apache ni MySQL ejecutándose en el entorno local; por ello no se realizó una nueva prueba de instalación, importación XML o revisión visual sobre WordPress real. La plantilla XML se validó estructuralmente; la opción manual de crear la página con el shortcode no requiere importador.

Antes de dar el sitio por publicado, completar el recorrido de comprobación de INSTALACION-PRODUCCION.md en el hosting. La disponibilidad de Open-Meteo, la configuración de correo, la caché y el tema dependen del entorno de destino.

## Repetir las pruebas desde esta carpeta

```powershell
php tests/php-regression.php
node tests/frontend.test.cjs
```

PHP debe estar disponible en PATH; de lo contrario, usar la ruta al ejecutable PHP instalado. Node.js solo se necesita para las pruebas, no para ejecutar el plugin en WordPress.
