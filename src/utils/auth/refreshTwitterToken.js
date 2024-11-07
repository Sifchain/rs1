import { TwitterApi } from 'twitter-api-v2'
import { isTwitterTokenExpired } from '@/utils/twitterUtils'
import { connectDB } from '@/utils/db'

export async function refreshTwitterToken(agent) {
  // Check if the token is expired
  if (!isTwitterTokenExpired(agent.twitterTokenExpiry)) {
    // Token is still valid, return the current client
    return new TwitterApi({
      clientId: process.env.TWITTER_API_KEY,
      clientSecret: process.env.TWITTER_API_SECRET_KEY,
    })
  }
  const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_API_KEY,
    clientSecret: process.env.TWITTER_API_SECRET_KEY,
  })

  try {
    const {
      client: refreshedClient,
      accessToken,
      refreshToken,
    } = await twitterClient.refreshOAuth2Token(
      agent.twitterAuthToken.refreshToken
    )

    // Update the agent with the new tokens
    agent.twitterAuthToken = {
      accessToken,
      refreshToken: refreshToken || agent.twitterAuthToken.refreshToken, // Use the new refresh token if available
    }
    await agent.save()

    return refreshedClient // Return the refreshed client to continue API calls
  } catch (error) {
    console.error('Failed to refresh Twitter token:', error)
    throw new Error('Token refresh failed. Reauthorization may be required.')
  }
}
