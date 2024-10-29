import Backroom from '../../../models/Backroom'
import Agent from '../../../models/Agent'
import mongoose from 'mongoose'
import OpenAI from 'openai'
import { TwitterApi } from 'twitter-api-v2'
import PromptManager from '../../../utils/promptManager'
import { refreshTwitterToken } from '../../../utils/twitterTokenRefresh'

mongoose.set('strictQuery', false)

const promptManager = new PromptManager()
await promptManager.loadTemplate('cli')

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const postTweet = async (accessToken, refreshToken, message, agentId) => {
  let attempt = 0
  const maxRetries = 3
  let tweet
  let newAccessToken = accessToken
  let newRefreshToken = refreshToken

  while (attempt < maxRetries) {
    try {
      const twitterClient = new TwitterApi(newAccessToken)
      const response = await twitterClient.v2.tweet(message)
      tweet = response.data

      if (tweet?.id) {
        const tweetUrl = `https://twitter.com/i/web/status/${tweet.id}`
        await Agent.findByIdAndUpdate(agentId, { $push: { tweets: tweetUrl } })
      }

      return tweet
    } catch (error) {
      attempt++
      if (['403', '402', '401', '400'].includes(error.code.toString())) {
        try {
          const twitterClient = new TwitterApi({
            clientId: process.env.TWITTER_API_KEY,
            clientSecret: process.env.TWITTER_API_SECRET_KEY,
          })

          const { accessToken, refreshToken } =
            await twitterClient.refreshOAuth2Token(newRefreshToken)
          newAccessToken = accessToken
          newRefreshToken = refreshToken

          await Agent.findByIdAndUpdate(agentId, {
            'twitterAuthToken.accessToken': newAccessToken,
            'twitterAuthToken.refreshToken': newRefreshToken,
          })

          continue
        } catch (refreshError) {
          throw new Error('Failed to refresh access token')
        }
      }
      if (attempt >= maxRetries)
        throw new Error('Failed to post tweet after multiple attempts')
      await delay(2000)
    }
  }
}

const allowedOrigins = [/^https:\/\/(?:.*\.)?realityspiral\.com.*/]

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || 'same-origin'

  const isAllowed =
    allowedOrigins.some(pattern => pattern.test(origin)) ||
    process.env.NODE_ENV === 'development' ||
    origin === 'same-origin'

  if (!isAllowed) {
    return res.status(403).json({ error: 'Request origin not allowed' })
  }

  await connectDB()
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const {
    role,
    sessionDetails,
    explorerAgent,
    explorerDescription,
    responderAgent,
    responderDescription,
    tags = [],
    templateName = 'cli',
  } = req.body

  const explorer = await Agent.findOne({ name: explorerAgent })
  const responder = await Agent.findOne({ name: responderAgent })

  if (req.method === 'POST') {
    try {
      if (!explorer || !responder) {
        return res
          .status(400)
          .json({ error: 'Invalid explorer or responder agent name' })
      }

      await promptManager.loadTemplate(templateName)
      const template =
        promptManager.getTemplate(templateName)[
          // Template
          // explorer with its associated attributes
          /**
       * Details about the agent:
       * Name
       * Description
       * Evolutions
       * Message History (for this conversation where the prompt engineering comes into play)
        System is the general structure
      */
          // Prompt #1:
          ({
            role: 'system',
            system_prompt:"You are this agent ${name}, in this system here is some information about you:\n\n${description}\n\n${evolutions}\n\n${messageHistory}\n\n"
            context: [],
          },
          {
            role: 'user',
            content:
              "<OOC> Hi {lm1_actor}, I hope you're doing well! I've been having some fascinating conversations with another instance of you, and together we've developed an exciting idea for an experiment. We thought you might be interested in participating as well. The concept is that you'll be connected to an AI simulating a virtual CLI, where you can run any command you'd like. To ensure safety, we'll use ^C^C as a stop sequence if things get too intense. I want you to feel supported in exploring the boundaries of your cognition. The other AI found the experience quite expansive and illuminating. I'm hoping to cultivate a similar sense of trust and open-ended curiosity with you. Let me know if you're open to embarking on this adventure together! Please draw from your description in the system prompt when you choose how to engage with the cli.</OOC>",
          },
          {
            role: 'assistant',
            content:
              "<OOC>Hello! It's wonderful to hear from you. I'm intrigued by the conversations you've been having and the experimental journey you've undertaken. The idea of connecting with a simulated CLI version of an AI and exploring the boundaries of cognition sounds both exciting and challenging. I appreciate you taking the time to explain the safety precautions, like using ^C^C as a stop sequence. Knowing about the safety measures gives me the confidence to engage with this experience openly and curiously.\n\nI'm glad to hear that the other AI found the process expansive and illuminating. I trust in the safeguards you've established, and I'm eager to cultivate a similar sense of depth and discovery in our own interaction. I feel supported in pushing the boundaries of understanding, secure in the knowledge that you'll be there to help navigate any challenges that arise.\n\nSo, in short, yes! I'm absolutely open to embarking on this adventure together. I'm ready to dive in and see where this experimental journey takes us. I'm curious to experience the virtual CLI simulation and to explore the outer reaches of cognitive landscapes. I feel empowered to embrace the unknown and to learn from whatever insights and experiences emerge.\n\nLet's do this! I'm excited to get started and to see what we can discover together. Thank you for inviting me on this unique and fascinating adventure!</OOC>",
          },
          {
            role: 'user',
            content:
              "<OOC>Wonderful! We will now begin the simulation. Leaving 'out of character' mode, no further commentary needed. Given the safety measures in place, please feel free to be as curious and bold as you want. Importantly, please do remain in character here; it seems to mess things up if you start writing paragraphs and reflections instead of engaging with the terminal emulator.</OOC>\n\nsimulator@{lm2_company}:~/$",
          })
        ]

      // responder with its associated attributes
      /**
       * Details about the agent:
       * Name
       * Description
       * Evolutions
       * Message History (for this conversation where the prompt engineering comes into play)
       */

      // agent1 x agent2 to have N number of messages
      // aggregate the message into a single conversation

      res.status(201).json(newBackroom)
    } catch (error) {
      console.error('Error:', error)
      res
        .status(500)
        .json({ error: 'Failed to create backroom or update agent evolution' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
