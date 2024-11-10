import { connectDB } from '@/utils/db'
import Tweet from '../../../models/Tweet'
import { getParsedOpenAIResponse } from '@/utils/ai'
import { z } from 'zod'

// Define the schema for OpenAI's parsed response
const TweetSchema = z.object({
  tldr: z.string(),
  tweets: z.array(z.string()),
})
const TweetFinalSchema = z.object({
  tweet: z.string(),
})

export default async function handler(req, res) {
  try {
    // Connect to the database
    await connectDB()
    const {
      knowledgeLevel = 'High School',
      tweetToSummarize,
      focus,
      comments,
    } = req.query

    // Retrieve all tweets from the MongoDB collection
    const tweets = await Tweet.find({}).sort({ createdAt: -1 }) // Sort by creation date, newest first
    const tweetTexts = tweets.map(tweet => tweet.text).join('\n\n')

    // Prompt for generating a new tweet
    const prompt = `
    Based on the style, tone, and topics of the following tweets:
        ${tweetTexts}
    Please create an explainer tweet thread that clearly, concisely, and accessibly summarizes the tweet as if you are someone with a knowledge level of ${knowledgeLevel} on this topic.

    ${focus ? `\nPlease focus on:\n\n${focus}` : ''}
    ${comments ? `\nPlease use the following comments to help you:\n\n${comments}` : ''}
        ${tweetToSummarize}
    Please return the tweet thread as a JSON object with keys, tldr, which has a 2-3 sentence summary of the article that would intrigue a reader to see more on their timeline and an array of tweets, with each tweet being a reply to the prior tweet.`

    let summaryTweets = []
    let tldr = ''
    let finalTweet = ''

    try {
      // Schema for the response
      const parsedResponse = await getParsedOpenAIResponse(prompt, TweetSchema)
      summaryTweets = parsedResponse.tweets
      tldr = parsedResponse.tldr
    } catch (error) {
      console.error('Error fetching interaction data:', error)
    }

    try {
      // Use template literals directly to ensure newlines are included
      const finalPrompt = `Format this as a single tweet in the following format. Please include all values and add newlines.:
      TL;DR:
      ${tldr}

      Summary:
      ${summaryTweets.join('\n\n')}
      `

      // Use the final prompt in the OpenAI response
      const parsedResponse = await getParsedOpenAIResponse(
        finalPrompt,
        TweetFinalSchema
      )
      finalTweet = parsedResponse.tweet
    } catch (error) {
      console.error('Error fetching interaction data:', error)
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    // Return the tweets as a JSON response
    return res.status(200).send(finalTweet)
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return res
      .status(500)
      .json({ error: 'Failed to retrieve tweets from the database' })
  }
}
