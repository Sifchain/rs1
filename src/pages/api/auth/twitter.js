import { TwitterApi } from 'twitter-api-v2'
import Agent from '../../../models/Agent'
import { connectDB } from '@/utils/db'

async function handler(req, res) {
  const { agentId } = req.query

  try {
    await connectDB()

    const agent = await Agent.findById(agentId)

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_API_KEY,
      clientSecret: process.env.TWITTER_API_SECRET_KEY,
    })

    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
      process.env.TWITTER_REDIRECT_URI,
      { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] }
    )

    agent.twitterAuthToken = {
      accessToken: '',
      refreshToken: '',
    }
    agent.twitterAuthState = {
      codeVerifier,
      state,
    }

    await agent.save()

    res.status(200).json({ url })
  } catch (error) {
    console.error('Error during Twitter OAuth:', error)
    res.status(500).json({ error: 'Failed to generate OAuth URL' })
  }
}

export default handler
