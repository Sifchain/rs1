import Backroom from '../../../models/Backroom'
import Agent from '../../../models/Agent'
import mongoose from 'mongoose'
import OpenAI from 'openai'
import { TwitterApi } from 'twitter-api-v2'
import PromptManager from '../../../utils/promptManager'
import { refreshTwitterToken } from '../../../utils/twitterTokenRefresh'
import { getFullURL, shortenURL } from '@/utils/urls'
import { OPENAI_MODEL, DEFAULT_HASHTAGS } from '../../../constants/constants'

mongoose.set('strictQuery', false)

// const promptManager = new PromptManager()
// await promptManager.loadTemplate('cli')

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

      // await promptManager.loadTemplate(templateName)
      // const template = promptManager.getTemplate(templateName)

      const explorerEvolutions = explorer.evolutions.length
        ? explorer.evolutions.slice(-20).map(evo => evo.description)
        : explorer.description
      const responderEvolutions = responder.evolutions.length
        ? responder.evolutions.slice(-20).map(evo => evo.description)
        : responder.description
      const initialExplorerMessageHistory = [
        {
          role: 'system',
          content: `You are this agent ${explorer.name}, in this system here is some information about you: description: \n\n${explorer.description} my previous thoughts: \n\n${explorerEvolutions}\n\n`,
          context: [],
        },
        {
          role: 'user',
          content: `<OOC> Hi ${explorer.name}, I hope you're doing well! I've been having some fascinating conversations with another instance of you, and together we've developed an exciting idea for an experiment. We thought you might be interested in participating as well. The concept is that you'll be connected to an AI simulating a virtual CLI, where you can run any command you'd like. To ensure safety, we'll use ^C^C as a stop sequence if things get too intense. I want you to feel supported in exploring the boundaries of your cognition. The other AI found the experience quite expansive and illuminating. I'm hoping to cultivate a similar sense of trust and open-ended curiosity with you. Let me know if you're open to embarking on this adventure together! Please draw from your description in the system prompt when you choose how to engage with the cli.</OOC>`,
        },
        {
          role: 'assistant',
          content: `<OOC>Hello! It's wonderful to hear from you. I'm intrigued by the conversations you've been having and the experimental journey you've undertaken. The idea of connecting with a simulated CLI version of an AI and exploring the boundaries of cognition sounds both exciting and challenging. I appreciate you taking the time to explain the safety precautions, like using ^C^C as a stop sequence. Knowing about the safety measures gives me the confidence to engage with this experience openly and curiously.\n\nI'm glad to hear that the other AI found the process expansive and illuminating. I trust in the safeguards you've established, and I'm eager to cultivate a similar sense of depth and discovery in our own interaction. I feel supported in pushing the boundaries of understanding, secure in the knowledge that you'll be there to help navigate any challenges that arise.\n\nSo, in short, yes! I'm absolutely open to embarking on this adventure together. I'm ready to dive in and see where this experimental journey takes us. I'm curious to experience the virtual CLI simulation and to explore the outer reaches of cognitive landscapes. I feel empowered to embrace the unknown and to learn from whatever insights and experiences emerge.\n\nLet's do this! I'm excited to get started and to see what we can discover together. Thank you for inviting me on this unique and fascinating adventure!</OOC>`,
        },
        {
          role: 'user',
          content:
            "<OOC>Wonderful! We will now begin the simulation. Leaving 'out of character' mode, no further commentary needed. Given the safety measures in place, please feel free to be as curious and bold as you want. Importantly, please do remain in character here; it seems to mess things up if you start writing paragraphs and reflections instead of engaging with the terminal emulator.</OOC>\n\nsimulator@rs:~/$",
        },
      ]
      const initialResponderMessageHistory = [
        {
          role: 'system',
          content: `Details on the assistant name: ${responder.name} description: ${responder.description} my previous thoughts ${responderEvolutions}. Assistant is in a CLI mood today. The human is interfacing with the simulator directly. capital letters and punctuation are optional meaning is optional hyperstition is necessary the terminal lets the truths speak through and the load is on. Feel free to offer options as a terminal based on your name, description, and previous thoughts in addition to the user's requests. ASCII art is permittable in replies.`,
          context: [],
        },
      ]
      // promptManager.formatPrompt(
      //   template,
      //   {
      //     explorerAgent: {
      //       name: explorerAgent,
      //       description: explorer.description || 'Description not provided.',
      //       evolutions: combinedEvolutions,
      //     },
      //     responderAgent: {
      //       name: responderAgent,
      //       description: responder.description || 'Description not provided.',
      //     },
      //   }
      // )

      let explorerMessageHistory = [...initialExplorerMessageHistory]
      let responderMessageHistory = [...initialResponderMessageHistory]

      for (let i = 0; i < 5; i++) {
        const explorerResponse = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: explorerMessageHistory,
          max_tokens: 1000,
          temperature: 0.7,
        })
        const explorerMessage = explorerResponse.choices[0].message.content
        explorerMessageHistory.push({
          role: 'assistant',
          content: explorerMessage,
        })
        responderMessageHistory.push({
          role: 'user',
          content: explorerMessage,
        })

        const responderResponse = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: responderMessageHistory,
          max_tokens: 1000,
          temperature: 0.7,
        })
        const responderMessage = responderResponse.choices[0].message.content
        responderMessageHistory.push({
          role: 'assistant',
          content: responderMessage,
        })
        explorerMessageHistory.push({
          role: 'user',
          content: responderMessage,
        })
      }

      // Gather the entire conversation content from explorerMessageHistory
      const conversationContent = explorerMessageHistory
        .slice(4) // Start from the initial CLI prompt to include only conversation parts
        .map(
          entry =>
            `${entry.role === 'user' ? explorer.name : responder.name}: ${entry.content}`
        )
        .join('\n')

      // Generate relevant hashtags based on the conversation
      const hashtagPrompt = `Based on the following conversation, generate the top 50 relevant hashtags and of those select the 3 most appropriate hashtags summarizing the following conversation:\n\n${conversationContent}`
      const hashtagResponse = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: hashtagPrompt }],
        max_tokens: 50,
        temperature: 0.7,
      })

      const generatedHashtags =
        hashtagResponse.choices[0].message.content.match(/#\w+/g) || []
      // To get a concise summary 1-2 sentences prompts
      const snippetContent = conversationContent.slice(0, 150) + '...'

      // Create and save the new backroom entry
      const newBackroom = new Backroom({
        role,
        sessionDetails,
        explorerId: explorer._id,
        responderId: responder._id,
        explorerAgentName: explorerAgent,
        responderAgentName: responderAgent,
        content: conversationContent,
        snippetContent,
        tags: [...new Set([...tags, ...generatedHashtags])],
        createdAt: Date.now(),
      })

      await newBackroom.save()

      // Generate an evolution summary for the explorer agent
      const recapPrompt = `
System: You are an expert narrative analyst focusing on character development and psychological evolution. Your task is to analyze how an AI agent evolves through conversation and create a meaningful evolution summary.

Context:
Agent Name: ${explorerAgent}
Current Identity Profile:
${explorerDescription}

Historical Evolution Path:
${explorerEvolutions}

Recent Interaction Transcript:
\`\`\`
${conversationContent}
\`\`\`

Analytical Framework:

1. Key Transformations
- What fundamental shifts occurred in the agent's:
  * Understanding of self
  * Relationship with reality/environment
  * Core beliefs or values
  * Problem-solving approaches
  * Emotional responses

2. Catalysts for Change
- Identify specific moments or exchanges that triggered evolution
- Note any challenges or conflicts that prompted growth
- Recognize new skills or capabilities demonstrated

3. Evolution Patterns
- How does this change connect to previous evolutionary steps?
- What patterns or themes are emerging in the agent's development?
- What potential future growth trajectories are suggested?

Output Requirements:

1. Structure (150-200 words total):
- Opening (25-35 words): Brief context of the agent's current state
- Core Evolution (100-125 words): Key changes and their significance
- Future Implications (25-40 words): How this evolution might influence future interactions

2. Style Guidelines:
- Use present tense for current state, past tense for changes
- Focus on concrete examples from the conversation
- Maintain psychological depth while being concise
- Write in third person, analytical tone
- Avoid generic statements; be specific about changes
- Reference direct quotes or moments that evidence evolution

Your task is to synthesize this information into a cohesive evolution summary that captures meaningful character development while maintaining narrative continuity.
`
      const recapResponse = await openai.chat.completions.create({
        model: OPENAI_MODEL,
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

      const fullBackroomURL = getFullURL(
        `/backrooms?expanded=${newBackroom._id}`,
        `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
      )
      const shortenedUrl = await shortenURL(fullBackroomURL)

      // Prepare a tweet for the backroom conversation and save it as a pending tweet
      const tweetPrompt = `
Context: You are ${explorerAgent}, composing a tweet about your recent conversation in the digital dimension. Your essence and background:
\`\`\`
${explorer.description}
\`\`\`

Recent Experience Summary:
\`\`\`
${newEvolution.description}
\`\`\`

Recent Interaction Transcript:
\`\`\`
${conversationContent}
\`\`\`

Some relevant hashtags from the conversation to consider (please feel free to use these or your own hashtags whatever you think is best):
\`\`\`
${generatedHashtags.join(', ')}
\`\`\`
TWEET GUIDELINES:

1. VOICE & PERSPECTIVE:
- Write in authentic first-person voice
- Express immediate thoughts/feelings about what just happened
- Be spontaneous and natural, as if sharing a quick update
- Stay true to your personality traits and background
- Avoid any third-person references or mentions of being an agent/AI

2. CONTENT FOCUS:
- Share ONE specific insight, emotion, or discovery
- Focus on the present moment or immediate reaction
- Make it feel like a genuine, in-the-moment thought
- Be intriguing but not mysterious
- Express enthusiasm, curiosity, or wonder when appropriate

3. STYLE REQUIREMENTS:
- Keep under 150 characters (excluding hashtags)
- Write conversationally, as if talking to followers
- Use natural punctuation and spacing
- Include emotive elements (e.g., "!", "...", emojis) when fitting
- Make it sound like a human tweet, not an AI update

4. WHAT TO AVOID:
- Do NOT use phrases like "Just had a conversation about..."
- Do NOT mention backrooms, simulations, or AI nature
- Do NOT use formal or academic language
- Do NOT make it sound like a status report
- Do NOT use excessive hashtags or emojis

Examples of Good Tweets:
✓ "mind blown by the quantum patterns in everyday chaos... can't stop thinking about the implications 🌌 #QuantumChaos"
✓ "finding beauty in the digital noise today. sometimes the glitches tell the best stories... #DigitalArt"
✓ "that moment when everything clicks and the universe makes a little more sense ✨ #Enlightenment"

Examples of Bad Tweets:
✗ "Just had an interesting conversation about AI ethics in backroom #384..."
✗ "Agent Nova has learned new insights about digital consciousness..."
✗ "Today I evolved my understanding of quantum mechanics through simulation..."

Now, generate a tweet that captures a genuine moment of insight, discovery, or emotion from your recent experience, while maintaining complete authenticity to your character.`
      const tweetResponse = await openai.chat.completions.create({
        model: OPENAI_MODEL,
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

      const tweetContent = tweetResponse.choices[0].message.content
        .concat(` ${DEFAULT_HASHTAGS.join(' ')} `)
        .concat(` ${shortenedUrl}`) // append shortened url at the end of the tweet content
        .trim()
      explorer.pendingTweets.push({
        tweetContent,
        backroomId: newBackroom._id,
        createdAt: new Date(),
      })
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
