<?php

namespace App\Services;

use App\Entity\User;
use App\Entity\UserDetails;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpClient\HttpClient;
use App\Services\FirebaseService;
use App\Repository\UserRepository;
use App\Repository\UserDetailsRepository;
use App\Services\WalletService;
use Ramsey\Uuid\Uuid;
use App\Services\Notification\NotificationManager;
use App\Enum\NotificationTypeEnum;
use App\Enum\UserStatusEnum;
use App\Mailer\UserMailer;

class AuthService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTEncoderInterface $jwtEncoder,
        private UserDetailsRepository $userDetailsRepository,
        private UserRepository $userRepository,
        private WalletService $walletService,
        private NotificationManager $notificationManager,
        private UserMailer $userMailer,
    ) {}

    public function getUserFromJWT(Request $request): ?User
    {
        $jwt = str_replace('Bearer ', '', $request->headers->get('Authorization') ?? '');
        $payload = $jwt ? $this->jwtEncoder->decode($jwt) : null;

        return $payload && !empty($payload['username'])
            ? $this->entityManager->getRepository(User::class)->findOneBy(["username" => $payload['username']])
            : null;
    }

    public function register(array $data): array
    {
        if (empty($data['email'])) {
            throw new \InvalidArgumentException('El email es obligatorio');
        }
        if (empty($data['password'])) {
            throw new \InvalidArgumentException('La contraseña es obligatoria');
        }

        $existingEmail = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingEmail) {
            throw new \RuntimeException('Este correo ya está registrado');
        }

        $typeRaw       = $data['type_account']        ?? null;
        $shortDesc     = $data['short_description']   ?? null;

        if ($typeRaw === null) {
            throw new \InvalidArgumentException('El campo type_account es obligatorio.');
        }
        $type = strtolower((string) $typeRaw);
        if (!in_array($type, ['patient', 'professional'], true)) {
            throw new \InvalidArgumentException('type_account inválido (use "patient" o "professional").');
        }


        $conn = $this->entityManager->getConnection();
        $conn->beginTransaction();

        try {
            $user = new User();
            $user->setEmail($data['email']);
            $user->setFirstName($data['first_name'] ?? null);
            $user->setLastName($data['last_name'] ?? null);
            $user->setUid(Uuid::uuid4()->toString());
            $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
            $user->setRoles(['ROLE_USER']);
            $user->setCreatedAt(new \DateTimeImmutable());
            $user->setUpdatedAt(new \DateTimeImmutable());
            $user->setTypeAccount($type);
            if ($type === 'professional') {
                $user->setStatus(\App\Enum\UserStatusEnum::PENDING_COMPLETION->value);
            }
            $user->setNewsletterActive($data['newsletter_active'] ?? false);

            $baseUsername = explode('@', $data['email'])[0];
            $tryUsername  = $baseUsername;
            $i = 0;
            while ($this->entityManager->getRepository(User::class)->findOneBy(['username' => $tryUsername])) {
                $i++;
                $tryUsername = $baseUsername . '_' . $i;
            }
            $user->setUsername($tryUsername);

            $errors = $this->validator->validate($user);
            if (count($errors) > 0) {
                $messages = array_map(fn($e) => $e->getMessage(), iterator_to_array($errors));
                throw new \RuntimeException(implode(', ', $messages));
            }

            $this->entityManager->persist($user);

            $details = new UserDetails();
            $details->setUser($user);
            if (method_exists($user, 'setUserDetails')) {
                $user->setUserDetails($details);
            }

            $details->setMainProfession(null);

            if ($shortDesc !== null) {
                $details->setShortDescription($shortDesc);
            }

            $this->entityManager->persist($details);

            $this->entityManager->flush();

            if ($user->getTypeAccount() === 'professional') {
                $this->walletService->getOrCreateWalletForProfessional($user);
            }

            $this->entityManager->flush();
            $conn->commit();

            try {
                $this->notificationManager->notifyUser(
                    $user,
                    NotificationTypeEnum::SYSTEM,
                    '¡Bienvenido a Bodhiwell!',
                    sprintf('Hola %s, gracias por unirte a nuestra comunidad. Completa tu perfil para comenzar.', $user->getFirstName() ?? $user->getUsername()),
                    ['action' => 'complete_profile']
                );

                $this->userMailer->sendWelcome($user);
            } catch (\Throwable $e) {
            }

            return ['user' => $user];
        } catch (\Throwable $e) {
            $conn->rollBack();
            $this->entityManager->clear();
            throw $e;
        }
    }

    public function login(string $email, string $password): User
    {
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            throw new \RuntimeException('Usuario no encontrado');
        }

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            throw new \RuntimeException('Credenciales incorrectas');
        }

        return $user;
    }

    public function loginWithFirebase(string $idToken, FirebaseService $firebaseService, string $projectDir, ?string $typeAccount = null, bool $newsletterActive = false): User
    {
        $verifiedIdToken = $firebaseService->verifyToken($idToken);
        if (!$verifiedIdToken) {
            throw new \RuntimeException('Token de Firebase inválido');
        }

        $claims = $verifiedIdToken->claims();

        $email = $claims->get('email');
        if (!$email) {
            throw new \RuntimeException('El ID token no contiene un email válido.');
        }

        $uid   = $claims->get('user_id');

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            $user = new User();
            $user->setEmail($email);
            $user->setUid($uid);
            $user->setUsername(strtolower(str_replace(' ', '_', $claims->get('name') ?? explode('@', $email)[0])));
            $user->setRoles(['ROLE_USER']);
            $user->setCreatedAt(new \DateTimeImmutable());
            $user->setUpdatedAt(new \DateTimeImmutable());
            $user->setNewsletterActive($newsletterActive);

            $type = strtolower((string) $typeAccount);
            if (in_array($type, ['patient', 'professional'], true)) {
                $user->setTypeAccount($type);
                if ($type === 'professional') {
                    $user->setStatus(UserStatusEnum::PENDING_COMPLETION->value);
                }
            } else {
                $user->setTypeAccount(null);
            }

            if ($claims->has('name')) {
                $fullName = explode(' ', $claims->get('name'), 2);
                $user->setFirstName($fullName[0] ?? null);
                $user->setLastName($fullName[1] ?? null);
            }

            $user->setPassword(password_hash(bin2hex(random_bytes(8)), PASSWORD_BCRYPT));

            $details = new UserDetails();
            $details->setUser($user);
            if (method_exists($user, 'setUserDetails')) {
                $user->setUserDetails($details);
            }

            if ($claims->has('picture')) {
                $uploadsDir = $projectDir . '/public/uploads';
                if (!is_dir($uploadsDir)) {
                    mkdir($uploadsDir, 0755, true);
                }
                try {
                    $httpClient = HttpClient::create();
                    $photoContent = $httpClient->request('GET', $claims->get('picture'))->getContent();
                    $fileName = uniqid() . '.jpg';
                    file_put_contents($uploadsDir . '/' . $fileName, $photoContent);
                    $details->setImage('/uploads/' . $fileName);
                } catch (\Exception $e) {
                }
            }

            $this->userRepository->save($user, false);
            $this->userDetailsRepository->save($details);
            $this->entityManager->refresh($user);

            try {
                $this->notificationManager->notifyUser(
                    $user,
                    NotificationTypeEnum::SYSTEM,
                    '¡Bienvenido a Bodhiwell!',
                    sprintf('Hola %s, gracias por unirte a nuestra comunidad. Completa tu perfil para comenzar.', $user->getFirstName() ?? $user->getUsername()),
                    ['action' => 'complete_profile']
                );

                $this->userMailer->sendWelcome($user);
            } catch (\Throwable $e) {
            }

            return $user;
        }

        $details = $user->getUserDetails();
        if (!$details) {
            $details = $this->userDetailsRepository->findOneBy(['user' => $user]);
            if (!$details) {
                $details = new UserDetails();
                $details->setUser($user);
                $this->entityManager->persist($details);
            }
            if (method_exists($user, 'setUserDetails')) {
                $user->setUserDetails($details);
            }
        }

        if ($claims->has('picture') && !$details->getImage()) {
            $uploadsDir = $projectDir . '/public/uploads';
            if (!is_dir($uploadsDir)) {
                mkdir($uploadsDir, 0755, true);
            }
            try {
                $httpClient = HttpClient::create();
                $photoContent = $httpClient->request('GET', $claims->get('picture'))->getContent();
                $fileName = uniqid() . '.jpg';
                file_put_contents($uploadsDir . '/' . $fileName, $photoContent);
                $details->setImage('/uploads/' . $fileName);
            } catch (\Exception $e) { /* noop */
            }
        }

        $user->setUpdatedAt(new \DateTimeImmutable());
        $this->entityManager->flush();
        $this->entityManager->refresh($user);

        return $user;
    }
}
