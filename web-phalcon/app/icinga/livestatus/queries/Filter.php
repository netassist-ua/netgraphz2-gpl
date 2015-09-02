<?php
  namespace NetAssist\Icinga\LiveStatus\Queries;

  /**
  * Live status query filter
  * Performs test of conditions on fields
  **/
  class Filter extends Criteria {

    /**
    * @var string $fieldName Name of field
    **/
    private $_fieldName;

    /**
    * @var string $value Field value to filter
    **/
    private $_value;

    /**
    * @var \NetAssist\Icinga\LiveStatus\Queries\Condition Condition to test
    **/
    private $_condition;

    /**
    * Constructor
    * @param string $fieldName Name of field to test
    * @param mixed $value Value to test
    * @param \NetAssist\Icinga\LiveStatus\Queries\Condition $condition Condition to test
    **/

   function __construct($fieldName, $value, $condition=Condition::EQUALS){
      $this->_fieldName = $fieldName;
      $this->_value = $value;
      $this->_condition = $condition;
   }

   /**
   *  Makes query string from filter
   **/
   public function __toString(){
      return sprintf("Filter: %s %s %s", $this->_fieldName, strval($this->_condition), strval($this->_value));
   }

}
