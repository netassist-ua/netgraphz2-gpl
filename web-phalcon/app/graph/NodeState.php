<?php
namespace NetAssist\Graph;

class NodeState extends \SplEnum {
	const __default = self::STATE_DOWN;

	const STATE_DOWN = 1;
	const STATE_UP = 0;
	const STATE_UNREACHABLE = 2;
}

class EffectiveNodeState extends \SplEnum {
	const __default = self::E_STATE_UNKNOWN;

        const E_STATE_UP = 0;
        const E_STATE_DOWN = 1;
	const E_STATE_WARNING = 2;
	const E_STATE_UNKNOWN = 3;
	const E_STATE_FLAPPING = 4;
}
