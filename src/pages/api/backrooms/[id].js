import { connectDB } from '@/utils/db'
import Backroom from '../../../models/Backroom'

// Middleware to set CORS headers for all responses
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Replace with specific origin if necessary
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'GET, OPTIONS')
}

export default async function handler(req, res) {
  setHeaders(res)

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight request
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query

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
