import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/es';
import 'dayjs/locale/en';

dayjs.extend(customParseFormat);

export const formatDate = (
  date: string,
  locale?: string
) => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'es';
  const format = currentLocale.startsWith('es') ? 'D [de] MMMM [de] YYYY' : 'MMMM D, YYYY';
  return dayjs(date, 'YYYY-MM-DD').locale(currentLocale).format(format);
};


export const formatDuration = (
    dateStart: string | Date | dayjs.Dayjs,
    dateEnd: string | Date | dayjs.Dayjs,
    t: any 
): string => {
    const start = dayjs(dateStart);
    const end = dayjs(dateEnd);
    
    const totalMinutes = end.diff(start, 'minute');
    
    if (totalMinutes <= 0) return '';

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const parts: string[] = [];

    if (hours > 0) {
        const hourLabel = hours === 1 
            ? t('appAdmin.BookingDetailsContent.hour', 'hora') 
            : t('appAdmin.BookingDetailsContent.hours', 'horas');
        parts.push(`${hours} ${hourLabel}`);
    }

    if (mins > 0) {
        const minuteLabel = mins === 1 
            ? t('appAdmin.BookingDetailsContent.minute', 'minuto') 
            : t('appAdmin.BookingDetailsContent.minutes', 'minutos');
        parts.push(`${mins} ${minuteLabel}`);
    }

    return parts.join(' ');
};

export const formatTime = (timeString: string | undefined | null): string => {
  if (!timeString) {
    return 'N/A';
  }
  
  const timeObj = dayjs(timeString, 'HH:mm');

  if (!timeObj.isValid()) {
    return 'Hora inválida';
  }

  return timeObj.format('h:mm a').replace('am', 'a.m.').replace('pm', 'p.m.');
};


export const formatBookingDateTime = (dateString: string | undefined | null): { date: string; time: string } => {
  if (!dateString) {
    return { date: 'Fecha no disponible', time: '' };
  }

  const dateObj = dayjs(dateString).locale(localStorage.getItem('i18nextLng') || 'es');

  if (!dateObj.isValid()) {
    return { date: 'Fecha inválida', time: '' };
  }


  const formattedDate = dateObj.format('dddd, D [de] MMMM [de] YYYY');

  const formattedTime = dateObj.format('h:mm a').replace('am', 'a.m.').replace('pm', 'p.m.');

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return {
    date: capitalizedDate,
    time: formattedTime,
  };
};