import { Alchemy, Network } from 'alchemy-sdk'

/**
 * Fetches the balance of a specific ERC-20 token for the given wallet address and contract address.
 * @param {string} address - The address of the wallet to check balance for.
 * @param {string} contractAddress - The ERC-20 token contract address.
 * @returns {Promise<string>} - The formatted token balance.
 */
export const getTokenBalance = async (
  address,
  contractAddress,
  network = Network.ETH_MAINNET
) => {
  const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: network,
  }
  const alchemy = new Alchemy(settings)
  const balances = await alchemy.core.getTokenBalances(address, [
    contractAddress,
  ])
  const rawBalance = balances.tokenBalances[0].tokenBalance
  // Assuming the token has 18 decimals, format it properly
  const formattedBalance = formatTokenBalance(rawBalance)
  console.log(`Formatted Token Balance: ${formattedBalance}`)
  return formattedBalance
}

const formatTokenBalance = (rawBalance, decimals = 18) => {
  const divisor = Math.pow(10, decimals) // Calculate 10^decimals
  const formattedBalance = parseFloat(rawBalance) / divisor // Divide raw balance by the divisor
  return formattedBalance.toLocaleString('en-US', { maximumFractionDigits: 6 }) // Limit decimals to 6 places
}

/**
 * Checks if the user's token balance is sufficient.
 * @param {string} address - The address of the wallet to check balance for.
 * @param {string} contractAddress - The ERC-20 token contract address.
 * @param {number} requiredAmount - The amount to check if the balance is sufficient.
 * @returns {Promise<boolean>} - True if the balance is enough, false otherwise.
 */
export const genIsBalanceEnough = async (
  address,
  contractAddress,
  requiredAmount
) => {
  try {
    const tokenBalance = await getTokenBalance(address, contractAddress)
    // Compare the token balance with the required amount
    return parseFloat(tokenBalance) > requiredAmount
  } catch (error) {
    console.error('Error checking if balance is enough:', error)
    return false
  }
}
