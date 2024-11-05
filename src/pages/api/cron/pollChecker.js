// pages/api/cron/pollChecker.js
import Backroom from '@/models/Backroom'
import { connectDB } from '@/utils/db'
import { getPollResults } from '@/api/backroom/getPollResults'
import { continueStory } from '@/api/backroom/continue'

export default async function handler(req, res) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).end('Unauthorized')
  }

  await connectDB()
  try {
    const expiredPolls = await Backroom.find({
      'polls.posted': true,
      'polls.status': 'pending',
      'polls.expiresAt': { $lte: new Date() },
    })

    for (const backroom of expiredPolls) {
      const poll = backroom.polls.find(p => p.status === 'pending')
      const pollResult = await getPollResults(poll.tweetId)

      if (pollResult) {
        // Continue story with winning option
        await continueStory(backroom._id, pollResult.winningOption)

        // Update poll status to prevent duplicate processing
        poll.status = 'completed'
        await backroom.save()
      }
    }
    res
      .status(200)
      .json({ message: 'Polls checked and processed successfully' })
  } catch (error) {
    console.error('Error processing expired polls:', error)
    res.status(500).json({ error: 'Failed to process expired polls' })
  }
}
