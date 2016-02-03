<?php
namespace NetAssist\Graph;
use \DateTime;
/**
 * Node metric
 */
class NodeMetric {
	/* @var string Metric name */
	public $name;

	/* @var \NetAssist\Graph\NodeMetricValue[] Values */
	public $values;

	public function __construct(){
		$values = array();
	}

	/**
	 *  Performs JSON serialzation preparation
	 * @return array Repsentation of object for JSON serializer
	 **/ 
//	public function jsonSerialize()
//	{
//		return [
//			'name' => $this->name,
//			'values' => $this->values
//		];
//	}

}

/*
 * Node metric value
 */
class NodeMetricValue implements \JsonSerializable {
	/* @var string Metric name */	
	public $name;

	/* @var string Metric type */
	public $type;

	/* @var int Metric kind */
	public $kind;

	/* @var DateTime Time */
	public $time;

	/* @var mixed Value */
	public $value;

	public function __construct(){
		$this->time = new DateTime();
	}

	/**
	 *  Performs JSON serialzation preparation
	 * @return array Repsentation of object for JSON serializer
	 **/ 
	public function jsonSerialize()
	{
		return [
			'name' => $this->name,
			'type' => $this->type,
			'kind' => $this->kind,
			'time' => $this->time->getTimestamp(),
			'value' => $this->value
		];
	}

}
?>
