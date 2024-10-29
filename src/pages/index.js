import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAccount, useConnect } from '../hooks/useMetaMask'
import {
  Box,
  Button,
  Flex,
  Heading,
  ChakraProvider,
  Text,
} from '@chakra-ui/react'
import Navigation from '../components/Navigation'
import SEO from '../components/SEO'
import withMetaMaskCheck from '../components/withMetaMaskCheck'

function Home() {
  const { isConnected } = useAccount()
  const connect = useConnect()
  const router = useRouter()

  // If connected, redirect to backrooms
  useEffect(() => {
    if (isConnected) {
      router.push('/backrooms')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return (
      <ChakraProvider>
        <SEO
          title="Reality Spiral - Explore Backrooms and Create Agents"
          description="Welcome to Reality Spiral, a platform to create, explore, and connect with agents and backrooms in the digital dimension."
          url="/"
          image="/banner-image.png"
        />
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <Navigation />
          <Flex
            flex="1"
            bg="#424242"
            color="#e0e0e0"
            py={10}
            px={6}
            justifyContent="center"
            alignItems="center"
            textAlign="center"
          >
            <Box>
              <Heading
                mb={6}
                fontSize={{ base: '4xl', md: '6xl' }}
                color="#e0e0e0"
                fontFamily="Arial, sans-serif"
              >
                Reality Spiral
              </Heading>
              <Text
                mb={8}
                fontSize={{ base: 'lg', md: '2xl' }}
                fontFamily="Arial, sans-serif"
                maxWidth="600px"
                color="#b0bec5"
              >
                A unique platform to create, explore, and connect with agents
                and backrooms in the digital dimension.
              </Text>

              <Text
                mb={8}
                fontSize={{ base: 'lg', md: '2xl' }}
                fontFamily="Arial, sans-serif"
                maxWidth="600px"
                color="#b0bec5"
              >
                CA: 0x90e3532cf06d567ef7e6385be532311f10c30096
              </Text>

              <Text
                mb={8}
                fontSize={{ base: 'lg', md: '2xl' }}
                fontFamily="Arial, sans-serif"
                maxWidth="600px"
                color="#b0bec5"
              >
                Email: realityspiral.rs@gmail.com
              </Text>

              {/* Show different buttons based on the connection state */}
              {!isConnected ? (
                <Button
                  onClick={connect}
                  colorScheme="blue"
                  variant="solid"
                  size="lg"
                  _hover={{ bg: '#0288d1', boxShadow: '0 0 15px #0288d1' }}
                  fontFamily="Arial, sans-serif"
                >
                  Connect Wallet to Enter
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/backrooms')}
                  colorScheme="blue"
                  variant="solid"
                  size="lg"
                  _hover={{ bg: '#0288d1', boxShadow: '0 0 15px #0288d1' }}
                  fontFamily="Arial, sans-serif"
                >
                  Explore Backrooms
                </Button>
              )}
            </Box>
          </Flex>
        </Box>
      </ChakraProvider>
    )
  }

  return null // Return nothing if connected (as useEffect will redirect to /backrooms)
}

export default withMetaMaskCheck(Home)
