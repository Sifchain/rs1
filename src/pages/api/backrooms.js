import Backroom from '../../models/Backroom';
import Agent from '../../models/Agent';
import mongoose from 'mongoose';
import OpenAI from 'openai';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const { agentName, role, sessionDetails, explorerAgent, explorerDescription, terminalAgent, terminalDescription } = req.body;

      const explorer = await Agent.findOne({ name: explorerAgent });
      const terminal = await Agent.findOne({ name: terminalAgent });

      if (!explorer || !terminal) {
        return res.status(400).json({ error: 'Invalid explorer or terminal agent name' });
      }

      const prompt = `
        Role (Explorer):
        Name: ${explorerAgent}
        Description: ${explorerDescription}
        Traits: ${explorer.traits}
        Focus: ${explorer.focus}

        Role (Terminal):
        Name: ${terminalAgent}
        Description: You are a computer that only responds like a terminal would. ${terminalDescription}
        Traits: ${terminal.traits}
        Focus: ${terminal.focus}

        Generate a conversation between these two agents based on their role, descriptions, traits, and focus.
      `;

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Generate conversation between the two agents
      const conversationResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are simulating a conversation between two agents: an Explorer and a Terminal.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const newBackroom = new Backroom({
        agentName,
        role,
        sessionDetails,
        explorerAgentName: explorerAgent,
        explorerDescription,
        terminalAgentName: terminalAgent,
        terminalDescription,
        content: conversationResponse.choices[0].message.content,
        createdAt: Date.now()
      });

      await newBackroom.save();

      const recapPrompt = `
        Agent: ${explorerAgent}
        Initial Description: ${explorerDescription}
        Traits: ${explorer.traits}
        Focus: ${explorer.focus}
        
        Based on the following conversation, provide a new updated description for the agent.
        
        Please include:
        1. Evolution: Describe how the agent has evolved from the conversation.
        2. Traits: Summarize any changes or new traits for the agent.

        Conversation:
        ${conversationResponse.choices[0].message.content}
      `;

      const recapResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are summarizing the evolution and traits of an agent based on a conversation.' },
          { role: 'user', content: recapPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const recapContent = recapResponse.choices[0].message.content;

      // Extract Evolution and Traits from the recap response using regex
      const evolutionRegex = /Evolution:\s*([\s\S]*?)(Traits:|$)/i;
      const traitsRegex = /Traits:\s*([\s\S]*)$/i;

      const evolutionMatch = recapContent.match(evolutionRegex);
      const traitsMatch = recapContent.match(traitsRegex);

      const evolution = evolutionMatch ? evolutionMatch[1].trim() : 'No evolution found.';
      const traits = traitsMatch ? traitsMatch[1].trim() : 'No traits found.';

      // Update Agent with Description, Evolution, and Traits
      explorer.traits = `
        Description: ${explorerDescription.trim()}\n\n
        Evolution: ${evolution}\n\n
        Traits: ${traits}
      `.trim();
      
      await explorer.save();

      res.status(201).json(newBackroom);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create backroom or update agent description' });
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch all backrooms that have a `createdAt` field, sorted by latest (createdAt descending)
      const backrooms = await Backroom.find({ createdAt: { $exists: true } }).sort({ createdAt: -1 });
      res.status(200).json(backrooms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch backrooms' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
