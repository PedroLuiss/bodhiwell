import { ProfessionalUpdatePayload, ProfileData } from '..';

export interface UseProfileProps {
  profile: ProfileData | null,
  loading: boolean;
  error: string | null;
  success: boolean;
  updateProfile: (data: Record<string, any>) => Promise<any>;
  updateProfessionalProfile: (data: ProfessionalUpdatePayload) => Promise<any>;
  updatePatientProfile: (data: Record<string, any>) => Promise<any>;
  reset: () => void;
  getDataProfile: () => Promise<any>;
}

export const genders=[
        {value: 'male', label: 'Masculino'},
        {value: 'female', label: 'Femenino'},
        {value: 'other', label: 'Otro'},
]