<?php
namespace App\Enum;

enum WalletOperationTypeEnum: string
{
    case CREDIT = 'CREDIT';
    case DEBIT = 'DEBIT';
}