<?php
namespace NetAssist\Routes;
use Phalcon\Mvc\Router\Group as RouterGroup;

class SignupRoutes extends RouterGroup
{
    public function initialize()
    {
        $this->setPrefix('/Signup');

        $this->addGet("", "Signup::index");
        $this->addPost("", "Signup::index");

    }
}
