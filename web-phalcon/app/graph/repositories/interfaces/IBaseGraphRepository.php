<?php
namespace NetAssist\Graph\Repositories\Interfaces;

/**
* Basic interface of graph repository
*/
interface IBaseGraphRepository {
    /**
    *  Returns graph database engine version and revision
    *  @return string Engine version
    */
    function GetDatabaseVersion();
}


?>
