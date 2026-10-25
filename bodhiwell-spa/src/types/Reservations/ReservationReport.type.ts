export interface IReservationReportData {
  reason: string;
  observations: string;
  additionalNotes?: string;
}

export interface IConsultationApiResponse {
  uid: string;
  bookingUid: string;
  type: string;
  date_booking_start: string;
  details: {
    meetingLink?: string;
    observations: string;
    notes: string;
    reasonConsultation: string;
  };
  createdAt: string;
}

export interface IReservationReport extends IReservationReportData {
  uid: string;
  patient_name: string;
  professional_name: string;
  reservation_date: string;
  prefix_professional: string;
  uid_booking: string;
  patient_uid?: string;
}
