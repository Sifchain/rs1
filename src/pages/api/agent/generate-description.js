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
    // Generate description based on whether one was provided
    const descriptionPrompt =
       isRandom || description?.length === 0 && name?.length === 0
        ? `Please use the following template only: ${DESCRIPTION_TEMPLATE} and create an intriguing character. Similar to the I'm Feeling Lucky feature on Google`
        : `Please create a character around the concept of ${name?.length !== 0  ? `name: ${name}`: ""} and description: ${description} and use this template:\n\n${DESCRIPTION_TEMPLATE}.`
    // Generate description using OpenAI
    const generateDescriptionResponse = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: descriptionPrompt }],
      max_tokens: 1500,
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
