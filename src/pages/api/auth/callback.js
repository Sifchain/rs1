// handler.js
import { TwitterApi } from 'twitter-api-v2'
import Agent from '../../../models/Agent'
import { connectDB } from '@/utils/db'
import Tweet from '../../../models/Tweet'
import {
  fetchTrendingTopics,
  summarizeTweetsForTrend,
} from '@/services/twitterService'
export default async function handler(req, res) {
  const { code, state, returnUrl } = req.query

  try {
    await connectDB()

    // Find the agent by state
    const agent = await Agent.findOne({ 'twitterAuthState.state': state })
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    const { codeVerifier } = agent.twitterAuthState
    if (!codeVerifier || state !== agent.twitterAuthState.state) {
      return res.status(400).json({ error: 'Invalid state' })
    }

    // Use the same fixed `redirectUri`
    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_API_KEY,
      clientSecret: process.env.TWITTER_API_SECRET_KEY,
    })

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
      expiresIn,
    } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: process.env.TWITTER_REDIRECT_URI,
    })
    // Not able to hit twitter API
    // const trends = await fetchTrendingTopics(loggedClient)
    // console.log('Trends:', trends)
    // const { summary, suggestedTweets } = await summarizeTweetsForTrend(
    //   loggedClient,
    //   'peanut the squirrel'
    // )
    // console.log('Summary:', summary)
    // console.log('Suggested tweets:', suggestedTweets)

    // Get authenticated user's ID
    // const user = await loggedClient.v2.userByUsername('reality_spiral')
    // const userId = user.data.id
    // Fetch all tweets for the authenticated user
    // const tweets = []
    // let paginationToken = null
    // do {
    //   const options = {
    //     max_results: 100, // Adjust as needed
    //     expansions: 'attachments.media_keys,referenced_tweets.id',
    //     'media.fields': 'url,type',
    //     'tweet.fields': 'created_at,public_metrics,referenced_tweets,text',
    //   }
    //   if (paginationToken) {
    //     options.pagination_token = paginationToken
    //   }

    //   const { data, meta } = await loggedClient.v2.userTimeline(userId, options)
    //   tweets.push(...data.data)
    //   paginationToken = meta.next_token || null
    // } while (paginationToken)

    // console.log('tweets', tweets)
    // for (const tweet of tweets) {
    //   const tweetObj = {
    //     id: tweet.id,
    //     text: tweet.text,
    //     type: 'tweet',
    //   }

    //   // Identify if it’s a retweet or a reply
    //   if (tweet.referenced_tweets) {
    //     const refTweet = tweet.referenced_tweets[0]
    //     if (refTweet.type === 'retweeted') {
    //       tweetObj.type = 'retweet'
    //     } else if (refTweet.type === 'replied_to') {
    //       tweetObj.type = 'reply'
    //     }
    //     tweetObj.text = refTweet.text
    //   }

    //   // Attach media URLs if media is present
    //   if (tweet.attachments?.media_keys) {
    //     tweetObj.media = tweet.attachments.media_keys
    //       .map(
    //         key => includes.media.find(media => media.media_key === key)?.url
    //       )
    //       .filter(Boolean)
    //   }
    //   await Tweet.findOneAndUpdate(
    //     { id: tweet.id },
    //     { text: tweet.text, type: tweet.type, media: tweet.media },
    //     { upsert: true, new: true }
    //   )
    // }
    if (!accessToken || !refreshToken) {
      return res
        .status(500)
        .json({ error: 'Failed to retrieve tokens from Twitter' })
    }

    // Save the tokens to the agent
    agent.twitterAuthToken = { accessToken, refreshToken }
    agent.twitterTokenExpiry = Date.now() + expiresIn * 1000
    agent.twitterAuthState = undefined
    await agent.save()

    // Redirect back to `returnUrl` if provided, or a default page
    res.redirect(
      returnUrl ||
        `/agents?agentId=${encodeURIComponent(agent._id)}&twitterLinked=true`
    )
  } catch (error) {
    console.error('Error during Twitter OAuth callback:', error)
    res
      .status(500)
      .json({ error: 'Failed to exchange tokens or link Twitter account' })
  }
}
