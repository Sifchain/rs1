import {
  ChakraProvider,
  Box,
  Heading,
  Flex,
  Select,
  Text,
  VStack,
  Divider,
  Tag,
  TagLabel,
  Icon,
  Link,
  Input,
  Textarea,
  FormControl,
  FormErrorMessage,
  Button,
  Tooltip,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import withMetaMaskCheck from '../components/withMetaMaskCheck'
import { useRouter } from 'next/router'
import { FiCalendar } from 'react-icons/fi'
import { genIsBalanceEnough } from '../utils/balance'
import { MINIMUM_TOKENS_TO_CREATE_AGENT } from '../constants/constants'

function Agents() {
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentBackroomConversations, setRecentBackroomConversations] =
    useState([])
  const [backroomTags, setBackroomTags] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [errors, setErrors] = useState({})
  const router = useRouter()
  // Input state for editing agent details
  const [agentName, setAgentName] = useState('')
  const [traits, setTraits] = useState('')
  const [focus, setFocus] = useState('')
  const [enoughFunds, setEnoughFunds] = useState(false)

  useEffect(() => {
    const fetchHasEnoughFunds = async () => {
      return await genIsBalanceEnough(
        '0xF14F2c49aa90BaFA223EE074C1C33b59891826bF',
        '0x96c0a8B63C5E871ff6465f32d990e52bD36F3edc',
        MINIMUM_TOKENS_TO_CREATE_AGENT
      )
    }
    fetchHasEnoughFunds()
      .then(hasEnoughFunds => {
        setEnoughFunds(hasEnoughFunds)
      })
      .catch(error => {
        console.error('Error checking balance:', error)
      })
  }, [])
  // Fetch agents
  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents(data)
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchAgents()
  }, [])

  const handleAgentSelection = async event => {
    const agentId = event.target.value
    const agent = agents.find(agent => agent._id === agentId)
    setSelectedAgent(agent)
    // Pre-fill the edit form
    setAgentName(agent.name)
    setTraits(agent.traits)
    setFocus(agent.focus)
    setEditMode(false) // Initially show agent details, not edit mode

    // Fetch recent backroom conversations related to this agent
    try {
      const response = await fetch(`/api/backrooms?agentName=${agent.name}`)
      const data = await response.json()

      // Filter backrooms where the agent is involved as explorer or terminal
      const filteredConversations = data.filter(
        backroom =>
          backroom.explorerAgentName === agent.name ||
          backroom.terminalAgentName === agent.name
      )
      setRecentBackroomConversations(filteredConversations)

      // Extract tags from these conversations
      const tagsFromConversations = filteredConversations.flatMap(
        backroom => backroom.tags || []
      )
      setBackroomTags(Array.from(new Set(tagsFromConversations))) 
    } catch (error) {
      console.error('Error fetching recent backroom conversations:', error)
    }
  }

  const handleEditClick = () => {
    setEditMode(true)
  }
  const handleValidation = () => {
    let valid = true
    let errors = {}
    if (!agentName) {
      errors.agentName = 'Agent Name is required'
      valid = false
    }
    if (!traits) {
      errors.traits = 'Traits are required'
      valid = false
    }
    if (!focus) {
      errors.focus = 'Focus is required'
      valid = false
    }
    setErrors(errors)
    return valid
  }
  const handleUpdateAgent = async () => {
    if (!handleValidation()) return
    try {
      const response = await fetch(`/api/agents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agentName,
          traits,
          focus,
          agentId: selectedAgent._id,
          userId: JSON.parse(localStorage.getItem('user'))
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to update agent')
      }
      const agents = await response.json()
      const updatedAgent = { ...selectedAgent, name: agentName, traits, focus }
      setSelectedAgent(updatedAgent) 
      setEditMode(false)
      setAgents(agents)
    } catch (error) {
      console.error('Error updating agent:', error)
    }
  }

  const displayJourney = evolutions => {
    if (!evolutions || evolutions.length === 0) {
      return <Text>No journey updates recorded.</Text>
    }

    return evolutions.map((evolution, index) => (
      <Box key={index} mb={4}>
        <Text fontWeight="bold" color="#2980b9">
          Conversation with {selectedAgent.name}
        </Text>
        <Text fontFamily="'Arial', sans-serif" color="#34495e">
          {evolution}
        </Text>
      </Box>
    ))
  }
  
  const hasEditPermission = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && selectedAgent && user._id === selectedAgent.user;
  };

  const displayRecentBackrooms = () => {
    if (recentBackroomConversations.length === 0) {
      return <Text>No recent backroom conversations available.</Text>
    }

    return recentBackroomConversations.map((backroom, index) => (
      <Flex
        key={index}
        justifyContent="space-between"
        alignItems="center"
        p={3}
        bg="white"
        borderRadius="md"
        boxShadow="0 0 10px rgba(0, 0, 0, 0.05)"
        mb={3}
        cursor="pointer"
        onClick={() => router.push(`/backrooms?expanded=${backroom._id}`)}
      >
        <Text>Conversation with {backroom.terminalAgentName || 'Unknown'}</Text>
        <Text fontSize="sm" color="#7f8c8d">
          {new Date(backroom.createdAt).toLocaleDateString()}
        </Text>
      </Flex>
    ))
  }

  const handleTagClick = tag => {
    // Navigate to the backrooms page with the tag as a URL parameter
    const tagWithoutHash = tag.replace('#', '')
    router.push(`/backrooms?tags=${encodeURIComponent(tagWithoutHash)}`)
  }

  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg="#f0f4f8" color="#34495e">
        <Navigation />
        <Box py={10} px={6} maxW="1000px" mx="auto">
          <Flex justifyContent="space-between" alignItems="center" mb={10}>
            <Heading
              textAlign="center"
              mb={10}
              fontSize="4xl"
              color="#2980b9"
              fontFamily="'Arial', sans-serif"
            >
              Agents
            </Heading>
            <Tooltip
              label={`You need atleast ${MINIMUM_TOKENS_TO_CREATE_AGENT} to create a new agent.`}
              // isDisabled={!enoughFunds}
              hasArrow
              placement="top"
            >
              <Button
                // isDisabled={!enoughFunds} // Disable the button if the user doesn't have enough funds
                colorScheme="blue"
                onClick={() => router.push('/create-agent')} // Redirect to create an agent page
                size="md"
                fontWeight="bold"
              >
                + New Agent
              </Button>
            </Tooltip>
          </Flex>
          {/* Dropdown to select agent */}
          {/* Dropdown to select agent and Create Agent button */}
          <Flex direction="row" mb={8} alignItems="center" justifyContent="center" gap={4}>
            <Select
              placeholder="Select Agent"
              onChange={handleAgentSelection}
              maxW="400px"
              bg="#ffffff"
              color="#34495e"
              border="2px solid #ecf0f1"
              _hover={{ borderColor: '#3498db' }}
            >
              {Array.isArray(agents) && agents.length > 0 ? (
                agents.map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))
              ) : (
                <option disabled>No agents available</option>
              )}
            </Select>
          </Flex>


          {/* Display agent details */}
          {selectedAgent && !editMode && (
            <VStack spacing={6} align="stretch">
              {/* Top Box with Agent Info */}
              <Box
                p={4}
                bg="#ffffff"
                borderRadius="lg"
                border="2px solid #ecf0f1"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
              >
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="#2980b9">
                      {selectedAgent.name}
                    </Text>
                    <Tag size="lg" colorScheme="blue" mt={2}>
                      <TagLabel>
                        {selectedAgent.role || 'Explorer Role'}
                      </TagLabel>
                    </Tag>

                    {/* Display Focus */}
                    <Box mt={3}>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="#2980b9"
                        mt={3}
                      >
                        Focus:
                      </Text>
                      <Tag size="md" colorScheme="blue" mr={2}>
                        {selectedAgent.focus}
                      </Tag>
                    </Box>

                    {/* Display Traits */}
                    <Box mt={3}>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="#2980b9"
                        mt={3}
                      >
                        Traits:
                      </Text>
                      <Box mt={2}>
                        {selectedAgent.traits
                          .split(', ')
                          .map((trait, index) => (
                            <Tag
                              size="md"
                              colorScheme="gray"
                              key={index}
                              mr={2}
                            >
                              {trait}
                            </Tag>
                          ))}
                      </Box>
                    </Box>

                    {/* Display All Tags */}
                    <Box mt={3}>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="#2980b9"
                        mt={3}
                      >
                        Backroom Tags:
                      </Text>
                      <Box mt={2}>
                        {backroomTags.length > 0 ? (
                          backroomTags.map((tag, index) => (
                            <Tag
                              size="md"
                              colorScheme="blue"
                              key={index}
                              mr={2}
                              cursor="pointer"
                              onClick={() => handleTagClick(tag)}
                            >
                              {tag}
                            </Tag>
                          ))
                        ) : (
                          <Text>No tags available.</Text>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Box minWidth="120px" textAlign="right">
                    {/* Edit button */}
                    <Button disabled={!hasEditPermission()} colorScheme="blue" onClick={handleEditClick} mb={4}>
                      Edit
                    </Button>
                    <Flex alignItems="center" justifyContent="flex-end">
                      <Icon as={FiCalendar} mr={1} />
                      <Text fontSize="sm" color="#7f8c8d" whiteSpace="nowrap">
                        Created: {new Date().toLocaleDateString()}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </Box>

              {/* Agent Journey */}
              <Box
                p={4}
                bg="#ffffff"
                borderRadius="lg"
                border="2px solid #ecf0f1"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
              >
                <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                  Agent Description & Journey
                </Text>
                <Divider mb={4} />
                <Text color="#34495e">{selectedAgent.description}</Text>
                <Box mt={4}>{displayJourney(selectedAgent.evolutions)}</Box>
              </Box>

              {/* Recent Backroom Conversations */}
              <Box
                p={4}
                bg="#ffffff"
                borderRadius="lg"
                border="2px solid #ecf0f1"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
              >
                <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                  Recent Backroom Conversations
                </Text>
                <Divider mb={4} />
                {displayRecentBackrooms()}
              </Box>

              {/* Display Tweets */}
              <Box mt={10}>
                <Heading size="lg" mb={4}>
                  Tweets
                </Heading>
                {selectedAgent.tweets && selectedAgent.tweets.length > 0 ? (
                  selectedAgent.tweets.map((tweetUrl, index) => (
                    <Box key={index} mb={3}>
                      <Link href={tweetUrl} isExternal color="blue.500">
                        {tweetUrl}
                      </Link>
                    </Box>
                  ))
                ) : (
                  <Text>No tweets yet.</Text>
                )}
              </Box>
            </VStack>
          )}
          {/* Edit Agent Form */}
          {selectedAgent && editMode && (
            <VStack spacing={6} align="stretch">
              <Box
                p={4}
                bg="#ffffff"
                borderRadius="lg"
                border="2px solid #ecf0f1"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
              >
                <Heading fontSize="2xl" color="#2980b9" mb={4}>
                  Edit Agent Details
                </Heading>
                {/* Agent Name */}
                <FormControl isInvalid={errors.agentName}>
                  <Flex alignItems="center" mb={4}>
                    {/* Label */}
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      minWidth="150px"
                      color="#2980b9"
                    >
                      Agent Name:
                    </Text>
                    {/* Input */}
                    <Input
                      placeholder="Agent Name"
                      value={agentName}
                      onChange={e => setAgentName(e.target.value)}
                      bg="#ffffff"
                      color="#34495e"
                      border="2px solid"
                      borderColor={errors.agentName ? 'red.500' : '#ecf0f1'}
                      _hover={{ borderColor: '#3498db' }}
                    />
                  </Flex>
                  {errors.agentName && (
                    <FormErrorMessage>{errors.agentName}</FormErrorMessage>
                  )}
                </FormControl>
                {/* Traits */}
                <FormControl isInvalid={errors.traits}>
                  <Flex alignItems="center" mb={4}>
                    {/* Label */}
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      minWidth="150px"
                      color="#2980b9"
                    >
                      Traits:
                    </Text>
                    {/* Textarea */}
                    <Textarea
                      placeholder="Traits (e.g., Friendly, Curious, Adventurous)"
                      value={traits}
                      onChange={e => setTraits(e.target.value)}
                      bg="#ffffff"
                      color="#34495e"
                      border="2px solid"
                      borderColor={errors.traits ? 'red.500' : '#ecf0f1'}
                      _hover={{ borderColor: '#3498db' }}
                      p={4}
                    />
                  </Flex>
                  {errors.traits && (
                    <FormErrorMessage>{errors.traits}</FormErrorMessage>
                  )}
                </FormControl>
                {/* Focus */}
                <FormControl isInvalid={errors.focus}>
                  <Flex alignItems="center" mb={4}>
                    {/* Label */}
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      minWidth="150px"
                      color="#2980b9"
                    >
                      Focus:
                    </Text>
                    {/* Textarea */}
                    <Textarea
                      placeholder="Focus (e.g., AI Ethics, Cryptocurrency, Exploration)"
                      value={focus}
                      onChange={e => setFocus(e.target.value)}
                      bg="#ffffff"
                      color="#34495e"
                      border="2px solid"
                      borderColor={errors.focus ? 'red.500' : '#ecf0f1'}
                      _hover={{ borderColor: '#3498db' }}
                      p={4}
                    />
                  </Flex>
                  {errors.focus && (
                    <FormErrorMessage>{errors.focus}</FormErrorMessage>
                  )}
                  <Flex justifyContent="flex-end" mt={4}>
                    <Button
                      colorScheme="blue"
                      onClick={handleUpdateAgent}
                      mt={4}
                    >
                      Update Agent
                    </Button>
                  </Flex>
                </FormControl>
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
  )
}

export default withMetaMaskCheck(Agents)
