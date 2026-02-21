import { NextResponse } from "next/server";
import { geminiModel, getEmbedding } from "@/lib/ai/gemini";
import { matchDocuments } from "@/lib/ai/vector-search";

// POST /api/rag/ask — Ask a question to the knowledge base
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Step 1: Get embedding for the question
    const embedding = await getEmbedding(question);

    // Step 2: Search knowledge base for relevant documents
    const relevantDocs = await matchDocuments(embedding, 0.6, 5);

    // Step 3: Build context from matched documents
    const context =
      relevantDocs.length > 0
        ? relevantDocs
            .map(
              (doc, i) =>
                `Document ${i + 1} (Relevance: ${(doc.similarity * 100).toFixed(1)}%):\n${doc.content}`
            )
            .join("\n\n---\n\n")
        : "No relevant documents found in the knowledge base.";

    // Step 4: Generate answer with Gemini
    const prompt = `
You are VoiceBox AI Assistant — a helpful information hub for an organization.
You have access to the organization's knowledge base containing manuals, policies, laws, acts, and procedures.

Based on these knowledge base documents:
---
${context}
---

Answer this question clearly and helpfully:
"""
${question}
"""

Requirements:
- Provide a clear, direct answer.
- Reference specific documents/policies when applicable.
- If the knowledge base has relevant information, prioritize it.
- If no relevant documents were found, provide your best general guidance and suggest the user contact the appropriate department.
- Keep the tone professional but friendly.
- Format with markdown for readability (use **bold**, bullet points, numbered lists).
`;

    const result = await geminiModel.generateContent(prompt);
    const answer = result.response.text();

    return NextResponse.json({
      answer,
      sourcesFound: relevantDocs.length,
    });
  } catch (error) {
    console.error("[RAG_ASK]", error);
    return NextResponse.json(
      { error: "Failed to get answer from AI" },
      { status: 500 }
    );
  }
}
