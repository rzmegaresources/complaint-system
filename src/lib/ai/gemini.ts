import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini client
export const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

// Chat model for generating responses
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-pro",
});

// Embedding model for RAG vector search
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

/**
 * Generate a vector embedding for the given text.
 * Returns an array of 768 numbers matching the Document model's vector(768) column.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export default genAI;
