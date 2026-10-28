# Manual de uso

1. Abrir la página de WordPress con el shortcode `[mis_contactos]`.
2. Elegir Crear una cuenta; completar nombre, usuario, correo y contraseña con confirmación. La contraseña admite 8 a 72 bytes.
3. Al ingresar, elegir Agregar contacto. Nombre, teléfono y teléfono 2 son obligatorios; cada teléfono debe contener al menos 7 dígitos. Correo y dirección son opcionales.
4. Guardar. El contacto aparece en la lista privada.
5. Buscar por nombre o cualquiera de los teléfonos. Vaciar la búsqueda para ver todos.
6. Editar abre el formulario con el contacto seleccionado; Guardar actualiza sus datos. Cancelar descarta el formulario.
7. Eliminar solicita confirmación. Esta operación borra el contacto; verificar el nombre antes de confirmar.
8. Cerrar sesión al terminar. Otro usuario no puede consultar los contactos de esta cuenta.
9. El clima inicia en Ciudad de Guatemala. Buscar otra ciudad y seleccionarla para actualizarlo. Si la red falla, usar Actualizar clima.

## Postman

Importar `tests/postman/agenda.postman_collection.json`. La variable de colección `baseUrl` apunta a `http://127.0.0.1:8080`. Ejecutar la colección completa en orden, una iteración. No mezclar un environment que reemplace sus variables. El runner obtiene nonce, registra un usuario ficticio, conserva cookies, crea/consulta/busca/edita/borra un contacto y cierra sesión. Resultado esperado: 13 solicitudes y 19 aserciones sin fallos. Los usuarios ficticios quedan en la base desechable; no ejecutar en producción.

Capturar la pantalla de resultados con nombre de colección, Passed/Failed y solicitudes visibles. No recrear resultados mediante imágenes dibujadas. Evitar mostrar cookies o datos reales.
