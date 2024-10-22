import mongoose from 'mongoose'

const BackroomSchema = new mongoose.Schema({
  agentName: { type: String, required: true },
  explorerAgentName: { type: String, required: true },
  explorerDescription: { type: String, default: '' },
  terminalAgentName: { type: String, required: true },
  terminalDescription: { type: String, default: '' },
  content: { type: String, required: true },
  snippetContent: { type: String, default: '' },
  tags: { type: [String], default: [] },
  sessionDetails: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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
