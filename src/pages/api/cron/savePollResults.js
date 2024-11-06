import { TwitterApi } from 'twitter-api-v2'
import Agent from '@/models/Agent'
import Backroom from '@/models/Backroom'
import { connectDB } from '@/utils/db'

function determineWinningOption(options) {
  if (
    !options ||
    options.length === 0 ||
    options.every(opt => opt.votes === 0)
  ) {
    return null
  }

  const winningOption = options.reduce(
    (max, opt) => (opt.votes > max.votes ? opt : max),
    options[0]
  )

  const isTie =
    options.filter(opt => opt.votes === winningOption.votes).length > 1
  return isTie ? null : winningOption.label
}

export default async function handler(req, res) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).end('Unauthorized')
  }

  await connectDB()

  try {
    const backroomsWithExpiredPolls = await Backroom.find({
      'polls.posted': true,
      'polls.status': 'pending',
      'polls.expiresAt': { $lte: new Date() },
    })

    for (const backroom of backroomsWithExpiredPolls) {
      // Need to identify this better as there could be multiple pending polls if there was an error
      const poll = backroom.polls.find(p => p.status === 'pending')
      const remainingPolls = backroom.polls.filter(
        poll => p.status !== 'pending'
      )
      const agent = await Agent.findById(backroom.explorerId)

      if (!agent || !agent.twitterAuthToken.accessToken) {
        console.warn(
          `Agent ${backroom.explorerId} missing Twitter credentials.`
        )
        continue
      }

      const twitterClient = new TwitterApi(agent.twitterAuthToken.accessToken)

      try {
        const tweetData = await twitterClient.v2.singleTweet(poll.tweetId, {
          expansions: ['attachments.poll_ids'],
          'poll.fields': ['options', 'end_datetime'],
        })

        if (!tweetData.includes.polls || !tweetData.includes.polls[0]) {
          console.warn(`Poll data not found for tweet ${poll.tweetId}`)
          continue
        }

        const pollData = tweetData.includes.polls[0]
        const pollResults = {}
        pollData.options.forEach(option => {
          pollResults[option.label] = option.votes
        })

        const winningOption = determineWinningOption(pollData.options)

        poll.selectedOption = winningOption
        poll.results = pollResults
        poll.status = 'completed'
        backroom.polls = [poll, ...remainingPolls]
        await backroom.save()
      } catch (error) {
        console.error(`Error processing poll for tweet ${poll.tweetId}:`, error)
      }
    }

    res.status(200).json({
      message: 'All pending polls checked and processed successfully.',
    })
  } catch (error) {
    console.error('Error processing expired polls:', error)
    res.status(500).json({ error: 'Failed to process expired polls' })
  }
}
