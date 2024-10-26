import mongoose from 'mongoose'

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  traits: { type: String, required: true },
  focus: { type: String, required: true },
  evolutions: { type: [String], default: [] },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  twitterAuthToken: {
    accessToken: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
  },
  twitterAuthState: {
    codeVerifier: String,
    state: String,
  },
  twitterTokenExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tweets: { type: [String], default: [] },
  description: { type: String, default: '' },
  conversationPrompt: { type: String, default: '' },
  recapPrompt: { type: String, default: '' },
  tweetPrompt: { type: String, default: '' },
})

// Middleware to auto-update the `updatedAt` field on each save
AgentSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = Date.now()
  }
  this.updatedAt = Date.now()
  next()
})

const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema)
export default Agent
