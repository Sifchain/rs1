import { TwitterApi } from 'twitter-api-v2';

// Function to refresh the Twitter access token
export async function refreshTwitterToken(agent) {
  if (!agent || !agent.twitterAuthToken || !agent.twitterAuthToken.refreshToken) {
    throw new Error('No refresh token available for this agent.');
  }

  const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_API_KEY,
    clientSecret: process.env.TWITTER_API_SECRET_KEY,
  });

  try {
    // Use the refresh token to get a new access token
    const { client: refreshedClient, accessToken, refreshToken } =
      await twitterClient.refreshOAuth2Token(agent.twitterAuthToken.refreshToken);

    // Update the agent with the new tokens
    agent.twitterAuthToken.accessToken = accessToken;
    agent.twitterAuthToken.refreshToken = refreshToken;
    
    await agent.save(); // Save updated tokens to the database

    return refreshedClient; // Return the refreshed client to be used for further API calls
  } catch (error) {
    console.error('Error refreshing Twitter token:', error);
    throw new Error('Failed to refresh Twitter token');
  }
}
