<?php

namespace App\Mailer;

use App\Entity\User;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Psr\Log\LoggerInterface;

class UserMailer
{
    public function __construct(
        private MailerInterface $mailer,
        private string $platformUrl,
        private string $fromEmail,
        private string $fromName,
        private LoggerInterface $logger,
        private string $backendUrl,
        private string $projectDir,
    ) {}

    public function sendWelcome(User $user): void
    {
        if (!$user->getEmail()) {
            return;
        }

        $this->send(
            $user->getEmail(),
            'emails/user/welcome.html.twig',
            '¡Bienvenido a Bodhiwell!',
            [
                'user' => $user,
                'portalUrl' => rtrim($this->platformUrl, '/'),
            ]
        );
    }

    public function sendNewsletter(User $user, string $title, string $body): void
    {
        if (!$user->getEmail()) {
            return;
        }

        $this->send(
            $user->getEmail(),
            'emails/user/newsletter.html.twig',
            $title,
            [
                'user' => $user,
                'newsletterTitle' => $title,
                'newsletterBody' => $body,
                'portalUrl' => rtrim($this->platformUrl, '/'),
            ]
        );
    }

    public function sendProfileApproved(User $user): void
    {
        if (!$user->getEmail()) {
            return;
        }

        $this->send(
            $user->getEmail(),
            'emails/professional/profile_approved.html.twig',
            '¡Tu perfil profesional ha sido aprobado!',
            [
                'user' => $user,
                'portalUrl' => rtrim($this->platformUrl, '/'),
            ]
        );
    }

    public function sendProfileRejected(User $user): void
    {
        if (!$user->getEmail()) {
            return;
        }

        $this->send(
            $user->getEmail(),
            'emails/professional/profile_rejected.html.twig',
            'Actualización sobre tu perfil profesional',
            [
                'user' => $user,
                'portalUrl' => rtrim($this->platformUrl, '/'),
            ]
        );
    }

    public function sendPasswordReset(User $user, string $token): void
    {
        if (!$user->getEmail()) {
            return;
        }

        $resetLink = rtrim($this->platformUrl, '/') . '/reset-password?token=' . $token;

        $this->send(
            $user->getEmail(),
            'emails/password_recovery.html.twig',
            'Recuperación de contraseña',
            [
                'user' => $user,
                'reset_link' => $resetLink,
            ]
        );
    }

    private function send(string $to, string $template, string $subject, array $context = []): void
    {
        if (!isset($context['assetUrl'])) {
            $context['assetUrl'] = rtrim($this->backendUrl, '/');
        }

        try {
            $email = (new TemplatedEmail())
                ->from(new Address($this->fromEmail, $this->fromName))
                ->to(new Address($to))
                ->subject($subject)
                ->htmlTemplate($template)
                ->context($context);





            $this->mailer->send($email);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to send user email', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
