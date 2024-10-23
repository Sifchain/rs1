import Agent from '../models/Agent'

// Check if the authenticated user owns the agent
export const checkAgentOwnership = async (agentId, userId) => {
  if (!userId) {
    console.log('No user ID provided')
    return
  }
  const agent = await Agent.findById(agentId)
  if (!agent) {
    throw new Error('Agent not found')
  }

  // Check if the userId matches the agent's owner
  if (agent.user._id.toString() !== userId) {
    console.log('You do not have permission to modify this agent')
    throw new Error('You do not have permission to modify this agent')
  }

  return agent
}
