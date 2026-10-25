<?php

namespace App\Enum;

enum WithdrawalStatusEnum: string
{
    case PENDING   = 'pending';
    case APPROVED  = 'approved';
    case REJECTED  = 'rejected';
    case IN_PROCESS = 'in_process';
}
