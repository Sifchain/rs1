import OpenAI from 'openai'
import {
  OPENAI_MODEL,
  DESCRIPTION_TEMPLATE,
} from '../../../constants/constants'
import { getParsedOpenAIResponse } from '@/utils/ai'
import { z } from 'zod'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Schema for the response
const DescriptionSchema = z.object({
  description: z.string(),
  name: z.string(),
})

// Middleware to set CORS headers for all requests
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Update to specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'POST, GET, PUT, OPTIONS')
}

export default async function handler(req, res) {
  try {
    setHeaders(res)

    if (req.method === 'OPTIONS') {
      // Handle preflight request
      return res.status(204).end()
    }

    const { description, name, isRandom } = req.body
    // Generate description based on whether one was provided
    const descriptionPrompt =
      isRandom || (description?.length === 0 && name?.length === 0)
        ? `Please use the following template only: ${DESCRIPTION_TEMPLATE} and create an intriguing character. Similar to the I'm Feeling Lucky feature on Google. Return the description and name as a JSON object.`
        : `Please create a character around the concept of ${name?.length !== 0 ? `name: ${name}` : ''} and description: ${description} and use this template:\n\n${DESCRIPTION_TEMPLATE}. Return the description and name as a JSON object.`
    let generatedDescription = ''
    let generatedName = name
    try {
      // Schema for the response
      const parsedResponse = await getParsedOpenAIResponse(
        descriptionPrompt,
        DescriptionSchema
      )
      generatedDescription = parsedResponse.description
      generatedName = parsedResponse.name
    } catch (error) {
      console.error('Error fetching interaction data:', error)
    }

    return res.status(200).json({
      name: generatedName,
      description: generatedDescription,
    })
  } catch (error) {
    console.error('Error generating descriptions: ', error)
    return res.status(500).json({ error: 'Failed to generate description' })
  }
}
