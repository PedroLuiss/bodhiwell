import { BookingStatus } from "../Booking/booking";

export interface ApiReservation {
  uid: string;
  professional: string;
  patient: string;
  date: string;
  slots: {
    start: string;
    end: string;
  }[];
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reserve_reason: string;
}

export interface ConsultationDetail {
  key: string;
  value: string;
}

export type UserRole = "paciente" | "profesional";

export interface ConsultationDetail {
  key: string;
  value: string;
}

export interface IConsultation {
  uid: string;
  professional_uid: string;
  professional: string;
  patient: string;
  date_start: string;
  date_end: string;
  status: BookingStatus;
  type: "virtual" | "presential" | string;

  notes?: string;
  reserve_reason?: string;
  quote_for_invited?: boolean;
  patient_image?: string | null;
  main_profession?: string | null;
  banner_image?: string | null;
  prefix_professional?: string | null;

  consultation?: {
    uid: string;
    status: string;
    notes: string;
    observations: string;
  };

  isConsulted: boolean;
  consultation_uid: string;
  consultationStatus: "completed" | "pending" | "cancelled" | null;

  details: ConsultationDetail[];
  canCreateConsultation?: boolean;
}
