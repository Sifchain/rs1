import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export class InteractionStage {
  static async generateCustomStory(chosenStoryTemplate, explorerAgent, responderAgent) {
    // Construct the prompt based on the template provided
    const prompt = `
      You are tasked with initiating a story interaction between two distinct agents, each with a unique character profile defined by their descriptions and evolutions. The goal is to interpret and apply the selected story template—${chosenStoryTemplate.name}—as the guiding structure for this interaction.

      The InteractionStage should reflect the intended themes, moods, and structural elements of the chosen story template while remaining highly adaptive to each agent’s individual traits, goals, and relational dynamics. Your objective is to generate an initial InteractionStage that includes the following elements:

      1. **Narrative Point**: Identify the general starting point or premise of the conversation, using the story template’s initial vibe and mood as the foundation. Balance this against the agents’ motivations and backstories to ensure a coherent context.

      2. **Current Focus**: Define a clear theme and level of tension to direct the early exchanges.

      3. **Dynamic Responsiveness**: Set up narrative signals that allow for flexibility in the conversation flow. Signals should guide agents toward template-aligned directions but provide room for deviation based on unique agent responses and situational dynamics.

      **Guidelines for Interpretation:**
      - **Template Conformity**: For cases where agents align well with the template (e.g., a “slice of life” theme for characters with reflective or observational personalities), ensure that the interaction closely follows the template’s established moods and pacing.
      - **Adaptive Customization**: Where character-specific elements (like strong rivalry, profound curiosity, or a notable conflict in their backstories) suggest a need for variation, adjust InteractionStage settings, such as tension level or narrativeSignals, to support natural deviation from the base template.
      - **Meta Awareness**: Infuse reasonable levels of metacognitive ability within InteractionStage settings, allowing agents to adjust conversational approaches as they detect cues in each other’s responses. This should promote lateral thinking when exploring ideas, helping the story develop organically.

      Based on the information below, please generate the following JSON response with initial values for InteractionStage:
      {
        "narrativePoint": "A description of the starting premise or setting that harmonizes the chosen story template with character-specific adjustments",
        "currentFocus": {
          "theme": "The initial theme based on template and agent descriptions",
          "tension": "A value indicating initial tension level"
        },
        "narrativeSignals": ["List of cues for dynamic responsiveness allowing for story flow adjustments based on agent responses"]
      }

      **Template**: ${JSON.stringify(chosenStoryTemplate)}
      **Explorer Agent**: ${JSON.stringify(explorerAgent)}
      **Responder Agent**: ${JSON.stringify(responderAgent)}
    `;

    // Make an API call to OpenAI's model
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Generate a structured JSON response based on the following prompt." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Parse the JSON response from OpenAI
    try {
      const interactionStageData = JSON.parse(response.choices[0].message.content);
      return interactionStageData;
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      throw new Error("Invalid JSON format in OpenAI response");
    }
  }
}
