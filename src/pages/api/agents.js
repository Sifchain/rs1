import Agent from '../../models/Agent'
import User from '../../models/User'
import { checkAgentOwnership } from '../../utils/permissions'
import { connectDB } from '@/utils/db'

// Helper function to sanitize agent data
const sanitizeAgent = agent => {
  const {
    _id,
    name,
    description,
    evolutions,
    tweets,
    createdAt,
    updatedAt,
    conversationPrompt,
    recapPrompt,
    tweetPrompt,
  } = agent
  return {
    _id,
    name,
    description,
    evolutions,
    tweets,
    createdAt,
    updatedAt,
    conversationPrompt,
    recapPrompt,
    tweetPrompt,
  }
}

// Middleware to set CORS headers for all requests
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Update to specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'POST, GET, PUT, OPTIONS')
}

export default async function handler(req, res) {
  await connectDB()
  setHeaders(res)

  if (req.method === 'OPTIONS') {
    // Handle preflight request
    return res.status(204).end()
  }

  if (req.method === 'POST') {
    try {
      const { name, user, description } = req.body

      if (!name || !description) {
        return res
          .status(400)
          .json({ error: 'All fields are required: name, description' })
      }

      const newAgent = new Agent({
        name,
        user,
        description,
        originalDescription: description,
      })
      await newAgent.save()
      res.status(201).json(sanitizeAgent(newAgent))
    } catch (error) {
      res.status(500).json({ error })
    }
  } else if (req.method === 'GET') {
    try {
      const { agentId } = req.query
      if (agentId) {
        const explorer = await Agent.findById(agentId).lean()
        if (!explorer) {
          return res.status(404).json({ error: 'Agent not found' })
        }
        return res.status(200).json([explorer])
      } else {
        const agents = await Agent.find(
          {},
          '_id name description evolutions user tweets createdAt updatedAt pendingTweets originalDescription twitterAuthToken twitterAuthState twitterTokenExpiry'
        ).lean()
        return res.status(200).json(agents)
      }
    } catch (error) {
      console.error('Error in /api/agents:', error)
      return res
        .status(500)
        .json({ error: 'Failed to fetch agents', details: error.message })
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, agentId, userId, description = '' } = req.body
      if (!agentId || !name || !description) {
        return res.status(400).json({
          error: 'All fields are required: id, name',
        })
      }
      await checkAgentOwnership(agentId, userId)

      const updatedAgent = await Agent.findByIdAndUpdate(
        agentId,
        { name, description },
        { new: true }
      )

      res.status(200).json(sanitizeAgent(updatedAgent))
    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error: error.message || 'Failed to update agent' })
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
