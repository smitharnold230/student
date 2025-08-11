const CodingStat = require('../../db/CodingStat');
const Profile = require('../../db/Profile');
const { execFile } = require('child_process');
const path = require('path');
const axios = require('axios');
const pointsService = require('../points/points.service');

function extractLeetCodeUsername(url) {
  // Accepts URLs like https://leetcode.com/u/username/ or https://leetcode.com/username/
  const match = url.match(/leetcode\.com\/(u\/)?([\w-]+)\/?/);
  return match ? match[2] : null;
}

async function fetchLeetCodeProblemsDirectly(url) {
  try {
    console.log('[fetchLeetCodeProblemsDirectly] Fetching from URL:', url);
    
    const username = extractLeetCodeUsername(url);
    if (!username) {
      console.error('[fetchLeetCodeProblemsDirectly] Invalid LeetCode profile URL. Could not extract username.');
      return 0;
    }
    
    console.log('[fetchLeetCodeProblemsDirectly] Extracted username:', username);
    
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

    if (!response.data) {
      console.error('[fetchLeetCodeProblemsDirectly] No response data received');
      return 0;
    }

    if (response.data.errors) {
      console.error('[fetchLeetCodeProblemsDirectly] GraphQL errors:', response.data.errors);
      return 0;
    }
    
    const stats = response.data.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!stats) {
      console.log('[fetchLeetCodeProblemsDirectly] User not found or stats unavailable for username:', username);
      return 0;
    }
    
    const totalSolved = stats.find(x => x.difficulty === 'All')?.count || 0;
    console.log('[fetchLeetCodeProblemsDirectly] Found solved problems:', totalSolved, 'for username:', username);
    return totalSolved;
    
  } catch (error) {
    console.error('[fetchLeetCodeProblemsDirectly] Error:', error.message);
    if (error.response) {
      console.error('[fetchLeetCodeProblemsDirectly] HTTP error status:', error.response.status);
      console.error('[fetchLeetCodeProblemsDirectly] HTTP error data:', error.response.data);
    }
    return 0;
  }
}

// Keep the old function for backward compatibility but mark as deprecated
function fetchLeetCodeProblemsViaScript(url) {
  console.log('[DEPRECATED] Using old script method, switching to direct API call');
  return fetchLeetCodeProblemsDirectly(url);
}

async function submitLeetCode(userId, url, manualCount) {
  console.log('[submitLeetCode] userId:', userId, 'url:', url, 'manualCount:', manualCount);
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) {
    console.error('[submitLeetCode] Profile not found for userId:', userId);
    throw new Error('Profile not found');
  }
  let problemsSolved = await fetchLeetCodeProblemsDirectly(url);
  console.log('[submitLeetCode] problemsSolved from script:', problemsSolved);
  if (!problemsSolved && manualCount) {
    problemsSolved = manualCount;
    console.log('[submitLeetCode] Using manualCount:', manualCount);
  }
  if (!problemsSolved) {
    console.error('[submitLeetCode] Could not auto-fetch. Returning error.');
    throw new Error('Could not auto-fetch. Please enter your solved count manually.');
  }
  const upsertResult = await CodingStat.upsert({
    profileId: profile.id,
    platform: 'LeetCode',
    url,
    problemsSolved,
  }, { where: { profileId: profile.id, platform: 'LeetCode' } });
  console.log('[submitLeetCode] Upsert result:', upsertResult);
  
  // Add points for LeetCode submission
  try {
    await pointsService.addPointsForActivity(userId, 'LEETCODE_SUBMISSION', { platform: 'LeetCode', problemsSolved });
    console.log('[submitLeetCode] Points added for LeetCode submission');
  } catch (error) {
    console.error('[submitLeetCode] Error adding points:', error);
    // Don't fail the submission if points fail
  }
  
  return upsertResult;
}

async function submitHackerRank(userId, url, manualCount) {
  console.log('[submitHackerRank] userId:', userId, 'url:', url, 'manualCount:', manualCount);
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) {
    console.error('[submitHackerRank] Profile not found for userId:', userId);
    throw new Error('Profile not found');
  }
  
  // For now, we'll use manual count since HackerRank scraping is more complex
  let problemsSolved = manualCount || 0;
  
  if (!problemsSolved) {
    console.error('[submitHackerRank] No problems solved count provided');
    throw new Error('Please provide the number of problems solved on HackerRank');
  }
  
  const upsertResult = await CodingStat.upsert({
    profileId: profile.id,
    platform: 'HackerRank',
    url,
    problemsSolved,
  }, { where: { profileId: profile.id, platform: 'HackerRank' } });
  console.log('[submitHackerRank] Upsert result:', upsertResult);
  
  // Add points for HackerRank submission
  try {
    await pointsService.addPointsForActivity(userId, 'HACKERRANK_SUBMISSION', { platform: 'HackerRank', problemsSolved });
    console.log('[submitHackerRank] Points added for HackerRank submission');
  } catch (error) {
    console.error('[submitHackerRank] Error adding points:', error);
    // Don't fail the submission if points fail
  }
  
  return upsertResult;
}

async function getStats(userId) {
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) throw new Error('Profile not found');
  return CodingStat.findAll({ where: { profileId: profile.id } });
}

module.exports = { submitLeetCode, submitHackerRank, getStats }; 