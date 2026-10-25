import { profesionStudies } from "../../../../../types";

export interface ProfessionalEditTabsProps {
    professionalInfo?: string;
    studies?: profesionStudies[];
    editMode?: boolean;
    details?: {
        professional_info?: string;
        main_profession?: { uid: string; name: string };
        msp_number?: string
    };
    onDetailsChange?: (key: string, value: unknown) => void;
    onStudiesChange?: (updater: (arr: profesionStudies[]) => profesionStudies[]) => void;
    errors?: Record<string, string>;
    professionalInfoSettings?: { fallback: string; placeholder: string };
}