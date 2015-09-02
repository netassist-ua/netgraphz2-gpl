<?php
  namespace NetAssist\Utils\Types;

  /**
  * Additional utilitis to work with string properties
  **/
  class StringUtils {
    /**
    * Try to get string value by array key, returns empty string if key is unset
    * @param mixed $key Key to get string value
    * @param array $array Array to get from
    * @return string String value or empty string
    **/
    public static function TryGetStrArrKeyOrEmpty($key, $array){
        if(!array_key_exists($key, $array))
          return "";
        $val = $array[$key];
        return is_string($val) ? $val : strval($val);
    }

    /**
    * Try to get string value by array key, returns null if key is unset
    * @param mixed $key Key to get string value
    * @param array $array Array to get from
    * @return string|null String value or null
    **/
    public static function TryGetStrArrKeyOrNull($key, $array){
      if(!array_key_exists($key, $array))
        return null;
      $val = $array[$key];
      return is_string($val) ? $val : strval($val);
    }

  }
