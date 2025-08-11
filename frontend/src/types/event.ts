export interface Event {
  id: string;
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string;
  organizer: string;
  url?: string | null; // Allow null or undefined
  link?: string | null; // Allow null or undefined
  certificationDeadline?: string | null; // Allow null or undefined
  isParticipated?: boolean; // Added for frontend display
}

export interface FormattedEventData {
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string; // Date will always be a string (ISO format)
  organizer: string;
  url?: string | null; // Allow null or undefined
  link?: string | null; // Allow null or undefined
  certificationDeadline?: string | null; // Allow null or undefined
}