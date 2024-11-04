import Agent from '../../../models/Agent'
import { connectDB } from '@/utils/db'

export default async function handler(req, res) {
  await connectDB()

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
      res
        .status(200)
        .json({ message: 'Tweet successfully discarded.', agent: updatedAgent })
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
    res.setHeader('Allow', ['DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
