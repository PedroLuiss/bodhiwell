<?php

namespace App\Services;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PasswordRecoveryService
{
    public function __construct(
        private EntityManagerInterface $em,
        private MailerInterface $mailer,
        private UrlGeneratorInterface $router,
        private UserPasswordHasherInterface $passwordHasher,
        private string $frontendUrl 
    ) {}

    public function requestRecovery(string $email): void
    {
        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) return;

        $token = bin2hex(random_bytes(32));
        $user->setResetPasswordToken($token);
        $user->setResetTokenExpiresAt((new \DateTime())->modify('+1 hour'));

        $this->em->flush();

        $resetUrl = $this->frontendUrl . '/reset-password?token=' . $token;

        $emailMessage = (new TemplatedEmail())
            ->from('no-reply@tusitio.com')
            ->to($user->getEmail())
            ->subject('Recuperación de contraseña')
            ->htmlTemplate('emails/password_recovery.html.twig')
            ->context([
                'user' => $user,
                'reset_link' => $resetUrl,
            ]);

        $this->mailer->send($emailMessage);
    }

    public function resetPassword(string $token, string $newPassword): void
    {
        $user = $this->em->getRepository(User::class)->findOneBy(['resetPasswordToken' => $token]);

        if (!$user || $user->getResetTokenExpiresAt() < new \DateTime()) {
            throw new \RuntimeException('Token inválido o expirado.');
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $newPassword));
        $user->setResetPasswordToken(null);
        $user->setResetTokenExpiresAt(null);

        $this->em->flush();
    }
}