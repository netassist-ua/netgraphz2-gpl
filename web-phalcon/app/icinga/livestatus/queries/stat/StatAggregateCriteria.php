<?php
  namespace NetAssist\Icinga\LiveStatus\Queries\Stat;

  /**
  * Stat aggregation criteria.
  * Criteria which uses internal aggregation functions
  **/
  class StatAggregateCriteria extends StatColumnCriteria {
      /**
      * @var \NetAssist\Icinga\LiveStatus\Queries\Stat\AggregateFunc Predefined function to use
      **/
      private $_aggrationFunction;

      /**
      * Constructor
      * @param string $columnName Name of column
      * @param \NetAssist\Icinga\LiveStatus\Queries\Stat\AggregateFunc $aggreateFunction Predefined aggreational function
      **/
      public function __construct($columnName, $aggreateFunction){
          $this->_aggrationFunction = $aggreateFunction;
          parent::$_columnName = $columnName;
      }

      /**
      * Magic method to convert criteria into string
      * @return string Stat query criteria
      **/
      public function __toString(){
          return sprintf("Stats: %s %s", strval($this->_aggrationFunction), parent::$_columnName);
      }
  }
