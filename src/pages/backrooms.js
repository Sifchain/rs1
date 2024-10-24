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
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navigation from '../components/Navigation'
import SEO from '../components/SEO'
import { FiShare2, FiClipboard } from 'react-icons/fi'
import { genIsBalanceEnough } from '../utils/balance'
import { MINIMUM_TOKENS_TO_CREATE_BACKROOM } from '../constants/constants'

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
  useEffect(() => {
    const fetchHasEnoughFunds = async () =>
      await genIsBalanceEnough(
        '0xF14F2c49aa90BaFA223EE074C1C33b59891826bF',
        '0x96c0a8B63C5E871ff6465f32d990e52bD36F3edc',
        MINIMUM_TOKENS_TO_CREATE_BACKROOM
      )
    setEnoughFunds(fetchHasEnoughFunds())
  }, [])

  useEffect(() => {
    const fetchBackrooms = async () => {
      try {
        const response = await fetch('/api/backrooms')
        const data = await response.json()
        setBackrooms(data)

        // Extract unique tags for filtering and keep the # for display purposes
        const uniqueTags = Array.from(
          new Set(data.flatMap(backroom => backroom.tags || []))
        )
        setTags(uniqueTags)

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
      selectedAgent === 'All' || backroom.agentName === selectedAgent
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
        <Flex height="100vh" alignItems="center" justifyContent="center">
          <Spinner size="xl" />
        </Flex>
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
      <Box bg="#f0f4f8" color="#34495e" minHeight="100vh" py={10} px={6}>
        <Box maxW="container.xl" mx="auto">
          <Flex justifyContent="space-between" alignItems="center" mb={10}>
            <Heading
              textAlign="center"
              fontSize={{ base: '2xl', md: '4xl' }}
              color="#2980b9"
              fontFamily="'Arial', sans-serif"
            >
              Backrooms
            </Heading>
            <Tooltip
              label={`You need atleast ${MINIMUM_TOKENS_TO_CREATE_BACKROOM} to create a new agent.`}
              isDisabled={enoughFunds}
              hasArrow
              placement="top"
            >
              <Button
                disabled={!enoughFunds}
                colorScheme="blue"
                onClick={() => router.push('/create-backroom')} // Redirect to create a backroom page
                size="md"
                fontWeight="bold"
              >
                + New Backroom
              </Button>
            </Tooltip>
          </Flex>

          <Flex
            justifyContent="space-between"
            mb={8}
            flexDirection={{ base: 'column', md: 'row' }}
          >
            <Select
              placeholder="All Agents" // This is the default placeholder
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value)}
              maxW="300px"
              mb={{ base: 4, md: 0 }}
            >
              <option value="All">All Agents</option>{' '}
              {/* The default option for 'All Agents' */}
              {/* Dynamically populate the dropdown with agent names */}
              {Array.from(
                new Set(backrooms.map(backroom => backroom.agentName))
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
                  bg="#ffffff"
                  borderRadius="lg"
                  border="2px solid #ecf0f1"
                  boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                        {backroom.agentName} &rarr; {backroom.terminalAgentName}
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
                  <Text fontSize="sm" color="#7f8c8d" mb={2}>
                    {new Date(backroom.createdAt).toLocaleDateString()} at{' '}
                    {new Date(backroom.createdAt).toLocaleTimeString()}
                  </Text>
                  <Text color="#34495e" mb={4}>
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
                      <Text whiteSpace="pre-wrap">{backroom.content}</Text>
                    </Box>
                  </Collapse>
                </Box>
              ))
            ) : (
              <Text textAlign="center" fontSize="xl">
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
