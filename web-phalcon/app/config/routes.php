<?php
use Phalcon\Mvc\Router;
use NetAssist\Routes\GraphRoutes;
use NetAssist\Routes\NodesRoutes;
use NetAssist\Routes\AccountRoutes;
use NetAssist\Routes\LinksRoutes;

$router = new Router(false);

$router->add("/", [
    'controller' => 'index',
    'action' => 'index'
]);

$router->mount(new GraphRoutes());
$router->mount(new NodesRoutes());
$router->mount(new AccountRoutes());
$router->mount(new LinksRoutes());

$router->notFound(
    array(
        "controller" => "index",
        "action"     => "route404"
    )
);
$router->removeExtraSlashes(true);

return $router;
