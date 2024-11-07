import Agent from '@/models/Agent'
import { TwitterApi } from 'twitter-api-v2'
import { connectDB } from '@/utils/db'
import { refreshTwitterToken } from '@/utils/auth/refreshTwitterToken'
import { postTweet } from '@/services/twitterService'

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
      if (!pendingTweet) {
        return res
          .status(404)
          .json({ error: 'No pending tweet found with the specified ID.' })
      }
      const client = new TwitterApi(agent.twitterAuthToken.accessToken)
      console.log('Client:', client)
      const tweet = await postTweet(
        agent.twitterAuthToken.accessToken,
        agent.twitterAuthToken.refreshToken,
        pendingTweet.tweetContent,
        agentId
      )
      if (!tweet) {
        return res
          .status(500)
          .json({ error: 'Failed to post tweet to Twitter.' })
      }
      return res.status(200).json({
        message: 'Tweet successfully approved.',
        agent: updatedAgent,
      })
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
