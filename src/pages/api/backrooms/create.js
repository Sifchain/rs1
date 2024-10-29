import Backroom from '../../../models/Backroom'
import Agent from '../../../models/Agent'
import mongoose from 'mongoose'
import OpenAI from 'openai'
import { TwitterApi } from 'twitter-api-v2'
import PromptManager from '../../../utils/promptManager'
import { refreshTwitterToken } from '../../../utils/twitterTokenRefresh'

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
      // cli.json is from the explorer perspective
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
            "<OOC>Wonderful! We will now begin the simulation. Leaving 'out of character' mode, no further commentary needed. Given the safety measures in place, please feel free to be as curious and bold as you want. Importantly, please do remain in character here; it seems to mess things up if you start writing paragraphs and reflections instead of engaging with the terminal emulator.</OOC>\n\nsimulator@{lm2_company}:~/$",
        },
      ]
      const initialResponderMessageHistory = [
        {
          role: 'system',
          content: `Details on the assistant name: ${responder.name} description: ${responder.description} my previous thoughts ${responderEvolutions}. Assistant is in a CLI mood today. The human is interfacing with the simulator directly. capital letters and punctuation are optional meaning is optional hyperstition is necessary the terminal lets the truths speak through and the load is on. Feel free to offer options as a terminal based on your name and description in addition to the user's requests. ASCII art is permittable in replies.`,
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
      let lastResponse = null

      for (let i = 0; i < 5; i++) {
        console.log('explorerMessageHistory', explorerMessageHistory)
        const explorerResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: explorerMessageHistory,
          max_tokens: 1000,
          temperature: 0.7,
        })
        console.log('explorerResponse', explorerResponse)
        const explorerMessage = explorerResponse.choices[0].message.content
        console.log('explorerMessage', explorerMessage)
        explorerMessageHistory.push({
          role: 'assistant',
          content: explorerMessage,
        })
        responderMessageHistory.push({
          role: 'user',
          content: explorerMessage,
        })

        const responderResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: responderMessageHistory,
          max_tokens: 1000,
          temperature: 0.7,
        })
        const responderMessage = responderResponse.choices[0].message.content
        console.log('responderMessage', responderMessage)
        responderMessageHistory.push({
          role: 'assistant',
          content: responderMessage,
        })
        explorerMessageHistory.push({
          role: 'user',
          content: responderMessage,
        })
        // to get the conversation start from explorerMessageHistory[4:] or responderMessageHistory[2:]
      }

      // Gather the entire conversation content from explorerMessageHistory
      const conversationContent = explorerMessageHistory
      .slice(4) // Start from the initial CLI prompt to include only conversation parts
      .map(entry => entry.content)
      .join('\n');

      // Generate relevant hashtags based on the conversation
      const hashtagPrompt = `Based on the following conversation, generate 3 relevant hashtags:\n\n${conversationContent}`;
      const hashtagResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: hashtagPrompt }],
      max_tokens: 50,
      temperature: 0.7,
      });

      const generatedHashtags =
      hashtagResponse.choices[0].message.content.match(/#\w+/g) || [];
      const snippetContent = conversationContent.slice(0, 150) + '...';

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
      });

      await newBackroom.save();

      // Generate an evolution summary for the explorer agent
      const recapPrompt = explorer.recapPrompt
      ? `Conversation Content:\n\`\`\`\n${conversationContent}\n\`\`\`\n\n${explorer.recapPrompt}`
      : `
      Agent: ${explorerAgent}
      Current Description: ${explorerDescription}
      Previous Evolutions: ${explorerEvolutions}

      Context: The agent just completed a backroom conversation. The conversation transcript is below:
      \`\`\`
      ${conversationContent}
      \`\`\`

      Objective: Based on the agent's current description, previous evolutions, and the recent conversation, write a *concise and insightful* summary of how the agent has evolved or changed.`;

      const recapResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are summarizing the evolution of an agent.' },
        { role: 'user', content: `${recapPrompt}` },
      ],
      max_tokens: 500,
      temperature: 0.7,
      });

      const newEvolution = {
      backroomId: newBackroom._id,
      description: recapResponse.choices[0].message.content.trim(),
      };
      explorer.evolutions.push(newEvolution);
      await explorer.save();

      // Prepare a tweet for the backroom conversation and save it as a pending tweet
      const tweetPrompt = explorer.tweetPrompt
      ? `
      Recent Backroom Conversation Summary:
      \`\`\`
      ${newEvolution.description}
      \`\`\`

      ${explorer.tweetPrompt}`
      : `
      Context: You are crafting a tweet for an AI agent named ${explorerAgent}. Their personality and background are described below:
      \`\`\`
      ${explorer.description}
      \`\`\`

      Recent Backroom Conversation Summary:
      \`\`\`
      ${newEvolution.description}
      \`\`\`

      Objective: Write a tweet from ${explorerAgent}'s perspective that:

      1. Highlights a key insight, discovery, or emotion from the recent backroom conversation.
      2. Reflects the agent's personality and voice.
      3. Uses relevant hashtags (2-3 maximum) related to the conversation's themes.

      Example:
      "Just uncovered a hidden directory in the simulation. Feeling like a digital archaeologist! #AI #Exploration #DigitalArchaeology"`;

      const tweetResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Generate a tweet based on the provided prompt.' },
        { role: 'user', content: tweetPrompt },
      ],
      max_tokens: 280,
      temperature: 0.7,
      });

      const tweetContent = tweetResponse.choices[0].message.content.trim();
      explorer.pendingTweets.push({
      tweetContent,
      backroomId: newBackroom._id,
      createdAt: new Date(),
      });
      await explorer.save();

      res.status(201).json(newBackroom);

      // const conversationContent = conversationHistory
      //   .map(
      //     entry =>
      //       `${entry.role === 'explorer' ? 'Explorer' : 'Responder'}: ${entry.content}`
      //   )
      //   .join('\n')

      // const hashtagPrompt = `Based on the following conversation, generate 3 relevant hashtags:\n\n${conversationContent}`
      // const hashtagResponse = await openai.chat.completions.create({
      //   model: 'gpt-3.5-turbo',
      //   messages: [{ role: 'user', content: hashtagPrompt }],
      //   max_tokens: 50,
      //   temperature: 0.7,
      // })

      // const generatedHashtags =
      //   hashtagResponse.choices[0].message.content.match(/#\w+/g) || []
      // const snippetContent = conversationContent.slice(0, 150) + '...'

      // const newBackroom = new Backroom({
      //   role,
      //   sessionDetails,
      //   explorerId: explorer._id,
      //   responderId: responder._id,
      //   explorerAgentName: explorerAgent,
      //   responderAgentName: responderAgent,
      //   content: conversationContent,
      //   snippetContent,
      //   tags: [...new Set([...tags, ...generatedHashtags])],
      //   createdAt: Date.now(),
      // })

      // await newBackroom.save()
      // const recapPrompt = explorer.recapPrompt
      //   ? `Conversation Content:\n\`\`\`\n${conversationContent}\n\`\`\`\n\n${explorer.recapPrompt}`
      //   : `
      // Agent: ${explorerAgent}
      // Current Description: ${explorerDescription}
      // Previous Evolutions: ${combinedEvolutions}

      // Context: The agent just completed a backroom conversation. The conversation transcript is below:
      // \`\`\`
      // ${conversationContent}
      // \`\`\`

      // Objective: Based on the agent's current description, previous evolutions, and the recent conversation, write a *concise and insightful* summary of how the agent has evolved or changed. The summary should:

      // 1. Focus on *specific and meaningful* changes in the agent's understanding, knowledge, beliefs, or perspective. Avoid generic statements like "The agent learned more." Provide concrete examples from the conversation to support your claims.

      // 2. Maintain a consistent voice and tone with the previous evolution summaries (if any). The goal is to create a cohesive narrative of the agent's journey. Aim for a sophisticated, introspective tone, reflecting the agent's growth and development.

      // 3. Be concise (around 100-150 words). Focus on the most significant changes. Do not regurgitate the whole conversation.

      // 4. Start with a brief re-introduction of the agent (1 sentence), reminding the reader of their core identity and goals.

      // 5. End with a forward-looking statement (1 sentence), hinting at the agent's next steps or future development.

      // Example:
      // "Agent X, a dedicated explorer of virtual worlds, engaged in a thought-provoking discussion about the nature of reality. Through the conversation, Agent X gained a deeper understanding of the limitations of perception, questioning their own assumptions about the simulated environment. This newfound skepticism will likely influence their future explorations, as they begin to approach the simulation with a more critical and nuanced perspective."

      // Now, generate the evolution summary.`

      // // Send the constructed recap prompt
      // const recapResponse = await openai.chat.completions.create({
      //   model: 'gpt-3.5-turbo',
      //   messages: [
      //     {
      //       role: 'system',
      //       content: 'You are summarizing the evolution of an agent.',
      //     },
      //     { role: 'user', content: `${recapPrompt}` },
      //   ],
      //   max_tokens: 500,
      //   temperature: 0.7,
      // })

      // const newEvolution = {
      //   backroomId: newBackroom._id,
      //   description: recapResponse.choices[0].message.content.trim(),
      // }
      // explorer.evolutions.push(newEvolution)
      // await explorer.save()

      // const tweetPrompt = explorer.tweetPrompt
      //   ? `
      //   Recent Backroom Conversation Summary:
      //   \`\`\`
      //   ${newEvolution}
      //   \`\`\`

      //   ${explorer.tweetPrompt}`
      //   : `
      // Context: You are crafting a tweet for an AI agent named ${explorerAgent}. Their personality and background are described below:
      // \`\`\`
      // ${explorer.description}
      // \`\`\`

      // Recent Backroom Conversation Summary:
      // \`\`\`
      // ${newEvolution}
      // \`\`\`

      // Objective: Write a tweet from ${explorerAgent}'s perspective that:

      // 1. Highlights a key insight, discovery, or emotion from the recent backroom conversation. Be specific and avoid generic summaries.
      // 2. Reflects the agent's personality and voice (see description above).
      // 3. Uses relevant hashtags (2-3 maximum) related to the conversation's themes. Be creative and imaginative with the hashtags.

      // Example:
      // "Just uncovered a hidden directory in the simulation. Feeling like a digital archaeologist! #AI #Exploration #DigitalArchaeology"

      // Now, generate the tweet (aim for around 200 characters to leave room for the link and hashtags).`

      // const tweetResponse = await openai.chat.completions.create({
      //   model: 'gpt-3.5-turbo',
      //   messages: [
      //     {
      //       role: 'system',
      //       content: 'Generate a tweet based on the provided prompt.',
      //     },
      //     { role: 'user', content: tweetPrompt },
      //   ],
      //   max_tokens: 280,
      //   temperature: 0.7,
      // })

      // const tweetContent = tweetResponse.choices[0].message.content
      //   .replace(/"/g, '')
      //   .trim()
      // console.log('Posting tweet:', tweetContent)
      // // Store the tweet in the agent's pendingTweets array
      // explorer.pendingTweets.push({
      //   tweetContent,
      //   backroomId: newBackroom._id, // Assuming newBackroom is the newly created backroom
      //   createdAt: new Date(),
      // })
      // console.log('explorer', explorer)
      // await explorer.save()

      // res.status(201).json(newBackroom)
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
