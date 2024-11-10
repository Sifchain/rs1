import { connectDB } from '@/utils/db'
import Tweet from '../../../models/Tweet'
import { getParsedOpenAIResponse } from '@/utils/ai'
import { z } from 'zod'

// Define the schema for OpenAI's parsed response
const TweetSchema = z.object({
  tweets: z.array(z.string()),
})
export default async function handler(req, res) {
  try {
    // Connect to the database
    await connectDB()
    const {
      knowledgeLevel = 'High School',
      tweetToSummarize,
      focus,
    } = req.query
    // Retrieve all tweets from the MongoDB collection
    const tweets = await Tweet.find({}).sort({ createdAt: -1 }) // Sort by creation date, newest first
    const tweetTexts = tweets.map(tweet => tweet.text).join('\n\n')

    // Prompt for generating a new tweet
    const prompt = `
    Based on the style, tone, and topics of the following tweets:
        ${tweetTexts}
    Please create an explainer tweet thread that clearly, concisely, and accesibly summarizes the tweet as if you are someone with a knowledge level of ${knowledgeLevel} on this topic.  ${focus ? `\nPlease focus on:\n\n${focus}` : ''}
        ${tweetToSummarize}
    Please return the tweet thread as a JSON object with an array of tweets, with each tweet being a reply to the prior tweet.`
    let suggestedTweets = []
    try {
      // Schema for the response
      const parsedResponse = await getParsedOpenAIResponse(prompt, TweetSchema)
      suggestedTweets = parsedResponse.tweets
    } catch (error) {
      console.error('Error fetching interaction data:', error)
    }
    // Return the tweets as a JSON response
    return res.status(200).json({ tweets: suggestedTweets })
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return res
      .status(500)
      .json({ error: 'Failed to retrieve tweets from the database' })
  }
}
