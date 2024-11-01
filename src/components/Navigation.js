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
        bg="#424242"
        color="#e0e0e0"
        p={4}
        alignItems="center"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      >
        <Box>
          <Text
            fontSize={{ base: "lg", md: "2xl" }}
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            textAlign={{ base: "left", md: "left" }}
          >
            Reality Spiral
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontFamily="Arial, sans-serif"
            maxWidth={{ base: "90%", md: "800px" }}
            color="#b0bec5"
            textAlign={{ base: "left", md: "left" }}
            mt={{ base: 2, md: 0 }}
          >
            A unique platform to create, explore, and connect with agents and backrooms in the digital dimension. - v0.1.2
          </Text>
        </Box>
        <Spacer />

        {/* Desktop Links */}
        <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
          <Link
            onClick={() => router.push('/about')}
            fontFamily="Arial, sans-serif"
            _hover={{ color: '#81d4fa' }}
          >
            About
          </Link>
          <Link
            onClick={() => router.push('/backrooms')}
            fontFamily="Arial, sans-serif"
            _hover={{ color: '#81d4fa' }}
          >
            Backrooms
          </Link>
          <Link
            onClick={() => router.push('/agents')}
            fontFamily="Arial, sans-serif"
            _hover={{ color: '#81d4fa' }}
          >
            Agents
          </Link>
          <Link
            href="https://t.me/reality_spiral"
            fontFamily="Arial, sans-serif"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: '#81d4fa' }}
          >
            TG
          </Link>
          <Link
            href="https://x.com/reality_spiral"
            fontFamily="Arial, sans-serif"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: '#81d4fa' }}
          >
            X
          </Link>
          <Link
            href="https://www.dextools.io/app/en/ether/pair-explorer/0xa909be631bf794346b6dee19db1d98b6dc0eaf70?t=1730150465235"
            fontFamily="Arial, sans-serif"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: '#81d4fa' }}
          >
            Chart
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
              _hover={{ bg: '#0288d1', boxShadow: '0 0 15px #0288d1' }}
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
        <Box bg="#212121" pt={4} pb={4} display={{ md: 'none' }}>
          <VStack spacing={4} align="stretch" px={4}>
            <Link
              onClick={() => router.push('/backrooms')}
              fontFamily="Arial, sans-serif"
              color="#e0e0e0"
              _hover={{ color: '#81d4fa' }}
            >
              Backrooms
            </Link>
            <Link
              onClick={() => router.push('/agents')}
              fontFamily="Arial, sans-serif"
              color="#e0e0e0"
              _hover={{ color: '#81d4fa' }}
            >
              Agents
            </Link>
            <Link
              href="https://t.me/reality_spiral"
              fontFamily="Arial, sans-serif"
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: '#81d4fa' }}
            >
              TG
            </Link>
            <Link
              href="https://x.com/reality_spiral"
              fontFamily="Arial, sans-serif"
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: '#81d4fa' }}
            >
              X
            </Link>
            <Link
              href="https://www.dextools.io/app/en/ether/pair-explorer/0xa909be631bf794346b6dee19db1d98b6dc0eaf70?t=1730150465235"
              fontFamily="Arial, sans-serif"
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: '#81d4fa' }}
            >
              Chart
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
                _hover={{ bg: '#0288d1', boxShadow: '0 0 15px #0288d1' }}
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
