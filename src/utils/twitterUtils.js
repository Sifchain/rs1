import { fetchWithRetries } from '@/utils/urls'
import { BASE_URL, DEFAULT_HASHTAGS } from '@/constants/constants'

export async function requestTwitterAuthLink(agentId, returnUrl) {
  const response = await fetchWithRetries(
    BASE_URL +
      `/api/auth/generateOAuthLink?agentId=${agentId}&returnUrl=${returnUrl}`
  )
  const data = await response.json()
  if (data.url) {
    window.location.href = data.url // Redirect user to Twitter authorization page
  }
}

export async function completeTwitterAuth(agentId, state, code) {
  const response = await fetchWithRetries(
    BASE_URL + '/api/auth/handleTwitterCallback',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, state, code }),
    }
  )
  const data = await response.json()
  if (data.message === 'Authorization successful') {
    console.log('Twitter authorization complete')
  } else {
    console.error(data.error || 'Twitter authorization failed')
  }
}

export async function createPoll(agentId, backroomId, durationMinutes = 60) {
  const response = await fetchWithRetries(BASE_URL + '/api/createPoll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, backroomId, durationMinutes }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create poll')
  }

  const pollData = await response.json()
  return pollData
}

export function isTwitterTokenExpired(twitterTokenExpiry) {
  if (!twitterTokenExpiry || twitterTokenExpiry == null) {
    return false
  }
  const currentTime = new Date()
  return currentTime.getTime() > new Date(twitterTokenExpiry).getTime()
}

export function generateTweetContent(
  title = '',
  message,
  url = 'app.realityspiral.com',
  hashtags = DEFAULT_HASHTAGS
) {
  const tweetContent = `${title}\n${message}\n`
    .concat(` ${hashtags.join(' ')}`)
    .concat(` ${url}`)
    .trim()

  return tweetContent
}
