<?php
namespace NetAssist\Routes;
use Phalcon\Mvc\Router\Group as RouterGroup;

class NodesRoutes extends RouterGroup
{
    public function initialize()
    {
        $this->setPrefix('/Nodes');

        $this->addGet("/Count", "Nodes::count");

        $this->addGet("/Get/{id}", "Nodes::get");

        $this->addGet("/GetAllFrom/{id}/{take}", "Nodes::getAllFromId" );
    }
}
