import dotenv from "dotenv"
import OpenAI from "openai"

dotenv.config({
    apiKey : process.env.OPENAI_API_KEY
})

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: "Hey, how are you doing today,"
})

console.log("✅", response.output_text)