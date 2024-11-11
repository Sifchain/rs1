import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import {
  MAX_TOKENS,
  OPENAI_MODEL,
  OPENAI_BETA_MODEL,
} from '@/constants/constants'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Generates an image using DALL-E 3 and stores the URL
 * @param {string} prompt - The image generation prompt
 * @param {Object} options - Optional parameters for image generation
 * @returns {Promise<string>} The generated image URL
 */
export const generateImage = async (prompt, options = {}) => {
  try {
    // Default configuration
    const defaultConfig = {
      model: 'dall-e-3',
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
      response_format: 'url',
    }

    // Merge default config with provided options
    const config = {
      ...defaultConfig,
      ...options,
      prompt, // Always use the provided prompt
    }

    // Generate image
    const imageResponse = await openai.images.generate(config)

    // Extract URL
    const imageUrl = imageResponse.data[0].url
    return imageUrl
  } catch (error) {
    console.error('Error generating image:', error)
    return ''
  }
}

/**
 * Calls OpenAI API to generate a structured JSON response based on a given prompt and schema.
 * @param {string} prompt - The input prompt for the OpenAI API.
 * @param {object} schema - The Zod schema for response validation.
 * @param {number} [maxTokens=MAX_TOKENS] - The maximum number of tokens for the API response.
 * @param {string} [model=OPENAI_MODEL] - The OpenAI model to use for the request.
 * @param {number} [temperature=0.7] - The temperature setting for response randomness.
 * @returns {object} - The parsed response object or throws an error if parsing fails.
 * @throws Will throw an error if JSON response is invalid or API parsing fails.
 */
export async function getParsedOpenAIResponse(
  prompt,
  schema,
  maxTokens = MAX_TOKENS,
  model = OPENAI_BETA_MODEL,
  temperature = 0.7
) {
  try {
    const response = await openai.beta.chat.completions.parse({
      model,
      messages: [
        {
          role: 'system',
          content:
            'Generate a structured JSON response based on the following prompt.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
      response_format: zodResponseFormat(schema, 'sample'),
    })

    const message = response.choices[0].message
    const parsedResponse = message?.parsed

    if (parsedResponse) {
      return parsedResponse
    } else if (message.refusal) {
      console.error(`OPENAI failed to parse JSON response: ${message.refusal}`)
      throw new Error(
        `OPENAI failed to parse JSON response: ${message.refusal}`
      )
    }
  } catch (error) {
    console.error('Failed to parse JSON response:', error)
    throw new Error('Invalid JSON format in OpenAI response')
  }
}
