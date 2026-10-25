<?php

namespace App\Services;

use App\Entity\User;
use App\Services\AuthService;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class PermissionService
{
    public function __construct(
        private AuthService $authService,
        private Security $security
    ){}

    public function getUserOrFail(): User
    {
        $user = $this->security->getUser();
        
        if (!$user) {
            throw new AccessDeniedException("Acceso denegado.");
        }

        return $user;
    }

    public function hasRoleOrFail(Request $request, string $role): void
    {
        $user = $this->getUserOrFail($request);

         if (in_array('ROLE_OWNER', $user->getRoles())) {
            return;
        }

        if (!in_array($role, $user->getRoles())) {
            throw new AccessDeniedException("Acceso denegado: No tienes el rol requerido ($role).");
        }
    }

    public function hasPermissionOrFail(Request $request, string $entity, string $action): void
    {
        $user = $this->getUserOrFail($request);

        if (in_array('ROLE_OWNER', $user->getRoles())) {
            return;
        }

        if (!isset($user->getPermissions()[$entity]) || !in_array($action, $user->getPermissions()[$entity])) {
            throw new AccessDeniedException("Acceso denegado: No tienes permisos para realizar esta acción.");
        }
    }
}
