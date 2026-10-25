import React, { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, StepIconProps } from '@mui/material';
import Check from '@mui/icons-material/Check';
import dayjs, { Dayjs } from 'dayjs';

// Estilos
import styles from './BookingPage.module.scss';
import '../../assets/styles/_CustomStepper.scss'; 

// Assets e Iconos
import doctorImage from '../../assets/images/doctora.png';

// Componentes
import { ConfirmationModal } from '../../components/BookingPage/ConfirmationModal';
import { ConfirmDate, PatientInfo, ThankYou } from '../../components/BookingPage/Step';
import { useNavigate, useParams } from 'react-router-dom';
import { IBookingRequest, PatientInfoData } from '../../types/Booking/booking';
import { localStorageHelper } from '../../utils/localStorageHelper';
import { useBooking } from '../../hooks/useBookings';
import { useIsMobile } from '../../hooks/use-mobile';
import { useNotification } from '../../context/NotificationContext'; 
import { useAuthContext } from '../../context/AuthContext';


function CustomStepIcon(props: StepIconProps) {
    const { active, completed, icon } = props;
    const iconClasses = [
        'custom-step-icon',
        active && 'custom-step-icon--active',
        completed && 'custom-step-icon--completed',
    ].filter(Boolean).join(' ');

    return (
        <div className={iconClasses}>
            {completed ? <Check /> : icon}
        </div>
    );
}

const steps = ['Patient Information', 'Confirm schedule date', 'Thanks for your appointment'];

const BookingPage = () => {
    const { uid } = useParams<{ uid: string }>();
    const navigate = useNavigate();
    const { createBooking } = useBooking();
    const { logout } = useAuthContext();
    const isMobile = useIsMobile();
    const [activeStep, setActiveStep] = useState(0); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();
    

    
    const [patientInfo, setPatientInfo] = useState<PatientInfoData>({
        name: '',
        number: '',
        email: '',
        photo:null,
        reserveReason:'',
        quoteForInvited:false
    });
    
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [bookingUidParaElModal, setBookingUidParaElModal] = useState<string | null>(null);


    useEffect(() => {
        if (activeStep === 1) {
            const bookingInfo = localStorageHelper.getItem<IBookingRequest>('bookingDetails');

            if (bookingInfo && bookingInfo.date_booking_start) {
                const bookingDateTime = dayjs(bookingInfo.date_booking_start, 'YYYY-MM-DD HH:mm:ss');
                
                if (bookingDateTime.isValid()) {
                    setSelectedDate(bookingDateTime);
                    setSelectedTime(bookingDateTime.format('HH:mm')); 
                }
            }
        }
    }, [activeStep]); 


    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);


    const handleReset = () => {
         navigate(`/professionals/${uid}`)
    };

    
    const handleConfirmAndOpenModal = async () => {
        setLoading(true)
        const bookingInfo = localStorageHelper.getItem<IBookingRequest>('bookingDetails');
    
        const {response , error} = await createBooking({
            professional_user_uid: bookingInfo?.professional_user_uid??"",
            date_booking_start:bookingInfo?.date_booking_start??"",
            email:patientInfo.email,
            name:patientInfo.name,
            number:patientInfo.number,
            notes:bookingInfo?.notes,
            photo:patientInfo.photo,
            type:bookingInfo?.type,
            reserve_reason: patientInfo.reserveReason,
            quote_for_invited:patientInfo.quoteForInvited
        });

        setLoading(false)
        if (response) {
            localStorageHelper.setItem('booking',response)
            const newBookingId = response.uid;
            setBookingUidParaElModal(newBookingId);
            setIsModalOpen(true);
            return;
        }
          if (error) {
                showNotification(error.message, 'error');
            if (error?.code === 401) {
                localStorageHelper.setItem<string>('redirectAfterLogin', window.location.pathname + window.location.search);
                logout();
                navigate('/login'); 
            }
          }
        
    };
    
    const handleCloseModal = () => setIsModalOpen(false);
    // const handleViewDetails = () => {
    //     const booking = localStorageHelper.getItem<IBookingDetail>('booking');
    //     navigate(`/professionals/booking-details/${booking?.uid}`)
    // };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <PatientInfo data={patientInfo} setData={setPatientInfo} onNext={handleNext} />;
            case 1:
                return <ConfirmDate 
                    date={selectedDate} 
                    setDate={setSelectedDate} 
                    time={selectedTime}
                    setTime={setSelectedTime}
                    onConfirm={handleConfirmAndOpenModal} 
                    onBack={handleBack} 
                    loanding={loading}
                />;

            case 2:
                return <ThankYou onReset={handleReset}/>;
            default:
                return 'Paso desconocido';
        }
    };

    return (
        <>
            <div className="custom-stepper">
                <Stepper nonLinear  activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
                   {steps.map((label, index) => (
                        <Step key={label} completed={index < activeStep}>
                            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </div>

            <div className={styles['bookingPage']}>
               

                {activeStep < (steps.length-1) && (
                    <aside className={styles['bookingPage__infoCard']}>
                        <div className={styles['proCard']}>
                            <h1 className={styles['proCard__name']}>Dr. Juliana Ruiz</h1>
                            <p className={styles['proCard__specialty']}>Medicina integrativa</p>
                            <img src={doctorImage} alt="Dr. Juliana Ruiz" className={styles['proCard__image']} />
                            <p className={styles['proCard__bio']}>
                                En un mundo donde la salud se fragmenta entre diagnósticos, tratamientos y especialidades, muchas personas se sienten solas, desorientadas o desilusionadas. Esta plataforma nace para ofrecer otra posibilidad: ser el puente entre vos y una red de profesionales de la salud que trabajan con una mirada integrativa, respetuosa y consciente. Facilitamos encuentros, herramientas y orientación para que puedas elegir tu camino hacia el bienestar.
                            </p>
                            <div className={styles['proCard__contactItem']}>
                                <h3 className={styles['proCard__contactTitle']}>Email</h3>
                                <p className={styles['proCard__contactValue']}>helloemail@gmail.com</p>
                            </div>
                            <div className={styles['proCard__contactItem']}>
                                <h3 className={styles['proCard__contactTitle']}>Location</h3>
                                <p className={styles['proCard__contactValue']}>123 Anywhere St., Any City, 12345</p>
                            </div>
                        </div>
                    </aside>
                )}
                 <main className={styles['bookingPage__formSection']}>
                    {activeStep === steps.length ? (
                        <ThankYou onReset={handleReset} />
                    ) : (
                        getStepContent(activeStep)
                    )}
                </main>
            </div>

            <ConfirmationModal
                open={isModalOpen}
                onClose={handleCloseModal}
                // onViewDetails={handleViewDetails}
                bookingUid={bookingUidParaElModal ?? ""} 
            />
        </>
    );
};

export default BookingPage;