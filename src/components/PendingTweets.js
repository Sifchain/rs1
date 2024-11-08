import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  Flex,
  Textarea,
  FormErrorMessage,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react'
import { FiTrash2 } from 'react-icons/fi'
import { fetchWithRetries } from '@/utils/urls'
import { BASE_URL, DEFAULT_HASHTAGS } from '@/constants/constants'
import { useNotification } from '@/context/NotificationContext'
import { FiCopy } from 'react-icons/fi'
import TwitterShareButton from '@/components/TwitterShareButton'

const PendingTweets = ({
  selectedAgent,
  setSelectedAgent,
  hasEditPermission,
  backroomId,
}) => {
  const { showNotification } = useNotification()
  const [editTweetId, setEditTweetId] = useState(null)
  const [editTweetContent, setEditTweetContent] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [charCountError, setCharCountError] = useState(false)
  const [pendingTweets, setPendingTweets] = useState([])
  useEffect(() => {
    setPendingTweets(
      backroomId != null
        ? (selectedAgent?.pendingTweets.filter(
            t => t.backroomId === backroomId
          ) ?? [])
        : (selectedAgent?.pendingTweets ?? [])
    )
  }, [selectedAgent, backroomId])
  const [copiedTweetId, setCopiedTweetId] = useState(null) // Track the last copied tweet ID

  const handleCopy = async (tweetContent, tweetId) => {
    try {
      await navigator.clipboard.writeText(tweetContent)
      setCopiedTweetId(tweetId) // Update the copied tweet ID for feedback
      setTimeout(() => setCopiedTweetId(null), 1000) // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy text: ', error)
    }
  }
  const countWords = text => text?.trim().split(/\s+/).length

  const handleEditTweet = (tweetId, tweetContent) => {
    setEditTweetId(tweetId)
    setEditTweetContent(tweetContent)
    setCharCount(tweetContent.length)
  }

  const handleCancelEdit = () => {
    setEditTweetId(null)
    // setEditTweetContent('')
    setCharCountError(false)
  }

  const handleDiscardTweet = async tweetId => {
    try {
      const response = await fetchWithRetries(
        BASE_URL + '/api/twitter/discardTweet',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: selectedAgent._id,
            tweetId,
          }),
        }
      )

      if (response?.ok) {
        const data = await response.json()
        setSelectedAgent(data.agent)
        setPendingTweets(data.agent.pendingTweets)
        showNotification({
          title: 'Tweet Discarded',
          description: 'The tweet has been successfully discarded.',
          actionText: 'Close',
        })
      } else {
        const error = await response?.json()
        showNotification({
          title: 'Error',
          description:
            error || 'Failed to discard the tweet. Please try again.',
          actionText: 'Retry',
          onAction: () => handleDiscardTweet(tweetId),
        })
      }
    } catch (error) {
      console.error('Error discarding tweet:', error)
      showNotification({
        title: 'Error',
        description: 'Failed to discard the tweet. Please try again.',
        actionText: 'Retry',
        onAction: () => handleDiscardTweet(tweetId),
      })
    }
  }

  const handleApproveTweet = async tweet => {
    try {
      const response = await fetchWithRetries(
        BASE_URL + '/api/twitter/approveTweet',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: selectedAgent._id,
            tweetId: tweet._id,
          }),
        }
      )

      if (response?.ok) {
        const data = await response.json()
        setSelectedAgent(data.agent)
        showNotification({
          title: 'Tweet Approved',
          description: 'The tweet has been successfully posted.',
          actionText: 'Close',
        })
      } else {
        const error = await response?.json()
        showNotification({
          title: 'Error',
          description: error || 'Failed to post the tweet. Please try again.',
          actionText: 'Retry',
          onAction: () => handleApproveTweet(tweet),
        })
      }
    } catch (error) {
      console.error('Error approving tweet:', error)
      showNotification({
        title: 'Error',
        description: 'Failed to post the tweet. Please try again.',
        actionText: 'Retry',
        onAction: () => handleApproveTweet(tweet),
      })
    }
  }

  const handleSaveEdit = async (tweetId, promptValue) => {
    try {
      const response = await fetchWithRetries(
        BASE_URL + '/api/twitter/editTweet',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: selectedAgent._id,
            tweetId,
            tweetContent: promptValue,
          }),
        }
      )

      if (response?.ok) {
        const data = await response.json()
        setEditTweetId(null)
        setEditTweetContent('')
        setSelectedAgent(data.agent)
        setPendingTweets(data.agent.pendingTweets)
        showNotification({
          title: 'Tweet Updated',
          description: 'The tweet content has been updated.',
          actionText: 'Close',
        })
      } else {
        const error = await response?.json()
        showNotification({
          title: 'Error',
          description: error || 'Failed to update the tweet. Please try again.',
          actionText: 'Retry',
          onAction: () => handleSaveEdit(tweetId, promptValue),
        })
      }
    } catch (error) {
      console.error('Error updating tweet:', error)
      showNotification({
        title: 'Error',
        description: 'Failed to update the tweet. Please try again.',
        actionText: 'Retry',
        onAction: () => handleSaveEdit(tweetId, promptValue),
      })
    }
  }

  const displayPendingTweets = () => {
    if (pendingTweets.length === 0) {
      return (
        <Text textAlign="center" fontSize="lg" color="#e0e0e0">
          No pending tweets.
        </Text>
      )
    }

    return (
      <Box
        p={4}
        bg="#424242"
        borderRadius="lg"
        border="2px solid #757575"
        boxShadow="0 0 15px rgba(0, 0, 0, 0.2)"
        mb={4}
      >
        <Text fontSize="lg" fontWeight="bold" color="#81d4fa" mb={2}>
          Suggested Tweets
        </Text>
        <VStack spacing={4} align="stretch">
          {pendingTweets.map(tweet => (
            <Box
              key={tweet._id}
              border="2px solid #757575"
              p={4}
              borderRadius="md"
              bg="#333"
            >
              <Text fontSize="md" color="#b0bec5" mb={2}>
                <Text as="span" fontWeight="bold" color="#81d4fa">
                  Type: {tweet?.tweetType ?? 'Recap'}
                </Text>
              </Text>
              {editTweetId === tweet._id ? (
                <Flex direction="column" gap={3}>
                  <Textarea
                    value={editTweetContent}
                    onChange={e => {
                      setEditTweetContent(e.target.value)
                      setCharCount(e.target.value.length)
                      setCharCountError(e.target.value.length > 280)
                    }}
                    placeholder="Edit tweet content"
                    bg="#424242"
                    color="#e0e0e0"
                    border="2px solid #757575"
                    resize="vertical"
                    minHeight="150px"
                  />
                  <Text fontSize="sm" color="#b0bec5">
                    {charCount} / 280 characters
                  </Text>
                  {charCountError && (
                    <FormErrorMessage>
                      Tweet exceeds 280 characters
                    </FormErrorMessage>
                  )}
                  <Flex justifyContent="space-between" width="100%">
                    <Flex gap={4}>
                      <Button
                        size="md"
                        colorScheme="blue"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="md"
                        colorScheme="green"
                        isDisabled={!hasEditPermission()}
                        onClick={() =>
                          handleSaveEdit(tweet._id, editTweetContent)
                        }
                      >
                        Save
                      </Button>
                    </Flex>
                    <Flex gap={4}>
                      <Button
                        onClick={() =>
                          handleCopy(tweet.tweetContent, tweet._id)
                        }
                        size="md"
                        variant="outline"
                        colorScheme="blue"
                        leftIcon={<FiCopy />}
                      >
                        Copy Tweet
                      </Button>
                      <TwitterShareButton text={tweet.tweetContent} />
                    </Flex>
                  </Flex>
                </Flex>
              ) : (
                <Flex direction="column" gap={3}>
                  <Text color="#e0e0e0" whiteSpace="pre-wrap">
                    {tweet.tweetContent}
                  </Text>
                  <Flex justifyContent="space-between" width="100%">
                    <Flex gap={4}>
                      <Button
                        size="md"
                        colorScheme="blue"
                        onClick={() =>
                          handleEditTweet(tweet._id, tweet.tweetContent)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        size="md"
                        colorScheme="red"
                        onClick={() => handleDiscardTweet(tweet._id)}
                        leftIcon={<FiTrash2 />}
                      >
                        Discard
                      </Button>
                    </Flex>
                    <Flex gap={4}>
                      <Button
                        onClick={() =>
                          handleCopy(tweet.tweetContent, tweet._id)
                        }
                        size="md"
                        variant="outline"
                        colorScheme="blue"
                        leftIcon={<FiCopy />}
                      >
                        Copy Tweet
                      </Button>
                      <TwitterShareButton text={tweet.tweetContent} />
                    </Flex>
                  </Flex>
                </Flex>
              )}
            </Box>
          ))}
        </VStack>
      </Box>
    )
  }

  return pendingTweets?.length > 0 ? displayPendingTweets() : null
}

export default PendingTweets
