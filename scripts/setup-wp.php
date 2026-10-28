<?php
// Dedicated disposable WordPress in .runtime/wordpress; never targets a user's installation.
$root = dirname(__DIR__) . '/.runtime/wordpress';
if (!is_file($root . '/wp-load.php')) throw new RuntimeException('Download WordPress into .runtime/wordpress first.');
$host = getenv('SQA_DB_HOST') ?: '127.0.0.1:13307';
$password = getenv('SQA_DB_PASSWORD') ?: '';
$config = "<?php\n";
foreach (['DB_NAME'=>'agenda_sqa', 'DB_USER'=>'root', 'DB_PASSWORD'=>$password, 'DB_HOST'=>$host, 'DB_CHARSET'=>'utf8', 'DB_COLLATE'=>'', 'WP_HOME'=>'http://127.0.0.1:8080', 'WP_SITEURL'=>'http://127.0.0.1:8080'] as $key=>$value) {
    $config .= 'define(' . var_export($key,true) . ',' . var_export($value,true) . ");\n";
}
$config .= '$table_prefix = "sqa_";' . "\ndefine('WP_DEBUG', false);\nif (!defined('ABSPATH')) define('ABSPATH', __DIR__ . '/');\nrequire_once ABSPATH . 'wp-settings.php';\n";
file_put_contents($root . '/wp-config.php', $config);
define('WP_INSTALLING', true);
require $root . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/upgrade.php';
if (!is_blog_installed()) wp_install('Agenda SQA', 'sqa_admin', 'sqa@example.test', false, '', bin2hex(random_bytes(20)));
require_once ABSPATH . 'wp-admin/includes/plugin.php';
$result = activate_plugin('agenda-contactos/agenda-contactos.php');
if (is_wp_error($result)) throw new RuntimeException($result->get_error_message());
if (!get_page_by_path('mis-contactos')) wp_insert_post(['post_title'=>'Mis contactos','post_name'=>'mis-contactos','post_content'=>'[mis_contactos]','post_type'=>'page','post_status'=>'publish']);
echo "WordPress instalado y plugin activado en base exclusiva agenda_sqa.\n";
