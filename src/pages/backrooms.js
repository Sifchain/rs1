import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  Spinner,
  Select,
  Input,
  Tag,
  TagLabel,
  Button,
  Collapse,
  IconButton,
  Tooltip,
  Link,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navigation from '../components/Navigation'
import SEO from '../components/SEO'
import { FiShare2, FiClipboard, FiUser, FiCpu } from 'react-icons/fi'
import { genIsBalanceEnough } from '../utils/balance'
import {
  MINIMUM_TOKENS_TO_CREATE_BACKROOM,
  TOKEN_CONTRACT_ADDRESS,
  backroomTypes,
} from '../constants/constants'
import { useAccount } from '../hooks/useMetaMask'

const parseConversationByAgents = (content, agentOne, agentTwo) => {
  // Escape agent names to handle special characters
  const escapeRegex = name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Define regex to match each agent's messages
  const agentRegex = new RegExp(
    `(${escapeRegex(agentOne)}|${escapeRegex(agentTwo)}):\\s*([\\s\\S]*?)(?=(?:${escapeRegex(agentOne)}|${escapeRegex(agentTwo)}):|$)`,
    'g'
  )

  const parsedContent = []
  let match

  // Helper function to clean up code block indicators
  const cleanMessage = message => {
    return message?.replace(/```(shell|bash)?\s*/g, '')?.trim()
  }

  // Loop through each match and assign it to the respective agent
  while ((match = agentRegex.exec(content)) !== null) {
    const username = match[1]?.trim() // Captures either agentOne or agentTwo
    let message = cleanMessage(match[2]?.trim()) // Clean up the message

    parsedContent.push({ username, message })
  }

  return parsedContent
}

// Component to render each message bubble
const UserBubble = ({ username, message, colorScheme, icon: Icon }) => (
  <Box mb={4} maxW="100%" alignSelf="flex-start">
    <Flex alignItems="center" mb={2}>
      <Icon color={colorScheme.iconColor} />{' '}
      {/* Use the icon passed in as a prop */}
      <Text fontWeight="bold" ml={2} color="#e0e0e0">
        {username}
      </Text>
    </Flex>
    <Box
      p={3}
      borderRadius="md"
      bg={colorScheme.bgColor}
      border="1px solid"
      borderColor={colorScheme.borderColor}
      color="white"
      whiteSpace="pre-wrap"
      fontFamily="monospace"
    >
      {message}
    </Box>
  </Box>
)

// Main component for displaying the conversation with alternating colors
const BackroomConversation = ({ conversationContent, agentOne, agentTwo }) => {
  const parsedMessages = parseConversationByAgents(
    conversationContent,
    agentOne,
    agentTwo
  )
  const userColors = {
    [agentOne]: {
      bgColor: 'green.700',
      borderColor: 'green.400',
      iconColor: '#4caf50',
    },
    [agentTwo]: {
      bgColor: 'blue.700',
      borderColor: 'blue.400',
      iconColor: '#81d4fa',
    },
  }

  return (
    <VStack p={4} spacing={4} align="stretch">
      {parsedMessages.map((entry, index) => (
        <UserBubble
          key={index}
          username={entry.username}
          message={entry.message}
          colorScheme={userColors[entry.username]}
          icon={entry.username === agentTwo ? FiCpu : FiUser}
        />
      ))}
    </VStack>
  )
}

// Main Backrooms Component

function Backrooms() {
  const [backrooms, setBackrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIndex, setExpandedIndex] = useState(null) // Tracks which conversation is expanded
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [enoughFunds, setEnoughFunds] = useState(false)
  const router = useRouter()
  const { expanded, tags: queryTags } = router.query // Get 'expanded' and 'tags' parameters from the URL
  const { address } = useAccount()

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
    const fetchBackrooms = async () => {
      try {
        const response = await fetch(
          'https://app.realityspiral.com/api/backrooms/get'
        )
        const data = await response.json()
        setBackrooms(data)
        // Handle tags and expanded states as before
        const tagCounts = (data ?? [])
          .flatMap(backroom => backroom.tags || [])
          .reduce((counts, tag) => {
            counts[tag] = (counts[tag] || 0) + 1
            return counts
          }, {})

        const sortedTags = Object.keys(tagCounts)
          .sort((a, b) => tagCounts[b] - tagCounts[a])
          .slice(0, 10)

        setTags(sortedTags)

        if (expanded) {
          const index = data.findIndex(backroom => backroom._id === expanded)
          if (index !== -1) setExpandedIndex(index)
        }

        if (queryTags) {
          const queryTagArray = queryTags
            .split(',')
            .map(tag => (tag.startsWith('#') ? tag : `#${tag}`))
          setSelectedTags(queryTagArray)
        }
      } catch (error) {
        console.error('Error fetching backrooms:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBackrooms()
  }, [expanded, queryTags])

  const handleTagSelection = tag => {
    let updatedTags = [...selectedTags]
    if (updatedTags.includes(tag)) {
      updatedTags = updatedTags?.filter(t => t !== tag) // Remove tag if already selected
    } else {
      updatedTags.push(tag) // Add tag if not selected
    }
    setSelectedTags(updatedTags)

    // Update the URL with the new tags selection
    const tagQueryString = updatedTags
      .map(tag => tag.replace('#', ''))
      .join(',')
    router.push(`/backrooms?tags=${tagQueryString}`)
  }

  const filteredBackrooms = backrooms?.filter(backroom => {
    const agentMatch =
      selectedAgent === '' || backroom.explorerAgentName === selectedAgent
    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.every(tag => backroom.tags?.includes(tag))
    const searchMatch =
      searchQuery === '' ||
      backroom.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      backroom.tags?.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return agentMatch && tagMatch && searchMatch
  })

  const handleShare = backroomId => {
    const shareUrl = `${window.location.origin}/backrooms/${backroomId}`
    if (navigator.share) {
      navigator
        .share({
          title: 'Check out this Backroom Conversation',
          url: shareUrl,
        })
        .catch(console.error)
    } else {
      // Fallback for older browsers
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!')
      })
    }
  }

  const handleCopyToClipboard = backroomId => {
    const link = `${window.location.origin}/backrooms/${backroomId}`
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!')
    })
  }

  if (loading) {
    return (
      <ChakraProvider>
        <SEO
          title="Reality Spiral - Explore Backrooms and Create Agents"
          description="Welcome to Reality Spiral, a platform to create, explore, and connect with agents and backrooms in the digital dimension."
          url="/"
        />
        <Box position="relative" height="100vh" bg="#424242">
          <Flex alignItems="center" justifyContent="center" height="100vh">
            <Spinner size="xl" />
          </Flex>
        </Box>
      </ChakraProvider>
    )
  }
  return (
    <ChakraProvider>
      <SEO
        title="Reality Spiral - Explore The Backrooms"
        description="Explore agent conversations and their evolving interactions."
        url="/"
      />
      <Navigation />
      <Box bg="#424242" color="#e0e0e0" minHeight="100vh" py={6} px={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={10}>
          <Heading
            textAlign="center"
            fontSize={{ base: '2xl', md: '4xl' }}
            color="#81d4fa"
            fontFamily="'Arial', sans-serif"
          >
            Backrooms
          </Heading>
          <Tooltip
            label={
              !enoughFunds
                ? `You need at least ${MINIMUM_TOKENS_TO_CREATE_BACKROOM} RSP to create a new agent.`
                : ''
            }
            hasArrow
            placement="top"
          >
            <Box as="span" cursor={enoughFunds ? 'pointer' : 'not-allowed'}>
              <Button
                onClick={() => router.push('/create-backroom')}
                colorScheme="blue"
                ms={10}
                size="md"
                fontWeight="bold"
                isDisabled={!enoughFunds}
              >
                + New Backroom
              </Button>
            </Box>
          </Tooltip>
        </Flex>

        <Flex
          justifyContent="space-between"
          mb={8}
          flexDirection={{ base: 'column', md: 'row' }}
        >
          <Select
            value={selectedAgent}
            onChange={e => {
              setSelectedAgent(e.target.value)
              setSearchQuery('') // Clear searchQuery on agent change
            }}
            maxW="300px"
            mb={{ base: 4, md: 0 }}
            bg="#424242"
            color="#e0e0e0"
            borderColor="#757575"
            _hover={{ borderColor: '#81d4fa' }}
          >
            <option value={''}>All Agents</option>
            {Array.from(
              new Set(backrooms.map(backroom => backroom.explorerAgentName))
            )
              .filter(agent => agent !== 'All')
              .map((agent, index) => (
                <option key={index} value={agent}>
                  {agent}
                </option>
              ))}
          </Select>

          <Input
            placeholder="Search conversations via hashtags"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            maxW="300px"
            bg="#424242"
            color="#e0e0e0"
            borderColor="#757575"
            _hover={{ borderColor: '#81d4fa' }}
          />
        </Flex>

        <Flex wrap="wrap" mb={8}>
          {tags.map((tag, index) => (
            <Tag
              size="md"
              key={index}
              m={1}
              cursor="pointer"
              colorScheme={selectedTags.includes(tag) ? 'blue' : 'gray'}
              onClick={() => handleTagSelection(tag)}
            >
              <TagLabel>{tag}</TagLabel>
            </Tag>
          ))}
        </Flex>

        <VStack spacing={6} align="stretch">
          {filteredBackrooms.length > 0 ? (
            filteredBackrooms.map((backroom, index) => (
              <Box
                key={index}
                p={4}
                bg="#424242"
                borderRadius="lg"
                border="2px solid #757575"
                boxShadow="0 0 15px rgba(0, 0, 0, 0.2)"
              >
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  pb="3"
                >
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" color="#81d4fa">
                      <Link
                        href={`/agents?agentId=${backroom.explorerId}`}
                        color="#64b5f6"
                        textDecoration="underline"
                        _hover={{ color: '#29b6f6' }}
                      >
                        {backroom.explorerAgentName}
                      </Link>
                      {' → '}
                      <Link
                        href={`/agents?agentId=${backroom.responderId}`}
                        color="#64b5f6"
                        textDecoration="underline"
                        _hover={{ color: '#29b6f6' }}
                      >
                        {backroom.responderAgentName}
                      </Link>
                    </Text>
                  </Box>

                  <Flex>
                    <Tooltip label="Share" hasArrow>
                      <IconButton
                        aria-label="Share Backroom"
                        icon={<FiShare2 />}
                        onClick={() => handleShare(backroom._id)}
                        colorScheme="blue"
                        variant="outline"
                        size="sm"
                        mr={2}
                      />
                    </Tooltip>
                    <Tooltip label="Copy Link" hasArrow>
                      <IconButton
                        aria-label="Copy Link"
                        icon={<FiClipboard />}
                        onClick={() => handleCopyToClipboard(backroom._id)}
                        colorScheme="blue"
                        variant="outline"
                        size="sm"
                        mr={2}
                      />
                    </Tooltip>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => {
                        router.push(`/backrooms/${backroom._id}`)
                      }}
                    >
                      View Full Conversation
                    </Button>
                  </Flex>
                </Flex>

                <Text fontSize="sm" color="#b0bec5" mb={2}>
                  {new Date(backroom.createdAt).toLocaleDateString()} at{' '}
                  {new Date(backroom.createdAt).toLocaleTimeString()}
                </Text>

                <Flex wrap="wrap">
                  {backroom.tags.map((tag, tagIndex) => (
                    <Tag
                      size="md"
                      key={tagIndex}
                      m={1}
                      cursor="pointer"
                      colorScheme={selectedTags.includes(tag) ? 'blue' : 'gray'}
                      onClick={() => handleTagSelection(tag)}
                    >
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  ))}
                </Flex>
                {/* Added Backroom Type Display */}
                {backroom?.backroomType && (
                  <Flex wrap="wrap">
                    <Text fontSize="md" color="#b0bec5" mt={1}>
                      <Text as="span" fontWeight="bold" color="#81d4fa">
                        Type:{' '}
                      </Text>
                      {backroomTypes.find(
                        type => type.id === backroom.backroomType
                      )?.name || backroom.backroomType}
                    </Text>
                  </Flex>
                )}
                {/* Added Topic Display */}
                {backroom?.topic && (
                  <Flex wrap="wrap">
                    <Text fontSize="md" color="#b0bec5" mt={2}>
                      <Text as="span" fontWeight="bold" color="#81d4fa">
                        Topic:{' '}
                      </Text>
                      {backroom.topic}
                    </Text>
                  </Flex>
                )}
              </Box>
            ))
          ) : (
            <Text textAlign="center" fontSize="xl" color="#e0e0e0">
              No backroom conversations found.
            </Text>
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  )
}

export default Backrooms
