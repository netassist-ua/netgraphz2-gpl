<?php
  namespace NetAssist\Icinga\LiveStatus\Stat;

  /**
  * Stat criteria abstact class. Dummy
  **/
  abstract class StatCriteria {
      /**
      * Magic method to convert criteria into string
      * @return string Stat query criteria
      **/
      public function __toString();
  }
