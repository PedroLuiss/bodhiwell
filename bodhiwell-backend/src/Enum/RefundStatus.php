<?php

namespace App\Enum;

enum RefundStatus: string
{
    case REVIEW = 'review';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case COMPLETED = 'completed';
}
