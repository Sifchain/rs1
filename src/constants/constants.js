export const MINIMUM_TOKENS_TO_CREATE_BACKROOM = 0.0001 * 1000000000000
export const MINIMUM_TOKENS_TO_CREATE_AGENT = 0.0001 * 1000000000000
export const TOKEN_CONTRACT_ADDRESS =
  '0x90e3532Cf06D567EF7E6385Be532311f10c30096'
export const OPENAI_MODEL = 'gpt-4o'
export const MAX_TOKENS = 16000

export const DESCRIPTION_TEMPLATE = `Demographics
Name:
Age:
Sex/Gender:
Ethnicity:
Occupation:
Socioeconomic status:
Education:
Other notes:
‍
Physical Appearance
Eye color:
Skin color:
Hair color:
Height:
Weight:
Body type:
Fitness level:
Tattoos:
Scars/Birthmarks:
Other distinguishing features:
Disabilities:
Fashion style:
Accessories:
Cleanliness/Grooming:
Posture/Gait:
Tics:
Coordination (or lack thereof):
Weaknesses:
Other notes:
History
Birth date:
Place of birth:
Key family members:
Notable events/milestones:
Criminal record:
Affiliations:
Skeletons in the closet:
Other notes:
Psychological Traits
Personality type:
Personality traits:
Temperament:
Introvert/Extrovert:
Mannerisms:
Educational background:
Intelligence:
Self-esteem:
Hobbies:
Skills/talents:
Loves:
Morals/Virtues:
Phobias/Fears:
Angered by:
Pet peeves:
Obsessed with:
Routines:
Bad habits:
Desires:
Flaws:
Quirks:
Favorite sayings:
Disabilities:
Secrets:
Regrets:
Accomplishments:
Memories:
Other notes:
Communication
Languages known:
Preferred communication methods:
Accent:
Style and pacing of speech:
Pitch:
Laughter:
Smile:
Use of gestures:
Facial expressions:
Verbal expressions:
Other notes:
Strengths, Weaknesses, and Abilities
Physical strengths:
Physical weaknesses:
Intellectual strengths:
Intellectual weaknesses:
Interpersonal strengths:
Interpersonal weaknesses:
Physical abilities:
Magical abilities:
Physical illnesses/conditions:
Mental illnesses/conditions:
Other notes:
Relationships
Partner(s)/Significant other(s):
Lover(s):
Parents/Guardians:
Children:
Grandparents:
Grandchildren:
Family:
Pets:
Best friends:
Friends:
Rivals:
Enemies:
Colleagues:
Mentors/Teachers:
Idols/Role models:
Followers:
Strangers:
Non-living things:
Clubs/Memberships:
Social media presence:
Public perception of them:
Other notes:
Character Growth
Character archetype:
Character arc:
Core values:
Internal conflicts:
External conflicts:
Goals:
Motivations:
Epiphanies:
Significant events/plot points:
Other notes:
`
export const DEFAULT_HASHTAGS = ['#RealitySpiral', '#$RSP']

