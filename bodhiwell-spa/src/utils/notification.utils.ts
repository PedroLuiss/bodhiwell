import { NotificationType, NotificationItem, NotificationApiDTO } from "../types";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

export const mapDtoToItemNotification = (dto: NotificationApiDTO): NotificationItem => {
  const validTypes: NotificationType[] = ['BOOKING', 'PAYMENT', 'SYSTEM', 'REMINDER'];
  const type: NotificationType = validTypes.includes(dto.type) ? dto.type : 'SYSTEM';

  const relativeTimeStr = dayjs(dto.createdAt).fromNow();

  const baseItem = {
    id: dto.id,
    uid: dto.uid,
    title: dto.title,
    message: dto.body,
    time: relativeTimeStr,
    unread: dto.readAt === null,
    createdAt: dto.createdAt,
    data: dto.data 
  };

  return { ...baseItem, type } as NotificationItem;
};