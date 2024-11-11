import Tweet from '../../../models/Tweet'
import {
  fetchTrendingTopics,
  summarizeTweetsForTrend,
} from '@/services/twitterService'
import { TwitterApi } from 'twitter-api-v2'

export default async function handler(req, res) {
  try {
    // const twitterClient = new TwitterApi({
    //   clientId: process.env.TWITTER_API_KEY,
    //   clientSecret: process.env.TWITTER_API_SECRET_KEY,
    // })
    // API isn't working for some reason
    // const trends = await fetchTrendingTopics(twitterClient)
    // console.log('Trends:', trends)
    // Return the trends as a JSON response
    // const { summary, suggestedTweets } = await summarizeTweetsForTrend(
    //   loggedClient,
    //   'peanut the squirrel'
    // )
    // Generate an image related to the tweet content
    return res.status(200).json({ summary, suggestedTweets })
  } catch (error) {
    console.error('Error fetching trends:', error)
    return res
      .status(500)
      .json({ error: 'Failed to retrieve trends from the database' })
  }
}
