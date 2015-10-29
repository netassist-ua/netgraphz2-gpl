<?php

defined('APP_PATH') || define('APP_PATH', realpath('.'));

return new \Phalcon\Config(array(
    'information' => array(
        'companyName'   => 'My company',
        'siteName'      => 'NetGraphz2',
        'icingaUrl'     => '/icinga2-classicui',
        'openSignUp' => true
     ),
     'mongo' => array(
       'connectionString' => 'mongodb://localhost:27017',
       'database' => 'netgraphz2',
       'options' => array()
     ),
    'graph' => array(
        'host'     =>  'localhost',
        'port'     =>   7474,
        'username' =>  'neo4j',
        'password' =>  'changed',
        'scheme'   =>  'http',
        'auth'     =>   true
    ),
    'livestatus' => array(
        'host' => 'localhost',
        'port' => 6558,
        'keepAlive' => false,
        'authEnable' => false,
        'authUser' => '',
        'unixSocket' => false,
        'unixSocketPath' => ''
    ),
    'application' => array(
        'controllersDir' => APP_PATH . '/app/controllers/',
        'modelsDir'      => APP_PATH . '/app/models/',
        'migrationsDir'  => APP_PATH . '/app/migrations/',
        'viewsDir'       => APP_PATH . '/app/views/',
        'pluginsDir'     => APP_PATH . '/app/plugins/',
        'libraryDir'     => APP_PATH . '/app/library/',
        'cacheDir'       => APP_PATH . '/app/cache/',
        'graphDir'       => APP_PATH . '/app/graph/',
        'baseUri'        => '/',
        'cryptSalt'      => 'Thae4pijiexahfahYief3411', //should be changed!
        'rememberLifeTime' => 604800,
        'failLoginWindowTime' =>  300,
        'failLoginBlockPermament' => false,
        'failLoginBlockTime' => 600,
        'failLoginWindowMaxCount' => 5
    )
));
