import axiosInstance from './axiosInstance';
import { Withdrawal, WithdrawalApiResponse } from '../types/Withdrawal/withdrawal.type';

export const withdrawalService = {
  getWithdrawals: async () => {
    try {
      const response = await axiosInstance.get<WithdrawalApiResponse[]>('/api/withdrawals');
      const mappedData: Withdrawal[] = response.data.map((item) => ({
        uid: item.uid,
        amount: Number(item.amount),
        cutOffDate: item.date,
        status: item.status,
      }));

      const sortedData = mappedData.sort((a, b) => 
        new Date(b.cutOffDate).getTime() - new Date(a.cutOffDate).getTime()
      );
      
      return {
        success: true,
        data: sortedData,
        message: 'Datos cargados correctamente',
        total: sortedData.length
      };
      
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Error al cargar los retiros',
        total: 0
      };
    }
  },
};
