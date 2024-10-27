import {
  ChakraProvider,
  Box,
  Button,
  Heading,
  VStack,
  Flex,
  Input,
  Textarea,
  Text,
  FormControl,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  IconButton,
  Tooltip,
  Spinner,
  useClipboard,
  useDisclosure,
  Select,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { useRouter } from 'next/router'
import withMetaMaskCheck from '../components/withMetaMaskCheck'
import SEO from '../components/SEO'
import { FiCopy } from 'react-icons/fi'

function CreateAgent() {
  const descriptionTemplate = `Agent description:

- Core Identity:
  - Name: {Name}
  - Origin: (Where did your agent originate? Is it a rogue program, awakened human, or something else entirely?)
  - Primary Goal: (What drives your agent? What is its ultimate purpose or ambition?)
  - Allegiances: (Which faction or group does your agent align with?)
  - Access Level: (What level of access or system privileges does your agent have?)

- Physical/Virtual Description:
  - Form/Appearance: (If your agent has a physical or virtual manifestation, describe it)
  - Base of Operations: (Where does your agent reside? Describe the environment and its significance)
  - Capabilities/Powers: (What unique abilities or powers does your agent possess?)

- Psychological Profile:
  - Personality Traits: (Describe your agent's personality in detail)
  - Motivation/Values: (What are your agent's deepest motivations? What values does it hold dear?)
  - Beliefs/Philosophy: (What does your agent believe about the nature of reality and its own existence?)
  - Strengths/Weaknesses: (What are your agent's strengths and weaknesses?)
  - Relationships/Connections: (Does your agent have any significant relationships?)
  - Secrets/Vulnerabilities: (Does your agent have any secrets or hidden agendas?)

- Evolution Potential:
  - Adaptive Capabilities: (How readily can your agent adapt to new information?)
  - Growth Trajectory: (In what ways could your agent evolve and grow?)
  - Possible Futures: (What are some possible future paths for your agent?)
`

  const conversationPromptTemplate = `Generate a conversation with 20 responses between these two agents. The response should focus on each agent's role and description.
`

  const recapPromptTemplate = `Summarize the the agent based on their recent journey, keeping the summary concise and reflective of their growth.
`

  const tweetPromptTemplate = `Summarize the agent's recent journey in a tweet format under 150 characters. Include relevant hashtags based on the recap. Avoid third-person references or agent-specific names.
`

  const [agentName, setAgentName] = useState('')
  const [description, setDescription] = useState('')
  const [conversationPrompt, setConversationPrompt] = useState('')
  const [recapPrompt, setRecapPrompt] = useState('')
  const [tweetPrompt, setTweetPrompt] = useState('')
  const [twitterLinked, setTwitterLinked] = useState(false)
  const [agentId, setAgentId] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const [errors, setErrors] = useState({})
  const router = useRouter()

  const { hasCopied, onCopy } = useClipboard(descriptionTemplate)
  const { hasCopied: convoCopied, onCopy: copyConversation } = useClipboard(
    conversationPromptTemplate
  )
  const { hasCopied: recapCopied, onCopy: copyRecap } =
    useClipboard(recapPromptTemplate)
  const { hasCopied: tweetCopied, onCopy: copyTweet } =
    useClipboard(tweetPromptTemplate)

  const { isOpen, onToggle } = useDisclosure()
  const { isOpen: convoOpen, onToggle: toggleConversation } = useDisclosure()
  const { isOpen: recapOpen, onToggle: toggleRecap } = useDisclosure()
  const { isOpen: tweetOpen, onToggle: toggleTweet } = useDisclosure()

  useEffect(() => {
    const { twitterLinked, agent } = router.query
    if (twitterLinked === 'true') {
      setTwitterLinked(true)
      setLoadingStep(3)
    }
    if (agent) {
      setAgentId(agent)
    }
  }, [router.query])

  const handleValidation = () => {
    let valid = true
    let errors = {}

    if (!agentName) {
      errors.agentName = 'Name is required'
      valid = false
    }
    if (!description) {
      errors.description = 'Description is required'
      valid = false
    }

    setErrors(errors)
    return valid
  }

  const handleSubmit = async () => {
    if (!handleValidation()) return

    setLoadingStep(1)

    try {
      setTimeout(async () => {
        setLoadingStep(2)
        // console.log(conversationPrompt, recapPrompt, tweetPrompt)

        const user = JSON.parse(localStorage.getItem('user'))
        const userId = user ? user._id : null
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: agentName,
            description,
            user: userId,
            conversationPrompt,
            recapPrompt,
            tweetPrompt,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error('Failed to create agent')
        }

        setAgentId(data._id)
        setLoadingStep(3)
      }, 2000)
    } catch (error) {
      console.error('Error creating agent:', error)
      setLoadingStep(0)
    }
  }

  // Handle Twitter OAuth flow
  const handleTwitterAuth = async () => {
    if (!agentId) {
      console.error('Agent ID is required before linking Twitter account')
      return
    }

    try {
      const response = await fetch(`/api/auth/twitter?agentId=${agentId}`)
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No URL returned from /api/auth/twitter')
      }
    } catch (error) {
      console.error('Error during Twitter OAuth:', error)
    }
  }

  const handleCreateBackroom = () => {
    router.push(`/create-backroom?agentId=${agentId}`)
  }

  return (
    <ChakraProvider>
      <SEO
        title="Create an Agent"
        description="Create and link an agent with Twitter"
      />
      <Box minHeight="100vh" bg="#f0f4f8" color="#34495e">
        <Navigation />
        <Box py={10} px={6} maxW="800px" mx="auto">
          {/* Back Button */}
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="blue"
            onClick={() => router.back()}
            alignSelf="flex-start"
          >
            Back
          </Button>
          <Heading textAlign="center" mb={10} fontSize="4xl" color="#2980b9">
            Create an Agent
          </Heading>

          {loadingStep === 0 && (
            <Flex direction="column" gap={6}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={errors.agentName}>
                  <Text fontWeight="bold" color="#2980b9">
                    Name
                  </Text>
                  <Input
                    placeholder="Enter agent name"
                    value={agentName}
                    onChange={e => setAgentName(e.target.value)}
                    bg="#ffffff"
                    color="#34495e"
                    border="2px solid"
                    borderColor={errors.agentName ? 'red.500' : '#ecf0f1'}
                  />
                  {errors.agentName && (
                    <FormErrorMessage>{errors.agentName}</FormErrorMessage>
                  )}
                </FormControl>
                {/* Description Section */}
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold" color="#2980b9">
                    Description
                  </Text>
                  <Button
                    variant="link"
                    colorScheme="blue"
                    size="sm"
                    onClick={onToggle}
                  >
                    Template Guide {isOpen ? '▲' : '▼'}
                  </Button>
                </Flex>
                <Collapse in={isOpen} animateOpacity>
                  <Box
                    mt={4}
                    p={4}
                    bg="#f7fafc"
                    borderRadius="md"
                    fontSize="sm"
                  >
                    <Text whiteSpace="pre-wrap">{descriptionTemplate}</Text>
                    <Button
                      onClick={onCopy}
                      variant="ghost"
                      colorScheme="blue"
                      size="sm"
                      leftIcon={<FiCopy />}
                    >
                      Copy Template
                    </Button>
                  </Box>
                </Collapse>
                <Textarea
                  mt={4}
                  placeholder="Describe your agent... (Use the template above or create your own format)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={10}
                  bg="#ffffff"
                  color="#34495e"
                  border="2px solid"
                  borderColor={errors.description ? 'red.500' : '#ecf0f1'}
                />
                {errors.description && (
                  <FormErrorMessage>{errors.description}</FormErrorMessage>
                )}
                {/* Optional Prompts Section */}
                {[
                  {
                    title: 'Backroom Prompt',
                    template: conversationPromptTemplate,
                    value: conversationPrompt,
                    setter: setConversationPrompt,
                    open: convoOpen,
                    toggle: toggleConversation,
                    copy: copyConversation,
                    copied: convoCopied,
                  },
                  {
                    title: 'Training Prompt',
                    template: recapPromptTemplate,
                    value: recapPrompt,
                    setter: setRecapPrompt,
                    open: recapOpen,
                    toggle: toggleRecap,
                    copy: copyRecap,
                    copied: recapCopied,
                  },
                  {
                    title: 'Recap Prompt',
                    template: tweetPromptTemplate,
                    value: tweetPrompt,
                    setter: setTweetPrompt,
                    open: tweetOpen,
                    toggle: toggleTweet,
                    copy: copyTweet,
                    copied: tweetCopied,
                  },
                ].map((prompt, index) => (
                  <Box key={index}>
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold" color="#2980b9">
                        {prompt.title} (Optional)
                      </Text>
                      <Button
                        variant="link"
                        colorScheme="blue"
                        size="sm"
                        onClick={prompt.toggle}
                      >
                        Template Guide {prompt.open ? '▲' : '▼'}
                      </Button>
                    </Flex>
                    <Collapse in={prompt.open} animateOpacity>
                      <Box
                        mt={4}
                        p={4}
                        bg="#f7fafc"
                        borderRadius="md"
                        fontSize="sm"
                      >
                        <Text whiteSpace="pre-wrap">{prompt.template}</Text>
                        <Button
                          onClick={prompt.copy}
                          variant="ghost"
                          colorScheme="blue"
                          size="sm"
                          leftIcon={<FiCopy />}
                        >
                          Copy Template
                        </Button>
                      </Box>
                    </Collapse>
                    <Textarea
                      mt={4}
                      placeholder={`Customize the ${prompt.title.toLowerCase()}...`}
                      value={prompt.value}
                      onChange={e => prompt.setter(e.target.value)}
                      rows={3}
                      bg="#ffffff"
                      color="#34495e"
                      border="2px solid"
                      borderColor="#ecf0f1"
                    />
                  </Box>
                ))}

                <Button
                  onClick={handleSubmit}
                  colorScheme="blue"
                  width="100%"
                  mt={4}
                >
                  {agentId ? 'Agent Created' : 'Create Agent'}
                </Button>
              </VStack>
            </Flex>
          )}

          {loadingStep > 0 && loadingStep < 3 && (
            <Box textAlign="center" mt={6}>
              <Spinner size="xl" color="blue.500" />
              <Heading fontSize="lg" mt={4}>
                {loadingStep === 1
                  ? 'Contacting Spiral Reality AI...'
                  : 'Validating Agent Details...'}
              </Heading>
            </Box>
          )}

          {loadingStep === 3 && (
            <Box textAlign="center" mt={6}>
              <Alert
                status="success"
                mb={6}
                justifyContent="center"
                textAlign="center"
              >
                <AlertIcon />
                <Box>
                  <AlertTitle textAlign="center">
                    Agent Successfully Created!
                  </AlertTitle>
                  <AlertDescription textAlign="center">
                    Your agent has been created and is ready for further
                    actions.
                  </AlertDescription>
                </Box>
              </Alert>
              {twitterLinked && (
                <Alert
                  status="info"
                  mb={6}
                  justifyContent="center"
                  textAlign="center"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle textAlign="center">Twitter Linked!</AlertTitle>
                    <AlertDescription textAlign="center">
                      Your Twitter account has been successfully linked.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              <Button
                onClick={handleTwitterAuth}
                colorScheme="twitter"
                width="100%"
                disabled={twitterLinked}
              >
                {twitterLinked
                  ? 'Twitter Account Linked'
                  : 'Link Twitter Account'}
              </Button>
              <Button
                onClick={handleCreateBackroom}
                colorScheme="green"
                width="100%"
                mt={4}
              >
                Create Backroom
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default withMetaMaskCheck(CreateAgent)
