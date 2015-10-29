<?php
namespace NetAssist\Routes;
use Phalcon\Mvc\Router\Group as RouterGroup;

class AccountRoutes extends RouterGroup
{
    public function initialize()
    {
        $this->setPrefix('/Account');

        $this->addGet("/Register", "Account::signup");
        $this->addPost("/Register", "Account::signup");
        $this->addGet("/Login", "Account::login");
        $this->addPost("/Login", "Account::login");
        $this->addGet("/Logout", "Account::logout");

    }
}
