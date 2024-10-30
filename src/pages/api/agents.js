import Agent from '../../models/Agent'
import User from '../../models/User'
import { checkAgentOwnership } from '../../utils/permissions'
import mongoose from 'mongoose'
import { generateImage } from '../../utils/ai'

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

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

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'POST') {
    try {
      const { name, user, description } = req.body

      if (!name || !description) {
        return res
          .status(400)
          .json({ error: 'All fields are required: name, description' })
      }
      const imagePrompt = `Create an avatar image for the following agent name: ${name}`
      let imageUrl = await generateImage(imagePrompt)
      console.log('imageUrl', imageUrl)
      // Create a new agent with optional prompts
      const newAgent = new Agent({
        name,
        user,
        imageUrl,
        description,
        originalDescription: description,
      })
      await newAgent.save()

      // Sanitize and send the agent data
      res.status(201).json(sanitizeAgent(newAgent))
    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error })
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch agents and include only the specified fields
      const agents = await Agent.find(
        {},
        '_id name description evolutions user tweets conversationPrompt recapPrompt tweetPrompt createdAt updatedAt pendingTweets originalDescription imageUrl'
      )
      res.status(200).json(agents)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agents' })
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        name,
        agentId,
        userId,
        description = '',
        conversationPrompt = '',
        recapPrompt = '',
        tweetPrompt = '',
      } = req.body
      if (!agentId || !name || !description) {
        return res.status(400).json({
          error: 'All fields are required: id, name',
        })
      }
      // Ensure the user has permission to modify this agent
      await checkAgentOwnership(agentId, userId)

      // Update the agent with optional prompts
      const updatedAgent = await Agent.findByIdAndUpdate(
        agentId,
        {
          name,
          description,
          // should we update the original description?
          // originalDescription: description,
        },
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
