<?php
$completed = false;
register_shutdown_function(function () use (&$completed) { if (!$completed) exit(1); });
require __DIR__ . '/../../.runtime/wordpress/wp-load.php';
$count = 0;
function verify($condition, $message) { global $count; if (!$condition) throw new RuntimeException($message); $count++; }
$suffix = bin2hex(random_bytes(5));
$alice = wp_create_user('alice_' . $suffix, bin2hex(random_bytes(16)), 'alice_' . $suffix . '@example.test');
$bob = wp_create_user('bob_' . $suffix, bin2hex(random_bytes(16)), 'bob_' . $suffix . '@example.test');
verify(!is_wp_error($alice) && !is_wp_error($bob), 'Usuarios reales');
function api($method, $path, $body = null) {
    $r = new WP_REST_Request($method, '/agenda/v1/contactos' . $path);
    if ($body !== null) { $r->set_header('content-type','application/json'); $r->set_body(json_encode($body)); }
    return rest_do_request($r);
}
try {
    wp_set_current_user(0); verify(api('GET','')->get_status() === 401, 'Sin sesión 401');
    wp_set_current_user($alice);
    $fields = ['nombre'=>'Integración','telefono'=>'12345678','telefono2'=>'87654321'];
    $created = api('POST','',$fields); verify($created->get_status() === 201, 'Crear 201');
    $id = $created->get_data()['data']['id'];
    verify(api('GET', '/' . $id)->get_data()['data']['nombre'] === 'Integración', 'Persistencia MySQL');
    wp_set_current_user($bob);
    foreach (['GET','PUT','DELETE'] as $method) verify(api($method,'/'.$id,$method === 'PUT' ? $fields : null)->get_status() === 404, 'Aislamiento '.$method);
    verify(api('GET','')->get_data()['data'] === [], 'Listado privado');
    wp_set_current_user($alice); $fields['nombre'] = 'Actualizado';
    verify(api('PUT','/'.$id,$fields)->get_data()['data']['nombre'] === 'Actualizado', 'Actualizar persistencia');
    verify(api('POST','',['nombre'=>'Inválido'])->get_status() === 422, 'Validación real');
    verify(api('DELETE','/'.$id)->get_status() === 200, 'Borrar');
    verify(api('GET','/'.$id)->get_status() === 404, 'Ausencia tras borrar');
    echo "OK: $count comprobaciones de integración WordPress/MySQL.\n";
} finally {
    require_once ABSPATH . 'wp-admin/includes/user.php';
    wp_delete_user($alice); wp_delete_user($bob);
}
$completed = true;
