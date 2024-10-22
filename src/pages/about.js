import {
  ChakraProvider,
  Box,
  Heading,
  Flex,
  Button,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import { useAccount, useConnect } from "../hooks/useMetaMask";
import { useRouter } from "next/router";
import SEO from "../components/SEO";
import withMetaMaskCheck from "../components/withMetaMaskCheck";

function About() {
  const { address, isConnected } = useAccount();
  const connect = useConnect();
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
        <Box position="relative" height="100vh" bg="#f0f4f8">
          <Flex alignItems="center" justifyContent="center" height="100vh">
            <Heading
              fontSize="4xl"
              color="#3498db"
              textShadow="0 0 10px #3498db"
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
          bg="#f0f4f8"
          color="#34495e"
          py={10}
          px={6}
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Box>
            <Heading
              mb={6}
              fontSize={{ base: "4xl", md: "6xl" }}
              color="#2c3e50"
              fontFamily="Arial, sans-serif"
            >
              Reality Spiral
            </Heading>
            <Text
              mb={8}
              fontSize={{ base: "lg", md: "2xl" }}
              fontFamily="Arial, sans-serif"
              maxWidth="600px"
              color="#2c3e50"
            >
              A unique platform to create, explore, and connect with agents and
              backrooms in the digital dimension.
            </Text>

            {/* Show different buttons based on the connection state */}
            {!isConnected ? (
              <Button
                onClick={connect}
                colorScheme="blue"
                variant="solid"
                size="lg"
                _hover={{ bg: "#2980b9", boxShadow: "0 0 15px #2980b9" }}
                fontFamily="Arial, sans-serif"
              >
                Connect Wallet to Enter
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/backrooms")}
                colorScheme="green"
                variant="solid"
                size="lg"
                _hover={{ bg: "#27ae60", boxShadow: "0 0 15px #27ae60" }}
                fontFamily="Arial, sans-serif"
              >
                Explore Backrooms
              </Button>
            )}
          </Box>
        </Flex>

        {/* Footer */}
        <Box as="footer" bg="#ecf0f1" py={4} borderTop="1px solid #bdc3c7">
          <Flex justifyContent="center">
            <Text fontSize="sm" fontFamily="Arial, sans-serif" color="#7f8c8d">
              © 2024 Reality Spiral. All Rights Reserved.
            </Text>
          </Flex>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default withMetaMaskCheck(About);
