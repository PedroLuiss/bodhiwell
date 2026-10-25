<?php

namespace App\MessageHandler;

use App\Message\SendBookingEmailMessage;
use App\Repository\BookingRepository;
use App\Repository\UserRepository;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Address;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Psr\Log\LoggerInterface;

#[AsMessageHandler]
class SendBookingEmailHandler
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private UserRepository $userRepository,
        private MailerInterface $mailer,
        private string $fromEmail,
        private string $fromName,
        private string $platformUrl,
        private LoggerInterface $logger,
        private string $backendUrl,
        private string $projectDir
    ) {}

    public function __invoke(SendBookingEmailMessage $message): void
    {
        $booking = $this->bookingRepository->find($message->getBookingId());

        if (!$booking) {
            $this->logger->warning('Booking not found for async email', [
                'bookingId' => $message->getBookingId()
            ]);
            return;
        }

        $user = $this->userRepository->find($message->getUserId());

        if (!$user || !$user->getEmail()) {
            $this->logger->warning('User not found or has no email for booking email', [
                'userId' => $message->getUserId(),
                'bookingId' => $booking->getId()
            ]);
            return;
        }

        $emailType = $message->getEmailType();

        $template = match ($emailType) {
            'created' => 'emails/booking/created.html.twig',
            'canceled' => 'emails/booking/canceled.html.twig',
            'confirmed' => 'emails/booking/confirmed.html.twig',
            'reminder' => 'emails/booking/reminder.html.twig',
            'pending_payment' => 'emails/booking/pending_payment.html.twig',
            'friendly_reminder' => 'emails/booking/payment_reminder_friendly.html.twig',
            'urgent_reminder' => 'emails/booking/payment_reminder_urgent.html.twig',
            default => null
        };

        $isProfessional = ($booking->getProfessionalUser() && $user->getId() === $booking->getProfessionalUser()->getId());

        $subject = match ($emailType) {
            'created' => $isProfessional ? 'Nueva reserva creada contigo' : 'Tu reserva fue creada',
            'canceled' => $isProfessional ? 'Reserva cancelada' : 'Tu reserva fue cancelada',
            'confirmed' => $isProfessional ? 'Pago Recibido - Reserva Confirmada' : '¡Tu reserva ha sido confirmada!',
            'reminder' => 'Recordatorio de cita',
            'pending_payment' => 'Pago Iniciado - Pendiente de Confirmación',
            'friendly_reminder' => 'Recordatorio: Completa tu pago',
            'urgent_reminder' => 'URGENTE: Tu reserva va a expirar',
            default => 'Notificación de reserva'
        };

        if (!$template) {
            $this->logger->error('Invalid email type for booking', [
                'emailType' => $emailType,
                'bookingId' => $booking->getId()
            ]);
            return;
        }

        try {
            $email = (new TemplatedEmail())
                ->from(new Address($this->fromEmail, $this->fromName))
                ->to(new Address($user->getEmail()))
                ->subject($subject)
                ->htmlTemplate($template)
                ->context([
                    'booking' => $booking,
                    'recipient' => $user,
                    'portalUrl' => rtrim($this->platformUrl, '/'),
                    'assetUrl' => rtrim($this->backendUrl, '/'),
                    'isProfessional' => $isProfessional,
                ]);



            $this->mailer->send($email);
        } catch (\Throwable $e) {
            $this->logger->error('Failed to send booking email', [
                'bookingId' => $booking->getId(),
                'userId' => $user->getId(),
                'recipientEmail' => $user->getEmail(),
                'emailType' => $emailType,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
