import { Event } from './event'; // Import Event type

export interface Certification {
  id: string;
  eventId: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  verifiedById?: string;
  Profile?: {
    name: string;
    class: string;
    batch: string;
    userId: string;
    User?: {
      email: string;
    };
  };
  Event?: Event; // Use the imported Event type
}