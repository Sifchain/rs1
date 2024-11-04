import Backroom from '../../../models/Backroom'
import { connectDB } from '@/utils/db'

// Middleware to set CORS headers for all responses
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Use a specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'GET, OPTIONS')
}

export default async function handler(req, res) {
  await connectDB()
  setHeaders(res)

  if (req.method === 'OPTIONS') {
    // Respond to CORS preflight request
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const { id, agentId } = req.query
    if (id != null) {
      // Find a specific Backroom by ID
      const backroom = await Backroom.findById(id).lean()
      if (!backroom) {
        return res.status(404).json({ error: 'Backroom not found' })
      }

      // Check if the agentId matches either explorerId or responderId
      if (
        agentId &&
        ![
          backroom.explorerId.toString(),
          backroom.responderId.toString(),
        ].includes(agentId)
      ) {
        return res
          .status(403)
          .json({ error: 'Agent does not have access to this backroom' })
      }

      return res.status(200).json(backroom)
    } else {
      // General query to fetch backrooms where the agentId matches either explorerId or responderId
      const query = agentId
        ? { $or: [{ explorerId: agentId }, { responderId: agentId }] }
        : {}

      const backrooms = await Backroom.find(
        query,
        '_id tags explorerAgentName responderAgentName explorerId responderId createdAt content backroomType topic title'
      )
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
      return res.status(200).json(backrooms)
    }
  } catch (error) {
    console.error('Error fetching backrooms:', error)
    return res.status(500).json({ error: 'Failed to fetch backrooms' })
  }
}
