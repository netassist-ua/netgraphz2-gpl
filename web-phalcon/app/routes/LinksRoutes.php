<?php
namespace NetAssist\Routes;
use Phalcon\Mvc\Router\Group as RouterGroup;

class LinksRoutes extends RouterGroup
{
    public function initialize()
    {
        $this->setPrefix('/Links');

        $this->addGet("/Count", "Links::count");

        $this->addGet("/Get/{id}", "Links::get");

        $this->addGet("/GetAllFrom/{id}/{take}", "Links::getAllFromId" );
    }
}
