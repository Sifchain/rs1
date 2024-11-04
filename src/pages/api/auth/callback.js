// handler.js
import { TwitterApi } from 'twitter-api-v2'
import Agent from '../../../models/Agent'
import { connectDB } from '@/utils/db'

export default async function handler(req, res) {
  const { code, state, returnUrl } = req.query

  try {
    await connectDB()

    // Find the agent by state
    const agent = await Agent.findOne({ 'twitterAuthState.state': state })
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    const { codeVerifier } = agent.twitterAuthState
    if (!codeVerifier || state !== agent.twitterAuthState.state) {
      return res.status(400).json({ error: 'Invalid state' })
    }

    // Use the same fixed `redirectUri`
    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_API_KEY,
      clientSecret: process.env.TWITTER_API_SECRET_KEY,
    })

    const { accessToken, refreshToken, expiresIn } =
      await twitterClient.loginWithOAuth2({
        code,
        codeVerifier,
        redirectUri: process.env.TWITTER_REDIRECT_URI,
      })

    if (!accessToken || !refreshToken) {
      return res
        .status(500)
        .json({ error: 'Failed to retrieve tokens from Twitter' })
    }

    // Save the tokens to the agent
    agent.twitterAuthToken = { accessToken, refreshToken }
    agent.twitterTokenExpiry = Date.now() + expiresIn * 1000
    agent.twitterAuthState = undefined
    await agent.save()

    // Redirect back to `returnUrl` if provided, or a default page
    res.redirect(
      returnUrl ||
        `/agents?agentId=${encodeURIComponent(agent._id)}&twitterLinked=true`
    )
  } catch (error) {
    console.error('Error during Twitter OAuth callback:', error)
    res
      .status(500)
      .json({ error: 'Failed to exchange tokens or link Twitter account' })
  }
}
