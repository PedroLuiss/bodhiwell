import { Transaction } from "../../types";

function generateMockTransactions(count: number): Transaction[] {
  const types: ('entrada' | 'salida')[] = ['entrada', 'salida'];
  const references = ['Pago', 'Retiro', 'Transferencia', 'Compra', 'Reembolso'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const transactions: Transaction[] = [];

  for (let i = 1; i <= count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const reference = references[Math.floor(Math.random() * references.length)];
    const day = Math.floor(Math.random() * 28) + 1;
    const month = months[Math.floor(Math.random() * months.length)];
    const year = 2024;
    const amount = parseFloat((Math.random() * 500 + 10).toFixed(2));
    const uid = `uid_${Math.random().toString(36).substring(2, 10)}`;

    transactions.push({
      uid,
      type,
      amount,
      date: `${day} ${month}, ${year}`,
      reference,
    });
  }

  return transactions;
}

export const mockTransactions: Transaction[] = generateMockTransactions(500);
export const mockBalances = {
  total: 580.50,
  available: 450.50,
  frozen: 130.00,
};
