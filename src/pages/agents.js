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
  useToast,
  List,
  ListItem,
  Collapse,
  IconButton,
} from '@chakra-ui/react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import withMetaMaskCheck from '../components/withMetaMaskCheck'
import { useRouter } from 'next/router'
import { FiCalendar, FiTrash2 } from 'react-icons/fi'
import { genIsBalanceEnough } from '../utils/balance'
import {
  MINIMUM_TOKENS_TO_CREATE_AGENT,
  TOKEN_CONTRACT_ADDRESS,
} from '../constants/constants'
import { useAccount } from '../hooks/useMetaMask'

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
  const { agentId } = router.query

  // Input state for editing agent details
  const [agentName, setAgentName] = useState('')
  const [description, setDescription] = useState('')
  const [conversationPrompt, setConversationPrompt] = useState('')
  const [recapPrompt, setRecapPrompt] = useState('')
  const [tweetPrompt, setTweetPrompt] = useState('')
  const [enoughFunds, setEnoughFunds] = useState(false)
  const { address } = useAccount()
  const toast = useToast() // Initialize useToast for notifications
  const [editTweetId, setEditTweetId] = useState(null) // State to track which tweet is being edited
  const [editTweetContent, setEditTweetContent] = useState('') // State to hold the edited tweet content
  const [wordCount, setWordCount] = useState(0)
  const [wordCountError, setWordCountError] = useState(false)
  const [backrooms, setBackrooms] = useState([])
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const handleEditTweet = (tweetId, tweetContent) => {
    setEditTweetId(tweetId)
    setEditTweetContent(tweetContent)
    setWordCount(countWords(tweetContent))
  }

  const countWords = text => {
    return text.trim().split(/\s+/).length
  }
  const handleCancelEdit = () => {
    setEditTweetId(null) // Clear edit state
    setEditTweetContent('') // Clear edited tweet content
    setWordCount(0) // Reset word count
    setWordCountError(false) // Clear error
  }
  // Fetch
  useEffect(() => {
    if (address) {
      const fetchHasEnoughFunds = async () => {
        return await genIsBalanceEnough(
          address,
          TOKEN_CONTRACT_ADDRESS,
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
    }
  }, [address, loading])

  // Fetch agents
  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents(data)

      // Automatically select agent if agentId is in the URL
      if (agentId) {
        selectAgentById(agentId, data)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to select agent by ID
  const selectAgentById = (id, agentsData = agents) => {
    const agent = agentsData.find(agent => agent._id === id)
    if (agent) {
      setSelectedAgent(agent)
      setAgentName(agent?.name)
      setDescription(agent?.description || '')
      setConversationPrompt(agent?.conversationPrompt || '')
      setRecapPrompt(agent?.recapPrompt || '')
      setTweetPrompt(agent?.tweetPrompt || '')
      setEditMode(false)

      // Fetch recent backroom conversations and other related data if necessary
      fetchRecentConversations(agent)
    }
  }

  // Fetch recent conversations for the selected agent
  const fetchRecentConversations = async agent => {
    try {
      const response = await fetch(
        `/api/backrooms?explorerAgentName=${agent.name}`
      )
      const data = await response.json()
      setRecentBackroomConversations(data)
    } catch (error) {
      console.error('Error fetching recent conversations:', error)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [agentId])

  const fetchBackrooms = async () => {
    try {
      const response = await fetch('/api/backrooms/get')
      const data = await response.json()
      setBackrooms(data)
    } catch (error) {
      console.error('Error fetching backrooms:', error)
    }
  }
  useEffect(() => {
    fetchAgents()
    fetchBackrooms()
  }, [])

  const handleAgentSelection = async event => {
    const agentId = event.target.value
    const agent = agents.find(agent => agent?._id === agentId)
    setSelectedAgent(agent)

    // Pre-fill the edit form
    setAgentName(agent?.name)
    setDescription(agent?.description || '') // Optional fields
    setConversationPrompt(agent?.conversationPrompt || '')
    setRecapPrompt(agent?.recapPrompt || '')
    setTweetPrompt(agent?.tweetPrompt || '')
    setEditMode(false) // Initially show agent details, not edit mode

    // Fetch recent backroom conversations related to this agent
    try {
      const response = await fetch(
        `/api/backrooms?explorerAgentName=${agent?.name}`
      )
      const data = await response.json()

      // Filter backrooms where the agent is involved as explorer or responder
      const filteredConversations = data.filter(
        backroom =>
          backroom.explorerId === agent?._id ||
          backroom.responderId === agent?._id
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

    // Agent Name Validation
    if (!agentName.trim()) {
      errors.agentName = 'Name is required'
      valid = false
    } else if (agentName.length < 3 || agentName.length > 50) {
      errors.agentName = 'Name should be between 3 and 50 characters'
      valid = false
    }

    // Description Validation
    if (!description.trim()) {
      errors.description = 'Description is required'
      valid = false
    } else if (description.length < 10 || description.length > 10000) {
      errors.description =
        'Description should be between 10 and 10000 characters'
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
          description,
          conversationPrompt,
          recapPrompt,
          tweetPrompt,
          agentId: selectedAgent._id,
          userId: JSON.parse(localStorage.getItem('user')),
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to update agent')
      }
      const agent = await response.json()
      const updatedAgent = {
        ...selectedAgent,
        name: agentName,
        description,
        conversationPrompt,
        recapPrompt,
        tweetPrompt,
      }
      setSelectedAgent(updatedAgent)
      setAgents(
        agents.map(agent =>
          agent._id === selectedAgent._id ? updatedAgent : agent
        )
      )
      setEditMode(false)
    } catch (error) {
      console.error('Error updating agent:', error)
    }
  }

  const handleParseDescription = text => {
    // Check if the description follows the expected format
    if (!text.includes('\n- ')) {
      return [{ title: 'Description', items: [text] }]
    }

    // Parse the structured format
    const sections = text.split(/\n- /).slice(1) // Split by each section title
    return sections.map(section => {
      const [title, ...content] = section.split('\n  - ') // Split by subsections
      const items = content.map(item => item.replace(/\s{2}-\s/, '')) // Clean up bullet indicators
      return { title, items }
    })
  }

  const displayJourney = evolutions => {
    if (!evolutions || evolutions.length === 0) {
      return <Text>No journey updates recorded.</Text>
    }

    return (
      <Box>
        <Text fontWeight="bold" mb={4}>
          Original Description:
        </Text>
        <Text mb={4}>{selectedAgent.originalDescription}</Text>
        {evolutions.map((evolution, index) => {
          const backroom = backrooms.find(
            backroom => backroom._id === evolution.backroomId
          )
          const responderAgent = agents.find(
            agent => agent._id === backroom.responderId
          )
          const responderAgentName = responderAgent?.name || 'Unknown'
          return (
            <Box key={index} mb={4}>
              <Text fontWeight="bold" color="#81d4fa">
                Conversation with {responderAgentName}
              </Text>
              <Text fontWeight="bold">Description: </Text>
              <Text>{evolution.description}</Text>
              <Text fontWeight="bold">Tags:</Text>
              <Text>{backroom.tags.join(', ')}</Text>
              <Text fontWeight="bold" mb={1}>
                <Link
                  color="#81d4fa"
                  href={`/backrooms?expanded=${evolution?.backroomId}`}
                >
                  View Backroom
                </Link>
              </Text>
            </Box>
          )
        })}
      </Box>
    )
  }

  const hasEditPermission = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    return user && selectedAgent && user._id === selectedAgent.user
  }

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
        bg="#424242"
        borderRadius="md"
        boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
        mb={3}
        cursor="pointer"
        onClick={() => router.push(`/backrooms?expanded=${backroom._id}`)}
      >
        <Text
          as="a"
          color="#64b5f6"
          textDecoration="underline"
          _hover={{ color: '#29b6f6' }}
          cursor="pointer"
        >
          {backroom.explorerAgentName} &rarr; {backroom.responderAgentName}
        </Text>
        <Text fontSize="sm" color="#b0bec5">
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

  const handleDiscardTweet = async tweetId => {
    if (window.confirm('Are you sure you want to discard this tweet?')) {
      try {
        const response = await fetch('/api/twitter/discardTweet', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: selectedAgent._id,
            tweetId,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          setSelectedAgent(data.agent)
          toast({
            title: 'Tweet Discarded',
            description: 'The tweet has been successfully discarded.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        } else {
          const error = await response.json()
          toast({
            title: 'Error',
            description:
              error.error || 'Failed to discard the tweet. Please try again.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
      } catch (error) {
        console.error('Error discarding tweet:', error)
        toast({
          title: 'Error',
          description: 'Failed to discard the tweet. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  const handleApproveTweet = async tweet => {
    try {
      const response = await fetch('/api/twitter/approveTweet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent._id,
          tweetId: tweet._id,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedAgent(data.agent)
        toast({
          title: 'Tweet Approved',
          description: 'The tweet has been successfully posted.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description:
            error.error || 'Failed to post the tweet. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error approving tweet:', error)
      toast({
        title: 'Error',
        description: 'Failed to post the tweet. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSaveEdit = async (tweetId, promptValue) => {
    try {
      const response = await fetch('/api/twitter/editTweet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent._id,
          tweetId,
          tweetContent: promptValue,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setEditTweetId(null) // Clear edit state
        setEditTweetContent('') // Clear edited tweet content
        setSelectedAgent(data.agent)
        toast({
          title: 'Tweet Updated',
          description: 'The tweet content has been updated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
          variant: 'subtle',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description:
            error.error || 'Failed to update the tweet. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error updating tweet:', error)
      toast({
        title: 'Error',
        description: 'Failed to update the tweet. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const displayPendingTweets = () => {
    if (selectedAgent?.pendingTweets?.length === 0) {
      return (
        <Text textAlign="center" fontSize="lg" color="#e0e0e0">
          No pending tweets.
        </Text>
      )
    }

    return (
      selectedAgent &&
      selectedAgent?.pendingTweets?.length > 0 && (
        <Box
          p={4}
          bg="#424242"
          borderRadius="lg"
          border="2px solid #757575"
          boxShadow="0 0 15px rgba(0, 0, 0, 0.2)"
          mb={4}
        >
          <Text fontSize="lg" fontWeight="bold" color="#81d4fa" mb={2}>
            Pending Tweets
          </Text>
          <VStack spacing={4} align="stretch">
            {selectedAgent?.pendingTweets?.map(tweet => (
              <Box
                key={tweet._id}
                border="2px solid #757575"
                p={3}
                borderRadius="md"
              >
                {editTweetId === tweet._id ? ( // Check if tweet is being edited
                  <Flex justifyContent="space-between" mb={2}>
                    <Textarea
                      value={editTweetContent}
                      onChange={e => {
                        setEditTweetContent(e.target.value)
                        setWordCount(countWords(e.target.value))
                        setWordCountError(false)
                      }}
                      placeholder="Edit tweet content"
                      bg="#424242"
                      color="#e0e0e0"
                      border="2px solid #757575"
                      resize="vertical"
                      minHeight="80px"
                    />
                    <Text fontSize="sm" color="#b0bec5" ml={2}>
                      {wordCount} / 280 words
                    </Text>
                    {wordCountError && (
                      <FormErrorMessage>
                        Tweet exceeds 280 words
                      </FormErrorMessage>
                    )}
                    <Tooltip
                      label={
                        !hasEditPermission()
                          ? `You have to be the owner of the agent to edit it`
                          : ''
                      }
                      hasArrow
                      placement="top"
                    >
                      <Box
                        as="span"
                        cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                      >
                        <Button
                          size="sm"
                          colorScheme="green"
                          isDisabled={!hasEditPermission()}
                          onClick={() => {
                            handleSaveEdit(tweet._id, editTweetContent)
                          }}
                          mr={2}
                        >
                          Save
                        </Button>
                      </Box>
                    </Tooltip>
                    <Tooltip
                      label={
                        !hasEditPermission()
                          ? `You have to be the owner of the agent to edit it`
                          : ''
                      }
                      hasArrow
                      placement="top"
                    >
                      <Box
                        as="span"
                        cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                      >
                        <Button
                          isDisabled={!hasEditPermission()}
                          size="sm"
                          colorScheme="blue"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Tooltip>
                  </Flex>
                ) : (
                  <Flex justifyContent="space-between" mb={2}>
                    <Text color="#e0e0e0">{tweet.tweetContent}</Text>
                    <Tooltip
                      label={
                        !hasEditPermission()
                          ? `You have to be the owner of the agent to edit it`
                          : ''
                      }
                      hasArrow
                      placement="top"
                    >
                      <Box
                        as="span"
                        cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                      >
                        <Button
                          isDisabled={!hasEditPermission()}
                          size="sm"
                          colorScheme="blue"
                          onClick={() =>
                            handleEditTweet(tweet._id, tweet.tweetContent)
                          }
                        >
                          Edit
                        </Button>
                      </Box>
                    </Tooltip>
                  </Flex>
                )}
                <Text fontSize="sm" color="#b0bec5" mb={2}>
                  Generated on: {new Date(tweet.createdAt).toLocaleString()}
                </Text>
                <Flex justifyContent="space-between" alignItems="center">
                  <Tooltip
                    label={
                      !hasEditPermission()
                        ? `You have to be the owner of the agent to edit it`
                        : ''
                    }
                    hasArrow
                    placement="top"
                  >
                    <Box
                      as="span"
                      cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                    >
                      <Button
                        size="sm"
                        isDisabled={!hasEditPermission()}
                        colorScheme="red"
                        onClick={() => handleDiscardTweet(tweet._id)}
                        leftIcon={<FiTrash2 />}
                      >
                        Discard
                      </Button>
                    </Box>
                  </Tooltip>
                  <Tooltip
                    label={
                      !hasEditPermission()
                        ? `You have to be the owner of the agent to edit it`
                        : ''
                    }
                    hasArrow
                    placement="top"
                  >
                    <Box
                      as="span"
                      cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                    >
                      <Button
                        size="sm"
                        isDisabled={!hasEditPermission()}
                        colorScheme="green"
                        onClick={() => handleApproveTweet(tweet)}
                      >
                        Approve and Post
                      </Button>
                    </Box>
                  </Tooltip>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      )
    )
  }
  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg="#424242" color="#e0e0e0">
        <Navigation />
        <Box py={10} px={6} maxW="2000px" mx="auto">
          <Flex justifyContent="space-between" alignItems="center" mb={1}>
            <Heading
              textAlign="center"
              mb={10}
              fontSize="4xl"
              color="#81d4fa"
              fontFamily="'Arial', sans-serif"
            >
              Agents
            </Heading>
            {/* Dropdown to select agent */}
            <Flex
              direction="row"
              mb={4}
              alignItems="center"
              justifyContent="center"
            >
              <Select
                placeholder="Select Agent"
                onChange={handleAgentSelection}
                maxW="400px"
                bg="#424242"
                color="#e0e0e0"
                border="2px solid #757575"
                _hover={{ borderColor: '#81d4fa' }}
              >
                {Array.isArray(agents) && agents.length > 0 ? (
                  agents.map(agent => (
                    <option key={agent?._id} value={agent?._id}>
                      {agent?.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No agents available</option>
                )}
              </Select>
              <Tooltip
                label={
                  !enoughFunds
                    ? `You need at least ${MINIMUM_TOKENS_TO_CREATE_AGENT} RSP to create a new agent.`
                    : ''
                }
                hasArrow
                placement="top"
              >
                <Box as="span" cursor={enoughFunds ? 'pointer' : 'not-allowed'}>
                  <Button
                    onClick={() => router.push('/create-agent')} // Disable click functionality
                    colorScheme="blue"
                    ms={10}
                    size="md"
                    fontWeight="bold"
                    isDisabled={!enoughFunds}
                  >
                    + New Agent
                  </Button>
                </Box>
              </Tooltip>
            </Flex>
          </Flex>
          {selectedAgent?.pendingTweets?.length > 0
            ? displayPendingTweets()
            : null}
          {/* Display agent details */}
          {selectedAgent && !editMode && (
            <VStack spacing={6} align="stretch">
              {/* Top Box with Agent Info */}
              <Box
                p={4}
                bg="#424242"
                borderRadius="lg"
                border="2px solid #757575"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.2)"
              >
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="#81d4fa">
                      {selectedAgent.name}
                    </Text>
                    {/* Display Parsed Description with "View Full Description" Button */}
                    <Box mt={3}>
                      <Text fontSize="lg" fontWeight="bold" color="#81d4fa">
                        Description
                      </Text>
                      <Collapse in={isDescriptionExpanded} startingHeight={200}>
                        {handleParseDescription(
                          selectedAgent.originalDescription ||
                            selectedAgent.description ||
                            'No description provided'
                        ).map((section, index) => (
                          <Box key={index} mt={4}>
                            <Text
                              fontSize="medium"
                              fontWeight="bold"
                              color="#81d4fa"
                            >
                              {section.title}
                            </Text>
                            <List spacing={2} mt={2} color="#e0e0e0">
                              {section.items.map((item, idx) => (
                                <ListItem key={idx}>
                                  <strong>{item.split(':')[0]}:</strong>{' '}
                                  {item.split(':').slice(1).join(':')}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        ))}
                      </Collapse>

                      {/* Collapse/Expand Button */}
                      <Box mt={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="solid"
                          onClick={() =>
                            setIsDescriptionExpanded(!isDescriptionExpanded)
                          }
                          alignSelf="flex-start" // Align the button to the left
                        >
                          {isDescriptionExpanded
                            ? 'Hide Full Description'
                            : 'View Full Description'}
                        </Button>
                      </Box>
                    </Box>

                    {/* Display All Tags */}
                    <Box mt={3}>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="#81d4fa"
                        mt={3}
                      >
                        Backroom Tags:
                      </Text>
                      <Box mt={2} mb={3}>
                        {backroomTags.length > 0 ? (
                          backroomTags.slice(-10).map((tag, index) => (
                            <Tag
                              size="md"
                              colorScheme="blue"
                              key={index}
                              mr={2}
                              mb={2}
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
                    <Tooltip
                      label={
                        !hasEditPermission()
                          ? `You have to be the owner of the agent to edit it`
                          : ''
                      }
                      hasArrow
                      placement="top"
                    >
                      <Box
                        as="span"
                        cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                      >
                        <Button
                          onClick={
                            hasEditPermission() ? handleEditClick : undefined
                          } // Disable click functionality
                          colorScheme="blue"
                          mb={4}
                          isDisabled={!hasEditPermission()} // Button looks disabled but can still be hovered for Tooltip
                          pointerEvents={hasEditPermission() ? 'auto' : 'none'} // Prevent clicking
                        >
                          Edit
                        </Button>
                      </Box>
                    </Tooltip>

                    <Flex alignItems="center" justifyContent="flex-end">
                      <Icon as={FiCalendar} mr={1} />
                      <Text fontSize="sm" color="#b0bec5" whiteSpace="nowrap">
                        Created: {new Date().toLocaleDateString()}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </Box>

              {/* Agent Journey */}
              <Box
                p={4}
                bg="#424242"
                borderRadius="lg"
                border="2px solid #757575"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.2)"
              >
                <Text fontSize="lg" fontWeight="bold" color="#81d4fa">
                  Agent Journey
                </Text>
                <Divider mb={4} />
                <Box mt={4}>{displayJourney(selectedAgent.evolutions)}</Box>
              </Box>

              {/* Recent Backroom Conversations */}
              <Box
                p={4}
                bg="#424242"
                borderRadius="lg"
                border="2px solid #757575"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.2)"
              >
                <Text fontSize="lg" fontWeight="bold" color="#81d4fa">
                  Recent Backroom Conversations
                </Text>
                <Divider mb={4} />
                {displayRecentBackrooms()}
              </Box>

              {/* Display Tweets */}
              <Box
                p={4}
                bg="#424242"
                borderRadius="lg"
                border="2px solid #757575"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.2)"
              >
                <Text fontSize="lg" fontWeight="bold" color="#81d4fa">
                  Tweets
                </Text>
                {selectedAgent.tweets && selectedAgent.tweets.length > 0 ? (
                  selectedAgent.tweets.map((tweetUrl, index) => (
                    <Box key={index} mb={3}>
                      <Link href={tweetUrl} isExternal color="#64b5f6">
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
                bg="#424242"
                borderRadius="lg"
                border="2px solid #757575"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.2)"
              >
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
                    Edit Agent Details
                  </Heading>

                  {/* Spacer to keep the heading centered */}
                  <Box width="60px" />
                </Flex>
                {/* Name */}
                <FormControl isInvalid={errors.agentName}>
                  <Flex alignItems="center" mb={4}>
                    {/* Label */}
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      minWidth="150px"
                      color="#81d4fa"
                    >
                      Name:
                    </Text>
                    {/* Input */}
                    <Input
                      placeholder="Name"
                      value={agentName}
                      onChange={e => setAgentName(e.target.value)}
                      bg="#424242"
                      color="#e0e0e0"
                      border="2px solid"
                      borderColor={errors.agentName ? 'red.500' : '#757575'}
                      _hover={{ borderColor: '#81d4fa' }}
                    />
                  </Flex>
                  {errors.agentName && (
                    <FormErrorMessage mb={4}>
                      {errors.agentName}
                    </FormErrorMessage>
                  )}
                </FormControl>
                {/* Description */}
                <FormControl isInvalid={errors.description}>
                  <Flex alignItems="center" mb={4}>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      minWidth="150px"
                      color="#81d4fa"
                    >
                      Description:
                    </Text>
                    <Textarea
                      placeholder="Description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      bg="#424242"
                      color="#e0e0e0"
                      border="2px solid"
                      borderColor={errors.description ? 'red.500' : '#757575'}
                      _hover={{ borderColor: '#81d4fa' }}
                      minHeight="500px"
                      p={4}
                    />
                  </Flex>
                  {errors.description && (
                    <FormErrorMessage mb={4}>
                      {errors.description}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <Flex justifyContent="flex-end" mt={4}>
                  <Button colorScheme="blue" onClick={handleUpdateAgent} mt={4}>
                    Update Agent
                  </Button>
                </Flex>
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
