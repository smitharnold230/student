export interface Profile {
  id: string;
  userId: string;
  name: string;
  degree: string;
  class: string;
  status: string;
  transport: string;
  hostelInfo: string;
  batch: string;
  profilePhotoUrl?: string; // New field for profile photo URL
  createdAt: string;
  updatedAt: string;
}
