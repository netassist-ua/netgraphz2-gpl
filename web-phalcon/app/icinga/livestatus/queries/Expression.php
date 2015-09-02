<?php

namespace NetAssist\Icinga\LiveStatus\Queries;

/**
* Exression types enum
**/
class Expression extends \SplEnum {
    const __default = self::EXP_AND;

    const EXP_AND = 'And';
    const EXP_OR = 'Or';
    const EXP_NOT = 'Negate';
}
