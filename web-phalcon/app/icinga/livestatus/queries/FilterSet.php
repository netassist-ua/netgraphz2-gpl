<?php
  namespace NetAssist\Icinga\LiveStatus\Queries;

  /**
  *   LiveStatus query expression
  *   Used to combine filters in various ways
  **/
  class FilterSet extends Criteria {
      /**
      * @var \NetAssist\Icinga\LiveStatus\Queries\Expression Expression to use
      **/
      private $_type;

      /**
      * @var \NetAssist\Icinga\LiveStatus\Queries|Criteria[] Criteria array
      **/
      private $_criteria_array;

      /**
      *   Constructor
      *   @param \NetAssist\Icinga\LiveStatus\Expressions\Expression $type Expression
      **/
      function __construct($type){
          $this->_type = $type;
          $this->_criteria_array = array();
      }

      /**
      * Push criteria into queue
      * @param \NetAssist\Icinga\LiveStatus\Criteria Criteria to push back
      * @return \NetAssist\Icinga\LiveStatus\FilterSet Instance
      **/
      public function pushCriteria($criteria){
          array_push($this->_criteria_array, $criteria);
          return $this;
      }


      public function __toString(){
          $str = "";
          foreach ($this->_criteria_array as $c) {
              $str .= strval($c);
              if(count($this->_criteria_array) > 1)
                $str .= "\n";
          }
          if($this->_type == Expression::EXP_NOT){
            $str .= "Negate: ";
          }
          else {
            if(count($this->_criteria_array) > 1){
              $str .= sprintf("%s: %d", strval($this->_type), count($this->_criteria_array));
            }
          }
          return $str;
      }
  }
