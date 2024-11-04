import User from '../../models/User'
import { connectDB } from '@/utils/db'

// Middleware to set CORS headers for all responses
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Replace with a specific origin if necessary
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'POST, OPTIONS')
}

export default async function handler(req, res) {
  await connectDB()
  setHeaders(res)

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight request
    return res.status(204).end()
  }

  if (req.method === 'POST') {
    const { address } = req.body
    if (!address) {
      return res.status(400).json({ error: 'Address is required' })
    }

    try {
      // Check if user already exists
      let user = await User.findOne({ address })
      // If not, create a new user
      if (!user) {
        user = new User({ address })
        await user.save()
      }

      res.status(200).json(user)
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key error
        res.status(409).json({ error: 'User with this address already exists' })
      } else {
        console.error('Error creating or fetching user:', error)
        res.status(500).json({ error: 'Failed to create or fetch user' })
      }
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
