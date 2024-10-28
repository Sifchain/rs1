/**
 * Fetches the token balance through the backend API
 * @param {string} address - The wallet address
 * @param {string} contractAddress - The token contract address
 * @returns {Promise<string>} - The formatted token balance
 */
export const getTokenBalance = async (address, contractAddress) => {
  try {
    const response = await fetch(
      `/api/balance?address=${address}&contractAddress=${contractAddress}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch token balance')
    }

    const data = await response.json()

    // Return the already formatted balance
    return data.formattedBalance
  } catch (error) {
    console.error('Error fetching token balance:', error)
    throw error
  }
}

/**
 * Checks if the user's token balance is sufficient
 */
export const genIsBalanceEnough = async (
  address,
  contractAddress,
  requiredAmount
) => {
  try {
    const tokenBalance = await getTokenBalance(address, contractAddress)
    console.log(`Token Balance: ${tokenBalance}`)
    console.log(`Required Amount: ${requiredAmount}`)

    return parseFloat(tokenBalance) >= parseFloat(requiredAmount)
  } catch (error) {
    console.error('Error checking if balance is enough:', error)
    return false
  }
}
