import { connectDB } from '@/utils/db'
import Backroom from '../../../models/Backroom'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()
    const backroom = await Backroom.findById(id).lean() // Add .lean() here

    if (!backroom) {
      return res.status(404).json({ message: 'Backroom not found' })
    }

    return res.status(200).json(backroom)
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
