<?php

$loader = new \Phalcon\Loader();

/**
 * We're a registering a set of directories taken from the configuration file
 */
$loader->registerDirs(
	array(
		$config->application->controllersDir,
		$config->application->modelsDir,
	)
);
$loader->registerNamespaces(
  array(
                'NetAssist\Controllers' => $config->application->controllersDir,
		'NetAssist\Graph' => APP_PATH . '/app/graph/',
		'NetAssist\Graph\Repositories\Interfaces' => APP_PATH . '/app/graph/repositories/interfaces/',
		'NetAssist\Graph\Repositories\GRPC' => APP_PATH . '/app/graph/repositories/grpc/',
		'NetAssist\Graph\Adapters' => APP_PATH . '/app/graph/adapters/',
		'NetAssist\Models' => APP_PATH . '/app/models/',
		'NetAssist\Shared' => APP_PATH . '/app/shared/',
		'NetAssist\Forms' => APP_PATH . '/app/forms/',
		'NetAssist\Routes' => APP_PATH . '/app/routes/',
		'NetAssist\GRPC' => APP_PATH . '/app/grpc/',
		'NetAssist\Utils' => APP_PATH . '/app/utils/',
		'NetAssist\Utils\Types' => APP_PATH . '/app/utils/types/'
	)
);


$loader->register();
