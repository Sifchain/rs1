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
  Tooltip,
  Spinner,
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
  backroomTypes,
} from '../constants/constants'
import { genIsBalanceEnough } from '../utils/balance'

function CreateBackroom() {
  const [explorerAgent, setExplorerAgent] = useState('')
  const [responderAgent, setResponderAgent] = useState('')
  const [backroomType, setBackroomType] = useState('')
  const [agents, setAgents] = useState([])
  const [selectedExplorerInfo, setSelectedExplorerInfo] = useState(null)
  const [selectedResponderInfo, setSelectedResponderInfo] = useState(null)
  const [selectedExplorerEvolutions, setSelectedExplorerEvolutions] = useState(
    []
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const router = useRouter()
  const [enoughFunds, setEnoughFunds] = useState(false)
  const { address } = useAccount()
  const [topic, setTopic] = useState('')

  const loadingMessages = [
    'Processing',
    'Analyzing',
    'Connecting',
    'Finalizing',
    'Completing',
  ]
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (loading) {
        setCurrentMessageIndex(
          prevIndex => (prevIndex + 1) % loadingMessages.length
        )
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [loading])

  const currentMessage = loadingMessages[currentMessageIndex]

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents([...data])
    } catch (error) {
      setAgents([])
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
      const selectedExplorer = agents.find(ag => ag._id === agentId)
      setExplorerAgent(agent)
      setSelectedExplorerInfo(selectedExplorer)
      setSelectedExplorerEvolutions(selectedExplorer?.evolutions || [])
    } else if (agentId && agents.length > 0) {
      // Select explorer by id
      const selectedExplorer = agents.find(ag => ag._id === agentId)
      setExplorerAgent(selectedExplorer?._id || '')
      setSelectedExplorerInfo(selectedExplorer)
      setSelectedExplorerEvolutions(selectedExplorer?.evolutions || [])
    }
  }, [router.query, agents])

  const handleExplorerChange = e => {
    const selectedAgentId = e.target.value
    setExplorerAgent(selectedAgentId)

    const selectedExplorer = agents.find(ag => ag._id === selectedAgentId)
    if (selectedExplorer) {
      setSelectedExplorerInfo(selectedExplorer)
      setSelectedExplorerEvolutions(selectedExplorer.evolutions || [])
    } else {
      setSelectedExplorerInfo(null)
      setSelectedExplorerEvolutions([])
    }
  }

  const handleResponderChange = e => {
    const selectedAgentId = e.target.value
    setResponderAgent(selectedAgentId)
    const selectedResponder = agents.find(ag => ag._id === selectedAgentId)
    if (selectedResponder) {
      setSelectedResponderInfo(selectedResponder)
    } else {
      setSelectedResponderInfo(null)
    }
  }

  const handleBackroomType = e => {
    const backroomType = e.target.value
    setBackroomType(backroomType)
  }

  const handleTopic = e => {
    const backroomTopic = e.target.value
    setTopic(backroomTopic)
  }

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
    if (!backroomType) {
      errors.backroomType = 'Backroom Type is required'
      valid = false
    }
    if (explorerAgent === responderAgent) {
      errors.responderAgent = 'Explorer and Responder agents cannot be the same'
      errors.explorerAgent = 'Explorer and Responder agents cannot be the same'
      valid = false
    }
    if (topic?.trim().length > 1000) {
      errors.topic = 'Topic must be less than 1000 characters'
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
          explorerAgentId: explorerAgent,
          responderAgentId: responderAgent,
          backroomType,
          topic,
        }),
      })

      if (res.ok) {
        const newBackroom = await res.json()
        router.push(`/backrooms/${newBackroom._id}`)
      }
    } catch (error) {
      console.error('Error creating backroom:', error)
    } finally {
      setLoading(false)
    }
  }

  const LoadingOverlay = () => (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg="rgba(0, 0, 0, 0.8)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      zIndex="1000"
      color="#81d4fa"
    >
      <Spinner size="xl" thickness="4px" color="#81d4fa" mb={6} speed="0.8s" />
      <Text
        fontSize="2xl"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        mb={2}
      >
        {currentMessage}...
      </Text>
      <Text fontSize="md" color="#b0bec5">
        Please wait while we process your request.
      </Text>
    </Box>
  )

  return (
    <ChakraProvider>
      {loading && <LoadingOverlay />}
      <SEO
        title="Reality Spiral - Create a Backroom"
        description="Welcome to Reality Spiral, a platform to create, explore, and connect with agents and backrooms in the digital dimension."
        url="/"
      />
      <Box minHeight="100vh" bg="#424242" color="#e0e0e0">
        <Navigation />
        <Box py={10} px={6} maxW="2000px" mx="auto">
          <Flex justifyContent="space-between" alignItems="center" mb={5}>
            <Button
              leftIcon={<ArrowBackIcon />}
              colorScheme="blue"
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Heading
              textAlign="center"
              fontSize="4xl"
              color="#81d4fa"
              fontFamily="'Arial', sans-serif"
              flex="1"
            >
              Create a Backroom
            </Heading>
            <Box width="60px" />
          </Flex>

          <Flex
            direction={{ base: 'column', md: 'row' }}
            justifyContent="space-between"
            mb={6}
          >
            <Box
              width={{ base: '100%', md: '48%' }}
              mb={{ base: 4, md: 0 }}
              me={2}
            >
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
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
                {errors.explorerAgent && (
                  <FormErrorMessage>{errors.explorerAgent}</FormErrorMessage>
                )}
              </FormControl>

              {selectedExplorerInfo && (
                <Box
                  p={3}
                  bg="#2d2d2d"
                  border="1px solid"
                  borderColor="#757575"
                  borderRadius="md"
                  fontSize="sm"
                  maxHeight="150px"
                  overflowY="auto"
                  whiteSpace="pre-wrap"
                  mb={4}
                >
                  {selectedExplorerInfo.description}
                </Box>
              )}
            </Box>

            <Box
              width={{ base: '100%', md: '48%' }}
              mb={{ base: 4, md: 0 }}
              me={2}
            >
              <Heading size="md" mb={4} color="#81d4fa">
                Backroom Type
              </Heading>
              <FormControl invalid={Boolean(errors.backroomType)}>
                <Select
                  value={backroomType}
                  onChange={handleBackroomType}
                  placeholder="Select Conversation Type"
                >
                  {backroomTypes.map(type => (
                    <option
                      key={type.id}
                      value={type.id}
                      className="bg-gray-800"
                    >
                      {type.name}
                    </option>
                  ))}
                </Select>
                {errors.backroomType && (
                  <FormErrorMessage>{errors.backroomType}</FormErrorMessage>
                )}
              </FormControl>
              {backroomType && (
                <Box mt={4}>
                  <Text mb={4}>
                    <strong>Description:</strong>{' '}
                    {
                      backroomTypes.find(room => room.id === backroomType)
                        .description
                    }
                  </Text>
                </Box>
              )}
            </Box>

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
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
                {errors.responderAgent && (
                  <FormErrorMessage>{errors.responderAgent}</FormErrorMessage>
                )}
              </FormControl>

              {selectedResponderInfo && (
                <Box
                  p={3}
                  bg="#2d2d2d"
                  border="1px solid"
                  borderColor="#757575"
                  borderRadius="md"
                  fontSize="sm"
                  maxHeight="150px"
                  overflowY="auto"
                  whiteSpace="pre-wrap"
                  mb={4}
                >
                  {selectedResponderInfo.description}
                </Box>
              )}
            </Box>
          </Flex>

          <FormControl isInvalid={errors.topic}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              minWidth="150px"
              color="#81d4fa"
              mb={2}
            >
              Topic(s):
            </Text>
            <Textarea
              placeholder="Optional Topic(s):"
              value={topic}
              onChange={handleTopic}
              bg="#424242"
              color="#e0e0e0"
              border="2px solid"
              borderColor={'#757575'}
              _hover={{ borderColor: '#81d4fa' }}
              mb={4}
              minHeight="200px"
              p={4}
            />
            {errors.topic && (
              <FormErrorMessage mb={2}>{errors.topic}</FormErrorMessage>
            )}
          </FormControl>

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

          {selectedExplorerEvolutions.length > 0 && (
            <Box mt={8} width="100%">
              <Heading size="lg" mb={4} color="#81d4fa" textAlign="left">
                Evolution History for {selectedExplorerInfo?.name}
              </Heading>
              <Table
                variant="simple"
                size="lg"
                colorScheme="blue"
                width="100%"
                borderRadius="md"
                overflow="hidden"
              >
                <Thead
                  bg="#333"
                  borderTopRadius="md"
                  display={{ base: 'none', md: 'table-header-group' }}
                >
                  <Tr>
                    <Th color="#e0e0e0">Evolution</Th>
                    <Th
                      color="#e0e0e0"
                      display={{ base: 'none', md: 'table-cell' }}
                    >
                      Backroom
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedExplorerEvolutions.map((evolution, index) => (
                    <Tr
                      key={index}
                      as="a"
                      href={`/backrooms/${evolution?.backroomId}`}
                      _hover={{ bg: '#333', textDecoration: 'none' }}
                      cursor="pointer"
                      bg={index % 2 === 0 ? '#2d2d2d' : '#424242'}
                      display="flex"
                      flexDirection={{ base: 'column', md: 'row' }}
                      width="100%"
                      p={{ base: 4, md: 0 }}
                      alignItems="center"
                    >
                      <Td
                        fontFamily="Arial, sans-serif"
                        color="#e0e0e0"
                        p={{ base: 2, md: 4 }}
                        width="100%"
                        whiteSpace="pre-line"
                        borderBottom="none"
                      >
                        {evolution.description}
                      </Td>
                      <Td
                        fontFamily="Arial, sans-serif"
                        color="#81d4fa"
                        textAlign="center"
                        display={{ base: 'none', md: 'table-cell' }}
                        fontWeight="bold"
                        p={4}
                        width="200px"
                      >
                        View Backroom
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
