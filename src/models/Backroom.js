import mongoose from 'mongoose'
import PollSchema from '@/models/Poll'

const BackroomSchema = new mongoose.Schema({
  explorerAgentName: { type: String, required: true },
  explorerDescription: { type: String, default: '' },
  responderAgentName: { type: String, required: true },
  responderDescription: { type: String, default: '' },
  content: { type: String, required: true },
  snippetContent: { type: String, default: '' },
  tags: { type: [String], default: [] },
  sessionDetails: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  polls: { type: [PollSchema], default: [] }, // New field to store conversation-related polls
  explorerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent', // Reference the Agent model
    default: null,
  },
  backroomState: {
    narrativeStage: { type: String, default: '' },
    narrativePoint: { type: String, default: '' },
    currentFocus: {
      theme: { type: String, default: '' },
      tension: { type: String, default: '' },
    },
    narrativeSignals: { type: [String], default: [] },
    conversationHistory: {
      type: [
        {
          role: { type: String, enum: ['explorer', 'responder', 'system'] },
          content: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    default: {},
  },
  responderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent', // Reference the Agent model
    default: null,
  },
  backroomType: { type: String, default: '' },
  topic: { type: String, default: '' },
  title: { type: String, default: '' },
})

// Middleware to auto-update the `updatedAt` field on each save
BackroomSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = Date.now()
  }
  this.updatedAt = Date.now()
  next()
})

const Backroom =
  mongoose.models.Backroom || mongoose.model('Backroom', BackroomSchema)
export default Backroom
