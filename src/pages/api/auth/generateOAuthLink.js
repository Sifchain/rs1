// generateOAuthLink.js
import { TwitterApi } from 'twitter-api-v2'
import Agent from '@/models/Agent'
import { connectDB } from '@/utils/db'
import { BASE_URL } from '@/constants/constants'

// Middleware to set CORS headers for all requests
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Update to specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'POST, GET, PUT, OPTIONS')
}

export default async function generateOAuthLink(req, res) {
  const { agentId, returnUrl } = req.query

  try {
    await connectDB()
    setHeaders(res)

    if (req.method === 'OPTIONS') {
      // Handle preflight request
      return res.status(204).end()
    }

    const agent = await Agent.findById(agentId)
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_API_KEY,
      clientSecret: process.env.TWITTER_API_SECRET_KEY,
    })

    // Generate the authorization link with scopes
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

    // Append returnUrl as a query parameter in the redirect link
    const redirectUrl = `${url}&returnUrl=${encodeURIComponent(returnUrl || BASE_URL)}`
    res.status(200).json({ url: redirectUrl })
  } catch (error) {
    console.error('Error generating Twitter OAuth link:', error)
    res.status(500).json({ error: 'Failed to generate OAuth URL' })
  }
}
