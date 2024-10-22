import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  Spinner,
  Select,
  Input,
  Tag,
  TagLabel,
  Button,
  Collapse,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';

function Backrooms() {
  const [backrooms, setBackrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);  // This tracks which conversation is expanded
  const [tags, setTags] = useState([]);

  const router = useRouter();
  const { expanded } = router.query; // Get 'expanded' parameter from the URL

  useEffect(() => {
    const fetchBackrooms = async () => {
      try {
        const response = await fetch('/api/backrooms');
        const data = await response.json();
        setBackrooms(data);

        // Extract unique tags for filtering
        const uniqueTags = Array.from(
          new Set(data.flatMap((backroom) => backroom.tags || []))
        );
        setTags(uniqueTags);

        // If 'expanded' is present in the URL, find the matching backroom
        if (expanded) {
          const index = data.findIndex((backroom) => backroom._id === expanded);
          if (index !== -1) {
            setExpandedIndex(index); // Set the matching backroom to be expanded
          }
        }
      } catch (error) {
        console.error('Error fetching backrooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackrooms();
  }, [expanded]);

  const filteredBackrooms = backrooms.filter((backroom) => {
    return (
      (selectedAgent === 'All' || backroom.agentName === selectedAgent) &&
      (searchQuery === '' ||
        backroom.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    );
  });

  if (loading) {
    return (
      <ChakraProvider>
        <Flex height="100vh" alignItems="center" justifyContent="center">
          <Spinner size="xl" />
        </Flex>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <SEO
        title="Reality Spiral - Explore The Backrooms"
        description="Explore agent conversations and their evolving interactions."
        url="/"
      />
      <Navigation />
      <Box bg="#f0f4f8" color="#34495e" minHeight="100vh" py={10} px={6}>
        <Box maxW="container.xl" mx="auto">
          <Flex justifyContent="space-between" alignItems="center" mb={10}>
            <Heading
              textAlign="center"
              fontSize={{ base: '2xl', md: '4xl' }}
              color="#2980b9"
              fontFamily="'Arial', sans-serif"
            >
              Backrooms
            </Heading>

            {/* Create Backroom Button */}
            <Button
              colorScheme="blue"
              onClick={() => router.push('/create-backroom')} // Redirect to create a backroom page
              size="md"
              fontWeight="bold"
            >
              + New Backroom
            </Button>
          </Flex>

          <Flex justifyContent="space-between" mb={8} flexDirection={{ base: 'column', md: 'row' }}>
            <Select
              placeholder="All Agents"  // This is the default placeholder
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              maxW="300px"
              mb={{ base: 4, md: 0 }}
            >
              <option value="All">All Agents</option> {/* The default option for 'All Agents' */}

              {/* Dynamically populate the dropdown with agent names */}
              {Array.from(new Set(backrooms.map((backroom) => backroom.agentName)))
                .filter((agent) => agent !== "All") // Ensure no duplicate "All" option
                .map((agent, index) => (
                  <option key={index} value={agent}>
                    {agent}
                  </option>
                ))}
            </Select>


            <Input
              placeholder="Search conversations via hashtags"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              maxW="300px"
            />
          </Flex>

          <Flex wrap="wrap" mb={8}>
            {tags.map((tag, index) => (
              <Tag
                size="md"
                key={index}
                m={1}
                cursor="pointer"
                colorScheme="blue"
                onClick={() => setSearchQuery(tag)}
              >
                <TagLabel>{tag}</TagLabel>
              </Tag>
            ))}
          </Flex>

          <VStack spacing={6} align="stretch">
            {filteredBackrooms.length > 0 ? (
              filteredBackrooms.map((backroom, index) => (
                <Box
                  key={index}
                  p={4}
                  bg="#ffffff"
                  borderRadius="lg"
                  border="2px solid #ecf0f1"
                  boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <Text fontSize="lg" fontWeight="bold" color="#2980b9">
                        {backroom.agentName} &rarr; {backroom.terminalAgentName}
                      </Text>
                      <Text fontSize="sm" color="#7f8c8d" mb={2}>
                        {new Date(backroom.createdAt).toLocaleDateString()} at{' '}
                        {new Date(backroom.createdAt).toLocaleTimeString()}
                      </Text>
                      <Text color="#34495e" mb={4}>
                        {backroom.snippetContent}
                      </Text>
                      <Flex wrap="wrap">
                        {backroom.tags.map((tag, index) => (
                          <Tag size="md" key={index} m={1} colorScheme="blue">
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        ))}
                      </Flex>
                    </Box>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    >
                      {expandedIndex === index ? 'Collapse' : 'View Full Conversation'}
                    </Button>
                  </Flex>
                  <Collapse in={expandedIndex === index} animateOpacity>
                    <Box mt={4}>
                      <Text whiteSpace="pre-wrap">{backroom.content}</Text>
                    </Box>
                  </Collapse>
                </Box>
              ))
            ) : (
              <Text textAlign="center" fontSize="xl">
                No backroom conversations found.
              </Text>
            )}
          </VStack>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default Backrooms;
