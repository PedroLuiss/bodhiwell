
export interface WithdrawalFilters {
  status?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface Withdrawal {
  uid: string; 
  amount: number;
  cutOffDate: string;
  status: 'pending' | 'processed' | 'rejected';
}

export interface WithdrawalApiResponse extends Omit<Withdrawal, 'id'> {
  date: string;
}
