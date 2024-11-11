import { connectDB } from '@/utils/db'
import Tweet from '../../../models/Tweet'
import { TwitterApi } from 'twitter-api-v2'
import {
  fetchTrendingTopics,
  summarizeTweetsForTrend,
} from '@/services/twitterService'
export default async function handler(req, res) {
  try {
    // Connect to the database
    const { trend } = req.query
    const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN)
    // Retrieve all tweets from the MongoDB collection
    const { summary, suggestedTweets, imageUrl } =
      await summarizeTweetsForTrend(twitterClient, trend)
    // Return the tweets as a JSON response
    return res.status(200).json({ summary, suggestedTweets, imageUrl })
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return res
      .status(500)
      .json({ error: 'Failed to retrieve tweets from the database' })
  }
}
