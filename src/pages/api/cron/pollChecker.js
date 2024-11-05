import Backroom from '@/models/Backroom'
import { connectDB } from '@/utils/db'
import { getPollResults } from '@/services/twitterService'
import { continueStory } from '@/services/backroomService'

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
      const winningOption = await getPollResults(
        backroom.explorerId,
        poll.tweetId
      )

      if (winningOption) {
        await continueStory(backroom._id, winningOption)
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
