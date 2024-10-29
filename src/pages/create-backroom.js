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
  Link,
  Tooltip,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import withMetaMaskCheck from '../components/withMetaMaskCheck'
import { useRouter } from 'next/router'
import SEO from '../components/SEO'
import { useAccount } from '../hooks/useMetaMask'
import {
  MINIMUM_TOKENS_TO_CREATE_BACKROOM,
  TOKEN_CONTRACT_ADDRESS,
} from '../constants/constants'
import { genIsBalanceEnough } from '../utils/balance'

function CreateBackroom() {
  const [explorerAgent, setExplorerAgent] = useState('')
  const [explorerDescription, setExplorerDescription] = useState('')
  const [responderAgent, setResponderAgent] = useState('')
  const [responderDescription, setResponderDescription] = useState('')
  const [agents, setAgents] = useState([])
  const [selectedExplorerInfo, setSelectedExplorerInfo] = useState(null) // Holds explorer agent details
  const [selectedResponderInfo, setSelectedResponderInfo] = useState(null) // Holds responder agent details
  const [selectedExplorerEvolutions, setSelectedExplorerEvolutions] = useState(
    []
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const router = useRouter()
  const [enoughFunds, setEnoughFunds] = useState(false)
  const { address } = useAccount()
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
    if (address) {
      const fetchHasEnoughFunds = async () => {
        return await genIsBalanceEnough(
          address,
          TOKEN_CONTRACT_ADDRESS,
          MINIMUM_TOKENS_TO_CREATE_BACKROOM
        )
      }
      fetchHasEnoughFunds()
        .then(hasEnoughFunds => {
          setEnoughFunds(hasEnoughFunds)
        })
        .catch(error => {
          console.error('Error checking balance:', error)
        })
    }
  }, [address, loading])
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

  const handleResponderChange = e => {
    const selectedAgentName = e.target.value
    setResponderAgent(selectedAgentName)
    const selectedResponder = agents.find(ag => ag.name === selectedAgentName)
    if (selectedResponder) {
      setSelectedResponderInfo(selectedResponder)
    } else {
      setSelectedResponderInfo(null)
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
    if (!responderAgent) {
      errors.responderAgent = 'Responder Agent is required'
      valid = false
    }
    // Check if the selected explorer and responder agents are the same
    if (explorerAgent === responderAgent) {
      errors.responderAgent = 'Explorer and Responder agents cannot be the same'
      errors.explorerAgent = 'Explorer and Responder agents cannot be the same'
      valid = false
    }

    if (
      explorerDescription &&
      (explorerDescription.length < 10 || explorerDescription.length > 10000)
    ) {
      errors.explorerDescription =
        'Explorer description should be between 10 and 10000 characters'
      valid = false
    }

    if (
      responderDescription &&
      (responderDescription.length < 10 || responderDescription.length > 10000)
    ) {
      errors.responderDescription =
        'Responder description should be between 10 and 10000 characters'
      valid = false
    }

    setErrors(errors)
    return valid
  }

  const handleSubmit = async () => {
    if (!handleValidation()) return

    setLoading(true)
    try {
      const res = await fetch('/api/backrooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'Explorer',
          explorerAgent,
          explorerDescription,
          responderAgent,
          responderDescription,
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
      <Box minHeight="100vh" bg="#424242" color="#e0e0e0">
        <Navigation />
        <Box py={10} px={6} maxW="2000px" mx="auto">
          <Flex justifyContent="space-between" alignItems="center" mb={5}>
            {/* Back Button */}
            <Button
              leftIcon={<ArrowBackIcon />}
              colorScheme="blue"
              onClick={() => router.back()}
            >
              Back
            </Button>

            {/* Center-aligned heading */}
            <Heading
              textAlign="center"
              fontSize="4xl"
              color="#81d4fa"
              fontFamily="'Arial', sans-serif"
              flex="1"
            >
              Create a Backroom
            </Heading>

            {/* Spacer to keep the heading centered */}
            <Box width="60px" />
          </Flex>

          <Flex
            direction={{ base: 'column', md: 'row' }}
            justifyContent="space-between"
            mb={6}
          >
            {/* Explorer Setup */}
            <Box width={{ base: '100%', md: '48%' }} mb={{ base: 4, md: 0 }}>
              <Heading size="md" mb={4} color="#81d4fa">
                Explorer Setup
              </Heading>
              <FormControl isInvalid={errors.explorerAgent}>
                <Select
                  placeholder="Select Explorer Agent"
                  value={explorerAgent}
                  onChange={handleExplorerChange}
                  bg="#424242"
                  color="#e0e0e0"
                  border="2px solid"
                  borderColor={errors.explorerAgent ? 'red.500' : '#757575'}
                  _hover={{ borderColor: '#64b5f6' }}
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
                    <strong>Backroom Prompt:</strong>{' '}
                    {selectedExplorerInfo.backroomPrompt ||
                      'No backroom prompt provided'}{' '}
                    <br />
                  </Text>
                </Box>
              )}
            </Box>

            {/* Responder Setup */}
            <Box width={{ base: '100%', md: '48%' }}>
              <Heading size="md" mb={4} color="#81d4fa">
                Responder Setup
              </Heading>
              <FormControl isInvalid={errors.responderAgent}>
                <Select
                  placeholder="Select Responder Agent"
                  value={responderAgent}
                  onChange={handleResponderChange}
                  bg="#424242"
                  color="#e0e0e0"
                  border="2px solid #757575"
                  _hover={{ borderColor: '#64b5f6' }}
                >
                  {agents.map(agent => (
                    <option key={agent._id} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
                {errors.responderAgent && (
                  <FormErrorMessage>{errors.responderAgent}</FormErrorMessage>
                )}
              </FormControl>

              {/* Show current responder agent info if selected */}
              {selectedResponderInfo && (
                <Box mt={4}>
                  <Text mb={4}>
                    <strong>Description:</strong>{' '}
                    {selectedResponderInfo.description}
                  </Text>
                </Box>
              )}
            </Box>
          </Flex>
          <Tooltip
            label={
              !enoughFunds
                ? `You need at least ${MINIMUM_TOKENS_TO_CREATE_BACKROOM} RSP to create a new backroom.`
                : ''
            }
            hasArrow
            placement="top"
          >
            <Box as="span" cursor={!enoughFunds ? 'pointer' : 'not-allowed'}>
              <Button
                isLoading={loading}
                isDisabled={!enoughFunds}
                loadingText="Creating..."
                colorScheme="blue"
                variant="solid"
                onClick={handleSubmit}
                _hover={{ bg: '#64b5f6', boxShadow: '0 0 15px #64b5f6' }}
                width="100%"
              >
                Create Backroom
              </Button>
            </Box>
          </Tooltip>

          {/* Display agent's evolutions */}
          {selectedExplorerEvolutions.length > 0 && (
            <Box mt={8}>
              <Heading size="lg" mb={4} color="#81d4fa">
                Evolution History for {explorerAgent}
              </Heading>
              <Table variant="simple" size="lg" colorScheme="blue">
                <Thead>
                  <Tr>
                    <Th color="#e0e0e0">Evolution</Th>
                    <Th color="#e0e0e0">Backroom</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedExplorerEvolutions.map((evolution, index) => (
                    <Tr key={index}>
                      <Td fontFamily="Arial, sans-serif" color="#e0e0e0">
                        {evolution.description}
                      </Td>
                      <Td fontFamily="Arial, sans-serif" color="#e0e0e0">
                        <Link
                          href={`/backrooms?expanded=${evolution?.backroomId}`}
                        >
                          View Backroom
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default withMetaMaskCheck(CreateBackroom)
