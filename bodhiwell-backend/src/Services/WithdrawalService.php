<?php

namespace App\Services;

use App\Repository\WithdrawalRepository;
use App\Entity\User;

class WithdrawalService
{
    public function __construct(private WithdrawalRepository $repo) {}

    /**
     * Obtiene retiros ordenados por fecha.
     * @param string $order ASC|DESC
     */
    public function getWithdrawals(string $order = 'DESC'): array
    {
        $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';
        return $this->repo->findAllOrdered($order);
    }
    
    /**
     * Obtiene retiros de un usuario específico ordenados por fecha.
     * @param User $user
     * @param string $order ASC|DESC
     */
    public function getWithdrawalsByUser(User $user, string $order = 'DESC'): array
    {
        $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';
        return $this->repo->findBy(['professional' => $user], ['createdAt' => $order]);
    }
}
