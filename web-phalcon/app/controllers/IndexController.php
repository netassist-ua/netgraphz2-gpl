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
     }

    public function indexAction()
    {
        $this->view->node_count = $this->_nodesRepo->CountAllNodes();
        $this->view->link_count = $this->_linksRepo->CountAllLinks();   
    }

}
