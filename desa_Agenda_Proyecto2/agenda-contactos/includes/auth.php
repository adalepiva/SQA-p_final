<?php
defined('ABSPATH') || exit;

final class Agenda_Auth {
    public static function routes() {
        foreach (['login', 'registro', 'logout'] as $action) {
            register_rest_route('agenda/v1', '/' . $action, [
                'methods' => 'POST',
                'callback' => [self::class, $action],
                'permission_callback' => $action === 'logout' ? ['Agenda_Contactos', 'permission'] : [self::class, 'guest_permission'],
            ]);
        }
    }

    public static function guest_permission($request) {
        if (!wp_verify_nonce($request->get_header('X-Agenda-Nonce'), 'agenda_auth')) {
            return new WP_Error('agenda_nonce', 'Recarga la página e intenta nuevamente.', ['status' => 403]);
        }
        // Impide enviar credenciales o registrar cuentas desde otro sitio.
        $origin = $request->get_header('origin');
        $site = wp_parse_url(home_url());
        $expected_origin = $site['scheme'] . '://' . $site['host'] . (isset($site['port']) ? ':' . $site['port'] : '');
        if ($origin && rtrim($origin, '/') !== $expected_origin) {
            return new WP_Error('agenda_origen', 'Origen no permitido.', ['status' => 403]);
        }
        return true;
    }

    private static function error($message, $status = 422) {
        return new WP_Error('agenda_auth', $message, ['status' => $status]);
    }

    private static function validate_body($request) {
        if (!$request->is_json_content_type()) {
            return self::error('Envía application/json.', 415);
        }
        $fields = json_decode($request->get_body());
        if (!is_object($fields)) {
            return self::error('Se esperaba un objeto JSON.', 400);
        }
        foreach ((array) $fields as $value) {
            if (!is_string($value)) {
                return self::error('Los campos deben ser texto.');
            }
        }
        return (array) $fields;
    }

    private static function rate_limit($action) {
        $transient_key = 'agenda_' . $action . '_' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'local');
        $attempt_count = (int) get_transient($transient_key);
        if ($attempt_count >= 15) {
            return self::error('Demasiados intentos. Espera 15 minutos.', 429);
        }
        // Cada intento aceptado renueva la ventana de 15 minutos de esta IP y operación.
        set_transient($transient_key, $attempt_count + 1, 15 * MINUTE_IN_SECONDS);
        return true;
    }

    public static function login($request) {
        $fields = self::validate_body($request);
        if (is_wp_error($fields)) {
            return $fields;
        }
        $rate_limit_result = self::rate_limit('login');
        if (is_wp_error($rate_limit_result)) {
            return $rate_limit_result;
        }
        $username = trim($fields['usuario'] ?? '');
        $password = $fields['password'] ?? '';
        if (!$username || !$password || strlen($password) > 4096) {
            return self::error('Completa el usuario y la contraseña.');
        }
        $credentials = [
            'user_login' => $username,
            'user_password' => $password,
            'remember' => false,
        ];
        $user = wp_signon($credentials, is_ssl());
        if (is_wp_error($user)) {
            return self::error('Usuario o contraseña incorrectos.', 401);
        }
        wp_set_current_user($user->ID);
        return new WP_REST_Response(['ok' => true, 'data' => ['mensaje' => 'Sesión iniciada.']]);
    }

    public static function registro($request) {
        $fields = self::validate_body($request);
        if (is_wp_error($fields)) {
            return $fields;
        }
        $rate_limit_result = self::rate_limit('registro');
        if (is_wp_error($rate_limit_result)) {
            return $rate_limit_result;
        }
        $display_name = sanitize_text_field($fields['nombre'] ?? '');
        $username = trim($fields['usuario'] ?? '');
        $email = trim($fields['email'] ?? '');
        $password = $fields['password'] ?? '';
        if ($display_name === '' || strlen($display_name) > 250) {
            return self::error('Ingresa un nombre válido (máximo 250 bytes).');
        }
        if (!preg_match('/^[a-zA-Z0-9_.-]{3,60}$/', $username)) {
            return self::error('El usuario debe tener entre 3 y 60 caracteres: letras, números, punto, guion o guion bajo.');
        }
        if (!is_email($email) || strlen($email) > 100) {
            return self::error('Ingresa un correo válido de hasta 100 caracteres.');
        }
        if (strlen($password) < 8 || strlen($password) > 72) {
            return self::error('La contraseña debe tener entre 8 y 72 bytes.');
        }
        if ($password !== ($fields['confirm_password'] ?? '')) {
            return self::error('Las contraseñas no coinciden.');
        }
        if (username_exists($username) || email_exists($email)) {
            return self::error('El usuario o correo ya está registrado.', 409);
        }
        $user_id = wp_insert_user([
            'user_login' => $username,
            'display_name' => $display_name,
            'user_email' => $email,
            'user_pass' => $password,
            // El cliente no puede elegir un rol con más permisos.
            'role' => 'subscriber',
        ]);
        if (is_wp_error($user_id)) {
            return self::error('No se pudo crear la cuenta.', 500);
        }
        wp_set_current_user($user_id);
        wp_set_auth_cookie($user_id, false, is_ssl());
        return new WP_REST_Response(['ok' => true, 'data' => ['mensaje' => 'Cuenta creada.']], 201);
    }

    public static function logout() {
        wp_logout();
        return new WP_REST_Response(['ok' => true, 'data' => ['mensaje' => 'Sesión cerrada.']]);
    }
}
add_action('rest_api_init', ['Agenda_Auth', 'routes']);
