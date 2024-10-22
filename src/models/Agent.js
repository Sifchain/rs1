import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  traits: { type: String, required: true },
  focus: { type: String, required: true },
  description: { type: String, default: '' },
  evolutions: { type: [String], default: [] },
});

const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema);
export default Agent;
