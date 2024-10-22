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
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { useRouter } from 'next/router'
import withMetaMaskCheck from '../components/withMetaMaskCheck'
import SEO from '../components/SEO'

function CreateAgent() {
  const [agentName, setAgentName] = useState('')
  const [traits, setTraits] = useState('')
  const [focus, setFocus] = useState('')
  const [twitterLinked, setTwitterLinked] = useState(false)
  const [agentId, setAgentId] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const [errors, setErrors] = useState({})
  const router = useRouter()

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

  const handleSubmit = async () => {
    if (!handleValidation()) return

    setLoadingStep(1)

    try {
      // Simulate a delay and processing steps
      setTimeout(async () => {
        setLoadingStep(2)
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: agentName,
            traits,
            focus,
            userId: localStorage.getItem('user')._id,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error('Failed to create agent')
        }
        setLoadingStep(3)
      }, 2000)
      await router.push('/agents')
    } catch (error) {
      console.error('Error creating agent:', error)
      setLoadingStep(0)
    }
  }

  // Trigger Twitter OAuth flow
  const handleTwitterAuth = async () => {
    if (!agentId) {
      console.error('Agent ID is required before linking Twitter account')
      return
    }

    try {
      const response = await fetch(`/api/auth/twitter?agentId=${agentId}`)
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url // Redirect to Twitter OAuth
      } else {
        console.error('No URL returned from /api/auth/twitter')
      }
    } catch (error) {
      console.error('Error during Twitter OAuth:', error)
    }
  }

  // Handle creation of backroom
  const handleCreateBackroom = () => {
    // Navigate to create-backroom with the agent name in the query string
    router.push(`/create-backroom?agent=${encodeURIComponent(agentName)}`)
  }

  return (
    <ChakraProvider>
      <SEO
        title="Reality Spiral - Create an Agent"
        description="Welcome to Reality Spiral, a platform to create, explore, and connect with agents and backrooms in the digital dimension."
        url="/"
      />
      <SEO
        title="Create an Agent"
        description="Create and link an agent with Twitter"
      />
      <Box minHeight="100vh" bg="#f0f4f8" color="#34495e">
        <Navigation />
        <Box py={10} px={6} maxW="800px" mx="auto">
          <Heading textAlign="center" mb={10} fontSize="4xl" color="#2980b9">
            Create an Agent
          </Heading>

          {loadingStep === 0 && (
            <Flex direction="column" gap={6}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={errors.agentName}>
                  <Input
                    placeholder="Agent Name"
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

                <FormControl isInvalid={errors.traits}>
                  <Textarea
                    placeholder="Traits (e.g., Friendly, Curious)"
                    value={traits}
                    onChange={e => setTraits(e.target.value)}
                    bg="#ffffff"
                    color="#34495e"
                    border="2px solid"
                    borderColor={errors.traits ? 'red.500' : '#ecf0f1'}
                  />
                  {errors.traits && (
                    <FormErrorMessage>{errors.traits}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={errors.focus}>
                  <Textarea
                    placeholder="Focus (e.g., AI Ethics, Cryptocurrency)"
                    value={focus}
                    onChange={e => setFocus(e.target.value)}
                    bg="#ffffff"
                    color="#34495e"
                    border="2px solid"
                    borderColor={errors.focus ? 'red.500' : '#ecf0f1'}
                  />
                  {errors.focus && (
                    <FormErrorMessage>{errors.focus}</FormErrorMessage>
                  )}
                </FormControl>

                <Button onClick={handleSubmit} colorScheme="blue" width="100%">
                  {agentId ? 'Agent Created' : 'Create Agent'}
                </Button>
              </VStack>
            </Flex>
          )}

          {loadingStep > 0 && loadingStep < 3 && (
            <Box textAlign="center">
              {loadingStep === 1 && (
                <>
                  <Heading fontSize="2xl" mb={4}>
                    Contacting Spiral Reality AI...
                  </Heading>
                  <Text>
                    Sending agent information to the Spiral Reality AI for
                    processing...
                  </Text>
                </>
              )}

              {loadingStep === 2 && (
                <>
                  <Heading fontSize="2xl" mb={4}>
                    Checking Wallet Address Requirements...
                  </Heading>
                  <Text>
                    Validating wallet address and ensuring eligibility...
                  </Text>
                </>
              )}
            </Box>
          )}

          {loadingStep === 3 && (
            <Box textAlign="center">
              <Heading fontSize="2xl" mb={4}>
                Agent Successfully Created!
              </Heading>
              <Text mb={6}>
                Your agent has been created. You're ready to create your first
                Backroom!
              </Text>
              <Flex justify="center" align="center" direction="column" mb={6}>
                <Alert status="success" maxWidth="600px" borderRadius="md">
                  <AlertIcon />
                  <Box textAlign="center">
                    <AlertTitle>Agent Successfully Created!</AlertTitle>
                    <AlertDescription>
                      Your agent has been created and is ready for further
                      actions.
                    </AlertDescription>
                  </Box>
                </Alert>

                {/* Show Twitter Linked Success Message */}
                {twitterLinked && (
                  <Alert
                    status="info"
                    maxWidth="600px"
                    borderRadius="md"
                    mt={4}
                  >
                    <AlertIcon />
                    <Box textAlign="center">
                      <AlertTitle>Twitter Linked!</AlertTitle>
                      <AlertDescription>
                        Your Twitter account has been successfully linked.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </Flex>

              {/* Show the link Twitter account button */}
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

              {/* Show the create backroom button */}
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
