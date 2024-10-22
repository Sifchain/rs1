import { ChakraProvider, Box, Heading, Flex, Select, Text, VStack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import withMetaMaskCheck from '../components/withMetaMaskCheck';

function ViewAgents() {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await fetch('/api/agents');
                const data = await response.json();
                setAgents(data);
            } catch (error) {
                console.error('Error fetching agents:', error);
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

    // Regex to extract the Traits section
    const extractTraits = (traits) => {
        const traitsRegex = /Traits:\s*(.*?)(Focus:|Evolution:|$)/s;
        const match = traits.match(traitsRegex);
        return match ? match[1].trim() : 'Traits not available.';
    };

    // Updated Regex to clean "Agent: Neo Description:" part completely
    const extractDescription = (traits) => {
        // Updated Regex to trim everything before 'Description:'
        const descriptionRegex = /.*?Description:\s*([\s\S]*?)(?:Traits:|Focus:|Evolution:|$)/;
        const match = traits.match(descriptionRegex);
        return match ? match[1].trim() : 'Description not available.';
    };
      

    // Regex to extract the Evolution section
    const extractEvolution = (traits) => {
        const evolutionRegex = /Evolution:(.*?)(Traits:|Focus:|$)/s;
        const match = traits.match(evolutionRegex);
        return match ? match[1].trim() : 'Evolution not available.';
    };

    return (
        <ChakraProvider>
            <Box minHeight="100vh" bg="#f0f4f8" color="#34495e">
                <Navigation />
                <Box py={10} px={6} maxW="1000px" mx="auto">
                    <Heading textAlign="center" mb={10} fontSize="4xl" color="#2980b9" fontFamily="'Arial', sans-serif">
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
                            _hover={{ borderColor: '#3498db' }}
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
                        <VStack spacing={4} align="stretch">
                            <Box p={4} bg="#ffffff" borderRadius="lg" border="2px solid #ecf0f1" boxShadow="0 0 15px rgba(0, 0, 0, 0.1)">
                                <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                                    Name:
                                </Text>
                                <Text fontFamily="'Arial', sans-serif" color="#34495e">
                                    {selectedAgent.name}
                                </Text>
                            </Box>

                            <Box p={4} bg="#ffffff" borderRadius="lg" border="2px solid #ecf0f1" boxShadow="0 0 15px rgba(0, 0, 0, 0.1)">
                                <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                                    Description:
                                </Text>
                                <Text fontFamily="'Arial', sans-serif" color="#34495e">
                                    {extractDescription(selectedAgent.traits)}
                                </Text>
                            </Box>

                            <Box p={4} bg="#ffffff" borderRadius="lg" border="2px solid #ecf0f1" boxShadow="0 0 15px rgba(0, 0, 0, 0.1)">
                                <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                                    Traits:
                                </Text>
                                <Text fontFamily="'Arial', sans-serif" color="#34495e">
                                    {extractTraits(selectedAgent.traits)}
                                </Text>
                            </Box>

                            <Box p={4} bg="#ffffff" borderRadius="lg" border="2px solid #ecf0f1" boxShadow="0 0 15px rgba(0, 0, 0, 0.1)">
                                <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                                    Evolution:
                                </Text>
                                <Text fontFamily="'Arial', sans-serif" color="#34495e">
                                    {extractEvolution(selectedAgent.traits)}
                                </Text>
                            </Box>

                            <Box p={4} bg="#ffffff" borderRadius="lg" border="2px solid #ecf0f1" boxShadow="0 0 15px rgba(0, 0, 0, 0.1)">
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
