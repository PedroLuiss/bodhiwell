import { professionsItems } from "../../../../../../types";

export interface ProfessionalProfileTabProps {
    editMode: boolean;
    professions?: professionsItems[];
    details?: { main_profession?: { uid: string; name: string } };
    onDetailsChange?: (key: string, value: any) => void;
    errors?: Record<string, string>;
    loadingSpecialties?: boolean;
}