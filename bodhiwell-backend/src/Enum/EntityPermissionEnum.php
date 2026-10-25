<?php

namespace App\Enum;

class EntityPermissionEnum
{
    public static function getPermissionsByEntity(): array
    {
        return [
            'PROFESSION' => [
                PermissionEnum::VIEW, PermissionEnum::DETAIL, 
                PermissionEnum::EDIT, PermissionEnum::CREATE, 
                PermissionEnum::DELETE, PermissionEnum::AUTHORIZE
            ],
            'STUDIES' => [
                PermissionEnum::VIEW, PermissionEnum::DETAIL, 
                PermissionEnum::EDIT, PermissionEnum::CREATE, 
                PermissionEnum::DELETE, PermissionEnum::AUTHORIZE
            ],
            'USER' => [
                PermissionEnum::VIEW, PermissionEnum::DETAIL, 
                PermissionEnum::EDIT, PermissionEnum::CREATE, 
                PermissionEnum::DELETE, PermissionEnum::AUTHORIZE
            ],
            'USER_CERTIFICATE' => [
                PermissionEnum::VIEW, PermissionEnum::DETAIL, 
                PermissionEnum::EDIT, PermissionEnum::CREATE, 
                PermissionEnum::DELETE, PermissionEnum::AUTHORIZE
            ],
            'USER_DETAILS' => [
                PermissionEnum::VIEW, PermissionEnum::DETAIL, 
                PermissionEnum::EDIT, PermissionEnum::CREATE, 
                PermissionEnum::DELETE, PermissionEnum::AUTHORIZE
            ],
            'BOOKING' => [
                PermissionEnum::VIEW, PermissionEnum::DETAIL, 
                PermissionEnum::EDIT, PermissionEnum::CREATE, 
                PermissionEnum::DELETE, PermissionEnum::AUTHORIZE
            ],
            'AVAILABILITY' => [
                PermissionEnum::VIEW, PermissionEnum::DETAIL, 
                PermissionEnum::EDIT, PermissionEnum::CREATE, 
                PermissionEnum::DELETE, PermissionEnum::AUTHORIZE
            ],
        ];
    }
}
