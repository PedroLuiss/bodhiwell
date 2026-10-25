
export interface FormCheckboxProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string; 
}