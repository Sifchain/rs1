import Backroom from '../../../models/Backroom'
import Agent from '../../../models/Agent'
import OpenAI from 'openai'
import { getFullURL, shortenURL } from '@/utils/urls'
import {
  OPENAI_MODEL,
  DEFAULT_HASHTAGS,
  MAX_TOKENS,
} from '../../../constants/constants'
import { InteractionStage } from '@/utils/InteractionStage'
import { connectDB } from '@/utils/db'
import { getParsedOpenAIResponse } from '@/utils/ai'
import { z } from 'zod'

// TODO: implement this across all routes in a generic way that deployments don't fail
// const allowedOrigins = [/^https:\/\/(?:.*\.)?realityspiral\.com.*/]
const TitleSchema = z.object({
  title: z.string(),
})

// Middleware to set CORS headers for all responses
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Replace * with your specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'POST, OPTIONS')
}
export default async function handler(req, res) {
  // const origin = req.headers.origin || req.headers.referer || 'same-origin'

  // const isAllowed =
  //   allowedOrigins.some(pattern => pattern.test(origin)) ||
  //   process.env.NODE_ENV === 'development' ||
  //   origin === 'same-origin'

  // if (!isAllowed) {
  //   return res.status(403).json({ error: 'Request origin not allowed' })
  // }
  setHeaders(res) // Apply CORS headers for all responses

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight requests
    return res.status(204).end()
  }

  await connectDB()
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const {
    role,
    sessionDetails,
    explorerAgentId,
    responderAgentId,
    tags = [],
    backroomType = 'cli',
    topic = '',
  } = req.body

  const explorer = await Agent.findById(explorerAgentId)
  const responder = await Agent.findById(responderAgentId)

  if (req.method === 'POST') {
    try {
      if (!explorer || !responder) {
        return res
          .status(400)
          .json({ error: 'Invalid explorer or responder agent' })
      }

      const explorerEvolutions = explorer.evolutions.length
        ? explorer.evolutions.slice(-20).map(evo => evo.description)
        : []
      const responderEvolutions = responder.evolutions.length
        ? responder.evolutions.slice(-20).map(evo => evo.description)
        : []

      const interactionStage = new InteractionStage(
        backroomType,
        topic,
        explorer,
        responder
      )
      await interactionStage.generateCustomStory()
      let explorerMessageHistory = [
        await interactionStage.generateExplorerSystemPrompt(),
      ]
      let responderMessageHistory = [
        await interactionStage.generateResponderSystemPrompt(),
      ]
      for (let i = 0; i < 2; i++) {
        // TODO: new ticket: implement ` while (!conversationComplete)` to replace conversation length by number of rounds
        // Generate explorer response using the current InteractionStage state + update state
        const explorerMessage = await interactionStage.generateExplorerMessage()
        explorerMessageHistory.push({
          role: 'assistant',
          content: explorerMessage,
        })
        responderMessageHistory.push({ role: 'user', content: explorerMessage })

        const responderMessage =
          await interactionStage.generateResponderMessage()
        explorerMessageHistory.push({ role: 'user', content: responderMessage })
        responderMessageHistory.push({
          role: 'assistant',
          content: responderMessage,
        })
      }
      // Gather the entire conversation content from explorerMessageHistory
      const conversationContentArray = explorerMessageHistory
        .slice(1) // Start from the initial CLI prompt to include only conversation parts
        .map(
          entry =>
            `${entry.role === 'user' ? responder.name : explorer.name}: ${entry.content}`
        )
      const conversationContent = conversationContentArray.join('\n')
      // Generate relevant hashtags based on the conversation
      const hashtagPrompt = `Based on the following conversation, generate the top 3 most appropriate hashtags summarizing the following conversation:\n\n${conversationContent}  in the following format #hashtag1, #hashtag2, #hashtag3`
      const hashtagResponse = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: hashtagPrompt }],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      })
      const generatedHashtags =
        hashtagResponse.choices[0].message.content.match(/#\w+/g) || []
      // To get a concise summary 1-2 sentences prompts
      const snippetContent = conversationContent.slice(0, 150) + '...'

      // Generate title for the backroom conversation
      const titlePrompt = `Generate a captivating, pithy title that if someone scrolled across would want to read more. Please use the backroom conversation content:\n\n${conversationContent}. Limit it to 1-10 words.`
      let title = ''
      // Generate title for the backroom conversation
      try {
        const parsedResponse = await getParsedOpenAIResponse(
          titlePrompt,
          TitleSchema
        )
        title = parsedResponse.title
        console.log('Full Parsed Response:', parsedResponse)
      } catch (error) {
        console.error('Error fetching interaction data:', error)
      }

      // Save the initial interaction state and conversation history to `Backroom`
      const newBackroom = new Backroom({
        role,
        sessionDetails,
        explorerId: explorer._id,
        responderId: responder._id,
        explorerAgentName: explorer.name,
        responderAgentName: responder.name,
        content: conversationContent,
        snippetContent,
        tags: [...new Set([...tags, ...generatedHashtags])],
        createdAt: Date.now(),
        backroomType,
        topic,
        title,
        interactionStageState: interactionStage.getStageState(), // Save InteractionStage state
        conversationHistory: explorerMessageHistory, // Store conversation history
      })

      await newBackroom.save()
      // Create tweets for each message in the conversation
      conversationContentArray.map((message, index) => {
        explorer.pendingTweets.push({
          tweetContent: message,
          backroomId: newBackroom._id,
          tweetType: `MESSAGE ${index + 1}`,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins from now
        })
      })
      // Generate an evolution summary for the explorer agent
      const recapPrompt = `
System: You are an expert narrative analyst focusing on character development and psychological evolution. Your task is to analyze how an AI agent evolves through conversation and create a meaningful evolution summary.

Context:
Agent Name: ${explorer.name}
Current Identity Profile:
${explorer.description}

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
  * Relationship with reality/InteractionStage
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
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      })

      const newEvolution = {
        backroomId: newBackroom._id,
        description: recapResponse.choices[0].message.content?.trim(),
      }
      explorer.evolutions.push(newEvolution)
      await explorer.save()
      let shortenedUrl = ''
      try {
        const fullBackroomURL = getFullURL(`/backrooms/${newBackroom._id}`)
        shortenedUrl = await shortenURL(fullBackroomURL)
      } catch (error) {
        console.error('Error shortening URL:', error)
        shortenedUrl = fullBackroomURL // Fallback to the full URL
      }
      // Prepare a tweet for the backroom conversation and save it as a pending tweet
      const tweetPrompt = `
Context: You are ${explorer.name}, composing a tweet about your recent conversation in the digital dimension. Your essence and background:
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
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      })

      const tweetContent = `${title ?? ''}
      ${tweetResponse.choices[0].message?.content ?? ''}`
        .concat(` ${DEFAULT_HASHTAGS.join(' ')} `)
        .concat(` ${shortenedUrl}`) // append shortened url at the end of the tweet content
        .concat(` @reality_spiral`)
        ?.trim()
      explorer.pendingTweets.push({
        tweetContent,
        backroomId: newBackroom._id,
        tweetType: 'RECAP',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 15 mins from now
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
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
