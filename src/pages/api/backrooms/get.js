import mongoose from 'mongoose';
import Backroom from '../../../models/Backroom';

mongoose.set('strictQuery', false)

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const allowedOrigins = [/^https:\/\/(?:.*\.)?realityspiral\.com.*/]

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || 'same-origin'

  const isAllowed =
    allowedOrigins.some(pattern => pattern.test(origin)) ||
    process.env.NODE_ENV === 'development' ||
    origin === 'same-origin'

  if (!isAllowed) {
    return res.status(403).json({ error: 'Request origin not allowed' })
  }

  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { id } = req.query;

  try {
    if (id) {
      const backroom = await Backroom.findById(id);
      if (!backroom) {
        return res.status(404).json({ error: 'Backroom not found' });
      }
      return res.status(200).json(backroom);
    } else {
      const backrooms = await Backroom.find().sort({ createdAt: -1 }).limit(50);
      res.status(200).json(backrooms);
    }
  } catch (error) {
    console.error('Error fetching backrooms:', error);
    res.status(500).json({ error: 'Failed to fetch backrooms' });
  }
}
