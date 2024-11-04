import { fetchWithRetries } from '@/utils/urls'
import { BASE_URL } from '@/constants/constants'

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
