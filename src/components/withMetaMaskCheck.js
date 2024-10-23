import { useEffect } from 'react'
import { useAccount } from '../hooks/useMetaMask' // Custom MetaMask hook
import { useRouter } from 'next/router'
import { generateToken } from '../utils/auth' // Token generation function
const withMetaMaskCheck = WrappedComponent => {
  return props => {
    const { isConnected, hasEthereum, loading, address } = useAccount() // Get wallet address
    const router = useRouter()

    // Function to create or fetch the user based on the wallet address
    const createUser = async address => {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address }),
        })
        const data = await response.json()
        if (response.ok) {
          // generateToken(data._id)
          // Optionally, store user data in local state or context
          localStorage.setItem('user', JSON.stringify(data)) // Optionally store the entire user object
        } else {
          console.error('Failed to create or fetch user', data)
        }
      } catch (error) {
        console.error('Error creating or fetching user:', error)
      }
    }
    useEffect(() => {
      createUser(address)
    })
    useEffect(() => {
      if (!loading && hasEthereum && isConnected && address) {
        // Once MetaMask is connected, create or fetch the user
        console.log('MetaMask is connected:', address)
        createUser(address)
      }

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
    }, [isConnected, hasEthereum, loading, router, address])

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
