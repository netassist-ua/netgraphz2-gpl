<?php

namespace NetAssist\Icinga\LiveStatus;

/**
* Reprensentation of hard state (Icinga)
**/
class HardState extends \SplEnum {
  const __default = self::DOWN;

  const UP = 0;
  const DOWN = 1;

}
