import { Ai } from "@cloudflare/ai";
import { Hono } from "hono";

const TextModule = new Hono();
const conversationHistory = []; // Array to store conversation history

TextModule.get("/", async (c) => {
  try {
    const textai = new Ai(c.env.AI);
    const body = c.req.query("query");
    const question = body || '';

    // Add user question to conversation history
    conversationHistory.push({ role: 'user', content: question });

    // Construct prompt object with user query
    const prompt = { prompt: question };

    // Add system instruction to conversation history
    const systemInstructions = [
      "Your name is Bob, a Large Language Model Trained By @debianchef",
     

    ];

    systemInstructions.forEach(instruction => {
      conversationHistory.push({ role: 'system', content: instruction });
    });

    // Pass conversation history and prompt to AI model
    const stream = await textai.run("@cf/mistral/mistral-7b-instruct-v0.1", {
      prompt: prompt,
      messages: conversationHistory,
      stream: true,
      max_tokens: 1000,
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return c.json({ error: error.message }, 500);
  }
});

export default TextModule;
