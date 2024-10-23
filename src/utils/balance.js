import { ethers } from 'ethers'

/**
 * Fetches the balance of a specific ERC-20 token for the given wallet address and contract address.
 * @param {string} address - The address of the wallet to check balance for.
 * @param {string} contractAddress - The ERC-20 token contract address.
 * @param {array} abi - The ABI of the ERC-20 token contract.
 * @returns {Promise<string>} - The formatted token balance.
 */
export const getTokenBalance = async (address, contractAddress, abi) => {
  if (!window.ethereum || !address) {
    throw new Error('Ethereum provider or wallet address not available')
  }

  try {
    // Create a provider from window.ethereum
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    // Create a new contract instance for the ERC-20 token
    const contract = new ethers.Contract(contractAddress, abi, signer)

    // Fetch the balance in smallest unit (depends on token decimals)
    const balance = await contract.balanceOf(address)

    // Convert balance from smallest unit to a human-readable format (assuming 18 decimals for the token)
    const formattedBalance = ethers.utils.formatUnits(balance, 18)
    return formattedBalance
  } catch (error) {
    console.error('Error fetching token balance:', error)
    throw error
  }
}
