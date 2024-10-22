import { useState, useEffect } from 'react'

export function useAccount() {
  const [address, setAddress] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [hasEthereum, setHasEthereum] = useState(false)
  const [loading, setLoading] = useState(true) // Loading state

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setHasEthereum(true)
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch(err => {
          console.error(err)
        })
        .finally(() => setLoading(false)) // Set loading to false once check is complete

      window.ethereum.on('accountsChanged', handleAccountsChanged)
    } else {
      setLoading(false) // If no Ethereum provider, stop loading
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      setAddress(null)
      setIsConnected(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userAddress')
        localStorage.setItem('isConnected', 'false')
      }
    } else {
      setAddress(accounts[0])
      setIsConnected(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('userAddress', accounts[0])
        localStorage.setItem('isConnected', 'true')
      }
    }
  }

  return { address, isConnected, hasEthereum, loading } // Return loading state
}

export function useConnect() {
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask is not installed')
      return
    }

    setIsConnecting(true)
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    } catch (error) {
      console.error(error)
    } finally {
      setIsConnecting(false)
    }
  }

  return connect
}
