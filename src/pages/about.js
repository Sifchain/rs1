import {
  ChakraProvider,
  Box,
  Heading,
  Flex,
  Button,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import withMetaMaskCheck from '../components/withMetaMaskCheck';
import { ConnectButton } from '@rainbow-me/rainbowkit';

function About() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <ChakraProvider>
        <SEO
          title="Reality Spiral - Explore Backrooms and Create Agents"
          description="Welcome to Reality Spiral, a platform to create, explore, and connect with agents and backrooms in the digital dimension."
          url="/"
        />
        <Box position="relative" height="100vh" bg="#424242">
          <Flex alignItems="center" justifyContent="center" height="100vh">
            <Heading
              fontSize="4xl"
              color="#81d4fa"
              textShadow="0 0 10px #81d4fa"
              fontFamily="Arial, sans-serif"
            >
              Loading Reality Spiral...
            </Heading>
          </Flex>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <SEO
        title="Reality Spiral - Explore Backrooms and Create Agents"
        description="Welcome to Reality Spiral, a platform to create, explore, and connect with agents and backrooms in the digital dimension."
        url="/"
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
              A unique platform to create, explore, and connect with agents and
              backrooms in the digital dimension.
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
            <Flex justifyContent="center" alignItems="center" mt={4}>
              {!isConnected ? (
                <ConnectButton
                  showBalance={false}
                  accountStatus="address"
                  chainStatus="icon"
                />
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
            </Flex>
          </Box>
        </Flex>

        {/* Footer */}
        <Box as="footer" bg="#757575" py={4} borderTop="1px solid #616161">
          <Flex justifyContent="center">
            <Text
              fontSize="sm"
              fontFamily="Arial, sans-serif"
              color="#bdbdbd"
            >
              © 2024 Reality Spiral. All Rights Reserved.
            </Text>
          </Flex>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default withMetaMaskCheck(About);
