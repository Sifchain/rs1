import Backroom from '@/models/Backroom'
import Agent from '@/models/Agent'
import { InteractionStage } from '@/utils/InteractionStage'

export async function continueStory(backroomId, pollTweetId, winningOption) {
  const backroom = await Backroom.findById(backroomId)
  if (!backroom) throw new Error('Backroom not found')

  const explorer = await Agent.findById(backroom.explorerId)
  const responder = await Agent.findById(backroom.responderId)
  if (!explorer || !responder) throw new Error('Agent not found')

  const {
    narrativeStage,
    narrativePoint,
    currentFocus,
    narrativeSignals,
    conversationHistory,
  } = backroom.backroomState
  const interactionStage = new InteractionStage(
    backroom.backroomType,
    backroom.topic,
    explorer,
    responder,
    narrativeStage,
    narrativePoint,
    currentFocus,
    narrativeSignals,
    conversationHistory
  )
  interactionStage.setStageState(backroom.backroomState)

  let explorerMessageHistory = conversationHistory.filter(
    entry => entry.role === 'assistant'
  )
  let responderMessageHistory = conversationHistory.filter(
    entry => entry.role === 'user'
  )

  for (let i = 0; i < 2; i++) {
    const explorerMessage = await interactionStage.generateExplorerMessage()
    explorerMessageHistory.push({ role: 'assistant', content: explorerMessage })
    responderMessageHistory.push({ role: 'user', content: explorerMessage })

    const responderMessage = await interactionStage.generateResponderMessage()
    explorerMessageHistory.push({ role: 'user', content: responderMessage })
    responderMessageHistory.push({
      role: 'assistant',
      content: responderMessage,
    })
  }

  const newContent = explorerMessageHistory
    .slice(1)
    .map(
      entry =>
        `${entry.role === 'user' ? responder.name : explorer.name}: ${entry.content}`
    )
    .join('\n')

  backroom.content += `\n\nWinning Option: ${winningOption}\nContinuation:\n${newContent}`
  backroom.backroomState = interactionStage.getStageState()
  // Need to find the poll by tweetId and update its selectedOption
  console.log(backroom.polls)
  console.log(pollTweetId)
  console.log(winningOption)
  const poll = backroom.polls.find(p => p.tweetId === pollTweetId)
  if (!poll) throw new Error('Poll not found')
  poll.selectedOption = winningOption
  await backroom.save()
  // TODO: Need to test more to make sure newContent is correct and need to render the poll
  return newContent
}
