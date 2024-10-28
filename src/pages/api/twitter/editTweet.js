import Agent from '../../../models/Agent'
import mongoose from 'mongoose'

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
    const { agentId, tweetId, tweetContent } = req.body
    try {
      if (!agentId || !tweetId || !tweetContent) {
        return res.status(400).json({ error: 'Missing required fields.' })
      }
      const updatedAgent = await Agent.findByIdAndUpdate(
        agentId,
        {
          $set: {
            'pendingTweets.$[elem].tweetContent': tweetContent,
          },
        },
        { arrayFilters: [{ 'elem._id': tweetId }], new: true }
      )
      if (!updatedAgent) {
        return res.status(404).json({ error: 'Agent not found.' })
      }
      res
        .status(200)
        .json({ message: 'Tweet successfully updated.', agent: updatedAgent })
      console.log({
        title: 'Tweet Updated',
        description: 'The tweet content has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error updating tweet:', error)
      res.status(500).json({ error: 'Failed to update tweet.' })
      console.log({
        title: 'Error',
        description: 'Failed to update the tweet. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
