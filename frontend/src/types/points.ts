export interface PointBreakdown {
  totalPoints: number;
  breakdown: {
    workshops?: {
      count: number;
      points: number;
      events: string[];
    };
    hackathons?: {
      count: number;
      points: number;
      events: string[];
    };
    certifications?: {
      count: number;
      points: number;
      certifications: string[];
    };
    coding?: {
      totalPoints: number;
      breakdown: {
        leetcode?: {
          problemsSolved: number;
          basePoints: number;
          bonusPoints: number;
          totalPoints: number;
        };
        hackerrank?: {
          problemsSolved: number;
          basePoints: number;
          bonusPoints: number;
          totalPoints: number;
        };
      };
    };
    bonuses?: {
      totalPoints: number;
      breakdown: {
        firstWorkshop?: number;
        firstHackathon?: number;
        certificationStreak?: number;
      };
    };
  };
  profileId: string;
  manualAdjustment: number;
}

export interface UserWithPoints {
  id: string;
  name: string;
  email: string;
  class: string;
  batch: string;
  points: number;
  profileId: string;
  manualAdjustment: number;
}

export interface PointStatistics {
  totalUsers: number;
  totalPoints: number;
  averagePoints: number;
  topPerformers: UserWithPoints[];
}

export interface PointRule {
  id: string;
  key: string;
  value: number;
  description: string;
}

// New interfaces for specific API responses
export interface ActivityPointsResult {
  pointsAdded: number;
  description: string;
  activityType: string;
}

export interface UserPointUpdateResult {
  userId: string;
  success: boolean;
  oldPoints: number;
  newPoints: number;
  pointsChange: number;
  error?: string; // Optional error message if update failed for a specific user
}

export interface UpdateAllPointsResponse {
  message: string;
  data: UserPointUpdateResult[];
}

export interface ManualPointUpdateResponse {
  data: UserPointUpdateResult[];
}

export interface ResetPointsResponse {
  data: UserPointUpdateResult[];
}
