import { connectDB } from '@/utils/db'
import Tweet from '../../../models/Tweet'

export default async function handler(req, res) {
  try {
    // Connect to the database
    await connectDB()

    // Retrieve all tweets from the MongoDB collection
    const tweets = await Tweet.find({}).sort({ createdAt: -1 }) // Sort by creation date, newest first

    // Return the tweets as a JSON response
    return res.status(200).json({ tweets })
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return res
      .status(500)
      .json({ error: 'Failed to retrieve tweets from the database' })
  }
}
