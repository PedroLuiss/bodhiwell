import { ProfileData } from '../../../../../../types';

export type ProfessionalDataFormProps = {
    isEditMode: boolean;
    user: ProfileData;
    form: any;
    errors: any;
    setFieldValue: (path: string, value: any) => void;
    professions: any[];
    handleOtherProfessionsChange: (event: any) => void;
    aboutSettings?: { fallback: string; placeholder: string } | null;
}
