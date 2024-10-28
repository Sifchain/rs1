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
import { genIsBalanceEnough } from '../utils/balance'
import {
  MINIMUM_TOKENS_TO_CREATE_AGENT,
  MINIMUM_TOKENS_TO_CREATE_BACKROOM,
  TOKEN_CONTRACT_ADDRESS,
} from '../constants/constants'
import { useAccount } from '../hooks/useMetaMask'

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
  const [enoughFunds, setEnoughFunds] = useState(true)
  const { address } = useAccount()

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

  useEffect(() => {
    if (address) {
      const fetchHasEnoughFunds = async () => {
        return false
        // return await genIsBalanceEnough(
        //   address,
        //   TOKEN_CONTRACT_ADDRESS,
        //   MINIMUM_TOKENS_TO_CREATE_AGENT
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
  }, [address, loadingStep])
  const handleValidation = () => {
    let valid = true
    let errors = {}

    // Validation for agent name
    if (!agentName.trim()) {
      errors.agentName = 'Name is required'
      valid = false
    } else if (agentName.length < 3 || agentName.length > 50) {
      errors.agentName = 'Name must be between 3 and 50 characters'
      valid = false
    }

    // Validation for description
    if (!description.trim()) {
      errors.description = 'Description is required'
      valid = false
    } else if (description.length < 10 || description.length > 10000) {
      errors.description = 'Description must be between 10 and 10000 characters'
      valid = false
    }

    // Optional field validation for conversationPrompt
    if (
      conversationPrompt.trim().length > 0 &&
      (conversationPrompt.length < 10 || conversationPrompt.length > 10000)
    ) {
      errors.conversationPrompt =
        'Backroom prompt must be between 10 and 10000 characters'
      valid = false
    }

    // Optional field validation for recapPrompt
    if (
      recapPrompt.trim().length > 0 &&
      (recapPrompt.length < 10 || recapPrompt.length > 10000)
    ) {
      errors.recapPrompt =
        'Recap prompt must be between 10 and 10000 characters'
      valid = false
    }

    // Optional field validation for tweetPrompt
    if (
      tweetPrompt.trim().length > 0 &&
      (tweetPrompt.length < 10 || tweetPrompt.length > 10000)
    ) {
      errors.tweetPrompt =
        'Tweet prompt must be between 10 and 10000 characters'
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
      <Box minHeight="100vh" bg="#424242" color="#e0e0e0">
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
          <Heading textAlign="center" mb={10} fontSize="4xl" color="#81d4fa">
            Create an Agent
          </Heading>

          {loadingStep === 0 && (
            <Flex direction="column" gap={6}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={errors.agentName}>
                  <Text fontWeight="bold" color="#81d4fa">
                    Name
                  </Text>
                  <Input
                    placeholder="Enter agent name"
                    value={agentName}
                    onChange={e => setAgentName(e.target.value)}
                    bg="#424242"
                    color="#e0e0e0"
                    border="2px solid"
                    borderColor={errors.agentName ? 'red.500' : '#757575'}
                  />
                  {errors.agentName && (
                    <FormErrorMessage>{errors.agentName}</FormErrorMessage>
                  )}
                </FormControl>
                {/* Description Section */}
                <FormControl isInvalid={errors.description}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold" color="#81d4fa">
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
                      bg="#424242"
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
                    bg="#424242"
                    color="#e0e0e0"
                    border="2px solid"
                    borderColor={errors.description ? 'red.500' : '#757575'}
                  />
                  {errors.description && (
                    <FormErrorMessage>{errors.description}</FormErrorMessage>
                  )}
                </FormControl>
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
                    error: errors.conversationPrompt,
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
                    error: errors.recapPrompt,
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
                    error: errors.tweetPrompt,
                  },
                ].map((prompt, index) => (
                  <Box key={index}>
                    <FormControl isInvalid={prompt.error}>
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold" color="#81d4fa">
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
                          bg="#424242"
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
                        bg="#424242"
                        color="#e0e0e0"
                        border="2px solid"
                        borderColor="#757575"
                      />
                      {prompt.error && (
                        <FormErrorMessage>{prompt.error}</FormErrorMessage>
                      )}
                    </FormControl>
                  </Box>
                ))}
                <Tooltip
                  label={
                    !enoughFunds
                      ? `You need at least ${MINIMUM_TOKENS_TO_CREATE_AGENT} RS to create a new agent.`
                      : ''
                  }
                  hasArrow
                  placement="top"
                >
                  <Box
                    as="span"
                    cursor={!enoughFunds ? 'pointer' : 'not-allowed'}
                  >
                    <Button
                      isDisabled={!enoughFunds}
                      onClick={handleSubmit}
                      colorScheme="blue"
                      width="100%"
                      mt={4}
                    >
                      {agentId ? 'Agent Created' : 'Create Agent'}
                    </Button>
                  </Box>
                </Tooltip>
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
                bg="#424242"
                borderColor="#64b5f6"
              >
                <AlertIcon />
                <Box>
                  <AlertTitle textAlign="center" color="#81d4fa">
                    Agent Successfully Created!
                  </AlertTitle>
                  <AlertDescription textAlign="center" color="#e0e0e0">
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
                  bg="#424242"
                  borderColor="#64b5f6"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle textAlign="center" color="#81d4fa">
                      Twitter Linked!
                    </AlertTitle>
                    <AlertDescription textAlign="center" color="#e0e0e0">
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
              <Tooltip
                label={
                  !enoughFunds
                    ? `You need at least ${MINIMUM_TOKENS_TO_CREATE_BACKROOM} RS to create a new backroom.`
                    : ''
                }
                hasArrow
                placement="top"
              >
                <Box
                  as="span"
                  cursor={!enoughFunds ? 'pointer' : 'not-allowed'}
                >
                  <Button
                    onClick={handleCreateBackroom}
                    isDisabled={!enoughFunds}
                    colorScheme="green"
                    width="100%"
                    mt={4}
                  >
                    Create Backroom
                  </Button>
                </Box>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default withMetaMaskCheck(CreateAgent)
