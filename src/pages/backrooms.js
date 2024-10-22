import { ChakraProvider, Box, Heading, Text, VStack, Flex, Spinner, useToast, Container, Select, Stack, Button, Collapse } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import withMetaMaskCheck from '../components/withMetaMaskCheck';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';

// Helper function to extract agent focus directly from agent object
const getAgentFocus = (agents, agentName) => {
  const agent = agents.find(agent => agent.name === agentName);
  return agent ? agent.focus : 'Unknown';
};

function Backrooms() {
  const [backrooms, setBackrooms] = useState([]);
  const [agents, setAgents] = useState([]); // Store agents here
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('All');
  const [selectedFocus, setSelectedFocus] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchBackroomsAndAgents = async () => {
      try {
        // Fetch agents first
        const agentsResponse = await fetch('/api/agents');
        if (!agentsResponse.ok) {
          throw new Error('Failed to fetch agents');
        }
        const agentsData = await agentsResponse.json();
        setAgents(agentsData);

        // Fetch backrooms
        const backroomsResponse = await fetch('/api/backrooms');
        if (!backroomsResponse.ok) {
          throw new Error('Failed to fetch backrooms');
        }
        const backroomsData = await backroomsResponse.json();
        setBackrooms(backroomsData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBackroomsAndAgents();
  }, [toast]);

  useEffect(() => {
    const { agent, expanded } = router.query;

    if (agent) {
      setSelectedAgent(agent);
    }

    if (expanded) {
      const index = backrooms.findIndex((backroom) => backroom._id === expanded);
      if (index !== -1) {
        setExpandedIndex(index);
      }
    }
  }, [router.query, backrooms]);

  const filteredBackrooms = backrooms.filter((backroom) => {
    if (selectedAgent !== 'All' && backroom.agentName !== selectedAgent) return false;
    if (selectedFocus !== 'All' && getAgentFocus(agents, backroom.agentName) !== selectedFocus) return false;
    return true;
  });

  // Collect all unique focuses from agents
  const uniqueFocuses = Array.from(new Set(agents.map((agent) => agent.focus)));

  if (loading) {
    return (
      <ChakraProvider>
        <Flex height="100vh" alignItems="center" justifyContent="center" bg="#f0f4f8">
          <Spinner size="xl" color="#3498db" />
        </Flex>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <SEO
          title="Reality Spiral - Explore The Backrooms"
          description="Welcome to Reality Spiral, a platform to create, explore, and connect with agents and backrooms in the digital dimension."
          url="/"
        />
      <Navigation />
      <Box bg="#f0f4f8" color="#34495e" minHeight="100vh" py={10} px={6}>
        <Container maxW="container.xl">
          <Heading 
            textAlign="center" 
            mb={10} 
            fontSize={{ base: "2xl", md: "4xl" }}
            color="#2980b9" 
            fontFamily="'Arial', sans-serif"
          >
            Explore the Backrooms
          </Heading>

          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={8} alignItems="center" justifyContent="center">
            {/* Select by agent */}
            <Select
              placeholder="Select Agent"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              maxW="300px"
              bg="#ffffff"
              color="#34495e"
              border="2px solid #ecf0f1"
              _hover={{ borderColor: '#3498db' }}
            >
              <option value="All">All Agents</option>
              {Array.from(new Set(backrooms.map((backroom) => backroom.agentName))).map((agent, index) => (
                <option key={index} value={agent}>
                  {agent}
                </option>
              ))}
            </Select>

            {/* New Select by focus */}
            <Select
              placeholder="Select Focus"
              value={selectedFocus}
              onChange={(e) => setSelectedFocus(e.target.value)}
              maxW="300px"
              bg="#ffffff"
              color="#34495e"
              border="2px solid #ecf0f1"
              _hover={{ borderColor: '#3498db' }}
            >
              <option value="All">All Focuses</option>
              {uniqueFocuses.map((focus, index) => (
                <option key={index} value={focus}>
                  {focus}
                </option>
              ))}
            </Select>
          </Stack>

          <VStack spacing={6} align="stretch">
            {filteredBackrooms.length > 0 ? (
              filteredBackrooms.map((backroom, index) => (
                <Box 
                  key={index} 
                  p={4} 
                  bg="#ffffff" 
                  borderRadius="lg" 
                  border="2px solid #ecf0f1" 
                  boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text 
                      fontFamily="'Arial', sans-serif" 
                      color="#34495e" 
                      fontWeight="bold" 
                      noOfLines={1}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {backroom.agentName}: {backroom.content.split('\n')[0]}
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      fontSize={{ base: "xs", md: "sm" }}
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      whiteSpace="nowrap"
                    >
                      {expandedIndex === index ? 'Collapse' : 'Expand'}
                    </Button>
                  </Flex>
                  <Collapse in={expandedIndex === index} animateOpacity>
                    <Box mt={4}>
                      {backroom.content.split('\n').map((line, i) => {
                        const [agentName, ...messageParts] = line.split(':');
                        const message = messageParts.join(':').trim();
                        if (!agentName.trim() && !message) return null;
                        return (
                          <Text key={i} mt={2} fontFamily="'Arial', sans-serif" color="#34495e" fontSize={{ base: "sm", md: "md" }}>
                            <Text as="span" fontWeight="bold" color="#2980b9">
                              {agentName.trim() && `${agentName}:`}
                            </Text> {message}
                          </Text>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              ))
            ) : (
              <Text textAlign="center" fontSize="xl" fontFamily="'Arial', sans-serif">
                No backroom conversations available.
              </Text>
            )}
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default withMetaMaskCheck(Backrooms);
