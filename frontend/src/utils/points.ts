interface LevelInfo {
  level: string;
  minPoints: number;
  maxPoints: number; // Max points for this level, or Infinity for the highest
}

const LEVELS: LevelInfo[] = [
  { level: 'Beginner', minPoints: 0, maxPoints: 99 },
  { level: 'Novice', minPoints: 100, maxPoints: 249 },
  { level: 'Intermediate', minPoints: 250, maxPoints: 499 },
  { level: 'Advanced', minPoints: 500, maxPoints: 999 },
  { level: 'Expert', minPoints: 1000, maxPoints: 1999 },
  { level: 'Master', minPoints: 2000, maxPoints: Infinity },
];

export function getStudentLevel(points: number) {
  let currentLevel: LevelInfo = LEVELS[0];
  let nextLevel: LevelInfo | null = null;

  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].minPoints && points <= LEVELS[i].maxPoints) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    } else if (points < LEVELS[i].minPoints) {
      // If points are less than the current level's min, it means we're in the previous level
      // This handles cases where points might be 0 or negative and ensures we start from Beginner
      if (i > 0) {
        currentLevel = LEVELS[i - 1];
        nextLevel = LEVELS[i];
      }
      break;
    }
  }

  // Handle cases where points exceed all defined levels (Master)
  if (points >= LEVELS[LEVELS.length - 1].minPoints) {
    currentLevel = LEVELS[LEVELS.length - 1];
    nextLevel = null; // No next level for Master
  }

  const currentLevelMin = currentLevel.minPoints;
  const currentLevelMax =
    currentLevel.maxPoints === Infinity ? points : currentLevel.maxPoints; // If max level, progress is always 100%
  const pointsInCurrentLevel = points - currentLevelMin;
  const pointsNeededForNextLevel = nextLevel
    ? nextLevel.minPoints - currentLevelMin
    : currentLevelMax - currentLevelMin;

  let progressPercentage = 0;
  if (currentLevel.level === 'Master') {
    progressPercentage = 100; // Always 100% for Master
  } else if (pointsNeededForNextLevel > 0) {
    progressPercentage =
      (pointsInCurrentLevel / pointsNeededForNextLevel) * 100;
  }

  return {
    level: currentLevel.level,
    currentPoints: points,
    minPointsForCurrentLevel: currentLevel.minPoints,
    maxPointsForCurrentLevel: currentLevel.maxPoints,
    nextLevel: nextLevel ? nextLevel.level : 'Max Level',
    nextLevelPoints: nextLevel ? nextLevel.minPoints : Infinity,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)), // Ensure between 0 and 100
  };
}
