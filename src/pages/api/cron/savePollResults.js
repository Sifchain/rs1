import { TwitterApi } from 'twitter-api-v2'
import Agent from '@/models/Agent'
import Backroom from '@/models/Backroom'
import { connectDB } from '@/utils/db'

function determineWinningOption(options) {
  // Ensure there are options with votes
  if (
    !options ||
    options.length === 0 ||
    options.every(opt => opt.votes === 0)
  ) {
    return null // No votes or empty options array
  }

  // Find the option with the highest votes
  const winningOption = options.reduce(
    (max, opt) => (opt.votes > max.votes ? opt : max),
    options[0]
  )

  // Check if there is a tie
  const isTie =
    options.filter(opt => opt.votes === winningOption.votes).length > 1
  return isTie ? null : winningOption.label // Return null if a tie, else winning option text
}

export default async function handler(req, res) {
  await connectDB()

  const { agentId, backroomId, pollTweetId } = req.query
  if (!agentId || !backroomId || !pollTweetId) {
    return res.status(400).json({
      error: 'Required fields: agentId, backroomId, pollTweetId',
    })
  }

  try {
    // Retrieve agent for Twitter authorization
    const agent = await Agent.findById(agentId)
    if (!agent || !agent.twitterAuthToken.accessToken) {
      return res.status(404).json({ error: 'Agent or Twitter auth not found' })
    }

    // Initialize Twitter client
    const twitterClient = new TwitterApi(agent.twitterAuthToken.accessToken)

    // Retrieve poll data from Twitter
    const tweetData = await twitterClient.v2.singleTweet(pollTweetId, {
      expansions: ['attachments.poll_ids'],
      'poll.fields': ['options', 'end_datetime'],
    })

    if (!tweetData.includes.polls || !tweetData.includes.polls[0]) {
      return res.status(404).json({ error: 'Poll data not found on Twitter' })
    }

    const pollData = tweetData.includes.polls[0]
    const pollResults = {}
    // Determine the winning option or handle edge cases
    const winningOption = determineWinningOption(pollData.data.options)

    // Format the results
    pollData.options.forEach(option => {
      pollResults[option.label] = option.votes
    })

    // Update the poll results in the backroom
    const backroom = await Backroom.findById(backroomId)
    if (!backroom) {
      return res.status(404).json({ error: 'Backroom not found' })
    }

    const poll = backroom.polls.find(poll => poll.tweetId === pollTweetId)
    const remainingPolls = backroom.polls.filter(
      poll => poll.tweetId !== pollTweetId
    )
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found in backroom' })
    }
    poll.selectedOption = winningOption
    poll.results = pollResults
    backroom.polls = [poll, ...remainingPolls]
    await backroom.save()

    res.status(200).json({
      message: 'Poll results fetched and saved successfully',
      results: pollResults,
    })
  } catch (error) {
    console.error('Error fetching Twitter poll results:', error)
    res.status(500).json({ error: 'Failed to fetch Twitter poll results' })
  }
}
