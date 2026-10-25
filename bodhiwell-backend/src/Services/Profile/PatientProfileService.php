<?php

namespace App\Services\Profile;

use App\Dto\Profile\UpdatePatientProfileDto;
use App\Entity\User;
use App\Entity\UserDetails;
use App\Utils\SafeRichText;
use App\Utils\FileUploadUtil;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use App\Repository\UserDetailsRepository;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PatientProfileService
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        private FileUploadUtil $uploader,
        private SafeRichText $safeRichText,
        private UserRepository $userRepository,
        private UserDetailsRepository $userDetailsRepository,
    ) {}

    public function updateProfile(User $user, UpdatePatientProfileDto $dto, ?UploadedFile $uploadedFile): UserDetails
    {
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $e) {
                $messages[] = $e->getPropertyPath() . ': ' . $e->getMessage();
            }
            throw new \InvalidArgumentException('Validación: ' . implode(' | ', $messages));
        }

        try {
            $details = $user->getUserDetails() ?? (new UserDetails())->setUser($user);

            $user->setFirstName($dto->first_name);
            $user->setLastName($dto->last_name);
            $user->setDni($dto->dni);

            if ($dto->date_birth) {
                $d = \DateTime::createFromFormat('Y-m-d', $dto->date_birth);
                if (!$d) {
                    throw new HttpException(
                        422,
                        'Validación: date_birth con formato inválido (YYYY-MM-DD).'
                    );
                }
                $d->setTime(0, 0, 0);
                $details->setDateBirth($d);
            }

            $details->setPhone($dto->phone);
            if ($dto->phone !== null) {
                $user->setPhoneNumber($dto->phone);
            }
            $details->setGender($dto->gender);
            $details->setZipcode($dto->zipcode);
            $details->setAddress($dto->address);
            $details->setCity($dto->city);
            $details->setAbout($dto->about);
            if ($dto->country) {
                $details->setCountry($dto->country->value);
            }

            if ($dto->medical_condition !== null) {
                $html = $this->safeRichText->toSafeHtml($dto->medical_condition);
                $details->setMedicalCondition($html);
            }

            if ($uploadedFile instanceof UploadedFile) {
                $filename = $this->uploader->upload($uploadedFile, 'profile_images');
                $details->setImage($filename);
            }

            $this->userRepository->save($user, false);
            $this->userDetailsRepository->save($details, true);

            return $details;
        } catch (\Throwable $th) {
            throw new HttpException(500, 'Error al actualizar el perfil, contacte con soporte');
        }
    }
}
