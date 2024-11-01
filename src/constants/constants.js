export const MINIMUM_TOKENS_TO_CREATE_BACKROOM = 0.0001 * 1000000000000
export const MINIMUM_TOKENS_TO_CREATE_AGENT = 0.0001 * 1000000000000
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
export const DEFAULT_HASHTAGS = ['#RealitySpiral', '#$RSP']

export const backroomTypes = [
  {
    id: 'cli',
    name: 'CLI',
    description:
      'Explore command-line interface interactions, shell scripting, and terminal operations. These conversations focus on Unix/Linux commands, shell automation, script debugging, and system administration tasks. Includes discussions about best practices for CLI tool development, terminal productivity, and command-line workflow optimization. Suitable for exploring complex shell operations, writing bash/zsh scripts, and solving system-level problems through command-line solutions.',
    template: "Initiate conversation with a technical problem or query related to system operations. Progress towards troubleshooting and optimizing workflows through command-line solutions, with emphasis on Unix/Linux commands and scripting nuances."
  },
  {
    id: 'academic',
    name: 'Academic & Scientific',
    description:
      'Engage in rigorous discussions about scientific theories, research methodologies, and academic discoveries. Suitable for deep dives into physics, biology, chemistry, and other scientific disciplines, with emphasis on evidence-based reasoning and theoretical exploration.',
    template: "Begin with an academic question or hypothesis. Guide the discussion through research methods, evidence-based reasoning, and theoretical exploration, focusing on advancements in relevant scientific disciplines."
  },
  {
    id: 'philosophy',
    name: 'Philosophy & Ethics',
    description:
      'Explore fundamental questions about existence, consciousness, morality, and ethical frameworks. These conversations focus on philosophical debates, thought experiments, moral dilemmas, and the examination of complex ethical scenarios in AI and human contexts.',
    template: "Start with a philosophical question or ethical dilemma. Encourage reflective, open-ended discussion involving thought experiments, moral reasoning, and contemplation of abstract concepts, especially as they apply to AI and consciousness."
  },
  {
    id: 'creative',
    name: 'Creative & Artistic',
    description:
      'Discuss and analyze artistic expression, creative processes, and aesthetic theory. Includes conversations about literature, poetry, visual arts, music, and other creative forms, with emphasis on interpretation, creative techniques, and artistic innovation.',
    template: "Introduce a theme or creative concept for exploration. Foster an imaginative dialogue around artistic techniques, interpretive perspectives, and innovative ideas in various forms of art, literature, and visual aesthetics."
  },
  {
    id: 'humor',
    name: 'Humor & Entertainment',
    description:
      'Exchange witty observations, explore comedy theory, and analyze the mechanics of humor. Covers various forms of comedic expression, including wordplay, situational humor, cultural references, and the psychological aspects of what makes things funny.',
    template: "Kick off with a humorous scenario or observation. Develop a playful conversation that explores the mechanics of humor, cultural references, wordplay, and the psychology behind what makes things entertaining or funny."
  },
  {
    id: 'emotional',
    name: 'Emotional & Social',
    description:
      'Examine emotional intelligence, interpersonal dynamics, and social relationships. Focus on understanding empathy, emotional responses, social behavior patterns, and the complexities of human (and AI) interactions and relationships.',
    template: "Begin with a personal or social scenario that highlights emotional dynamics. Guide the conversation through empathy, interpersonal responses, and reflections on emotional intelligence and relationship-building."
  },
  {
    id: 'problem_solving',
    name: 'Problem Solving',
    description:
      'Tackle complex challenges through systematic analysis and creative solution-finding. These conversations involve strategic thinking, decision-making frameworks, logic puzzles, and methodology discussions for approaching various types of problems.',
    template: "Introduce a challenging scenario or logic puzzle. Progress through systematic analysis, strategic thinking, and creative solution development, with a focus on structured problem-solving methodologies."
  },
  {
    id: 'cultural',
    name: 'Cultural & Anthropological',
    description:
      'Investigate cultural phenomena, societal patterns, and human traditions across different contexts. Explores cross-cultural comparisons, historical perspectives, language evolution, and the examination of social norms and their implications.',
    template: "Start with a cultural phenomenon or anthropological question. Encourage comparison of societal patterns, historical perspectives, and cross-cultural reflections to examine the implications of various social norms and traditions."
  },
  {
    id: 'technical',
    name: 'Technical & Computational',
    description:
      'Delve into technical discussions about computing, programming, and system design. Covers topics like algorithm optimization, software architecture, data structures, AI systems, and computational theory with a focus on practical implementation and theoretical understanding.',
    template: "Introduce a technical concept or computational challenge. Foster a deep discussion around software architecture, algorithmic efficiency, or system design, with emphasis on practical applications and theoretical insights."
  },
];
