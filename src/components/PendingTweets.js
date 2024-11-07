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
  const [wordCount, setWordCount] = useState(0)
  const [wordCountError, setWordCountError] = useState(false)
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
    setWordCount(countWords(tweetContent))
  }

  const handleCancelEdit = () => {
    setEditTweetId(null)
    setEditTweetContent('')
    setWordCount(0)
    setWordCountError(false)
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
    if (pendingTweets?.length === 0) {
      return (
        <Text textAlign="center" fontSize="lg" color="#e0e0e0">
          No pending tweets.
        </Text>
      )
    }

    return (
      selectedAgent &&
      pendingTweets?.length > 0 && (
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
            {pendingTweets?.map(tweet => {
              return (
                <Box
                  key={tweet._id}
                  border="2px solid #757575"
                  p={3}
                  borderRadius="md"
                >
                  <Text fontSize="md" color="#b0bec5" mt={1} mb={2}>
                    <Text as="span" fontWeight="bold" color="#81d4fa">
                      Type: {tweet?.tweetType ?? 'Recap'}
                    </Text>
                  </Text>
                  {editTweetId === tweet._id ? (
                    <Flex justifyContent="space-between" mb={2}>
                      <Textarea
                        value={editTweetContent}
                        onChange={e => {
                          setEditTweetContent(e.target.value)
                          setWordCount(countWords(e.target.value))
                          setWordCountError(false)
                        }}
                        placeholder="Edit tweet content"
                        bg="#424242"
                        color="#e0e0e0"
                        border="2px solid #757575"
                        resize="vertical"
                        minHeight="300px"
                      />
                      <Text fontSize="sm" color="#b0bec5" ml={2}>
                        {wordCount} / 280 words
                      </Text>
                      {wordCountError && (
                        <FormErrorMessage>
                          Tweet exceeds 280 words
                        </FormErrorMessage>
                      )}
                      <Tooltip
                        label={
                          !hasEditPermission()
                            ? `You have to be the owner of the agent to edit it`
                            : ''
                        }
                        hasArrow
                        placement="top"
                      >
                        <Box
                          as="span"
                          cursor={
                            hasEditPermission() ? 'pointer' : 'not-allowed'
                          }
                        >
                          <Button
                            isDisabled={!hasEditPermission()}
                            size="sm"
                            colorScheme="blue"
                            onClick={() =>
                              handleSaveEdit(tweet._id, editTweetContent)
                            }
                          >
                            Save
                          </Button>
                        </Box>
                      </Tooltip>
                    </Flex>
                  ) : (
                    <Flex justifyContent="start" mb={2}>
                      <Text color="#e0e0e0">
                        <pre>
                          {tweet.tweetContent
                            .split(' ')
                            .map((word, index) =>
                              index > 0 && index % 15 === 0 ? `\n${word}` : word
                            )
                            .join(' ')}
                        </pre>
                      </Text>
                      {/* <Tooltip
                      label={
                        !hasEditPermission()
                          ? `You have to be the owner of the agent to edit it`
                          : ''
                      }
                      hasArrow
                      placement="top"
                    >
                      <Box
                        as="span"
                        cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                      >
                        <Button
                          isDisabled={!hasEditPermission()}
                          size="sm"
                          colorScheme="blue"
                          onClick={() =>
                            handleEditTweet(tweet._id, tweet.tweetContent)
                          }
                        >
                          Edit
                        </Button>
                      </Box>
                    </Tooltip> */}
                    </Flex>
                  )}
                  {/* <Text fontSize="sm" color="#b0bec5" mb={2}>
                  Status: {tweet.postStatus || 'Pending'}
                </Text> */}
                  {tweet.postStatus === 'Failed' && tweet.errorDetails && (
                    <Text fontSize="sm" color="red.400" mb={2}>
                      Error: {tweet.errorDetails}
                    </Text>
                  )}
                  <Flex justifyContent="start" alignItems="center" gap={4}>
                    <Button
                      onClick={() => handleCopy(tweet.tweetContent, tweet._id)}
                      variant="outline"
                      colorScheme="blue"
                      leftIcon={<FiCopy />}
                    >
                      Copy Tweet
                    </Button>
                    <TwitterShareButton
                      text={tweet.tweetContent}
                      url={`https://app.realityspiral.com/backrooms/${tweet.backroomId.toString()}`}
                      hashtags={[]}
                    />
                    {/* <Button
                    size="sm"
                    isDisabled={!hasEditPermission()}
                    colorScheme="red"
                    onClick={() => handleDiscardTweet(tweet._id)}
                    leftIcon={<FiTrash2 />}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    isDisabled={!hasEditPermission()}
                    colorScheme="green"
                    onClick={() => handleApproveTweet(tweet)}
                  >
                    Approve and Post
                  </Button> */}
                  </Flex>
                </Box>
              )
            })}
          </VStack>
        </Box>
      )
    )
  }
  return pendingTweets?.length > 0 ? displayPendingTweets() : null
}

export default PendingTweets
