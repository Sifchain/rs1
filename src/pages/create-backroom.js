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
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import withMetaMaskCheck from '../components/withMetaMaskCheck'
import { useRouter } from 'next/router'
import SEO from '../components/SEO'

function CreateBackroom() {
  const [explorerAgent, setExplorerAgent] = useState('')
  const [explorerDescription, setExplorerDescription] = useState('')
  const [terminalAgent, setTerminalAgent] = useState('Reality Spiral')
  const [terminalDescription, setTerminalDescription] = useState('')
  const [agents, setAgents] = useState([])
  const [selectedExplorerInfo, setSelectedExplorerInfo] = useState(null) // Holds explorer agent details
  const [selectedTerminalInfo, setSelectedTerminalInfo] = useState(null) // Holds terminal agent details
  const [selectedExplorerEvolutions, setSelectedExplorerEvolutions] = useState(
    []
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const router = useRouter()
  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents([...data])
    } catch (error) {
      setAgents([]) // Fallback to empty if fetching fails
    }
  }
  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    const { agent, agentId } = router.query

    if (agent && agents.length > 0) {
      // Select explorer by name
      const selectedExplorer = agents.find(ag => ag.name === agent)
      setExplorerAgent(agent)
      setSelectedExplorerInfo(selectedExplorer)
      setSelectedExplorerEvolutions(selectedExplorer?.evolutions || [])
    } else if (agentId && agents.length > 0) {
      // Select explorer by id
      const selectedExplorer = agents.find(ag => ag._id === agentId)
      setExplorerAgent(selectedExplorer?.name || '')
      setSelectedExplorerInfo(selectedExplorer)
      setSelectedExplorerEvolutions(selectedExplorer?.evolutions || [])
    }
  }, [router.query, agents])

  const handleExplorerChange = e => {
    const selectedAgentName = e.target.value
    setExplorerAgent(selectedAgentName)
    const selectedExplorer = agents.find(ag => ag.name === selectedAgentName)
    if (selectedExplorer) {
      setSelectedExplorerInfo(selectedExplorer)
      setSelectedExplorerEvolutions(selectedExplorer.evolutions || [])
    } else {
      setSelectedExplorerInfo(null)
      setSelectedExplorerEvolutions([])
    }
  }

  const handleTerminalChange = e => {
    const selectedAgentName = e.target.value
    setTerminalAgent(selectedAgentName)
    const selectedTerminal = agents.find(ag => ag.name === selectedAgentName)
    if (selectedTerminal) {
      setSelectedTerminalInfo(selectedTerminal)
    } else {
      setSelectedTerminalInfo(null)
    }
  }

  // Form validation
  const handleValidation = () => {
    let valid = true
    let errors = {}

    if (!explorerAgent) {
      errors.explorerAgent = 'Explorer Agent is required'
      valid = false
    }

    setErrors(errors)
    return valid
  }

  const handleSubmit = async () => {
    if (!handleValidation()) return

    setLoading(true)
    try {
      const res = await fetch('/api/backrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentName: explorerAgent,
          role: 'Explorer',
          explorerAgent,
          explorerDescription,
          terminalAgent,
          terminalDescription,
        }),
      })

      if (res.ok) {
        const newBackroom = await res.json()
        router.push(`/backrooms?expanded=${newBackroom._id}`)
      }
    } catch (error) {
      console.error('Error creating backroom:', error)
    } finally {
      setLoading(false)
    }
  }

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
          {/* Back Button */}
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="blue"
            onClick={() => router.back()}
            alignSelf="flex-start"
          >
            Back
          </Button>
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
            direction={{ base: 'column', md: 'row' }}
            justifyContent="space-between"
            mb={6}
          >
            {/* Explorer Setup */}
            <Box width={{ base: '100%', md: '48%' }} mb={{ base: 4, md: 0 }}>
              <Heading size="md" mb={4}>
                Explorer Setup
              </Heading>
              <FormControl isInvalid={errors.explorerAgent}>
                <Select
                  placeholder="Select Explorer Agent"
                  value={explorerAgent}
                  onChange={handleExplorerChange}
                  bg="#ffffff"
                  color="#34495e"
                  border="2px solid"
                  borderColor={errors.explorerAgent ? 'red.500' : '#ecf0f1'}
                  _hover={{ borderColor: '#3498db' }}
                >
                  {agents.map(agent => (
                    <option key={agent._id} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
                {errors.explorerAgent && (
                  <FormErrorMessage>{errors.explorerAgent}</FormErrorMessage>
                )}
              </FormControl>

              {/* Show current explorer agent info if selected */}
              {selectedExplorerInfo && (
                <Box mt={4}>
                  <Text mb={4}>
                    <strong>Description:</strong>{' '}
                    {selectedExplorerInfo.description}
                  </Text>
                  <Text mb={4}>
                    <strong>Traits:</strong> {selectedExplorerInfo.traits}
                  </Text>
                  <Text mb={4}>
                    <strong>Focus:</strong> {selectedExplorerInfo.focus}
                  </Text>
                </Box>
              )}

              <FormControl mt={4}>
                <Textarea
                  placeholder="Optional: Add to the Explorer Description"
                  value={explorerDescription}
                  onChange={e => setExplorerDescription(e.target.value)}
                  bg="#ffffff"
                  color="#34495e"
                  border="2px solid"
                  borderColor="#ecf0f1"
                  _hover={{ borderColor: '#3498db' }}
                  p={3}
                  minHeight="100px"
                />
              </FormControl>
            </Box>

            {/* Terminal Setup */}
            <Box width={{ base: '100%', md: '48%' }}>
              <Heading size="md" mb={4}>
                Terminal Setup
              </Heading>
              <FormControl>
                <Select
                  value={terminalAgent}
                  onChange={handleTerminalChange}
                  bg="#ffffff"
                  color="#34495e"
                  border="2px solid #ecf0f1"
                  _hover={{ borderColor: '#3498db' }}
                >
                  {agents.map(agent => (
                    <option key={agent._id} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Show current terminal agent info if selected */}
              {selectedTerminalInfo && (
                <Box mt={4}>
                  <Text mb={4}>
                    <strong>Description:</strong>{' '}
                    {selectedTerminalInfo.description}
                  </Text>
                  <Text mb={4}>
                    <strong>Traits:</strong> {selectedTerminalInfo.traits}
                  </Text>
                  <Text mb={4}>
                    <strong>Focus:</strong> {selectedTerminalInfo.focus}
                  </Text>
                </Box>
              )}

              <FormControl mt={4}>
                <Textarea
                  placeholder="Optional: Add to the Terminal Description"
                  value={terminalDescription}
                  onChange={e => setTerminalDescription(e.target.value)}
                  bg="#ffffff"
                  color="#34495e"
                  border="2px solid #ecf0f1"
                  _hover={{ borderColor: '#3498db' }}
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
            _hover={{ bg: '#3498db', boxShadow: '0 0 15px #3498db' }}
            width="100%"
          >
            Create Backroom
          </Button>

          {/* Display agent's evolutions */}
          {selectedExplorerEvolutions.length > 0 && (
            <Box mt={8}>
              <Heading size="lg" mb={4}>
                Evolution History for {explorerAgent}
              </Heading>
              <Table variant="simple" size="lg" colorScheme="blue">
                <Thead>
                  <Tr>
                    <Th>Evolution</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedExplorerEvolutions.map((evolution, index) => (
                    <Tr key={index}>
                      <Td fontFamily="Arial, sans-serif">{evolution}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {/* Agents table displaying name, traits, and focus */}
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
                {agents.map(agent => (
                  <Tr key={agent._id}>
                    <Td fontFamily="Arial, sans-serif">{agent.name}</Td>
                    <Td fontFamily="Arial, sans-serif">
                      <strong>Traits:</strong> {agent.traits} <br />
                      <strong>Focus:</strong> {agent.focus} <br />
                      <strong>Description:</strong> {agent.description} <br />
                      <strong>Backroom Prompt:</strong>{' '}
                      {agent.backroomPrompt || 'No backroom prompt provided'}{' '}
                      <br />
                      <strong>Conversation Prompt:</strong>{' '}
                      {agent.conversationPrompt ||
                        'No conversation prompt provided'}{' '}
                      <br />
                      <strong>Recap Prompt:</strong>{' '}
                      {agent.recapPrompt || 'No recap prompt provided'} <br />
                      <strong>Tweet Prompt:</strong>{' '}
                      {agent.tweetPrompt || 'No tweet prompt provided'} <br />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default withMetaMaskCheck(CreateBackroom)
