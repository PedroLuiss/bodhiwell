import { NotificationItem, NotificationType } from "../../types";

const titles = {
  BOOKING: 'Nueva reserva confirmada',
  REMINDER: 'Recordatorio de cita',
  PAYMENT: '¡Boletín Informativo!',
  SYSTEM: '¡Novedades en BodhiWell!',
};

const messages = {
  BOOKING: (id: number) => `El paciente #${id} ha reservado una cita contigo para mañana.`,
  PAYMENT: (id: number) => `Tu sesión programada #${id} comienza pronto.`,
  SYSTEM: (id: number) => `Edición #${id}: Nuevas herramientas para profesionales disponibles.`,
  REMINDER: (id: number) => `Hemos lanzado una nueva actualización con mejoras en la app. #${id}`,
};

const typesByRole: Record<'professional' | 'patient', NotificationType[]> = {
  professional: ['BOOKING', 'PAYMENT', 'SYSTEM', 'REMINDER'],
  patient: ['SYSTEM', 'REMINDER']
};

/**
 * Genera una única notificación mock basada en los tipos disponibles.
 */
const createNotification = (id: number, unread: boolean, availableTypes: NotificationType[]): NotificationItem => {
  const type = availableTypes[id % availableTypes.length];
  
  return {
    id,
    uid: `notification-${id}`,
    type,
    title: titles[type as keyof typeof titles],
    message: messages[type as keyof typeof messages](Math.floor(Math.random() * 1000)),
    time: `hace ${Math.floor(Math.random() * 59) + 1} min`,
    unread,
    createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(),
  };
};

  /**
   * Genera una base de datos mock completa de notificaciones filtrada por rol.
 */
export const generateMockNotifications = (count: number, userRole: 'professional' | 'patient' = 'professional'): NotificationItem[] => {
  const notifications: NotificationItem[] = [];
  const availableTypes = typesByRole[userRole] || typesByRole['professional'];

  for (let i = 1; i <= count; i++) {
    notifications.push(createNotification(i, i <= 10, availableTypes));
  }
  return notifications.reverse(); 
};

export const mockDatabaseProfessional = generateMockNotifications(150, 'professional');
export const mockDatabasePatient = generateMockNotifications(150, 'patient');