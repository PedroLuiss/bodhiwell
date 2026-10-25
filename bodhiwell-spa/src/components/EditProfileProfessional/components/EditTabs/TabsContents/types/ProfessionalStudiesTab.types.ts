import { profesionStudies, Specialty } from "../../../../../../types";

export interface ProfessionalStudiesTabProps {
    editMode: boolean;
    studies?: profesionStudies[];
    onStudiesChange?: (updater: (arr: profesionStudies[]) => profesionStudies[]) => void;
    errors?: Record<string, string>;
    handleOpenViewer: (url: string, name: string) => void;
    handleOpenConfirm: (data: { index: number, type: 'study' }) => void;
    availableTags: Specialty[];
    loadingTags: boolean;
    errorTags: any;
}