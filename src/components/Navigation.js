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
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/router';
import { FiMenu, FiX } from 'react-icons/fi';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

function Navigation() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { isOpen, onToggle } = useDisclosure();

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
          <Text fontSize="2xl" fontWeight="bold" fontFamily="Arial, sans-serif">
            Reality Spiral
          </Text>
          <Text
            fontSize={{ base: 'lg', md: 'xs' }}
            fontFamily="Arial, sans-serif"
            maxWidth="800px"
            color="#b0bec5"
          >
            A unique platform to create, explore, and connect with agents and
            backrooms in the digital dimension. - v0.1.2
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

          {/* Customized ConnectButton */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              return (
                <div
                  {...(!mounted && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!mounted || !account || !chain) {
                      return (
                        <Button
                          onClick={openConnectModal}
                          colorScheme="blue"
                          variant="solid"
                          _hover={{ bg: '#0288d1', boxShadow: '0 0 15px #0288d1' }}
                        >
                          Connect Wallet
                        </Button>
                      );
                    }
                    if (chain.unsupported) {
                      return (
                        <Button
                          onClick={openChainModal}
                          colorScheme="red"
                          variant="solid"
                          _hover={{ bg: '#e53935', boxShadow: '0 0 15px #e53935' }}
                        >
                          Wrong network
                        </Button>
                      );
                    }
                    return (
                      <Button
                        onClick={openAccountModal}
                        variant="ghost"
                        _hover={{ bg: 'transparent' }}
                        _active={{ bg: 'transparent' }}
                      >
                        <HStack spacing={2} alignItems="center">
                          <Jazzicon
                            diameter={30}
                            seed={jsNumberForAddress(account.address)}
                          />
                          <Text fontFamily="Arial, sans-serif">
                            {account.address.slice(0, 6)}...{account.address.slice(-4)}
                          </Text>
                        </HStack>
                      </Button>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
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
              color="#e0e0e0"
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: '#81d4fa' }}
            >
              TG
            </Link>
            <Link
              href="https://x.com/reality_spiral"
              fontFamily="Arial, sans-serif"
              color="#e0e0e0" 
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: '#81d4fa' }}
            >
              X
            </Link>
            <Link
              href="https://www.dextools.io/app/en/ether/pair-explorer/0xa909be631bf794346b6dee19db1d98b6dc0eaf70?t=1730150465235"
              fontFamily="Arial, sans-serif"
              color="#e0e0e0" 
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: '#81d4fa' }}
            >
              Charts
            </Link>

            {/* Mobile Customized ConnectButton */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                return (
                  <div
                    {...(!mounted && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!mounted || !account || !chain) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            colorScheme="blue"
                            variant="solid"
                            _hover={{ bg: '#0288d1', boxShadow: '0 0 15px #0288d1' }}
                          >
                            Connect Wallet
                          </Button>
                        );
                      }
                      if (chain.unsupported) {
                        return (
                          <Button
                            onClick={openChainModal}
                            colorScheme="red"
                            variant="solid"
                            _hover={{ bg: '#e53935', boxShadow: '0 0 15px #e53935' }}
                          >
                            Wrong network
                          </Button>
                        );
                      }
                      return (
                        <Button
                          onClick={openAccountModal}
                          variant="ghost"
                          _hover={{ bg: 'transparent' }}
                          _active={{ bg: 'transparent' }}
                        >
                          <HStack spacing={2} alignItems="center">
                            <Jazzicon
                              diameter={30}
                              seed={jsNumberForAddress(account.address)}
                            />
                            <Text fontFamily="Arial, sans-serif">
                              {account.address.slice(0, 6)}...{account.address.slice(-4)}
                            </Text>
                          </HStack>
                        </Button>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}

export default Navigation;