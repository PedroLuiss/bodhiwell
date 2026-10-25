import { useState, useCallback } from 'react';
import { walletService } from '../services/walletService';
import { Balances, Transaction, WalletQueryParams } from '../types/Wallet/wallet.type';
import { useNotification } from '../context/NotificationContext';

const INITIAL_BALANCES: Balances = { total: 0, available: 0, frozen: 0, currency: 'USD' };

export const useWallet = () => {  
  const { showNotification } = useNotification();
  const [balances, setBalances] = useState<Balances>(INITIAL_BALANCES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async (filters?: WalletQueryParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await walletService.getWalletData(filters);

      if (response.success && response.data) {
        setBalances(response.data.balances);
        setTransactions(response.data.transactions);
      } else {
        const msg = response.message || 'La respuesta del servidor no fue exitosa.';
        setError(msg);
        showNotification(msg, 'error');
      }
    } catch (err: any) {
      console.error('Error en el hook useWallet:', err);
      
      const msg = err.message || 'No se pudo cargar la información.';
      
      setError(msg);
      
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);


  return { balances, transactions, loading, error, fetchWalletData };
};