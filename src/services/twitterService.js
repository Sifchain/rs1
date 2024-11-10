import { TwitterApi } from 'twitter-api-v2'
import Agent from '@/models/Agent'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { getParsedOpenAIResponse } from '@/utils/ai'
import { z } from 'zod'
import { connectDB } from '@/utils/db'
import Tweet from '@/models/Tweet'

// Define the schema for OpenAI's parsed response
const SummaryTweetSchema = z.object({
  summary: z.string(),
  suggestedTweets: z.array(z.string()),
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
    await twitterClient.v2.tweet({
      text: tweetText,
      media: { media_ids: [mediaId] },
    })

    console.log('Tweeted successfully with image!')
  } catch (error) {
    console.error('Error tweeting image:', error)
  } finally {
    // Clean up by deleting the downloaded image
    if (tempImagePath && fs.existsSync(tempImagePath))
      fs.unlinkSync(tempImagePath)
  }
}

export async function fetchTrendingTopics(
  twitterClient,
  topics = '/(tech|crypto|innovation)/i'
) {
  const trends = await twitterClient.v1.trendsByPlace(1) // 1 = Global trending topics
  const filteredTrends = trends[0].trends.filter(
    trend => trend.name.match(topics) // Adjust filter criteria
  )
  return filteredTrends.map(trend => trend.name)
}

export async function summarizeTweetsForTrend(trend) {
  const tweets = await twitterClient.v2.search(trend, { max_results: 10 })
  const trendTweetTexts = tweets.data.map(tweet => tweet.text).join('\n\n')
  await connectDB()
  const rspTweets = await Tweet.find({}).sort({ createdAt: -1 }) // Sort by creation date, newest first
  const rspTweetTexts = rspTweets.map(tweet => tweet.text).join('\n\n')

  const prompt = `Summarize the following tweets and return suggested tweets based off of @reality_spiral's previous tweets.

   The tweets to summarize ${trendTweetTexts}
   @reality_spiral's previous tweets: ${rspTweetTexts}`

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

  return { summary, suggestedTweets }
}
