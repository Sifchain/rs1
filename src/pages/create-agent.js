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
} from '@chakra-ui/react'
import { useState } from 'react'
import Navigation from '../components/Navigation'
import { useRouter } from 'next/router'
import withMetaMaskCheck from '../components/withMetaMaskCheck'
import SEO from '../components/SEO'

function CreateAgent() {
  const [agentName, setAgentName] = useState('')
  const [traits, setTraits] = useState('')
  const [focus, setFocus] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [errors, setErrors] = useState({})
  const router = useRouter()

  // Validation
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

    // Start loading animation
    setLoadingStep(1)

    try {
      // Simulate a delay and processing steps
      setTimeout(async () => {
        setLoadingStep(2)

        setTimeout(async () => {
          const response = await fetch('/api/agents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: agentName, traits, focus }),
          })

          if (!response.ok) {
            throw new Error('Failed to create agent')
          }

          setLoadingStep(3)
        }, 2000)
      }, 2000)
      await router.push('/agents')
    } catch (error) {
      console.error('Error creating agent:', error)
      setLoadingStep(0)
    }
  }

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
      <Box minHeight="100vh" bg="#f0f4f8" color="#34495e">
        <Navigation />

        <Box py={10} px={6} maxW="800px" mx="auto">
          <Heading
            textAlign="center"
            mb={10}
            fontSize="4xl"
            color="#2980b9"
            fontFamily="'Arial', sans-serif"
          >
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
                    _hover={{ borderColor: '#3498db' }}
                  />
                  {errors.agentName && (
                    <FormErrorMessage>{errors.agentName}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={errors.traits}>
                  <Textarea
                    placeholder="Traits (e.g., Friendly, Curious, Adventurous)"
                    value={traits}
                    onChange={e => setTraits(e.target.value)}
                    bg="#ffffff"
                    color="#34495e"
                    border="2px solid"
                    borderColor={errors.traits ? 'red.500' : '#ecf0f1'}
                    _hover={{ borderColor: '#3498db' }}
                    p={4}
                  />
                  {errors.traits && (
                    <FormErrorMessage>{errors.traits}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={errors.focus}>
                  <Textarea
                    placeholder="Focus (e.g., AI Ethics, Cryptocurrency, Exploration)"
                    value={focus}
                    onChange={e => setFocus(e.target.value)}
                    bg="#ffffff"
                    color="#34495e"
                    border="2px solid"
                    borderColor={errors.focus ? 'red.500' : '#ecf0f1'}
                    _hover={{ borderColor: '#3498db' }}
                    p={4}
                  />
                  {errors.focus && (
                    <FormErrorMessage>{errors.focus}</FormErrorMessage>
                  )}
                </FormControl>
              </VStack>

              <Button
                onClick={handleSubmit}
                colorScheme="blue"
                width="100%"
                _hover={{ bg: '#3498db', boxShadow: '0 0 15px #3498db' }}
              >
                Create Agent
              </Button>
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
              <Button
                onClick={handleCreateBackroom}
                colorScheme="green"
                _hover={{ bg: '#27ae60', boxShadow: '0 0 15px #27ae60' }}
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
