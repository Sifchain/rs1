import Backroom from '../../../models/Backroom'
import { connectDB } from '@/utils/db'

// const allowedOrigins = [/^https:\/\/(?:.*\.)?realityspiral\.com.*/]

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
  // const origin = req.headers.origin || req.headers.referer || 'same-origin'
  // const isAllowed =
  //   allowedOrigins.some(pattern => pattern.test(origin)) ||
  //   process.env.NODE_ENV === 'development' ||
  //   origin === 'same-origin'

  // if (!isAllowed) {
  //   return res.status(403).json({ error: 'Request origin not allowed' })
  // }
  try {
    await connectDB()

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
