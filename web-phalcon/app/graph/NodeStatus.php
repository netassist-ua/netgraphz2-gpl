<?php
namespace NetAssist\Graph;
use \DateTime;

/**
 *  Represents aspect of status
 * @property_read \NetAssist\Graph\NodeState $state State of node
 * @property_read string $name Name of host
 **/
class NodeStatus implements \JsonSerializable {
	/**
	 * @var \NetAssist\Graph\NodeState State
	 **/
	public $state;

	/**
	 * @var \NetAssist\Graph\NodeState Hard state
	 */
	public $hard_state;

	/**
	 * @var \NetAssist\Graph\EffectiveNodeState Effective state
	 **/
	public $effective_state;

	/**
	 * @var float Packet loss (from 0 to 1)
	 **/
	public $packet_loss;

	/**
	 * @var float average RTT in milliseconds
	 **/
	public $avg_rtt_ms;

	/**
	 * @var bool Duplicates
	 **/
	public $dup;

	/**
	 * @var string Source Name 
	 */
	public $source;

	/**
	 * @var DateTime Time of state update
	 */
	public $time;

	/**
	 * @var bool Is host in flapping state
	 */	
	public $is_flapping;

	/**
	 * @var bool Is host reachable
	 */
	public $is_reachable;

	/**
	 * @var bool Is host in hard state 
	 */
	public $is_hard_state;

	/**
	 * @var bool Is host check executing
	 */
	public $is_executing;

	/**
	 * @var bool Is host been checked
	 */
	public $has_been_checked;

	/**
	 * @var string Monitoring system state note
	 */
	public $notes;

	/**
	 * @var int Ammount of services
	 */
	public $num_services;

	/**
	 * @var int Ammount of services in OK state
	 */
	public $num_services_ok;

	/**
	 * @var int Ammount of services in WARNING state
	 */
	public $num_services_warning;

	/**
	 * @var int Ammount of services in CRITICAL state
	 */
	public $num_services_critical;

	/**
	 * @var int Ammount of services in UNKNOWN state
	 */
	public $num_services_unknown;

	/**
	 * @var int Ammount of services in PENDING state
	 */
	public $num_services_pending;

	/**
	 * @var string Monitoring system output
	 */
	public $output;

	/**
	 * Constructor
	 * @param \NetAssist\Graph\NodeState $state state
	 * @param \NetAssist\Graph\NodeState $hard_state Hard state
	 * @param \NetAssist\Graph\EffectiveState $effective_state Effective state
	 **/
	public function __construct($state, $hard_state, $effective_state){
		$this->state = $state;
		$this->hard_state = $hard_state;
		$this->effective_state = $effective_state;
		$this->time = new DateTime();
	}

	/*
	*	Serialize to JSON
	*/	
	public function jsonSerialize(){
		return [
			'source' => $this->source,
			'state' => $this->state,
			'hard_state' => $this->hard_state,
			'effective_state' => $this->effective_state,
			'loss' => $this->packet_loss,
			'rtt' => $this->avg_rtt_ms,
			'dup' => $this->dup,
			'time' => $this->time->getTimestamp(),
			'is_flapping' => $this->is_flapping,
			'is_reachable' => $this->is_reachable,
			'is_hard_state' => $this->is_hard_state,
			'is_executing' => $this->is_executing,
			'notes' => $this->notes,
			'output' => $this->output,
			'num_services' => $this->num_services,
			'num_services_ok' => $this->num_services_ok,
			'num_services_pending' => $this->num_services_pending,
			'num_services_warning' => $this->num_services_warning,
			'num_services_critical' => $this->num_services_critical,
			'num_services_unknown' => $this->num_services_unknown
		];
	}
}
