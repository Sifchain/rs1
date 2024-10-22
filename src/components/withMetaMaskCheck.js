import { useEffect } from 'react'
import { useAccount } from '../hooks/useMetaMask' // Custom MetaMask hook
import { useRouter } from 'next/router'

const withMetaMaskCheck = WrappedComponent => {
  return props => {
    const { isConnected, hasEthereum, loading } = useAccount() // Now checking both connection and Ethereum availability
    const router = useRouter()

    useEffect(() => {
      if (!loading) {
        // If MetaMask is not installed, only restrict routes other than home '/'
        if (!hasEthereum) {
          if (
            router.pathname !== '/' &&
            router.pathname !== '/backrooms' &&
            router.pathname !== '/about' &&
            router.pathname !== '/agents'
          ) {
            alert('MetaMask is not installed or available')
            router.push('/')
          }
        }
        // If MetaMask is installed but not connected, restrict specific pages
        else if (!isConnected) {
          if (
            router.pathname !== '/backrooms' &&
            router.pathname !== '/about' &&
            router.pathname !== '/agents' &&
            router.pathname !== '/'
          ) {
            router.push('/') // Redirect to homepage if trying to access restricted pages
          }
        }
      }
    }, [isConnected, hasEthereum, loading, router])

    // Allow access to home '/', '/backrooms', '/about', and '/agents' pages without MetaMask
    if (
      router.pathname === '/' ||
      router.pathname === '/backrooms' ||
      router.pathname === '/about' ||
      router.pathname === '/agents'
    ) {
      return <WrappedComponent {...props} />
    }

    // Render the wrapped component only if MetaMask is installed and connected
    if (loading) {
      return null // Optionally render a loading spinner or nothing during the loading phase
    }

    // Show the content if MetaMask is installed and connected
    return hasEthereum && isConnected ? <WrappedComponent {...props} /> : null
  }
}

export default withMetaMaskCheck
