import Backroom from '../../models/Backroom';
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

      const newBackroom = new Backroom({
        agentName,
        role,
        sessionDetails,
        explorerAgentName: explorerAgent,
        explorerDescription,
        terminalAgentName: terminalAgent,
        terminalDescription,
        createdAt: Date.now()
      });

      const prompt = `
        Role (Explorer):
        Name: ${explorerAgent}
        Description: ${explorerDescription}

        Role (Terminal):
        Name: ${terminalAgent}
        Description: You are a computer that only responds like a terminal would. ${terminalDescription}

        Generate a conversation between these two agents based on their descriptions and roles as Explorer and Terminal.
      `;

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are simulating a conversation between two agents: an Explorer and a Terminal.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      newBackroom.content = response.choices[0].message.content;
      await newBackroom.save();

      res.status(201).json(newBackroom);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create backroom' });
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
