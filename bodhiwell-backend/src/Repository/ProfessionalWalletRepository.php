<?php

namespace App\Repository;

use App\Entity\ProfessionalWallet;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Ramsey\Uuid\Uuid;

class ProfessionalWalletRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProfessionalWallet::class);
    }

    public function getOrCreateByProfessional(User $professional): ProfessionalWallet
    {
        $wallet = null;

        if ($professional->getId() !== null) {
            $wallet = $this->findOneBy(['professional' => $professional]);
            if ($wallet) {
                return $wallet;
            }
        }

        $wallet = new ProfessionalWallet();
        $wallet->setProfessional($professional);
        if (method_exists($wallet, 'getUid') && !$wallet->getUid()) {
            $wallet->setUid(Uuid::uuid4()->toString());
        }
        $wallet->setAvailableBalance(0);
        $wallet->setFrozenBalance(0);
        $wallet->setCreatedAt(new \DateTimeImmutable());
        $wallet->setUpdatedAt(new \DateTimeImmutable());

        $this->getEntityManager()->persist($wallet);

        return $wallet;
    }
}
