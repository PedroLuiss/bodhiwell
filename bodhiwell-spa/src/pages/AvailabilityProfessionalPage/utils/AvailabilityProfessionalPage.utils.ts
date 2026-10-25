import { ProfileData } from "../../../types";
import { BLOCKED_STATUSES } from "../../../config/navs/mainMenuItems";

export const hasValue = (val: unknown): val is string => typeof val === 'string' && val.trim().length > 0;

export const hasCountry = (val: any) => {
  if (!val) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'object') return !!(val.code || val.name);
  return false;
};

export const isProfileComplete = (profile: ProfileData["profile"] | null) => {
  return (
    hasValue(profile?.dni) &&
    hasValue(profile?.details?.phone) &&
    hasValue(profile?.details?.date_birth) &&
    hasValue(profile?.details?.gender) &&
    hasCountry(profile?.details?.country) &&
    hasValue(profile?.details?.city) &&
    hasValue(profile?.details?.address) &&
    hasValue(profile?.details?.zipcode) &&
    profile?.type_account === 'professional' &&
    profile?.status &&
    !BLOCKED_STATUSES.includes(profile?.status)
  );
};
