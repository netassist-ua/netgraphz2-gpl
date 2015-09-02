<?php
namespace NetAssist\Icinga\LiveStatus\Requests;

  /**
  * Request method enum
  */

 class RequestMethod extends \SplEnum {
  const ___default = self::GET;

  const GET = 0;
  const COMMAND = 1;
}
