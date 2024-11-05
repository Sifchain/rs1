import { TwitterApi } from 'twitter-api-v2'
import Agent from '@/models/Agent'
import Backroom from '@/models/Backroom'
import { connectDB } from '@/utils/db'

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
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found in backroom' })
    }

    poll.results = pollResults
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
