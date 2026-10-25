<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\Security;

use App\Entity\User;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Mime\Email;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Auth')]
class SecurityController extends AbstractController
{
    #[Route(path: '/login', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        if ($this->getUser()) {
            return new RedirectResponse($this->generateUrl('admin'));
        }

        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    #[Route('/register', name: 'api_register', methods: ['POST'])]
    #[OA\Post(
        path: '/register',
        summary: 'Registrar un nuevo usuario (vía SecurityController)',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                    new OA\Property(property: 'name', type: 'string', example: 'John'),
                    new OA\Property(property: 'lastname', type: 'string', example: 'Doe')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Usuario registrado'),
            new OA\Response(response: 400, description: 'Faltan campos requeridos')
        ]
    )]
    public function register(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        MailerInterface $mailer,
        ParameterBagInterface $params
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'], $data['name'], $data['lastname'])) {
            return new JsonResponse(['error' => 'Faltan campos requeridos'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $baseUrl = $params->get('APP_BASE_URL');

        $uid = Uuid::uuid4()->toString();

        $rawUsername = explode('@', filter_var($data['email'], FILTER_SANITIZE_EMAIL))[0];
        $sanitizedUsername = preg_replace('/[^a-zA-Z0-9]/', '', $rawUsername);

        $user = new User();
        $user->setEmail($data['email']);
        $user->setUsername($sanitizedUsername . '_' . $uid);
        $user->setFirstName($data['name']);
        $user->setLastName($data['lastname']);
        $user->setRoles(['ROLE_USER']);
        $user->setUid($uid);
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setUpdatedAt(new \DateTimeImmutable());

        $verificationToken = bin2hex(random_bytes(32));
        $user->setVerificationToken($verificationToken);

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        $verificationUrl = sprintf("%s/verify/%s", $baseUrl, $verificationToken);

        $email = (new Email())
            ->from('no-reply@tu-app.com')
            ->to($user->getEmail())
            ->subject('Verifica tu cuenta')
            ->html(sprintf('<p>Confirm your account by clicking this button:</p> <a href="%s" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #0d6efd; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Account
            </a>', $verificationUrl));

        $mailer->send($email);

        return new JsonResponse([
            'message' => 'User successfully registered. Verify your account from the email sent.',
            'uid' => $user->getUid()
        ], JsonResponse::HTTP_CREATED);
    }
}
