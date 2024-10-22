import {
  ChakraProvider,
  Box,
  Button,
  Heading,
  Flex,
  Select,
  Textarea,
  FormControl,
  FormErrorMessage,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import withMetaMaskCheck from "../components/withMetaMaskCheck";
import { useRouter } from "next/router";
import SEO from "../components/SEO";

function CreateBackroom() {
  const [explorerAgent, setExplorerAgent] = useState("");
  const [explorerDescription, setExplorerDescription] = useState("");
  const [terminalAgent, setTerminalAgent] = useState("Terminal of Truth");
  const [terminalDescription, setTerminalDescription] = useState("");
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents");
        const data = await response.json();
        setAgents([...data]);
      } catch (error) {
        setAgents([]); // Fallback to default agents in case of error
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    const { agent } = router.query;
    if (agent) {
      setExplorerAgent(agent);
    }
  }, [router.query]);

  // Form validation
  const handleValidation = () => {
    let valid = true;
    let errors = {};

    if (!explorerAgent) {
      errors.explorerAgent = "Explorer Agent is required";
      valid = false;
    }
    if (!explorerDescription) {
      errors.explorerDescription = "Explorer Description is required";
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!handleValidation()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/backrooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentName: explorerAgent,
          role: "Explorer", // change based on selection or remove
          explorerAgent,
          explorerDescription,
          terminalAgent,
          terminalDescription,
        }),
      });

      if (res.ok) {
        const newBackroom = await res.json();
        router.push(`/backrooms?expanded=${newBackroom._id}`);
      }
    } catch (error) {
      console.error("Error creating backroom:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChakraProvider>
      <SEO
        title="Reality Spiral - Create a Backroom"
        description="Welcome to Reality Spiral, a platform to create, explore, and connect with agents and backrooms in the digital dimension."
        url="/"
      />
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
            Create a Backroom
          </Heading>

          <Flex
            direction={{ base: "column", md: "row" }}
            justifyContent="space-between"
            mb={6}
          >
            <Box width={{ base: "100%", md: "48%" }} mb={{ base: 4, md: 0 }}>
              <Heading size="md" mb={4}>
                Explorer Setup
              </Heading>
              <FormControl isInvalid={errors.explorerAgent}>
                <Select
                  placeholder="Select Explorer Agent"
                  value={explorerAgent}
                  onChange={(e) => setExplorerAgent(e.target.value)}
                  bg="#ffffff"
                  color="#34495e"
                  border="2px solid"
                  borderColor={errors.explorerAgent ? "red.500" : "#ecf0f1"}
                  _hover={{ borderColor: "#3498db" }}
                >
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
                {errors.explorerAgent && (
                  <FormErrorMessage>{errors.explorerAgent}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={errors.explorerDescription} mt={4}>
                <Textarea
                  placeholder="Explorer Description"
                  value={explorerDescription}
                  onChange={(e) => setExplorerDescription(e.target.value)}
                  bg="#ffffff"
                  color="#34495e"
                  border="2px solid"
                  borderColor={
                    errors.explorerDescription ? "red.500" : "#ecf0f1"
                  }
                  _hover={{ borderColor: "#3498db" }}
                  p={3}
                  minHeight="100px"
                />
                {errors.explorerDescription && (
                  <FormErrorMessage>
                    {errors.explorerDescription}
                  </FormErrorMessage>
                )}
              </FormControl>
            </Box>

            <Box width={{ base: "100%", md: "48%" }}>
              <Heading size="md" mb={4}>
                Terminal Setup
              </Heading>
              <FormControl>
                <Select
                  value={terminalAgent}
                  onChange={(e) => setTerminalAgent(e.target.value)}
                  bg="#ffffff"
                  color="#34495e"
                  border="2px solid #ecf0f1"
                  _hover={{ borderColor: "#3498db" }}
                >
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl mt={4}>
                <Textarea
                  placeholder="Optional: Add a description for the Terminal"
                  value={terminalDescription}
                  onChange={(e) => setTerminalDescription(e.target.value)}
                  bg="#ffffff"
                  color="#34495e"
                  border="2px solid #ecf0f1"
                  _hover={{ borderColor: "#3498db" }}
                  p={3}
                  minHeight="100px"
                />
              </FormControl>
            </Box>
          </Flex>

          <Button
            isLoading={loading}
            loadingText="Creating..."
            colorScheme="blue"
            variant="solid"
            onClick={handleSubmit}
            _hover={{ bg: "#3498db", boxShadow: "0 0 15px #3498db" }}
            width="100%"
          >
            Create Backroom
          </Button>
          <Box mt={8}>
            <Heading size="lg" mb={4}>
              Agents
            </Heading>
            <Table variant="simple" size="lg" colorScheme="blue">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                {agents.map((agent) => (
                  <Tr key={agent._id}>
                    <Td fontFamily="Arial, sans-serif">{agent.name}</Td>
                    <Td fontFamily="Arial, sans-serif">
                      <strong>Traits:</strong> {agent.traits} <br />
                      <strong>Focus:</strong> {agent.focus}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default withMetaMaskCheck(CreateBackroom);
