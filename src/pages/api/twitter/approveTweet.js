import Agent from '../../../models/Agent'
import { TwitterApi } from 'twitter-api-v2'
import { connectDB } from '@/utils/db'

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'PUT') {
    const { agentId, tweetId } = req.body

    if (!agentId || !tweetId) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: agentId or tweetId.' })
    }

    try {
      const agent = await Agent.findById(agentId)
      if (!agent) return res.status(404).json({ error: 'Agent not found.' })

      const pendingTweet = agent.pendingTweets.find(
        tweet => tweet._id.toString() === tweetId
      )
      if (!pendingTweet)
        return res
          .status(404)
          .json({ error: 'No pending tweet found with the specified ID.' })

      // Refresh Twitter token if needed

      const twitterClient = new TwitterApi(agent.twitterAuthToken.accessToken)

      try {
        const tweetResponse = await twitterClient.v2.tweet(
          pendingTweet.tweetContent
        )

        // Update the agent with the posted tweet's URL
        agent.tweets.push(
          `https://twitter.com/i/web/status/${tweetResponse.data.id}`
        )
        agent.pendingTweets = agent.pendingTweets.filter(
          tweet => tweet._id.toString() !== tweetId
        )

        // Update status to Posted
        agent.twitterPostStatus = 'Posted'
        agent.postTimestamp = new Date()
      } catch (error) {
        // Handle rate limiting or posting issues
        console.error('Error posting tweet:', error)

        agent.twitterPostStatus = 'Failed'
        agent.errorDetails = error.message
        await agent.save()
        res.status(500).json({ message: 'Twitter failed to update', agent })
      }

      await agent.save()
      res
        .status(200)
        .json({ message: 'Twitter status updated successfully.', agent })
    } catch (error) {
      console.error('Handler Error:', error)
      res
        .status(500)
        .json({ error: 'An error occurred while processing the request.' })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
