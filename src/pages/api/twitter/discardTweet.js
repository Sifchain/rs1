import Agent from '../../../models/Agent'
import { connectDB } from '@/utils/db'

// Middleware to set CORS headers for all responses
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Replace with specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'DELETE, OPTIONS')
}

export default async function handler(req, res) {
  await connectDB()
  setHeaders(res)

  if (req.method === 'OPTIONS') {
    // Respond to CORS preflight request
    return res.status(204).end()
  }

  if (req.method === 'DELETE') {
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

      res.status(200).json({
        message: 'Tweet successfully discarded.',
        agent: updatedAgent,
      })

      console.log({
        title: 'Tweet Discarded',
        description: 'The tweet has been successfully discarded.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error discarding tweet:', error)
      res.status(500).json({ error: 'Failed to discard tweet.' })

      console.log({
        title: 'Error',
        description: 'Failed to discard the tweet. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
