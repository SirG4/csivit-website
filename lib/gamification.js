// Badge system
const BADGES = {
  ROOKIE: "Rookie",
  MAZE_RUNNER: "Maze Runner",
  LEGEND: "Legend",
};

const BADGE_REQUIREMENTS = {
  ROOKIE: 0,
  MAZE_RUNNER: 5,
  LEGEND: 15,
};

/**
 * Calculate badge based on total points earned
 * @param {number} totalPoints - Total points earned by user
 * @returns {string|null} - Badge name or null if no badge
 */
export function calculateBadge(totalPoints) {
  if (totalPoints >= BADGE_REQUIREMENTS.LEGEND) {
    return BADGES.LEGEND;
  } else if (totalPoints >= BADGE_REQUIREMENTS.MAZE_RUNNER) {
    return BADGES.MAZE_RUNNER;
  } else if (totalPoints >= BADGE_REQUIREMENTS.ROOKIE) {
    return BADGES.ROOKIE;
  }
  return null;
}

/**
 * Get badge display name
 * @param {string} badge - Badge identifier
 * @returns {string} - Display name with emoji
 */
export function getBadgeName(badge) {
  const badgeEmojis = {
    [BADGES.ROOKIE]: "🥚 Rookie",
    [BADGES.MAZE_RUNNER]: "🏃 Maze Runner",
    [BADGES.LEGEND]: "👑 Legend",
  };
  return badgeEmojis[badge] || badge;
}

/**
 * Get all badge info
 * @returns {object} - Badge configuration
 */
export function getBadgesInfo() {
  return {
    badges: BADGES,
    requirements: BADGE_REQUIREMENTS,
  };
}

/**
 * Get next badge milestone
 * @param {number} currentPoints - Current points
 * @returns {object} - Next badge info
 */
export function getNextBadgeMilestone(currentPoints) {
  if (currentPoints < BADGE_REQUIREMENTS.ROOKIE) {
    return {
      badge: BADGES.ROOKIE,
      pointsNeeded: BADGE_REQUIREMENTS.ROOKIE - currentPoints,
      progress: (currentPoints / BADGE_REQUIREMENTS.ROOKIE) * 100,
    };
  } else if (currentPoints < BADGE_REQUIREMENTS.MAZE_RUNNER) {
    return {
      badge: BADGES.MAZE_RUNNER,
      pointsNeeded: BADGE_REQUIREMENTS.MAZE_RUNNER - currentPoints,
      progress:
        ((currentPoints - BADGE_REQUIREMENTS.ROOKIE) /
          (BADGE_REQUIREMENTS.MAZE_RUNNER - BADGE_REQUIREMENTS.ROOKIE)) *
        100,
    };
  } else if (currentPoints < BADGE_REQUIREMENTS.LEGEND) {
    return {
      badge: BADGES.LEGEND,
      pointsNeeded: BADGE_REQUIREMENTS.LEGEND - currentPoints,
      progress:
        ((currentPoints - BADGE_REQUIREMENTS.MAZE_RUNNER) /
          (BADGE_REQUIREMENTS.LEGEND - BADGE_REQUIREMENTS.MAZE_RUNNER)) *
        100,
    };
  } else {
    return {
      badge: BADGES.LEGEND,
      pointsNeeded: 0,
      progress: 100,
    };
  }
}
