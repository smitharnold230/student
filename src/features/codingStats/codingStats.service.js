const CodingStat = require('../../db/CodingStat');
const Profile = require('../../db/Profile');
const axios = require('axios');
const pointsService = require('../points/points.service');

function extractLeetCodeUsername(url) {
  const match = url.match(/leetcode\.com\/(u\/)?([\w-]+)\/?/);
  return match ? match[2] : null;
}

async function fetchLeetCodeProblemsDirectly(url) {
  try {
    const username = extractLeetCodeUsername(url);
    if (!username) {
      throw new Error('Invalid LeetCode profile URL. Could not extract username.');
    }
    
    const response = await axios.post('https://leetcode.com/graphql', {
      query: `
        query getUserProfile($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.com/${username}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    if (!response.data || response.data.errors) {
      throw new Error(response.data.errors ? response.data.errors[0].message : 'No response data received from LeetCode API');
    }
    
    const stats = response.data.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!stats) {
      throw new Error('User not found or stats unavailable for this LeetCode username.');
    }
    
    const totalSolved = stats.find(x => x.difficulty === 'All')?.count || 0;
    return totalSolved;
    
  } catch (error) {
    console.error('Error fetching LeetCode problems directly:', error.message);
    throw new Error(`Failed to fetch LeetCode stats: ${error.message}`);
  }
}

async function submitLeetCode(userId, url) {
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  const problemsSolved = await fetchLeetCodeProblemsDirectly(url);
  
  const [stat, created] = await CodingStat.upsert({
    profileId: profile.id,
    platform: 'LEETCODE',
    url,
    problemsSolved,
  }, { where: { profileId: profile.id, platform: 'LEETCODE' } });
  
  try {
    await pointsService.addPointsForActivity(userId, 'LEETCODE_SUBMISSION', { platform: 'LEETCODE', problemsSolved });
  } catch (error) {
    console.error('Error adding points for LeetCode submission:', error);
  }
  
  return stat;
}

async function submitHackerRank(userId, url, manualCount) {
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // For HackerRank, we'll rely on manualCount for now as direct scraping is complex
  if (!manualCount) {
    throw new Error('Please provide the number of problems solved on HackerRank');
  }
  
  const [stat, created] = await CodingStat.upsert({
    profileId: profile.id,
    platform: 'HACKERRANK',
    url,
    problemsSolved: manualCount,
  }, { where: { profileId: profile.id, platform: 'HACKERRANK' } });
  
  try {
    await pointsService.addPointsForActivity(userId, 'HACKERRANK_SUBMISSION', { platform: 'HackerRank', problemsSolved: manualCount });
  } catch (error) {
    console.error('Error adding points for HackerRank submission:', error);
  }
  
  return stat;
}

async function getStats(userId) {
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) throw new Error('Profile not found');
  return CodingStat.findAll({ where: { profileId: profile.id } });
}

module.exports = { submitLeetCode, submitHackerRank, getStats };