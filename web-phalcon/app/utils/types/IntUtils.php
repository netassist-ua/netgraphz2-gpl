<?php
  namespace NetAssist\Utils\Types;

  /**
  * Additional utilitis to work with intenger properties
  **/
  class IntUtils {
    /**
    * Try to get integer value of array by key, returns empty string if key is unset
    * @param mixed $key Key to get string value
    * @param array $array Array to get from
    * @return int|null value or null
    **/
    public static function TryGetIntArrKeyOrNull($key, $array){
        if(!array_key_exists($key, $array))
          return null;
        $val = $array[$key];
        return is_int($val) ? $val : intval($val);
    }

  }
