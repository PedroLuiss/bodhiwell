export interface ContactFormProps {
  formData: FormDataContact;
  errors: FormDataContact;
  isLoading: boolean;
  isFormInvalid: boolean;
  error: string | null;
  t: any;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type FormDataContact = { name: string; email: string; message: string };