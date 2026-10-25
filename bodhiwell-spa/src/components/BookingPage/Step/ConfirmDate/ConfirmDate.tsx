import { Box, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import styles from './ConfirmDate.module.scss';
import { useAvailability } from '../../../../hooks/useAvailability';
import { BookingPanel } from '../../../ProfessionalDetail/BookingPanel';
import { useParams } from 'react-router-dom';
import { localStorageHelper } from '../../../../utils/localStorageHelper';
import { useBookingProfessional } from '../../../../hooks/useBookingProfessional';
import { useNotification } from '../../../../context/NotificationContext';

interface ConfirmDateProps {
  date: Dayjs | null;
  setDate: (date: Dayjs | null) => void;
  time: string;
  setTime: (time: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  loanding?: boolean
}

export const ConfirmDate = ({ date, setDate, time, setTime, onConfirm, onBack, loanding = false }: ConfirmDateProps) => {
  const { showNotification } = useNotification();
  const { uid } = useParams<{ uid: string }>();
  const { availability, loading: loadingAvailability } = useAvailability(uid || '');
  const {
    isTimeSelectionValid,
    isBookingDisabled,
  } = useBookingProfessional({
    professionalUid: uid || '',
    availability: availability ?? [],
    controlledDate: date,
    controlledTime: time,
  });

  const handleConfirm = () => {
    const isValid = isTimeSelectionValid(date, time);
    if (isValid) {
      const formattedDateTime = dayjs(date)
        .hour(Number(time.split(':')[0]))
        .minute(Number(time.split(':')[1]))
        .second(0)
        .format('YYYY-MM-DD HH:mm:ss');

      const bookingData = {
        professional_user_uid: uid || '',
        date_booking_start: formattedDateTime,
        notes: "",
        type: "virtual"
      };

      localStorageHelper.setItem('bookingDetails', bookingData);
      onConfirm();
    } else {
      showNotification("La fecha u hora seleccionada no está disponible. Por favor, elige otra.", 'error');

    }
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles['confirmDate']}>
        <div className={styles['confirmDate__calendarWrapper']}>
          <BookingPanel
            professionalUid={uid || ''}
            availability={availability ?? []}
            viewsConfirmDate={true}
            valueDate={date}
            valueTime={time}
            onDateChange={(date) => {
              setDate(date)
            }}
            onTimeChange={(time) => {

              setTime(time)
            }}
            loading={loadingAvailability}
          />
        </div>
        <Box className={styles['confirmDate__actions']}>
          <button type="button" className={`${styles['confirmDate__button']} ${styles['confirmDate__button--back']}`} onClick={onBack}>
            <WestIcon /> Atrás
          </button>
          <Button type="button" loading={loanding} variant="contained" disabled={isBookingDisabled} onClick={handleConfirm} className={styles['confirmDate__button']} >
            Confirmar Cita <EastIcon />
          </Button>
        </Box>
      </div>
    </LocalizationProvider>
  );
};