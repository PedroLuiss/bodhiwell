import { Payment } from "../../types/Payment/Payment.type";

export const mockPayments: Payment[] = [
  {
    uid: '1',
    amount: 5000,
    paymentDate: '2024-05-10',
    status: 'CAPTURED',
    reservationInfo: {
      uid: 'RES-001',
      reservationDate: '2024-05-15',
      professionalName: 'Dr. Juan Pérez',
      patientName: 'Juan Pérez',
    },
  },
  {
    uid: '2',
    amount: 7500,
    paymentDate: '2024-05-11',
    status: 'PENDING',
    reservationInfo: {
      uid: 'RES-002',
      reservationDate: '2024-05-20',
      professionalName: 'Dra. Ana Gómez',
      patientName: 'Juan Pérez',
    },
  },
  {
    uid: '3',
    amount: 12000,
    paymentDate: '2024-05-13',
    status: 'REJECTED',
    reservationInfo: {
      uid: 'RES-003',
      reservationDate: '2024-05-22',
      professionalName: 'Dr. Carlos Ruiz',
      patientName: 'Juan Pérez',
    },
  },
  {
    uid: '4',
    amount: 6000,
    paymentDate: '2024-04-25',
    status: 'REFUNDED',
    reservationInfo: {
      uid: 'RES-004',
      reservationDate: '2024-05-01',
      professionalName: 'Dra. Sofía Castro',
      patientName: 'Juan Pérez',
    },
  },
];