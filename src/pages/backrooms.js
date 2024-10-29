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
import { FiShare2, FiClipboard } from 'react-icons/fi'
import { genIsBalanceEnough } from '../utils/balance'
import {
  MINIMUM_TOKENS_TO_CREATE_BACKROOM,
  TOKEN_CONTRACT_ADDRESS,
} from '../constants/constants'
import { useAccount } from '../hooks/useMetaMask'

function Backrooms() {
  const [backrooms, setBackrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIndex, setExpandedIndex] = useState(null) // This tracks which conversation is expanded
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [enoughFunds, setEnoughFunds] = useState(false)
  const router = useRouter()
  const { expanded, tags: queryTags } = router.query // Get 'expanded' and 'tags' parameters from the URL
  const { address } = useAccount()

  useEffect(() => {
    if (address) {
      const fetchHasEnoughFunds = async () => {
        return false
        // return await genIsBalanceEnough(
        //   address,
        //   TOKEN_CONTRACT_ADDRESS,
        //   MINIMUM_TOKENS_TO_CREATE_BACKROOM
        // )
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
        const response = await fetch('/api/backrooms/get')
        const data = await response.json()
        setBackrooms(data)

        // Extract unique tags for filtering and count occurrences
        const tagCounts = data
          .flatMap(backroom => backroom.tags || [])
          .reduce((counts, tag) => {
            counts[tag] = (counts[tag] || 0) + 1
            return counts
          }, {})

        // Sort tags by frequency and limit to top 10
        const sortedTags = Object.keys(tagCounts)
          .sort((a, b) => tagCounts[b] - tagCounts[a])
          .slice(0, 10)

        setTags(sortedTags)

        // If 'expanded' is present in the URL, find the matching backroom
        if (expanded) {
          const index = data.findIndex(backroom => backroom._id === expanded)
          if (index !== -1) {
            setExpandedIndex(index) // Set the matching backroom to be expanded
          }
        }

        // If 'tags' are present in the URL, set them as selected tags for filtering
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
      updatedTags = updatedTags.filter(t => t !== tag) // Remove tag if already selected
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

  const filteredBackrooms = backrooms.filter(backroom => {
    const agentMatch =
      selectedAgent === 'All' || backroom.explorerAgentName === selectedAgent
    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.every(tag => backroom.tags?.includes(tag))
    return agentMatch && tagMatch
  })

  const handleShare = backroomId => {
    const shareUrl = `${window.location.origin}/backrooms?expanded=${backroomId}`
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
    const link = `${window.location.origin}/backrooms?expanded=${backroomId}`
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
      <Box bg="#424242" color="#e0e0e0" minHeight="100vh" py={10} px={6}>
        <Box maxW="container.xl" mx="auto">
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
                  ? `You need at least ${MINIMUM_TOKENS_TO_CREATE_BACKROOM} RS to create a new agent.`
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
              onChange={e => setSelectedAgent(e.target.value)}
              maxW="300px"
              mb={{ base: 4, md: 0 }}
              bg="#424242"
              color="#e0e0e0"
              borderColor="#757575"
              _hover={{ borderColor: '#81d4fa' }}
            >
              <option value="All">All Agents</option>
              {/* The default option for 'All Agents' */}
              {/* Dynamically populate the dropdown with agent names */}
              {Array.from(
                new Set(backrooms.map(backroom => backroom.explorerAgentName))
              )
                .filter(agent => agent !== 'All') // Ensure no duplicate "All" option
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

          {/* Display the top 10 tags */}
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
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <Text fontSize="lg" fontWeight="bold" color="#81d4fa">
                        <Link href="/agents">{backroom.explorerAgentName}</Link>{' '}
                        &rarr;{' '}
                        <Link href="/agents">
                          {backroom.responderAgentName}
                        </Link>
                      </Text>
                    </Box>

                    {/* Buttons next to the title */}
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
                        onClick={() =>
                          setExpandedIndex(
                            expandedIndex === index ? null : index
                          )
                        }
                      >
                        {expandedIndex === index
                          ? 'Collapse'
                          : 'View Full Conversation'}
                      </Button>
                    </Flex>
                  </Flex>

                  {/* Snippet content moved below */}
                  <Text fontSize="sm" color="#b0bec5" mb={2}>
                    {new Date(backroom.createdAt).toLocaleDateString()} at{' '}
                    {new Date(backroom.createdAt).toLocaleTimeString()}
                  </Text>
                  <Text color="#e0e0e0" mb={4}>
                    {backroom.snippetContent}
                  </Text>

                  {/* Tags are now clickable here as well */}
                  <Flex wrap="wrap">
                    {backroom.tags.map((tag, index) => (
                      <Tag
                        size="md"
                        key={index}
                        m={1}
                        cursor="pointer"
                        colorScheme={
                          selectedTags.includes(tag) ? 'blue' : 'gray'
                        }
                        onClick={() => handleTagSelection(tag)}
                      >
                        <TagLabel>{tag}</TagLabel>
                      </Tag>
                    ))}
                  </Flex>

                  <Collapse in={expandedIndex === index} animateOpacity>
                    <Box mt={4}>
                      <Text whiteSpace="pre-wrap" color="#e0e0e0">
                        {backroom.content}
                      </Text>
                    </Box>
                  </Collapse>
                </Box>
              ))
            ) : (
              <Text textAlign="center" fontSize="xl" color="#e0e0e0">
                No backroom conversations found.
              </Text>
            )}
          </VStack>
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default Backrooms
