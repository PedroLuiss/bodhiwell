<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;
use Symfony\Component\HttpKernel\KernelInterface;

class FirebaseService
{
    private Auth $auth;

    public function __construct(KernelInterface $kernel)
    {
        $projectDir = $kernel->getProjectDir();
        $credentialsPath = $projectDir . '/config/firebase/firebase_credentials.json';

        if (!file_exists($credentialsPath)) {
            throw new \RuntimeException("Credenciales de Firebase no encontradas en: $credentialsPath");
        }

        $factory = (new Factory())->withServiceAccount($credentialsPath);
        $this->auth = $factory->createAuth();
    }

    public function verifyToken(string $idToken)
    {
        return $this->auth->verifyIdToken($idToken);
    }

    public function getUser(string $uid)
    {
        return $this->auth->getUser($uid);
    }
}