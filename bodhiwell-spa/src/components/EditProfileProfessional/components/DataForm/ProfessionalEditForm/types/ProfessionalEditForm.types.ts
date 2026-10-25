
export type ProfessionalEditFormProps = {
    form: any;
    errors: any;
    setFieldValue: (path: string, value: any) => void;
    professions: any[];
    handleOtherProfessionsChange: (event: any) => void;
}
