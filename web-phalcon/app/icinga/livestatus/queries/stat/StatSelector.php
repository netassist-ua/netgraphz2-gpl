<?php
  namespace NetAssist\Icinga\LiveStatus\Queries\Stat;

  /**
  * Stat query expression
  *
  **/
  class StatSelector extends StatColumnCriteria {

    /**
    * @var mixed Value to use in condition to calculate stat
    **/
    private $_value;

    /**
    * @var \NetAssist\Icinga\LiveStatus\Queries\Condition Condition to collect
    **/
    private $_condition;

    /**
    * Constructor
    * @param string $columnName Name of column
    * @param \NetAssist\Icinga\LiveStatus\Queries\Condition $condtion Condition of test
    * @param mixed $value Value to test
    **/
    public function __construct($columnName, $value, $condition){
        parent::$_columnName = $columnName;
        $this->_condition = $condition;
        $this->_value = $value;
    }

    /**
    * Magic method to convert criteria into string
    * @return string Stat query criteria
    **/
    public function __toString(){
        return sprintf("Stats: %s %s %s", strval(parent::$_columnName), strval($this->_condition), strval($this->_value));
    }


  }
