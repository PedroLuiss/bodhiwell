import { useState } from 'react';

import { IReservationReportData } from '../types/Reservations/ReservationReport.type';

interface UseReservationReportFormProps {
  onSubmit: (data: IReservationReportData) => void;
}

export const useReservationReportForm = ({ onSubmit }: UseReservationReportFormProps) => {
  const [formData, setFormData] = useState<IReservationReportData>({
    reason: '',
    observations: '',
    additionalNotes: '',
  });

  const [errors, setErrors] = useState({
    reason: '',
    observations: '',
  });

  const validate = () => {
    let isValid = true;
    const newErrors = { reason: '', observations: '' };

    if (!formData.reason.trim()) {
      newErrors.reason = 'El motivo es requerido';
      isValid = false;
    }

    if (!formData.observations.trim()) {
      newErrors.observations = 'Las observaciones son requeridas';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFroalaChange = (model: string) => {
    setFormData((prev) => ({ ...prev, observations: model }));
  };

  return {
    formData,
    errors,
    handleChange,
    handleFroalaChange,
    handleSubmit,
  };
};
