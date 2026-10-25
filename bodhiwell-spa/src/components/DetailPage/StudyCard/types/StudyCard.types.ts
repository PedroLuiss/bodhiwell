import { profesionStudies } from "../../../../types";

export interface StudyCardProps {
    study: profesionStudies;
    onViewCertificate: (url: string, name: string) => void;
}