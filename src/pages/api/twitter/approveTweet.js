import Agent from '@/models/Agent'
import { TwitterApi } from 'twitter-api-v2'
import { connectDB } from '@/utils/db'
import { refreshTwitterToken } from '@/utils/auth/refreshTwitterToken'

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

      let twitterClient
      try {
        // Try refreshing the token to ensure it's valid
        twitterClient = await refreshTwitterToken(agent)
      } catch (error) {
        console.error('Failed to refresh Twitter token:', error)
        return res.status(400).json({
          error: 'Token refresh failed. User reauthorization may be needed.',
        })
      } finally {
        twitterClient = new TwitterApi(agent.twitterAuthToken.accessToken)
      }

      try {
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

        res
          .status(200)
          .json({ message: 'Twitter status updated successfully.', agent })
      } catch (error) {
        console.error('Error posting tweet:', error)
        agent.twitterPostStatus = 'Failed'
        agent.errorDetails = error.message
        await agent.save()

        res.status(500).json({ message: 'Twitter failed to update', agent })
      }
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
