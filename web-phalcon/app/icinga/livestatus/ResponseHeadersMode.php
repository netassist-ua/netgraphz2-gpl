<?php
  namespace NetAssist\Icinga\LiveStatus;

  /**
  * Response headers mode enum
  **/
  class ResponseHeadersMode extends \SplEnum {
      const __default = self::FIXED16;

      const FIXED16='fixed16';
      const OFF='off';
  }
