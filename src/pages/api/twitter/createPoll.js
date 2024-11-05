// pages/api/createPoll.js
import { TwitterApi } from 'twitter-api-v2'
import Agent from '@/models/Agent'
import Backroom from '@/models/Backroom'
import { connectDB } from '@/utils/db'
import { getParsedOpenAIResponse } from '@/utils/ai'
import { z } from 'zod'

const PollSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
})

export default async function handler(req, res) {
  await connectDB()

  const { agentId, backroomId, durationMinutes = 60 } = req.body
  if (!agentId || !backroomId) {
    return res.status(400).json({
      error: 'Required fields: agentId, backroomId, durationMinutes (optional)',
    })
  }

  try {
    // Retrieve agent for Twitter authorization
    const agent = await Agent.findById(agentId)
    if (!agent || !agent.twitterAuthToken.accessToken) {
      return res.status(404).json({ error: 'Agent or Twitter auth not found' })
    }

    // Find the specified backroom
    const backroom = await Backroom.findById(backroomId)
    if (!backroom) {
      return res.status(404).json({ error: 'Backroom not found' })
    }
    let question = ''
    let options = []
    const prompt = `Generate a follow up question on how the following conversation should continue conversation:\n\n${backroom.content}. Remember this is a twitter poll, so make the content something that someone who scrolled across would want to read more. Please make the question (10 - 20 words), and the options are each option (5-10 words) and have only 2 to 4 options.`
    // Generate question and options from the backroom conversation
    try {
      const parsedResponse = await getParsedOpenAIResponse(prompt, PollSchema)
      question = parsedResponse.question
      options = parsedResponse.options
      console.log('Full Parsed Response:', parsedResponse)
    } catch (error) {
      console.error('Error fetching interaction data:', error)
    }
    try {
      // Initialize Twitter client with agent's access token
      const twitterClient = new TwitterApi(agent.twitterAuthToken.accessToken)

      // Post the poll to Twitter
      const tweetResponse = await twitterClient.v2.tweet({
        text: question,
        poll: {
          options,
          duration_minutes: durationMinutes,
        },
      })
    } catch (error) {
      console.error('Error creating Twitter poll:', error)
      res.status(500).json({ error: 'Failed to create Twitter poll' })
    }
    // Add poll data to backroom polls
    const newPoll = {
      question,
      options,
      durationMinutes,
      posted: true,
      tweetId: tweetResponse.data.id,
    }
    backroom.polls.push(newPoll)
    await backroom.save()

    res.status(200).json({
      message: 'Poll created and added to backroom successfully',
      tweetId: tweetResponse.data.id,
      poll: newPoll,
    })
  } catch (error) {
    console.error('Error creating Twitter poll:', error)
    res.status(500).json({ error: 'Failed to create Twitter poll' })
  }
}
