import mongoose from 'mongoose'

const tweetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ['original', 'reply', 'retweet'],
      required: true,
      default: 'original',
    },
    media: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const Tweet = mongoose.models.Tweet || mongoose.model('Tweet', tweetSchema)
export default Tweet
