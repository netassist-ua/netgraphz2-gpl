<?php
  namespace NetAssist\Graph;

  class NodeState extends \SplEnum {
    const __default = self::STATE_DOWN;

    const STATE_UKNOWN = -1;
    const STATE_DOWN = 0;
    const STATE_UP = 1;
    const STATE_LOSS = 2;
  }
