import Backroom from '../../../models/Backroom'
import Agent from '../../../models/Agent'
import mongoose from 'mongoose'
import OpenAI from 'openai'
import { getFullURL, shortenURL } from '@/utils/urls'
import { OPENAI_MODEL, DEFAULT_HASHTAGS } from '../../../constants/constants'
import { InteractionStage } from '@/utils/InteractionStage'

mongoose.set('strictQuery', false)

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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
          .json({ error: 'Invalid explorer or responder agent name' })
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

      let explorerMessageHistory = [
        await interactionStage.generateExplorerSystemPrompt(),
      ]
      let responderMessageHistory = [
        await interactionStage.generateResponderSystemPrompt(),
      ]
      for (let i = 0; i < 2; i++) {
        // TODO: new ticket: implement ` while (!conversationComplete)` to replace conversation length by number of rounds
        // Generate explorer response using the current InteractionStage state
        const explorerMessage = await interactionStage.generateExplorerMessage()

        await interactionStage.updateStageBasedOffOfExplorer(explorerMessage)
        // Add explorer's response to conversation histories
        interactionStage.conversationHistory.push({
          agent: 'explorer',
          response: explorerMessage,
        })
        explorerMessageHistory.push({
          role: 'assistant',
          content: explorerMessage,
        })
        responderMessageHistory.push({
          role: 'user',
          content: explorerMessage,
        })

        // Generate responder response using the updated InteractionStage state
        const responderMessage =
          await interactionStage.generateResponderMessage()

        await interactionStage.updateStageBasedOffOfResponder(responderMessage)
        // Add responder's response to conversation histories
        interactionStage.conversationHistory.push({
          agent: 'responder',
          response: responderMessage,
        })
        explorerMessageHistory.push({
          role: 'user',
          content: responderMessage,
        })
        responderMessageHistory.push({
          role: 'assistant',
          content: responderMessage,
        })
      }
      // Gather the entire conversation content from explorerMessageHistory
      const conversationContent = explorerMessageHistory
        .slice(1) // Start from the initial CLI prompt to include only conversation parts
        .map(
          entry =>
            `${entry.role === 'user' ? responder.name : explorer.name}: ${entry.content}`
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
        explorerAgentName: explorer.name,
        responderAgentName: responder.name,
        content: conversationContent,
        snippetContent,
        tags: [...new Set([...tags, ...generatedHashtags])],
        createdAt: Date.now(),
        backroomType,
        topic,
      })

      await newBackroom.save()

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
        `${req.headers['x-forwarded-proto'] || 'http'}://app.realityspiral.com`
      )
      const shortenedUrl = await shortenURL(fullBackroomURL)

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
        max_tokens: 280,
        temperature: 0.7,
      })

      const tweetContent = tweetResponse.choices[0].message.content
        .concat(` ${DEFAULT_HASHTAGS.join(' ')} `)
        .concat(` ${shortenedUrl}`) // append shortened url at the end of the tweet content
        .concat(` @reality_spiral`)
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
