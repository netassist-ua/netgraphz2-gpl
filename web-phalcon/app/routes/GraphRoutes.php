<?php
namespace NetAssist\Routes;
use Phalcon\Mvc\Router\Group as RouterGroup;

class GraphRoutes extends RouterGroup
{
	public function initialize()
	{
		$this->setPrefix('/Graph');

		$this->addPost("/positions", "Graph::savePositions");
		$this->addDelete("/positions", "Graph::deletePositions");


		$this->addGet("/fetchAllNodes", "Graph::fetchAllNodes");
		$this->addGet("/fetchAllLinks", "Graph::fetchAllLinks");

		$this->addGet("/userParams", "Graph::getUserParameters");
		$this->addGet("/status", "Graph::getStatus");

	}
}
