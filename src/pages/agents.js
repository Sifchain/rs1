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
  Button,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import withMetaMaskCheck from '../components/withMetaMaskCheck'
import { useRouter } from 'next/router'
import { FiCalendar } from 'react-icons/fi'

function ViewAgents() {
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentBackroomConversations, setRecentBackroomConversations] =
    useState([])
  const [backroomTags, setBackroomTags] = useState([])
  const router = useRouter()
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
      setBackroomTags(Array.from(new Set(tagsFromConversations))) // Remove duplicate tags
    } catch (error) {
      console.error('Error fetching recent backroom conversations:', error)
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
              fontSize="4xl"
              color="#2980b9"
              fontFamily="'Arial', sans-serif"
            >
              Agents
            </Heading>
            <Button
              colorScheme="blue"
              onClick={() => router.push('/create-agent')} // Redirect to create a backroom page
              size="md"
              fontWeight="bold"
            >
              + New Agent
            </Button>
          </Flex>
          {/* Dropdown to select agent */}
          <Flex direction="column" mb={8} alignItems="start">
            <Select
              placeholder="Select Agent"
              onChange={handleAgentSelection}
              maxW="200px"
              bg="#ffffff"
              color="#34495e"
              border="2px solid #ecf0f1"
              _hover={{ borderColor: '#3498db' }}
            >
              {agents.map(agent => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </Select>
          </Flex>

          {/* Display agent details */}
          {selectedAgent && (
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

export default withMetaMaskCheck(ViewAgents)
