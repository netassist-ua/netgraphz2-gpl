<?php
#xhprof_enable(XHPROF_FLAGS_MEMORY);
gc_enable();
error_reporting(E_ERROR | E_PARSE);

define('APP_PATH', realpath('..'));

$debug = new \Phalcon\Debug();
$debug->listen();
try {
     require_once APP_PATH . "/vendor/autoload.php";

    /**
     * Read the configuration
     */
    $config = include APP_PATH . "/app/config/config.php";

    /**
     * Read auto-loader
     */
    include APP_PATH . "/app/config/loader.php";

    /**
     * Read services
     */
    include APP_PATH . "/app/config/services.php";

    /**
     * Handle the request
     */
    $application = new \Phalcon\Mvc\Application($di);

    echo $application->handle()->getContent();

} catch (\Exception $e) {
    echo $e->getMessage();
}
#$xhprof_data = xhprof_disable();
#$XHPROF_ROOT = realpath(dirname(__FILE__) .'/..');
#include_once $XHPROF_ROOT . "/xhprof_lib/utils/xhprof_lib.php";
#include_once $XHPROF_ROOT . "/xhprof_lib/utils/xhprof_runs.php";
#$xhprof_runs = new \XHProfRuns_Default();
#$run_id = $xhprof_runs->save_run($xhprof_data, "xhprof_testing");
