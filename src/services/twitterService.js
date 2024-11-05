import { TwitterApi } from 'twitter-api-v2'
import Agent from '@/models/Agent'

// Helper function to determine the winning option in a poll
function determineWinningOption(options) {
  if (
    !options ||
    options.length === 0 ||
    options.every(opt => opt.votes === 0)
  ) {
    return null // No votes or empty options array
  }

  const winningOption = options.reduce(
    (max, opt) => (opt.votes > max.votes ? opt : max),
    options[0]
  )
  const isTie =
    options.filter(opt => opt.votes === winningOption.votes).length > 1

  return isTie ? null : winningOption.label
}

export async function getPollResults(agentId, pollId) {
  const agent = await Agent.findById(agentId)
  if (!agent || !agent.twitterAuthToken.accessToken) {
    throw new Error('Agent or Twitter authentication not found')
  }

  const twitterClient = new TwitterApi(agent.twitterAuthToken.accessToken)
  const pollData = await twitterClient.v2.pollResults(pollId)

  if (!pollData || !pollData.data) {
    throw new Error('Poll data not found')
  }

  const winningOption = determineWinningOption(pollData.data.options)
  if (!winningOption) {
    throw new Error('No votes or poll resulted in a tie')
  }

  return winningOption
}
