import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  Flex,
  Textarea,
  FormErrorMessage,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
import { FiTrash2 } from 'react-icons/fi'
import { fetchWithRetries } from '@/utils/urls'
import { URL } from '@/constants/constants'

const PendingTweets = ({
  selectedAgent,
  setSelectedAgent,
  hasEditPermission,
  backroomId,
}) => {
  const [editTweetId, setEditTweetId] = useState(null)
  const [editTweetContent, setEditTweetContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [wordCountError, setWordCountError] = useState(false)
  const [pendingTweets, setPendingTweets] = useState(
    backroomId != null
      ? selectedAgent?.pendingTweets.filter(t => t.backroomId === backroomId)
      : selectedAgent?.pendingTweets
  )
  const toast = useToast()

  const countWords = text => {
    return text?.trim().split(/\s+/).length
  }

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
    if (window.confirm('Are you sure you want to discard this tweet?')) {
      try {
        const response = await fetchWithRetries(
          URL + '/api/twitter/discardTweet',
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
          toast({
            title: 'Tweet Discarded',
            description: 'The tweet has been successfully discarded.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        } else {
          const error = await response?.json()
          toast({
            title: 'Error',
            description:
              error.error || 'Failed to discard the tweet. Please try again.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
      } catch (error) {
        console.error('Error discarding tweet:', error)
        toast({
          title: 'Error',
          description: 'Failed to discard the tweet. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  const handleApproveTweet = async tweet => {
    try {
      const response = await fetchWithRetries(
        URL + '/api/twitter/approveTweet',
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
        toast({
          title: 'Tweet Approved',
          description: 'The tweet has been successfully posted.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        const error = await response?.json()
        toast({
          title: 'Error',
          description:
            error.error || 'Failed to post the tweet. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error approving tweet:', error)
      toast({
        title: 'Error',
        description: 'Failed to post the tweet. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSaveEdit = async (tweetId, promptValue) => {
    try {
      const response = await fetchWithRetries(URL + '/api/twitter/editTweet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent._id,
          tweetId,
          tweetContent: promptValue,
        }),
      })

      if (response?.ok) {
        const data = await response.json()
        setEditTweetId(null)
        setEditTweetContent('')
        setSelectedAgent(data.agent)
        toast({
          title: 'Tweet Updated',
          description: 'The tweet content has been updated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
          variant: 'subtle',
        })
      } else {
        const error = await response?.json()
        toast({
          title: 'Error',
          description:
            error.error || 'Failed to update the tweet. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error updating tweet:', error)
      toast({
        title: 'Error',
        description: 'Failed to update the tweet. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
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
            Pending Tweets
          </Text>
          <VStack spacing={4} align="stretch">
            {pendingTweets?.map(tweet => (
              <Box
                key={tweet._id}
                border="2px solid #757575"
                p={3}
                borderRadius="md"
              >
                <Text fontSize="md" color="#b0bec5" mt={1}>
                  <Text as="span" fontWeight="bold" color="#81d4fa">
                    Type:{` ${tweet?.tweetType ?? 'Recap'}`}
                  </Text>
                </Text>
                {editTweetId === tweet._id ? ( // Check if tweet is being edited
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
                        cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                      >
                        <Button
                          size="sm"
                          colorScheme="green"
                          isDisabled={!hasEditPermission()}
                          onClick={() => {
                            handleSaveEdit(tweet._id, editTweetContent)
                          }}
                          mr={2}
                        >
                          Save
                        </Button>
                      </Box>
                    </Tooltip>
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
                        cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                      >
                        <Button
                          isDisabled={!hasEditPermission()}
                          size="sm"
                          colorScheme="blue"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Tooltip>
                  </Flex>
                ) : (
                  <Flex justifyContent="space-between" mb={2}>
                    <Text color="#e0e0e0">{tweet.tweetContent}</Text>
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
                    </Tooltip>
                  </Flex>
                )}
                <Text fontSize="sm" color="#b0bec5" mb={2}>
                  Generated on: {new Date(tweet.createdAt).toLocaleString()}
                </Text>
                <Flex justifyContent="space-between" alignItems="center">
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
                      cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                    >
                      <Button
                        size="sm"
                        isDisabled={!hasEditPermission()}
                        colorScheme="red"
                        onClick={() => handleDiscardTweet(tweet._id)}
                        leftIcon={<FiTrash2 />}
                      >
                        Discard
                      </Button>
                    </Box>
                  </Tooltip>
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
                      cursor={hasEditPermission() ? 'pointer' : 'not-allowed'}
                    >
                      <Button
                        size="sm"
                        isDisabled={!hasEditPermission()}
                        colorScheme="green"
                        onClick={() => handleApproveTweet(tweet)}
                      >
                        Approve and Post
                      </Button>
                    </Box>
                  </Tooltip>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      )
    )
  }
  return pendingTweets?.length > 0 ? displayPendingTweets() : null
}

export default PendingTweets
