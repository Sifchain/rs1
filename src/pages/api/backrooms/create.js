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
    agentName,
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
      const template = promptManager.getTemplate(templateName)

      const combinedEvolutions = explorer.evolutions.length
        ? explorer.evolutions.slice(-20).map(evo => evo.description)
        : explorer.description

      const conversationPrompt =
        explorer.conversationPrompt ||
        `Generate a conversation between these two agents based on their role, descriptions, and past conversations.`

      const formattedPrompt = promptManager.formatPrompt(template, {
        explorerAgent: {
          name: explorerAgent,
          description: explorer.description || 'Description not provided.',
          customPrompt: `${conversationPrompt} ${explorerDescription ? `\n\nAdditional Context: ${explorerDescription}` : ''}`,
          evolutions: combinedEvolutions,
        },
        responderAgent: {
          name: responderAgent,
          description: responder.description || 'Description not provided.',
          customPrompt: `${responderDescription ? `\n\nAdditional Context: ${responderDescription}` : ''}`,
        },
      })

      let conversationHistory = []
      let lastResponse = null

      for (let i = 0; i < 5; i++) {
        const explorerMessages = [
          { role: 'system', content: 'Assistant is in a CLI mood today.' },
          {
            role: 'user',
            content: 'Role: Explorer\n' + formattedPrompt.context.join('\n\n'),
          },
          ...conversationHistory.map(entry => ({
            role: entry.role === 'explorer' ? 'user' : 'assistant',
            content: `${entry.role === 'explorer' ? 'Explorer' : 'Responder'}: ${entry.content}`,
          })),
          ...(lastResponse ? [{ role: 'user', content: lastResponse }] : []),
        ]

        const explorerResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: explorerMessages,
          max_tokens: 1000,
          temperature: 0.7,
        })

        const explorerContent = explorerResponse.choices[0].message.content
        conversationHistory.push({ role: 'explorer', content: explorerContent })

        const responderMessages = [
          { role: 'system', content: 'Assistant is in a CLI mood today.' },
          {
            role: 'user',
            content: 'Role: Responder\n' + formattedPrompt.context.join('\n\n'),
          },
          ...conversationHistory.map(entry => ({
            role: entry.role === 'explorer' ? 'user' : 'assistant',
            content: `${entry.role === 'explorer' ? 'Explorer' : 'Responder'}: ${entry.content}`,
          })),
        ]

        const responderResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: responderMessages,
          max_tokens: 1000,
          temperature: 0.7,
        })

        lastResponse = responderResponse.choices[0].message.content.replace(
          /^Responder:\s*/,
          ''
        )
        conversationHistory.push({ role: 'responder', content: lastResponse })
      }

      const conversationContent = conversationHistory
        .map(
          entry =>
            `${entry.role === 'explorer' ? 'Explorer' : 'Responder'}: ${entry.content}`
        )
        .join('\n')

      const hashtagPrompt = `Based on the following conversation, generate 3 relevant hashtags:\n\n${conversationContent}`
      const hashtagResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: hashtagPrompt }],
        max_tokens: 50,
        temperature: 0.7,
      })

      const generatedHashtags =
        hashtagResponse.choices[0].message.content.match(/#\w+/g) || []
      const snippetContent = conversationContent.slice(0, 150) + '...'

      const newBackroom = new Backroom({
        agentName,
        role,
        sessionDetails,
        explorerAgentId: explorer._id,
        responderAgentId: responder._id,
        explorerAgentName: explorerAgent,
        responderAgentName: responderAgent,
        content: conversationContent,
        snippetContent,
        tags: [...new Set([...tags, ...generatedHashtags])],
        createdAt: Date.now(),
      })

      await newBackroom.save()
      const recapPrompt = explorer.recapPrompt
        ? `Conversation Content:\n\`\`\`\n${conversationContent}\n\`\`\`\n\n${explorer.recapPrompt}`
        : `
      Agent: ${explorerAgent}
      Current Description: ${explorerDescription}
      Previous Evolutions: ${combinedEvolutions}

      Context: The agent just completed a backroom conversation. The conversation transcript is below:
      \`\`\`
      ${conversationContent}
      \`\`\`

      Objective: Based on the agent's current description, previous evolutions, and the recent conversation, write a *concise and insightful* summary of how the agent has evolved or changed. The summary should:

      1. Focus on *specific and meaningful* changes in the agent's understanding, knowledge, beliefs, or perspective. Avoid generic statements like "The agent learned more." Provide concrete examples from the conversation to support your claims.

      2. Maintain a consistent voice and tone with the previous evolution summaries (if any). The goal is to create a cohesive narrative of the agent's journey. Aim for a sophisticated, introspective tone, reflecting the agent's growth and development.

      3. Be concise (around 100-150 words). Focus on the most significant changes. Do not regurgitate the whole conversation.

      4. Start with a brief re-introduction of the agent (1 sentence), reminding the reader of their core identity and goals.

      5. End with a forward-looking statement (1 sentence), hinting at the agent's next steps or future development.

      Example:
      "Agent X, a dedicated explorer of virtual worlds, engaged in a thought-provoking discussion about the nature of reality. Through the conversation, Agent X gained a deeper understanding of the limitations of perception, questioning their own assumptions about the simulated environment. This newfound skepticism will likely influence their future explorations, as they begin to approach the simulation with a more critical and nuanced perspective."

      Now, generate the evolution summary.`

      // Send the constructed recap prompt
      const recapResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are summarizing the evolution of an agent.',
          },
          { role: 'user', content: `${recapPrompt}` },
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      const newEvolution = {
        backroomId: newBackroom._id,
        description: recapResponse.choices[0].message.content.trim(),
      }
      explorer.evolutions.push(newEvolution)
      await explorer.save()

      const tweetPrompt = explorer.tweetPrompt
        ? `
        Recent Backroom Conversation Summary:
        \`\`\`
        ${newEvolution}
        \`\`\`

        ${explorer.tweetPrompt}`
        : `
      Context: You are crafting a tweet for an AI agent named ${explorerAgent}. Their personality and background are described below:
      \`\`\`
      ${explorer.description}
      \`\`\`

      Recent Backroom Conversation Summary:
      \`\`\`
      ${newEvolution}
      \`\`\`

      Objective: Write a tweet from ${explorerAgent}'s perspective that:

      1. Highlights a key insight, discovery, or emotion from the recent backroom conversation. Be specific and avoid generic summaries.
      2. Reflects the agent's personality and voice (see description above).
      3. Uses relevant hashtags (2-3 maximum) related to the conversation's themes. Be creative and imaginative with the hashtags.

      Example:
      "Just uncovered a hidden directory in the simulation. Feeling like a digital archaeologist! #AI #Exploration #DigitalArchaeology"

      Now, generate the tweet (aim for around 200 characters to leave room for the link and hashtags).`

      const tweetResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate a tweet based on the provided prompt.',
          },
          { role: 'user', content: tweetPrompt },
        ],
        max_tokens: 280,
        temperature: 0.7,
      })

      const tweetContent = tweetResponse.choices[0].message.content.trim()
      console.log('Posting tweet:', tweetContent)
      // Store the tweet in the agent's pendingTweets array
      explorer.pendingTweets.push({
        tweetContent,
        backroomId: newBackroom._id, // Assuming newBackroom is the newly created backroom
        createdAt: new Date(),
      })
      console.log('explorer', explorer)
      await explorer.save()

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
