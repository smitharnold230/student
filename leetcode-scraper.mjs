import fetch from 'node-fetch';

async function getLeetCodeSolvedCount(username) {
  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.com/${username}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return 0;
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return 0;
    }
    
    const stats = data.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!stats) {
      console.log('User not found or stats unavailable.');
      return 0;
    }
    
    const totalSolved = stats.find(x => x.difficulty === 'All')?.count || 0;
    console.log(`Solved: ${totalSolved}`);
    return totalSolved;
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error.message);
    return 0;
  }
}

// Helper to extract username from profile URL
function extractUsernameFromUrl(url) {
  // Accepts URLs like https://leetcode.com/u/username/ or https://leetcode.com/username/
  const match = url.match(/leetcode\.com\/(u\/)?([\w-]+)\/?/);
  return match ? match[2] : null;
}

// Get profile URL from command-line arguments
const profileUrl = process.argv[2];

if (!profileUrl) {
  console.log('Usage: node leetcode-scraper.mjs <leetcode_profile_url>');
  process.exit(1);
}

const username = extractUsernameFromUrl(profileUrl);
if (!username) {
  console.log('Invalid LeetCode profile URL. Please provide a valid profile link.');
  process.exit(1);
}

// Run the function and exit with appropriate code
getLeetCodeSolvedCount(username).then(solvedCount => {
  if (solvedCount > 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});