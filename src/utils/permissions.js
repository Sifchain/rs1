import Agent from '../models/Agent'

// Check if the authenticated user owns the agent
export const checkAgentOwnership = async (agentId, userId) => {
  const agent = await Agent.findById(agentId)
  if (!agent) {
    throw new Error('Agent not found')
  }

  // Check if the userId matches the agent's owner
  if (agent.user.toString() !== userId.toString()) {
    throw new Error('You do not have permission to modify this agent')
  }

  return agent
}
