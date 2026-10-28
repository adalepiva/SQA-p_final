<?php
// Pruebas sin WordPress ni base de datos. Los dobles solo cubren las dependencias usadas aquí.
const ABSPATH = __DIR__ . '/';
const ARRAY_A = 'ARRAY_A';
const MINUTE_IN_SECONDS = 60;
class WP_Error {
    public function __construct(public $code, public $message, public $data) {}
}
class WP_REST_Response {
    public function __construct(public $data, public $status = 200, public $headers = []) {}
}
function add_action(...$args) {}
function add_filter(...$args) {}
function add_shortcode(...$args) {}
function register_activation_hook(...$args) {}
function is_wp_error($value) { return $value instanceof WP_Error; }
function sanitize_text_field($value) { return trim(strip_tags($value)); }
function sanitize_textarea_field($value) { return trim(strip_tags($value)); }
function is_email($value) { return filter_var($value, FILTER_VALIDATE_EMAIL); }
function get_current_user_id() { return 7; }
function is_user_logged_in() { return $GLOBALS['logged_in']; }
function current_user_can($capability) { return $GLOBALS['can_read']; }
function get_transient($key) { return $GLOBALS['attempts'][$key] ?? 0; }
function set_transient($key, $value, $ttl) { $GLOBALS['attempts'][$key] = $value; $GLOBALS['ttl'] = $ttl; }
function wp_verify_nonce($nonce, $action) { return $nonce === 'valid'; }
function home_url() { return 'https://example.test:8443/site'; }
function wp_parse_url($url) { return parse_url($url); }
function is_ssl() { return true; }
function wp_signon($credentials, $secure) {
    $GLOBALS['credentials'] = $credentials;
    return $GLOBALS['signon_result'];
}
function wp_set_current_user($id) { $GLOBALS['current_user'] = $id; }
function wp_set_auth_cookie($id, $remember, $secure) { $GLOBALS['cookie'] = [$id, $remember, $secure]; }
function username_exists($name) { return $GLOBALS['duplicate'] ?? false; }
function email_exists($email) { return false; }
function wp_insert_user($fields) { $GLOBALS['new_user'] = $fields; return 19; }
function wp_logout() { $GLOBALS['current_user'] = 0; }
class Request implements ArrayAccess {
    public function __construct(public $raw, public $json = true, public $params = [], public $headers = []) {}
    public function is_json_content_type() { return $this->json; }
    public function get_body() { return $this->raw; }
    public function get_json_params() { return json_decode($this->raw, true); }
    public function get_param($key) { return $this->params[$key] ?? null; }
    public function get_header($key) { return $this->headers[$key] ?? ''; }
    public function offsetExists(mixed $key): bool { return isset($this->params[$key]); }
    public function offsetGet(mixed $key): mixed { return $this->params[$key]; }
    public function offsetSet(mixed $key, mixed $value): void { $this->params[$key] = $value; }
    public function offsetUnset(mixed $key): void { unset($this->params[$key]); }
}
class DatabaseDouble {
    public $prefix = 'wp_';
    public $last_error = '';
    public $insert_id = 23;
    public $row = null;
    public $rows = [];
    public $result = 1;
    public $query;
    public $write;
    public function prepare($sql, ...$params) { return $this->query = [$sql, $params]; }
    public function get_row($query, $format) { return $this->row; }
    public function get_results($query, $format) { return $this->rows; }
    public function esc_like($text) { return addcslashes($text, '_%\\'); }
    public function insert(...$args) { $this->write = $args; return $this->result; }
    public function update(...$args) { $this->write = $args; return $this->result; }
    public function delete(...$args) { $this->write = $args; return $this->result; }
}
require ($argv[1] ?? dirname(__DIR__) . '/agenda-contactos') . '/agenda-contactos.php';
$count = 0;
function check($condition, $description) {
    global $count;
    if (!$condition) { throw new RuntimeException($description); }
    $count++;
}
function expect_error($result, $code, $status) {
    check($result instanceof WP_Error && $result->code === $code && $result->data['status'] === $status, "$code / $status");
}
function request($fields, $params = []) { return new Request(json_encode((object) $fields), true, $params); }
$wpdb = new DatabaseDouble();
$logged_in = false;
$can_read = false;
expect_error(Agenda_Contactos::permission(), 'agenda_sin_sesion', 401);
$logged_in = true;
expect_error(Agenda_Contactos::permission(), 'agenda_sin_permiso', 403);
$can_read = true;
check(Agenda_Contactos::permission() === true, 'Permiso read');
$valid = ['nombre' => 'Ana', 'telefono' => '+502 1234-5678', 'telefono2' => '(502) 87654321'];
expect_error(Agenda_Contactos::create(new Request('{}', false)), 'agenda_tipo_contenido', 415);
foreach (['{', '[]', 'null', '"texto"'] as $raw) {
    expect_error(Agenda_Contactos::create(new Request($raw)), 'agenda_json', 400);
}
foreach (['nombre', 'telefono', 'telefono2'] as $field) {
    expect_error(Agenda_Contactos::create(request(array_replace($valid, [$field => '']))), 'agenda_validacion', 422);
    expect_error(Agenda_Contactos::create(request(array_replace($valid, [$field => []]))), 'agenda_validacion', 422);
}
foreach (['nombre' => 100, 'telefono' => 20, 'telefono2' => 20, 'email' => 100, 'direccion' => 5000] as $field => $max) {
    expect_error(Agenda_Contactos::create(request(array_replace($valid, [$field => str_repeat('a', $max + 1)]))), 'agenda_validacion', 422);
}
foreach (['123456', '1234567x'] as $phone) {
    expect_error(Agenda_Contactos::create(request(array_replace($valid, ['telefono2' => $phone]))), 'agenda_telefono', 422);
}
expect_error(Agenda_Contactos::create(request($valid + ['email' => 'incorrecto'])), 'agenda_email', 422);
$created = Agenda_Contactos::create(request($valid + ['usuario_id' => 99]));
check($created->status === 201 && $created->data['data']['id'] === 23, 'Creación e ID entero');
check($wpdb->write[1]['usuario_id'] === 7, 'Propietario del servidor');
check($created->data['data']['email'] === '' && $created->data['data']['direccion'] === '', 'Opcionales vacíos');
check($created->headers['Cache-Control'] === 'private, no-store', 'Caché privada');
$unicode = Agenda_Contactos::create(request(array_replace($valid, ['nombre' => str_repeat('á', 100)])));
check($unicode->status === 201, 'Longitud en caracteres del contacto');
$wpdb->row = ['id' => '23'] + $valid + ['email' => '', 'direccion' => ''];
$read = Agenda_Contactos::read(request([], ['id' => 23]));
check($read->data['data']['id'] === 23 && $wpdb->query[1] === [23, 7], 'Lectura ligada al propietario');
$wpdb->result = 0;
check(Agenda_Contactos::update(request($valid, ['id' => 23]))->status === 200, 'PUT sin cambios');
check($wpdb->write[2] === ['id' => 23, 'usuario_id' => 7], 'PUT ligado al propietario');
expect_error(Agenda_Contactos::delete(request([], ['id' => 23])), 'agenda_no_encontrado', 404);
$wpdb->result = false;
expect_error(Agenda_Contactos::create(request($valid)), 'agenda_error_bd', 500);
expect_error(Agenda_Contactos::update(request($valid, ['id' => 23])), 'agenda_error_bd', 500);
expect_error(Agenda_Contactos::delete(request([], ['id' => 23])), 'agenda_error_bd', 500);
$wpdb->row = null;
expect_error(Agenda_Contactos::update(new Request('{', true, ['id' => 23])), 'agenda_no_encontrado', 404);
$wpdb->last_error = 'error';
expect_error(Agenda_Contactos::read(request([], ['id' => 23])), 'agenda_error_bd', 500);
expect_error(Agenda_Contactos::listing(request([])), 'agenda_error_bd', 500);
$wpdb->last_error = '';
$wpdb->rows = [['id' => '23'] + $valid];
$list = Agenda_Contactos::listing(request([], ['buscar' => ' %_ ']));
check($list->data['data'][0]['id'] === 23, 'Listado con ID entero');
check($wpdb->query[1][0] === [7, '%\\%\\_%', '%\\%\\_%', '%\\%\\_%'], 'Búsqueda escapa comodines y usa tres campos');
foreach ([[], str_repeat('a', 401)] as $search) {
    expect_error(Agenda_Contactos::listing(request([], ['buscar' => $search])), 'agenda_busqueda', 422);
}
expect_error(Agenda_Auth::guest_permission(new Request('{}')), 'agenda_nonce', 403);
expect_error(Agenda_Auth::guest_permission(new Request('{}', true, [], ['X-Agenda-Nonce' => 'valid', 'origin' => 'https://other.test'])), 'agenda_origen', 403);
check(Agenda_Auth::guest_permission(new Request('{}', true, [], ['X-Agenda-Nonce' => 'valid', 'origin' => 'https://example.test:8443/'])) === true, 'Origen con puerto');
$attempts = [];
expect_error(Agenda_Auth::login(new Request('{}', false)), 'agenda_auth', 415);
expect_error(Agenda_Auth::login(new Request('[]')), 'agenda_auth', 400);
expect_error(Agenda_Auth::login(request(['extra' => 4])), 'agenda_auth', 422);
check($attempts === [], 'JSON inválido no consume intentos');
$signon_result = new WP_Error('invalid', '', []);
expect_error(Agenda_Auth::login(request(['usuario' => 'ana', 'password' => 'incorrecta'])), 'agenda_auth', 401);
$signon_result = (object) ['ID' => 19];
check(Agenda_Auth::login(request(['usuario' => ' ana@example.test ', 'password' => 'correcta']))->status === 200, 'Login por correo');
check($credentials === ['user_login' => 'ana@example.test', 'user_password' => 'correcta', 'remember' => false], 'Credenciales sin transformar contraseña');
$attempts = [];
for ($i = 0; $i < 15; $i++) {
    expect_error(Agenda_Auth::login(request([])), 'agenda_auth', 422);
}
expect_error(Agenda_Auth::login(request([])), 'agenda_auth', 429);
check($ttl === 900, 'Ventana de 15 minutos');
$registration = ['nombre' => 'Ana', 'usuario' => 'ana', 'email' => 'ana@example.test', 'password' => '12345678', 'confirm_password' => '12345678'];
foreach ([['nombre' => ''], ['usuario' => 'a'], ['email' => 'no'], ['password' => '1234567'], ['confirm_password' => 'otro']] as $invalid) {
    expect_error(Agenda_Auth::registro(request(array_replace($registration, $invalid))), 'agenda_auth', 422);
}
$duplicate = true;
expect_error(Agenda_Auth::registro(request($registration)), 'agenda_auth', 409);
$duplicate = false;
check(Agenda_Auth::registro(request($registration + ['role' => 'administrator']))->status === 201, 'Registro independiente del límite de login');
check($new_user['role'] === 'subscriber' && $cookie === [19, false, true], 'Rol fijo y sesión automática');
check(Agenda_Auth::logout()->status === 200 && $current_user === 0, 'Logout');
echo "OK: $count comprobaciones PHP (dobles de WordPress y base de datos).\n";

