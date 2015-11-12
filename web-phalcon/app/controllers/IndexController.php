<?php

class IndexController extends ControllerBase
{
    /**
     * Nodes repository
     * @var \NetAssist\Graph\Repositories\Interfaces\INodesRepository
     */
    protected $_nodesRepo;

    /**
     * Links repository
     * @var \NetAssist\Graph\Repositories\Interfaces\ILinksRepository
     */

    protected $_linksRepo;

    public function initialize() {
        $this->_nodesRepo = $this->di->get('graphNodesRepository');
        $this->_linksRepo = $this->di->get('graphLinksRepository');
        parent::initialize();
     }

    public function indexAction()
    {
        
    }

}
