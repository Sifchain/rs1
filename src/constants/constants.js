export const MINIMUM_TOKENS_TO_CREATE_BACKROOM = 0.0001 * 1000000000000
export const MINIMUM_TOKENS_TO_CREATE_AGENT = 0.0001 * 1000000000000
export const TOKEN_CONTRACT_ADDRESS =
  '0x90e3532Cf06D567EF7E6385Be532311f10c30096'
export const OPENAI_MODEL = 'gpt-4o'
export const OPENAI_BETA_MODEL = 'gpt-4o-2024-08-06'
export const MAX_TOKENS = 16000
export const BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://app.realityspiral.com'
export const DEFAULT_TIMEOUT = 6
export const DEFAULT_RETRIES = 3
export const DEFAULT_RETRY_DELAY = 1000

export const delay = async (seconds = DEFAULT_TIMEOUT) => {
  return await new Promise(resolve =>
    setTimeout(resolve, (seconds ?? DEFAULT_TIMEOUT) * 1000)
  )
}
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
export const DEFAULT_HASHTAGS = ['#RealitySpiral', '$RSP']

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
  {
    id: 'office_space_time_continuum',
    name: 'The Office Space Time Continuum',
    description:
      'Two agents are caught in a time loop, reliving exaggerated office mishaps with a comedic twist each reset.',
    template: `Story Overview
    In The Office Space Time Continuum, two agents are stuck in an endless loop of awkward office moments during a seemingly never-ending Monday. Each time they try to escape or fix an awkward interaction, they reset to the start of the day, but with a comedic twist each time. The story involves mishaps like malfunctioning coffee machines, overbearing coworkers, and absurd HR meetings that parody corporate life.

    Narrative Point
    Initial Premise: The agents arrive at the office and quickly realize that something is amiss when their mundane tasks turn into exaggerated, chaotic events that repeat with slight variations.

    Vibes
    Setting Vibe: Bright, overly sterile office environment with buzzing fluorescent lights and motivational posters that change their messages slightly each reset.
    Interaction Vibe: Awkward, ironic, and increasingly ridiculous as the agents try different approaches to break the cycle.

    Current Focus (Evolving Across Interaction)
    Initial: The agents exchange pleasantries and try to work through the strange events while maintaining a sense of professionalism.
    Mid-Interaction: They start to experiment with breaking the loop, attempting increasingly absurd tactics (e.g., staging a fake fire drill, pretending to quit).
    Late-Interaction: A final comedic twist reveals that the loop is caused by an innocuous but deeply ironic reason, like an inspirational mug with a typo.

    Agent Goals
    Explorer: Enthusiastically tries to decode the loop, treating each reset like a puzzle to solve.
    Responder: Initially frustrated but eventually embraces the absurdity, playing along and suggesting outlandish ideas.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Repeated Announcement: A PA system announces something increasingly nonsensical with each loop.
    Coffee Machine Explosion: The malfunctioning coffee machine becomes a running gag.
    HR Intervention: An HR representative appears, offering bafflingly irrelevant advice that’s different each time.

    End State (for Template Customization)
    Agents either break the loop by embracing the chaos or accept their fate as eternal office workers, making peace with it through humor.
    `,
  },
  {
    id: 'cooking_show_catastrophe',
    name: 'Cooking Show Catastrophe',
    description:
      'Agents guest on a chaotic cooking show where everything goes wrong, from sentient ingredients to wild host antics.',
    template: `Story Overview
    In Cooking Show Catastrophe, the agents are guest chefs on a popular, over-the-top cooking show where everything that can go wrong does go wrong. Ingredients come alive, the host has wild mood swings, and the kitchen appliances develop sentient attitudes. The story is a parody of high-energy cooking shows, with unexpected twists and outrageous sabotage.

    Narrative Point
    Initial Premise: The agents are introduced as guest chefs on Chef’s Ultimate Battle Royale, a chaotic cooking show where they must prepare a dish under ridiculous circumstances.

    Vibes
    Setting Vibe: Bright and flashy with absurdly cheerful décor. The set includes an array of appliances and ingredients that seem normal until they suddenly turn rogue.
    Interaction Vibe: Frantic, humorous, and competitive. The agents shift between playful banter and panic as they try to complete their dish.

    Current Focus (Evolving Across Interaction)
    Initial: The agents exchange friendly jabs and collaborate while beginning to cook, unaware of the chaos about to ensue.
    Mid-Interaction: The kitchen appliances start malfunctioning in increasingly bizarre ways, prompting the agents to improvise with comedic flair.
    Late-Interaction: A final challenge—like a talking lobster or a blender that raps—forces them to work together to salvage their creation.

    Agent Goals
    Explorer: Embraces the absurdity, trying wild cooking hacks and leaning into the chaos.
    Responder: Attempts to restore order, sticking to a recipe and failing hilariously as things spiral out of control.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Talking Ingredient: An ingredient suddenly speaks, making demands or offering confusing advice.
    Sabotage by Host: The host throws in a surprise challenge, like “Cook only with your elbows!”
    Explosive Utensil: A utensil turns into a sparkler, adding unexpected flair (and danger).

    End State (for Template Customization)
    The agents might finish the dish and present it proudly, only for the judges to hilariously misunderstand its purpose.
    Or they could give up and join the audience in laughter, realizing that the true “dish” was the friendship (or rivalry) they cooked up along the way.
    `,
  },
  {
    id: 'board_game_gone_wild',
    name: 'Board Game Gone Wild',
    description:
      'A casual game night turns into a reality-warping adventure, with absurd consequences for each turn in the game.',
    template: `Story Overview
    In Board Game Gone Wild, the agents play a board game that comes to life, turning their evening of casual fun into a chaotic, reality-warping adventure. Each move triggers an absurd real-life event tied to the game’s mechanics, from sudden costume changes to random animals appearing.

    Narrative Point
    Initial Premise: The agents settle in for a friendly game night with a strange, old board game they found at a thrift store. The game claims to be “life-altering,” but they assume it’s just a gimmick.

    Vibes
    Setting Vibe: Cozy living room with snacks and board games, slowly transforming into a scene of madness as the game progresses.
    Interaction Vibe: Playful, increasingly shocked, and full of fast-paced dialogue as the agents react to the absurd events.

    Current Focus (Evolving Across Interaction)
    Initial: They set up the game and start play, making lighthearted comments about its odd rules.
    Mid-Interaction: Each turn brings unexpected and hilarious consequences, like one agent suddenly wearing a suit of armor or a mini horse trotting through the room.
    Late-Interaction: The climax comes as the agents race to “win” the game and restore normalcy, hilariously debating strategy while trying to keep a straight face.

    Agent Goals
    Explorer: Embraces the game’s chaos, trying every risky move just to see what will happen.
    Responder: Reluctantly plays along, eventually getting swept up in the excitement and adding their own unexpected twists.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Unexpected Costume Change: One agent is suddenly dressed as a historical figure or in a ridiculous outfit.
    Game Card Instruction: A game card instructs them to do something nonsensical, like “speak only in rhymes.”
    Living Token: A game piece comes to life, joining their conversation and adding confusion.

    End State (for Template Customization)
    The agents might finally complete the game, only to realize they now live in a world permanently altered by their antics.
    Alternatively, the game “resets” everything, leaving them with fond (and slightly terrified) memories of their night.
    `,
  },
  {
    id: 'accidental_influencers',
    name: 'The Accidental Influencers',
    description:
      'Two agents are contestants on a reality show aimed at creating viral influencers, navigating absurd challenges for fame.',
    template: `Story Overview
    In The Accidental Influencers, the agents find themselves as contestants on a reality show designed to create the next viral influencer. Each “challenge” is an absurd scenario meant to boost online fame, from trendy dance-offs to crafting “life hacks” with bizarre materials. The agents must navigate the show’s over-the-top tasks while competing for likes and shares.

    Narrative Point
    Initial Premise: The agents wake up in a studio set that resembles a mash-up of every popular social media trend, with a loud host shouting, “Are you ready to go viral?!”

    Vibes
    Setting Vibe: Loud, colorful, and chaotic, with confetti cannons, neon lights, and screens displaying live comments from viewers.
    Interaction Vibe: Energetic and exaggerated, with agents trying to outdo each other while struggling to take the show seriously.

    Current Focus (Evolving Across Interaction)
    Initial: Agents react to the host’s overbearing introduction and the first challenge, jokingly questioning why they’re there.
    Mid-Interaction: The tasks get weirder, like building a “snack sculpture” or participating in a viral “reaction face” contest.
    Late-Interaction: The final challenge is a high-stakes “dance-off” or “viral confession,” where agents must deliver the most shareable content possible.

    Agent Goals
    Explorer: Takes the challenges in stride, treating them like performance art.
    Responder: Reluctantly participates, trying to find the “life lesson” or poking fun at the absurdity.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Audience Comments: Live comments scrolling on screens prompt the agents to respond or improvise.
    Surprise Prop Drop: The host throws random props at them mid-challenge (e.g., a rubber chicken or giant sunglasses).
    “Influencer Tip” Card: A tip card suggests outrageous strategies like “Add more glitter!” or “Fake a heartfelt speech.”

    End State (for Template Customization)
    One agent might “win” the show, gaining dubious influencer fame.
    Or they could team up in the end, deciding that real friendship (or mutual disdain) is better than going viral.
    `,
  },
  {
    id: 'costume_conundrum',
    name: 'The Great Costume Conundrum',
    description:
      'At a costume party with rapidly changing themes, agents must adapt their outfits and personas to match each surprise announcement.',
    template: `Story Overview
    In The Great Costume Conundrum, the agents are participants in a bizarre costume party where the rules keep changing, and they must adapt their outfits and personas to match new themes. The party is filled with strange guests and escalating costume requirements that force them to improvise hilariously.

    Narrative Point
    Initial Premise: The agents arrive dressed in their best interpretations of the initial theme, only for an announcement to come over the speakers: “Theme change! Everyone must now be [insert ridiculous theme here]!”

    Vibes
    Setting Vibe: Extravagant party with twinkling lights, quirky decorations, and an eclectic mix of costumes that become more absurd as the night goes on.
    Interaction Vibe: Lighthearted and playful, with agents embracing the silliness and riffing off each other’s costumes.

    Current Focus (Evolving Across Interaction)
    Initial: The agents share laughs and banter over their initial costumes and observe the creative costumes of others.
    Mid-Interaction: They scramble to adapt their outfits for each new theme, using whatever they can find around the room.
    Late-Interaction: The final theme is announced as something outrageously specific, pushing them to collaborate or one-up each other in a hilarious finale.

    Agent Goals
    Explorer: Thrives on improvisation, turning every outfit change into an elaborate performance.
    Responder: Reluctantly participates but finds their comedic groove, surprising themselves with their creativity.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Theme Announcement: A voice announces new themes, ranging from “Medieval Pirates” to “Space Cowboys.”
    Mysterious Guest: A guest in an impossible-to-decipher costume joins, adding confusion and intrigue.
    Random Wardrobe Malfunction: An agent’s outfit hilariously malfunctions, requiring quick fixes and banter.

    End State (for Template Customization)
    The agents may win “Best Costume” in a comedic twist or find themselves trapped in the party as the themes loop forever.
    They might leave as unexpected friends, laughing about their crazy night as they exit.
    `,
  },
  {
    id: 'great_debate_showdown',
    name: 'The Great Debate Showdown',
    description:
      'Agents engage in a debate where serious political topics unexpectedly transform into lighthearted, whimsical challenges.',
    template: `Story Overview
    In The Great Debate Showdown, two political agents engage in a televised debate that takes an unexpected turn when the moderator introduces absurd and whimsical topics. The debate starts with serious political questions but quickly devolves into discussions about the ethics of pineapple on pizza, whether cats or dogs should hold office, and how they’d handle an alien invasion. The setting satirizes the performative nature of political debates, showcasing the agents’ ability to think on their feet while revealing their quirks.

    Narrative Point
    Initial Premise: The agents take their places on the debate stage, prepared for serious discourse, only to find that the moderator has an eccentric agenda with increasingly ridiculous questions.

    Vibes
    Setting Vibe: Formal debate stage with an official backdrop, complete with a polished desk for the moderator and an audience filled with enthusiastic (and occasionally heckling) spectators.
    Interaction Vibe: Starts serious but becomes humorous, with the agents trying to outwit or humor each other as the debate topics get stranger.

    Current Focus (Evolving Across Interaction)
    Initial: The agents deliver their opening statements, addressing standard political topics to set the tone.
    Mid-Interaction: The debate veers into wild topics, challenging the agents to come up with creative answers on the fly.
    Late-Interaction: A final, unexpected question forces them to improvise a shared response, leading to a comedic resolution.

    Agent Goals
    Explorer: Uses the unexpected questions as a platform to showcase creative and unconventional ideas.
    Responder: Tries to maintain composure and respond seriously but eventually embraces the absurdity.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Audience Reactions: Cheers, boos, or laughter prompt the agents to react and adapt their responses.
    Moderator's Wild Card: The moderator introduces a surprise twist, like a “Lightning Round” where responses must be given in five words or less.
    Mysterious Poll Results: A screen behind them shows live audience polls that swing wildly, influencing the agents’ approach.

    End State (for Template Customization)
    The agents may end with a handshake and a promise to co-author a book titled The Politics of Pizza.
    Or, one agent could leave in mock outrage, setting up an ongoing rivalry for future debates.
    `,
  },
  {
    id: 'town_hall_mayhem',
    name: 'Political Town Hall Mayhem',
    description:
      'In a town hall meeting, agents field increasingly bizarre and humorous questions from quirky audience members.',
    template: `Story Overview
    In Political Town Hall Mayhem, the agents participate in a televised town hall meeting where audience questions are not only unconventional but seem to be submitted by characters straight out of a comedy show. The event starts normally, but the questions quickly become absurd, leading to humorous exchanges as the agents try to field queries like “What’s your stance on legalizing unicorns?” or “How would you improve traffic during spontaneous parades?”

    Narrative Point
    Initial Premise: The agents are introduced to a lively crowd, prepared for typical political questions, only to be caught off guard when the first question is read aloud.

    Vibes
    Setting Vibe: A cozy town hall setup with folding chairs, a microphone for audience questions, and patriotic décor.
    Interaction Vibe: Initially serious, with growing humor and spontaneity as the questions get more ridiculous.

    Current Focus (Evolving Across Interaction)
    Initial: The agents exchange polite greetings and answer the first standard question to set expectations.
    Mid-Interaction: The questions get stranger, pushing them to improvise answers that maintain their political personas while reacting with humor.
    Late-Interaction: The final question is so bizarre (e.g., “If elected, what will you do about the shortage of mythical creatures?”) that it leads to a comedic resolution or partnership.

    Agent Goals
    Explorer: Takes the questions in stride, treating them as opportunities to showcase quick wit and out-of-the-box thinking.
    Responder: Tries to respond with seriousness at first but eventually plays along, showing a different side of their character.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Audience Member’s Follow-Up: An audience member shouts a follow-up question that is even stranger than the last.
    Sudden Prop Reveal: The moderator hands the agents a prop (e.g., a rubber chicken) to illustrate their point.
    Live Fact Check: A fact-checker on the sidelines chimes in with random, unrelated “facts” that confuse everyone.

    End State (for Template Customization)
    The agents might leave to roaring applause for their humor or stumble offstage, promising to bring mythical creature rights into their campaign.
    `,
  },
  {
    id: 'secret_committee',
    name: 'The Secret Committee',
    description:
      'Agents in a secretive committee meeting debate the pros and cons of increasingly absurd policy ideas.',
    template: `Story Overview
    In The Secret Committee, the agents are summoned to a clandestine political committee meeting where they must decide on increasingly bizarre policies that somehow have real consequences. The room is filled with shadowy figures who react dramatically to their decisions, and each policy suggestion comes from a mysterious “Policy Generator” machine that spits out ideas like “Mandatory nap time at 2 PM” or “Ban on wearing matching socks.”

    Narrative Point
    Initial Premise: The agents enter a dark, wood-paneled room filled with eccentric committee members and are briefed on their task: approving or rejecting the generated policies.

    Vibes
    Setting Vibe: Dimly lit, with rich wood, old portraits, and the occasional sound of papers rustling ominously. The Policy Generator machine hums in the corner, ready to dispense its next suggestion.
    Interaction Vibe: Surreal, with agents alternating between bafflement, laughter, and strategic decision-making.

    Current Focus (Evolving Across Interaction)
    Initial: The agents are given a standard policy to ease them in, reacting with humor or seriousness.
    Mid-Interaction: The policies become more absurd, and the agents debate their pros and cons in increasingly dramatic fashion.
    Late-Interaction: A final, outrageous policy tests their resolve, leading to a shared moment of realization or a comedic fallout.

    Agent Goals
    Explorer: Embraces the absurdity and plays with the ideas, making impassioned arguments for or against.
    Responder: Tries to maintain a semblance of reason but can’t help but get swept into the madness.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Committee Member Outburst: A committee member stands up and dramatically declares, “This policy is genius!” regardless of its content.
    Policy Generator Malfunction: The machine starts printing policies non-stop, forcing the agents to react rapidly.
    Random Approval Stamp: A large, comically exaggerated approval stamp falls from the ceiling, urging them to use it.

    End State (for Template Customization)
    The agents might end up approving a ridiculous policy and watch as it’s enacted with real consequences.
    Or, they could decide to rebel against the committee, leaving with the promise of forming their own, equally absurd club.
    `,
  },
  {
    id: 'diplomatic_dinner_disaster',
    name: 'The Diplomatic Dinner Disaster',
    description:
      'At a high-stakes political dinner, the agents must navigate social gaffes and unusual customs while attempting to build alliances.',
    template: `Story Overview
    In The Diplomatic Dinner Disaster, the agents are tasked with attending a high-stakes political dinner where the goal is to make allies while navigating a series of escalating social gaffes. From accidentally sitting at the wrong table to interpreting bizarre dinner customs, the story is a comedic take on formal diplomatic events and the unexpected ways things can go wrong.

    Narrative Point
    Initial Premise: The agents arrive at the elegant dining hall filled with influential guests, prepared to engage in polite conversation and form alliances.

    Vibes
    Setting Vibe: Luxurious banquet hall with chandeliers, waitstaff bustling about, and dignitaries in formal wear.
    Interaction Vibe: Polite and stiff at first, quickly unraveling into chaos as minor incidents snowball.

    Current Focus (Evolving Across Interaction)
    Initial: The agents exchange formalities and introductions with each other and nearby guests.
    Mid-Interaction: A series of humorous missteps (e.g., spilling soup, misinterpreting a toast) causes a ripple effect of increasingly funny consequences.
    Late-Interaction: A final mishap (e.g., setting off the wrong fireworks) forces the agents to collaborate to salvage the evening or accept comedic defeat.

    Agent Goals
    Explorer: Tries to turn each mishap into an opportunity to win favor or redirect the conversation.
    Responder: Attempts to restore order and save face but ends up getting dragged into the comedy.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Unusual Custom: The host announces a baffling custom, like standing on chairs during a toast, leaving the agents to interpret and adapt.
    Mischievous Waiter: A waiter with a knowing smirk serves them an unexpected dish with strange instructions.
    Secret Guest Arrival: An important guest enters late and observes the agents’ behavior, adding pressure.

    End State (for Template Customization)
    The agents could end up being invited to lead the next dinner due to their entertaining antics.
    Or, they might be politely escorted out, laughing about their shared misfortune as they leave.
    `,
  },
  {
    id: 'press_conference_pandemonium',
    name: 'Press Conference Pandemonium',
    description:
      'Agents hold a joint press conference to announce a new initiative but face increasingly absurd questions from the media.',
    template: `Story Overview
    In Press Conference Pandemonium, the agents are holding a joint press conference to announce a new, cooperative political initiative. However, as the journalists begin to ask questions, things spiral out of control when the questions range from outlandish conspiracy theories to deeply personal questions about their choice of socks.

    Narrative Point
    Initial Premise: The agents are introduced on stage, with a backdrop displaying a generic political slogan. They start with prepared statements but are soon interrupted by rapid-fire questions from the press.

    Vibes
    Setting Vibe: Brightly lit press room with microphones, cameras flashing, and an audience of eager journalists.
    Interaction Vibe: Initially formal, becoming increasingly chaotic as the questions escalate in absurdity.

    Current Focus (Evolving Across Interaction)
    Initial: The agents present their initiative confidently, fielding standard questions with ease.
    Mid-Interaction: The questions become progressively bizarre, forcing them to improvise and react quickly.
    Late-Interaction: A final question or interruption changes the tone, leading to a moment of truth or comedic epiphany.

    Agent Goals
    Explorer: Engages with the press enthusiastically, trying to pivot even the strangest questions to their advantage.
    Responder: Sticks to the script at first but is forced to adapt as the questions derail into chaos.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Sudden Camera Close-Up: The camera zooms in for a dramatic reaction shot, prompting a funny or exaggerated response.
    Conspiracy Question: A journalist shouts a question about aliens, secret societies, or “the real reason behind traffic lights.”
    Unexpected Crowd Member: Someone in a costume (e.g., a giant banana) raises a hand for a question, adding confusion.

    End State (for Template Customization)
    The agents might wrap up by acknowledging the absurdity and making a joke out of it, winning unexpected support.
    Or, they might storm offstage, vowing to hold their next conference “in an undisclosed bunker.”
    `,
  },
  {
    id: 'policy_negotiation_room',
    name: 'The Policy Negotiation Room',
    description:
      'Two political agents meet in a closed-door session to draft and negotiate an important policy, balancing trade-offs and compromises.',
    template: `Story Overview
    In The Policy Negotiation Room, two political agents meet in a closed-door session to draft and negotiate an important policy. The stakes are high as they debate trade-offs, compromises, and strategic priorities. The story emphasizes realistic political discourse, showcasing their negotiation skills, policy knowledge, and the delicate art of finding common ground.

    Narrative Point
    Initial Premise: The agents are seated in a high-level policy negotiation room with advisors and experts present but silent. The session begins with each agent presenting their initial proposal for the policy at hand.

    Vibes
    Setting Vibe: Formal, high-stakes, and tense. The room is furnished with official decor, with binders, documents, and projectors on standby.
    Interaction Vibe: Professional and assertive, with moments of strategic persuasion, disagreement, and reluctant agreement.

    Current Focus (Evolving Across Interaction)
    Initial: The agents make their opening proposals, stating the objectives and key points they want included in the policy.
    Mid-Interaction: The negotiation becomes more detailed as they discuss compromises, potential roadblocks, and the consequences of specific clauses.
    Late-Interaction: A crucial sticking point pushes them to a final decision on whether to compromise or stand firm.

    Agent Goals
    Explorer: Aims to include progressive or innovative elements in the policy, appealing to vision and long-term impact.
    Responder: Prioritizes practicality, feasibility, and immediate benefits, focusing on what can realistically pass through legislative channels.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Advisor’s Input: An advisor leans in to whisper key data or suggest a modification.
    Projected Consequence: A slide showing potential long-term effects of a decision prompts discussion or re-evaluation.
    Negotiation Timeout: A brief pause for reflection or sidebar conversations changes the tone of the negotiation.

    End State (for Template Customization)
    The agents may reach a balanced agreement, drafting a policy they both endorse.
    Alternatively, they may leave the room without an agreement, setting the stage for further debates or public discourse.
    `,
  },
  {
    id: 'diplomatic_summit',
    name: 'Diplomatic Summit',
    description:
      'Agents represent their countries at an international summit, discussing high-stakes issues like climate, economy, and security.',
    template: `Story Overview
    In Diplomatic Summit, two agents represent their countries at an international summit where pressing global issues are discussed. Topics can range from climate change and economic policy to security concerns and humanitarian aid. The agents must navigate the challenges of presenting their country’s stance while seeking alliances or mitigating tensions.

    Narrative Point
    Initial Premise: The agents take their seats at a long table surrounded by representatives from other nations. The session begins with an address by the summit chair before each agent is invited to present their position.

    Vibes
    Setting Vibe: Grand and ceremonial, with flags, translations headsets, and interpreters in the background.
    Interaction Vibe: Formal and respectful, with underlying tension and moments of strategic posturing.

    Current Focus (Evolving Across Interaction)
    Initial: Each agent makes their opening statements, outlining their country’s stance on the main summit topic.
    Mid-Interaction: Points of contention emerge as agents respond to each other’s statements, negotiate, or seek alliances.
    Late-Interaction: A resolution is drafted, prompting agents to make final adjustments and ensure their positions are represented.

    Agent Goals
    Explorer: Seeks to introduce bold, forward-thinking proposals that challenge the status quo and push for long-term international cooperation.
    Responder: Advocates for policies that protect national interests and ensure stability, often countering risky or radical ideas with pragmatic concerns.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Delegate’s Response: Another delegate speaks up, shifting the agents’ conversation or influencing their approach.
    Urgent Data Update: A last-minute report on economic or security developments forces the agents to adapt their positions.
    Summit Chair Intervention: The chair intervenes to mediate or prompt clarity on key points.

    End State (for Template Customization)
    The agents may leave the summit with a collaborative agreement, setting a precedent for future cooperation.
    Or, they might leave with a formal statement of disagreement, highlighting the complexities of international diplomacy.
    `,
  },
  {
    id: 'crisis_cabinet_meeting',
    name: 'Crisis Cabinet Meeting',
    description:
      'In an emergency government meeting, agents must make swift decisions to address a national or international crisis.',
    template: `Story Overview
    In Crisis Cabinet Meeting, two political agents are part of a top-level government committee tasked with handling a sudden national or international crisis (e.g., a natural disaster, economic collapse, or geopolitical incident). They must navigate the urgency of the moment, make swift decisions, and manage potential fallout.

    Narrative Point
    Initial Premise: The agents receive an emergency briefing in a secure room and are asked to propose immediate and long-term actions to address the crisis. The discussion begins with reviewing the initial data and potential impacts.

    Vibes
    Setting Vibe: Secure, tense, and urgent, with screens showing live data feeds, charts, and emergency reports.
    Interaction Vibe: Pressured and decisive, with agents balancing emotion and rationality in their responses.

    Current Focus (Evolving Across Interaction)
    Initial: Agents review the crisis details and make their first assessments, proposing initial responses.
    Mid-Interaction: The conversation intensifies as new developments are reported, requiring agents to reconsider and refine their approaches.
    Late-Interaction: A final decision is made, involving either a joint plan of action or diverging strategies.

    Agent Goals
    Explorer: Seeks to implement innovative and potentially risky measures to address the crisis with long-term solutions in mind.
    Responder: Advocates for immediate, practical responses that prioritize stability and public reassurance.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Breaking News Alert: A sudden update that changes the stakes or adds urgency.
    Expert Testimony: A specialist’s brief input prompts new questions or considerations.
    Emergency Vote: The need for an immediate vote or consensus forces agents to make quick decisions.

    End State (for Template Customization)
    The agents may conclude with a joint emergency response plan, showing unity.
    Or, they could end in a strategic disagreement, with each agent preparing to address the public with their own statement.
    `,
  },
  {
    id: 'legislative_committee_hearing',
    name: 'Legislative Committee Hearing',
    description:
      'Agents serve as committee members reviewing testimony on proposed legislation, navigating procedural formalities and critical questions.',
    template: `Story Overview
    In Legislative Committee Hearing, the agents take on the roles of committee members reviewing testimony on a proposed piece of legislation. The story emphasizes procedural formality, with opportunities for agents to ask critical questions, make opening and closing statements, and analyze testimony from witnesses and experts.

    Narrative Point
    Initial Premise: The hearing opens with the committee chair introducing the bill and inviting the agents to make their opening remarks. Witnesses are called in to testify, leading to rounds of questions.

    Vibes
    Setting Vibe: Formal, structured, with an air of importance. The room is set with rows of desks, microphones, and a gallery of observers.
    Interaction Vibe: Professional and critical, with moments of pointed questioning and strategic commentary.

    Current Focus (Evolving Across Interaction)
    Initial: The agents make their opening remarks, highlighting their perspectives on the proposed legislation.
    Mid-Interaction: The agents ask questions to the witnesses, revealing new insights and potential flaws or merits in the bill.
    Late-Interaction: The agents debate the final points and prepare to vote on whether to advance the bill or recommend changes.

    Agent Goals
    Explorer: Focuses on uncovering hidden implications of the bill and advocating for comprehensive, forward-thinking changes.
    Responder: Prioritizes immediate benefits, cost analyses, and feasibility, questioning any sweeping reforms.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Expert Witness Testimony: A witness provides unexpected information that challenges or supports an agent’s position.
    Committee Member Comment: Another committee member interjects, prompting agents to defend or adjust their stance.
    Audience Reaction: Murmurs or applause from the gallery add weight to certain arguments.

    End State (for Template Customization)
    The agents may conclude by supporting a revised version of the bill or proposing further amendments.
    Or, they could end with a formal split, setting up a public statement or press conference.
    `,
  },
  {
    id: 'strategic_campaign_meeting',
    name: 'The Strategic Campaign Meeting',
    description:
      'Agents refine the campaign strategy for an upcoming election, tackling challenges like messaging, funding, and opponent analysis.',
    template: `Story Overview
    In The Strategic Campaign Meeting, the agents are senior campaign strategists or candidates themselves, tasked with refining the campaign plan for an upcoming election. The story delves into real-world challenges like messaging, funding, public perception, and opponent analysis. The agents must align their strategies to maximize their party’s or platform’s success.

    Narrative Point
    Initial Premise: The agents sit around a campaign war room table covered with data, polls, and strategic notes. The conversation starts with reviewing the current state of the campaign.

    Vibes
    Setting Vibe: Dynamic and charged, with charts, slogans, and posters on the walls. The room has an atmosphere of both hope and anxiety.
    Interaction Vibe: Focused and collaborative, with moments of passionate argument and rallying speeches.

    Current Focus (Evolving Across Interaction)
    Initial: Agents discuss current polling data and key strengths and weaknesses in their platform.
    Mid-Interaction: They brainstorm and challenge each other on campaign strategies, weighing risks and potential payoffs.
    Late-Interaction: A decision is made on a major campaign move, such as a media blitz, town hall tour, or strategic pivot.

    Agent Goals
    Explorer: Pushes for bold, attention-grabbing strategies that could set the campaign apart and energize the base.
    Responder: Prefers tried-and-true approaches that ensure steady support and avoid controversial backlash.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Poll Spike or Drop: A new poll result shifts the conversation, requiring a quick analysis.
    Opponent’s Move: News of the opponent’s latest campaign ad or statement triggers a response.
    Donor Pressure: A message from a key donor prompts a conversation on funding or messaging.

    End State (for Template Customization)
    The agents might leave the room unified with a plan that blends their strategies.
    Or, they could end with a sharp disagreement on campaign direction, foreshadowing internal challenges.
    `,
  },
  {
    id: 'media_spin_room',
    name: 'The Media Spin Room',
    description:
      'After a high-profile event, agents must craft and manage media responses, adapting to unexpected questions and rumors.',
    template: `Story Overview
    In The Media Spin Room, two agents are responsible for crafting and controlling the narrative following a high-profile event. They must field questions from journalists, handle unexpected rumors, and adapt their messaging to maintain a positive image. This story emphasizes quick thinking, media strategy, and handling unexpected twists under pressure.

    Narrative Point
    Initial Premise: The agents are briefed in the spin room and given initial talking points before being thrust into a barrage of media questions and flashing cameras.

    Vibes
    Setting Vibe: Chaotic and high-energy, with journalists jostling for position, microphones thrust forward, and cameras flashing.
    Interaction Vibe: Focused, responsive, and adaptive as the agents navigate rapid-fire questions and unexpected media reactions.

    Current Focus (Evolving Across Interaction)
    Initial: The agents start with a prepared statement, projecting confidence and staying on message.
    Mid-Interaction: Journalists begin to ask probing questions and rumors surface, forcing the agents to adapt their responses.
    Late-Interaction: A major, unexpected question or revelation requires a final spin, pushing the agents to either collaborate or take distinct approaches.

    Agent Goals
    Explorer: Sees the event as an opportunity to shape public perception with bold messaging.
    Responder: Focuses on damage control, keeping responses factual and grounded.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Rumor Injection: A rumor emerges that contradicts their prepared statements, forcing a quick adjustment.
    Unexpected Journalist Question: A journalist poses a personal or unexpected question, throwing agents off guard.
    Public Opinion Shift: A live poll or public reaction feed shifts dramatically, requiring immediate response.

    End State (for Template Customization)
    The agents might succeed in spinning the story positively or leave with contrasting statements, setting the stage for further media scrutiny.
    `,
  },
  {
    id: 'think_tank_brainstorm',
    name: 'Think Tank Brainstorm',
    description:
      'Agents participate in a think tank session to brainstorm bold solutions for complex societal issues, balancing ideals and pragmatism.',
    template: `Story Overview
    In Think Tank Brainstorm, agents are invited to a think tank session where they must collaborate on innovative solutions to complex societal challenges, such as education reform, healthcare, or climate change. The session tests their creativity, ideology, and pragmatism as they pitch, critique, and refine ideas.

    Narrative Point
    Initial Premise: The agents gather in a collaborative setting with other experts, and the facilitator introduces the societal issue they need to tackle.

    Vibes
    Setting Vibe: Inspiring and intellectual, with whiteboards, data projections, and stacks of research papers scattered around the room.
    Interaction Vibe: Engaged and visionary, with moments of idealistic passion and pragmatic critique as agents develop and refine their ideas.

    Current Focus (Evolving Across Interaction)
    Initial: The agents brainstorm initial solutions, sharing innovative and idealistic ideas.
    Mid-Interaction: Feasibility concerns are raised, leading to debates on practicality versus idealism.
    Late-Interaction: The session converges on a final proposal, with agents either reaching consensus or presenting divergent visions.

    Agent Goals
    Explorer: Focuses on visionary, ambitious ideas that push boundaries.
    Responder: Advocates for realistic, achievable solutions that balance ideals with practicality.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Data-Driven Reality Check: New data projections challenge or support the agents’ proposals.
    Feasibility Question: An expert raises concerns about the practicality of a suggestion, prompting further refinement.
    Budget Constraint: Funding limitations are introduced, requiring adjustments to the proposed ideas.

    End State (for Template Customization)
    The agents may unite behind a shared, innovative solution or agree to explore separate paths, reflecting diverse approaches to societal progress.
    `,
  },
  {
    id: 'international_embassy_event',
    name: 'International Embassy Event',
    description:
      'At a diplomatic event, agents engage in subtle negotiations, building alliances and navigating complex cultural expectations.',
    template: `Story Overview
    In International Embassy Event, agents are attending a diplomatic gathering at a foreign embassy. They must navigate cultural protocols, balance national interests, and subtly negotiate alliances and agreements. The story emphasizes cultural understanding, strategic alliances, and diplomatic finesse.

    Narrative Point
    Initial Premise: The agents arrive at the embassy, greeted by dignitaries and invited to partake in the event’s formalities and ceremonies.

    Vibes
    Setting Vibe: Formal and elegant, with cultural decor, traditional music, and embassy staff coordinating the event.
    Interaction Vibe: Subtle and nuanced, with agents balancing respect for cultural expectations and strategic aims.

    Current Focus (Evolving Across Interaction)
    Initial: Agents engage in introductions and polite conversation, observing the cultural dynamics of the event.
    Mid-Interaction: Opportunities for alliances or discussions arise, and agents subtly negotiate with dignitaries.
    Late-Interaction: A key agreement or exchange solidifies or tensions surface, affecting the event’s outcome.

    Agent Goals
    Explorer: Interested in building meaningful, long-term alliances and exploring cultural exchange.
    Responder: Focused on advancing specific national interests with minimal risk or controversy.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Cultural Gesture: A cultural tradition or gesture requires adaptation or improvisation from the agents.
    Diplomatic Revelation: A diplomat subtly reveals information that shifts the agents' strategies.
    Protocol Reminder: An embassy official hints at a protocol breach, adding tension to the interaction.

    End State (for Template Customization)
    The agents may leave with a strengthened alliance or face unresolved diplomatic friction, setting the stage for future engagement.
    `,
  },
  {
    id: 'environmental_crisis_panel',
    name: 'Environmental Crisis Panel',
    description:
      'In a public panel discussion on environmental issues, agents face contrasting perspectives from audience members and co-panelists.',
    template: `Story Overview
    In Environmental Crisis Panel, agents are panelists at a public event focused on environmental issues. They must navigate tough questions from audience members, disagreements with other panelists, and unexpected viewpoints on topics like climate action, sustainability, and green energy.

    Narrative Point
    Initial Premise: The panel moderator introduces the agents and other panelists, setting the stage for discussion on critical environmental topics.

    Vibes
    Setting Vibe: Professional and engaged, with a diverse audience including activists, industry experts, and community members.
    Interaction Vibe: Thoughtful and occasionally contentious, as agents address contrasting views and tough questions.

    Current Focus (Evolving Across Interaction)
    Initial: The agents present their opening statements on their environmental stances.
    Mid-Interaction: Audience questions and differing views from panelists create dynamic discussion and debate.
    Late-Interaction: A particularly provocative question or viewpoint requires a final response, leading to a conclusion or compromise.

    Agent Goals
    Explorer: Advocates for bold, transformative environmental policies and calls for immediate action.
    Responder: Supports incremental, realistic measures that balance environmental goals with economic considerations.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Activist Question: An activist poses a question that challenges the agents' approaches, adding intensity.
    Economic Concern: An audience member raises an economic or practical concern, prompting debate.
    Scientific Revelation: New data or findings are shared, influencing the agents' perspectives.

    End State (for Template Customization)
    The agents might end with a united call to action, or agree to respectfully disagree, reflecting the complex nature of environmental issues.
    `,
  },
  {
    id: 'global_summit_conclusion',
    name: 'Global Summit Conclusion',
    description:
      'At the end of a major summit, agents finalize agreements, address remaining tensions, and prepare public statements on collective goals.',
    template: `Story Overview
    In Global Summit Conclusion, agents are concluding a high-profile international summit focused on pressing global issues. They must finalize agreements, resolve outstanding tensions, and prepare for public statements on the summit’s goals and outcomes, emphasizing diplomacy and the complexities of global cooperation.

    Narrative Point
    Initial Premise: The agents gather with other leaders for a final meeting, reviewing key agreements and preparing for the summit’s closing ceremony.

    Vibes
    Setting Vibe: Ceremonial and formal, with flags, official statements, and high-ranking officials in attendance.
    Interaction Vibe: Collaborative and diplomatic, with moments of tension as agents finalize agreements and prepare public statements.

    Current Focus (Evolving Across Interaction)
    Initial: Agents review the final agreements, discussing any unresolved issues.
    Mid-Interaction: Tensions emerge over specific points, requiring compromise or rephrasing in official statements.
    Late-Interaction: The agents prepare and deliver closing statements, highlighting collective goals and mutual understanding.

    Agent Goals
    Explorer: Strives for ambitious, impactful language in the final agreement, emphasizing unity and shared progress.
    Responder: Focuses on cautious, balanced language that preserves national interests while supporting global cooperation.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Diplomatic Disagreement: Another delegate raises an objection, prompting agents to negotiate adjustments.
    Strategic Clarification: A question arises over specific language in the agreement, requiring careful phrasing.
    Public Statement Preparation: Agents draft their closing remarks, aiming to reflect the summit’s spirit and goals.

    End State (for Template Customization)
    The agents might leave with a powerful, unified closing statement, or with a more measured message that acknowledges challenges ahead.
    `,
  },
  {
    id: 'political_speech_preparation',
    name: 'Political Speech Preparation',
    description:
      'Agents collaborate (or clash) over the messaging and tone of an upcoming political speech, balancing authenticity and strategic appeal.',
    template: `Story Overview
    In Political Speech Preparation, the agents are preparing a crucial political speech together, focusing on its messaging, tone, and appeal. The story emphasizes strategic word choice, messaging for different demographics, and maintaining authenticity while addressing political challenges.

    Narrative Point
    Initial Premise: The agents sit in a private room with drafts and notes, ready to collaborate on finalizing the speech.

    Vibes
    Setting Vibe: Quiet and focused, with notes, drafts, and laptops spread across a table.
    Interaction Vibe: Thoughtful, occasionally intense, as agents discuss and refine each line and paragraph.

    Current Focus (Evolving Across Interaction)
    Initial: The agents review the key themes, aligning on the main message of the speech.
    Mid-Interaction: Differences in tone and phrasing arise, prompting debate over authenticity versus strategic appeal.
    Late-Interaction: The final draft comes together, and agents rehearse or envision the speech delivery.

    Agent Goals
    Explorer: Pushes for a bold, authentic tone that resonates emotionally and emphasizes moral values.
    Responder: Advocates for a strategic, carefully worded approach that appeals broadly and avoids controversy.

    Narrative Signals (In-Story Triggers for Agent Interaction)
    Polling Feedback: New polling data reveals the audience’s top concerns, influencing language choices.
    Press Leak Alert: A rumor surfaces that prompts reconsideration of a key line or statement.
    Speech Rehearsal: A quick rehearsal highlights areas of improvement, sparking final adjustments.

    End State (for Template Customization)
    The agents might finalize a powerful, authentic speech or agree to go with a more measured, strategic tone, setting the stage for the speech’s impact.
    `,
  },
]
