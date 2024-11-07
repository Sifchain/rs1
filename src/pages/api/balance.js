import { Alchemy, Network, Utils } from 'alchemy-sdk'

// Middleware to set CORS headers for all responses
const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*') // Replace with specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Allow', 'GET, OPTIONS')
}

export default async function handler(req, res) {
  setHeaders(res)

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight request
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { address, contractAddress } = req.query

  if (!address || !contractAddress) {
    return res.status(400).json({ message: 'Missing required parameters' })
  }

  try {
    const settings = {
      apiKey: process.env.ALCHEMY_API_KEY, // Use server-side environment variable
      network: Network.ETH_MAINNET,
    }

    const alchemy = new Alchemy(settings)

    // Get token metadata
    const metadata = await alchemy.core.getTokenMetadata(contractAddress)
    // Get token balance
    const response = await alchemy.core.getTokenBalances(address, [
      contractAddress,
    ])

    if (!response.tokenBalances[0]) {
      return res.status(404).json({ message: 'No token balance found' })
    }

    const rawBalance = response.tokenBalances[0].tokenBalance
    // Format the balance using the token's decimals
    const formattedBalance = Utils.formatUnits(rawBalance, metadata.decimals)

    return res.status(200).json({
      formattedBalance,
    })
  } catch (error) {
    console.error('API Error:', error)
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}
