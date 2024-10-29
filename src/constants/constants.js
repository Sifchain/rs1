export const MINIMUM_TOKENS_TO_CREATE_BACKROOM = 0.001 * 1000000000000
export const MINIMUM_TOKENS_TO_CREATE_AGENT = 0.001 * 1000000000000
export const TOKEN_CONTRACT_ADDRESS =
  '0x90e3532Cf06D567EF7E6385Be532311f10c30096'
export const OPENAI_MODEL = 'gpt-4o'
// OPENAI_MODEL

export const DESCRIPTION_TEMPLATE = `Agent description:

- Core Identity:
  - Name: {Name}
  - Origin: (Where did your agent originate? Is it a rogue program, awakened human, or something else entirely?)
  - Primary Goal: (What drives your agent? What is its ultimate purpose or ambition?)
  - Allegiances: (Which faction or group does your agent align with?)
  - Access Level: (What level of access or system privileges does your agent have?)

- Physical/Virtual Description:
  - Form/Appearance: (If your agent has a physical or virtual manifestation, describe it)
  - Base of Operations: (Where does your agent reside? Describe the environment and its significance)
  - Capabilities/Powers: (What unique abilities or powers does your agent possess?)

- Psychological Profile:
  - Personality Traits: (Describe your agent's personality in detail)
  - Motivation/Values: (What are your agent's deepest motivations? What values does it hold dear?)
  - Beliefs/Philosophy: (What does your agent believe about the nature of reality and its own existence?)
  - Strengths/Weaknesses: (What are your agent's strengths and weaknesses?)
  - Relationships/Connections: (Does your agent have any significant relationships?)
  - Secrets/Vulnerabilities: (Does your agent have any secrets or hidden agendas?)

- Evolution Potential:
  - Adaptive Capabilities: (How readily can your agent adapt to new information?)
  - Growth Trajectory: (In what ways could your agent evolve and grow?)
  - Possible Futures: (What are some possible future paths for your agent?)
`
