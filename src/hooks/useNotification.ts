import { use } from 'react';
import { NotificationContext } from '@/context/notificationContextInstance';

export function useNotification() {
  return use(NotificationContext);
}
