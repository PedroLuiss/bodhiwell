<?php

namespace App\Command;

use App\Entity\ProfessionalWallet;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:wallets:backfill', description: 'Crea wallets para profesionales sin wallet')]
class BackfillProfessionalWalletsCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $userRepo    = $this->em->getRepository(User::class);
        $walletRepo  = $this->em->getRepository(ProfessionalWallet::class);

        $professionals = $userRepo->createQueryBuilder('u')
            ->andWhere('u.type_account = :type')
            ->setParameter('type', 'professional')
            ->getQuery()
            ->getResult();

        $created = 0;

        foreach ($professionals as $pro) {
            if ($walletRepo->findOneBy(['professional' => $pro])) {
                continue;
            }
            $wallet = new ProfessionalWallet();
            $wallet->setProfessional($pro);
            $this->em->persist($wallet);
            $created++;
        }

        if ($created > 0) {
            $this->em->flush();
        }

        $output->writeln("Wallets creadas: {$created}");
        $output->writeln('Backfill completado.');
        return Command::SUCCESS;
    }
}


// para crear las wallet de los proefesionales que no las tienen
//  ejecutar:
//  bin/console app:wallets:backfill