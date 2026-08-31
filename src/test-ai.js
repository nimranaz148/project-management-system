import dotenv from "dotenv"
import OpenAI from "openai"

dotenv.config({
    apiKey : process.env.OPENAI_API_KEY
})

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        { role: "user", content: "Hey, how are you doing today," }
    ]
})

console.log("✅", response.choices[0].message.content)