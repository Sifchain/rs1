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
