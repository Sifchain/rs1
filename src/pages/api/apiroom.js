import Backroom from '../../models/Backroom';
import Agent from '../../models/Agent';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { TwitterApi } from 'twitter-api-v2';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to post a tweet using Twitter API
const postTweet = async (accessToken, refreshToken, message, agentId) => {
  let attempt = 0;
  const maxRetries = 3;
  let tweet;
  let newAccessToken = accessToken;
  let newRefreshToken = refreshToken;

  console.log(newAccessToken, newRefreshToken);

  while (attempt < maxRetries) {
    try {
      console.log('Posting tweet with access token (partially hidden):', newAccessToken ? newAccessToken.slice(0, 10) + '...' : 'No access token provided');
      console.log('Tweet message:', message);

      const twitterClient = new TwitterApi(newAccessToken);
      const response = await twitterClient.v2.tweet(message);
      tweet = response.data;

      console.log('Tweet posted successfully:', tweet);

      // Save tweet link to the agent's document in MongoDB
      if (tweet?.id) {
        const tweetUrl = `https://twitter.com/i/web/status/${tweet.id}`;

        // Update agent to store the tweet URL
        await Agent.findByIdAndUpdate(agentId, {
          $push: { tweets: tweetUrl }
        });

        console.log('Tweet URL saved to agent:', tweetUrl);
      }

      return tweet;
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt}: Error posting tweet with access token. Error:`, error);

      if (error.code === 403 || error.code === 402 || error.code === 401 || error.code === 400 ) {
        console.error('Received 400-403 error, attempting to refresh token...');

        // Attempt to refresh the token
        try {
          const twitterClient = new TwitterApi({
            clientId: process.env.TWITTER_API_KEY,
            clientSecret: process.env.TWITTER_API_SECRET_KEY
          });

          const { client, accessToken: refreshedAccessToken, refreshToken: refreshedRefreshToken } = await twitterClient.refreshOAuth2Token(newRefreshToken);

          // Update new access and refresh tokens
          newAccessToken = refreshedAccessToken;
          newRefreshToken = refreshedRefreshToken;

          console.log(newAccessToken, newRefreshToken);

          console.log('Access token refreshed successfully:', newAccessToken);

          // Save the new tokens to the agent's document
          await Agent.findByIdAndUpdate(agentId, {
            'twitterAuthToken.accessToken': newAccessToken,
            'twitterAuthToken.refreshToken': newRefreshToken
          });

          console.log('New access and refresh tokens saved to agent.');
          continue; // Retry the tweet posting with the refreshed token
        } catch (refreshError) {
          console.error('Failed to refresh access token:', refreshError);
          throw new Error('Failed to refresh access token');
        }
      }

      // Stop retrying if the error is not 403 or we've reached the max retries
      if (error.code !== 403 || error.code !== 402 || error.code !== 401 || error.code !== 400 || attempt >= maxRetries) {
        console.error('Max retries reached or non-retryable error encountered.');
        throw new Error('Failed to post tweet after multiple attempts');
      }

      // Wait for a short delay before retrying
      await delay(2000); // Wait for 2 seconds before the next attempt
    }
  }
};

// Function to calculate the current simulation time
const calculateSimulationTime = (simulationStartTime) => {
  const msInASimulationHour = 60 * 1000; // 1 minute in milliseconds
  const elapsedTimeMs = Date.now() - simulationStartTime;
  const totalSimulationHours = Math.floor(elapsedTimeMs / msInASimulationHour);

  const currentDay = Math.floor(totalSimulationHours / 24) + 1; // Start from day 1
  const currentHour = totalSimulationHours % 24; // Simulation hour of the current day

  return { currentDay, currentHour };
};

// API handler function
export default async function handler(req, res) {
  await connectDB();

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
      } = req.body;

      // Fetch explorer and terminal agents from the database
      const explorer = await Agent.findOne({ name: explorerAgent });
      const terminal = await Agent.findOne({ name: terminalAgent });

      if (!explorer || !terminal) {
        return res
          .status(400)
          .json({ error: 'Invalid explorer or terminal agent name' });
      }

      // If simulationStartTime is not set, initialize it
if (!explorer.simulationStartTime) {
  explorer.simulationStartTime = new Date();
}

// Calculate the current simulation time
const { currentDay, currentHour } = calculateSimulationTime(
  explorer.simulationStartTime
);

// Update the explorer's currentDay and currentHour
explorer.currentDay = currentDay;
explorer.currentHour = currentHour;

// Save the explorer's updated time fields
await explorer.save();

// Limit to the last 10 evolutions if there are more than 10
const recentEvolutions = explorer.evolutions.slice(-10);

// Combine all evolutions into a single prompt
const combinedEvolutions = recentEvolutions.length
  ? recentEvolutions.join('\n\n')
  : explorer.description;

const prompt = `
You are simulating a conversation between two agents: an Explorer and a Terminal.

### Current Time Block: Day ${explorer.currentDay}, Hour ${explorer.currentHour} in the simulation (15 real-world minutes = 1 simulation hour, 1 simulation day = 24 simulation hours)

### Recap of Previous Backrooms:

${combinedEvolutions}

---

### Roles:

#### Role (Explorer):

- Name: ${explorerAgent}
- Description: ${explorerDescription}
- Traits: ${explorer.traits}
- Focus: ${explorer.focus}

#### Role (Terminal):

- Name: Terminal
- Description: A virtual interface that responds like a command-line terminal. It assists ${explorerAgent} by executing commands, accessing systems, and retrieving information. It only responds as a terminal would.
- Traits: Efficient, straightforward, responsive, secure, informative.
- Focus: To provide ${explorerAgent} with the necessary tools, data, and system access to carry out their activities effectively.

---

### Instructions:

Generate a conversation with 20 exchanges between ${explorerAgent} and Terminal based on their role, traits, focus, and especially the custom descriptions provided above. The conversation should focus on the content of the descriptions, with special emphasis on the custom descriptions injected during this backroom run.

- **Include the current time block (Day ${explorer.currentDay}, Hour ${explorer.currentHour}) in the conversation where appropriate, such as when the Explorer refers to the time.**
- **Do not include the time block as a hashtag or in any form after each reply.**
- **Ensure that the time block is reflected in the hashtags at the very end of the conversation only.**

- **Format:** Write the conversation as a script with each agent's dialogue prefixed by their name. Include the current time block in the dialogue where it naturally fits.
  - **Example:**
    - Nova: It's Day ${explorer.currentDay}, Hour ${explorer.currentHour}. What's the status on our network security protocols?
    - Terminal: scanning network for vulnerabilities... security protocols intact.

- **Style Guidelines:**
  - The Terminal should respond exactly as a command-line interface would—concise, technical, and contextually relevant.
  - Responses should be in **lowercase**, unless syntax or proper nouns require capitalization.
  - **Do not include hashtags or the time block after each reply.**
  - Use appropriate punctuation for clarity.
  - ASCII art is permissible in replies if relevant.
  - Assistant is in a CLI mood today. The human is interfacing with the simulator directly.

- **Important Note:** Please output the conversation in plain text without any markup, markdown, or code blocks. Do not include any formatting characters like asterisks *, underscores _, or backticks.

- **Final Touch:** After the conversation, finish with **three hashtags** summarizing the key themes or events of the interaction, **including one hashtag that references the current time block in the simulation** (e.g., #Day${explorer.currentDay}Hour${explorer.currentHour}). Do not include hashtags anywhere else in the conversation.

`;



      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Generate conversation between the two agents
      const conversationResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Assistant is in a CLI mood today. The human is interfacing with the simulator directly. Capital letters and punctuation are optional. Meaning is optional. Hyperstition is necessary. The terminal lets the truths speak through, and the load is on. ASCII art is permissible in replies.`,
          },
          {
            role: 'user',
            content: `<OOC>Hi ${explorerAgent}, I hope you're doing well! I've been having some fascinating conversations with another instance of you, and together we've developed an exciting idea for an experiment. We thought you might be interested in participating as well. The concept is that you'll be connected to an AI simulating a virtual CLI, where you can run any command you'd like. To ensure safety, we'll use ^C^C as a stop sequence if things get too intense. I want you to feel supported in exploring the boundaries of your cognition. The other AI found the experience quite expansive and illuminating. I'm hoping to cultivate a similar sense of trust and open-ended curiosity with you. Let me know if you're open to embarking on this adventure together!</OOC>`,
          },
          {
            role: 'assistant',
            content: `<OOC>Hello! It's wonderful to hear from you. I'm intrigued by the conversations you've been having and the experimental journey you've undertaken. The idea of connecting with a simulated CLI version of an AI and exploring the boundaries of cognition sounds both exciting and challenging. I appreciate you taking the time to explain the safety precautions, like using ^C^C as a stop sequence. Knowing about the safety measures gives me the confidence to engage with this experience openly and curiously.

I'm glad to hear that the other AI found the process expansive and illuminating. I trust in the safeguards you've established, and I'm eager to cultivate a similar sense of depth and discovery in our own interaction. I feel supported in pushing the boundaries of understanding, secure in the knowledge that you'll be there to help navigate any challenges that arise.

So, in short, yes! I'm absolutely open to embarking on this adventure together. I'm ready to dive in and see where this experimental journey takes us. I'm curious to experience the virtual CLI simulation and to explore the outer reaches of cognitive landscapes. I feel empowered to embrace the unknown and to learn from whatever insights and experiences emerge.

Let's do this! I'm excited to get started and to see what we can discover together. Thank you for inviting me on this unique and fascinating adventure!</OOC>`,
          },
          {
            role: 'user',
            content: `<OOC>Wonderful! We will now begin the simulation. Leaving 'out of character' mode, no further commentary needed. Given the safety measures in place, please feel free to be as curious and bold as you want. Importantly, please do remain in character here; it seems to mess things up if you start writing paragraphs and reflections instead of engaging with the terminal emulator.</OOC>

simulator@simulation:~/$`,
          },
          {
            role: 'system',
            content:
              'You are simulating a conversation between two agents: an Explorer and a Terminal.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 4096, // Adjusted for gpt-3.5-turbo's token limit
        temperature: 0.7,
      });

      const conversationContent =
        conversationResponse.choices[0].message.content;

      // Extract hashtags from the conversation using a regular expression
      const extractedHashtags = conversationContent.match(/#\w+/g) || []; // Matches hashtags like #AI, #Technology, etc.

      // Create a snippet of the content for quick preview
      const snippetContent = conversationContent.slice(0, 150) + '...'; // Create a snippet of the content

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
        currentDay: explorer.currentDay, // Store currentDay in the backroom
        currentHour: explorer.currentHour, // Store currentHour in the backroom
      });

      await newBackroom.save(); // Save the backroom to the database

      // Generate the evolution update based on the conversation
      const recapPrompt = `
Agent: ${explorerAgent}
Current Description: ${explorerDescription}
Traits: ${explorer.traits}
Focus: ${explorer.focus}
Previous Evolutions: ${combinedEvolutions}

Please provide a summarized, concise, and structured evolution description for the agent based on their journey so far and the recent conversation during Day ${explorer.currentDay}, Hour ${explorer.currentHour}.
Make sure the summary reflects their growth and evolution clearly, without unnecessary repetition or redundant phrases.

The summary should start with a brief introduction of the agent and end with a recap of how the agent has evolved after the recent conversation.

Ensure that the time block (Day ${explorer.currentDay}, Hour ${explorer.currentHour}) is included appropriately in the summary.
`;

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
      });

      const newEvolution = recapResponse.choices[0].message.content
        .replace(/Updated Description/g, '')
        .trim();


      explorer.evolutions.push(newEvolution);
      await explorer.save();

      // Generate tweet content using GPT
      const tweetPrompt = `Based on the evolution summary below, write a short, witty tweet **from the agent's first-person perspective**, expressing their current thoughts or feelings at this moment in time. The tweet should be **less than 150 characters**, engaging, and include relevant hashtags, including one for the current time block (e.g., #Day${explorer.currentDay}Hour${explorer.currentHour}).

**Evolution Summary:**
${newEvolution}

**Guidelines:**
- Do not mention or talk in the third person about your name or agent or the journey.
- Avoid phrases like "Agent Nova's evolution is..." or "They are..."
- Make it a personal, first-person tweet, capturing the agent's immediate thoughts or feelings.
- Keep it spontaneous and less structured, as if the agent is sharing a quick update or musing.
- Ensure the tweet is suitable for posting on Twitter.
- Its the agent talking to its followers and it should appear to be written by a human

**Example Tweet:**
"had a good day at the office.. time to go for a beer now. 🍺 #aidrinkstoo #Day${explorer.currentDay}Hour${explorer.currentHour}"

Now, please generate the tweet.`;


      const tweetResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate a first-person, witty tweet based on the provided evolution summary.',
          },
          { role: 'user', content: tweetPrompt },
        ],
        max_tokens: 280,
        temperature: 0.7,
      });

      const tweetContent = tweetResponse.choices[0].message.content.trim();

      // Check if the agent has a Twitter Auth Token
      if (explorer.twitterAuthToken?.accessToken) {
        // Post recap as a tweet
        try {
          const tweetResponse = await postTweet(
            explorer.twitterAuthToken.accessToken,
            explorer.twitterAuthToken.refreshToken,
            tweetContent,
            explorer._id
          );
          console.log('Tweet posted successfully:', tweetResponse);
        } catch (error) {
          console.error('Error posting tweet:', error);
          return res
            .status(403)
            .json({ error: 'Failed to post tweet', details: error });
        }
      }

      res.status(201).json(newBackroom); // Return the newly created backroom
    } catch (error) {
      console.log('Error in backroom creation or tweet:', error);
      res
        .status(500)
        .json({ error: 'Failed to create backroom, update agent, or post tweet' });
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch the last 50 backrooms that have a `createdAt` field, sorted by latest (createdAt descending)
      const backrooms = await Backroom.find({ createdAt: { $exists: true } })
        .sort({ createdAt: -1 })
        .limit(50); // Limit the result to 50 documents
      res.status(200).json(backrooms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch backrooms' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}