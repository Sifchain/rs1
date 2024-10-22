import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount, useConnect } from "../hooks/useMetaMask";
import { Box, Button, Flex, Heading, ChakraProvider } from "@chakra-ui/react";
import Navigation from "../components/Navigation";
import SEO from "../components/SEO";
import withMetaMaskCheck from "../components/withMetaMaskCheck";

function Home() {
  const { isConnected } = useAccount();
  const connect = useConnect();
  const router = useRouter();

  // If connected, redirect to backrooms
  useEffect(() => {
    if (isConnected) {
      router.push("/backrooms");
    }
  }, [isConnected, router]);

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
            </Box>
          </Flex>
        </Box>
      </ChakraProvider>
    );
  }

  return null; // Return nothing if connected (as useEffect will redirect to /backrooms)
}

export default withMetaMaskCheck(Home);
