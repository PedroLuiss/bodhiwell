<?php

namespace App\Utils;

use App\Entity\User;

class UserSerializer
{

    public static function serializeForAuth(User $user): array
    {
        return [
            'uid' => $user->getUid(),
            'email' => $user->getEmail(),
            'username' => $user->getUsername(),
            'first_name' => $user->getFirstName(),
            'last_name' => $user->getLastName(),
            'type_account' => $user->getTypeAccount(),
        ];
    }

    public static function serialize(User $user): array
    {
        return [
            'uid' => $user->getUid(),
            'email' => $user->getEmail(),
            'username' => $user->getUsername(),
            'first_name' => $user->getFirstName(),
            'last_name' => $user->getLastName(),
            'type_account' => $user->getTypeAccount(),
        ];
    }
}
