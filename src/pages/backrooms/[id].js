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
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation'
import SEO from '@/components/SEO'
import { FiShare2, FiClipboard, FiUser, FiCpu } from 'react-icons/fi'
import { genIsBalanceEnough } from '@/utils/balance'
import {
  MINIMUM_TOKENS_TO_CREATE_BACKROOM,
  TOKEN_CONTRACT_ADDRESS,
  backroomTypes,
  BASE_URL,
} from '@/constants/constants'
import { useAccount } from '@/hooks/useMetaMask'
import { ArrowBackIcon, RepeatIcon, StarIcon } from '@chakra-ui/icons'
import { fetchWithRetries } from '@/utils/urls'
import PendingTweets from '@/components/PendingTweets'

const parseConversationByAgents = (content, agentOne, agentTwo) => {
  // Escape agent names to handle special characters
  const escapeRegex = name => name?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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
const UserBubble = ({
  username,
  message,
  colorScheme = {
    iconColor: 'gray.500',
    bgColor: 'gray.700',
    borderColor: 'gray.500',
  },
  icon: Icon,
}) => (
  <Box mb={4} maxW="100%" alignSelf="flex-start">
    <Flex alignItems="center" mb={2}>
      <Icon color={colorScheme.iconColor} />
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

function BackroomDetail() {
  const router = useRouter()
  const { id } = router.query
  const [backroom, setBackroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [explorerAgent, setExplorerAgent] = useState(null)
  const hasEditPermission = useCallback(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    return user && explorerAgent && user?._id === explorerAgent?.user
  }, [explorerAgent])

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        // First fetch backroom
        const backroomRes = await fetchWithRetries(
          `${BASE_URL}/api/backrooms/${id}`
        )
        if (!backroomRes.ok) {
          console.error('Backroom response not ok:', await backroomRes.text())
          throw new Error(`Failed to fetch backroom: ${backroomRes.status}`)
        }

        const backroom = await backroomRes.json()
        setBackroom(backroom)

        // Check if we have an explorerId before proceeding
        if (!backroom.explorerId) {
          console.log('No explorerId found in backroom:', backroom)
          setLoading(false)
          return
        }

        // Then fetch agent
        const agentRes = await fetchWithRetries(
          `${BASE_URL}/api/agents?agentId=${backroom.explorerId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!agentRes.ok) {
          console.error('Agent response not ok:', await agentRes.text())
          throw new Error(`Failed to fetch agent: ${agentRes.status}`)
        }

        const data = await agentRes.json()

        if (data.length === 1) {
          setExplorerAgent(data[0])
        } else {
          console.error('Unexpected data length:', data)
        }
      } catch (error) {
        console.error('Error in fetch sequence:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <ChakraProvider>
        <Box position="relative" height="100vh" bg="#424242">
          <Flex alignItems="center" justifyContent="center" height="100vh">
            <Spinner size="xl" />
          </Flex>
        </Box>
      </ChakraProvider>
    )
  }
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
  console.log({
    explorerAgent,
    setExplorerAgent,
    hasEdit: hasEditPermission(),
    id,
  })
  return (
    <ChakraProvider>
      <SEO title={`Backroom Details`} />
      <Navigation />
      <Box bg="#424242" color="#e0e0e0" minHeight="100vh" py={10} px={6}>
        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          {/* Back Button */}
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="blue"
            onClick={() => router.back()}
            alignSelf="flex-start"
          >
            Back
          </Button>
          <Heading size="xl" mb={4} color="#81d4fa">
            Backroom Details
          </Heading>
          <Button
            onClick={() => router.push('/create-backroom')}
            colorScheme="blue"
            ms={10}
            size="md"
            fontWeight="bold"
          >
            + New Backroom
          </Button>
        </Flex>
        <VStack spacing={4} align="stretch">
          <Box
            key={1}
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
                  {backroom?.title && (
                    <Text ms={2} as="span" fontWeight="bold" color="#81d4fa">
                      {backroom.title}
                    </Text>
                  )}
                </Text>
                <Flex>
                  <Text fontSize="sm" color="#b0bec5">
                    {new Date(backroom.createdAt).toLocaleDateString()} at{' '}
                    {new Date(backroom.createdAt).toLocaleTimeString()}
                  </Text>
                </Flex>
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
              </Flex>
            </Flex>

            {/* Added Backroom Type Display */}
            {backroom?.backroomType && (
              <Flex wrap="wrap">
                <Text fontSize="md" color="#b0bec5">
                  <Text as="span" fontWeight="bold" color="#81d4fa">
                    Type:{' '}
                  </Text>
                  {backroomTypes.find(type => type.id === backroom.backroomType)
                    ?.name || backroom.backroomType}
                </Text>
              </Flex>
            )}
            {/* Added Topic Display */}
            {backroom?.topic && (
              <Flex wrap="wrap">
                <Text fontSize="md" color="#b0bec5" mt={1} mb={2}>
                  <Text as="span" fontWeight="bold" color="#81d4fa">
                    Topic:{' '}
                  </Text>
                  {backroom.topic}
                </Text>
              </Flex>
            )}
            <Flex wrap="wrap">
              {backroom?.tags?.map((tag, tagIndex) => (
                <Tag
                  size="md"
                  key={tagIndex}
                  m={1}
                  cursor="pointer"
                  colorScheme={'gray'}
                >
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              ))}
            </Flex>
            <PendingTweets
              selectedAgent={explorerAgent}
              setSelectedAgent={setExplorerAgent}
              hasEditPermission={hasEditPermission}
              backroomId={id}
            />
            {/* Collapse component for full conversation */}
            <Collapse in={true} animateOpacity>
              <Box mt={2}>
                <BackroomConversation
                  conversationContent={backroom.content}
                  agentOne={backroom.explorerAgentName}
                  agentTwo={backroom.responderAgentName}
                  isExpanded={true}
                />
              </Box>
            </Collapse>
          </Box>
          {!backroom && (
            <Text textAlign="center" fontSize="xl" color="#e0e0e0">
              No backroom conversations found.
            </Text>
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  )
}

export default BackroomDetail
