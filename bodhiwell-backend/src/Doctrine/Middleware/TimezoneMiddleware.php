<?php

namespace App\Doctrine\Middleware;

use Doctrine\DBAL\Driver;
use Doctrine\DBAL\Driver\Middleware;

class TimezoneMiddleware implements Middleware
{
    public function wrap(Driver $driver): Driver
    {
        return new TimezoneDriver($driver);
    }
}
