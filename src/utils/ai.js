import OpenAI from 'openai'

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
    console.log('Generated image URL:', imageUrl)
    return imageUrl
  } catch (error) {
    console.error('Error generating image:', error)
    return ''
  }
}
