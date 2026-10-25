
import { IConsultationApiResponse, IReservationReport, IReservationReportData } from '../types';
import axiosInstance from './axiosInstance';

interface IApiConsultationPayload {
  bookingUid: string;
  details: {
    reasonConsultation: string;
    observations: string;
    notes?: string;
  };
}

const saveReservationReport = async (
  bookingUid: string,
  reportData: IReservationReportData
): Promise<IConsultationApiResponse> => {

  const apiPayload: IApiConsultationPayload = {
    bookingUid: bookingUid,
    details: {
      reasonConsultation: reportData.reason,
      observations: reportData.observations,
      notes: reportData.additionalNotes,
    },
  };

  const response = await axiosInstance.post<IConsultationApiResponse>('/api/consultations', apiPayload);
  return response.data;
};


export async function getReservationReportByUid(
  uid: string
): Promise<IReservationReport> {
  try {
    const response = await axiosInstance.get(`/api/consultations/${uid}`);
    const consultationData = response.data;

    const date = new Date(consultationData.date_booking_start.replace(/\//g, '-'));

    return {
      uid: consultationData.uid,
      patient_name: consultationData.consultantName || "Consultante",
      professional_name: `${consultationData.prefix_professional ?? "Dr."} ${consultationData.professionalName || consultationData.professional || ""}`,
      reservation_date: date.toISOString(),
      reason: consultationData.reserve_reason || consultationData.details?.reasonConsultation || "",
      observations: consultationData.observations || consultationData.details?.observations || "",
      additionalNotes: consultationData.notes || consultationData.details?.notes || "",
      prefix_professional: consultationData.prefix_professional || "Dr.",
      uid_booking: consultationData.bookingUid,
      patient_uid: consultationData.consultantUid,
    };
  } catch (error: any) {
    if (error.response?.data) throw error.response.data;
    throw error;
  }
}


export const reservationReportService = {
  saveReservationReport,
  getReservationReportByUid,
};
