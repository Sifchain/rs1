import { TwitterApi } from 'twitter-api-v2'
import { connectDB } from '@/utils/db'
import Backroom from '@/models/Backroom'
import Agent from '@/models/Agent'

// Helper function to determine the winning option in a poll
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

  const { pollId, agentId } = req.query

  if (!pollId || !agentId) {
    return res.status(400).json({ error: 'pollId and agentId are required' })
  }

  try {
    // Retrieve agent with Twitter auth token
    const agent = await Agent.findById(agentId)
    if (!agent || !agent.twitterAuthToken.accessToken) {
      return res
        .status(404)
        .json({ error: 'Agent or Twitter authentication not found' })
    }

    const twitterClient = new TwitterApi(agent.twitterAuthToken.accessToken)

    // Retrieve poll results from Twitter
    const pollData = await twitterClient.v2.pollResults(pollId)
    if (!pollData || !pollData.data) {
      return res.status(404).json({ error: 'Poll data not found' })
    }

    // Determine the winning option or handle edge cases
    const winningOption = determineWinningOption(pollData.data.options)
    if (!winningOption) {
      return res
        .status(400)
        .json({ error: 'No votes or poll resulted in a tie' })
    }

    res.status(200).json({ winningOption })
  } catch (error) {
    console.error('Error retrieving poll results:', error)
    res.status(500).json({ error: 'Failed to retrieve poll results' })
  }
}
