<?php
  namespace NetAssist\Icinga\LiveStatus\Queries\Stat;

  /**
  * Combines several statistical criterias into group by expression
  * like StatAnd, StatOr, etc.
  **/
  class StatSet extends StatCriteria {
    /**
    * @var \NetAssist\Icinga\LiveStatus\Queries\Expression Expression type for stats set
    **/
    private $_type;

    /**
    *  @var \NetAssist\Icinga\LiveStatus\Queries\Stat\StatCriteria[] Collection of stat criterias
    **/
    private $_criterias;

    /**
    * Constructor
    * @param \NetAssist\Icinga\LiveStatus\Queries\Expression $type Type of expression to build
    **/
    public function __construct($type){
        $this->_type = $type;
        $this->_criterias = [];
    }

    /**
    * Add criteria into set
    * @param \NetAssist\Icinga\LiveStatus\Queries\Stat\StatCriteria $criteria Criteria to add
    * @return \NetAssist\Icinga\LiveStatus\Queries\Stat\StatSet Instance
    **/
    public function addCriteria($criteria){
      array_push($this->_criterias, $criteria);
      return this;
    }

    public function __toString(){
        $str = "";
        foreach ($this->_criteria_array as $c) {
            $str .= strval(c);
            $str .= "\n";
        }
        if($this->_type == Expression::EXP_NOT){
          $str .= "StatsNegate: ";
        }
        else {
          $str .= sprintf("Stats%s: %d", strval($this->_type), count($this->_criterias));
        }
        $str .= "\n";
        return $str;
    }
    
  }
