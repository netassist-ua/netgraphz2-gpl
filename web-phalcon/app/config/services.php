<?php
/**
* Services are globally registered in this file
*
* @var \Phalcon\Config $config
*/

use Phalcon\Di\FactoryDefault;
use Phalcon\Mvc\View;
use Phalcon\Crypt;
use Phalcon\Security;
use Phalcon\Mvc\Url as UrlResolver;
use Phalcon\Db\Adapter\Pdo\Mysql as DbAdapter;
use Phalcon\Mvc\View\Engine\Volt as VoltEngine;
use Phalcon\Mvc\Model\Metadata\Memory as MetaDataAdapter;
use Phalcon\Flash\Direct as Flash;


use Phalcon\Session\Adapter\Files as SessionAdapter;
use NetAssist\Graph\ConnectionBuilder as GraphConnectionBuilder;
use NetAssist\Icinga\LiveStatus\Config as LiveStatusConfig;
use NetAssist\Shared\Auth as Auth;

/**
* The FactoryDefault Dependency Injector automatically register the right services providing a full stack framework
*/
$di = new FactoryDefault();

$di->set('config', function () use ($config) {
  return $config;
}, true);

/**
* The URL component is used to generate all kind of urls in the application
*/
$di->set('url', function () use ($config) {
  $url = new UrlResolver();
  $url->setBaseUri($config->application->baseUri);

  return $url;
}, true);

/**
* Setting up the view component
*/
$di->setShared('view', function () use ($config) {

  $view = new View();

  $view->setViewsDir($config->application->viewsDir);

  $view->registerEngines(array(
    '.volt' => function ($view, $di) use ($config) {

      $volt = new VoltEngine($view, $di);

      $volt->setOptions(array(
        'compiledPath' => $config->application->cacheDir,
        'compiledSeparator' => '_'
      ));

      return $volt;
    },
    '.phtml' => 'Phalcon\Mvc\View\Engine\Php'
  ));

  return $view;
});


/**
 * Flash service with custom CSS classes
 */
$di->set('flash', function () {
    return new Flash(array(
        'error' => 'alert alert-danger',
        'success' => 'alert alert-success',
        'notice' => 'alert alert-info',
        'warning' => 'alert alert-warning'
    ));
});


/**
*   Inject graph connection, repositories, etc
*/

$di->set('graphDbConnection', function() use ($config){
  return (new GraphConnectionBuilder($config->graph))->buildConnection();
});

$di->set('graphDbAdapter', function(){
  return (new \NetAssist\Graph\Adapters\NeoClientAdapter());
});

$di->set('graphNodesRepository', array(
  'className' => 'NetAssist\Graph\Repositories\NeoClient\NodesRepository',
  'arguments' => array(
    array( 'type' => 'service', 'name' => 'graphDbConnection'),
    array( 'type' => 'service', 'name' => 'graphDbAdapter')
  )
));

$di->set('graphLinksRepository', array(
  'className' => 'NetAssist\Graph\Repositories\NeoClient\LinksRepository',
  'arguments' => array(
    array( 'type' => 'service', 'name' => 'graphDbConnection' ),
    array( 'type' => 'service', 'name' => 'graphDbAdapter')
  )
));


/* MongoDB configuration */

$di->set('mongo', function () use ($config) {
  $mongo = new MongoClient($config->mongo->connectionString, (array) $config->mongo->options);
  return $mongo->selectDB($config->mongo->database);
}, true);

/* Collection manager */

$di->set('collectionManager', function(){
    return new Phalcon\Mvc\Collection\Manager();
}, true);

/* LiveStatus host status service */

$di->set('icingaLiveStatusConfig', function() use ($config){
  $cfg = new LiveStatusConfig();
  $cfg->host = $config->livestatus->host;
  $cfg->port = $config->livestatus->port;
  $cfg->keepAlive = $config->livestatus->keepAlive;
  $cfg->use_unix_socket = $config->livestatus->unixSocket;
  $cfg->unix_socket_path = $config->livestatus->unixSocketPath;
  $cfg->use_auth = $config->livestatus->authEnable;
  $cfg->auth_user = $config->livestatus->authUser;
  return $cfg;
});

$di->set('icingaLiveStatusClient', array(
  'className' => 'NetAssist\Icinga\LiveStatus\Client',
  'arguments' => array(
    array('type' => 'service', 'name'=>'icingaLiveStatusConfig')
  )
));

$di->set('hostStatusService', array(
  'className' => 'NetAssist\Icinga\LiveStatus\IcingaHostStatusService',
  'arguments' => array(
    array('type' => 'service', 'name'=>'icingaLiveStatusClient')
  )
));


/**
* If the configuration specify the use of metadata adapter use it or use memory otherwise
*/
$di->set('modelsMetadata', function () {
  return new MetaDataAdapter();
});

/**
* Start the session the first time some component request the session service
*/
$di->set('session', function () {
  $session = new SessionAdapter();
  $session->start();
  return $session;
});


/**
* Security service
*/
$di->set('security', function () {

  $security = new Security();

  // Set the password hashing factor to 12 rounds
  $security->setWorkFactor(12);

  return $security;
}, true);


/**
* Crypt service
*/
$di->set('crypt', function () use ($config) {
  $crypt = new Crypt();
  $crypt->setKey($config->application->cryptSalt);
  return $crypt;
});

/*
* Router
*/
$di->set('router', function () {
  require APP_PATH.'/app/config/routes.php';
  return $router;
});

/**
* Authentication service
*/

$di->set('auth', function () {
    return new Auth();
});
