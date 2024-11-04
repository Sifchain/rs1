import { TwitterApi } from 'twitter-api-v2'
import Agent from '../../models/Agent'
import { connectDB } from '@/utils/db'

export default async function handler(req, res) {
  try {
    // Connect to the database
    await connectDB()

    // Fetch the agent by ID (ensure this ID matches the agent you want to test with)
    const agent = await Agent.findById('67181ca457317b5855df4097')

    if (!agent || !agent.twitterAuthToken) {
      return res
        .status(404)
        .json({ error: 'Agent or Twitter tokens not found' })
    }

    // Extract access token and refresh token from the agent document
    const { accessToken, refreshToken } = agent.twitterAuthToken

    // Initialize Twitter API client with the agent's token
    const twitterClient = new TwitterApi(accessToken)

    // Post a test tweet
    const tweetText = 'This is a test tweet from the API! #Testing'

    try {
      const tweetResponse = await twitterClient.v2.tweet(tweetText)
      console.log('Tweet posted successfully:', tweetResponse)

      // Return success response
      res.status(200).json({
        message: 'Tweet posted successfully',
        tweet: tweetResponse,
      })
    } catch (error) {
      console.error('Error posting tweet:', error)
      return res
        .status(403)
        .json({ error: 'Failed to post tweet', details: error })
    }
  } catch (error) {
    console.error('Error fetching agent or posting tweet:', error)
    res.status(500).json({ error: 'Internal server error', details: error })
  }
}
