<?php
define('DB_NAME','agenda_sqa');
define('DB_USER','root');
define('DB_PASSWORD','');
define('DB_HOST','127.0.0.1:13307');
define('DB_CHARSET','utf8');
define('DB_COLLATE','');
define('WP_HOME','http://127.0.0.1:8080');
define('WP_SITEURL','http://127.0.0.1:8080');
$table_prefix = "sqa_";
define('WP_DEBUG', false);
if (!defined('ABSPATH')) define('ABSPATH', __DIR__ . '/');
require_once ABSPATH . 'wp-settings.php';
