export interface Consultation {
  uid: string;
  professionalName: string;
  professionalUid: string;
  patientUid: string;
  patientName: string;
  consultationDate: string;
  mainDiagnosis: string;
}


export interface IApiConsultationResponse {
  uid: string;
  professionalName: string;
  professionalUid: string;
  patientUid: string;
  patientName: string;
  date_booking_start: string;
  reason: string;
}