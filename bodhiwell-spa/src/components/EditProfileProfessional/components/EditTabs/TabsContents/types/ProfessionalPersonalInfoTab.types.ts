export interface ProfessionalPersonalInfoTabProps {
    editMode: boolean;
    professionalInfo?: string;
    details?: { professional_info?: string };
    onDetailsChange?: (key: string, value: any) => void;
    errors?: Record<string, string>;
    professionalInfoSettings?: { fallback: string; placeholder: string };
}