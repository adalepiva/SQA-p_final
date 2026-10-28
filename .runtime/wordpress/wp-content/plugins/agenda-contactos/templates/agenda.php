<?php defined('ABSPATH') || exit; ?>
<section class="agenda-contactos" data-agenda data-url="<?php echo esc_url(rest_url('agenda/v1/contactos')); ?>" data-nonce="<?php echo esc_attr(wp_create_nonce('wp_rest')); ?>">
    <p>Hola, <?php echo esc_html(wp_get_current_user()->display_name); ?>. Estos son tus contactos personales.</p>
    <button type="button" data-agenda-logout data-url="<?php echo esc_url(rest_url('agenda/v1/logout')); ?>" data-nonce="<?php echo esc_attr(wp_create_nonce('wp_rest')); ?>">Cerrar sesión</button>
    <div data-message role="status" aria-live="polite" hidden></div>
    <form data-search class="agenda-toolbar">
        <label>Buscar por nombre o teléfono <input name="buscar" type="search" maxlength="100"></label>
        <button type="submit">Buscar</button>
        <button type="button" data-new>Agregar contacto</button>
    </form>
    <form data-editor class="agenda-editor" hidden>
        <h3 data-heading>Nuevo contacto</h3>
        <label>Nombre * <input name="nombre" maxlength="100" required></label>
        <label>Teléfono * <input name="telefono" type="tel" minlength="7" maxlength="20" required></label>
        <label>Teléfono 2 * <input name="telefono2" type="tel" minlength="7" maxlength="20" required></label>
        <label>Correo <input name="email" type="email" maxlength="100"></label>
        <label>Dirección <textarea name="direccion" maxlength="5000" rows="2"></textarea></label>
        <div><button type="submit">Guardar</button> <button type="button" data-cancel>Cancelar</button></div>
    </form>
    <div data-list aria-live="polite">Cargando contactos…</div>
    <noscript>Activa JavaScript para utilizar la agenda.</noscript>
</section>
