import Agent from '../../models/Agent'
import User from '../../models/User'
import { checkAgentOwnership } from '../../utils/permissions'
import mongoose from 'mongoose'

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

// Helper function to sanitize agent data
const sanitizeAgent = (agent) => {
  const { _id, name, traits, focus, description, evolutions, tweets, createdAt, updatedAt, conversationPrompt, recapPrompt, tweetPrompt } = agent
  return { _id, name, traits, focus, description, evolutions, tweets, createdAt, updatedAt, conversationPrompt, recapPrompt, tweetPrompt }
}

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'POST') {
    try {
      const { name, traits, focus, userId, conversationPrompt, recapPrompt, tweetPrompt } = req.body

      if (!name || !traits || !focus) {
        return res
          .status(400)
          .json({ error: 'All fields are required: name, traits, focus' })
      }

      // Create a new agent with optional prompts
      const newAgent = new Agent({ 
        name, 
        traits, 
        focus, 
        user: userId,
        conversationPrompt, 
        recapPrompt, 
        tweetPrompt 
      })
      await newAgent.save()
      
      // Sanitize and send the agent data
      res.status(201).json(sanitizeAgent(newAgent))
    } catch (error) {
      res.status(500).json({ error })
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch agents and include only the specified fields
      const agents = await Agent.find(
        {},
        '_id name traits focus description evolutions tweets conversationPrompt recapPrompt tweetPrompt createdAt updatedAt'
      )
      res.status(200).json(agents)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agents' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, traits, focus, agentId, userId, conversationPrompt = '', recapPrompt = '', tweetPrompt = '' } = req.body
      if (!agentId || !name || !traits || !focus) {
        return res
          .status(400)
          .json({ error: 'All fields are required: id, name, traits, focus' })
      }
      // Ensure the user has permission to modify this agent
      await checkAgentOwnership(agentId, userId)
      
      // Update the agent with optional prompts
      const updatedAgent = await Agent.findByIdAndUpdate(
        agentId,
        { name, traits, focus, conversationPrompt, recapPrompt, tweetPrompt },
        { new: true } // Return the updated agent
      )

      res.status(200).json(sanitizeAgent(updatedAgent))
    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error: error.message || 'Failed to update agent' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
