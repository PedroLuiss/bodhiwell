<?php

namespace App\Doctrine\Middleware;

use Doctrine\DBAL\Driver;
use Doctrine\DBAL\Driver\Middleware\AbstractDriverMiddleware;

class TimezoneDriver extends AbstractDriverMiddleware
{
    public function connect(array $params): Driver\Connection
    {
        return new TimezoneConnection(parent::connect($params));
    }
}
