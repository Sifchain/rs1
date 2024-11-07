import { connectDB } from '@/utils/db'
import { continueStory } from '@/services/backroomService'

export default async function handler(req, res) {
  await connectDB()

  const { backroomId, pollTweetId, selectedOption } = req.query
  if (!backroomId || !selectedOption || !pollTweetId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const continuation = await continueStory(
      backroomId,
      pollTweetId,
      selectedOption
    )
    res
      .status(200)
      .json({ message: 'Story continued successfully', continuation })
  } catch (error) {
    console.error('Error continuing story:', error)
    res.status(500).json({ error: 'Failed to continue story' })
  }
}
