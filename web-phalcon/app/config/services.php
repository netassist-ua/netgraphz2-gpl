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
use Phalcon\Mvc\Dispatcher;
use Phalcon\Session\Adapter\Files as SessionAdapter;

//NetAssist components

use NetAssist\Graph\ConnectionBuilder as GraphConnectionBuilder;
use NetAssist\Shared\Auth as Auth;

/**
* The FactoryDefault Dependency Injector automatically register the right services providing a full stack framework
*/
$di = new FactoryDefault();

$di->set('config', function () use ($config) {
  return $config;
}, true);


//Dispatcher registration
$di->set('dispatcher', function () {
    $dispatcher = new Dispatcher();
    $dispatcher->setDefaultNamespace("NetAssist\\Controllers");
    return $dispatcher;
});

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

      $volt->getCompiler()->addFunction('include_raw', function($resolvedArgs, $exprArgs) use ($view) {
	           return sprintf('file_get_contents("%s" . %s)', $view->getViewsDir(), $resolvedArgs);
      });
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

/* gRPC configuration */

$di->set('grpcConfig', function() use ($config){
  $cfg = new \NetAssist\GRPC\Config();
  $cfg->host = $config->grpc->host;
  $cfg->port = $config->grpc->port;
  $cfg->timeout = $config->grpc->timeout;
  $cfg->grpcOptions = get_object_vars($config->grpc->options);
  return $cfg;
});

$di->set('graphDbAdapter', function(){
	  return (new \NetAssist\Graph\Adapters\RPCAdapter());
});

$di->set('graphNodesRepository', array(
  'className' => 'NetAssist\Graph\Repositories\GRPC\NodesRepository',
  'arguments' => array(
    array( 'type' => 'service', 'name' => 'grpcConfig'),
    array( 'type' => 'service', 'name' => 'graphDbAdapter')
  )
));

$di->set('graphLinksRepository', array(
  'className' => 'NetAssist\Graph\Repositories\GRPC\LinksRepository',
  'arguments' => array(
    array( 'type' => 'service', 'name' => 'grpcConfig' ),
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
