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

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'POST') {
    try {
      const { name, traits, focus, userId } = req.body

      if (!name || !traits || !focus) {
        return res
          .status(400)
          .json({ error: 'All fields are required: name, traits, focus' })
      }

      // Create a new agent associated with the current user
      const newAgent = new Agent({ name, traits, focus, user: userId })
      await newAgent.save()
      res.status(201).json(newAgent)
    } catch (error) {
      res.status(500).json({ error })
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch agents created by the authenticated user
      const agents = await Agent.find()
      // const agents = await Agent.find({ user: userId })
      res.status(200).json(agents)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agents' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, traits, focus, agentId, userId } = req.body
      if (!agentId || !name || !traits || !focus) {
        return res
          .status(400)
          .json({ error: 'All fields are required: id, name, traits, focus' })
      }
      // Ensure the user has permission to modify this agent
      await checkAgentOwnership(agentId, userId)
      // Update the agent
      const updatedAgent = await Agent.findByIdAndUpdate(
        agentId,
        { name, traits, focus },
        { new: true } // Return the updated agent
      )
      res.status(200).json(updatedAgent)
    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error: error.message || 'Failed to update agent' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
