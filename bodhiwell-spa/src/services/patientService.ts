import { IPatient } from '../types';
import axiosInstance from './axiosInstance';

export const patientService = {

  getPatientProfile: async (uid: string): Promise<IPatient> => {
    try {
      const response = await axiosInstance.get(`/api/${uid}/patient-profile`);
      
      const apiData = response.data;

      const patientProfile: IPatient = {
        uid: apiData.uid,
        email: apiData.email,
        first_name: apiData.first_name,
        last_name: apiData.last_name,
        details: {
          date_birth: apiData.details?.date_birth || '',
          gender: apiData.details?.gender || '',
          phone: apiData.details?.phone || '',
          image: apiData.details?.image || '', 
          country: apiData.details?.country?.name || '',
          city: apiData.details?.city || '',
          address: apiData.details?.address || '',
          zipcode: apiData.details?.zipcode || '',
          medical_condition: apiData.details?.medical_condition || '',
        }
      };

      return patientProfile;

    } catch (err: any) {
      console.error(`Error al obtener el perfil del paciente con UID ${uid}:`, err);
      if (err.response?.data) {
        throw err.response.data;
      }
      throw err;
    }
  },
};