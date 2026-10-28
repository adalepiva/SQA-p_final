<?php
require 'C:/laragon/www/agenda-wordpress/wp-load.php';
wp_set_current_user(0);
$guest = do_shortcode('[mis_contactos]');
if (!str_contains($guest, 'data-weather') || !str_contains($guest, 'data-login-form')) throw new RuntimeException('Fallo vista visitante');
$ids = get_users(['number' => 1, 'fields' => 'ID', 'role' => 'administrator']);
if (!$ids) throw new RuntimeException('No existe usuario para verificar');
wp_set_current_user($ids[0]);
$member = do_shortcode('[mis_contactos]');
if (!str_contains($member, 'data-weather') || !str_contains($member, 'data-editor')) throw new RuntimeException('Fallo vista autenticada');
if (!wp_script_is('agenda-weather', 'enqueued')) throw new RuntimeException('Script no cargado');
$page = get_page_by_path('mis-contactos');
$url = get_permalink($page);
$response = wp_remote_get($url);
if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) throw new RuntimeException('Fallo HTTP');
$html = wp_remote_retrieve_body($response);
if (!str_contains($html, 'data-weather') || !str_contains($html, 'assets/weather.js')) throw new RuntimeException('Falta clima en HTTP');
echo "OK: clima y formularios visibles sin sesión y con sesión; script cargado; página HTTP 200.\n$url\n";
