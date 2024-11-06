import Agent from '@/models/Agent'
import { TwitterApi } from 'twitter-api-v2'
import { connectDB } from '@/utils/db'
import { refreshTwitterToken } from '@/utils/auth/refreshTwitterToken'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const postTweet = async (accessToken, refreshToken, message, agentId) => {
  let attempt = 0
  const maxRetries = 3
  let tweet
  let newAccessToken = accessToken
  let newRefreshToken = refreshToken

  console.log(newAccessToken, newRefreshToken)

  while (attempt < maxRetries) {
    console.log('Attempt', attempt + 1, 'of', maxRetries)
    try {
      console.log(
        'Posting tweet with access token (partially hidden):',
        newAccessToken
          ? newAccessToken.slice(0, 10) + '...'
          : 'No access token provided'
      )
      console.log('Tweet message:', message)

      const twitterClient = new TwitterApi(newAccessToken)
      const response = await twitterClient.v2.tweet(message)
      tweet = response.data

      console.log('Tweet posted successfully:', tweet)

      // Save tweet link to the agent's document in MongoDB
      if (tweet?.id) {
        const tweetUrl = `https://twitter.com/i/web/status/${tweet.id}`

        // Update agent to store the tweet URL
        const tweetResponse = await twitterClient.v2.tweet(
          pendingTweet.tweetContent
        )
        // Update the agent with the posted tweet's URL
        agent.tweets.push(
          `https://twitter.com/i/web/status/${tweetResponse.data.id}`
        )
        agent.pendingTweets = agent.pendingTweets.filter(
          tweet => tweet._id.toString() !== tweetId
        )
        agent.twitterPostStatus = 'Posted'
        agent.postTimestamp = new Date()
        await agent.save()

        console.log('Tweet URL saved to agent:', tweetUrl)
      }

      return tweet
    } catch (error) {
      attempt++
      console.error(
        `Attempt ${attempt}: Error posting tweet with access token. Error:`,
        error
      )

      if (
        error.code === 403 ||
        error.code === 402 ||
        error.code === 401 ||
        error.code === 400
      ) {
        console.error('Received 400-403 error, attempting to refresh token...')

        // Attempt to refresh the token
        try {
          const twitterClient = new TwitterApi({
            clientId: process.env.TWITTER_API_KEY,
            clientSecret: process.env.TWITTER_API_SECRET_KEY,
          })

          const {
            client,
            accessToken: refreshedAccessToken,
            refreshToken: refreshedRefreshToken,
          } = await twitterClient.refreshOAuth2Token(newRefreshToken)

          // Update new access and refresh tokens
          newAccessToken = refreshedAccessToken
          newRefreshToken = refreshedRefreshToken

          console.log(newAccessToken, newRefreshToken)

          console.log('Access token refreshed successfully:', newAccessToken)

          // Save the new tokens to the agent's document
          await Agent.findByIdAndUpdate(agentId, {
            'twitterAuthToken.accessToken': newAccessToken,
            'twitterAuthToken.refreshToken': newRefreshToken,
          })

          console.log('New access and refresh tokens saved to agent.')
          continue // Retry the tweet posting with the refreshed token
        } catch (refreshError) {
          console.error('Failed to refresh access token:', refreshError)
          throw new Error('Failed to refresh access token')
        }
      }

      // Stop retrying if the error is not 403 or we've reached the max retries
      if (
        error.code !== 403 ||
        error.code !== 402 ||
        error.code !== 401 ||
        error.code !== 400 ||
        attempt >= maxRetries
      ) {
        console.error('Max retries reached or non-retryable error encountered.')
        throw new Error('Failed to post tweet after multiple attempts')
      }

      // Wait for a short delay before retrying
      await delay(2000) // Wait for 2 seconds before the next attempt
    }
  }
}

// Middleware to set CORS headers for all responses
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'PUT, OPTIONS')
}

export default async function handler(req, res) {
  await connectDB()
  setHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method === 'PUT') {
    const { agentId, tweetId } = req.body

    if (!agentId || !tweetId) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: agentId or tweetId.' })
    }

    try {
      const agent = await Agent.findById(agentId)
      if (!agent) return res.status(404).json({ error: 'Agent not found.' })

      const pendingTweet = agent.pendingTweets.find(
        tweet => tweet._id.toString() === tweetId
      )
      if (!pendingTweet)
        return res
          .status(404)
          .json({ error: 'No pending tweet found with the specified ID.' })
      console.log('Pending tweet found:', pendingTweet.tweetContent)
      console.log('Agent ID:', agent.twitterAuthToken.accessToken)
      console.log('Agent ID:', agent.twitterAuthToken.refreshToken)
      console.log('Agent ID:', agentId)
      await postTweet(
        agent.twitterAuthToken.accessToken,
        agent.twitterAuthToken.refreshToken,
        pendingTweet.tweetContent,
        agentId
      )
      console.log('Tweet posted successfully')
    } catch (error) {
      console.error('Handler Error:', error)
      res
        .status(500)
        .json({ error: 'An error occurred while processing the request.' })
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
