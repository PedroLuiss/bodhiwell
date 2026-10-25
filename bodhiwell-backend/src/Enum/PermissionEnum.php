<?php

namespace App\Enum;

enum PermissionEnum: string
{
    case DETAIL    = 'DETALLE';
    case VIEW      = 'VER';
    case EDIT      = 'EDITAR';
    case CREATE    = 'CREAR';
    case DELETE    = 'ELIMINAR';
    case AUTHORIZE = 'AUTORIZAR';
}
