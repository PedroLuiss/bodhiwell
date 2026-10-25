import { ApiResponse, WalletData, WalletApiResponseDTO, Balances, Transaction, WalletQueryParams } from "../types/Wallet/wallet.type";
import axiosInstance from './axiosInstance'; 

const mapApiToWalletData = (apiData: WalletApiResponseDTO): WalletData => {
  const balances: Balances = {
    total: parseFloat(apiData.balance_total) || 0,
    available: parseFloat(apiData.balance_available) || 0,
    frozen: parseFloat(apiData.balance_frozen) || 0,
    currency: apiData.currency || 'USD',
  };

  const rawMovements = apiData.movements?.data || [];
  
  const transactions: Transaction[] = rawMovements.map((movement) => ({
    uid: movement.uid,
    type: movement.operationType === 'CREDIT' ? 'entrada' : 'salida',
    amount: parseFloat(movement.amount) || 0,
    currency: movement.currency,
    date: movement.createdAt,
    reference: movement.concept || movement.description || (movement.paymentUid ? `Ref: ${movement.paymentUid.substring(0, 8)}` : 'Sin referencia'),
    conceptEn: movement.conceptEn || "",
    description: movement.description || "",
    descriptionEn: movement.descriptionEn || "",
    bookingUid: movement.bookingUid,
  }));

  return { 
    balances, 
    transactions,
    meta: apiData.movements?.meta 
  };
};

const getWalletData = async (params?: WalletQueryParams): Promise<ApiResponse<WalletData>> => {
  try {
    const response = await axiosInstance.get<WalletApiResponseDTO>(`/api/wallet`, {
      params: params
    });
    
    const mappedData = mapApiToWalletData(response.data);

    return {
      success: true,
      data: mappedData,
    };

  } catch (error: any) {
    console.error("Error fetching wallet data:", error);
    
    let errorMessage = "Ocurrió un error inesperado al consultar la billetera.";

    if (error.response) {
      errorMessage = error.response.data?.message || error.response.data?.error || `Error del servidor (${error.response.status})`;
    } else if (error.request) {
      errorMessage = "No hay conexión con el servidor. Verifique su internet.";
    } else {
      errorMessage = error.message;
    }

    // eslint-disable-next-line no-throw-literal
    throw { 
      success: false, 
      message: errorMessage 
    };
  }
};

export const walletService = {
  getWalletData,
};