// pages/api/backroom/continue.js
import Backroom from '@/models/Backroom'
import Agent from '@/models/Agent'
import { connectDB } from '@/utils/db'
import { InteractionStage } from '@/utils/InteractionStage'

export default async function handler(req, res) {
  await connectDB()

  const {
    backroomId,
    question,
    selectedOption,
    results,
    explorerAgentId,
    responderAgentId,
  } = req.body

  if (!backroomId || !selectedOption || !explorerAgentId || !responderAgentId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const backroom = await Backroom.findById(backroomId)
    if (!backroom) {
      return res.status(404).json({ error: 'Backroom not found' })
    }

    const explorer = await Agent.findById(explorerAgentId)
    const responder = await Agent.findById(responderAgentId)
    if (!explorer || !responder) {
      return res.status(404).json({ error: 'Agent not found' })
    }

    // Initialize InteractionStage with the backroom content and selected option
    const interactionStage = new InteractionStage(
      backroom.backroomType,
      backroom.topic,
      explorer,
      responder
    )
    await interactionStage.generateCustomStory()
    // THIS NEEDS TO BE UPDATED TO USE THE EXISTING STORY INSTEAD OF GENERATING A NEW ONE
    let explorerMessageHistory = [
      await interactionStage.generateExplorerSystemPrompt(),
    ]
    let responderMessageHistory = [
      await interactionStage.generateResponderSystemPrompt(),
    ]

    // Generate two rounds of conversation between explorer and responder
    for (let i = 0; i < 2; i++) {
      const explorerMessage = await interactionStage.generateExplorerMessage()
      explorerMessageHistory.push({
        role: 'assistant',
        content: explorerMessage,
      })
      responderMessageHistory.push({
        role: 'user',
        content: explorerMessage,
      })

      const responderMessage = await interactionStage.generateResponderMessage()
      explorerMessageHistory.push({
        role: 'user',
        content: responderMessage,
      })
      responderMessageHistory.push({
        role: 'assistant',
        content: responderMessage,
      })
    }

    // Combine the new conversation into the backroom content
    const conversationContentArray = explorerMessageHistory
      .slice(1) // Remove the initial system prompts
      .map(
        entry =>
          `${entry.role === 'user' ? responder.name : explorer.name}: ${entry.content}`
      )
    const newContent = conversationContentArray.join('\n')

    // Append the conversation continuation to the backroom
    backroom.content += `\n\nSelected Option: ${selectedOption}\nContinuation:\n${newContent}`
    await backroom.save()

    res.status(200).json({
      message: 'Story continued successfully',
      continuation: newContent,
    })
  } catch (error) {
    console.error('Error continuing story:', error)
    res.status(500).json({ error: 'Failed to continue story' })
  }
}
