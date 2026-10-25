export type BookingStatus = "WAITING_PAYMENT" | "PENDING_PROVIDER" | "PROCESSING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type IBookingBase = {
  date_booking_start: string;
  notes?: string;
};

interface IProfessionalReference {
  professional_user_id: number;
}

export interface IBookingSummary {
  id: string;
  professionalName: string;
  patientName: string;
  date: string;
  slots: {
    start: string;
    end: string;
  }[];
  reason: string;
  status: BookingStatus;
}

export type IBookingRequest = IBookingBase & {
  professional_user_uid: string;
  type?: string;
  consult_type?: string;
};

export type IBookingResponse = IBookingBase &
  IProfessionalReference & {
    id: string;
    status: BookingStatus;
    createdAt: string;
    uid: string;
  };

// export type IBookingDetail = & IBookingResponse & {
//   patientName: string;
//   professionalName: string;
//   professionalPhotoUrl?: string;
// }

export type IBookingUpdate = Partial<
  Pick<IBookingBase, "date_booking_start" | "notes"> & {
    status: BookingStatus;
  }
>;

export type ICancelBookingResponse = {
  success: boolean;
  message?: string;
};

export type PatientInfoData = {
  name: string;
  number: string;
  email: string;
  photo?: File | null;
  reserveReason: string;
  quoteForInvited: boolean;
};

export type IBookingCrate = Omit<
  PatientInfoData,
  "reserveReason" | "quoteForInvited"
> &
  IBookingRequest & {
    reserve_reason: string;
    quote_for_invited: boolean;
    consult_type?: "presencial" | "virtual" | "hybrid" | string;
  };

export type IBookingDetail = {
  uid: string;
  professional: string;
  patient: string;
  date_start: string;
  date_end: string;
  status: BookingStatus;
  notes: string;
  type: "virtual" | "in-person";
  reserve_reason: string;
  quote_for_invited: boolean;
  patient_image: string | null;
  banner_image?: string | null;
  main_profession_uid?: string;
  professional_uid?: string;
  patient_uid?: string;
  consultation?: {
    uid: string;
    notes: string;
    observations: string;
    status: BookingStatus;
  },
  base_profession?: {
    uid: string;
    name: string;
  },
  main_specialty?: {
    uid: string;
    name: string;
  }
};

export interface IPaymentBookingResponse {
  payment_url: string;
}

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "approved"
  | "partially_captured"
  | "rejected"
  | "refunded"
  | "partially_refunded"
  | "canceled"
  | "failed"
  | "idle"
  | "initiating"
  | "authorized"
  | "no_payment";

export interface IPaymentStatusResponse {
  paymentUid: string;
  status: PaymentStatus;
  currency: string;
  amount: number;
  paymentUrl: string;
  paymentCode: string;
  paymentMethod: string;
}
