export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'CERTIFICATION_REMINDER' | 'POINTS_UPDATE' | 'POINTS_RESET';
  read: boolean;
  createdAt: string;
  userId: string;
  eventId?: string;
  deadline?: string;
}