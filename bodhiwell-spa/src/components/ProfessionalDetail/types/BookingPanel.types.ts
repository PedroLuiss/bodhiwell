import { IAvailabilityByDate } from "../../../types";
import { Dayjs } from "dayjs";

export interface BookingPanelProps {
    professionalUid: string;
    availability: IAvailabilityByDate[] | undefined;
    viewsConfirmDate?: boolean;
    valueDate?: Dayjs | null | string;
    valueTime?: string;
    onDateChange?: (newDate: Dayjs | null) => void;
    onTimeChange?: (newTime: string) => void;
    loading?: boolean;
    setIsBookingModalOpen?: (open: boolean) => void;
    modality?: 'Presencial' | 'Virtual' | 'Presencial/Virtual' | string | null;
    consultTime?: number | null;
    consultPrice?: number | null;
}
