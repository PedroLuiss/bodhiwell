import { ProfileData } from '../types';

export const isPersonalInfoComplete = (profile: ProfileData['profile']): boolean => {
  if (!profile) return false;

  const details = profile.details;

  return !!(
    profile.dni?.trim() &&
    details?.phone?.trim() &&
    details?.date_birth?.trim() &&
    details?.gender?.trim() &&
    details?.country?.code?.trim() &&
    details?.city?.trim() &&
    details?.address?.trim() &&
    details?.zipcode?.trim() &&
    details?.bank_name?.trim()
  );
};

export const isProfessionalProfileComplete = (profile: ProfileData['profile']): boolean => {
  if (!profile) return false;

  const details = profile.details;
  const activeStudies = profile.studies?.filter(s => !(s as any).delete) || [];

  return !!(
    profile.first_name?.trim() &&
    profile.last_name?.trim() &&
    details?.main_specialty?.uid &&
    details?.consult_type &&
    details?.consult_price !== null && details?.consult_price !== undefined && String(details.consult_price).trim() !== '' &&
    activeStudies.length > 0 &&
    activeStudies.every(study =>
      study.name?.trim() &&
      study.institute?.trim() &&
      study.type?.code &&
      study.date_start &&
      study.date_end
    )
  );
};