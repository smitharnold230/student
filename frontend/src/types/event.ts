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

export interface CreateEventData {
  name: string;
  type: 'WORKSHOP' | 'HACKATHON';
  date: string; // Date will always be a string (ISO format)
  organizer: string;
  url?: string | null; // Allow null or undefined
  link?: string | null; // Allow null or undefined
  certificationDeadline?: string | null; // Allow null or undefined
}

export interface UpdateEventData {
  name?: string | null; // Allow null for clearing
  type?: 'WORKSHOP' | 'HACKATHON' | null; // Allow null for clearing
  date?: string | null; // Allow null for clearing
  organizer?: string | null; // Allow null for clearing
  url?: string | null;
  link?: string | null;
  certificationDeadline?: string | null;
}