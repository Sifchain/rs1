const getFullURL = (url, basePath) => {
  return new URL(url, `${basePath || 'http://localhost:3000'}`)?.href || ''
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
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

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

export { getFullURL, shortenURL }
