# desa_Agenda_Proyecto2

Versión de entrega: **Agenda de contactos 1.2.0**.

Proyecto para instalar en un WordPress existente. Incluye agenda privada por usuario, registro e inicio/cierre de sesión, creación, búsqueda, edición y eliminación de contactos, API REST y clima Open-Meteo visible antes y después del acceso.

## Archivos que debes utilizar

- `dist/agenda-contactos-1.2.0.zip`: plugin instalable desde WordPress. Este es el ZIP que debes subir en Plugins.
- `pagina/mis-contactos.xml`: plantilla de importación WXR que crea únicamente la página Mis contactos con el shortcode. No contiene cuentas ni contactos locales.
- `pagina/mis-contactos.html`: contenido de bloques para crear la página manualmente como alternativa al XML.
- `INSTALACION-PRODUCCION.md`: pasos de instalación y verificación.
- `agenda-contactos/`: código fuente completo del plugin.
- `tests/`: pruebas automáticas sin dependencias de WordPress real.
- `VALIDACION.md`: alcance y resultados de la verificación de esta entrega.
- `SHA256SUMS.txt`: hashes de los archivos entregados, excluyendo este manifiesto.

Se conserva el nombre interno `agenda-contactos` para actualizar instalaciones anteriores. El proyecto se llama desa_Agenda_Proyecto2, pero no debes renombrar la carpeta interna del plugin.

Requisitos: WordPress 6.0 o posterior, PHP 8.0 o posterior y la base de datos de WordPress funcionando. El hosting debe permitir instalar plugins. El clima necesita acceso desde el navegador a api.open-meteo.com y geocoding-api.open-meteo.com. Si existe una política CSP, autoriza estos dominios en connect-src.

La entrega no incluye WordPress, temas, configuración del hosting, claves, usuarios ni una copia de la base de datos. Una instalación nueva comienza sin contactos. Una actualización conserva los datos existentes: no vacía producción.

El clima utiliza la API pública de Open-Meteo; para un uso comercial revisa su licencia y condiciones en https://open-meteo.com/en/terms y https://open-meteo.com/en/pricing. REST Countries no forma parte de esta entrega.

La apariencia exterior de la página depende del tema del WordPress de destino. Los formularios y el clima incluyen sus propios estilos.
