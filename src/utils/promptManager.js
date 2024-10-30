import fs from 'fs/promises'
import path from 'path'

class PromptManager {
  constructor(templatePath = path.join(process.cwd(), 'public', 'templates')) {
    this.templatePath = templatePath
    this.explorerTemplate = {}
    this.responderTemplate = {}
  }

  async loadTemplate(templateName, agentType) {
    const filePath = path.join(this.templatePath, `${templateName}.jsonl`)
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      // Parse the JSONL file
      this.explorerTemplate = JSON.parse(fileContent)[0]
      this.responderTemplate = JSON.parse(fileContent)[1]
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error)
    }
  }

  getTemplate(templateName) {
    return this.templates[templateName] || null
  }

  formatPrompt(template, agentData) {
    const { explorerAgent, responderAgent } = agentData

    const explorerDescription =
      explorerAgent.description || 'No description available'
    const terminalDescription =
      responderAgent.description || 'No description available'

    return {
      system_prompt: template.system_prompt || '',
      context: [
        `Explorer: ${explorerAgent.name}\nDescription: ${explorerDescription}\nPrompt: ${conversationPrompt}`,
        `Past Evolutions:\n${explorerAgent.evolutions || 'No evolutions available'}`,
        `Terminal: ${responderAgent.name}\nDescription: ${terminalDescription}`,
      ].filter(Boolean),
    }
  }
}

export default PromptManager
