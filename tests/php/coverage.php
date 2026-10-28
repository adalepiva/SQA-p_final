<?php
// Never report a fabricated zero or a pass when instrumentation is missing.
$coverage = function_exists('xdebug_start_code_coverage');
if (!$coverage && getenv('REQUIRE_PHP_COVERAGE') === '1') {
    fwrite(STDERR, "Xdebug coverage is required. Set XDEBUG_MODE=coverage.\n"); exit(1);
}
if ($coverage) {
    xdebug_set_filter(XDEBUG_FILTER_CODE_COVERAGE, XDEBUG_PATH_INCLUDE, [realpath(__DIR__ . '/../../desa_Agenda_Proyecto2/agenda-contactos')]);
    xdebug_start_code_coverage(XDEBUG_CC_UNUSED | XDEBUG_CC_DEAD_CODE);
}
require __DIR__ . '/../../desa_Agenda_Proyecto2/tests/php-regression.php';
if (!$coverage) {
    echo "Cobertura PHP no medida: Xdebug no instalado.\n"; exit(0);
}
$files = xdebug_get_code_coverage(); xdebug_stop_code_coverage();
$hit = 0; $total = 0;
$xml = new SimpleXMLElement('<coverage/>');
$project = $xml->addChild('project'); $project->addAttribute('name', 'Agenda');
foreach ($files as $file => $lines) {
    $node = $project->addChild('file'); $node->addAttribute('name', $file);
    foreach ($lines as $number => $value) {
        if ($value === -2) continue;
        $total++; if ($value > 0) $hit++;
        $line = $node->addChild('line'); $line->addAttribute('num', (string)$number);
        $line->addAttribute('type', 'stmt'); $line->addAttribute('count', $value > 0 ? '1' : '0');
    }
}
$percent = $total ? 100 * $hit / $total : 0;
file_put_contents(__DIR__ . '/../../reports/php-coverage.xml', $xml->asXML());
file_put_contents(__DIR__ . '/../../reports/php-coverage.json', json_encode(['covered'=>$hit, 'total'=>$total, 'percent'=>$percent], JSON_PRETTY_PRINT));
printf("Cobertura PHP: %.2f%% (%d/%d)\n", $percent, $hit, $total);
if ($percent < 60) exit(1);
