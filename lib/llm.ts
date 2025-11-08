import { OpenAI } from "openai";
export const llm = new OpenAI({
  apiKey: process.env.xAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

