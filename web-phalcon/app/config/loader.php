<?php

$loader = new \Phalcon\Loader();

/**
 * We're a registering a set of directories taken from the configuration file
 */
$loader->registerDirs(
    array(
        $config->application->controllersDir,
        $config->application->modelsDir
    )
);
$loader->registerNamespaces(
    array(
        'NetAssist\Graph' => APP_PATH . '/app/graph/',
        'NetAssist\Graph\Repositories\Interfaces' => APP_PATH . '/app/graph/repositories/interfaces/',
        'NetAssist\Graph\Repositories\NeoClient' => APP_PATH . '/app/graph/repositories/neoclient/',
        'NetAssist\Graph\Adapters' => APP_PATH . '/app/graph/adapters/',
        'NetAssist\Graph\Services' => APP_PATH . '/app/graph/services/',
        'NetAssist\Routes' => APP_PATH . '/app/routes/',
        'NetAssist\Utils' => APP_PATH . '/app/utils/',
        'NetAssist\Utils\Types' => APP_PATH . '/app/utils/types/',
        'NetAssist\Icinga' => APP_PATH . '/app/icinga/',
        'NetAssist\Icinga\LiveStatus' => APP_PATH . '/app/icinga/livestatus/',
        'NetAssist\Icinga\LiveStatus\Queries' => APP_PATH . '/app/icinga/livestatus/queries/',
        'NetAssist\Icinga\LiveStatus\Queries\Stat' => APP_PATH . '/app/icinga/livestatus/queries/stat/',
        'NetAssist\Icinga\LiveStatus\Requests' => APP_PATH . '/app/icinga/livestatus/requests/',
    )
 );
$loader->register();
