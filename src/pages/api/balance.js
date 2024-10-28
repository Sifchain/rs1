import { Alchemy, Network, Utils } from 'alchemy-sdk'

export default async function handler(req, res) {
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
    console.log(metadata)
    // Get token balance
    const response = await alchemy.core.getTokenBalances(address, [
      contractAddress,
    ])
    console.log(response)

    if (!response.tokenBalances[0]) {
      return res.status(404).json({ message: 'No token balance found' })
    }

    const rawBalance = response.tokenBalances[0].tokenBalance
    // Format the balance using the token's decimals
    const formattedBalance = Utils.formatUnits(rawBalance, metadata.decimals)
    // Get transfer events
    const transferEvents = await alchemy.core.getAssetTransfers({
      fromBlock: '0x0',
      toBlock: 'latest',
      toAddress: address,
      contractAddresses: [contractAddress],
      category: ['erc20'],
    })

    return res.status(200).json({
      formattedBalance,
      transferEvents,
    })
  } catch (error) {
    console.error('API Error:', error)
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}
