import { TwitterApi } from 'twitter-api-v2'
import Agent from '@/models/Agent'
import { connectDB } from '@/utils/db'

export default async function handleTwitterCallback(req, res) {
  const { agentId, state, code } = req.body // Assuming this is a POST request with these fields in the body

  try {
    await connectDB()

    const agent = await Agent.findById(agentId)
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    // Verify the state to protect against CSRF
    if (state !== agent.twitterAuthState?.state) {
      return res.status(400).json({ error: 'Invalid state parameter' })
    }

    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_API_KEY,
      clientSecret: process.env.TWITTER_API_SECRET_KEY,
    })

    // Use the code to get accessToken and refreshToken
    const { accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier: agent.twitterAuthState.codeVerifier,
      redirectUri: process.env.TWITTER_REDIRECT_URI,
    })

    // Store the tokens in the agent model
    agent.twitterAuthToken = { accessToken, refreshToken }
    agent.twitterAuthState = undefined // Clear temporary state info
    await agent.save()

    res.status(200).json({ message: 'Authorization successful' })
  } catch (error) {
    console.error('Error handling Twitter callback:', error)
    res.status(500).json({ error: 'Failed to handle Twitter callback' })
  }
}
