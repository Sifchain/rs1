import OpenAI from 'openai'
import {
  OPENAI_MODEL,
  DESCRIPTION_TEMPLATE,
} from '../../../constants/constants'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  try {
    const { description, name, isRandom } = req.body
    console.log('Generating description for: ', description)
    // Generate description based on whether one was provided
    const descriptionPrompt =
       isRandom || description?.length === 0 && name?.length === 0
        ? `Generate a random agent description based off of the following template: ${DESCRIPTION_TEMPLATE}`
        : `Based on the following agent ${name?.length !== 0  ? `name: ${name}`: ""} and description: ${description} generate an agent description using the following template:\n\n${DESCRIPTION_TEMPLATE}`

    // Generate description using OpenAI
    const generateDescriptionResponse = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: descriptionPrompt }],
      max_tokens: 750,
      temperature: 0.7,
    })

    const generatedDescription =
      generateDescriptionResponse.choices[0].message.content

    return res.status(200).json({
      description: generatedDescription,
    })
  } catch (error) {
    console.error('Error generating descriptions: ', error)
    return res.status(500).json({ error: 'Failed to generate description' })
  }
}
