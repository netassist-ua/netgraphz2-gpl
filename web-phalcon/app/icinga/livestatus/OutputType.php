<?php

namespace NetAssist\Icinga\LiveStatus;

/**
* Output data format enum
*/

class OutputType extends \SplEnum {
    const __default = self::JSON;

    const JSON = "json";
    const CSV = "csv";
    const Python = "python";

}
