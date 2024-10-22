import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  traits: { type: String, required: true },
  focus: { type: String, required: true },
  description: { type: String, default: '' },
  evolutions: { type: [String], default: [] },
  twitterAuthToken: {
    accessToken: { type: String, default: '' },  // Twitter access token
    refreshToken: { type: String, default: '' }, // Twitter refresh token
  },
  twitterAuthState: {
    codeVerifier: String,
    state: String,
  },
  twitterTokenExpiry: { type: Date, default: null },  // Optional: token expiry date
  createdAt: { type: Date, default: Date.now },       // Field to store agent creation date
  updatedAt: { type: Date, default: Date.now },        // Field to store last update date
  tweets: { type: [String], default: [] },
});

// Middleware to auto-update the `updatedAt` field on each save
AgentSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
});

const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema);
export default Agent;
