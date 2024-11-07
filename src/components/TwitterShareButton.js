import { Button } from '@chakra-ui/react'
import { track } from '@vercel/analytics'

const TwitterShareButton = ({ text, url, hashtags }) => {
  // URL-encode parameters for the Twitter URL
  const tweetText = encodeURIComponent(text || 'Check out this content!')
  const tweetUrl = encodeURIComponent(url || 'https://yourwebsite.com')
  const tweetHashtags = hashtags ? encodeURIComponent(hashtags.join(',')) : ''

  // Build Twitter intent URL
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}${
    tweetHashtags ? `&hashtags=${tweetHashtags}` : ''
  }`
  const handleClick = () => {
    track('Twitter Share Button Clicked', {
      text,
    })
  }
  return (
    <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
      <Button colorScheme="twitter" variant="solid" onClick={handleClick}>
        Tweet This!
      </Button>
    </a>
  )
}

export default TwitterShareButton
