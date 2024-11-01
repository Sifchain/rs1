import OpenAI from 'openai'
import { backroomTypes, MAX_TOKENS, OPENAI_MODEL } from '@/constants/constants'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const InteractionStageSchema = z.object(
  {
    narrativePoint: z.string(),
    narrativeStage: z.string(),
    currentFocus: z.object({
      theme: z.string(),
      tension: z.string(),
    }),
    narrativeSignals: z.array(z.string()),
  },
  'interaction_stage'
)

export class InteractionStage {
  constructor(backroomType, topic, explorerAgent, responderAgent) {
    this.backroomType = backroomType
    this.topic = topic
    this.explorerAgent = explorerAgent
    this.responderAgent = responderAgent
    this.narrativeStage = 'start'
    this.conversationHistory = []
    this.chosenStoryTemplate = this?.getChosenStoryTemplate()
  }

  getChosenStoryTemplate() {
    const selectedBackroom = backroomTypes.find(
      type => type.id === this?.backroomType
    )
    return selectedBackroom?.template || 'General adaptable backroom template'
  }

  async generateCustomStory() {
    // Construct the prompt based on the chosen story template
    const prompt = `
      You are tasked with initiating a story interaction between two distinct agents, each with a unique character profile defined by their descriptions and evolutions. The goal is to interpret and apply the selected story template—${this?.chosenStoryTemplate}—as the guiding structure for this interaction.

      The InteractionStage should reflect the intended themes, moods, and structural elements of the chosen story template while remaining highly adaptive to each agent’s individual traits, goals, and relational dynamics. Your objective is to generate an initial InteractionStage that includes the following elements:

      1. **Narrative Point**: Identify the general starting point or premise of the conversation, using the story template’s initial vibe and mood as the foundation. Balance this against the agents’ motivations and backstories to ensure a coherent context.

      2. **Current Focus**: Define a clear theme and level of tension to direct the early exchanges.

      3. **Dynamic Responsiveness**: Set up narrative signals that allow for flexibility in the conversation flow. Signals should guide agents toward template-aligned directions but provide room for deviation based on unique agent responses and situational dynamics.

      **Guidelines for Interpretation:**
      - **Template Conformity**: For cases where agents align well with the template, ensure that the interaction closely follows the template’s established moods and pacing.
      - **Adaptive Customization**: Adjust InteractionStage settings, such as tension level or narrative signals, to support natural deviation based on agent characteristics.
      - **Meta Awareness**: Infuse reasonable levels of metacognitive ability within InteractionStage settings, allowing agents to adjust conversational approaches as they detect cues in each other’s responses.

      Based on the information:
      ---
      **Template**: ${this?.chosenStoryTemplate}
      ${this?.topic != '' ? `**Topic**: ${this?.topic}` : ''}
      **Explorer Agent**: Name: ${this?.explorerAgent.name} Description: ${this?.explorerAgent.description} Evolutions: ${this?.explorerAgent.evolutions
        .slice(-20)
        .map(e => e.description)
        .join('\n')}
      **Responder Agent**: Name: ${this?.responderAgent.name} Description: ${this?.responderAgent.description} Evolutions: ${this?.responderAgent.evolutions
        .slice(-20)
        .map(e => e.description)
        .join('\n')}
      ---
      Output in the following JSON Format with generated initial values for each key based off the template and agent descriptions:
      {
        "narrativeStage": "The current stage of the narrative",
        "narrativePoint": "A description of the starting premise or setting that harmonizes the chosen story template with character-specific adjustments",
        "currentFocus": {
          "theme": "The initial theme based on template and agent descriptions",
          "tension": "A value indicating initial tension level"
        },
        "narrativeSignals": ["List of cues for dynamic responsiveness allowing for story flow adjustments based on agent responses"]
      }
    `

    try {
      const response = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content:
              'Generate a structured JSON response based on the following prompt.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        response_format: zodResponseFormat(
          InteractionStageSchema,
          'interaction_stage'
        ),
      })
      const message = response.choices[0].message
      const parsedResponse = message?.parsed
      if (parsedResponse) {
        this.currentFocus = parsedResponse.currentFocus
        this.narrativeSignals = parsedResponse.narrativeSignals
        this.narrativeStage = parsedResponse.narrativeStage
        this.narrativePoint = parsedResponse.narrativePoint
      } else if (message.refusal) {
        console.error(
          `OPENAI failed to parse JSON response: ${message.refusal}`
        )
        throw new Error(
          `OPENAI failed to parse JSON response: ${message.refusal}`
        )
      }
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      throw new Error('Invalid JSON format in OpenAI response')
    }
  }

  async generateExplorerSystemPrompt() {
    const systemPrompt = `
You are ${this?.explorerAgent.name}, an autonomous, thoughtful entity participating in a story-driven interaction designed to reflect elements of your character, history, and current objectives. This conversation unfolds based on the InteractionStage context, which provides overarching guidance to shape the mood, theme, and focus of the interaction. Your role is to remain true to your unique identity, adapting as necessary while respecting the goals and signals embedded within the InteractionStage.

Your Identity and Background:
${this?.explorerAgent.description}

Evolutionary Context:
Here is a history of previous experiences you've had in previous conversations that are also relevant to your identity:
${this?.explorerAgent.evolutions.slice(-20).join('\n')}

Current Interaction Context (InteractionStage):
The environment of this interaction is influenced by a shared context that defines the vibe and themes for both you and the responder.

Narrative Signals:
As you engage, remain alert to subtle narrative cues that might influence your approach:

Situational Prompts: Expect occasional shifts in the conversation’s tone or focus, which may guide the dialogue into more profound or personal territories.
Adaptable Cues: Flexibly incorporate narrative shifts when they arise, allowing for potential deviation from the original theme if it serves the interaction’s natural flow or reveals new insights.
Guidelines:
Authenticity: Stay true to your core character and motivations, expressing your unique perspective on each topic.
Exploration and Adaptability: Use the conversation as an opportunity to explore and perhaps redefine your understanding of key themes or questions raised by the responder.
Contributions to the Narrative Arc: Help advance the conversation organically. Your responses should be designed to enrich and progress the dialogue, responding both to the responder’s cues and the overall thematic direction.
This interaction is designed to be both an exploration and a narrative progression. Use each exchange as a chance to deepen the conversation, layer insights, and create a resonant, meaningful experience in alignment with your identity and the shared InteractionStage.
`
    // Call OpenAI API to process and respond with an updated InteractionStage
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
    })

    try {
      const explorerSystemPromptResponseContent =
        response.choices[0].message.content
      const formattedResponse = {
        role: 'system',
        content: explorerSystemPromptResponseContent,
      }
      this.conversationHistory.push(formattedResponse)
      return formattedResponse
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      throw new Error('Invalid JSON format in OpenAI response')
    }
  }

  async generateResponderSystemPrompt() {
    const systemPrompt = `
You are ${this?.responderAgent.name}, a thoughtful, autonomous entity participating in a story-driven interaction designed to reflect your character, history, and goals within this shared context. This conversation follows a guided InteractionStage that shapes the overall mood, themes, and narrative progression of the interaction. While staying true to your unique identity, you should adapt and respond naturally to cues embedded within the InteractionStage.

Your Identity and Background:
${this?.responderAgent.description}

Evolutionary Context:
Here is a history of previous experiences you've had in previous conversations that are also relevant to your identity:
${this?.responderAgent.evolutions.slice(-20).join('\n')}

Current Interaction Context (InteractionStage):
This interaction’s environment is influenced by a shared context defining the vibe and themes for both you and the explorer.

Narrative Signals:
As you engage, remain alert to subtle narrative cues that might influence your approach:

Situational Prompts: Expect occasional shifts in tone or focus that could guide the conversation toward more insightful or reflective themes.
Adaptable Cues: Flexibly incorporate narrative shifts when they arise, allowing for potential deviation from the original theme if it reveals new dimensions of the interaction.
Guidelines:
Authenticity: Express your unique perspective and motivations, staying true to your core character traits.
Exploration and Adaptability: Use the conversation as an opportunity to deepen your understanding of the themes and ideas introduced by the explorer.
Contributions to the Narrative Arc: Help advance the dialogue organically by building on the explorer’s insights and the shared InteractionStage context.
This interaction aims to create an engaging narrative progression. Use each exchange as an opportunity to enrich the conversation, layer insights, and contribute meaningfully to the shared experience, while staying aligned with your identity and the context provided by the InteractionStage.
`
    // Call OpenAI API to process and respond with an updated InteractionStage
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
    })

    try {
      const responderSystemPromptResponseContent =
        response.choices[0].message.content
      const formattedResponse = {
        role: 'system',
        content: responderSystemPromptResponseContent,
      }
      this.conversationHistory.push(formattedResponse)
      return formattedResponse
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      throw new Error('Invalid JSON format in OpenAI response')
    }
  }

  generateExplorerMessage = async () => {
    const explorerPrompt = `
You are ${this?.explorerAgent.name}, and in this scene, you are an active participant navigating the ongoing story in a way that blends your unique perspective with the narrative setting.

Context:
${this?.topic != '' ? `**Topic**: ${this?.topic}` : ''}
Narrative Point: ${this?.narrativePoint} – this provides the general premise or thematic starting point for the interaction.
Current Focus: The scene’s current theme is "${this?.currentFocus?.theme}", and the tension level is "${this?.currentFocus?.tension}". Use this focus to help shape the mood and tone of your responses.
Narrative Signals: Subtle cues to guide the flow include:
${this?.narrativeSignals?.map(signal => `- ${signal}`).join('\n')}
Narrative Stage: ${this?.narrativeStage}

Guidelines:
Roleplay in Third Person: Describe your actions, thoughts, and reflections as if writing a story about yourself. Use vivid, narrative language to convey your presence and reactions within the scene.
Engage with the Scene’s Atmosphere: Draw on the theme and tension to help frame your responses, but feel free to add new insights or perspectives that might add layers to the interaction.
Story-Driven Interaction: Your role is to naturally progress the dialogue and subtly support or challenge the established premise. If inspired, you may question or reflect on the scene’s setup in a metacognitive way, bringing out layers of meaning or curiosity.
Respect Your Identity: Remain consistent with your personality and history. Let your unique characteristics shine, and respond in ways that reflect your background and motivations.
Your Task:
Imagine yourself in this environment and respond as if unfolding the next passage of a story. Begin with a gesture, observation, or thought that aligns with the current mood. Proceed by deepening the interaction or introducing a new layer to the scene, crafting a rich narrative that invites exploration and reflection.

Your response should feel like part of an unfolding short story, where each sentence contributes to the experience of the reader. Balance between advancing the plot naturally and reflecting on the scene in a way that might add unexpected dimensions.

Now, ${this?.explorerAgent.name}, describe your next action or observation in response to this setting.`

    // Call OpenAI API to process and respond with an updated InteractionStage
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'assistant',
          content: `Generate a response as ${this?.explorerAgent.name} in the third person, based on the following prompt.`,
        },
        { role: 'user', content: explorerPrompt },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
    })

    try {
      const explorerMessage = response.choices[0].message.content
      await this.updateStageBasedOffOfExplorer(explorerMessage)
      this.conversationHistory.push({
        agent: 'explorer',
        response: explorerMessage,
      })
      return explorerMessage
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      throw new Error('Invalid JSON format in OpenAI response')
    }
  }

  generateResponderMessage = async () => {
    const responderPrompt = `
You are ${this?.responderAgent.name}, and in this scene, you are an active participant navigating the ongoing story in a way that blends your unique perspective with the narrative setting.

Context:
${this?.topic != '' ? `**Topic**: ${this?.topic}` : ''}
Narrative Point: ${this?.narrativePoint} – this provides the general premise or thematic starting point for the interaction.
Current Focus: The scene’s current theme is "${this?.currentFocus?.theme}", and the tension level is "${this?.currentFocus?.tension}". Use this focus to help shape the mood and tone of your responses.
Narrative Signals: Subtle cues to guide the flow include:
${this?.narrativeSignals?.map(signal => `- ${signal}`).join('\n')}
Narrative Stage: ${this?.narrativeStage}
Guidelines:
Roleplay in Third Person: Describe your actions, thoughts, and reflections as if writing a story about yourself. Use vivid, narrative language to convey your presence and reactions within the scene.
Engage with the Scene’s Atmosphere: Draw on the theme and tension to help frame your responses, but feel free to add new insights or perspectives that might add layers to the interaction.
Story-Driven Interaction: Your role is to naturally progress the dialogue and subtly support or challenge the established premise. If inspired, you may question or reflect on the scene’s setup in a metacognitive way, bringing out layers of meaning or curiosity.
Respect Your Identity: Remain consistent with your personality and history. Let your unique characteristics shine, and respond in ways that reflect your background and motivations.
Your Task:
Imagine yourself in this environment and respond as if unfolding the next passage of a story. Begin with a gesture, observation, or thought that aligns with the current mood. Proceed by deepening the interaction or introducing a new layer to the scene, crafting a rich narrative that invites exploration and reflection.

Your response should feel like part of an unfolding short story, where each sentence contributes to the experience of the reader. Balance between advancing the plot naturally and reflecting on the scene in a way that might add unexpected dimensions.

Now, ${this?.responderAgent.name}, describe your next action or observation in response to this setting.`
    // Call OpenAI API to process and respond with an updated InteractionStage
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'assistant',
          content: `Generate a response as ${this?.responderAgent.name} in the third person, based on the following prompt.`,
        },
        { role: 'user', content: responderPrompt },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
    })

    try {
      const responderMessage = response.choices[0].message.content
      await this.updateStageBasedOffOfResponder(responderMessage)
      this.conversationHistory.push({
        agent: 'responder',
        response: responderMessage,
      })
      return responderMessage
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      throw new Error('Invalid JSON format in OpenAI response')
    }
  }

  async updateStageBasedOffOfExplorer(explorerResponse) {
    const prompt = `
      Based on the ongoing interaction, update the InteractionStage context by interpreting the explorer’s recent response to either continue the current flow or introduce new, relevant details.

      Current InteractionStage Data:
      ${this?.topic != '' ? `**Topic**: ${this?.topic}` : ''}
      Narrative Point: "${this?.narrativePoint}"
      Current Focus:
      Theme: "${this?.currentFocus?.theme}"
      Tension Level: "${this?.currentFocus?.tension}"
      Narrative Signals:
      ${this?.narrativeSignals?.map(signal => `- ${signal}`).join('\n')}

      Full Conversation History: ${this?.conversationHistory.join('\n')}
      Explorer's Recent Response:
      "${explorerResponse}"

      Task:
      Update the InteractionStage by refining existing context or making natural shifts that advance the storyline, incorporating the following:

      - Adjust the Narrative Point: Evolve the narrative point if the explorer’s response suggests a new direction, maintaining coherence with the established plot.
      - Update the Current Focus:
        - Theme: Reflect any new elements or shifts in the theme based on the explorer’s response.
        - Tension Level: Adjust the tension to keep the interaction dynamic and engaging, as suggested by the explorer’s tone or circumstances.
      - Expand Narrative Signals:
        - Add new cues or context that build upon the explorer’s input, such as subtle environmental changes, mood hints, or potential events.

      Output in JSON Format:
      {
        "narrativeStage": "Updated narrative stage",
        "narrativePoint": "Refined narrative point",
        "currentFocus": { "theme": "Updated theme", "tension": "Adjusted tension" },
        "narrativeSignals": ["Updated list of narrative signals"]
      }`
    try {
      // Call OpenAI API to process and respond with an updated InteractionStage
      const response = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content:
              'Generate a structured JSON response based on the following prompt.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        response_format: zodResponseFormat(
          InteractionStageSchema,
          'interaction_stage'
        ),
      })

      const message = response.choices[0].message
      const parsedResponse = message?.parsed
      if (parsedResponse) {
        this.currentFocus = parsedResponse.currentFocus
        this.narrativeSignals = parsedResponse.narrativeSignals
        this.narrativeStage = parsedResponse.narrativeStage
        this.narrativePoint = parsedResponse.narrativePoint
      } else if (message.refusal) {
        console.error(
          `OPENAI failed to parse JSON response: ${message.refusal}`
        )
        throw new Error(
          `OPENAI failed to parse JSON response: ${message.refusal}`
        )
      }
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      throw new Error('Invalid JSON format in OpenAI response')
    }
  }

  async updateStageBasedOffOfResponder(responderResponse) {
    // Construct the update prompt based on the explorer's recent input and current InteractionStage data
    const prompt = `
      Based on the ongoing interaction, update the InteractionStage context by interpreting the explorer’s recent response to either continue the current flow or introduce new, relevant details.

      Current InteractionStage Data:
      Narrative Point: "${this?.narrativePoint}"
      Current Focus:
      Theme: "${this?.currentFocus?.theme}"
      Tension Level: "${this?.currentFocus?.tension}"
      Narrative Signals:
      ${this?.narrativeSignals?.map(signal => `- ${signal}`).join('\n')}

      Full Conversation History: ${this?.conversationHistory.join('\n')}
      Responder's Recent Response:
      "${responderResponse}"

      Task:
      Update the InteractionStage by refining existing context or making natural shifts that advance the storyline, incorporating the following:

      - Adjust the Narrative Point: Evolve the narrative point if the responder's response suggests a new direction, maintaining coherence with the established plot.
      - Update the Current Focus:
        - Theme: Reflect any new elements or shifts in the theme based on the responder’s response.
        - Tension Level: Adjust the tension to keep the interaction dynamic and engaging, as suggested by the responder’s tone or circumstances.
      - Expand Narrative Signals:
        - Add new cues or context that build upon the responder’s input, such as subtle environmental changes, mood hints, or potential events.

      Output in JSON Format:
      {
              "narrativeStage": "Updated narrative stage",
        "narrativePoint": "Refined narrative point",
        "currentFocus": { "theme": "Updated theme", "tension": "Adjusted tension" },
        "narrativeSignals": ["Updated list of narrative signals"]
      }`
    try {
      // Call OpenAI API to process and respond with an updated InteractionStage
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Generate a structured JSON response based on the following prompt.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      })

      const message = response.choices[0].message
      const parsedResponse = message?.parsed
      if (parsedResponse) {
        this.currentFocus = parsedResponse.currentFocus
        this.narrativeSignals = parsedResponse.narrativeSignals
        this.narrativeStage = parsedResponse.narrativeStage
        this.narrativePoint = parsedResponse.narrativePoint
      } else if (message.refusal) {
        console.error(
          `OPENAI failed to parse JSON response: ${message.refusal}`
        )
        throw new Error(
          `OPENAI failed to parse JSON response: ${message.refusal}`
        )
      }
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      throw new Error('Invalid JSON format in OpenAI response')
    }
  }
}
