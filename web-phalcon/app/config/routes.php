<?php
use Phalcon\Mvc\Router;
use NetAssist\Routes\GraphRoutes;
use NetAssist\Routes\NodesRoutes;
use NetAssist\Routes\AccountRoutes;

$router = new Router(false);

$router->add("/", [
    'controller' => 'index',
    'action' => 'index'
]);

$router->mount(new GraphRoutes());
$router->mount(new NodesRoutes());
$router->mount(new AccountRoutes());

$router->notFound(
    array(
        "controller" => "index",
        "action"     => "route404"
    )
);
$router->removeExtraSlashes(true);

return $router;
