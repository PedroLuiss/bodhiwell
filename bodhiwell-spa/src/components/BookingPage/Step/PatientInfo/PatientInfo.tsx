import React, { useEffect, useState } from 'react';
import EastIcon from '@mui/icons-material/East';
import styles from './PatientInfo.module.scss';
import { PatientInfoData } from '../../../../types/Booking/booking';
import { FileDropzone } from '../../../ui/FileDropzone/FileDropzone';
import { patientInfoSchema } from '../../../../utils/shemas/PatientInfoSchema';
import { Switch } from '@mui/material';
import { localStorageHelper } from '../../../../utils/localStorageHelper';

type FormErrors = Partial<Record<keyof PatientInfoData, string>>;

interface PatientInfoProps {
    data: PatientInfoData;
    setData: (data: PatientInfoData) => void;
    onNext: () => void;
}

export const PatientInfo = ({ data, setData, onNext }: PatientInfoProps) => {
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (!data.quoteForInvited) {
            try {
                const userDataString = localStorageHelper.getItem<{first_name:string, email:string}>('user');
                if (userDataString) {
                    setData({
                        ...data,
                        name: userDataString.first_name || '',
                        email: userDataString.email || '',
                    });
                }
            } catch (error) {
                console.error("Error al leer los datos del usuario desde localStorage", error);
            }
        } 
        else {
            setData({
                ...data,
                name: '',
                email: '',
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.quoteForInvited]); 

    const clearErrorOnChange = (fieldName: keyof PatientInfoData) => {
        if (errors[fieldName]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        clearErrorOnChange(id as keyof PatientInfoData);
        setData({
            ...data,
            [id]: newValue,
        });
    };

    const handleFileSelect = (file: File | null) => {
        clearErrorOnChange('photo');
        setData({
            ...data,
            photo: file,
        });
    };

    const handleNextClick = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationResult = patientInfoSchema.safeParse(data);

        if (validationResult.success) {
            setErrors({});
            onNext();
        } else {
            const formattedErrors: FormErrors = {};
            for (const issue of validationResult.error.issues) {
                formattedErrors[issue.path[0] as keyof PatientInfoData] = issue.message;
            }
            setErrors(formattedErrors);
        }
    };

    return (
        <form className={styles['patientForm']} onSubmit={handleNextClick}>
            <div className={styles['patientForm__row']}>
                <div className={styles['patientForm__group']}>
                    <label htmlFor="name" className={styles['patientForm__label']}>Nombre</label>
                    <input
                        type="text"
                        id="name"
                        className={`${styles['patientForm__input']} ${errors.name ? 'form__input--error' : ''}`}
                        placeholder="David John"
                        value={data.name}
                        onChange={handleChange}
                        disabled={!data.quoteForInvited}
                    />
                    {errors.name && <p className={'text_form__error'}>{errors.name}</p>}
                </div>
                <div className={styles['patientForm__group']}>
                    <label htmlFor="number" className={styles['patientForm__label']}>Número</label>
                    <input
                        type="text"
                        id="number"
                        className={`${styles['patientForm__input']} ${errors.number ? 'form__input--error' : ''}`}
                        placeholder="(123) 456 - 789"
                        value={data.number}
                        onChange={handleChange}
                    />
                    {errors.number && <p className={'text_form__error'}>{errors.number}</p>}
                </div>
            </div>
            <div className={styles['patientForm__group']}>
                <label htmlFor="email" className={styles['patientForm__label']}>Correo electrónico</label>
                <input
                    type="email"
                    id="email"
                    className={`${styles['patientForm__input']} ${errors.email ? 'form__input--error' : ''}`}
                    placeholder="email@gmail.com"
                    value={data.email}
                    onChange={handleChange}
                      disabled={!data.quoteForInvited}
                />
                {errors.email && <p className={'text_form__error'}>{errors.email}</p>}
            </div>

            <div className={styles['patientForm__group']}>
                <label htmlFor="reserveReason" className={styles['patientForm__label']}>Motivo de la consulta</label>
                <textarea
                    id="reserveReason"
                    className={`${styles['patientForm__input']} ${errors.reserveReason ? 'form__input--error' : ''}`}
                    placeholder="Describe brevemente el motivo de tu visita..."
                    value={data.reserveReason}
                    onChange={handleChange}
                    rows={4}
                />
                {errors.reserveReason && <p className={'text_form__error'}>{errors.reserveReason}</p>}
            </div>

            <div className={styles['patientForm__group']}>
                <div className={`${styles['patientForm__switch']} ${errors.quoteForInvited ? 'form__input--error' : ''}`}>
                    <label htmlFor="quoteForInvited" className={styles['patientForm__switch-label']}>
                        ¿Cita para un invitado?
                    </label>
                    <label className={styles['patientForm__switch-toggle']}>
                        <Switch type="checkbox"
                            id="quoteForInvited"
                            checked={data.quoteForInvited}
                            onChange={handleChange}  />
                        <span className={styles['patientForm__switch-slider']}></span>
                    </label>
                </div>
                 {errors.quoteForInvited && <p className={'text_form__error'}>{errors.quoteForInvited}</p>}
            </div>

            <div className={styles['patientForm__group']}>
                <label className={styles['patientForm__label']}>Subir foto (Opcional)</label>
                <FileDropzone
                    onFileSelected={handleFileSelect}
                    initialFile={data.photo}
                />
                {errors.photo && <p className={'text_form__error'}>{errors.photo}</p>}
            </div>
            
            <div className={styles['patientForm__actions']}>
                <button type="submit" className={styles['patientForm__button']}>
                    Siguiente <EastIcon />
                </button>
            </div>
        </form>
    );
};