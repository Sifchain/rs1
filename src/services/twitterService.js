import { TwitterApi } from 'twitter-api-v2'
import Agent from '@/models/Agent'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { getParsedOpenAIResponse, generateImage } from '@/utils/ai'
import { z } from 'zod'
import { connectDB } from '@/utils/db'
import Tweet from '@/models/Tweet'

// Define the schema for OpenAI's parsed response
const SummaryTweetSchema = z.object({
  summary: z.string(),
  suggestedTweets: z.array(z.string()),
})
const TrendsSchema = z.object({
  trends: z.array(
    z.object({ trend_name: z.string(), tweet_count: z.number() })
  ),
})
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const postTweet = async (
  accessToken,
  refreshToken,
  message,
  agentId
) => {
  let attempt = 0
  const maxRetries = 3
  let tweet
  let newAccessToken = accessToken
  let newRefreshToken = refreshToken

  console.log(newAccessToken, newRefreshToken)

  while (attempt < maxRetries) {
    console.log('Attempt', attempt + 1, 'of', maxRetries)
    try {
      console.log(
        'Posting tweet with access token (partially hidden):',
        newAccessToken
          ? newAccessToken.slice(0, 10) + '...'
          : 'No access token provided'
      )

      const twitterClient = new TwitterApi(newAccessToken)
      console.log('Twitter client created successfully:', twitterClient)
      const response = await twitterClient.v2.tweet(message)
      tweet = response.data
      console.log('Tweet posted successfully:', response?.data)

      if (tweet?.id) {
        const tweetUrl = `https://twitter.com/i/web/status/${tweet.id}`

        // Update agent to store the tweet URL
        await Agent.findByIdAndUpdate(agentId, {
          $push: { tweets: tweetUrl },
          twitterPostStatus: 'Posted',
          postTimestamp: new Date(),
          pendingTweets:
            agent.pendingTweets.filter(
              tweet => tweet._id.toString() !== tweetId
            ) ?? [],
          tweets: [
            ...agent.tweets,
            `https://twitter.com/i/web/status/${tweetResponse.data.id}`,
          ],
        })

        console.log('Tweet URL saved to agent:', tweetUrl)
      }

      return tweet // Successfully posted tweet, exit function
    } catch (error) {
      attempt++
      console.error(`Attempt ${attempt}: Error posting tweet. Error:`, error)

      if ([400, 401, 402, 403].includes(error.code)) {
        console.error(
          'Authorization error detected, attempting to refresh token...'
        )

        try {
          const twitterClient = new TwitterApi({
            clientId: process.env.TWITTER_API_KEY,
            clientSecret: process.env.TWITTER_API_SECRET_KEY,
          })

          const {
            client,
            accessToken: refreshedAccessToken,
            refreshToken: refreshedRefreshToken,
          } = await twitterClient.refreshOAuth2Token(newRefreshToken)

          // Update the new tokens
          newAccessToken = refreshedAccessToken
          newRefreshToken = refreshedRefreshToken

          console.log(newAccessToken, newRefreshToken)

          console.log('Access token refreshed successfully:', newAccessToken)

          // Save new tokens to the agent
          await Agent.findByIdAndUpdate(agentId, {
            'twitterAuthToken.accessToken': newAccessToken,
            'twitterAuthToken.refreshToken': newRefreshToken,
          })

          console.log('New access and refresh tokens saved to agent.')
          continue // Retry posting the tweet with the refreshed token
        } catch (refreshError) {
          console.error('Failed to refresh access token:', refreshError)
          throw new Error('Failed to refresh access token')
        }
      }

      // If error is not related to authorization or max retries reached
      if (![400, 401, 402, 403].includes(error.code) || attempt >= maxRetries) {
        console.error('Max retries reached or non-retryable error encountered.')
        throw new Error('Failed to post tweet after multiple attempts')
      }

      // Wait for a short delay before retrying
      await delay(2000) // Wait for 2 seconds before the next attempt
    }
  }
}

