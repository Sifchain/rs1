import mongoose from 'mongoose'

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String], // This makes `options` an array of strings
    default: [],
  },
  selectedOption: { type: String, default: '' }, // Store the selected option for the agent
  results: {
    type: Map,
    of: Number, // Store the count of votes for each option
    default: {},
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'continued'],
    default: 'pending',
  },
  durationMinutes: { type: Number, default: 60 }, // Default poll duration is 60 minutes
  posted: { type: Boolean, default: false }, // Track if the poll has been posted
  tweetId: { type: String, default: '' }, // Stores the ID of the poll tweet for reference
  backroomId: { type: String, default: '' }, // Stores the ID of the backroom
  createdAt: { type: Date, default: Date.now },
})

export default PollSchema
