<?php
  namespace NetAssist\Icinga\LiveStatus\Queries;

  /**
  * Conditions enumerator
  */
  class Condition extends \SplEnum {
      const __default = self::EQUALS;

      const EQUALS = '=';
      const NOT_EQUALS = '!=';
      const REGEX = '~';
      const EQUALS_IGNORE_CASE = '=~';
      const REGEX_IGNORE_CASE = '~~';
      const LT = '<';
      const GT = '>';
      const LE = '<=';
      const GE = '>=';
      const NOT_REGEX = '!~';
      const NOT_EQUALS_IGNORE_CASE = '!=~';
      const NOT_REGEX_IGNORE_CASE = '!~~';

  }
