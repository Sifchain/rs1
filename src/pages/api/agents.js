import Agent from '../../models/Agent'
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
      const { name, traits, focus } = req.body

      if (!name || !traits || !focus) {
        return res
          .status(400)
          .json({ error: 'All fields are required: name, traits, focus' })
      }

      const newAgent = new Agent({ name, traits, focus })
      await newAgent.save()
      res.status(201).json(newAgent)
    } catch (error) {
      res.status(500).json({ error })
    }
  } else if (req.method === 'GET') {
    try {
      const agents = await Agent.find()
      res.status(200).json(agents)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agents' })
    }
  } else if (req.method === 'PUT') {
    // Handle agent update logic
    try {
      const { name, traits, focus, id } = req.body

      // Check if all required fields are provided
      if (!id || !name || !traits || !focus) {
        return res
          .status(400)
          .json({ error: 'All fields are required: id, name, traits, focus' })
      }

      // Find the agent by ID and update it
      const updatedAgent = await Agent.findByIdAndUpdate(
        id,
        { name, traits, focus },
        { new: true } // This returns the updated document
      )

      // If agent not found, return an error
      if (!updatedAgent) {
        return res.status(404).json({ error: 'Agent not found' })
      }

      res.status(200).json(updatedAgent)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update agent' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
