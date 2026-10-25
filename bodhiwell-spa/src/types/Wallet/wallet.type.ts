export interface Balances {
  total: number;
  available: number;
  frozen: number;
  currency?: string;
}

export interface Transaction {
  uid: string;
  type: 'entrada' | 'salida';
  amount: number;
  currency?: string;
  date: string;
  reference: string;
  conceptEn?: string;
  descriptionEn?: string;
  description?: string;
  bookingUid?: string;
}

export interface WalletData {
  balances: Balances;
  transactions: Transaction[];
  meta?: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface MovementApiDTO {
  uid: string;
  amount_formatted: string;
  amount: string;
  operationType: 'CREDIT' | 'DEBIT';
  concept: string;
  conceptEn: string;
  paymentUid: string | null;
  bookingUid: string;
  status: string;
  description: string;
  descriptionEn: string;
  createdAt: string;
  currency: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface WalletApiResponseDTO {
  wallet_uid: string;
  balance_available: string;
  balance_frozen: string;
  balance_total: string;
  currency: string;
  movements: {
    data: MovementApiDTO[];
    meta: PaginationMeta;
  };
}

export interface WalletQueryParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  q?: string;
}