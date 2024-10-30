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
import { ArrowBackIcon, RepeatIcon, StarIcon } from '@chakra-ui/icons'
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
  DESCRIPTION_TEMPLATE,
} from '../constants/constants'
import { useAccount } from '../hooks/useMetaMask'

function CreateAgent() {
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

  const { hasCopied, onCopy } = useClipboard(DESCRIPTION_TEMPLATE)
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true }) // Changed this line
  const onGenerateDescription = async description => {
    try {
      // Show loading state
      setDescription('Generating description...')

      const response = await fetch('/api/agent/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description ?? '', // Pass current description if it exists
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Update the description field with the generated content
      setDescription(data.description)
    } catch (error) {
      console.error('Error generating description:', error)
      // Restore previous description if there was an error
      if (description === 'Generating description...') {
        setDescription('')
      }
      // Could add error toast/alert here
    }
  }

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

    setErrors(errors)
    return valid
  }

  const handleSubmit = async () => {
    if (!handleValidation()) return

    setLoadingStep(1)

    try {
      setTimeout(async () => {
        setLoadingStep(2)

        const user = JSON.parse(localStorage.getItem('user'))
        const userId = user ? user._id : null
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: agentName,
            description,
            user: userId,
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
        title="Create Agent"
        description="Create and link an agent with Twitter"
      />
      <Box minHeight="100vh" bg="#424242" color="#e0e0e0">
        <Navigation />
        <Box py={10} px={6} maxW="2000px" mx="auto">
          <Flex justifyContent="space-between" alignItems="center" mb={5}>
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
              Create Agent
            </Heading>
            <Box width="60px" />
          </Flex>
          {loadingStep === 0 && (
            <Flex direction="column" gap={6}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={errors.agentName}>
                  <Text fontWeight="bold" color="#81d4fa" mb={2}>
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
                      mb={2}
                      p={4}
                      bg="#424242"
                      borderRadius="md"
                      fontSize="sm"
                    >
                      <Text whiteSpace="pre-wrap" mb={2}>
                        {DESCRIPTION_TEMPLATE}
                      </Text>
                      <Tooltip
                        label={`Generate a description using the template based off of your inputted description.`}
                        hasArrow
                        placement="top"
                      >
                        <Box as="span" cursor={'pointer'}>
                          <Button
                            onClick={() => onGenerateDescription(description)}
                            variant="solid"
                            colorScheme="blue"
                            size="sm"
                            mr={2}
                            leftIcon={<RepeatIcon />}
                          >
                            Generate Description
                          </Button>
                        </Box>
                      </Tooltip>
                      <Tooltip
                        label={`Generate a surprise description using the template.`}
                        hasArrow
                        placement="top"
                      >
                        <Box as="span" cursor={'pointer'}>
                          <Button
                            onClick={() => onGenerateDescription('')}
                            variant="solid"
                            colorScheme="purple"
                            size="sm"
                            mr={2}
                            leftIcon={<StarIcon />}
                          >
                            I'm feeling lucky
                          </Button>
                        </Box>
                      </Tooltip>
                      <Button
                        onClick={onCopy}
                        variant="ghost"
                        colorScheme="blue"
                        size="sm"
                        mr={2}
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
                <Tooltip
                  label={
                    !enoughFunds
                      ? `You need at least ${MINIMUM_TOKENS_TO_CREATE_AGENT} RSP to create a new agent.`
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
                      isDisabled={enoughFunds}
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
                    ? `You need at least ${MINIMUM_TOKENS_TO_CREATE_BACKROOM} RSP to create a new backroom.`
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
