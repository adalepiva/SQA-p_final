<?php
/**
 * Plugin Name: Agenda de contactos
 * Description: Agenda privada por usuario con CRUD, API REST JSON y shortcode [mis_contactos].
 * Version: 1.1.0
 * Requires PHP: 8.0
 * Requires at least: 6.0
 * Author: Emilio Pivaral
 * Text Domain: agenda-contactos
 */
defined('ABSPATH') || exit;
require_once __DIR__ . '/includes/auth.php';

final class Agenda_Contactos {
    public static function table() {
        global $wpdb;
        return $wpdb->prefix . 'agenda_contactos';
    }

    public static function activate() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $table = self::table();
        $charset = $wpdb->get_charset_collate();
        dbDelta("CREATE TABLE $table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            usuario_id bigint(20) unsigned NOT NULL,
            nombre varchar(100) NOT NULL,
            telefono varchar(20) NOT NULL,
            telefono2 varchar(20) NOT NULL,
            email varchar(100) NOT NULL DEFAULT '',
            direccion text NOT NULL,
            PRIMARY KEY  (id),
            KEY usuario_nombre (usuario_id,nombre)
        ) $charset;");
    }

    public static function permission() {
        if (!is_user_logged_in()) {
            return new WP_Error('agenda_sin_sesion', 'Debes iniciar sesión.', ['status' => 401]);
        }
        return current_user_can('read') ? true : new WP_Error('agenda_sin_permiso', 'No tienes permiso para utilizar la agenda.', ['status' => 403]);
    }

    public static function routes() {
        register_rest_route('agenda/v1', '/contactos', [
            ['methods' => 'GET', 'callback' => [self::class, 'listing'], 'permission_callback' => [self::class, 'permission']],
            ['methods' => 'POST', 'callback' => [self::class, 'create'], 'permission_callback' => [self::class, 'permission']],
        ]);
        register_rest_route('agenda/v1', '/contactos/(?P<id>[1-9][0-9]*)', [
            ['methods' => 'GET', 'callback' => [self::class, 'read'], 'permission_callback' => [self::class, 'permission']],
            ['methods' => 'PUT', 'callback' => [self::class, 'update'], 'permission_callback' => [self::class, 'permission']],
            ['methods' => 'DELETE', 'callback' => [self::class, 'delete'], 'permission_callback' => [self::class, 'permission']],
        ]);
    }

    private static function success($data, $status = 200) {
        return new WP_REST_Response(['ok' => true, 'data' => $data], $status, ['Cache-Control' => 'private, no-store']);
    }

    private static function missing() {
        return new WP_Error('agenda_no_encontrado', 'Contacto no encontrado.', ['status' => 404]);
    }

    private static function db_error() {
        return new WP_Error('agenda_error_bd', 'No se pudo completar la operación.', ['status' => 500]);
    }

    private static function find($id) {
        global $wpdb;
        $table = self::table();
        $row = $wpdb->get_row($wpdb->prepare("SELECT id, nombre, telefono, telefono2, email, direccion FROM $table WHERE id = %d AND usuario_id = %d", $id, get_current_user_id()), ARRAY_A);
        if ($wpdb->last_error) { return self::db_error(); }
        if (!$row) { return self::missing(); }
        $row['id'] = (int) $row['id'];
        return $row;
    }

    private static function body($request) {
        if (!$request->is_json_content_type()) {
            return new WP_Error('agenda_tipo_contenido', 'Envía application/json.', ['status' => 415]);
        }
        if (!is_object(json_decode($request->get_body()))) {
            return new WP_Error('agenda_json', 'Se esperaba un objeto JSON.', ['status' => 400]);
        }
        $body = $request->get_json_params();
        $contact = [];
        foreach (['nombre' => 100, 'telefono' => 20, 'telefono2' => 20, 'email' => 100, 'direccion' => 5000] as $key => $max) {
            $value = $body[$key] ?? '';
            if (!is_string($value)) {
                return new WP_Error('agenda_validacion', "El campo $key debe ser texto.", ['status' => 422]);
            }
            $value = $key === 'direccion' ? sanitize_textarea_field($value) : sanitize_text_field($value);
            $length = preg_match_all('/./us', $value);
            if ($length > $max || (in_array($key, ['nombre', 'telefono', 'telefono2'], true) && $value === '')) {
                return new WP_Error('agenda_validacion', "Revisa el campo $key (máximo $max caracteres).", ['status' => 422]);
            }
            $contact[$key] = $value;
        }
        foreach (['telefono', 'telefono2'] as $key) {
            if (!preg_match('/^[0-9+().\s-]+$/', $contact[$key]) || strlen(preg_replace('/\D/', '', $contact[$key])) < 7) {
                return new WP_Error('agenda_telefono', 'Cada teléfono debe contener al menos 7 dígitos y solo caracteres de teléfono.', ['status' => 422]);
            }
        }
        if ($contact['email'] !== '' && !is_email($contact['email'])) {
            return new WP_Error('agenda_email', 'Ingresa un correo electrónico válido.', ['status' => 422]);
        }
        return $contact;
    }

    public static function listing($request) {
        global $wpdb;
        $search = $request->get_param('buscar') ?? '';
        if (!is_string($search) || strlen($search) > 400) {
            return new WP_Error('agenda_busqueda', 'El texto de búsqueda no es válido.', ['status' => 422]);
        }
        $table = self::table();
        $sql = "SELECT id, nombre, telefono, telefono2, email, direccion FROM $table WHERE usuario_id = %d";
        $params = [get_current_user_id()];
        if (trim($search) !== '') {
            $sql .= ' AND (nombre LIKE %s OR telefono LIKE %s OR telefono2 LIKE %s)';
            $params = array_merge($params, array_fill(0, 3, '%' . $wpdb->esc_like(trim($search)) . '%'));
        }
        $rows = $wpdb->get_results($wpdb->prepare($sql . ' ORDER BY nombre, id', $params), ARRAY_A);
        if ($wpdb->last_error) { return self::db_error(); }
        foreach ($rows as &$row) { $row['id'] = (int) $row['id']; }
        return self::success($rows);
    }

    public static function read($request) {
        $row = self::find($request['id']);
        return is_wp_error($row) ? $row : self::success($row);
    }

    public static function create($request) {
        global $wpdb;
        $contact = self::body($request);
        if (is_wp_error($contact)) { return $contact; }
        $result = $wpdb->insert(self::table(), ['usuario_id' => get_current_user_id()] + $contact, ['%d', '%s', '%s', '%s', '%s', '%s']);
        if ($result === false) { return self::db_error(); }
        return self::success(['id' => (int) $wpdb->insert_id] + $contact, 201);
    }

    public static function update($request) {
        global $wpdb;
        $existing = self::find($request['id']);
        if (is_wp_error($existing)) { return $existing; }
        $contact = self::body($request);
        if (is_wp_error($contact)) { return $contact; }
        $result = $wpdb->update(self::table(), $contact, ['id' => (int) $request['id'], 'usuario_id' => get_current_user_id()], ['%s', '%s', '%s', '%s', '%s'], ['%d', '%d']);
        if ($result === false) { return self::db_error(); }
        return self::read($request);
    }

    public static function delete($request) {
        global $wpdb;
        $result = $wpdb->delete(self::table(), ['id' => (int) $request['id'], 'usuario_id' => get_current_user_id()], ['%d', '%d']);
        if ($result === false) { return self::db_error(); }
        return $result ? self::success(['mensaje' => 'Contacto eliminado.']) : self::missing();
    }

    public static function delete_user($id) {
        global $wpdb;
        $wpdb->delete(self::table(), ['usuario_id' => (int) $id], ['%d']);
    }

    public static function shortcode() {
        wp_enqueue_style('agenda-contactos', plugins_url('assets/agenda.css', __FILE__), [], '1.0.0');
        wp_enqueue_script('agenda-auth', plugins_url('assets/auth.js', __FILE__), [], '1.1.0', true);
        if (!is_user_logged_in()) {
            ob_start();
            include __DIR__ . '/templates/auth.php';
            return ob_get_clean();
        }
        if (!current_user_can('read')) { return '<p>No tienes permiso para utilizar la agenda.</p>'; }
        wp_enqueue_script('agenda-contactos', plugins_url('assets/agenda.js', __FILE__), [], '1.0.0', true);
        ob_start();
        include __DIR__ . '/templates/agenda.php';
        return ob_get_clean();
    }

    public static function menu() {
        add_menu_page('Mis contactos', 'Mis contactos', 'read', 'agenda-contactos', function () {
            echo '<div class="wrap"><h1>Mis contactos</h1>' . self::shortcode() . '</div>';
        }, 'dashicons-id');
    }
}

register_activation_hook(__FILE__, ['Agenda_Contactos', 'activate']);
add_action('rest_api_init', ['Agenda_Contactos', 'routes']);
add_shortcode('mis_contactos', ['Agenda_Contactos', 'shortcode']);
add_action('admin_menu', ['Agenda_Contactos', 'menu']);
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook === 'toplevel_page_agenda-contactos') {
        wp_enqueue_style('agenda-contactos', plugins_url('assets/agenda.css', __FILE__), [], '1.0.0');
    }
});
add_action('delete_user', ['Agenda_Contactos', 'delete_user']);
add_action('template_redirect', function () {
    $post = get_post();
    if ($post && has_shortcode($post->post_content, 'mis_contactos')) {
        if (!defined('DONOTCACHEPAGE')) { define('DONOTCACHEPAGE', true); }
        nocache_headers();
    }
});
// No almacenar respuestas privadas de la agenda en cachés compartidas.
add_filter('rest_post_dispatch', function ($response, $server, $request) {
    if (str_starts_with($request->get_route(), '/agenda/v1/')) {
        $response->header('Cache-Control', 'private, no-store');
    }
    return $response;
}, 10, 3);
