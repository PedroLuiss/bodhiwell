<?php

namespace App\Enum;

enum NotificationTypeEnum: string
{
    case BOOKING = 'BOOKING';
    case PAYMENT = 'PAYMENT';
    case SYSTEM = 'SYSTEM';
    case REMINDER = 'REMINDER';
}
