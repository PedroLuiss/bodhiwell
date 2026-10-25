import { useState, useEffect, useCallback } from 'react';
import { Payment, PaymentFilters } from '../types/Payment/Payment.type';
import { paymentService } from '../services/paymentService';

interface PaginationState {
  currentPage: number;
  limit: number;
  totalPages: number;
}

export const usePayments = () => {  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    limit: 10, 
    totalPages: 1,
  });

  const fetchPayments = useCallback(async (filters: PaymentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryFilters: PaymentFilters = {
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 10,
      };

      const response = await paymentService.getPayments(queryFilters);

      setPayments(response.data);
      
      const calculatedTotalPages = response.data.length < response.limit 
        ? response.page 
        : response.page + 1;

      setPagination({
        currentPage: response.page,
        limit: response.limit,
        totalPages: calculatedTotalPages,
      });

    } catch (err: any) {
      console.error('Error en el hook usePayments:', err);
      setError(err.message || 'No se pudo establecer conexión con el servidor.');
      setPayments([]); 
    } finally {
      setLoading(false);
    }
  }, []); 

   useEffect(() => {
    fetchPayments({ page: 1, limit: 10 });
  }, [fetchPayments]); 

  return { payments, loading, error, fetchPayments, pagination };
};