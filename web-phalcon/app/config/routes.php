<?php
use Phalcon\Mvc\Router;
use NetAssist\Routes\GraphRoutes;
use NetAssist\Routes\NodesRoutes;
use NetAssist\Routes\SignupRoutes;

$router = new Router(false);

/*$router->add("/login", array(
    'controller' => 'login',
    'action'     => 'index'
));

$router->add("/products/:action", array(
    'controller' => 'products',
    'action'     => 1
));*/

$router->add("/", [
    'controller' => 'index',
    'action' => 'index'
]);

$router->mount(new GraphRoutes());
$router->mount(new NodesRoutes());
$router->mount(new SignupRoutes());

$router->notFound(
    array(
        "controller" => "index",
        "action"     => "route404"
    )
);
$router->removeExtraSlashes(true);

return $router;
