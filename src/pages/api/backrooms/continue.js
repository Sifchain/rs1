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
    explorerAgentId,
    responderAgentId,
  } = req.body

  if (
    !backroomId ||
    !selectedOption ||
    !explorerAgentId ||
    !responderAgentId ||
    !question
  ) {
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

    // Reinitialize InteractionStage with saved state and history
    const interactionStage = new InteractionStage(
      backroom.backroomType,
      backroom.topic,
      explorer,
      responder
    )
    interactionStage.setStageState(backroom.backroomState)
    let explorerMessageHistory = [
      await interactionStage.generateExplorerSystemPrompt(),
    ]
    let responderMessageHistory = [
      await interactionStage.generateResponderSystemPrompt(),
    ]

    for (let i = 0; i < 2; i++) {
      const explorerMessage = await interactionStage.generateExplorerMessage()
      explorerMessageHistory.push({
        role: 'assistant',
        content: explorerMessage,
      })
      responderMessageHistory.push({ role: 'user', content: explorerMessage })

      const responderMessage = await interactionStage.generateResponderMessage()
      explorerMessageHistory.push({ role: 'user', content: responderMessage })
      responderMessageHistory.push({
        role: 'assistant',
        content: responderMessage,
      })
    }

    const conversationContentArray = explorerMessageHistory
      .slice(1)
      .map(
        entry =>
          `${entry.role === 'user' ? responder.name : explorer.name}: ${entry.content}`
      )
    const newContent = conversationContentArray.join('\n')

    // Append continuation to `Backroom`
    backroom.content += `\n\nQuestion: ${question} Selected Option: ${selectedOption}\nContinuation:\n${newContent}`
    backroom.backroomState = interactionStage.getStageState() // Update state
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
