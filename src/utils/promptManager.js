import fs from 'fs/promises';
import path from 'path';

class PromptManager {
  constructor(templatePath = path.join(process.cwd(), 'public', 'templates')) {
    this.templatePath = templatePath;
    this.templates = {};
  }

  async loadTemplate(templateName) {
    const filePath = path.join(this.templatePath, `${templateName}.json`);
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      this.templates[templateName] = JSON.parse(fileContent);
      console.log(`Template "${templateName}" loaded successfully.`);
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
    }
  }

  getTemplate(templateName) {
    return this.templates[templateName] || null;
  }

  formatPrompt(template, agentData) {
    const { explorerAgent, responderAgent } = agentData;

    const explorerDescription = explorerAgent.description || 'No description available';
    const terminalDescription = responderAgent.description || 'No description available';
    const conversationPrompt = explorerAgent.customPrompt || 'No custom prompt available';

    return {
      system_prompt: template.system_prompt || '',
      context: [
        `Explorer: ${explorerAgent.name}\nDescription: ${explorerDescription}\nPrompt: ${conversationPrompt}`,
        `Past Evolutions:\n${explorerAgent.evolutions || 'No evolutions available'}`,
        `Terminal: ${responderAgent.name}\nDescription: ${terminalDescription}`,
      ].filter(Boolean),
    };
  }
}

export default PromptManager;
