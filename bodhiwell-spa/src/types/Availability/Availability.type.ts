
export type AvailabilityTableProps = {
  selectedDates: string[];
  setSelectedDates: React.Dispatch<React.SetStateAction<string[]>>;
  notAvailable: { [date: string]: boolean };
  setNotAvailable: React.Dispatch<React.SetStateAction<{ [date: string]: boolean }>>;
  blocksByDate: { [date: string]: { from: string; to: string }[] };
  setBlocksByDate: React.Dispatch<React.SetStateAction<{ [date: string]: { from: string; to: string }[] }>>;
  onBackClick: () => void;
  initialData: IApiAvailabilityItem[] | null;
  onSaveSuccess: (newAvailability: IApiAvailabilityItem[]) => void;
  reservationsByDate: { [date: string]: ReservationAvailability[] };
};


export type AvailabilityCalendarProps = {
  selectedDates: string[];
  setSelectedDates: React.Dispatch<React.SetStateAction<string[]>>;
  onDateSelect: (date: string) => void;
  notAvailable: { [date: string]: boolean };
  setNotAvailable: React.Dispatch<React.SetStateAction<{ [date: string]: boolean }>>;
  blocksByDate: { [date: string]: { from: string; to: string }[] };
  setBlocksByDate: React.Dispatch<React.SetStateAction<{ [date: string]: { from: string; to: string }[] }>>;
  reservationsByDate: { [date: string]: ReservationAvailability[] };
};


export type CalendarEvent = {
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  id?: string;
  display?: 'background' | 'block';
  color?: string;
  classNames?: string[];
  editable?: boolean;
  extendedProps?: any;
};


export type IAvailabilitySlot = {
  start: string;
  end: string;
};


export type IWeekdayAvailability = {
  date: string;
  day: number;
  slots: IAvailabilitySlot[];
  isAvailable?: boolean;
};


export type IAvailabilitySavePayload = {
  availabilities: IWeekdayAvailability[];
};

export interface ReservationAvailability {
  uid: string;
  patientName: string;
  patientUid: string;
  reservationTime: { start:string , end:string }; 
  reason: string;
}

export type IApiAvailabilityItem = {
    uid?: string;
    day?: number;
    date: string;
    slots?: IAvailabilitySlot[];
    delete?: boolean;
    hasReservation?: boolean;
    reservations?: ReservationAvailability[];
};

export type IAvailabilityResponse = { data: IApiAvailabilityItem[] };