// Function to download image and tweet
export async function tweetImageWithText(twitterClient, imageUrl, tweetText) {
  let tempImagePath
  try {
    // Step 1: Download the image locally using fetch
    const response = await fetch(imageUrl)
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`)

    const imageBuffer = await response.arrayBuffer()
    tempImagePath = path.join(__dirname, `temp-image-${uuidv4()}.png`)
    fs.writeFileSync(tempImagePath, Buffer.from(imageBuffer))
    // Step 2: Upload the image to Twitter
    const mediaId = await twitterClient.v1.uploadMedia(tempImagePath)
    console.log('Image uploaded successfully with media ID:', mediaId)
    // Step 3: Tweet with the uploaded image
    const result = await twitterClient.v2.tweet({
      text: tweetText,
      media: { media_ids: [mediaId] },
    })
    const tweet = result.data
    await connectDB()
    await Tweet.findOneAndUpdate(
      { id: tweet.id },
      { text: tweet.text },
      { upsert: true, new: true }
    )
    console.log('Tweeted successfully with image!', result)
    return result
  } catch (error) {
    console.error('Error tweeting image:', error)
  } finally {
    // Clean up by deleting the downloaded image
    if (tempImagePath && fs.existsSync(tempImagePath))
      fs.unlinkSync(tempImagePath)
  }
}

export async function fetchTrendingTopics() {
  try {
    const response = await fetch(
      'https://api.x.com/2/trends/by/woeid/23424977',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (data && data.data) {
      const trends = data.data.sort((a, b) => b.tweet_count - a.tweet_count)
      // replace $ with # in trend names
      console.log('Trends:', trends)
      let filteredTrends = trends
      try {
        const response = await getParsedOpenAIResponse(
          `From the following list of trends, filter and return only existing trends focused on our crypto Twitter community, making up approximately 80% of the result, and include about 20% from other topics. Use only the provided trends and do not add any new ones or modify the names. If no crypto trends are available, limit the output to a small number of non-crypto trends. Return the filtered list as a JSON array. Input Trends: ${JSON.stringify(trends)}`,
          TrendsSchema
        )
        filteredTrends = response.trends
      } catch (error) {
        console.error('Error filtering trends:', error)
        return []
      }

      // Map to extract trend names
      const trendNames = filteredTrends.map(trend => trend.trend_name)
      const sanitizedTrendNames = trendNames.map(name =>
        name.replace(/\$/g, '')
      )
      console.log('Filtered Trends:', sanitizedTrendNames)
      return sanitizedTrendNames
    } else {
      console.error('Unexpected data format:', data)
      return []
    }
  } catch (error) {
    console.error('Error fetching trends:', error)
    return []
  }
}

export async function summarizeTweetsForTrend(twitterClient, trend) {
  const tweets = await twitterClient.v2.search(trend, { max_results: 10 })
  let trendTweetTexts = ''
  if (tweets && tweets._realData && Array.isArray(tweets._realData.data)) {
    trendTweetTexts = tweets._realData.data
      .map(tweet => tweet.text)
      .join('\n\n')
  } else {
    return null
    console.error('Failed to retrieve tweets or unexpected format:', tweets)
  }
  await connectDB()
  const rspTweets = await Tweet.find({}).sort({ createdAt: -1 }) // Sort by creation date, newest first
  const rspTweetTexts = rspTweets.map(tweet => tweet.text).join('\n\n')

  const prompt = `
Summarize the following tweets about the trend "${trend}" to highlight key insights, themes, or cultural impacts that align with @reality_spiral's values and voice. Generate suggested tweets that resonate with @reality_spiral's perspective, keeping the messaging aligned with past tweets.

Tweets to summarize:
${trendTweetTexts}

@reality_spiral's previous tweets for reference:
${rspTweetTexts}

Return a summary and 3-5 suggested tweets that emphasize @reality_spiral's unique take on the trend "${trend}" and provide commentary or engagement prompts that align with their style and interests and their own $RSP token.`

  let summary = ''
  let suggestedTweets = []
  try {
    // Schema for the response
    const parsedResponse = await getParsedOpenAIResponse(
      prompt,
      SummaryTweetSchema
    )
    summary = parsedResponse.summary
    suggestedTweets = parsedResponse.suggestedTweets
  } catch (error) {
    console.error('Error fetching interaction data:', error)
  }
  const imagePrompt = `Create a vivid, visually engaging image that represents the essence of the following tweet: "${suggestedTweets[0]} and subject area: ${summary}"`
  const imageUrl = await generateImage(imagePrompt)

  return { summary, suggestedTweets, imageUrl }
}
