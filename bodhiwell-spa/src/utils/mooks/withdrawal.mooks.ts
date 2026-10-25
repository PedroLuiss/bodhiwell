import { Withdrawal } from "../../types";

function generateMockWithdrawals(count: number): Withdrawal[] {
  const statuses: Withdrawal['status'][] = ['processed', 'pending', 'rejected'];
  const withdrawals: Withdrawal[] = [];

  for (let i = 1; i <= count; i++) {
    const uid = `${i}`;
    const amount = parseFloat((Math.random() * 3000 + 500).toFixed(2));
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const month = Math.floor(Math.random() * 3) + 9; 
    const day = Math.floor(Math.random() * 28) + 1;
    const cutOffDate = new Date(Date.UTC(2025, month - 1, day)).toISOString();

    withdrawals.push({
      uid,
      amount,
      cutOffDate,
      status,
    });
  }

  return withdrawals;
}

export const MOCK_WITHDRAWALS: Withdrawal[] = generateMockWithdrawals(600);
