import {
  fetchTrendingTopics,
  summarizeTweetsForTrend,
  tweetImageWithText,
} from '@/services/twitterService'
import { generateImage } from '@/utils/ai'
import { TwitterApi } from 'twitter-api-v2'

export default async function handler(req, res) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).end('Unauthorized')
  }
  try {
    // Fetch and process trending topics
    const trends = await fetchTrendingTopics()
    const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN)
    const writeClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET_KEY,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    })
    // Iterate over each trend, summarize and post response
    const randomTrend = trends[Math.floor(Math.random() * trends.length)]
    console.log('Selected trend:', randomTrend)

    for (const trend of [randomTrend]) {
      try {
        const { summary, suggestedTweets } = await summarizeTweetsForTrend(
          twitterClient,
          trend
        )
        console.log('Summary:', summary)
        console.log('Suggested tweets:', suggestedTweets)
        // Generate an image related to the tweet content
        const imagePrompt = `Create a vivid, visually engaging image that represents the essence of the following tweet: "${suggestedTweets[0]}"`
        const imageUrl = await generateImage(imagePrompt)
        console.log('Image URL:', imageUrl)
        // Post suggested tweet to Twitter with image generated from summary
        const twitterWriteClient = writeClient.readWrite
        const tweetResponse = await tweetImageWithText(
          twitterWriteClient,
          imageUrl,
          suggestedTweets[0]
        )
        console.log({ tweetResponse })
        console.log(`Posted response for trend: ${trend}`)
      } catch (error) {
        console.error('Error summarizing and posting response:', error)
        continue
      }
    }

    res.status(200).json({ message: 'Bot ran successfully.' })
  } catch (error) {
    console.error('Error in bot execution:', error)
    res.status(500).json({ error: 'Bot execution failed.' })
  }
}
