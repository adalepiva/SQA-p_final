<?php defined('ABSPATH') || exit; ?>
<section class="agenda-contactos" data-auth data-login="<?php echo esc_url(rest_url('agenda/v1/login')); ?>" data-registro="<?php echo esc_url(rest_url('agenda/v1/registro')); ?>" data-nonce="<?php echo esc_attr(wp_create_nonce('agenda_auth')); ?>">
    <div data-message role="status" aria-live="polite" hidden></div>
    <form data-login-form class="agenda-editor">
        <h2>Iniciar sesión</h2>
        <label>Usuario o correo <input name="usuario" autocomplete="username" required></label>
        <label>Contraseña <input name="password" type="password" autocomplete="current-password" required></label>
        <button type="submit">Ingresar</button>
        <button type="button" data-show-register>Crear una cuenta</button>
        <a href="<?php echo esc_url(wp_lostpassword_url(get_permalink())); ?>">¿Olvidaste tu contraseña?</a>
    </form>
    <form data-register-form class="agenda-editor" hidden>
        <h2>Crear cuenta</h2>
        <label>Nombre <input name="nombre" autocomplete="name" maxlength="100" required></label>
        <label>Usuario <input name="usuario" autocomplete="username" pattern="[a-zA-Z0-9_.\-]{3,60}" minlength="3" maxlength="60" required></label>
        <label>Correo <input name="email" type="email" autocomplete="email" maxlength="100" required></label>
        <label>Contraseña <input name="password" type="password" autocomplete="new-password" minlength="8" maxlength="72" required></label>
        <label>Confirmar contraseña <input name="confirm_password" type="password" autocomplete="new-password" minlength="8" maxlength="72" required></label>
        <button type="submit">Registrarme</button>
        <button type="button" data-show-login>Ya tengo una cuenta</button>
    </form>
    <noscript>Activa JavaScript para iniciar sesión o registrarte.</noscript>
</section>
