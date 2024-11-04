import {
  DEFAULT_RETRIES,
  DEFAULT_RETRY_DELAY,
  BASE_URL,
  delay,
} from '@/constants/constants'

const getFullURL = urlParams => {
  return new URL(urlParams, `${BASE_URL}`)?.href || ''
}

const shortenURL = async fullURL => {
  const url = new URL('https://api.t.ly/api/v1/link/shorten')
  const headers = {
    Authorization: `Bearer ${process.env.TLY_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const body = {
    long_url: fullURL,
    domain: 'https://t.ly/',
  }

  try {
    const response = await fetchWithRetries(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    if (!response || !response.ok) {
      console.error('Failed to fetch data after multiple retries.')
      // Handle the failure case here, e.g., show an error message to the user
      return
    }
    if (response.ok) {
      const data = await response.json()
      return data.short_url
    } else {
      console.error(
        'Error shortening URL:',
        response.status,
        response.statusText
      )
      return fullURL // Fallback to the full URL
    }
  } catch (error) {
    console.error('Error shortening URL:', error)
    return fullURL // Fallback to the full URL
  }
}

const fetchWithRetries = async (
  url,
  options = {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  maxRetries = DEFAULT_RETRIES,
  retryDelay = DEFAULT_RETRY_DELAY
) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        console.log(
          `ERROR: response= url attempted: ${url} attempt: ${attempt} maxRetries: ${maxRetries} retryDelay: ${retryDelay}`
        )
        continue
      }
      return response
    } catch (error) {
      console.error(
        `Attempt ${attempt + 1} at ${url} failed: ${JSON.stringify(error)}`
      )
      if (attempt < maxRetries - 1) {
        await delay(retryDelay)
      }
    }
  }
  console.error(`All ${maxRetries} attempts to fetch ${url} failed.`)
  return null
}

export { getFullURL, shortenURL, fetchWithRetries }
