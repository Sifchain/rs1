import Backroom from '../../models/Backroom'
import { connectDB } from '@/utils/db'

export default async function handler(req, res) {
  await connectDB()

  try {
    // Aggregate tags and get the top 10 most frequent ones
    const topTags = await Backroom.aggregate([
      { $unwind: '$tags' }, // Unwind the tags array to count each tag individually
      { $group: { _id: '$tags', count: { $sum: 1 } } }, // Group by tag and count occurrences
      { $sort: { count: -1 } }, // Sort by count in descending order
      { $limit: 10 }, // Limit to the top 10 tags
    ])

    // Map the results to a simple format (just the tag names)
    const formattedTags = topTags.map(tag => tag._id)

    res.status(200).json({ topTags: formattedTags })
  } catch (error) {
    console.error('Error fetching top tags:', error)
    res.status(500).json({ error: 'Failed to fetch top tags' })
  }
}
