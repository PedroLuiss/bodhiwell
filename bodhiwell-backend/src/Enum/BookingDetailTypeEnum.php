<?php

namespace App\Enum;

enum BookingDetailTypeEnum: string
{
    case ADDRESS = 'address';
    case MEETING_LINK = 'meetingLink';
}
