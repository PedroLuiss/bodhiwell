import { Consultation, IApiConsultationResponse } from '../types/Consultations/Consultation.type';
import axiosInstance from './axiosInstance';



const mapApiDataToConsultation = (item: IApiConsultationResponse): Consultation => ({
  uid: item.uid,
  professionalName: item.professionalName,
  professionalUid: item.professionalUid,
  patientUid: item.patientUid,
  patientName: item.patientName,
  consultationDate: item.date_booking_start.replace(/\//g, '-'),
  mainDiagnosis: item.reason,
});


export const consultationService = {

  getPatientConsultations: async (uidPatient: string): Promise<Consultation[]> => {
    try {
      const response = await axiosInstance.get<IApiConsultationResponse[]>(`/api/${uidPatient}/consultations`);
      const consultations: Consultation[] = response.data.map(mapApiDataToConsultation);
      return consultations;
    } catch (error: any) {
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },

  getMyConsultations: async (): Promise<Consultation[]> => {
    try {
      const response = await axiosInstance.get<IApiConsultationResponse[]>('/api/my-consultations');
      const consultations: Consultation[] = response.data.map(mapApiDataToConsultation);
      
      return consultations;

    } catch (error: any) {
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },
};