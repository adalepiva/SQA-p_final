# Instalación en producción

## 1. Preparar el sitio

1. Entra a https://TU-DOMINIO/wp-admin/ como administrador.
2. Respalda los archivos y la base de datos actuales del hosting.
3. Comprueba PHP 8.0 o posterior y WordPress 6.0 o posterior.
4. Usa HTTPS. Verifica que la dirección de WordPress y del sitio correspondan al dominio de producción.

## 2. Instalar el plugin

1. Abre Plugins → Añadir nuevo plugin → Subir plugin.
2. Selecciona `dist/agenda-contactos-1.2.0.zip` de esta entrega.
3. Pulsa Instalar ahora. Si existe Agenda de contactos, elige reemplazar la versión actual.
4. Activa Agenda de contactos. Si estás actualizando un plugin que ya estaba activo, comprueba que siga activo.
5. Verifica que se muestre la versión 1.2.0 en Plugins.

No subas el ZIP del proyecto completo al instalador. Solo el ZIP indicado arriba contiene la estructura de un plugin.
La activación crea la tabla con el prefijo del WordPress de destino. No hay que importar SQL ni cambiar credenciales de base de datos en este plugin.

## 3. Crear la página (elige una sola opción)

### Opción A: manual, recomendada

1. Ve a Páginas → Añadir nueva.
2. Pon el título Mis contactos.
3. Añade un bloque Shortcode y escribe `[mis_contactos]`.
4. Publica la página y abre su enlace.

Si la página ya existe, edítala y comprueba que tenga el shortcode una sola vez; no crees un duplicado.
También puedes pegar el contenido de `pagina/mis-contactos.html` en el editor de código de una página nueva.

### Opción B: importar la plantilla XML

1. Ve a Herramientas → Importar → WordPress.
2. Instala y ejecuta el importador si hace falta.
3. Sube `pagina/mis-contactos.xml`.
4. Asigna el autor importado a tu administrador existente. No necesitas crear otra cuenta.
5. No hay archivos adjuntos para descargar.
6. Completa la importación y comprueba en Páginas que Mis contactos esté publicada.

El XML es una plantilla de una sola página; no importa usuarios con contraseñas, contactos, menús, ajustes del tema ni la configuración de inicio. Sus URLs de ejemplo no se utilizan para las llamadas de la agenda: estas se generan desde WordPress.

## 4. Configurar la navegación

- Para usarla como portada: Ajustes → Lectura → Una página estática → Página de inicio: Mis contactos → Guardar.
- Para conservar la portada: agrega un enlace a Mis contactos en el menú de navegación de tu tema.
- Si la página devuelve 404, entra en Ajustes → Enlaces permanentes y pulsa Guardar cambios.

## 5. Caché y cuentas

1. Excluye la página Mis contactos de la caché de página completa del hosting o plugin de caché. Si es la portada, excluye también esa URL.
2. No almacenes en caché las rutas de autenticación y contactos de `/wp-json/agenda/v1/` (ni sus equivalentes `?rest_route=`).
3. Limpia la caché del sitio después de actualizar.
4. Crea las cuentas desde Crear una cuenta en la agenda o desde Usuarios en WordPress.
5. Cada cuenta solo ve sus propios contactos. Un administrador tampoco ve contactos de otras cuentas en esta agenda.
6. Configura el correo de WordPress si necesitas recuperación de contraseñas.

El registro público de la agenda está habilitado por el plugin y crea suscriptores; no depende del ajuste general de registro de WordPress. No se importan cuentas ni datos locales. No reutilices contraseñas de pruebas.

## 6. Comprobación final

1. Abre la página en incógnito: deben verse el clima y el formulario de acceso.
2. Busca una ciudad, selecciónala y pulsa Actualizar clima.
3. Crea una cuenta; verifica que entre a la agenda y que el clima siga visible.
4. Agrega un contacto con nombre y dos teléfonos obligatorios. El correo y la dirección son opcionales.
5. Busca el contacto, edítalo y comprueba que los cambios se guardan.
6. Cierra sesión y entra otra vez: el contacto debe conservarse.
7. Prueba con una segunda cuenta y confirma que no ve el contacto de la primera.
8. Elimina el contacto de prueba desde la primera cuenta y cierra sesión.
9. Comprueba en un teléfono o una ventana estrecha que los formularios y el clima se adapten.

Si falla Open-Meteo, se muestra un mensaje de reintento; el acceso y los contactos siguen disponibles.

## Solución de problemas

- Error de conexión con la base de datos: revisa la configuración de WordPress con el hosting; el plugin usa esa conexión.
- Aparece el shortcode como texto: activa el plugin y utiliza el bloque Shortcode.
- Error de nonce o sesión: excluye la página de caché, limpia la caché y recarga.
- El clima no carga: revisa Internet, bloqueadores y la política CSP del sitio. Las peticiones externas no llevan cookies de WordPress ni datos de contactos.
- El registro devuelve 429: espera 15 minutos sin nuevos intentos desde esa IP. El límite es de 15 intentos por operación.

Para volver a una versión anterior, restaura el ZIP anterior y, si procede, el respaldo del sitio. Desactivar el plugin no elimina sus contactos.
