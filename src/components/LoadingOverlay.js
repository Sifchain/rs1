import { Box, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

const loadingMessages = [
  'Processing',
  'Analyzing',
  'Connecting',
  'Finalizing',
  'Completing',
]
const LoadingOverlay = loading => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (loading) {
        setCurrentMessageIndex(
          prevIndex => (prevIndex + 1) % loadingMessages.length
        )
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [loading])

  const currentMessage = loadingMessages[currentMessageIndex]
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg="rgba(0, 0, 0, 0.8)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      zIndex="1000"
      color="#81d4fa"
    >
      <Box mb={6}>
        <video
          src="/gifs/blue-spiral.mp4"
          autoPlay
          loop
          muted
          style={{ width: '150px', height: '150px' }}
        />
      </Box>
      <Text
        fontSize="2xl"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        mb={2}
      >
        {currentMessage}...
      </Text>
      <Text fontSize="md" color="#b0bec5">
        Please wait while we process your request.
      </Text>
    </Box>
  )
}

export default LoadingOverlay
