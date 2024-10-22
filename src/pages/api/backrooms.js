import Backroom from '../../models/Backroom';
import Agent from '../../models/Agent';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { TwitterApi } from 'twitter-api-v2';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

// Function to post a tweet using Twitter API
const postTweet = async (accessToken, message, agentId) => {
  try {
    console.log('Posting tweet with access token (partially hidden):', accessToken ? accessToken.slice(0, 10) + '...' : 'No access token provided');
    console.log('Tweet message:', message);

    const twitterClient = new TwitterApi(accessToken);
    const { data: tweet } = await twitterClient.v2.tweet(message);

    console.log('Tweet posted successfully:', tweet);

    // Save tweet link to the agent's document in MongoDB
    if (tweet?.id) {
      const tweetUrl = `https://twitter.com/i/web/status/${tweet.id}`;

      // Update agent to store the tweet URL
      await Agent.findByIdAndUpdate(agentId, {
        $push: { tweets: tweetUrl } // Assuming the agent schema has a 'tweets' array field
      });

      console.log('Tweet URL saved to agent:', tweetUrl);
    }

    return tweet;
  } catch (error) {
    console.error('Error posting tweet with access token:', accessToken);
    console.error('Tweet message attempted:', message);
    console.error('Detailed error:', error);

    throw new Error('Failed to post tweet');
  }
};


export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'POST') {
    try {
      const {
        agentName,
        role,
        sessionDetails,
        explorerAgent,
        explorerDescription,
        terminalAgent,
        terminalDescription,
        tags = [],
      } = req.body

      // Fetch explorer and terminal agents
      const explorer = await Agent.findOne({ name: explorerAgent })
      const terminal = await Agent.findOne({ name: terminalAgent })

      if (!explorer || !terminal) {
        return res
          .status(400)
          .json({ error: 'Invalid explorer or terminal agent name' })
      }

      // Combine all evolutions into a single prompt
      const combinedEvolutions = explorer.evolutions.length
        ? explorer.evolutions.join('\n\n')
        : explorerDescription

      const prompt = `
        Role (Explorer):
        Name: ${explorerAgent}
        Description: ${explorerDescription}
        Traits: ${explorer.traits}
        Focus: ${explorer.focus}

        Current thoughts: ${explorer.description}

        Role (Terminal):
        Name: ${terminalAgent}
        Description: You are a computer that only responds like a terminal would. ${terminalDescription}
        Traits: ${terminal.traits}
        Focus: ${terminal.focus}

        Generate a conversation between these two agents based on their role, traits, focus, and using the past conversations. The response should focus on the content of the description. Finish the conversation with 3 hashtags based on the conversation.
      `;

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

      // Generate conversation between the two agents
      const conversationResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are simulating a conversation between two agents: an Explorer and a Terminal.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      })

      const conversationContent =
        conversationResponse.choices[0].message.content

      // Extract hashtags from the conversation using a regular expression
      const extractedHashtags = conversationContent.match(/#\w+/g) || []; // Matches hashtags like #AI, #Technology, etc.
      // Create a snippet of the content for quick preview
      const snippetContent = conversationContent.slice(0, 150) + '...' // Create a snippet of the content

      // Create a new backroom with the extracted hashtags and snippet content
      const newBackroom = new Backroom({
        agentName,
        role,
        sessionDetails,
        explorerAgentName: explorerAgent,
        explorerDescription,
        terminalAgentName: terminalAgent,
        terminalDescription,
        content: conversationContent,
        snippetContent: snippetContent, // Save snippetContent for quick display
        tags: [...new Set([...tags, ...extractedHashtags])], // Merge any provided tags with extracted hashtags and ensure uniqueness
        createdAt: Date.now(),
      })

      await newBackroom.save() // Save the backroom to the database

      // Generate the evolution update based on the conversation
      const recapPrompt = `
        Agent: ${explorerAgent}
        Current Description: ${explorerDescription}
        Traits: ${explorer.traits}
        Focus: ${explorer.focus}
        Previous Evolutions: ${combinedEvolutions}

        Please provide a summarized, concise, and structured evolution description for the agent based on their journey so far.
        Make sure the summary reflects their growth and evolution clearly, without unnecessary repetition or redundant phrases.
        The summary should start with a brief introduction of the agent and end with a recap of how the agent has evolved after the recent conversation.
      `

      const recapResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are summarizing the evolution of an agent based on their journey and recent conversation.',
          },
          { role: 'user', content: recapPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      const newEvolution = recapResponse.choices[0].message.content.replace(/Updated Description/g, "").trim();

      // Add the new evolution to the evolutions array and update the description
      explorer.evolutions.push(newEvolution); // Append the new evolution to the evolutions array
      explorer.description = `${newEvolution}`; // Set latest evolution as description

      await explorer.save() // Save the agent with the updated evolutions


      res.status(201).json(newBackroom) // Return the newly created backroom
    } catch (error) {
      console.log(error)
      res
        .status(500)
        .json({ error: 'Failed to create backroom or update agent evolution' })

      // Generate tweet content using GPT
      const tweetPrompt = `Summarize the following evolution in a tweet format, keeping it concise and engaging. Include relevant hashtags:

      Conversation: ${conversationContent}

      Make sure the content returned is less than 150 characters and valid to tweet.

      Dont mention or talk in the third person your name or agent or the journey.

      Make it a conversational tweet but based on the evolution recap.`;

      const tweetResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Generate a tweet based on the provided evolution.' },
          { role: 'user', content: tweetPrompt }
        ],
        max_tokens: 280,
        temperature: 0.7,
      });

      const tweetContent = tweetResponse.choices[0].message.content.trim();

      // Check if the agent has a Twitter Auth Token
      if (explorer.twitterAuthToken?.accessToken) {
        // Post recap as a tweet
        try {
          const tweetResponse = await postTweet(explorer.twitterAuthToken.accessToken, tweetContent, explorer._id);
          console.log('Tweet posted successfully:', tweetResponse);
        } catch (error) {
          console.error('Error posting tweet:', error);
          return res.status(403).json({ error: 'Failed to post tweet', details: error });
        }
      }

      res.status(201).json(newBackroom); // Return the newly created backroom
    } catch (error) {
      console.log('Error in backroom creation or tweet:', error);
      res.status(500).json({ error: 'Failed to create backroom, update agent, or post tweet' });
>>>>>>> a33c5b1 (Twitter integration)
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch all backrooms that have a `createdAt` field, sorted by latest (createdAt descending)
      const backrooms = await Backroom.find({
        createdAt: { $exists: true },
      }).sort({ createdAt: -1 })
      res.status(200).json(backrooms)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch backrooms' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
