import {
    ChakraProvider,
    Box,
    Heading,
    Flex,
    Select,
    Text,
    VStack,
    Divider,
  } from "@chakra-ui/react";
  import { useState, useEffect } from "react";
  import Navigation from "../components/Navigation";
  import withMetaMaskCheck from "../components/withMetaMaskCheck";
  
  function ViewAgents() {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchAgents = async () => {
        try {
          const response = await fetch("/api/agents");
          const data = await response.json();
          setAgents(data);
        } catch (error) {
          console.error("Error fetching agents:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAgents();
    }, []);
  
    const handleAgentSelection = (event) => {
      const agentId = event.target.value;
      const agent = agents.find((agent) => agent._id === agentId);
      setSelectedAgent(agent);
    };
  
    // Extract agent description
    const extractDescription = (description) => {
      return description ? description.trim() : "Description not available.";
    };
  
    // Extract traits directly from agent data
    const extractTraits = (traits) => {
      return traits ? traits.trim() : "Traits not available.";
    };
  
    // Display evolutions in descending order with correct numbering
    const displayEvolutions = (evolutions) => {
      if (!evolutions || evolutions.length === 0) {
        return <Text>No evolutions recorded.</Text>;
      }
  
      const evolutionsCount = evolutions.length;
  
      return evolutions
        .slice()
        .reverse() // Reverse the array to show the latest first
        .map((evolution, index) => (
          <Box
            key={index}
            bg="#f7f9fb"
            p={4}
            borderRadius="md"
            boxShadow="0 0 10px rgba(0, 0, 0, 0.05)"
            mb={4}
          >
            <Text fontWeight="bold" color="#2980b9" mb={2}>
              Evolution {evolutionsCount - index} {/* Display numbers starting from the highest */}
            </Text>
            <Text fontFamily="'Arial', sans-serif" color="#34495e">
              {evolution}
            </Text>
          </Box>
        ));
    };
  
    return (
      <ChakraProvider>
        <Box minHeight="100vh" bg="#f0f4f8" color="#34495e">
          <Navigation />
          <Box py={10} px={6} maxW="1000px" mx="auto">
            <Heading
              textAlign="center"
              mb={10}
              fontSize="4xl"
              color="#2980b9"
              fontFamily="'Arial', sans-serif"
            >
              View Agents
            </Heading>
  
            {/* Dropdown to select agent */}
            <Flex direction="column" mb={8} alignItems="center">
              <Select
                placeholder="Select Agent"
                onChange={handleAgentSelection}
                maxW="400px"
                bg="#ffffff"
                color="#34495e"
                border="2px solid #ecf0f1"
                _hover={{ borderColor: "#3498db" }}
              >
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </Select>
            </Flex>
  
            {/* Display agent details */}
            {selectedAgent && (
              <VStack spacing={6} align="stretch">
                <Box
                  p={4}
                  bg="#ffffff"
                  borderRadius="lg"
                  border="2px solid #ecf0f1"
                  boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
                >
                  <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                    Name:
                  </Text>
                  <Text fontFamily="'Arial', sans-serif" color="#34495e">
                    {selectedAgent.name}
                  </Text>
                </Box>
  
                <Box
                  p={4}
                  bg="#ffffff"
                  borderRadius="lg"
                  border="2px solid #ecf0f1"
                  boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
                >
                  <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                    Description:
                  </Text>
                  <Text fontFamily="'Arial', sans-serif" color="#34495e">
                    {extractDescription(selectedAgent.description)}
                  </Text>
                </Box>
  
                <Box
                  p={4}
                  bg="#ffffff"
                  borderRadius="lg"
                  border="2px solid #ecf0f1"
                  boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
                >
                  <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                    Traits:
                  </Text>
                  <Text fontFamily="'Arial', sans-serif" color="#34495e">
                    {extractTraits(selectedAgent.traits)}
                  </Text>
                </Box>
  
                <Box
                  p={4}
                  bg="#ffffff"
                  borderRadius="lg"
                  border="2px solid #ecf0f1"
                  boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
                >
                  <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                    Evolutions:
                  </Text>
                  <Box mt={4}>{displayEvolutions(selectedAgent.evolutions)}</Box>
                </Box>
  
                <Box
                  p={4}
                  bg="#ffffff"
                  borderRadius="lg"
                  border="2px solid #ecf0f1"
                  boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
                >
                  <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                    Focus:
                  </Text>
                  <Text fontFamily="'Arial', sans-serif" color="#34495e">
                    {selectedAgent.focus}
                  </Text>
                </Box>
              </VStack>
            )}
  
            {loading && (
              <Flex justifyContent="center" mt={4}>
                <Text>Loading agents...</Text>
              </Flex>
            )}
          </Box>
        </Box>
      </ChakraProvider>
    );
  }
  
  export default withMetaMaskCheck(ViewAgents);
  