<?php

namespace App\Enum;

enum RoleEnum: string
{
    // case OWNER = 'ROLE_OWNER'; // Exist Role OWNER but only adding for commands for security.
    case ADMIN = 'ROLE_ADMIN';
    case USER  = 'ROLE_USER';
}
