<?php
  namespace NetAssist\Icinga\LiveStatus\Queries\Stat;

  /**
  * Stat criteria using specific column
  **/
  abstract class StatColumnCriteria extends StatCriteria {
      /**
      * @var string Name of the column
      **/
      protected $_columnName;
      
      /**
      * Magic method to convert criteria into string
      * @return string Stat query criteria
      **/
      public function __toString();
  }
