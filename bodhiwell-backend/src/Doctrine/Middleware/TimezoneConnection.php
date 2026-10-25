<?php

namespace App\Doctrine\Middleware;

use Doctrine\DBAL\Driver\Connection;
use Doctrine\DBAL\Driver\Middleware\AbstractConnectionMiddleware;

class TimezoneConnection extends AbstractConnectionMiddleware
{
    public function __construct(Connection $connection)
    {
        parent::__construct($connection);

        $this->exec("SET time_zone = '-03:00'");
    }
}
