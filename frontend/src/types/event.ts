export interface Event {
  id: string;
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string;
  organizer: string;
  url: string;
  link: string;
  certificationDeadline?: string;
  isParticipated?: boolean; // Added for frontend display
}

export interface FormattedEventData {
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string | null;
  organizer: string;
  url: string;
  link: string;
  certificationDeadline?: string | null;
}