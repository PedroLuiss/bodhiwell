<?php

namespace App\Services;

use App\Entity\User;
use App\Enum\MspVerificationStatusEnum;

class PublishingRuleService
{
    public function isPublishable(User $user): bool
    {
        $hasValidatedStudy = false;
        foreach ($user->getStudies() as $study) {
            if ($study->isValidated()) {
                $hasValidatedStudy = true;
                break;
            }
        }

        if (!$hasValidatedStudy) {
            return false;
        }

        $userDetails = $user->getUserDetails();
        $mainProfession = $userDetails?->getMainProfession();

        if ($mainProfession && $mainProfession->isRequiresMsp()) {
            if ($user->getMspVerificationStatus() !== MspVerificationStatusEnum::VERIFIED->value) {
                return false;
            }
        }

        return true;
    }
}
