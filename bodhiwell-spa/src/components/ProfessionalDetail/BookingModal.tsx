import React, { useEffect, useState } from 'react';
import { Modal, Box, Switch, Tooltip, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PatientInfoData } from '../../types/Booking/booking';
import EastIcon from '@mui/icons-material/East';
import styles from '../../components/BookingPage/Step/PatientInfo/PatientInfo.module.scss';
import professionalStyles from '../../pages/ProfessionalDetail/professional-detail.module.scss';
import { FileDropzone } from '../ui/FileDropzone/FileDropzone';
import { patientInfoSchema } from '../../utils/shemas/PatientInfoSchema';
import { localStorageHelper } from '../../utils/localStorageHelper';
import Loading from '../ui/Loading/Loading';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VideocamIcon from '@mui/icons-material/Videocam';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DomainVerificationIcon from '@mui/icons-material/DomainVerification';

type FormErrors = Partial<Record<keyof PatientInfoData, string>>;

interface BookingModalProps {
    open: boolean;
    onClose: () => void;
    onConfirmBooking: (patientInfo: PatientInfoData) => Promise<void>;
    consultPrice?: string | number | null;
    modality?: 'Presencial' | 'Virtual' | 'Presencial/Virtual' | string | null;
}

export const BookingModal = ({ open, onClose, onConfirmBooking, consultPrice, modality }: BookingModalProps) => {
    const { t } = useTranslation();
    const [patientInfo, setPatientInfo] = useState<PatientInfoData>({
        name: '',
        number: '',
        email: '',
        reserveReason: '',
        quoteForInvited: false,
        photo: null,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [bookingModality, setBookingModality] = useState<string>('');
    const [modalityTooltipOpen, setModalityTooltipOpen] = useState(false);

    useEffect(() => {
        const savedDetails = localStorageHelper.getItem<any>('bookingDetails');
        const savedType = savedDetails?.consult_type;

        if (savedType && (savedType === 'Presencial' || savedType === 'Virtual')) {
            setBookingModality(savedType);
        } else {
            if (modality === 'Presencial') setBookingModality('Presencial');
            else if (modality === 'Virtual') setBookingModality('Virtual');
            else setBookingModality('');
        }
    }, [modality, open]);

    useEffect(() => {
        if (!patientInfo.quoteForInvited) {
            try {
                const userDataString = localStorageHelper.getItem<{ first_name: string, email: string }>('user');
                if (userDataString) {
                    setPatientInfo((prev) => ({
                        ...prev,
                        name: userDataString.first_name || '',
                        email: userDataString.email || '',
                    }));
                }
            } catch (error) {
                console.error(t('landing.BookingModal.errorReadingUserData'), error);
            }
        }
        else {
            setPatientInfo((prev) => ({
                ...prev,
                name: '',
                email: '',
            }));
        }
    }, [patientInfo.quoteForInvited, t]);

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
        setPatientInfo({
            ...patientInfo,
            [id]: newValue,
        });
    };

    const handleFileSelect = (file: File | null) => {
        clearErrorOnChange('photo');
        setPatientInfo({
            ...patientInfo,
            photo: file,
        });
    };


    const [loading, setLoading] = useState(false);

    const handleConfirmClick = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationResult = patientInfoSchema.safeParse(patientInfo);
        let hasError = false;

        if (!validationResult.success) {
            const formattedErrors: FormErrors = {};
            for (const issue of validationResult.error.issues) {
                formattedErrors[issue.path[0] as keyof PatientInfoData] = issue.message;
            }
            setErrors(formattedErrors);
            hasError = true;
        }

        if (modality === 'Presencial/Virtual' && !bookingModality) {
            setModalityTooltipOpen(true);
            hasError = true;
        }

        if (hasError) return;

        setErrors({});
        setLoading(true);

        try {
            let finalType = '';
            if (modality === 'Presencial') finalType = 'Presencial';
            else if (modality === 'Virtual') finalType = 'Virtual';
            else finalType = bookingModality;

            const currentBookingDetails = localStorageHelper.getItem<any>('bookingDetails') || {};
            localStorageHelper.setItem('bookingDetails', {
                ...currentBookingDetails,
                consult_type: finalType
            });

            await onConfirmBooking(patientInfo);
        } finally {
            setLoading(false);
        }
    };

    const renderModalitySelection = () => {
        if (!modality) return null;

        return (
            <div className={professionalStyles['professional-detail__modality-container']} style={{ marginTop: '1rem', marginBottom: 0 }}>
                <Tooltip
                    open={modalityTooltipOpen}
                    title={t('landing.professionalsDetail.bookingPanel.tooltipSelectModality')}
                    placement="top"
                    arrow
                    disableHoverListener
                    disableFocusListener
                    disableTouchListener
                    componentsProps={{
                        tooltip: {
                            sx: {
                                bgcolor: '#d32f2f',
                                fontSize: '13px'
                            }
                        },
                        arrow: {
                            sx: {
                                color: '#d32f2f'
                            }
                        }
                    }}
                >
                    <div style={{ width: '100%' }}>
                        {modality === 'Presencial' && (
                            <div className={`${professionalStyles['professional-detail__modality-text']} ${professionalStyles['professional-detail__modality-text--presencial']}`}>
                                <MeetingRoomIcon color="primary" />
                                <span>
                                    {t('landing.professionalsDetail.bookingPanel.appointmentWillBePresential')} <strong>{t('landing.professionalsDetail.bookingPanel.presential')}</strong>.
                                </span>
                            </div>
                        )}

                        {modality === 'Virtual' && (
                            <div className={`${professionalStyles['professional-detail__modality-text']} ${professionalStyles['professional-detail__modality-text--virtual']}`}>
                                <VideocamIcon color="secondary" />
                                <span>
                                    {t('landing.professionalsDetail.bookingPanel.appointmentWillBeVirtual')} <strong>{t('landing.professionalsDetail.bookingPanel.virtual')}</strong>.
                                </span>
                            </div>
                        )}

                        {modality === 'Presencial/Virtual' && (
                            <div className={professionalStyles['professional-detail__modality-selection']}>
                                <div className={professionalStyles['professional-detail__modality-header']}>
                                    <DomainVerificationIcon fontSize="small" />
                                    <span>{t('landing.professionalsDetail.bookingPanel.selectAppointmentModality')}</span>
                                </div>
                                <FormControl component="fieldset" fullWidth>
                                    <RadioGroup
                                        row
                                        aria-label="modality"
                                        name="modality-group"
                                        value={bookingModality}
                                        onChange={(e) => {
                                            setBookingModality(e.target.value);
                                            setModalityTooltipOpen(false);
                                        }}
                                        className={professionalStyles['professional-detail__radio-group']}
                                    >
                                        <FormControlLabel
                                            value="Virtual"
                                            control={<Radio size="small" sx={{ display: 'none' }} />}
                                            label={
                                                <>
                                                    <VideocamIcon fontSize="medium" />
                                                    {t('landing.professionalsDetail.bookingPanel.virtual', 'Virtual')}
                                                </>
                                            }
                                            className={bookingModality === 'Virtual' ? professionalStyles['active-radio'] : ''}
                                        />
                                        <FormControlLabel
                                            value="Presencial"
                                            control={<Radio size="small" sx={{ display: 'none' }} />}
                                            label={
                                                <>
                                                    <MeetingRoomIcon fontSize="medium" />
                                                    {t('landing.professionalsDetail.bookingPanel.presential', 'Presencial')}
                                                </>
                                            }
                                            className={bookingModality === 'Presencial' ? professionalStyles['active-radio'] : ''}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        )}
                    </div>
                </Tooltip>
            </div>
        );
    };

    return (
        <>
            <Modal style={{
                overflowY: 'auto',
            }} open={open} onClose={loading ? () => { } : onClose}>
                <Box
                    sx={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: { xs: 2, md: 4 },
                        borderRadius: 3,
                        width: '95%',
                        maxWidth: 900,
                        maxHeight: '95vh',
                        overflowY: 'auto',
                        position: 'absolute',
                        outline: 'none',
                    }} >

                    {loading && (
                        <Loading className={styles['loading-form-modal']} text={t('landing.BookingModal.processingRequest')} />
                    )}
                    <form className={styles['patientForm']} onSubmit={handleConfirmClick} style={{ marginTop: '10px' }}>
                        <div className={styles['modalGrid']}>
                            <div className={styles['modalColumn']}>
                                <div className={styles['patientForm__group']}>
                                    <label htmlFor="name" className={styles['patientForm__label']}>{t('landing.BookingModal.name')}</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className={`${styles['patientForm__input']} ${errors.name ? 'form__input--error' : ''}`}
                                        placeholder="David John"
                                        value={patientInfo.name}
                                        onChange={handleChange}
                                        disabled={!patientInfo.quoteForInvited}
                                    />
                                    {errors.name && <p className={'text_form__error'}>{errors.name}</p>}
                                </div>

                                <div className={styles['patientForm__group']}>
                                    <label htmlFor="email" className={styles['patientForm__label']}>{t('landing.BookingModal.email')}</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className={`${styles['patientForm__input']} ${errors.email ? 'form__input--error' : ''}`}
                                        placeholder="email@gmail.com"
                                        value={patientInfo.email}
                                        onChange={handleChange}
                                        disabled={!patientInfo.quoteForInvited}
                                    />
                                    {errors.email && <p className={'text_form__error'}>{errors.email}</p>}
                                </div>

                                <div className={styles['patientForm__group']}>
                                    <label htmlFor="number" className={styles['patientForm__label']}>{t('landing.BookingModal.number')}</label>
                                    <input
                                        type="text"
                                        id="number"
                                        className={`${styles['patientForm__input']} ${errors.number ? 'form__input--error' : ''}`}
                                        placeholder="(123) 456 - 789"
                                        value={patientInfo.number}
                                        onChange={handleChange}
                                    />
                                    {errors.number && <p className={'text_form__error'}>{errors.number}</p>}
                                </div>
                                {renderModalitySelection()}
                            </div>
                            <div className={styles['modalColumn']}>
                                <div className={styles['patientForm__group']} style={{ flex: 1 }}>
                                    <label htmlFor="reserveReason" className={styles['patientForm__label']}>{t('landing.BookingModal.consultationReason')}</label>
                                    <textarea
                                        id="reserveReason"
                                        className={`${styles['patientForm__input']} ${errors.reserveReason ? 'form__input--error' : ''}`}
                                        placeholder={t('landing.BookingModal.consultationReasonPlaceholder')}
                                        value={patientInfo.reserveReason}
                                        onChange={handleChange}
                                        style={{ height: '100%', minHeight: '120px', resize: 'vertical' }}
                                    />
                                    {errors.reserveReason && <p className={'text_form__error'}>{errors.reserveReason}</p>}
                                </div>

                                <div className={styles['patientForm__group']}>
                                    <label className={styles['patientForm__label']} style={{ marginBottom: '4px', fontSize: '0.8rem', color: '#6b7280' }}>
                                        {t('landing.BookingModal.uploadFileLabel')}
                                    </label>
                                    <FileDropzone
                                        onFileSelected={handleFileSelect}
                                        initialFile={patientInfo.photo}
                                    />
                                    {errors.photo && <p className={'text_form__error'}>{errors.photo}</p>}
                                </div>
                            </div>

                            <div className={styles['modalFullWidth']}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>

                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {consultPrice && (
                                            <div className={styles['consult-price-box']} style={{ padding: '8px 16px', margin: 0 }}>
                                                <div className={styles['price-icon-wrapper']} style={{ width: 32, height: 32 }}>
                                                    <AttachMoneyIcon fontSize="small" />
                                                </div>
                                                <div className={styles['price-details']}>
                                                    <span className={styles['price-label']} style={{ fontSize: '0.75rem' }}>{t('landing.BookingModal.consultationValue', 'Valor')}</span>
                                                    <span className={styles['price-amount']} style={{ fontSize: '1rem' }}>${consultPrice}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`${styles['patientForm__switch']} ${errors.quoteForInvited ? 'form__input--error' : ''}`}>
                                            <label htmlFor="quoteForInvited" className={styles['patientForm__switch-label']}>
                                                {t('landing.BookingModal.appointmentForGuest')}
                                            </label>
                                            <label className={styles['patientForm__switch-toggle']}>
                                                <Switch type="checkbox"
                                                    id="quoteForInvited"
                                                    checked={patientInfo.quoteForInvited}
                                                    onChange={handleChange} />
                                                <span className={styles['patientForm__switch-slider']}></span>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className={styles['patientForm__button']}
                                        disabled={loading}
                                        style={{ marginTop: 0, minWidth: '200px' }}
                                    >
                                        {loading ? t('landing.BookingModal.loading') : t('landing.BookingModal.confirmAppointment')}
                                        {loading ? null : <EastIcon />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Box>
            </Modal>
        </>
    );
};

export default BookingModal;