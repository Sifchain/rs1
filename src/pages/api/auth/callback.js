import { TwitterApi } from 'twitter-api-v2';
import Agent from '../../../models/Agent';
import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
};

export default async function handler(req, res) {
  const { code, state } = req.query;

  try {
    await connectDB();

    // Find the agent by state in their record
    const agent = await Agent.findOne({ 'twitterAuthState.state': state });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const { codeVerifier } = agent.twitterAuthState;

    // Ensure the state matches (security check)
    if (!codeVerifier || state !== agent.twitterAuthState.state) {
      console.error('State mismatch:', { storedState: agent.twitterAuthState.state, state });
      return res.status(400).json({ error: 'Invalid state' });
    }

    // Initialize Twitter API client with the app credentials
    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_API_KEY,
      clientSecret: process.env.TWITTER_API_SECRET_KEY,
    });

    // Exchange the authorization code for access and refresh tokens
    const { client: loggedClient, accessToken, refreshToken, expiresIn } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: process.env.TWITTER_REDIRECT_URI,
    });

    if (!accessToken || !refreshToken) {
      console.error('Twitter API did not return tokens:', { accessToken, refreshToken });
      return res.status(500).json({ error: 'Failed to retrieve tokens from Twitter' });
    }

    // Save the access and refresh tokens to the agent
    agent.twitterAuthToken = {
      accessToken,
      refreshToken,
    };
    agent.twitterTokenExpiry = Date.now() + expiresIn * 1000;

    // Clear the temporary auth state
    agent.twitterAuthState = undefined;

    await agent.save();

    console.log('Tokens saved successfully for agent:', agent.name);
    res.redirect(`/create-agent?agent=${encodeURIComponent(agent._id)}&twitterLinked=true`);
  } catch (error) {
    console.error('Error during Twitter OAuth callback:', error);
    res.status(500).json({ error: 'Failed to exchange tokens or link Twitter account' });
  }
}
