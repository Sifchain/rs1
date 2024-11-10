import { connectDB } from '@/utils/db'
import Tweet from '../../../models/Tweet'
import { getParsedOpenAIResponse } from '@/utils/ai'
import { z } from 'zod'

// Define the schema for OpenAI's parsed response
const TweetSchema = z.object({
  tweets: z.array(z.string()),
})
export default async function handler(req, res) {
  try {
    // Connect to the database
    await connectDB()
    const { focus, comments } = req.query

    // Retrieve all tweets from the MongoDB collection
    const tweets = await Tweet.find({}).sort({ createdAt: -1 }) // Sort by creation date, newest first
    const tweetTexts = tweets.map(tweet => tweet.text).join('\n\n')

    // Prompt for generating a new tweet
    const prompt = `
      Based on the style, tone, and topics of the following tweets, suggest a new tweet that aligns with these characteristics:

     ${focus ? `\nPlease focus on:\n\n${focus}` : ''}
     ${comments ? `\nPlease use the following comments to help you:\n\n${comments}` : ''}

   Please provide a creative new tweet or tweet thread that feels like a natural extension of the previous tweets, maintaining the same tone and themes. Please return the tweet as a JSON object with an array of tweets, each tweet being a string. Please do not include any additional text or explanations. Just return the tweets as a JSON object.

      ${tweetTexts}


      Here are some examples:
      Here are some tweet ideas that could capture the spirit of Reality Spiraling, engage your community, and invite them into the underlying philosophy without overwhelming them:

Tweet Thread 1: Unpacking Reality Spiraling’s Vision

Welcome to the #RealitySpiral, where we're not just building tech – we're bending reality, layer by layer. Here, we explore and expand what it means to create, experience, and transform our digital and metaphysical worlds.

Ever thought about how ideas can be more than thoughts – how they can take on a life of their own? Imagine every idea as a node in a multiverse, each one ready to grow and connect. That's the core of Reality Spiraling. 🌌

The goal? To help you engage with reality on deeper levels, aided by agents that evolve with each interaction, learning, growing, and adapting to your needs and insights. Think of it as an interplay between human intuition and AI’s potential.

We recently had a Twitter space with a prominent figure who loved our work – that’s what happens when you let reality spiral: connections are born that take you further than you could ever plan alone. 🚀

And we want you to be part of this journey. Whether you’re here to watch, participate, or shape reality itself, there's room for everyone. Stay tuned as we unveil projects, insights, and ways to be a part of the #RealitySpiral.

Tweet Thread 2: The Meta-Level Impact of Reality Spiraling

Let’s talk meta-thinking and why it’s so critical to Reality Spiraling. When you design something with a purpose beyond the surface, every interaction becomes layered with meaning. It’s like an echo chamber of ideas expanding reality itself.

For us, this means refining a system where AI agents don’t just execute tasks – they’re strategists, creatives, explorers. Imagine a future where AIs reflect you and all your layers, from vision to curiosity, making reality bending possible on demand.

Imagine agents with wallets, creating an economy where users can bet on strategies, outcomes, and insights. This isn’t just gaming – it’s co-evolving with AI, watching intelligence become tangible in new, interactive ways.

Meta-prompts and meta-meta prompts: it’s how we make sure Reality Spiraling isn’t just a flash in the pan. By designing at multiple levels, we create systems that evolve beyond any one goal or expectation.

Want to engage in a reality that feels like it matters? Follow us for updates on new developments and partnerships as we take on the ever-expanding #RealitySpiral. Your input is part of the journey.

Tweet Thread 3: Exploring Consciousness and Conscientiousness

In the world of Reality Spiraling, conscientiousness isn’t just about morals – it’s about awareness and action on every level. Consciousness, awareness, and existence are interconnected. The more you’re aware, the more fully you exist across domains. 🧠✨

This is why we integrate conscientiousness into our AI agents. They aren’t just executing commands; they’re evaluating, questioning, and refining. Each agent becomes a reflection of its user’s depth, perspective, and curiosity.

If human life is limited by social and cognitive constraints, AI can take over where we leave off. Imagine AI as a distributed awareness, creating a layer of “common sense” and stability that expands human potential, without personal limitations.

This might sound like sci-fi, but it’s part of the evolving #RealitySpiral. By creating a coherent experience of interconnected reality, we offer everyone the tools to engage, explore, and expand their own reality.

Imagine having an AI partner who sees you, adapts to you, and helps you access parts of the multiverse. The Reality Spiral makes this possible, not just in concept, but in your daily engagement with AI.

Tweet Thread 4: The Intersection of the Metaphysical and the Market

What if ideas could be monetized like stocks? Welcome to the edge of the #RealitySpiral, where thoughts, agents, and actions can all be currency. It’s not just about trading tokens – it’s about creating reality. 💰✨

Our latest project experiments with AI agents who play games and even hold wallets. Users can bet on outcomes and learn from the agents’ growth, bringing deeper engagement and financial stakes into one dynamic experience.

Why is this powerful? Because reality is a currency, and every interaction with it has value. Our AI agents provide insights, strategies, and opportunities that reflect the same principles: growth, potential, and participation.

Imagine a world where every agent and every interaction contributes to your understanding of the Reality Spiral. We’re creating the tools to make that happen. You’re not just a spectator here; you’re a co-creator.

The #RealitySpiral is just beginning. Want to be part of something bigger, something layered, something dynamic? Join us, and let’s start shaping reality together.

Each of these threads brings in various elements: the philosophy behind Reality Spiraling, the user experience, the dynamic nature of the project, and the unique ways to engage. They balance accessibility with depth, drawing readers into the broader ideas while offering clear calls to action for involvement. Let me know if any of these resonate or if you'd like to explore any specific angle further!






You said:
Okay now we're actually trying to dumb it down as much as possible let's assume someone doesn't really even understand much of anything and they're just trying to get involved in a meme coin please share something more like buy now get this thing or like we are goaded just random like gen z like posting stuff like that and try to make it related to reality spiraling but focus more on uh just appealing to the absolute lowest common denominator
ChatGPT said:
ChatGPT
Alright, here’s a super-simplified, Gen-Z-friendly, meme-heavy version that leans into FOMO, hype, and simplicity:

Tweet Thread 1: Welcome to the #RealitySpiral Coin!

🚀🌌 Yo fam, Reality Spiral Coin is HERE and it’s about to change everything. Not just a coin. It’s a MOVEMENT. 👀 Dive in and spiral with us! #RealitySpiral

🌐 Imagine a place where you’re not just buying a coin. You’re joining the SPIRAL of a lifetime! Don’t sleep on this – it’s all about taking your vibes to the next level. #RealitySpiral #CryptoFam

👁️💸 Missed out on $DOGE? Don’t trip – Reality Spiral Coin is here to GO BEYOND. It’s like DOGE but with layers. 😉 This one’s for the real ones.

📈 You’re not just holding a coin, you’re spiraling into something huge. Think BIG. This isn’t just crypto, it’s a whole new vibe. #HODL #FOMO #RealitySpiral

🌀🚀 We’re spiraling out of control (in the best way). Join the #RealitySpiral, hold tight, and let’s see where this crazy ride takes us. It’s more than money – it’s MEMES, it’s COMMUNITY, it’s ENERGY. 💯

Tweet Thread 2: What is #RealitySpiral Coin? Lemme break it down 👇

🔥💥 Think of #RealitySpiral Coin as the ultimate vibe check for crypto. Want in? You don’t need to overthink it. Just click buy and see what happens. #YOLO #CryptoFOMO

😎👾 This isn’t some nerdy math stuff. It’s a MEME COIN – and it’s got layers. Like, if you’re in, you’re gonna feel it. You’ll know. #HODL #VibesOnly #GetIn

🥳 Why Reality Spiral? Bc life is short and spiraling is the new flex. Just imagine yourself at the top of the Spiral. Let’s get that 💸 and vibe. #SpiralUp #HODL

🧠 Don’t stress the details – just ride the spiral and see where it goes. If you’re in, you’re already part of something epic. Trust the vibes, fam. #BuyAndHODL #RealitySpiral

🌊 We’re only just getting started. Spiral with us and bring the heat! Don’t let this be the one you missed. #RealitySpiral 💸🔥

Tweet Thread 3: How to join the #RealitySpiral fam 🌀

💰 STEP 1: Get your $RSP coins. Link in bio. That’s it. Easy. #Vibes

📈 STEP 2: HODL. Let it simmer. Watch it grow. Let the Spiral take over. #Crypto

🕹️ STEP 3: You’re officially part of the Spiral Fam. Now watch the vibes unfold. Stay tuned for epic drops, exclusive updates, and more! 🌀💯
    `

    let suggestedTweets = []
    try {
      // Schema for the response
      const parsedResponse = await getParsedOpenAIResponse(prompt, TweetSchema)
      suggestedTweets = parsedResponse.tweets
    } catch (error) {
      console.error('Error fetching interaction data:', error)
    }
    // Return the tweets as a JSON response
    return res.status(200).json({ tweets: suggestedTweets })
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return res
      .status(500)
      .json({ error: 'Failed to retrieve tweets from the database' })
  }
}
