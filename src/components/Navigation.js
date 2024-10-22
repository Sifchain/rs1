import {
  Flex,
  Box,
  Button,
  HStack,
  Link,
  Spacer,
  Text,
  IconButton,
  useDisclosure,
  VStack,
  Collapse,
} from '@chakra-ui/react'
import { useAccount, useConnect } from '../hooks/useMetaMask'
import { useRouter } from 'next/router'
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

function Navigation() {
  const { address, isConnected } = useAccount()
  const connect = useConnect()
  const router = useRouter()
  const { isOpen, onToggle } = useDisclosure()

  const handleLogout = async () => {
    if (window.ethereum && window.ethereum.request) {
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        })
      } catch (error) {
        console.error('Failed to disconnect wallet', error)
      }
    }
    window.location.reload()
  }

  return (
    <Box>
      {/* Desktop and Mobile Menu Toggle */}
      <Flex
        as="nav"
        bg="#ffffff"
        color="#34495e"
        p={4}
        alignItems="center"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      >
        <Box>
          <Text fontSize="2xl" fontWeight="bold" fontFamily="Arial, sans-serif">
            Reality Spiral
          </Text>
          <Text
            fontSize={{ base: 'lg', md: 'xs' }}
            fontFamily="Arial, sans-serif"
            maxWidth="800px"
            color="#2c3e50"
          >
            A unique platform to create, explore, and connect with agents and
            backrooms in the digital dimension.
          </Text>
        </Box>
        <Spacer />

        {/* Desktop Links */}
        <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
          <Link
            onClick={() => router.push('/about')}
            fontFamily="Arial, sans-serif"
            _hover={{ color: '#3498db' }}
          >
            About
          </Link>
          <Link
            onClick={() => router.push('/backrooms')}
            fontFamily="Arial, sans-serif"
            _hover={{ color: '#3498db' }}
          >
            Backrooms
          </Link>
          <Link
            onClick={() => router.push('/agents')}
            fontFamily="Arial, sans-serif"
            _hover={{ color: '#3498db' }}
          >
            Agents
          </Link>
          {isConnected ? (
            <HStack spacing={4} alignItems="center">
              <Jazzicon diameter={30} seed={jsNumberForAddress(address)} />
              <Text fontFamily="Arial, sans-serif">
                {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
              </Text>
            </HStack>
          ) : (
            <Button
              onClick={connect}
              colorScheme="blue"
              variant="solid"
              _hover={{ bg: '#2980b9', boxShadow: '0 0 15px #2980b9' }}
            >
              Connect Wallet
            </Button>
          )}
        </HStack>

        {/* Mobile Hamburger Menu */}
        <IconButton
          aria-label="Toggle navigation"
          icon={isOpen ? <FiX /> : <FiMenu />}
          display={{ base: 'block', md: 'none' }}
          onClick={onToggle}
          fontSize="24px"
          bg="transparent"
          _hover={{ bg: 'transparent' }}
          _active={{ bg: 'transparent' }}
        />
      </Flex>

      {/* Mobile Menu */}
      <Collapse in={isOpen} animateOpacity>
        <Box bg="#ffffff" pb={4} display={{ md: 'none' }}>
          <VStack spacing={4} align="stretch" px={4}>
            <Link
              onClick={() => router.push('/backrooms')}
              fontFamily="Arial, sans-serif"
              _hover={{ color: '#3498db' }}
            >
              Backrooms
            </Link>
            <Link
              onClick={() => router.push('/agents')}
              fontFamily="Arial, sans-serif"
              _hover={{ color: '#3498db' }}
            >
              Agents
            </Link>
            <Link
              onClick={() => router.push('/create-agent')}
              fontFamily="Arial, sans-serif"
              _hover={{ color: '#3498db' }}
            >
              Create Agent
            </Link>
            <Link
              onClick={() => router.push('/create-backroom')}
              fontFamily="Arial, sans-serif"
              _hover={{ color: '#3498db' }}
            >
              Create Backroom
            </Link>
            {isConnected ? (
              <HStack spacing={4} alignItems="center">
                <Jazzicon diameter={30} seed={jsNumberForAddress(address)} />
                <Text fontFamily="Arial, sans-serif">
                  {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
                </Text>
              </HStack>
            ) : (
              <Button
                onClick={connect}
                colorScheme="blue"
                variant="solid"
                _hover={{ bg: '#2980b9', boxShadow: '0 0 15px #2980b9' }}
              >
                Connect Wallet
              </Button>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  )
}

export default Navigation
