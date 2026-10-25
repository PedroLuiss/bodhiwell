<?php

namespace App\Services;

use App\Entity\User;
use Ramsey\Uuid\Uuid;
use App\Utils\FileUploadUtil;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class UserRelationSyncService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private FileUploadUtil $fileUploadUtil,
    ) {}

    public function sync(User $user): void
    {
        foreach ($user->getStudies() as $study) {
            $study->setUser($user);

            $uploadedFile = $study->getFromFile();
            if ($uploadedFile instanceof UploadedFile) {
                $urlFile = $this->fileUploadUtil->upload($uploadedFile, 'certificates');
                $study->setUrlCertificate($urlFile);
            }

            if ($study->getUid() === null) {
                $study->setUid(Uuid::uuid4()->toString());
            }

            if ($study->getCreatedAt() === null) {
                $study->setCreatedAt(new \DateTimeImmutable());
            }
            $study->setUpdatedAt(new \DateTimeImmutable());
            $this->entityManager->persist($study);
        }

        foreach ($user->getProfessions() as $profession) {
            $profession->addUser($user);
            $this->entityManager->persist($profession);
        }
    }
}
