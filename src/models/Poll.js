import mongoose from 'mongoose'

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [
      options => options.length >= 2 && options.length <= 4,
      'Poll must have between 2 and 4 options',
    ],
  },
  durationMinutes: { type: Number, default: 60 }, // Default poll duration is 60 minutes
  posted: { type: Boolean, default: false }, // Track if the poll has been posted
  tweetId: { type: String, default: '' }, // Stores the ID of the poll tweet for reference
  backroomId: { type: String, default: '' }, // Stores the ID of the backroom
  createdAt: { type: Date, default: Date.now },
})

const Poll = mongoose.models.Poll || mongoose.model('Poll', PollSchema)
export default Poll
