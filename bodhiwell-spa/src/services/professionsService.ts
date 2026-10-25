import axiosInstance from './axiosInstance';

export interface ProfessionItem {
  uid: string;
  name: string;
  status: 'active' | 'inactive';
  registro_msp_obligatorio?: boolean;
}

export interface Profession {
  professions: ProfessionItem[];
}

export const getProfessions = async (): Promise<ProfessionItem[]> => {

  try {
    const response = await axiosInstance.get<Profession>('/professions');
    return response.data.professions;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      (error as any).response.data
    ) {
      throw (error as any).response.data;
    }
    throw error;
  }
};