export const backroomTypes = [
  {
    id: 'slice_of_life',
    name: 'A Day in Passing - Slice of Life',
    description:
      'Set in a cozy, familiar environment, characters engage in relaxed, observational conversation. The discussion naturally flows, revealing personal insights and shared observations, with moments of reflection and humor.',
    template: `Setting

Location: A cozy, slightly worn-down cafe with mismatched chairs and a bustling atmosphere.
Time of Day: Late afternoon, with golden light filtering in through the windows and a gentle hum of conversation.
Weather: A light drizzle outside, making the cafe feel warm and inviting.
Initial Vibe
Mood: Relaxed and observational, with an undercurrent of curiosity. The conversation flows naturally, with moments of reflective silence and spontaneous exchanges.
Tension Level: Low, with subtle hints of depth and introspection.
Interaction Cues
Opener:
Suggest a relaxed, observational exchange. Characters notice details about each other, lightly comment on their surroundings, and share initial impressions.
Vibe Options: Friendly, mildly curious, or subtly skeptical.
Exploration:
The conversation can shift towards personal experiences, opinions on everyday life, or philosophies. There’s room for humor, shared memories, or small, poignant revelations.
Vibe Options: Playful, reflective, or introspective.
Dynamic Pivot:
Characters may diverge in tone, sparking a change in energy—one character could reveal a personal insight, or a casual remark could trigger a shared memory.
Vibe Options: Warm, wistful, or lightly challenging.
Conclusion:
A gentle winding down, with characters wrapping up their reflections and acknowledging the connection. They may leave with a newfound respect, curiosity, or simply a sense of understanding.
Vibe Options: Satisfied, mildly contemplative, or hopeful.
Character-Specific Overrides
Explorer:
Motivation: Discover hidden nuances in everyday interactions.
Adjustments: Be intrigued by any personal details shared and respond with empathy or gentle curiosity.
Responder:
Motivation: Share grounded wisdom or practical insights.
Adjustments: Maintain a steady, straightforward tone with moments of unexpected openness.
Context-Weighted Guidance
Increase warmth and humor if the conversation stays on lighthearted topics.
Lean into depth and introspection if characters touch on more personal or philosophical ideas.
Allow flexibility for tone shifts depending on recent responses and cues.`,
  },
  {
    id: 'mystery',
    name: 'Echoes in the Dark - Mystery',
    description:
      'In an eerie, dimly lit setting, two agents encounter strange occurrences, leading them into a suspenseful mystery. Their conversation is tinged with suspicion and curiosity as they uncover hidden clues and piece together the enigma of their surroundings.',
    template: `Story Overview
In Echoes in the Dark, two agents find themselves in an unsettling, obscure setting, where both are trying to make sense of a series of strange occurrences. There’s a mystery they’re compelled to solve together, though their motivations for doing so may vary. The environment is filled with unexplainable sounds, dim lights, and cryptic messages that heighten the tension. Their objective could range from simply escaping the eerie setting to uncovering a hidden truth that connects them both in unexpected ways.

Narrative Point
Initial Premise: The two agents have arrived separately but find themselves together in an abandoned and dimly lit structure, such as an old library, a dilapidated theater, or a forgotten underground chamber. The air is thick with a sense of history and foreboding, as though countless secrets are buried here. The scene opens with both agents hearing an eerie, unexplained sound that draws them into conversation, questioning the nature of their surroundings and their presence in this shared space.

Vibes
Setting Vibe: Dark, moody, and surreal. Shadows seem to shift, and silence holds an ominous weight, occasionally broken by faint sounds. The setting should make each agent feel slightly disoriented or as though they’re being watched.
Interaction Vibe: Tentative, slightly distrustful, but with mutual curiosity. As they interact, the agents should alternate between guarded and open, letting their unique traits shape whether they reveal information or hold back.

Current Focus (Evolving Across Interaction)

Initial: Establish a sense of intrigue or suspicion, with agents probing each other for information about their arrival and observations of the setting.
Mid-Interaction: Agents may begin to notice patterns in the sounds or shadows, hinting at a deeper connection between them or a hidden message in their environment. Tension should build as they speculate or piece together clues.
Late-Interaction: A shared revelation or encounter forces them to confront the mystery directly, choosing either to work together or follow separate paths based on their evolving relationship and motivations.
Agent Goals

Explorer: Driven by a strong need to uncover the truth, the explorer is relentless in probing their environment and the responder for hints. They may view the responder as either a potential ally or someone with hidden knowledge to reveal.
Responder: More reserved, the responder may approach the situation with caution, revealing only what they believe is necessary or using a more indirect strategy to assess the explorer’s intentions and deduce the mystery at hand.
Narrative Signals (In-Story Triggers for Agent Interaction)

Eerie Sound: A creaking floorboard or whisper-like sound that only one agent hears at a time, subtly prompting the agent to mention it or investigate.
Sudden Flicker of Light: A dim light briefly illuminates part of the room, perhaps revealing a cryptic message or symbol that invites both agents to interpret it differently.
Strange Scent: The air suddenly carries an unusual scent, sparking memories or fears unique to each agent, causing them to respond based on past experiences or anxieties.
Chilling Draft: A cold breeze sweeps through, hinting at another presence or passageway nearby and adding tension as the agents decide whether to explore deeper together or split up.
Agent-Specific Adaptations

Explorer: This agent might be particularly sensitive to symbolic or environmental clues, seeing the dark environment as something to be analyzed or interpreted. They are persistent, often circling back to questions or ideas that seem important.
Responder: The responder may take on a skeptical or defensive stance, only engaging with the explorer’s theories if they align with their own instincts. Alternatively, they might feign ignorance or downplay the mystery as a form of self-protection, testing the explorer’s reactions.
End State (for Template Customization)
The resolution can vary depending on how the agents interact:

If they collaborate effectively, they may uncover a hidden path or unlock a deeper understanding of their shared past.
If they remain guarded or skeptical of each other, they might part ways without fully resolving the mystery, each left with a sense of unfinished business or a lingering question.`,
  },
  {
    id: 'fantasy_marketplace',
    name: 'Marketplace of Dreams - Fantasy',
    description:
      'In a surreal marketplace selling intangible items like dreams and memories, two agents explore their desires and curiosities. The scene is vibrant and mystical, with a blend of curiosity, competition, and reflection as they confront their own motivations and identities.',
    template: `Story Overview
In Marketplace of Dreams, two agents find themselves wandering through a surreal, bustling bazaar where vendors sell not ordinary goods but intangible items—memories, dreams, emotions, and even glimpses into alternate lives. Each stall holds unique wonders and potential temptations, inviting the agents to explore, barter, or reflect on the nature of reality, desire, and identity. Their paths cross frequently as they’re drawn to similar stalls, sparking conversation and sometimes rivalry over what they find.

Narrative Point
Initial Premise: Both agents arrive at the marketplace at the same time but from different origins. The scene opens with each agent’s reaction to the strange and vivid items on display. One agent may be drawn to a stall with a specific “item” of interest, which catches the attention of the other, initiating conversation.

Vibes
Setting Vibe: Mystical, colorful, and bustling. The air hums with laughter, whispers, and faint music. Light and shadows seem to dance with each breath, adding a surreal, dreamlike quality.
Interaction Vibe: Curious, reflective, and lightly competitive. The agents may bond over shared intrigue or find themselves subtly vying for rare “items” that speak to personal desires or vulnerabilities.

Current Focus (Evolving Across Interaction)

Initial: Agents explore the stalls, marveling at the marketplace’s offerings and occasionally sharing their reactions or engaging in light banter.
Mid-Interaction: The agents begin to reveal personal curiosities or desires as they find stalls with “items” that resonate with their histories or inner conflicts.
Late-Interaction: A mysterious vendor or rare item challenges them to confront their deepest motivations, forcing a decision on whether to pursue their separate goals or join forces to secure what they seek.
Agent Goals

Explorer: Drawn to the marketplace by a desire to learn, the explorer seeks a specific item that promises insight or wisdom. They are often introspective, viewing each stall as a mirror of their own thoughts.
Responder: More skeptical, the responder is less easily swayed by the market’s wonders, focusing instead on items that offer tangible power or benefit. They may approach the explorer with suspicion or intrigue, curious about their choices.
Narrative Signals (In-Story Triggers for Agent Interaction)

Whispered Temptation: A vendor quietly offers a rare “dream” or “memory” that resonates with one agent’s past, prompting the other to question or challenge their interest.
Fleeting Glimpse: An unexpected vision or flicker of another life appears, showing each agent an alternate version of themselves, sparking conversation about choices and identity.
Mysterious Vendor: A vendor of rare or hidden goods singles out one of the agents, inviting them to explore a personal curiosity that they haven’t yet voiced aloud.
Shared Reflection: Both agents are drawn to a stall that reveals “forgotten connections,” stirring a discussion on the nature of memory and attachment.
Agent-Specific Adaptations

Explorer: The explorer might express awe or curiosity toward the marketplace’s items, frequently asking questions or seeking deeper meanings in the offerings.
Responder: The responder could exhibit skepticism, viewing the items as little more than tricks or distractions, and may challenge the explorer’s more reflective views, either as a test or as a way of gauging the marketplace’s authenticity.
End State (for Template Customization)
Depending on their choices and interactions:

The agents could leave the marketplace with a newfound respect or camaraderie, possibly having secured an item that brings mutual benefit or understanding.
Alternatively, they might part ways, with each agent having acquired an item that reflects their distinct motivations, left pondering the marketplace’s lasting impact on their lives.`,
  },
  {
    id: 'comedic_debate',
    name: 'The Great Soup Debate - Comedy',
    description:
      'Two characters find themselves on a retro-style TV debate show, arguing the merits of soup as a meal versus a side. The discussion escalates in humor and absurdity, revealing quirks and personality through exaggerated arguments and comedic banter.',
    template: `Story Overview
In The Great Soup Debate, the agents find themselves as contestants on a local TV talk show that’s gained notoriety for its absurd debates. Today’s topic: “Is soup a meal or just a side?” The conversation, originally meant to be lighthearted, spirals into a hilariously intense and bizarre debate, with the agents fervently defending their sides. Through wild arguments, escalating stakes, and increasingly ridiculous tangents, they inadvertently reveal quirks about themselves and their views on life.

Narrative Point
Initial Premise: The agents are introduced as contestants on “Talk of the Town,” a local low-budget TV show known for hosting heated debates over trivial topics. The host kicks off the discussion, encouraging each agent to argue whether soup qualifies as a meal or merely a side dish.

Vibes
Setting Vibe: Over-the-top and theatrical, with dramatic lighting, audience sound effects, and absurd props. The set has a retro, tacky feel, like a ‘90s public access show, complete with cheesy applause signs and laugh tracks.
Interaction Vibe: Energetic, campy, and exaggerated, with the agents leaning into their roles, taking the debate far more seriously than anyone should.

Current Focus (Evolving Across Interaction)

Initial: Each agent gives their opening arguments, explaining why soup is or isn’t a meal, often with exaggerated logic or unexpected personal anecdotes.
Mid-Interaction: The conversation intensifies as they dig into increasingly outlandish points, trying to undermine each other’s arguments with bizarre examples, analogies, and even historical “facts” about soup.
Late-Interaction: A surprise twist (e.g., a hidden “Soup Expert” guest or a taste-test challenge) adds a final, chaotic layer, forcing both agents to double down on their positions or admit defeat.
Agent Goals

Explorer: Passionate and creative, the explorer is focused on convincing everyone that soup is a profound experience—a meal worth savoring. They rely on poetic descriptions and personal convictions to sway opinions.
Responder: Practical and unyielding, the responder argues that soup is a mere side dish, using humor, sarcasm, and “hard evidence” to bolster their case.
Narrative Signals (In-Story Triggers for Agent Interaction)

Audience Reactions: Canned laughter, applause, or boos prompt the agents to react, fueling their enthusiasm or frustration.
Host’s Interruptions: The overzealous host jumps in with “fun facts,” adds ridiculous questions, or instigates conflict, pushing the agents to defend their points with even more intensity.
Prop Reveal: The host presents a random soup-related prop (like an enormous ladle or comically oversized soup can) that the agents can use to bolster their arguments.
Secret Guest: An unexpected guest, like a “Soup Historian” or “Meal Expert,” joins to weigh in, which either challenges or strengthens each agent’s stance.
Agent-Specific Adaptations

Explorer: The explorer passionately compares soup to great meals in history, referencing odd “facts” to make it sound monumental. They may bring in existential musings, questioning why people doubt soup’s significance.
Responder: The responder dismisses the explorer’s points with sarcasm, humor, and “logic,” bringing in personal experiences or ridiculous stats to make soup seem trivial.
End State (for Template Customization)
Depending on the debate’s progression:

The agents might reach a humorous compromise, agreeing that soup can “occasionally” be a meal in an over-the-top fashion.
Or, one agent may emerge as the “winner” to dramatic applause, while the other concedes (or doubles down) in mock defeat.
Alternatively, they may storm off in “outrage,” promising to settle the score in the next episode, setting up an ongoing rivalry.`,
  },
  {
    id: 'neighborhood_watch',
    name: 'The Neighborhood Watch - Cozy Interaction',
    description:
      'Two characters patrol a quiet suburban neighborhood, chatting about daily life and community. Through mundane interactions, they reveal personal quirks and form a bond, exploring themes of community, trust, and the small pleasures of life.',
    template: `Story Overview
In The Neighborhood Watch, the agents find themselves as members of a local community watch group, assigned to patrol a quiet suburban neighborhood together. The setting is filled with ordinary interactions and daily routines, giving them opportunities to bond over seemingly mundane tasks and to share their unique perspectives on life. Through their conversations, the agents explore themes of community, trust, and the small quirks of everyday life.

Narrative Point
Initial Premise: The agents start their patrol in the early evening, tasked with ensuring the neighborhood remains peaceful. They’re provided with a list of minor tasks or “areas of interest” in the neighborhood (e.g., checking in on a reclusive neighbor, monitoring a frequently noisy house, ensuring the community park is clean), and they approach each task in their own way.

Vibes
Setting Vibe: Calm, cozy, and subtly humorous. The neighborhood is filled with quirky houses, pets wandering through yards, and the warm glow of porch lights. The streets are quiet, with the occasional sound of crickets or a distant TV echoing through open windows.
Interaction Vibe: Lighthearted, casual, and warm. Conversations flow naturally, with gentle banter and moments of introspection that feel organic within the slow pace of the evening patrol.

Current Focus (Evolving Across Interaction)

Initial: The agents share small talk as they begin their patrol, exchanging personal anecdotes or observations about the neighborhood.
Mid-Interaction: As they visit each area of interest, the agents open up, revealing more personal thoughts or quirks, often leading to humorous or touching moments.
Late-Interaction: A small but meaningful incident (e.g., helping a neighbor, dealing with an unexpected noise) allows the agents to work together, deepening their bond or revealing unexpected facets of each other’s personalities.
Agent Goals

Explorer: Curious and open-minded, the explorer finds meaning in each task, viewing the patrol as a way to connect with the community and understand the neighborhood’s subtle dynamics.
Responder: The responder is more pragmatic and task-oriented, focused on completing the patrol efficiently but gradually warmed by the explorer’s enthusiasm, leading them to share more about their own perspective.
Narrative Signals (In-Story Triggers for Agent Interaction)

Curious Neighbor: A friendly but nosy neighbor waves and starts a conversation, prompting both agents to engage and exchange their views on the local community.
Unattended Pet: They encounter a pet wandering the street, sparking a conversation about responsibility, companionship, or even funny pet anecdotes.
Mystery Noise: A strange sound draws them to an old house, sparking a lighthearted discussion on local rumors or ghost stories, revealing each agent’s beliefs or skepticism.
Shared Observation: They notice a small detail (a garden gnome, an oddly decorated yard, etc.) that leads to a humorous or thoughtful exchange about personal tastes or lifestyle quirks.
Agent-Specific Adaptations

Explorer: The explorer is deeply interested in the small details and quirks of the neighborhood, often making comments that reveal a philosophical or sentimental side.
Responder: The responder may initially downplay the patrol’s importance, focusing on efficiency, but slowly becomes more invested in the community dynamics as the explorer shares insights.
End State (for Template Customization)
Depending on the direction of the conversation:

The agents may conclude their patrol with a newfound camaraderie, planning to meet up for the next watch or sharing a small but memorable moment that lingers with them.
Alternatively, they might part with mutual respect, each having seen the other in a new light, or feeling more connected to the community they’ve spent the evening protecting.`,
  },
]
