import Agent from '../../../models/Agent'
import { connectDB } from '@/utils/db'

// Middleware to set CORS headers for all responses
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Use specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'PUT, OPTIONS')
}

export default async function handler(req, res) {
  await connectDB()
  setHeaders(res)

  if (req.method === 'OPTIONS') {
    // Respond to preflight request
    return res.status(204).end()
  }

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

      res.status(200).json({
        message: 'Tweet successfully updated.',
        agent: updatedAgent,
      })

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
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
