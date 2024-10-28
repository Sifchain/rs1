import Agent from '../../../models/Agent'
import mongoose from 'mongoose'
import { TwitterApi } from 'twitter-api-v2'
import { refreshTwitterToken } from '../../../utils/twitterTokenRefresh'

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'PUT') {
    const { agentId, tweetId } = req.body
    try {
      if (!agentId || !tweetId) {
        return res.status(400).json({ error: 'Missing required fields.' })
      }
      const updatedAgent = await Agent.findByIdAndUpdate(
        agentId,
        {
          $pull: { pendingTweets: { _id: tweetId } },
        },
        { new: true }
      )
      if (!updatedAgent) {
        return res.status(404).json({ error: 'Agent not found.' })
      }

      // Refresh Twitter token (if required)
      const refreshedClient = await refreshTwitterToken(updatedAgent)

      // Post the tweet
      const tweetResponse = await refreshedClient.v2.tweet(
        updatedAgent.pendingTweets.find(t => t._id === tweetId).tweetContent
      )
      console.log('Tweet posted successfully:', tweetResponse)

      // Update the agent with the posted tweet URL
      updatedAgent.tweets.push(
        `https://twitter.com/i/web/status/${tweetResponse.data.id}`
      )
      // Remove the tweet from the pendingTweets array
      updatedAgent.pendingTweets = updatedAgent.pendingTweets.filter(
        tweet => tweet._id !== tweetId
      )
      await updatedAgent.save()
      res
        .status(200)
        .json({ message: 'Tweet successfully posted.', agent: updatedAgent })
    } catch (error) {
      console.error('Error posting tweet:', error)
      res.status(500).json({ error: 'Failed to post tweet.' })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
