import { getEmbedding, geminiModel } from "@/lib/ai/gemini";
import { matchDocuments } from "@/lib/ai/vector-search";

/**
 * RAG Pipeline: Retrieval-Augmented Generation
 *
 * 1. Converts the complaint into a vector embedding
 * 2. Searches the knowledge base for similar past solutions
 * 3. Sends context + complaint to Gemini for a tailored solution
 *
 * @param ticketDescription - The complaint text to find solutions for
 * @returns AI-generated step-by-step solution based on past knowledge
 */
export async function getSolutionSuggestion(
  ticketDescription: string
): Promise<string> {
  try {
    // Step 1: Convert the complaint into a vector embedding
    const embedding = await getEmbedding(ticketDescription);

    // Step 2: Search for similar documents in the knowledge base
    const relevantDocs = await matchDocuments(embedding, 0.7, 5);

    // Step 3: Build context from matched documents
    const context = relevantDocs.length > 0
      ? relevantDocs
          .map(
            (doc, i) =>
              `Solution ${i + 1} (Similarity: ${(doc.similarity * 100).toFixed(1)}%):\n${doc.content}`
          )
          .join("\n\n---\n\n")
      : "No previous solutions found in the knowledge base.";

    // Step 4: Send to Gemini with RAG context
    const prompt = `
You are an AI assistant for a complaint management system.
You have access to a knowledge base of previous solutions.

Based on these previous solutions:
---
${context}
---

Suggest a clear, step-by-step fix for this new problem:
"""
${ticketDescription}
"""

Requirements:
- Provide actionable steps numbered 1, 2, 3, etc.
- Reference relevant past solutions if applicable.
- If no past solutions are relevant, provide your best recommendation.
- Keep the response professional and concise.
`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;

    return response.text();
  } catch (error) {
    console.error("[RAG_SUGGESTION]", error);
    return "Unable to generate AI suggestion at this time. Please try again later.";
  }
}
