import fs from 'fs/promises'
import path from 'path'

class PromptManager {
  constructor(
    backroomType,
    explorerAgent,
    responderAgent,
    templatePath = path.join(process.cwd(), 'public', 'templates')
  ) {
    this.templatePath = templatePath
    this.backroomType = backroomType
    this.explorerAgent = explorerAgent
    this.responderAgent = responderAgent
    this.templates = {
      explorer: null,
      responder: null
    }
  }

  /**
   * Maps backroom types to template files
   * @private
   * Static mapping between backroom types and corresponding template filenames.
   */
  static templateMapping = {
    cli: "cli",
    academic: 'academic_discussion',
    philosophy: 'philosophical_debate',
    creative: 'creative_exploration',
    humor: 'humor_exchange',
    emotional: 'emotional_interaction',
    problem_solving: 'problem_solving',
    cultural: 'cultural_analysis',
    technical: 'technical_discussion'
  }

  /**
   * Loads the appropriate template based on the backroom type selected.
   * It reads a JSONL file that contains the explorer and responder templates.
   * The templates are then assigned to their respective properties.
   */
  async loadTemplate() {
    const templateName = PromptManager.templateMapping[this.backroomType]
    if (!templateName) {
      throw new Error(`No template mapping found for backroom type: ${this.backroomType}`)
    }

    const filePath = path.join(this.templatePath, `${templateName}.jsonl`)

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const templates = fileContent
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line)) // Split and parse each line as JSON

      // Assigning templates to explorer and responder agents
      this.templates.explorer = templates[0]
      this.templates.responder = templates[1]

      console.log(`Template "${templateName}" loaded successfully.`)
      this.formatPrompt() // Call to format the prompt after loading
      return {
        explorerTemplate: this.templates.explorer,
        responderTemplate: this.templates.responder
      }

    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error)
      throw error // Rethrow error for external handling
    }
  }

  /**
   * Formats the agent data for interpolation into the templates.
   * Adds a default description and evolutions if they are missing from the agent object.
   * @private
   */
  formatAgentData(agent, role) {
    return {
      name: agent.name,
      description: agent.description || `${role} description not provided.`,
      evolutions: agent.evolutions || 'No evolutions available',
    }
  }

  /**
   * Formats the final prompt by interpolating agent data into the loaded templates.
   * Ensures that the templates have been loaded before formatting.
   * Throws an error if templates are missing.
   */
  formatPrompt() {
    if (!this.templates.explorer || !this.templates.responder) {
      throw new Error('Templates not loaded. Call loadTemplate() first.')
    }

    // Gather formatted data for explorer and responder agents
    const explorerData = this.formatAgentData(this.explorerAgent, 'Explorer')
    const responderData = this.formatAgentData(this.responderAgent, 'Responder')

    // Interpolate data into the explorer template
    this.templates.explorer.content = this.interpolateTemplate(this.templates.explorer, explorerData)

    // Interpolate data into the responder template
    this.templates.responder.content = this.interpolateTemplate(this.templates.responder, responderData)

    console.log('Formatted templates:', {
      explorer: this.templates.explorer,
      responder: this.templates.responder
    })
  }

  /**
   * Interpolates agent data into a template string.
   * Replaces placeholders like ${name}, ${description}, and ${evolutions} with actual agent data.
   * @param {string} templateContent - The template string with placeholders.
   * @param {object} agentData - The agent data to interpolate.
   * @private
   */
  interpolateTemplate(templateContent, agentData) {
    return templateContent
      .replace(/\${name}/g, agentData.name)
      .replace(/\${description}/g, agentData.description)
      .replace(/\${evolutions}/g, agentData.evolutions)
  }
}

export default PromptManager
