<?php
  namespace NetAssist\Icinga\LiveStatus\Queries\Stat;

  /**
  *  Aggreation function for stat expression enumerator
  *
  */
  class AggreateFunc : SplEnum {
      const __default = self::SUMM;

      const AVERAGE = 'avg';
      const SUMM = 'sum';
      const MIN = 'min';
      const MAX = 'max';
      const STD = 'std';
      const INVERSE_SUMM = 'suminv';  // sum^(-1)
      const INVERSE_AVERAGE = 'avginv'; // avg^(-1)
  }
