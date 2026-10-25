<?php

namespace App\Controller\Admin;

use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AvailabilityStatsController extends AbstractController
{
    #[Route('/admin/stats/availability/grouped', name: 'admin_availability_grouped')]
    public function grouped(AdminUrlGenerator $adminUrlGenerator): Response
    {
        return $this->redirect($adminUrlGenerator
            ->setController(AvailabilityCrudController::class)
            ->setAction('viewGrouped')
            ->generateUrl());
    }
}
