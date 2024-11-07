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
    const agent = await Agent.findById(agentId)
    if (!agent || !agent.twitterAuthToken.accessToken) {
      return res.status(404).json({ error: 'Agent or Twitter auth not found' })
    }

    const backroom = await Backroom.findById(backroomId)
    if (!backroom) {
      return res.status(404).json({ error: 'Backroom not found' })
    }
    let question = ''
    let options = []
    const prompt = `Generate a follow-up question on how the following conversation should continue:\n\n${backroom.content}. Remember this is a Twitter poll, so the question should be max 25 characters with 2-4 options, each no longer than 25 characters.`

    try {
      const parsedResponse = await getParsedOpenAIResponse(prompt, PollSchema)
      question = parsedResponse.question
      options = parsedResponse.options
    } catch (error) {
      console.error('Error fetching interaction data:', error)
      return res.status(500).json({ error: 'Failed to parse poll data' })
    }
    try {
      const twitterClient = new TwitterApi(agent.twitterAuthToken.accessToken)
      const tweetResponse = await twitterClient.v2.tweet({
        text: question,
        poll: {
          options,
          duration_minutes: durationMinutes,
        },
      })
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
      return res.status(500).json({ error: 'Failed to create Twitter poll' })
    }
  } catch (error) {
    console.error('Error creating Twitter poll:', error)
    res.status(500).json({ error: 'Failed to create Twitter poll' })
  }
}
