<?php

// src/Controller/FirebaseTestController.php
namespace App\Controller;

use App\Services\FirebaseService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class FirebaseTestController
{
    #[Route('/test/firebase')]
    public function test(FirebaseService $firebaseService): Response
    {
        try {
            $firebaseService->getUser('fake-id');
        } catch (\Throwable $e) {
            return new Response('✅ Servicio Firebase funciona: ' . $e->getMessage());
        }

        return new Response('❌ Esto no debería ocurrir, el usuario fake debería fallar.');
    }
}